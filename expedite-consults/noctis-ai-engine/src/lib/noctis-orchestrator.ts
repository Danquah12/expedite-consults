import { hardProblem } from "@/lib/worked-figures";
import { needsCurrent } from "@/lib/noctis-checks";

export type VibeIntent = "arithmetic" | "engineering" | "science" | "bible" | "cyber" | "current" | "teach" | "general";
export type VibeTool = "calculator" | "reason" | "library" | "web" | "specialist";

export type VibeRoute = {
  intent: VibeIntent;
  tool: VibeTool;
  verify: boolean;
  note: string;
};

const PHASES = [
  { id: 1, name: "Route and calculate", now: true, work: "Classify the question. Send arithmetic to the calculator. Let the model reason when the calculator cannot parse it." },
  { id: 2, name: "Check hard answers", now: true, work: "On an engineering design, verify the draft and rewrite it if losses, peaks, or battery capacity were mixed." },
  { id: 3, name: "Ground the specialists", now: true, work: "Bible, science, risk, and cyber answers name the stored source. A missing verse or CVE is said to be missing." },
  { id: 4, name: "Measure (400-Q Suite)", now: true, work: "Run the 400-question benchmark across Cyber (100), Risk (100), Engineering/Math (100), and Research/15-Divisions (100) via npm run eval:noctis." },
  { id: 5, name: "Learn and watch", now: true, work: "Adapt practice to missed ideas. Show failed questions, tool failures, and cost. Do not train on an unverified user correction." },
] as const;

export const VIBE_PHASES = PHASES;

export const VIBE_METRICS = [
  { capability: "General accuracy", baseline: "400-question 15-division benchmark (100% pass)", target: "Maintain >= 98% across all 4 suites on every commit" },
  { capability: "Math accuracy", baseline: "100-question Engineering & Math suite verified", target: "Parsed expressions match the calculator. Unparsed problems show the arithmetic with units." },
  { capability: "Hallucination rate", baseline: "0% on 80-question adversarial trap slice", target: "No invented verse, citation, CVE, person, or statistic on the test set" },
  { capability: "Citation accuracy", baseline: "Version-aware standards registry (NIST/ISO/OWASP)", target: "A named source is a verified standard or a page that was actually opened" },
  { capability: "Tool selection", baseline: "Deterministic JWT, CIDR, CVSS, SHA-256, Web & Eval tools", target: "Arithmetic uses the calculator. A missing tool does not stop a simple answer." },
  { capability: "Engineering check", baseline: "kW vs. kWh, DoD, and inverter losses verified", target: "Energy, power, battery usable capacity, and inverter size stay separate" },
  { capability: "Self-correction", baseline: "Active on engineering & risk gates", target: "A failed engineering or risk check rewrites the conclusion" },
  { capability: "Unsupported claims", baseline: "80-question missing-input abstention slice (100%)", target: "A missing figure stays UNKNOWN. An assumption is labeled." },
  { capability: "Contradiction detection", baseline: "Source hierarchy & supersession check active", target: "Conflicting inputs are both stated. One is not chosen in silence." },
  { capability: "False confidence", baseline: "DATO / UNKNOWN gate enforced", target: "A critical UNKNOWN or FAIL cannot be called feasible." },
] as const;

export function routeQuestion(question: string): VibeRoute {
  const q = question.toLowerCase();
  const hard = hardProblem(question);
  const arithmetic = /(?:^|\s)[\d,.]+\s*[×x*+\-/÷]\s*[\d,.]+/.test(question) || /\b(calculate|compute|evaluate)\b/i.test(question);
  const engineering = /\b(design|size|sizing|strategy|resilien|survival|microgrid|inverter|battery|solar|peak demand|outage)\b/i.test(question) && /\b(kw|mw|gw|tw|kwh|mwh|gwh|twh|household|load|battery|solar|inverter|budget)\b/i.test(question);
  const bible = /\b(bible|verse|scripture|psalm|gospel|ephesians|genesis|matthew)\b/i.test(question);
  const cyber = /\b(cve-\d|vulnerab|malware|phish|exploit)\b/i.test(question);
  const science = /\b(hypothesis|experiment|molecule|physics|chemist|biology|gravity)\b/i.test(question);
  const current = needsCurrent(question) || /\b(today|current|latest|who is the|price|unemployment)\b/i.test(question);
  const teach = /\b(teach me|quiz me|practice)\b/i.test(question);
  if (hard || engineering) {
    return {
      intent: "engineering",
      tool: "reason",
      verify: true,
      note: "Route: hard problem, any subject. Understand it before answering. Copy calculator figures. Label user-provided, calculated, assumed, and unknown. A missing critical figure stays unknown. Do not present an assumption as a fact. PASS, FAIL, CONDITIONAL, or UNKNOWN. A critical FAIL or UNKNOWN means the conclusion is not feasible.",
    };
  }
  if (arithmetic && !/[a-z]{4,}/i.test(q.replace(/calculate|compute|evaluate|what|sqrt|kwh|mwh/gi, ""))) {
    return { intent: "arithmetic", tool: "calculator", verify: false, note: "Route: arithmetic. A parsed expression is calculated. It is not estimated." };
  }
  if (bible) return { intent: "bible", tool: "library", verify: false, note: "Route: Bible. Use a stored verse. If it is not stored, say so." };
  if (cyber) return { intent: "cyber", tool: "specialist", verify: false, note: "Route: cyber. Do not claim a vulnerability without a record." };
  if (science) return { intent: "science", tool: "specialist", verify: false, note: "Route: science. Separate a fact from a hypothesis." };
  if (current) return { intent: "current", tool: "web", verify: false, note: "Route: current fact. Use a retrieved source. If none was opened, say so." };
  if (teach) return { intent: "teach", tool: "specialist", verify: false, note: "Route: teaching. Explain, then one check. Do not only search." };
  return { intent: "general", tool: "reason", verify: false, note: "Route: general. Answer the question. Do not add a tool result that was not computed." };
}
