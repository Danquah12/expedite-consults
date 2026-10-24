const MU = 3.986004418e14;
const RE = 6_371_000;
const G0 = 9.80665;
const GEO = 42_164_000;

const CONSTANTS: Record<string, number> = {
  mu: MU,
  mu_earth: MU,
  re: RE,
  r_earth: RE,
  g0: G0,
  g: G0,
  c: 299_792_458,
  pi: Math.PI,
  geo: GEO,
};

const FUNCS = new Set(["sqrt", "sin", "cos", "tan", "log", "ln", "abs", "exp"]);

export type WorkSheet = {
  title: string;
  short: string;
  full: string;
};

function num(value: number) {
  if (!Number.isFinite(value)) return "not a number";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 0.01 || abs >= 1_000_000)) return value.toExponential(4);
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}

function sheet(title: string, given: string[], constants: string[], formula: string[], steps: string[], result: string, check: string[]): WorkSheet {
  const tail = [...check, "Computed by the calculator. The model did not invent this number.", "This is a teaching calculation. It is not a flight, structural, or safety decision."];
  const full = [
    title,
    "",
    "Given",
    ...given.map((line) => line),
    "",
    "Constants",
    ...constants,
    "",
    "Formula",
    ...formula,
    "",
    "Work",
    ...steps,
    "",
    "Result",
    result,
    "",
    "Check",
    ...tail,
  ].join("\n");
  const short = [title, "", result, "", ...tail].join("\n");
  return { title, short, full };
}

type Tok = { t: "n"; v: number } | { t: "id"; v: string } | { t: "op"; v: string } | { t: "lp" } | { t: "rp" };

function tokenize(input: string): Tok[] {
  const s = input.replace(/π/g, "pi").replace(/×/g, "*").replace(/÷/g, "/");
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\n" || c === "\t") {
      i += 1;
      continue;
    }
    if (c === "(") {
      out.push({ t: "lp" });
      i += 1;
      continue;
    }
    if (c === ")") {
      out.push({ t: "rp" });
      i += 1;
      continue;
    }
    if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c });
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j += 1;
      if ((s[j] === "e" || s[j] === "E") && /[0-9+\-]/.test(s[j + 1] || "")) {
        j += 1;
        if (s[j] === "+" || s[j] === "-") j += 1;
        while (j < s.length && /[0-9]/.test(s[j])) j += 1;
      }
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) throw new Error("bad number");
      out.push({ t: "n", v });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j += 1;
      out.push({ t: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    throw new Error("bad character");
  }
  return out;
}

