import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

// Link-preview card for a shared Wheel video. Shows the SHARER's photo and name.
// If the sharer has no picture, the avatar circle is left blank (neutral, no face).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "").slice(0, 60)
  const title = (searchParams.get("t") || "").slice(0, 110)
  const plate = (searchParams.get("plate") || "").slice(0, 20)
  const rawPic = searchParams.get("p") || ""

  let pic = ""
  if (/^https:\/\//i.test(rawPic)) pic = rawPic
  else if (rawPic) {
    // compact form: base64url JPEG produced by the sharer's browser
    try {
      const b64 = rawPic.replace(/-/g, "+").replace(/_/g, "/")
      if (/^[A-Za-z0-9+/=]+$/.test(b64) && b64.length < 20000) pic = `data:image/jpeg;base64,${b64}`
    } catch {
      pic = ""
    }
  }

  const logoUrl = `${origin}/brand/connectln-icon-256.png`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#1b1816",
          color: "#EFE8DC",
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 380 }}>
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 130,
              border: "8px solid #2f80ed",
              background: "#2a2522",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pic} width={244} height={244} style={{ objectFit: "cover" }} alt="" />
            ) : null}
          </div>
          {name ? (
            <div style={{ marginTop: 24, fontSize: 38, fontWeight: 700, textAlign: "center" }}>{name}</div>
          ) : null}
          <div style={{ marginTop: 8, fontSize: 24, color: "#a39a8e" }}>Shared on ConnectLn</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 40 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={84} height={84} alt="" />
            <div style={{ marginLeft: 20, fontSize: 64, fontWeight: 800 }}>ConnectLn</div>
          </div>
          {plate ? <div style={{ marginTop: 36, fontSize: 28, color: "#e0a458" }}>{plate}</div> : null}
          <div style={{ marginTop: 12, fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>{title}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
