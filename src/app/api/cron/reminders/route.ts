import { and, eq, isNull, sql } from "drizzle-orm";
import { getDbOrThrow } from "@/lib/db";
import { extraction, note, user } from "@/lib/schema";
import { todayInTz, safeZone } from "@/lib/datetime";
import { sendTaskReminderEmail } from "@/lib/email";

// Max reminder emails to send per invocation (guards against a huge backlog
// blowing the request budget / Resend quota).
const SEND_CAP = 100;
// How many candidate rows to scan per invocation.
const SCAN_LIMIT = 500;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDbOrThrow();

  // Candidate tasks: incomplete, not yet reminded, with a due date.
  const candidates = await db
    .select({
      id: extraction.id,
      content: extraction.content,
      metadata: extraction.metadata,
      email: user.email,
      timezone: user.timezone,
    })
    .from(extraction)
    .innerJoin(note, eq(extraction.noteId, note.id))
    .innerJoin(user, eq(note.userId, user.id))
    .where(
      and(
        eq(extraction.type, "task"),
        eq(extraction.completed, false),
        isNull(extraction.reminderSentAt),
        sql`${extraction.metadata}->>'dueDate' is not null`,
      ),
    )
    .limit(SCAN_LIMIT);

  // Per-user "today" (timezone-aware) — cache by zone.
  const todayCache = new Map<string, string>();
  const todayFor = (tz: string) => {
    const zone = safeZone(tz);
    if (!todayCache.has(zone)) todayCache.set(zone, todayInTz(zone).iso);
    return todayCache.get(zone)!;
  };

  let sent = 0;
  for (const c of candidates) {
    if (sent >= SEND_CAP) break;
    const dueDate = c.metadata?.dueDate;
    if (!dueDate) continue;
    if (dueDate > todayFor(c.timezone)) continue; // not due yet

    try {
      await sendTaskReminderEmail(c.email, { taskContent: c.content, dueDate });
      await db
        .update(extraction)
        .set({ reminderSentAt: new Date() })
        .where(eq(extraction.id, c.id));
      sent++;
    } catch (err) {
      console.error(
        JSON.stringify({ event: "reminder_send_failed", extractionId: c.id, error: String(err) }),
      );
    }
  }

  return Response.json({ scanned: candidates.length, sent });
}
