import { readFileSync } from "node:fs";
import { hardProblem, resourcePlan } from "@/lib/worked-figures";
import { ruleViolations } from "@/lib/noctis-pipeline";
import { factFindings, firewallFindings } from "@/lib/noctis-checks";
import { predictionLine, shockLine } from "@/lib/noctis-scenarios";
import { causalLine, stakesLine } from "@/lib/noctis-decisions";
import { vocabularyLine } from "@/lib/noctis-vocabulary";
import { executionFindings } from "@/lib/noctis-execute";
import { ledgerFindings } from "@/lib/noctis-ledger";
import { bareStamp, hardFindings, hardRows, withCalculations } from "@/lib/noctis-hard";

function xaiKey() {
  const env = process.env.XAI_API_KEY?.trim();
  if (env) return env;
  try {
    const text = readFileSync(".env", "utf8");
    const line = text.split(/\r?\n/).find((row) => row.startsWith("XAI_API_KEY="));
    return line?.slice("XAI_API_KEY=".length).trim().replace(/^['"]|['"]$/g, "") || "";
  } catch {
    return "";
  }
}

function peakMw(question: string) {
  const peak = question.match(/peak(?:\s+\w+){0,4}\s*demand:\s*([\d.]+)\s*(kw|mw|gw)\b/i);
  if (!peak) return 0;
  const value = Number(peak[1]);
  const unit = peak[2].toLowerCase();
  if (unit === "gw") return value * 1000;
  if (unit === "kw") return value / 1000;
  return value;
}

function moneyLimit(question: string) {
  const hit = question.match(/\$\s*([\d.]+)\s*(billion|million|b|m)\b/i);
  if (!hit) return 0;
  const value = Number(hit[1]);
  return /b/i.test(hit[2]) ? value * 1_000_000_000 : value * 1_000_000;
}

function landLimit(question: string) {
  const hit = question.match(/([\d,]+(?:\.\d+)?)\s*km(?:²|2)?/i);
  return hit ? Number(hit[1].replace(/,/g, "")) : 0;
}

export function auditFindings(question: string, draft: string) {
  const found: string[] = [];
  const peak = peakMw(question);
  if (/24\s*hours?\s*(?:\/|per)\s*year/i.test(draft)) found.push("24 hours/year is not a year. Use 8,760 hours/year.");
  if (peak > 0) {
    for (const hit of draft.matchAll(/([\d,]+(?:\.\d+)?)\s*(mw|gw)\b/gi)) {
      const value = Number(hit[1].replace(/,/g, ""));
      if (!Number.isFinite(value)) continue;
      const mw = hit[2].toLowerCase() === "gw" ? value * 1000 : value;
      if (mw > peak * 30) found.push(`${hit[1]} ${hit[2]} is more than 30 times the ${peak} MW peak. kWh/year ÷ hours/year = kW. Divide by 1,000 for MW.`);
    }
  }
  const budget = moneyLimit(question);
  if (budget > 0) {
    for (const hit of draft.matchAll(/\$\s*([\d.]+)\s*(billion|million)\b/gi)) {
      const value = Number(hit[1]) * (/b/i.test(hit[2]) ? 1_000_000_000 : 1_000_000);
      if (value > budget * 1.01 && !/infeasible/i.test(draft)) found.push(`A stated cost is over the budget. Mark that design INFEASIBLE.`);
    }
  }
  const land = landLimit(question);
  if (land > 0) {
    for (const hit of draft.matchAll(/([\d,]+(?:\.\d+)?)\s*km(?:²|2)/gi)) {
      const value = Number(hit[1].replace(/,/g, ""));
      if (value > land * 1.01 && !/infeasible/i.test(draft)) found.push(`${hit[1]} km² is over the ${land} km² land limit. Mark that design INFEASIBLE.`);
    }
  }
  if (/solar[^.]{0,80}100\s*%/i.test(draft) && /wind[^.]{0,80}100\s*%/i.test(draft)) {
    found.push("Solar and wind are each written as 100% of the load. Give each source its own share.");
  }
  if (hardProblem(question) && !/\d/.test(draft) && !hardRows(question).some((row) => row.quantity > 0)) found.push("The question asks for a calculation, but the inputs needed for it are not in the question. Name the missing inputs. Do not replace the work with a feasibility label.");
  if (/calculate based on|requires further analysis|further analysis|to be determined|evaluate further|needs to be calculated/i.test(draft)) {
    found.push("The draft names a calculation it did not finish.");
  }
  if (hardProblem(question) && /\b(definitely|certainly|without doubt)\b/i.test(draft) && !/\b(unknown|assumed|cannot be determined)\b/i.test(draft)) {
    found.push("The draft is certain, but it does not name an unknown or an assumption. Say what cannot be determined.");
  }
  found.push(...ruleViolations(question, draft));
  found.push(...executionFindings(question, draft));
  found.push(...ledgerFindings(question, draft));
  found.push(...hardFindings(question, draft));
  if (/\b\d+(?:\.\d+)?%\s+confiden/i.test(draft) && !/\b\d+(?:\.\d+)?%\s+confiden/i.test(question)) {
    found.push("A confidence percent was added. The calculator did not produce one. Remove it.");
  }
  if (shockLine(question) && !/\d|UNKNOWN/i.test(draft)) found.push("A shock was asked, but the draft has no new total and does not say UNKNOWN.");
  if (/forecast is UNKNOWN/.test(predictionLine(question)) && /\b(will be|will reach|about \d)/i.test(draft)) {
    found.push("A forecast was given with no rate. The prediction stays UNKNOWN.");
  }
  if (causalLine(question) && /\b(this proves|definitely caused|the cause is)\b/i.test(draft) && !/\bUNKNOWN\b/.test(draft)) {
    found.push("A cause was stated as proven. Correlation is not causation. If the mechanism was not given, the cause is UNKNOWN.");
  }
  if (stakesLine(question) && /\b(you should deploy|you should buy|start treatment|this is safe to use|i recommend you (?:deploy|invest|take))\b/i.test(draft)) {
    found.push("A high-stakes answer told the person what to do. Remove the instruction. State what is known, what is UNKNOWN, and that a qualified person decides.");
  }
  if (/power \(kW/.test(vocabularyLine(question)) && (/\bpeak(?:\s+\w+){0,4}\s+[\d,.]+\s*mwh\b/i.test(draft) || /\b[\d,.]+\s*mwh\s+peak\b/i.test(draft))) {
    found.push("Peak was written in MWh. Peak is power, in MW or GW. Energy stays in MWh.");
  }
  if (resourcePlan(question)) {
    const claims = /\b(can survive|will survive|system is feasible|is feasible|the system passes|meets the (?:need|requirement|load))\b/i.test(draft);
    const states = /\b(PASS|FAIL|CONDITIONAL|UNKNOWN)\b/.test(draft);
    const ending = /FEASIBLE — demonstrated|CONDITIONALLY FEASIBLE|NOT FEASIBLE — demonstrated|FEASIBILITY NOT DEMONSTRATED/.test(draft);
    if (/battery:\s*pass/i.test(draft) && !/battery power:\s*(pass|fail|conditional|unknown)/i.test(draft)) {
      found.push("Battery was marked PASS as one item. Battery Energy and Battery Power must be separate. Missing discharge power is UNKNOWN, not PASS.");
    }
    if (claims && !states) found.push("Feasibility was claimed without PASS, FAIL, CONDITIONAL, or UNKNOWN on energy, peak power, battery power, transmission, and reliability.");
    if (resourcePlan(question) && !ending) found.push("The draft is missing the required final sentence: FEASIBLE, CONDITIONALLY FEASIBLE, NOT FEASIBLE, or FEASIBILITY NOT DEMONSTRATED.");
    if (/\bUNKNOWN\b/.test(draft) && /FEASIBLE — demonstrated with available information/.test(draft)) {
      found.push("A critical line is UNKNOWN, so the system cannot be FEASIBLE. Use FEASIBILITY NOT DEMONSTRATED.");
    }
    if (/\bFAIL\b/.test(draft) && /FEASIBLE — demonstrated with available information/.test(draft)) {
      found.push("A line is FAIL, so the ending cannot be FEASIBLE. Use NOT FEASIBLE.");
    }
  }
  return found;
}

async function grokRewrite(question: string, draft: string, findings: string[]) {
  const key = xaiKey();
  if (!key) return "";
  const packet = `Question:\n${question.slice(0, 4000)}\n\nIndependent findings:\n${findings.join("\n") || "None."}\n\nDraft:\n${draft.slice(0, 10000)}`;
  for (const model of ["grok-3-mini", "grok-3"]) {
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 4000,
          messages: [
            {
              role: "system",
              content: "You are the independent challenger, not a second author. Keep every calculated figure. Do not replace the answer with only a feasibility sentence. If figures are missing and the inputs are in the question, write those calculations first, with the formula and the units. Check the calculation, the evidence, and what is missing. Do not add a new design and do not add agents. A confidence percent that was not calculated is removed. A forecast with no rate stays UNKNOWN. A what-if applies the stated change once. Prefer 'this cannot be determined' over an invented figure. Use only PASS, FAIL, CONDITIONAL, or UNKNOWN. If any critical line is UNKNOWN, the ending is FEASIBILITY NOT DEMONSTRATED. If any critical line is FAIL, the ending is NOT FEASIBLE. The ending comes after the figures. Return the corrected answer with no preface.",
            },
            { role: "user", content: packet },
          ],
        }),
      });
      if (res.status === 404) continue;
      if (!res.ok) return "";
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content?.trim() || "";
    } catch {
      return "";
    }
  }
  return "";
}

export async function auditAnswer(question: string, draft: string, opened = "") {
  const restored = withCalculations(question, draft);
  const first = [...auditFindings(question, restored), ...factFindings(question, restored, opened), ...firewallFindings(restored, opened)];
  const rewritten = first.length ? await grokRewrite(question, restored, first) : "";
  const next = rewritten && !bareStamp(rewritten) ? rewritten : restored;
  const left = [...auditFindings(question, next), ...factFindings(question, next, opened), ...firewallFindings(next, opened)];
  if (!left.length) return next;
  return `${next}\n\nIndependent audit\nThese checks did not use the model that wrote the draft.\n${left.map((line) => `- ${line}`).join("\n")}`;
}
