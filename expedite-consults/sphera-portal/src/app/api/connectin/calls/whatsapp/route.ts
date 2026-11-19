import { NextRequest, NextResponse } from "next/server"
import {
  getOrCreateConnectLnVapidKeys,
  refreshWhatsAppDirectoryCache,
  registerWhatsAppMemberNumber,
  lookupWhatsAppRecipient,
  sendIncomingCallWebPush,
} from "@/lib/connectin-whatsapp-directory"
import {
  normalizeDialablePhone,
  looksLikePhoneNumber,
  formatPrettyPhoneDisplay,
  mintTwilioVoiceAccessToken,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const queryPhone = (sp.get("phone") || "").trim()
    const queryName = (sp.get("name") || "").trim()
    const queryEmail = (sp.get("email") || "").trim()
    const viewerPhone = (sp.get("viewerPhone") || "").trim()

    const [vapid, cache] = await Promise.all([
      getOrCreateConnectLnVapidKeys(),
      refreshWhatsAppDirectoryCache(),
    ])

    let myRegistration = null
    if (viewerPhone && looksLikePhoneNumber(viewerPhone)) {
      const norm = normalizeDialablePhone(viewerPhone)
      const found = cache.get(norm)
      if (found) {
        myRegistration = {
          phone: found.phone,
          prettyPhone: found.prettyPhone,
          name: found.name,
          email: found.email,
          pushDevicesCount: found.pushSubscriptions.length,
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

    return NextResponse.json({
      ok: true,
      vapidPublicKey: vapid.publicKey,
      myRegistration,
      lookup,
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

    if (action === "register") {
      const rawPhone = String(body?.phone || "").trim()
      const name = String(body?.name || "ConnectLn Member").trim()
      if (!looksLikePhoneNumber(rawPhone)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Enter a valid mobile number with country code (e.g. +1 240-260-7898 or +233 20 555 0412).",
          },
          { status: 400 }
        )
      }

      const record = await registerWhatsAppMemberNumber({
        phone: rawPhone,
        name,
        email: body?.email,
        avatar: body?.avatar,
        headline: body?.headline,
        pushSubscription: body?.pushSubscription || null,
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
          pushDevicesCount: record.pushSubscriptions.length,
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

      // 1. Wake up recipient's phone immediately via Web Push (`public/sw.js`),
      // 2. Await instant mobile Email/SMS Camera Link push (so Vercel never freezes before delivery),
      // 3. Mint carrier voice token in parallel so physical cell phone SIM rings immediately if Web Push isn't enabled on their phone yet!
      const [pushRes, ringCellData, voiceTokenData] = await Promise.all([
        recipientLookup.member
          ? sendIncomingCallWebPush({
              member: recipientLookup.member,
              callId,
              callMode,
              callerName,
              callerPhone,
              callerAvatar,
              joinUrl,
            }).catch(() => ({ deliveredCount: 0, attemptedCount: 0 }))
          : Promise.resolve({ deliveredCount: 0, attemptedCount: 0 }),
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
            placeAlertCall: false,
          }),
        })
          .then((r) => r.json())
          .catch(() => null),
        recipientPhone
          ? mintTwilioVoiceAccessToken(callerEmail || callerName || "connectln_caller").catch(() => null)
          : Promise.resolve(null),
      ])

      const pushDeliveredCount = pushRes.deliveredCount
      const pushAttemptedCount = pushRes.attemptedCount

      const digits = recipientPhone.replace(/[^\d]/g, "")
      const shareText = `${
        callMode === "video" ? "📹" : "📞"
      } ${callerName} is calling you on ConnectLn! Tap to answer live: ${joinUrl}`

      return NextResponse.json({
        ok: true,
        callId,
        callMode,
        joinUrl,
        isRegisteredOnConnectLn: recipientLookup.isRegisteredOnConnectLn,
        pushDeliveredCount,
        pushAttemptedCount,
        emailAlertSent: Boolean(ringCellData?.emailSent),
        smsAlertSent: Boolean(ringCellData?.smsSent),
        carrierVoiceToken: voiceTokenData?.token || undefined,
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
        nativeSmsHref: digits
          ? `sms:+${digits}?&body=${encodeURIComponent(shareText)}`
          : `sms:?&body=${encodeURIComponent(shareText)}`,
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
