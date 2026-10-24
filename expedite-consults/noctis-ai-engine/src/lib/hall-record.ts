import type { TicketId } from "@/lib/hall";

const BOOK = "vibetok-hall-book";
const DNA = "vibetok-hall-dna";
const HOURS = "vibetok-hall-hours";

export type HallNote = { study: string; bullets: string; revision: string };
export type HallScore = { correct: number; total: number; weak: string[]; at: string };
export type HallReply = { id: string; text: string };
export type HallPost = { id: string; text: string; likes: number; hidden: boolean; replies: HallReply[] };
export type HallLessonRecord = {
  progress: number;
  notes: HallNote | null;
  score: HallScore | null;
  thread: HallPost[];
};

const empty = (): HallLessonRecord => ({ progress: 0, notes: null, score: null, thread: [] });

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readBook(): Record<string, HallLessonRecord> {
  return read(BOOK, {});
}

export function readLesson(id: string): HallLessonRecord {
  return readBook()[id] ?? empty();
}

export function saveLesson(id: string, patch: Partial<HallLessonRecord>) {
  const book = readBook();
  const prev = book[id] ?? empty();
  book[id] = { ...prev, ...patch, progress: Math.max(prev.progress, patch.progress ?? prev.progress) };
  write(BOOK, book);
  return book[id];
}

export function lessonStatus(progress: number) {
  if (progress >= 100) return "Completed";
  if (progress >= 30) return "In progress";
  if (progress > 0) return "Started";
  return "Not started";
}

export function readDna(): Record<string, number> {
  return read(DNA, {});
}

const STRANDS: Partial<Record<TicketId, string[]>> = {
  developer: ["Engineering", "AI", "Cloud computing"],
  electrician: ["Engineering"],
  carpenter: ["Engineering"],
  designer: ["AI"],
  teacher: ["Leadership"],
  faculty: ["Leadership"],
  physician: ["Leadership"],
  pharmacist: ["Mathematics"],
  biologist: ["Mathematics"],
  realtor: ["Leadership"],
};

export function strandsFor(ticket: TicketId, text: string) {
  const rows = new Set(STRANDS[ticket] ?? ["Engineering"]);
  if (/cyber|security|network|malware/i.test(text)) rows.add("Cybersecurity");
  if (/cloud|kubernetes|aws|azure/i.test(text)) rows.add("Cloud computing");
  if (/math|calculus|equation/i.test(text)) rows.add("Mathematics");
  return [...rows];
}

export function raiseDna(names: string[], step = 20) {
  const dna = readDna();
  for (const name of names) dna[name] = Math.min(100, (dna[name] ?? 0) + step);
  write(DNA, dna);
  return dna;
}

export function addHours(amount: number) {
  const next = Math.round((read<number>(HOURS, 0) + amount) * 10) / 10;
  write(HOURS, next);
  return next;
}

export function readHours() {
  return read<number>(HOURS, 0);
}
