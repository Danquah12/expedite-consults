export type DepthLevel = "beginner" | "intermediate" | "advanced" | "expert";

export function askedLevel(question: string): DepthLevel | null {
  if (/\b(10-year-old|ten-year-old|like i'm 10|like i am 10|explain to a child)\b/i.test(question)) return "beginner";
  if (/\blike i'm 12\b|\blike i am 12\b|\bfor a beginner\b|\bexplain simply\b|\bi'm new\b|\blike i'm new\b/i.test(question)) return "beginner";
  if (/\bkirchhoff\b|\bderive the\b/i.test(question)) return "advanced";
  if (/\b(physicist|as a researcher|for a researcher)\b/i.test(question)) return "expert";
  if (/\bmathematically\b|\banalyze this circuit\b|\bexpert\b/i.test(question)) return "expert";
  if (/\bohm'?s law\b|\bintermediate\b/i.test(question)) return "intermediate";
  return null;
}

export function levelFromProgress(question: string, areas: { label: string; percent: number }[]): DepthLevel {
  const q = question.toLowerCase();
  const label = /bible|psalm|gospel|scripture/.test(q)
    ? "Bible"
    : /cyber|cve|malware|phish/.test(q)
      ? "Cyber"
      : /circuit|electric|ohm|voltage|kirchhoff|force|engineer/.test(q)
        ? "Engineering"
        : /cell|physics|science|chem|bio/.test(q)
          ? "Science"
          : "";
  const picked = areas.find((area) => area.label === label);
  const percent = picked ? picked.percent : areas.length ? Math.round(areas.reduce((sum, area) => sum + area.percent, 0) / areas.length) : 0;
  if (percent >= 75) return "expert";
  if (percent >= 45) return "advanced";
  if (percent >= 15) return "intermediate";
  return "beginner";
}

export function depthStance(level: DepthLevel, question: string) {
  const electric = /electric|circuit|ohm|voltage|current|kirchhoff/i.test(question);
  if (level === "beginner") {
    return electric
      ? "Depth: Beginner. Same topic, this depth. Explain electricity the way you would to a 12-year-old. Short words. One everyday example. Do not start with a formula."
      : "Depth: Beginner. Same topic, this depth. Explain it the way you would to a 12-year-old. Short words. One everyday example. Do not start with a formula.";
  }
  if (level === "intermediate") {
    return electric
      ? "Depth: Intermediate. Same topic, this depth. Explain the circuit using Ohm's law. Say what voltage, current, and resistance mean, then the formula."
      : "Depth: Intermediate. Same topic, this depth. Use the standard definition and one rule or formula. Name what each part means.";
  }
  if (level === "advanced") {
    return electric
      ? "Depth: Advanced. Same topic, this depth. Derive the circuit behavior using Kirchhoff's laws. Show the steps. Do not skip to a number you did not compute."
      : "Depth: Advanced. Same topic, this depth. Go one step past the definition. Show the relationship and the steps. Keep the precise terms.";
  }
  return electric
    ? "Depth: Expert. Same topic, this depth. Analyze the circuit mathematically. Show the equations and the assumptions. Do not replace the math with a metaphor."
    : "Depth: Expert. Same topic, this depth. Analyze it mathematically. Show the equations and the assumptions. Do not replace the math with a metaphor.";
}
