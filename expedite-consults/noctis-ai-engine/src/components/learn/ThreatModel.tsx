import { Link } from "@tanstack/react-router";
import { axiomById } from "@/lib/axiom-clinic";
import { STRIDE, THREAT_LAW, THREAT_LIBS, THREAT_STEPS } from "@/lib/threat-model";

export function ThreatModel() {
  const app = axiomById("threat");
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Threat modeling</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Draw the flow. STRIDE the arrow. Then scan.</h2>
        <ul className="mt-3 space-y-2">
          {THREAT_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        {app ? (
          <a
            href={app.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            Launch AXIOM Threat
          </a>
        ) : null}
      </header>
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Four questions</p>
        <ol className="mt-3 space-y-3">
          {THREAT_STEPS.map((s) => (
            <li key={s.n}>
              <p className="font-mono text-[11px] text-primary">{s.n}</p>
              <p className="font-display text-base font-semibold">{s.title}</p>
              <p className="text-sm text-muted">{s.line}</p>
            </li>
          ))}
        </ol>
      </article>
      {STRIDE.map((s) => (
        <article key={s.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">{s.id}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-muted">{s.line}</p>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Student.</span> <span className="text-muted">{s.student}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Study shows.</span> <span className="text-muted">{s.study}</span>
          </p>
          <a href={s.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            STRIDE note
          </a>
        </article>
      ))}
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Manuals</p>
        <ul className="mt-3 space-y-2">
          {THREAT_LIBS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/hub/tool/$id" params={{ id: "threat" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Full desk
          </Link>
          <Link to="/hub/lab/$id" params={{ id: "path" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Attack-path range
          </Link>
        </div>
      </article>
    </section>
  );
}