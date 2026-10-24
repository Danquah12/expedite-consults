import { stripStatus } from "@/lib/evidence";

type Card = { front: string; back: string };
type Quiz = { ask: string; choices: string[]; answer: number };

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function lines(value: unknown, count: number, max: number) {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const text = clip(item, max);
    if (!text) continue;
    out.push(text);
    if (out.length >= count) break;
  }
  return out;
}

async function furtherReading(topic: string) {
  try {
    const { askStudy } = await import("@/lib/knowledge.server");
    const card = await askStudy(topic.slice(0, 300), false);
    return card.evidence
      .filter((row) => row.passage.trim().length > 40 && /^https?:\/\//i.test(row.href) && !/google\.com\/search/i.test(row.href))
      .slice(0, 4)
      .map((row) => ({ title: row.source.slice(0, 120), href: row.href }));
  } catch {
    return [];
  }
}

export async function makeLesson(request: string): Promise<{ text: string } | { error: string }> {
  const ask = clip(request, 500);
  if (ask.length < 8) return { error: "Say who the lesson is for and what it should teach." };
  const sources = await furtherReading(ask);
  const { modelChat } = await import("@/lib/video-mind.server");
  const result = await modelChat(
    [
      {
        role: "system",
        content:
          "Write a teaching packet as JSON. Fields: title, audience, introduction, explanation, diagram (one sentence describing a picture, not a claim that the picture exists), examples (up to 3), questions (up to 3), quiz (up to 3 objects with ask, choices, answer index), flashcards (up to 4 objects with front and back), vocabulary (up to 5 objects with term and says), homework (one task). Do not invent a citation, a URL, or a date. Do not say a diagram was generated.",
      },
      { role: "user", content: ask },
    ],
    { temperature: 0.3, maxTokens: 1400, json: true },
  );
  if ("error" in result) return { error: "Vibe, OpenAI, and Gemini did not return a lesson." };
  const raw = result.text;
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { error: "The lesson did not come back as a packet." };
  }
  const cards: Card[] = Array.isArray(parsed.flashcards)
    ? parsed.flashcards
        .map((row) => ({ front: clip((row as Card)?.front, 120), back: clip((row as Card)?.back, 180) }))
        .filter((row) => row.front && row.back)
        .slice(0, 4)
    : [];
  const words = Array.isArray(parsed.vocabulary)
    ? parsed.vocabulary
        .map((row) => ({ term: clip((row as { term?: unknown })?.term, 40), says: clip((row as { says?: unknown })?.says, 160) }))
        .filter((row) => row.term && row.says)
        .slice(0, 5)
    : [];
  const quiz: Quiz[] = Array.isArray(parsed.quiz)
    ? parsed.quiz.flatMap((row) => {
        const question = clip((row as { ask?: unknown })?.ask, 160);
        const choices = lines((row as { choices?: unknown })?.choices, 4, 80);
        const answer = Number((row as { answer?: unknown })?.answer);
        if (!question || choices.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= choices.length) return [];
        return [{ ask: question, choices, answer }];
      }).slice(0, 3)
    : [];
  const reading = sources.length
    ? sources.map((row) => `${row.title} — ${row.href}`).join("\n")
    : "None retrieved. No link was added.";
  const text = stripStatus(
    [
      clip(parsed.title, 120) || "Lesson",
      `Audience\n${clip(parsed.audience, 80) || "The person who asked."}`,
      `Introduction\n${clip(parsed.introduction, 500)}`,
      `Explanation\n${clip(parsed.explanation, 800)}`,
      `Diagram prompt\n${clip(parsed.diagram, 240) || "No diagram prompt."}\nThis is a description of a picture, not a picture.`,
      `Examples\n${lines(parsed.examples, 3, 220).map((row) => `- ${row}`).join("\n") || "None."}`,
      `Questions\n${lines(parsed.questions, 3, 180).map((row) => `- ${row}`).join("\n") || "None."}`,
      `Quiz\n${quiz.map((row, index) => `${index + 1}. ${row.ask}\n${row.choices.map((choice, i) => `${i === row.answer ? "*" : "-" } ${choice}`).join("\n")}`).join("\n\n") || "None."}`,
      `Flashcards\n${cards.map((row) => `${row.front} — ${row.back}`).join("\n") || "None."}`,
      `Vocabulary\n${words.map((row) => `${row.term}: ${row.says}`).join("\n") || "None."}`,
      `Homework\n${clip(parsed.homework, 300) || "None."}`,
      `Further reading\n${reading}`,
    ]
      .filter((part) => !part.endsWith("\n"))
      .join("\n\n"),
  );
  const record = sources.map((row) => `${row.title} ${row.href}`).join("\n");
  const { stampBrain } = await import("@/lib/brain-stamp");
  return { text: await stampBrain(text, record, { strict: false }) };
}
