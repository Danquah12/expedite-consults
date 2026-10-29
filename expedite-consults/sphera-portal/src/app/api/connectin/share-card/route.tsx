import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

function getInitials(name: string): string {
  const clean = (name || "").trim()
  if (!clean) return "CL"
  const parts = clean.split(/[\s-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

// Link-preview card for a shared Wheel video or post. Shows the SHARER's own photo or their personal initials badge (e.g. "BU" for Busyvito).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "").slice(0, 60)
  const title = (searchParams.get("t") || "ConnectLn — Tickets, vouches, and real work").slice(0, 110)
  const plate = (searchParams.get("plate") || searchParams.get("d") || "").slice(0, 30)
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

  const initials = getInitials(name)
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
              width: 240,
              height: 240,
              borderRadius: 120,
              border: "8px solid #0088ff",
              background: "linear-gradient(145deg, #0d2b45 0%, #071829 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pic} width={224} height={224} style={{ objectFit: "cover" }} alt="" />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 82, fontWeight: 900, color: "#F5F0EB", letterSpacing: 2 }}>
                  {initials}
                </div>
                {name ? (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#7cc4ff",
                    }}
                  >
                    {name.slice(0, 18)}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          {name ? (
            <div style={{ marginTop: 22, fontSize: 38, fontWeight: 800, textAlign: "center", color: "#FFFFFF" }}>
              {name}
            </div>
          ) : null}
          <div style={{ marginTop: 6, fontSize: 22, color: "#a39a8e" }}>
            {name ? "Verified ConnectLn Member" : "ConnectLn Network"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 40 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={84} height={84} style={{ borderRadius: 16 }} alt="" />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
              <div style={{ fontSize: 60, fontWeight: 900, color: "#FFFFFF" }}>ConnectLn</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#c2593f" }}>
                Tickets, vouches, and real work
              </div>
            </div>
          </div>
          {plate ? (
            <div
              style={{
                marginTop: 32,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  background: "#a64532",
                  color: "#ffffff",
                  padding: "6px 18px",
                  borderRadius: 10,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {plate}
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 16, fontSize: 38, fontWeight: 800, lineHeight: 1.25, color: "#F5F0EB" }}>
            {title}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
