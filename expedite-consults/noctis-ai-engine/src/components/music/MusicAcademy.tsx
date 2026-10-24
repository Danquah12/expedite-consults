import { useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import { PostCard } from "@/components/feed/PostCard";
import { type AcademyStep, type MusicFamily } from "@/lib/music-academy";
import { SOURCE } from "@/lib/source";
import { cn } from "@/lib/utils";

export function MusicAcademy({
  family,
  step,
  items,
  onStep,
  onListen,
}: {
  family: MusicFamily;
  step: AcademyStep;
  items: FeedPost[];
  onStep: (id: string) => void;
  onListen: (id?: string) => void;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const passed = pick === "a";
  const stepIndex = Math.max(0, family.academy.findIndex((s) => s.id === step.id));
  const film = stepIndex < items.length ? items[stepIndex] : undefined;

  return (
    <article className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
        Music academy · {family.label} · {SOURCE}
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold">{step.label}</h2>
      <p className="mt-1 text-sm text-muted">{step.line}</p>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {family.academy.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setPick(null);
              onStep(s.id);
            }}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
              s.id === step.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {family.academy.map((s, i) => {
          const clip = i < items.length ? items[i] : undefined;
          const open = s.id === step.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setPick(null);
                  onStep(s.id);
                  if (clip) onListen(clip.id);
                }}
                className={cn(
                  "w-full rounded-2xl px-3 py-3 text-left",
                  open ? "bg-elevated" : "bg-bg",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {String(i + 1).padStart(2, "0")} · {s.label}
                </span>
                <span className="mt-1 block text-sm font-semibold">{s.line}</span>
                <span className="mt-1 block text-xs text-muted">{clip ? clip.caption : s.body}</span>
              </button>
              {open && clip ? (
                <div className="mt-2">
                  <PostCard post={clip} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed">{step.body}</p>
      {film ? (
        <button
          type="button"
          onClick={() => onListen(film.id)}
          className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          Listen to this lesson
        </button>
      ) : null}
      <div className="mt-5 rounded-2xl bg-elevated p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Quick check</p>
        <p className="mt-2 text-sm font-semibold">{step.prompt}</p>
        <div className="mt-3 grid gap-2">
          {[
            { id: "a", label: step.ok },
            { id: "b", label: step.wrong[0] },
            { id: "c", label: step.wrong[1] },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPick(opt.id)}
              className={cn(
                "min-h-11 rounded-2xl px-3 text-left text-sm",
                pick === opt.id ? (opt.id === "a" ? "bg-primary text-primary-fg" : "bg-surface text-muted") : "bg-surface text-fg",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {pick ? (
          <p className="mt-3 text-xs text-muted">{passed ? "You heard it. Play the clip again." : "Sit with the form, then try once more."}</p>
        ) : null}
      </div>
    </article>
  );
}