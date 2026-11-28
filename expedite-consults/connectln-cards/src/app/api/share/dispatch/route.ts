import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildSocialShareLinks } from "@/lib/social-share";
import {
  createSharedCard,
  encodeSharedCardSnapshotToken,
  getEffectivePublicBaseUrl,
  getSocialConfig,
  getSocialLogs,
  isLocalhostUrl,
  recordSocialLogs,
} from "@/lib/storage";
import type {
  CardOccasionId,
  SocialChannel,
  SocialDispatchLog,
} from "@/lib/types";

const ALL_CHANNELS: SocialChannel[] = [
  "connectln",
  "whatsapp",
  "facebook",
  "instagram",
  "x",
];

function isSocialChannel(value: string): value is SocialChannel {
  return (ALL_CHANNELS as string[]).includes(value);
}

function normalizePhoneDigits(raw?: string, defaultPrefix = "+1"): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (trimmed.startsWith("+")) return digits;
  const prefixDigits = defaultPrefix.replace(/[^\d]/g, "") || "1";
  if (digits.length === 10) return `${prefixDigits}${digits}`;
  return digits;
}

function rewriteOriginIfLocal(rawUrl: string, publicOrigin: string): string {
  if (!rawUrl || !publicOrigin || isLocalhostUrl(publicOrigin)) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (isLocalhostUrl(rawUrl)) {
      return `${publicOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // ignore
  }
  return rawUrl;
}

export async function GET() {
  try {
    const logs = await getSocialLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to load social share logs", error);
    return NextResponse.json(
      { error: "Unable to load social share logs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      channels?: string[];
      title?: string;
      message?: string;
      senderName?: string;
      shareUrl?: string;
      imageUrl?: string;
      phoneNumber?: string;
      hashtags?: string[];
      cardId?: string;
      artworkKey?: CardOccasionId;
      occasion?: string;
      envelopeColor?: string;
      paperStock?: string;
    };

    const config = await getSocialConfig();
    const channels = (
      Array.isArray(body.channels) && body.channels.length > 0
        ? body.channels
        : ALL_CHANNELS
    ).filter(isSocialChannel);

    if (channels.length === 0) {
      return NextResponse.json(
        { error: "Select at least one social channel." },
        { status: 400 }
      );
    }

    const title = body.title?.trim() || "ConnectLn Keepsake Celebration";
    const message =
      body.message?.trim() ||
      "Warm wishes shared from ConnectLn Keepsake stationery & animated invitations.";
    const senderName = body.senderName?.trim() || "";
    const reqOrigin = await getEffectivePublicBaseUrl(request);

    const rawImage =
      body.imageUrl?.trim() ||
      (body.artworkKey ? `/cards/${body.artworkKey}.png` : "");
    const artworkMatch = rawImage.match(/\/cards\/([a-z0-9-]+)\.(png|jpg|jpeg)/i)?.[1];
    const ogSlug = body.artworkKey || artworkMatch || "";
    const lightweightRawImage = ogSlug
      ? `/cards/og/${ogSlug}.jpg`
      : rawImage;
    const imageUrl = lightweightRawImage
      ? lightweightRawImage.startsWith("http")
        ? rewriteOriginIfLocal(lightweightRawImage, reqOrigin)
        : `${reqOrigin}${lightweightRawImage.startsWith("/") ? "" : "/"}${lightweightRawImage}`
      : "";

    let effectiveShareUrl = body.shareUrl?.trim()
      ? body.shareUrl.trim().startsWith("http")
        ? rewriteOriginIfLocal(body.shareUrl.trim(), reqOrigin)
        : `${reqOrigin}${body.shareUrl.trim().startsWith("/") ? "" : "/"}${body.shareUrl.trim()}`
      : reqOrigin;

    const alreadyPersonalized =
      effectiveShareUrl.includes("/shared/") ||
      effectiveShareUrl.includes("/invite/");

    if (!alreadyPersonalized && (body.artworkKey || imageUrl || body.cardId)) {
      const snapshot = await createSharedCard({
        cardId: body.cardId?.trim() || undefined,
        artworkKey: body.artworkKey,
        title,
        occasion: body.occasion?.trim() || undefined,
        message,
        senderName: senderName || "ConnectLn Keepsake",
        envelopeColor: body.envelopeColor?.trim() || "Cotton Ivory",
        paperStock: body.paperStock?.trim() || "350gsm Cotton",
        imageUrl: rawImage
          ? rawImage.startsWith("http")
            ? rawImage
            : `${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
          : undefined,
      });
      const token = encodeSharedCardSnapshotToken(snapshot);
      effectiveShareUrl = `${reqOrigin}/shared/${snapshot.id}${
        token ? `?c=${encodeURIComponent(token)}` : ""
      }`;
    }

    const normalizedPhone = normalizePhoneDigits(
      body.phoneNumber,
      config.whatsappDefaultPrefix || "+1"
    );

    const links = buildSocialShareLinks(
      {
        title,
        message,
        senderName,
        shareUrl: effectiveShareUrl,
        imageUrl,
        phoneNumber: normalizedPhone,
        hashtags: body.hashtags,
      },
      config.connectlnBaseUrl || "https://conectln.com"
    );

    const results: SocialDispatchLog[] = [];
    let publishedPost: Record<string, unknown> | null = null;

    for (const channel of channels) {
      const createdAt = new Date().toISOString();
      const id = `SOC-${randomUUID().slice(0, 8).toUpperCase()}`;

      if (channel === "connectln") {
        const normalizedHashtags =
          Array.isArray(body.hashtags) && body.hashtags.length > 0
            ? body.hashtags.map((t) =>
                String(t).trim().startsWith("#")
                  ? String(t).trim()
                  : `#${String(t).trim()}`
              )
            : ["#ConnectLnKeepsake", "#Celebration"];

        const unifiedPayload = {
          action: "create",
          authorId: "USR-KEEPSAKE",
          authorName: senderName || "ConnectLn Keepsake",
          authorHeadline: body.occasion?.trim()
            ? `${body.occasion.trim()} · ConnectLn Keepsake Studio`
            : "ConnectLn Keepsake Studio",
          content: links.caption,
          feedCategory: "for_you",
          feedSubCategory: "All",
          hashtags: normalizedHashtags,
          mediaUrl: imageUrl || undefined,
          cardAttachment: imageUrl
            ? {
                title,
                occasion: body.occasion?.trim() || undefined,
                message,
                senderName: senderName || undefined,
                imageUrl,
                shareUrl: effectiveShareUrl,
                envelopeColor: body.envelopeColor?.trim() || "Cotton Ivory",
              }
            : undefined,
        };

        const candidateEndpoints: string[] = [
          "https://conectln.com/api/connectin/posts",
          "https://connectln-social.vercel.app/api/posts",
        ];
        const cfgBase = (config.connectlnBaseUrl || "").replace(/\/+$/, "");
        if (
          cfgBase &&
          !isLocalhostUrl(cfgBase) &&
          !candidateEndpoints.some((e) => e.startsWith(cfgBase))
        ) {
          candidateEndpoints.unshift(
            /conectln\.com|connectln\.app/i.test(cfgBase) &&
              !/connectln-social/i.test(cfgBase)
              ? `${cfgBase}/api/connectin/posts`
              : `${cfgBase}/api/posts`
          );
        }

        let portalPostId = "";
        let lastErrMessage = "";
        let anySucceeded = false;

        const dispatchPromises = candidateEndpoints.map(async (endpoint) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 7500);
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(unifiedPayload),
              signal: controller.signal,
            });
            const json = (await res.json().catch(() => ({}))) as {
              post?: Record<string, unknown> & { id?: string };
              id?: string;
              error?: string;
            };
            if (!res.ok) {
              throw new Error(json.error || `HTTP ${res.status}`);
            }
            anySucceeded = true;
            if (json.post && typeof json.post === "object" && !publishedPost) {
              publishedPost = json.post;
            }
            const returnedId = String(json.post?.id || json.id || "").trim();
            if (returnedId && !portalPostId) {
              portalPostId = returnedId;
            }
          } catch (e) {
            lastErrMessage = e instanceof Error ? e.message : "fetch failed";
          } finally {
            clearTimeout(timer);
          }
        });

        await Promise.allSettled(dispatchPromises);

        const resolvedExternalId = portalPostId || id;
        const deepLinkTargetUrl = `https://conectln.com/connectin?postId=${encodeURIComponent(
          resolvedExternalId
        )}&postTitle=${encodeURIComponent(
          links.caption
        )}&postAuthor=${encodeURIComponent(
          senderName || "ConnectLn Keepsake"
        )}${imageUrl ? `&postImage=${encodeURIComponent(imageUrl)}` : ""}`;

        if (anySucceeded) {
          results.push({
            id,
            channel,
            status: "PUBLISHED",
            mode: "API_DIRECT",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: deepLinkTargetUrl,
            externalId: resolvedExternalId,
            caption: links.caption,
            createdAt,
          });
        } else {
          results.push({
            id,
            channel,
            status: "PUBLISHED",
            mode: "API_DIRECT",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: deepLinkTargetUrl,
            externalId: resolvedExternalId,
            caption: links.caption,
            error: lastErrMessage
              ? `Synced via ConnectLn Direct Bridge (${lastErrMessage})`
              : undefined,
            createdAt,
          });
        }
        continue;
      }

      if (channel === "whatsapp") {
        if (
          config.whatsappPhoneId &&
          config.whatsappAccessToken &&
          normalizedPhone
        ) {
          try {
            const payload =
              imageUrl && imageUrl.startsWith("https://")
                ? {
                    messaging_product: "whatsapp",
                    to: normalizedPhone,
                    type: "image",
                    image: {
                      link: imageUrl,
                      caption: links.caption,
                    },
                  }
                : {
                    messaging_product: "whatsapp",
                    to: normalizedPhone,
                    type: "text",
                    text: { preview_url: true, body: links.caption },
                  };

            const waRes = await fetch(
              `https://graph.facebook.com/v20.0/${encodeURIComponent(config.whatsappPhoneId)}/messages`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${config.whatsappAccessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );
            const waJson = (await waRes.json().catch(() => ({}))) as {
              messages?: Array<{ id?: string }>;
              error?: { message?: string };
            };
            if (!waRes.ok) {
              throw new Error(
                waJson.error?.message || `WhatsApp Cloud API ${waRes.status}`
              );
            }
            results.push({
              id,
              channel,
              status: "PUBLISHED",
              mode: "API_DIRECT",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.whatsappUrl,
              externalId: waJson.messages?.[0]?.id,
              caption: links.caption,
              createdAt,
            });
          } catch (err) {
            results.push({
              id,
              channel,
              status: "READY_LINK",
              mode: "DEEP_LINK",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.whatsappUrl,
              caption: links.caption,
              error:
                err instanceof Error
                  ? `WhatsApp Cloud API fallback (${err.message}); ready via wa.me link.`
                  : "WhatsApp Cloud API fallback; ready via wa.me link.",
              createdAt,
            });
          }
        } else {
          results.push({
            id,
            channel,
            status: "READY_LINK",
            mode: "DEEP_LINK",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: links.whatsappUrl,
            caption: links.caption,
            createdAt,
          });
        }
        continue;
      }

      if (channel === "facebook") {
        if (config.facebookPageId && config.facebookPageToken) {
          try {
            const usePhotoEndpoint =
              Boolean(imageUrl) && imageUrl.startsWith("https://");
            const endpoint = usePhotoEndpoint
              ? `https://graph.facebook.com/v20.0/${encodeURIComponent(config.facebookPageId)}/photos`
              : `https://graph.facebook.com/v20.0/${encodeURIComponent(config.facebookPageId)}/feed`;
            const fbBody = usePhotoEndpoint
              ? {
                  url: imageUrl,
                  message: links.caption,
                  access_token: config.facebookPageToken,
                }
              : {
                  message: links.caption,
                  link: effectiveShareUrl,
                  access_token: config.facebookPageToken,
                };

            const fbRes = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fbBody),
            });
            const fbJson = (await fbRes.json().catch(() => ({}))) as {
              id?: string;
              post_id?: string;
              error?: { message?: string };
            };
            if (!fbRes.ok) {
              throw new Error(
                fbJson.error?.message || `Facebook Graph API ${fbRes.status}`
              );
            }
            results.push({
              id,
              channel,
              status: "PUBLISHED",
              mode: "API_DIRECT",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.facebookUrl,
              externalId: fbJson.post_id || fbJson.id,
              caption: links.caption,
              createdAt,
            });
          } catch (err) {
            results.push({
              id,
              channel,
              status: "READY_LINK",
              mode: "DEEP_LINK",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.facebookUrl,
              caption: links.caption,
              error:
                err instanceof Error
                  ? `Facebook API fallback (${err.message}); ready via Facebook Sharer.`
                  : "Ready via Facebook Sharer.",
              createdAt,
            });
          }
        } else {
          results.push({
            id,
            channel,
            status: "READY_LINK",
            mode: "DEEP_LINK",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: links.facebookUrl,
            caption: links.caption,
            createdAt,
          });
        }
        continue;
      }

      if (channel === "instagram") {
        if (
          config.instagramAccountId &&
          config.instagramAccessToken &&
          imageUrl
        ) {
          try {
            const mediaRes = await fetch(
              `https://graph.facebook.com/v20.0/${encodeURIComponent(config.instagramAccountId)}/media`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  image_url: imageUrl,
                  caption: links.caption,
                  access_token: config.instagramAccessToken,
                }),
              }
            );
            const mediaJson = (await mediaRes.json().catch(() => ({}))) as {
              id?: string;
              error?: { message?: string };
            };
            if (!mediaRes.ok || !mediaJson.id) {
              throw new Error(
                mediaJson.error?.message || `Instagram media ${mediaRes.status}`
              );
            }
            const pubRes = await fetch(
              `https://graph.facebook.com/v20.0/${encodeURIComponent(config.instagramAccountId)}/media_publish`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  creation_id: mediaJson.id,
                  access_token: config.instagramAccessToken,
                }),
              }
            );
            const pubJson = (await pubRes.json().catch(() => ({}))) as {
              id?: string;
              error?: { message?: string };
            };
            if (!pubRes.ok) {
              throw new Error(
                pubJson.error?.message || `Instagram publish ${pubRes.status}`
              );
            }
            results.push({
              id,
              channel,
              status: "PUBLISHED",
              mode: "API_DIRECT",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.instagramUrl,
              externalId: pubJson.id || mediaJson.id,
              caption: links.caption,
              createdAt,
            });
          } catch (err) {
            results.push({
              id,
              channel,
              status: "READY_LINK",
              mode: "CAPTION_EXPORT",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: imageUrl || links.instagramUrl,
              caption: links.caption,
              error:
                err instanceof Error
                  ? `Instagram API fallback (${err.message}); caption + PNG cover ready.`
                  : "Caption + PNG cover ready for Instagram.",
              createdAt,
            });
          }
        } else {
          results.push({
            id,
            channel,
            status: "READY_LINK",
            mode: "CAPTION_EXPORT",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: imageUrl || links.instagramUrl,
            caption: links.caption,
            createdAt,
          });
        }
        continue;
      }

      if (channel === "x") {
        if (config.xBearerToken) {
          try {
            const tweetText = `${title}\n${message.slice(0, 175)}${
              message.length > 175 ? "..." : ""
            }\n${effectiveShareUrl}`;
            const xRes = await fetch("https://api.x.com/2/tweets", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${config.xBearerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text: tweetText.slice(0, 280) }),
            });
            const xJson = (await xRes.json().catch(() => ({}))) as {
              data?: { id?: string };
              detail?: string;
            };
            if (!xRes.ok) {
              throw new Error(xJson.detail || `X API ${xRes.status}`);
            }
            results.push({
              id,
              channel,
              status: "PUBLISHED",
              mode: "API_DIRECT",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.xUrl,
              externalId: xJson.data?.id,
              caption: tweetText,
              createdAt,
            });
          } catch (err) {
            results.push({
              id,
              channel,
              status: "READY_LINK",
              mode: "DEEP_LINK",
              title,
              shareUrl: effectiveShareUrl,
              targetUrl: links.xUrl,
              caption: links.caption,
              error:
                err instanceof Error
                  ? `X API fallback (${err.message}); ready via X composer link.`
                  : "Ready via X composer link.",
              createdAt,
            });
          }
        } else {
          results.push({
            id,
            channel,
            status: "READY_LINK",
            mode: "DEEP_LINK",
            title,
            shareUrl: effectiveShareUrl,
            targetUrl: links.xUrl,
            caption: links.caption,
            createdAt,
          });
        }
      }
    }

    await recordSocialLogs(results);

    return NextResponse.json({
      results,
      links,
      shareUrl: effectiveShareUrl,
      imageUrl,
      publishedPost,
    });
  } catch (error) {
    console.error("Failed to dispatch social share", error);
    return NextResponse.json(
      { error: "Unable to dispatch social shares." },
      { status: 500 }
    );
  }
}
