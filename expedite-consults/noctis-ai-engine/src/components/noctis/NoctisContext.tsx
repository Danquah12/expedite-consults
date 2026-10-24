import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFeedStore } from "@/lib/feed-store";
import { GOALS, levelFromXp } from "@/lib/learn";
import { knowledgeDna } from "@/lib/insight";
import { HALL_CARDS, TICKET_FACE } from "@/lib/hall";
import { readDna, raiseDna, strandsFor, readHours, readLesson, addHours } from "@/lib/hall-record";
import { studyLesson } from "@/lib/study-this";
import { bands, crewSuggestions, mentorLabel, missionLines, readMission, readinessOf, type NoctisContext } from "@/lib/noctis-os";
import { recommendFromTrail } from "@/lib/reel-services";
import { useJazzBed } from "@/lib/jazz-bed";
import { Volume2, VolumeX } from "lucide-react";

function visitStreak() {
  if (typeof localStorage === "undefined") return 1;
  const today = new Date().toISOString().slice(0, 10);
  let saved: { last?: string; n?: number } = {};
  try {
    saved = JSON.parse(localStorage.getItem("vibetok-streak") || "{}") as { last?: string; n?: number };
  } catch {
    saved = {};
  }
  if (saved.last === today) return saved.n || 1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const n = saved.last === yesterday.toISOString().slice(0, 10) ? (saved.n || 1) + 1 : 1;
  localStorage.setItem("vibetok-streak", JSON.stringify({ last: today, n }));
  return n;
}

function lessonNow() {
  const id = typeof sessionStorage === "undefined" ? "" : sessionStorage.getItem("hall-continue") || "";
  return HALL_CARDS.find((card) => card.id === id) ?? null;
}

function dnaRows(passed: Record<string, boolean>) {
  const boost = readDna();
  const base = knowledgeDna(passed);
  const names = new Set([...base.map((row) => row.name), ...Object.keys(boost), "Leadership", "AI", "Cloud computing", "Engineering"]);
  return [...names]
    .map((name) => ({ name, pct: Math.max(base.find((row) => row.name === name)?.pct ?? 0, boost[name] ?? 0) }))
    .sort((a, b) => b.pct - a.pct);
}

export function readNoctisContext(recent: string[], place: string): NoctisContext {
  const state = useFeedStore.getState();
  const goal = GOALS.find((item) => item.id === state.goal)?.label ?? "";
  const lesson = lessonNow();
  const face = lesson ? TICKET_FACE[lesson.ticket] : null;
  const passed = state.drillPassed;
  const boost = readDna();
  const rows = dnaRows(passed);
  const knowledgeDNA = Object.fromEntries(rows.map((row) => [row.name, row.pct]));
  const split = bands(knowledgeDNA);
  let newsTitle = "";
  let newsCategory = "";
  try {
    const saved = JSON.parse(sessionStorage.getItem("vibe-news") || "{}") as { title?: string; category?: string };
    newsTitle = saved.title || "";
    newsCategory = saved.category || "";
  } catch {
    newsTitle = "";
  }
  const quizPct = lesson?.post.id
    ? Math.round(((readLesson(lesson.id).score?.correct ?? 0) / Math.max(1, readLesson(lesson.id).score?.total ?? 1)) * 100 * (readLesson(lesson.id).score ? 1 : 0))
    : 0;
  const ready = readinessOf(knowledgeDNA, levelFromXp(state.xp).pct, quizPct);
  const summary = lesson ? studyLesson(lesson.post, []).summary.slice(0, 280) : "";
  const found = recommendFromTrail();
  return {
    userGoal: goal,
    currentLesson: lesson?.title ?? "",
    currentPath: face?.path ?? "",
    knowledgeDNA,
    strengths: split.strengths,
    growing: split.growing,
    notStarted: split.notStarted,
    weak: split.weak,
    xp: state.xp,
    hours: readHours(),
    progress: levelFromXp(state.xp).pct,
    recent: recent.slice(0, 5),
    place,
    newsTitle,
    newsCategory,
    lessonSummary: summary,
    readiness: ready,
    mentor: mentorLabel(face?.path ?? "", goal),
    crews: crewSuggestions(face?.path ?? "", knowledgeDNA),
    discovery: found ? [found.title, found.path, found.career, found.resource].filter(Boolean).join(" · ") : "",
  };
}

