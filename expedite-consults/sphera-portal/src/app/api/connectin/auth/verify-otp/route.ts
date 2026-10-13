import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { validateOTP } from "@/lib/connectin-otp"
import { isSuperAdminUser, resolveDisplayName } from "@/lib/connectin-profile"
import { findProfessionById, findEnclaveById } from "@/lib/connectin-professions"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      target,
      code,
      name: incomingName,
      role: incomingRole,
      headline: incomingHeadline,
      profession: incomingProfession,
      professionId: incomingProfessionId,
      professionCategory: incomingCategory,
      professionEnclave: incomingEnclave,
      otpChallengeToken: incomingChallengeToken
    } = body

    if (!target || !code) {
      return NextResponse.json({ error: "Target email/phone and 6-digit code are required." }, { status: 400 })
    }

    const cleanTarget = target.toLowerCase().trim()
    const cookieChallenge = req.cookies.get("connectin_otp_challenge")?.value
    const challengeToken = incomingChallengeToken || cookieChallenge

    // 1. Verify OTP using signed cryptographic challenge, Twilio Verify API, and DB checks
    const phoneDigits = (body.phone ? String(body.phone) : cleanTarget).replace(/[^\d]/g, "")
    const targetsToCheck = Array.from(new Set([
      cleanTarget,
      body.phone ? String(body.phone).trim() : null,
      body.email ? String(body.email).toLowerCase().trim() : null,
      cleanTarget.replace(/[^\d+]/g, ""),
      phoneDigits ? `+1${phoneDigits.slice(-10)}` : null,
      phoneDigits ? phoneDigits.slice(-10) : null,
      phoneDigits ? `+${phoneDigits}` : null
    ].filter(Boolean) as string[]))

    let isValid = false
    for (const tgt of targetsToCheck) {
      if (await validateOTP(tgt, code, challengeToken)) {
        isValid = true
        break
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 401 })
    }

    // Determine displayName intelligently from user input or email structure
    const displayName = resolveDisplayName(incomingName, cleanTarget)
    const isSuperAdmin = isSuperAdminUser({ name: displayName, email: cleanTarget, role: incomingRole })
    const userRole = isSuperAdmin ? "admin" : (incomingRole || "personal")

    // Resolve profession details if provided
    const profDef = incomingProfessionId ? findProfessionById(incomingProfessionId) : undefined
    const enclaveDef = profDef ? findEnclaveById(profDef.enclaveId) : (incomingEnclave ? findEnclaveById(incomingEnclave) : undefined)

    // 2. Find or auto-hydrate user across serverless lambdas
    let user = connectinDb.findUserByEmail(cleanTarget)
    let profile = user ? connectinDb.findProfileByUserId(user.id) : undefined

    if (!user || !profile) {
      const finalProfessionTitle = profDef ? profDef.title : (incomingProfession || (isSuperAdmin ? "Platform IAM Architect & Super Admin" : "Master Carpenter (Framing & Finish Joinery)"))
      const finalProfessionId = profDef ? profDef.id : (incomingProfessionId || (isSuperAdmin ? "platform_admin" : "carpenter"))
      const finalEnclaveId = profDef ? profDef.enclaveId : (incomingEnclave || (isSuperAdmin ? "law_gov_defense" : "trades_construction"))
      const finalCategory = profDef ? profDef.categoryName : (incomingCategory || (isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction"))
      const finalClearance = isSuperAdmin
        ? "TS/SCI Polygraph (Level 5 Top Secret Enclave)"
        : (enclaveDef?.securityClearanceTier || "Standard Verified Identity (Level 2)")
      const finalHeadline = incomingHeadline || (profDef?.defaultHeadline) || (isSuperAdmin ? "Platform IAM & Super Administrator · ConnectIn Master Control" : `${finalProfessionTitle} · Verified ConnectIn Member`)
      const finalSkills = (profDef?.typicalSkills && profDef.typicalSkills.length > 0)
        ? profDef.typicalSkills
        : (isSuperAdmin ? ["Zero Trust IAM", "eBPF SIEM Telemetry", "FedRAMP High IAM"] : ["Trade Skills", "Project Management"])

      const created = connectinDb.createUser(
        {
          email: cleanTarget,
          role: userRole,
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "email"
        },
        {
          name: displayName,
          headline: finalHeadline,
          avatar: isSuperAdmin && cleanNameOrEmailIsHayes(displayName, cleanTarget)
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
            : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName + "-" + cleanTarget)}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`,
          coverImage: finalEnclaveId === 'trades_construction'
            ? "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"
            : finalEnclaveId === 'healthcare_medicine'
            ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: isSuperAdmin ? "Washington, DC · Top Secret Security Operations Center" : "United States · Cryptographically Verified",
          about: isSuperAdmin ? "Lead Platform IAM Architect and Master Administrator." : `Verified ${finalProfessionTitle} operating in the ${enclaveDef?.name || 'ConnectIn'} Enclave.`,
          skills: finalSkills,
          clearanceLevel: finalClearance,
          fido2MfaVerified: true,
          cryptoVerificationBadge: isSuperAdmin ? "0xED25519_SUPER_ADMIN_ROOT_KEY" : "0xED25519_SESSION_INITIALIZED",
          skillMatrixScore: isSuperAdmin ? 99.9 : 65.0,
          connectionsCount: isSuperAdmin ? 42800 : 0,
          followersCount: isSuperAdmin ? 98400 : 0,
          profileViews: isSuperAdmin ? 19400 : 0,
          postImpressions: isSuperAdmin ? 520000 : 0,
          profession: finalProfessionTitle,
          professionId: finalProfessionId,
          professionCategory: finalCategory,
          professionEnclave: finalEnclaveId
        }
      )
      user = created.user
      profile = created.profile
    } else {
      if (isSuperAdmin && user.role !== "admin") {
        user.role = "admin"
      }
      if (displayName && profile.name !== displayName) {
        profile.name = displayName
      }
      // If incoming profession information was submitted during OTP, update profile
      if (profDef) {
        profile.profession = profDef.title
        profile.professionId = profDef.id
        profile.professionCategory = profDef.categoryName
        profile.professionEnclave = profDef.enclaveId
        if (profDef.defaultHeadline && (!profile.headline || profile.headline.includes("Professional"))) {
          profile.headline = profDef.defaultHeadline
        }
        if (profDef.typicalSkills && profDef.typicalSkills.length > 0 && (!profile.skills || profile.skills.length === 0)) {
          profile.skills = profDef.typicalSkills
        }
        if (enclaveDef?.securityClearanceTier && !isSuperAdmin) {
          profile.clearanceLevel = enclaveDef.securityClearanceTier
        }
      } else if (incomingProfession && !profile.profession) {
        profile.profession = incomingProfession
        if (incomingEnclave) profile.professionEnclave = incomingEnclave
        if (incomingCategory) profile.professionCategory = incomingCategory
      }
    }

    function cleanNameOrEmailIsHayes(name: string, email: string) {
      return name.toLowerCase().includes("robert hayes") || email.toLowerCase().includes("robert.hayes") || email.toLowerCase() === "sec-admin@connectin.internal"
    }

    // 3. Create persistent cryptographic session
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || "Web Browser"

    const session = connectinDb.createSession(user.id, {
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress.split(",")[0],
      userAgent,
      location: "United States · Cryptographic Enclave"
    })

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
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

    // Clear consumed challenge cookie
    response.cookies.set("connectin_otp_challenge", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    })

    return response
  } catch (error: any) {
    console.error("[/api/connectin/auth/verify-otp]", error)
    return NextResponse.json({ error: error.message || "OTP verification failed" }, { status: 500 })
  }
}
