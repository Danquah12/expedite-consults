import { Link } from "@tanstack/react-router";
import { axiomById } from "@/lib/axiom-clinic";
import { SAST_LAW, SAST_TOOLS, SAST_VENDORS } from "@/lib/sast-tools";

export function SastTools() {
  const axiom = axiomById("sast");
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">SAST · static analysis</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Read the source. Then run AXIOM on the range.</h2>
        <ul className="mt-3 space-y-2">
          {SAST_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        {axiom ? (
          <a
            href={axiom.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            Launch AXIOM SAST
          </a>
        ) : null}
      </header>
      {SAST_TOOLS.map((t) => (
        <article key={t.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">{t.kind}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{t.title}</h3>
          <p className="mt-2 text-sm text-muted">{t.line}</p>
          <p className="mt-1 text-xs text-subtle">{t.when}</p>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Student.</span> <span className="text-muted">{t.student}</span>
          </p>
          <a href={t.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Open docs
          </a>
        </article>
      ))}
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Vendor docs · not our engines</p>
        <ul className="mt-3 space-y-2">
          {SAST_VENDORS.map((v) => (
            <li key={v.href}>
              <a href={v.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                {v.label}
              </a>
            </li>
          ))}
        </ul>
        <Link to="/hub/tool/$id" params={{ id: "sast" }} className="mt-4 inline-flex min-h-11 items-center text-xs font-semibold">
          Full SAST desk
        </Link>
      </article>
    </section>
  );
}