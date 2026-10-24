import { LADDERS, type PathFilm } from "@/lib/learning-path";
import { LOOP_LESSONS, loadLoop } from "@/lib/learner-loop";

const AREAS = [
  { ladder: "bible", track: "Bible", label: "Bible" },
  { ladder: "bio", track: "Science", label: "Science" },
  { ladder: "cyber", track: "Cyber", label: "Cyber" },
  { ladder: "eng", track: "Engineering", label: "Engineering" },
] as const;

export type LearningBar = { label: string; percent: number; detail: string };

export type LearningBoard = {
  bars: LearningBar[];
  lessons: number;
  quizzes: number;
  areas: number;
  streak: number;
};

function touchedSteps(ladderId: string, films: PathFilm[], played: Set<string>, passed: Set<string>) {
  const ladder = LADDERS.find((row) => row.id === ladderId);
  if (!ladder) return { hit: 0, total: 0 };
  const hit = ladder.steps.filter((step) => films.some((film) => (played.has(film.id) || passed.has(film.id)) && step.test.test(film.text))).length;
  return { hit, total: ladder.steps.length };
}

function markToday(active: boolean) {
  if (typeof localStorage === "undefined" || !active) return [] as string[];
  const key = "vibetok-learn-days";
  const today = new Date().toISOString().slice(0, 10);
  let days: string[] = [];
  try {
    days = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    if (!Array.isArray(days)) days = [];
  } catch {
    days = [];
  }
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem(key, JSON.stringify(days.slice(-60)));
  }
  return days;
}

function streakOf(days: string[], active: boolean) {
  if (!active) return 0;
  const have = new Set(days);
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!have.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function learningBoard(films: PathFilm[], playedIds: string[], passedIds: string[]): LearningBoard {
  const played = new Set(playedIds);
  const passed = new Set(passedIds);
  const bars = AREAS.map((area) => {
    const steps = touchedSteps(area.ladder, films, played, passed);
    const loopLessons = LOOP_LESSONS.filter((lesson) => lesson.track === area.track);
    const loopPassed = loadLoop(area.track).passed.length;
    const filmPct = steps.total ? (steps.hit / steps.total) * 100 : 0;
    const loopPct = loopLessons.length ? (loopPassed / loopLessons.length) * 100 : 0;
    const percent = Math.max(0, Math.min(100, Math.round(Math.max(filmPct, loopPct))));
    const detail = steps.hit ? `${steps.hit} of ${steps.total} steps` : loopPassed ? `${loopPassed} lesson${loopPassed === 1 ? "" : "s"} checked` : "No work yet";
    return { label: area.label, percent, detail };
  });
  const areas = bars.filter((bar) => bar.percent > 0).length;
  const loopDone = AREAS.reduce((sum, area) => sum + loadLoop(area.track).passed.length, 0);
  const lessons = new Set([...playedIds, ...passedIds]).size + loopDone;
  const active = lessons > 0;
  return {
    bars,
    lessons,
    quizzes: passedIds.length,
    areas,
    streak: streakOf(markToday(active), active),
  };
}
