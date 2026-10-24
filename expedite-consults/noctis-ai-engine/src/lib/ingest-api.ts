import { createServerFn } from "@tanstack/react-start";
import { FACE, type FeedPost, type Teach } from "@/lib/feed-data";
import { SOURCE } from "@/lib/source";
import { INGEST_CHANNELS, INGEST_QUERIES, pickDomain, pullSlot, deskOf, type IngestHouse, type IngestRow } from "@/lib/ingest-sources";
import { isAiClip } from "@/lib/ai-cut";
import { gateLedgerClip } from "@/lib/ledger-gate";
import { hymnOfBlob } from "@/lib/hymn-desk";
import { youtubeWatch } from "@/lib/youtube";

type IvVideo = {
  type?: string;
  title?: string;
  videoId?: string;
  author?: string;
  description?: string;
  viewCount?: number;
  published?: number;
  lengthSeconds?: number;
  liveNow?: boolean;
  isUpcoming?: boolean;
  isFamilyFriendly?: boolean;
  premium?: boolean;
};

const HOSTS = ["https://invidious.f5.si"];
const FACES = Object.values(FACE);
const PER = 8;
const HOOK_MIN = 48;
const HOOK_MAX = 1140;
const DRY =
  /\b(lecture\s+\d+|week\s+\d+|session\s+\d+|module\s+\d+|part\s+\d+\s+of\s+\d+|syllabus|office hours|homework|assignment\s+\d+|full course|complete course|hour\s+\d+|l\d+\s*[-:]|chapter\s+\d+)\b/i;
const HOOKY =
  /\b(why|how|what if|explained|surprising|secret|never|wrong|actually|in \d+ minutes?|the science|you were taught|nobody told|the real reason)\b/i;

function yearOf(v: IvVideo) {
  if (!v.published) return 0;
  const year = new Date(v.published * 1000).getUTCFullYear();
  return year > 1990 && year < 2100 ? year : 0;
}

function byYearThenHeat(a: IvVideo, b: IvVideo) {
  const year = yearOf(b) - yearOf(a);
  if (year) return year;
  const published = (b.published ?? 0) - (a.published ?? 0);
  if (published) return published;
  return hookScore(b) - hookScore(a);
}

function preferFresh(list: IvVideo[]) {
  const ranked = [...list].sort(byYearThenHeat);
  const current = ranked.filter((v) => yearOf(v) >= 2024);
  return current.length >= 3 ? current : ranked;
}

function unseen(list: IvVideo[], seen: Set<string>) {
  return list.filter((v) => v.videoId && !seen.has(v.videoId));
}

function dryTitle(title: string) {
  return DRY.test(title);
}

function hookScore(v: IvVideo) {
  const views = v.viewCount ?? 0;
  const len = v.lengthSeconds ?? 240;
  let dur = 0.4;
  if (len >= 70 && len <= 720) dur = 2.6;
  else if (len >= HOOK_MIN && len <= HOOK_MAX) dur = 1.5;
  else if (len > HOOK_MAX) dur = 0.2;
  const title = v.title ?? "";
  let hook = HOOKY.test(title) ? 1.7 : 1;
  if (dryTitle(title)) hook = views >= 400_000 ? 0.45 : 0.08;
  return views * dur * hook;
}

function pickHot(list: IvVideo[], _salt: number, n: number, _minViews: number) {
  return [...list].filter((v) => v.videoId).sort(byYearThenHeat).slice(0, n);
}

function teachOf(title: string, stamp: string): Teach {
  const hook = title.replace(/\s+/g, " ").trim().slice(0, 72);
  return {
    hook: hook || stamp,
    stamp,
    prompt: "What belongs on this clinic?",
    options: [
      { id: "a", label: hook.slice(0, 48) || stamp, ok: true },
      { id: "b", label: "A louder clip", ok: false },
      { id: "c", label: "Whatever trended", ok: false },
    ],
  };
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "hall";
}

