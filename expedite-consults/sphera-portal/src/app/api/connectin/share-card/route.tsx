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

// Side-by-side signature ConnectLn card (Left: Circular Avatar + Name; Right: C Emblem + ConnectLn + Terracotta Bar + Tagline)
// Sized to 560px total width centered inside the 1200x630 canvas so that WhatsApp Desktop's 630x630 center square crop
// and WhatsApp Mobile/LinkedIn's 1200x630 banner both show 100% of the face on the left and 100% of "ConnectLn" on the right.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "ConnectLn Member").slice(0, 32)
  const rawPic = searchParams.get("p") || ""

  const isKwesi = name.toLowerCase().includes("kwesi")
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171513",
          color: "#F5F0EB",
          fontFamily: "sans-serif",
        }}
      >
        {/* 576x560 Center Safe-Zone Frame: fits 100% inside WhatsApp's 630x630 center crop with zero left/right clipping */}
        <div
          style={{
            width: 576,
            height: 560,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            background: "#1C1917",
            border: "3px solid #2E2A27",
            borderRadius: 36,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          {/* LEFT COLUMN (210px): Circular Avatar + Name + Verified Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 210,
            }}
          >
            <div
              style={{
                width: 176,
                height: 176,
                borderRadius: 88,
                border: "6px solid #0088ff",
                background: "#0B253C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pic} width={164} height={164} style={{ objectFit: "cover" }} alt="" />
              ) : (
                <div style={{ display: "flex", fontSize: 68, fontWeight: 900, color: "#FFFFFF" }}>
                  {initials}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 25,
                fontWeight: 900,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {name}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 14,
                fontWeight: 700,
                color: "#9A948C",
                textAlign: "center",
              }}
            >
              Verified Professional · ConnectLn
            </div>
          </div>

          {/* RIGHT COLUMN (296px): "C" Squircle Icon + "ConnectLn" + Terracotta Underline + Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: 296,
              marginLeft: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                marginLeft: 68,
                marginBottom: 14,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                width={116}
                height={116}
                style={{ borderRadius: 26 }}
                alt=""
              />
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              ConnectLn
            </div>

            {/* Signature Terracotta Red-Orange Bar */}
            <div
              style={{
                display: "flex",
                width: 240,
                height: 8,
                borderRadius: 4,
                background: "#B84A32",
                marginTop: 12,
                marginBottom: 12,
              }}
            />

            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                color: "#9A948C",
              }}
            >
              Tickets, vouches, and real work
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
