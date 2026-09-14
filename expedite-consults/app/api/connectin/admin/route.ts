import { NextRequest, NextResponse } from "next/server"
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
  FOUR_EYES_APPROVALS_DATA
} from "@/lib/connectin-iam-data"

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analytics: EXECUTIVE_ANALYTICS_DATA,
      users: ADMIN_USERS_DIRECTORY,
      content: ADMIN_CONTENT_DIRECTORY,
      cases: MODERATION_CASES_DATA,
      companies: ADMIN_COMPANIES_DIRECTORY,
      jobs: ADMIN_JOBS_DIRECTORY,
      verifications: ADMIN_VERIFICATION_REQUESTS,
      config: INITIAL_PLATFORM_CONFIG,
      roles: PLATFORM_RBAC_ROLES,
      auditLogs: ADMIN_AUDIT_LOG_DATA,
      socEvents: SOC_SECURITY_EVENTS,
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
