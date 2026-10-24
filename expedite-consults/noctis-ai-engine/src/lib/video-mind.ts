export type MindSource = { title: string; href: string; note: string };

export type VideoLesson = {
  title: string;
  description: string;
  spoken: string;
  spokenNote: string;
  plain: string;
  summary: string;
  points: string[];
  beginner: string;
  advanced: string;
  flashcards: { front: string; back: string }[];
  concepts: string[];
  people: string[];
  places: string[];
  organizations: string[];
  claims: string[];
  related: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  subject: string;
  topics: string[];
  vocabulary: { term: string; says: string }[];
  questions: { ask: string; answer: string }[];
  quiz: { ask: string; choices: string[]; answer: number }[];
  notes: string[];
  chapters: { at: string; title: string }[];
  objectives: string[];
  sources: MindSource[];
};

export type FilmAsk = {
  title: string;
  description: string;
  spoken: string;
  notes: string[];
  concepts: string[];
  sources: MindSource[];
};

export const ASK_PROMPTS = [
  "Explain this simply.",
  "What is the most important thing I should learn?",
  "Give me a quiz.",
  "Practise what I learned.",
  "What should I study next?",
];
