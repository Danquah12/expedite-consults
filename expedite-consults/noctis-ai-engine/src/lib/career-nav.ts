export type Interest = "Technology" | "Healthcare" | "Skilled Trades" | "Business" | "Engineering" | "Arts & Design" | "Public Service";
export type WorkStyle = "Hands-on" | "People" | "Office" | "Remote" | "Research" | "Leadership";
export type Education = "High School" | "GED" | "Associate" | "Bachelor's" | "Master's";
export type Income = "$40–60k" | "$60–90k" | "$90–120k" | "$120k+";

export type Stage = {
  id: string;
  title: string;
  type: "School" | "Exam" | "Certification" | "License" | "Experience" | "Role";
  months: number;
};

export type Career = {
  id: string;
  name: string;
  category: Interest;
  description: string;
  salaryMin: number;
  salaryMax: number;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  years: string;
  demand: "Steady" | "High";
  styles: WorkStyle[];
  education: Education;
  income: Income;
  skills: string[];
  stages: Stage[];
};

export const INTERESTS: Interest[] = ["Technology", "Healthcare", "Skilled Trades", "Business", "Engineering", "Arts & Design", "Public Service"];
export const STYLES: WorkStyle[] = ["Hands-on", "People", "Office", "Remote", "Research", "Leadership"];
export const EDUCATIONS: Education[] = ["High School", "GED", "Associate", "Bachelor's", "Master's"];
export const INCOMES: Income[] = ["$40–60k", "$60–90k", "$90–120k", "$120k+"];

const EDU_RANK: Record<Education, number> = { "High School": 0, GED: 0, Associate: 1, "Bachelor's": 2, "Master's": 3 };
const INCOME_RANK: Record<Income, number> = { "$40–60k": 0, "$60–90k": 1, "$90–120k": 2, "$120k+": 3 };

function stages(career: string, rows: [string, Stage["type"], number][]): Stage[] {
  return rows.map(([title, type, months], i) => ({ id: `${career}-${i}`, title, type, months }));
}

