export type TimeRole = "stock" | "flow" | "rate" | "capacity" | "cumulative";

export type LedgerRow = {
  name: string;
  quantity: number;
  unit: string;
  role: TimeRole;
  equation: string;
  source: "question" | "calculated";
};

const UNIT = "kW|MW|GW|kWh|MWh|GWh|TWh|L|liters|litres";

function add(rows: LedgerRow[], row: LedgerRow) {
  const key = `${row.name}|${row.quantity}|${row.unit}|${row.equation}`;
  if (rows.some((item) => `${item.name}|${item.quantity}|${item.unit}|${item.equation}` === key)) return;
  rows.push(row);
}

function roleFor(name: string, unit: string, period: string): TimeRole {
  if (period) return "flow";
  if (/nameplate/i.test(name)) return "capacity";
  if (/^(kW|MW|GW)$/i.test(unit)) return "capacity";
  return "stock";
}

export function buildLedger(question: string): LedgerRow[] {
  const rows: LedgerRow[] = [];
  const stated = new RegExp(`(generator|solar|wind|peak|battery|demand|load|water|food|backup|diesel|plant|nameplate|usable|inflow|outflow|stock|budget)[^\\n.]{0,40}?([\\d,.]+)\\s*(${UNIT})(?:\\s*(?:/|per)\\s*(day|year|hour))?`, "gi");
  for (const hit of question.matchAll(stated)) {
    const quantity = Number(hit[2].replace(/,/g, ""));
    if (!Number.isFinite(quantity)) continue;
    const period = hit[4]?.toLowerCase() || "";
    const unit = period ? `${hit[3]}/${period}` : hit[3];
    add(rows, {
      name: hit[1].toLowerCase(),
      quantity,
      unit,
      role: roleFor(hit[1], hit[3], period),
      equation: "stated in the question",
      source: "question",
    });
  }
  const hours = question.match(/(\d+(?:\.\d+)?)\s*hours?\s+of\s+(?:fuel|diesel|gas|runtime|operation)/i) || question.match(/fuel[^.\n]{0,80}?(\d+(?:\.\d+)?)\s*hours?/i);
  const power = question.match(/(?:generator|plant|backup|diesel|turbine)[^.\n]{0,40}?(\d+(?:\.\d+)?)\s*(MW|GW)\b/i);
  if (hours && power && question.includes(hours[1]) && question.includes(power[1])) {
    const mw = /gw/i.test(power[2]) ? Number(power[1]) * 1000 : Number(power[1]);
    const span = Number(hours[1]);
    add(rows, { name: "fuel stock", quantity: mw * span, unit: "MWh", role: "stock", equation: `${mw} MW × ${span} h`, source: "calculated" });
  }
  for (const hit of question.matchAll(/(\d+(?:\.\d+)?)\s*%[^.\n]{0,48}?for\s+(\d+)\s+days/gi)) {
    add(rows, { name: "temporary cut", quantity: Number(hit[1]), unit: "%", role: "rate", equation: `applies for ${hit[2]} days only, not the year`, source: "question" });
  }
  const plate = question.match(/nameplate[^.\n]{0,24}([\d,.]+)\s*(kWh|MWh|GWh)/i);
  if (plate) add(rows, { name: "nameplate", quantity: Number(plate[1].replace(/,/g, "")), unit: plate[2], role: "capacity", equation: "stated nameplate, not usable energy", source: "question" });
  const usable = question.match(/\busable[^.\n]{0,24}([\d,.]+)\s*(kWh|MWh|GWh)/i);
  if (usable) add(rows, { name: "usable", quantity: Number(usable[1].replace(/,/g, "")), unit: usable[2], role: "stock", equation: "stated usable energy", source: "question" });
  const moneyHit = question.match(/budget[^$\n]{0,40}\$\s*([\d.]+)\s*(billion|million|thousand)/i);
  if (moneyHit) {
    const scale = /b/i.test(moneyHit[2]) ? 1_000_000_000 : /m/i.test(moneyHit[2]) ? 1_000_000 : 1000;
    add(rows, { name: "budget", quantity: Number(moneyHit[1]) * scale, unit: "USD", role: "stock", equation: "stated limit", source: "question" });
  }
  const demand = rows.find((row) => row.role === "flow" && /demand|load|water|food/.test(row.name));
  const cut = question.match(/(\d+(?:\.\d+)?)\s*%\s*(?:reduction|decrease|cut|fall|drop)[^.\n]{0,40}(availability|available|supply|generation|production)/i);
  if (demand && cut && !/reserve/i.test(cut[0])) {
    const factor = 1 - Number(cut[1]) / 100;
    const supply = demand.quantity * factor;
    add(rows, { name: `${demand.name} supply`, quantity: supply, unit: demand.unit, role: "flow", equation: `${demand.quantity} × ${factor}`, source: "calculated" });
    add(rows, { name: `${demand.name} shortage`, quantity: demand.quantity - supply, unit: demand.unit, role: "flow", equation: `${demand.quantity} − ${supply}`, source: "calculated" });
  }
  return rows;
}

