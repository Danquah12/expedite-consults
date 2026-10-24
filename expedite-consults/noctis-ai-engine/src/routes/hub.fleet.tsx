import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { FleetAcademy } from "@/components/learn/FleetAcademy";

export const Route = createFileRoute("/hub/fleet")({ component: FleetPage });

function FleetPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <FleetAcademy />
        <Link to="/hub" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
          Back
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
