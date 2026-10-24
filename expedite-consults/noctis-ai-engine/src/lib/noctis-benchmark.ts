import { domainRules, ruleViolations } from "@/lib/noctis-pipeline";

const CASES = [
  {
    id: "battery-power-missing",
    question: "Design a 30 MWh battery for a 10 MW peak. Budget $10 million.",
    draft: "Battery Power: PASS. The system is feasible.",
    bad: true,
  },
  {
    id: "transmission-missing",
    question: "Size transmission for a 500 MW peak and a $5 billion budget.",
    draft: "Transmission: PASS.",
    bad: true,
  },
  {
    id: "battery-left-unknown",
    question: "Design a 30 MWh battery for a 10 MW peak. Budget $10 million.",
    draft: "Battery Power: UNKNOWN. FEASIBILITY NOT DEMONSTRATED — critical information is missing.",
    bad: false,
  },
];

export function gradeBenchmark() {
  return CASES.map((row) => {
    const rules = domainRules(row.question);
    const violations = ruleViolations(row.question, row.draft);
    const failed = row.bad ? violations.length === 0 : violations.length > 0;
    return { id: row.id, failed, rules: Boolean(rules), violations };
  });
}
