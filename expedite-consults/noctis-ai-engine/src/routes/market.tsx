import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { MarketDesk } from "@/components/market/MarketDesk";

export const Route = createFileRoute("/market")({ component: MarketPage });

function MarketPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <MarketDesk />
      </ClinicFrame>
    </AppShell>
  );
}