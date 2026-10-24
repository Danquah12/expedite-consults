import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFeedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

const REACTS = ["👍", "❤️", "😂", "😮", "😢", "😡"] as const;

function splashSpots(id: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const a = Math.abs(Math.sin(id * 0.001 + i * 1.7));
    const b = Math.abs(Math.cos(id * 0.0013 + i * 2.3));
    return {
      left: `${6 + a * 86}%`,
      top: `${8 + b * 74}%`,
      delay: `${(i % 8) * 0.05}s`,
      size: `${1.35 + (i % 5) * 0.42}rem`,
    };
  });
}

function ReactSplash({ id, mark }: { id: number; mark: string }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="react-splash" aria-hidden>
      {splashSpots(id).map((spot, i) => (
        <span key={`${id}-${i}`} className="react-drop" style={{ left: spot.left, top: spot.top, animationDelay: spot.delay, fontSize: spot.size }}>
          {mark}
        </span>
      ))}
    </div>,
    document.body,
  );
}

export function ReactMarks({ postId, className }: { postId: string; className?: string }) {
  const react = useFeedStore((s) => s.engage[postId]?.react);
  const [splash, setSplash] = useState<{ id: number; mark: string } | null>(null);

  useEffect(() => {
    if (!splash) return;
    const timer = window.setTimeout(() => setSplash(null), 1600);
    return () => window.clearTimeout(timer);
  }, [splash]);

  return (
    <>
      {REACTS.map((mark) => (
        <button
          key={mark}
          type="button"
          aria-label={`React ${mark}`}
          aria-pressed={react === mark}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const on = react === mark;
            useFeedStore.getState().toggleLike(postId, { x: event.clientX, y: event.clientY }, mark);
            if (!on) {
              setSplash({ id: Date.now(), mark });
              toast.success(mark);
            }
          }}
          className={cn(
            "reel-react grid size-8 min-h-0 shrink-0 place-items-center rounded-full text-base leading-none",
            react === mark ? "bg-primary text-primary-fg" : "hover:bg-white/10",
            className,
          )}
        >
          {mark}
        </button>
      ))}
      {splash ? <ReactSplash id={splash.id} mark={splash.mark} /> : null}
    </>
  );
}

export function ReactBar({ postId }: { postId: string }) {
  return (
    <div
      className="pointer-events-auto relative z-50 mx-auto mt-2 flex w-full max-w-[46rem] items-center justify-center gap-1 rounded-full border border-[#e4b86a]/70 bg-[#12141c] px-2 py-1.5 shadow-[0_0_0_1px_rgba(228,184,106,0.25)]"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <ReactMarks postId={postId} className="size-9 text-lg text-white" />
    </div>
  );
}
