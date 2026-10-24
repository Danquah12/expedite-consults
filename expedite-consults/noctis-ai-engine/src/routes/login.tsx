import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SignedOutScreen } from "@/components/layout/ClinicGate";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { armClinicPlay } from "@/lib/playback";
import { stopJazzBed } from "@/lib/jazz-bed";

type Search = { next: string };

function safeNext(raw: unknown) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/desk") || raw.startsWith("/login")) return "/";
  return raw;
}

export const Route = createFileRoute("/login")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    next: safeNext(raw.next),
  }),
  component: LoginPortal,
});

function LoginPortal() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  useEffect(() => {
    if (isPending || !user || user.isDevFallback) return;
    armClinicPlay();
    stopJazzBed();
    window.location.replace(next && next !== "/" ? next : "/start");
  }, [isPending, user, next]);
  if (!isPending && user && !user.isDevFallback) return null;
  return <SignedOutScreen />;
}
