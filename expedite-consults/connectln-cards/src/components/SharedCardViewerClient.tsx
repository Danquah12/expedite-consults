"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import {
  downloadCardBlob,
  formatBilingualOccasion,
  renderPersonalizedCardPng,
} from "@/lib/card-image-renderer";
import type { SharedCardSnapshot } from "@/lib/types";
import MultiChannelShareBar from "./MultiChannelShareBar";

export function SharedCardViewerClient({
  snapshot,
}: {
  snapshot: SharedCardSnapshot;
}) {
  const [downloading, setDownloading] = useState(false);

  const coverSrc =
    snapshot.imageUrl && !snapshot.imageUrl.includes("/api/share/card-image")
      ? snapshot.imageUrl
      : snapshot.artworkKey
        ? `/cards/${snapshot.artworkKey}.png`
        : "/cards/thanksgiving.png";

  const bilingualOccasion = formatBilingualOccasion(
    snapshot.occasion,
    snapshot.artworkKey
  );
  const paperStock = snapshot.paperStock || "Handmade Stock";
  const envelopeColor = snapshot.envelopeColor || "Cotton Ivory";
  const sendOwnHref = snapshot.cardId ? `/cards/${snapshot.cardId}` : "/";

  async function handleDownloadPng() {
    setDownloading(true);
    try {
      const rendered = await renderPersonalizedCardPng({
        title: snapshot.title,
        occasion: snapshot.occasion,
        artworkKey: snapshot.artworkKey,
        message: snapshot.message,
        senderName: snapshot.senderName,
        envelopeColor,
        paperStock,
        imageUrl: coverSrc,
      });
      downloadCardBlob(rendered.blob, rendered.filename);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF9F7] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-[600px] space-y-6">
        {/* Exact Keepsake Stationery Card Layout (Matches Email & Social Card Specification) */}
        <article
          data-testid="keepsake-stationery-card"
          className="w-full overflow-hidden rounded-[20px] border border-[#E5E0D8] bg-white shadow-sm"
        >
          {/* 1. Top Navy Banner */}
          <div className="bg-[#1B2A4A] px-8 py-6 text-center">
            <p className="m-0 text-[10px] font-bold uppercase tracking-[3px] text-[#B8935A]">
              CONNECTLN KEEPSAKE
            </p>
            <h1 className="mt-2 font-serif text-[26px] font-semibold leading-tight text-white sm:text-[28px]">
              {snapshot.title}
            </h1>
            <p className="mt-1 text-xs text-[#CBD5E1]">{bilingualOccasion}</p>
          </div>

          {/* 2. Upper Cream Artwork Stage */}
          <div className="bg-[#F3F1EC] px-8 pt-7 pb-4 text-center">
            <img
              src={coverSrc}
              alt={snapshot.title}
              className="mx-auto block h-auto w-full max-w-[300px] rounded-[12px] border border-[#D8D0C5] bg-white shadow-xs"
            />
          </div>

          {/* 3. Lower White Message Body */}
          <div className="bg-white px-7 py-7 sm:px-9">
            <p className="mb-3 text-[13px] font-semibold text-[#7C6239]">
              Warm greetings,
            </p>

            <div className="rounded-r-[12px] border-l-[3px] border-[#B8935A] bg-[#FAF9F7] px-[18px] py-3">
              <p className="m-0 font-serif text-[19px] italic leading-[1.6] text-[#1B2A4A]">
                &ldquo;{snapshot.message}&rdquo;
              </p>
            </div>

            <p className="mt-5 text-right font-serif text-[17px] font-semibold text-[#1B2A4A]">
              {snapshot.senderName}
            </p>
            <p className="mt-1.5 text-right text-[11px] text-[#5A6475]">
              Presented on {paperStock} · {envelopeColor} Envelope
            </p>

            <div className="mt-6 text-center">
              <Link
                href={sendOwnHref}
                className="inline-block rounded-full bg-[#1B2A4A] px-6 py-[11px] text-[13px] font-semibold text-white no-underline transition hover:bg-[#121D34]"
              >
                Send Your Own Keepsake Card
              </Link>
            </div>
          </div>

          {/* 4. Bottom Footer Strip */}
          <div className="border-t border-[#E5E0D8] bg-[#F3F1EC] px-8 py-4 text-center">
            <p className="m-0 text-[11px] text-[#5A6475]">
              Sent via{" "}
              <strong className="font-semibold text-[#1B2A4A]">
                ConnectLn Keepsake
              </strong>{" "}
              · Fine Letterpress &amp; Digital Stationery
            </p>
          </div>
        </article>

        {/* Recipient Action & Reshare Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B2A4A] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#121D34] disabled:opacity-60 cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download Keepsake Card PNG
          </button>
        </div>

        <MultiChannelShareBar
          cardId={snapshot.cardId}
          artworkKey={snapshot.artworkKey}
          occasion={snapshot.occasion}
          envelopeColor={envelopeColor}
          paperStock={paperStock}
          title={snapshot.title}
          message={snapshot.message}
          senderName={snapshot.senderName}
          shareUrl={`/shared/${snapshot.id}`}
          imageUrl={coverSrc}
        />
      </div>
    </div>
  );
}
