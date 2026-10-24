import { CALDERA_GETTING, CALDERA_GIT, CALDERA_HREF, CALDERA_LAW, CALDERA_PARTS, CALDERA_PLUGINS, CALDERA_STUDENT } from "@/lib/caldera";

export function CalderaLesson() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">MITRE CALDERA</p>
        <h2 className="mt-1 font-display text-xl font-semibold">ATT&CK, automated — on lab VMs you own.</h2>
        <p className="mt-2 text-sm text-muted">
          Caldera is MITRE's adversary-emulation platform: a C2 you run, agents you install, abilities mapped to ATT&CK. We do not host it. You stand it up in the range, then write the detection.
        </p>
        <ul className="mt-3 space-y-2">
          {CALDERA_LAW.map((line) => (
            <li key={line} className="text-sm text-muted">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={CALDERA_HREF} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Docs
          </a>
          <a href={CALDERA_GETTING} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Getting started
          </a>
          <a href={CALDERA_GIT} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            GitHub
          </a>
        </div>
      </header>
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Parts</p>
        <ul className="mt-3 space-y-3">
          {CALDERA_PARTS.map((p) => (
            <li key={p.title}>
              <p className="font-display text-base font-semibold">{p.title}</p>
              <p className="text-sm text-muted">{p.line}</p>
            </li>
          ))}
        </ul>
      </article>
      {CALDERA_PLUGINS.map((p) => (
        <article key={p.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <h3 className="font-display text-lg font-semibold">{p.title}</h3>
          <p className="mt-1 text-sm text-muted">{p.line}</p>
          <a href={p.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Open plugin
          </a>
        </article>
      ))}
      <article className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Artifacts · student vs Study</p>
        <ul className="mt-4 space-y-4">
          {CALDERA_STUDENT.map((row) => (
            <li key={row.id} className="rounded-xl bg-elevated p-4">
              <p className="font-display text-base font-semibold">{row.name}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">Student.</span> <span className="text-muted">{row.student}</span>
              </p>
              <p className="mt-1 text-sm">
                <span className="font-semibold">Study shows.</span> <span className="text-muted">{row.study}</span>
              </p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}