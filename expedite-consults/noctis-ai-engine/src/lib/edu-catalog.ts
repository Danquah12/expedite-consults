export type EduSource =
  | "youtube"
  | "ted"
  | "mit"
  | "khan"
  | "nasa"
  | "nih"
  | "nist"
  | "cdc"
  | "coursera"
  | "edx"
  | "user";

export type EduWing = "education" | "research" | "training" | "technology";

export type EduClip = {
  id: string;
  title: string;
  blurb: string;
  source: EduSource;
  sourceLabel: string;
  wing: EduWing;
  subject: string;
  youtubeId?: string;
  href?: string;
  kind: "embed" | "link";
};

export const SOURCE_BLURB: Record<EduSource, string> = {
  youtube: "Embed the original. We do not copy the file.",
  ted: "TED / TED-Ed talks, played on ConnectLn.",
  mit: "MIT OpenCourseWare. CC BY-NC-SA. Played on ConnectLn.",
  khan: "Khan Academy lessons, played on ConnectLn.",
  nasa: "NASA public video. Embed the original.",
  nih: "NIH / research talks. Embed or link.",
  nist: "NIST training. Link the original.",
  cdc: "CDC public health. Embed where they publish.",
  coursera: "Do not copy the course. Open Coursera.",
  edx: "Do not copy the course. Open edX.",
  user: "A Spark someone in the hall recorded.",
};

export const WINGS: { id: EduWing; label: string; hint: string }[] = [
  { id: "education", label: "Education", hint: "Lectures" },
  { id: "research", label: "Research", hint: "Method" },
  { id: "training", label: "Training", hint: "Labs" },
  { id: "technology", label: "Technology", hint: "Tools" },
];

export const SUBJECTS: Record<EduWing, string[]> = {
  education: [
    "Mathematics",
    "Computer Science",
    "Engineering",
    "Physics",
    "Biology",
    "Chemistry",
    "History",
    "Psychology",
    "Medicine",
    "Business",
    "Law",
  ],
  research: ["Presentations", "Methodology", "Literature", "Lab demo", "Findings"],
  training: ["Cybersecurity", "Cloud", "Programming", "AI/ML", "Healthcare", "Career"],
  technology: ["Tutorials", "Demos", "Open source", "AI tools", "Labs"],
};

