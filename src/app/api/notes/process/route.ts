import { eq } from "drizzle-orm";
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

  const { noteId, body } = (await request.json()) as {
    noteId: string;
    body: string;
  };

  if (!noteId || !body) {
    return new Response("Missing noteId or body", { status: 400 });
  }

  const db = getDbOrThrow();

  // Verify ownership
  const [noteRow] = await db
    .select({ id: note.id })
    .from(note)
    .where(eq(note.id, noteId));

  if (!noteRow) {
    return new Response("Note not found", { status: 404 });
  }

  // Stream the agent's text reasoning back to the client
  const result = runNoteAgent(body, noteId, session.user.id, db);

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
