import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NoctisDesk } from "@/components/noctis/NoctisDesk";

export const Route = createFileRoute("/noctis")({ component: NoctisPage });

function NoctisPage() {
  return (
    <AppShell>
      <NoctisDesk />
    </AppShell>
  );
}
