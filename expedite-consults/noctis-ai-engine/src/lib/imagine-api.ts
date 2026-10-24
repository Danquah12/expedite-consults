import { createServerFn } from "@tanstack/react-start";

function imagineKey() {
  return process.env.XAI_API_KEY?.trim() || "";
}

async function imagineStill(apiKey: string, prompt: string) {
  for (const model of ["grok-imagine-image-2.0", "grok-imagine-image"]) {
    try {
      const res = await fetch("https://api.x.ai/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          model,
          prompt: `${prompt.slice(0, 700)}. Cinematic photograph, beautiful light. No text, no letters, no watermark.`,
          n: 1,
          aspect_ratio: "9:16",
          resolution: "1k",
        }),
      });
      if (!res.ok) continue;
      const body = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
      const hit = body.data?.[0];
      if (hit?.url) return { image: hit.url, source: hit.url };
      if (hit?.b64_json) {
        const image = `data:image/jpeg;base64,${hit.b64_json}`;
        return { image, source: image };
      }
    } catch {
      /* try the next Imagine model */
    }
  }
  return null;
}

export const startImagine = createServerFn({ method: "POST" })
  .validator((input: { prompt?: unknown; words?: unknown; kind?: unknown; image?: unknown }) => ({
    prompt: typeof input?.prompt === "string" ? input.prompt.trim().slice(0, 800) : "",
    words: typeof input?.words === "string" ? input.words.trim().slice(0, 700) : "",
    kind: input?.kind === "song" || input?.kind === "speech" ? input.kind : "",
    image: typeof input?.image === "string" && input.image.length < 1_400_000 ? input.image : "",
  }))
  .handler(async ({ data }) => {
    const apiKey = imagineKey();
    if (!apiKey) return { error: "Imagine is not connected." };
    if (data.prompt.length < 2 && data.words.length < 2 && !data.image) return { error: "Paste the words, or describe the picture." };
    const scene = data.prompt || data.words || "A beautiful cinematic scene";
    const visual = `Background picture for these words. Show the place, light, and people or objects the words are about. ${scene}`;
    const shot = data.image ? { image: data.image, source: data.image } : await imagineStill(apiKey, visual);
    if (!shot) return { error: "Imagine did not get a picture back." };
    const spoken = data.words || data.prompt;
    const motion =
      data.kind === "song"
        ? `This is one 15-second part of a 45-second film. A relevant background. Music underneath. A bold voice sings only these exact words for the whole 15 seconds. Natural pace, with pauses. Do not rush and do not finish early. Do not add a new word: ${spoken}. No text on the screen.`
        : data.kind === "speech"
          ? `This is one 15-second part of a 45-second film. A relevant background. A bold, deep voice speaks only these exact words for the whole 15 seconds. Natural flow, with a pause after each phrase. Do not rush and do not finish early. Do not add a new word: ${spoken}. No text on the screen.`
          : `${visual}. Gentle cinematic motion, the picture comes alive. No words on the screen.`;
    let requestId = "";
    let failure = "Imagine did not start the film.";
    for (const model of ["grok-imagine-video-1.5-lite", "grok-imagine-video-1.5"]) {
      try {
        const res = await fetch("https://api.x.ai/v1/videos/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            model,
            prompt: motion.slice(0, 1000),
            image: shot.source.startsWith("data:") ? shot.source : { url: shot.source },
            duration: 15,
            resolution: "480p",
            aspect_ratio: "9:16",
          }),
        });
        if (!res.ok) {
          failure = `Imagine film ${res.status}`;
          continue;
        }
        const body = (await res.json()) as { request_id?: string; id?: string };
        requestId = body.request_id || body.id || "";
        if (requestId) break;
      } catch {
        failure = "Imagine could not reach the film service.";
      }
    }
    return { image: shot.image, requestId, error: requestId ? "" : failure };
  });

export const readImagine = createServerFn({ method: "POST" })
  .validator((input: { requestId?: unknown }) => ({
    requestId: typeof input?.requestId === "string" ? input.requestId.trim().slice(0, 80) : "",
  }))
  .handler(async ({ data }) => {
    const apiKey = imagineKey();
    if (!apiKey || !data.requestId) return { status: "failed", error: "Imagine lost the film." };
    try {
      const res = await fetch(`https://api.x.ai/v1/videos/${data.requestId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) return { status: "pending" };
      const body = (await res.json()) as { status?: string; url?: string; video?: { url?: string } };
      const video = body.video?.url || body.url || "";
      if (video) return { status: "done", video };
      const status = String(body.status || "").toLowerCase();
      if (status === "failed" || status === "error" || status === "expired") return { status: "failed", error: "Imagine could not finish the film." };
      return { status: "pending" };
    } catch {
      return { status: "pending" };
    }
  });

export const bringImagineFile = createServerFn({ method: "POST" })
  .validator((input: { url?: unknown }) => {
    const url = typeof input?.url === "string" ? input.url.trim() : "";
    return { url: /^https:\/\/(vidgen|imgen)\.x\.ai\//.test(url) ? url.slice(0, 600) : "" };
  })
  .handler(async ({ data }) => {
    if (!data.url) return { error: "That film cannot be attached." };
    try {
      const res = await fetch(data.url, { signal: AbortSignal.timeout(40000) });
      if (!res.ok) return { error: "The film could not be fetched." };
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 800 || buf.byteLength > 18_000_000) return { error: "The film is the wrong size." };
      const mime = (res.headers.get("content-type") || "video/mp4").split(";")[0].trim();
      return { file: `data:${mime};base64,${buf.toString("base64")}`, mime };
    } catch {
      return { error: "The film could not be fetched." };
    }
  });

export const bringPortrait = createServerFn({ method: "POST" })
  .validator((input: { url?: unknown }) => {
    const raw = typeof input?.url === "string" ? input.url.trim() : "";
    try {
      const url = new URL(raw);
      const host = url.hostname;
      const blocked = url.protocol !== "https:" || host === "localhost" || host.endsWith(".local") || /^(10\.|127\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(host);
      return { url: blocked ? "" : raw.slice(0, 800) };
    } catch {
      return { url: "" };
    }
  })
  .handler(async ({ data }) => {
    if (!data.url) return { error: "That picture cannot be used." };
    try {
      const res = await fetch(data.url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) return { error: "That picture cannot be used." };
      const mime = (res.headers.get("content-type") || "").split(";")[0].trim();
      if (!mime.startsWith("image/")) return { error: "That picture cannot be used." };
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 80 || buf.byteLength > 5_000_000) return { error: "That picture cannot be used." };
      return { file: `data:${mime};base64,${buf.toString("base64")}` };
    } catch {
      return { error: "That picture cannot be used." };
    }
  });
