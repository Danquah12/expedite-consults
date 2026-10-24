export type VerifyId = "university" | "instructor" | "researcher" | "organization" | "community";

export const VERIFY_LABEL: Record<VerifyId, string> = {
  university: "University",
  instructor: "Instructor",
  researcher: "Researcher",
  organization: "Organization",
  community: "Hall",
};

export type EduMark = {
  verify: VerifyId;
  kind: string;
  school?: string;
  skills: string[];
  chapters?: { t: number; label: string }[];
  paper?: string;
  courseId?: string;
  projectId?: string;
  path?: string;
};

const MARKS: Record<string, EduMark> = {
  yt1: {
    verify: "university",
    kind: "Guest lecture",
    school: "TED · Oakley",
    skills: ["How to learn", "Focus", "Diffuse"],
    chapters: [
      { t: 0, label: "Stuck" },
      { t: 90, label: "Focus" },
      { t: 240, label: "Walk" },
    ],
    path: "Beginner · Learn",
  },
  yt2: {
    verify: "instructor",
    kind: "Lecture",
    school: "3Blue1Brown",
    skills: ["Calculus", "Integrals"],
    chapters: [
      { t: 0, label: "Area" },
      { t: 60, label: "Slices" },
      { t: 180, label: "Limit" },
    ],
    path: "Mathematics",
  },
  yt3: {
    verify: "organization",
    kind: "Lab demo",
    school: "MathWorks",
    skills: ["PID", "Control"],
    path: "Engineering",
  },
  yt4: {
    verify: "instructor",
    kind: "Seminar",
    school: "TED",
    skills: ["Voice", "Presence"],
    path: "Career",
  },
  yt5: {
    verify: "instructor",
    kind: "Cyber demo",
    school: "Computerphile",
    skills: ["SQL", "Injection", "Queries"],
    paper: "https://owasp.org/www-community/attacks/SQL_Injection",
    courseId: "cyber-101",
    path: "Cybersecurity",
  },
  yt6: {
    verify: "instructor",
    kind: "Methodology",
    school: "Crash Course",
    skills: ["Method", "Evidence"],
    path: "Research methods",
  },
  yt7: {
    verify: "researcher",
    kind: "Literature",
    school: "University talk",
    skills: ["Papers", "Reading"],
    path: "Research methods",
  },
  yt23: {
    verify: "university",
    kind: "University lecture",
    school: "MIT OCW",
    skills: ["Computation", "Python"],
    chapters: [
      { t: 0, label: "Intro" },
      { t: 960, label: "Computation" },
      { t: 1920, label: "Python" },
    ],
    path: "Computer Science",
  },
  yt24: {
    verify: "university",
    kind: "University lecture",
    school: "Harvard CS50",
    skills: ["CS", "Scratch", "Thinking"],
    chapters: [
      { t: 0, label: "Thinking" },
      { t: 600, label: "Binary" },
      { t: 1800, label: "Scratch" },
    ],
    path: "Computer Science",
  },
  yt25: {
    verify: "organization",
    kind: "Research findings",
    school: "NASA",
    skills: ["Astronomy", "Webb"],
    path: "Physics",
  },
  yt26: {
    verify: "instructor",
    kind: "Tutorial",
    school: "Khan Academy",
    skills: ["Algebra", "Patterns"],
    path: "Mathematics",
  },
  yt27: {
    verify: "university",
    kind: "University lecture",
    school: "MIT 6.006",
    skills: ["Algorithms", "Complexity"],
    chapters: [
      { t: 0, label: "Algorithms" },
      { t: 480, label: "Computation" },
    ],
    path: "Computer Science",
  },
  yt28: {
    verify: "instructor",
    kind: "Research talk",
    school: "3Blue1Brown",
    skills: ["Neural nets", "ML"],
    chapters: [
      { t: 0, label: "Neuron" },
      { t: 180, label: "Layer" },
      { t: 480, label: "Learn" },
    ],
    path: "AI/ML",
  },
  md1: {
    verify: "instructor",
    kind: "Lesson",
    school: "TED-Ed",
    skills: ["Cancer", "Cell division"],
    chapters: [
      { t: 0, label: "Healthy" },
      { t: 80, label: "Cancer" },
      { t: 160, label: "Chemo" },
    ],
    path: "Medicine",
  },
  md2: {
    verify: "instructor",
    kind: "Pathology",
    school: "Osmosis",
    skills: ["Parkinson's", "Dopamine"],
    chapters: [
      { t: 0, label: "Cause" },
      { t: 180, label: "Signs" },
      { t: 420, label: "Treat" },
    ],
    path: "Medicine",
  },
  md3: {
    verify: "instructor",
    kind: "Pathology",
    school: "Osmosis",
    skills: ["Diabetes", "Insulin"],
    path: "Medicine",
  },
  md4: {
    verify: "instructor",
    kind: "Lesson",
    school: "TED-Ed",
    skills: ["Alzheimer's", "Memory"],
    chapters: [
      { t: 0, label: "Dementia" },
      { t: 86, label: "Plaques" },
      { t: 160, label: "Care" },
    ],
    path: "Medicine",
  },
  md5: {
    verify: "organization",
    kind: "Training",
    school: "NCI",
    skills: ["Cancer", "Immunotherapy"],
    path: "Medicine",
  },
  md6: {
    verify: "instructor",
    kind: "Lesson",
    school: "TED-Ed",
    skills: ["Sugar", "Brain", "Diabetes"],
    path: "Medicine",
  },
  md7: {
    verify: "instructor",
    kind: "Lesson",
    school: "TED-Ed",
    skills: ["Stroke", "Brain"],
    chapters: [
      { t: 0, label: "Why" },
      { t: 40, label: "Clot" },
      { t: 155, label: "Treat" },
    ],
    path: "Medicine",
  },
  md8: {
    verify: "instructor",
    kind: "Pathology",
    school: "Osmosis",
    skills: ["MS", "Myelin"],
    chapters: [
      { t: 0, label: "Myelin" },
      { t: 100, label: "Immune" },
      { t: 447, label: "Treat" },
    ],
    path: "Medicine",
  },
  pz1: { verify: "university", kind: "Training", school: "MIT", skills: ["Security", "Threats"], path: "Cybersecurity" },
  pz2: { verify: "instructor", kind: "Seminar", school: "BibleProject", skills: ["Luke", "Scripture"], path: "Academic" },
  pz3: { verify: "instructor", kind: "Tutorial", school: "Computerphile", skills: ["Crypto", "Keys"], path: "Cybersecurity" },
  pz4: { verify: "instructor", kind: "Seminar", school: "TED", skills: ["Speaking", "Ideas"], path: "Career" },
  pz5: { verify: "organization", kind: "Training", school: "W3C", skills: ["Access", "Design"], path: "Career" },
  pz6: { verify: "researcher", kind: "Research talk", school: "Harvard", skills: ["Teams", "Safety"], path: "Career" },
  pz7: { verify: "instructor", kind: "Seminar", school: "TED", skills: ["Why", "Leadership"], path: "Career" },
  pz8: { verify: "instructor", kind: "Seminar", school: "TED", skills: ["Attention", "Crisis"], path: "Career" },
  pz9: { verify: "instructor", kind: "Seminar", school: "TED · Pixar", skills: ["Story", "Teaching"], path: "Creative" },
  pz10: { verify: "instructor", kind: "Career advice", school: "TED", skills: ["Hiring", "Résumé"], path: "Career" },
  pz11: { verify: "instructor", kind: "Seminar", school: "BibleProject", skills: ["Wisdom", "Proverbs"], path: "Academic" },
  pz12: { verify: "instructor", kind: "Tutorial", school: "Computerphile", skills: ["Encryption", "Backup"], courseId: "cyber-101", path: "Cybersecurity" },
  pz13: { verify: "instructor", kind: "Seminar", school: "BibleProject", skills: ["Acts", "Scripture"], path: "Academic" },
  "mu-gospel": { verify: "instructor", kind: "Listen", school: "Jazz Academy", skills: ["Gospel", "Worship"], path: "Gospel Sunday" },
  "mu-zander": { verify: "instructor", kind: "Listen", school: "TED", skills: ["Classical", "Phrase"], path: "Classical study" },
  "mu-brain": { verify: "researcher", kind: "Listen", school: "TED-Ed", skills: ["Brain", "Focus"], path: "Study mode" },
  "mu-repeat": { verify: "researcher", kind: "Listen", school: "TED-Ed", skills: ["Focus", "Drill"], path: "Coding focus" },
  "mu-bobby": { verify: "instructor", kind: "Listen", school: "World Science Festival", skills: ["Jazz", "Scale"], path: "Jazz" },
  "mu-fela": { verify: "organization", kind: "Listen", school: "Rock Hall", skills: ["Afrobeat", "History"], path: "Afrobeats Friday" },
  "mu-hiplife": { verify: "organization", kind: "Listen", school: "BBC Africa", skills: ["Hiplife", "Ghana"], path: "Ghana sounds" },
  "mu-highlife": { verify: "community", kind: "Listen", school: "Hall", skills: ["Highlife", "Ghana"], path: "Highlife" },
  "mu-talgam": { verify: "instructor", kind: "Listen", school: "TED", skills: ["Lead", "Ensemble"], path: "Create mode" },
  "mu-elsistema": { verify: "organization", kind: "Listen", school: "TED", skills: ["Youth", "Orchestra"], path: "Youth orchestra" },
  "mu-emotion": { verify: "instructor", kind: "Listen", school: "TED", skills: ["Form", "Feeling"], path: "Jazz form" },
  "mu-dudamel": { verify: "instructor", kind: "Listen", school: "TED", skills: ["Count", "Leap"], path: "Motivation" },
};

