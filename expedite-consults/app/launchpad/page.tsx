import React from "react";
import type { Metadata } from "next";
import EcosystemLaunchpad from "@/components/launchpad/EcosystemLaunchpad";

export const metadata: Metadata = {
  title: "Digital Ecosystem Launchpad | Expedite Consults",
  description:
    "Central orchestration launchpad for 32 enterprise platforms, autonomous cyber defense loops (Pillars 05-19), Sphera Studio, ConnectIn OS, CampusSync, and cloud deployments.",
};

export default function LaunchpadPage() {
  return <EcosystemLaunchpad />;
}