export const CAREERS: Career[] = [
  {
    id: "cyber-analyst",
    name: "Cybersecurity Analyst",
    category: "Technology",
    description: "Watch the alerts, name what happened, and write the ticket a human can act on.",
    salaryMin: 75000,
    salaryMax: 120000,
    difficulty: "Intermediate",
    years: "12–18 months",
    demand: "High",
    styles: ["Office", "Remote", "Research"],
    education: "High School",
    income: "$60–90k",
    skills: ["Networking", "Windows", "Linux", "SIEM"],
    stages: stages("cyber-analyst", [
      ["CompTIA A+", "Certification", 3],
      ["Network+", "Certification", 3],
      ["Security+", "Certification", 4],
      ["SOC analyst seat", "Role", 6],
    ]),
  },
  {
    id: "network-engineer",
    name: "Network Engineer",
    category: "Technology",
    description: "Keep the paths up. Routing, switching, and the diagram that matches the wires.",
    salaryMin: 80000,
    salaryMax: 130000,
    difficulty: "Intermediate",
    years: "2–4 years",
    demand: "High",
    styles: ["Hands-on", "Office"],
    education: "Associate",
    income: "$90–120k",
    skills: ["Networking", "Routing", "Firewalls"],
    stages: stages("network-engineer", [
      ["Networking fundamentals", "School", 4],
      ["CCNA", "Certification", 6],
      ["Network engineer", "Role", 12],
      ["CCNP", "Certification", 12],
    ]),
  },
  {
    id: "cyber-architect",
    name: "Cybersecurity Architect",
    category: "Technology",
    description: "Design the security of a whole enterprise. CISSP is a gate, not the job.",
    salaryMin: 130000,
    salaryMax: 200000,
    difficulty: "Advanced",
    years: "3–5 years",
    demand: "High",
    styles: ["Leadership", "Research", "Office"],
    education: "Bachelor's",
    income: "$120k+",
    skills: ["Networking", "Cloud", "Security", "Risk"],
    stages: stages("cyber-architect", [
      ["Networking", "School", 4],
      ["Windows and Linux", "Experience", 6],
      ["Security+", "Certification", 4],
      ["CySA+", "Certification", 6],
      ["CISSP", "Certification", 8],
      ["Security architect", "Role", 18],
    ]),
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    category: "Technology",
    description: "Ship a program other people can run. The portfolio is the proof.",
    salaryMin: 90000,
    salaryMax: 170000,
    difficulty: "Intermediate",
    years: "1–3 years",
    demand: "High",
    styles: ["Remote", "Office", "Research"],
    education: "High School",
    income: "$90–120k",
    skills: ["Programming", "Git", "Testing"],
    stages: stages("software-engineer", [
      ["One language, used daily", "School", 4],
      ["A small public project", "Experience", 3],
      ["Data structures", "School", 3],
      ["Junior engineer seat", "Role", 6],
    ]),
  },
  {
    id: "physician",
    name: "Physician",
    category: "Healthcare",
    description: "Diagnose and treat. The license comes after school, the exam, and the residency.",
    salaryMin: 200000,
    salaryMax: 400000,
    difficulty: "Advanced",
    years: "10–14 years",
    demand: "High",
    styles: ["People", "Research", "Leadership"],
    education: "Bachelor's",
    income: "$120k+",
    skills: ["Biology", "Chemistry", "Clinical judgment"],
    stages: stages("physician", [
      ["High school diploma", "School", 0],
      ["Bachelor's in biology, chemistry, or pre-med", "School", 48],
      ["MCAT", "Exam", 6],
      ["Medical school", "School", 48],
      ["Residency", "Experience", 36],
      ["Medical license", "License", 6],
      ["Board certification", "Certification", 12],
    ]),
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    category: "Healthcare",
    description: "The medicine, the dose, and the person standing at the counter.",
    salaryMin: 120000,
    salaryMax: 160000,
    difficulty: "Advanced",
    years: "6–8 years",
    demand: "Steady",
    styles: ["People", "Office"],
    education: "Bachelor's",
    income: "$120k+",
    skills: ["Chemistry", "Pharmacology", "Patient counseling"],
    stages: stages("pharmacist", [
      ["Prerequisites", "School", 24],
      ["PharmD", "School", 48],
      ["NAPLEX and law exam", "Exam", 6],
      ["State license", "License", 3],
      ["Residency, if you want a clinical seat", "Experience", 12],
    ]),
  },
  {
    id: "electrician",
    name: "Electrician",
    category: "Skilled Trades",
    description: "Power that is safe. The hours on the job count as much as the classroom.",
    salaryMin: 50000,
    salaryMax: 100000,
    difficulty: "Intermediate",
    years: "4–5 years",
    demand: "High",
    styles: ["Hands-on"],
    education: "High School",
    income: "$60–90k",
    skills: ["Electrical code", "Wiring", "Safety"],
    stages: stages("electrician", [
      ["High school diploma", "School", 0],
      ["Apprenticeship", "Experience", 48],
      ["Journeyman license", "License", 6],
      ["Master electrician", "License", 24],
    ]),
  },
  {
    id: "carpenter",
    name: "Carpenter",
    category: "Skilled Trades",
    description: "Frame it, finish it, and stand behind the work.",
    salaryMin: 40000,
    salaryMax: 85000,
    difficulty: "Foundational",
    years: "2–5 years",
    demand: "Steady",
    styles: ["Hands-on"],
    education: "High School",
    income: "$40–60k",
    skills: ["Layout", "Tools", "Building code"],
    stages: stages("carpenter", [
      ["High school diploma", "School", 0],
      ["Trade school, if you want the head start", "School", 12],
      ["Apprenticeship", "Experience", 24],
      ["Journeyman carpenter", "Role", 12],
      ["Master carpenter", "Role", 24],
    ]),
  },
  {
    id: "mechanic",
    name: "Automotive Technician",
    category: "Skilled Trades",
    description: "Find the fault, fix the car, and explain it without the jargon.",
    salaryMin: 40000,
    salaryMax: 90000,
    difficulty: "Foundational",
    years: "2–4 years",
    demand: "Steady",
    styles: ["Hands-on"],
    education: "High School",
    income: "$40–60k",
    skills: ["Diagnostics", "Brakes", "Electrical systems"],
    stages: stages("mechanic", [
      ["High school diploma", "School", 0],
      ["ASE entry-level", "Certification", 6],
      ["Automotive technician", "Role", 12],
      ["ASE master technician", "Certification", 24],
      ["Shop supervisor", "Role", 18],
    ]),
  },
  {
    id: "mechanical-tech",
    name: "Mechanical Technician",
    category: "Engineering",
    description: "Machines, measurements, and the drawing that matches the part.",
    salaryMin: 48000,
    salaryMax: 85000,
    difficulty: "Intermediate",
    years: "2–4 years",
    demand: "Steady",
    styles: ["Hands-on", "Office"],
    education: "Associate",
    income: "$60–90k",
    skills: ["Measurement", "CAD", "Maintenance"],
    stages: stages("mechanical-tech", [
      ["High school diploma", "School", 0],
      ["Associate in mechanical technology", "School", 24],
      ["Shop or plant seat", "Role", 12],
      ["Specialist certification", "Certification", 12],
    ]),
  },
  {
    id: "it-support",
    name: "IT Support Specialist",
    category: "Technology",
    description: "The first person someone calls when the computer, the login, or the printer stops.",
    salaryMin: 45000,
    salaryMax: 75000,
    difficulty: "Foundational",
    years: "3–9 months",
    demand: "High",
    styles: ["People", "Office", "Remote"],
    education: "High School",
    income: "$40–60k",
    skills: ["Windows", "Tickets", "Networking"],
    stages: stages("it-support", [
      ["CompTIA A+", "Certification", 3],
      ["A help-desk seat", "Role", 3],
      ["Network+", "Certification", 3],
    ]),
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    category: "Technology",
    description: "A table, a question, and a chart a manager can trust.",
    salaryMin: 70000,
    salaryMax: 110000,
    difficulty: "Intermediate",
    years: "6–18 months",
    demand: "High",
    styles: ["Office", "Remote", "Research"],
    education: "High School",
    income: "$60–90k",
    skills: ["SQL", "Excel", "Charts"],
    stages: stages("data-analyst", [
      ["Spreadsheets used on real rows", "School", 2],
      ["SQL", "School", 3],
      ["A public analysis", "Experience", 3],
      ["Analyst seat", "Role", 6],
    ]),
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    category: "Technology",
    description: "Accounts, networks, and the log that shows who changed what.",
    salaryMin: 100000,
    salaryMax: 160000,
    difficulty: "Intermediate",
    years: "1–3 years",
    demand: "High",
    styles: ["Remote", "Office", "Research"],
    education: "Associate",
    income: "$90–120k",
    skills: ["Cloud", "Networking", "IAM"],
    stages: stages("cloud-engineer", [
      ["One cloud free tier, used weekly", "Experience", 3],
      ["AWS Cloud Practitioner or Azure Fundamentals", "Certification", 3],
      ["Associate architect exam", "Certification", 6],
      ["Cloud engineer seat", "Role", 12],
    ]),
  },
  {
    id: "web-developer",
    name: "Web Developer",
    category: "Technology",
    description: "Pages people can open, forms that save, and a site you can show.",
    salaryMin: 65000,
    salaryMax: 130000,
    difficulty: "Intermediate",
    years: "6–18 months",
    demand: "High",
    styles: ["Remote", "Office"],
    education: "High School",
    income: "$60–90k",
    skills: ["HTML", "CSS", "JavaScript"],
    stages: stages("web-developer", [
      ["HTML, CSS, and JavaScript", "School", 4],
      ["One deployed site", "Experience", 2],
      ["A framework, used on a second site", "School", 3],
      ["Junior web seat", "Role", 6],
    ]),
  },
  {
    id: "nurse",
    name: "Registered Nurse",
    category: "Healthcare",
    description: "The bedside, the chart, and the license that lets you give the medicine.",
    salaryMin: 70000,
    salaryMax: 110000,
    difficulty: "Intermediate",
    years: "2–4 years",
    demand: "High",
    styles: ["People", "Hands-on"],
    education: "Associate",
    income: "$60–90k",
    skills: ["Anatomy", "Pharmacology", "Documentation"],
    stages: stages("nurse", [
      ["Prerequisites", "School", 12],
      ["ADN or BSN", "School", 24],
      ["NCLEX-RN", "Exam", 3],
      ["State license", "License", 2],
      ["First nursing seat", "Role", 6],
    ]),
  },
  {
    id: "medical-assistant",
    name: "Medical Assistant",
    category: "Healthcare",
    description: "Vitals, the room, and the chart ready before the clinician walks in.",
    salaryMin: 35000,
    salaryMax: 50000,
    difficulty: "Foundational",
    years: "9–18 months",
    demand: "High",
    styles: ["People", "Hands-on"],
    education: "High School",
    income: "$40–60k",
    skills: ["Vitals", "Records", "Patient communication"],
    stages: stages("medical-assistant", [
      ["Certificate or diploma program", "School", 9],
      ["Clinical hours", "Experience", 3],
      ["CMA or RMA, if the clinic asks", "Certification", 3],
      ["Clinic seat", "Role", 3],
    ]),
  },
  {
    id: "dental-hygienist",
    name: "Dental Hygienist",
    category: "Healthcare",
    description: "Cleanings, x-rays, and the talk that keeps the patient coming back.",
    salaryMin: 75000,
    salaryMax: 100000,
    difficulty: "Intermediate",
    years: "2–3 years",
    demand: "High",
    styles: ["People", "Hands-on"],
    education: "Associate",
    income: "$60–90k",
    skills: ["Oral health", "Radiography", "Patient counseling"],
    stages: stages("dental-hygienist", [
      ["Associate in dental hygiene", "School", 24],
      ["National board and clinical exam", "Exam", 4],
      ["State license", "License", 2],
      ["Hygiene seat", "Role", 3],
    ]),
  },
  {
    id: "plumber",
    name: "Plumber",
    category: "Skilled Trades",
    description: "Water in, waste out, and a leak that stays fixed.",
    salaryMin: 50000,
    salaryMax: 100000,
    difficulty: "Intermediate",
    years: "4–5 years",
    demand: "High",
    styles: ["Hands-on"],
    education: "High School",
    income: "$60–90k",
    skills: ["Pipe", "Code", "Troubleshooting"],
    stages: stages("plumber", [
      ["High school diploma", "School", 0],
      ["Apprenticeship", "Experience", 48],
      ["Journeyman license", "License", 6],
      ["Master plumber", "License", 24],
    ]),
  },
  {
    id: "hvac",
    name: "HVAC Technician",
    category: "Skilled Trades",
    description: "Heat, cold, and the refrigerant that has to stay in the system.",
    salaryMin: 45000,
    salaryMax: 90000,
    difficulty: "Intermediate",
    years: "2–4 years",
    demand: "High",
    styles: ["Hands-on"],
    education: "High School",
    income: "$40–60k",
    skills: ["Electrical systems", "Refrigeration", "Safety"],
    stages: stages("hvac", [
      ["Trade program or EPA 608", "Certification", 6],
      ["Apprenticeship or helper seat", "Experience", 18],
      ["Service technician", "Role", 12],
      ["NATE, if the shop asks", "Certification", 6],
    ]),
  },
  {
    id: "welder",
    name: "Welder",
    category: "Skilled Trades",
    description: "A joint that holds. The test coupon is the proof.",
    salaryMin: 40000,
    salaryMax: 80000,
    difficulty: "Foundational",
    years: "6–24 months",
    demand: "Steady",
    styles: ["Hands-on"],
    education: "High School",
    income: "$40–60k",
    skills: ["MIG", "TIG", "Blueprint reading"],
    stages: stages("welder", [
      ["Shop safety and a first process", "School", 3],
      ["A welding certificate", "Certification", 6],
      ["AWS or shop qualification test", "Exam", 2],
      ["Production or construction seat", "Role", 6],
    ]),
  },
  {
    id: "accountant",
    name: "Accountant",
    category: "Business",
    description: "The books that close, the tax that is filed, and a number you can defend.",
    salaryMin: 60000,
    salaryMax: 110000,
    difficulty: "Intermediate",
    years: "4–6 years",
    demand: "Steady",
    styles: ["Office", "Remote", "Research"],
    education: "Bachelor's",
    income: "$60–90k",
    skills: ["Accounting", "Spreadsheets", "Tax"],
    stages: stages("accountant", [
      ["Bachelor's in accounting", "School", 48],
      ["Staff accountant seat", "Role", 12],
      ["CPA exam, if you want the license", "Exam", 12],
      ["State CPA license", "License", 6],
    ]),
  },
  {
    id: "bookkeeper",
    name: "Bookkeeper",
    category: "Business",
    description: "Invoices, bills, and a ledger the owner can read on Friday.",
    salaryMin: 40000,
    salaryMax: 65000,
    difficulty: "Foundational",
    years: "6–18 months",
    demand: "Steady",
    styles: ["Office", "Remote"],
    education: "High School",
    income: "$40–60k",
    skills: ["Spreadsheets", "QuickBooks", "Reconciliation"],
    stages: stages("bookkeeper", [
      ["Bookkeeping course", "School", 4],
      ["A practice set that balances", "Experience", 2],
      ["Bookkeeper seat or a first client", "Role", 6],
    ]),
  },
  {
    id: "project-manager",
    name: "Project Manager",
    category: "Business",
    description: "Scope, a date, and the list of who owns the next task.",
    salaryMin: 75000,
    salaryMax: 130000,
    difficulty: "Intermediate",
    years: "2–5 years",
    demand: "Steady",
    styles: ["People", "Office", "Leadership"],
    education: "Bachelor's",
    income: "$90–120k",
    skills: ["Planning", "Stakeholders", "Risk"],
    stages: stages("project-manager", [
      ["Lead a small project at work or school", "Experience", 6],
      ["CAPM or a PMP prep course", "Certification", 4],
      ["PMP, after the hours", "Certification", 6],
      ["Project manager seat", "Role", 12],
    ]),
  },
  {
    id: "civil-engineer",
    name: "Civil Engineer",
    category: "Engineering",
    description: "Roads, water, and a drawing that can be built and inspected.",
    salaryMin: 70000,
    salaryMax: 120000,
    difficulty: "Advanced",
    years: "4–6 years",
    demand: "Steady",
    styles: ["Office", "Hands-on", "Research"],
    education: "Bachelor's",
    income: "$90–120k",
    skills: ["CAD", "Statics", "Codes"],
    stages: stages("civil-engineer", [
      ["Bachelor's in civil engineering", "School", 48],
      ["FE exam", "Exam", 4],
      ["Engineer-in-training seat", "Role", 12],
      ["PE license, after the experience", "License", 12],
    ]),
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    category: "Arts & Design",
    description: "Type, color, and a piece someone can post or print.",
    salaryMin: 45000,
    salaryMax: 85000,
    difficulty: "Foundational",
    years: "1–3 years",
    demand: "Steady",
    styles: ["Remote", "Office", "Research"],
    education: "Associate",
    income: "$40–60k",
    skills: ["Typography", "Layout", "Figma"],
    stages: stages("graphic-designer", [
      ["Design basics", "School", 6],
      ["A public portfolio of six pieces", "Experience", 6],
      ["Junior designer seat", "Role", 6],
    ]),
  },
  {
    id: "ux-designer",
    name: "UX Designer",
    category: "Arts & Design",
    description: "Watch someone use the screen, then change the screen.",
    salaryMin: 70000,
    salaryMax: 130000,
    difficulty: "Intermediate",
    years: "1–2 years",
    demand: "Steady",
    styles: ["Remote", "Research", "People"],
    education: "Associate",
    income: "$60–90k",
    skills: ["Research", "Figma", "Prototypes"],
    stages: stages("ux-designer", [
      ["One product study with real notes", "Experience", 3],
      ["Three case studies", "Experience", 6],
      ["A shipped interface", "Role", 6],
    ]),
  },
  {
    id: "teacher",
    name: "Teacher",
    category: "Public Service",
    description: "A room, a lesson, and the license the state asks for.",
    salaryMin: 45000,
    salaryMax: 80000,
    difficulty: "Intermediate",
    years: "4–5 years",
    demand: "High",
    styles: ["People", "Leadership"],
    education: "Bachelor's",
    income: "$40–60k",
    skills: ["Lesson planning", "Classroom", "Subject knowledge"],
    stages: stages("teacher", [
      ["Bachelor's, including student teaching", "School", 48],
      ["State content and teaching exams", "Exam", 4],
      ["Initial teaching license", "License", 3],
      ["First classroom", "Role", 9],
    ]),
  },
  {
    id: "firefighter",
    name: "Firefighter",
    category: "Public Service",
    description: "The call, the gear, and the EMT card most departments want first.",
    salaryMin: 45000,
    salaryMax: 90000,
    difficulty: "Intermediate",
    years: "1–3 years",
    demand: "Steady",
    styles: ["Hands-on", "People"],
    education: "High School",
    income: "$40–60k",
    skills: ["Fitness", "EMT", "Teamwork"],
    stages: stages("firefighter", [
      ["EMT", "Certification", 6],
      ["Civil-service or department exam", "Exam", 3],
      ["Fire academy", "School", 6],
      ["Probationary firefighter", "Role", 12],
    ]),
  },
];

