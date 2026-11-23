import { NextRequest, NextResponse } from "next/server"
import {
  lookupWhatsAppRecipient,
  sendIncomingCallWebPush,
} from "@/lib/connectin-whatsapp-directory"
import {
  normalizeDialablePhone,
  looksLikePhoneNumber,
  formatPrettyPhoneDisplay,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

export function makeConferenceRoomName(callId: string): string {
  const clean = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 52)
  return clean.startsWith("conf_") ? clean : `conf_${clean}`
}

function makeInviteeKey(params: { phone?: string; email?: string; name?: string }): string {
  const digits = String(params.phone || "").replace(/[^\d]/g, "")
  if (digits.length >= 7) return `inv_ph_${digits.slice(-12)}`
  const em = String(params.email || "").trim().toLowerCase()
  if (em) return `inv_em_${em.replace(/[^a-z0-9]/g, "_").slice(0, 32)}`
  const nm = String(params.name || "guest").trim().toLowerCase()
  return `inv_nm_${nm.replace(/[^a-z0-9]/g, "_").slice(0, 32)}`
}

/**
 * 100% Pure Internet Group & 1-on-1 Call Signaling + User-Borne SIM/SMS Handoff.
 * Zero Twilio Voice PSTN legs (`$0.00` server carrier charges) and zero Twilio server SMS.
 * Rings registered ConnectLn members via Web Push + shared WebRTC room + free Email push,
 * and returns `sms:`, `tel:`, and `wa.me` URIs so the caller's own phone plan handles any offline SIM/SMS handoff.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "add")

    // Legacy status / hangup actions return cleanly with zero Twilio Voice calls
    if (action === "status") {
      return NextResponse.json({ ok: true, internetOnly: true, statuses: {} })
    }
    if (action === "hangup_participant" || action === "end_all") {
      return NextResponse.json({ ok: true, internetOnly: true, endedCount: 0 })
    }

    const callId = String(body?.callId || `wa_${Date.now().toString(36)}`).trim()
    const conferenceName = makeConferenceRoomName(body?.conferenceName || callId)
    const callMode: "audio" | "video" = body?.callMode === "audio" ? "audio" : "video"
    const callerName = String(body?.callerName || "ConnectLn Caller").trim()
    const callerPhone = body?.callerPhone ? normalizeDialablePhone(String(body.callerPhone)) : ""
    const callerEmail = String(body?.callerEmail || "").trim()
    const callerAvatar = String(body?.callerAvatar || "").trim()
    const hostUserId = String(body?.hostUserId || callerEmail || callerName || "host").trim()

    const lookup = await lookupWhatsAppRecipient({
      targetPhone: body?.targetPhone,
      targetName: body?.targetName,
      targetEmail: body?.targetEmail,
    })

    const recipientName =
      lookup.member?.name ||
      (body?.targetName && !looksLikePhoneNumber(body.targetName)
        ? String(body.targetName).trim()
        : lookup.dialablePhone
        ? formatPrettyPhoneDisplay(lookup.dialablePhone)
        : "Invited Participant")

    const recipientPhone = lookup.dialablePhone || ""
    const recipientEmail =
      lookup.member?.email ||
      String(body?.targetEmail || "").trim() ||
      (recipientName.toLowerCase() === callerName.toLowerCase() ? callerEmail : "")
    const recipientAvatar = lookup.member?.avatar || String(body?.targetAvatar || "").trim()

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

    const inviteeId = makeInviteeKey({
      phone: recipientPhone,
      email: recipientEmail,
      name: recipientName,
    })

    // 1. Ring recipient's ConnectLn devices via free Web Push,
    // 2. Dispatch free internet Email call link if email is on file,
    // 3. Sync invitee to the shared multi-party WebRTC call roster so all group tiles persist!
    const [pushRes, ringCellData] = await Promise.all([
      lookup.member
        ? sendIncomingCallWebPush({
            member: lookup.member,
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
      fetch(`${origin}/api/v1/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_invitee",
          call_id: callId,
          call_type: callMode,
          user_id: hostUserId,
          display_name: callerName,
          initiator_phone: callerPhone || undefined,
          target_recipient_name: recipientName,
          target_recipient_phone: recipientPhone || undefined,
          target_recipient_email: recipientEmail || undefined,
          invited_member: {
            id: inviteeId,
            name: recipientName,
            phone: recipientPhone || undefined,
            email: recipientEmail || undefined,
            avatar: recipientAvatar || undefined,
            status: "invited",
            callSid: "",
            updated_at_ms: Date.now(),
          },
        }),
      }).catch(() => null),
    ])

    const digits = recipientPhone.replace(/[^\d]/g, "")
    const shareText = `${
      callMode === "video" ? "📹" : "📞"
    } ${callerName} is calling you on ConnectLn (Free Internet ${
      callMode === "video" ? "Video" : "Voice"
    } Call)! Tap to join live: ${joinUrl}`

    return NextResponse.json({
      ok: true,
      internetOnly: true,
      userBorneCarrierHandoff: true,
      callId,
      conferenceName,
      callMode,
      joinUrl,
      isRegisteredOnConnectLn: lookup.isRegisteredOnConnectLn,
      pushDeliveredCount: pushRes.deliveredCount,
      mobilePushDeliveredCount: pushRes.mobileDeliveredCount,
      pushAttemptedCount: pushRes.attemptedCount,
      emailAlertSent: Boolean(ringCellData?.emailSent),
      smsAlertSent: false,
      recipient: {
        id: inviteeId,
        name: recipientName,
        phone: recipientPhone,
        prettyPhone: recipientPhone ? formatPrettyPhoneDisplay(recipientPhone) : "",
        email: recipientEmail,
        avatar: recipientAvatar,
      },
      whatsappShareUrl: digits
        ? `https://wa.me/${digits}?text=${encodeURIComponent(shareText)}`
        : `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      nativeSmsHref: recipientPhone
        ? `sms:${recipientPhone}?&body=${encodeURIComponent(shareText)}`
        : `sms:?&body=${encodeURIComponent(shareText)}`,
      nativeTelHref: recipientPhone ? `tel:${recipientPhone}` : "",
    })
  } catch (err: any) {
    console.error("[voice/conference-add] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to ring participant over internet" },
      { status: 500 }
    )
  }
}
