import type { Career } from "@/lib/career-nav";
import { LEARN_PATHS } from "@/lib/today-learned";

export const PATH_FIT: Record<string, string[]> = {
  cyber: ["cyber-analyst", "network-engineer", "cyber-architect", "it-support"],
  data: ["data-analyst"],
  care: ["physician", "pharmacist", "nurse", "medical-assistant", "dental-hygienist"],
  trades: ["electrician", "carpenter", "mechanic", "plumber", "hvac", "welder", "mechanical-tech"],
  code: ["software-engineer", "web-developer"],
  cloud: ["cloud-engineer"],
  business: ["accountant", "bookkeeper", "project-manager"],
};

export function strandHits(career: Career, dna: Record<string, number>) {
  const text = `${career.name} ${career.skills.join(" ")} ${career.description}`.toLowerCase();
  return Object.entries(dna).filter(([name, value]) => value > 0 && text.includes(name.toLowerCase().split(" ")[0] || ""));
}

export function fitFor(career: Career, pathId: string, pathTitle: string, dna: Record<string, number>) {
  const reasons: string[] = [];
  let score = 0;
  if (PATH_FIT[pathId]?.includes(career.id)) {
    score += 50;
    reasons.push(pathTitle ? `Path: ${pathTitle}` : "Current path");
  }
  const hits = strandHits(career, dna);
  if (hits.length) {
    score += Math.min(50, hits.length * 20);
    reasons.push(hits.map(([name, value]) => `${name} ${value}`).join(" · "));
  }
  if (!reasons.length) return null;
  return { score: Math.min(100, score), reasons };
}

export function pathPercent(pathId: string) {
  const path = LEARN_PATHS.find((item) => item.id === pathId);
  if (!path || typeof localStorage === "undefined") return null;
  let done: string[] = [];
  try {
    const book = JSON.parse(localStorage.getItem("vibetok-path-steps") || "{}") as Record<string, string[]>;
    done = Array.isArray(book[pathId]) ? book[pathId] : [];
  } catch {
    done = [];
  }
  const total = Object.values(path.levels).reduce((sum, rows) => sum + rows.length, 0);
  if (!total) return null;
  return Math.round((done.length / total) * 100);
}

export function readinessFor(career: Career, pathId: string, dna: Record<string, number>, doneIds: string[]) {
  const parts: { label: string; score: number; weight: number }[] = [];
  const hits = strandHits(career, dna);
  if (hits.length) {
    parts.push({
      label: "Knowledge DNA",
      score: Math.round(hits.reduce((sum, [, value]) => sum + value, 0) / hits.length),
      weight: 20,
    });
  }
  if (pathId && PATH_FIT[pathId]?.includes(career.id)) {
    const score = pathPercent(pathId);
    if (score != null) parts.push({ label: "Path", score, weight: 20 });
  }
  const certs = career.stages.filter((stage) => stage.type === "Certification");
  if (certs.length) {
    const got = certs.filter((stage) => doneIds.includes(stage.id)).length;
    parts.push({ label: "Certifications", score: Math.round((got / certs.length) * 100), weight: 15 });
  }
  const weight = parts.reduce((sum, part) => sum + part.weight, 0);
  const score = weight ? Math.round(parts.reduce((sum, part) => sum + part.score * part.weight, 0) / weight) : null;
  const level = score == null ? "Not scored" : score <= 25 ? "Explorer" : score <= 50 ? "Beginner" : score <= 70 ? "Intermediate" : score <= 85 ? "Advanced" : "Ready";
  return { score, level, parts };
}

export function pathsForCareer(careerId: string) {
  return Object.entries(PATH_FIT)
    .filter(([, ids]) => ids.includes(careerId))
    .map(([id]) => LEARN_PATHS.find((item) => item.id === id)?.title)
    .filter((title): title is NonNullable<typeof title> => Boolean(title));
}
