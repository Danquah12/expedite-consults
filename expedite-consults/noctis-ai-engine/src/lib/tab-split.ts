import { SCRIPTURE_TAB } from "@/lib/hall-scripture";
import { PATH_TAB } from "@/lib/path-ledger";
import { CAMPUS_FILMS, CURRICULUM_FILMS } from "@/lib/curriculum";
import { isAiClip } from "@/lib/ai-cut";
import { hymnSeedPosts } from "@/lib/hymn-desk";
import { MUSIC_POSTS } from "@/lib/music-feed";
import { STUDY_POSTS } from "@/lib/study-desk";

export type AppTab = "clinic" | "reels" | "study" | "hub" | "market" | "music" | "tickets" | "career" | "crews";

function ytSet(rows: { youtubeId?: string }[]) {
  return new Set(rows.map((row) => row.youtubeId).filter((id): id is string => Boolean(id)));
}

const STUDY_YT = ytSet(STUDY_POSTS);
const MUSIC_YT = ytSet([...MUSIC_POSTS, ...hymnSeedPosts()]);
const HUB_YT = new Set(
  [...CURRICULUM_FILMS, ...CAMPUS_FILMS]
    .map((film) => film.youtubeId)
    .filter((id) => !STUDY_YT.has(id) && !MUSIC_YT.has(id)),
);

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const MUSIC_TAGS =
  /#hallmusic|#jazz|#blues|#soul|#funk|#rnb|#country|#folk|#rock|#latin|#reggae|#caribbean|#hiphop|#lofi|#highlife|#afrobeat|#electronic|#classical|#gospel|#hymn|#worship|#choir/;

/** NIST, RMF, pentest, and the lab films belong on Study. Market sells products. It does not play video. */
const PRODUCT_TAGS = /#nist|#rmf|#fisma|#fedramp|#resume|#pentest|#grc|#sast|#dast|#appsec|#owasp|#vuln|#range|#stig/;

/** One YouTube film lives on one tab. Study, music, and hub seeds claim theirs first. Ledger pulls follow the desk. */
export function tabOf(post: { id: string; youtubeId?: string; hashtags?: string[]; year?: number }): AppTab {
  if (
    post.id.startsWith("vt-reel-") ||
    post.id.startsWith("px-reel-") ||
    post.id.startsWith("loc-reel-") ||
    post.id.startsWith("arc-reel-") ||
    post.id.startsWith("course-reel-")
  ) {
    return "reels";
  }
  const seated = SCRIPTURE_TAB[post.id] ?? PATH_TAB[post.id];
  if (seated) return seated;
  if (post.id.startsWith("u-") || post.id.startsWith("src-")) return "clinic";
  const yt = post.youtubeId;
  if ((yt && STUDY_YT.has(yt)) || post.id.startsWith("study-")) return "study";
  const tags = (post.hashtags ?? []).join(" ").toLowerCase();
  if ((yt && MUSIC_YT.has(yt)) || post.id.startsWith("mu-") || post.id.startsWith("hymn-") || MUSIC_TAGS.test(tags)) return "music";
  if (post.id.startsWith("mkt-") || PRODUCT_TAGS.test(tags)) return "study";
  if (post.id.startsWith("in-")) {
    if (/bible|scripture|theology|sermon|covenant|#faith|#pulpit/.test(tags)) return "crews";
    if ((post.year ?? 0) >= 2024) return "clinic";
    const seats: AppTab[] = ["clinic", "reels", "study", "hub", "crews"];
    return seats[hash(yt || post.id) % seats.length] ?? "clinic";
  }
  if (yt && HUB_YT.has(yt)) return "hub";
  return hash(yt || post.id) % 3 === 0 ? "clinic" : "reels";
}

export function onTab<T extends { id: string; youtubeId?: string; hashtags?: string[]; caption?: string; teach?: { hook?: string; stamp?: string; prompt?: string } }>(rows: T[], tab: AppTab) {
  return rows.filter((row) => !isAiClip(row) && tabOf(row) === tab);
}
