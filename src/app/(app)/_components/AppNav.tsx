"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/tasks", label: "Tasks" },
];

export function AppNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <LogoMark className="size-6" />
            {/* Wordmark hides on the smallest screens to keep the nav from crowding */}
            <span className="font-serif text-lg font-medium tracking-tight hidden sm:inline">
              ThoughtDrop
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm px-2.5 sm:px-3 py-1.5 rounded-md transition-colors",
                  pathname.startsWith(href)
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden md:block max-w-[16ch] truncate">
            {userEmail}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void signOut().then(() => { window.location.href = "/login"; })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
