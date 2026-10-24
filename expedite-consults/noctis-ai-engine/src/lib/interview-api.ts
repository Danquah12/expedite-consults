import { createServerFn } from "@tanstack/react-start";

export const scoreInterview = createServerFn({ method: "POST" })
  .validator((input: { seat: string; question: string; answer: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "unavailable" };
    const answer = data.answer.trim().slice(0, 1200);
    if (answer.length < 24) return { ok: false as const, error: "short" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content:
              "You coach a mock interview. Score STAR: Situation, Task, Action, Result. Reply with four short lines: Score (0-10), Missing, Keep, Retry. No preamble.",
          },
          {
            role: "user",
            content: `Seat: ${data.seat}\nQuestion: ${data.question}\nAnswer: ${answer}`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `xAI ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "" };
  });