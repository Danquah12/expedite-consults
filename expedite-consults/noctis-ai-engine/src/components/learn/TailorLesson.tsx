import { Link } from "@tanstack/react-router";
import { RATIONALE_EXAMPLE, RATIONALE_RULES, TAILOR_MOVES } from "@/lib/nist-desk";

export function TailorLesson({ compact = false }: { compact?: boolean }) {
  return (
    <section className="space-y-3">
      {!compact ? (
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Learning step · 800-53B</p>
          <h2 className="mt-1 font-display text-xl font-semibold">The baseline is the start. The rationale is the work.</h2>
          <p className="mt-2 text-sm text-muted">
            Scope, overlay, parameter, compensate, supplement — each needs a sentence the authorizing official can sign. Without it you omitted a control. You did not tailor.
          </p>
        </header>
      ) : null}

      <ul className="space-y-2">
        {TAILOR_MOVES.map((move) => (
          <li key={move.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-mono text-[11px] text-subtle">{move.id}</p>
            <p className="font-display text-base font-semibold">{move.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{move.line}</p>
          </li>
        ))}
      </ul>

      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">A rationale that holds</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          {RATIONALE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </article>

      <article className="rounded-2xl bg-elevated p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Clinic example (hypothetical)</p>
        <p className="mt-3 text-xs font-semibold text-subtle">Not a rationale</p>
        <p className="mt-1 text-sm text-muted">{RATIONALE_EXAMPLE.bad}</p>
        <p className="mt-4 text-xs font-semibold text-primary">A rationale</p>
        <p className="mt-1 text-sm leading-relaxed">{RATIONALE_EXAMPLE.good}</p>
      </article>

      <div className="flex flex-wrap gap-2">
        <a
          href="https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          Open SP 800-53B
        </a>
        <Link to="/hub/nist/tailor" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
          Full lesson
        </Link>
        <Link to="/hub/tool/$id" params={{ id: "grc" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
          Write it in GRC
        </Link>
        <Link to="/hub/lab/$id" params={{ id: "ctem" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
          Prove it in CTEM
        </Link>
      </div>
    </section>
  );
}