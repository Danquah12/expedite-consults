import { RMF_ALSO, RMF_STAGES, STUDY_CYCLE_PLAN, type RmfPub } from "@/lib/nist-desk";

function PubLine({ pub }: { pub: RmfPub }) {
  return (
    <li>
      <a href={pub.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
        {pub.mark === "fips" ? "FIPS" : "SP"} · {pub.code} · {pub.title}
      </a>
      <p className="text-xs leading-relaxed text-muted">{pub.applies}</p>
    </li>
  );
}

export function RmfLesson() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Study plan · RMF cycle</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Every NIST SP that belongs on the cycle is on this desk.</h2>
        <p className="mt-2 text-sm text-muted">
          Core pubs first. Then the rest for that stage. Official links only — we do not copy the documents.
        </p>
      </header>

      <article className="rounded-2xl bg-elevated p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">How Study uses them</p>
        <ol className="mt-3 space-y-2">
          {STUDY_CYCLE_PLAN.map((row) => (
            <li key={row.step} className="text-sm">
              <span className="font-semibold">{row.label}.</span>{" "}
              <span className="text-muted">{row.uses}</span>
            </li>
          ))}
        </ol>
      </article>

      {RMF_STAGES.map((stage) => (
        <article key={stage.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">
            {stage.n} · {stage.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{stage.line}</p>
          <ul className="mt-4 space-y-3">
            {stage.pubs.map((pub) => (
              <PubLine key={pub.code + pub.title} pub={pub} />
            ))}
          </ul>
          {RMF_ALSO[stage.id]?.length ? (
            <>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Also at this stage</p>
              <ul className="mt-2 space-y-2">
                {RMF_ALSO[stage.id]!.map((pub) => (
                  <PubLine key={pub.code + pub.title} pub={pub} />
                ))}
              </ul>
            </>
          ) : null}
        </article>
      ))}
    </section>
  );
}