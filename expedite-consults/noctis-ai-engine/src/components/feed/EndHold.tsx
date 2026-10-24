import { useEffect, useRef, useState, type ReactNode } from "react";
import { SOURCE, SOURCE_HREF } from "@/lib/source";
import { cn } from "@/lib/utils";

export function SourceLink({ className }: { className?: string }) {
  return (
    <a
      href={SOURCE_HREF}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn("pointer-events-auto underline-offset-2 hover:underline", className)}
    >
      {SOURCE}
    </a>
  );
}

export function PresentedBy({ className }: { className?: string }) {
  return (
    <span className="inline-flex max-w-full items-baseline gap-[0.4em]">
      <span>Presented by</span>
      <SourceLink className={className} />
    </span>
  );
}
export function withSourceLinks(text: string): ReactNode {
  const house = SOURCE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = text
    .replace(new RegExp(`\\s*(?:Source|Presented by)\\s*[·•|:-]?\\s*${house}\\.?`, "gi"), "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!cleaned.includes(SOURCE)) return cleaned;
  const parts = cleaned.split(SOURCE);
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 ? <SourceLink /> : null}
    </span>
  ));
}

export function EndHold({ onAgain, onNext, placed = false }: { onAgain: () => void; onNext: () => void; placed?: boolean }) {
  const wait = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 700 : 1600;
  const [left, setLeft] = useState(wait > 1000 ? 2 : 1);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  useEffect(() => {
    const tick = window.setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    const go = window.setTimeout(() => nextRef.current(), wait);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(go);
    };
  }, [wait]);

  return (
    <div className={placed ? "relative z-30 grid place-items-center px-4 py-3" : "absolute inset-0 z-30 grid place-items-center bg-bg/60 px-6 backdrop-blur-sm"}>
      <div className="w-full max-w-xs rounded-2xl bg-surface p-4 text-center shadow-float">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          Source · <SourceLink />
        </p>
        <p className="mt-2 font-display text-lg font-semibold">Next clip in {Math.max(0, left)}s</p>
        <p className="mt-1 text-xs text-muted">Or stay and watch this one again.</p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-fg"
          >
            Next clip
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAgain();
            }}
            className="w-full rounded-full bg-elevated py-2 text-xs font-semibold"
          >
            Watch again
          </button>
        </div>
      </div>
    </div>
  );
}

export function SourceStamp({ className }: { className?: string }) {
  return (
    <p className={className ?? "absolute bottom-2 left-3 z-10 max-w-[70%] text-[10px] font-semibold uppercase tracking-[0.14em] text-caption"}>
      Source · <SourceLink />
    </p>
  );
}
