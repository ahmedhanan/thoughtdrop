"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleTask } from "./actions";
import type { Extraction, Note } from "@/lib/schema";

type TaskWithNote = Extraction & { note: Pick<Note, "id" | "body" | "createdAt"> };

export function TaskList({ tasks }: { tasks: TaskWithNote[] }) {
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const filtered = tasks.filter((t) => {
    if (filter === "todo") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">
            To do ({tasks.filter((t) => !t.completed).length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Done ({tasks.filter((t) => t.completed).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {filter === "done" ? "Nothing completed yet." : "No tasks here."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: TaskWithNote }) {
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
          className={`text-sm leading-snug ${checked ? "line-through text-muted-foreground" : ""}`}
        >
          {task.content}
          {task.metadata?.dueDate && (
            <span className="ml-2 text-xs text-muted-foreground">
              due {task.metadata.dueDate}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          From:{" "}
          <Link
            href={`/feed`}
            className="hover:underline"
            title={task.note.body}
          >
            {noteSnippet}
          </Link>
        </p>
      </div>
    </div>
  );
}
