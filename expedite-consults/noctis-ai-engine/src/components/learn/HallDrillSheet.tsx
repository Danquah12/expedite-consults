import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StudyThisPanel } from "@/components/learn/StudyThisPanel";
import { HallLessonDesk } from "@/components/learn/HallLessonDesk";
import { ClipDock } from "@/components/feed/ClipDock";
import { PresentedBy } from "@/components/feed/EndHold";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { knowledgeAsset } from "@/lib/knowledge-asset";
import { KnowledgeActions } from "@/components/learn/KnowledgeActions";
import { HALL_TABS } from "@/lib/hall-nav";
import { HALL_CARDS, type HallCard } from "@/lib/hall";
import { SCRIPTURE_CARDS } from "@/lib/hall-scripture";
import { liveHallCards } from "@/lib/hall-live";
import { youtubeIdOf, ytCommand } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";

function deckFor(cardId: string, posts: Parameters<typeof liveHallCards>[0]): HallCard[] {
  const live = liveHallCards(posts);
  if (live.some((row) => row.id === cardId)) return live;
  if (SCRIPTURE_CARDS.some((row) => row.id === cardId)) return SCRIPTURE_CARDS;
  if (HALL_CARDS.some((row) => row.id === cardId)) return HALL_CARDS;
  return live.length ? live : HALL_CARDS;
}

const POS = "vibetok-hall-pos";

