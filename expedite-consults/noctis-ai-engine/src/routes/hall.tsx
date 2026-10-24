import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { HallEngine } from "@/components/learn/HallEngine";

export const Route = createFileRoute("/hall")({ component: HallPage });

function HallPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <HallEngine />
      </ClinicFrame>
    </AppShell>
  );
}