export const LEARN_OBJECTS = [
  { id: "video", label: "Video", purpose: "Explanation" },
  { id: "article", label: "Article", purpose: "Reading" },
  { id: "book", label: "Book", purpose: "Deep study" },
  { id: "paper", label: "Paper", purpose: "Advanced knowledge" },
  { id: "lab", label: "Lab", purpose: "Practice" },
  { id: "quiz", label: "Quiz", purpose: "Assessment" },
  { id: "cards", label: "Flashcards", purpose: "Memory" },
  { id: "code", label: "Code drill", purpose: "Application" },
  { id: "challenge", label: "Challenge", purpose: "Skill test" },
  { id: "sim", label: "Simulation", purpose: "Real practice" },
  { id: "talk", label: "Presentation", purpose: "Communication" },
  { id: "project", label: "Project", purpose: "Mastery" },
  { id: "credential", label: "Certificate", purpose: "Recognition" },
] as const;

export const ENGINE_FLOW = [
  "Sources",
  "Ingest",
  "Classify",
  "Graph + quality",
  "Objects",
  "Path",
  "Practice",
  "Assess",
  "Mastery",
  "Credential",
] as const;

export const STACK = ["Hall", "Clinic", "Course", "Lab", "Credential"] as const;

export const IAM_LESSON = {
  hall: "Cyber",
  clinic: "Cloud security",
  course: "AWS security",
  lesson: "IAM",
  objects: [
    {
      id: "video",
      label: "Video",
      body: "Identities, policies, least privilege. Who can do what on which resource.",
      prompt: "",
      ok: "",
      no: "",
    },
    {
      id: "article",
      label: "Reading",
      body: "A statement is Effect, Action, Resource, Condition. * is not a strategy.",
      prompt: "",
      ok: "",
      no: "",
    },
    {
      id: "lab",
      label: "Lab",
      body: "Find the finding: Action * on Resource * on clinic-app.",
      prompt: "What do you write on the evidence sheet?",
      ok: "Wildcard allow — least privilege failed",
      no: "Missing a Name tag",
    },
    {
      id: "quiz",
      label: "Quiz",
      body: "One question. Then you know if the video stuck.",
      prompt: "Least privilege means…",
      ok: "Only the actions the job needs",
      no: "Admin now, lock later",
    },
    {
      id: "sim",
      label: "Scenario",
      body: "A contractor left. Their access key still works. What is first?",
      prompt: "First move?",
      ok: "Disable or delete the key, then review CloudTrail",
      no: "Post in Slack and wait",
    },
    {
      id: "credential",
      label: "Assessment → badge",
      body: "Pass the three checks. Stamp: Cloud Security — IAM.",
      prompt: "The badge is for…",
      ok: "Evidence that you can read and fix an IAM policy",
      no: "Watching the video to the end",
    },
  ],
} as const;