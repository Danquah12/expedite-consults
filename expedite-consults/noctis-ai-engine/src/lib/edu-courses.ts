export type CourseItem =
  | { kind: "video"; id: string; title: string; youtubeId: string }
  | { kind: "read"; id: string; title: string; href: string }
  | { kind: "quiz"; id: string; title: string; prompt: string; ok: string; wrong: [string, string] };

export type CourseModule = {
  id: string;
  title: string;
  items: CourseItem[];
};

export const COURSES = [
  {
    id: "cyber-101",
    code: "CYBER 101",
    title: "Cybersecurity fundamentals",
    blurb: "A professor clinic: watch, read, then the Echo. Three modules. The stamp is the CIA triad, then the query, then the framework.",
    school: "Commonwealth Hall",
    modules: [
      {
        id: "m1",
        title: "Module 1 — Security fundamentals",
        items: [
          { kind: "video", id: "m1v1", title: "How to learn a hard thing", youtubeId: "O96fE1E-rf8" },
          { kind: "video", id: "m1v2", title: "Speak so the hall stays (HAIL)", youtubeId: "eIho2S0ZahI" },
          { kind: "read", id: "m1r1", title: "Reading: CIA triad (NIST)", href: "https://www.nist.gov/cyberframework" },
          {
            kind: "quiz",
            id: "m1q1",
            title: "Quiz — CIA",
            prompt: "What are the three letters of the CIA triad?",
            ok: "Confidentiality, integrity, availability",
            wrong: ["Control, inspect, audit", "Code, isolate, attack"],
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2 — Vulnerability management",
        items: [
          { kind: "video", id: "m2v1", title: "SQL injection demonstration", youtubeId: "ciNHn38EyRc" },
          { kind: "read", id: "m2r1", title: "Lab: parameterized queries", href: "https://owasp.org/www-community/attacks/SQL_Injection" },
          {
            kind: "quiz",
            id: "m2q1",
            title: "Quiz — injection",
            prompt: "How do you stop SQL injection?",
            ok: "Parameterized queries",
            wrong: ["Escape quotes by hand", "Hide the error page"],
          },
        ],
      },
      {
        id: "m3",
        title: "Module 3 — NIST RMF",
        items: [
          { kind: "read", id: "m3r1", title: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" },
          { kind: "read", id: "m3r2", title: "RMF overview", href: "https://csrc.nist.gov/projects/risk-management/about-rmf" },
          {
            kind: "quiz",
            id: "m3q1",
            title: "Assessment — RMF",
            prompt: "What is the first function in the NIST CSF?",
            ok: "Identify",
            wrong: ["Encrypt everything", "Write the ATO first"],
          },
        ],
      },
    ] satisfies CourseModule[],
  },
] as const;

export const PROJECTS = [
  {
    id: "llm-vuln",
    title: "LLM-Assisted Vulnerability Assessment and Remediation Recommendation",
    researchers: "Kwesi Asiedu · Nia Okonkwo",
    school: "University of Ghana",
    department: "Computer Science · Cyber Friday",
    abstract:
      "We ask whether a language model can name a vulnerability class and a first remediation without replacing the human who owns the box. The paper is the method. The video is the demo. The GitHub is the lab.",
    youtubeId: "ciNHn38EyRc",
    paper: "https://owasp.org/www-community/attacks/SQL_Injection",
    github: "https://github.com",
    dataset: "https://nvd.nist.gov/",
    keywords: ["LLM", "Cybersecurity", "Vulnerability", "Assessment", "Remediation"],
  },
] as const;

export function courseById(id: string) {
  return COURSES.find((c) => c.id === id);
}

export function projectById(id: string) {
  return PROJECTS.find((p) => p.id === id);
}
