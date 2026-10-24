import type { FeedPost } from "@/lib/feed-data";
import { splitSentences } from "@/lib/utils";

export type Hear = { tongue: string; line: string; phrases: string[] };

const ENGLISH = /\b(the|and|you|this|that|with|from|your|have|what)\b/i;

const TONGUES: { test: RegExp; tongue: string }[] = [
  { test: /\btwi\b|\bakan\b|\bghana\b|\bhighlife\b/i, tongue: "Twi" },
  { test: /\byoruba\b|\bigbo\b|\bnigeria\b|\bnaija\b/i, tongue: "Yoruba" },
  { test: /\bswahili\b|\bkenya\b|\btanzania\b/i, tongue: "Swahili" },
  { test: /\bzulu\b|\bxhosa\b|\bsouth africa\b|\bamapiano\b/i, tongue: "Zulu" },
  { test: /\bspanish\b|#cuba\b|\bsalsa\b|\bcumbia\b|\btango\b|\bmariachi\b/i, tongue: "Spanish" },
  { test: /\bfrench\b|\bsoukous\b|#congo\b/i, tongue: "French" },
  { test: /\bportuguese\b|\bbrazil\b|\bbossa\b/i, tongue: "Portuguese" },
  { test: /\bhindi\b|\braga\b|\bsitar\b|#india\b/i, tongue: "Hindi" },
  { test: /\barabic\b|\bgnawa\b|#morocco\b/i, tongue: "Arabic" },
  { test: /\bjapanese\b|\bgagaku\b|\btaiko\b|#japan\b/i, tongue: "Japanese" },
  { test: /\bchinese\b|\bguqin\b|#china\b/i, tongue: "Chinese" },
  { test: /\bkorean\b|#korea\b/i, tongue: "Korean" },
  { test: /\bbambara\b|\bsonghai\b|#mali\b|\bfarka\b/i, tongue: "Songhai" },
  { test: /\bgaelic\b|\bsean-nos\b|#ireland\b|\bceltic\b/i, tongue: "Irish" },
  { test: /\blatin\b|\bgregorian\b/i, tongue: "Latin" },
];

function cues(sense: string) {
  const parts = splitSentences(sense).filter((part) => part.length > 0 && part.length < 90);
  return parts.length ? parts : [sense];
}

export function englishHear(post: Pick<FeedPost, "youtubeId" | "caption" | "musicTitle" | "hashtags" | "teach">): Hear | null {
  const hay = `${post.musicTitle ?? ""} ${post.teach.stamp} ${post.caption} ${post.hashtags.join(" ")}`;
  if (ENGLISH.test(hay) && !/[ãõáéíóúâêôçñ¿¡]/i.test(hay)) return null;
  const tongue = TONGUES.find((row) => row.test.test(hay));
  if (!tongue) return null;
  const sense = post.teach.hook.replace(/\.$/, "");
  const line = `Sung in ${tongue.tongue}. ${sense}.`;
  return {
    tongue: tongue.tongue,
    line,
    phrases: [`Sung in ${tongue.tongue}.`, ...cues(sense.endsWith(".") ? sense : `${sense}.`)],
  };
}

/** One caption cue at a time, about 3.6 seconds, so an English reader can keep up. */
export function phraseAt(hear: Hear, time: number) {
  const phrases = hear.phrases.length ? hear.phrases : [hear.line];
  const index = Math.min(phrases.length - 1, Math.max(0, Math.floor(time / 3.6)));
  return phrases[index] ?? hear.line;
}
