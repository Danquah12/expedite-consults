import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useFeedStore } from "@/lib/feed-store";
import { dealReels } from "@/lib/shuffle";
import { onTab } from "@/lib/tab-split";
import { nextReelId, scrollToReel, focusedReel } from "@/lib/syndicate";
import { ReelSlide } from "@/components/reels/ReelSlide";

function snapIndex(root: HTMLElement, videos: { id: string }[]) {
  const id = focusedReel(root);
  if (!id) return null;
  const i = videos.findIndex((post) => post.id === id);
  return i < 0 ? null : i;
}

export function TheaterView() {
  const posts = useFeedStore((s) => s.posts);
  const playingId = useFeedStore((s) => s.playingId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const setViewStyle = useFeedStore((s) => s.setViewStyle);
  const isMuted = useFeedStore((s) => s.isMuted);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const dayWatch = useFeedStore((s) => s.dayWatch);
  const vibeMix = useFeedStore((s) => s.vibeMix);
  const startId = useRef(playingId);
  const scroller = useRef<HTMLDivElement>(null);
  const videos = useMemo(
    () => dealReels(onTab(posts, "clinic"), deckSeed, startId.current, waveIds, priorWaveIds, dayWatch, null, vibeMix, true),
    [posts, deckSeed, waveIds, priorWaveIds, dayWatch, vibeMix],
  );
  const idx = Math.max(0, videos.findIndex((p) => p.id === playingId));

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const start = Math.max(0, videos.findIndex((p) => p.id === startId.current));
    if (start > 0) videos[start] && scrollToReel(videos[start].id);
    let raf = 0;
    const pick = () => {
      const i = snapIndex(root, videos);
      if (i == null) return;
      const id = videos[i]?.id;
      if (id && id !== useFeedStore.getState().playingId) setPlayingId(id);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        pick();
      });
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", pick);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", pick);
    };
  }, [videos, setPlayingId]);

  const advance = useCallback(
    (fromId: string) => {
      const next = nextReelId(fromId) ?? videos[idx + 1]?.id ?? videos[0]?.id;
      if (!next) return;
      setPlayingId(next);
      scrollToReel(next);
    },
    [idx, setPlayingId, videos],
  );

  return (
    <div className="relative h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] bg-bg">
      <button
        type="button"
        onClick={() => setViewStyle("stream")}
        className="absolute left-3 z-50 grid size-11 place-items-center rounded-full bg-bg/60 text-fg backdrop-blur-md"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
        aria-label="Close theater"
      >
        <X className="size-5" />
      </button>
      <div
        className="absolute right-3 z-50 flex items-center gap-2"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => {
            if (playingId) advance(playingId);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-fg"
        >
          Next Reel
          <ChevronDown className="size-4" />
        </button>
        <p className="rounded-full bg-bg/55 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
          {Math.max(1, idx + 1)} / {videos.length}
        </p>
      </div>
      <div ref={scroller} className="reel-scroller h-full">
        {videos.map((post, i) => (
          <div key={post.id} data-reel={post.id} className="reel-slide">
            {Math.abs(i - idx) <= 1 ? (
              <ReelSlide post={post} active={playingId === post.id} muted={isMuted} onAdvance={() => advance(post.id)} />
            ) : (
              <div className="h-full w-full bg-bg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
