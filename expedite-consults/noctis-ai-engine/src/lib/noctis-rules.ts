export function statedRules(turns: { role: string; content: string }[]) {
  const rules = turns
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content.match(/^(?:correction|rule)\s*:\s*(.{8,240})/i)?.[1]?.trim() || "")
    .filter(Boolean)
    .slice(-8);
  if (!rules.length) return "";
  return `User-said rules. These were typed by the person. They are not verified facts. Use them only when they do not contradict a calculated figure or an opened page.\n${rules.map((rule) => `- ${rule}`).join("\n")}`;
}

export function rulesFromContext(context: string) {
  const hit = context.match(/User-said rules: ([^\n]+)/);
  if (!hit?.[1]) return "";
  const rules = hit[1].split(" | ").map((rule) => rule.trim()).filter((rule) => rule.length > 7).slice(0, 8);
  if (!rules.length) return "";
  return `User-said rules saved in this browser. They are not verified facts. Use them only when they do not contradict a calculated figure or an opened page.\n${rules.map((rule) => `- ${rule}`).join("\n")}`;
}

export function graphFromNotes(notes: string) {
  const titles = [...notes.matchAll(/Wikipedia — ([^(:\n]+)/g)].map((hit) => hit[1].trim()).filter(Boolean).slice(0, 4);
  const papers = [...notes.matchAll(/arXiv — ([^(\n]+)/g)].map((hit) => hit[1].trim()).filter(Boolean).slice(0, 2);
  const nodes = [...titles, ...papers];
  if (!nodes.length) return "";
  return `Opened-page graph. These nodes came from a page retrieved for this answer, not from the hand-written list.\n${nodes.join(" → ")}`;
}
