import type { FeedPost } from "@/lib/feed-data";
import type { DayWatch } from "@/lib/shuffle";

const CONCEPTS: { house: string; name: string; test: RegExp }[] = [
  { house: "Bible", name: "Contextual reading", test: /context|covenant|canon|testament|how to read|hermeneutic/i },
  { house: "Bible", name: "Scripture", test: /bible|gospel|jesus|psalm|revelation|sermon|prophet/i },
  { house: "Cybersecurity", name: "Networking", test: /\btcp\b|\bdns\b|http|ip address|network/i },
  { house: "Cybersecurity", name: "Linux", test: /linux|kernel|bash|terminal|torvalds/i },
  { house: "Cybersecurity", name: "Authentication", test: /authenticat|password|credential|\bmfa\b|login/i },
  { house: "Cybersecurity", name: "Security fundamentals", test: /cyber|security|malware|phish|firewall|nist/i },
  { house: "Science", name: "Biology", test: /biolog|cell|\bdna\b|gene|organism/i },
  { house: "Science", name: "Physics", test: /physics|gravity|quantum|magnet|electric field/i },
  { house: "Science", name: "Earth and space", test: /nasa|planet|galaxy|orbit|climate|geology/i },
  { house: "Engineering", name: "Electronics", test: /circuit|voltage|ohm|capacitor|electron/i },
  { house: "Engineering", name: "Machines", test: /engine|gear|turbine|robot|mechanical/i },
  { house: "Wildlife", name: "Animal behavior", test: /wildlife|predator|habitat|species|forest|savanna/i },
];

export type SkillLevel = "beginner" | "developing" | "intermediate" | "strong" | "needs practice";

export type SkillNode = { house: string; name: string; level: SkillLevel; plays: number; passed: number; missed: number };

export type LearningTree = { houses: { name: string; skills: SkillNode[] }[]; practice: SkillNode | null };

function blob(post: FeedPost) {
  return `${post.teach?.stamp ?? ""} ${post.teach?.hook ?? ""} ${post.caption ?? ""} ${(post.hashtags ?? []).join(" ")}`;
}

function levelOf(plays: number, dwellMs: number, passed: number, missed: number): SkillLevel {
  if (missed > 0 && passed === 0) return "needs practice";
  if (passed >= 2 || (passed >= 1 && dwellMs >= 40_000)) return "strong";
  if (passed >= 1 || dwellMs >= 20_000) return "intermediate";
  if (plays >= 2 || dwellMs >= 8_000) return "developing";
  return "beginner";
}

export function learningProfile(posts: FeedPost[], watch: DayWatch, passed: Record<string, boolean>, missed: Record<string, number>): LearningTree {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const tally = new Map<string, { house: string; name: string; plays: number; dwell: number; passed: number; missed: number }>();
  for (const id of watch.played ?? []) {
    const post = byId.get(id);
    if (!post) continue;
    const text = blob(post);
    const hits = CONCEPTS.filter((concept) => concept.test.test(text));
    const matched = hits.length ? hits : [];
    for (const concept of matched) {
      const key = `${concept.house}:${concept.name}`;
      const row = tally.get(key) ?? { house: concept.house, name: concept.name, plays: 0, dwell: 0, passed: 0, missed: 0 };
      row.plays += watch.counts?.[id] ?? 1;
      row.dwell += watch.dwell?.[id] ?? 0;
      if (passed[id]) row.passed += 1;
      row.missed += missed[id] ?? 0;
      tally.set(key, row);
    }
  }
  const skills: SkillNode[] = [...tally.values()].map((row) => ({
    house: row.house,
    name: row.name,
    level: levelOf(row.plays, row.dwell, row.passed, row.missed),
    plays: row.plays,
    passed: row.passed,
    missed: row.missed,
  }));
  const order = ["Bible", "Cybersecurity", "Science", "Engineering", "Wildlife"];
  const houses = order
    .map((name) => ({ name, skills: skills.filter((skill) => skill.house === name) }))
    .filter((house) => house.skills.length > 0);
  const practice = skills.find((skill) => skill.level === "needs practice") ?? null;
  return { houses, practice };
}
