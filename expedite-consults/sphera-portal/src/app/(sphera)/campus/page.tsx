"use client";

import { CampusPortalLayout } from "@/components/campus/CampusPortalLayout";
import { towsonConfig } from "@/lib/campus-configs";

export default function TowsonCampusPage() {
  return <CampusPortalLayout config={towsonConfig} />;
}
