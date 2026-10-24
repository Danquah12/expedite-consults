import { ATOMIC_CALDERA, ATOMIC_CLINIC, ATOMIC_FLOW, ATOMIC_GIT, ATOMIC_HREF, ATOMIC_INVOKE, ATOMIC_LAW, ATOMIC_PATHS, ATOMIC_WIKI } from "@/lib/atomic-red";

export function AtomicRed() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Atomic Red Team</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Small tests. Same ATT&CK IDs. Two ways to run them.</h2>
        <ul className="mt-3 space-y-2">
          {ATOMIC_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={ATOMIC_HREF} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            atomicredteam.io
          </a>
          <a href={ATOMIC_GIT} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Atomics
          </a>
          <a href={ATOMIC_INVOKE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Invoke-*
          </a>
          <a href={ATOMIC_CALDERA} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            CALDERA plugin
          </a>
          <a href={ATOMIC_WIKI} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Wiki
          </a>
        </div>
      </header>
      {ATOMIC_PATHS.map((p) => (
        <article key={p.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <h3 className="font-display text-lg font-semibold">{p.title}</h3>
          <p className="mt-2 text-sm text-muted">{p.line}</p>
          <a href={p.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Open
          </a>
        </article>
      ))}
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Integration flow</p>
        <ol className="mt-3 space-y-3">
          {ATOMIC_FLOW.map((s) => (
            <li key={s.n}>
              <p className="font-mono text-[11px] text-primary">{s.n}</p>
              <p className="font-display text-base font-semibold">{s.title}</p>
              <p className="text-sm text-muted">{s.line}</p>
            </li>
          ))}
        </ol>
      </article>
      {ATOMIC_CLINIC.map((c) => (
        <article key={c.tech} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">{c.tech}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{c.title}</h3>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Student.</span> <span className="text-muted">{c.student}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Study shows.</span> <span className="text-muted">{c.study}</span>
          </p>
        </article>
      ))}
    </section>
  );
}