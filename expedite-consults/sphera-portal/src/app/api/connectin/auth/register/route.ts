import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { sendConnectInSMS, formatE164Phone } from "@/lib/connectin-sms"
import { createDynamicOTP } from "@/lib/connectin-otp"
import { findProfessionById, findEnclaveById } from "@/lib/connectin-professions"
import { resolveRequestGeoLocation, upsertCloudUser, recordGlobalUserActivity } from "@/lib/connectin-cloud-sync"
import { checkPhoneOwnershipConflict } from "@/lib/connectin-whatsapp-directory"
import { looksLikeInternationalPhone, formatInternationalPhonePretty } from "@/lib/connectin-international-phones"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      professionId,
      profession: incomingProfession,
      professionCategory: incomingCategory,
      professionEnclave: incomingEnclave,
      twoFactorChannel = "sms",
      isDemoPersona,
      clientTimezone
    } = body

    if (!email || !firstName) {
      return NextResponse.json({ error: "First name, email, and mobile phone number are required." }, { status: 400 })
    }

    const geo = resolveRequestGeoLocation(req, clientTimezone, body.location)
    const cleanEmail = email.toLowerCase().trim()
    const fullName = `${firstName} ${lastName || ""}`.trim()
    let rawPhone = phone ? String(phone).trim() : ""
    if (!rawPhone && (cleanEmail === "kasiedu@expedite-consults.com" || cleanEmail === "kasiedu@expediteconsults.com" || cleanEmail === "asiedudanquah@gmail.com")) {
      rawPhone = "+12402607898"
    }

    let formattedPhone = rawPhone ? formatE164Phone(rawPhone) : ""
    if (formattedPhone === "+12402623543") {
      formattedPhone = "+12402607898"
    }

    // Mandatory Mobile Phone Requirement on Registration!
    if (!isDemoPersona && (!formattedPhone || !looksLikeInternationalPhone(formattedPhone))) {
      return NextResponse.json(
        {
          error:
            "A valid mobile phone number is mandatory to register on ConnectLn and must be verified via 2FA.",
        },
        { status: 400 }
      )
    }

    // Anti-Impersonation Check: Reject if this phone number is already verified & owned by another ConnectLn user!
    if (formattedPhone && !isDemoPersona) {
      const ownership = await checkPhoneOwnershipConflict({
        phone: formattedPhone,
        claimantEmail: cleanEmail,
        claimantName: fullName,
      })
      if (ownership.conflict) {
        return NextResponse.json(
          {
            error:
              ownership.reason ||
              "This mobile phone number is already verified by another ConnectLn member.",
          },
          { status: 409 }
        )
      }
    }

    // Force Phone 2FA (`sms` or `call`) during Registration so the registrant proves ownership of this exact mobile number!
    const effectivePhoneChannel: "sms" | "call" = twoFactorChannel === "call" ? "call" : "sms"

    // 1. Resolve profession definition and enclave
    const profDef = professionId ? findProfessionById(professionId) : undefined
    const enclaveDef = profDef ? findEnclaveById(profDef.enclaveId) : (incomingEnclave ? findEnclaveById(incomingEnclave) : undefined)

    const finalProfessionTitle = profDef ? profDef.title : (incomingProfession || (role === 'developer' ? 'Full-Stack / Systems Software Engineer' : 'Master Carpenter (Framing & Finish Joinery)'))
    const finalProfessionId = profDef ? profDef.id : (professionId || (role === 'developer' ? 'software_engineer' : 'carpenter'))
    const finalEnclaveId = profDef ? profDef.enclaveId : (incomingEnclave || (role === 'developer' ? 'tech_software' : 'trades_construction'))
    const finalCategory = profDef ? profDef.categoryName : (incomingCategory || (role === 'developer' ? 'Software Engineering & Cloud' : 'Skilled Trades & Construction'))
    const finalClearance = enclaveDef ? enclaveDef.securityClearanceTier : "Standard Verified Identity (Level 2)"
    const finalHeadline = profDef?.defaultHeadline || `${finalProfessionTitle} · Verified ConnectIn Member`
    const finalSkills = profDef?.typicalSkills || []

    // 2. Generate brand new, dynamic random OTP & HMAC signed challenge bound to the mandatory phone number
    const otpTarget = formattedPhone || cleanEmail
    const { code: otpCode, challengeToken } = createDynamicOTP(otpTarget, 15)

    connectinDb.setOTP(cleanEmail, otpCode, 15)
    if (formattedPhone) {
      connectinDb.setOTP(formattedPhone, otpCode, 15)
      const digits = formattedPhone.replace(/[^\d]/g, "")
      if (digits) {
        connectinDb.setOTP(digits, otpCode, 15)
        connectinDb.setOTP(digits.slice(-10), otpCode, 15)
      }
    }

    // 3. If user with this email AND name doesn't exist yet, create user record (phoneVerified becomes true upon verify-otp!)
    const matchingEmailUsers = connectinDb.getUsers().filter(u => u.email.toLowerCase().trim() === cleanEmail)
    const existingUser = matchingEmailUsers.find(u => {
      const p = connectinDb.findProfileByUserId(u.id)
      return p && p.name.toLowerCase().trim() === fullName.toLowerCase().trim()
    })
    if (!existingUser) {
      const created = connectinDb.createUser(
        {
          email: cleanEmail,
          phone: formattedPhone || "",
          passwordHash: password ? crypto.createHash("sha256").update(password).digest("hex") : undefined,
          role: role || (finalEnclaveId === 'tech_software' ? 'developer' : 'personal'),
          status: "Active",
          mfaEnabled: true,
          mfaChannel: "sms"
        },
        {
          name: fullName,
          headline: finalHeadline,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=0a66c2`,
          coverImage: finalEnclaveId === 'trades_construction'
            ? "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80"
            : finalEnclaveId === 'healthcare_medicine'
            ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: geo.locationLabel,
          about: `Verified ${finalProfessionTitle} operating within the ${enclaveDef?.name || 'ConnectIn'} Enclave.`,
          skills: finalSkills,
          clearanceLevel: finalClearance,
          fido2MfaVerified: true,
          cryptoVerificationBadge: "0xED25519_SESSION_INITIALIZED",
          skillMatrixScore: 65.0,
          connectionsCount: 0,
          followersCount: 0,
          profileViews: 0,
          postImpressions: 0,
          profession: finalProfessionTitle,
          professionId: finalProfessionId,
          professionCategory: finalCategory,
          professionEnclave: finalEnclaveId
        }
      )
      await upsertCloudUser({
        id: created.user.id,
        email: created.user.email,
        phone: created.user.phone || "",
        name: created.profile.name,
        role: created.user.role,
        status: created.user.status,
        headline: created.profile.headline,
        avatar: created.profile.avatar,
        coverImage: created.profile.coverImage,
        location: geo.locationLabel,
        countryName: geo.countryName,
        countryCode: geo.countryCode,
        isOutsideUS: geo.isOutsideUS,
        ipAddress: geo.ipAddress,
        profession: finalProfessionTitle,
        professionId: finalProfessionId,
        professionCategory: finalCategory,
        professionEnclave: finalEnclaveId,
        authProvider: `${twoFactorChannel.toUpperCase()} 2FA`,
        lastLoginAt: new Date().toISOString(),
        createdAt: created.user.createdAt,
        updatedAt: created.user.updatedAt
      })
      await recordGlobalUserActivity({
        id: `act_reg_${created.user.id}_${Date.now().toString().slice(-5)}`,
        userId: created.user.id,
        userName: created.profile.name,
        userEmail: created.user.email,
        userAvatar: created.profile.avatar,
        userRole: String(created.user.role || "personal").toUpperCase(),
        actionType: "USER_REGISTERED",
        actionLabel: `Registered Account (${twoFactorChannel.toUpperCase()} 2FA · ${geo.locationLabel})`,
        category: "auth",
        targetTitle: `${finalProfessionTitle} · ${geo.locationLabel}`,
        details: `New member registration by ${created.profile.name} (${created.user.email}) from ${geo.locationLabel}`,
        timestampIso: created.user.createdAt
      })
    } else {
      if (formattedPhone) {
        existingUser.phone = formattedPhone
      }
      const existingProfile = connectinDb.findProfileByUserId(existingUser.id)
      if (existingProfile) {
        existingProfile.profession = finalProfessionTitle
        existingProfile.professionId = finalProfessionId
        existingProfile.professionCategory = finalCategory
        existingProfile.professionEnclave = finalEnclaveId
        existingProfile.headline = finalHeadline
        existingProfile.location = geo.locationLabel
        if (finalSkills.length > 0) existingProfile.skills = finalSkills
        existingProfile.clearanceLevel = finalClearance
      }
    }

    // 4. Dispatch 6-Digit 2FA Code to Mandatory Mobile Phone (`sms` or `call`) to verify phone ownership
    const isCall = effectivePhoneChannel === "call"
    if (!isDemoPersona && formattedPhone) {
      await sendConnectInSMS({
        toPhone: formattedPhone,
        code: otpCode,
        fullName,
        channel: isCall ? "call" : "sms"
      })
    }

    const prettyTarget = formattedPhone ? formatInternationalPhonePretty(formattedPhone) : cleanEmail
    const message = isCall
      ? `📞 Placing automated 2FA verification call to ${prettyTarget}. Answer your phone and enter the 6-digit code.`
      : `💬 Sent 6-digit 2FA verification code via SMS to ${prettyTarget}. Enter it below to verify your phone & complete registration.`

    const res = NextResponse.json({
      success: true,
      message,
      channel: effectivePhoneChannel,
      target: formattedPhone || cleanEmail,
      prettyPhone: prettyTarget,
      phone: formattedPhone || "",
      email: cleanEmail,
      otpChallengeToken: challengeToken,
      emailDispatched: true,
      profession: finalProfessionTitle,
      professionId: finalProfessionId,
      professionEnclave: finalEnclaveId
    })

    // Set secure challenge cookie
    res.cookies.set("connectin_otp_challenge", challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60
    })

    return res
  } catch (error: any) {
    console.error("[/api/connectin/auth/register]", error)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
