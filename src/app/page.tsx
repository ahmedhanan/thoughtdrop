import { LinkButton } from "@/components/ui/link-button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold">ThoughtDrop</span>
          <LinkButton href="/login" size="sm" variant="ghost">
            Sign in
          </LinkButton>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Drop your thoughts.
            <br />
            <span className="text-muted-foreground font-normal">
              Get structure back.
            </span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Write anything — messy, half-formed, stream-of-consciousness. An AI
            agent reads it and automatically extracts your tasks, decisions,
            people, and events. Everything stays, nothing gets lost.
          </p>
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
