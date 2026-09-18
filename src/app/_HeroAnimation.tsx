import { ListTodo, ArrowRight, Calendar } from "lucide-react";

export function HeroAnimation() {
  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
      {/* Droplet + ripple */}
      <div className="relative flex h-20 items-end justify-center">
        <span
          className="absolute bottom-1 size-10 rounded-full border-2 border-primary/40 animate-ripple"
          style={{ animationDelay: "0.9s" }}
        />
        <svg
          viewBox="0 0 24 24"
          className="size-11 text-primary animate-drop-fall"
          aria-hidden="true"
        >
          <path
            d="M12 2C12 2 4.5 10.8 4.5 16A7.5 7.5 0 0 0 19.5 16C19.5 10.8 12 2 12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="15.5" r="2.3" fill="var(--background)" />
        </svg>
      </div>

      {/* Extracted rows fade in */}
      <div className="mt-4 w-full space-y-2">
        {[
          { icon: ListTodo, label: "Call Maya re: Q3 deck", delay: "1.1s" },
          { icon: Calendar, label: "Design review — Thursday", delay: "1.35s" },
          { icon: ArrowRight, label: "Decided: ship beta first", delay: "1.6s" },
        ].map(({ icon: Icon, label, delay }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 animate-fade-up"
            style={{ animationDelay: delay }}
          >
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <span className="text-sm text-card-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
