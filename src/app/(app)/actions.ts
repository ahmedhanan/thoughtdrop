"use server";

import { eq } from "drizzle-orm";
import { getDbOrThrow } from "@/lib/db";
import { user } from "@/lib/schema";
import { requireUser } from "@/lib/session";
import { safeZone } from "@/lib/datetime";

/** Persist the writer's IANA timezone (captured from the browser). */
export async function setTimezone(tz: string) {
  const current = await requireUser();
  const zone = safeZone(tz);
  if (zone === (current as { timezone?: string }).timezone) return;

  const db = getDbOrThrow();
  await db
    .update(user)
    .set({ timezone: zone, updatedAt: new Date() })
    .where(eq(user.id, current.id));
}
