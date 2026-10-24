import type { FeedPost } from "@/lib/feed-data";
import { DEFAULT_MIX, type VibeMix } from "@/lib/noctis";
import { daySlot, postDesk, CLINIC_DESKS, type ClinicDeskId } from "@/lib/ingest-sources";

const REEL_KEY = "connectln-reel-entry";
export const MAX_SEEN_PER_DAY = 2;
const LONG_WATCH_MS = 8_000;
const LOVE_WATCH_MS = 20_000;

export type DayWatch = {
  day: number;
  counts: Record<string, number>;
  dwell: Record<string, number>;
  desks: Record<string, number>;
  tags: Record<string, number>;
  played: string[];
  arms?: Record<string, { hit: number; miss: number }>;
};

export function visitorSeed(key: string) {
  if (typeof window === "undefined") return hash32(key);
  let id = window.localStorage.getItem("connectln-visitor");
  if (!id) {
    id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem("connectln-visitor", id);
  }
  return hash32(`${id}:${key}`);
}

function hash32(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function uniqueFilms<T extends { id: string; youtubeId?: string; vimeoId?: string; mediaUrl?: string }>(posts: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const post of posts) {
    const isLocalClip = post.mediaUrl?.startsWith("/media/clips/");
    const key = post.youtubeId || post.vimeoId || (isLocalClip ? post.id : post.mediaUrl) || post.id;
    if (seen.has(key) || seen.has(post.id)) continue;
    seen.add(key);
    seen.add(post.id);
    out.push(post);
  }
  return out;
}

