import Pusher from "pusher"

/**
 * ConnectLn real-time call signaling (Pusher Channels).
 * Each verified member listens on `private-ring-<phoneDigits>`; the server pushes
 * `incoming-call` / `call-ended` the instant a call starts or stops.
 * Fully optional: when PUSHER_* env vars are missing, everything falls back to polling.
 */

let cached: Pusher | null | undefined

function env(name: string): string {
  return String(process.env[name] || "").trim()
}

export function getRealtimeConfig(): { enabled: boolean; key: string; cluster: string } {
  const key = env("PUSHER_KEY") || env("PUSHER_APP_KEY")
  const cluster = env("PUSHER_CLUSTER")
  const enabled = Boolean(key && cluster && env("PUSHER_APP_ID") && (env("PUSHER_SECRET") || env("PUSHER_APP_SECRET")))
  return { enabled, key: enabled ? key : "", cluster: enabled ? cluster : "" }
}

export function getRealtimeServer(): Pusher | null {
  if (cached !== undefined) return cached
  const cfg = getRealtimeConfig()
  cached = cfg.enabled
    ? new Pusher({
        appId: env("PUSHER_APP_ID"),
        key: cfg.key,
        secret: env("PUSHER_SECRET") || env("PUSHER_APP_SECRET"),
        cluster: cfg.cluster,
        useTLS: true,
      })
    : null
  return cached
}

export function ringChannelForPhone(phone: string): string {
  const digits = String(phone || "").replace(/[^\d]/g, "")
  return `private-ring-${digits}`
}

export async function publishToPhones(
  phones: Array<string | undefined | null>,
  event: "incoming-call" | "call-ended",
  data: Record<string, unknown>
): Promise<void> {
  const server = getRealtimeServer()
  if (!server) return
  const channels = Array.from(
    new Set(
      phones
        .map((p) => String(p || "").replace(/[^\d]/g, ""))
        .filter((d) => d.length >= 7)
        .map((d) => `private-ring-${d}`)
    )
  )
  if (channels.length === 0) return
  try {
    // Pusher allows up to 100 channels per trigger
    for (let i = 0; i < channels.length; i += 100) {
      await server.trigger(channels.slice(i, i + 100), event, data)
    }
  } catch (err) {
    console.warn("[ConnectLn realtime] publish failed:", (err as any)?.message)
  }
}
