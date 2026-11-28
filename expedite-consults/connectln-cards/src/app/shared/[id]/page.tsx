import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedCardViewerClient } from "@/components/SharedCardViewerClient";
import {
  encodeSharedCardSnapshotToken,
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
  const effectiveToken = token || encodeSharedCardSnapshotToken(snapshot);
  const ogImageUrl = `${publicBaseUrl}/api/share/card-image?c=${encodeURIComponent(
    effectiveToken
  )}`;
  const canonicalUrl = `${publicBaseUrl}/shared/${snapshot.id}${
    effectiveToken ? `?c=${encodeURIComponent(effectiveToken)}` : ""
  }`;

  const title = `${snapshot.title} — Keepsake Card from ${snapshot.senderName}`;
  const description = `“${snapshot.message.slice(0, 140)}” — ${snapshot.senderName} · Presented on ${snapshot.paperStock || "Handmade Stock"} · ${snapshot.envelopeColor || "Cotton Ivory"} Envelope`;

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
          width: 800,
          height: 1120,
          type: "image/png",
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
