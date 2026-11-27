import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = (searchParams.get("city") || "Maryland City").slice(0, 48)
  const region = (searchParams.get("region") || "MARYLAND").slice(0, 40)
  const country = (searchParams.get("country") || "US").slice(0, 8).toUpperCase()

  const isMdDcVa =
    country === "US" &&
    (region.includes("MARYLAND") || region === "MD" || region.includes("DISTRICT") || region.includes("VIRGINIA"))

  const highwayLabel = country === "US" ? "95" : country
  const secondaryHighway = country === "US" ? "495" : "A1"
  const routeBadge = isMdDcVa ? "US 1" : country === "US" ? "US 1" : "R1"

  const surroundingLabels = isMdDcVa
    ? ["Olney", "Jessup", "Laurel", "Odenton", "Bowie", "Crofton"]
    : ["North Sector", "Metro Core", city, "East Junction", "South Loop", "West Corridor"]

  return new ImageResponse(
    (
      <div
        style={{
          width: "760px",
          height: "270px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0c3540",
          backgroundImage: "linear-gradient(135deg, #0b2d37 0%, #0f4452 52%, #0a2a33 100%)",
          color: "#dbeafe",
          fontFamily: "sans-serif",
          padding: "18px 24px",
        }}
      >
        {/* Top dark-teal stylized regional road lines (pure flex elements for Satori reliability) */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "140px",
            width: "5px",
            height: "360px",
            backgroundColor: "rgba(94, 152, 166, 0.28)",
            transform: "rotate(18deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "410px",
            width: "6px",
            height: "360px",
            backgroundColor: "rgba(94, 152, 166, 0.34)",
            transform: "rotate(-24deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "105px",
            left: "-20px",
            width: "820px",
            height: "5px",
            backgroundColor: "rgba(94, 152, 166, 0.26)",
            transform: "rotate(-6deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "185px",
            left: "-20px",
            width: "820px",
            height: "4px",
            backgroundColor: "rgba(94, 152, 166, 0.2)",
            transform: "rotate(7deg)",
            display: "flex",
          }}
        />

        {/* Top row: highway shield & surrounding town labels */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#9ac2cc" }}>
            {surroundingLabels[0]}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1d4ed8",
              borderTop: "4px solid #dc2626",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 800,
              padding: "3px 9px",
              borderRadius: "6px",
            }}
          >
            {highwayLabel}
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#9ac2cc" }}>
            {surroundingLabels[1]}
          </span>
        </div>

        {/* Center row: highlighted geo pin for detected city */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "13px",
              fontWeight: 800,
              padding: "4px 9px",
              borderRadius: "8px",
            }}
          >
            {routeBadge}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(8, 28, 35, 0.88)",
              border: "2px solid #38bdf8",
              borderRadius: "999px",
              padding: "10px 20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "8px",
                backgroundColor: "#0064E0",
                border: "3px solid #ffffff",
                display: "flex",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "19px", fontWeight: 800, color: "#ffffff", lineHeight: 1.15 }}>
                {city}
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#7dd3fc", letterSpacing: "0.08em" }}>
                {region}, {country}
              </span>
            </div>
          </div>

          <span style={{ fontSize: "16px", fontWeight: 600, color: "#9ac2cc" }}>
            {surroundingLabels[3]}
          </span>
        </div>

        {/* Bottom row: secondary corridor labels */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1d4ed8",
              borderTop: "4px solid #dc2626",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 800,
              padding: "3px 9px",
              borderRadius: "6px",
            }}
          >
            {secondaryHighway}
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#9ac2cc" }}>
            {surroundingLabels[4]}
          </span>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#9ac2cc" }}>
            {surroundingLabels[5]}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#7dd3fc" }}>
            ConnectLn Geo Guard
          </span>
        </div>
      </div>
    ),
    {
      width: 760,
      height: 270,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  )
}
