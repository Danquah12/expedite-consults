import React from "react";
import type { Metadata } from "next";
import EcosystemLaunchpad from "@/components/launchpad/EcosystemLaunchpad";

export const metadata: Metadata = {
  title: "Digital Ecosystem Hub | Expedite Consults",
  description:
    "Unified Digital Ecosystem index of all 32 platforms, microservices, portals, and Vercel production deployments.",
};

export default function EcosystemPage() {
  return <EcosystemLaunchpad />;
}
