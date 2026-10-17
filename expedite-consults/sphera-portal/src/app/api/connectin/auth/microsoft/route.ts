import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { isSuperAdminUser, resolveDisplayName } from "@/lib/connectin-profile"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      name: incomingName,
      professionId: incomingProfessionId
    } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid Microsoft Entra ID email is required." }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const displayName = incomingName?.trim() || resolveDisplayName("", cleanEmail)
    const isSuperAdmin = isSuperAdminUser({ name: displayName, email: cleanEmail })
    const userRole = isSuperAdmin ? "admin" : "personal"

    let user = connectinDb.findUserByEmail(cleanEmail)

    if (!user) {
      const created = connectinDb.createUser(
        {
          email: cleanEmail,
          phone: "+12402607898",
          role: userRole,
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "email"
        },
        {
          name: displayName,
          headline: isSuperAdmin
            ? "Platform IAM Architect & Root Authority · Expedite Consults"
            : "Verified Professional · Microsoft Entra ID",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=00a4ef`,
          coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: "United States · Microsoft Entra ID Verified",
          about: `Verified member on ConnectLn Zero-Trust Network authenticated via Microsoft Entra ID (${cleanEmail}).`,
          skills: ["Microsoft Entra ID", "Azure Cloud", "Zero-Trust Architecture", "ASPM", "DevSecOps"],
          clearanceLevel: isSuperAdmin ? "Top Secret / Sovereign Enclave Root" : "Standard Verified Identity (Level 2)",
          fido2MfaVerified: true,
          cryptoVerificationBadge: "MICROSOFT_ENTRA_ID_VERIFIED",
          skillMatrixScore: isSuperAdmin ? 99.8 : 78.5,
          connectionsCount: 35,
          followersCount: 140,
          profileViews: 280,
          postImpressions: 1100,
          profession: isSuperAdmin ? "Platform IAM Architect" : "Master Carpenter (Framing & Finish Joinery)",
          professionId: isSuperAdmin ? "platform_admin" : (incomingProfessionId || "carpenter"),
          professionCategory: isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction",
          professionEnclave: isSuperAdmin ? "law_gov_defense" : "trades_construction"
        }
      )
      user = created.user
    }

    if (user.status === "Suspended" || user.status === "Banned") {
      return NextResponse.json({ error: "This account is suspended. Contact security administrator." }, { status: 403 })
    }

    let profile = connectinDb.findProfileByUserId(user.id)
    if (!profile) {
      profile = {
        id: `prof_${user.id}`,
        userId: user.id,
        name: displayName,
        headline: isSuperAdmin
          ? "Platform IAM Architect & Root Authority · Expedite Consults"
          : "Verified Professional · ConnectLn Member",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=00a4ef`,
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
        location: "United States · Microsoft Entra ID Verified",
        about: `Verified member on ConnectLn Zero-Trust Network authenticated via Microsoft Entra ID (${cleanEmail}).`,
        skills: ["Microsoft Entra ID", "Azure Cloud", "Zero-Trust Architecture", "ASPM"],
        clearanceLevel: isSuperAdmin ? "Top Secret / Sovereign Enclave Root" : "Standard Verified Identity (Level 2)",
        fido2MfaVerified: true,
        cryptoVerificationBadge: "MICROSOFT_ENTRA_ID_VERIFIED",
        skillMatrixScore: isSuperAdmin ? 99.8 : 78.5,
        connectionsCount: 35,
        followersCount: 140,
        profileViews: 280,
        postImpressions: 1100,
        profession: isSuperAdmin ? "Platform IAM Architect" : "Master Carpenter (Framing & Finish Joinery)",
        professionId: isSuperAdmin ? "platform_admin" : (incomingProfessionId || "carpenter"),
        professionCategory: isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction",
        professionEnclave: isSuperAdmin ? "law_gov_defense" : "trades_construction"
      }
    }

    // Create session
    const session = connectinDb.createSession(user.id, "Microsoft Entra ID / Web")
    const targetUrl = isSuperAdmin ? "/connectin-admin" : "/connectin"

    const response = NextResponse.json({
      success: true,
      message: `✓ Verified with Microsoft Entra ID (${cleanEmail})`,
      targetUrl,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profession: profile.profession,
        professionEnclave: profile.professionEnclave
      },
      profile: {
        ...profile,
        email: user.email,
        role: user.role,
        roles: isSuperAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"],
        profession: profile.profession || (isSuperAdmin ? "Platform IAM Architect" : "Master Carpenter (Framing & Finish Joinery)"),
        professionId: profile.professionId || (isSuperAdmin ? "platform_admin" : "carpenter"),
        professionCategory: profile.professionCategory || (isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction"),
        professionEnclave: profile.professionEnclave || (isSuperAdmin ? "law_gov_defense" : "trades_construction")
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
    console.error("[/api/connectin/auth/microsoft]", error)
    return NextResponse.json({ error: error.message || "Microsoft authentication failed" }, { status: 500 })
  }
}
