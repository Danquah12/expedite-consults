export function memoryLines(question: string, context = "") {
  const lines = [
    "Short-term: this question is what the user said. It is not a fact.",
    "Semantic: only calculator figures, domain rules, and notes opened for this message are known. A remembered sentence is not automatically true.",
  ];
  if (context.trim()) lines.push("Episodic: the attached record is what this person did. It is not world knowledge.");
  if (/\b(always|from now on|i prefer|explain like)\b/i.test(question)) {
    lines.push("Procedural: a preference was stated. Label it User-said. Do not treat it as a fact.");
  }
  if (/\b(remember that|i think|i believe)\b/i.test(question)) {
    lines.push("Long-term: the user asked Vibe to remember a claim. Store it as User-said, not as Verified.");
  }
  return lines.join("\n");
}

export function nextFromRecord(question: string, context = "") {
  if (!/\b(what should I learn next|learn next|next lesson|knowledge gap)\b/i.test(question)) return "";
  const missing = context.match(/You have not checked ([^.]+)/i)?.[1];
  if (missing) {
    const first = missing.split(",")[0]?.trim();
    if (first) return `Next lesson: ${first}. That is the first unchecked step on the record. It was not chosen because it is popular. A watched film is not a mastered step.`;
  }
  if (!/You have studied|Nothing on your record has been studied/i.test(context)) {
    return "No learning record was attached, so the next lesson was not invented. Open the learning board, where studied steps and missed checks are kept.";
  }
  return "The record has no unchecked step, so a new course was not invented.";
}
