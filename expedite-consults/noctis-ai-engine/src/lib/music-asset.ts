import type { FeedPost } from "@/lib/feed-data";
import { careerOf, TICKET_FACE } from "@/lib/hall";
import { hymnOfPost, type HymnRoom } from "@/lib/hymn-desk";
import { readSong } from "@/lib/reel-services";

const NOT_A_SONG = new Set([
  "mu-brain",
  "mu-repeat",
  "mu-talgam",
  "mu-elsistema",
  "mu-listen",
  "mu-emotion",
  "mu-zander",
  "mu-dudamel",
  "mu-hymn-kingdom",
  "mu-hymn-path",
  "mu-bobby",
]);

const USE: Partial<Record<HymnRoom, string>> = {
  worship: "Worship",
  memorial: "Remembrance",
  sunday: "Sunday worship",
  communion: "Communion",
  easter: "Easter",
  christmas: "Christmas",
  choir: "Choir",
  hymns: "Congregational hymn",
};

export function isMusicPost(post: FeedPost) {
  if (NOT_A_SONG.has(post.id)) return false;
  if (hymnOfPost(post)) return true;
  if (!(post.id.startsWith("mu-") || post.id.startsWith("hymn-"))) return false;
  return /#gospel|#hymn|#worship|#choir|#christian|#jazz|#soul/.test(post.hashtags.join(" ").toLowerCase());
}

export type MusicAsset = {
  musicId: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  language: string;
  sourceType: "youtube";
  sourceId: string;
  thumbnail: string;
  publishedDate: string;
  status: "active";
  meaning: {
    themes: string[];
    historicalContext: string;
    culturalSignificance: string;
    usage: string[];
  };
  analysis: {
    summary: string;
    importance: string;
    keyInsight: string;
    learningValue: string;
  };
  dnaImpact: Record<string, number>;
  learning: {
    relatedLessons: string[];
    relatedPaths: string[];
    relatedCareers: string[];
  };
};

/** A song as a meaning asset. Empty strings stay empty. Nothing is invented. */
export function musicAsset(post: FeedPost): MusicAsset | null {
  if (!isMusicPost(post)) return null;
  const hymn = hymnOfPost(post);
  const read = readSong(post);
  const ticket = careerOf(post);
  const career = ticket ? TICKET_FACE[ticket].career : "";
  const usage = (hymn?.rooms ?? []).map((room) => USE[room]).filter((row): row is string => Boolean(row));
  const dnaImpact: Record<string, number> = {};
  for (const name of read.dna) dnaImpact[name] = 1;
  return {
    musicId: post.id,
    title: read.title,
    artist: hymn?.writer || post.author.name || "",
    album: "",
    duration: 0,
    genre: hymn ? "Hymn" : "Gospel",
    language: hymn ? "English" : "",
    sourceType: "youtube",
    sourceId: post.youtubeId || hymn?.youtubeId || "",
    thumbnail: post.posterUrl || "",
    publishedDate: hymn?.year ? String(hymn.year) : "",
    status: "active",
    meaning: {
      themes: hymn?.theme ? [hymn.theme] : [],
      historicalContext: hymn?.history || "",
      culturalSignificance: read.culture.startsWith("Not stored") ? "" : read.culture,
      usage,
    },
    analysis: {
      summary: hymn?.verse || "",
      importance: hymn?.history || "",
      keyInsight: hymn?.ok || hymn?.theme || "",
      learningValue: hymn ? "Learn the hymn" : "",
    },
    dnaImpact,
    learning: {
      relatedLessons: read.lessons,
      relatedPaths: read.paths,
      relatedCareers: career ? [career] : [],
    },
  };
}
