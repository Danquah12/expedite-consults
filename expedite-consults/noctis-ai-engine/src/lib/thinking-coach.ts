export const THINK_STEPS = [
  { id: "claim", ask: "What is the claim?" },
  { id: "support", ask: "What evidence supports it?" },
  { id: "assume", ask: "What assumptions are being made?" },
  { id: "contradict", ask: "What evidence would contradict it?" },
  { id: "alt", ask: "Are there alternative explanations?" },
  { id: "missing", ask: "What information are we missing?" },
] as const;

export type ThinkId = (typeof THINK_STEPS)[number]["id"];

const KEY = "vibetok-think";

function slot(claim: string) {
  let h = 2166136261;
  const text = claim.trim().toLowerCase().slice(0, 240);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${KEY}:${h >>> 0}`;
}

export function readThink(claim: string): Partial<Record<ThinkId, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(slot(claim)) || "{}") as Partial<Record<ThinkId, string>>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function writeThink(claim: string, notes: Partial<Record<ThinkId, string>>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(slot(claim), JSON.stringify(notes));
}