export function markDna(text: string) {
  const lesson = lessonNow();
  const passed = useFeedStore.getState().drillPassed;
  const names = lesson ? strandsFor(lesson.ticket, `${lesson.title} ${text}`) : dnaRows(passed).filter((row) => row.pct > 0).slice(0, 1).map((row) => row.name);
  const picked = names.slice(0, 2);
  if (!picked.length) return "";
  raiseDna(picked, 2);
  const focus = dnaRows(passed).slice().sort((a, b) => a.pct - b.pct)[0]?.name ?? picked[0];
  const lessonPct = lesson ? readLesson(lesson.id).progress : 0;
  addHours(0.1);
  return `DNA updated. ${picked.map((name) => `${name} +2`).join(". ")}. XP +2.${lessonPct ? ` Lesson ${lessonPct}%.` : ""} Suggested focus: ${focus}.`;
}

export function NoctisContextRail() {
  const goal = useFeedStore((s) => s.goal);
  const xp = useFeedStore((s) => s.xp);
  const passed = useFeedStore((s) => s.drillPassed);
  const meta = GOALS.find((item) => item.id === goal);
  const lvl = levelFromXp(xp);
  const lesson = lessonNow();
  const face = lesson ? TICKET_FACE[lesson.ticket] : null;
  const dna = dnaRows(passed);
  const split = bands(Object.fromEntries(dna.map((row) => [row.name, row.pct])));
  const stamps = useFeedStore((s) => s.earnedStamps);
  const mission = readMission();
  const mentor = mentorLabel(face?.path ?? "", meta?.label ?? "");
  const crews = crewSuggestions(face?.path ?? "", Object.fromEntries(dna.map((row) => [row.name, row.pct])));
  const ready = readinessOf(Object.fromEntries(dna.map((row) => [row.name, row.pct])), lvl.pct, 0);
  const lines = missionLines(meta?.label ?? "", lesson?.title ?? "");
  const [streak] = useState(visitStreak);
  return (
    <div className="mb-3 space-y-2">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e4b86a]">Current context</p>
        <dl className="mt-2 space-y-1.5 text-xs text-zinc-300">
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Goal</dt><dd className="text-right font-semibold text-zinc-100">{meta?.label ?? "Not set"}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Path</dt><dd className="text-right font-semibold text-zinc-100">{face?.path ?? "Open a Hall lesson"}</dd></div>
          <div>
            <dt className="text-zinc-500">Knowledge DNA</dt>
            <dd className="mt-1 space-y-1">
              <p>Strengths: {split.strengths.join(", ") || "None yet"}</p>
              <p>Growing: {split.growing.join(", ") || "None yet"}</p>
              <p>Not started: {split.notStarted.join(", ") || "None listed"}</p>
              <p>Weak: {split.weak.join(", ") || "None yet"}</p>
              <p>Focus: {split.weak[0] || split.notStarted[0] || "Stay on the lesson you have open."}</p>
            </dd>
          </div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Lesson</dt><dd className="max-w-[12rem] text-right font-semibold text-zinc-100">{lesson?.title ?? "None open"}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Crew</dt><dd className="text-right font-semibold text-zinc-100">{(typeof sessionStorage !== "undefined" && sessionStorage.getItem("vibe-crew")) ? crews[0] || "Crew started" : crews[0] || "None yet"}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-zinc-500">Mentor</dt><dd className="text-right font-semibold text-zinc-100">{mentor}</dd></div>
        </dl>
      </section>
      <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e4b86a]">My Journey</p>
        <p className="mt-2 text-sm font-semibold text-zinc-100">Progress {lvl.pct}%</p>
        <p className="mt-1 text-xs text-zinc-400">{meta?.label ?? "Set a goal"} · {streak}-day streak · {xp} marks · {readHours()} hours</p>
        <p className="mt-1 text-xs text-zinc-300">Readiness · exam {ready.exam} · career {ready.career} · path {ready.path}</p>
        <p className="mt-1 text-[11px] text-zinc-500">A Noctis score from DNA and progress. Not an official exam result.</p>
        <p className="mt-1 text-xs text-zinc-300">Achievements: {stamps.length ? stamps.slice(0, 3).join(", ") : "None yet"}</p>
        <p className="mt-1 text-xs text-zinc-300">Next: {lesson?.title ?? "Open a Hall lesson"}</p>
        <p className="mt-2 text-xs text-zinc-400">{mentor}</p>
        <p className="mt-1 text-[11px] text-zinc-500">Suggested crews: {crews.join(" · ") || "Open a lesson first."} Names only. No search of other people.</p>
        <Link to="/home" className="mt-2 inline-flex text-xs font-semibold text-[#e4b86a]">Open My Journey</Link>
      </section>
      <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e4b86a]">Today's mission</p>
        <ul className="mt-2 space-y-1 text-xs text-zinc-300">
          <li>{mission.watch ? "Done" : "Open"} · {lines.watch}</li>
          <li>{mission.quiz ? "Done" : "Open"} · {lines.quiz}</li>
          <li>{mission.news ? "Done" : "Open"} · {lines.news}</li>
          <li>{mission.ask ? "Done" : "Open"} · {lines.ask}</li>
        </ul>
        <p className="mt-2 text-[11px] text-zinc-500">{mission.paid ? "Reward added: 50 marks." : "Finish all four for 50 marks."}</p>
      </section>
    </div>
  );
}

