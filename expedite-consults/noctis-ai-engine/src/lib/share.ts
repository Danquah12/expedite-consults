import type { FeedPost } from "@/lib/feed-data";
import { FACE } from "@/lib/feed-data";
import { SOURCE } from "@/lib/source";

export function clinicUrl(postId: string, youtubeId?: string) {
  const q = new URLSearchParams();
  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) q.set("v", youtubeId);
  if (postId) q.set("p", postId);
  const tail = q.toString();
  const path = tail ? `/?${tail}` : "/";
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

const SENT_KEY = "vibetok-sent";

type Sent = { id: string; youtubeId: string; until: number };

function readSent(): Sent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SENT_KEY);
    if (!raw) return null;
    const row = JSON.parse(raw) as Sent;
    if (!row || row.until < Date.now()) return null;
    if (!row.id && !row.youtubeId) return null;
    return row;
  } catch {
    return null;
  }
}

function writeSent(id: string, youtubeId: string) {
  if (typeof window === "undefined" || (!id && !youtubeId)) return;
  const row: Sent = { id, youtubeId, until: Date.now() + 20 * 60 * 1000 };
  sessionStorage.setItem(SENT_KEY, JSON.stringify(row));
}

export function askedShare() {
  if (typeof window === "undefined") return { id: "", youtubeId: "" };
  const q = new URLSearchParams(window.location.search);
  const v = q.get("v") ?? "";
  const fromUrl = { id: q.get("p") ?? "", youtubeId: /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : "" };
  if (fromUrl.id || fromUrl.youtubeId) {
    writeSent(fromUrl.id, fromUrl.youtubeId);
    return fromUrl;
  }
  const saved = readSent();
  return saved ? { id: saved.id, youtubeId: saved.youtubeId } : { id: "", youtubeId: "" };
}

/** After sign-in, open the welcome page first. */
export function hereAfterSignIn() {
  return "/start";
}

export function filmForShare(posts: FeedPost[], asked: { id: string; youtubeId: string }): FeedPost | null {
  if (asked.id) {
    const byId = posts.find((post) => post.id === asked.id);
    if (byId) return byId;
  }
  if (asked.youtubeId) {
    const same = posts.find((post) => post.youtubeId === asked.youtubeId && (!asked.id || post.id === asked.id));
    if (same) return same;
    return {
      id: asked.id || `in-${asked.youtubeId}`,
      author: { name: "Noctis", username: "vibetok", avatar: FACE.kwesi },
      caption: `Shared clip. Source · ${SOURCE}.`,
      lane: "learn",
      mediaType: "video",
      mediaUrl: `https://www.youtube.com/watch?v=${asked.youtubeId}`,
      posterUrl: `https://i.ytimg.com/vi/${asked.youtubeId}/hqdefault.jpg`,
      youtubeId: asked.youtubeId,
      views: 1,
      likes: 0,
      comments: 0,
      shares: 1,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      hashtags: [],
      musicTitle: SOURCE,
      teach: {
        hook: "The clip that was sent",
        stamp: "Shared",
        prompt: "Which film did this link open?",
        options: [
          { id: "a", label: "The one that was sent", ok: true },
          { id: "b", label: "A different film", ok: false },
          { id: "c", label: "A random clip", ok: false },
        ],
      },
    };
  }
  if (!asked.id) return null;
  return posts.find((post) => post.id === asked.id) ?? null;
}

let pinId = "";
let pinUntil = 0;

export function pinSharedPlay(id: string) {
  if (!id) return;
  pinId = id;
  pinUntil = Date.now() + 12_000;
}

export function sharedPin() {
  return Date.now() < pinUntil ? pinId : "";
}

export const BRAND_MARK = "/og.jpg";
export const BRAND_TAG = "Watch a Spark. Pass a drill. Take the stamp.";

/** Short line under the Noctis card. The logo card is the link preview. */
export function shareLine(_caption?: string) {
  return "Shared from Noctis Clinic";
}

export function shareMessage(caption: string, url: string) {
  return `${shareLine(caption)}\n${url}`;
}

export async function brandFiles(): Promise<File[] | undefined> {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return undefined;
  try {
    const res = await fetch(BRAND_MARK);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const file = new File([blob], "vibetok-clinic.jpg", { type: blob.type || "image/jpeg" });
    return navigator.canShare({ files: [file] }) ? [file] : undefined;
  } catch {
    return undefined;
  }
}

export const NETWORKS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (url: string, text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    href: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
] as const;

export function instagramHint(url: string, text: string) {
  return `${text}\n${url}`;
}
