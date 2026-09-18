"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  User,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { deleteNote } from "./actions";
import { toggleTask } from "../tasks/actions";
import type { Note, Extraction, Tag } from "@/lib/schema";

type NoteTagRow = { noteId: string; tagName: string; tagId: string };

const BODY_LIMIT = 300;

const TYPE_ICONS: Record<string, LucideIcon> = {
  decision: ArrowRight,
  person: User,
  event: Calendar,
};

export function NoteCard({
  note,
  extractions,
  tags,
}: {
  note: Note;
  extractions: Extraction[];
  tags: NoteTagRow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bodyTruncated = note.body.length > BODY_LIMIT && !expanded;
  const displayBody = bodyTruncated
    ? note.body.slice(0, BODY_LIMIT) + "…"
    : note.body;

  const tasks = extractions.filter((e) => e.type === "task");
  const others = extractions.filter((e) => e.type !== "task");

  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleDelete() {
    startTransition(() => deleteNote(note.id));
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm group">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
        <span className="text-xs text-muted-foreground">{date}</span>
        <div className="flex items-center gap-2">
          {note.processingStatus === "pending" && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Analyzing…
            </Badge>
          )}
          {note.processingStatus === "error" && (
            <Badge variant="destructive" className="text-xs">
              Extraction failed
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayBody}</p>
        {note.body.length > BODY_LIMIT && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground mt-1 hover:text-foreground flex items-center gap-0.5"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show more
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Link key={t.tagId} href={`/feed?tag=${encodeURIComponent(t.tagName)}`}>
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {t.tagName}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Extractions (only when done) */}
      {note.processingStatus === "done" && extractions.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {/* Tasks with checkboxes */}
          {tasks.map((e) => (
            <TaskRow key={e.id} extraction={e} />
          ))}
          {/* Other extractions */}
          {others.map((e) => {
            const Icon = TYPE_ICONS[e.type];
            return (
            <div key={e.id} className="flex items-start gap-2 text-sm">
              <span className="text-primary/70 mt-0.5 shrink-0">
                {Icon ? <Icon className="size-3.5" /> : <span className="text-xs">•</span>}
              </span>
              <span className="text-muted-foreground leading-snug">
                {e.content}
                {e.metadata?.date && (
                  <span className="ml-1 text-xs opacity-70">({e.metadata.date})</span>
                )}
                {e.metadata?.email && (
                  <span className="ml-1 text-xs opacity-70">{e.metadata.email}</span>
                )}
              </span>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskRow({ extraction: e }: { extraction: Extraction }) {
  const [checked, setChecked] = useState(e.completed);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setChecked((v) => !v);
    startTransition(() => toggleTask(e.id));
  }

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="mt-0.5 shrink-0"
      />
      <span
        className={`text-sm leading-snug ${checked ? "line-through text-muted-foreground" : ""}`}
      >
        {e.content}
        {e.metadata?.dueDate && (
          <span className="ml-1 text-xs text-muted-foreground opacity-70">
            due {e.metadata.dueDate}
          </span>
        )}
      </span>
    </div>
  );
}
