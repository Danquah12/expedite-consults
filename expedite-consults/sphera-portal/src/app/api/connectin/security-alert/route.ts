import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { lockAccountImmediately } from "@/lib/connectin-auth-lockout"
import {
  pullCloudUsersIntoDb,
  recordGlobalUserActivity,
  resolveRequestGeoLocation,
} from "@/lib/connectin-cloud-sync"
import {
  getSecurityAlertById,
  listSecurityAlertEmails,
  SecurityAlertRecord,
  updateSecurityAlertStatus,
  verifySecurityAlertToken,
} from "@/lib/connectin-security-alerts"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    if (token) {
      const payload = verifySecurityAlertToken(token)
      if (!payload) {
        return NextResponse.json(
          {
            ok: false,
            valid: false,
            error: "This security alert link is invalid or has expired.",
          },
          { status: 400 }
        )
      }

      const stored = await getSecurityAlertById(payload.alertId)
      const alert: Partial<SecurityAlertRecord> = {
        alertId: payload.alertId,
        email: payload.email,
        userId: payload.userId,
        fullName: payload.fullName,
        firstName: payload.fullName.split(/\s+/)[0] || payload.fullName,
        eventType: payload.eventType,
        subject: stored?.subject || "Security alert: password change",
        headline: stored?.headline || "Security alert: password change",
        summary:
          stored?.summary ||
          "Someone just changed your ConnectLn Account password. If this wasn't you, we're here to help you take some simple steps to secure your account.",
        locationDisplay: stored?.locationDisplay || payload.locationDisplay,
        deviceDisplay: stored?.deviceDisplay || payload.deviceDisplay,
        timestampDisplay: stored?.timestampDisplay || payload.timestampDisplay,
        mapImageUrl: stored?.mapImageUrl || payload.mapImageUrl,
        profiles: stored?.profiles || payload.profiles,
        status: stored?.status || "pending",
        actionedAtIso: stored?.actionedAtIso,
        emailSent: stored?.emailSent ?? true,
      }

      return NextResponse.json({
        ok: true,
        valid: true,
        alert,
      })
    }

    const checkParam = req.nextUrl.searchParams.get("check")
    if (checkParam === "1" || req.nextUrl.searchParams.has("email")) {
      let email = String(req.nextUrl.searchParams.get("email") || "")
        .trim()
        .toLowerCase()

      if (!email) {
        const sessionToken = req.cookies.get("connectin_session")?.value
        if (sessionToken) {
          const sess = connectinDb.findSessionByToken(sessionToken)
          const sessUser = sess ? connectinDb.findUserById(sess.userId) : undefined
          if (sessUser?.email) {
            email = sessUser.email.toLowerCase().trim()
          }
        }
      }

      if (!email) {
        return NextResponse.json({ ok: true, email: "", emails: [] })
      }

      const emails = await listSecurityAlertEmails(email)
      return NextResponse.json({ ok: true, email, emails })
    }

    return NextResponse.json(
      { ok: false, error: "Provide either ?token=... or ?check=1&email=..." },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[security-alert GET] Error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load security alert details." },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = String(body?.action || "").trim()
    const token = String(body?.token || "").trim()

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing security alert token." },
        { status: 400 }
      )
    }

    const payload = verifySecurityAlertToken(token)
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "This security alert link is invalid or has expired." },
        { status: 400 }
      )
    }

    if (action === "this_wasnt_me") {
      const geo = resolveRequestGeoLocation(req)
      const lockRes = await lockAccountImmediately({
        email: payload.email,
        phone: payload.phone,
        reason: "SECURITY_ALERT_THIS_WASNT_ME",
        ipAddress: geo.ipAddress,
      })

      await Promise.race([
        pullCloudUsersIntoDb().catch(() => []),
        new Promise((resolve) => setTimeout(() => resolve([]), 2500)),
      ])

      let sessionsRevokedCount = 0
      const cleanEmail = payload.email.toLowerCase().trim()
      const matchingUsers = connectinDb
        .getUsers()
        .filter((u) => u.email.toLowerCase().trim() === cleanEmail || u.id === payload.userId)

      for (const u of matchingUsers) {
        const userSessions = connectinDb.getUserSessions(u.id)
        for (const s of userSessions) {
          if (s.isActive) {
            if (connectinDb.revokeSession(s.sessionId)) {
              sessionsRevokedCount++
            }
          }
        }
      }

      await updateSecurityAlertStatus(payload.alertId, cleanEmail, "secured_locked")

      void recordGlobalUserActivity({
        id: `act_sec_lock_${payload.alertId}`,
        userId: payload.userId || `USR-${cleanEmail.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`,
        userName: payload.fullName,
        userEmail: cleanEmail,
        userAvatar: "",
        userRole: "PERSONAL",
        actionType: "SECURITY_ALERT_LOCKED_ACCOUNT",
        actionLabel: "Locked Account via Security Alert ('This wasn't me')",
        category: "auth",
        targetId: payload.alertId,
        targetTitle: payload.locationDisplay,
        details: `Account locked (${lockRes.lockedUntilIso}); revoked ${sessionsRevokedCount} active session(s).`,
        timestampIso: new Date().toISOString(),
      }).catch(() => {})

      const res = NextResponse.json({
        ok: true,
        status: "secured_locked",
        locked: true,
        lockedUntilIso: lockRes.lockedUntilIso,
        sessionsRevokedCount,
        message:
          "Your ConnectLn account has been immediately locked and all active sessions have been revoked. Contact ConnectLn Security Support or an administrator to complete identity recovery.",
      })
      res.cookies.delete("connectin_session")
      return res
    }

    if (action === "this_was_me") {
      await updateSecurityAlertStatus(payload.alertId, payload.email, "confirmed_me")
      return NextResponse.json({
        ok: true,
        status: "confirmed_me",
        message: "Thank you for confirming. No lockout was applied to your ConnectLn account.",
      })
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported security alert action." },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("[security-alert POST] Error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process security alert response." },
      { status: 500 }
    )
  }
}
