import type { SocialChannel } from "./types";

export interface SocialChannelMeta {
  id: SocialChannel;
  label: string;
  shortLabel: string;
  description: string;
  accentHex: string;
  badgeBg: string;
  supportsDirectApi: boolean;
}

export const SOCIAL_CHANNEL_META: SocialChannelMeta[] = [
  {
    id: "connectln",
    label: "ConnectLn",
    shortLabel: "ConnectLn",
    description: "Publish straight to your ConnectLn community feed & network.",
    accentHex: "#1B2A4A",
    badgeBg: "#EEF2F7",
    supportsDirectApi: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    shortLabel: "WhatsApp",
    description: "Send formatted greeting or RSVP invite via WhatsApp / Cloud API.",
    accentHex: "#15803D",
    badgeBg: "#ECFDF3",
    supportsDirectApi: true,
  },
  {
    id: "facebook",
    label: "Facebook",
    shortLabel: "Facebook",
    description: "Share keepsake link or publish directly to a Facebook Page.",
    accentHex: "#1D4ED8",
    badgeBg: "#EFF6FF",
    supportsDirectApi: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    shortLabel: "Instagram",
    description: "Copy curated caption + download 3:4 PNG card cover or post via Graph API.",
    accentHex: "#BE185D",
    badgeBg: "#FDF2F8",
    supportsDirectApi: true,
  },
  {
    id: "x",
    label: "X (Twitter)",
    shortLabel: "X",
    description: "Launch pre-filled X post composer or dispatch via X API v2.",
    accentHex: "#0F172A",
    badgeBg: "#F1F5F9",
    supportsDirectApi: true,
  },
];

export interface SocialSharePayload {
  title: string;
  message: string;
  senderName?: string;
  shareUrl: string;
  imageUrl?: string;
  phoneNumber?: string;
  hashtags?: string[];
}

export interface BuiltSocialLinks {
  caption: string;
  connectlnUrl: string;
  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
}

function normalizeWhatsAppDigits(raw?: string): string {
  if (!raw) return "";
  return raw.replace(/[^\d]/g, "");
}

export function buildSocialCaption(payload: SocialSharePayload): string {
  const tags =
    payload.hashtags && payload.hashtags.length > 0
      ? payload.hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
      : "#ConnectLnKeepsake #Celebration";

  const lines: string[] = [
    payload.title.trim(),
    "",
    payload.message.trim(),
  ];
  if (payload.senderName?.trim()) {
    lines.push(`— ${payload.senderName.trim()}`);
  }
  if (payload.shareUrl?.trim()) {
    lines.push("", "Open your interactive card:", payload.shareUrl.trim());
  }
  lines.push("", tags);
  return lines.join("\n");
}

export function buildSocialShareLinks(
  payload: SocialSharePayload,
  connectlnBaseUrl = "https://conectln.com"
): BuiltSocialLinks {
  const caption = buildSocialCaption(payload);
  const encodedCaption = encodeURIComponent(caption);
  const encodedShareUrl = encodeURIComponent(payload.shareUrl);
  const encodedQuote = encodeURIComponent(
    `${payload.title} — ${payload.message}${
      payload.senderName ? ` (${payload.senderName})` : ""
    }`
  );

  const digits = normalizeWhatsAppDigits(payload.phoneNumber);
  const whatsappUrl = digits
    ? `https://wa.me/${digits}?text=${encodedCaption}`
    : `https://wa.me/?text=${encodedCaption}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedQuote}`;
  const xText = encodeURIComponent(
    `${payload.title}\n${payload.message.slice(0, 140)}${
      payload.message.length > 140 ? "..." : ""
    }${payload.senderName ? ` — ${payload.senderName}` : ""}`
  );
  const hashtagsParam =
    payload.hashtags && payload.hashtags.length > 0
      ? `&hashtags=${encodeURIComponent(
          payload.hashtags.map((h) => h.replace(/^#/, "")).join(",")
        )}`
      : "";
  const xUrl = `https://x.com/intent/tweet?text=${xText}&url=${encodedShareUrl}${hashtagsParam}`;

  const normalizedBase = (connectlnBaseUrl || "https://conectln.com").replace(/\/+$/, "");
  const isMainConnectLnPortal =
    /conectln\.com|connectln\.app|connectin/i.test(normalizedBase) &&
    !/connectln-social/i.test(normalizedBase);
  const connectlnPath = isMainConnectLnPortal
    ? normalizedBase.endsWith("/connectin")
      ? normalizedBase
      : `${normalizedBase}/connectin`
    : normalizedBase;
  const connectlnUrl = `${connectlnPath}?postTitle=${encodeURIComponent(
    caption
  )}&postAuthor=${encodeURIComponent(
    payload.senderName || "ConnectLn Keepsake"
  )}${
    payload.imageUrl ? `&postImage=${encodeURIComponent(payload.imageUrl)}` : ""
  }`;
  const instagramUrl = "https://www.instagram.com/";

  return {
    caption,
    connectlnUrl,
    whatsappUrl,
    facebookUrl,
    instagramUrl,
    xUrl,
  };
}