export function HallDrillSheet({ open, cardId }: { open: boolean; cardId: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);
  const openClinic = useFeedStore((s) => s.openClinic);
  const enterReels = useFeedStore((s) => s.enterReels);
  const setTicket = useFeedStore((s) => s.setTicket);
  const posts = useFeedStore((s) => s.posts);
  const deck = deckFor(cardId, posts);
  const index = Math.max(0, deck.findIndex((row) => row.id === cardId));
  const card = deck[index] ?? liveHallCards(posts).find((row) => row.id === cardId) ?? HALL_CARDS.find((row) => row.id === cardId) ?? SCRIPTURE_CARDS.find((row) => row.id === cardId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const yt = card ? youtubeIdOf(card.post) : null;
  const many = deck.length > 1;
  const playable = Boolean(yt || card?.mediaType === "video");
  const [clock, setClock] = useState({ t: 0, d: 0 });
  const [seekAt, setSeekAt] = useState<number | null>(null);
  const lastSaved = useRef(0);

  function onTime(t: number, d: number) {
    setClock((prev) => (prev.t === t && prev.d === d ? prev : { t, d }));
    if (!card || t < 2) return;
    const stamp = Math.floor(t);
    if (stamp === lastSaved.current) return;
    lastSaved.current = stamp;
    try {
      const raw = JSON.parse(localStorage.getItem(POS) || "{}") as Record<string, number>;
      raw[card.id] = stamp;
      localStorage.setItem(POS, JSON.stringify(raw));
    } catch {
      /* keep playing */
    }
  }

  function seek(n: number) {
    setSeekAt(n);
    setClock((prev) => ({ ...prev, t: n }));
    const el = videoRef.current;
    if (el && !yt) el.currentTime = n;
  }

  const noteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setClock({ t: 0, d: 0 });
    lastSaved.current = 0;
    let at = 0;
    try {
      const raw = JSON.parse(localStorage.getItem(POS) || "{}") as Record<string, number>;
      at = raw[cardId] ?? 0;
    } catch {
      at = 0;
    }
    setSeekAt(at > 3 ? at : null);
    noteRef.current?.scrollTo(0, 0);
  }, [cardId, open]);

  function go(step: number) {
    if (!many) return;
    const next = deck[(index + step + deck.length) % deck.length];
    if (!next) return;
    setTicket(next.ticket);
    openModal({ type: "hall-drill", ticket: next.ticket, cardId: next.id });
  }

  useEffect(() => {
    const node = videoRef.current;
    if (!open) {
      if (node) {
        node.pause();
        node.muted = true;
      }
      document.querySelectorAll<HTMLIFrameElement>("[data-hall-stage] iframe").forEach((frame) => {
        ytCommand(frame, "pauseVideo");
        ytCommand(frame, "mute");
      });
      return;
    }
    if (!node) return;
    node.muted = false;
    void node.play().catch(() => {
      node.muted = true;
      void node.play().catch(() => undefined);
    });
    return () => {
      node.pause();
      node.muted = true;
    };
  }, [open, cardId]);

  if (!card) return null;
  const upcoming = many ? deck[(index + 1) % deck.length] : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent
        style={{ position: "fixed", inset: 0, transform: "none", maxHeight: "none", width: "100vw", height: "100dvh" }}
        className="!inset-0 !left-0 !top-0 !flex !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col !overflow-hidden !rounded-none !bg-bg !p-0 text-white"
      >
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <DialogDescription className="sr-only">{card.post.caption}</DialogDescription>
        <div className="z-30 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/15 bg-zinc-950 px-3 py-2 pr-14">
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-white px-4 text-sm font-semibold text-black"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          {HALL_TABS.map((item) => (
            <Link
              key={`${item.to}-${item.hash ?? item.label}`}
              to={item.to}
              hash={item.hash ?? (item.to === "/" ? "feed" : "")}
              onClick={() => {
                closeModal();
                if (item.to === "/") openClinic();
                if (item.to === "/reels") enterReels();
              }}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-white/15 px-3 text-xs font-semibold text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-h-0 min-w-0 flex-col overflow-y-auto">
            <div data-hall-stage className="relative mx-auto w-full overflow-hidden rounded-2xl bg-black">
              {yt ? (
                <YoutubeFrame
                  postId={card.post.id}
                  youtubeId={yt}
                  posterUrl={card.posterUrl}
                  playing={open}
                  muted={false}
                  chrome={false}
                  captions={false}
                  isolate
                  fill
                  onToggle={() => undefined}
                  onEnded={() => go(1)}
                  onTime={onTime}
                  seekAt={seekAt}
                />
              ) : card.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={card.mediaUrl}
                  poster={card.posterUrl}
                  autoPlay
                  playsInline
                  controls
                  onEnded={() => go(1)}
                  onTimeUpdate={(e) => onTime(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
                  onLoadedMetadata={(e) => onTime(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
                  className="object-contain"
                />
              ) : (
                <img src={card.mediaUrl} alt="" className="object-contain" />
              )}
              {yt ? null : (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] bg-gradient-to-t from-black from-40% via-black/80 to-transparent px-4 pb-3 pt-12">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{card.post.teach.stamp}</p>
                <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-white">{card.title}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-xs font-medium text-white">{card.mentor}</p>
                  <p className="pointer-events-auto shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    <PresentedBy className="text-white" />
                  </p>
                </div>
              </div>
              )}
            </div>
            {yt ? (
              <div className="mt-2 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{card.post.teach.stamp}</p>
                <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-white">{card.title}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  <PresentedBy className="text-white" />
                </p>
                <div className="mt-3">
                  <KnowledgeActions
                    asset={knowledgeAsset({
                      id: card.id,
                      title: card.title,
                      source: card.mentor,
                      category: card.post.teach.stamp,
                      summary: card.post.teach.hook,
                      insight: card.post.caption,
                    })}
                  />
                </div>
              </div>
            ) : null}
            {playable ? <ClipDock compact time={clock.t} duration={clock.d} onSeek={seek} /> : null}
            {many ? (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white/10 px-3 text-xs font-semibold text-white"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <span className="min-w-0 flex-1 truncate text-center text-[11px] text-white/70">
                  {index + 1} of {deck.length}
                  {upcoming ? ` · Next · ${upcoming.title}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
          <aside ref={noteRef} className="min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-bg pb-8 text-fg">
            <HallLessonDesk card={card} />
            <StudyThisPanel post={card.post} onNext={(id) => openModal({ type: "lesson", postId: id })} />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
