export const TIL_SLOTS = [
  "science",
  "history",
  "cyber",
  "word",
  "money",
  "tech",
  "think",
  "care",
  "culture",
  "research",
] as const;

export type TilSlot = (typeof TIL_SLOTS)[number];

const POOL: Record<TilSlot, { title: string; line: string }[]> = {
  science: [
    { title: "JWST sees heat, not just light", line: "Infrared lets it look through dust at early galaxies." },
    { title: "CRISPR is a cut, then a choice", line: "The edit is the repair the cell makes after the cut." },
    { title: "mRNA is a message, not a genome", line: "It does not write itself into DNA." },
  ],
  history: [
    { title: "Timbuktu was a university city", line: "Manuscripts there were libraries, not folklore." },
    { title: "The Library of Alexandria was a research hall", line: "Copying texts was the lab." },
    { title: "The Haitian Revolution was the first Black republic", line: "1804. Independence by formerly enslaved people." },
  ],
  cyber: [
    { title: "Least privilege is a default, not a slogan", line: "If the role can do *, it is not a role." },
    { title: "Phishing is an identity problem", line: "The payload is the person clicking, not the attachment." },
    { title: "Logs without time sync are fiction", line: "NTP is an evidence control." },
  ],
  word: [
    { title: "Epistemology", line: "How we know — not what we like." },
    { title: "Zero-day", line: "A flaw with no public fix yet. Not 'very bad Tuesday'." },
    { title: "Fiduciary", line: "Duty to act for someone else's interest first." },
  ],
  money: [
    { title: "Compounding is time as a multiplier", line: "Rate matters. Starting year matters more." },
    { title: "A mortgage is a loan against a house, not a payment app", line: "Principal, interest, taxes, insurance." },
    { title: "An index fund is a slice of a market", line: "Not a stock-picking contest." },
  ],
  tech: [
    { title: "DNS is the phone book of the internet", line: "Names to numbers. Poison the book, steal the call." },
    { title: "A container is a process with a fence", line: "Not a tiny VM." },
    { title: "Git records snapshots, not a folder of feelings", line: "Commit is a checkpoint you can name." },
  ],
  think: [
    { title: "Is vs ought", line: "A fact is not a duty. Name which one you are arguing." },
    { title: "A definition is a tool", line: "If 'understand' is undefined, the AI debate is noise." },
    { title: "Steelman before you dunk", line: "State the strongest version, then disagree." },
  ],
  care: [
    { title: "Hypertension is a quiet risk", line: "Most people feel well while vessels take damage." },
    { title: "Vaccines train memory, not the illness", line: "The point is the rehearsal." },
    { title: "Sepsis is time", line: "Infection + body-wide response. Minutes matter." },
  ],
  culture: [
    { title: "Highlife is Ghanaian popular music with brass and guitar", line: "Not a synonym for Afrobeats." },
    { title: "Jazz is a language of improvisation on form", line: "Standards are the clinic; the solo is the lab." },
    { title: "Adinkra are Akan visual proverbs", line: "Symbols that teach, not decoration." },
  ],
  research: [
    { title: "A p-value is not 'the chance the hypothesis is true'", line: "It is data-as-extreme if the null were true." },
    { title: "Replication is a result, not a vibe", line: "Same question, new data, still holds." },
    { title: "An abstract is a map, not the paper", line: "Methods decide whether you trust the claim." },
  ],
};

export function dayKey(at = Date.now()) {
  return new Date(at).toISOString().slice(0, 10);
}

function n(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Math.abs(h);
}

export function todayLearned(at = Date.now()) {
  const day = dayKey(at);
  return TIL_SLOTS.map((slot) => {
    const pool = POOL[slot];
    const item = pool[n(`${day}:${slot}`) % pool.length];
    return { slot, ...item };
  });
}

export const PATH_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;

export function tilToday(at = Date.now()) {
  const day = Math.floor(at / 86_400_000);
  const slot = TIL_SLOTS[Math.abs(day) % TIL_SLOTS.length]!;
  const pool = POOL[slot];
  const item = pool[Math.abs(day) % pool.length]!;
  return { slot, title: item.title, line: item.line };
}

