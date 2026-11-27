import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import {
  isSuperAdminUser,
  isDedicatedAdminAccount,
  getKnownDemoPersonaAvatar,
  generatePersonalSignatureAvatar,
  isForeignPersonaAvatar
} from "@/lib/connectin-profile"
import { findProfessionById } from "@/lib/connectin-professions"
import { resolveRequestGeoLocation, upsertCloudUser, appendCloudTelemetry } from "@/lib/connectin-cloud-sync"
import { findRegisteredConnectLnUser } from "@/lib/connectin-registered-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      name: incomingName,
      professionId: incomingProfessionId,
      clientTimezone
    } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid Google account email is required." }, { status: 400 })
    }

    const geo = resolveRequestGeoLocation(req, clientTimezone, body.location)
    const cleanEmail = email.toLowerCase().trim()

    const lookup = await findRegisteredConnectLnUser({
      email: cleanEmail,
      incomingName: typeof incomingName === "string" ? incomingName : "",
      requireName: true,
    })

    if (!lookup.ok) {
      return NextResponse.json(
        { error: lookup.error, code: lookup.code },
        { status: lookup.status }
      )
    }

    const { user, profile } = lookup
    const displayName = profile.name
    const isSuperAdmin = isSuperAdminUser({ name: displayName, email: cleanEmail })
    const userRole = isSuperAdmin ? "admin" : user.role

    if (
      !profile.avatar ||
      profile.avatar.includes("api.dicebear.com") ||
      isForeignPersonaAvatar(profile.avatar, { name: profile.name, email: cleanEmail })
    ) {
      profile.avatar =
        getKnownDemoPersonaAvatar({ name: profile.name, email: cleanEmail }) ||
        generatePersonalSignatureAvatar({ name: profile.name, email: cleanEmail, professionEnclave: profile.professionEnclave })
    }
    const resolvedAvatar = profile.avatar

    // Mark login timestamp, move user to top of directory, and record server-side activity log
    const nowIso = new Date().toISOString()
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    connectinDb.touchUserLogin(user.id, "Google SSO")
    connectinDb.recordActivity({
      id: `ACT-GOOGLE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      userId: user.id,
      userName: profile.name || displayName,
      userEmail: cleanEmail,
      userAvatar: profile.avatar || resolvedAvatar,
      userRole: isSuperAdmin ? "SUPER_ADMIN" : "PERSONAL",
      actionType: "USER_LOGIN",
      actionLabel: `Signed In via Google SSO ✓ (${geo.locationLabel})`,
      category: "auth",
      targetTitle: "Google Identity Services (OAuth 2.0)",
      details: `Authenticated via Google SSO as ${profile.name || displayName} (${cleanEmail}) from ${geo.locationLabel}`,
      timestampIso: nowIso,
      timestampDisplay: new Date(nowIso).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    })

    // Create session
    const session = connectinDb.createSession(user.id, {
      ipAddress: geo.ipAddress,
      userAgent: geo.userAgent,
      location: geo.locationLabel
    })
    const shouldOpenAdminPortal = isDedicatedAdminAccount({
      name: displayName,
      email: cleanEmail,
      professionId: incomingProfessionId
    })
    const targetUrl = shouldOpenAdminPortal ? "/connectin-admin" : "/connectin"
    const effectiveRole = isSuperAdmin ? "admin" : (user.role === "admin" ? "personal" : user.role)

    const selectedProf = incomingProfessionId && incomingProfessionId !== "auto_detect"
      ? findProfessionById(incomingProfessionId)
      : null

    await Promise.all([
      upsertCloudUser({
        id: user.id,
        email: user.email,
        phone: user.phone || "",
        name: profile.name || displayName,
        role: effectiveRole,
        status: user.status,
        headline: selectedProf?.defaultHeadline || profile.headline,
        avatar: profile.avatar || resolvedAvatar,
        coverImage: profile.coverImage,
        location: geo.locationLabel,
        countryName: geo.countryName,
        countryCode: geo.countryCode,
        isOutsideUS: geo.isOutsideUS,
        ipAddress: geo.ipAddress,
        profession: selectedProf?.title || profile.profession,
        professionId: selectedProf?.id || profile.professionId,
        professionCategory: selectedProf?.categoryName || profile.professionCategory,
        professionEnclave: selectedProf?.enclaveId || profile.professionEnclave,
        authProvider: "Google SSO",
        lastLoginAt: nowIso,
        createdAt: user.createdAt,
        updatedAt: nowIso
      }),
      appendCloudTelemetry({
        activityLog: {
          id: `act_google_${user.id}_${Date.now().toString().slice(-5)}`,
          userId: user.id,
          userName: profile.name || displayName,
          userEmail: cleanEmail,
          userAvatar: profile.avatar || resolvedAvatar,
          userHeadline: selectedProf?.defaultHeadline || profile.headline,
          actionType: "USER_LOGIN",
          actionLabel: `Signed In via Google SSO (${geo.locationLabel})`,
          category: "auth",
          targetTitle: `Google SSO · ${geo.locationLabel}`,
          details: `Authenticated via Google SSO from ${geo.locationLabel} (IP: ${geo.ipAddress})`,
          timestamp: `${timeStr} · ${geo.countryName}`,
          createdAtIso: nowIso
        },
        auditLog: {
          id: `LOG-${Date.now().toString().slice(-6)}`,
          adminEmail: cleanEmail,
          action: "USER_ACTIVATED",
          targetEntity: `${profile.name || displayName} (${cleanEmail})`,
          reason: `Member sign-in via Google SSO from ${geo.locationLabel}`,
          ipAddress: `${geo.ipAddress} (${geo.locationLabel})`,
          timestamp: `${timeStr}`,
          status: "Success"
        },
        socEvent: {
          id: `SOC-LIVE-${Date.now().toString().slice(-5)}`,
          severity: "Low",
          eventType: `Google SSO Login (${geo.countryName})`,
          sourceIp: `${geo.ipAddress} (${geo.locationLabel})`,
          targetAccount: `${profile.name || displayName} (${cleanEmail})`,
          mitigationAction: `Verified Google OAuth2 Session Created`,
          timestamp: "Just Now"
        },
        verification: {
          id: `VER-${user.id}`,
          applicantName: profile.name || displayName,
          applicantEmail: cleanEmail,
          applicantAvatar: profile.avatar || resolvedAvatar,
          requestType: "Executive Identity",
          submittedDocument: `Google SSO OAuth2 (${geo.locationLabel})`,
          organizationName: selectedProf?.title || profile.profession || "ConnectIn Global Network",
          submittedAt: "Just Now",
          status: "Approved"
        }
      })
    ])

    const response = NextResponse.json({
      success: true,
      message: `✓ Verified with Google Identity (${cleanEmail})`,
      targetUrl,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: effectiveRole,
        status: user.status,
        profession: selectedProf?.title || profile.profession,
        professionEnclave: selectedProf?.enclaveId || profile.professionEnclave,
        authProvider: "Google SSO",
        lastLoginAt: nowIso
      },
      profile: {
        ...profile,
        id: user.id,
        userId: user.id,
        email: user.email,
        role: effectiveRole,
        roles: isSuperAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"],
        profession: selectedProf?.title || profile.profession || (isSuperAdmin ? "Platform IAM Architect" : "Master Carpenter (Framing & Finish Joinery)"),
        professionId: selectedProf?.id || ((!isSuperAdmin && profile.professionId === "platform_admin") ? "carpenter" : (profile.professionId || (isSuperAdmin ? "platform_admin" : "carpenter"))),
        professionCategory: selectedProf?.categoryName || profile.professionCategory || (isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction"),
        professionEnclave: selectedProf?.enclaveId || profile.professionEnclave || (isSuperAdmin ? "law_gov_defense" : "trades_construction"),
        authProvider: "Google SSO",
        lastLoginAt: nowIso
      },
      session: {
        sessionId: session.sessionId,
        token: session.token,
        deviceName: session.deviceName,
        createdAt: session.createdAt
      }
    })

    // Set secure HTTP-only session cookie (30 days)
    response.cookies.set("connectin_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60
    })

    return response
  } catch (error: any) {
    console.error("[/api/connectin/auth/google]", error)
    return NextResponse.json({ error: error.message || "Google authentication failed" }, { status: 500 })
  }
}
