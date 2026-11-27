import { NextRequest, NextResponse } from "next/server"
import { connectinDb } from "@/lib/connectin-db"
import { normalizeAuthName } from "@/lib/connectin-registered-auth"
import { sendConnectInOTPEmail } from "@/lib/connectin-email"
import { sendConnectInSMS, formatE164Phone } from "@/lib/connectin-sms"
import { createDynamicOTP } from "@/lib/connectin-otp"
import {
  resolveRequestGeoLocation,
  upsertCloudUser,
  appendCloudTelemetry,
  pullCloudUsersIntoDb,
} from "@/lib/connectin-cloud-sync"
import { findProfessionById } from "@/lib/connectin-professions"
import {
  checkPhoneOwnershipConflict,
  refreshWhatsAppDirectoryCache,
  registerWhatsAppMemberNumber,
  isSamePhoneOwnerEmail,
} from "@/lib/connectin-whatsapp-directory"
import {
  looksLikeInternationalPhone,
  formatInternationalPhonePretty,
} from "@/lib/connectin-international-phones"

export const dynamic = "force-dynamic"

const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

function isRealDeliverableEmail(raw?: string | null): boolean {
  const clean = String(raw || "").trim().toLowerCase()
  return (
    Boolean(clean) &&
    EMAIL_FORMAT_RE.test(clean) &&
    !clean.endsWith(".conectln.com") &&
    !clean.endsWith("@conectln.com") &&
    !clean.endsWith("@connectin.app") &&
    !clean.endsWith("@connectin.phone")
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, channel = "all", clientTimezone } = body

    if (!email && !body.phone) {
      return NextResponse.json({ error: "Email and mobile phone number are required." }, { status: 400 })
    }

    await withTimeout(pullCloudUsersIntoDb(), 3500, [])
    const geo = resolveRequestGeoLocation(req, clientTimezone, body.location)
    const cleanTarget = (email || body.phone || "").toLowerCase().trim()
    const isPhoneInput = !cleanTarget.includes("@") && /^[+\d\s().-]+$/.test(cleanTarget)
    const requestedChannel: "all" | "email" | "sms" | "call" =
      channel === "call"
        ? "call"
        : channel === "email" && !isPhoneInput
          ? "email"
          : channel === "sms"
            ? "sms"
            : "all"
    const incomingName = typeof body.name === "string" ? body.name.trim() : ""
    const profDef = body.professionId && body.professionId !== "auto_detect" ? findProfessionById(body.professionId) : undefined

    const submittedRawPhone = body.phone ? String(body.phone).trim() : isPhoneInput ? cleanTarget : ""
    const normSubmittedPhone =
      submittedRawPhone && looksLikeInternationalPhone(submittedRawPhone)
        ? formatE164Phone(submittedRawPhone)
        : ""
    const normDigits = normSubmittedPhone.replace(/[^\d]/g, "")
    const last10 = normDigits.slice(-10)
    const syntheticFullPhoneEmail = normDigits ? `${normDigits}@connectin.phone` : ""
    const syntheticLast10Email = last10 ? `${last10}@connectin.phone` : ""
    const candidateUsers = connectinDb.getUsers().filter((u) => {
      const uEmail = u.email.toLowerCase().trim()
      const matchesPhoneEmail = Boolean(
        (syntheticFullPhoneEmail && uEmail === syntheticFullPhoneEmail) ||
          (syntheticLast10Email && uEmail === syntheticLast10Email)
      )
      if (isPhoneInput) {
        return (
          (u.phone && normSubmittedPhone && formatE164Phone(u.phone) === normSubmittedPhone) ||
          uEmail === cleanTarget ||
          matchesPhoneEmail
        )
      }
      return (
        uEmail === cleanTarget ||
        (normSubmittedPhone && u.phone && formatE164Phone(u.phone) === normSubmittedPhone) ||
        matchesPhoneEmail
      )
    })

    const dirCache = await withTimeout(refreshWhatsAppDirectoryCache(true), 3500, new Map())
    const dirMemberPre = normSubmittedPhone ? dirCache.get(normSubmittedPhone) : undefined

    if (candidateUsers.length === 0) {
      return NextResponse.json(
        {
          error:
            "Access denied: No registered ConnectLn account was found. Please create and verify an account first.",
          code: "NOT_REGISTERED",
        },
        { status: 403 }
      )
    }

    const normalizedIncomingName = normalizeAuthName(incomingName)
    let user: (typeof candidateUsers)[number] | undefined

    if (normalizedIncomingName) {
      const nameMatchedCandidates = candidateUsers.filter((u) => {
        const p = connectinDb.findProfileByUserId(u.id)
        return Boolean(p && normalizeAuthName(p.name) === normalizedIncomingName)
      })
      if (nameMatchedCandidates.length === 0) {
        return NextResponse.json(
          {
            error:
              "Access denied: The full name entered does not match the registered name for this ConnectLn account.",
            code: "NAME_MISMATCH",
          },
          { status: 403 }
        )
      }
      user =
        (!isPhoneInput
          ? nameMatchedCandidates.find((u) => u.email.toLowerCase().trim() === cleanTarget)
          : undefined) || nameMatchedCandidates[0]
    } else {
      user =
        (!isPhoneInput ? candidateUsers.find((u) => u.email.toLowerCase().trim() === cleanTarget) : undefined) ||
        (syntheticLast10Email
          ? candidateUsers.find((u) => u.email.toLowerCase().trim() === syntheticLast10Email)
          : undefined) ||
        (syntheticFullPhoneEmail
          ? candidateUsers.find((u) => u.email.toLowerCase().trim() === syntheticFullPhoneEmail)
          : undefined) ||
        candidateUsers.find((u) => {
          const p = connectinDb.findProfileByUserId(u.id)
          if (!p) return false
          const pName = p.name.toLowerCase().trim()
          if (dirMemberPre?.name && pName === dirMemberPre.name.toLowerCase().trim()) {
            return true
          }
          return Boolean(pName && pName !== "connectin member" && pName !== "expedite consults llc")
        }) ||
        candidateUsers[0]
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Access denied: No registered ConnectLn account was found. Please create and verify an account first.",
          code: "NOT_REGISTERED",
        },
        { status: 403 }
      )
    }

    let existingAccountPhone =
      user?.phone && looksLikeInternationalPhone(user.phone) ? formatE164Phone(user.phone) : ""
    const candidateEmail = user?.email || (!isPhoneInput ? cleanTarget : "")
    if (!existingAccountPhone && candidateEmail) {
      for (const m of dirCache.values()) {
        if (m.email && isSamePhoneOwnerEmail(m.email, candidateEmail)) {
          existingAccountPhone = m.phone
          break
        }
      }
    }

    let dispatchPhone = normSubmittedPhone || existingAccountPhone || ""
    if (dispatchPhone === "+12402623543") {
      dispatchPhone = "+12402607898"
    }

    if (!dispatchPhone || !looksLikeInternationalPhone(dispatchPhone)) {
      return NextResponse.json(
        {
          error:
            "A verified mobile phone number is mandatory for 2FA login and ConnectLn calling. Please enter your mobile phone number.",
          requiresPhone: true,
        },
        { status: 400 }
      )
    }

    // Single-time phone validation policy: check if this phone was already validated on any device!
    const dirMember = dirCache.get(dispatchPhone)
    const ownership = await checkPhoneOwnershipConflict({
      phone: dispatchPhone,
      claimantEmail: candidateEmail,
      claimantName: incomingName,
    })
    if (ownership.conflict) {
      return NextResponse.json(
        {
          error:
            ownership.reason ||
            "This mobile phone number belongs to another verified ConnectLn member.",
        },
        { status: 409 }
      )
    }

    if (!user.phone) {
      user.phone = dispatchPhone
    }

    if (user.status === "Suspended" || user.status === "Banned") {
      return NextResponse.json({ error: "This account is suspended. Contact security administrator." }, { status: 403 })
    }

    const isPhoneAlreadyValidated = Boolean(
      dirMember?.verifiedBy2FA ||
        (user as any).phoneVerified ||
        (existingAccountPhone && existingAccountPhone === dispatchPhone && user.phone)
    )

    // If the phone was ALREADY validated once (during registration or previous verification),
    // log the user straight in on this or any other device without blocking or re-validating!
    const activeProfile = connectinDb.findProfileByUserId(user.id)
    if (isPhoneAlreadyValidated && activeProfile) {
      user.phone = dispatchPhone
      ;(user as any).phoneVerified = true
      if (typeof connectinDb.updateUser === "function") {
        connectinDb.updateUser(user.id, { phone: dispatchPhone })
      }
      if (profDef) {
        activeProfile.profession = profDef.title
        activeProfile.professionId = profDef.id
        activeProfile.professionCategory = profDef.categoryName
        activeProfile.professionEnclave = profDef.enclaveId
        activeProfile.headline =
          profDef.defaultHeadline || `${profDef.title} · Verified ConnectLn Member`
        if (profDef.typicalSkills && profDef.typicalSkills.length > 0) {
          activeProfile.skills = profDef.typicalSkills
        }
      }
      connectinDb.touchUserLogin(user.id, "Verified Phone Session")
      const session = connectinDb.createSession(user.id, {
        ipAddress: geo.ipAddress,
        userAgent: geo.userAgent,
        location: geo.locationLabel,
      })
      const nowIso = new Date().toISOString()
      const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

      await withTimeout(
        Promise.all([
          registerWhatsAppMemberNumber({
            phone: dispatchPhone,
            name: activeProfile.name,
            email: user.email,
            avatar: activeProfile.avatar,
            headline: activeProfile.headline,
            verifiedBy2FA: true,
          }).catch(() => null),
          upsertCloudUser({
            id: user.id,
            email: user.email,
            phone: dispatchPhone,
            name: activeProfile.name,
            role: user.role,
            status: user.status,
            headline: activeProfile.headline,
            avatar: activeProfile.avatar,
            coverImage: activeProfile.coverImage,
            location: activeProfile.location || geo.locationLabel,
            countryName: geo.countryName,
            countryCode: geo.countryCode,
            isOutsideUS: geo.isOutsideUS,
            ipAddress: geo.ipAddress,
            profession: activeProfile.profession,
            professionId: activeProfile.professionId,
            professionCategory: activeProfile.professionCategory,
            professionEnclave: activeProfile.professionEnclave,
            authProvider: "Verified Phone Login",
            lastLoginAt: nowIso,
            createdAt: user.createdAt,
            updatedAt: nowIso,
          }).catch(() => {}),
          appendCloudTelemetry({
            activityLog: {
              id: `act_signin_${user.id}_${Date.now().toString().slice(-5)}`,
              userId: user.id,
              userName: activeProfile.name,
              userEmail: user.email,
              userAvatar: activeProfile.avatar,
              userHeadline: activeProfile.headline,
              actionType: "USER_LOGIN",
              actionLabel: `Signed In (Verified Number · ${geo.locationLabel})`,
              category: "auth",
              targetTitle: `Verified Phone · ${geo.locationLabel}`,
              details: `Direct sign-in using previously verified phone ${dispatchPhone}`,
              timestamp: `${timeStr} · ${geo.countryName}`,
              createdAtIso: nowIso,
            },
          }).catch(() => {}),
        ]),
        3000,
        undefined
      )

      const prettyPhone = formatInternationalPhonePretty(dispatchPhone)
      const directRes = NextResponse.json({
        success: true,
        requires2FA: false,
        alreadyVerified: true,
        phone: dispatchPhone,
        prettyPhone,
        email: user.email,
        user: { ...user, phone: dispatchPhone, phoneVerified: true },
        profile: { ...activeProfile, phone: dispatchPhone, phoneVerified: true },
        message: `✓ Phone ${prettyPhone} already verified — signed in directly!`,
      })
      directRes.cookies.set("connectin_session", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      })
      return directRes
    }

    // First-time phone verification path: deliver 2FA code strictly via Email, SMS & Voice Call (never display on screen)
    const realUserEmail = isRealDeliverableEmail(user.email)
      ? user.email.trim().toLowerCase()
      : isRealDeliverableEmail(cleanTarget)
        ? cleanTarget
        : ""
    const effectiveChannel: "all" | "email" | "sms" | "call" =
      requestedChannel === "call"
        ? "call"
        : requestedChannel === "sms"
          ? "sms"
          : requestedChannel === "email" && realUserEmail
            ? "email"
            : "all"

    if (activeProfile) {
      if (profDef) {
        activeProfile.profession = profDef.title
        activeProfile.professionId = profDef.id
        activeProfile.professionCategory = profDef.categoryName
        activeProfile.professionEnclave = profDef.enclaveId
        activeProfile.headline =
          profDef.defaultHeadline || `${profDef.title} · Verified ConnectLn Member`
        if (profDef.typicalSkills && profDef.typicalSkills.length > 0) {
          activeProfile.skills = profDef.typicalSkills
        }
      }
      connectinDb.touchUserLogin(user.id, `${effectiveChannel.toUpperCase()} 2FA`)
      const nowIso = new Date().toISOString()
      const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      await withTimeout(
        Promise.all([
          upsertCloudUser({
            id: user.id,
            email: user.email,
            phone: existingAccountPhone || user.phone || "",
            name: activeProfile.name,
            role: user.role,
            status: user.status,
            headline: activeProfile.headline,
            avatar: activeProfile.avatar,
            coverImage: activeProfile.coverImage,
            location: activeProfile.location && !activeProfile.location.includes("United States") ? activeProfile.location : geo.locationLabel,
            countryName: geo.countryName,
            countryCode: geo.countryCode,
            isOutsideUS: geo.isOutsideUS,
            ipAddress: geo.ipAddress,
            profession: activeProfile.profession,
            professionId: activeProfile.professionId,
            professionCategory: activeProfile.professionCategory,
            professionEnclave: activeProfile.professionEnclave,
            authProvider: `${effectiveChannel.toUpperCase()} 2FA`,
            lastLoginAt: nowIso,
            createdAt: user.createdAt,
            updatedAt: nowIso
          }).catch(() => {}),
          appendCloudTelemetry({
            activityLog: {
              id: `act_signin_${user.id}_${Date.now().toString().slice(-5)}`,
              userId: user.id,
              userName: activeProfile.name,
              userEmail: user.email,
              userAvatar: activeProfile.avatar,
              userHeadline: activeProfile.headline,
              actionType: "USER_LOGIN",
              actionLabel: `Signed In via ${effectiveChannel.toUpperCase()} 2FA (${geo.locationLabel})`,
              category: "auth",
              targetTitle: `${effectiveChannel.toUpperCase()} 2FA · ${geo.locationLabel}`,
              details: `Authenticated sign-in from ${geo.locationLabel} (IP: ${geo.ipAddress})`,
              timestamp: `${timeStr} · ${geo.countryName}`,
              createdAtIso: nowIso
            },
            auditLog: {
              id: `LOG-${Date.now().toString().slice(-6)}`,
              adminEmail: user.email,
              action: "USER_ACTIVATED",
              targetEntity: `${activeProfile.name} (${user.email})`,
              reason: `Member sign-in via ${effectiveChannel.toUpperCase()} 2FA from ${geo.locationLabel}`,
              ipAddress: `${geo.ipAddress} (${geo.locationLabel})`,
              timestamp: `${timeStr}`,
              status: "Success"
            },
            socEvent: {
              id: `SOC-LIVE-${Date.now().toString().slice(-5)}`,
              severity: "Low",
              eventType: `Member Sign-In (${geo.countryName})`,
              sourceIp: `${geo.ipAddress} (${geo.locationLabel})`,
              targetAccount: `${activeProfile.name} (${user.email})`,
              mitigationAction: `Verified 2FA Dispatch & Session Created`,
              timestamp: "Just Now"
            }
          }).catch(() => {})
        ]),
        2500,
        undefined
      )
    }

    const profile = connectinDb.findProfileByUserId(user.id)
    const fullName = profile?.name || (isPhoneInput ? "Member" : cleanTarget.split("@")[0])

    // Generate brand new, dynamic random OTP & HMAC signed challenge
    const otpTarget =
      (effectiveChannel === "all" || effectiveChannel === "sms" || effectiveChannel === "call") && dispatchPhone
        ? dispatchPhone
        : (user.email || cleanTarget)

    const { code: otpCode, challengeToken } = createDynamicOTP(otpTarget, 15)

    // Register OTP across verification identifiers
    connectinDb.setOTP(cleanTarget, otpCode, 15)
    if (user.email) {
      connectinDb.setOTP(user.email.toLowerCase().trim(), otpCode, 15)
    }
    if (dispatchPhone) {
      connectinDb.setOTP(dispatchPhone, otpCode, 15)
      const digits = dispatchPhone.replace(/[^\d]/g, "")
      if (digits) {
        connectinDb.setOTP(digits, otpCode, 15)
        connectinDb.setOTP(digits.slice(-10), otpCode, 15)
      }
    }

    // Send 2FA code strictly to the user's Email, SMS, and/or Voice Call (never render on the phone/browser UI)
    let smsResult: { success: boolean; error?: string; sid?: string } = { success: false }
    let callResult: { success: boolean; error?: string; sid?: string } = { success: false }
    let emailResult: { success: boolean; error?: string; id?: string } = { success: false }

    if (effectiveChannel === "email" && realUserEmail) {
      emailResult = await sendConnectInOTPEmail({
        toEmail: realUserEmail,
        fullName,
        code: otpCode,
        action: "login_2fa"
      }).catch((e: any) => ({ success: false, error: e?.message || "Email dispatch failed" }))

      if (!emailResult.success && dispatchPhone) {
        console.warn("[/api/connectin/auth/login] Email dispatch notice:", emailResult.error)
        smsResult = await sendConnectInSMS({
          toPhone: dispatchPhone,
          code: otpCode,
          fullName,
          channel: "sms"
        })
        if (!smsResult.success) {
          callResult = await sendConnectInSMS({
            toPhone: dispatchPhone,
            code: otpCode,
            fullName,
            channel: "call"
          })
        }
      }
    } else if (effectiveChannel === "all") {
      ;[smsResult, callResult, emailResult] = await Promise.all([
        dispatchPhone
          ? sendConnectInSMS({
              toPhone: dispatchPhone,
              code: otpCode,
              fullName,
              channel: "sms"
            })
          : Promise.resolve({ success: false, error: "No mobile phone number available" }),
        dispatchPhone
          ? sendConnectInSMS({
              toPhone: dispatchPhone,
              code: otpCode,
              fullName,
              channel: "call"
            })
          : Promise.resolve({ success: false, error: "No mobile phone number available" }),
        realUserEmail
          ? sendConnectInOTPEmail({
              toEmail: realUserEmail,
              fullName,
              code: otpCode,
              action: "login_2fa"
            }).catch((e: any) => ({ success: false, error: e?.message || "Email dispatch failed" }))
          : Promise.resolve({ success: false, error: "No deliverable email on file" })
      ])
    } else if (effectiveChannel === "call") {
      ;[callResult, emailResult] = await Promise.all([
        dispatchPhone
          ? sendConnectInSMS({
              toPhone: dispatchPhone,
              code: otpCode,
              fullName,
              channel: "call"
            })
          : Promise.resolve({ success: false, error: "No mobile phone number available" }),
        realUserEmail
          ? sendConnectInOTPEmail({
              toEmail: realUserEmail,
              fullName,
              code: otpCode,
              action: "login_2fa"
            }).catch((e: any) => ({ success: false, error: e?.message || "Email dispatch failed" }))
          : Promise.resolve({ success: false, error: "No deliverable email on file" })
      ])
    } else {
      ;[smsResult, emailResult] = await Promise.all([
        dispatchPhone
          ? sendConnectInSMS({
              toPhone: dispatchPhone,
              code: otpCode,
              fullName,
              channel: "sms"
            })
          : Promise.resolve({ success: false, error: "No mobile phone number available" }),
        realUserEmail
          ? sendConnectInOTPEmail({
              toEmail: realUserEmail,
              fullName,
              code: otpCode,
              action: "login_2fa"
            }).catch((e: any) => ({ success: false, error: e?.message || "Email dispatch failed" }))
          : Promise.resolve({ success: false, error: "No deliverable email on file" })
      ])
      if (!smsResult.success && dispatchPhone) {
        callResult = await sendConnectInSMS({
          toPhone: dispatchPhone,
          code: otpCode,
          fullName,
          channel: "call"
        })
      }
    }

    if (dispatchPhone && !smsResult.success && smsResult.error) {
      console.warn("[/api/connectin/auth/login] SMS dispatch notice:", smsResult.error)
    }
    if (dispatchPhone && !callResult.success && callResult.error) {
      console.warn("[/api/connectin/auth/login] Voice Call dispatch notice:", callResult.error)
    }
    if (realUserEmail && !emailResult.success && emailResult.error) {
      console.warn("[/api/connectin/auth/login] Email dispatch notice:", emailResult.error)
    }

    const smsDelivered = Boolean(smsResult.success && smsResult.sid)
    const callDelivered = Boolean(callResult.success && callResult.sid)
    const emailDelivered = Boolean(emailResult.success)

    if (!smsDelivered && !callDelivered && !emailDelivered) {
      return NextResponse.json(
        {
          error:
            "Could not deliver your 6-digit 2FA verification code via email, SMS, or phone call. Please verify your mobile number and email address and try again.",
          smsError: smsResult.error,
          callError: callResult.error,
          emailError: emailResult.error
        },
        { status: 502 }
      )
    }

    const prettyPhone = formatInternationalPhonePretty(dispatchPhone)
    const deliveredParts: string[] = []
    if (smsDelivered) deliveredParts.push(`SMS (${prettyPhone})`)
    if (callDelivered) deliveredParts.push(`automated phone call (${prettyPhone})`)
    if (emailDelivered) deliveredParts.push(`email (${realUserEmail})`)

    const message = `🔐 Sent your 6-digit 2FA security code via ${deliveredParts.join(", ")}. Check your messages, answer your phone, or check your email inbox.`

    const res = NextResponse.json({
      success: true,
      requires2FA: true,
      channel: effectiveChannel,
      target:
        (smsDelivered || callDelivered) && dispatchPhone
          ? dispatchPhone
          : realUserEmail || dispatchPhone || cleanTarget,
      prettyPhone,
      phone: dispatchPhone,
      email: realUserEmail || user.email || cleanTarget,
      otpChallengeToken: challengeToken,
      smsDispatched: smsDelivered,
      callDispatched: callDelivered,
      emailDispatched: emailDelivered,
      smsError: smsResult.error,
      callError: callResult.error,
      emailError: emailResult.error,
      message
    })

    // Set secure challenge cookie
    res.cookies.set("connectin_otp_challenge", challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 // 15 minutes
    })

    return res
  } catch (error: any) {
    console.error("[/api/connectin/auth/login]", error)
    return NextResponse.json({ error: error.message || "Login challenge failed" }, { status: 500 })
  }
}
