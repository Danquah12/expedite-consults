import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { auth } from "@/auth"
import { isSuperAdminUser } from "@/lib/connectin-profile"

export async function GET(req: NextRequest) {
  try {
    // 1. Check custom connectin_session token cookie or Authorization Bearer header
    let token = req.cookies.get("connectin_session")?.value
    if (!token) {
      const authHeader = req.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim()
      }
    }

    if (token) {
      const session = connectinDb.findSessionByToken(token)
      if (session) {
        const user = connectinDb.findUserById(session.userId)
        if (user) {
          const profile = connectinDb.findProfileByUserId(user.id)
          const activeSessions = connectinDb.getUserSessions(user.id)
          const isSuperAdmin = isSuperAdminUser(user) || isSuperAdminUser(profile)

          return NextResponse.json({
            authenticated: true,
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              role: isSuperAdmin ? "admin" : user.role,
              status: user.status
            },
            profile: profile ? {
              ...profile,
              role: isSuperAdmin ? "admin" : user.role,
              roles: isSuperAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"]
            } : profile,
            session: {
              sessionId: session.sessionId,
              deviceName: session.deviceName,
              ipAddress: session.ipAddress,
              location: session.location,
              createdAt: session.createdAt
            },
            activeSessions
          })
        }
      }
    }

    // 2. Check NextAuth OAuth session (Google / Microsoft Entra ID)
    try {
      const nextAuthSession = await auth()
      if (nextAuthSession?.user?.email) {
        const email = nextAuthSession.user.email.toLowerCase().trim()
        const provider = (nextAuthSession.user as any).provider || "oauth"
        let user = connectinDb.findUserByEmail(email)
        let profile = user ? connectinDb.findProfileByUserId(user.id) : undefined

        if (!user || !profile) {
          const defaultName = nextAuthSession.user.name || email.split("@")[0]
          const created = connectinDb.createUser(
            {
              email,
              role: "personal",
              status: "Active",
              mfaEnabled: true,
              mfaChannel: "email"
            },
            {
              name: defaultName,
              headline: `${provider === "microsoft-entra-id" ? "Microsoft Entra ID Verified Identity" : "Google Workspace Verified Identity"} · ConnectIn Member`,
              avatar: nextAuthSession.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=0a66c2`,
              coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
              location: "United States · Cryptographically Verified",
              about: `Verified member authenticated via ${provider === "microsoft-entra-id" ? "Microsoft Entra ID" : "Google"} OAuth 2.0 infrastructure.`,
              skills: [],
              clearanceLevel: provider === "microsoft-entra-id" ? "Enterprise Clearance (Level 3)" : "Standard Verified Identity (Level 2)",
              fido2MfaVerified: true,
              cryptoVerificationBadge: provider === "microsoft-entra-id" ? "0xENTRA_ID_OAUTH2_ACTIVE" : "0xGOOGLE_OAUTH2_ACTIVE",
              skillMatrixScore: 50.0,
              connectionsCount: 0,
              followersCount: 0,
              profileViews: 0,
              postImpressions: 0
            }
          )
          user = created.user
          profile = created.profile
        }

        const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
        const session = connectinDb.createSession(user.id, {
          ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress.split(",")[0],
          userAgent: req.headers.get("user-agent") || "OAuth Client",
          location: "United States · Cryptographic Enclave"
        })

        const res = NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
          },
          profile,
          session: {
            sessionId: session.sessionId,
            deviceName: session.deviceName,
            ipAddress: session.ipAddress,
            location: session.location,
            createdAt: session.createdAt
          },
          activeSessions: connectinDb.getUserSessions(user.id)
        })

        res.cookies.set("connectin_session", session.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60
        })

        return res
      }
    } catch (authErr) {
      console.warn("[/api/connectin/auth/me] NextAuth check notice:", authErr)
    }

    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error: any) {
    console.error("[/api/connectin/auth/me]", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}