export type CareerProfile = {
  interests: Interest[];
  styles: WorkStyle[];
  education: Education | "";
  income: Income | "";
  careerId: string;
  done: string[];
  background: string;
};

export const EMPTY_PROFILE: CareerProfile = {
  interests: [],
  styles: [],
  education: "",
  income: "",
  careerId: "",
  done: [],
  background: "",
};

export function money(n: number) {
  return `$${Math.round(n / 1000)}k`;
}

export function recommend(profile: CareerProfile) {
  return CAREERS.map((career) => {
    let score = 0;
    if (profile.interests.includes(career.category)) score += 5;
    if (profile.styles.some((style) => career.styles.includes(style))) score += 3;
    if (profile.education && EDU_RANK[profile.education] + 1 >= EDU_RANK[career.education]) score += 2;
    if (profile.income && Math.abs(INCOME_RANK[profile.income] - INCOME_RANK[career.income]) <= 1) score += 2;
    return { career, score };
  })
    .sort((a, b) => b.score - a.score || a.career.name.localeCompare(b.career.name))
    .slice(0, 4);
}

export function careerById(id: string) {
  return CAREERS.find((career) => career.id === id) ?? null;
}

export function gapFor(career: Career, done: string[], background: string) {
  const have = career.stages.filter((stage) => done.includes(stage.id));
  const missing = career.stages.filter((stage) => !done.includes(stage.id));
  const text = background.toLowerCase();
  const noted = career.skills.filter((skill) => text.includes(skill.toLowerCase()));
  const missingSkills = career.skills.filter((skill) => !noted.includes(skill));
  const months = missing.reduce((sum, stage) => sum + stage.months, 0);
  return {
    have,
    missing,
    noted,
    missingSkills: missingSkills.filter((skill) => !noted.includes(skill)),
    percent: career.stages.length ? Math.round((have.length / career.stages.length) * 100) : 0,
    months,
  };
}

