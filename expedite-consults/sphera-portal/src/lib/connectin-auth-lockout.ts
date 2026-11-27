import {
  firebaseKvDeleteItem,
  firebaseKvGetItem,
  firebaseKvSetItem,
} from "@/lib/connectin-firebase-kv"
import { appendCloudTelemetry } from "@/lib/connectin-cloud-sync"

export const LOCKOUT_KV_MAP = "connectln_auth_lockouts_v1"
export const MAX_FAILED_LOGIN_ATTEMPTS = 3
export const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes
export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15-minute rolling failure window

export interface LoginLockoutRecord {
  key: string
  attempts: number
  firstFailedAtMs: number
  lastFailedAtMs: number
  lockedUntilMs: number | null
  lastReason?: string
  lastProvider?: string
  lastIp?: string
}

export interface LockoutStatusResult {
  locked: boolean
  attempts: number
  maxAttempts: number
  remainingAttempts: number
  lockedUntilMs: number | null
  lockedUntilIso: string | null
  retryAfterSeconds: number
  message: string
}

export function buildLockoutKeys(params: {
  email?: string
  phone?: string
}): string[] {
  const keys = new Set<string>()
  const cleanEmail = String(params.email || "").trim().toLowerCase()
  if (cleanEmail && cleanEmail.includes("@") && !cleanEmail.endsWith("@connectin.phone")) {
    keys.add(`email:${cleanEmail}`)
  }

  const digits = String(params.phone || "").replace(/[^\d]/g, "")
  if (digits.length >= 7) {
    keys.add(`phone:${digits.slice(-10)}`)
  } else if (cleanEmail && cleanEmail.endsWith("@connectin.phone")) {
    const synthDigits = cleanEmail.split("@")[0].replace(/[^\d]/g, "")
    if (synthDigits.length >= 7) {
      keys.add(`phone:${synthDigits.slice(-10)}`)
    }
  }
  return Array.from(keys)
}

function formatLockedMessage(lockedUntilMs: number): string {
  const mins = Math.max(1, Math.ceil((lockedUntilMs - Date.now()) / 60000))
  return `Account locked: Your account has been locked after ${MAX_FAILED_LOGIN_ATTEMPTS} unsuccessful login attempts. Try again in ${mins} minute(s) or contact a ConnectLn administrator.`
}

export async function checkLoginLockout(params: {
  email?: string
  phone?: string
}): Promise<LockoutStatusResult> {
  const keys = buildLockoutKeys(params)
  if (keys.length === 0) {
    return {
      locked: false,
      attempts: 0,
      maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      lockedUntilMs: null,
      lockedUntilIso: null,
      retryAfterSeconds: 0,
      message: "",
    }
  }

  const now = Date.now()
  const records = await Promise.all(
    keys.map((k) => firebaseKvGetItem<LoginLockoutRecord>(LOCKOUT_KV_MAP, k).catch(() => null))
  )

  let activeLockedUntilMs: number | null = null
  let activeLockedAttempts = 0
  let maxActiveAttempts = 0

  for (const rec of records) {
    if (!rec) continue
    if (rec.lockedUntilMs && rec.lockedUntilMs > now) {
      if (!activeLockedUntilMs || rec.lockedUntilMs > activeLockedUntilMs) {
        activeLockedUntilMs = rec.lockedUntilMs
        activeLockedAttempts = rec.attempts || MAX_FAILED_LOGIN_ATTEMPTS
      }
    } else if (rec.lastFailedAtMs && now - rec.lastFailedAtMs <= ATTEMPT_WINDOW_MS) {
      if ((rec.attempts || 0) > maxActiveAttempts) {
        maxActiveAttempts = rec.attempts || 0
      }
    }
  }

  if (activeLockedUntilMs) {
    return {
      locked: true,
      attempts: Math.max(MAX_FAILED_LOGIN_ATTEMPTS, activeLockedAttempts),
      maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      remainingAttempts: 0,
      lockedUntilMs: activeLockedUntilMs,
      lockedUntilIso: new Date(activeLockedUntilMs).toISOString(),
      retryAfterSeconds: Math.max(1, Math.ceil((activeLockedUntilMs - now) / 1000)),
      message: formatLockedMessage(activeLockedUntilMs),
    }
  }

  const clampedAttempts = Math.min(maxActiveAttempts, MAX_FAILED_LOGIN_ATTEMPTS - 1)
  return {
    locked: false,
    attempts: clampedAttempts,
    maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - clampedAttempts),
    lockedUntilMs: null,
    lockedUntilIso: null,
    retryAfterSeconds: 0,
    message: "",
  }
}

