export type HostKind = "dailymotion" | "rumble" | "twitch" | "ted" | "wistia" | "spotify" | "soundcloud" | "archive";

export type HostEmbed = {
  kind: HostKind;
  src: string;
  label: string;
};

function parentHost() {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname;
}

export function hostEmbed(input: string): HostEmbed | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "dailymotion.com" || host === "dai.ly") {
    const id = host === "dai.ly" ? parts[0] : parts[parts.indexOf("video") + 1];
    if (!id || !/^[a-z0-9]+$/i.test(id)) return null;
    return {
      kind: "dailymotion",
      label: "Dailymotion",
      src: `https://www.dailymotion.com/embed/video/${id}?queue-enable=false`,
    };
  }

  if (host === "rumble.com") {
    const embed = parts[0] === "embed" ? parts[1] : null;
    if (!embed) return null;
    return { kind: "rumble", label: "Rumble", src: `https://rumble.com/embed/${embed}/` };
  }

  if (host === "twitch.tv" || host === "clips.twitch.tv" || host === "player.twitch.tv") {
    const parent = parentHost();
    if (parts[0] === "videos" && parts[1]) {
      return { kind: "twitch", label: "Twitch", src: `https://player.twitch.tv/?video=${parts[1]}&parent=${parent}&autoplay=true` };
    }
    if (host === "clips.twitch.tv" && parts[0]) {
      return { kind: "twitch", label: "Twitch", src: `https://clips.twitch.tv/embed?clip=${parts[0]}&parent=${parent}&autoplay=true` };
    }
    if (parts[0] && parts[0] !== "directory") {
      return { kind: "twitch", label: "Twitch", src: `https://player.twitch.tv/?channel=${parts[0]}&parent=${parent}&autoplay=true` };
    }
    return null;
  }

  if (host === "ted.com" || host === "embed.ted.com") {
    const slug = parts[0] === "talks" ? parts[1] : parts[parts.length - 1];
    if (!slug) return null;
    return { kind: "ted", label: "TED", src: `https://embed.ted.com/talks/${slug}` };
  }

  if (host.endsWith("wistia.com") || host.endsWith("wistia.net")) {
    const id = parts.includes("medias") ? parts[parts.indexOf("medias") + 1] : parts[parts.length - 1];
    if (!id || !/^[a-z0-9]+$/i.test(id)) return null;
    return { kind: "wistia", label: "Wistia", src: `https://fast.wistia.net/embed/iframe/${id}` };
  }

  if (host === "open.spotify.com") {
    const kind = parts[0];
    const id = parts[1];
    if (!id || (kind !== "episode" && kind !== "track" && kind !== "show")) return null;
    return { kind: "spotify", label: "Spotify", src: `https://open.spotify.com/embed/${kind}/${id}` };
  }

  if (host === "soundcloud.com" || host === "on.soundcloud.com") {
    return {
      kind: "soundcloud",
      label: "SoundCloud",
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(raw)}&auto_play=true&hide_related=true&show_comments=false`,
    };
  }

  if (host === "archive.org") {
    const id = parts[0] === "embed" || parts[0] === "details" ? parts[1] : parts[0];
    if (!id) return null;
    return { kind: "archive", label: "Internet Archive", src: `https://archive.org/embed/${id}` };
  }

  return null;
}
