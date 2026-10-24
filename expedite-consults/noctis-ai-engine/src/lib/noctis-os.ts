import { readDna, raiseDna } from "@/lib/hall-record";

export type NoctisContext = {
  userGoal: string;
  currentLesson: string;
  currentPath: string;
  knowledgeDNA: Record<string, number>;
  strengths: string[];
  growing: string[];
  notStarted: string[];
  xp: number;
  hours: number;
  progress: number;
  recent: string[];
  place: string;
  newsTitle: string;
  newsCategory: string;
  lessonSummary: string;
  readiness: { exam: number; career: number; path: number };
  weak: string[];
  mentor: string;
  crews: string[];
  discovery: string;
};

export function bands(dna: Record<string, number>) {
  const rows = Object.entries(dna);
  return {
    strengths: rows.filter(([, n]) => n >= 20).map(([name]) => name),
    growing: rows.filter(([, n]) => n > 0 && n < 20).map(([name]) => name),
    notStarted: rows.filter(([, n]) => n === 0).map(([name]) => name).slice(0, 3),
    weak: rows.filter(([, n]) => n > 0 && n < 15).map(([name]) => name).slice(0, 3),
  };
}

export function readinessOf(dna: Record<string, number>, progress: number, quizPct: number) {
  const exam = Math.round(((dna.Cybersecurity ?? 0) + (dna.Mathematics ?? 0) + quizPct) / 3);
  const career = Math.round(((dna.Engineering ?? 0) + (dna.Control ?? 0) + progress) / 3);
  const path = Math.round((progress + quizPct) / 2);
  return { exam, career, path };
}

export function formatContext(ctx: NoctisContext) {
  return [
    "Learner context. Use it when they ask what to learn next, what to do, or how to grow.",
    "Do not raise a score above the number given. If a field says it is not set, say that.",
    "This is not a source for news, names, dates, or facts outside the journey.",
    `Goal: ${ctx.userGoal || "not set"}`,
    `Lesson: ${ctx.currentLesson || "not set"}`,
    `Path: ${ctx.currentPath || "not set"}`,
    `Place: ${ctx.place || "chat"}`,
    `Progress: ${ctx.progress}%`,
    `Marks: ${ctx.xp}`,
    `Hours: ${ctx.hours}`,
    `DNA: ${Object.entries(ctx.knowledgeDNA).map(([name, n]) => `${name} ${n}%`).join(", ") || "none yet"}`,
    `Strengths: ${ctx.strengths.join(", ") || "none yet"}`,
    `Growing: ${ctx.growing.join(", ") || "none yet"}`,
    `Not started: ${ctx.notStarted.join(", ") || "none listed"}`,
    `Weak: ${ctx.weak.join(", ") || "none yet"}`,
    `Recent chats: ${ctx.recent.join(", ") || "none"}`,
    `News: ${ctx.newsTitle || "not open"} (${ctx.newsCategory || "no desk"})`,
    `Lesson summary: ${ctx.lessonSummary || "not stored"}`,
    `Transcript: not stored. Do not invent spoken lines.`,
    `Readiness out of 100, from DNA, marks, and the last quiz only: exam ${ctx.readiness.exam}, career ${ctx.readiness.career}, path ${ctx.readiness.path}. This is not an official exam result.`,
    `Mentor to suggest: ${ctx.mentor}`,
    `Crew names to suggest, not a search of other people: ${ctx.crews.join(", ") || "none"}`,
    `Last reel: ${ctx.discovery || "none"}. Use it when they ask what to study next. Do not invent a path, career, or resource that is blank.`,
    "Do not invent a salary, a job count, or a person.",
  ].join("\n");
}

