import { NextRequest, NextResponse } from "next/server"
import {
  resolveRecipientCellPhone,
  normalizeDialablePhone,
  formatPrettyPhoneDisplay,
  escapeXml,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const callerName = String(body?.callerName || "Kwesi Asiedu").trim()
    const callMode: "audio" | "video" = body?.callMode === "video" ? "video" : "audio"
    const joinUrl =
      String(body?.joinUrl || "").trim() ||
      `https://conectln.com/connectin?tab=vibecomms&joinCall=${encodeURIComponent(
        body?.roomId || `room_${Date.now()}`
      )}`
    const alsoPlaceAlertCall = Boolean(body?.placeAlertCall)

    const resolved = await resolveRecipientCellPhone({
      targetPhone: body?.toPhone,
      targetName: body?.targetName,
      targetEmail: body?.targetEmail,
    })

    if (!resolved.resolvedPhone) {
      return NextResponse.json(
        {
          ok: false,
          needsPhone: true,
          error: "No mobile phone number on file yet for this contact. Enter their cell number to ring their phone.",
        },
        { status: 200 }
      )
    }

    const toPhone = normalizeDialablePhone(resolved.resolvedPhone)
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim()
    const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim()
    const localFrom = normalizeDialablePhone(process.env.TWILIO_PHONE_NUMBER || "+12402623543")
    const tollFreeFrom = "+18333022830"

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { ok: false, error: "Twilio credentials not configured on server." },
        { status: 500 }
      )
    }

    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
    const smsText = `ConnectLn ${callMode === "video" ? "Video" : "Voice"} Call from ${callerName}: Tap to join live on your phone -> ${joinUrl}`

    // Try Toll-Free +18333022830 first for US carrier deliverability, then local +12402623543 fallback
    let smsSent = false
    let smsSid = ""
    let smsError = ""
    const candidateSenders =
      toPhone === tollFreeFrom
        ? [localFrom]
        : toPhone === localFrom
        ? [tollFreeFrom]
        : [tollFreeFrom, localFrom]

    for (const fromNum of candidateSenders) {
      try {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: toPhone,
              From: fromNum,
              Body: smsText,
            }).toString(),
          }
        )
        const data: any = await res.json()
        if (res.ok && data?.sid) {
          smsSent = true
          smsSid = data.sid
          break
        }
        smsError = data?.message || smsError
      } catch (e: any) {
        smsError = e?.message || smsError
      }
    }

    // Optional automated ring alert (e.g. when starting a Video Call so their cell phone physically rings & announces the incoming video call!)
    let voiceAlertSid = ""
    if (alsoPlaceAlertCall) {
      const fromCaller = toPhone === localFrom ? tollFreeFrom : localFrom
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Pause length="1"/><Say voice="Polly.Joanna">Hello! Incoming ConnectLn ${callMode} call from ${escapeXml(
        callerName
      )}. Please check the text message link just sent to your mobile phone to join with live video and audio, or call right back.</Say><Pause length="1"/><Say voice="Polly.Joanna">Once again, ${escapeXml(
        callerName
      )} is calling you live on ConnectLn.</Say></Response>`

      try {
        const callRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: toPhone,
              From: fromCaller,
              Twiml: twiml,
            }).toString(),
          }
        )
        const callData: any = await callRes.json()
        if (callRes.ok && callData?.sid) {
          voiceAlertSid = callData.sid
        }
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      toPhone,
      prettyPhone: formatPrettyPhoneDisplay(toPhone),
      matchedMemberName: resolved.matchedMemberName,
      smsSent,
      smsSid,
      smsError: smsSent ? undefined : smsError,
      voiceAlertSid: voiceAlertSid || undefined,
    })
  } catch (err: any) {
    console.error("[voice/ring-cell] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to alert recipient cell phone" },
      { status: 500 }
    )
  }
}
