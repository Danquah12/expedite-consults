import { CAREERS } from "@/lib/career-nav";

const CAREER_RULES: [RegExp, string][] = [
  [/cyber|security|soc|nist|mitre|malware/i, "cyber-analyst"],
  [/network|cisco|routing/i, "network-engineer"],
  [/architect/i, "cyber-architect"],
  [/software|programming|\bcode\b/i, "software-engineer"],
  [/physician|doctor|patient/i, "physician"],
  [/pharmac/i, "pharmacist"],
  [/electric/i, "electrician"],
  [/carpent/i, "carpenter"],
  [/mechanic|automotive/i, "mechanic"],
];

const PATH_RULES: [RegExp, string][] = [
  [/cyber|security|nist|mitre|linux|malware/i, "Cybersecurity"],
  [/cloud|aws|azure|kubernetes/i, "Cloud"],
  [/math|calculus|algebra/i, "Mathematics"],
  [/\bdata\b|\bsql\b|analytics/i, "Data"],
  [/medic|nurs|patient|health/i, "Care"],
  [/trade|electric|carpent/i, "Trades"],
  [/career|resume|interview/i, "Careers"],
  [/business|ledger|\bprice\b/i, "Business"],
];

const CERT_RULES: [RegExp, string][] = [
  [/security\+|comptia|cia triad|\bcyber\b|malware/i, "Security+"],
  [/\bnclex\b|nursing/i, "NCLEX"],
  [/\baws\b/i, "AWS Cloud Practitioner"],
  [/azure|az-900/i, "AZ-900"],
  [/google cloud|\bgcp\b/i, "Google Cloud"],
  [/\bccna\b|\bcisco\b/i, "CCNA"],
  [/cissp/i, "CISSP"],
  [/\bcisa\b/i, "CISA"],
  [/\bpmp\b/i, "PMP"],
  [/\bcka\b|kubernetes/i, "CKA"],
];

export type KnowledgeAsset = {
  assetId: string;
  title: string;
  source: string;
  creator: string;
  category: string;
  path: string[];
  careerTags: string[];
  certificationTags: string[];
  knowledgeTags: string[];
  transcript: "";
  summary: string;
  confidenceScore: number | null;
  whyItMatters: string;
  vibeInsight: string;
  dnaImpact: Record<string, number>;
};

function names(text: string, rules: [RegExp, string][]) {
  return [...new Set(rules.filter(([test]) => test.test(text)).map(([, id]) => id))];
}

function dnaFor(text: string) {
  const rows: string[] = [];
  if (/cyber|security|malware|nist|mitre/i.test(text)) rows.push("Cybersecurity");
  if (/cloud|kubernetes|aws|azure/i.test(text)) rows.push("Cloud computing");
  if (/math|calculus|equation|algebra/i.test(text)) rows.push("Mathematics");
  if (/health|medic|patient|nurs/i.test(text)) rows.push("Health");
  if (/engineer|circuit|control/i.test(text)) rows.push("Engineering");
  return rows;
}

export function knowledgeAsset(input: {
  id: string;
  title: string;
  source?: string;
  creator?: string;
  category?: string;
  summary?: string;
  insight?: string;
  why?: string;
  confidence?: number | null;
}): KnowledgeAsset {
  const text = [input.title, input.category, input.summary, input.insight, input.why].filter(Boolean).join(" ");
  const careers = names(text, CAREER_RULES)
    .map((id) => CAREERS.find((row) => row.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const tags = dnaFor(text);
  return {
    assetId: input.id,
    title: input.title,
    source: input.source || "",
    creator: input.creator || "",
    category: input.category || "",
    path: names(text, PATH_RULES),
    careerTags: careers,
    certificationTags: names(text, CERT_RULES),
    knowledgeTags: tags,
    transcript: "",
    summary: input.summary || "",
    confidenceScore: input.confidence ?? null,
    whyItMatters: input.why || "",
    vibeInsight: input.insight || "",
    dnaImpact: Object.fromEntries(tags.map((name) => [name, 1])),
  };
}

export function evidenceLevel(score: number | null) {
  if (score == null) return "Not scored";
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "Strong";
  return "Highly supported";
}

export function sourceTier(name: string) {
  const text = name.toLowerCase();
  if (/nist|nasa|\bnih\b|\bcdc\b|cern|noaa|crossref|nature/.test(text)) return "Government or journal · 90–100";
  if (/\bmit\b|harvard|oxford|yale|johns hopkins|university/.test(text)) return "University · 75–89";
  if (/wikipedia/.test(text)) return "General · 40–59";
  if (!name.trim()) return "";
  return "Named source · not tiered";
}

export function knowledgePrompt(asset: KnowledgeAsset) {
  return [
    `Title: ${asset.title}`,
    `Source: ${asset.source || "not stored"}`,
    `Summary: ${asset.summary || "not stored"}`,
    `Insight: ${asset.vibeInsight || "not stored"}`,
    `Why it matters: ${asset.whyItMatters || "not stored"}`,
    `Careers: ${asset.careerTags.join(", ") || "none"}`,
    `Paths: ${asset.path.join(", ") || "none"}`,
    `Certifications: ${asset.certificationTags.join(", ") || "none"}`,
    `DNA: ${Object.keys(asset.dnaImpact).join(", ") || "none"}`,
    "Transcript: not stored.",
    "Use only these facts. Do not invent a source, a salary, or a certification.",
  ].join("\n");
}
