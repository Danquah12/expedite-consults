import type { PathFilm } from "@/lib/learning-path";
import { loadLoop } from "@/lib/learner-loop";

export type KnowledgeGap = {
  label: string;
  track: "Engineering";
  lessonId: string;
  line: string;
};

function textOf(films: PathFilm[], id: string) {
  return films.find((film) => film.id === id)?.text || "";
}

export function knowledgeGap(films: PathFilm[], played: string[], passed: string[], missed: string[]): KnowledgeGap | null {
  const knowsForces = [...played, ...passed].some((id) => /\bforce\b|\bnewton\b/i.test(textOf(films, id)));
  const vectorsPassed = passed.some((id) => /\bvector/i.test(textOf(films, id)));
  const vectorsMissed = missed.some((id) => /\bvector/i.test(textOf(films, id)));
  const vectorsSeen = played.some((id) => /\bvector/i.test(textOf(films, id)));
  if (!knowsForces || vectorsPassed) return null;
  if (loadLoop("Engineering").passed.includes("eng-vectors")) return null;
  if (!vectorsMissed && vectorsSeen) return null;
  return {
    label: "vectors",
    track: "Engineering",
    lessonId: "eng-vectors",
    line: vectorsMissed
      ? "You appear to have a gap in vectors. A vectors check was missed. Complete this lesson before continuing."
      : "You appear to have a gap in vectors. Forces are already in your work, and vectors is not checked. Complete this lesson before continuing.",
  };
}
