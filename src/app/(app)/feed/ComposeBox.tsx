"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createNote, revalidateFeed } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/Logo";
import { toast } from "sonner";

const MAX = 10_000;

export function ComposeBox() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function submit() {
    if (!body.trim() || isSubmitting) return;
    const draft = body;
    setBody("");
    setIsSubmitting(true);
    setAgentStatus("Saving note…");

    try {
      const result = await createNote(draft);
      if (!result || "error" in result) {
        toast.error(result?.error ?? "Failed to save note");
        setBody(draft);
        return;
      }

      setAgentStatus("Agent analyzing…");

      // Stream the agent's reasoning from the API route
      abortRef.current = new AbortController();
      const res = await fetch("/api/notes/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: result.noteId, body: draft }),
        signal: abortRef.current.signal,
      });

      if (!res.body) {
        setAgentStatus("");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Show last ~80 chars of streamed reasoning
        setAgentStatus(accumulated.slice(-80));
      }

      // Refresh the feed to show the processed note
      await revalidateFeed();
      router.refresh();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
      setAgentStatus("");
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <div className="relative rounded-xl border border-border bg-card shadow-sm">
      {isSubmitting && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary/40 animate-ripple"
          aria-hidden="true"
        />
      )}
      <div className="p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dump your thoughts here… (⌘↵ to save)"
          className="min-h-[120px] resize-none border-0 p-0 shadow-none focus-visible:ring-0 text-base"
          maxLength={MAX}
          disabled={isSubmitting}
          autoFocus
        />
      </div>
      <div className="px-4 pb-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {agentStatus ? (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
              <LogoMark className="size-3.5 animate-pulse" />
              <span className="truncate">{agentStatus}</span>
            </p>
          ) : (
            <span className="text-xs text-muted-foreground">
              {body.length > 0 ? `${body.length}/${MAX}` : ""}
            </span>
          )}
        </div>
        <Button
          onClick={() => void submit()}
          disabled={!body.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? "Analyzing…" : "Drop it"}
        </Button>
      </div>
    </div>
  );
}
