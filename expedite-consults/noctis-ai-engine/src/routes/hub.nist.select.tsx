import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { SELECT_STEPS } from "@/lib/nist-desk";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/select")({ component: SelectPage });

function SelectPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              SP 800-53 · {SOURCE}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">You do not implement the catalog. You select from it.</h1>
            <p className="mt-2 text-sm text-muted">
              Categorize → baseline (800-53B) → overlay → tailor → allocate → SSP → assess (800-53A).
            </p>
          </div>
        </header>

        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Three books, one job</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-semibold text-fg">800-53</span> — what controls exist (AC, AU, IA, SC…).
            </li>
            <li>
              <span className="font-semibold text-fg">800-53B</span> — the Low / Moderate / High / Privacy starting set.
            </li>
            <li>
              <span className="font-semibold text-fg">800-53A</span> — how an assessor tests what you selected.
            </li>
          </ul>
        </article>

        <ol className="space-y-3">
          {SELECT_STEPS.map((step) => (
            <li key={step.n} className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="font-mono text-[11px] text-subtle">{step.n}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              <a href={step.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                {step.label}
              </a>
            </li>
          ))}
        </ol>

        <p className="text-xs text-subtle">
          National security systems often use CNSSI 1253 instead of the high-water mark — CIA can be mixed. FedRAMP is an overlay on this same spine, not a different catalog.
        </p>

        <div className="flex flex-wrap gap-2">
          <Link to="/hub/nist/tailor" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            800-53B tailoring rationale
          </Link>
          <Link to="/hub/nist" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            NIST Academy
          </Link>
          <Link
            to="/hub/track/$id"
            params={{ id: "grc" }}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            GRC track
          </Link>
        </div>
      </ClinicFrame>
    </AppShell>
  );
}