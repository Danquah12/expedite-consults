import type { FeedPost } from "@/lib/feed-data";
import { SOURCE, SOURCE_HREF } from "@/lib/source";
import { studyLine } from "@/lib/further-study";
import { layTell } from "@/lib/plain-meaning";

const HOUSES: { id: string; test: RegExp }[] = [
  { id: "Bible", test: /bible|scripture|gospel|jesus|psalm|covenant|revelation|sermon/i },
  { id: "Cyber", test: /cyber|nist|hack|security|phish|malware|firewall|zero trust|linux/i },
  { id: "Wildlife", test: /wildlife|animal|forest|species|habitat|predator|zoo|savanna/i },
  { id: "Science", test: /science|physics|biology|chemistry|space|nasa|cell|atom|planet/i },
  { id: "Engineering", test: /engineer|circuit|bridge|voltage|motor|robot|manufactur/i },
];

export type StudySource = { title: string; note: string; href?: string };
export type StudyCardFace = { front: string; back: string };
export type StudyDefinition = { term: string; says: string };
export type ThreadStep = { title: string; line: string; postId?: string };

export type StudyLesson = {
  house: string;
  topic: string;
  level: "Beginner" | "Intermediate";
  kind: string;
  summary: string;
  concepts: string[];
  definitions: StudyDefinition[];
  facts: string[];
  beginner: string;
  advanced: string;
  explanation: string;
  cards: StudyCardFace[];
  discuss: string[];
  sources: StudySource[];
  related: FeedPost[];
  thread: ThreadStep[];
};

const FILLER = /source\s*·|expedite consults|what belongs on this clinic|a louder clip|whatever trended/i;

export type FilmNote = { onFilm: string; means: string };

function blob(post: FeedPost) {
  return `${post.teach?.stamp ?? ""} ${post.teach?.hook ?? ""} ${post.caption ?? ""} ${(post.hashtags ?? []).join(" ")}`;
}

export function studyHouse(post: FeedPost) {
  const text = blob(post);
  return HOUSES.find((house) => house.test.test(text))?.id ?? (post.teach?.stamp ?? "Film").replace(/\s*clinic$/i, "").trim();
}

export function filmNotes(post: FeedPost): FilmNote[] {
  const lines = layTell(post);
  const title = lines[0]?.replace(/^This film is about /i, "").replace(/[.?!]+$/g, "") || post.teach.hook;
  return [{ onFilm: title, means: lines.join(" ") }];
}

export function learnThread(post: FeedPost, _peers: FeedPost[]): ThreadStep[] {
  return layTell(post).map((line, index) => ({ title: `part-${index}`, line }));
}

function conceptsOf(post: FeedPost, house: string) {
  const tags = post.hashtags.map((tag) => tag.replace(/^#/, "").replace(/[-_]/g, " ")).filter((tag) => tag.length > 2 && tag.length < 28);
  const raw = [house, post.teach.stamp.replace(/\s*clinic$/i, "").trim(), ...tags];
  const seen = new Set<string>();
  const concepts: string[] = [];
  for (const item of raw) {
    const key = item.toLowerCase();
    if (!item || seen.has(key) || FILLER.test(item)) continue;
    seen.add(key);
    concepts.push(item);
    if (concepts.length === 5) break;
  }
  return concepts.length ? concepts : [house];
}

export function studyLesson(post: FeedPost, peers: FeedPost[]): StudyLesson {
  const house = studyHouse(post);
  const subject = studyLine(post.teach.hook || post.caption) || post.teach.stamp;
  const notes = filmNotes(post);
  const thread = learnThread(post, peers);
  const lead = notes[0];
  const explanation = lead?.means || post.teach.hook;
  const answer = post.teach.options.find((option) => option.ok && !FILLER.test(option.label))?.label ?? lead?.onFilm ?? post.teach.hook;
  const realPrompt = FILLER.test(post.teach.prompt) ? `What does “${lead?.onFilm ?? subject}” mean?` : post.teach.prompt;
  const related = peers.filter((row) => row.id !== post.id && (studyHouse(row) === house || row.teach.stamp === post.teach.stamp)).slice(0, 4);
  return {
    house,
    topic: post.teach.stamp,
    level: explanation.length > 280 ? "Intermediate" : "Beginner",
    kind: post.mediaType === "video" ? "Film" : post.mediaType === "audio" ? "Audio" : "Post",
    summary: explanation,
    concepts: conceptsOf(post, house),
    definitions: notes.slice(0, 3).map((note) => ({
      term: note.onFilm,
      says: note.means,
    })),
    facts: notes.map((note) => note.onFilm),
    beginner: explanation,
    advanced: explanation,
    explanation,
    cards: [
      { front: realPrompt, back: answer },
      ...notes.slice(0, 2).map((note) => ({ front: "Say the idea in your own words.", back: note.means })),
    ],
    discuss: [
      `Say “${lead?.onFilm ?? post.teach.hook}” in your own words, without copying the title.`,
      `Which moment in the film shows why that line is true?`,
      `What would you open next inside ${house}?`,
    ],
    sources: [
      { title: "This film", note: `${post.author.name} · ${post.teach.stamp}` },
      { title: SOURCE, note: "The house that seats this lesson.", href: SOURCE_HREF },
      {
        title: "Search this subject",
        note: "Open web. Not a claim this film did not make.",
        href: `https://www.google.com/search?q=${encodeURIComponent(`${subject} explained`)}`,
      },
    ],
    related,
    thread,
  };
}