export async function recordFailedLoginAttempt(params: {
  email?: string
  phone?: string
  reason?: string
  ipAddress?: string
  provider?: string
}): Promise<LockoutStatusResult> {
  const keys = buildLockoutKeys(params)
  if (keys.length === 0) {
    return {
      locked: false,
      attempts: 1,
      maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
      lockedUntilMs: null,
      lockedUntilIso: null,
      retryAfterSeconds: 0,
      message: "",
    }
  }

  const now = Date.now()
  const existingRecords = await Promise.all(
    keys.map((k) => firebaseKvGetItem<LoginLockoutRecord>(LOCKOUT_KV_MAP, k).catch(() => null))
  )

  let highestAttempts = 0
  let highestLockedUntilMs: number | null = null
  let newlyLocked = false

  const updatedRecords: Array<{ key: string; record: LoginLockoutRecord }> = []

  keys.forEach((key, idx) => {
    const prev = existingRecords[idx]
    if (prev?.lockedUntilMs && prev.lockedUntilMs > now) {
      highestAttempts = Math.max(highestAttempts, prev.attempts || MAX_FAILED_LOGIN_ATTEMPTS)
      highestLockedUntilMs = Math.max(highestLockedUntilMs || 0, prev.lockedUntilMs)
      updatedRecords.push({
        key,
        record: {
          ...prev,
          attempts: Math.max(MAX_FAILED_LOGIN_ATTEMPTS, (prev.attempts || 0) + 1),
          lastFailedAtMs: now,
          lastReason: params.reason || prev.lastReason,
          lastProvider: params.provider || prev.lastProvider,
          lastIp: params.ipAddress || prev.lastIp,
        },
      })
      return
    }

    const withinWindow = prev && now - (prev.lastFailedAtMs || 0) <= ATTEMPT_WINDOW_MS
    const nextAttempts = (withinWindow ? prev.attempts || 0 : 0) + 1
    const firstFailedAtMs = withinWindow ? prev.firstFailedAtMs || now : now
    const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
    const lockedUntilMs = shouldLock ? now + LOCKOUT_DURATION_MS : null
    if (nextAttempts === MAX_FAILED_LOGIN_ATTEMPTS) {
      newlyLocked = true
    }

    highestAttempts = Math.max(highestAttempts, nextAttempts)
    if (lockedUntilMs) {
      highestLockedUntilMs = Math.max(highestLockedUntilMs || 0, lockedUntilMs)
    }

    updatedRecords.push({
      key,
      record: {
        key,
        attempts: nextAttempts,
        firstFailedAtMs,
        lastFailedAtMs: now,
        lockedUntilMs,
        lastReason: params.reason,
        lastProvider: params.provider,
        lastIp: params.ipAddress,
      },
    })
  })

  await Promise.allSettled(
    updatedRecords.map(({ key, record }) =>
      firebaseKvSetItem(LOCKOUT_KV_MAP, key, record, 3600)
    )
  )

  if (newlyLocked) {
    const targetDesc = params.email || params.phone || keys[0]
    void appendCloudTelemetry({
      socEvent: {
        id: `SOC-LOCK-${Date.now().toString().slice(-6)}`,
        severity: "High",
        eventType: "Brute-Force Account Lockout (3 Failed Attempts)",
        sourceIp: params.ipAddress || "Unknown",
        targetAccount: targetDesc,
        mitigationAction: `Locked for 30m after ${MAX_FAILED_LOGIN_ATTEMPTS} failed ${params.provider || "Sign-In"} attempts (${params.reason || "AUTH_FAILED"})`,
        timestamp: "Just Now",
      },
    }).catch(() => {})
  }

  if (highestLockedUntilMs && highestLockedUntilMs > now) {
    return {
      locked: true,
      attempts: highestAttempts,
      maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      remainingAttempts: 0,
      lockedUntilMs: highestLockedUntilMs,
      lockedUntilIso: new Date(highestLockedUntilMs).toISOString(),
      retryAfterSeconds: Math.max(1, Math.ceil((highestLockedUntilMs - now) / 1000)),
      message: formatLockedMessage(highestLockedUntilMs),
    }
  }

  return {
    locked: false,
    attempts: highestAttempts,
    maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - highestAttempts),
    lockedUntilMs: null,
    lockedUntilIso: null,
    retryAfterSeconds: 0,
    message: "",
  }
}

export async function clearLoginLockout(params: {
  email?: string
  phone?: string
}): Promise<void> {
  const keys = buildLockoutKeys(params)
  if (keys.length === 0) return
  await Promise.allSettled(
    keys.map((key) => firebaseKvDeleteItem(LOCKOUT_KV_MAP, key))
  )
}
