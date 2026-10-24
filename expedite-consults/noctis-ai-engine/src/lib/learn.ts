import type { FeedPost } from "@/lib/feed-data";
import type { VibeMix } from "@/lib/noctis";
import { shuffleWith, visitorSeed } from "@/lib/shuffle";

export type GoalId = "job" | "exam" | "skill" | "business" | "events" | "hobby";

export const GOALS: { id: GoalId; label: string; blurb: string; mix: VibeMix }[] = [
  { id: "exam", label: "Pass an exam", blurb: "Academic clinics first.", mix: { learn: 75, laugh: 10, local: 15 } },
  { id: "job", label: "Get a job", blurb: "Career skills and labs.", mix: { learn: 70, laugh: 10, local: 20 } },
  { id: "skill", label: "Learn a craft", blurb: "Tutorials and drills.", mix: { learn: 65, laugh: 20, local: 15 } },
  { id: "business", label: "Start something", blurb: "Ideas, then a clinic.", mix: { learn: 55, laugh: 20, local: 25 } },
  { id: "events", label: "Understand the world", blurb: "News with a teach-back.", mix: { learn: 50, laugh: 20, local: 30 } },
  { id: "hobby", label: "A serious hobby", blurb: "Creative with a drill.", mix: { learn: 40, laugh: 35, local: 25 } },
];

export type IntentId = "learn" | "trending" | "career" | "academic" | "ideas" | "world" | "creative" | "fun";

export const INTENTS: { id: IntentId; label: string; hint: string }[] = [
  { id: "learn", label: "Learn", hint: "Clinics" },
  { id: "academic", label: "Academic", hint: "School" },
  { id: "career", label: "Career", hint: "Labs & jobs" },
  { id: "ideas", label: "Ideas", hint: "Build" },
  { id: "world", label: "World", hint: "Why it matters" },
  { id: "creative", label: "Creative", hint: "Make" },
  { id: "trending", label: "Trending", hint: "Hot" },
  { id: "fun", label: "Fun", hint: "Hook" },
];

export type PostKind = "tutorial" | "explanation" | "case" | "skill" | "news" | "debate" | "guide";