function evaluate(input: string) {
  const toks = tokenize(input);
  let i = 0;
  const peek = () => toks[i];
  const eat = () => toks[i++];
  function expr(): number {
    let left = term();
    while (peek()?.t === "op" && (peek() as { v: string }).v && "+-".includes((peek() as { v: string }).v)) {
      const op = (eat() as { v: string }).v;
      const right = term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }
  function term(): number {
    let left = pow();
    while (peek()?.t === "op" && "*/".includes((peek() as { v: string }).v)) {
      const op = (eat() as { v: string }).v;
      const right = pow();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }
  function pow(): number {
    const left = unary();
    if (peek()?.t === "op" && (peek() as { v: string }).v === "^") {
      eat();
      return left ** pow();
    }
    return left;
  }
  function unary(): number {
    if (peek()?.t === "op" && (peek() as { v: string }).v === "-") {
      eat();
      return -unary();
    }
    if (peek()?.t === "op" && (peek() as { v: string }).v === "+") {
      eat();
      return unary();
    }
    return primary();
  }
  function primary(): number {
    const tok = eat();
    if (!tok) throw new Error("ended");
    if (tok.t === "n") return tok.v;
    if (tok.t === "lp") {
      const v = expr();
      if (eat()?.t !== "rp") throw new Error("paren");
      return v;
    }
    if (tok.t === "id") {
      if (peek()?.t === "lp" && FUNCS.has(tok.v)) {
        eat();
        const v = expr();
        if (eat()?.t !== "rp") throw new Error("paren");
        if (tok.v === "sqrt") return Math.sqrt(v);
        if (tok.v === "sin") return Math.sin(v);
        if (tok.v === "cos") return Math.cos(v);
        if (tok.v === "tan") return Math.tan(v);
        if (tok.v === "log") return Math.log10(v);
        if (tok.v === "ln") return Math.log(v);
        if (tok.v === "abs") return Math.abs(v);
        return Math.exp(v);
      }
      if (tok.v in CONSTANTS) return CONSTANTS[tok.v];
    }
    throw new Error("unknown");
  }
  const value = expr();
  if (i !== toks.length || !Number.isFinite(value)) throw new Error("bad");
  return value;
}

function kmValues(question: string) {
  const found: number[] = [];
  for (const match of question.matchAll(/(\d+(?:\.\d+)?)\s*km\b/gi)) found.push(Number(match[1]));
  return found;
}

function asRadius(km: number, question: string) {
  if (/radius/i.test(question)) return km * 1000;
  if (/alt(?:itude)?/i.test(question)) return RE + km * 1000;
  if (km >= 35_000 && km <= 36_500) return RE + km * 1000;
  if (km >= 40_000 && km <= 45_000) return km * 1000;
  if (km <= 2_000) return RE + km * 1000;
  return km * 1000;
}

function radiusNote(km: number, meters: number) {
  const added = Math.abs(meters - km * 1000 - RE) < 1;
  return added ? `${num(km)} km altitude, so radius ${num(meters / 1000)} km after adding Earth's mean radius 6371 km` : `${num(km)} km treated as a radius`;
}

function hohmann(question: string): WorkSheet | null {
  if (!/hohmann|transfer orbit/i.test(question)) return null;
  const kms = kmValues(question);
  let r1: number;
  let r2: number;
  const given: string[] = [];
  if (/geostationary|\bgeo\b/i.test(question) && kms.length >= 1) {
    r1 = asRadius(kms[0], question);
    r2 = GEO;
    given.push(radiusNote(kms[0], r1));
    given.push("Destination is geostationary. Radius used: 42164 km.");
  } else if (kms.length >= 2) {
    r1 = asRadius(kms[0], question);
    r2 = asRadius(kms[1], question);
    given.push(radiusNote(kms[0], r1));
    given.push(radiusNote(kms[1], r2));
  } else return null;
  if (!(r2 > r1)) [r1, r2] = [r2, r1];
  const dv1 = Math.sqrt(MU / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1);
  const dv2 = Math.sqrt(MU / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2)));
  return sheet(
    "Hohmann transfer",
    given,
    ["μ Earth = 3.986004418×10^14 m^3/s^2"],
    ["Δv1 = sqrt(μ/r1) × (sqrt(2 r2 / (r1 + r2)) − 1)", "Δv2 = sqrt(μ/r2) × (1 − sqrt(2 r1 / (r1 + r2)))", "Δv = Δv1 + Δv2"],
    [`r1 = ${num(r1 / 1000)} km`, `r2 = ${num(r2 / 1000)} km`, `Δv1 = ${num(dv1)} m/s`, `Δv2 = ${num(dv2)} m/s`],
    `Δv = ${num(dv1 + dv2)} m/s (${num((dv1 + dv2) / 1000)} km/s)`,
    ["Both burns are in m/s. Coplanar circular orbits are assumed. Plane change is not included."],
  );
}

function circular(question: string): WorkSheet | null {
  if (!/circular orbit|orbital (speed|velocity|period)/i.test(question)) return null;
  if (/geostationary|\bgeo\b/i.test(question) && !kmValues(question).length) {
    const r = GEO;
    const v = Math.sqrt(MU / r);
    const period = 2 * Math.PI * Math.sqrt(r ** 3 / MU);
    const wantPeriod = /period/i.test(question);
    return sheet(
      wantPeriod ? "Geostationary period" : "Circular orbit speed",
      ["Geostationary radius 42164 km."],
      ["μ Earth = 3.986004418×10^14 m^3/s^2"],
      wantPeriod ? ["T = 2 π sqrt(r^3 / μ)"] : ["v = sqrt(μ / r)"],
      [`r = ${num(r / 1000)} km`],
      wantPeriod ? `T = ${num(period / 3600)} h` : `v = ${num(v)} m/s (${num(v / 1000)} km/s)`,
      [wantPeriod ? "The period is in hours." : "The speed is in m/s for a circular orbit."],
    );
  }
  const kms = kmValues(question);
  if (!kms.length) return null;
  const r = asRadius(kms[0], question);
  const v = Math.sqrt(MU / r);
  const period = 2 * Math.PI * Math.sqrt(r ** 3 / MU);
  const wantPeriod = /period/i.test(question);
  return sheet(
    wantPeriod ? "Orbital period" : "Circular orbit speed",
    [radiusNote(kms[0], r)],
    ["μ Earth = 3.986004418×10^14 m^3/s^2"],
    wantPeriod ? ["T = 2 π sqrt(r^3 / μ)"] : ["v = sqrt(μ / r)"],
    [`r = ${num(r / 1000)} km`],
    wantPeriod ? `T = ${num(period / 60)} min` : `v = ${num(v)} m/s (${num(v / 1000)} km/s)`,
    [wantPeriod ? "The period is in minutes for a circular orbit." : "The speed is in m/s. A circular orbit is assumed."],
  );
}

