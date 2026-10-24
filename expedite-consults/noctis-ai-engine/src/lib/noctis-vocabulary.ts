const TERMS: { test: RegExp; line: string }[] = [
  { test: /\b(mw|gw|kw|mwh|kwh|gwh|twh)\b/i, line: "Vocabulary: power (kW, MW, GW) is not energy (kWh, MWh, GWh, TWh). Do not use one word for both." },
  { test: /\b(nameplate|usable capacity|state of charge|depth of discharge)\b/i, line: "Vocabulary: nameplate capacity is not usable capacity." },
  { test: /\b(verse|scripture|commentary|interpretation)\b/i, line: "Vocabulary: the verse is the stored text. A commentary or an interpretation is not the verse." },
  { test: /\b(control|implemented|poa&m|800-53)\b/i, line: "Vocabulary: a control name is not proof the control is implemented." },
  { test: /\b(cause|caused|correlation|associated with)\b/i, line: "Vocabulary: correlation is not a cause." },
  { test: /\b(budget|cost)\b/i, line: "Vocabulary: a budget is the limit. A cost is what an option spends. They are not the same number." },
  { test: /\b(peak|average power)\b/i, line: "Vocabulary: average power is not peak power." },
];

export function vocabularyLine(question: string) {
  const lines = TERMS.filter((row) => row.test.test(question)).map((row) => row.line);
  if (!lines.length) return "";
  return ["Use these meanings. Do not swap them.", ...lines].join("\n");
}
