import { useEffect, useState } from "react";
import { RESEARCH_LOOP } from "@/lib/ingest-sources";
import { cn } from "@/lib/utils";

const KEY = "sphera-research-lab";
type Draft = Record<(typeof RESEARCH_LOOP)[number], string>;

function empty(): Draft {
  return Object.fromEntries(RESEARCH_LOOP.map((s) => [s, ""])) as Draft;
}

function read(): Draft {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "");
    return { ...empty(), ...raw };
  } catch {
    return empty();
  }
}

export function ResearchLab() {
  const [step, setStep] = useState<(typeof RESEARCH_LOOP)[number]>("Question");
  const [draft, setDraft] = useState<Draft>(empty);

  useEffect(() => {
    setDraft(read());
  }, []);

  function save(next: Draft) {
    setDraft(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const i = RESEARCH_LOOP.indexOf(step);
  const next = RESEARCH_LOOP[i + 1];
  const prev = RESEARCH_LOOP[i - 1];

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Research lab</p>
      <h2 className="mt-1 font-display text-lg font-semibold">A question, then a paper. Not a playlist.</h2>
      <p className="mt-1 text-sm text-muted">{RESEARCH_LOOP.join(" → ")}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {RESEARCH_LOOP.map((s) => (
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
      <label className="mt-4 block">
        <span className="text-[11px] font-semibold text-muted">{step}</span>
        <textarea
          value={draft[step]}
          onChange={(e) => save({ ...draft, [step]: e.target.value })}
          rows={5}
          placeholder={`Write the ${step.toLowerCase()} here. It stays on this device.`}
          className="mt-2 w-full rounded-xl bg-elevated px-3 py-2 text-sm"
        />
      </label>
      <div className="mt-3 flex gap-2">
        {prev ? (
          <button type="button" onClick={() => setStep(prev)} className="min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold">
            Back
          </button>
        ) : null}
        {next ? (
          <button type="button" onClick={() => setStep(next)} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next · {next}
          </button>
        ) : (
          <p className="self-center text-xs text-muted">Draft is on this device. Then the Research desk on Study.</p>
        )}
      </div>
    </section>
  );
}