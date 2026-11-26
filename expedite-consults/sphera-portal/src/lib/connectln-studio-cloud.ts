import type { StudioCloudModuleName } from "@/app/api/connectin/studio-state/route"

export interface StudioCloudUserLike {
  email?: string
  id?: string
  name?: string
}

export function getStudioUserKey(user?: StudioCloudUserLike | null): string {
  const email = (user?.email || "").trim().toLowerCase()
  const id = (user?.id || "").trim().toLowerCase()
  const name = (user?.name || "").trim().toLowerCase()
  return email || id || name || "guest"
}

const MODULE_LOCAL_PREFIX: Record<StudioCloudModuleName, string> = {
  docs: "connectln_studio_docs_v1:",
  workbooks: "connectln_studio_sheets_v1:",
  decks: "connectln_studio_slides_v1:",
  sign: "connectln_power_sign_v1:",
  invoices: "connectln_power_invoice_v1:",
  ledger: "connectln_power_ledger_v1:",
  boards: "connectln_power_boards_v1:",
  forms: "connectln_power_forms_v1:",
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function pushStudioModuleCloud(
  user: StudioCloudUserLike | null | undefined,
  module: StudioCloudModuleName,
  data: unknown
): void {
  if (typeof window === "undefined") return
  const userKey = getStudioUserKey(user)
  const timerKey = `${userKey}::${module}`
  const existing = debounceTimers.get(timerKey)
  if (existing) clearTimeout(existing)

  const handle = setTimeout(() => {
    debounceTimers.delete(timerKey)
    fetch("/api/connectin/studio-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey, module, data }),
    }).catch(() => {})
  }, 900)

  debounceTimers.set(timerKey, handle)
}

export async function hydrateStudioModulesFromCloud(
  user?: StudioCloudUserLike | null
): Promise<boolean> {
  if (typeof window === "undefined") return false
  const userKey = getStudioUserKey(user)
  try {
    const res = await fetch(`/api/connectin/studio-state?userKey=${encodeURIComponent(userKey)}`, {
      cache: "no-store",
    })
    if (!res.ok) return false
    const json = await res.json().catch(() => null)
    const modules = json?.modules
    if (!modules || typeof modules !== "object") return false

    let updated = false
    for (const [mod, prefix] of Object.entries(MODULE_LOCAL_PREFIX) as Array<
      [StudioCloudModuleName, string]
    >) {
      const cloudVal = modules[mod]
      if (!Array.isArray(cloudVal) || cloudVal.length === 0) continue
      const lsKey = `${prefix}${userKey}`
      const serialized = JSON.stringify(cloudVal)
      const currentRaw = localStorage.getItem(lsKey)
      if (currentRaw !== serialized) {
        localStorage.setItem(lsKey, serialized)
        updated = true
      }
    }
    return updated
  } catch {
    return false
  }
}