export function ledgerSheet(question: string) {
  const rows = buildLedger(question);
  if (!rows.length) return "";
  const lines = rows.map((row) => `| ${row.name} | ${row.quantity} | ${row.unit} | ${row.role} | ${row.equation} | ${row.source} |`);
  return `Checked figures. Copy this table. Do not change a quantity. Do not add a confidence word. A number that is not in this table was not calculated.\n| name | quantity | unit | time | equation | source |\n| --- | --- | --- | --- | --- | --- |\n${lines.join("\n")}`;
}

export function attachLedger(question: string, text: string) {
  const rows = buildLedger(question).filter((row) => row.source === "calculated" || row.name === "nameplate" || row.name === "temporary cut");
  if (!rows.length || text.includes("Checked figures")) return text;
  const lines = rows.map((row) => `| ${row.name} | ${row.quantity} | ${row.unit} | ${row.role} | ${row.equation} | ${row.source} |`);
  return `${text}\n\nChecked figures\n| name | quantity | unit | time | equation | source |\n| --- | --- | --- | --- | --- | --- |\n${lines.join("\n")}`;
}

export function ledgerFindings(question: string, draft: string) {
  const rows = buildLedger(question);
  const found: string[] = [];
  for (const row of rows.filter((item) => item.name === "temporary cut")) {
    const days = row.equation.match(/for (\d+) days/)?.[1] || "those";
    if (new RegExp(`annual[^\\n]{0,80}${row.quantity}\\s*%|${row.quantity}\\s*%[^\\n]{0,80}(?:annual|per year)`, "i").test(draft)) {
      found.push(`A ${row.quantity}% cut applies for ${days} days only. It was applied to the year.`);
    }
  }
  const plate = rows.find((row) => row.name === "nameplate");
  const usable = rows.find((row) => row.name === "usable");
  if (plate && !usable && new RegExp(`usable[^\\n]{0,40}${plate.quantity}\\b`, "i").test(draft)) {
    found.push("Usable energy was not stated. Nameplate is not usable energy.");
  }
  if (plate && usable && plate.quantity !== usable.quantity && new RegExp(`usable[^\\n]{0,40}${plate.quantity}\\b`, "i").test(draft)) {
    found.push(`Usable energy is ${usable.quantity} ${usable.unit}. Nameplate ${plate.quantity} ${plate.unit} was used instead.`);
  }
  const solar = rows.find((row) => row.name === "solar" && row.role === "capacity");
  const wind = rows.find((row) => row.name === "wind" && row.role === "capacity");
  if (solar && wind && solar.quantity === wind.quantity && new RegExp(`\\b${solar.quantity * 2}\\s*${solar.unit}\\b`, "i").test(draft)) {
    found.push(`Solar and wind are each ${solar.quantity} ${solar.unit}. Adding them to ${solar.quantity * 2} counts the same capacity twice.`);
  }
  const stock = rows.find((row) => row.name === "fuel stock");
  if (stock) {
    for (const hit of draft.matchAll(/([\d,.]+)\s*MWh\b/gi)) {
      const value = Number(hit[1].replace(/,/g, ""));
      const near = draft.slice(Math.max(0, (hit.index ?? 0) - 48), (hit.index ?? 0) + hit[0].length);
      if (value > stock.quantity * 1.01 && /generator|fuel/i.test(near)) found.push(`${value} MWh is above the fuel stock of ${stock.quantity} MWh.`);
    }
  }
  const short = rows.find((row) => row.name.endsWith("shortage") && row.quantity > 0);
  const blocked = Boolean(short || (plate && !usable));
  if (blocked && /\b(recommend|preferable|should be selected|best choice)\b/i.test(draft) && !/qualitative/i.test(draft)) {
    found.push("A recommendation was made while a balance fails or usable energy is missing. Say that it is qualitative, or do not recommend.");
  }
  return found;
}
