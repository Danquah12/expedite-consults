import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Pause, Volume2, VolumeX } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FeedPost } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";
import { vimeoIdOf } from "@/lib/vimeo";
import { preziEmbedOf, preziSpeech } from "@/lib/prezi";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { VimeoFrame } from "@/components/feed/VimeoFrame";
import { PreziFrame } from "@/components/feed/PreziFrame";
import { DrillQuiz } from "@/components/learn/DrillQuiz";
import { EndHold, PresentedBy, SourceLink, SourceStamp, withSourceLinks } from "@/components/feed/EndHold";
import { SubscribeBell } from "@/components/feed/SubscribeBell";
import { wakeSound } from "@/lib/playback";
import { ClipActions } from "@/components/feed/ClipActions";
import { ReactMarks } from "@/components/feed/ReactMarks";
import { ClipPlate } from "@/components/feed/ClipPlate";
import { ClipDock } from "@/components/feed/ClipDock";
import { cn } from "@/lib/utils";
import { englishHear, phraseAt } from "@/lib/english-hear";
import { hostEmbed } from "@/lib/hosts";
import { HostFrame } from "@/components/feed/HostFrame";
import { FilmSense } from "@/components/learn/FilmSense";
import { FilmPass } from "@/components/learn/FilmPass";
import { ReelImagine } from "@/components/reels/ReelImagine";
import { PostDiscoverBridgeBar } from "@/components/discover/DiscoverDesk";
import { actor } from "@/lib/current-user";

