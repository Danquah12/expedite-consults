import type { FeedPost } from "@/lib/feed-data";
import { careerOf, TICKET_FACE } from "@/lib/hall";
import { addHours, raiseDna, strandsFor } from "@/lib/hall-record";
import { MARKET_ITEMS } from "@/lib/market";
import { hymnOfPost } from "@/lib/hymn-desk";
import { markMission } from "@/lib/noctis-os";

export type ReelMap = {
  id: string;
  title: string;
  path: string;
  career: string;
  skill: string;
  dna: string[];
  resourceId: string | null;
  resourceTitle: string | null;
  at: string;
};

const TRAIL = "vibetok-reel-trail";

function titleOf(post: FeedPost) {
  const line = post.caption.replace(/\s+/g, " ").trim();
  return line.slice(0, 120) || post.teach.stamp || "Untitled film";
}

function resourceFor(text: string, career: string) {
  const bag = `${text} ${career}`.toLowerCase();
  const rules: { test: RegExp; id: string }[] = [
    { test: /nist|800-53|control famil/, id: "nist-pack" },
    { test: /\brmf\b|ato package|fips/, id: "rmf-book" },
    { test: /pentest|exploit|recon/, id: "pentest-notes" },
    { test: /resume|hiring|job application/, id: "resume" },
    { test: /\bgrc\b|poa&m/, id: "grc" },
    { test: /\bsast\b|static analysis/, id: "sast" },
    { test: /\bdast\b/, id: "dast" },
  ];
  const hit = rules.find((rule) => rule.test.test(bag));
  if (!hit) return null;
  return MARKET_ITEMS.find((item) => item.id === hit.id) ?? null;
}

/** Path, career, and resource for one film. Empty when the film does not name them. */
export function mapReel(post: FeedPost): ReelMap {
  const text = `${post.caption ?? ""} ${post.teach?.hook ?? ""} ${post.teach?.prompt ?? ""} ${(post.hashtags ?? []).join(" ")}`;
  const ticket = careerOf(post);
  const face = ticket ? TICKET_FACE[ticket] : null;
  const resource = resourceFor(text, face?.career ?? "");
  return {
    id: post.id,
    title: titleOf(post),
    path: face?.path ?? "",
    career: face?.career ?? "",
    skill: face?.skill ?? "",
    dna: ticket ? strandsFor(ticket, text) : [],
    resourceId: resource?.id ?? null,
    resourceTitle: resource?.title ?? null,
    at: new Date().toISOString(),
  };
}

export function readTrail(): ReelMap[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const rows = JSON.parse(localStorage.getItem(TRAIL) || "[]") as ReelMap[];
    return Array.isArray(rows) ? rows.filter((row) => row && typeof row.id === "string") : [];
  } catch {
    return [];
  }
}

function writeTrail(rows: ReelMap[]) {
  localStorage.setItem(TRAIL, JSON.stringify(rows.slice(0, 12)));
}

/** Knowledge DNA Update Service. First discovery of a film moves only the strands the film named. */
export function updateDna(map: ReelMap) {
  if (!map.dna.length) return readTrail();
  return raiseDna(map.dna, 1);
}

/** Journey Update Service. Hours and the daily watch mission. Marks are awarded by the watch itself. */
export function updateJourney(map: ReelMap) {
  addHours(0.1);
  const mission = markMission("watch");
  return { id: map.id, hours: 0.1, missionPaid: mission.rewarded };
}

/** Path Mapping Service. Keeps the films that named a path. */
export function mapPath(map: ReelMap) {
  const rows = [map, ...readTrail().filter((row) => row.id !== map.id)];
  writeTrail(rows);
  return rows.filter((row) => row.path);
}

/** Career Mapping Service. */
export function mapCareer(map: ReelMap) {
  return readTrail().filter((row) => row.career);
}

/** Resource Mapping Service. */
export function mapResource(map: ReelMap) {
  return map.resourceId ? { id: map.resourceId, title: map.resourceTitle } : null;
}

/** Recommendation Service. The next step is the last film that named a path, career, or resource. */
export function recommendFromTrail() {
  const rows = readTrail();
  const path = rows.find((row) => row.path);
  const career = rows.find((row) => row.career);
  const resource = rows.find((row) => row.resourceTitle);
  const latest = rows[0];
  if (!latest) return null;
  return {
    title: latest.title,
    path: path?.path ?? "",
    career: career?.career ?? "",
    resource: resource?.resourceTitle ?? "",
  };
}

/** Run the six services once, the first time a reel is watched. */
export function recordDiscovery(post: FeedPost) {
  const map = mapReel(post);
  updateDna(map);
  updateJourney(map);
  mapPath(map);
  mapCareer(map);
  mapResource(map);
  return recommendFromTrail();
}

const HEADLINES = "vibetok-news-seen";
const PATHS = "vibetok-path-progress";

