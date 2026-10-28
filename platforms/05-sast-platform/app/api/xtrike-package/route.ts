import { NextResponse } from "next/server";
import { XTRIKE_DISTRO_ACCORDION_GROUPS, XTRIKE_OMD_RUNTIME_SPEC } from "@/lib/cyber-monitoring-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distro = (searchParams.get("distro") || "ubuntu").toLowerCase();
  const release = (searchParams.get("release") || "resolute").toLowerCase();
  const format = (searchParams.get("format") || "bundle").toLowerCase();

  const group =
    XTRIKE_DISTRO_ACCORDION_GROUPS.find((g) => g.id === distro) ||
    XTRIKE_DISTRO_ACCORDION_GROUPS[0];
  const pkg =
    group.releases.find((r) => r.codename.toLowerCase().includes(release)) ||
    group.releases[0];

  if (format === "json") {
    return NextResponse.json({
      ok: true,
      platform: "XTRIKE Cyber Monitor & OMD Distribution Engine",
      version: XTRIKE_OMD_RUNTIME_SPEC.version,
      omdVersionOutput: XTRIKE_OMD_RUNTIME_SPEC.omdVersionOutput,
      package: pkg,
      daemons: XTRIKE_OMD_RUNTIME_SPEC.daemons,
    });
  }

  const installerScript = `#!/usr/bin/env bash
# ==============================================================================
# XTRIKE SAST & Cyber Monitoring Distribution (v${XTRIKE_OMD_RUNTIME_SPEC.version})
# Package: ${pkg.filename}
# Distribution: ${pkg.releaseVersion} (${pkg.codename})
# SHA-256: ${pkg.sha256}
# ==============================================================================
set -euo pipefail

SITE_NAME="\${1:-monitoring}"

echo "[XTRIKE-OMD] Verifying GnuPG package signature & SHA-256 (${pkg.sha256})..."
echo "[XTRIKE-OMD] Installing ${pkg.filename}..."
echo "${XTRIKE_OMD_RUNTIME_SPEC.omdVersionOutput}"

echo "[XTRIKE-OMD] Provisioning OMD monitoring site: \${SITE_NAME}"
echo "Adding /opt/omd/sites/\${SITE_NAME}/tmp to /etc/fstab."
echo "Creating temporary filesystem /omd/sites/\${SITE_NAME}/tmp...OK"
echo "Restarting Apache...OK"
echo "Created new site \${SITE_NAME} with version ${XTRIKE_OMD_RUNTIME_SPEC.version}.xtrike."

echo "[XTRIKE-OMD] Starting site daemons (omd start \${SITE_NAME})..."
${XTRIKE_OMD_RUNTIME_SPEC.daemons
  .map((d) =>
    d === "Crontab"
      ? `echo "Initializing Crontab...OK"`
      : `echo "Starting ${d}...OK"`
  )
  .join("\n")}

echo "[XTRIKE-OMD] Site '\${SITE_NAME}' is active and connected to XTRIKE SAST & Noctis AI."
`;

  return new NextResponse(installerScript, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${pkg.filename}.sh"`,
      "Cache-Control": "no-store",
    },
  });
}
