import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GOV_LOOP, NEWS_LOOP } from "@/lib/ingest-sources";
import { GOV_PATHS, NEWS_EVENTS } from "@/lib/gov-news";
import { cn } from "@/lib/utils";

export function GovAcademy() {
  const [id, setId] = useState<(typeof GOV_PATHS)[number]["id"]>("rmf");
  const [step, setStep] = useState<(typeof GOV_LOOP)[number]>("Framework");
  const [pick, setPick] = useState<string | null>(null);
  const path = GOV_PATHS.find((p) => p.id === id)!;

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Government academy</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Frameworks as a path. Not a PDF dump.</h2>
      <p className="mt-1 text-sm text-muted">{GOV_LOOP.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {GOV_PATHS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setId(p.id);
              setPick(null);
              setStep("Framework");
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              id === p.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {GOV_LOOP.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              step === s ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm">{path.card}</p>
      <p className="mt-2 text-xs text-subtle">Step in view: {step}</p>
      <div className="mt-3 space-y-2">
        <p className="text-sm font-semibold">{path.prompt}</p>
        {[path.ok, path.no].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setPick(label)}
            className={cn(
              "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
              pick === label ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {label}
          </button>
        ))}
        {pick ? (
          <p className="text-sm text-muted">{pick === path.ok ? "That is the control language." : "Read the step names again."}</p>
        ) : null}
      </div>
      {path.href.startsWith("http") ? (
        <a href={path.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Official source
        </a>
      ) : (
        <Link to="/hub/nist" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open NIST Academy
        </Link>
      )}
    </section>
  );
}

export function NewsLearn() {
  const [id, setId] = useState<(typeof NEWS_EVENTS)[number]["id"]>("artemis");
  const [step, setStep] = useState<(typeof NEWS_LOOP)[number]>("What happened");
  const [pick, setPick] = useState<string | null>(null);
  const ev = NEWS_EVENTS.find((e) => e.id === id)!;
  const copy: Record<(typeof NEWS_LOOP)[number], string> = {
    "What happened": ev.happened,
    "Why it matters": ev.why,
    Background: ev.background,
    Expert: ev.expert,
    Course: `${ev.course} hall is next.`,
    Quiz: ev.prompt,
  };

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">News → learning</p>
      <h2 className="mt-1 font-display text-lg font-semibold">An event becomes a lesson.</h2>
      <p className="mt-1 text-sm text-muted">{NEWS_LOOP.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {NEWS_EVENTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setId(e.id);
              setStep("What happened");
              setPick(null);
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              id === e.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {e.course}
          </button>
        ))}
      </div>
      <p className="mt-4 font-display text-base font-semibold leading-snug">{ev.headline}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {NEWS_LOOP.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              step === s ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm">{copy[step]}</p>
      {step === "Quiz" ? (
        <div className="mt-3 space-y-2">
          {[ev.ok, ev.no].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setPick(label)}
              className={cn(
                "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
                pick === label ? "bg-primary text-primary-fg" : "bg-elevated",
              )}
            >
              {label}
            </button>
          ))}
          {pick ? (
            <p className="text-sm text-muted">{pick === ev.ok ? "Then take the course." : "Read Why it matters again."}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}