export function eduMark(post: { id: string; youtubeId?: string; lane: string }): EduMark {
  if (MARKS[post.id]) return MARKS[post.id];
  if (post.id.startsWith("study-jhu")) {
    return { verify: "university", kind: "Research film", school: "Johns Hopkins", skills: ["Medicine", "Research"], path: "Study" };
  }
  if (post.id.startsWith("study-nih") || post.id.startsWith("study-niaid")) {
    return { verify: "organization", kind: "Research film", school: "NIH", skills: ["Biomedical", "Public health"], path: "Study" };
  }
  if (post.id.startsWith("study-cdc")) {
    return { verify: "organization", kind: "Public health", school: "CDC", skills: ["Prevention", "Health"], path: "Study" };
  }
  if (post.id.startsWith("study-hhmi")) {
    return { verify: "organization", kind: "Science lesson", school: "HHMI BioInteractive", skills: ["Genetics", "Biology"], path: "Study" };
  }
  if (post.id.startsWith("study-nature")) {
    return { verify: "researcher", kind: "Research video", school: "Nature", skills: ["Science", "Evidence"], path: "Study" };
  }
  if (post.lane === "learn") {
    return { verify: "community", kind: "Clinic", skills: ["Learn"], path: "Clinic" };
  }
  if (post.lane === "laugh") {
    return { verify: "community", kind: "Listen", skills: ["Play"], path: "Listen" };
  }
  return { verify: "community", kind: "Spark", skills: [], path: "Hall" };
}
