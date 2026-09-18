"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleTask } from "./actions";
import { dueBucket, type DueBucket } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Extraction, Note } from "@/lib/schema";

type TaskWithNote = Extraction & { note: Pick<Note, "id" | "body" | "createdAt"> };

// Ordered buckets for the to-do view. "none" holds tasks with no due date.
const BUCKET_ORDER: (DueBucket | "none")[] = [
  "overdue",
  "today",
  "week",
  "later",
  "none",
];
const BUCKET_LABEL: Record<DueBucket | "none", string> = {
  overdue: "Overdue",
  today: "Today",
  week: "This week",
  later: "Later",
  none: "No date",
};
const BUCKET_ACCENT: Record<DueBucket | "none", string> = {
  overdue: "text-destructive",
  today: "text-primary",
  week: "text-foreground",
  later: "text-muted-foreground",
  none: "text-muted-foreground",
};

export function TaskList({
  tasks,
  todayIso,
}: {
  tasks: TaskWithNote[];
  todayIso: string;
}) {
  const [filter, setFilter] = useState<"todo" | "done" | "all">("todo");

  const todo = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  function bucketOf(t: TaskWithNote): DueBucket | "none" {
    const d = t.metadata?.dueDate;
    return d ? dueBucket(d, todayIso) : "none";
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="todo">To do ({todo.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({done.length})</TabsTrigger>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filter === "todo" && (
        <TodoBuckets tasks={todo} bucketOf={bucketOf} todayIso={todayIso} />
      )}

      {filter === "done" &&
        (done.length === 0 ? (
          <Empty>Nothing completed yet.</Empty>
        ) : (
          <div className="space-y-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} todayIso={todayIso} />
            ))}
          </div>
        ))}

      {filter === "all" &&
        (tasks.length === 0 ? (
          <Empty>No tasks here.</Empty>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} todayIso={todayIso} />
            ))}
          </div>
        ))}
    </div>
  );
}

function TodoBuckets({
  tasks,
  bucketOf,
  todayIso,
}: {
  tasks: TaskWithNote[];
  bucketOf: (t: TaskWithNote) => DueBucket | "none";
  todayIso: string;
}) {
  if (tasks.length === 0) return <Empty>You're all caught up. 🎉</Empty>;

  const grouped = new Map<DueBucket | "none", TaskWithNote[]>();
  for (const t of tasks) {
    const b = bucketOf(t);
    (grouped.get(b) ?? grouped.set(b, []).get(b)!).push(t);
  }

  return (
    <div className="space-y-6">
      {BUCKET_ORDER.filter((b) => grouped.has(b)).map((b) => {
        const rows = grouped.get(b)!;
        return (
          <section key={b} className="space-y-2">
            <h2
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                BUCKET_ACCENT[b],
              )}
            >
              {BUCKET_LABEL[b]} ({rows.length})
            </h2>
            <div className="space-y-2">
              {rows.map((t) => (
                <TaskRow key={t.id} task={t} todayIso={todayIso} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-muted-foreground py-12">{children}</p>;
}

function TaskRow({
  task,
  todayIso,
}: {
  task: TaskWithNote;
  todayIso: string;
}) {
  const [checked, setChecked] = useState(task.completed);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setChecked((v) => !v);
    startTransition(() => toggleTask(task.id));
  }

  const noteSnippet =
    task.note.body.length > 60
      ? task.note.body.slice(0, 60) + "…"
      : task.note.body;

  const due = task.metadata?.dueDate;
  const bucket = due ? dueBucket(due, todayIso) : null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            checked && "line-through text-muted-foreground",
          )}
        >
          {task.content}
          {due && (
            <span
              className={cn(
                "ml-2 text-xs",
                checked
                  ? "text-muted-foreground"
                  : bucket === "overdue"
                    ? "text-destructive"
                    : bucket === "today"
                      ? "text-primary"
                      : "text-muted-foreground",
              )}
            >
              due {due}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          From:{" "}
          <Link href={`/feed`} className="hover:underline" title={task.note.body}>
            {noteSnippet}
          </Link>
        </p>
      </div>
    </div>
  );
}
