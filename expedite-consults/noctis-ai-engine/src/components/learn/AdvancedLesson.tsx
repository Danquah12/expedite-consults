import { Link } from "@tanstack/react-router";
import { ADVANCED_TECHNIQUES } from "@/lib/pentest-desk";

export function AdvancedLesson() {
  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Advanced · classes not payloads</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Name it. Prove it with least force. Stop.</h2>
        <p className="mt-2 text-sm text-muted">
          Memory corruption is a class you recognize via version + SearchSploit — we do not paste shells. 2026 value is identity, SSRF, logic, and escape paths. Range only.
        </p>
      </header>
      {ADVANCED_TECHNIQUES.map((t) => (
        <article key={t.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="font-mono text-[11px] text-primary">
            {t.attck} · {t.owasp}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">{t.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.line}</p>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Student.</span> <span className="text-muted">{t.student}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Study shows.</span> <span className="text-muted">{t.study}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={t.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
            >
              Open at source
            </a>
            <Link
              to="/hub/lab/$id"
              params={{ id: t.labId }}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
            >
              Range
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}