import { NextRequest, NextResponse } from "next/server";
import {
  COMMERCIAL_DEEP_DIVE_PLUGINS,
  THOUSAND_VULN_PLUGINS,
  THOUSAND_PLUGINS_SUMMARY,
  buildMitreNavigatorLayerJson
} from "@/data/deepDivePlugins";
import { FINDINGS } from "@/data/findings";

export const dynamic = "force-dynamic";

const VALID_SCANNERS = [
  "OPENVAS",
  "ZAP",
  "NUCLEI",
  "BURP",
  "AI_LLM",
  "SECRETS_SBOM",
  "CLOUD_K8S",
  "COMPLIANCE"
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format")?.toLowerCase();
  const scanner = searchParams.get("scanner")?.toUpperCase();
  const tactic = searchParams.get("tactic")?.toUpperCase();
  const d3fend = searchParams.get("d3fend")?.toUpperCase();
  const stage = searchParams.get("stage") ? Number(searchParams.get("stage")) : null;

  if (format === "mitre_navigator") {
    const layer = buildMitreNavigatorLayerJson(FINDINGS, "https://11-dast-security-platform.vercel.app");
    return NextResponse.json(layer);
  }

  let filtered = THOUSAND_VULN_PLUGINS;
  if (scanner && VALID_SCANNERS.includes(scanner)) {
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
