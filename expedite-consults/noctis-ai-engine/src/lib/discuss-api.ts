import { createServerFn } from "@tanstack/react-start";

export const readDiscussion = createServerFn({ method: "POST" })
  .validator((input: { comments?: unknown } | undefined) => {
    const rows = Array.isArray(input?.comments) ? input.comments : [];
    const comments: { name: string; text: string }[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const name = typeof (row as { name?: unknown }).name === "string" ? (row as { name: string }).name.slice(0, 40) : "";
      const text = typeof (row as { text?: unknown }).text === "string" ? (row as { text: string }).text.replace(/\s+/g, " ").trim().slice(0, 280) : "";
      if (!text) continue;
      comments.push({ name, text });
      if (comments.length >= 40) break;
    }
    return { comments };
  })
  .handler(async ({ data }) => {
    const { readDiscussion: read } = await import("@/lib/discuss.server");
    return read(data.comments);
  });