function toPost(v: IvVideo, house: IngestHouse, i: number): FeedPost | null {
  const gate = gateLedgerClip(v, house);
  if (!gate.pass) return null;
  const id = v.videoId;
  if (!id) return null;
  const title = gate.labels.title;
  const who = (v.author ?? house.house).trim();
  const hymn = hymnOfBlob(`${title} ${house.house} ${house.tags.join(" ")}`);
  const caption = hymn
    ? `${hymn.title}. ${hymn.theme} ${hymn.history.slice(0, 120)} Source · ${SOURCE}.`
    : `${title}. Source · ${SOURCE}.`;
  const teach: Teach = hymn
    ? {
        hook: hymn.theme,
        stamp: hymn.title,
        prompt: hymn.prompt,
        options: [
          { id: "a", label: hymn.ok, ok: true },
          { id: "b", label: hymn.wrong[0], ok: false },
          { id: "c", label: hymn.wrong[1], ok: false },
        ],
      }
    : teachOf(title, house.stamp);
  const post: FeedPost = {
    id: `in-${id}`,
    author: {
      name: who,
      username: slug(who),
      avatar: FACES[i % FACES.length] ?? FACE.kwesi,
    },
    caption,
    lane: house.lane,
    mediaType: "video",
    mediaUrl: youtubeWatch(id),
    posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    youtubeId: id,
    year: yearOf(v) || undefined,
    views: Math.max(1200, v.viewCount ?? 2400),
    likes: Math.max(40, Math.round((v.viewCount ?? 2400) / 80)),
    comments: 12,
    shares: 6,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: hymn ? [...new Set([...house.tags, "#hymn", "#gospel"])] : house.tags,
    musicTitle: hymn ? hymn.title : `ConnectLn · ${SOURCE}`,
    teach,
  };
  if (isAiClip(post)) return null;
  return post;
}

async function embedPermitted(id: string) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6000) },
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function onlyEmbeddable(posts: FeedPost[]) {
  const ok = await Promise.all(
    posts.map(async (post) => {
      if (!post.youtubeId) return true;
      return embedPermitted(post.youtubeId);
    }),
  );
  return posts.filter((_, i) => ok[i]);
}

async function readJson(url: string, ms = 8000) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ConnectLnClinic/1.0" },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

async function host(): Promise<string> {
  for (const h of HOSTS) {
    try {
      await readJson(`${h}/api/v1/search?q=mit&type=video`, 5000);
      return h;
    } catch {
      /* next */
    }
  }
  const list = (await readJson("https://api.invidious.io/instances.json", 6000)) as [string, { api?: boolean; type?: string; uri?: string }][];
  for (const [name, meta] of list) {
    if (meta?.api === false) continue;
    const uri = (meta?.uri ?? `https://${name}`).replace(/\/$/, "");
    try {
      await readJson(`${uri}/api/v1/search?q=mit&type=video`, 5000);
      return uri;
    } catch {
      /* next */
    }
  }
  throw new Error("no-catalog");
}

async function channelClips(base: string, house: (typeof INGEST_CHANNELS)[number], salt: number, seen: Set<string>) {
  const body = (await readJson(`${base}/api/v1/channels/${house.channel}/videos?sort_by=newest`, 9000)) as {
    videos?: IvVideo[];
    continuation?: string;
  };
  let videos = unseen(body.videos ?? [], seen);
  if (videos.length < PER && body.continuation) {
    try {
      const more = (await readJson(
        `${base}/api/v1/channels/${house.channel}/videos?continuation=${encodeURIComponent(body.continuation)}`,
        9000,
      )) as { videos?: IvVideo[] };
      videos = [...videos, ...unseen(more.videos ?? [], seen)];
    } catch {
      /* the first page is enough */
    }
  }
  return pickHot(preferFresh(videos), salt, PER, 1_500);
}

async function searchClips(base: string, house: (typeof INGEST_QUERIES)[number], salt: number, seen: Set<string>) {
  const q = encodeURIComponent(house.q);
  const start = 1 + (Math.abs(salt) % 18);
  const pages = await Promise.all(
    [start, start + 1, start + 2].map((page) =>
      readJson(`${base}/api/v1/search?q=${q}&type=video&sort_by=upload_date&page=${page}`, 9000).catch(() => [] as IvVideo[]),
    ),
  );
  const list = unseen(
    pages.flatMap((body) => (Array.isArray(body) ? body : [])),
    seen,
  ).sort((a, b) => (b.published ?? 0) - (a.published ?? 0));
  return pickHot(preferFresh(list), salt, PER, 1_500);
}

async function recallLedger(seen: Set<string>, salt: number): Promise<FeedPost[]> {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const ids = [...seen].slice(0, 800);
    const rows = await sql<{ youtube_id: string; post_id: string; title: string; house: string | null; desk: string | null }>`
      select youtube_id, post_id, title, house, desk
      from (
        select distinct on (youtube_id) youtube_id, post_id, title, house, desk
        from ingest_log
        where youtube_id ~ '^[A-Za-z0-9_-]{11}$'
          and not (youtube_id = any(${ids}))
        order by youtube_id, id desc
      ) films
      order by md5(youtube_id || ${String(salt)})
      limit 48
    `;
    return rows.map((row, i) => {
      const title = row.title.replace(/\s+/g, " ").trim();
      const who = (row.house || "Hall").trim();
      const desk = (row.desk || "campus").trim();
      return {
        id: row.post_id?.startsWith("in-") ? row.post_id : `in-${row.youtube_id}`,
        author: { name: who, username: slug(who), avatar: FACES[i % FACES.length] ?? FACE.kwesi },
        caption: `${title}.`,
        lane: "learn" as const,
        mediaType: "video" as const,
        mediaUrl: youtubeWatch(row.youtube_id),
        posterUrl: `https://i.ytimg.com/vi/${row.youtube_id}/hqdefault.jpg`,
        youtubeId: row.youtube_id,
        views: 2400,
        likes: 40,
        comments: 12,
        shares: 6,
        isLiked: false,
        isSaved: false,
        isFollowing: false,
        hashtags: [`#${desk}`],
        musicTitle: `ConnectLn · ${SOURCE}`,
        teach: teachOf(title, who),
      };
    });
  } catch {
    return [];
  }
}

