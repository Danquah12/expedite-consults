import { NextResponse } from "next/server";
import {
  createSharedCard,
  encodeSharedCardSnapshotToken,
  getEffectivePublicBaseUrl,
  resolveSharedCardSnapshot,
} from "@/lib/storage";
import type { CardOccasionId } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("publicBase") === "1") {
    const publicBaseUrl = await getEffectivePublicBaseUrl(request);
    return NextResponse.json({ publicBaseUrl });
  }
  const id = searchParams.get("id")?.trim();
  const c = searchParams.get("c")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing card snapshot id." }, { status: 400 });
  }
  const snapshot = await resolveSharedCardSnapshot(id, c);
  if (!snapshot) {
    return NextResponse.json({ error: "Shared card not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cardId?: string;
      artworkKey?: CardOccasionId;
      title?: string;
      occasion?: string;
      message?: string;
      senderName?: string;
      envelopeColor?: string;
      paperStock?: string;
      imageUrl?: string;
    };

    const title = body.title?.trim();
    const message = body.message?.trim();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and personalized message are required to create a shareable card." },
        { status: 400 }
      );
    }

    const origin = await getEffectivePublicBaseUrl(request);
    const artworkSlug =
      body.artworkKey ||
      body.imageUrl?.match(/\/cards\/([a-z0-9-]+)\.(png|jpg|jpeg)/i)?.[1] ||
      "thanksgiving";

    const normalizedImagePath =
      body.imageUrl?.trim() ||
      (body.artworkKey ? `/cards/${body.artworkKey}.png` : undefined);

    const snapshot = await createSharedCard({
      cardId: body.cardId?.trim() || undefined,
      artworkKey: body.artworkKey,
      title,
      occasion: body.occasion?.trim() || undefined,
      message,
      senderName: body.senderName?.trim() || "A Friend",
      envelopeColor: body.envelopeColor?.trim() || "Cotton Ivory",
      paperStock: body.paperStock?.trim() || "350gsm Cotton",
      imageUrl: normalizedImagePath,
    });

    const token = encodeSharedCardSnapshotToken(snapshot);
    const sharePath = `/shared/${snapshot.id}?c=${encodeURIComponent(token)}`;
    const shareUrl = `${origin}${sharePath}`;
    const ogImageUrl = `${origin}/api/share/card-image?c=${encodeURIComponent(
      token
    )}`;

    return NextResponse.json({
      snapshot,
      sharePath,
      shareUrl,
      ogImageUrl,
      artworkImageUrl: `${origin}/cards/${artworkSlug}.png`,
      publicBaseUrl: origin,
    });
  } catch (error) {
    console.error("Failed to create shared card snapshot", error);
    return NextResponse.json(
      { error: "Unable to create shareable card snapshot." },
      { status: 500 }
    );
  }
}
