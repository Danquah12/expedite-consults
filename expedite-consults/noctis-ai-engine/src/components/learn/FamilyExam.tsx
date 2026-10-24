import { Link } from "@tanstack/react-router";
import { artifactsFor, examByFamily, familyById } from "@/lib/nist-desk";

export function FamilyExam({ id }: { id: string }) {
  const fam = familyById(id);
  const exam = examByFamily(id);
  const artifacts = artifactsFor(id);
  if (!fam) return <p className="text-sm text-muted">Select a family on this desk.</p>;

  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="font-mono text-[11px] text-primary">{fam.id} · Examine on Study</p>
        <h2 className="mt-1 font-display text-xl font-semibold">{fam.name}</h2>
        <p className="mt-1 text-sm text-muted">{fam.line}</p>
        <p className="mt-2 font-mono text-[10px] text-subtle">{fam.examples}</p>
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
        </>
      ) : (
        <p className="rounded-2xl bg-surface p-5 text-sm text-muted shadow-border">
          Often inherited. Examine the common-control provider. Do not invent a system-specific test.
        </p>
      )}

      {artifacts.length ? (
        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Artifacts · student vs Study</p>
          <p className="mt-2 text-xs text-muted">
            Student column is what you must collect. Study column is the hypothetical clinic-corp example. Not real systems.
          </p>
          <ul className="mt-4 space-y-4">
            {artifacts.map((row) => (
              <li key={row.id} className="rounded-xl bg-elevated p-4">
                <p className="font-mono text-[11px] text-primary">
                  {row.id} · {row.name}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">{row.object}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Student.</span>{" "}
                  <span className="text-muted">{row.student}</span>
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">Study shows.</span>{" "}
                  <span className="text-muted">{row.study}</span>
                </p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {exam ? (
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
          <a href={fam.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Open at NIST
          </a>
        </div>
      ) : null}
    </section>
  );
}