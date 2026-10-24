import { changeLine } from "./noctis-execute.ts";

export function onlyMath(question: string) {
  const trimmed = question.trim().replace(/[?.!]+$/g, "");
  const spoken = trimmed.replace(/^(what is|what's|calculate|compute|evaluate)\s+/i, "");
  if (!/^[\d\s,.+\-*/×÷x()]+$/.test(spoken)) return "";
  if (!/\d/.test(spoken) || !/[+\-*/×÷x]/.test(spoken)) return "";
  const expr = spoken.replace(/×/g, "*").replace(/÷/g, "/").replace(/x/gi, "*").replace(/,/g, "");
  if (!/^[\d\s.+\-*/()]+$/.test(expr)) return "";
  try {
    const value = Function(`"use strict"; return (${expr})`)() as unknown;
    if (typeof value !== "number" || !Number.isFinite(value)) return "";
    return `${spoken} = ${value}. Calculated. This was not estimated.`;
  } catch {
    return "";
  }
}

export function resourcePlan(question: string) {
  const topic = /\b(energy|power|battery|storage|generator|solar|wind|grid|water|fuel|mwh|gwh|twh|megawatt|gigawatt|\bmw\b|\bgw\b|transmission)\b/i.test(question);
  const job = /\b(feasib|surviv|outage|reliab|backup|reserve|peak|storage|battery|grid|design|siz|enough|adequa)\b/i.test(question);
  return topic && job && /\d/.test(question);
}

export function hardProblem(question: string) {
  const task = /\b(calculat\w*|comput\w*|design\w*|sizing|size|simulat\w*|stress[-\s]?tests?|optimi[sz]\w*|allocat\w*|budgets?|shortfalls?|trade-?offs?|feasib\w*|deficits?)\b/i.test(question);
  const compare = /\bcompare\b/i.test(question) && /\b(cost|option|design|scenario|architectur|plan|system|budget)\b/i.test(question);
  const measured = /\d[\d,]*(?:\.\d+)?\s*(?:%|kwh|mwh|gwh|twh|kw|mw|gw|kcal|lit(?:er|re)s?|\bl\b|m3|m³|\$|billion|million|people|persons|hours?|days?)/i.test(question);
  return (task || compare) && measured;
}

function people(question: string) {
  const labeled = question.match(/population:\s*([\d,]+(?:\.\d+)?)\s*(million|billion)?/i);
  if (labeled) {
    const value = Number(labeled[1].replace(/,/g, ""));
    if (/million/i.test(labeled[2] || "")) return value * 1_000_000;
    if (/billion/i.test(labeled[2] || "")) return value * 1_000_000_000;
    return value;
  }
  const words = question.match(/([\d,.]+)\s*million\s+(?:people|persons|households|homes)\b/i);
  if (words) return Number(words[1].replace(/,/g, "")) * 1_000_000;
  const plain = question.match(/([\d,]+)\s*(?:people|persons|households|homes)\b/i);
  return plain ? Number(plain[1].replace(/,/g, "")) : 0;
}

type Base = { name: string; value: number; unit: string };

export function workedFigures(question: string) {
  if (!hardProblem(question)) return "";
  const lines: string[] = [];
  const bases: Base[] = [];
  const count = people(question);
  const popRate = question.match(/population growth:\s*([\d.]+)\s*%\s*(?:\/|\s*per\s+)?year/i);
  if (count > 0 && popRate) {
    const next = Math.round(count * (1 + Number(popRate[1]) / 100));
    lines.push(`Population after 1 year = ${count} × (1 + ${Number(popRate[1]) / 100}) = ${next}. Calculated.`);
  }
  const per = /([A-Za-z][A-Za-z \-]{0,24})[:\s]{0,4}([\d,]+(?:\.\d+)?)\s*([A-Za-z][A-Za-z%]{0,12})\s*(?:\/|\s+per\s+)\s*(?:person|household|capita)(?:\s*(?:\/|\s+per\s+)\s*(day|year))?/gi;
  for (const hit of question.matchAll(per)) {
    const label = (hit[1] || hit[3] || "amount").trim().toLowerCase();
    const each = Number(hit[2].replace(/,/g, ""));
    const unit = hit[3];
    const period = (hit[4] || "day").toLowerCase();
    if (!(count > 0) || !(each > 0)) continue;
    const total = count * each;
    const words = label.split(/\s+/).filter((word) => word.length > 2 && !/consumption|requirement|demand|available|production/.test(word));
    const name = words[0] || unit.toLowerCase();
    lines.push(`${name} = ${count} × ${each} ${unit}/${period} = ${total} ${unit}/${period}. Calculated.`);
    bases.push({ name, value: total, unit: `${unit}/${period}` });
    if (period === "day") {
      lines.push(`${name} per year = ${total} × 365 = ${total * 365} ${unit}/year. Calculated.`);
    }
  }
  const annual = question.match(/([\d,.]+)\s*(twh|gwh|mwh|kwh)\s*(?:\/|\s+per\s+)\s*year/i);
  if (annual) {
    const amount = Number(annual[1].replace(/,/g, ""));
    const unit = annual[2].toLowerCase();
    const kwh = unit === "twh" ? amount * 1e9 : unit === "gwh" ? amount * 1e6 : unit === "mwh" ? amount * 1e3 : amount;
    const gw = kwh / 8760 / 1e6;
    lines.push(`Average power = ${amount} ${unit.toUpperCase()}/year ÷ 8,760 h = ${gw.toFixed(3)} GW. Calculated. This is not a peak.`);
    bases.push({ name: "electricity", value: unit === "twh" ? amount : kwh / 1e9, unit: "TWh/year" });
  }
  for (const hit of question.matchAll(/([\d.]+)\s*%\s*of\s+([a-z][a-z \-]{2,48})/gi)) {
    const about = hit[2].toLowerCase();
    const base = bases.find((row) => about.includes(row.name));
    if (!base) continue;
    const part = base.value * (Number(hit[1]) / 100);
    const stop = new Set(["comes", "from", "with", "that", "this", "into", "over", "than", "after", "before"]);
    const name = about.split(/\s+/).filter((word) => word.length > 3 && word !== base.name && !stop.has(word)).pop() || "share";
    lines.push(`${hit[1]}% of ${base.name} = ${part} ${base.unit}. Calculated.`);
    bases.push({ name, value: part, unit: base.unit });
  }
  for (const hit of question.matchAll(/([\d.]+)\s*%\s*(increase|reduction|decrease|cut)\s+in\s+([a-z][a-z \-]{2,40})/gi)) {
    const down = /reduc|decreas|cut/i.test(hit[2]);
    const about = hit[3].toLowerCase();
    const base = bases.find((row) => about.includes(row.name) || row.name.includes(about.split(/\s+/)[0] || ""));
    if (!base) {
      lines.push(`A ${hit[1]}% ${hit[2]} in ${hit[3].trim()} was stated. No base amount for that item was given, so the new total is Unknown.`);
      continue;
    }
    const next = changeLine(base.name, base.value, base.unit, hit[3], Number(hit[1]), down);
    lines.push(next);
  }
  for (const hit of question.matchAll(/([a-z][a-z \-]{2,32})\s+(falls?|drops?|declines?|rises?|increases?)\s+(?:by\s+)?([\d.]+)\s*%/gi)) {
    const about = hit[1].toLowerCase();
    const pct = Number(hit[3]) / 100;
    const down = /fall|drop|declin/i.test(hit[2]);
    const base = bases.find((row) => about.includes(row.name) || row.name.includes(about.split(/\s+/)[0] || ""));
    if (!base || !(pct >= 0)) {
      lines.push(`${hit[1].trim()} ${hit[2]} ${hit[3]}%. No base amount was given, so the new total is UNKNOWN.`);
      continue;
    }
    const next = changeLine(base.name, base.value, base.unit, `${hit[1].trim()} ${hit[2]} ${hit[3]}%`, Number(hit[3]), down);
    lines.push(`Shock: ${next} One event only.`);
  }
  const reliability = question.match(/\b(99(?:\.\d+)?)\s*%/);
  if (reliability && /reliab|availab/i.test(question)) {
    const allowed = 8760 * (1 - Number(reliability[1]) / 100);
    lines.push(`A ${reliability[1]}% year allows about ${allowed.toFixed(3)} hours of outage. Calculated. This does not prove a design meets it.`);
  }
  if (resourcePlan(question)) {
    lines.push("Energy adequacy is not feasibility. Mark energy, peak power, battery energy, battery power, generator, transmission, and reliability each as PASS, FAIL, CONDITIONAL, or UNKNOWN. A missing discharge MW is UNKNOWN, not PASS. End with FEASIBLE, CONDITIONALLY FEASIBLE, NOT FEASIBLE, or FEASIBILITY NOT DEMONSTRATED.");
  }
  return lines.length ? `Calculator. Copy these figures in every scenario. Do not replace a figure with the words calculate, evaluate, assess, or determine.\n${lines.join("\n")}` : "";
}
