import { useEffect, useState } from "react";
import { Bell, Camera, Ellipsis, MessageCircle, Phone, Search, Settings, Sparkles, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useFeedStore } from "@/lib/feed-store";
import { LanguageMenu } from "@/components/layout/LanguageMenu";
import { NoctisLockup } from "@/components/brand/NoctisMark";
import { useLocale } from "@/lib/locale";
import { CardsReturn } from "@/components/layout/CardsReturn";
import { leaveHall } from "@/lib/auth/client";
import { openNoctis } from "@/lib/ask-noctis";

function localStamp(at: Date, lang: string) {
  const tag = lang === "zh" ? "zh-Hans" : lang === "tw" ? "ak" : lang;
  return {
    time: at.toLocaleTimeString(tag, { hour: "numeric", minute: "2-digit" }),
    date: at.toLocaleDateString(tag),
  };
}

function LocalClock() {
  const [now, setNow] = useState(() => new Date());
  const lang = useLocale((s) => s.lang);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const { time, date } = localStamp(now, lang);
  return (
    <span className="shrink-0 whitespace-nowrap text-right leading-none" aria-label={`${time}, ${date}`}>
      <span className="block text-[12px] font-semibold tabular-nums">{time}</span>
      <span className="mt-0.5 block text-[11px] tabular-nums text-muted">{date}</span>
    </span>
  );
}

export function AppHeader() {
  const openModal = useFeedStore((s) => s.openModal);
  const phone = useFeedStore((s) => (s.modal.type === "phone" ? s.modal : null));
  const calling = Boolean(phone && !phone.video);
  const filming = Boolean(phone?.video);
  const unread = useFeedStore((s) => s.alerts.filter((row) => !row.read).length);
  const [more, setMore] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function signOut() {
    if (leaving) return;
    setLeaving(true);
    void leaveHall().catch(() => setLeaving(false));
  }

  function ask() {
    setMore(false);
    const path = window.location.pathname;
    const hint = path.startsWith("/news")
      ? "Why does this story matter, and what should I study next?"
      : path.startsWith("/music")
        ? "What is this song teaching?"
        : path.startsWith("/openings") || path.startsWith("/market")
          ? "What is the next step in this career?"
          : path.startsWith("/hall") || path.startsWith("/study")
            ? "Teach the lesson I am looking at, and the next step."
            : "What should I look at next?";
    openNoctis(hint);
  }
  function call() {
    setMore(false);
    if (calling) useFeedStore.getState().closeModal();
    else openModal({ type: "phone" });
  }
  function film() {
    setMore(false);
    if (filming) useFeedStore.getState().closeModal();
    else openModal({ type: "phone", video: true });
  }
  function record() {
    setMore(false);
    openModal({ type: "recorder" });
  }

  const bell = (
    <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Notifications" onClick={() => openModal({ type: "alerts" })}>
      <Bell className="size-5" />
      {unread ? (
        <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-fg">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="phone-top clinic-shell flex h-12 items-center justify-between gap-2 sm:h-14">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Link to="/start" className="min-w-0 shrink-0">
            <NoctisLockup kicker="Noctis" markClass="size-8" className="max-[380px]:[&>span>span:last-child]:hidden" />
          </Link>
          <CardsReturn className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full px-2 text-xs font-semibold text-primary ring-1 ring-primary" />
        </div>
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:flex sm:gap-2">
          <LanguageMenu />
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Settings" onClick={() => openModal({ type: "settings" })}>
            <Settings className="size-5" />
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0" aria-label="Ask Noctis" onClick={ask}>
            <Sparkles className="size-4" />
            <span>Ask Noctis</span>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0" aria-label="Chat" asChild>
            <Link to="/calls">
              <MessageCircle className="size-4" />
              <span>Chat</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0" aria-label="Call" aria-pressed={calling} onClick={call}>
            <Phone className="size-4" />
            <span>Call</span>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0" aria-label="Video" aria-pressed={filming} onClick={film}>
            <Video className="size-4" />
            <span>Video</span>
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Search" asChild>
            <Link to="/explore">
              <Search className="size-5" />
            </Link>
          </Button>
          <span className="flex shrink-0 items-center gap-2 pl-1">
            <LocalClock />
            {bell}
          </span>
          <Button variant="ghost" size="sm" className="shrink-0" aria-label="Sign out" disabled={leaving} onClick={signOut}>
            {leaving ? "Signing out…" : "Sign out"}
          </Button>
          <Button size="sm" className="shrink-0" aria-label="Record" onClick={record}>
            <Camera className="size-4" />
            <span className="hidden min-[400px]:inline">Record</span>
          </Button>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-0.5 sm:hidden">
          <LanguageMenu />
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Search" asChild>
            <Link to="/explore">
              <Search className="size-5" />
            </Link>
          </Button>
          {bell}
          <Button variant="ghost" size="sm" className="shrink-0 px-2" aria-label="Sign out" disabled={leaving} onClick={signOut}>
            {leaving ? "…" : "Sign out"}
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="More" aria-expanded={more} onClick={() => setMore((open) => !open)}>
            <Ellipsis className="size-5" />
          </Button>
        </div>
      </div>
      {more ? (
        <div className="clinic-shell grid grid-cols-2 gap-2 border-t border-border bg-bg py-3 sm:hidden">
          <Button variant="ghost" className="justify-start" aria-label="Ask Noctis" onClick={ask}>
            <Sparkles className="size-4" />
            Ask Noctis
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Chat" asChild>
            <Link to="/calls" onClick={() => setMore(false)}>
              <MessageCircle className="size-4" />
              Chat
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Call" aria-pressed={calling} onClick={call}>
            <Phone className="size-4" />
            Call
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Video" aria-pressed={filming} onClick={film}>
            <Video className="size-4" />
            Video
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Record" onClick={record}>
            <Camera className="size-4" />
            Record
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Settings" onClick={() => { setMore(false); openModal({ type: "settings" }); }}>
            <Settings className="size-4" />
            Settings
          </Button>
          <Button variant="ghost" className="justify-start" aria-label="Sign out" disabled={leaving} onClick={() => { setMore(false); signOut(); }}>
            {leaving ? "Signing out…" : "Sign out"}
          </Button>
          <div className="flex min-h-11 items-center justify-end px-2">
            <LocalClock />
          </div>
        </div>
      ) : null}
    </header>
  );
}