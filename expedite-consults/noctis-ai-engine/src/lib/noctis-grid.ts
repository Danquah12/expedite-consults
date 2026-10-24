function amount(question: string, pattern: RegExp) {
  const hit = question.match(pattern);
  if (!hit) return null;
  const value = Number(hit[1].replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;
  const unit = (hit[2] || "").toLowerCase();
  if (unit === "mw") return value * 1000;
  if (unit === "mwh") return value * 1000;
  if (unit === "gw") return value * 1_000_000;
  if (unit === "gwh") return value * 1_000_000;
  return value;
}

export function hourlyGrid(question: string) {
  if (!/\b(hour|simulat|dispatch|grid)\b/i.test(question)) return "";
  const daily = amount(question, /([\d,.]+)\s*(kwh|mwh|gwh)\s*(?:\/|\s*per\s*)\s*day/i)
    ?? amount(question, /daily[^.\n]{0,40}?([\d,.]+)\s*(kwh|mwh|gwh)\b/i);
  const peak = amount(question, /peak[^.\n]{0,48}?([\d,.]+)\s*(kw|mw|gw)\b/i);
  const solar = amount(question, /solar[^.\n]{0,48}?([\d,.]+)\s*(kw|mw|gw)\b/i);
  const sun = question.match(/([\d.]+)\s*peak-sun-hours/i);
  const battery = amount(question, /battery[^.\n]{0,48}?([\d,.]+)\s*(kwh|mwh|gwh)\b/i);
  const discharge = amount(question, /discharge[^.\n]{0,40}?([\d,.]+)\s*(kw|mw|gw)\b/i);
  if (daily == null) return "Hourly simulation: UNKNOWN. Daily energy in kWh or MWh was not given, so the 24 hours were not invented.";
  const load = Array.from({ length: 24 }, () => daily / 24);
  if (peak != null && peak > daily / 24) {
    const other = (daily - peak) / 23;
    if (other < 0) return "Hourly simulation: UNKNOWN. The stated peak is larger than the stated daily energy, so a 24-hour shape cannot be built.";
    for (let hour = 0; hour < 24; hour += 1) load[hour] = hour === 18 ? peak : other;
  }
  const solarKwh = Array.from({ length: 24 }, () => 0);
  if (solar != null && sun) {
    const weights = [1, 2, 3, 4, 5, 4, 3, 2, 1];
    const total = solar * Number(sun[1]);
    weights.forEach((weight, index) => {
      solarKwh[8 + index] = (total * weight) / 25;
    });
  }
  let soc = battery == null ? 0 : battery * 0.5;
  let unmet = 0;
  const power = discharge ?? Number.POSITIVE_INFINITY;
  const rows: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const net = solarKwh[hour] - load[hour];
    if (battery == null) {
      if (net < 0) unmet += -net;
      rows.push(`${hour}: load ${load[hour].toFixed(1)} kWh, solar ${solarKwh[hour].toFixed(1)} kWh`);
      continue;
    }
    if (net >= 0) soc = Math.min(battery, soc + Math.min(net, power));
    else {
      const give = Math.min(-net, soc, power);
      soc -= give;
      unmet += -net - give;
    }
    rows.push(`${hour}: load ${load[hour].toFixed(1)} kWh, solar ${solarKwh[hour].toFixed(1)} kWh, stored ${soc.toFixed(1)} kWh`);
  }
  const shape = solar == null || !sun ? "Solar shape: UNKNOWN. No solar kW and peak-sun-hours were both given." : "Solar shape: Assumed. A midday peak spread over 08:00–16:00, not a measured hour.";
  const start = battery == null ? "Battery: UNKNOWN. No battery kWh was given." : "Battery start: Assumed half full. This is not a measured state of charge.";
  const limit = discharge == null && battery != null ? "Battery power: UNKNOWN. Discharge kW was not given, so the battery was not power-limited." : "";
  return [
    "Hourly simulation. Copy these figures. The load shape is Assumed, not a measured profile.",
    shape,
    start,
    limit,
    `Unmet energy = ${unmet.toFixed(1)} kWh. Calculated from the assumed hours.`,
    ...rows,
  ].filter(Boolean).join("\n");
}

function money(value: string, unit: string | undefined) {
  const amount = Number(value);
  if (/b/i.test(unit || "")) return amount * 1_000_000_000;
  if (/m/i.test(unit || "")) return amount * 1_000_000;
  if (/t/i.test(unit || "")) return amount * 1000;
  return amount;
}

export function optimizeOptions(question: string) {
  if (!/\b(optimi[sz]e|minimize|lowest cost|cheapest)\b/i.test(question)) return "";
  const found = [...question.matchAll(/\b([A-D])\b[^$\n]{0,24}\$\s*([\d.]+)\s*(billion|million|thousand)?/gi)];
  if (found.length < 2) return "Optimization: fewer than two priced options were given. The optimum is UNKNOWN.";
  const budgetHit = question.match(/budget[^$\n]{0,40}\$\s*([\d.]+)\s*(billion|million|thousand)?/i);
  const budget = budgetHit ? money(budgetHit[1], budgetHit[2]) : null;
  const options = found.map((hit) => ({ name: hit[1].toUpperCase(), cost: money(hit[2], hit[3]) }));
  const open = budget == null ? options : options.filter((option) => option.cost <= budget);
  if (!open.length) return "Optimization: every priced option is over the stated budget. Status: FAIL. There is no optimum.";
  const best = open.reduce((left, right) => (left.cost <= right.cost ? left : right));
  const dropped = options.filter((option) => !open.includes(option)).map((option) => option.name);
  return `Optimization: the lowest priced option that stays inside the stated budget is ${best.name}. Calculated. ${dropped.length ? `${dropped.join(", ")} is over the budget: FAIL.` : "No priced option was over the budget."} An option with no price was not ranked.`;
}
