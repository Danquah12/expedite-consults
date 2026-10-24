import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CareerNavigator } from "@/components/openings/CareerNavigator";
import { WorkDesk } from "@/components/work/WorkDesk";

export const Route = createFileRoute("/openings")({ component: OpeningsPage });

function OpeningsPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 pb-10 sm:px-6 md:py-6">
          <WorkDesk />
        </div>
        <CareerNavigator />
      </ClinicFrame>
    </AppShell>
  );
}
