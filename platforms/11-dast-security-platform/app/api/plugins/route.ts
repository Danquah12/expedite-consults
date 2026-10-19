import { NextRequest, NextResponse } from "next/server";
import {
  COMMERCIAL_DEEP_DIVE_PLUGINS,
  THOUSAND_VULN_PLUGINS,
  THOUSAND_PLUGINS_SUMMARY
} from "@/data/deepDivePlugins";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scanner = searchParams.get("scanner")?.toUpperCase();
  const tactic = searchParams.get("tactic")?.toUpperCase();
  const d3fend = searchParams.get("d3fend")?.toUpperCase();
  const stage = searchParams.get("stage") ? Number(searchParams.get("stage")) : null;

  let filtered = THOUSAND_VULN_PLUGINS;
  if (scanner && ["OPENVAS", "ZAP", "NUCLEI", "BURP"].includes(scanner)) {
    filtered = filtered.filter((p) => p.scannerFamily === scanner);
  }
  if (tactic) {
    filtered = filtered.filter((p) => p.mitreTtp.tacticId === tactic);
  }
  if (d3fend) {
    filtered = filtered.filter((p) => p.blueTeamDefense.d3fendId === d3fend);
  }
  if (stage) {
    filtered = filtered.filter((p) => p.brainStage === stage);
  }

  return NextResponse.json({
    status: "ok",
    totalPlugins: THOUSAND_VULN_PLUGINS.length,
    filteredCount: filtered.length,
    coreOrchestratorPlugins: COMMERCIAL_DEEP_DIVE_PLUGINS.length,
    totalEstimatedMinutes1HrMode: 60,
    stagesCovered: 8,
    summary: THOUSAND_PLUGINS_SUMMARY,
    plugins: filtered,
    timestamp: new Date().toISOString()
  });
}
