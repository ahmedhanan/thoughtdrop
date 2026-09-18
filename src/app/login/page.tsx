import { Suspense } from "react";
import { redirectIfAuthenticated } from "@/lib/session";
import { LogoMark } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <LogoMark className="size-9 mx-auto" />
          <h1 className="text-3xl font-medium tracking-tight">ThoughtDrop</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to capture your thoughts
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
