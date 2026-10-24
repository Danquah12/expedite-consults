import { levelFromProgress, type DepthLevel } from "@/lib/depth";
import { knowledgeGap } from "@/lib/knowledge-gap";
import { LADDERS, type PathFilm } from "@/lib/learning-path";
import { LOOP_LESSONS, loadLoop } from "@/lib/learner-loop";

export type TeacherPlan = {
  studied: string[];
  understood: string[];
  missing: string[];
  difficulty: string;
  progress: string;
  goal: string;
  nextLesson: string;
  lesson: string;
};

function titles(films: PathFilm[], ids: string[], test: RegExp) {
  return films.filter((film) => ids.includes(film.id) && test.test(film.text)).map((film) => film.title).slice(0, 3);
}

export function teacherPlan(input: {
  films: PathFilm[];
  played: string[];
  passed: string[];
  missed: string[];
  goal: string;
  bars: { label: string; percent: number }[];
  difficulty?: DepthLevel | "auto";
}): TeacherPlan {
  const studied: string[] = [];
  const understood: string[] = [];
  const missing: string[] = [];
  for (const ladder of LADDERS) {
    for (const step of ladder.steps) {
      const seen = input.films.some((film) => input.played.includes(film.id) && step.test.test(film.text));
      const held = input.films.some((film) => input.passed.includes(film.id) && step.test.test(film.text));
      if (seen || held) studied.push(step.label);
      if (held) understood.push(step.label);
      else if (seen) missing.push(step.label);
    }
  }
  for (const lesson of LOOP_LESSONS) {
    const save = loadLoop(lesson.track);
    if (save.passed.includes(lesson.id)) understood.push(lesson.title);
    else if (save.lessonId === lesson.id && save.stage !== "assess") studied.push(lesson.title);
  }
  const gap = knowledgeGap(input.films, input.played, input.passed, input.missed);
  if (gap && !missing.includes("Vectors")) missing.unshift("Vectors");
  const difficulty = !input.difficulty || input.difficulty === "auto"
    ? levelFromProgress("teach me", input.bars)
    : input.difficulty;
  const depthLabel = difficulty[0].toUpperCase() + difficulty.slice(1);
  const open = input.bars.find((bar) => bar.percent < 100) ?? input.bars[0];
  const nextLesson = gap
    ? "Vectors, before the next forces step"
    : missing[0]
      ? missing[0]
      : open
        ? `the first unchecked step in ${open.label}`
        : "Beginner Cybersecurity, the first step on an empty record";
  const progress = input.bars.map((bar) => `${bar.label} ${bar.percent}%`).join(", ") || "No progress yet";
  const lesson = studied.length
    ? [
        `You have studied ${[...new Set(studied)].slice(0, 6).join(", ")}.`,
        `You understand ${[...new Set(understood)].slice(0, 6).join(", ") || "nothing that has been checked"}.`,
        `You have not checked ${[...new Set(missing)].slice(0, 6).join(", ") || "a later step"}.`,
        `Preferred difficulty is ${depthLabel}.`,
        `Progress is ${progress}.`,
        `Your goal is ${input.goal || "not set"}.`,
        `Today's lesson is ${nextLesson}.`,
      ].join(" ")
    : "Nothing is on your record yet. Name the subject, or open a course on Journey, and the study board will be written for that course.";
  return {
    studied: [...new Set(studied)].slice(0, 6),
    understood: [...new Set(understood)].slice(0, 6),
    missing: [...new Set(missing)].slice(0, 6),
    difficulty: depthLabel,
    progress,
    goal: input.goal || "not set",
    nextLesson,
    lesson,
  };
}

export function asksToBeTaught(question: string) {
  return /^teach me\s*[.?!]*$/i.test(question.trim());
}
