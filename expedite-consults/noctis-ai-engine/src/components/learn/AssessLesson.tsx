import { Link } from "@tanstack/react-router";
import { ASSESS_DEPTH, ASSESS_METHODS, ASSESS_OBJECTS, ASSESS_OUTPUT } from "@/lib/nist-desk";

export function AssessLesson({ compact = false }: { compact?: boolean }) {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">800-53A · assess</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Examine. Interview. Test. Then write the SAR.</h2>
        <p className="mt-2 text-sm text-muted">
          800-53 is the catalog. 800-53B is the baseline. 800-53A is how an assessor proves the control is there. A green scanner is not 53A.
        </p>
      </header>

      <ul className="space-y-2">
        {ASSESS_METHODS.map((m) => (
          <li key={m.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="font-mono text-[11px] text-primary">{m.id}</p>
            <p className="font-display text-base font-semibold">{m.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{m.line}</p>
            {!compact ? <p className="mt-2 text-xs text-subtle">{m.objects}</p> : null}
            <p className="mt-2 text-[11px] font-semibold text-primary">{m.clinic}</p>
          </li>
        ))}
      </ul>

      {!compact ? (
        <>
          <article className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Objects</p>
            <ul className="mt-3 space-y-2">
              {ASSESS_OBJECTS.map((o) => (
                <li key={o.id}>
                  <p className="text-sm font-semibold">{o.title}</p>
                  <p className="text-xs text-muted">{o.line}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Depth and coverage</p>
            <ul className="mt-3 space-y-2">
              {ASSESS_DEPTH.map((d) => (
                <li key={d.id} className="text-sm text-muted">
                  <span className="font-semibold text-fg">{d.title}.</span> {d.line}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl bg-elevated p-5 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">What you produce</p>
            <ul className="mt-3 space-y-2">
              {ASSESS_OUTPUT.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-muted">
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <a
          href="https://csrc.nist.gov/pubs/sp/800/53/a/r5/final"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          Open SP 800-53A
        </a>
        <Link to="/hub/nist/assess" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
          Full lesson
        </Link>
        <Link to="/hub/lab/$id" params={{ id: "ctem" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
          Test on the range
        </Link>
      </div>
    </section>
  );
}