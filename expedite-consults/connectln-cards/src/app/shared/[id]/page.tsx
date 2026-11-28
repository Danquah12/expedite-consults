import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedCardViewerClient } from "@/components/SharedCardViewerClient";
import {
  getEffectivePublicBaseUrl,
  resolveSharedCardSnapshot,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const token = typeof sp?.c === "string" ? sp.c : undefined;
  const snapshot = await resolveSharedCardSnapshot(id, token);
  if (!snapshot) {
    return {
      title: "Keepsake Card Not Found · ConnectLn Keepsake",
    };
  }

  const publicBaseUrl = await getEffectivePublicBaseUrl();
  const ogArtworkKey =
    snapshot.artworkKey ||
    snapshot.imageUrl?.match(/\/cards\/([a-z0-9-]+)\.(png|jpg|jpeg)/i)?.[1] ||
    "thanksgiving";
  const ogImageUrl = `${publicBaseUrl}/cards/og/${ogArtworkKey}.jpg`;
  const canonicalUrl = `${publicBaseUrl}/shared/${snapshot.id}`;

  const title = `${snapshot.title} — Keepsake Card from ${snapshot.senderName}`;
  const description = snapshot.message.slice(0, 160);

  return {
    metadataBase: new URL(publicBaseUrl),
    title,
    description,
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "ConnectLn Keepsake",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: snapshot.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharedCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const token = typeof sp?.c === "string" ? sp.c : undefined;
  const snapshot = await resolveSharedCardSnapshot(id, token);

  if (!snapshot) {
    notFound();
  }

  return <SharedCardViewerClient snapshot={snapshot} />;
}
