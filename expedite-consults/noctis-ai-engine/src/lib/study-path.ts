const KEY = "sphera-study-path";

export type StudyStep = "watch" | "families" | "examine" | "tailor" | "assess" | "rmf" | "lab";

export type StudyPath = {
  familyId: string | null;
  step: StudyStep;
};

export const STUDY_STEPS: { id: StudyStep; label: string }[] = [
  { id: "watch", label: "Watch" },
  { id: "families", label: "Families" },
  { id: "examine", label: "Examine" },
  { id: "tailor", label: "Tailor" },
  { id: "assess", label: "Assess" },
  { id: "rmf", label: "RMF pubs" },
  { id: "lab", label: "Range" },
];

export function readStudyPath(): StudyPath {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { familyId: null, step: "watch" };
    const p = JSON.parse(raw) as StudyPath;
    return {
      familyId: typeof p.familyId === "string" ? p.familyId : null,
      step: STUDY_STEPS.some((s) => s.id === p.step) ? p.step : "watch",
    };
  } catch {
    return { familyId: null, step: "watch" };
  }
}

export function writeStudyPath(path: StudyPath) {
  localStorage.setItem(KEY, JSON.stringify(path));
}

export function selectFamily(familyId: string): StudyPath {
  const path: StudyPath = { familyId: familyId.toUpperCase(), step: "examine" };
  writeStudyPath(path);
  return path;
}