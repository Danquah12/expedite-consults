"use client";

import { CampusPortalLayout } from "@/components/campus/CampusPortalLayout";
import { hopkinsConfig } from "@/lib/campus-configs";

export default function HopkinsCampusPage() {
  return <CampusPortalLayout config={hopkinsConfig} />;
}
