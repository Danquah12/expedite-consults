import { createServerFn } from "@tanstack/react-start";
import { HALL_VOICES, parseLessonSong, type LessonSong, type LessonVoice } from "@/lib/lesson-song";
import type { VibeLane } from "@/lib/noctis";

export const writeLessonSong = createServerFn({ method: "POST" })
  .validator((input: { passage: string; source: string; lane: VibeLane; voice: LessonVoice }) => input)
  .handler(async ({ data }): Promise<{ ok: true; song: LessonSong } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "studio-offline" };
    const passage = data.passage.trim().slice(0, 1200);
    const source = data.source.trim().slice(0, 80);
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 800,
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write a short study SONG from a pasted passage (Bible, literature, textbook, notes). Stay faithful: do not invent scripture, quotes, or facts. Chorus is the hook a student can hum. Verses carry the lesson. Four cinematic scene stills, no text in the image. JSON only.",
          },
          {
            role: "user",
            content: `Source label (may be empty): ${source || "(none)"}\nLane: ${data.lane} (${data.lane === "laugh" ? "upbeat" : data.lane === "local" ? "syncopated" : "gospel-study groove"})\nVoice: ${data.voice}\nPassage:\n${passage}\n\nReturn JSON with keys: title, source, stamp (2-3 words), hook (one unforgettable line), chorus (2 to 4 short singable lines, under 8 words each, using the passage's own words), lines (6 to 8 verse lines, under 8 words, still the passage), bpm (94-122, a groove not a lecture), scenes (exactly 4 objects: {caption, visual} where visual is a photoreal cinematic 9:16 still with NO text, letters, logos, or watermarks — architecture, light, landscape, objects), teach: { hook, stamp, prompt, options: [{id,label,ok}] } with exactly one ok:true option that tests the passage.`,
          },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    return { ok: true, song: parseLessonSong(text, passage, source, data.lane, data.voice) };
  });

async function oneStill(apiKey: string, visual: string): Promise<string | null> {
  const prompt = `Award-winning cinematic still photograph, vertical 9:16, anamorphic 50mm, shallow depth of field, rich color grade, volumetric light, fine film grain. No people faces. No text, no letters, no numbers, no watermark, no logo, no UI, no captions. ${visual}. Museum-quality lighting.`;
  const tryModel = async (model: string) => {
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        resolution: "1K",
        aspect_ratio: "9:16",
        response_format: "b64_json",
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const hit = body.data?.[0];
    if (hit?.b64_json) return `data:image/jpeg;base64,${hit.b64_json}`;
    if (hit?.url) {
      const img = await fetch(hit.url);
      if (!img.ok) return null;
      const buf = Buffer.from(await img.arrayBuffer());
      const mime = img.headers.get("content-type") || "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
    return null;
  };
  return (await tryModel("grok-imagine-image-2.0")) ?? (await tryModel("grok-imagine-image"));
}

export const paintLessonScenes = createServerFn({ method: "POST" })
  .validator((input: { visuals: string[] }) => input)
  .handler(async ({ data }): Promise<{ ok: true; images: (string | null)[] } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "studio-offline" };
    const visuals = data.visuals.slice(0, 4);
    const images = await Promise.all(visuals.map((visual) => oneStill(apiKey, visual)));
    return { ok: true, images };
  });

export const singLesson = createServerFn({ method: "POST" })
  .validator((input: { lines: string[]; chorus?: string[]; hook: string; lane: VibeLane; voice: LessonVoice }) => input)
  .handler(async ({ data }): Promise<{ ok: true; audio: string } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "studio-offline" };
    const tts = HALL_VOICES.find((v) => v.id === data.voice)?.tts ?? (data.voice === "male" ? "helix" : "eve");
    const chorus = (data.chorus?.length ? data.chorus : [data.hook])
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join("\n");
    const verses = data.lines
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 8)
      .join("\n");
    const text = `<sing>\n${chorus}\n[pause]\n${verses}\n[breath]\n${chorus}\n</sing>`.slice(0, 1400);
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: tts,
        language: "en",
        codec: "mp3",
        sample_rate: 44100,
      }),
    });
    if (!res.ok) return { ok: false, error: `tts ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 400) return { ok: false, error: "tts empty" };
    const mime = res.headers.get("content-type") || "audio/mpeg";
    return { ok: true, audio: `data:${mime};base64,${buf.toString("base64")}` };
  });
