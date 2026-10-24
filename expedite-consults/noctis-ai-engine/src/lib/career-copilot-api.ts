import { createServerFn } from "@tanstack/react-start";
import { advise, careerById, CAREERS, type Career } from "@/lib/career-nav";

export type ScanHit = { title: string; href: string; note: string };

export type CareerScan = {
  verdict: string;
  steps: string[];
  time: string;
  pay: string;
  hits: ScanHit[];
  google: string;
};

const OFFICIAL: Record<string, ScanHit> = {
  "cyber-analyst": {
    title: "BLS · Information security analysts",
    href: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
    note: "Pay, entry education, and the outlook.",
  },
  "network-engineer": {
    title: "BLS · Network and computer systems",
    href: "https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm",
    note: "The seat this path grows into.",
  },
  "cyber-architect": {
    title: "ISC2 · CISSP",
    href: "https://www.isc2.org/certifications/cissp",
    note: "The exam the architect path is built around.",
  },
  "software-engineer": {
    title: "BLS · Software developers",
    href: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
    note: "What the job actually is.",
  },
  physician: {
    title: "BLS · Physicians and surgeons",
    href: "https://www.bls.gov/ooh/healthcare/physicians-and-surgeons.htm",
    note: "School, license, and the long timeline.",
  },
  pharmacist: {
    title: "BLS · Pharmacists",
    href: "https://www.bls.gov/ooh/healthcare/pharmacists.htm",
    note: "The PharmD and the license.",
  },
  electrician: {
    title: "BLS · Electricians",
    href: "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm",
    note: "Apprenticeship, then the license.",
  },
  carpenter: {
    title: "BLS · Carpenters",
    href: "https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm",
    note: "Hours on the job, not only a classroom.",
  },
  mechanic: {
    title: "BLS · Automotive service technicians",
    href: "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm",
    note: "ASE and the shop path.",
  },
  "mechanical-tech": {
    title: "BLS · Mechanical engineering technologists",
    href: "https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineering-technologists-and-technicians.htm",
    note: "The associate degree and the plant seat.",
  },
};

function inferCareer(question: string, selected: Career | null) {
  const q = question.toLowerCase();
  const rules: [RegExp, string][] = [
    [/physician|surgeon|\bdoctor\b|mcat|medical school/, "physician"],
    [/pharmacist|pharmd|naplex/, "pharmacist"],
    [/electrician/, "electrician"],
    [/carpenter/, "carpenter"],
    [/mechanic|automotive|\base\b/, "mechanic"],
    [/cissp|security architect|cybersecurity architect/, "cyber-architect"],
    [/network engineer|ccna|ccnp/, "network-engineer"],
    [/software|programmer|developer/, "software-engineer"],
    [/mechanical tech/, "mechanical-tech"],
    [/cyber|security|soc|comptia/, "cyber-analyst"],
  ];
  for (const [test, id] of rules) {
    if (test.test(q)) return careerById(id) ?? selected;
  }
  return selected;
}

function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/"/g, '"')
    .replace(/&#039;|'/g, "'")
    .replace(/&/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function wikiHits(query: string): Promise<ScanHit[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`;
  const res = await fetch(url, {
    headers: { "User-Agent": "NoctisCareer/1.0 (https://www.expediteconsults.com/; career-navigator)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { search?: { title: string; snippet: string }[] } };
  return (data.query?.search ?? []).map((row) => ({
    title: row.title,
    href: `https://en.wikipedia.org/wiki/${encodeURIComponent(row.title.replace(/ /g, "_"))}`,
    note: plain(row.snippet).slice(0, 220),
  }));
}

export const scanCareer = createServerFn({ method: "POST" })
  .validator((input: { question: string; careerId: string; background: string; done: string[] }) => ({
    question: String(input?.question ?? "").slice(0, 500),
    careerId: String(input?.careerId ?? "").slice(0, 80),
    background: String(input?.background ?? "").slice(0, 400),
    done: Array.isArray(input?.done) ? input.done.map((id) => String(id)).slice(0, 40) : [],
  }))
  .handler(async ({ data }): Promise<CareerScan> => {
    const selected = careerById(data.careerId);
    const career = inferCareer(data.question, selected) ?? CAREERS[0]!;
    const query = data.question.trim() || `how to become a ${career.name}`;
    const google = `https://www.google.com/search?q=${encodeURIComponent(`${query} career path steps`)}`;
    let hits: ScanHit[] = [];
    try {
      hits = await wikiHits(`${query} career path`);
    } catch {
      hits = [];
    }
    const official = OFFICIAL[career.id];
    if (official) hits = [official, ...hits.filter((hit) => hit.href !== official.href)].slice(0, 4);
    const done = new Set(data.done);
    const steps = career.stages.map((stage, index) => {
      const mark = done.has(stage.id) ? "Done" : "Next";
      const months = stage.months ? `, about ${stage.months} months` : "";
      return `${index + 1}. ${stage.title} — ${stage.type}${months}. ${mark}.`;
    });
    const left = career.stages.filter((stage) => !done.has(stage.id));
    const months = left.reduce((sum, stage) => sum + stage.months, 0);
    const background = data.background.trim();
    const verdict = [
      advise(query, career, data.done),
      background ? `On the record you wrote: ${background}.` : "",
      hits[1]?.note ? `A public page puts it this way: ${hits[1].note}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return {
      verdict,
      steps,
      time: left.length ? `${career.years}. About ${months} months left on the unchecked steps.` : career.years,
      pay: `$${Math.round(career.salaryMin / 1000)}k–$${Math.round(career.salaryMax / 1000)}k`,
      hits,
      google,
    };
  });
