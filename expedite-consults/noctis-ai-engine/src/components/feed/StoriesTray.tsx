import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useFeedStore } from "@/lib/feed-store";
import { isVideoStory, type StoryItem } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

function StoryBubble({
  story,
  delay,
  onOpen,
  hidden,
}: {
  story: StoryItem;
  delay: number;
  onOpen: () => void;
  hidden?: boolean;
}) {
  const video = isVideoStory(story);
  const still = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = still.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("autoplay");
  }, []);
  return (
    <button
      type="button"
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      onClick={onOpen}
      className="clip-plate group relative h-32 w-20 shrink-0 overflow-hidden rounded-2xl bg-elevated text-left transition-transform duration-150 ease-out active:scale-[0.96]"
    >
      {video && !story.preziEmbed ? (
        <video
          ref={still}
          src={story.mediaUrl}
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          data-story-still
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={story.mediaUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover kenburns"
          style={{ animationDelay: `${delay}s` }}
        />
      )}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      {story.isUser ? (
        <span className="absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-fg shadow-border">
          <Plus className="size-4" />
        </span>
      ) : (
        <span className={cn("absolute left-2 top-2 size-8 overflow-hidden rounded-full p-0.5", story.hasLive ? "bg-primary" : "bg-elevated")}>
          <img src={story.avatar} alt="" className="size-full rounded-full object-cover" />
        </span>
      )}
      {story.hasLive ? (
        <span className="live-pulse absolute right-2 top-2 rounded-md bg-live px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-fg">
          LIVE
        </span>
      ) : null}
      <span className="absolute inset-x-1.5 bottom-2">
        <span className="clip-type block truncate text-[11px] font-semibold">{story.displayName}</span>
        {story.caption ? <span className="clip-meta mt-0.5 block truncate text-[10px]">{story.caption}</span> : null}
      </span>
    </button>
  );
}

export function StoriesTray() {
  const stories = useFeedStore((s) => s.stories).filter((story) => !story.id.startsWith("st-"));
  const openModal = useFeedStore((s) => s.openModal);
  const liveStreams = useFeedStore((s) => s.liveStreams);
  const viewport = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const resumeTimer = useRef(0);

  function hold(ms = 0) {
    paused.current = true;
    window.clearTimeout(resumeTimer.current);
    if (ms > 0) resumeTimer.current = window.setTimeout(() => { paused.current = false; }, ms);
  }

  useEffect(() => {
    const el = viewport.current;
    const setEl = firstSet.current;
    if (!el || !setEl || stories.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!paused.current) {
        el.scrollLeft += dt * 0.042;
        const wrapAt = setEl.offsetWidth;
        if (wrapAt > 0 && el.scrollLeft >= wrapAt) el.scrollLeft -= wrapAt;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimer.current);
    };
  }, [stories.length]);

  function openStory(story: StoryItem, idx: number) {
    if (story.isUser) {
      openModal({ type: "recorder" });
      return;
    }
    if (story.hasLive) {
      const live = liveStreams.find((l) => l.username === story.username);
      if (live) {
        openModal({ type: "live", streamId: live.id });
        return;
      }
    }
    openModal({ type: "story", index: idx % stories.length });
  }

  function row(prefix: string, hidden: boolean) {
    return stories.map((story, idx) => (
      <StoryBubble
        key={`${prefix}-${story.id}`}
        story={story}
        delay={-(idx * 0.9)}
        hidden={hidden}
        onOpen={() => openStory(story, idx)}
      />
    ));
  }

  return (
    <div
      ref={viewport}
      data-story-tray
      className="flex overflow-x-auto pb-1 scrollbar-none"
      onPointerEnter={() => hold()}
      onPointerLeave={() => { paused.current = false; }}
      onPointerDown={() => hold()}
      onPointerUp={() => hold(900)}
      onWheel={() => hold(1400)}
    >
      <div ref={firstSet} className="flex shrink-0 gap-3 pr-3">
        {row("a", false)}
      </div>
      <div className="flex shrink-0 gap-3 pr-3" aria-hidden>
        {row("b", true)}
      </div>
    </div>
  );
}
