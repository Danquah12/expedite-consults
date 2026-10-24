import { Link } from "@tanstack/react-router";
import { axiomById } from "@/lib/axiom-clinic";
import { OWASP_TEN_HREF, OWASP_TOP10 } from "@/lib/owasp-ten";

export function OwaspTen() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">OWASP Top 10:2025</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Map every web finding here. Then launch the lab.</h2>
        <p className="mt-2 text-sm text-muted">
          Broken access is still #1. Supply chain and exceptional conditions are new. SSRF lives under A01. We link the official pages — we do not copy them.
        </p>
        <a href={OWASP_TEN_HREF} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Open OWASP Top 10
        </a>
      </header>
      {OWASP_TOP10.map((r) => {
        const app = axiomById(r.appId);
        return (
          <article key={r.id} className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="font-mono text-[11px] text-primary">{r.code}</p>
            <h3 className="mt-1 font-display text-lg font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{r.line}</p>
            <p className="mt-3 text-sm">
              <span className="font-semibold">Student.</span> <span className="text-muted">{r.student}</span>
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">Study shows.</span> <span className="text-muted">{r.study}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={r.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
                Manual
              </a>
              {app ? (
                <a
                  href={app.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
                >
                  Launch app
                </a>
              ) : null}
              <Link
                to="/hub/lab/$id"
                params={{ id: r.labId }}
                className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
              >
                Range
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}