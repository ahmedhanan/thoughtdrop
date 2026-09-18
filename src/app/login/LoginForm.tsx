"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/feed";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await signIn.magicLink({
        email: email.trim(),
        callbackURL: redirectTo,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to send link");
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Check your inbox</p>
        <p className="text-muted-foreground text-sm">
          We sent a sign-in link to <strong>{email}</strong>.<br />
          Click it to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={!email.trim() || isPending}>
        {isPending ? "Sending…" : "Send sign-in link"}
      </Button>
    </form>
  );
}
