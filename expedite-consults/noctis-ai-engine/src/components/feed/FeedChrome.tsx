import { Clapperboard, LayoutGrid, Radio, Rows3 } from "lucide-react";
import { useState } from "react";
import { useFeedStore, type FeedMode, type Surface, type ViewStyle } from "@/lib/feed-store";
import { IntentRail } from "@/components/feed/IntentRail";
import { SourcesSheet } from "@/components/feed/SourcesSheet";
import { cn } from "@/lib/utils";

const MODES: { id: FeedMode; label: string }[] = [
  { id: "MIX", label: "Mix" },
  { id: "CREWS", label: "Crews" },
  { id: "DROPS", label: "Drops" },
];

const SURFACES: { id: Surface; label: string; icon: typeof Rows3 }[] = [
  { id: "feed", label: "Feed", icon: Rows3 },
  { id: "takes", label: "Takes", icon: LayoutGrid },
  { id: "board", label: "Board", icon: Clapperboard },
];

export function FeedChrome() {
  const feedMode = useFeedStore((s) => s.feedMode);
  const setFeedMode = useFeedStore((s) => s.setFeedMode);
  const surface = useFeedStore((s) => s.surface);
  const setSurface = useFeedStore((s) => s.setSurface);
  const viewStyle = useFeedStore((s) => s.viewStyle);
  const setViewStyle = useFeedStore((s) => s.setViewStyle);
  const [sources, setSources] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Path</p>
        <IntentRail />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="w-full text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:w-auto sm:pr-1">Watch</p>
        <div className="flex min-w-0 flex-1 rounded-full bg-elevated p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setFeedMode(m.id)}
              className={cn(
                "min-h-9 flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold",
                feedMode === m.id ? "bg-surface text-fg shadow-border" : "text-muted",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-1">
            {SURFACES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  onClick={() => setSurface(s.id)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold",
                    surface === s.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        <button
          type="button"
          onClick={() => setSources(true)}
          className="min-h-9 shrink-0 rounded-full bg-elevated px-2.5 text-[11px] font-semibold"
        >
          Sources
        </button>
        <button
          type="button"
          aria-label="Theater"
          onClick={() => setViewStyle(viewStyle === "theater" ? ("stream" as ViewStyle) : "theater")}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            viewStyle === "theater" ? "bg-elevated text-fg" : "text-subtle",
          )}
        >
          <Radio className="size-4" />
        </button>
      </div>
      <SourcesSheet open={sources} onClose={() => setSources(false)} />
    </div>
  );
}
