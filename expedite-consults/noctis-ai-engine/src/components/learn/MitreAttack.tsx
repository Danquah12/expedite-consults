import { Link } from "@tanstack/react-router";
import { ATTACK_CLINIC, ATTACK_HREF, ATTACK_LAW, ATTACK_LAYERS, ATTACK_NAV, ATTACK_TACTICS } from "@/lib/mitre-attack";

export function MitreAttack() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">MITRE ATT&CK</p>
        <h2 className="mt-1 font-display text-xl font-semibold">A map. Not a menu.</h2>
        <ul className="mt-3 space-y-2">
          {ATTACK_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={ATTACK_HREF} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Open ATT&CK
          </a>
          <a href={ATTACK_NAV} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Navigator
          </a>
        </div>
      </header>
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Layers</p>
        <ul className="mt-3 space-y-3">
          {ATTACK_LAYERS.map((l) => (
            <li key={l.id}>
              <p className="font-display text-base font-semibold">{l.title}</p>
              <p className="text-sm text-muted">{l.line}</p>
            </li>
          ))}
        </ul>
      </article>
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Enterprise tactics</p>
        <ul className="mt-3 space-y-2">
          {ATTACK_TACTICS.map((t) => (
            <li key={t.id} className="rounded-xl bg-elevated p-3">
              <p className="font-mono text-[11px] text-primary">{t.id}</p>
              <p className="font-semibold">{t.title}</p>
              <p className="text-sm text-muted">{t.line}</p>
            </li>
          ))}
        </ul>
      </article>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Clinic mappings · student vs Study</p>
      {ATTACK_CLINIC.map((c) => (
        <article key={c.tech} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">{c.tech}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{c.title}</h3>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Student.</span> <span className="text-muted">{c.student}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Study shows.</span> <span className="text-muted">{c.study}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={c.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
              Technique
            </a>
            <Link to="/hub/lab/$id" params={{ id: c.labId }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
              Range
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}