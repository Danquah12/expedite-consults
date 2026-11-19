import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Hard billing guardrail: Outbound/inbound PSTN Twilio Voice legs are disabled
 * because ConnectLn runs 100% Internet WebRTC Calling + User-Borne SIM (`tel:`) / SMS (`sms:`) Handoff.
 * Rejecting before answer guarantees $0.00 Twilio carrier charges even from stale browser tabs.
 */
function rejectPaidTwilioLeg(): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Reject reason="rejected" />
</Response>`
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

export async function GET(_req: NextRequest) {
  return rejectPaidTwilioLeg()
}

export async function POST(_req: NextRequest) {
  return rejectPaidTwilioLeg()
}
