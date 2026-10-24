import { formatMap, walkGraph } from "@/lib/knowledge-graph";
import { routeQuestion, type VibeRoute } from "@/lib/noctis-orchestrator";
import { resourcePlan, workedFigures } from "@/lib/worked-figures";

export type PipelineTrace = { stage: "route" | "calculator" | "graph" | "rules"; result: string };

export type PipelinePacket = {
  route: VibeRoute;
  facts: string;
  trace: PipelineTrace[];
};

function money(hit: RegExpMatchArray | null) {
  if (!hit) return 0;
  return Number(hit[1]) * (/b/i.test(hit[2] || "") ? 1_000_000_000 : 1_000_000);
}

export function domainRules(question: string) {
  const lines: string[] = [];
  if (/\bbattery\b/i.test(question) && !/discharge(?:\s+power)?[^.\n]{0,24}\d/i.test(question)) {
    lines.push("Battery Power: UNKNOWN. Discharge MW was not given, so peak feasibility is not established.");
  }
  if (/\btransmission\b/i.test(question) && !/transmission[^.\n]{0,40}\d/i.test(question)) {
    lines.push("Transmission: UNKNOWN. Capacity was not given.");
  }
  if (resourcePlan(question) && !/\bhourly\b/i.test(question)) {
    lines.push("Timing: UNKNOWN. No hourly profile was given. A daily or yearly average is not a peak-power check.");
  }
  if (/\b(isolated|air-gapped)\b/i.test(question) && /\binternet-facing\b/i.test(question)) {
    lines.push("Contradiction: the system is described as both isolated and internet-facing. State both. Do not pick one.");
  }
  const budget = money(question.match(/budget[^$\n]{0,40}\$\s*([\d.]+)\s*(billion|million)/i) || question.match(/\$\s*([\d.]+)\s*(billion|million)/i));
  const cost = money(question.match(/costs?\s*\$\s*([\d.]+)\s*(billion|million)/i));
  if (budget > 0 && cost > budget) lines.push("Contradiction: the stated cost is over the stated budget. That option is FAIL.");
  if (!lines.length) return "";
  return `Domain rules. These were decided in code before the model wrote. Copy them.\n${lines.join("\n")}`;
}

export function runPipeline(question: string): PipelinePacket {
  const route = routeQuestion(question);
  const figures = workedFigures(question);
  const walk = walkGraph(question);
  const map = walk ? formatMap(walk) : "";
  const rules = domainRules(question);
  const trace: PipelineTrace[] = [
    { stage: "route", result: `${route.intent}/${route.tool}${route.verify ? "/verify" : ""}` },
    { stage: "calculator", result: figures ? "computed" : "none" },
    { stage: "graph", result: map ? "matched" : "none" },
    { stage: "rules", result: rules ? "applied" : "none" },
  ];
  const facts = [figures, rules].filter(Boolean).join("\n\n");
  return { route, facts, trace };
}

export function ruleViolations(question: string, draft: string) {
  const rules = domainRules(question);
  const found: string[] = [];
  if (/Battery Power: UNKNOWN/.test(rules) && /battery power:\s*pass/i.test(draft)) {
    found.push("Battery power was marked PASS. Discharge MW was not in the question, so it stays UNKNOWN.");
  }
  if (/Transmission: UNKNOWN/.test(rules) && /transmission:\s*pass/i.test(draft)) {
    found.push("Transmission was marked PASS. Capacity was not in the question, so it stays UNKNOWN.");
  }
  if (/Contradiction: the stated cost is over/.test(rules) && !/\bFAIL\b/.test(draft)) {
    found.push("The stated cost is over the budget. That option must be FAIL.");
  }
  return found;
}
