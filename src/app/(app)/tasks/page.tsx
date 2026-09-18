import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { getDbOrThrow } from "@/lib/db";
import { extraction, note } from "@/lib/schema";
import { LogoMark } from "@/components/Logo";
import { todayInTz, safeZone } from "@/lib/datetime";
import { TaskList } from "./TaskList";

export default async function TasksPage() {
  const user = await requireUser();
  const db = getDbOrThrow();
  const todayIso = todayInTz(
    safeZone((user as { timezone?: string }).timezone ?? "UTC"),
  ).iso;

  const tasks = await db
    .select({
      id: extraction.id,
      noteId: extraction.noteId,
      type: extraction.type,
      content: extraction.content,
      metadata: extraction.metadata,
      completed: extraction.completed,
      reminderSentAt: extraction.reminderSentAt,
      createdAt: extraction.createdAt,
      note: {
        id: note.id,
        body: note.body,
        createdAt: note.createdAt,
      },
    })
    .from(extraction)
    .innerJoin(note, eq(extraction.noteId, note.id))
    .where(eq(note.userId, user.id))
    .orderBy(desc(note.createdAt));

  const taskRows = tasks.filter((t) => t.type === "task");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All action items extracted from your notes
        </p>
      </div>

      {taskRows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LogoMark className="size-10 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg">No tasks yet.</p>
          <p className="text-sm mt-1">
            Write a note with action items and the AI will extract them here.
          </p>
        </div>
      ) : (
        <TaskList tasks={taskRows} todayIso={todayIso} />
      )}
    </div>
  );
}
