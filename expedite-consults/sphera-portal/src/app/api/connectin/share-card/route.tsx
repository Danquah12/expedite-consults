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

// Renders the exact `connectln-og.png` signature layout from the user's reference screenshot:
// Left: Blue-ringed circular photo (or personal initials badge) + Sharer Name + "Verified Professional · ConnectLn"
// Right: Large ConnectLn "C" squircle emblem on top + Giant "ConnectLn" wordmark + Terracotta underline bar + "Tickets, vouches, and real work"
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "ConnectLn Member").slice(0, 44)
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
          background: "#141210",
          color: "#F5F0EB",
          fontFamily: "sans-serif",
          padding: 42,
        }}
      >
        {/* Outer Rounded Dark Card Frame matching connectln-og.png */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            background: "#1B1816",
            border: "2px solid #2E2A27",
            borderRadius: 36,
            paddingLeft: 64,
            paddingRight: 64,
          }}
        >
          {/* LEFT COLUMN: Blue-Ringed Circular Avatar + Sharer Name + Verified Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 360,
            }}
          >
            <div
              style={{
                width: 276,
                height: 276,
                borderRadius: 138,
                border: "9px solid #0088ff",
                background: "#0B253C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pic} width={258} height={258} style={{ objectFit: "cover" }} alt="" />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 96, fontWeight: 900, color: "#FFFFFF" }}>
                    {initials}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 34,
                fontWeight: 800,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {name}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 20,
                fontWeight: 700,
                color: "#8E877F",
                textAlign: "center",
              }}
            >
              Verified Professional · ConnectLn
            </div>
          </div>

          {/* RIGHT COLUMN: Large "C" Squircle Icon + Giant "ConnectLn" + Terracotta Underline + Tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              marginLeft: 64,
            }}
          >
            <div
              style={{
                display: "flex",
                marginLeft: 110,
                marginBottom: 16,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                width={168}
                height={168}
                style={{ borderRadius: 36 }}
                alt=""
              />
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 108,
                fontWeight: 900,
                color: "#F5F0EB",
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              ConnectLn
            </div>

            {/* Signature Terracotta Red-Orange Bar */}
            <div
              style={{
                display: "flex",
                width: 400,
                height: 12,
                borderRadius: 6,
                background: "#B84A32",
                marginTop: 16,
                marginBottom: 18,
              }}
            />

            <div
              style={{
                display: "flex",
                fontSize: 35,
                fontWeight: 700,
                color: "#8E877F",
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
