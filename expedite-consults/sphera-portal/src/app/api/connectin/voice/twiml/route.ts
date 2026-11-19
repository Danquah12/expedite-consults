import { NextRequest, NextResponse } from "next/server"
import {
  looksLikePhoneNumber,
  normalizeDialablePhone,
  escapeXml,
} from "@/lib/connectin-twilio-voice"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function buildTwimlResponse(req: NextRequest): Promise<NextResponse> {
  let params: Record<string, string> = {}

  // Parse query parameters
  req.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v
  })

  // Parse form-urlencoded body sent by Twilio Voice webhook
  if (req.method === "POST") {
    try {
      const rawText = await req.text()
      const form = new URLSearchParams(rawText)
      form.forEach((v, k) => {
        params[k] = v
      })
    } catch {
      // ignore body parse error
    }
  }

  const rawTo = (params.To || params.to || "").trim()
  const rawFrom = (params.From || params.from || "").trim()
  const primaryCallerId = normalizeDialablePhone(
    process.env.TWILIO_PHONE_NUMBER || "+12402623543"
  )
  const backupTollFreeCallerId = "+18333022830"
  const statusUrl = "https://conectln.com/api/connectin/voice/status"

  // Case 1: Outbound PSTN Cell Phone Call initiated from ConnectLn Browser Softphone (`From` starts with `client:`)
  if (rawTo && looksLikePhoneNumber(rawTo)) {
    const cleanTo = normalizeDialablePhone(rawTo)
    // Ensure callerId never equals destination number (if user tests dialing +12402623543 itself, use our Toll-Free +18333022830 line!)
    const effectiveCallerId =
      cleanTo === primaryCallerId ? backupTollFreeCallerId : primaryCallerId

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${escapeXml(effectiveCallerId)}" answerOnBridge="true" timeout="45" action="${escapeXml(statusUrl)}" method="POST">
    <Number>${escapeXml(cleanTo)}</Number>
  </Dial>
</Response>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }

  // Case 2: Browser-to-Browser Twilio Client identity call (`To` is a ConnectLn client username)
  if (rawTo && !rawTo.startsWith("+") && rawFrom.startsWith("client:")) {
    const cleanClient = rawTo
      .replace(/^client:/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 48)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial answerOnBridge="true" timeout="40">
    <Client>${escapeXml(cleanClient)}</Client>
  </Dial>
</Response>`
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  }

  // Case 3: Someone calls the ConnectLn phone number back from their cell phone
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Welcome to ConnectLn by Expedite Consults. Connecting your call now.</Say>
  <Dial timeout="35">
    <Client>kwesi_asiedu</Client>
  </Dial>
</Response>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

export async function POST(req: NextRequest) {
  return buildTwimlResponse(req)
}

export async function GET(req: NextRequest) {
  return buildTwimlResponse(req)
}
