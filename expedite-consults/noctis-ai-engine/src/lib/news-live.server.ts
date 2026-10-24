import { NEWS_STATIONS } from "@/lib/news-stations";

type NewsStory = { id: string; videoId: string; title: string; publishedAt: string; live?: boolean };

const BLOCKED_LIVE = new Set(["sc21UUjyLaw"]);

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const FRESH_MS = 24 * 60 * 60 * 1000;
let cache: { at: number; rows: NewsStory[] } | null = null;

async function text(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return "";
  return response.text();
}

function decode(value: string) {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&([a-z]+|#39);/g, (all, key: string) => named[key] ?? all)
    .replace(/\s+/g, " ")
    .trim();
}

function storiesFrom(xml: string, id: string, now: number): NewsStory[] {
  const rows: NewsStory[] = [];
  for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const videoId = entry.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/)?.[1];
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    const title = decode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const link = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
    if (!videoId || !publishedAt || !title) continue;
    if (link.includes("/shorts/")) continue;
    const at = Date.parse(publishedAt);
    if (!Number.isFinite(at) || now - at > FRESH_MS || at > now + 5 * 60 * 1000) continue;
    rows.push({ id, videoId, title: title.slice(0, 140), publishedAt });
  }
  return rows;
}

async function canEmbed(videoId: string) {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const response = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function playable(rows: NewsStory[]) {
  const kept: NewsStory[] = [];
  for (let i = 0; i < rows.length && kept.length < 4; i += 4) {
    const batch = rows.slice(i, i + 4);
    const ok = await Promise.all(batch.map(async (row) => ((await canEmbed(row.videoId)) ? row : null)));
    for (const row of ok) if (row && kept.length < 4) kept.push(row);
  }
  return kept;
}

async function recent(
  id: string,
  name: string,
  channelId: string,
  fallbackChannelId: string | undefined,
  liveId: string | undefined,
  now: number,
): Promise<NewsStory[]> {
  try {
    const feeds = [channelId, fallbackChannelId].filter((channel): channel is string => Boolean(channel));
    const xmls = await Promise.all(feeds.map((channel) => text(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`)));
    const seen = new Set<string>();
    const rows = xmls
      .flatMap((xml) => storiesFrom(xml, id, now))
      .filter((row) => {
        if (seen.has(row.videoId)) return false;
        seen.add(row.videoId);
        return true;
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const clips = await playable(rows);
    if (clips.length) return clips;
    if (!liveId || BLOCKED_LIVE.has(liveId) || !(await canEmbed(liveId))) return [];
    return [{ id, videoId: liveId, title: `${name} live`, publishedAt: new Date(now).toISOString(), live: true }];
  } catch {
    return [];
  }
}

/** Stories each desk published in the last day. Older broadcasts are left off. Cached for 5 minutes. */
export async function resolveLiveNews(): Promise<NewsStory[]> {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.rows;
  const now = Date.now();
  const rows: NewsStory[] = [];
  for (let i = 0; i < NEWS_STATIONS.length; i += 6) {
    const batch = NEWS_STATIONS.slice(i, i + 6);
    const found = await Promise.all(
      batch.filter((station) => station.channelId).map((station) => recent(station.id, station.name, station.channelId!, station.fallbackChannelId, station.liveId, now)),
    );
    for (const list of found) rows.push(...list);
  }
  if (rows.length) cache = { at: Date.now(), rows };
  return rows;
}