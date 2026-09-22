"use client";

import { CampusPortalLayout } from "@/components/campus/CampusPortalLayout";
import { salisburyConfig } from "@/lib/campus-configs";

export default function SalisburyCampusPage() {
  return <CampusPortalLayout config={salisburyConfig} />;
}