export const auditYoutube = createServerFn({ method: "POST" })
  .validator((input: { ids?: string[] } | undefined) => {
    const ids = Array.isArray(input?.ids)
      ? input.ids.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id)).slice(0, 48)
      : [];
    return { ids };
  })
  .handler(async ({ data }) => {
    const blocked: string[] = [];
    await Promise.all(
      data.ids.map(async (id) => {
        if (!(await embedPermitted(id))) blocked.push(id);
      }),
    );
    return { blocked };
  });

export const pullClinic = createServerFn({ method: "POST" })
  .validator((input: { slot?: number; salt?: number; seen?: string[] } | undefined) => {
    const seen = Array.isArray(input?.seen)
      ? input.seen.filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id)).slice(0, 800)
      : [];
    return { slot: input?.slot, salt: input?.salt, seen };
  })
  .handler(async ({ data }): Promise<{ ok: true; posts: FeedPost[]; houses: string[]; rows: IngestRow[] } | { ok: false; error: string }> => {
    try {
      const slot = data.slot ?? pullSlot();
      const salt = data.salt ?? 0;
      const mix = (slot * 13 + salt) >>> 0;
      const seen = new Set(data.seen ?? []);
      const recalled = await recallLedger(seen, mix);
      for (const post of recalled) {
        if (post.youtubeId) seen.add(post.youtubeId);
      }
      const base = await host();
      const picked = pickDomain(mix).filter(
        (h) => !isAiClip({ caption: `${h.house} ${h.stamp} ${"q" in h ? h.q : ""}`, hashtags: [...h.tags] }),
      );
      const batches = await Promise.allSettled(
        picked.map((h, i) =>
          "channel" in h
            ? channelClips(base, h, mix + i * 11, seen).then((clips) => ({ house: h, clips }))
            : searchClips(base, h, mix + i * 11, seen).then((clips) => ({ house: h, clips })),
        ),
      );
      const posts: FeedPost[] = [];
      const rows: IngestRow[] = [];
      const houses: string[] = [];
      const taken = new Set<string>();
      for (const post of recalled) {
        if (!post.youtubeId || taken.has(post.youtubeId)) continue;
        taken.add(post.youtubeId);
        posts.push(post);
      }
      let i = posts.length;
      for (const batch of batches) {
        if (batch.status !== "fulfilled") continue;
        const { house, clips } = batch.value;
        houses.push(house.house);
        for (const clip of clips) {
          const gate = gateLedgerClip(clip, house);
          const post = gate.pass ? toPost(clip, house, i) : null;
          i += 1;
          if (!post || !post.youtubeId || taken.has(post.youtubeId)) continue;
          taken.add(post.youtubeId);
          posts.push(post);
          rows.push({
            postId: post.id,
            youtubeId: post.youtubeId ?? "",
            title: post.teach.hook,
            house: house.house,
            author: post.author.name,
            stamp: post.teach.stamp,
            lane: post.lane,
            url: post.mediaUrl,
            desk: deskOf(house),
            tags: house.tags,
            kind: house.kind ?? "lecture",
            gate: gate.pass ? gate.line : undefined,
          });
        }
      }
      const legal = await onlyEmbeddable(posts);
      const legalIds = new Set(legal.map((post) => post.youtubeId).filter((id): id is string => Boolean(id)));
      const legalRows = rows.filter((row) => legalIds.has(row.youtubeId));
      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        for (const r of legalRows) {
          await sql`insert into ingest_log (slot, post_id, youtube_id, title, house, desk)
            select ${slot}, ${r.postId}, ${r.youtubeId}, ${r.title}, ${r.house}, ${r.desk ?? null}
            where not exists (select 1 from ingest_log where youtube_id = ${r.youtubeId})`;
        }
      } catch {
        /* desk schema not ready — still return the wave */
      }
      return { ok: true, posts: legal, houses, rows: legalRows };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "ingest-failed" };
    }
  });