export const EDU_CLIPS: EduClip[] = [
  {
    id: "mit-600",
    title: "MIT 6.00 — what is computation",
    blurb: "Grimson and Guttag. Name the primitive before you write Python.",
    source: "mit",
    sourceLabel: "MIT OCW",
    wing: "education",
    subject: "Computer Science",
    youtubeId: "k6U-i4gXkLM",
    kind: "embed",
  },
  {
    id: "mit-6006",
    title: "MIT 6.006 — algorithms and computation",
    blurb: "Demaine, Ku, Solomon. The first lecture of the algorithms clinic.",
    source: "mit",
    sourceLabel: "MIT OCW",
    wing: "education",
    subject: "Computer Science",
    youtubeId: "ZA-tUyM_y7s",
    kind: "embed",
  },
  {
    id: "cs50-0",
    title: "Harvard CS50 — Lecture 0, Scratch",
    blurb: "Malan. Computational thinking before C.",
    source: "youtube",
    sourceLabel: "Harvard CS50",
    wing: "education",
    subject: "Computer Science",
    youtubeId: "IDDmrzzB14M",
    kind: "embed",
  },
  {
    id: "3b1b-calc",
    title: "Essence of calculus",
    blurb: "Grant Sanderson. An integral is a sum of slices.",
    source: "youtube",
    sourceLabel: "3Blue1Brown",
    wing: "education",
    subject: "Mathematics",
    youtubeId: "WUvTyaaNkzM",
    kind: "embed",
  },
  {
    id: "khan-alg",
    title: "The beauty of algebra",
    blurb: "Sal Khan. Algebra is a way to write a pattern once.",
    source: "khan",
    sourceLabel: "Khan Academy",
    wing: "education",
    subject: "Mathematics",
    youtubeId: "kpCJyQ2usJ4",
    kind: "embed",
  },
  {
    id: "ted-learn",
    title: "Learning how to learn",
    blurb: "Barbara Oakley. When focus jams, walk. Come back.",
    source: "ted",
    sourceLabel: "TED",
    wing: "education",
    subject: "Psychology",
    youtubeId: "O96fE1E-rf8",
    kind: "embed",
  },
  {
    id: "ted-hail",
    title: "How to speak so that people want to listen",
    blurb: "Julian Treasure. HAIL: honesty, authenticity, integrity, love.",
    source: "ted",
    sourceLabel: "TED",
    wing: "education",
    subject: "Psychology",
    youtubeId: "eIho2S0ZahI",
    kind: "embed",
  },
  {
    id: "nasa-webb",
    title: "First images from James Webb",
    blurb: "NASA. Public. Look at the cliffs, then name the instrument.",
    source: "nasa",
    sourceLabel: "NASA",
    wing: "research",
    subject: "Findings",
    youtubeId: "1C_zuHf6lP4",
    kind: "embed",
  },
  {
    id: "crash-method",
    title: "Scientific method",
    blurb: "Crash Course. Question, test, review — then claim.",
    source: "youtube",
    sourceLabel: "Crash Course",
    wing: "research",
    subject: "Methodology",
    youtubeId: "xOLcZMw0hd4",
    kind: "embed",
  },
  {
    id: "carr-paper",
    title: "How to read a paper",
    blurb: "Pete Carr. Abstract, conclusions, figures — then decide.",
    source: "youtube",
    sourceLabel: "University talk",
    wing: "research",
    subject: "Literature",
    youtubeId: "IeaD0ZaUJ3Y",
    kind: "embed",
  },
  {
    id: "nn-3b1b",
    title: "But what is a neural network?",
    blurb: "Grant Sanderson. The map before the hype.",
    source: "youtube",
    sourceLabel: "3Blue1Brown",
    wing: "research",
    subject: "Presentations",
    youtubeId: "aircAruvnKk",
    kind: "embed",
  },
  {
    id: "sql-inject",
    title: "SQL injection — Computerphile",
    blurb: "Pound. The drill is parameterized queries.",
    source: "youtube",
    sourceLabel: "Computerphile",
    wing: "training",
    subject: "Cybersecurity",
    youtubeId: "ciNHn38EyRc",
    kind: "embed",
  },
  {
    id: "pid-walk",
    title: "PID control, a walk",
    blurb: "MATLAB. P until it shakes, then half.",
    source: "youtube",
    sourceLabel: "MathWorks",
    wing: "training",
    subject: "Programming",
    youtubeId: "wkfEZmsQqiA",
    kind: "embed",
  },
  {
    id: "coursera-ml",
    title: "Machine Learning (Andrew Ng)",
    blurb: "Coursera. We send you to the course. We do not copy it.",
    source: "coursera",
    sourceLabel: "Coursera",
    wing: "training",
    subject: "AI/ML",
    href: "https://www.coursera.org/learn/machine-learning",
    kind: "link",
  },
  {
    id: "edx-600",
    title: "MIT 6.00.1x on edX",
    blurb: "edX. Open the authorized course. Do not scrape the lectures.",
    source: "edx",
    sourceLabel: "edX",
    wing: "education",
    subject: "Computer Science",
    href: "https://www.edx.org/learn/computer-science/massachusetts-institute-of-technology-introduction-to-computer-science-and-programming-using-python",
    kind: "link",
  },
  {
    id: "nist-csf",
    title: "NIST Cybersecurity Framework",
    blurb: "NIST. Identify, protect, detect, respond, recover. Open the source.",
    source: "nist",
    sourceLabel: "NIST",
    wing: "training",
    subject: "Cybersecurity",
    href: "https://www.nist.gov/cyberframework",
    kind: "link",
  },
  {
    id: "cdc-ph",
    title: "CDC — public health training",
    blurb: "CDC. Authorized public content. Open the agency.",
    source: "cdc",
    sourceLabel: "CDC",
    wing: "training",
    subject: "Healthcare",
    href: "https://www.cdc.gov/training/",
    kind: "link",
  },
  {
    id: "nih-nlm",
    title: "NIH National Library of Medicine",
    blurb: "NIH. Research talks and training. Link the original.",
    source: "nih",
    sourceLabel: "NIH",
    wing: "research",
    subject: "Presentations",
    href: "https://www.nlm.nih.gov/",
    kind: "link",
  },
];

export function clipsFor(wing: EduWing, subject?: string | null) {
  return EDU_CLIPS.filter((c) => c.wing === wing && (!subject || c.subject === subject));
}
