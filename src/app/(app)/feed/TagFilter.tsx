"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/schema";

export function TagFilter({
  tags,
  activeTag,
  searchQuery,
}: {
  tags: Tag[];
  activeTag?: string;
  searchQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  if (tags.length === 0 && !searchQuery) return null;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search notes…"
          defaultValue={searchQuery}
          onChange={(e) => {
            const v = e.target.value;
            clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer);
            (window as unknown as Record<string, ReturnType<typeof setTimeout>>)._searchTimer = setTimeout(
              () => setParam("q", v || null),
              300,
            );
          }}
          className="pr-8 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setParam("q", null)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTag && (
            <button
              onClick={() => setParam("tag", null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          {tags.map((t) => (
            <Badge
              key={t.id}
              variant={activeTag === t.name ? "default" : "secondary"}
              className={cn(
                "cursor-pointer text-xs transition-colors",
                activeTag === t.name
                  ? ""
                  : "hover:bg-primary hover:text-primary-foreground",
              )}
              onClick={() =>
                setParam("tag", activeTag === t.name ? null : t.name)
              }
            >
              {t.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
