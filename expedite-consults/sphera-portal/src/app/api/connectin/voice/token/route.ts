import { NextRequest, NextResponse } from "next/server"
import {
  mintTwilioVoiceAccessToken,
  resolveRecipientCellPhone,
  saveContactPhoneMapping,
  formatPrettyPhoneDisplay,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const callerIdentity = sp.get("identity") || "connectln_caller"
    const targetPhone = sp.get("targetPhone") || ""
    const targetName = sp.get("targetName") || ""
    const targetEmail = sp.get("targetEmail") || ""

    const [tokenInfo, recipientInfo] = await Promise.all([
      mintTwilioVoiceAccessToken(callerIdentity),
      resolveRecipientCellPhone({ targetPhone, targetName, targetEmail }),
    ])

    return NextResponse.json(
      {
        ok: true,
        token: tokenInfo.token,
        identity: tokenInfo.identity,
        callerId: tokenInfo.callerId,
        twimlAppSid: tokenInfo.twimlAppSid,
        resolvedPhone: recipientInfo.resolvedPhone,
        prettyPhone: recipientInfo.resolvedPhone
          ? formatPrettyPhoneDisplay(recipientInfo.resolvedPhone)
          : "",
        matchedMemberName: recipientInfo.matchedMemberName,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (err: any) {
    console.error("[voice/token GET] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to mint Twilio Voice Softphone token" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action || "mint_token"

    if (action === "save_contact_phone") {
      const savedPhone = await saveContactPhoneMapping({
        contactName: body?.contactName,
        contactEmail: body?.contactEmail,
        phone: body?.phone || "",
      })
      if (!savedPhone) {
        return NextResponse.json(
          { ok: false, error: "Please enter a valid mobile phone number." },
          { status: 400 }
        )
      }
      const tokenInfo = await mintTwilioVoiceAccessToken(body?.identity || "connectln_caller")
      return NextResponse.json({
        ok: true,
        savedPhone,
        prettyPhone: formatPrettyPhoneDisplay(savedPhone),
        token: tokenInfo.token,
        identity: tokenInfo.identity,
        callerId: tokenInfo.callerId,
      })
    }

    const [tokenInfo, recipientInfo] = await Promise.all([
      mintTwilioVoiceAccessToken(body?.identity || "connectln_caller"),
      resolveRecipientCellPhone({
        targetPhone: body?.targetPhone,
        targetName: body?.targetName,
        targetEmail: body?.targetEmail,
      }),
    ])

    return NextResponse.json({
      ok: true,
      token: tokenInfo.token,
      identity: tokenInfo.identity,
      callerId: tokenInfo.callerId,
      resolvedPhone: recipientInfo.resolvedPhone,
      prettyPhone: recipientInfo.resolvedPhone
        ? formatPrettyPhoneDisplay(recipientInfo.resolvedPhone)
        : "",
      matchedMemberName: recipientInfo.matchedMemberName,
    })
  } catch (err: any) {
    console.error("[voice/token POST] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Voice token request failed" },
      { status: 500 }
    )
  }
}
