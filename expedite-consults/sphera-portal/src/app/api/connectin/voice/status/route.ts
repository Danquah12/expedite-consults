import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function handleStatus(req: NextRequest): Promise<NextResponse> {
  let dialStatus = req.nextUrl.searchParams.get("DialCallStatus") || ""
  if (req.method === "POST") {
    try {
      const raw = await req.text()
      const form = new URLSearchParams(raw)
      dialStatus = form.get("DialCallStatus") || form.get("CallStatus") || dialStatus
    } catch {}
  }

  if (dialStatus === "no-answer" || dialStatus === "busy" || dialStatus === "failed") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">The mobile phone is currently unavailable or did not answer. You can also send a direct message or call link on ConnectLn.</Say>
  <Hangup/>
</Response>`
    return new NextResponse(xml, {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    })
  }

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  })
}

export async function POST(req: NextRequest) {
  return handleStatus(req)
}

export async function GET(req: NextRequest) {
  return handleStatus(req)
}
