import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { CardsReturn } from "@/components/layout/CardsReturn";
import { useFeedStore } from "@/lib/feed-store";
import { dealReels, readReelEntry } from "@/lib/shuffle";
import { reelPool } from "@/lib/reel-cats";
import { scrollToReel, focusedReel } from "@/lib/syndicate";
import { kickFocusedPlay } from "@/lib/playback";
import { ytCommand } from "@/lib/youtube";
import { vimeoCommand } from "@/lib/vimeo";
import { ReelSlide } from "@/components/reels/ReelSlide";
import { notePlayback } from "@/lib/playback-metrics";

function snapIndex(root: HTMLElement, videos: { id: string }[]) {
  const id = focusedReel(root);
  if (!id) return null;
  const i = videos.findIndex((post) => post.id === id);
  return i < 0 ? null : i;
}

export function ReelsPlayer() {
  const posts = useFeedStore((s) => s.posts);
  const playingId = useFeedStore((s) => s.playingId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const isMuted = useFeedStore((s) => s.isMuted);
  const reelSeed = useFeedStore((s) => s.reelSeed);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const dayWatch = useFeedStore((s) => s.dayWatch);
  const vibeMix = useFeedStore((s) => s.vibeMix);
  const openModal = useFeedStore((s) => s.openModal);
  const scroller = useRef<HTMLDivElement>(null);
  const pool = useMemo(() => reelPool(posts, "all"), [posts]);
  const dealt = useMemo(
    () => dealReels(pool, reelSeed, null, waveIds, priorWaveIds, dayWatch, playingId, vibeMix, true),
    [pool, reelSeed, waveIds, priorWaveIds, dayWatch, playingId, vibeMix],
  );
  const orderRef = useRef<string[] | null>(null);
  const videos = useMemo(() => {
    if (!orderRef.current) {
      orderRef.current = dealt.map((post) => post.id);
      return dealt;
    }
    const byId = new Map(dealt.map((post) => [post.id, post]));
    const kept = orderRef.current.map((id) => byId.get(id)).filter((post) => post != null);
    const seen = new Set(kept.map((post) => post.id));
    const extra = dealt.filter((post) => !seen.has(post.id));
    const merged = [...kept, ...extra];
    orderRef.current = merged.map((post) => post.id);
    return merged;
  }, [dealt]);
  const idx = Math.max(0, videos.findIndex((p) => p.id === playingId));
  const deckKey = `${reelSeed}:all`;
  const seenDeck = useRef("");

  useEffect(() => {
    const saved = readReelEntry();
    if (saved) {
      useFeedStore.setState({
        reelSeed: saved.seed,
        reelStartId: saved.start,
      });
    } else {
      useFeedStore.getState().enterReels();
    }
  }, []);

  useEffect(() => {
    const first = videos[0]?.id;
    if (!first) return;
    if (seenDeck.current === deckKey) return;
    seenDeck.current = deckKey;
    scroller.current?.scrollTo({ top: 0 });
    setPlayingId(first);
  }, [deckKey, videos, setPlayingId]);

  useEffect(() => {
    if (!playingId) return;
    const hush = () => {
      document.querySelectorAll<HTMLElement>("[data-reel]").forEach((node) => {
        if (node.getAttribute("data-reel") === playingId) return;
        node.querySelectorAll("iframe").forEach((frame) => {
          ytCommand(frame, "pauseVideo");
          ytCommand(frame, "mute");
          vimeoCommand(frame, "pause");
          vimeoCommand(frame, "setVolume", 0);
        });
        node.querySelectorAll<HTMLMediaElement>("video, audio").forEach((el) => {
          el.pause();
          el.muted = true;
        });
      });
    };
    hush();
    const again = window.setTimeout(hush, 180);
    return () => window.clearTimeout(again);
  }, [playingId]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    let raf = 0;
    const pick = () => {
      const i = snapIndex(root, videos);
      if (i == null) return;
      const id = videos[i]?.id;
      if (id && id !== useFeedStore.getState().playingId) {
        setPlayingId(id);
        notePlayback("focus");
      }
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
      const i = videos.findIndex((post) => post.id === fromId);
      const next = videos[i + 1]?.id ?? videos[0]?.id;
      if (!next || next === fromId) return;
      setPlayingId(next);
      scrollToReel(next);
      window.setTimeout(() => kickFocusedPlay(), 350);
      window.setTimeout(() => kickFocusedPlay(), 900);
    },
    [setPlayingId, videos],
  );

  const retreat = useCallback(
    (fromId: string) => {
      const i = videos.findIndex((post) => post.id === fromId);
      const prev = videos[i - 1]?.id ?? videos[videos.length - 1]?.id;
      if (!prev || prev === fromId) return;
      setPlayingId(prev);
      scrollToReel(prev);
      window.setTimeout(() => kickFocusedPlay(), 350);
    },
    [setPlayingId, videos],
  );

  return (
    <div className="reel-root">
      <div className="relative z-50 flex shrink-0 items-center justify-between gap-2 px-2 pb-1 pt-[max(0.35rem,env(safe-area-inset-top))] sm:px-3 sm:pt-[max(0.6rem,env(safe-area-inset-top))]">
        <CardsReturn className="pointer-events-auto inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-semibold text-black shadow-float sm:h-10 sm:px-3.5" />
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <p className="hidden rounded-full bg-bg/80 px-2 py-1 text-[10px] font-semibold tabular-nums text-fg backdrop-blur-md sm:px-3 sm:text-[11px] md:block">
            {videos.length ? Math.max(1, idx + 1) : 0}/{videos.length}
          </p>
          <button
            type="button"
            onClick={() => {
              if (playingId) advance(playingId);
            }}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-fg"
          >
            Next
            <ChevronDown className="size-3.5 sm:size-4" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => openModal({ type: "settings" })}
            className="grid size-9 place-items-center rounded-full bg-bg/80 text-fg backdrop-blur-md sm:size-11"
          >
            <Settings className="size-4 sm:size-5" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="reel-scroller min-h-0 flex-1">
        {videos.map((post, i) => (
          <div key={post.id} data-reel={post.id} className="reel-slide">
            {i === 0 || Math.abs(i - idx) <= 1 ? (
              <ReelSlide post={post} active={playingId === post.id} muted={isMuted} onAdvance={() => advance(post.id)} onBack={() => retreat(post.id)} />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
        ))}
        {!videos.length ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-sm text-muted">Nothing in the reel yet. Record one from the clinic.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
