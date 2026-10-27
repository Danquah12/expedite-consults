import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { validateOTP } from "@/lib/connectin-otp"
import {
  resolveRequestGeoLocation,
  upsertCloudUser,
  appendCloudTelemetry
} from "@/lib/connectin-cloud-sync"
import {
  isSuperAdminUser,
  resolveDisplayName,
  getKnownDemoPersonaAvatar,
  generatePersonalSignatureAvatar,
  isForeignPersonaAvatar
} from "@/lib/connectin-profile"
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
    const cleanEmail = (body.email ? String(body.email) : cleanTarget).toLowerCase().trim()
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
    const displayName = resolveDisplayName(incomingName, cleanEmail)
    const isSuperAdmin = isSuperAdminUser({ name: displayName, email: cleanEmail, role: incomingRole })
    const userRole = isSuperAdmin ? "admin" : (incomingRole || "personal")

    // Resolve profession details if provided
    const profDef = incomingProfessionId ? findProfessionById(incomingProfessionId) : undefined
    const enclaveDef = profDef ? findEnclaveById(profDef.enclaveId) : (incomingEnclave ? findEnclaveById(incomingEnclave) : undefined)

    // 2. Find or auto-hydrate user across serverless lambdas
    // Match by BOTH email and name (when incomingName is provided) so signing in with a new name creates a distinct user record
    const allMatchingEmailUsers = connectinDb
      .getUsers()
      .filter(
        u =>
          u.email.toLowerCase().trim() === cleanEmail ||
          (cleanTarget.includes("@") && u.email.toLowerCase().trim() === cleanTarget)
      )

    let user = allMatchingEmailUsers.find(u => {
      const p = connectinDb.findProfileByUserId(u.id)
      if (!p) return false
      if (incomingName && incomingName.trim()) {
        return p.name.toLowerCase().trim() === displayName.toLowerCase().trim()
      }
      return true
    })
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

      const resolvedAvatar =
        getKnownDemoPersonaAvatar({ name: displayName, email: cleanEmail }) ||
        generatePersonalSignatureAvatar({ name: displayName, email: cleanEmail, professionEnclave: finalEnclaveId })

      const created = connectinDb.createUser(
        {
          email: cleanEmail,
          role: userRole,
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "email"
        },
        {
          name: displayName,
          headline: finalHeadline,
          avatar: resolvedAvatar,
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
      const nameChanged = Boolean(incomingName?.trim() && profile.name.toLowerCase().trim() !== displayName.toLowerCase().trim())
      if (isSuperAdmin && user.role !== "admin") {
        user.role = "admin"
      } else if (!isSuperAdmin && user.role === "admin") {
        user.role = userRole
      }
      if (displayName && profile.name !== displayName) {
        profile.name = displayName
      }
      // If name changed to a non-admin user, ensure admin-specific headline/profession don't bleed over
      if (nameChanged && !isSuperAdmin) {
        const nextProfTitle = profDef?.title || incomingProfession || "Master Carpenter (Framing & Finish Joinery)"
        const nextProfId = profDef?.id || incomingProfessionId || "carpenter"
        const nextCategory = profDef?.categoryName || incomingCategory || "Skilled Trades & Construction"
        const nextEnclave = profDef?.enclaveId || incomingEnclave || "trades_construction"
        profile.profession = nextProfTitle
        profile.professionId = nextProfId
        profile.professionCategory = nextCategory
        profile.professionEnclave = nextEnclave
        profile.headline = incomingHeadline || profDef?.defaultHeadline || `${nextProfTitle} · Verified ConnectIn Member`
        profile.about = `Verified ${nextProfTitle} operating in the ${enclaveDef?.name || 'ConnectIn'} Enclave.`
        profile.clearanceLevel = enclaveDef?.securityClearanceTier || "Standard Verified Identity (Level 2)"
      }
      // If name changed or existing avatar belongs to a foreign persona, regenerate user's personal signature avatar
      if (
        nameChanged ||
        !profile.avatar ||
        profile.avatar.includes("api.dicebear.com") ||
        isForeignPersonaAvatar(profile.avatar, { name: profile.name, email: cleanEmail })
      ) {
        profile.avatar =
          getKnownDemoPersonaAvatar({ name: profile.name, email: cleanEmail }) ||
          generatePersonalSignatureAvatar({ name: profile.name, email: cleanEmail, professionEnclave: profile.professionEnclave })
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

    // 3. Resolve real global Geo-IP / Country location & persist to global Cloud Sync Map
    const geo = resolveRequestGeoLocation(req, body.clientTimezone, body.location)
    if (!profile.location || profile.location.includes("United States") || profile.location.includes("Cryptographically")) {
      profile.location = isSuperAdmin
        ? `Washington, DC · ${geo.locationLabel}`
        : geo.locationLabel
    }

    const authMethodLabel = cleanTarget.includes("@") ? "Email 2FA" : "Phone/SMS 2FA"
    connectinDb.touchUserLogin(user.id, authMethodLabel)
    ;(user as any).countryName = geo.countryName
    ;(user as any).countryCode = geo.countryCode
    ;(user as any).isOutsideUS = geo.isOutsideUS
    ;(user as any).ipAddress = geo.ipAddress

    const session = connectinDb.createSession(user.id, {
      ipAddress: geo.ipAddress,
      userAgent: geo.userAgent,
      location: geo.locationLabel
    })

    const effectiveRole = isSuperAdmin ? "admin" : (user.role === "admin" ? "personal" : user.role)
    const nowIso = new Date().toISOString()
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    await Promise.all([
      upsertCloudUser({
        id: user.id,
        email: user.email,
        phone: user.phone || "",
        name: profile.name,
        role: effectiveRole,
        status: user.status,
        headline: profile.headline,
        avatar: profile.avatar,
        coverImage: profile.coverImage,
        location: profile.location,
        countryName: geo.countryName,
        countryCode: geo.countryCode,
        isOutsideUS: geo.isOutsideUS,
        ipAddress: geo.ipAddress,
        about: profile.about,
        skills: profile.skills,
        profession: profile.profession,
        professionId: profile.professionId,
        professionCategory: profile.professionCategory,
        professionEnclave: profile.professionEnclave,
        authProvider: authMethodLabel,
        lastLoginAt: nowIso,
        createdAt: user.createdAt || nowIso,
        updatedAt: nowIso
      }),
      appendCloudTelemetry({
        activityLog: {
          id: `act_otp_${user.id}_${Date.now().toString().slice(-5)}`,
          userId: user.id,
          userName: profile.name,
          userEmail: user.email,
          userAvatar: profile.avatar,
          userHeadline: profile.headline,
          actionType: "USER_LOGIN",
          actionLabel: `Signed In via ${authMethodLabel} (${geo.locationLabel})`,
          category: "auth",
          targetTitle: `${authMethodLabel} · ${geo.locationLabel}`,
          details: `Verified 2FA login from ${geo.locationLabel} (IP: ${geo.ipAddress})`,
          timestamp: `${timeStr} · ${geo.countryName}`,
          createdAtIso: nowIso
        },
        auditLog: {
          id: `LOG-${Date.now().toString().slice(-6)}`,
          adminEmail: user.email,
          action: "USER_ACTIVATED",
          targetEntity: `${profile.name} (${user.email})`,
          reason: `2FA authenticated login from ${geo.locationLabel}`,
          ipAddress: `${geo.ipAddress} (${geo.locationLabel})`,
          timestamp: timeStr,
          status: "Success"
        },
        socEvent: {
          id: `SOC-OTP-${Date.now().toString().slice(-5)}`,
          severity: "Low",
          eventType: `2FA Authenticated Session (${geo.countryName})`,
          sourceIp: `${geo.ipAddress} (${geo.locationLabel})`,
          targetAccount: `${profile.name} (${user.email})`,
          mitigationAction: `Verified ${authMethodLabel} Session Active`,
          timestamp: "Just Now"
        },
        verification: {
          id: `VER-${user.id}`,
          applicantName: profile.name,
          applicantEmail: user.email,
          applicantAvatar: profile.avatar,
          requestType: "Executive Identity",
          submittedDocument: `${authMethodLabel} (${geo.locationLabel})`,
          organizationName: profile.profession || "ConnectIn Global Network",
          submittedAt: "Just Now",
          status: "Approved"
        }
      })
    ])

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: effectiveRole,
        status: user.status,
        location: profile.location,
        countryName: geo.countryName,
        countryCode: geo.countryCode,
        profession: profile.profession,
        professionEnclave: profile.professionEnclave
      },
      profile: {
        ...profile,
        email: user.email,
        location: profile.location,
        role: effectiveRole,
        roles: isSuperAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"],
        profession: profile.profession || (isSuperAdmin ? "Platform IAM Architect" : "Master Carpenter (Framing & Finish Joinery)"),
        professionId: (!isSuperAdmin && profile.professionId === "platform_admin") ? "carpenter" : (profile.professionId || (isSuperAdmin ? "platform_admin" : "carpenter")),
        professionCategory: profile.professionCategory || (isSuperAdmin ? "Legal & Governance" : "Skilled Trades & Construction"),
        professionEnclave: profile.professionEnclave || (isSuperAdmin ? "law_gov_defense" : "trades_construction")
      },
      session: {
        sessionId: session.sessionId,
        token: session.token,
        deviceName: session.deviceName,
        location: geo.locationLabel,
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
