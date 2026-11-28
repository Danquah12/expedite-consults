import { ImageResponse } from "next/og";
import { formatBilingualOccasion } from "@/lib/card-image-renderer";
import {
  decodeSharedCardSnapshotToken,
  getEffectivePublicBaseUrl,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("c");
  const decoded = decodeSharedCardSnapshotToken(token);

  const title =
    decoded?.title ||
    searchParams.get("title")?.trim() ||
    "Golden Harvest";
  const occasion =
    decoded?.occasion ||
    searchParams.get("occasion")?.trim() ||
    "Thanksgiving";
  const artworkKey =
    decoded?.artworkKey ||
    searchParams.get("art")?.trim() ||
    "thanksgiving";
  const message =
    decoded?.message ||
    searchParams.get("message")?.trim() ||
    "Grateful for every shared table, warm conversation, and autumn memory we gather this Thanksgiving.";
  const senderName =
    decoded?.senderName ||
    searchParams.get("sender")?.trim() ||
    "Kwesi Asiedu";
  const paperStock =
    decoded?.paperStock ||
    searchParams.get("stock")?.trim() ||
    "Handmade Stock";
  const envelopeColor =
    decoded?.envelopeColor ||
    searchParams.get("envelope")?.trim() ||
    "Cotton Ivory";

  const origin = await getEffectivePublicBaseUrl(request);
  const slug =
    artworkKey ||
    decoded?.imageUrl?.match(/\/cards\/([a-z0-9-]+)\.(png|jpg|jpeg)/i)?.[1] ||
    "thanksgiving";
  const artworkUrl = `${origin}/cards/og/${slug}.jpg`;
  const bilingualOccasion = formatBilingualOccasion(occasion, slug);

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
          backgroundColor: "#FAF9F7",
          padding: "28px 40px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "720px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            border: "2px solid #E5E0D8",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* 1. Top Navy Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1B2A4A",
              padding: "24px 32px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#B8935A",
                fontWeight: 700,
              }}
            >
              CONNECTLN KEEPSAKE
            </div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "34px",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "15px",
                color: "#CBD5E1",
              }}
            >
              {bilingualOccasion}
            </div>
          </div>

          {/* 2. Upper Cream Artwork Stage */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F3F1EC",
              padding: "24px 32px 16px",
            }}
          >
            <img
              src={artworkUrl}
              alt={title}
              width={290}
              height={370}
              style={{
                width: "290px",
                height: "370px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "2px solid #D8D0C5",
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>

          {/* 3. Lower White Message Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FFFFFF",
              padding: "24px 42px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#7C6239",
                marginBottom: "10px",
              }}
            >
              Warm greetings,
            </div>

            <div
              style={{
                display: "flex",
                borderLeft: "4px solid #B8935A",
                backgroundColor: "#FAF9F7",
                padding: "14px 20px",
                borderRadius: "0 12px 12px 0",
              }}
            >
              <div
                style={{
                  fontSize: "21px",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                  color: "#1B2A4A",
                }}
              >
                {`“${message.slice(0, 220)}”`}
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "21px",
                fontWeight: 700,
                color: "#1B2A4A",
              }}
            >
              {senderName}
            </div>
            <div
              style={{
                marginTop: "4px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "13px",
                color: "#5A6475",
              }}
            >
              {`Presented on ${paperStock} · ${envelopeColor} Envelope`}
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#1B2A4A",
                  color: "#FFFFFF",
                  padding: "11px 28px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                Send Your Own Keepsake Card
              </div>
            </div>
          </div>

          {/* 4. Bottom Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTop: "1px solid #E5E0D8",
              backgroundColor: "#F3F1EC",
              padding: "14px 32px",
              fontSize: "13px",
              color: "#5A6475",
            }}
          >
            Sent via ConnectLn Keepsake · Fine Letterpress & Digital Stationery
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 1120,
    }
  );
}
