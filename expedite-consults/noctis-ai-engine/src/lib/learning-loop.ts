export type LoopStep = { id: string; label: string; state: "done" | "now" | "ahead" };

export type VibeLoopInput = {
  discovered: boolean;
  watched: boolean;
  understood: boolean;
  asked: boolean;
  learned: boolean;
  quizzed: boolean;
  mastered: boolean;
  created: boolean;
  shared: boolean;
  discussed: boolean;
};

const STEPS: { id: string; label: string; key: keyof VibeLoopInput }[] = [
  { id: "discover", label: "Discover", key: "discovered" },
  { id: "watch", label: "Watch", key: "watched" },
  { id: "understand", label: "Understand", key: "understood" },
  { id: "ask", label: "Ask AI", key: "asked" },
  { id: "learn", label: "Learn", key: "learned" },
  { id: "quiz", label: "Quiz", key: "quizzed" },
  { id: "master", label: "Master", key: "mastered" },
  { id: "create", label: "Create", key: "created" },
  { id: "share", label: "Share", key: "shared" },
  { id: "discuss", label: "Discuss", key: "discussed" },
];

export function openedStudy() {
  if (typeof localStorage === "undefined") return false;
  try {
    const raw = JSON.parse(localStorage.getItem("vt-study-said") || "[]") as unknown;
    return Array.isArray(raw) && raw.length > 0;
  } catch {
    return false;
  }
}

export function askedVibe() {
  if (typeof localStorage === "undefined") return false;
  try {
    const raw = localStorage.getItem("vibetok-vibe-threads");
    return typeof raw === "string" && /"role":"user"/.test(raw);
  } catch {
    return false;
  }
}

export function markedCreated() {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem("vibetok-created") === "1";
}

export function markCreated() {
  if (typeof localStorage !== "undefined") localStorage.setItem("vibetok-created", "1");
}

/** Each step is done only from its own signal. Watching does not mark Understand, Master, or Create. */
export function vibeLoop(input: VibeLoopInput) {
  const hits = STEPS.map((step) => input[step.key]);
  const now = hits.findIndex((hit) => !hit);
  const steps: LoopStep[] = STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    state: hits[index] ? "done" : index === now ? "now" : "ahead",
  }));
  const better = input.mastered
    ? "A subject is mastered only when its checks are complete. The model is not retrained."
    : "The brain answers, the notes are what was retrieved, and the learning record decides the next step. A watch is not mastery.";
  return { steps, better };
}
