export type Evidence = {
  source: string;
  type: string;
  relevance: string;
  href: string;
  passage: string;
};

export type StudyCard = {
  question: string;
  sentence: string;
  domain: string;
  confidence: "verified" | "supported" | "insufficient";
  steps: string[];
  evidence: Evidence[];
  next: string[];
  note: string;
};
