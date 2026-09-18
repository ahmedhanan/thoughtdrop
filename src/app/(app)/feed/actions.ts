"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDbOrThrow } from "@/lib/db";
import { note } from "@/lib/schema";
import { requireUser } from "@/lib/session";

export async function createNote(body: string) {
  const user = await requireUser();
  const db = getDbOrThrow();
  const trimmed = body.trim();
  if (!trimmed) return { error: "Note cannot be empty." };

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
