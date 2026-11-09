"use client";

import ExpediteCheckObservabilityHub from "@/components/ExpediteCheckObservabilityHub";

export default function ObservabilityPage() {
  return (
    <ExpediteCheckObservabilityHub
      scanId={53}
      assetsCount={15}
      endpointsCount={379}
      rawObservationsCount={186}
      consolidatedFindingsCount={19}
      validatedExploitsCount={2}
      rtexVerifiedCount={2}
      riskT0={7.7}
      riskT1={2.6}
      onOpenSecurityConsole={() => {
        window.open("https://trepath-2-0.vercel.app", "_blank", "noopener,noreferrer");
      }}
      onTriggerDemoScan={() => {
        window.open("https://trepath-2-0.vercel.app", "_blank", "noopener,noreferrer");
      }}
    />
  );
}
