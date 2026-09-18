import { LinkButton } from "@/components/ui/link-button";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <LogoMark className="size-12 mx-auto text-primary/30" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">404</p>
          <h1 className="text-3xl font-medium tracking-tight">
            This thought slipped away.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            That page was never jotted down — or it evaporated before we could
            catch it. Happens to the best of us.
          </p>
        </div>
        <LinkButton href="/" size="lg">
          Take me home
        </LinkButton>
      </div>
    </div>
  );
}
