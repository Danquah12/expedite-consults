import type { FeedPost } from "@/lib/feed-data";
import { TREES, treeProgress } from "@/lib/learn";

export function knowledgeDna(passed: Record<string, boolean>) {
  const rows = TREES.map((t) => ({ name: t.name, pct: treeProgress(t.id, passed) }));
  const sum = rows.reduce((a, r) => a + r.pct, 0) || 1;
  return rows.map((r) => ({ ...r, share: Math.round((r.pct / sum) * 100) || 0 }));
}

export function smarterReport(passed: Record<string, boolean>, posts: FeedPost[]) {
  const learned = posts.filter((p) => passed[p.id]).map((p) => p.teach.hook);
  const missed = TREES.filter((t) => treeProgress(t.id, passed) < 50).map((t) => t.name);
  const next = posts.find((p) => p.lane === "learn" && !passed[p.id]) ?? posts.find((p) => !passed[p.id]);
  return { learned: learned.slice(0, 3), missed: missed.slice(0, 2), next };
}

const q = (
  hall: string,
  prompt: string,
  ok: string,
  wrong: [string, string, string],
): { hall: string; prompt: string; options: { id: string; label: string; ok: boolean }[] } => {
  const raw = [
    { label: wrong[0], ok: false },
    { label: wrong[1], ok: false },
    { label: ok, ok: true },
    { label: wrong[2], ok: false },
  ];
  const rot = hall.length % 4;
  const options = raw.slice(rot).concat(raw.slice(0, rot)).map((o, i) => ({ ...o, id: "abcd"[i]! }));
  return { hall, prompt, options };
};

export const BATTLE_BANK = [
  q("cyber", "Which protocol sits at layer 4?", "TCP", ["HTTP", "IP", "Ethernet"]),
  q("math", "The derivative of x² is…", "2x", ["x", "x²", "2"]),
  q("science", "DNA is a…", "Nucleic acid", ["Protein", "Lipid", "Carbohydrate"]),
  q("civic", "Authorize in RMF comes…", "After assess, before monitor", ["Before categorize", "Instead of implement", "Only for startups"]),
  q("care", "Sepsis is first a race against…", "Time", ["Insurance", "The next shift", "A scan"]),
  q("arts", "A steelman is…", "The strongest version of a claim, then you disagree", ["The weakest version of a claim", "A personal attack", "Silence"]),
  q("code", "A compiler’s job is to…", "Turn source into machine code or bytecode", ["Run the program twice", "Delete comments for speed", "Host the website"]),
  q("ai", "Attention in a transformer is…", "A weighted mix of values, keyed by the query", ["A queue of GPUs", "Memorizing the training set", "A softmax on the loss"]),
  q("cloud", "A VPC is…", "A private network you define", ["A physical cage in a datacenter", "A hypervisor license", "An IAM user"]),
  q("data", "A primary key…", "Uniquely identifies a row", ["Sorts the dashboard", "Is the first column you typed", "Must be a name"]),
  q("research", "A p-value is not…", "The chance the hypothesis is true", ["How extreme the data are if the null were true", "A number between 0 and 1", "Sensitive to sample size"]),
  q("mind", "Working memory is…", "Limited, not a warehouse", ["The same as long-term memory", "Unlimited if you care", "Only visual"]),
  q("maker", "Feedback control uses…", "The error between setpoint and measured", ["Only the last successful run", "Open-loop hope", "A bigger motor"]),
  q("space", "Escape velocity is…", "Speed to leave a gravity well without further thrust", ["Orbital period", "The speed of light", "Launch mass"]),
  q("sky", "The greenhouse effect is…", "Atmosphere trapping outgoing longwave radiation", ["The ozone hole", "Solar wind", "Earth’s magnetic field"]),
  q("business", "Revenue is not…", "Profit", ["Money in from sales", "A top-line figure", "Before costs"]),
  q("history", "A primary source is…", "From the time, not only about the time", ["A textbook summary", "A documentary voiceover", "Wikipedia"]),
  q("language", "A phoneme is…", "A sound that can change meaning", ["A letter", "A dialect", "A sentence"]),
  q("career", "A STAR answer is…", "Situation, Task, Action, Result", ["Strengths, Titles, Awards, References", "A cover letter", "Your GPA"]),
  q("trades", "Lockout/tagout is…", "Isolating energy before you touch the machine", ["A union vote", "A toolbox sticker", "Overtime rules"]),
  q("news", "A briefing should…", "Name the fact, then the lesson", ["Repeat the headline louder", "Guess the motive", "Skip the source"]),
  q("ag", "Nitrogen fixation is…", "Turning N₂ into a form plants can use", ["Watering at noon", "Clearing the field with fire", "Counting bushels"]),
  q("teach", "Formative assessment happens…", "During learning, to adjust the next move", ["Only on the final exam", "After graduation", "Never in a lab"]),
];

export const BATTLE_Q = BATTLE_BANK[0]!;
