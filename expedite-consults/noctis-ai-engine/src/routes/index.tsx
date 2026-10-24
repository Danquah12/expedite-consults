import { useEffect } from "react";
import { createFileRoute, redirect, useRouter, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { FeedPage } from "@/components/feed/FeedPage";

function isStandaloneEngineDomain(): boolean {
  if (typeof window !== "undefined") {
    const h = window.location.hostname.toLowerCase();
    return h.includes("noctis-ai") || h.includes("noctis-engine");
  }
  return process.env.NOCTIS_STANDALONE_ROLE === "engine";
}

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    const href = (location.href || "").toLowerCase();
    if (href.includes("noctis-ai") || href.includes("noctis-engine") || isStandaloneEngineDomain()) {
      throw redirect({ to: "/noctis", replace: true });
    }
    if (href.includes("?") || href.includes("#feed")) return;
    throw redirect({ to: "/start", replace: true });
  },
  component: AcademyPage,
});

function AcademyPage() {
  const router = useRouter();
  const href = useRouterState({ select: (s) => s.location.href });
  const stay = href.includes("?") || href.includes("#feed");
  useEffect(() => {
    if (isStandaloneEngineDomain()) {
      void router.navigate({ to: "/noctis", replace: true });
      return;
    }
    if (stay) return;
    void router.navigate({ to: "/start", replace: true });
  }, [router, stay]);
  if (stay) {
    return (
      <AppShell>
        <FeedPage />
      </AppShell>
    );
  }
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f3ec] px-6 text-[#12151c]">
      <p className="text-sm">Opening Noctis…</p>
    </main>
  );
}