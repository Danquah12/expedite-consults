import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { TailorLesson } from "@/components/learn/TailorLesson";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/tailor")({ component: TailorPage });

function TailorPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              SP 800-53B · {SOURCE}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">The baseline is the start. The rationale is the work.</h1>
            <p className="mt-2 text-sm text-muted">
              This is a required step on the GRC track — after CSF, before the CTEM lab.
            </p>
          </div>
        </header>
        <TailorLesson />
        <Link to="/hub/nist" className="text-xs font-semibold text-primary">
          NIST Academy
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}