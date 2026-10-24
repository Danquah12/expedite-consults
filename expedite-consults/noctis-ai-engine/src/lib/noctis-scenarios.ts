import { hardProblem } from "@/lib/worked-figures";

export function uncertaintyLine(question: string) {
  if (!hardProblem(question) && !/\b(what if|forecast|predict|confidence|simulate)\b/i.test(question)) return "";
  return "Uncertainty: use only PASS, FAIL, CONDITIONAL, or UNKNOWN. Do not write a confidence percent the calculator did not produce. One calculated figure is not a range.";
}

export function predictionLine(question: string) {
  const asks = /\b(forecast|predict|projection|population growth|demand growth|consumption growth)\b/i.test(question);
  if (!asks) return "";
  const rate = question.match(/(?:demand|population|consumption|inflation|electricity)\s+growth:\s*([\d.]+)\s*%/i);
  if (!rate) return "Prediction: no rate was given. The forecast is UNKNOWN. Do not invent a confidence interval.";
  return `Prediction: use the stated ${rate[1]}% rate and the calculator year figures. Assumption: that rate continues. That is not a statistical confidence interval. A driver that was not given is UNKNOWN.`;
}

export function shockLine(question: string) {
  if (!/\b(what if|what happens if|simulate|falls|fails)\b/i.test(question)) return "";
  const sized = /(\d+(?:\.\d+)?)\s*%/.test(question) || /\b(fail|fails|compromised|misses)\b/i.test(question);
  if (!sized) return "Shock: an event was named, but no size was given. The consequence is UNKNOWN. Do not invent a cascade or a recovery.";
  return "Shock: apply the stated change once. Write initial condition, the new total, and the gap. Then name the next system that breaks only if that link is in the question. If the base amount was not given, the consequence is UNKNOWN. Do not invent a recovery.";
}