export function advise(question: string, career: Career | null, done: string[]) {
  const q = question.toLowerCase();
  if (!q.trim()) return "Ask about a career, a certificate, or whether a change is still open to you.";
  if ((/cyber|security/.test(q) && /retail|38|age|older|career change|transition/.test(q)) || /become a cybersecurity/.test(q)) {
    return "Yes. Retail still counts: you already handle people, shifts, and a system that cannot go down. Months 1–3: CompTIA A+. Months 4–6: Network+. Months 7–10: Security+. Months 11–18: a SOC analyst seat. A first cybersecurity job is often 12–18 months if you study on a schedule.";
  }
  if (/doctor|physician|medicine/.test(q)) {
    return "Physician is a long door, not a closed one. Diploma, a bachelor's in biology or chemistry, the MCAT, medical school, residency, then the license. Plan on 10–14 years from a cold start.";
  }
  if (/carpenter|mechanic|electrician|trade/.test(q)) {
    return "The trades hire the hours. Diploma, then an apprenticeship or ASE, then the license. Most of these seats are 2–5 years, and you are paid during the apprenticeship.";
  }
  if (!career) return "Pick a career on Discover first. Then I can name the next unfinished step.";
  const next = career.stages.find((stage) => !done.includes(stage.id));
  if (!next) return `${career.name} is checked off on this map. The next move is a real seat, not another badge.`;
  return `${career.name}. You are ${career.difficulty.toLowerCase()}, and the map runs ${career.years}. Next: ${next.title} (${next.type}, about ${next.months || "a few"} months). Pay for this path runs ${money(career.salaryMin)}–${money(career.salaryMax)}.`;
}

