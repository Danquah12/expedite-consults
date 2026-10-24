import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { AssessLesson } from "@/components/learn/AssessLesson";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/assess")({ component: AssessPage });

function AssessPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">SP 800-53A · {SOURCE}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">The method is the proof. The scanner is not.</h1>
            <p className="mt-2 text-sm text-muted">
              RMF Assess. SAP → Examine / Interview / Test → SAR → POA&M → AO.
            </p>
          </div>
        </header>
        <AssessLesson />
        <Link to="/hub/nist" className="text-xs font-semibold text-primary">
          NIST Academy
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}