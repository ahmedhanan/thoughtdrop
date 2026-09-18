import { requireUser } from "@/lib/session";
import { AppNav } from "./_components/AppNav";
import { TimezoneSync } from "@/components/TimezoneSync";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background">
      <TimezoneSync current={(user as { timezone?: string }).timezone ?? "UTC"} />
      <AppNav userEmail={user.email} />
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
