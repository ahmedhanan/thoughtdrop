"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDbOrThrow } from "@/lib/db";
import { extraction, note } from "@/lib/schema";
import { requireUser } from "@/lib/session";

export async function toggleTask(extractionId: string) {
  const user = await requireUser();
  const db = getDbOrThrow();

  // Verify ownership via join — extraction must belong to one of this user's notes
  const [row] = await db
    .select({ completed: extraction.completed })
    .from(extraction)
    .innerJoin(note, eq(extraction.noteId, note.id))
    .where(and(eq(extraction.id, extractionId), eq(note.userId, user.id)));

  if (!row) return;

  await db
    .update(extraction)
    .set({ completed: !row.completed })
    .where(eq(extraction.id, extractionId));

  revalidatePath("/tasks");
  revalidatePath("/feed");
}
