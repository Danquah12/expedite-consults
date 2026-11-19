import { NextRequest, NextResponse } from "next/server"
import {
  resolveRecipientCellPhone,
  saveContactPhoneMapping,
  formatPrettyPhoneDisplay,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Contact Phone Lookup & Mapping Endpoint (100% Internet Calling Mode — Zero Twilio PSTN Voice Tokens).
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const targetPhone = sp.get("targetPhone") || ""
    const targetName = sp.get("targetName") || ""
    const targetEmail = sp.get("targetEmail") || ""

    const recipientInfo = await resolveRecipientCellPhone({
      targetPhone,
      targetName,
      targetEmail,
    })

    return NextResponse.json(
      {
        ok: true,
        internetOnly: true,
        userBorneCarrierHandoff: true,
        token: null,
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
      { ok: false, error: err?.message || "Failed to resolve contact phone" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action || "resolve_phone"

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
      return NextResponse.json({
        ok: true,
        internetOnly: true,
        userBorneCarrierHandoff: true,
        savedPhone,
        prettyPhone: formatPrettyPhoneDisplay(savedPhone),
        token: null,
      })
    }

    const recipientInfo = await resolveRecipientCellPhone({
      targetPhone: body?.targetPhone,
      targetName: body?.targetName,
      targetEmail: body?.targetEmail,
    })

    return NextResponse.json({
      ok: true,
      internetOnly: true,
      userBorneCarrierHandoff: true,
      token: null,
      resolvedPhone: recipientInfo.resolvedPhone,
      prettyPhone: recipientInfo.resolvedPhone
        ? formatPrettyPhoneDisplay(recipientInfo.resolvedPhone)
        : "",
      matchedMemberName: recipientInfo.matchedMemberName,
    })
  } catch (err: any) {
    console.error("[voice/token POST] error:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Contact phone lookup failed" },
      { status: 500 }
    )
  }
}
