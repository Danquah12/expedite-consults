"use client";

import { CampusPortalLayout } from "@/components/campus/CampusPortalLayout";
import { umbcConfig } from "@/lib/campus-configs";

export default function UmbcCampusPage() {
  return <CampusPortalLayout config={umbcConfig} />;
}
