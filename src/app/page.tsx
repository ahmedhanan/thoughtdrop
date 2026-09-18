import { LinkButton } from "@/components/ui/link-button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroAnimation } from "./_HeroAnimation";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LinkButton href="/login" size="sm" variant="ghost">
              Sign in
            </LinkButton>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          <HeroAnimation />

          <div className="space-y-5">
            <h1 className="text-5xl font-medium tracking-tight leading-[1.1]">
              Drop your thoughts.
              <br />
              <span className="text-primary">Get structure back.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              Write anything — messy, half-formed, stream-of-consciousness. An AI
              agent reads it and pulls out your tasks, decisions, people, and
              events. Everything stays, nothing gets lost.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <LinkButton href="/login" size="lg">
              Start dropping thoughts →
            </LinkButton>
          </div>
          <p className="text-xs text-muted-foreground">
            No formatting required. Just write.
          </p>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">ThoughtDrop</p>
        </div>
      </footer>
    </div>
  );
}
