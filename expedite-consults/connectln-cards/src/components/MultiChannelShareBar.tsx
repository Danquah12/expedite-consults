"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import {
  copyCardImageToClipboard,
  downloadCardBlob,
  type RenderedCardImage,
  renderPersonalizedCardPng,
  shareCardFileNatively,
} from "@/lib/card-image-renderer";
import {
  buildSocialShareLinks,
  SOCIAL_CHANNEL_META,
} from "@/lib/social-share";
import type {
  CardOccasionId,
  SocialChannel,
  SocialDispatchLog,
} from "@/lib/types";

interface MultiChannelShareBarProps {
  title: string;
  message: string;
  senderName?: string;
  shareUrl: string;
  imageUrl?: string;
  hashtags?: string[];
  compact?: boolean;
  defaultPhone?: string;
  cardId?: string;
  artworkKey?: CardOccasionId;
  occasion?: string;
  envelopeColor?: string;
  paperStock?: string;
}

export default function MultiChannelShareBar({
  title,
  message,
  senderName,
  shareUrl,
  imageUrl,
  hashtags,
  compact = false,
  defaultPhone = "",
  cardId,
  artworkKey,
  occasion,
  envelopeColor = "Cotton Ivory",
  paperStock = "350gsm Cotton",
}: MultiChannelShareBarProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [results, setResults] = useState<SocialDispatchLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clipboardBanner, setClipboardBanner] = useState<string | null>(null);
  const [pendingChannelOpen, setPendingChannelOpen] = useState<{
    channel: SocialChannel;
    label: string;
    url: string;
    imageCopied: boolean;
  } | null>(null);

  const [renderedCard, setRenderedCard] = useState<RenderedCardImage | null>(
    null
  );
  const [renderingCard, setRenderingCard] = useState(false);

  const [snapshotCache, setSnapshotCache] = useState<{
    signature: string;
    url: string;
  } | null>(null);

  const resolvedImageUrl = useMemo(() => {
    const raw =
      imageUrl || (artworkKey ? `/cards/${artworkKey}.png` : "");
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${raw.startsWith("/") ? "" : "/"}${raw}`;
    }
    return raw;
  }, [imageUrl, artworkKey]);

  const baseShareUrl = useMemo(() => {
    if (!shareUrl) {
      return typeof window !== "undefined" ? window.location.href : "";
    }
    if (shareUrl.startsWith("http")) return shareUrl;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${shareUrl.startsWith("/") ? "" : "/"}${shareUrl}`;
    }
    return shareUrl;
  }, [shareUrl]);

  const cardSignature = useMemo(
    () =>
      JSON.stringify({
        cardId,
        artworkKey,
        title,
        occasion,
        message,
        senderName,
        envelopeColor,
        resolvedImageUrl,
        baseShareUrl,
      }),
    [
      cardId,
      artworkKey,
      title,
      occasion,
      message,
      senderName,
      envelopeColor,
      resolvedImageUrl,
      baseShareUrl,
    ]
  );

  const effectivePreviewUrl =
    snapshotCache?.signature === cardSignature
      ? snapshotCache.url
      : baseShareUrl;

  const links = useMemo(
    () =>
      buildSocialShareLinks({
        title,
        message,
        senderName,
        shareUrl: effectivePreviewUrl,
        imageUrl: resolvedImageUrl,
        phoneNumber,
        hashtags,
      }),
    [
      title,
      message,
      senderName,
      effectivePreviewUrl,
      resolvedImageUrl,
      phoneNumber,
      hashtags,
    ]
  );

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setRenderingCard(true);
      renderPersonalizedCardPng({
        title,
        occasion,
        message: message || "Warm wishes from ConnectLn Keepsake.",
        senderName,
        envelopeColor,
        imageUrl: resolvedImageUrl || undefined,
      })
        .then((img) => {
          if (active) setRenderedCard(img);
        })
        .catch(() => {
          // Canvas preview fallback silently ignored
        })
        .finally(() => {
          if (active) setRenderingCard(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [title, occasion, message, senderName, envelopeColor, resolvedImageUrl]);

  function isLocalShareUrl(rawUrl: string): boolean {
    return /^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\])(?::\d+)?/i.test(
      rawUrl
    );
  }

  async function ensurePersonalizedShareUrl(): Promise<string> {
    if (snapshotCache && snapshotCache.signature === cardSignature) {
      return snapshotCache.url;
    }

    if (
      baseShareUrl.includes("/shared/") ||
      baseShareUrl.includes("/invite/")
    ) {
      if (!isLocalShareUrl(baseShareUrl)) {
        return baseShareUrl;
      }
      try {
        const res = await fetch("/api/share/card?publicBase=1");
        const json = (await res.json()) as { publicBaseUrl?: string };
        if (res.ok && json.publicBaseUrl && !isLocalShareUrl(json.publicBaseUrl)) {
          const parsed = new URL(baseShareUrl);
          const upgraded = `${json.publicBaseUrl.replace(/\/+$/, "")}${parsed.pathname}${parsed.search}${parsed.hash}`;
          setSnapshotCache({ signature: cardSignature, url: upgraded });
          return upgraded;
        }
      } catch {
        // Fallback to baseShareUrl
      }
      return baseShareUrl;
    }

    try {
      const res = await fetch("/api/share/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          artworkKey,
          title,
          occasion,
          message: message || "Warm wishes from ConnectLn Keepsake.",
          senderName: senderName || "ConnectLn Keepsake",
          envelopeColor,
          paperStock,
          imageUrl:
            imageUrl || (artworkKey ? `/cards/${artworkKey}.png` : undefined),
        }),
      });
      const json = (await res.json()) as { shareUrl?: string };
      if (res.ok && json.shareUrl) {
        setSnapshotCache({ signature: cardSignature, url: json.shareUrl });
        return json.shareUrl;
      }
    } catch {
      // Fallback to baseShareUrl
    }
    return baseShareUrl;
  }

  async function handleCopyCaption(tag = "caption") {
    try {
      await navigator.clipboard.writeText(links.caption);
      setCopiedId(tag);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      // Fallback ignored
    }
  }

  async function handleCopyCardImage(tag = "image") {
    if (!renderedCard) return false;
    const ok = await copyCardImageToClipboard(renderedCard.blob);
    if (ok) {
      setCopiedId(tag);
      setClipboardBanner(
        "Personalized card image copied to clipboard! Press Ctrl+V in WhatsApp, Facebook, or X to attach the visual card alongside your message."
      );
      setTimeout(() => setCopiedId(null), 3000);
    }
    return ok;
  }

  async function handleNativeShareCard() {
    if (!renderedCard) return;
    const url = await ensurePersonalizedShareUrl();
    const res = await shareCardFileNatively(
      renderedCard.file,
      title,
      `${title}\n${message}\n${url}`
    );
    if (res === "unsupported") {
      downloadCardBlob(renderedCard.blob, renderedCard.filename);
      setClipboardBanner(
        "Native OS Share Sheet is unavailable in this browser — your personalized Keepsake PNG has been downloaded instead!"
      );
    }
  }

  async function dispatchChannels(
    channels: SocialChannel[],
    key: string,
    overrideShareUrl?: string
  ) {
    setDispatching(key);
    setError(null);
    try {
      const targetShareUrl =
        overrideShareUrl || (await ensurePersonalizedShareUrl());
      const res = await fetch("/api/share/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channels,
          title,
          message,
          senderName,
          shareUrl: targetShareUrl,
          imageUrl:
            imageUrl || (artworkKey ? `/cards/${artworkKey}.png` : undefined),
          phoneNumber,
          hashtags,
          cardId,
          artworkKey,
          occasion,
          envelopeColor,
          paperStock,
        }),
      });
      const json = (await res.json()) as {
        results?: SocialDispatchLog[];
        shareUrl?: string;
        imageUrl?: string;
        publishedPost?: Record<string, unknown> | null;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || "Unable to share to social channels.");
      }
      if (json.shareUrl) {
        setSnapshotCache({ signature: cardSignature, url: json.shareUrl });
      }
      const next = json.results ?? [];
      const connectlnRes = next.find((item) => item.channel === "connectln");
      if (
        connectlnRes &&
        typeof window !== "undefined" &&
        window.parent &&
        window.parent !== window
      ) {
        try {
          window.parent.postMessage(
            {
              type: "CONNECTLN_KEEPSAKE_CARD_PUBLISHED",
              post: json.publishedPost || null,
              card: {
                id: connectlnRes.externalId,
                title,
                occasion,
                message,
                senderName: senderName || "ConnectLn Keepsake",
                shareUrl: connectlnRes.shareUrl || json.shareUrl || targetShareUrl,
                imageUrl: json.imageUrl || resolvedImageUrl,
                caption: connectlnRes.caption || links.caption,
              },
            },
            "*"
          );
        } catch {
          // Ignore cross-frame notification error
        }
      }
      setResults((prev) => {
        const merged = [...next];
        for (const old of prev) {
          if (!merged.some((m) => m.channel === old.channel)) {
            merged.push(old);
          }
        }
        return merged;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to dispatch share."
      );
    } finally {
      setDispatching(null);
    }
  }

  async function handleChannelClick(channel: SocialChannel) {
    if (channel === "connectln") {
      setPendingChannelOpen(null);
      await dispatchChannels(["connectln"], "connectln");
      return;
    }

    // Copy personalized card PNG to clipboard right inside the user click gesture
    let imageCopied = false;
    if (renderedCard) {
      imageCopied = await copyCardImageToClipboard(renderedCard.blob);
    }

    const personalizedUrl = await ensurePersonalizedShareUrl();
    const freshLinks = buildSocialShareLinks({
      title,
      message,
      senderName,
      shareUrl: personalizedUrl,
      imageUrl: resolvedImageUrl,
      phoneNumber,
      hashtags,
    });

    if (channel === "whatsapp") {
      setPendingChannelOpen({
        channel: "whatsapp",
        label: "WhatsApp",
        url: freshLinks.whatsappUrl,
        imageCopied,
      });
      const hasPublicHttps = personalizedUrl.startsWith("https://");
      setClipboardBanner(
        hasPublicHttps
          ? "Live public HTTPS card link ready! Click 'Open WhatsApp Now' and wait ~2 seconds in WhatsApp for the rich visual card preview to load (or press Ctrl+V to also attach the full PNG)."
          : imageCopied
            ? "Card PNG image is copied to your clipboard! Click 'Open WhatsApp Now' below, then press Ctrl+V in your WhatsApp chat to attach the visual card."
            : "Your personalized card link is ready! Download the PNG above or click 'Open WhatsApp Now' below to share."
      );
      await dispatchChannels(["whatsapp"], "whatsapp", personalizedUrl);
      return;
    }
    if (channel === "facebook") {
      setPendingChannelOpen({
        channel: "facebook",
        label: "Facebook",
        url: freshLinks.facebookUrl,
        imageCopied,
      });
      setClipboardBanner(
        imageCopied
          ? "Card PNG copied to clipboard! Click 'Open Facebook Now' below, then press Ctrl+V to attach your card PNG."
          : "Personalized card link ready for Facebook! Click 'Open Facebook Now' below."
      );
      await dispatchChannels(["facebook"], "facebook", personalizedUrl);
      return;
    }
    if (channel === "x") {
      setPendingChannelOpen({
        channel: "x",
        label: "X",
        url: freshLinks.xUrl,
        imageCopied,
      });
      setClipboardBanner(
        imageCopied
          ? "Card PNG copied to clipboard! Click 'Open X Now' below, then press Ctrl+V inside your post to attach the card PNG."
          : "Personalized card link ready for X! Click 'Open X Now' below."
      );
      await dispatchChannels(["x"], "x", personalizedUrl);
      return;
    }
    if (channel === "instagram") {
      if (renderedCard) {
        downloadCardBlob(renderedCard.blob, renderedCard.filename);
      }
      setPendingChannelOpen({
        channel: "instagram",
        label: "Instagram",
        url: freshLinks.instagramUrl,
        imageCopied: Boolean(renderedCard),
      });
      setClipboardBanner(
        "Personalized card PNG downloaded! Copy caption above if needed, then click 'Open Instagram Now' to upload the card image."
      );
      await dispatchChannels(["instagram"], "instagram", personalizedUrl);
    }
  }

  const badgeByChannel = new Map<SocialChannel, SocialDispatchLog>();
  for (const r of results) {
    if (!badgeByChannel.has(r.channel)) badgeByChannel.set(r.channel, r);
  }

  return (
    <div
      className={
        compact
          ? "w-full rounded-2xl border border-[#E6DFD3] bg-[#FAF9F7] p-4 text-left text-[#1B2A4A] shadow-sm"
          : "w-full rounded-2xl border border-[#E6DFD3] bg-white p-5 text-left text-[#1B2A4A] shadow-sm"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2A4A] text-white">
            <Share2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#1B2A4A]">
              Share Visual Card to ConnectLn, WhatsApp, Facebook, Instagram & X
            </h3>
            <p className="text-xs text-[#64748B]">
              Shares your live personalized card PNG + recipient card viewer link.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            dispatchChannels(
              ["connectln", "whatsapp", "facebook", "instagram", "x"],
              "all"
            )
          }
          disabled={dispatching !== null}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1B2A4A] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#121D34] disabled:opacity-60 cursor-pointer"
        >
          {dispatching === "all" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Broadcast All 5
        </button>
      </div>

      {/* Rendered Personalized Visual Card Strip */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#E6DFD3] bg-[#FAF9F7] p-3">
        <div className="relative h-20 w-30 shrink-0 overflow-hidden rounded-lg border border-[#D8D0C5] bg-white shadow-sm">
          {renderedCard ? (
            <img
              src={renderedCard.dataUrl}
              alt="Rendered Keepsake Card"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
              {renderingCard ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#1B2A4A]">
            Personalized Card PNG Ready
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
            Includes artwork, inside message &amp; signature · {envelopeColor}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={handleNativeShareCard}
              disabled={!renderedCard}
              className="inline-flex items-center gap-1 rounded-full bg-[#1B2A4A] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#121D34] disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="h-3 w-3" />
              Share Card Image
            </button>
            <button
              type="button"
              onClick={() => handleCopyCardImage("image")}
              disabled={!renderedCard}
              className="inline-flex items-center gap-1 rounded-full border border-[#D8D0C5] bg-white px-3 py-1 text-[11px] font-semibold text-[#1B2A4A] hover:bg-[#F3F1EC] disabled:opacity-50 cursor-pointer"
            >
              {copiedId === "image" ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedId === "image" ? "Copied PNG!" : "Copy Card Image"}
            </button>
            {renderedCard && (
              <button
                type="button"
                onClick={() =>
                  downloadCardBlob(renderedCard.blob, renderedCard.filename)
                }
                className="inline-flex items-center gap-1 rounded-full border border-[#D8D0C5] bg-white px-3 py-1 text-[11px] font-semibold text-[#1B2A4A] hover:bg-[#F3F1EC] cursor-pointer"
              >
                <Download className="h-3 w-3" />
                Download PNG
              </button>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-[#E6DFD3] bg-[#FAF9F7] px-3 py-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-[#15803D]" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Optional WhatsApp phone (e.g. +14155550199)"
              className="w-full bg-transparent text-xs text-[#1B2A4A] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => handleCopyCaption("caption")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D0C5] bg-white px-3 py-1.5 text-xs font-medium text-[#1B2A4A] hover:bg-[#F3F1EC] cursor-pointer"
          >
            {copiedId === "caption" ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedId === "caption" ? "Caption Copied" : "Copy Caption"}
          </button>
        </div>
      )}

      {(clipboardBanner || pendingChannelOpen) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#B8935A]/60 bg-[#FAF6EE] px-4 py-3 text-xs text-[#1B2A4A] shadow-xs">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {renderedCard && (
              <img
                src={renderedCard.dataUrl}
                alt="Prepared card PNG"
                className="h-11 w-16 shrink-0 rounded border border-[#D8D0C5] object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-[#1B2A4A]">
                {pendingChannelOpen?.imageCopied
                  ? "Step 1 Done: Visual Card PNG Ready!"
                  : "Visual Card Prepared"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#5A6475]">
                {clipboardBanner}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderedCard && (
              <button
                type="button"
                onClick={handleNativeShareCard}
                className="inline-flex items-center gap-1 rounded-full border border-[#D8D0C5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1B2A4A] hover:bg-[#F3F1EC] cursor-pointer"
              >
                <Share2 className="h-3 w-3" />
                OS Share Sheet
              </button>
            )}
            {pendingChannelOpen && (
              <a
                href={pendingChannelOpen.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#15803D] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#166534]"
              >
                Open {pendingChannelOpen.label} Now
                {pendingChannelOpen.channel !== "instagram" ? " (Then Press Ctrl+V)" : ""}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {SOCIAL_CHANNEL_META.map((ch) => {
          const res = badgeByChannel.get(ch.id);
          const isLoading = dispatching === ch.id || dispatching === "all";
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleChannelClick(ch.id)}
              disabled={dispatching !== null}
              className="flex flex-col items-start justify-between rounded-xl border border-[#E6DFD3] bg-[#FAF9F7] px-3 py-2 text-left transition hover:border-[#B8935A] hover:bg-white disabled:opacity-60 cursor-pointer"
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span
                  className="text-xs font-bold"
                  style={{ color: ch.accentHex }}
                >
                  {ch.shortLabel}
                </span>
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#64748B]" />
                ) : ch.id === "instagram" ? (
                  <Instagram className="h-3 w-3 text-[#BE185D]" />
                ) : (
                  <ExternalLink className="h-3 w-3 text-[#64748B]" />
                )}
              </div>
              <span className="mt-1 text-[11px] text-[#64748B]">
                {res
                  ? res.status === "PUBLISHED"
                    ? "Card posted live"
                    : ch.id === "instagram"
                      ? "PNG downloaded"
                      : "Card copied + open"
                  : ch.id === "connectln"
                    ? "Embed card live"
                    : ch.id === "instagram"
                      ? "Download PNG + IG"
                      : `Send + Copy PNG`}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-[#E6DFD3] bg-[#FAF9F7] p-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    r.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : r.status === "READY_LINK"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {r.status === "PUBLISHED" ? "PUBLISHED" : "READY"}
                </span>
                <span className="font-semibold capitalize">{r.channel}</span>
                {r.externalId && (
                  <span className="font-mono text-[11px] text-[#64748B]">
                    ID: {r.externalId}
                  </span>
                )}
                {r.error && (
                  <span className="text-[11px] text-[#64748B]">{r.error}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {r.shareUrl && (
                  <a
                    href={r.shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`share-result-view-card-${r.channel}`}
                    className="inline-flex items-center gap-1 font-medium text-[#7C6239] underline hover:text-[#1B2A4A]"
                  >
                    View Card <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {r.targetUrl && (
                  <a
                    href={r.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`share-result-open-${r.channel}`}
                    onClick={(e) => {
                      if (
                        r.channel === "connectln" &&
                        typeof window !== "undefined" &&
                        window.parent &&
                        window.parent !== window &&
                        !e.metaKey &&
                        !e.ctrlKey &&
                        !e.shiftKey &&
                        e.button === 0
                      ) {
                        e.preventDefault();
                        try {
                          window.parent.postMessage(
                            {
                              type: "CONNECTLN_OPEN_FEED",
                              postId: r.externalId,
                              shareUrl: r.shareUrl,
                              card: {
                                id: r.externalId,
                                title,
                                occasion,
                                message,
                                senderName: senderName || "ConnectLn Keepsake",
                                shareUrl: r.shareUrl,
                                imageUrl: resolvedImageUrl,
                                caption: r.caption || links.caption,
                              },
                            },
                            "*"
                          );
                        } catch {
                          window.open(r.targetUrl, "_blank", "noopener,noreferrer");
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-[#1B2A4A] underline hover:text-[#B8935A]"
                  >
                    Open {r.channel === "connectln" ? "ConnectLn" : r.channel}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
