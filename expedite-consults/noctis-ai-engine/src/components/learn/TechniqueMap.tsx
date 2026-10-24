import { Link } from "@tanstack/react-router";
import { ATTACK_NAV } from "@/lib/mitre-attack";
import { CLINIC_MAP, MAP_LAW, MAP_SHEET, MAP_STEPS } from "@/lib/attack-map";

export function TechniqueMap() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Technique mapping</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Evidence → tactic → T-ID → atomic → detect → fix.</h2>
        <ul className="mt-3 space-y-2">
          {MAP_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        <a href={ATTACK_NAV} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
          Layer this in Navigator
        </a>
      </header>
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Method</p>
        <ol className="mt-3 space-y-3">
          {MAP_STEPS.map((s) => (
            <li key={s.n}>
              <p className="font-mono text-[11px] text-primary">{s.n}</p>
              <p className="font-display text-base font-semibold">{s.title}</p>
              <p className="text-sm text-muted">{s.line}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          <span className="font-semibold">Student sheet.</span> <span className="text-muted">{MAP_SHEET.student}</span>
        </p>
      </article>
      {CLINIC_MAP.map((row) => (
        <article key={row.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">
            {row.tech} · {row.tactic}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">{row.title}</h3>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Finding.</span> <span className="text-muted">{row.finding}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Atomic / Caldera.</span> <span className="text-muted">{row.atomic}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Detect.</span> <span className="text-muted">{row.detect}</span>
          </p>
          <p className="mt-1 text-xs text-subtle">
            {row.owasp} · STRIDE {row.stride}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={row.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
              ATT&CK
            </a>
            <Link to="/hub/lab/$id" params={{ id: row.labId }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
              Range
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}