"use client";

import "./globals.css";
import { LogoMark } from "@/components/Logo";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center px-4 text-center bg-background text-foreground antialiased">
        <div className="max-w-md space-y-6">
          <LogoMark className="size-12 mx-auto text-primary/30" />
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight">
              We lost our train of thought.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              The whole app tripped over itself. A refresh should bring it back.
            </p>
          </div>
          <button
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
