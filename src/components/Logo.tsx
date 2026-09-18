import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-6 text-primary", className)}
      aria-hidden="true"
    >
      <path
        d="M12 2C12 2 4.5 10.8 4.5 16A7.5 7.5 0 0 0 19.5 16C19.5 10.8 12 2 12 2Z"
        fill="currentColor"
      />
      <circle cx="12" cy="15.5" r="2.3" fill="var(--background)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className="size-6" />
      <span className="font-serif text-lg font-medium tracking-tight">
        ThoughtDrop
      </span>
    </span>
  );
}
