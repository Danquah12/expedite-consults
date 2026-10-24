import { createServerFn } from "@tanstack/react-start";
import { solveWork } from "@/lib/calc";
import type { StudyCard } from "@/lib/knowledge-types";

export type { StudyCard };

export type FilmBrief = {
  subject: string;
  note: string[];
  bars: { label: string; score: number }[];
  source: string;
  href: string;
  cites?: { house: string; title: string; href: string }[];
  backed: number;
  opinion: number;
  unclear: number;
  factsChecked: number;
  factsOnRecord: number;
  truth: number;
  checkedFacts: string[];
  missedFacts: string[];
  helps: string;
  opinionLine: string;
  fact: string;
};

export const loadFilmBrief = createServerFn({ method: "POST" })
  .validator((input: { id?: string; title?: string; author?: string; story?: string } | undefined) => ({
    id: String(input?.id ?? "").slice(0, 80),
    title: String(input?.title ?? "").slice(0, 180),
    author: String(input?.author ?? "").slice(0, 80),
    story: String(input?.story ?? "").slice(0, 500),
  }))
  .handler(async ({ data }): Promise<FilmBrief | null> => {
    if (!data.title) return null;
    try {
      const { filmBrief } = await import("@/lib/film-brief.server");
      return await filmBrief(data);
    } catch {
      return null;
    }
  });

function withCheck(card: StudyCard): StudyCard {
  if (/Hallucination check/i.test(card.note)) return card;
  const strength = card.confidence === "verified" ? "Evidence strength: High" : card.confidence === "supported" ? "Evidence strength: Moderate" : "Insufficient evidence";
  const line =
    card.confidence === "verified"
      ? "The sourced claims were checked."
      : card.confidence === "supported"
        ? "Part of this is only partly supported."
        : "Not enough sources to verify this.";
  return { ...card, note: `${card.note} ${strength}. ${line}` };
}

function calculated(question: string): StudyCard | null {
  const work = solveWork(question);
  if (!work) return null;
  return {
    question,
    sentence: work.short.split("\n").map((line) => line.trim()).filter(Boolean)[1] || work.title,
    domain: "calculation",
    confidence: "verified",
    steps: work.full.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 12),
    evidence: [],
    next: [],
    note: "Computed by the calculator. Evidence strength: High. The number was computed, not recalled.",
  };
}

export const askStudy = createServerFn({ method: "POST" })
  .validator((input: { question?: string; teach?: boolean } | undefined) => ({
    question: String(input?.question ?? "").slice(0, 1600),
    teach: Boolean(input?.teach),
  }))
  .handler(async ({ data }): Promise<StudyCard> => {
    try {
      const work = calculated(data.question);
      if (work) return work;
      const { askStudy: run } = await import("@/lib/knowledge.server");
      return withCheck(await run(data.question, data.teach));
    } catch (err) {
      return withCheck({
        question: data.question,
        sentence: "The library could not be opened.",
        domain: "research",
        confidence: "insufficient",
        steps: ["The question was not guessed."],
        evidence: [],
        next: [],
        note: "The library did not answer.",
      });
    }
  });

export const listStudies = createServerFn({ method: "GET" }).handler(async () => {
  const { listStudies: run } = await import("@/lib/knowledge.server");
  return run();
});

export const libraryCounts = createServerFn({ method: "GET" }).handler(async () => {
  const { libraryCounts: run } = await import("@/lib/knowledge.server");
  return run();
});