export function shuffleWith<T>(items: T[], seed: number) {
  const out = [...items];
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

export function mixFresh<T>(neu: T[], old: T[], seed: number) {
  return [...shuffleWith(neu, seed), ...shuffleWith(old, seed + 17)];
}

export function ingestSalt(at = Date.now()) {
  return (visitorSeed("ingest") ^ (daySlot(at) * 1009) ^ (Math.floor(at / 3_600_000) * 17)) >>> 0;
}

export function emptyWatch(at = Date.now()): DayWatch {
  return { day: daySlot(at), counts: {}, dwell: {}, desks: {}, tags: {}, played: [], arms: {} };
}

export function rollWatch(prev: DayWatch | undefined, at = Date.now()): DayWatch {
  const day = daySlot(at);
  if (prev && prev.day === day) {
    return {
      day,
      counts: prev.counts ?? {},
      dwell: prev.dwell ?? {},
      desks: prev.desks ?? {},
      tags: prev.tags ?? {},
      played: prev.played ?? [],
      arms: prev.arms ?? {},
    };
  }
  const desks: Record<string, number> = {};
  const tags: Record<string, number> = {};
  const arms: Record<string, { hit: number; miss: number }> = {};
  for (const [id, score] of Object.entries(prev?.desks ?? {})) {
    const next = Math.round(score * 0.85);
    if (next > 0) desks[id] = next;
  }
  for (const [id, score] of Object.entries(prev?.tags ?? {})) {
    const next = Math.round(score * 0.85);
    if (next > 0) tags[id] = next;
  }
  for (const [id, arm] of Object.entries(prev?.arms ?? {})) {
    const hit = Math.round(arm.hit * 0.9);
    const miss = Math.round(arm.miss * 0.9);
    if (hit || miss) arms[id] = { hit, miss };
  }
  return { day, counts: {}, dwell: {}, desks, tags, played: [], arms };
}

export function seenCount(watch: DayWatch, id: string, at = Date.now()) {
  if (watch.day !== daySlot(at)) return 0;
  return watch.counts[id] ?? 0;
}

export function markPlay(watch: DayWatch, postId: string): DayWatch {
  const n = (watch.counts[postId] ?? 0) + 1;
  const counts = { ...watch.counts, [postId]: n };
  const played = [postId, ...watch.played.filter((id) => id !== postId)].slice(0, 160);
  return { ...watch, counts, played };
}

export function markArm(watch: DayWatch, desk: string, hit = 0, miss = 0): DayWatch {
  if (!desk || desk === "all" || desk === "studio" || desk === "music" || (hit === 0 && miss === 0)) return watch;
  const prev = watch.arms?.[desk] ?? { hit: 0, miss: 0 };
  return {
    ...watch,
    arms: { ...(watch.arms ?? {}), [desk]: { hit: prev.hit + hit, miss: prev.miss + miss } },
  };
}

export function markDwell(watch: DayWatch, post: FeedPost | undefined, ms: number): DayWatch {
  if (!post || ms < 800) return watch;
  const desk = postDesk(post);
  if (ms < 2_400) return markArm(watch, desk, 0, 1);
  const dwell = { ...watch.dwell, [post.id]: (watch.dwell[post.id] ?? 0) + ms };
  const add = Math.min(48, ms / 1000);
  const desks = { ...watch.desks, [desk]: (watch.desks[desk] ?? 0) + add };
  const tags = { ...watch.tags };
  for (const tag of post.hashtags) tags[tag] = (tags[tag] ?? 0) + add / 2;
  let next: DayWatch = { ...watch, dwell, desks, tags };
  next = markArm(next, desk, ms >= LONG_WATCH_MS ? 2 : 1, 0);
  if (ms >= LOVE_WATCH_MS) {
    next = { ...next, desks: { ...next.desks, [desk]: (next.desks[desk] ?? 0) + 18 } };
    next = markArm(next, desk, 1, 0);
  }
  return next;
}

export function markLove(watch: DayWatch, post: FeedPost | undefined): DayWatch {
  if (!post) return watch;
  return markDwell(watch, post, LOVE_WATCH_MS);
}

export function markChoice(watch: DayWatch, desk: string, amount = 42): DayWatch {
  if (!desk || desk === "all" || desk === "studio" || desk === "music") return watch;
  return markArm(
    { ...watch, desks: { ...watch.desks, [desk]: (watch.desks[desk] ?? 0) + amount } },
    desk,
    1,
    0,
  );
}

export function favoriteDesk(watch?: DayWatch): ClinicDeskId | null {
  let best: ClinicDeskId | null = null;
  let score = 0.56;
  for (const row of CLINIC_DESKS) {
    const arm = watch?.arms?.[row.id];
    const legacy = watch?.desks[row.id] ?? 0;
    const mean = arm ? (1 + arm.hit) / (2 + arm.hit + arm.miss) : 0;
    const blended = arm ? mean + Math.min(0.12, legacy / 500) : legacy / 90;
    if (blended > score) {
      score = blended;
      best = row.id;
    }
  }
  return best;
}

const NEAR: Partial<Record<ClinicDeskId, ClinicDeskId[]>> = {
  cyber: ["cloud", "ai", "code"],
  cloud: ["cyber", "code", "data"],
  ai: ["code", "cyber", "data"],
  code: ["ai", "cloud", "cyber"],
  data: ["ai", "code", "research"],
  research: ["science", "data", "ai"],
  care: ["mind", "science"],
  mind: ["care", "teach"],
  science: ["math", "space", "care"],
  math: ["science", "code", "data"],
  space: ["science", "sky"],
  sky: ["space", "science"],
  campus: ["teach", "career"],
  teach: ["campus", "career"],
  career: ["business", "teach"],
  business: ["career", "civic"],
  faith: ["arts", "history"],
  arts: ["faith", "language"],
  trades: ["maker", "ag"],
  maker: ["trades", "science"],
};

function unitRand(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return ((s >>> 8) + 1) / 0x1000001;
  };
}

