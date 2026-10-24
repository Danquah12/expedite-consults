import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { FamiliesLesson } from "@/components/learn/FamiliesLesson";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/families")({ component: FamiliesPage });

function FamiliesPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">SP 800-53 · {SOURCE}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Control families, not a thousand-row spreadsheet.</h1>
            <p className="mt-2 text-sm text-muted">
              Tap a family — Study opens Examine. Hub is the map. Study is the enforcement.
            </p>
          </div>
        </header>
        <FamiliesLesson intro={false} />
        <Link to="/hub/nist" className="text-xs font-semibold text-primary">
          NIST Academy
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}