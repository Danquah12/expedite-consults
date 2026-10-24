import type { ReactNode } from "react";
import { useEffect } from "react";
import { getRouteApi, useRouterState } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InsightsDrawer } from "@/components/feed/LiveSidebar";
import { MobileHallBar } from "@/components/layout/MobileHallBar";
import { FeedModals } from "@/components/feed/FeedModals";
import { PipDock } from "@/components/feed/PipDock";
import { FurtherStudy } from "@/components/learn/FurtherStudy";
import { HydrateIngest } from "@/components/feed/HydrateIngest";
import { HydrateMods } from "@/components/feed/HydrateMods";
import { SoundUnlock } from "@/components/feed/SoundUnlock";
import { ThemeBoot } from "@/components/layout/ThemeBoot";
import { ClinicGate } from "@/components/layout/ClinicGate";
import { CustomerSync } from "@/components/layout/CustomerSync";
import { StudyRingBar } from "@/components/learn/StudyRingBar";
import { StudyCopilot } from "@/components/learn/StudyCopilot";
import { syncFiledNotes, useFeedStore } from "@/lib/feed-store";
import { holdReading, scrollClipToTop } from "@/lib/syndicate";
import { ME, setActor } from "@/lib/current-user";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { stampWhere } from "@/lib/login-place-api";
import { markMission } from "@/lib/noctis-os";
import { joinStudyGroup } from "@/lib/study-group-api";
import { cn } from "@/lib/utils";

const rootRoute = getRouteApi("__root__");

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const sessionUser = rootRoute.useRouteContext({ select: (c) => c.sessionUser });
  const { user } = useCurrentUserState();
  const reels = path === "/reels";
  const vibe = path === "/noctis";
  const bare = reels || vibe;
  const doors = path === "/start";

  useEffect(() => {
    const place = path.startsWith("/hall") || path.startsWith("/study")
      ? "hall"
      : path.startsWith("/openings") || path.startsWith("/market")
        ? "career"
        : path.startsWith("/news")
          ? "news"
          : "";
    if (place) sessionStorage.setItem("vibe-place", place);
    if (place === "news") {
      const mission = markMission("news");
      if (mission.rewarded) useFeedStore.getState().awardXp(50);
    }
  }, [path]);

  useEffect(() => {
    const email = user?.primaryEmail ?? sessionUser?.email ?? null;
    const name = user?.displayName?.trim() || sessionUser?.name?.trim() || email?.split("@")[0]?.trim() || "";
    if (!name || user?.isDevFallback) {
      setActor(null);
      return;
    }
    const handle = (email?.split("@")[0] || name).toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || "member";
    setActor({ name, username: handle, avatarUrl: user?.profileImageUrl || ME.avatarUrl });
  }, [user, sessionUser]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("join");
    if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !user?.id || user.isDevFallback) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("join");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    void joinStudyGroup({ data: { id } })
      .then(() => useFeedStore.getState().openModal({ type: "phone", video: true, join: id }))
      .catch(() => undefined);
  }, [user?.id, user?.isDevFallback]);

  useEffect(() => {
    syncFiledNotes();
  }, []);

  useEffect(() => {
    const id = user?.id || sessionUser?.id;
    if (!id || user?.isDevFallback) return;
    const key = `place:${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const send = (lat?: number, lng?: number) => {
      void stampWhere({ data: { lat, lng } }).catch(() => undefined);
    };
    if (!navigator.geolocation) {
      send();
      return;
    }
    const timer = window.setTimeout(() => send(), 4000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        send(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        window.clearTimeout(timer);
        send();
      },
      { timeout: 3500, maximumAge: 600_000 },
    );
  }, [user?.id, sessionUser?.id, user?.isDevFallback]);

  useEffect(() => {
    if (reels) return;
    const lift = () => {
      const playing = useFeedStore.getState().playingId;
      scrollClipToTop(playing ? playing.replace(/^lesson-/, "") : "now");
    };
    const t = window.setTimeout(lift, 120);
    const t2 = window.setTimeout(lift, 480);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [path, reels]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const node = event.target instanceof Element ? event.target : null;
      if (node?.closest("[data-read]")) holdReading();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <ClinicGate sessionId={sessionUser?.id ?? null}>
      <div className={cn(reels ? "reel-shell text-fg" : "min-h-dvh clinic-canvas text-fg")}>
        <ThemeBoot />
        <StudyRingBar />
        {bare ? null : <AppHeader />}
        {bare || doors ? null : <MobileHallBar />}
        <main className={cn(reels ? "flex h-full min-h-0 flex-col" : vibe ? "h-dvh overflow-hidden" : "clinic-main")}>{children}</main>
        <HydrateIngest />
        <HydrateMods />
        <CustomerSync />
        <SoundUnlock />
        {bare ? null : <PipDock />}
        {bare ? null : <FurtherStudy />}
        {bare ? null : <BottomNav />}
        {bare ? null : <InsightsDrawer />}
        {path === "/noctis" ? null : <StudyCopilot />}
        <FeedModals />
      </div>
    </ClinicGate>
  );
}
