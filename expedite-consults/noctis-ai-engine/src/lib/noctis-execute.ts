const SUPPLY = /\b(availability|available|supply|generation|generated|production|output|harvest|inflow|imports?)\b/i;
const DEMAND = /\b(demand|consumption|requirement|load)\b/i;

export function supplySide(phrase: string) {
  return SUPPLY.test(phrase) && !DEMAND.test(phrase);
}

export function changeLine(name: string, value: number, unit: string, about: string, percent: number, down: boolean) {
  const factor = percent / 100;
  if (down && supplySide(about)) {
    const supply = value * (1 - factor);
    const gap = value - supply;
    return `${name} demand stays ${value} ${unit}. "${about.trim()}" is supply, not demand. Available supply = ${value} × ${1 - factor} = ${supply} ${unit}. Shortage = ${gap} ${unit}. Calculated.`;
  }
  const next = down ? value * (1 - factor) : value * (1 + factor);
  return `${name} after ${about.trim()} = ${next} ${unit}. Gap = ${Math.abs(value - next)} ${unit}. Calculated.`;
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

function toMwh(value: number, unit: string) {
  const name = unit.toLowerCase();
  if (name === "gwh") return value * 1000;
  if (name === "kwh") return value / 1000;
  if (name === "twh") return value * 1_000_000;
  return value;
}

function fuelStock(question: string) {
  const hours = question.match(/(\d+(?:\.\d+)?)\s*hours?\s+of\s+(?:fuel|diesel|gas|runtime|operation)/i)
    || question.match(/fuel[^.\n]{0,80}?(\d+(?:\.\d+)?)\s*hours?/i);
  const power = question.match(/(?:generator|plant|backup|diesel|turbine)[^.\n]{0,40}?(\d+(?:\.\d+)?)\s*(mw|gw)\b/i)
    || question.match(/(\d+(?:\.\d+)?)\s*(mw|gw)\b[^.\n]{0,40}?(?:generator|backup|diesel)/i);
  if (!hours || !power) return "";
  const mw = power[2].toLowerCase() === "gw" ? Number(power[1]) * 1000 : Number(power[1]);
  const span = Number(hours[1]);
  const total = mw * span;
  return `Fuel is a stock of ${span} hours at ${mw} MW = ${total} MWh once. It is not ${mw * 24} MWh every day. A longer outage does not refill it.`;
}

function energyBalance(question: string, fuel: string) {
  const short = question.match(/(?:deficit|shortfall|shortage)\s*(?:of|=|:)?\s*([\d,.]+)\s*(mwh|gwh|kwh|twh)\s*(?:\/|\s*per\s*)\s*day/i);
  const days = question.match(/(?:for|over|lasting|during)\s+(\d+)\s+days/i);
  if (!short || !days) return "";
  const daily = toMwh(Number(short[1].replace(/,/g, "")), short[2]);
  const need = daily * Number(days[1]);
  const battery = question.match(/battery[^.\n]{0,48}?([\d,.]+)\s*(mwh|gwh|kwh)\b/i);
  const stored = battery ? toMwh(Number(battery[1].replace(/,/g, "")), battery[2]) : 0;
  const fuelTotal = Number(fuel.match(/=\s*([\d,.]+)\s*MWh once/)?.[1]?.replace(/,/g, "") || 0);
  const have = stored + fuelTotal;
  const gap = need - have;
  if (gap > 0) return `Energy: FAIL. The stated daily shortfall over ${days[1]} days is ${need} MWh. Stored energy on hand is ${have} MWh. Remaining gap = ${gap} MWh. Battery power can still be UNKNOWN. That UNKNOWN does not erase this FAIL.`;
  return `Energy quantity covers the stated shortfall by ${Math.abs(gap)} MWh. This is not power feasibility, timing feasibility, or access. Those stay separate.`;
}

function sensitivity(question: string) {
  if (!/\bsensitiv/i.test(question)) return "";
  const band = question.match(/±\s*([\d.]+)\s*%/);
  const width = band ? Number(band[1]) / 100 : 0.2;
  const count = people(question);
  const rate = question.match(/(?:population|demand)\s+growth:\s*([\d.]+)\s*%/i);
  const year = question.match(/\b(\d{1,2})\s*-\s*year\b|\byear\s+(\d{1,2})\b/i);
  const span = year ? Number(year[1] || year[2]) : 0;
  if (!(count > 0) || !rate || !span) return "Sensitivity was asked. A population or demand base, a growth rate, and a year were not all found, so no case was calculated. Do not write that a percent has an impact without the three numbers.";
  const growth = Number(rate[1]) / 100;
  const at = (next: number) => Math.round(count * (1 + next) ** span);
  const label = band ? "the stated band" : "an assumed ±20% of the stated rate";
  return `Sensitivity over ${span} years, using ${label}. Low = ${at(growth * (1 - width))}. Base = ${at(growth)}. High = ${at(growth * (1 + width))}. Calculated. Copy these three numbers.`;
}

function choice(question: string) {
  if (!/\b(?:strategy|option|architecture)\s+[A-D]\b/i.test(question)) return "";
  const prices = question.match(/\$\s*[\d.]+\s*(?:billion|million|thousand)/gi) || [];
  if (prices.length >= 2) return "";
  return "Numerical optimization = NOT POSSIBLE. The named strategies do not each have a price. Do not call one optimal, preferable, or selected. A qualitative remark must say it is qualitative.";
}

export function executionSheet(question: string) {
  const lines = [fuelStock(question), sensitivity(question), choice(question)].filter(Boolean);
  const fuel = lines.find((line) => line.startsWith("Fuel is a stock")) || "";
  const balance = energyBalance(question, fuel);
  if (balance) lines.push(balance);
  if (!lines.length) return "";
  return `Execution. These lines were calculated for every resource, not for one example. Copy them. Do not replace a line with a rating or with the word confirmed.\n${lines.join("\n")}`;
}

export function executionFindings(question: string, draft: string) {
  const sheet = executionSheet(question);
  const found: string[] = [];
  if (/demand stays/.test(sheet) && /demand[^\n]{0,80}(?:×|x|\*)\s*0\.\d+/i.test(draft)) {
    found.push("Demand was multiplied by a supply factor. Demand stays. Only the supply changes, and the difference is the shortage.");
  }
  if (/Shortage =/.test(sheet) && /no (?:water |food |power |energy |fuel )?deficit|no shortage/i.test(draft)) {
    found.push("A shortage was calculated. The draft says there is no deficit. Use the shortage.");
  }
  if (/Fuel is a stock of (\d+(?:\.\d+)?) hours at (\d+(?:\.\d+)?) MW/.test(sheet)) {
    const hit = sheet.match(/Fuel is a stock of (\d+(?:\.\d+)?) hours at (\d+(?:\.\d+)?) MW = (\d+(?:\.\d+)?) MWh/);
    if (hit && new RegExp(`${hit[2]}\\s*[×x*]\\s*24|${Number(hit[2]) * 24}\\s*MWh\\s*(?:/|per)\\s*day`, "i").test(draft)) {
      found.push(`Fuel lasts ${hit[1]} hours once, ${hit[3]} MWh total. It was written as a daily flow. A longer crisis does not refill it.`);
    }
  }
  if (/Energy: FAIL/.test(sheet) && !/Energy:\s*FAIL/i.test(draft)) {
    found.push("Energy already FAILs on the stated balance. An unknown power rating does not erase that FAIL.");
  }
  if (/Energy: FAIL/.test(sheet) && /\bsurplus\b/i.test(draft)) {
    found.push("The balance is a shortage. Do not call it a surplus.");
  }
  if (/\b(reliability|resilience)\s*[:=]?\s*(very\s+high|high|medium|low)\b/i.test(draft) && !/\b(lole|eens|failure rate|n-1|n-2)\b/i.test(question)) {
    found.push("A reliability rating was assigned with no reliability model. Use UNKNOWN / NOT DEMONSTRATED.");
  }
  if (/\b(recalculation:\s*confirmed|units:\s*checked|order of magnitude:\s*checked|calculation correct|independently verified)\b/i.test(draft)) {
    found.push("VERIFICATION FAILED. The draft confirmed itself. Only a figure produced by the calculator is checked.");
  }
  if (/Numerical optimization = NOT POSSIBLE/.test(sheet) && /\b(optimal|optimum|preferable|best strategy|selected strategy)\b/i.test(draft) && !/qualitative/i.test(draft)) {
    found.push("A strategy was chosen without a price for each one. Numerical optimization is NOT POSSIBLE.");
  }
  if (/Sensitivity was asked/.test(sheet) && /±\s*20\s*%|has an impact/i.test(draft)) {
    found.push("Sensitivity was described but not calculated. The three cases were not available, so do not claim an impact.");
  }
  return found;
}
