import { Suspense } from "react";
import { redirectIfAuthenticated } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">ThoughtDrop</h1>
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
