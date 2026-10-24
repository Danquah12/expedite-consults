const ID_ALIAS: Record<string, string> = {
  aircArUvnzU: "aircAruvnKk",
};

export function parseYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return ID_ALIAS[raw] ?? raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? ID_ALIAS[id] ?? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return ID_ALIAS[v] ?? v;
      const m = u.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      const mid = m?.[1];
      return mid ? ID_ALIAS[mid] ?? mid : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeIdOf(post: { youtubeId?: string; mediaUrl: string }) {
  const raw = post.youtubeId ?? parseYoutubeId(post.mediaUrl);
  if (!raw) return null;
  return ID_ALIAS[raw] ?? raw;
}

export function youtubePoster(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubePosterSrcSet(id: string) {
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${id}/hqdefault.jpg 480w, https://i.ytimg.com/vi/${id}/sddefault.jpg 640w`;
}

export const POSTER_SIZES = "(max-width: 480px) 92vw, (max-width: 1024px) 640px, 860px";

export function youtubeWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedSrc(id: string, opts: { autoplay?: boolean; mute?: boolean; start?: number; controls?: boolean }) {
  const q = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    enablejsapi: "1",
    fs: "1",
    controls: "0",
    cc_load_policy: "0",
    iv_load_policy: "3",
    modestbranding: "1",
  });
  if (typeof window !== "undefined") q.set("origin", window.location.origin);
  if (opts.autoplay) q.set("autoplay", "1");
  else q.set("autoplay", "0");
  q.set("mute", opts.mute === false ? "0" : "1");
  if (opts.start && opts.start > 0) q.set("start", String(Math.floor(opts.start)));
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`;
}

import { pauseAllVimeo } from "@/lib/vimeo";

export function pauseAllYoutube(except?: HTMLIFrameElement | null) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLIFrameElement>("[data-youtube] iframe").forEach((frame) => {
    if (frame === except) return;
    if (frame.closest("[data-pip]")) return;
    ytCommand(frame, "pauseVideo");
    ytCommand(frame, "mute");
  });
  pauseAllVimeo();
}

export function ytCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args, id: 1, channel: "widget" }), "*");
}

export function ytCaptionsOff(iframe: HTMLIFrameElement | null) {
  ytCommand(iframe, "unloadModule", ["captions"]);
  ytCommand(iframe, "setOption", ["captions", "track", {}]);
}

export function ytListen(iframe: HTMLIFrameElement | null) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
  ytCommand(iframe, "addEventListener", ["onReady"]);
  ytCommand(iframe, "addEventListener", ["onStateChange"]);
  ytCommand(iframe, "addEventListener", ["onError"]);
}

export function ytGated(data: unknown, source: MessageEventSource | null, iframe: HTMLIFrameElement | null) {
  if (!iframe || source !== iframe.contentWindow) return false;
  let payload = data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      return false;
    }
  }
  if (!payload || typeof payload !== "object") return false;
  const body = payload as { event?: string; info?: unknown };
  if (body.event !== "onError") return false;
  const code = typeof body.info === "number" ? body.info : Number(body.info);
  return code === 100 || code === 101 || code === 150 || code === 2 || code === 5;
}

export function ytReady(data: unknown, source: MessageEventSource | null, iframe: HTMLIFrameElement | null) {
  if (!iframe || source !== iframe.contentWindow) return false;
  let payload = data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      return false;
    }
  }
  if (!payload || typeof payload !== "object") return false;
  const event = (payload as { event?: string }).event;
  return event === "onReady" || event === "initialDelivery";
}

export function ytEnded(data: unknown, source: MessageEventSource | null, iframe: HTMLIFrameElement | null) {
  if (!iframe || source !== iframe.contentWindow) return false;
  let payload = data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      return false;
    }
  }
  if (!payload || typeof payload !== "object") return false;
  const body = payload as { event?: string; info?: unknown };
  if (body.event === "onStateChange" && body.info === 0) return true;
  if (body.info && typeof body.info === "object" && (body.info as { playerState?: number }).playerState === 0) {
    return true;
  }
  return false;
}

export function ytInfo(
  data: unknown,
  source: MessageEventSource | null,
  iframe: HTMLIFrameElement | null,
): { currentTime?: number; duration?: number; state?: number; playbackRate?: number } | null {
  if (!iframe || source !== iframe.contentWindow) return null;
  let payload = data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      return null;
    }
  }
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { event?: string; info?: unknown };
  if (body.event === "onStateChange" && typeof body.info === "number") {
    return { state: body.info };
  }
  if (!body.info || typeof body.info !== "object") return null;
  const info = body.info as { currentTime?: number; duration?: number; playerState?: number; playbackRate?: number };
  const next: { currentTime?: number; duration?: number; state?: number; playbackRate?: number } = {};
  if (typeof info.currentTime === "number") next.currentTime = info.currentTime;
  if (typeof info.duration === "number") next.duration = info.duration;
  if (typeof info.playerState === "number") next.state = info.playerState;
  if (typeof info.playbackRate === "number") next.playbackRate = info.playbackRate;
  return Object.keys(next).length ? next : null;
}

export function ytClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}
