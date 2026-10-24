export function teacherPack(topic: string, card: { sentence: string; steps: string[]; source: string } | null) {
  if (!card) {
    return `A 30-minute lesson on ${topic || "that topic"} was not written. It is not on a stored shelf, so nothing was drafted from memory. A person would still have to review a draft before it is published.`;
  }
  return [
    "Draft. A person must review this before it is published. It is not published.",
    `Lesson, 30 minutes: ${card.sentence}`,
    `Slides: ${card.steps.length ? card.steps.join(" · ") : "The card did not list slides."}`,
    "Examples: only an example written on the card. None was added.",
    "Questions: ask the learner to restate the card in their own words.",
    `Quiz: what does the card say? Answer key: ${card.sentence}`,
    `Homework: open ${card.source || "the source named on the card"}.`,
    "Visual explanations: none. A diagram was not generated.",
  ].join("\n");
}
