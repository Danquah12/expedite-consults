import { NextRequest, NextResponse } from "next/server"
import {
  lookupWhatsAppRecipient,
  sendIncomingCallWebPush,
} from "@/lib/connectin-whatsapp-directory"
import {
  normalizeDialablePhone,
  looksLikePhoneNumber,
  formatPrettyPhoneDisplay,
  mintTwilioVoiceAccessToken,
  escapeXml,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getTwilioCreds() {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
  const primaryFrom = normalizeDialablePhone(process.env.TWILIO_PHONE_NUMBER || "+12402623543")
  const backupTollFree = "+18333022830"
  if (!accountSid || !authToken) return null
  return {
    accountSid,
    authHeader: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    primaryFrom,
    backupTollFree,
  }
}

export function makeConferenceRoomName(callId: string): string {
  const clean = String(callId || "room").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 52)
  return clean.startsWith("conf_") ? clean : `conf_${clean}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "add")
    const twilio = getTwilioCreds()

    if (!twilio) {
      return NextResponse.json(
        { ok: false, error: "Twilio credentials not configured on server." },
        { status: 500 }
      )
    }

    // 1. Poll live statuses of outbound cell conference legs (`CA...`)
    if (action === "status") {
      const callSids: string[] = Array.isArray(body?.callSids)
        ? body.callSids.filter((s: any) => typeof s === "string" && s.startsWith("CA"))
        : []
      const statuses: Record<string, { status: string; duration?: string }> = {}
      await Promise.all(
        callSids.slice(0, 16).map(async (sid) => {
          try {
            const r = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Calls/${encodeURIComponent(
                sid
              )}.json`,
              { headers: { Authorization: twilio.authHeader }, cache: "no-store" }
            )
            if (r.ok) {
              const d: any = await r.json()
              statuses[sid] = { status: d.status || "unknown", duration: d.duration }
            }
          } catch {}
        })
      )
      return NextResponse.json({ ok: true, statuses })
    }

    // 2. Hang up one participant (`hangup_participant`) or all cell legs (`end_all`)
    if (action === "hangup_participant" || action === "end_all") {
      const sidsToEnd: string[] =
        action === "hangup_participant" && typeof body?.callSid === "string"
          ? [body.callSid]
          : Array.isArray(body?.callSids)
          ? body.callSids.filter((s: any) => typeof s === "string" && s.startsWith("CA"))
          : []

      await Promise.all(
        sidsToEnd.map(async (sid) => {
          try {
            await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Calls/${encodeURIComponent(
                sid
              )}.json`,
              {
                method: "POST",
                headers: {
                  Authorization: twilio.authHeader,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ Status: "completed" }).toString(),
              }
            )
          } catch {}
        })
      )
      return NextResponse.json({ ok: true, endedCount: sidsToEnd.length })
    }

    // 3. `action === "add"`: Add a new person (phone number or ConnectLn member) into the active group call!
    const callId = String(body?.callId || `wa_${Date.now().toString(36)}`).trim()
    const conferenceName = makeConferenceRoomName(body?.conferenceName || callId)
    const callMode: "audio" | "video" = body?.callMode === "audio" ? "audio" : "video"
    const callerName = String(body?.callerName || "ConnectLn Caller").trim()
    const callerPhone = body?.callerPhone ? normalizeDialablePhone(String(body.callerPhone)) : ""
    const callerEmail = String(body?.callerEmail || "").trim()
    const callerAvatar = String(body?.callerAvatar || "").trim()
    const forceCellSim = Boolean(body?.forceCellSim)

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

    // Wake up recipient on ConnectLn (Web Push + Email/SMS Camera Link) + mint host browser conference token in parallel
    const [pushRes, ringCellData, hostTokenData] = await Promise.all([
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
          placeAlertCall: false,
        }),
      })
        .then((r) => r.json())
        .catch(() => null),
      mintTwilioVoiceAccessToken(callerEmail || callerName || "connectln_host").catch(() => null),
    ])

    // Also register target in /api/v1/calls so if they have ConnectLn open in a browser/phone tab, their Incoming Call Banner rings immediately!
    await fetch(`${origin}/api/v1/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "heartbeat",
        call_id: callId,
        user_id: body?.hostUserId || `host_${Date.now()}`,
        display_name: callerName,
        call_type: callMode,
        target_recipient_name: recipientName,
        target_recipient_email: recipientEmail || undefined,
        target_recipient_phone: recipientPhone || undefined,
        initiator_phone: callerPhone || undefined,
        is_video_on: callMode === "video",
      }),
    }).catch(() => {})

    // Dial recipient's physical cell phone directly into the shared Twilio `<Conference>` bridge
    // whenever their mobile phone doesn't have Web Push enabled yet (or when `forceCellSim` is requested)!
    let cellCallSid = ""
    let cellDialError = ""
    const shouldDialCellSim =
      Boolean(recipientPhone) && (forceCellSim || pushRes.mobileDeliveredCount === 0)

    if (shouldDialCellSim && looksLikePhoneNumber(recipientPhone)) {
      const cleanTo = normalizeDialablePhone(recipientPhone)
      const fromCaller =
        cleanTo === twilio.primaryFrom ? twilio.backupTollFree : twilio.primaryFrom
      const confTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="false" beep="false">${escapeXml(
        conferenceName
      )}</Conference></Dial></Response>`

      try {
        const callRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Calls.json`,
          {
            method: "POST",
            headers: {
              Authorization: twilio.authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: cleanTo,
              From: fromCaller,
              Twiml: confTwiml,
              Timeout: "45",
            }).toString(),
          }
        )
        const callJson: any = await callRes.json()
        if (callRes.ok && callJson?.sid) {
          cellCallSid = callJson.sid
        } else {
          cellDialError = callJson?.message || "Carrier could not dial this number."
        }
      } catch (e: any) {
        cellDialError = e?.message || "Failed to place outbound conference call."
      }
    }

    const digits = recipientPhone.replace(/[^\d]/g, "")
    const shareText = `${
      callMode === "video" ? "📹" : "📞"
    } ${callerName} added you to a live ConnectLn group call! Tap to join with camera & audio: ${joinUrl}`

    return NextResponse.json({
      ok: true,
      callId,
      conferenceName,
      joinUrl,
      cellCallSid: cellCallSid || undefined,
      cellDialError: cellCallSid ? undefined : cellDialError || undefined,
      mobilePushDeliveredCount: pushRes.mobileDeliveredCount,
      emailAlertSent: Boolean(ringCellData?.emailSent),
      carrierVoiceToken: hostTokenData?.token || undefined,
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        prettyPhone: recipientPhone ? formatPrettyPhoneDisplay(recipientPhone) : "",
        email: recipientEmail,
        avatar: lookup.member?.avatar || "",
      },
      whatsappShareUrl: digits
        ? `https://wa.me/${digits}?text=${encodeURIComponent(shareText)}`
        : `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      nativeSmsHref: digits
        ? `sms:+${digits}?&body=${encodeURIComponent(shareText)}`
        : `sms:?&body=${encodeURIComponent(shareText)}`,
    })
  } catch (err: any) {
    console.error("[voice/conference-add] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Could not add person to call" },
      { status: 500 }
    )
  }
}