export const LEARN_PATHS = [
  {
    id: "cyber",
    hall: "cyber",
    title: "Cybersecurity",
    capstone: "Range: investigate, then a stamp.",
    href: "/hub/range",
    levels: {
      Beginner: [
        "Networking fundamentals",
        "Linux",
        "Security fundamentals",
        "Threats",
        "Vulnerabilities",
        "NIST",
        "SIEM",
        "Incident response",
        "Cloud security",
        "Capstone",
      ],
      Intermediate: ["Hunt", "Detection engineering", "Web/API testing", "IAM", "Terraform security"],
      Advanced: ["Cloud IR", "Kubernetes security", "Malware", "Attack paths"],
      Professional: ["RMF / ATO package", "FedRAMP", "Lead a tabletop", "Teach one junior"],
    },
  },
  {
    id: "data",
    hall: "data",
    title: "Data",
    capstone: "Data lab: a table, a question, a number.",
    href: "/openings",
    levels: {
      Beginner: ["Python", "SQL", "Excel", "Stats", "Charts", "A clean table", "A question", "A metric", "A chart that answers it", "Capstone"],
      Intermediate: ["ETL", "Modeling", "Warehouses", "BI"],
      Advanced: ["Spark", "Streaming", "Experiment design"],
      Professional: ["Lead a pipeline review", "Explain a finding to a non-analyst"],
    },
  },
  {
    id: "care",
    hall: "care",
    title: "Care",
    capstone: "Safety first. Then the academy.",
    href: "/study",
    levels: {
      Beginner: ["Anatomy", "Physiology", "Vitals", "Infection control", "Med safety", "Documentation", "Communication", "Ethics", "One system", "Capstone"],
      Intermediate: ["Patho", "Pharm", "Assessment"],
      Advanced: ["Acute care", "Leadership on a ward"],
      Professional: ["Teach a junior", "Quality project"],
    },
  },
  {
    id: "code",
    hall: "code",
    title: "Computer science",
    capstone: "A program you can explain, then a drill.",
    href: "/hub/tracks",
    levels: {
      Beginner: ["Variables", "Control flow", "Functions", "Data structures", "Git", "Testing", "One CLI tool", "Read an error", "Fix it", "Capstone"],
      Intermediate: ["APIs", "Complexity", "Databases", "Concurrency"],
      Advanced: ["Compilers taste", "Distributed systems", "Security in code"],
      Professional: ["Review a junior’s PR", "Own an incident"],
    },
  },
  {
    id: "math",
    hall: "math",
    title: "Mathematics",
    capstone: "Prove it on the board, then a drill.",
    href: "/paths",
    levels: {
      Beginner: ["Algebra", "Functions", "Graphs", "Limits", "Derivatives", "Integrals", "Linear systems", "Probability", "One proof", "Capstone"],
      Intermediate: ["Linear algebra", "Multivariable", "Diff eq"],
      Advanced: ["Real analysis taste", "Statistics for science"],
      Professional: ["Teach one lemma", "Model a real system"],
    },
  },
  {
    id: "cloud",
    hall: "cloud",
    title: "Cloud",
    capstone: "A VPC, a role, a log. Then the range.",
    href: "/hub/range",
    levels: {
      Beginner: ["Regions", "IAM", "VPC", "Compute", "Storage", "Logs", "One diagram", "Least privilege", "A budget alarm", "Capstone"],
      Intermediate: ["Terraform", "Kubernetes", "Observability"],
      Advanced: ["Incident in the cloud", "Network paths"],
      Professional: ["Write the runbook", "Review an architecture"],
    },
  },
  {
    id: "language",
    hall: "language",
    title: "Languages",
    capstone: "Listen → speak → read → write → a conversation.",
    href: "/study",
    levels: {
      Beginner: ["Sounds", "Greetings", "Survival phrases", "Listen daily", "Speak back", "Read a sign", "Write three lines", "A dialogue", "A mistake log", "Capstone"],
      Intermediate: ["Tense", "Register", "A short text"],
      Advanced: ["Unscripted talk", "A news clip"],
      Professional: ["Teach one phrase", "Interpret a meeting"],
    },
  },
  {
    id: "trades",
    hall: "trades",
    title: "Trades",
    capstone: "The job is the lesson. Safety first.",
    href: "/hall",
    levels: {
      Beginner: ["PPE", "Tools by name", "Measure twice", "Lockout/tagout", "A spec sheet", "One joint", "Cleanup", "The ticket", "A photo of the work", "Capstone"],
      Intermediate: ["Code / NEC taste", "Troubleshooting"],
      Advanced: ["Lead a small job", "Estimate"],
      Professional: ["Inspect someone else’s work", "Teach an apprentice"],
    },
  },
  {
    id: "career",
    hall: "career",
    title: "Careers",
    capstone: "STAR story, then a stamp, then the official board.",
    href: "/hub/careers",
    levels: {
      Beginner: ["A target role", "Skills gap", "One project", "Resume clinic", "STAR stories", "A mock interview", "A stamp", "Official board", "Follow up", "Capstone"],
      Intermediate: ["Portfolio", "Network without noise"],
      Advanced: ["Negotiate", "Lead a panel"],
      Professional: ["Hire someone", "Write a rubric"],
    },
  },
  {
    id: "business",
    hall: "business",
    title: "Business",
    capstone: "A price, a customer, a book. Then Openings.",
    href: "/openings",
    levels: {
      Beginner: ["Customer", "Offer", "Price", "Cost", "Cash vs profit", "A one-pager", "A ledger line", "One sale", "A review", "Capstone"],
      Intermediate: ["Unit economics", "Entity / LLC taste", "Tax calendar"],
      Advanced: ["Hiring the first person", "A contract"],
      Professional: ["Board report", "Teach the model"],
    },
  },
] as const;