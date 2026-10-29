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

// Link-preview card for a shared Wheel video or post.
// Centered safe-zone design so both 1200x630 banners (LinkedIn/X) and 1:1 center-cropped thumbnails (WhatsApp)
// display the full ConnectLn dominant header, sharer's circular profile badge, and masterclass title without clipping.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "").slice(0, 60)
  const title = (searchParams.get("t") || "Tickets, vouches, and real work").slice(0, 100)
  const plate = (searchParams.get("plate") || searchParams.get("d") || "").slice(0, 30)
  const rawPic = searchParams.get("p") || ""
  const isSquare = searchParams.get("sq") === "1"

  const isKwesi = name.toLowerCase().includes("kwesi asiedu")
  let pic = ""
  if (/^https:\/\//i.test(rawPic)) {
    pic = rawPic
  } else if (rawPic) {
    try {
      const b64 = rawPic.replace(/-/g, "+").replace(/_/g, "/")
      if (/^[A-Za-z0-9+/=]+$/.test(b64) && b64.length < 20000) {
        pic = `data:image/jpeg;base64,${b64}`
      }
    } catch {
      pic = ""
    }
  } else if (isKwesi) {
    pic = `${origin}/brand/kwesi-avatar.png`
  }

  const initials = getInitials(name)
  const logoUrl = `${origin}/brand/connectln-icon-256.png`

  const width = isSquare ? 630 : 1200
  const height = 630

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #12100E 0%, #1F1B18 55%, #2D1E18 100%)",
          color: "#F5F0EB",
          fontFamily: "sans-serif",
          padding: isSquare ? "28px" : "32px 60px",
        }}
      >
        {/* Center Safe-Zone Card (570px wide so even a 1:1 square crop preserves 100% of the card) */}
        <div
          style={{
            width: isSquare ? "574px" : "600px",
            height: "566px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "2px solid rgba(224, 122, 95, 0.45)",
            borderRadius: "32px",
            padding: "28px 32px",
          }}
        >
          {/* 1. DOMINANT CONNECTLN BRAND HEADER */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              borderBottom: "2px solid rgba(245, 240, 235, 0.14)",
              paddingBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                width={74}
                height={74}
                style={{ borderRadius: "18px", border: "2px solid rgba(255,255,255,0.2)" }}
                alt=""
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: "58px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "-1px",
                    lineHeight: 1,
                  }}
                >
                  ConnectLn
                </div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#E07A5F",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginTop: "6px",
                  }}
                >
                  Tickets, Vouches &amp; Real Work
                </div>
              </div>
            </div>
          </div>

          {/* 2. SHARER PROFILE PICTURE / INITIALS BADGE + NAME */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              backgroundColor: "rgba(10, 102, 194, 0.14)",
              border: "2px solid rgba(56, 189, 248, 0.45)",
              borderRadius: "999px",
              padding: "10px 26px 10px 12px",
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "48px",
                border: "4px solid #0088ff",
                background: "linear-gradient(145deg, #0d2b45 0%, #071829 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pic} width={88} height={88} style={{ objectFit: "cover" }} alt="" />
              ) : (
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "1px",
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "30px", fontWeight: 900, color: "#FFFFFF" }}>
                  {name || "ConnectLn Member"}
                </span>
                <span
                  style={{
                    backgroundColor: "#0066FF",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  ✓ Verified
                </span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#93C5FD", marginTop: "4px" }}>
                Shared an Official ConnectLn Masterclass
              </span>
            </div>
          </div>

          {/* 3. MASTERCLASS TITLE & PLATE FOOTER */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.38)",
              borderRadius: "22px",
              padding: "18px 22px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            {plate ? (
              <div
                style={{
                  backgroundColor: "#A64532",
                  color: "#FFFFFF",
                  padding: "4px 16px",
                  borderRadius: "8px",
                  fontSize: "17px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  marginBottom: "10px",
                }}
              >
                {plate} · MASTERCLASS BRIEFING
              </div>
            ) : null}
            <div
              style={{
                fontSize: title.length > 65 ? "24px" : "28px",
                fontWeight: 800,
                lineHeight: 1.25,
                color: "#FFFFFF",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: "10px",
                fontSize: "15px",
                fontWeight: 800,
                color: "#FBBF24",
                letterSpacing: "0.5px",
              }}
            >
              www.connectln.app
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height }
  )
}
