import type { FeedPost } from "@/lib/feed-data";
import { CLINIC_DESKS, postDesk, type ClinicDeskId } from "@/lib/ingest-sources";
import { ticketOfPost, type TicketId } from "@/lib/hall";
import { onTab } from "@/lib/tab-split";

export type ReelCat = "all" | "studio" | "music" | ClinicDeskId;

export const REEL_CATS: { id: ReelCat; label: string }[] = [
  { id: "all", label: "All" },
  ...CLINIC_DESKS.map((d) => ({ id: d.id as ReelCat, label: d.label })),
  { id: "studio", label: "On air" },
  { id: "music", label: "Music" },
];

const LEGACY: Record<string, ReelCat> = {
  learn: "campus",
  stem: "math",
  health: "care",
  money: "business",
};

const TICKET_CAT: Record<TicketId, ClinicDeskId> = {
  teacher: "teach",
  faculty: "teach",
  designer: "maker",
  developer: "code",
  physician: "care",
  pharmacist: "care",
  biologist: "science",
  electrician: "trades",
  carpenter: "trades",
  realtor: "career",
};

const KEYS: Partial<Record<ClinicDeskId, string[]>> = {
  campus: ["mit", "harvard", "oxford", "khan", "ocw", "#yale", "#campus"],
  code: ["#code", "cs50", "python", "missing semester"],
  ai: ["#ai", "#llm", "#rag", "#ml", "cs229", "transformer", "statquest"],
  cyber: ["nist", "cisa", "owasp", "pentest", "800-53", "mitre", "zero trust", "#soc"],
  cloud: ["#cloud", "#infra", "kubernetes", "terraform", "vpc"],
  data: ["#data", "sql", "pandas", "statistics"],
  research: ["#research", "paper", "methods", "cern"],
  care: ["hopkins", "nih", "cdc", "nursing", "mayo", "#anatomy", "#physio"],
  mind: ["#mind", "#neuro", "cognitive", "kahneman"],
  math: ["#math", "calculus", "algebra", "strang", "3blue1brown", "numberphile"],
  science: ["hhmi", "physics", "#chem", "#bio"],
  maker: ["#stem", "engineering", "robot", "control"],
  space: ["nasa", "jpl", "universe", "#space"],
  sky: ["noaa", "climate", "#earth"],
  business: ["#business", "#startup", "y combinator", "#llc", "accounting"],
  civic: ["#civic", "constitution", "law"],
  history: ["#history", "library of congress"],
  language: ["#lang", "twi", "asl", "phoneme"],
  arts: ["#jazz", "#classical", "#lofi", "#afrobeat", "#highlife", "philosophy"],
  faith: ["#pulpit", "#gospel", "bible", "sermon"],
  trades: ["electrician", "carpenter", "nccer", "#ticket"],
  ag: ["#ag", "soil", "agriculture"],
  career: ["#career", "resume", "interview", "star"],
  teach: ["#teach", "#pedagogy", "lesson"],
  news: ["#news", "breaking", "#briefing"],
};

const KEY = "sphera-reel-cat";

export function readReelCat(): ReelCat {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "all";
    if (LEGACY[raw]) return LEGACY[raw];
    if (REEL_CATS.some((c) => c.id === raw)) return raw as ReelCat;
  } catch {
    /* ignore */
  }
  return "all";
}

export function writeReelCat(id: ReelCat) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

function hay(post: FeedPost) {
  return `${post.id} ${post.caption} ${post.author.name} ${post.hashtags.join(" ")} ${post.teach.stamp} ${post.teach.hook} ${post.musicTitle ?? ""}`.toLowerCase();
}

const MUSIC_KEYS = [
  "#gospel",
  "#hymn",
  "#worship",
  "#choir",
  "hymn",
  "gospel",
  "worship",
  "spiritual",
  "gaither",
  "sinach",
  "way maker",
  "amazing grace",
  "how great thou art",
  "it is well",
  "be thou my vision",
  "blessed assurance",
  "great is thy faithfulness",
  "blessed assurance",
  "holy holy",
  "rock of ages",
  "what a friend",
  "old rugged cross",
  "just as i am",
  "abide with me",
  "mighty fortress",
  "come thou fount",
  "to god be the glory",
  "softly and tenderly",
  "wondrous cross",
  "silent night",
  "o holy night",
  "he lives",
  "christ arose",
  "homecoming",
  "vocal band",
  "jesus paid",
  "negro spiritual",
  "tabernacle choir",
  "getty",
];

export function isGospelMusic(post: FeedPost) {
  if (post.id.startsWith("mu-gospel") || post.id.startsWith("mu-hymn") || post.id.startsWith("mu-choir")) return true;
  const blob = hay(post);
  return MUSIC_KEYS.some((k) => blob.includes(k));
}

export function catsOf(post: FeedPost): ReelCat[] {
  const out = new Set<ReelCat>();
  if (post.id.startsWith("rec-")) out.add("studio");
  if (isGospelMusic(post)) out.add("music");
  out.add(postDesk(post));
  const ticket = ticketOfPost(post);
  if (ticket) out.add(TICKET_CAT[ticket]);
  const blob = hay(post);
  for (const desk of CLINIC_DESKS) {
    const keys = KEYS[desk.id];
    if (keys?.some((k) => blob.includes(k))) out.add(desk.id);
  }
  return [...out];
}

export function inReelCat(post: FeedPost, cat: ReelCat) {
  if (cat === "all") return true;
  return catsOf(post).includes(cat);
}

export function reelPool(posts: FeedPost[], cat: ReelCat) {
  const clips = onTab(posts, "reels").filter((p) => p.mediaType === "video" && p.mediaUrl);
  if (cat === "all") return clips;
  return clips.filter((p) => inReelCat(p, cat));
}

export function reelCounts(posts: FeedPost[]) {
  const clips = onTab(posts, "reels").filter((p) => p.mediaType === "video" && p.mediaUrl);
  const counts = Object.fromEntries(REEL_CATS.map((c) => [c.id, 0])) as Record<ReelCat, number>;
  counts.all = clips.length;
  for (const post of clips) {
    for (const cat of catsOf(post)) counts[cat] += 1;
  }
  return counts;
}
