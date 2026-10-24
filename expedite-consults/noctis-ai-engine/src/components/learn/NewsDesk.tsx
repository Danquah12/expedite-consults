import { useState } from "react";
import { CornerDownRight, ScanSearch } from "lucide-react";
import { NEWS_LESSONS, VERITAS_CLIPS, VERITAS_LENS_HREF } from "@/lib/news-desk";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { SOURCE } from "@/lib/source";
import { cn } from "@/lib/utils";

function tone(truth: number) {
  if (truth >= 70) return "text-primary";
  if (truth >= 45) return "text-fg";
  return "text-muted";
}

export function NewsDesk() {
  const [open, setOpen] = useState(NEWS_LESSONS[0]!.id);
  const [clip, setClip] = useState(VERITAS_CLIPS[0]!.id);
  const current = VERITAS_CLIPS.find((item) => item.id === clip) ?? VERITAS_CLIPS[0]!;

  return (
    <section className="space-y-3">
      <article className="rounded-2xl bg-surface p-4 shadow-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">News · VeritasLens · {SOURCE}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Evaluate the attached news media.</h2>
            <p className="mt-1 text-sm text-muted">
              Claim verification and media credibility for the broadcasts on the studio. A score is a studio read, not a verdict.
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-elevated text-primary">
            <ScanSearch className="size-4" />
          </span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {VERITAS_CLIPS.map((item) => {
            const on = item.id === current.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setClip(item.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left",
                    on ? "bg-elevated" : "hover:bg-elevated/70",
                  )}
                >
                  <span className={cn("w-10 shrink-0 text-sm font-semibold tabular-nums", tone(item.truth))}>{item.truth}%</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                    <span className="block truncate text-[11px] text-muted">
                      {item.desk} · {item.speaker}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">{current.note}</p>
        <a
          href={VERITAS_LENS_HREF}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          Open VeritasLens
        </a>
      </article>
      <article className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Study the briefing</p>
        <p className="mt-1 text-sm text-muted">The clip plays on Clinic. Score it here, then study the method.</p>
        <ul className="mt-3 space-y-1">
          {NEWS_LESSONS.map((lesson) => {
            const on = open === lesson.id;
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setOpen(lesson.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm font-semibold",
                    on ? "bg-elevated text-fg" : "text-muted",
                  )}
                >
                  <CornerDownRight className="size-4 shrink-0 text-primary" />
                  {lesson.label}
                </button>
                {on ? (
                  <div className="px-8 pb-2">
                    <p className="text-sm text-muted">{lesson.line}</p>
                    <ol className="mt-2 space-y-1">
                      {lesson.steps.map((step) => (
                        <li key={step} className="text-xs text-muted">
                          {step}
                        </li>
                      ))}
                    </ol>
                    <StudyLinks title="Open the tool" links={lesson.links} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
