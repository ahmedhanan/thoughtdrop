"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDbOrThrow } from "@/lib/db";
import { note } from "@/lib/schema";
import { requireUser } from "@/lib/session";
import { checkNoteQuota } from "@/lib/ratelimit";

const MAX_NOTE_LEN = 10_000;

export async function createNote(body: string) {
  const user = await requireUser();
  const db = getDbOrThrow();
  const trimmed = body.trim();
  if (!trimmed) return { error: "Note cannot be empty." };
  if (trimmed.length > MAX_NOTE_LEN) {
    return { error: `Note is too long (max ${MAX_NOTE_LEN.toLocaleString()} characters).` };
  }

  const quota = await checkNoteQuota(db, user.id);
  if (!quota.ok) {
    return { error: `You're dropping notes too fast — try again in ${quota.retryAfter}.` };
  }

  const [saved] = await db
    .insert(note)
    .values({ userId: user.id, body: trimmed, processingStatus: "pending" })
    .returning({ id: note.id });

  return { noteId: saved.id };
}

export async function deleteNote(noteId: string) {
  const user = await requireUser();
  const db = getDbOrThrow();
  await db
    .delete(note)
    .where(and(eq(note.id, noteId), eq(note.userId, user.id)));
  revalidatePath("/feed");
}

export async function revalidateFeed() {
  revalidatePath("/feed");
}
