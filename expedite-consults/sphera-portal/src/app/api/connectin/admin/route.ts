import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { pullCloudUsersIntoDb, fetchCloudTelemetry } from "@/lib/connectin-cloud-sync"
import {
  EXECUTIVE_ANALYTICS_DATA,
  ADMIN_USERS_DIRECTORY,
  ADMIN_CONTENT_DIRECTORY,
  MODERATION_CASES_DATA,
  ADMIN_COMPANIES_DIRECTORY,
  ADMIN_JOBS_DIRECTORY,
  ADMIN_VERIFICATION_REQUESTS,
  INITIAL_PLATFORM_CONFIG,
  PLATFORM_RBAC_ROLES,
  ADMIN_AUDIT_LOG_DATA,
  SOC_SECURITY_EVENTS,
  BROADCAST_NOTIFICATIONS_DATA,
  FOUR_EYES_APPROVALS_DATA,
  AdminUserRecord
} from "@/lib/connectin-iam-data"

export async function GET(req: NextRequest) {
  try {
    // 1. Pull all globally logged-in users & telemetry across all countries/lambdas from Twilio Cloud Sync
    const [, cloudTelemetry] = await Promise.all([
      pullCloudUsersIntoDb(),
      fetchCloudTelemetry()
    ])

    // Sort db users so most recently logged-in or updated users appear first
    const sortedDbUsers = [...connectinDb.getUsers()].sort((a, b) => {
      const ta = new Date((a as any).lastLoginAt || a.updatedAt || a.createdAt || 0).getTime()
      const tb = new Date((b as any).lastLoginAt || b.updatedAt || b.createdAt || 0).getTime()
      return tb - ta
    })

    const dbUsers = sortedDbUsers.map(u => {
      const p = connectinDb.findProfileByUserId(u.id)
      const resolvedName = p?.name || u.email.split("@")[0]
      const provider = (u as any).authProvider
      const hasLiveLogin = Boolean((u as any).lastLoginAt || provider || (u as any).countryCode)

      const existingInAdmin = ADMIN_USERS_DIRECTORY.find(
        a =>
          a.email.toLowerCase() === u.email.toLowerCase() &&
          a.name.toLowerCase().trim() === resolvedName.toLowerCase().trim()
      )
      if (existingInAdmin && !hasLiveLogin) return existingInAdmin

      const loginTime = (u as any).lastLoginAt
        ? new Date((u as any).lastLoginAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : ""
      const mfaLabel =
        provider === "Google SSO"
          ? "Google SSO ✓"
          : provider === "Microsoft Entra ID"
          ? "Microsoft SSO ✓"
          : u.mfaEnabled
          ? `${(u.mfaChannel || "email").toUpperCase()} 2FA ✓`
          : "Email 2FA ✓"

      const resolvedLocation =
        p?.location && !p.location.includes("Cryptographically")
          ? p.location
          : (u as any).countryName
          ? (u as any).countryName
          : existingInAdmin?.location || "Global Verified Member"

      const countryBadge =
        (u as any).isOutsideUS && (u as any).countryName
          ? ` · ${(u as any).countryName}`
          : ""

      return {
        id: u.id,
        name: resolvedName,
        email: u.email,
        avatar: p?.avatar || existingInAdmin?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email)}`,
        headline: p?.headline || existingInAdmin?.headline || `${u.role.toUpperCase()} Professional · ConnectIn Member`,
        roles: existingInAdmin?.roles || [u.role.toUpperCase()],
        enforcementStatus: (u.status || "Active") as any,
        verificationLevel: (existingInAdmin?.verificationLevel || "Email Verified") as any,
        mfaStatus: mfaLabel as any,
        riskLevel: "Low" as any,
        organization: p?.profession || existingInAdmin?.organization || "Verified Network Member",
        location: resolvedLocation,
        connectionsCount: p?.connectionsCount || existingInAdmin?.connectionsCount || 0,
        lastLogin: loginTime
          ? `Logged In${provider ? " via " + provider : ""} (${loginTime})${countryBadge}`
          : `Active Now · Logged In${countryBadge}`,
        registeredAt: u.createdAt ? new Date(u.createdAt).toLocaleString() : "Today",
        reportsCount: 0
      } as AdminUserRecord
    })

    const deduped = new Map<string, AdminUserRecord>()
    const getKey = (item: AdminUserRecord) =>
      `${String(item.name || "").toLowerCase().trim()}::${String(item.email || "").toLowerCase().trim()}`

    // Put live dbUsers FIRST so new registrations & global sign-ins appear at the top
    ;[...dbUsers, ...ADMIN_USERS_DIRECTORY].forEach(item => {
      const key = getKey(item)
      if (!deduped.has(key)) {
        deduped.set(key, item)
      }
    })

    const combinedUsers = Array.from(deduped.values())

    // Merge local activity logs with global cloud activity logs
    const actMap = new Map<string, any>()
    ;[...(cloudTelemetry.activityLogs || []), ...connectinDb.getActivityLogs()].forEach(ev => {
      if (ev && ev.id && !actMap.has(ev.id)) actMap.set(ev.id, ev)
    })

    const mergedVerifications = [
      ...(cloudTelemetry.verifications || []),
      ...ADMIN_VERIFICATION_REQUESTS
    ]
    const mergedAuditLogs = [
      ...(cloudTelemetry.auditLogs || []),
      ...ADMIN_AUDIT_LOG_DATA
    ]
    const mergedSocEvents = [
      ...(cloudTelemetry.socEvents || []),
      ...SOC_SECURITY_EVENTS
    ]

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analytics: EXECUTIVE_ANALYTICS_DATA,
      users: combinedUsers,
      content: ADMIN_CONTENT_DIRECTORY,
      cases: MODERATION_CASES_DATA,
      companies: ADMIN_COMPANIES_DIRECTORY,
      jobs: ADMIN_JOBS_DIRECTORY,
      verifications: mergedVerifications,
      config: INITIAL_PLATFORM_CONFIG,
      roles: PLATFORM_RBAC_ROLES,
      auditLogs: mergedAuditLogs,
      activityLogs: Array.from(actMap.values()),
      socEvents: mergedSocEvents,
      broadcasts: BROADCAST_NOTIFICATIONS_DATA,
      approvals: FOUR_EYES_APPROVALS_DATA
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve admin telemetry" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, payload, adminEmail = 'alex.taylor@expedite-consults.com' } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing required 'action' parameter" },
        { status: 400 }
      )
    }

    const auditEntry = {
      id: `LOG-${Date.now()}`,
      adminEmail,
      action: action,
      targetEntity: payload?.targetEntity || payload?.targetId || 'System Resource',
      reason: payload?.reason || 'Administrative action processed via Control Center',
      ipAddress: '198.51.100.42 (Internal Admin Enclave)',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EST',
      status: 'Success' as const
    }

    // In-memory response with simulated mutation confirmation
    return NextResponse.json({
      success: true,
      message: `Action '${action}' executed successfully.`,
      auditLogged: auditEntry,
      payload
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute administrative action" },
      { status: 500 }
    )
  }
}
