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
// Uses strictly Satori-safe <div style={{ display: "flex" }}> elements and centers all content inside the middle 580px
// of the 1200x630 canvas so WhatsApp's 1:1 center-crop and LinkedIn's 1200x630 banner both show the full ConnectLn Logo + Sharer Badge.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const name = (searchParams.get("n") || "").slice(0, 50)
  const rawTitle = (searchParams.get("t") || "Tickets, vouches, and real work").replace(/ — Career Masterclass.*$/i, "")
  const title = rawTitle.slice(0, 72)
  const plate = (searchParams.get("plate") || searchParams.get("d") || "").slice(0, 24)
  const rawPic = searchParams.get("p") || ""

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
        {/* Centered 580x580 Safe-Zone Box so WhatsApp's 1:1 center crop captures 100% of the ConnectLn Logo + Sharer Avatar */}
        <div
          style={{
            width: 580,
            height: 570,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#211E1B",
            border: "4px solid #A64532",
            borderRadius: 36,
            padding: 32,
          }}
        >
          {/* 1. DOMINANT CONNECTLN LOGO & WORDMARK AT TOP */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              paddingBottom: 18,
              borderBottom: "3px solid #35302B",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={96} height={96} style={{ borderRadius: 22 }} alt="" />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
              <div style={{ display: "flex", fontSize: 68, fontWeight: 900, color: "#FFFFFF" }}>
                ConnectLn
              </div>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#E07A5F", marginTop: 2 }}>
                Tickets, vouches &amp; real work
              </div>
            </div>
          </div>

          {/* 2. SHARER AVATAR + NAME IN CENTER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#171513",
              border: "3px solid #0088ff",
              borderRadius: 999,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 16,
              paddingRight: 32,
            }}
          >
            <div
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                border: "5px solid #0088ff",
                background: "#0B253C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pic} width={106} height={106} style={{ objectFit: "cover" }} alt="" />
              ) : (
                <div style={{ display: "flex", fontSize: 48, fontWeight: 900, color: "#FFFFFF" }}>
                  {initials}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
              <div style={{ display: "flex", fontSize: 38, fontWeight: 900, color: "#FFFFFF" }}>
                {name || "ConnectLn Member"}
              </div>
              <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: "#7CC4FF", marginTop: 4 }}>
                Verified ConnectLn Member
              </div>
            </div>
          </div>

          {/* 3. MASTERCLASS PLATE & CLEAN TITLE AT BOTTOM */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              background: "#171513",
              borderRadius: 24,
              padding: 20,
            }}
          >
            {plate ? (
              <div
                style={{
                  display: "flex",
                  background: "#A64532",
                  color: "#FFFFFF",
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderRadius: 8,
                  fontSize: 20,
                  fontWeight: 900,
                  marginBottom: 10,
                }}
              >
                {plate}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 800,
                color: "#F5F0EB",
                textAlign: "center",
              }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
