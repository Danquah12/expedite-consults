import type { FeedPost } from "@/lib/feed-data";

export const UNVERIFIED = "This information could not be verified from the available material.";

const SKIP_TAG = /^(learn|clinic|hall|video|ted|youtube|education|short|film|watch)$/i;

export type ThreadStep = { id: string; title: string; here: boolean; next: boolean; n: number };

export type LearningThread = {
  threadId: string | null;
  lessonId: string | null;
  order: number | null;
  lesson: string;
  plain: string;
  teaches: string;
  watch: string;
  question: string;
  answer: string;
  learned: string;
  next: { id: string; line: string } | null;
  path: ThreadStep[];
  related: { id: string; line: string }[];
  source: { name: string; topic: string; href: string };
  simpler: string;
  deeper: string;
  concepts: string[];
  wrongs: string[];
  confidence: "High" | "Moderate" | "Low";
};

function clean(text: string) {
  return text
    .replace(/#\w+/g, " ")
    .replace(/presented by\s+.+$/i, " ")
    .replace(/original\s·\s.+$/i, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bits(text: string) {
  return clean(text)
    .split(/(?<=[.?!])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 28);
}

function same(a: string, b: string) {
  return a.replace(/[.?!]+$/g, "").trim().toLowerCase() === b.replace(/[.?!]+$/g, "").trim().toLowerCase();
}

function tagsOf(post: FeedPost) {
  return post.hashtags.map((tag) => tag.replace(/^#/, "").replace(/[-_]/g, " ").trim()).filter((tag) => tag.length > 2 && !SKIP_TAG.test(tag));
}

function keyOf(post: FeedPost) {
  return post.youtubeId || post.id;
}

export function buildThread(post: FeedPost, library: FeedPost[]): LearningThread {
  const hook = clean(post.teach.hook);
  const stamp = clean(post.teach.stamp);
  const prompt = clean(post.teach.prompt);
  const answer = post.teach.options.find((option) => option.ok)?.label.trim() ?? "";
  const wrongs = post.teach.options.filter((option) => !option.ok).map((option) => option.label.trim()).filter(Boolean);
  const lesson = hook || stamp;
  const story = bits(post.caption).filter((line) => !same(line, hook) && !same(line, stamp) && !same(line, answer));
  const plain = story.slice(0, 2).join(" ");
  const used = new Set(story.slice(0, 2));
  const rest = story.filter((line) => !used.has(line));
  const teaches =
    answer && !same(answer, hook) && !same(answer, plain)
      ? `This video checks one point: ${answer.replace(/[.?!]$/, "")}.`
      : UNVERIFIED;
  const watch =
    prompt && !same(prompt, hook) && !same(prompt, plain)
      ? `Watch for the moment the film answers this: ${prompt.endsWith("?") ? prompt : `${prompt}?`}`
      : UNVERIFIED;
  const tags = tagsOf(post);
  const mine = new Set(tags.map((tag) => tag.toLowerCase()));
  const primary = tags[0]?.toLowerCase() ?? "";
  const others = library.filter((row) => keyOf(row) !== keyOf(post) && tagsOf(row).some((tag) => mine.has(tag.toLowerCase())));
  const ranked = others
    .map((row) => ({
      row,
      score: tagsOf(row).filter((tag) => mine.has(tag.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
  const nextRow = ranked[0]?.row;
  const next =
    nextRow && !same(clean(nextRow.teach.hook), hook)
      ? { id: nextRow.id, line: clean(nextRow.teach.hook) || clean(nextRow.teach.stamp) }
      : null;
  const family = primary
    ? library
        .filter((row) => tagsOf(row).some((tag) => tag.toLowerCase() === primary))
        .sort((a, b) => a.id.localeCompare(b.id))
    : [post];
  const at = Math.max(0, family.findIndex((row) => keyOf(row) === keyOf(post)));
  const start = Math.max(0, Math.min(at - 1, family.length - 7));
  const window = family.slice(start, start + 7);
  const path = window.map((row, i) => {
    const order = start + i + 1;
    const here = keyOf(row) === keyOf(post);
    return {
      id: row.id,
      title: clean(row.teach.hook) || clean(row.teach.stamp) || "Untitled lesson",
      here,
      next: !here && order === at + 2,
      n: order,
    };
  });
  const connected = path.length > 1 && Boolean(next);
  const slug = primary.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return {
    threadId: connected && slug ? `${slug}_001` : null,
    lessonId: connected && slug ? `${slug}_001_${String(at + 1).padStart(2, "0")}` : null,
    order: connected ? at + 1 : null,
    lesson: lesson || UNVERIFIED,
    plain: plain || UNVERIFIED,
    teaches,
    watch,
    question: prompt ? (prompt.endsWith("?") ? prompt : `${prompt}?`) : UNVERIFIED,
    answer: answer || UNVERIFIED,
    learned: answer && !same(answer, hook) ? answer.replace(/[.?!]$/, "") : lesson,
    next,
    path: connected ? path : path.filter((step) => step.here).slice(0, 1),
    related: ranked.slice(next ? 1 : 0, next ? 4 : 3).map(({ row }) => ({
      id: row.id,
      line: clean(row.teach.hook) || clean(row.teach.stamp),
    })),
    source: { name: post.author.name, topic: stamp || primary || "This film", href: post.mediaUrl },
    simpler: plain ? plain.split(/(?<=[.?!])\s+/)[0] ?? plain : UNVERIFIED,
    deeper: rest.slice(0, 2).join(" ") || UNVERIFIED,
    concepts: tags.slice(0, 4),
    wrongs,
    confidence: [plain, teaches, answer].filter((line) => line && line !== UNVERIFIED).length >= 3 ? "High" : plain || answer ? "Moderate" : "Low",
  };
}
