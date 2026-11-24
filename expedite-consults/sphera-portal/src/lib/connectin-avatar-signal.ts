import {
  getExplicitStoredUser,
  loadPersistentAvatar,
  resolveUserProfilePicture,
} from "@/lib/connectin-storage"
import type { UserProfile } from "@/lib/connectln-data"

const PLACEHOLDER_AVATAR_PATTERNS = [
  "api.dicebear.com",
  "ui-avatars.com",
  "gravatar.com/avatar/00000000000000000000000000000000",
  "/default-avatar",
]

export function isSelfAvatarEndpoint(raw: unknown): boolean {
  return typeof raw === "string" && raw.toLowerCase().includes("/api/connectin/avatar")
}

export function isPlaceholderCallAvatar(raw: unknown): boolean {
  if (typeof raw !== "string") return true
  const v = raw.trim().toLowerCase()
  if (!v) return true
  return PLACEHOLDER_AVATAR_PATTERNS.some((pattern) => v.includes(pattern))
}

export function sanitizeSignalAvatar(
  raw: unknown,
  maxDataUriLen = 90000
): string | undefined {
  if (typeof raw !== "string") return undefined
  const v = raw.trim()
  if (!v) return undefined
  if (
    (v.startsWith("https://") || v.startsWith("http://") || v.startsWith("/")) &&
    v.length <= 1500
  ) {
    return v
  }
  if (v.startsWith("data:image/") && v.length <= maxDataUriLen) {
    return v
  }
  return undefined
}

export function pickRealCallAvatar(
  ...candidates: Array<unknown>
): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue
    const trimmed = candidate.trim()
    if (!trimmed || isPlaceholderCallAvatar(trimmed) || isSelfAvatarEndpoint(trimmed)) continue
    if (
      (trimmed.startsWith("https://") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("/")) &&
      trimmed.length <= 1500
    ) {
      return trimmed
    }
    if (trimmed.startsWith("data:image/")) {
      return trimmed
    }
  }
  return undefined
}

export function pickBestCallAvatar(
  ...candidates: Array<unknown>
): string | undefined {
  const real = pickRealCallAvatar(...candidates)
  if (real) return real
  for (const candidate of candidates) {
    const sanitized = sanitizeSignalAvatar(candidate)
    if (sanitized) return sanitized
  }
  return undefined
}

export async function compressAvatarForCallSignal(
  rawUrl?: string | null,
  maxBytes = 60000
): Promise<string | undefined> {
  if (typeof rawUrl !== "string") return undefined
  const trimmed = rawUrl.trim()
  if (!trimmed || isPlaceholderCallAvatar(trimmed)) return undefined

  if (
    (trimmed.startsWith("https://") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("/")) &&
    trimmed.length <= 1500
  ) {
    return trimmed
  }

  if (!trimmed.startsWith("data:image/")) {
    return undefined
  }

  if (trimmed.length <= maxBytes) {
    return trimmed
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (val: string | undefined) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(val)
    }

    const timer = setTimeout(() => finish(undefined), 2500)
    const img = new Image()
    // Do NOT set img.crossOrigin on data: URLs; some mobile WebViews fail the load.
    img.onload = () => {
      try {
        const srcW = img.naturalWidth || img.width || 256
        const srcH = img.naturalHeight || img.height || 256
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          finish(undefined)
          return
        }

        const dimensions = [256, 192, 144, 96, 64]
        const qualities = [0.78, 0.62, 0.48, 0.34]
        let smallestCandidate: string | undefined

        for (const maxDim of dimensions) {
          const scale = Math.min(maxDim / Math.max(srcW, 1), maxDim / Math.max(srcH, 1), 1)
          const targetW = Math.max(32, Math.round(srcW * scale))
          const targetH = Math.max(32, Math.round(srcH * scale))
          canvas.width = targetW
          canvas.height = targetH
          ctx.clearRect(0, 0, targetW, targetH)
          ctx.drawImage(img, 0, 0, targetW, targetH)

          for (const q of qualities) {
            const encoded = canvas.toDataURL("image/jpeg", q)
            if (!smallestCandidate || encoded.length < smallestCandidate.length) {
              smallestCandidate = encoded
            }
            if (encoded.length <= maxBytes) {
              finish(encoded)
              return
            }
          }
        }

        finish(
          smallestCandidate && smallestCandidate.length <= Math.round(maxBytes * 1.15)
            ? smallestCandidate
            : undefined
        )
      } catch {
        finish(undefined)
      }
    }
    img.onerror = () => finish(undefined)
    img.src = trimmed
  })
}

export async function resolveAndCompressLocalCallerAvatar(
  user?: Partial<UserProfile> & { profilePicture?: string } | null,
  maxBytes = 60000
): Promise<string | undefined> {
  const candidates: Array<unknown> = []

  if (user) {
    candidates.push(user.avatar, user.profilePicture)
    const persistentForUser = loadPersistentAvatar(user)
    if (persistentForUser) candidates.push(persistentForUser)
  }

  if (typeof window !== "undefined") {
    const explicit = getExplicitStoredUser() as
      | (UserProfile & { profilePicture?: string })
      | null
    if (explicit) {
      candidates.push(explicit.avatar, explicit.profilePicture)
      const persistentExplicit = loadPersistentAvatar(explicit)
      if (persistentExplicit) candidates.push(persistentExplicit)
      const resolvedExplicit = resolveUserProfilePicture(explicit)
      if (resolvedExplicit) candidates.push(resolvedExplicit)
    } else if (user) {
      const resolvedUser = resolveUserProfilePicture(user)
      if (resolvedUser) candidates.push(resolvedUser)
    }
  }

  const bestRaw = pickRealCallAvatar(...candidates)
  if (!bestRaw) return undefined
  return compressAvatarForCallSignal(bestRaw, maxBytes)
}