export function routeActions(question: string, place: string): { label: string; ask: string }[] {
  const q = question.toLowerCase();
  if (/don'?t understand|confused|lost|what does this mean|explain/.test(q)) {
    return [
      { label: "Generate notes", ask: "Write study notes for what I just said I do not understand. Use only that topic." },
      { label: "Simpler lesson", ask: "Explain that idea in simpler words, then one example." },
      { label: "Create quiz", ask: "Give me a 5-question quiz on the idea I do not understand yet." },
      { label: "Explain concept", ask: "Explain the concept in the last question. Use the lesson summary in the context. Do not invent a transcript." },
      { label: "Certification mapping", ask: "Which certification targets fit this lesson? Mark them as targets, not credentials I hold." },
    ];
  }
  if (/what should i learn|learn next|what next|next step/.test(q)) {
    return [
      { label: "Next three", ask: "From my goal, path, and lesson, name the next three things to study and why." },
      { label: "Create quiz", ask: "Quiz me on the lesson in my context." },
      { label: "Create roadmap", ask: "Turn my goal into a short roadmap with the next three steps." },
    ];
  }
  if (/how do i become|career|roadmap|job|certif/.test(q)) {
    return [
      { label: "Career roadmap", ask: "Give a career roadmap for the role I asked about. Tie it to my goal and lesson." },
      { label: "Related lessons", ask: "Which kinds of Hall lessons match that career? Stay with the path I am on." },
      { label: "Certifications", ask: "Which certification targets fit that career? Mark them as targets, not credentials I hold." },
      { label: "Find a mentor", ask: "What should I ask a mentor for this career in the first session?" },
    ];
  }
  if (place === "news" || /news|headline|regulation|what happened/.test(q)) {
    return [
      { label: "Summarize", ask: "Summarize the story in this conversation and say why it matters." },
      { label: "Explain impact", ask: "What is the career and study impact of that story?" },
      { label: "Discussion", ask: "Turn that story into three viewpoints and the open questions." },
      { label: "Related lessons", ask: "What should I study next because of that story?" },
    ];
  }
  return [];
}

export function mentorLabel(path: string, goal: string) {
  const text = `${path} ${goal}`.toLowerCase();
  if (/physician|pharm|medic|care|patient/.test(text)) return "Medical mentor";
  if (/teach|faculty|class/.test(text)) return "Teaching mentor";
  if (/cyber|developer|engineer|software|control/.test(text)) return "Engineering mentor";
  if (/business|job|realtor/.test(text)) return "Business mentor";
  return "Mentor for this path";
}

export function crewLabel(path: string) {
  if (!path || /not set|open a hall/i.test(path)) return "";
  return `${path} cohort`;
}

export function crewSuggestions(path: string, dna: Record<string, number>) {
  const top = Object.entries(dna).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0];
  const names = [crewLabel(path), top ? `${top} study group` : "", path ? `${path} practice crew` : ""].filter(Boolean);
  return [...new Set(names)].slice(0, 3);
}

export function missionLines(goal: string, lesson: string) {
  return {
    watch: lesson ? `Watch ${lesson}` : "Watch a Hall lesson",
    quiz: lesson ? `Quiz on ${lesson}` : "Take a quiz",
    news: "Read one news analysis",
    ask: goal ? `Ask Noctis about ${goal}` : "Ask Noctis",
  };
}

const MISSION = "vibetok-mission";

export type Mission = { date: string; watch: boolean; quiz: boolean; news: boolean; ask: boolean; paid: boolean };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function readMission(): Mission {
  const blank: Mission = { date: today(), watch: false, quiz: false, news: false, ask: false, paid: false };
  if (typeof localStorage === "undefined") return blank;
  try {
    const saved = JSON.parse(localStorage.getItem(MISSION) || "") as Mission;
    if (!saved || saved.date !== blank.date) return blank;
    return { ...blank, ...saved, date: blank.date };
  } catch {
    return blank;
  }
}

export function markMission(kind: "watch" | "quiz" | "news" | "ask"): Mission & { rewarded: boolean } {
  const cur = readMission();
  if (cur[kind]) return { ...cur, rewarded: false };
  cur[kind] = true;
  const complete = cur.watch && cur.quiz && cur.news && cur.ask;
  const rewarded = complete && !cur.paid;
  if (rewarded) {
    cur.paid = true;
    const low = Object.entries(readDna()).filter(([, n]) => n > 0).sort((a, b) => a[1] - b[1])[0];
    if (low) raiseDna([low[0]], 2);
  }
  localStorage.setItem(MISSION, JSON.stringify(cur));
  return { ...cur, rewarded };
}
