export function decisionLine(question: string) {
  if (!/\b(should I|should we|which (?:architecture|option|one)|choose between|option [abc])\b/i.test(question)) return "";
  return "Decision: state the objective, the options, the constraints, and the trade-off. Recommend one only if it passes every stated constraint. Say the assumption it depends on and what would change the recommendation. Do not invent a cost or a benefit.";
}

export function optimizeLine(question: string) {
  if (!/\b(optimi[sz]e|minimize|maximize)\b/i.test(question)) return "";
  return "Optimization: name the objective and each constraint. An option that breaks a constraint is FAIL. Do not call an option optimal unless every option was calculated against the same constraints. If the data needed to optimize is missing, the optimum is UNKNOWN.";
}

export function causalLine(question: string) {
  if (!/\b(cause|caused|because of|leads to|due to|effect of)\b/i.test(question)) return "";
  return "Cause: correlation is not causation. A cause needs a mechanism written in the question or in a page opened for this answer. If that mechanism is missing, the cause is UNKNOWN. Name one other explanation that fits the same facts.";
}

export function askLine(question: string) {
  if (!/\b(should I|should we|deploy|choose|which architecture)\b/i.test(question)) return "";
  if (/\b(hospital|deploy this|power plant)\b/i.test(question) && !/\b(ghana|nigeria|united states|united kingdom|europe|africa|country)\b/i.test(question)) {
    return "Ask before recommending, because it changes the answer: What country is this for? Do not guess it.";
  }
  if (!/\$\s*\d/.test(question) && !/\bbudget\b/i.test(question) && /\b(choose|deploy|build|architecture)\b/i.test(question)) {
    return "Ask before recommending, because it changes the answer: What is the budget? Do not guess a cost.";
  }
  return "";
}

export function consistencyLine(question: string, earlier: string) {
  const past = earlier.match(/budget[^$\n]{0,48}\$\s*([\d.]+)\s*(billion|million)?/i);
  const now = question.match(/budget[^$\n]{0,48}\$\s*([\d.]+)\s*(billion|million)?/i);
  if (!past || !now) return "";
  const left = `${past[1]} ${past[2] || ""}`.trim();
  const right = `${now[1]} ${now[2] || ""}`.trim();
  if (left === right) return "";
  return `Conflict: the budget was $${left} earlier and is $${right} now. State both. Do not replace the first in silence.`;
}

export function stakesLine(question: string) {
  if (!/\b(hospital|diagnos|medication|dose|lawsuit|legal advice|invest|financial advice|deploy this|treatment plan)\b/i.test(question)) return "";
  return "High stakes. Do not tell the person to deploy, buy, treat, or file. Say what is known, what is UNKNOWN, and that a qualified person has to decide. This is not medical, legal, financial, or engineering sign-off.";
}
