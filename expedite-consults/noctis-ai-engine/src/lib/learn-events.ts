export type LearnKind = "watch" | "search" | "study" | "community";

export type LearnEvent = { at: number; kind: LearnKind; subject: string };

const EVENTS = "vibetok-events";
const CONSENT = "vibetok-events-ok";
const KEEP = 14 * 24 * 60 * 60 * 1000;

/** Off until the person allows it. Message text is never stored. */
export function eventsAllowed() {
  return localStorage.getItem(CONSENT) === "yes";
}

export function setEventsAllowed(on: boolean) {
  localStorage.setItem(CONSENT, on ? "yes" : "no");
  if (!on) localStorage.removeItem(EVENTS);
}

export function noteEvent(kind: LearnKind, subject: string) {
  const clean = subject.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean) return;
  if (typeof window !== "undefined") {
    void import("@/lib/activity-client").then((mod) => mod.trail(kind, clean, clean));
  }
  if (!eventsAllowed()) return;
  const now = Date.now();
  const rows = readEvents().filter((row) => now - row.at > 60_000 || row.subject !== clean || row.kind !== kind);
  rows.push({ at: now, kind, subject: clean });
  localStorage.setItem(EVENTS, JSON.stringify(rows.slice(-200)));
}

export function readEvents(): LearnEvent[] {
  const now = Date.now();
  try {
    const rows = JSON.parse(localStorage.getItem(EVENTS) || "[]") as LearnEvent[];
    return rows.filter((row) => now - row.at < KEEP && typeof row.subject === "string");
  } catch {
    return [];
  }
}

export function clearEvents() {
  localStorage.removeItem(EVENTS);
}

export function topSubjects(limit = 4) {
  const count = new Map<string, number>();
  for (const row of readEvents()) count.set(row.subject, (count.get(row.subject) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([subject]) => subject);
}
