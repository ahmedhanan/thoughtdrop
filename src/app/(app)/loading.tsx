import { LogoMark } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <LogoMark className="size-8 animate-pulse text-primary/60" />
      <p className="text-sm text-muted-foreground">Catching your thoughts…</p>
    </div>
  );
}
