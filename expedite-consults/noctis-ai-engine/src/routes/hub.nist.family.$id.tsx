import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { examByFamily, familyById } from "@/lib/nist-desk";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/family/$id")({ component: FamilyPage });

function FamilyPage() {
  const { id } = Route.useParams();
  const fam = familyById(id);
  const exam = examByFamily(id);

  if (!fam) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="p-5 text-sm text-muted">No such family.</p>
          <Link to="/hub/nist/families" className="text-xs font-semibold text-primary">
            All families
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {fam.id} · Examine · {SOURCE}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">{fam.name}</h1>
            <p className="mt-2 text-sm text-muted">{fam.line}</p>
            <p className="mt-2 font-mono text-xs text-subtle">{fam.examples}</p>
          </div>
        </header>

        {exam ? (
          <>
            <article className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Examine</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {exam.examine.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Interview</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{exam.interview}</p>
            </article>
            <article className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Test (range only)</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{exam.test}</p>
            </article>
            <div className="flex flex-wrap gap-2">
              {exam.labId ? (
                <Link
                  to="/hub/lab/$id"
                  params={{ id: exam.labId }}
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
                >
                  Range lab
                </Link>
              ) : null}
              {exam.toolId ? (
                <Link
                  to="/hub/tool/$id"
                  params={{ id: exam.toolId }}
                  className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
                >
                  AXIOM desk
                </Link>
              ) : null}
              <a
                href={fam.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
              >
                Open at NIST
              </a>
            </div>
          </>
        ) : (
          <article className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="text-sm text-muted">
              Often inherited (physical, media, personnel). Examine the common-control provider’s package. Do not invent a system-specific test.
            </p>
            <a href={fam.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
              Open at NIST
            </a>
          </article>
        )}

        <Link
          to="/study"
          search={{ desk: "nist", family: fam.id, step: "examine" }}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
        >
          Enforce on Study
        </Link>
        <Link to="/hub/nist/families" className="text-xs font-semibold text-primary">
          All families
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}