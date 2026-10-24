import { PresentedBy } from "@/components/feed/EndHold";
import { ytClock } from "@/lib/youtube";

export function ClipDock({
  time = 0,
  duration = 0,
  onSeek,
  compact = false,
  barOnly = false,
  credit = true,
}: {
  time?: number;
  duration?: number;
  onSeek?: (n: number) => void;
  compact?: boolean;
  barOnly?: boolean;
  credit?: boolean;
}) {
  const max = Math.max(1, duration);
  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  const bar = (
    <>
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      {onSeek ? (
        <input
          type="range"
          min={0}
          max={max}
          step={0.25}
          value={Math.min(time, max)}
          onChange={(e) => onSeek(Number(e.target.value))}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Seek"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      ) : null}
    </>
  );

  return (
    <div className={compact ? (barOnly ? "pointer-events-auto relative z-50" : "pointer-events-auto relative z-50") : "relative z-50 bg-bg px-4 pb-2.5 pt-2 [transform:translateZ(0)]"}>
      {compact ? (
        <div className={barOnly ? "relative h-1" : "relative mt-2 h-3"}>
          <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-full bg-white/35">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          {onSeek ? (
            <input
              type="range"
              min={0}
              max={max}
              step={0.25}
              value={Math.min(time, max)}
              onChange={(e) => onSeek(Number(e.target.value))}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Seek"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          ) : null}
        </div>
      ) : (
        <div className="relative h-1 overflow-hidden rounded-full bg-elevated">{bar}</div>
      )}
      {barOnly ? null : (
      <div className={compact ? "flex items-center justify-between gap-3" : "mt-1.5 flex items-center justify-between gap-3"}>
        <p className={compact ? "font-mono text-[11px] tabular-nums text-white" : "font-mono text-[11px] tabular-nums text-muted"}>
          {ytClock(time)}
          {duration ? <span className={compact ? "text-white/70" : "text-subtle"}> / {ytClock(duration)}</span> : null}
        </p>
        {compact || !credit ? null : (
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            <PresentedBy />
          </p>
        )}
      </div>
      )}
    </div>
  );
}
