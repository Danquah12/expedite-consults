import { Volume2, VolumeX, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ME } from "@/lib/current-user";
import { GOALS } from "@/lib/learn";
import { SPARK_LIMIT } from "@/lib/engine";
import { useFeedStore } from "@/lib/feed-store";
import { ThemePicker } from "@/components/layout/ThemePicker";
import { LanguageChoices } from "@/components/layout/LanguageMenu";
import { vt } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function SettingsSheet({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const isMuted = useFeedStore((s) => s.isMuted);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const goal = useFeedStore((s) => s.goal);
  const setGoal = useFeedStore((s) => s.setGoal);
  const sparks = useFeedStore((s) => s.sparks);
  const openModal = useFeedStore((s) => s.openModal);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-lg:max-h-[100dvh] max-lg:rounded-none">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            @{ME.username} · {ME.title}. Stamps stay on this hall.
          </DialogDescription>
        </DialogHeader>

        <section>
          <LanguageChoices />
        </section>

        <section className="mt-4">
          <ThemePicker />
        </section>

        <section className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Playback</p>
          <p className="mt-2 rounded-xl bg-elevated px-3 py-2 text-sm leading-relaxed">
            A film starts on its own when it scrolls into view. The one you leave stops.
          </p>
        </section>

        <section className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Sound</p>
          <button
            type="button"
            onClick={() => toggleMute()}
            className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 py-2 text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              Sound on films
            </span>
            <span className="text-xs font-medium text-muted">{isMuted ? "Muted" : "On"}</span>
          </button>
        </section>

        <section className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Notifications</p>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "explain" })}
            className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Explain notification settings
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "explore" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Explore subscription management
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "versus" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Explain subscribe vs follow
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "prefs" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Manage notification preferences
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "algo" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Explore feed algorithms
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "weights" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Explore ranking weights
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "diversity" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Check feed diversity
          </button>
          <button
            type="button"
            onClick={() => openModal({ type: "alerts", page: "spread" })}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm"
          >
            <CornerDownLeft className="size-4 shrink-0 text-muted" />
            Optimize feed diversity
          </button>
        </section>

        <section className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Why you are here</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  goal === g.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {vt(g.label)}
              </button>
            ))}
          </div>
        </section>

        <p className="mt-4 text-xs text-subtle">
          {sparks}/{SPARK_LIMIT} Sparks tonight. Diet follows the goal.
        </p>
      </DialogContent>
    </Dialog>
  );
}
