import type { FeedPost } from "@/lib/feed-data";
import type { DayWatch } from "@/lib/shuffle";

export type GapTopic = { house: string; name: string; test: RegExp };

export const GAP_TOPICS: GapTopic[] = [
  { house: "Cybersecurity", name: "Malware", test: /malware/i },
  { house: "Cybersecurity", name: "Viruses", test: /virus/i },
  { house: "Cybersecurity", name: "Phishing", test: /phish/i },
  { house: "Cybersecurity", name: "Authentication", test: /authenticat|password|credential|\bmfa\b/i },
  { house: "Cybersecurity", name: "Encryption", test: /encrypt|cipher|\btls\b/i },
  { house: "Cybersecurity", name: "Network segmentation", test: /segment|vlan|microsegment/i },
  { house: "Cybersecurity", name: "Incident response", test: /incident response|containment/i },
  { house: "Bible", name: "Contextual reading", test: /context|covenant|canon/i },
  { house: "Science", name: "Biology", test: /biolog|\bdna\b|\bcell\b/i },
  { house: "Engineering", name: "Electronics", test: /circuit|voltage|ohm/i },
];

export type ConceptCount = { house: string; name: string; passed: number; missed: number; seen: number };

export function conceptCounts(posts: FeedPost[], watch: DayWatch, passed: Record<string, boolean>, missed: Record<string, number>): ConceptCount[] {
  const byId = new Map(posts.map((post) => [post.id, post]));
  return GAP_TOPICS.map((topic) => {
    let seen = 0;
    let pass = 0;
    let miss = 0;
    for (const id of watch.played ?? []) {
      const post = byId.get(id);
      if (!post) continue;
      const text = `${post.teach.stamp} ${post.teach.hook} ${post.caption}`;
      if (!topic.test.test(text)) continue;
      seen += 1;
      if (passed[id]) pass += 1;
      miss += missed[id] ?? 0;
    }
    return { house: topic.house, name: topic.name, passed: pass, missed: miss, seen };
  }).filter((row) => row.seen > 0 || row.passed > 0 || row.missed > 0);
}

export type GapSide = "understood" | "struggle";

export function sideOf(row: { passed: number; missed: number }): GapSide | null {
  if (row.missed > 0 && row.missed >= row.passed) return "struggle";
  if (row.passed > 0 && row.missed === 0) return "understood";
  return null;
}

export function curriculumQueue(rows: { name: string; passed: number; missed: number; seen?: number }[]) {
  const out: { name: string; why: string }[] = [];
  for (const row of rows) {
    if (row.missed > 0 && row.missed >= row.passed) {
      out.push({ name: row.name, why: `${row.missed} misses and ${row.passed} passes. Teach this next.` });
    } else if ((row.seen ?? 0) > 0 && row.passed === 0 && row.missed === 0) {
      out.push({ name: row.name, why: "Started, and the check was not finished." });
    }
  }
  return out.slice(0, 8);
}

export function gapLesson(name: string) {
  return {
    title: name,
    line: `This lesson was seated because learners missed ${name} more often than they passed it.`,
    steps: [
      `Say what ${name} is in one sentence of your own.`,
      `Name one place it shows up.`,
      `Name what you would check if it failed.`,
    ],
    prompt: `What does this lesson ask you to do with ${name}?`,
    answer: "Explain it, place it, and say how you would check it",
    wrong: ["Skip it because the feed was long", "Treat a miss as mastery"] as [string, string],
  };
}
