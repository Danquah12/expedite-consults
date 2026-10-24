export const CREATOR_KINDS = [
  { id: "course", label: "Course", from: "A set of lessons you publish. Noctis does not already sell a course." },
  { id: "lesson", label: "Lesson", from: "A study sheet or a teacher draft." },
  { id: "guide", label: "Study guide", from: "Notes you attach. Not a copied textbook." },
  { id: "research", label: "Research", from: "A research report you choose to publish." },
  { id: "tutorial", label: "Tutorial", from: "A shelf card or a bench lesson, in your words." },
  { id: "video", label: "Educational video", from: "A film already on Noctis. Publishing offers that film. It does not copy it." },
  { id: "tutor", label: "AI tutor", from: "The eight Vibe tutors stay on the platform. A creator tutor is a note you publish, not a new model." },
  { id: "program", label: "Learning program", from: "A path of lessons you name. Completing a check does not publish a program." },
] as const;

export type CreatorKind = (typeof CREATOR_KINDS)[number]["id"];

export type CreatorWork = {
  id: number;
  kind: string;
  title: string;
  body: string;
  status: "draft" | "published";
  author: string;
};