function strandsIn(text: string) {
  const rows: string[] = [];
  if (/cyber|security|malware|ransomware|threat intel/i.test(text)) rows.push("Cybersecurity");
  if (/math|calculus|equation/i.test(text)) rows.push("Mathematics");
  if (/control system|robot/i.test(text)) rows.push("Control");
  if (/\bai\b|artificial intelligence|machine learning/i.test(text)) rows.push("AI");
  if (/engineer|software|developer/i.test(text)) rows.push("Engineering");
  return rows;
}

export type HeadlineImpact = {
  dna: string[];
  path: string;
  career: string;
  skill: string;
  paths: string[];
  progress: number | null;
};

export function readHeadline(title: string, station: string): HeadlineImpact {
  const text = `${title} ${station}`;
  const ticket = careerOf({ title, caption: text });
  const face = ticket ? TICKET_FACE[ticket] : null;
  const dna = [...new Set([...(ticket ? strandsFor(ticket, text) : []), ...strandsIn(text)])];
  const path = face?.path ?? "";
  let progress: number | null = null;
  if (path && typeof localStorage !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem(PATHS) || "{}") as Record<string, number>;
      progress = typeof saved[path] === "number" ? saved[path] : 0;
    } catch {
      progress = 0;
    }
  }
  return { dna, path, career: face?.career ?? "", skill: face?.skill ?? "", paths: path ? [path] : [], progress };
}

/** Apply DNA and path progress once per headline. */
export function applyHeadline(title: string, station: string): HeadlineImpact {
  const impact = readHeadline(title, station);
  if (typeof localStorage === "undefined") return impact;
  const key = `${station}:${title}`.slice(0, 180);
  let seen: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(HEADLINES) || "[]") as string[];
    seen = Array.isArray(raw) ? raw : [];
  } catch {
    seen = [];
  }
  if (seen.includes(key)) return impact;
  if (impact.dna.length) raiseDna(impact.dna, 1);
  if (impact.path) {
    const saved = JSON.parse(localStorage.getItem(PATHS) || "{}") as Record<string, number>;
    saved[impact.path] = Math.min(100, (saved[impact.path] ?? 0) + 1);
    localStorage.setItem(PATHS, JSON.stringify(saved));
    impact.progress = saved[impact.path];
  }
  addHours(0.1);
  localStorage.setItem(HEADLINES, JSON.stringify([key, ...seen].slice(0, 40)));
  return readHeadline(title, station);
}

const SONGS = "vibetok-song-seen";
const PLACES = new Set(["ghana", "nigeria", "kenya", "uganda", "congo", "liberia", "zimbabwe", "southafrica", "africa"]);

export type SongRead = {
  title: string;
  themes: string;
  origins: string;
  context: string;
  culture: string;
  lessons: string[];
  paths: string[];
  dna: string[];
};

export function readSong(post: FeedPost): SongRead {
  const hymn = hymnOfPost(post);
  const places = (hymn?.rooms ?? []).filter((room) => PLACES.has(room));
  const tags = post.hashtags.join(" ").toLowerCase();
  const kind = tags.includes("#jazz") ? "Jazz." : tags.includes("#soul") ? "Soul." : hymn ? "Christian hymn." : tags.match(/#gospel|#worship|#hymn|#christian/) ? "Christian song." : "";
  const dna = ["Listen"];
  if (hymn?.history) dna.push("History");
  if (hymn?.scripture) dna.push("Religion");
  if (places.length || tags.includes("#jazz") || tags.includes("#soul")) dna.push("Culture");
  return {
    title: hymn?.title || post.musicTitle || post.caption.slice(0, 80),
    themes: hymn?.theme || post.teach.hook || "Not stored for this recording.",
    origins: hymn ? `${hymn.writer}, ${hymn.year}. Christian hymn.` : kind ? `${post.musicTitle || "This recording"}. ${kind}` : "Writer and year are not stored for this recording.",
    context: hymn?.history || hymn?.scripture || post.caption || "No history note is stored for this recording.",
    culture: places.length ? places.join(", ") : hymn ? "Congregational worship." : kind || "Not stored for this recording.",
    lessons: hymn ? ["Learn the hymn"] : post.teach.stamp ? [post.teach.stamp] : [],
    paths: ["Listen"],
    dna,
  };
}

export function applySong(post: FeedPost) {
  const read = readSong(post);
  if (typeof localStorage === "undefined") return read;
  let seen: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(SONGS) || "[]") as string[];
    seen = Array.isArray(raw) ? raw : [];
  } catch {
    seen = [];
  }
  if (seen.includes(post.id)) return read;
  raiseDna(read.dna, 1);
  addHours(0.1);
  localStorage.setItem(SONGS, JSON.stringify([post.id, ...seen].slice(0, 80)));
  return read;
}