export function NoctisRecommend({ quiet, onAsk, memory }: { quiet: boolean; onAsk: (ask: string) => void; memory?: string }) {
  const { bed, tune, music, setMusic } = useJazzBed(quiet);
  const goal = useFeedStore((s) => s.goal);
  const passed = useFeedStore((s) => s.drillPassed);
  const meta = GOALS.find((item) => item.id === goal);
  const lesson = lessonNow();
  const dna = dnaRows(passed).filter((row) => row.pct > 0).slice(0, 3);
  const based = dna.length ? dna.map((row) => row.name).join(" · ") : meta?.label ?? "Your goal is not set yet";
  const lessonTitle = lesson?.title ?? "Open a Hall lesson";
  let newsTitle = "";
  try {
    newsTitle = (JSON.parse(sessionStorage.getItem("vibe-news") || "{}") as { title?: string }).title || "";
  } catch {
    newsTitle = "";
  }
  return (
    <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col">
      <audio ref={bed} data-jazz="" preload="auto" />
      <section className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-[#e4b86a]/40 bg-[#1c1c1c] p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">Noctis recommends</p>
            {memory ? <p className="mt-2 text-sm text-zinc-100">Welcome back. You were in {memory}.</p> : null}
            <p className="mt-2 text-sm text-zinc-400">Based on {based}</p>
          </div>
          <button type="button" aria-label={music ? "Turn the music off" : "Turn the music on"} onClick={() => setMusic((on) => !on)} className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-white/10">
            {music && !quiet ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Rec kicker="Current lesson" title={lessonTitle} onClick={() => onAsk(`Teach me the next step of ${lessonTitle}. Use the lesson summary in context. Do not invent a transcript.`)} />
          <Rec kicker="News" title={newsTitle || "Read an analysis"} onClick={() => onAsk(`What should I study from this news: ${newsTitle || "the story I last opened"}? Say why it matters. Do not invent a headline.`)} />
          <Rec kicker="Career" title={meta?.label ?? "Choose a goal"} onClick={() => onAsk(`What is the next career step toward ${meta?.label ?? "a goal I choose"}? Do not invent a salary.`)} />
          <Rec kicker="Next action" title="Take a quiz" onClick={() => onAsk(`Give me a 5-question quiz on ${lessonTitle}.`)} />
          <Rec kicker="Resource" title="Open resources" onClick={() => onAsk("Which resource on my path should I open next, and why?")} />
        </div>
        <p className="mt-4 text-[11px] text-zinc-600">{tune.title} · {tune.by}</p>
      </section>
    </div>
  );
}

function Rec({ kicker, title, onClick }: { kicker: string; title: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl bg-white/5 px-3 py-3 text-left ring-1 ring-white/10 hover:bg-white/10">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{kicker}</span>
      <span className="mt-1 block text-sm font-semibold text-zinc-100">{title}</span>
    </button>
  );
}
