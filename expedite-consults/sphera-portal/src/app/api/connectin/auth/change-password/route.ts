import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { pullCloudUsersIntoDb } from "@/lib/connectin-cloud-sync"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"
import {
  dispatchConnectLnSecurityAlert,
  SecurityAlertEventType,
} from "@/lib/connectin-security-alerts"

export const dynamic = "force-dynamic"

const SECURITY_STATE_MAP = "connectln_security_state_v1"

function sanitizeUserKey(raw?: string | null): string {
  const clean = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80)
  return clean ? `sec_${clean}` : "sec_guest"
}

function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `scrypt:${salt}:${hash}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const testAlertOnly = Boolean(body?.testAlertOnly)
    const eventType: SecurityAlertEventType =
      body?.eventType === "phone_change" ||
      body?.eventType === "passkey_added" ||
      body?.eventType === "security_check"
        ? body.eventType
        : "password_change"

    await Promise.race([
      pullCloudUsersIntoDb().catch(() => []),
      new Promise((resolve) => setTimeout(() => resolve([]), 3000)),
    ])

    let resolvedEmail = String(body?.email || "").trim().toLowerCase()
    let resolvedName = String(body?.fullName || "").trim()
    let resolvedUserId: string | undefined
    let resolvedPhone = String(body?.phone || "").trim()
    let resolvedRole = "personal"

    const sessionToken = req.cookies.get("connectin_session")?.value
    if (sessionToken) {
      const sess = connectinDb.findSessionByToken(sessionToken)
      if (sess) {
        const sessUser = connectinDb.findUserById(sess.userId)
        const sessProfile = connectinDb.findProfileByUserId(sess.userId)
        if (sessUser) {
          resolvedUserId = sessUser.id
          if (!resolvedEmail) resolvedEmail = sessUser.email.toLowerCase().trim()
          if (!resolvedPhone && sessUser.phone) resolvedPhone = sessUser.phone
          resolvedRole = sessUser.role || "personal"
        }
        if (sessProfile && !resolvedName) {
          resolvedName = sessProfile.name
        }
      }
    }

    if (resolvedEmail) {
      const matchedUser = connectinDb.findUserByEmail(resolvedEmail)
      if (matchedUser) {
        resolvedUserId = resolvedUserId || matchedUser.id
        resolvedPhone = resolvedPhone || matchedUser.phone || ""
        resolvedRole = matchedUser.role || resolvedRole
        if (!resolvedName) {
          const prof = connectinDb.findProfileByUserId(matchedUser.id)
          if (prof?.name) resolvedName = prof.name
        }
      }
    }

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "A valid account email address is required." },
        { status: 400 }
      )
    }

    if (!testAlertOnly && eventType === "password_change") {
      const newPassword = String(body?.newPassword || "")
      if (newPassword.length < 8) {
        return NextResponse.json(
          { ok: false, error: "New password must be at least 8 characters long." },
          { status: 400 }
        )
      }

      const passwordHash = hashPasswordScrypt(newPassword)
      if (resolvedUserId) {
        connectinDb.updateUser(resolvedUserId, { passwordHash })
      } else {
        const fallbackUser = connectinDb.findUserByEmail(resolvedEmail)
        if (fallbackUser) {
          connectinDb.updateUser(fallbackUser.id, { passwordHash })
        }
      }

      const secKey = sanitizeUserKey(resolvedEmail)
      const existingSec =
        (await firebaseKvGetItem<Record<string, unknown>>(SECURITY_STATE_MAP, secKey)) || {}
      await firebaseKvSetItem(SECURITY_STATE_MAP, secKey, {
        ...existingSec,
        lastPasswordChangedAtIso: new Date().toISOString(),
        updatedAtMs: Date.now(),
      })
    }

    const result = await dispatchConnectLnSecurityAlert(req, {
      email: resolvedEmail,
      fullName: resolvedName || resolvedEmail.split("@")[0],
      userId: resolvedUserId,
      phone: resolvedPhone,
      role: resolvedRole,
      eventType,
      clientTimezone: typeof body?.clientTimezone === "string" ? body.clientTimezone : undefined,
      clientLocation: typeof body?.clientLocation === "string" ? body.clientLocation : undefined,
    })

    return NextResponse.json({
      ok: true,
      passwordUpdated: !testAlertOnly && eventType === "password_change",
      alertId: result.alert.alertId,
      emailSent: result.emailSent,
      emailMessageId: result.emailMessageId,
      emailError: result.emailError,
      notMeUrl: result.notMeUrl,
      checkEmailUrl: result.checkEmailUrl,
      alert: result.alert,
    })
  } catch (err: any) {
    console.error("[change-password POST] Error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update password or dispatch security alert." },
      { status: 500 }
    )
  }
}
