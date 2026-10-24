const ID = /^\d{6,12}$/;

export function parseVimeoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (ID.test(raw)) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts[0] === "video" ? 1 : 0;
    const id = parts[idx];
    return id && ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function vimeoIdOf(post: { vimeoId?: string; mediaUrl: string }) {
  return post.vimeoId ?? parseVimeoId(post.mediaUrl);
}

export function vimeoWatch(id: string) {
  return `https://vimeo.com/${id}`;
}

export function vimeoEmbedSrc(id: string, opts: { autoplay?: boolean; mute?: boolean }) {
  const q = new URLSearchParams({
    dnt: "1",
    title: "1",
    byline: "1",
    portrait: "1",
    playsinline: "1",
  });
  if (opts.autoplay) q.set("autoplay", "1");
  else q.set("autoplay", "0");
  q.set("muted", "1");
  return `https://player.vimeo.com/video/${id}?${q.toString()}`;
}

export function vimeoCommand(iframe: HTMLIFrameElement | null, method: string, value?: unknown) {
  const payload = value === undefined ? { method } : { method, value };
  iframe?.contentWindow?.postMessage(JSON.stringify(payload), "https://player.vimeo.com");
}

export function pauseAllVimeo(except?: HTMLIFrameElement | null) {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLIFrameElement>("[data-vimeo] iframe").forEach((frame) => {
    if (frame === except) return;
    vimeoCommand(frame, "pause");
    vimeoCommand(frame, "setVolume", 0);
  });
}

export function vimeoEvent(
  data: unknown,
  source: MessageEventSource | null,
  iframe: HTMLIFrameElement | null,
): { event?: string; seconds?: number; duration?: number } | null {
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
  const body = payload as { event?: string; data?: { seconds?: number; duration?: number; percent?: number } };
  if (!body.event) return null;
  return {
    event: body.event,
    seconds: body.data?.seconds,
    duration: body.data?.duration,
  };
}

export async function probeVimeoPublic(url: string): Promise<{ id: string; title: string; poster?: string } | null> {
  const id = parseVimeoId(url);
  if (!id) return null;
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoWatch(id))}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { title?: string; thumbnail_url?: string; html?: string };
    if (!body.html) return null;
    return { id, title: body.title ?? "Vimeo film", poster: body.thumbnail_url };
  } catch {
    return null;
  }
}