function gammaSample(shape: number, rand: () => number): number {
  if (shape < 1) return gammaSample(shape + 1, rand) * Math.pow(rand(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (let i = 0; i < 24; i++) {
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const v = 1 + c * z;
    if (v <= 0) continue;
    const cube = v * v * v;
    const u = rand();
    if (u < 1 - 0.0331 * z * z * z * z) return d * cube;
    if (Math.log(u) < 0.5 * z * z + d * (1 - cube + Math.log(cube))) return d * cube;
  }
  return Math.max(d, 0.01);
}

function betaSample(hit: number, miss: number, rand: () => number) {
  const x = gammaSample(1 + hit, rand);
  const y = gammaSample(1 + miss, rand);
  const t = x + y;
  return t > 0 ? x / t : 0.5;
}

function deskDraws(watch: DayWatch, seed: number) {
  const rand = unitRand(seed ^ 0x51ed);
  const draws = new Map<string, number>();
  for (const row of CLINIC_DESKS) {
    const arm = watch.arms?.[row.id] ?? { hit: 0, miss: 0 };
    draws.set(row.id, betaSample(arm.hit, arm.miss, rand));
  }
  return draws;
}

export function tasteOf(post: FeedPost, watch: DayWatch) {
  let score = watch.desks[postDesk(post)] ?? 0;
  for (const tag of post.hashtags) score += watch.tags[tag] ?? 0;
  return score;
}

/** Round-robin desks so two cyber clips never sit back-to-back when another hall is available. */
export function spreadDesks(posts: FeedPost[], seed: number) {
  const bags = new Map<string, FeedPost[]>();
  for (const post of shuffleWith(posts, seed)) {
    const desk = postDesk(post);
    const list = bags.get(desk) ?? [];
    list.push(post);
    bags.set(desk, list);
  }
  const keys = shuffleWith([...bags.keys()], seed + 7);
  const idx = new Map(keys.map((k) => [k, 0]));
  const out: FeedPost[] = [];
  let last = "";
  while (out.length < posts.length) {
    let placed = false;
    for (const key of keys) {
      const bag = bags.get(key) ?? [];
      const i = idx.get(key) ?? 0;
      if (i >= bag.length) continue;
      const others = keys.some((k) => k !== key && (idx.get(k) ?? 0) < (bags.get(k)?.length ?? 0));
      if (key === last && others) continue;
      const next = bag[i];
      if (!next) continue;
      out.push(next);
      idx.set(key, i + 1);
      last = key;
      placed = true;
    }
    if (!placed) break;
  }
  return out;
}

function rankInDesk(posts: FeedPost[], watch: DayWatch, seed: number) {
  const rand = unitRand(seed);
  return posts
    .map((post) => ({ post, score: tasteOf(post, watch) + rand() * 0.35 }))
    .sort((a, b) => b.score - a.score)
    .map((row) => row.post);
}

function byTaste(posts: FeedPost[], watch: DayWatch, seed: number) {
  if (posts.length < 2) return posts;
  const draws = deskDraws(watch, seed);
  const bags = new Map<string, FeedPost[]>();
  for (const post of rankInDesk(posts, watch, seed + 3)) {
    const desk = postDesk(post);
    const list = bags.get(desk) ?? [];
    list.push(post);
    bags.set(desk, list);
  }
  const desks = [...bags.keys()].sort((a, b) => (draws.get(b) ?? 0) - (draws.get(a) ?? 0));
  const fresh = [...desks].sort((a, b) => {
    const ea = (watch.arms?.[a]?.hit ?? 0) + (watch.arms?.[a]?.miss ?? 0);
    const eb = (watch.arms?.[b]?.hit ?? 0) + (watch.arms?.[b]?.miss ?? 0);
    return ea - eb;
  });
  const lead = desks[0];
  const mate = (NEAR[lead as ClinicDeskId] ?? []).find((id) => bags.has(id)) ?? desks[1];
  const explore = fresh.find((id) => id !== lead && id !== mate) ?? desks[2];
  const idx = new Map(desks.map((d) => [d, 0]));
  const pull = (desk?: string) => {
    if (!desk) return false;
    const bag = bags.get(desk);
    const i = idx.get(desk) ?? 0;
    const item = bag?.[i];
    if (!item) return false;
    idx.set(desk, i + 1);
    out.push(item);
    return true;
  };
  const out: FeedPost[] = [];
  while (out.length < posts.length) {
    const before = out.length;
    pull(lead);
    pull(mate);
    pull(lead);
    pull(explore);
    for (const desk of desks) pull(desk);
    if (out.length === before) break;
  }
  return out;
}

function openToday(posts: FeedPost[], watch: DayWatch, protect: Set<string>) {
  const fresh = posts.filter((p) => p.id.startsWith("u-") || protect.has(p.id) || seenCount(watch, p.id) < MAX_SEEN_PER_DAY);
  return fresh.length ? fresh : posts;
}

function weaveBags(bags: FeedPost[][], weights: number[]) {
  const idx = bags.map(() => 0);
  const out: FeedPost[] = [];
  const total = bags.reduce((n, bag) => n + bag.length, 0);
  while (out.length < total) {
    let placed = false;
    for (let b = 0; b < bags.length; b++) {
      const take = weights[b] ?? 1;
      for (let k = 0; k < take; k++) {
        const item = bags[b]?.[idx[b] ?? 0];
        if (!item) continue;
        out.push(item);
        idx[b] = (idx[b] ?? 0) + 1;
        placed = true;
      }
    }
    if (!placed) break;
  }
  return out;
}

function weaveLanes(list: FeedPost[], mix: VibeMix, salt: number) {
  const lanes = ["learn", "laugh", "local"] as const;
  const bags = lanes.map((lane) => shuffleWith(list.filter((post) => post.lane === lane), salt + lane.length));
  const weights = lanes.map((lane) => Math.max(1, Math.round((mix[lane] ?? 0) / 22)));
  const woven = weaveBags(bags, weights);
  const seen = new Set(woven.map((post) => post.id));
  return [...woven, ...list.filter((post) => !seen.has(post.id))];
}

function byYear<T extends { year?: number }>(rows: T[], seed = 0) {
  const groups = new Map<number, T[]>();
  for (const row of rows) {
    const year = row.year && row.year > 1990 ? row.year : 0;
    const list = groups.get(year) ?? [];
    list.push(row);
    groups.set(year, list);
  }
  return [...groups.keys()]
    .sort((a, b) => b - a)
    .flatMap((year, i) => shuffleWith(groups.get(year) ?? [], seed + year + i));
}

/** Native MP4 course reels first, then newest ledger films, then the house library. */
export function leadNew<T extends { id: string; year?: number; youtubeId?: string; mediaUrl?: string }>(rows: T[], waveIds: string[] = [], priorIds: string[] = []) {
  const hot = new Set(waveIds);
  const warm = new Set(priorIds);
  const nativeReels: T[] = [];
  const neu: T[] = [];
  const mid: T[] = [];
  const ledger: T[] = [];
  const house: T[] = [];
  for (const row of rows) {
    if (!row.youtubeId) {
      nativeReels.push(row);
    } else if (hot.has(row.id)) neu.push(row);
    else if (warm.has(row.id)) mid.push(row);
    else if (row.id.startsWith("in-")) ledger.push(row);
    else house.push(row);
  }
  return [...nativeReels, ...byYear(neu), ...byYear(mid), ...byYear(ledger), ...byYear(house)];
}

function stackWaves(posts: FeedPost[], waveIds: string[], priorIds: string[], seed: number, _watch: DayWatch, _mix: VibeMix) {
  const region = new Date().getTimezoneOffset();
  const world = (seed ^ Math.imul(region + 840, 131)) >>> 0;
  const hot = new Set(waveIds);
  const warm = new Set(priorIds);
  const directMp4 = posts.filter((p) => !p.youtubeId && p.mediaUrl?.endsWith(".mp4"));
  const rest = posts.filter((p) => !(!p.youtubeId && p.mediaUrl?.endsWith(".mp4")));
  const house = rest.filter((p) => !p.id.startsWith("in-"));
  const ledger = rest.filter((p) => p.id.startsWith("in-"));
  const neu = ledger.filter((p) => hot.has(p.id));
  const mid = ledger.filter((p) => !hot.has(p.id) && warm.has(p.id));
  const older = ledger.filter((p) => !hot.has(p.id) && !warm.has(p.id));
  const bands = hot.size || warm.size ? [directMp4, neu, mid, older, house] : [directMp4, ledger, house];
  return bands.flatMap((band, i) => breakRuns(byYear(band, world + i * 17)));
}

function breakRuns(posts: FeedPost[]) {
  const out = [...posts];
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1];
    const cur = out[i];
    if (!prev || !cur || postDesk(cur) !== postDesk(prev)) continue;
    const limit = Math.min(out.length, i + 8);
    for (let j = i + 1; j < limit; j++) {
      const alt = out[j];
      if (!alt || postDesk(alt) === postDesk(prev)) continue;
      out[i] = alt;
      out[j] = cur;
      break;
    }
  }
  return out;
}

