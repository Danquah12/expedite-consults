/**
 * Noctis Standalone Engine <-> Noctis.social API Bridge
 *
 * Allows Noctis AI (`https://noctis-ai.vercel.app`, repo `Danquah12/noctis-ai`)
 * and Noctis.social (`https://www.noctis.social`) to run as completely independent
 * standalone applications while linking Noctis.social to the standalone Noctis Engine API
 * to answer queries across Ask Noctis, Learn with Noctis, and the Noctis Desk.
 */

export const NOCTIS_STANDALONE_ENGINE_ORIGIN =
  process.env.NOCTIS_ENGINE_ORIGIN || "https://noctis-ai-engine.vercel.app";

export const NOCTIS_SOCIAL_PLATFORM_ORIGIN =
  process.env.NOCTIS_SOCIAL_ORIGIN || "https://www.noctis.social";

export function isStandaloneNoctisEngineHost(hostOrUrl: string): boolean {
  if (process.env.NOCTIS_STANDALONE_ROLE === "engine") return true;
  const clean = (hostOrUrl || "").toLowerCase();
  return clean.includes("noctis-ai") || clean.includes("noctis-engine");
}

export function getNoctisCorsAndBridgeHeaders(
  mode: "standalone-engine-direct" | "social-gateway-forwarded" | "social-local-fallback"
): Record<string, string> {
  return {
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers":
      "Content-Type, Authorization, X-Noctis-Source, X-Noctis-Bridge-Hop",
    "x-noctis-engine-origin": NOCTIS_STANDALONE_ENGINE_ORIGIN,
    "x-noctis-social-origin": NOCTIS_SOCIAL_PLATFORM_ORIGIN,
    "x-noctis-bridge-mode": mode,
  };
}

/**
 * When a query arrives at `https://www.noctis.social/api/noctis`, forwards it over HTTPS
 * to the standalone Noctis AI Engine (`https://noctis-ai.vercel.app/api/noctis`).
 * If the standalone engine is already the current host (or if this is already a forwarded hop),
 * returns `null` so the standalone engine executes the query directly.
 */
export async function forwardPostToStandaloneNoctisEngine(
  request: Request,
  body: unknown
): Promise<Response | null> {
  const url = new URL(request.url);
  const hop = request.headers.get("x-noctis-bridge-hop");

  // Do not forward if we are already on the standalone engine host, on localhost dev, or already hopped
  if (
    hop === "1" ||
    isStandaloneNoctisEngineHost(url.hostname) ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  ) {
    return null;
  }

  const targetEndpoint = `${NOCTIS_STANDALONE_ENGINE_ORIGIN}/api/noctis`;
  const startedAt = Date.now();

  try {
    const upstreamRes = await fetch(targetEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noctis-Source": NOCTIS_SOCIAL_PLATFORM_ORIGIN,
        "X-Noctis-Bridge-Hop": "1",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });

    if (!upstreamRes.ok) {
      return null;
    }

    const data = (await upstreamRes.json()) as Record<string, unknown>;
    const latencyMs = Date.now() - startedAt;

    return Response.json(
      {
        ...data,
        engine_origin: NOCTIS_STANDALONE_ENGINE_ORIGIN,
        answered_via: "noctis-ai-standalone-api",
        bridge_latency_ms: latencyMs,
      },
      {
        status: upstreamRes.status,
        headers: getNoctisCorsAndBridgeHeaders("social-gateway-forwarded"),
      }
    );
  } catch {
    // Graceful failover to local engine if remote standalone is unreachable
    return null;
  }
}

export async function getNoctisStandaloneBridgeStatus(request: Request) {
  const url = new URL(request.url);
  const currentHostIsEngine = isStandaloneNoctisEngineHost(url.hostname);
  const startedAt = Date.now();
  let remoteEngineReachable = false;
  let remoteEngineHealthStatus = "UNKNOWN";

  try {
    const res = await fetch(`${NOCTIS_STANDALONE_ENGINE_ORIGIN}/api/noctis?pde=health`, {
      headers: { "X-Noctis-Bridge-Hop": "1" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = (await res.json()) as { status?: string };
      remoteEngineReachable = true;
      remoteEngineHealthStatus = json.status || "HEALTHY";
    }
  } catch {
    remoteEngineReachable = false;
  }

  return {
    architecture: "STANDALONE_DECOUPLED_API_BRIDGE",
    currentDeploymentRole: currentHostIsEngine
      ? "STANDALONE_NOCTIS_AI_ENGINE"
      : "STANDALONE_NOCTIS_SOCIAL_PLATFORM",
    currentHost: url.origin,
    standaloneNoctisEngine: {
      url: NOCTIS_STANDALONE_ENGINE_ORIGIN,
      apiEndpoint: `${NOCTIS_STANDALONE_ENGINE_ORIGIN}/api/noctis`,
      githubRepository: "https://github.com/Danquah12/noctis-ai",
      reachable: remoteEngineReachable,
      engineHealth: remoteEngineHealthStatus,
      pingLatencyMs: Date.now() - startedAt,
    },
    standaloneNoctisSocial: {
      url: NOCTIS_SOCIAL_PLATFORM_ORIGIN,
      apiGatewayProxy: `${NOCTIS_SOCIAL_PLATFORM_ORIGIN}/api/noctis`,
      githubRepository: "https://github.com/Danquah12/back-vibtook-3",
      connectedToStandaloneEngine: true,
      failoverMode: "AUTOMATIC_LOCAL_FAILOVER_IF_REMOTE_UNREACHABLE",
    },
  };
}
