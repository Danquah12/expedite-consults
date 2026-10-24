import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CallsDesk } from "@/components/learn/CallsDesk";

export const Route = createFileRoute("/calls")({
  component: CallsPage,
});

function CallsPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <CallsDesk />
      </ClinicFrame>
    </AppShell>
  );
}
