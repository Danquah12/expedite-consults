import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CANDIDATE_LOCAL_PORTS = [8001, 8002, 8003, 8000];

function sanitizeRelativeFile(raw: string): string {
  const cleaned = raw
    .replace(/^\/+/, "")
    .replace(/^scripts\/+/i, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._\-/]/g, "");
  return cleaned || "manifest.json";
}

function getContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".ts") || lower.endsWith(".js") || lower.endsWith(".py")) {
    return "text/plain; charset=utf-8";
  }
  return "text/plain; charset=utf-8";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rawFile =
    url.searchParams.get("file") ||
    url.searchParams.get("path") ||
    url.searchParams.get("lab") ||
    "manifest.json";
  const preferredPortParam = Number(url.searchParams.get("port") || "8001");
  const safeFile = sanitizeRelativeFile(rawFile);

  const portsToTry = [
    ...(preferredPortParam >= 8000 && preferredPortParam <= 8003 ? [preferredPortParam] : []),
    ...CANDIDATE_LOCAL_PORTS.filter((p) => p !== preferredPortParam)
  ];

  const portProbeResults: Array<{ port: number; status: string; note: string }> = [];

  // Mode 2 & 3: Attempt to proxy to local static server on ports 8001..8003 (and 8000 if not Splunk)
  for (const port of portsToTry) {
    const targetLocalUrl = `http://127.0.0.1:${port}/${safeFile}`;
    try {
      const res = await fetch(targetLocalUrl, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(900)
      });

      const serverHdr = (res.headers.get("server") || "").toLowerCase();
      const locationHdr = res.headers.get("location") || "";
      const isSplunkRedirect =
        port === 8000 &&
        (serverHdr.includes("splunk") ||
          locationHdr.includes("/en-US") ||
          res.status === 303);

      if (isSplunkRedirect) {
        portProbeResults.push({
          port,
          status: `HTTP ${res.status}`,
          note: "Occupied by Splunk Web (splunkd.exe) — skipped in favor of lab static server"
        });
        continue;
      }

      if (res.ok) {
        const bodyText = await res.text();
        return new NextResponse(bodyText, {
          status: 200,
          headers: {
            "Content-Type": getContentType(safeFile),
            "X-TrePath-Proxy-Mode": `local-static-server-port-${port}`,
            "X-TrePath-Upstream": targetLocalUrl,
            "Cache-Control": "no-store"
          }
        });
      }

      portProbeResults.push({
        port,
        status: `HTTP ${res.status}`,
        note: "Reachable but file not returned with 200 OK"
      });
    } catch {
      portProbeResults.push({
        port,
        status: "CLOSED_OR_UNREACHABLE",
        note: `No local HTTP listener on 127.0.0.1:${port}`
      });
    }
  }

  // Mode 1 Fallback: Serve directly from bundled Vercel static directory (public/scripts/)
  const publicScriptsDir = path.join(process.cwd(), "public", "scripts");
  const candidatePath = path.join(publicScriptsDir, safeFile);

  if (
    candidatePath.startsWith(publicScriptsDir) &&
    fs.existsSync(candidatePath) &&
    fs.statSync(candidatePath).isFile()
  ) {
    const content = fs.readFileSync(candidatePath, "utf-8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": getContentType(safeFile),
        "X-TrePath-Proxy-Mode": "vercel-bundled-public-scripts",
        "X-TrePath-Static-Url": `/scripts/${safeFile}`,
        "Cache-Control": "public, max-age=60"
      }
    });
  }

  // Return structured diagnostic JSON if a non-existent file was requested
  const availableFiles = fs.existsSync(publicScriptsDir)
    ? fs.readdirSync(publicScriptsDir)
    : [];

  return NextResponse.json(
    {
      platform: "TrePath™ Unified Lab Proxy (/api/proxy)",
      requestedFile: safeFile,
      resolved: false,
      portDiagnostics8000To8003: portProbeResults,
      availableBundledFiles: availableFiles,
      usageExamples: [
        "/api/proxy?file=manifest.json",
        "/api/proxy?file=index.html&port=8001",
        "/api/proxy?file=vulnerabilityScriptMap.ts",
        "/scripts/index.html"
      ]
    },
    { status: 404 }
  );
}
