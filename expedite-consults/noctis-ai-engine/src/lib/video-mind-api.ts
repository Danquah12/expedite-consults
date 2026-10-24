import { createServerFn } from "@tanstack/react-start";
import type { FilmAsk, MindSource, VideoLesson } from "@/lib/video-mind";

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function sources(value: unknown): MindSource[] {
  if (!Array.isArray(value)) return [];
  const out: MindSource[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const title = clip((row as { title?: unknown }).title, 120);
    const href = clip((row as { href?: unknown }).href, 300);
    const note = clip((row as { note?: unknown }).note, 400);
    if (!title || !/^https?:\/\//i.test(href)) continue;
    out.push({ title, href, note });
    if (out.length >= 5) break;
  }
  return out;
}

function packet(input: unknown): FilmAsk {
  const row = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const notes = Array.isArray(row.notes) ? row.notes.map((item) => clip(item, 220)).filter(Boolean).slice(0, 4) : [];
  const concepts = Array.isArray(row.concepts) ? row.concepts.map((item) => clip(item, 40)).filter(Boolean).slice(0, 5) : [];
  return {
    title: clip(row.title, 180),
    description: clip(row.description, 500),
    spoken: clip(row.spoken, 6000),
    notes,
    concepts,
    sources: sources(row.sources),
  };
}

function turns(value: unknown) {
  if (!Array.isArray(value)) return [];
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const turn of value) {
    if (!turn || typeof turn !== "object") continue;
    const role = (turn as { role?: unknown }).role;
    const content = clip((turn as { content?: unknown }).content, 800);
    if ((role !== "user" && role !== "assistant") || !content) continue;
    out.push({ role, content });
    if (out.length >= 8) break;
  }
  return out;
}

export const loadFilmSpeech = createServerFn({ method: "POST" })
  .validator((input: { youtubeId?: unknown; title?: unknown } | undefined) => ({
    youtubeId: /^[a-zA-Z0-9_-]{11}$/.test(clip(input?.youtubeId, 11)) ? clip(input?.youtubeId, 11) : "",
    title: clip(input?.title, 180),
  }))
  .handler(async ({ data }) => {
    const { filmWords } = await import("@/lib/video-mind.server");
    return filmWords(data.youtubeId, data.title);
  });

export const loadVideoLesson = createServerFn({ method: "POST" })
  .validator((input: { title?: unknown; caption?: unknown; author?: unknown; youtubeId?: unknown } | undefined) => ({
    title: clip(input?.title, 180),
    caption: clip(input?.caption, 1200),
    author: clip(input?.author, 80),
    youtubeId: /^[a-zA-Z0-9_-]{11}$/.test(clip(input?.youtubeId, 11)) ? clip(input?.youtubeId, 11) : "",
  }))
  .handler(async ({ data }): Promise<VideoLesson | { error: string }> => {
    if (!data.title && !data.caption && !data.youtubeId) return { error: "This film has no title to study." };
    const { videoLesson } = await import("@/lib/video-mind.server");
    return videoLesson(data);
  });

export const askAboutVideo = createServerFn({ method: "POST" })
  .validator((input: { packet?: unknown; question?: unknown; mode?: unknown; turns?: unknown } | undefined) => ({
    packet: packet(input?.packet),
    question: clip(input?.question, 800),
    mode: input?.mode === "tutor" ? ("tutor" as const) : ("ask" as const),
    turns: turns(input?.turns),
  }))
  .handler(async ({ data }) => {
    if (!data.question) return { error: "Ask something about the film." };
    const { answerFilm } = await import("@/lib/video-mind.server");
    return answerFilm(data.packet, data.question, data.mode, data.turns);
  });

export const askResearch = createServerFn({ method: "POST" })
  .validator((input: { question?: unknown } | undefined) => ({ question: clip(input?.question, 500) }))
  .handler(async ({ data }) => {
    if (!data.question) return { error: "Write what you want researched." };
    const { researchReport } = await import("@/lib/video-mind.server");
    return researchReport(data.question);
  });
