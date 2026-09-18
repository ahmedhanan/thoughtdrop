import { and, eq } from "drizzle-orm";
import { getDbOrThrow } from "@/lib/db";
import { note } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { runNoteAgent } from "@/lib/agent";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { noteId } = (await request.json()) as { noteId: string };

  if (!noteId) {
    return new Response("Missing noteId", { status: 400 });
  }

  const db = getDbOrThrow();

  // Atomically claim the job: only a pending note owned by this user can be
  // processed, and only once. This enforces ownership AND prevents a second
  // POST from re-running the agent and inserting duplicate extractions.
  const claimed = await db
    .update(note)
    .set({ processingStatus: "processing", updatedAt: new Date() })
    .where(
      and(
        eq(note.id, noteId),
        eq(note.userId, session.user.id),
        eq(note.processingStatus, "pending"),
      ),
    )
    .returning({ id: note.id, body: note.body });

  if (claimed.length === 0) {
    // Either the note doesn't exist / isn't ours, or it's already being
    // processed or done. Nothing to do.
    return new Response("Note not available for processing", { status: 409 });
  }

  // Use the stored body, not the client-sent one, so the agent always
  // processes exactly what was persisted.
  const result = runNoteAgent(claimed[0].body, noteId, session.user.id, db);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        // Mark note done after agent finishes
        await db
          .update(note)
          .set({ processingStatus: "done", updatedAt: new Date() })
          .where(eq(note.id, noteId));
      } catch (err) {
        console.error("Agent failed for note", noteId, err);
        await db
          .update(note)
          .set({ processingStatus: "error", updatedAt: new Date() })
          .where(eq(note.id, noteId));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
