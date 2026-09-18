import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
});

export const redirectIfAuthenticated = cache(async () => {
  const session = await getSession();
  if (session?.user) redirect("/feed");
});
