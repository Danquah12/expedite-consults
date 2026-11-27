import { connectinDb, UserProfileRecord, UserRecord } from "@/lib/connectin-db"
import { pullCloudUsersIntoDb } from "@/lib/connectin-cloud-sync"
import {
  refreshWhatsAppDirectoryCache,
  WhatsAppDirectoryMember,
} from "@/lib/connectin-whatsapp-directory"
import { formatE164Phone } from "@/lib/connectin-sms"
import { looksLikeInternationalPhone } from "@/lib/connectin-international-phones"

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

export function normalizeAuthName(raw: string): string {
  return String(raw || "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

export type RegisteredUserLookupResult =
  | {
      ok: true
      user: UserRecord
      profile: UserProfileRecord
      dirCache: Map<string, WhatsAppDirectoryMember>
    }
  | {
      ok: false
      status: number
      code: "NAME_REQUIRED" | "NOT_REGISTERED" | "NAME_MISMATCH" | "SUSPENDED"
      error: string
    }

/**
 * Strictly validates that an incoming ConnectLn sign-in attempt belongs to an already-registered
 * member (hydrating from MongoDB/Firebase KV first). When `incomingName` is specified (or
 * `requireName` is true), the entered full name MUST match a registered profile name on that account.
 */
export async function findRegisteredConnectLnUser(params: {
  email?: string
  phone?: string
  incomingName?: string
  requireName?: boolean
}): Promise<RegisteredUserLookupResult> {
  const cleanEmail = String(params.email || "").toLowerCase().trim()
  const cleanName = String(params.incomingName || "").trim()
  const rawPhone = String(params.phone || "").trim()
  const normPhone =
    rawPhone && looksLikeInternationalPhone(rawPhone) ? formatE164Phone(rawPhone) : ""

  if (params.requireName && normalizeAuthName(cleanName).length < 2) {
    return {
      ok: false,
      status: 400,
      code: "NAME_REQUIRED",
      error: "Please enter your registered full name to sign in to ConnectLn.",
    }
  }

  const [, dirCache] = await Promise.all([
    withTimeout(pullCloudUsersIntoDb(), 4000, []),
    withTimeout(refreshWhatsAppDirectoryCache(true), 3500, new Map<string, WhatsAppDirectoryMember>()),
  ])

  const normDigits = normPhone.replace(/[^\d]/g, "")
  const last10 = normDigits.slice(-10)
  const syntheticFullPhoneEmail = normDigits ? `${normDigits}@connectin.phone` : ""
  const syntheticLast10Email = last10 ? `${last10}@connectin.phone` : ""

  const allUsers = connectinDb.getUsers()
  const candidateUsers = allUsers.filter((u) => {
    const uEmail = String(u.email || "").toLowerCase().trim()
    const uPhone =
      u.phone && looksLikeInternationalPhone(u.phone) ? formatE164Phone(u.phone) : ""
    const emailMatch = Boolean(cleanEmail && uEmail === cleanEmail)
    const phoneMatch = Boolean(
      (normPhone && uPhone && uPhone === normPhone) ||
        (syntheticFullPhoneEmail && uEmail === syntheticFullPhoneEmail) ||
        (syntheticLast10Email && uEmail === syntheticLast10Email)
    )
    return emailMatch || phoneMatch
  })

  // Also check verified directory entries as a fallback lookup source if email+verified entry exists
  if (candidateUsers.length === 0) {
    const dirMatch = Array.from(dirCache.values()).find((m) => {
      if (!m || (!m.verifiedBy2FA && !m.email)) return false
      const mEmail = String(m.email || "").toLowerCase().trim()
      const mPhone =
        m.phone && looksLikeInternationalPhone(m.phone) ? formatE164Phone(m.phone) : ""
      return Boolean(
        (cleanEmail && mEmail === cleanEmail) || (normPhone && mPhone && mPhone === normPhone)
      )
    })

    if (!dirMatch) {
      return {
        ok: false,
        status: 403,
        code: "NOT_REGISTERED",
        error:
          "Access denied: No registered ConnectLn account was found for these credentials. Please register and verify an account first.",
      }
    }

    const dirNormName = normalizeAuthName(dirMatch.name || "")
    if (cleanName && (!dirNormName || dirNormName !== normalizeAuthName(cleanName))) {
      return {
        ok: false,
        status: 403,
        code: "NAME_MISMATCH",
        error:
          "Access denied: The full name entered does not match the registered ConnectLn member on this account.",
      }
    }

    return {
      ok: false,
      status: 403,
      code: "NOT_REGISTERED",
      error:
        "Access denied: Please finish creating your ConnectLn profile before signing in with SSO.",
    }
  }

  let matchedUser: UserRecord | undefined
  let matchedProfile: UserProfileRecord | undefined

  const normalizedIncomingName = normalizeAuthName(cleanName)
  if (normalizedIncomingName) {
    for (const u of candidateUsers) {
      const p = connectinDb.findProfileByUserId(u.id)
      if (!p) continue
      if (normalizeAuthName(p.name) === normalizedIncomingName) {
        matchedUser = u
        matchedProfile = p
        break
      }
    }

    if (!matchedUser || !matchedProfile) {
      return {
        ok: false,
        status: 403,
        code: "NAME_MISMATCH",
        error:
          "Access denied: The full name entered does not match any registered ConnectLn user on this account.",
      }
    }
  } else {
    for (const u of candidateUsers) {
      const p = connectinDb.findProfileByUserId(u.id)
      if (p) {
        matchedUser = u
        matchedProfile = p
        break
      }
    }
    if (!matchedUser || !matchedProfile) {
      return {
        ok: false,
        status: 403,
        code: "NOT_REGISTERED",
        error:
          "Access denied: No registered ConnectLn profile was found for these credentials.",
      }
    }
  }

  if (matchedUser.status === "Suspended" || matchedUser.status === "Banned") {
    return {
      ok: false,
      status: 403,
      code: "SUSPENDED",
      error: "This account is suspended. Contact security administrator.",
    }
  }

  return {
    ok: true,
    user: matchedUser,
    profile: matchedProfile,
    dirCache,
  }
}
