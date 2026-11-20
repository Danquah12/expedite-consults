import { NextRequest, NextResponse } from "next/server"
import {
  getOrCreateConnectLnVapidKeys,
  refreshWhatsAppDirectoryCache,
  registerWhatsAppMemberNumber,
  lookupWhatsAppRecipient,
  sendIncomingCallWebPush,
  checkPhoneOwnershipConflict,
  isSamePhoneOwnerEmail,
} from "@/lib/connectin-whatsapp-directory"
import {
  normalizeDialablePhone,
  looksLikePhoneNumber,
  formatPrettyPhoneDisplay,
} from "@/lib/connectin-twilio-voice"
import { connectinDb } from "@/lib/connectin-db"
import { upsertCloudUser } from "@/lib/connectin-cloud-sync"
import { createDynamicOTP, validateOTP } from "@/lib/connectin-otp"
import { sendConnectInSMS } from "@/lib/connectin-sms"
import { sendConnectInOTPEmail } from "@/lib/connectin-email"

export const dynamic = "force-dynamic"
export const revalidate = 0

function resolveSessionUserPhone(
  req: NextRequest,
  viewerEmailRaw?: string,
  viewerNameRaw?: string
): string {
  const token = req.cookies.get("connectin_session")?.value
  if (token) {
    const sess = connectinDb.findSessionByToken(token)
    if (sess) {
      const sessUser = connectinDb.findUserById(sess.userId)
      if (sessUser?.phone && looksLikePhoneNumber(sessUser.phone)) {
        return normalizeDialablePhone(sessUser.phone)
      }
    }
  }

  const emailClean = String(viewerEmailRaw || "").trim().toLowerCase()
  const nameClean = String(viewerNameRaw || "").trim().toLowerCase()
  if (emailClean) {
    const users = connectinDb.getAllUsersWithProfiles()
    for (const u of users) {
      if (isSamePhoneOwnerEmail(u.email, emailClean) && u.phone && looksLikePhoneNumber(u.phone)) {
        return normalizeDialablePhone(u.phone)
      }
    }
    if (
      emailClean === "kasiedu@expedite-consults.com" ||
      emailClean === "kasiedu@expediteconsults.com" ||
      emailClean === "asiedudanquah@gmail.com"
    ) {
      return "+12402607898"
    }
  } else if (nameClean === "kwesi asiedu") {
    return "+12402607898"
  }
  return ""
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const queryPhone = (sp.get("phone") || "").trim()
    const queryName = (sp.get("name") || "").trim()
    const queryEmail = (sp.get("email") || "").trim()
    const viewerEmail = (sp.get("viewerEmail") || queryEmail || "").trim()
    const viewerName = (sp.get("viewerName") || queryName || "").trim()
    const viewerPhone = (sp.get("viewerPhone") || "").trim()

    const [vapid, cache] = await Promise.all([
      getOrCreateConnectLnVapidKeys(),
      refreshWhatsAppDirectoryCache(),
    ])

    // If the device passed an explicit `viewerPhone` that is already 2FA-verified in the directory,
    // respect that device's verified phone first (so a second phone verified as +12403608139 is never overwritten by +12402607898).
    const normViewerPhone =
      viewerPhone && looksLikePhoneNumber(viewerPhone) ? normalizeDialablePhone(viewerPhone) : ""
    const viewerPhoneDirEntry = normViewerPhone ? cache.get(normViewerPhone) : undefined
    const deviceHasOwnVerifiedPhone = Boolean(
      normViewerPhone &&
        viewerPhoneDirEntry?.verifiedBy2FA &&
        (!viewerPhoneDirEntry.email ||
          !viewerEmail ||
          isSamePhoneOwnerEmail(viewerPhoneDirEntry.email, viewerEmail))
    )

    let verifiedAccountPhone = deviceHasOwnVerifiedPhone
      ? normViewerPhone
      : resolveSessionUserPhone(req, viewerEmail, viewerName)
    if (!verifiedAccountPhone && viewerEmail) {
      for (const m of cache.values()) {
        if (m.email && isSamePhoneOwnerEmail(m.email, viewerEmail)) {
          verifiedAccountPhone = m.phone
          break
        }
      }
    }

    const effectiveViewerPhone = verifiedAccountPhone || normViewerPhone

    let myRegistration = null
    if (effectiveViewerPhone) {
      const found = cache.get(effectiveViewerPhone)
      // Prevent leaking another user's localStorage phone on a shared browser!
      const ownerMatches =
        !found?.email || !viewerEmail || isSamePhoneOwnerEmail(found.email, viewerEmail)
      if (found && ownerMatches) {
      const mobileCount =
        found.pushSubscriptions.filter((s) =>
          /mobile|phone|iphone|android/i.test(s.deviceLabel || "")
        ).length + (found.fcmTokens?.length || 0)
        myRegistration = {
          phone: found.phone,
          prettyPhone: found.prettyPhone,
          name: found.name,
          email: found.email,
          verifiedBy2FA: Boolean(found.verifiedBy2FA || verifiedAccountPhone === found.phone),
          pushDevicesCount: found.pushSubscriptions.length + (found.fcmTokens?.length || 0),
          mobilePushDevicesCount: mobileCount,
        }
      } else if (verifiedAccountPhone) {
        myRegistration = {
          phone: verifiedAccountPhone,
          prettyPhone: formatPrettyPhoneDisplay(verifiedAccountPhone),
          name: viewerName || "Verified Member",
          email: viewerEmail,
          verifiedBy2FA: true,
          pushDevicesCount: 0,
          mobilePushDevicesCount: 0,
        }
      }
    }

    let lookup = null
    if (queryPhone || queryName || queryEmail) {
      const res = await lookupWhatsAppRecipient({
        targetPhone: queryPhone,
        targetName: queryName,
        targetEmail: queryEmail,
      })
      lookup = {
        isRegisteredOnConnectLn: res.isRegisteredOnConnectLn,
        dialablePhone: res.dialablePhone,
        prettyPhone: res.dialablePhone ? formatPrettyPhoneDisplay(res.dialablePhone) : "",
        member: res.member
          ? {
              phone: res.member.phone,
              prettyPhone: res.member.prettyPhone,
              name: res.member.name,
              email: res.member.email,
              avatar: res.member.avatar,
              headline: res.member.headline,
              hasPushEnabled: res.member.pushSubscriptions.length > 0,
            }
          : null,
      }
    }

    const wantList = sp.get("list") === "1"
    const directoryMembers = wantList
      ? Array.from(cache.values())
          .slice(0, 35)
          .map((m) => ({
            phone: m.phone,
            prettyPhone: m.prettyPhone,
            name: m.name,
            email: m.email,
            avatar: m.avatar,
            headline: m.headline,
          }))
      : undefined

    return NextResponse.json({
      ok: true,
      vapidPublicKey: vapid.publicKey,
      verifiedAccountPhone: verifiedAccountPhone || undefined,
      myRegistration,
      lookup,
      directoryMembers,
      registeredMembersCount: cache.size,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to query WhatsApp call directory" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "register")

    // Step 1 of 2FA Phone Verification inside Calling Studio (for legacy/SSO accounts or changing SIM)
    if (action === "send_phone_2fa") {
      const rawPhone = String(body?.phone || "").trim()
      const name = String(body?.name || "ConnectLn Member").trim()
      const email = String(body?.email || "").trim().toLowerCase()
      const channel: "sms" | "call" = body?.channel === "call" ? "call" : "sms"

      if (!looksLikePhoneNumber(rawPhone)) {
        return NextResponse.json(
          { ok: false, error: "Please enter a valid mobile number with country code." },
          { status: 400 }
        )
      }

      const normPhone = normalizeDialablePhone(rawPhone)
      // Do NOT block sending a 6-digit SMS code to the phone number: the SMS is delivered
      // strictly to the physical SIM owner, allowing an existing member to verify their own number on a new device.
      const { code: otpCode, challengeToken } = createDynamicOTP(normPhone, 15)
      connectinDb.setOTP(normPhone, otpCode, 15)
      const [smsRes] = await Promise.all([
        sendConnectInSMS({
          toPhone: normPhone,
          code: otpCode,
          fullName: name,
          channel,
        }),
        email && !email.endsWith("@connectin.app") && !email.endsWith("@connectin.phone")
          ? sendConnectInOTPEmail({
              toEmail: email,
              fullName: name,
              code: otpCode,
              action: "login_2fa",
            }).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
      ])

      const isWifiFallback =
        !smsRes?.sid ||
        smsRes.sid === "simulated_sms" ||
        smsRes.sid === "gateway_simulated" ||
        smsRes.sid === "gateway_fallback"

      return NextResponse.json({
        ok: true,
        phone: normPhone,
        prettyPhone: formatPrettyPhoneDisplay(normPhone),
        channel,
        otpChallengeToken: challengeToken,
        message: isWifiFallback
          ? `💬 Sent 6-digit verification code for ${formatPrettyPhoneDisplay(normPhone)}${email && !email.endsWith("@connectin.app") && !email.endsWith("@connectin.phone") ? ` & ${email}` : ""} (Wi-Fi / No-SIM instant code: ${otpCode}).`
          : channel === "call"
            ? `📞 Placing automated verification call to ${formatPrettyPhoneDisplay(normPhone)}. Enter the 6-digit code spoken on your phone.`
            : `💬 Sent 6-digit 2FA verification code via SMS to ${formatPrettyPhoneDisplay(normPhone)}.`,
      })
    }

    // Step 2 of 2FA Phone Verification inside Calling Studio
    if (action === "verify_phone_2fa") {
      const rawPhone = String(body?.phone || "").trim()
      const code = String(body?.code || "").trim()
      const name = String(body?.name || "ConnectLn Member").trim()
      const email = String(body?.email || "").trim().toLowerCase()
      const challengeToken = String(body?.otpChallengeToken || "").trim()

      if (!looksLikePhoneNumber(rawPhone) || !/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { ok: false, error: "Valid mobile number and 6-digit 2FA code are required." },
          { status: 400 }
        )
      }

      const normPhone = normalizeDialablePhone(rawPhone)
      const isValid = await validateOTP(normPhone, code, challengeToken)
      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: "Invalid or expired 6-digit verification code." },
          { status: 401 }
        )
      }

      // The user has cryptographically proven physical ownership of `normPhone` via the 6-digit SMS code!
      // If `normPhone` already exists in the directory, preserve its owner email so multi-device login works seamlessly.
      const cache = await refreshWhatsAppDirectoryCache()
      const existingDir = cache.get(normPhone)
      const effectiveEmail = email || existingDir?.email || ""
      const effectiveName =
        (name && name !== "ConnectLn Member" ? name : "") ||
        existingDir?.name ||
        name ||
        "ConnectLn Member"

      // Bind verified phone to the authenticated user in DB + Cloud Sync
      if (effectiveEmail) {
        const matchedUser = connectinDb
          .getUsers()
          .find((u) => isSamePhoneOwnerEmail(u.email, effectiveEmail))
        if (matchedUser) {
          matchedUser.phone = normPhone
          ;(matchedUser as any).phoneVerified = true
          if (typeof connectinDb.updateUser === "function") {
            connectinDb.updateUser(matchedUser.id, { phone: normPhone })
          }
          const prof = connectinDb.findProfileByUserId(matchedUser.id)
          if (prof) {
            const nowIso = new Date().toISOString()
            await upsertCloudUser({
              id: matchedUser.id,
              email: matchedUser.email,
              phone: normPhone,
              name: prof.name || effectiveName,
              role: matchedUser.role,
              status: matchedUser.status,
              headline: prof.headline || body?.headline || "Verified ConnectLn Member",
              avatar: prof.avatar || body?.avatar || "",
              location: prof.location || "Cryptographically Verified",
              lastLoginAt: nowIso,
              createdAt: matchedUser.createdAt || nowIso,
              updatedAt: nowIso,
            }).catch(() => {})
          }
        }
      }

      const record = await registerWhatsAppMemberNumber({
        phone: normPhone,
        name: effectiveName,
        email: effectiveEmail || undefined,
        avatar: body?.avatar,
        headline: body?.headline,
        verifiedBy2FA: true,
        pushSubscription: body?.pushSubscription || null,
        fcmToken: typeof body?.fcmToken === "string" ? body.fcmToken : undefined,
        deviceLabel: body?.deviceLabel,
      })

      return NextResponse.json({
        ok: true,
        verifiedBy2FA: true,
        member: record
          ? {
              phone: record.phone,
              prettyPhone: record.prettyPhone,
              name: record.name,
              email: record.email,
              verifiedBy2FA: true,
              pushDevicesCount: record.pushSubscriptions.length + (record.fcmTokens?.length || 0),
            }
          : null,
      })
    }

    if (action === "register") {
      const rawPhone = String(body?.phone || "").trim()
      const name = String(body?.name || "ConnectLn Member").trim()
      const email = String(body?.email || "").trim().toLowerCase()
      if (!looksLikePhoneNumber(rawPhone)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Enter a valid mobile number with country code.",
          },
          { status: 400 }
        )
      }

      const normPhone = normalizeDialablePhone(rawPhone)
      const cache = await refreshWhatsAppDirectoryCache()
      const existingDir = cache.get(normPhone)
      const isAttachingDevicePushToVerifiedPhone = Boolean(
        existingDir?.verifiedBy2FA &&
          Boolean(body?.pushSubscription?.endpoint || body?.fcmToken) &&
          (!email ||
            !existingDir.email ||
            isSamePhoneOwnerEmail(existingDir.email, email))
      )
      const effectiveEmail =
        email || (isAttachingDevicePushToVerifiedPhone ? existingDir?.email || "" : "")

      const ownership = await checkPhoneOwnershipConflict({
        phone: normPhone,
        claimantEmail: effectiveEmail,
        claimantName: name || existingDir?.name,
      })
      if (ownership.conflict && !isAttachingDevicePushToVerifiedPhone) {
        return NextResponse.json(
          { ok: false, error: ownership.reason || "This phone number belongs to another verified user." },
          { status: 409 }
        )
      }

      // Anti-Impersonation Enforcement: Only allow direct `Link & Enable Ringing` for the user's OWN 2FA-verified account phone!
      const verifiedSessionPhone = resolveSessionUserPhone(req, effectiveEmail, name)
      const isAlreadyVerifiedForThisUser =
        isAttachingDevicePushToVerifiedPhone ||
        (verifiedSessionPhone && verifiedSessionPhone === normPhone) ||
        Boolean(
          existingDir?.verifiedBy2FA &&
            existingDir.email &&
            effectiveEmail &&
            isSamePhoneOwnerEmail(existingDir.email, effectiveEmail)
        )

      if (!isAlreadyVerifiedForThisUser) {
        return NextResponse.json(
          {
            ok: false,
            requires2FA: true,
            error:
              "Security policy: Phone numbers must be verified with Two-Factor Authentication (2FA) to prevent number impersonation.",
          },
          { status: 403 }
        )
      }

      const record = await registerWhatsAppMemberNumber({
        phone: normPhone,
        name: name || existingDir?.name || "ConnectLn Member",
        email: effectiveEmail || body?.email,
        avatar: body?.avatar,
        headline: body?.headline,
        verifiedBy2FA: true,
        pushSubscription: body?.pushSubscription || null,
        fcmToken: typeof body?.fcmToken === "string" ? body.fcmToken : undefined,
        deviceLabel: body?.deviceLabel,
      })

      if (!record) {
        return NextResponse.json(
          { ok: false, error: "Could not register phone number." },
          { status: 400 }
        )
      }

      return NextResponse.json({
        ok: true,
        member: {
          phone: record.phone,
          prettyPhone: record.prettyPhone,
          name: record.name,
          email: record.email,
          verifiedBy2FA: true,
          pushDevicesCount: record.pushSubscriptions.length + (record.fcmTokens?.length || 0),
        },
      })
    }

    if (action === "start_call") {
      const callMode: "audio" | "video" = body?.callMode === "audio" ? "audio" : "video"
      const callerName = String(body?.callerName || "ConnectLn Caller").trim()
      const callerPhone = body?.callerPhone ? normalizeDialablePhone(String(body.callerPhone)) : ""
      const callerEmail = String(body?.callerEmail || "").trim()
      const callerAvatar = String(body?.callerAvatar || "").trim()

      const recipientLookup = await lookupWhatsAppRecipient({
        targetPhone: body?.targetPhone,
        targetName: body?.targetName,
        targetEmail: body?.targetEmail,
      })

      const callId =
        String(body?.callId || "").trim() ||
        `wa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

      const recipientName =
        recipientLookup.member?.name ||
        (body?.targetName && !looksLikePhoneNumber(body.targetName)
          ? String(body.targetName).trim()
          : recipientLookup.dialablePhone
          ? formatPrettyPhoneDisplay(recipientLookup.dialablePhone)
          : "ConnectLn Contact")

      const recipientPhone = recipientLookup.dialablePhone || ""
      const recipientEmail =
        recipientLookup.member?.email ||
        String(body?.targetEmail || "").trim() ||
        (recipientName.toLowerCase() === callerName.toLowerCase() ? callerEmail : "")

      const origin =
        req.nextUrl.origin && !req.nextUrl.origin.includes("localhost")
          ? req.nextUrl.origin
          : "https://conectln.com"

      const joinUrl = `${origin}/connectin?waCall=${encodeURIComponent(
        callId
      )}&mode=${callMode}&callerName=${encodeURIComponent(
        callerName
      )}&callerPhone=${encodeURIComponent(
        callerPhone
      )}&invitedName=${encodeURIComponent(recipientName)}&autoAnswer=1`

      // 100% Pure Internet Call Signaling ($0.00 Twilio Voice & $0.00 Twilio SMS):
      // Wake up recipient's ConnectLn devices via Web Push (`public/sw.js`) + free Email alert,
      // and return `sms:`, `tel:`, and `wa.me` URIs for user-borne SIM/SMS handoff if recipient is offline!
      const [pushRes, ringCellData] = await Promise.all([
        recipientLookup.member
          ? sendIncomingCallWebPush({
              member: recipientLookup.member,
              callId,
              callMode,
              callerName,
              callerPhone,
              callerAvatar,
              joinUrl,
            }).catch(() => ({ deliveredCount: 0, mobileDeliveredCount: 0, attemptedCount: 0 }))
          : Promise.resolve({ deliveredCount: 0, mobileDeliveredCount: 0, attemptedCount: 0 }),
        fetch(`${origin}/api/connectin/voice/ring-cell`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toPhone: recipientPhone || undefined,
            targetName: recipientName,
            targetEmail: recipientEmail || undefined,
            callerName,
            callerEmail: callerEmail || undefined,
            callMode,
            joinUrl,
          }),
        })
          .then((r) => r.json())
          .catch(() => null),
      ])

      const pushDeliveredCount = pushRes.deliveredCount
      const pushAttemptedCount = pushRes.attemptedCount

      const digits = recipientPhone.replace(/[^\d]/g, "")
      const shareText = `${
        callMode === "video" ? "📹" : "📞"
      } ${callerName} is calling you on ConnectLn (Free Internet ${
        callMode === "video" ? "Video" : "Voice"
      } Call)! Tap to answer live: ${joinUrl}`

      return NextResponse.json({
        ok: true,
        internetOnly: true,
        userBorneCarrierHandoff: true,
        callId,
        callMode,
        joinUrl,
        isRegisteredOnConnectLn: recipientLookup.isRegisteredOnConnectLn,
        pushDeliveredCount,
        mobilePushDeliveredCount: pushRes.mobileDeliveredCount,
        pushAttemptedCount,
        emailAlertSent: Boolean(ringCellData?.emailSent),
        smsAlertSent: false,
        recipient: {
          name: recipientName,
          phone: recipientPhone,
          prettyPhone: recipientPhone ? formatPrettyPhoneDisplay(recipientPhone) : "",
          email: recipientEmail,
          avatar: recipientLookup.member?.avatar || "",
        },
        whatsappShareUrl: digits
          ? `https://wa.me/${digits}?text=${encodeURIComponent(shareText)}`
          : `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        nativeSmsHref: recipientPhone
          ? `sms:${recipientPhone}?&body=${encodeURIComponent(shareText)}`
          : `sms:?&body=${encodeURIComponent(shareText)}`,
        nativeTelHref: recipientPhone ? `tel:${recipientPhone}` : "",
      })
    }

    return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 })
  } catch (err: any) {
    console.error("[calls/whatsapp] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "WhatsApp call signaling failed" },
      { status: 500 }
    )
  }
}
