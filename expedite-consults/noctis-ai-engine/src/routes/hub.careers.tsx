import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CAREER_PATHS, ECOSYSTEM } from "@/lib/cyber-careers";
import { RESUME_CLINIC } from "@/lib/openings";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/careers")({ component: CareersPage });

function CareersPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Career paths · {SOURCE}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Four jobs. Three levels each.</h1>
          <p className="mt-2 text-sm text-muted">{ECOSYSTEM.join(" → ")}</p>
        </header>
        <Link to="/hub/fleet" className="block rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-sm font-semibold">Not sure which job yet?</p>
          <p className="mt-1 text-sm text-muted">Sit with the course that matches the work you want. It opens here.</p>
        </Link>
        <a
          href={RESUME_CLINIC.href}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl bg-elevated p-5 shadow-border"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{RESUME_CLINIC.name}</p>
          <h2 className="mt-1 font-display text-lg font-semibold">{RESUME_CLINIC.title}</h2>
          <p className="mt-1 text-sm text-muted">{RESUME_CLINIC.line}</p>
          <p className="mt-2 text-[11px] font-semibold text-primary">Open CareerSuite</p>
        </a>
        <ul className="space-y-3">
          {CAREER_PATHS.map((path) => (
            <li key={path.id}>
              <Link to="/hub/career/$id" params={{ id: path.id }} className="block rounded-2xl bg-surface p-5 shadow-border">
                <h2 className="font-display text-lg font-semibold">{path.title}</h2>
                <p className="mt-1 text-sm text-muted">{path.blurb}</p>
                <p className="mt-2 text-[11px] font-semibold text-primary">
                  Badge · {path.credential} · then {path.job}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/hub/range" className="rounded-2xl bg-elevated p-5 text-sm font-semibold shadow-border">
          Open the cyber range
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
