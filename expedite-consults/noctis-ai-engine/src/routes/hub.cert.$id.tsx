import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { certPathById } from "@/lib/cert-paths";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/cert/$id")({ component: CertPathPage });

function CertPathPage() {
  const { id } = Route.useParams();
  const path = certPathById(id);

  if (!path) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="p-5 text-sm text-muted">No such path.</p>
          <Link to="/openings" hash="certs" className="px-5 text-xs font-semibold text-primary">
            All certs
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {path.board} · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{path.title}</h1>
          <p className="mt-2 text-sm text-muted">{path.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={path.outlineHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
            >
              Official outline
            </a>
            <a
              href={path.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              Open at {path.board}
            </a>
          </div>
        </header>

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">Exam facts</h2>
          <dl className="mt-3 space-y-2">
            {path.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{f.label}</dt>
                <dd className="text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ol className="space-y-2">
          {path.steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.line}</p>
            </li>
          ))}
        </ol>

        <Link to="/openings" hash="certs" className="text-xs font-semibold text-primary">
          All certs
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
