export function parsePreziEmbed(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const iframe = raw.match(/src=["']([^"']+)["']/i);
  const candidate = iframe?.[1] ?? raw;
  try {
    const u = new URL(candidate);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "prezi.com") return null;
    const path = u.pathname.replace(/\/+$/, "");
    const embed = path.match(/^\/(?:v|p)\/embed\/([^/]+)$/) ?? path.match(/^\/embed\/([^/]+)$/);
    if (embed) return `https://prezi.com${path}/`;
    const video = path.match(/^\/v\/(?!embed\/)([^/]+)/);
    if (video) return `https://prezi.com/v/embed/${video[1]}/`;
    const present = path.match(/^\/p\/(?!embed\/)([^/]+)/);
    if (present) return `https://prezi.com/p/embed/${present[1]}/`;
    const viewEmbed = path.match(/^\/view\/([^/]+)\/embed$/);
    if (viewEmbed) return `https://prezi.com/p/embed/${viewEmbed[1]}/`;
    const view = path.match(/^\/view\/([^/]+)$/);
    if (view) return `https://prezi.com/p/embed/${view[1]}/`;
    const craft = path.match(/^\/craft\/(?:share|room)\/([^/]+)$/);
    if (craft) return `https://prezi.com/craft/share/${craft[1]}`;
    const live = path.match(/^\/live\/([^/]+)$/);
    if (live) return `https://prezi.com/live/${live[1]}/`;
    const load = u.searchParams.get("load");
    if (path === "/craft" && load) return null;
  } catch {
    return null;
  }
  return null;
}

export function preziEmbedOf(post: { preziEmbed?: string; mediaUrl: string }) {
  return post.preziEmbed ?? parsePreziEmbed(post.mediaUrl);
}

export function preziKind(embed: string): "video" | "present" | "craft" | "live" {
  if (embed.includes("/live/")) return "live";
  if (embed.includes("/v/embed/")) return "video";
  if (embed.includes("/craft/")) return "craft";
  return "present";
}

export function preziPlaySrc(embed: string) {
  const kind = preziKind(embed);
  if (kind === "live" || kind === "craft") return embed;
  const u = new URL(embed);
  if (kind === "video") {
    u.searchParams.set("autoplay", "1");
  } else if (kind === "present") {
    // Seconds per step — autoplay=1 was walking the path in ~a minute and stopping.
    u.searchParams.set("autoplay", "10");
    u.searchParams.set("lock_to_path", "1");
    u.searchParams.set("autohide_ctrls", "0");
    u.searchParams.set("forceAutoplay", "1");
    u.searchParams.set("loop", "1");
  }
  return u.toString();
}

export function preziNeedsVoice(embed: string) {
  return preziKind(embed) !== "video";
}

export function preziSpeech(post: { speech?: string; caption?: string; teach?: { stamp?: string; hook?: string } }) {
  const written = post.speech?.trim();
  if (written) return written;
  return [post.teach?.stamp, post.teach?.hook, post.caption].filter(Boolean).join(". ");
}