function ReelFoot({ postId, className }: { postId: string; className?: string }) {
  const likes = useFeedStore((s) => {
    const post = s.posts.find((item) => item.id === postId);
    const extra = s.engage[postId]?.likeDelta ?? 0;
    return (post?.likes ?? 0) + extra;
  });
  const me = actor();

  function holdBar(event: { stopPropagation: () => void }) {
    event.stopPropagation();
  }

  return (
    <form
      className={cn(
        "reel-bar pointer-events-auto z-40 flex items-center gap-1.5 rounded-full border border-[#e4b86a]/70 bg-[#12141c] px-1.5 py-1 shadow-[0_0_0_1px_rgba(228,184,106,0.25)]",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={holdBar}
      onTouchStart={holdBar}
    >
      <button
        type="button"
        onClick={() => useFeedStore.getState().openModal({ type: "comments", postId })}
        className="flex min-h-0 min-w-0 flex-1 items-center gap-2 rounded-full bg-white/10 px-1.5 py-1 text-left"
      >
        <img src={me.avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
        <span className="truncate text-xs text-white/70">Write a comment…</span>
      </button>
      <span className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />
      <span className="shrink-0 text-[11px] tabular-nums text-white/70" aria-label={`${likes} likes`}>
        {likes}
      </span>
      <ReactMarks postId={postId} className="size-7 text-sm text-white/90" />
    </form>
  );
}

export function ReelSlide({
  post,
  active,
  muted,
  onAdvance,
  onBack,
}: {
  post: FeedPost;
  active: boolean;
  muted: boolean;
  onAdvance?: () => void;
  onBack?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const savedOn = useFeedStore((s) => s.engage[post.id]?.saved ?? post.isSaved);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const noteWatch = useFeedStore((s) => s.noteWatch);
  const flipped = useFeedStore((s) => s.flipped[post.id]);
  const quiet = useFeedStore((s) => s.modal.type === "lesson" || s.modal.type === "hall-drill" || s.modal.type === "analyze" || s.modal.type === "think");
  const ytId = youtubeIdOf(post);
  const vmId = vimeoIdOf(post);
  const prezi = preziEmbedOf(post);
  const host = !ytId && !vmId && !prezi ? hostEmbed(post.mediaUrl) : null;
  const clear = Boolean(ytId || vmId || prezi || host);
  const hear = englishHear(post);
  const [start, setStart] = useState(0);
  const [hold, setHold] = useState(false);
  const [clock, setClock] = useState({ t: 0, d: 0 });
  const [seekAt, setSeekAt] = useState<number | null>(null);
  const advanceRef = useRef(onAdvance);
  advanceRef.current = onAdvance;

  useEffect(() => {
    if (!active) {
      setStart(0);
      setHold(false);
      setSeekAt(null);
      setClock({ t: 0, d: 0 });
    }
  }, [active]);

  const onEnded = useCallback(() => {
    if (!active) return;
    useFeedStore.getState().rewardClip(post.id, "finish");
    advanceRef.current?.();
  }, [active, post.id]);

  const watchAgain = useCallback(() => {
    setHold(false);
    setStart((n) => n + 0.01);
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => undefined);
    }
  }, []);

  const goNext = useCallback(() => {
    advanceRef.current?.();
  }, []);

  function onTime(t: number, d: number) {
    setClock((prev) => (prev.t === t && prev.d === d ? prev : { t, d }));
  }

  function seekReel(n: number) {
    setSeekAt(n);
    setClock((prev) => ({ ...prev, t: n }));
    const el = videoRef.current;
    if (el && !ytId && !vmId) el.currentTime = n;
  }

  function takeThis() {
    setPlayingId(post.id);
    wakeSound();
  }

  useEffect(() => {
    if (ytId || vmId || prezi) {
      if (active) noteWatch(post.id);
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.volume = 1;
    if (active && !hold && !flipped) {
      const wantSound = !muted;
      el.muted = true;
      const run = () => {
        el.muted = !wantSound;
        noteWatch(post.id);
      };
      if (el.paused) {
        void el
          .play()
          .then(run)
          .catch(() => {
            el.muted = true;
            void el.play().then(run).catch(() => undefined);
          });
      } else {
        run();
      }
    } else {
      el.pause();
      el.muted = true;
    }
  }, [active, hold, flipped, muted, noteWatch, post.id, ytId, vmId, prezi]);

  return (
    <div className="reel-frame relative flex w-full items-center justify-center">
      <div className="reel-stage-wrap relative flex h-full w-full items-center justify-center md:gap-4 md:px-4">
        <div className="reel-picture relative shrink-0">
          <ClipPlate tone="reel" className="relative h-full w-full">
            <div className="clip-well">
              {post.posterUrl || ytId ? (
                <img
                  src={post.posterUrl ?? youtubePoster(ytId!)}
                  alt=""
                  aria-hidden
                  className="reel-back"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              {ytId ? (
                <YoutubeFrame
                  postId={post.id}
                  youtubeId={ytId}
                  posterUrl={post.posterUrl}
                  playing={active && !hold && !flipped && !quiet}
                  muted={muted}
                  start={start}
                  seekAt={seekAt}
                  onTime={onTime}
                  onEnded={onEnded}
                  onToggle={takeThis}
                  chrome={false}
                  fill
                  captions={false}
                  className="min-h-0"
                />
              ) : vmId ? (
                <VimeoFrame
                  postId={post.id}
                  vimeoId={vmId}
                  posterUrl={post.posterUrl}
                  playing={active && !hold && !flipped && !quiet}
                  muted={muted}
                  seekAt={seekAt}
                  onTime={onTime}
                  onEnded={onEnded}
                  onToggle={takeThis}
                  chrome={false}
                  className="min-h-0"
                />
              ) : prezi ? (
                <PreziFrame
                  postId={post.id}
                  embedUrl={prezi}
                  posterUrl={post.posterUrl}
                  playing={active && !quiet}
                  muted={muted}
                  voiceText={preziSpeech(post)}
                  onToggle={takeThis}
                  className="min-h-0"
                />
              ) : host ? (
                <HostFrame
                  embed={host}
                  posterUrl={post.posterUrl}
                  playing={active && !hold && !flipped && !quiet}
                  onToggle={takeThis}
                  className="min-h-0"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={post.mediaUrl}
                  poster={post.posterUrl}
                  playsInline
                  muted={muted}
                  autoPlay={active}
                  {...{ "webkit-playsinline": "true" }}
                  preload={active ? "auto" : "none"}
                  className="h-full w-full object-cover"
                  onEnded={onEnded}
                  onTimeUpdate={(e) => onTime(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
                  onLoadedMetadata={(e) => onTime(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
                  onClick={() => {
                    const el = videoRef.current;
                    if (!el) return;
                    if (el.paused) void el.play();
                    else el.pause();
                  }}
                />
              )}
            </div>

            {/* Top right subtle controls inside video */}
            <div className="pointer-events-none absolute right-3 top-3 z-40 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  toggleMute(post.id);
                  wakeSound();
                }}
                aria-label={muted ? "Sound off" : "Sound on"}
                className="pointer-events-auto grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
              {!ytId && !vmId && !prezi && !host ? (
                <button
                  type="button"
                  aria-label="Pause"
                  onClick={() => {
                    const el = videoRef.current;
                    if (!el) return;
                    if (el.paused) void el.play();
                    else el.pause();
                  }}
                  className="pointer-events-auto grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <Pause className="size-4" />
                </button>
              ) : null}
            </div>

            {/* Bottom gradient + Bottom-left overlay (Avatar, Author, Follow, Audio, Caption, Quiz) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-14 pr-16 md:px-6 md:pb-5 md:pr-24">
              <div className="pointer-events-auto max-w-2xl space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/u/$username"
                    params={{ username: post.author.username }}
                    className="flex min-w-0 items-center gap-2.5"
                  >
                    <img
                      src={post.author.avatar}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white/40"
                    />
                    <span className="truncate text-sm font-bold text-white drop-shadow">{post.author.name}</span>
                    <span
                      aria-label="Verified"
                      className="inline-grid size-4 shrink-0 place-items-center rounded-full bg-white text-[10px] font-black text-black"
                    >
                      ✓
                    </span>
                  </Link>
                  <span className="text-xs font-bold text-white/80">·</span>
                  <button
                    type="button"
                    onClick={() => useFeedStore.getState().toggleFollow(post.author.username, post.id)}
                    className="rounded-full border border-white/50 bg-black/30 px-3 py-0.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
                  >
                    {post.isFollowing ? "Following" : "Follow"}
                  </button>
                </div>

                <p className="flex items-center gap-1.5 truncate text-xs font-medium text-white/90 drop-shadow">
                  <span>♫</span>
                  <span className="truncate">{post.musicTitle || `${post.author.name} · ${post.teach.stamp || "Original audio"}`}</span>
                </p>

                <p className="line-clamp-2 break-words text-[13px] leading-snug text-white drop-shadow sm:text-sm">
                  {withSourceLinks(post.caption)}{" "}
                  {post.hashtags?.length ? (
                    <span className="font-semibold text-white/90">{post.hashtags.slice(0, 5).join(" ")}</span>
                  ) : null}
                </p>

                {hear && active ? (
                  <p className="break-words text-xs leading-snug text-white/90">
                    <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em]">{hear.tongue} · English</span>
                    {phraseAt(hear, clock.t)}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFlip(post.id);
                    }}
                    className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-fg shadow"
                  >
                    {flipped ? "Hide Quiz" : "Quiz"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      useFeedStore.getState().openModal({ type: "analyze", claim: post.teach.hook, offered: post.caption });
                    }}
                    className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-white/25"
                  >
                    Analyze
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      useFeedStore.getState().openModal({ type: "think", claim: post.teach.hook });
                    }}
                    className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-white/25"
                  >
                    Think
                  </button>
                  <span className="hidden text-[11px] font-semibold text-white/75 sm:inline">
                    <SourceLink />
                  </span>
                </div>

                {flipped ? (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-black/85 p-3 text-white backdrop-blur-md">
                    <DrillQuiz post={post} />
                  </div>
                ) : null}
              </div>

              {prezi ? null : (
                <div className="pointer-events-auto mt-2">
                  <ClipDock compact time={clock.t} duration={clock.d} onSeek={seekReel} />
                </div>
              )}
            </div>

            {/* Mobile inside-right action rail (< md) */}
            <div className="reel-rail pointer-events-auto absolute bottom-14 right-2.5 z-40 flex flex-col items-center gap-2 md:hidden">
              <ClipActions post={post} layout="rail" />
              <button
                type="button"
                onClick={() => useFeedStore.getState().toggleSave(post.id)}
                aria-label="Save"
                className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <Bookmark className={cn("size-5", savedOn ? "fill-primary text-primary" : "text-white")} />
              </button>
              <button
                type="button"
                aria-label="More"
                onClick={() => useFeedStore.getState().openModal({ type: "comments", postId: post.id })}
                className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>

            {hold && active ? <EndHold onAgain={watchAgain} onNext={goNext} /> : null}
          </ClipPlate>
        </div>

        {/* Desktop right-side column outside the theater frame (>= md): Up/Down chevrons + Like/Comment/Share/Save/More rail */}
        <div className="pointer-events-auto hidden h-[calc(100dvh-4.5rem)] shrink-0 flex-col items-center justify-between py-4 md:flex">
          <div className="h-2" />
          <div className="flex flex-col items-center gap-3">
            {onBack ? (
              <button
                type="button"
                aria-label="Previous reel"
                onClick={onBack}
                className="grid size-11 place-items-center rounded-full border border-white/20 bg-elevated/90 text-fg shadow-lg transition hover:scale-105 hover:bg-surface"
              >
                <ChevronDown className="size-6 rotate-180" />
              </button>
            ) : null}
            {onAdvance ? (
              <button
                type="button"
                aria-label="Next reel"
                onClick={goNext}
                className="grid size-11 place-items-center rounded-full border border-white/20 bg-elevated/90 text-fg shadow-lg transition hover:scale-105 hover:bg-surface"
              >
                <ChevronDown className="size-6" />
              </button>
            ) : null}
          </div>

          <div className="reel-rail flex flex-col items-center gap-2 pb-2">
            <ClipActions post={post} layout="rail" />
            <button
              type="button"
              onClick={() => useFeedStore.getState().toggleSave(post.id)}
              aria-label="Save"
              className="grid size-10 place-items-center rounded-full bg-elevated/80 text-fg transition hover:bg-surface"
            >
              <Bookmark className={cn("size-5", savedOn ? "fill-primary text-primary" : "text-fg")} />
            </button>
            <button
              type="button"
              aria-label="More"
              onClick={() => useFeedStore.getState().openModal({ type: "comments", postId: post.id })}
              className="grid size-10 place-items-center rounded-full bg-elevated/80 text-fg transition hover:bg-surface"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