export const POST_META: Record<string, { kind: PostKind; intents: IntentId[]; credit: "expert" | "crew" | "opinion"; tree: string }> = {
  pz1: { kind: "guide", intents: ["learn", "career", "academic"], credit: "expert", tree: "cyber" },
  pz2: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  pz3: { kind: "guide", intents: ["learn", "career"], credit: "expert", tree: "cyber" },
  pz4: { kind: "skill", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  pz5: { kind: "guide", intents: ["career", "world", "learn"], credit: "expert", tree: "campus" },
  pz6: { kind: "skill", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  pz7: { kind: "skill", intents: ["career", "ideas"], credit: "expert", tree: "campus" },
  pz8: { kind: "news", intents: ["world", "career", "learn"], credit: "expert", tree: "campus" },
  pz9: { kind: "skill", intents: ["creative", "career", "learn"], credit: "expert", tree: "campus" },
  pz10: { kind: "guide", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  pz11: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  pz12: { kind: "guide", intents: ["learn", "career"], credit: "expert", tree: "cyber" },
  pz13: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt1: { kind: "guide", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt2: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "calc" },
  yt3: { kind: "tutorial", intents: ["career", "ideas", "learn"], credit: "expert", tree: "robotics" },
  yt4: { kind: "skill", intents: ["career", "ideas"], credit: "expert", tree: "campus" },
  yt5: { kind: "case", intents: ["learn", "career", "academic"], credit: "expert", tree: "cyber" },
  yt6: { kind: "guide", intents: ["learn", "academic", "world"], credit: "expert", tree: "campus" },
  yt7: { kind: "guide", intents: ["learn", "academic", "career"], credit: "expert", tree: "campus" },
  yt8: { kind: "news", intents: ["world", "learn", "trending"], credit: "expert", tree: "campus" },
  yt9: { kind: "skill", intents: ["creative", "fun", "learn"], credit: "expert", tree: "rhythm" },
  yt10: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt11: { kind: "news", intents: ["world", "learn", "academic"], credit: "expert", tree: "campus" },
  yt12: { kind: "explanation", intents: ["learn", "academic", "world"], credit: "expert", tree: "campus" },
  yt13: { kind: "guide", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt14: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt15: { kind: "explanation", intents: ["learn", "world"], credit: "expert", tree: "campus" },
  yt16: { kind: "tutorial", intents: ["learn", "academic"], credit: "expert", tree: "calc" },
  yt17: { kind: "skill", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  yt18: { kind: "explanation", intents: ["career", "learn", "academic"], credit: "expert", tree: "campus" },
  yt19: { kind: "explanation", intents: ["learn", "academic"], credit: "expert", tree: "campus" },
  yt20: { kind: "skill", intents: ["creative", "career", "learn"], credit: "expert", tree: "lens" },
  yt21: { kind: "tutorial", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  yt22: { kind: "tutorial", intents: ["career", "learn"], credit: "expert", tree: "campus" },
  yt23: { kind: "tutorial", intents: ["learn", "academic", "career"], credit: "expert", tree: "campus" },
  yt24: { kind: "tutorial", intents: ["learn", "academic", "career"], credit: "expert", tree: "campus" },
  yt25: { kind: "news", intents: ["learn", "world", "academic"], credit: "expert", tree: "campus" },
  yt26: { kind: "tutorial", intents: ["learn", "academic"], credit: "expert", tree: "calc" },
  yt27: { kind: "tutorial", intents: ["learn", "academic", "career"], credit: "expert", tree: "campus" },
  yt28: { kind: "explanation", intents: ["learn", "career", "ideas"], credit: "expert", tree: "campus" },
  p1: { kind: "tutorial", intents: ["learn", "academic"], credit: "expert", tree: "calc" },
  p2: { kind: "skill", intents: ["creative", "fun", "trending"], credit: "crew", tree: "rhythm" },
  p3: { kind: "case", intents: ["learn", "career", "academic"], credit: "expert", tree: "cyber" },
  p4: { kind: "tutorial", intents: ["creative"], credit: "crew", tree: "lens" },
  p5: { kind: "skill", intents: ["creative", "fun"], credit: "crew", tree: "rhythm" },
  p6: { kind: "news", intents: ["world", "trending", "fun"], credit: "opinion", tree: "campus" },
  p7: { kind: "guide", intents: ["world", "career"], credit: "crew", tree: "campus" },
  p8: { kind: "case", intents: ["career", "ideas", "learn"], credit: "expert", tree: "robotics" },
  "mu-gospel": { kind: "explanation", intents: ["fun", "learn", "academic"], credit: "expert", tree: "music" },
  "mu-zander": { kind: "skill", intents: ["fun", "learn", "creative"], credit: "expert", tree: "music" },
  "mu-brain": { kind: "explanation", intents: ["learn", "fun", "academic"], credit: "expert", tree: "music" },
  "mu-repeat": { kind: "explanation", intents: ["learn", "fun", "career"], credit: "expert", tree: "music" },
  "mu-bobby": { kind: "skill", intents: ["fun", "learn", "creative"], credit: "expert", tree: "music" },
  "mu-fela": { kind: "news", intents: ["fun", "world", "learn"], credit: "expert", tree: "music" },
  "mu-hiplife": { kind: "news", intents: ["fun", "world", "creative"], credit: "expert", tree: "music" },
  "mu-highlife": { kind: "skill", intents: ["fun", "world", "creative"], credit: "crew", tree: "music" },
  "mu-talgam": { kind: "skill", intents: ["career", "fun", "learn"], credit: "expert", tree: "music" },
  "mu-elsistema": { kind: "guide", intents: ["learn", "fun", "academic"], credit: "expert", tree: "music" },
  "mu-emotion": { kind: "explanation", intents: ["learn", "fun", "creative"], credit: "expert", tree: "music" },
  "mu-dudamel": { kind: "skill", intents: ["fun", "learn", "creative"], credit: "expert", tree: "music" },
};

export const XP = { drill: 80, lesson: 25, watch: 8, save: 5, lab: 120 } as const;

export function levelFromXp(xp: number) {
  const level = 1 + Math.floor(xp / 400);
  const into = xp % 400;
  return { level, into, next: 400, pct: Math.round((into / 400) * 100) };
}

export type TreeNode = { id: string; label: string; postId: string };

export const TREES: { id: string; name: string; nodes: TreeNode[] }[] = [
  { id: "cyber", name: "Cybersecurity", nodes: [{ id: "n1", label: "Files", postId: "p3" }, { id: "n2", label: "Metadata", postId: "p3" }] },
  { id: "calc", name: "Mathematics", nodes: [{ id: "n1", label: "u and dv", postId: "p1" }, { id: "n2", label: "By parts", postId: "p1" }] },
  { id: "robotics", name: "Control", nodes: [{ id: "n1", label: "P term", postId: "p8" }, { id: "n2", label: "Gait", postId: "p8" }] },
  { id: "rhythm", name: "Movement", nodes: [{ id: "n1", label: "Beat 3", postId: "p2" }, { id: "n2", label: "Last turn", postId: "p5" }] },
  { id: "lens", name: "Photography", nodes: [{ id: "n1", label: "Harmattan light", postId: "p4" }] },
  { id: "campus", name: "Campus literacy", nodes: [{ id: "n1", label: "After lecture", postId: "p7" }, { id: "n2", label: "The run", postId: "p6" }] },
  { id: "music", name: "Listen", nodes: [{ id: "n1", label: "Gospel", postId: "mu-gospel" }, { id: "n2", label: "Jazz", postId: "mu-bobby" }, { id: "n3", label: "Afrobeat", postId: "mu-fela" }] },
];

export function treeProgress(treeId: string, passed: Record<string, boolean>) {
  const tree = TREES.find((t) => t.id === treeId);
  if (!tree) return 0;
  const ids = [...new Set(tree.nodes.map((n) => n.postId))];
  const done = ids.filter((id) => passed[id]).length;
  return Math.round((done / ids.length) * 100);
}

export function filterByIntent(posts: FeedPost[], intent: IntentId): FeedPost[] {
  if (intent === "trending") return [...posts].sort((a, b) => b.views - a.views);
  const hit: FeedPost[] = [];
  const rest: FeedPost[] = [];
  for (const p of posts) (intentHit(p, intent) ? hit : rest).push(p);
  return [...hit, ...rest];
}

export function postsForIntent(posts: FeedPost[], intent: IntentId): FeedPost[] {
  const seed = visitorSeed(intent);
  if (intent === "trending") return shuffleWith([...posts], seed);
  return shuffleWith(
    posts.filter((p) => intentHit(p, intent)),
    seed,
  );
}

function intentHit(p: FeedPost, intent: IntentId) {
  const meta = POST_META[p.id];
  if (intent === "learn") return p.lane === "learn" || Boolean(meta?.intents.includes("learn"));
  if (intent === "fun") return p.lane === "laugh" || Boolean(meta?.intents.includes("fun"));
  return Boolean(meta?.intents.includes(intent));
}