function escape(question: string): WorkSheet | null {
  if (!/escape (speed|velocity)/i.test(question)) return null;
  const kms = kmValues(question);
  const r = kms.length ? asRadius(kms[0], question) : RE;
  const v = Math.sqrt((2 * MU) / r);
  return sheet(
    "Escape speed",
    [kms.length ? radiusNote(kms[0], r) : "No altitude was given. The surface radius 6371 km is used."],
    ["μ Earth = 3.986004418×10^14 m^3/s^2"],
    ["v = sqrt(2 μ / r)"],
    [`r = ${num(r / 1000)} km`],
    `v = ${num(v)} m/s (${num(v / 1000)} km/s)`,
    ["Escape speed is in m/s. Atmosphere and rotation are ignored."],
  );
}

function rocket(question: string): WorkSheet | null {
  if (!/rocket equation|specific impulse|mass ratio/i.test(question)) return null;
  const isp = question.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)\b/i);
  const ratio = question.match(/mass ratio(?:\s+of)?\s*(\d+(?:\.\d+)?)/i);
  const m0 = question.match(/(?:wet|initial|m0|full)[^\d]{0,12}(\d+(?:\.\d+)?)\s*kg/i);
  const mf = question.match(/(?:dry|final|mf|empty)[^\d]{0,12}(\d+(?:\.\d+)?)\s*kg/i);
  const ispValue = isp ? Number(isp[1]) : 0;
  const massRatio = ratio ? Number(ratio[1]) : m0 && mf ? Number(m0[1]) / Number(mf[1]) : 0;
  if (!(ispValue > 0) || !(massRatio > 1)) return null;
  const dv = ispValue * G0 * Math.log(massRatio);
  return sheet(
    "Rocket equation",
    [ratio ? `Mass ratio ${num(massRatio)}` : `Wet ${m0?.[1]} kg, dry ${mf?.[1]} kg, ratio ${num(massRatio)}`, `Specific impulse ${num(ispValue)} s`],
    ["g0 = 9.80665 m/s^2"],
    ["Δv = Isp × g0 × ln(m0 / mf)"],
    [`ln(mass ratio) = ${num(Math.log(massRatio))}`],
    `Δv = ${num(dv)} m/s (${num(dv / 1000)} km/s)`,
    ["Δv is in m/s. Gravity and drag losses are not included."],
  );
}

function expression(question: string): WorkSheet | null {
  const picked = question.match(/(?:calculate|compute|evaluate|what is)\s+([0-9a-zA-Z_+\-*/^().,\sπ×÷]+)/i)?.[1] ?? question;
  const clean = picked.trim().replace(/[?.!]+$/g, "");
  if (!/\d/.test(clean) || !/[+*/^×÷]|sqrt|ln|log/i.test(clean)) return null;
  if (/[^\d\s.+*/^()\-a-zA-Z_π×÷]/.test(clean)) return null;
  try {
    const value = evaluate(clean);
    return sheet(
      "Expression",
      [clean],
      ["Named values: mu, re, g0, pi, geo, c"],
      [clean],
      ["The expression was evaluated directly."],
      `= ${num(value)}`,
      ["Only the written expression was evaluated. No unit was inferred."],
    );
  } catch {
    return null;
  }
}

export function solveWork(question: string): WorkSheet | null {
  const text = question.replace(/\s+/g, " ").trim();
  if (!text) return null;
  return hohmann(text) || rocket(text) || escape(text) || circular(text) || expression(text);
}

export const CALC_HELP = [
  "Write a formula Vibe can compute, or an expression.",
  "",
  "Hohmann transfer from 300 km to geostationary",
  "Circular orbit speed at 400 km",
  "Orbital period at 400 km",
  "Escape speed at 200 km",
  "Rocket equation, Isp 320 s, mass ratio 4",
  "sqrt(mu/6771000)",
  "",
  "The number comes from the calculator. Vibe does not guess it.",
].join("\n");