function diversify(posts: FeedPost[], pin?: string | null) {
  if (!pin) return posts;
  const at = posts.findIndex((post) => post.id === pin);
  if (at <= 0) return posts;
  const held = posts[at];
  if (!held) return posts;
  return [held, ...posts.slice(0, at), ...posts.slice(at + 1)];
}

function splitPlayed(posts: FeedPost[], watch: DayWatch, protectId?: string | null) {
  const sunk = new Set((watch.played ?? []).filter((id) => id !== protectId));
  return {
    upcoming: posts.filter((p) => !sunk.has(p.id)),
    played: posts.filter((p) => sunk.has(p.id)),
  };
}

export function dealFeed(
  posts: FeedPost[],
  mix: VibeMix,
  seed: number,
  watch?: DayWatch,
  waveIds: string[] = [],
  priorIds: string[] = [],
  protectId?: string | null,
) {
  const day = watch ?? emptyWatch();
  const mine = uniqueFilms(posts.filter((p) => p.id.startsWith("u-")));
  const rest = uniqueFilms(posts.filter((p) => !p.id.startsWith("u-")));
  const ordered = stackWaves(rest, waveIds, priorIds, seed, day, mix);
  const hot = new Set([...waveIds, ...priorIds]);
  const played = new Set((day.played ?? []).filter((id) => id !== protectId));
  const front = ordered.filter((p) => hot.has(p.id) || !played.has(p.id));
  const back = ordered.filter((p) => !hot.has(p.id) && played.has(p.id));
  return [...mine, ...diversify([...front, ...back], protectId)];
}

