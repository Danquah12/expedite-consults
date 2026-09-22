"use client";

import { CampusPortalLayout } from "@/components/campus/CampusPortalLayout";
import { umdConfig } from "@/lib/campus-configs";

export default function UmdCampusPage() {
  return <CampusPortalLayout config={umdConfig} />;
}
