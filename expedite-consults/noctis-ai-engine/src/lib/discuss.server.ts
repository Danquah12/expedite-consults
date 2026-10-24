export type DiscussRead = {
  viewpoints: string[];
  misunderstandings: string[];
  useful: string[];
};

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function lines(value: unknown, count: number) {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const text = clip(item, 180);
    if (!text) continue;
    out.push(text);
    if (out.length >= count) break;
  }
  return out;
}

export async function readDiscussion(comments: { name: string; text: string }[]): Promise<DiscussRead | { error: string }> {
  const body = comments
    .slice(0, 40)
    .map((row, index) => `${index + 1}. ${clip(row.name, 40)}: ${clip(row.text, 280)}`)
    .join("\n");
  if (body.length < 40) return { viewpoints: [], misunderstandings: [], useful: [] };
  const { modelChat } = await import("@/lib/video-mind.server");
  const result = await modelChat(
    [
      {
        role: "system",
        content:
          "Read only these comments. Return JSON with viewpoints (max 3), misunderstandings (max 2), and useful (max 4). Each item must be something the comments actually say. If you cannot see a viewpoint, a misunderstanding, or a useful remark, return an empty list for it. Do not invent a count or a claim.",
      },
      { role: "user", content: body },
    ],
    { temperature: 0.1, maxTokens: 500, json: true },
  );
  if ("error" in result) return { viewpoints: [], misunderstandings: [], useful: [] };
  try {
    const parsed = JSON.parse(result.text || "{}") as Record<string, unknown>;
    return { viewpoints: lines(parsed.viewpoints, 3), misunderstandings: lines(parsed.misunderstandings, 2), useful: lines(parsed.useful, 4) };
  } catch {
    return { viewpoints: [], misunderstandings: [], useful: [] };
  }
}
