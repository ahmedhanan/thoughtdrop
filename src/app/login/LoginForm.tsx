"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Friendly copy for the error codes Better Auth appends to errorCallbackURL
// when magic-link verification fails.
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN:
    "That sign-in link expired or was already used. Request a fresh one below.",
  new_user_signup_disabled: "Sign-ups are currently closed.",
  failed_to_create_user: "We couldn't set up your account. Try again below.",
  user_not_found: "We couldn't find that account. Request a new link below.",
  failed_to_create_session:
    "We couldn't start your session. Request a new link below.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/feed";
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ??
      "We couldn't sign you in with that link. Request a new one below.")
    : null;
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
        errorCallbackURL: "/login",
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
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}
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