export type TreeNode = { name: string; children?: TreeNode[] };

export const CAREER_TREES: TreeNode[] = [
  {
    name: "IT",
    children: [
      { name: "Help Desk" },
      { name: "System admin" },
      { name: "Network engineer" },
      { name: "Web developer" },
      { name: "Data analyst" },
      { name: "Cloud engineer" },
      {
        name: "Cybersecurity",
        children: [
          { name: "SOC analyst" },
          { name: "Incident responder" },
          { name: "Pen tester" },
          { name: "Cloud security" },
          { name: "CISSP architect" },
        ],
      },
    ],
  },
  {
    name: "Health",
    children: [
      { name: "Medical assistant" },
      { name: "Nurse" },
      { name: "Dental hygienist" },
      { name: "Pharmacist" },
      { name: "Physician" },
    ],
  },
  {
    name: "Trades",
    children: [
      { name: "Electrician" },
      { name: "Plumber" },
      { name: "HVAC technician" },
      { name: "Welder" },
      { name: "Carpenter" },
      { name: "Automotive technician" },
      { name: "Mechanical technician" },
    ],
  },
  {
    name: "Business",
    children: [{ name: "Bookkeeper" }, { name: "Accountant" }, { name: "Project manager" }],
  },
  {
    name: "Design",
    children: [{ name: "Graphic designer" }, { name: "UX designer" }],
  },
  {
    name: "Public service",
    children: [{ name: "Teacher" }, { name: "Firefighter" }, { name: "Civil engineer" }],
  },
];
