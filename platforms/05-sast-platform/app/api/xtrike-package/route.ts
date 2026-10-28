import { NextResponse } from "next/server";
import { XTRIKE_DISTRO_ACCORDION_GROUPS, XTRIKE_CLI_RUNTIME_SPEC } from "@/lib/cyber-monitoring-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pkgName = searchParams.get("pkg") || "xtrike-sast-cli_4.2.0_amd64.deb";

  const allPackages = XTRIKE_DISTRO_ACCORDION_GROUPS.flatMap((g) => g.packages);
  const matched =
    allPackages.find((p) => p.packageFilename.toLowerCase() === pkgName.toLowerCase()) ||
    allPackages[0];

  const installerScript = [
    `#!/usr/bin/env bash`,
    `# ==============================================================================`,
    `# XTRIKE SAST Hybrid AST/DFG CLI & Proof Runner Bundle`,
    `# Package:      ${matched.packageFilename}`,
    `# Target OS:    ${matched.distroFamily} (${matched.distroVersion} · ${matched.codename})`,
    `# Architecture: ${matched.architecture}`,
    `# Edition:      XTRIKE SAST ${matched.edition} v${XTRIKE_CLI_RUNTIME_SPEC.version}`,
    `# SHA-256:      ${matched.sha256}`,
    `# ==============================================================================`,
    `set -euo pipefail`,
    ``,
    `echo "[XTRIKE-SAST] Verifying SHA-256 signature (${matched.sha256})..."`,
    `echo "[XTRIKE-SAST] Installing ${matched.packageFilename}..."`,
    `echo "XTRIKE SAST Hybrid Engine Version ${XTRIKE_CLI_RUNTIME_SPEC.version} (401 CWE Plugins)"`,
    ``,
    `# Initialize PTES / NIST 800-115 Proof Profile:`,
    `#   xtrike-sast init --profile ${XTRIKE_CLI_RUNTIME_SPEC.profileName}`,
    `#   xtrike-sast daemon start --engines xql,deepflow,structsca,ast-query`,
    `#`,
    `# Active XTRIKE SAST Daemons:`,
    ...XTRIKE_CLI_RUNTIME_SPEC.daemons.map((d) => `#   Starting ${d.name} (${d.role})...${d.status}`),
    `#`,
    `# XTRIKE SAST Desk URL:  ${XTRIKE_CLI_RUNTIME_SPEC.webUiUrl}`,
    `# Noctis AI API Bridge:  ${XTRIKE_CLI_RUNTIME_SPEC.noctisBridgeUrl}`,
    ``,
  ].join("\n");

  return new NextResponse(installerScript, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${matched.packageFilename}"`,
      "X-Xtrike-Package-Sha256": matched.sha256,
      "X-Xtrike-Cli-Version": XTRIKE_CLI_RUNTIME_SPEC.version,
    },
  });
}
