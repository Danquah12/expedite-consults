const KEY = "vibetok-learner";
const WEEK = 6 * 24 * 60 * 60 * 1000;

export type Mark = {
  seenAt: number;
  revealed?: boolean;
  words?: string;
};

function read(): Record<string, Mark> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Mark>) : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, Mark>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
}

export function markOf(id: string) {
  return read()[id];
}

export function allMarks() {
  return read();
}

export function touchMark(id: string, patch: Partial<Mark>) {
  const all = read();
  const prev = all[id];
  all[id] = { ...prev, seenAt: prev?.seenAt ?? Date.now(), ...patch };
  write(all);
  return all[id];
}

export function masteryOf(mark: Mark | undefined) {
  const exposure = Boolean(mark);
  const explanation = (mark?.words?.trim().length ?? 0) > 24;
  const question = Boolean(mark?.revealed);
  const hits = [exposure, explanation, question].filter(Boolean).length;
  return {
    exposure,
    explanation,
    question,
    score: Math.round((hits / 3) * 100),
  };
}

export function dueForReview(mark: Mark | undefined) {
  if (!mark?.seenAt || !mark.revealed) return false;
  return Date.now() - mark.seenAt > WEEK;
}

export function coveredTerms(answer: string, words: string) {
  const terms = [...new Set(answer.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4))].slice(0, 6);
  const blob = words.toLowerCase();
  return terms.map((term) => ({ term, hit: blob.includes(term) }));
}