export function dealReels(
  posts: FeedPost[],
  seed: number,
  startId?: string | null,
  waveIds: string[] = [],
  priorIds: string[] = [],
  watch?: DayWatch,
  protectId?: string | null,
  mix: VibeMix = DEFAULT_MIX,
  stable = false,
) {
  const day = watch ?? emptyWatch();
  const clips = uniqueFilms(posts.filter((p) => p.mediaType === "video" && p.mediaUrl));
  if (stable) return leadNew(clips, waveIds, priorIds);
  const ordered = stackWaves(clips, waveIds, priorIds, seed, day, mix);
  const hot = new Set([...waveIds, ...priorIds]);
  const played = new Set((day.played ?? []).filter((id) => id !== (startId ?? protectId)));
  const front = ordered.filter((p) => hot.has(p.id) || !played.has(p.id));
  const back = ordered.filter((p) => !hot.has(p.id) && played.has(p.id));
  return diversify([...front, ...back], startId);
}

export function writeReelEntry(seed: number, start: string | null) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REEL_KEY, JSON.stringify({ seed, start }));
}

export function readReelEntry(): { seed: number; start: string | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(REEL_KEY);
    return raw ? (JSON.parse(raw) as { seed: number; start: string | null }) : null;
  } catch {
    return null;
  }
}
