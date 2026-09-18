import { and, eq, gte, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { note } from "@/lib/schema";
import type * as schema from "@/lib/schema";

type Db = NeonHttpDatabase<typeof schema>;

// DB-backed sliding-window quota, reusing the `note` table's created_at.
// Better Auth's rate limiter only covers /api/auth/* — this protects the
// note-creation → agent path from being looped to burn AI credits.
export const NOTE_LIMIT_PER_MIN = 10;
export const NOTE_LIMIT_PER_HOUR = 100;

export type QuotaResult = { ok: true } | { ok: false; retryAfter: string };

async function countSince(db: Db, userId: string, seconds: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(note)
    .where(
      and(
        eq(note.userId, userId),
        gte(note.createdAt, sql`now() - (${seconds} * interval '1 second')`),
      ),
    );
  return row?.count ?? 0;
}

/** Returns ok:false when the user has exceeded the per-minute or per-hour cap. */
export async function checkNoteQuota(db: Db, userId: string): Promise<QuotaResult> {
  const inLastMinute = await countSince(db, userId, 60);
  if (inLastMinute >= NOTE_LIMIT_PER_MIN) {
    return { ok: false, retryAfter: "a minute" };
  }
  const inLastHour = await countSince(db, userId, 3600);
  if (inLastHour >= NOTE_LIMIT_PER_HOUR) {
    return { ok: false, retryAfter: "an hour" };
  }
  return { ok: true };
}
