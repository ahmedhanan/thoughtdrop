"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LogoMark } from "@/components/Logo";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <LogoMark className="size-12 mx-auto text-primary/30" />
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">
            That thought got tangled.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Something knotted up on our end — not yours. Give it another pull,
            and it usually sorts itself out.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => retry()}>
            Try again
          </Button>
          <LinkButton href="/" size="lg" variant="outline">
            Go home
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
