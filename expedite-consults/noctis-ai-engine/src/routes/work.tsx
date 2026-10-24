import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { WorkDesk } from "@/components/work/WorkDesk";

export const Route = createFileRoute("/work")({ component: WorkPage });

function WorkPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 pb-24 sm:px-6 md:py-6 md:pb-10">
          <WorkDesk />
        </div>
      </ClinicFrame>
    </AppShell>
  );
}
