import { OPENAI_KEY } from "@/lib/openai-key.server";
import { stripStatus } from "@/lib/evidence";
import { studyBrief } from "@/lib/study-pass";
import { formatMap, walkGraph } from "@/lib/knowledge-graph";
import type { FilmAsk, MindSource, VideoLesson } from "@/lib/video-mind";

type Turn = { role: "user" | "assistant"; content: string };

function key() {
  if (!/^(1|true|yes)$/i.test((process.env.VIBE_ALLOW_OPENAI || "").trim())) return "";
  return (process.env.OPENAI_API_KEY || OPENAI_KEY || "").trim();
}

function customModelConfig() {
  const rawUrl = (process.env.VIBE_MODEL_URL || process.env.OLLAMA_HOST || "").trim();
  if (!rawUrl) return null;
  const endpoint = rawUrl.endsWith("/chat/completions")
    ? rawUrl
    : `${rawUrl.replace(/\/+$/, "")}${rawUrl.includes("/v1") ? "/chat/completions" : "/v1/chat/completions"}`;
  const apiKey = (process.env.VIBE_MODEL_KEY || process.env.GROQ_API_KEY || process.env.TOGETHER_API_KEY || "").trim();
  const model = (process.env.VIBE_MODEL_NAME || "llama-3.3-70b-versatile").trim();
  return { endpoint, apiKey, model };
}

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function linesOf(value: unknown, count: number, max: number) {
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

async function completeOpenAI(apiKey: string, system: string, user: string, json: boolean) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 1800,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 14000) },
      ],
    }),
  });
  if (!res.ok) return { error: "OpenAI did not return an answer." as const };
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return { error: "OpenAI came back empty." as const };
  return { text };
}

async function completeGemini(system: string, user: string, json: boolean) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!apiKey) return null;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1800, ...(json ? { responseMimeType: "application/json" } : {}) },
    }),
  });
  if (!res.ok) return { error: "Gemini did not return an answer." as const };
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) return { error: "Gemini came back empty." as const };
  return { text };
}

async function completeXai(system: string, user: string, json: boolean) {
  const apiKey = (process.env.XAI_API_KEY || "").trim();
  if (!apiKey) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: "grok-3-mini",
      temperature: 0.2,
      max_tokens: 1800,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 14000) },
      ],
    }),
  });
  if (!res.ok) return { error: "Vibe did not return an answer." as const };
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return { error: "Vibe came back empty." as const };
  return { text };
}

type ModelPart = { type?: string; text?: string; image_url?: { url: string } };
type ModelContent = string | ModelPart[];

function textOf(content: ModelContent) {
  if (typeof content === "string") return content;
  return content.map((part) => part.text || "").filter(Boolean).join("\n");
}

function hasPicture(messages: { content: ModelContent }[]) {
  return messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === "image_url" && part.image_url?.url));
}

function chatContent(content: ModelContent): string | { type: string; text?: string; image_url?: { url: string } }[] {
  if (typeof content === "string") return content.slice(0, 16000);
  const parts: { type: string; text?: string; image_url?: { url: string } }[] = [];
  for (const part of content) {
    if (part.type === "image_url" && part.image_url?.url) parts.push({ type: "image_url", image_url: { url: part.image_url.url } });
    else if (part.text) parts.push({ type: "text", text: part.text.slice(0, 8000) });
  }
  return parts.length ? parts : "Look at the attached picture.";
}

async function loadPicture(url: string) {
  if (url.startsWith("data:image/")) return url;
  if (!url.startsWith("https://")) return url;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: "follow" });
    if (!res.ok) return url;
    const type = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim().toLowerCase();
    if (!type.startsWith("image/")) return url;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > 3_500_000) return url;
    const mime = type === "image/jpg" ? "image/jpeg" : type;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return url;
  }
}

async function withPictures(messages: { role: string; content: ModelContent }[]) {
  const next: { role: string; content: ModelContent }[] = [];
  for (const message of messages) {
    if (!Array.isArray(message.content)) {
      next.push(message);
      continue;
    }
    const content: ModelPart[] = [];
    for (const part of message.content) {
      if (part.type === "image_url" && part.image_url?.url) {
        content.push({ type: "image_url", image_url: { url: await loadPicture(part.image_url.url) } });
      } else content.push(part);
    }
    next.push({ role: message.role, content });
  }
  return next;
}

function geminiParts(content: ModelContent) {
  if (typeof content === "string") return [{ text: content.slice(0, 16000) }];
  const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [];
  for (const part of content) {
    if (part.type === "image_url" && part.image_url?.url) {
      const match = part.image_url.url.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
      if (match) parts.push({ inline_data: { mime_type: match[1].toLowerCase(), data: match[2].replace(/\s/g, "") } });
    } else if (part.text) parts.push({ text: part.text.slice(0, 8000) });
  }
  return parts.length ? parts : [{ text: "Look at the attached picture." }];
}

export async function modelChat(
  messages: { role: string; content: ModelContent }[],
  opts: { maxTokens?: number; temperature?: number; json?: boolean } = {},
): Promise<{ text: string } | { error: string }> {
  const maxTokens = opts.maxTokens ?? 2048;
  const temperature = opts.temperature ?? 0.4;
  const json = opts.json === true;
  const picture = hasPicture(messages);
  const ready = picture ? await withPictures(messages) : messages;
  const packed = ready
    .map((message) => ({ role: message.role, content: message.content }))
    .filter((message) => textOf(message.content).trim() || (Array.isArray(message.content) && message.content.some((part) => part.image_url?.url)));
  const system = packed.filter((message) => message.role === "system").map((message) => textOf(message.content)).join("\n\n").slice(0, 24000);
  const talk = packed.filter((message) => message.role !== "system");
  const custom = customModelConfig();
  if (custom && packed.length) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (custom.apiKey) headers.Authorization = `Bearer ${custom.apiKey}`;
      const res = await fetch(custom.endpoint, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: custom.model,
          temperature,
          max_tokens: maxTokens,
          ...(json && !picture ? { response_format: { type: "json_object" } } : {}),
          messages: packed.map((message) => ({
            role: message.role === "system" ? "system" : message.role === "assistant" ? "assistant" : "user",
            content: picture ? chatContent(message.content) : textOf(message.content).slice(0, 16000),
          })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text };
      }
    } catch {
      /* try next provider */
    }
  }
  const vibeKey = (process.env.XAI_API_KEY || "").trim();
  if (vibeKey && packed.length) {
    const models = picture ? ["grok-2-vision-1212", "grok-4"] : ["grok-3", "grok-3-mini"];
    for (const model of models) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${vibeKey}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            model,
            temperature,
            max_tokens: maxTokens,
            ...(json && !picture ? { response_format: { type: "json_object" } } : {}),
            messages: packed.map((message) => ({
              role: message.role === "system" ? "system" : message.role === "assistant" ? "assistant" : "user",
              content: picture ? chatContent(message.content) : textOf(message.content).slice(0, 16000),
            })),
          }),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text };
      } catch {
        /* try the next model */
      }
    }
  }
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (geminiKey && (talk.length || picture)) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: (talk.length ? talk : packed).map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: picture ? geminiParts(message.content) : [{ text: textOf(message.content).slice(0, 16000) }],
          })),
          generationConfig: { temperature, maxOutputTokens: maxTokens, ...(json && !picture ? { responseMimeType: "application/json" } : {}) },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
        if (text) return { text };
      }
    } catch {
      /* try next provider */
    }
  }
  const openai = key();
  if (openai && packed.length) {
    for (const model of picture ? ["gpt-4o"] : ["gpt-4o", "gpt-4o-mini"]) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openai}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            model,
            temperature,
            max_tokens: maxTokens,
            ...(json && !picture ? { response_format: { type: "json_object" } } : {}),
            messages: packed.map((message) => ({
              role: message.role,
              content: picture ? chatContent(message.content) : textOf(message.content).slice(0, 16000),
            })),
          }),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text };
      } catch {
        /* try the next model */
      }
    }
  }
  try {
    const { vibeNativeComplete } = await import("@/lib/noctis-train.server");
    const nativeText = await vibeNativeComplete(
      packed.map((message) => ({ role: message.role, content: textOf(message.content) })),
    );
    if (nativeText?.text) return { text: nativeText.text };
  } catch {
    /* fallback failed */
  }
  return { error: "Vibe could not synthesize an answer for that input." };
}

async function complete(apiKey: string, system: string, user: string, json = false, maxTokens = 1800) {
  const result = await modelChat(
    [
      { role: "system", content: system },
      { role: "user", content: user.slice(0, 14000) },
    ],
    { temperature: 0.2, maxTokens, json },
  );
  if (!("error" in result) && result.text) return result;
  if (apiKey) {
    try {
      const first = await completeOpenAI(apiKey, system, user, json);
      if (!("error" in first)) return first;
    } catch {
      /* ignore */
    }
  }
  return { error: "The lesson did not come back." as const };
}

async function youtubeMeta(id: string) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return { title: "", author: "" };
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, {
      headers: { "user-agent": "Noctis" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { title: "", author: "" };
    const data = (await res.json()) as { title?: string; author_name?: string };
    return { title: clip(data.title, 180), author: clip(data.author_name, 80) };
  } catch {
    return { title: "", author: "" };
  }
}

function cuesFromVtt(vtt: string) {
  const cues: { at: string; text: string }[] = [];
  const blocks = vtt.replace(/\r/g, "").split(/\n\n+/);
  for (const block of blocks) {
    const rows = block.split("\n").map((row) => row.trim()).filter(Boolean);
    const time = rows.find((row) => row.includes("-->"));
    if (!time) continue;
    const stamp = time.split("-->")[0]?.trim().slice(0, 8) || "";
    const text = rows.filter((row) => row !== time && !/^\d+$/.test(row) && row !== "WEBVTT").join(" ");
    const clean = decodeCue(text);
    if (clean) cues.push({ at: stamp, text: clean });
    if (cues.length >= 800) break;
  }
  return cues;
}

function decodeCue(value: string) {
  const named: Record<string, string> = {
    amp: String.fromCharCode(38),
    quot: String.fromCharCode(34),
    apos: String.fromCharCode(39),
    lt: String.fromCharCode(60),
    gt: String.fromCharCode(62),
  };
  let text = value.replace(/<[^>]+>/g, "");
  for (let pass = 0; pass < 2; pass++) {
    const next = text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (all, body: string) => {
      if (body[0] === "#") {
        const hex = body[1] === "x" || body[1] === "X";
        const n = hex ? Number.parseInt(body.slice(2), 16) : Number(body.slice(1));
        return Number.isFinite(n) ? String.fromCodePoint(n) : all;
      }
      return named[body.toLowerCase()] ?? all;
    });
    if (next === text) break;
    text = next;
  }
  return text.replace(/\s+/g, " ").trim();
}

function cueStamp(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function cuesFromTranscript(body: string) {
  if (!body.includes("<text")) return cuesFromVtt(body);
  const cues: { at: string; text: string }[] = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const start = Number(match[1]?.match(/\bstart="([^"]+)"/)?.[1] || 0);
    const text = decodeCue(match[2] || "");
    if (!text) continue;
    cues.push({ at: cueStamp(start), text });
    if (cues.length >= 800) break;
  }
  return cues;
}

const VISION_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15";

type CaptionTrack = { baseUrl: string; languageCode: string; kind: string };

function langBase(code: string) {
  return code.toLowerCase().split(/[-_]/)[0] || "";
}

let youtubeGate: { at: number; cookie: string; visitor: string } | null = null;

async function youtubeSession(fresh = false) {
  if (!fresh && youtubeGate && Date.now() - youtubeGate.at < 10 * 60 * 1000 && youtubeGate.visitor) return youtubeGate;
  const watch = await fetch("https://www.youtube.com/watch?v=jNQXAC9IVRw", {
    headers: { "user-agent": VISION_UA, "accept-language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(12000),
  });
  const reader = watch.body?.getReader();
  let html = "";
  if (reader) {
    const dec = new TextDecoder();
    while (html.length < 250000 && !html.includes("VISITOR_DATA") && !html.includes('"visitorData"')) {
      const step = await reader.read();
      if (step.done) break;
      html += dec.decode(step.value, { stream: !step.done });
    }
    await reader.cancel().catch(() => undefined);
  } else {
    html = (await watch.text()).slice(0, 250000);
  }
  const visitor = html.match(/"VISITOR_DATA":"([^"]+)"/)?.[1] || html.match(/"visitorData":"([^"]+)"/)?.[1] || "";
  const list = typeof watch.headers.getSetCookie === "function" ? watch.headers.getSetCookie() : [];
  const cookie = list.map((row) => row.split(";")[0]).filter(Boolean).join("; ");
  youtubeGate = { at: Date.now(), cookie, visitor };
  return youtubeGate;
}

async function captionTracks(youtubeId: string, fresh = false): Promise<{ tracks: CaptionTrack[]; audio: string }> {
  const gate = await youtubeSession(fresh);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": VISION_UA,
    origin: "https://www.youtube.com",
    "x-youtube-client-name": "101",
    "x-youtube-client-version": "1.02",
  };
  if (gate.visitor) headers["x-goog-visitor-id"] = gate.visitor;
  if (gate.cookie) headers.cookie = gate.cookie;
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      context: {
        client: {
          clientName: "VISIONOS",
          clientVersion: "1.02",
          deviceMake: "Apple",
          deviceModel: "RealityDevice17,1",
          userAgent: VISION_UA,
          osName: "visionOS",
          osVersion: "26.5.23O471",
          hl: "en",
          timeZone: "UTC",
          utcOffsetMinutes: 0,
          ...(gate.visitor ? { visitorData: gate.visitor } : {}),
        },
      },
      videoId: youtubeId,
      playbackContext: { contentPlaybackContext: { html5Preference: "HTML5_PREF_WANTS" } },
    }),
  });
  if (!res.ok) return { tracks: [], audio: "" };
  const data = (await res.json()) as {
    playabilityStatus?: { status?: string };
    videoDetails?: { defaultAudioLanguage?: string; defaultLanguage?: string };
    captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: { baseUrl?: string; languageCode?: string; kind?: string }[] } };
  };
  if (data.playabilityStatus?.status && data.playabilityStatus.status !== "OK") {
    if (!fresh) return captionTracks(youtubeId, true);
    return { tracks: [], audio: "" };
  }
  const tracks: CaptionTrack[] = [];
  for (const row of data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []) {
    const baseUrl = typeof row.baseUrl === "string" ? row.baseUrl : "";
    if (!baseUrl.startsWith("https://www.youtube.com/api/timedtext")) continue;
    if (baseUrl.includes("exp=xpe")) continue;
    tracks.push({ baseUrl, languageCode: row.languageCode || "", kind: row.kind || "" });
  }
  const audio = data.videoDetails?.defaultAudioLanguage || data.videoDetails?.defaultLanguage || "";
  return { tracks, audio };
}

function orderTracks(tracks: CaptionTrack[], audio: string, preferEnglish: boolean) {
  const manual = (row: CaptionTrack) => row.kind !== "asr";
  const audioMatch = (row: CaptionTrack) => {
    const want = langBase(audio);
    return Boolean(want) && langBase(row.languageCode) === want;
  };
  const english = (row: CaptionTrack) => langBase(row.languageCode) === "en";
  const rank = (row: CaptionTrack) => {
    if (preferEnglish && english(row) && manual(row)) return 0;
    if (preferEnglish && english(row)) return 1;
    if (audioMatch(row) && manual(row)) return 2;
    if (audioMatch(row)) return 3;
    if (manual(row)) return 4;
    return 5;
  };
  return [...tracks].sort((a, b) => rank(a) - rank(b));
}

async function cuesForTrack(track: CaptionTrack) {
  const headers: Record<string, string> = { "user-agent": VISION_UA, accept: "text/xml,text/vtt,*/*" };
  if (youtubeGate?.cookie) headers.cookie = youtubeGate.cookie;
  const res = await fetch(track.baseUrl, { headers, signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [] as { at: string; text: string }[];
  return cuesFromTranscript(await res.text());
}

async function spokenTrack(youtubeId: string) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) return { spoken: "", chapters: [] as { at: string; title: string }[] };
  try {
    const { tracks, audio } = await captionTracks(youtubeId);
    for (const track of orderTracks(tracks, audio, true).slice(0, 3)) {
      const cues = await cuesForTrack(track);
      if (cues.length < 4) continue;
      const chapters: { at: string; title: string }[] = [];
      let last = -999;
      cues.forEach((cue, index) => {
        const parts = cue.at.split(":").map((part) => Number(part) || 0);
        const seconds = parts.length === 3 ? parts[0]! * 3600 + parts[1]! * 60 + parts[2]! : parts[0]! * 60 + (parts[1] || 0);
        if (index === 0 || seconds - last >= 90) {
          chapters.push({ at: cue.at, title: cue.text.slice(0, 80) });
          last = seconds;
        }
      });
      return { spoken: cues.map((cue) => cue.text).join(" ").slice(0, 12000), chapters: chapters.slice(0, 12) };
    }
    return { spoken: "", chapters: [] };
  } catch {
    return { spoken: "", chapters: [] };
  }
}

export async function filmSpeech(youtubeId: string) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) return { spoken: "", language: "" };
  try {
    const { tracks, audio } = await captionTracks(youtubeId);
    for (const track of orderTracks(tracks, audio, false).slice(0, 3)) {
      const cues = await cuesForTrack(track);
      const spoken = cues.map((cue) => cue.text).join(" ").replace(/\s+/g, " ").trim();
      if (spoken.length < 12) continue;
      return { spoken: spoken.slice(0, 8000), language: track.languageCode || audio || "" };
    }
    return { spoken: "", language: "" };
  } catch {
    return { spoken: "", language: "" };
  }
}

function titleWords(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length > 3));
}

function titleClose(query: string, found: string) {
  const want = titleWords(query);
  const have = titleWords(found);
  if (want.size < 3 || !have.size) return false;
  let hit = 0;
  for (const word of want) if (have.has(word)) hit += 1;
  return hit >= 3 && hit / want.size >= 0.6;
}

async function youtubeIdForTitle(title: string) {
  const q = title.replace(/\s+/g, " ").trim().slice(0, 140);
  if (q.length < 12) return "";
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
      headers: { "user-agent": VISION_UA, "accept-language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const ids = [...new Set([...html.matchAll(/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((match) => match[1] || ""))].filter(Boolean).slice(0, 4);
    for (const id of ids) {
      const meta = await youtubeMeta(id);
      if (titleClose(q, meta.title)) return id;
    }
    return "";
  } catch {
    return "";
  }
}

export async function filmWords(youtubeId: string, title: string) {
  const direct = await filmSpeech(youtubeId);
  if (direct.spoken) return direct;
  const found = await youtubeIdForTitle(title);
  if (!found || found === youtubeId) return direct;
  return filmSpeech(found);
}

async function headlines(query: string) {
  const q = query.replace(/\s+/g, " ").trim().slice(0, 160);
  if (q.length < 3) return "";
  try {
    const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`, {
      headers: { "user-agent": "Noctis", accept: "application/rss+xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const xml = await res.text();
    const search = `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
    const rows: string[] = [];
    for (const item of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
      const title = (item[1].match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
      const date = (item[1].match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim();
      const publisher = item[1].match(/<source\b([^>]*)>([\s\S]*?)<\/source>/i);
      const href = publisher?.[1]?.match(/url="([^"]+)"/i)?.[1] || "";
      const name = (publisher?.[2] || "").replace(/<[^>]+>/g, "").trim();
      const link = /^https?:\/\//i.test(href) ? href : "";
      if (title) rows.push(`- ${title}${name ? ` — ${name}` : ""}${date ? ` (${date})` : ""}${link ? ` (${link})` : ""}`);
      if (rows.length >= 6) break;
    }
    return rows.length ? `Google News (${search}):\n${rows.join("\n")}` : "";
  } catch {
    return "";
  }
}

async function libraryPacket(question: string) {
  const q = question.trim().slice(0, 400);
  if (q.length < 3) return { text: "", sources: [] as MindSource[] };
  try {
    const { askStudy } = await import("@/lib/knowledge.server");
    const card = await askStudy(q, false);
    const sources = card.evidence
      .filter((row) => row.passage.trim().length > 40 && /^https?:\/\//i.test(row.href) && !/google\.com\/search/i.test(row.href))
      .slice(0, 5)
      .map((row) => ({ title: clip(row.source, 120), href: row.href, note: clip(row.passage, 1800) }));
    const text = [card.sentence, card.note, ...sources.map((row) => `${row.title}: ${row.note} (${row.href})`)].filter(Boolean).join("\n").slice(0, 8000);
    return { text, sources };
  } catch {
    return { text: "", sources: [] as MindSource[] };
  }
}

function topicWords(title: string) {
  const stop = new Set(["master", "english", "video", "learn", "about", "this", "that", "with", "from", "your", "film", "lesson", "what", "how", "for", "and", "the", "sound", "into", "using", "watch", "youtube", "intro", "class", "explained", "tutorial", "official", "full", "part"]);
  return [...new Set(title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3 && !stop.has(word)))];
}

function sameAsTitle(line: string, title: string) {
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const left = norm(line);
  const right = norm(title);
  if (!left || !right) return false;
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function keptSources(sources: MindSource[], title: string) {
  const keys = topicWords(title);
  if (!keys.length) return [];
  return sources.filter((row) => {
    const hay = `${row.title} ${row.note}`.toLowerCase();
    return keys.some((word) => hay.includes(word));
  });
}

function teachingLines(value: unknown, count: number, max: number, title: string) {
  return linesOf(value, count, max).filter((line) => !sameAsTitle(line, title));
}

function namesInFilm(names: string[], spoken: string, title: string) {
  if (spoken.trim().length < 80) return [];
  const hay = `${title} ${spoken}`.toLowerCase();
  return names.filter((name) => name.length > 2 && hay.includes(name.toLowerCase()));
}

function asDifficulty(value: unknown): VideoLesson["difficulty"] {
  return value === "Intermediate" || value === "Advanced" ? value : "Beginner";
}

function parseModelJson(raw: string): Record<string, unknown> | null {
  const text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] || text).trim();
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function readLesson(raw: string, base: VideoLesson): VideoLesson {
  const parsed = parseModelJson(raw);
  if (!parsed) {
    const clean = raw.trim();
    if (!clean) return base;
    const lines = clean.split(/\n+/).map((line) => line.replace(/^[-*\d.)\s]+/, "").trim()).filter((line) => line.length > 20 && !sameAsTitle(line, base.title));
    return {
      ...base,
      plain: clip(lines[0] || clean, 1100),
      summary: clip(lines[1] || lines[0] || clean, 400),
      points: lines.slice(0, 3).map((line) => clip(line, 160)),
      topics: topicWords(base.title).slice(0, 3),
    };
  }
  const vocabulary = Array.isArray(parsed.vocabulary)
    ? parsed.vocabulary
        .map((row) => ({ term: clip((row as { term?: unknown })?.term, 40), says: clip((row as { says?: unknown })?.says, 160) }))
        .filter((row) => row.term && row.says)
        .slice(0, 6)
    : [];
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions
        .map((row) => ({ ask: clip((row as { ask?: unknown })?.ask, 180), answer: clip((row as { answer?: unknown })?.answer, 280) }))
        .filter((row) => row.ask && row.answer)
        .slice(0, 4)
    : [];
  const quiz = Array.isArray(parsed.quiz)
    ? parsed.quiz.flatMap((row) => {
        const ask = clip((row as { ask?: unknown })?.ask, 180);
        const choices = linesOf((row as { choices?: unknown })?.choices, 3, 80);
        const answer = Number((row as { answer?: unknown })?.answer);
        if (!ask || choices.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= choices.length) return [];
        return [{ ask, choices, answer }];
      }).slice(0, 3)
    : [];
  return {
    ...base,
    description: clip(parsed.description, 500) && !sameAsTitle(clip(parsed.description, 500), base.title) ? clip(parsed.description, 500) : base.description,
    difficulty: asDifficulty(parsed.difficulty),
    subject: clip(parsed.subject, 60) || base.subject,
    topics: teachingLines(parsed.topics, 5, 40, base.title).length ? teachingLines(parsed.topics, 5, 40, base.title) : base.topics,
    concepts: teachingLines(parsed.concepts, 5, 40, base.title),
    people: namesInFilm(linesOf(parsed.people, 6, 40), base.spoken, base.title),
    places: namesInFilm(linesOf(parsed.places, 6, 40), base.spoken, base.title),
    organizations: namesInFilm(linesOf(parsed.organizations, 6, 40), base.spoken, base.title),
    claims: base.spoken.trim().length < 80 ? [] : teachingLines(parsed.claims, 4, 220, base.title),
    related: [],
    plain: teachingLines([parsed.plain], 1, 1100, base.title)[0] || "",
    summary: teachingLines([parsed.summary], 1, 400, base.title)[0] || "",
    points: teachingLines(parsed.points, 5, 160, base.title),
    beginner: teachingLines([parsed.beginner], 1, 400, base.title)[0] || "",
    advanced: teachingLines([parsed.advanced], 1, 400, base.title)[0] || "",
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards
          .map((row) => ({ front: clip((row as { front?: unknown })?.front, 80), back: clip((row as { back?: unknown })?.back, 180) }))
          .filter((row) => row.front && row.back && !sameAsTitle(row.back, base.title))
          .slice(0, 4)
      : [],
    vocabulary,
    questions,
    quiz,
    notes: teachingLines(parsed.notes, 4, 220, base.title),
    objectives: teachingLines(parsed.objectives, 3, 160, base.title),
  };
}

export async function videoLesson(input: {
  title: string;
  caption: string;
  author: string;
  youtubeId: string;
}): Promise<VideoLesson | { error: string }> {
  const apiKey = key();
  const id = /^[a-zA-Z0-9_-]{11}$/.test(input.youtubeId) ? input.youtubeId : "";
  const [meta, track] = await Promise.all([
    id ? youtubeMeta(id) : Promise.resolve({ title: "", author: "" }),
    id ? spokenTrack(id) : Promise.resolve({ spoken: "", chapters: [] as { at: string; title: string }[] }),
  ]);
  const title = meta.title || clip(input.title, 180) || "This film";
  const packet = await Promise.race([
    libraryPacket(title),
    new Promise<{ text: string; sources: MindSource[] }>((resolve) => {
      setTimeout(() => resolve({ text: "", sources: [] }), 8000);
    }),
  ]);
  const sources = keptSources(packet.sources, title);
  const author = meta.author || clip(input.author, 80);
  const caption = clip(input.caption, 1200);
  const spoken = track.spoken;
  const base: VideoLesson = {
    title,
    description: caption && !sameAsTitle(caption, title) ? caption : "",
    spoken,
    spokenNote: spoken
      ? "From the captions."
      : "Preview from the title. Not a quote from the speaker.",
    plain: "",
    summary: "",
    points: [],
    beginner: "",
    advanced: "",
    flashcards: [],
    concepts: [],
    people: [],
    places: [],
    organizations: [],
    claims: [],
    related: [],
    difficulty: "Beginner",
    subject: "",
    topics: [],
    vocabulary: [],
    questions: [],
    quiz: [],
    notes: [],
    chapters: track.chapters,
    objectives: [],
    sources,
  };
  const sourceNotes = sources.map((row) => `${row.title}: ${row.note}`).join("\n");
  const stance = spoken
    ? "Teach from the spoken words. Do not add a quotation that is not in those words."
    : "There is no transcript. This is a preview from the title. Teach the subject so the viewer can use it. Do not invent what the speaker said. Do not use quotation marks for a speaker. Example sentences are practice lines for the learner, and you must say they are practice, not a quote.";
  const shape = `Match the subject.
English, charts, speaking, or presentations: each point is a skill plus one sentence the learner can say.
Cybersecurity: each point is a concept plus one defensive step. Do not give attack steps.
Science or engineering: each point is a principle plus one worked example. Label any number that was not in the film as an illustration.
Bible: each point is the idea plus one reflection. Do not add a verse that is not in the captions.
Anything else: each point is something the learner can do.
plain is the introduction. Write five or six sentences. Say what this is about, why it matters, what the learner will be able to do, and one example they can use. Do not copy the title. Do not say the film returned no words.
points is exactly 3 strings.
beginner is one practice task they can do now.
objectives is one apply task for today.
vocabulary is 3 words with a plain meaning.
quiz is 2 questions, 3 choices each, answer is the index.
subject is a short subject name, not the title.
topics is up to 3 short tags.
difficulty is Beginner, Intermediate, or Advanced.`;
  const result = await complete(
    apiKey,
    `${stance}\n${shape}\nReturn JSON with description, difficulty, subject, topics, concepts, plain, summary, points, beginner, advanced, vocabulary (term, says), questions (ask, answer), quiz (ask, choices, answer), notes, objectives. Leave people, places, organizations, and claims empty unless the captions name them.`,
    `Title: ${title}\nChannel: ${author}\nCaption: ${caption || "None."}\nSpoken words: ${spoken ? spoken.slice(0, 6000) : "Not available."}\n\nMatching sources:\n${sourceNotes || "None."}`,
    true,
  );
  if ("error" in result) return { ...base, description: base.description };
  return readLesson(result.text, base);
}

function mapNote(question: string) {
  const walk = walkGraph(question);
  return walk ? `Relationships on the clinic map. Follow these. Do not add an entity that is not here or in the notes.\n${formatMap(walk)}` : "";
}

function closeAnswer(text: string, _record: string) {
  return stripStatus(text);
}

function packetText(packet: FilmAsk) {
  const sources = packet.sources.slice(0, 5).map((row) => `${row.title}: ${row.note} (${row.href})`).join("\n");
  return [
    `Title: ${clip(packet.title, 180)}`,
    `About: ${clip(packet.description, 500)}`,
    packet.concepts.length ? `Concepts: ${packet.concepts.slice(0, 5).join(", ")}` : "",
    packet.notes.length ? `Notes:\n${packet.notes.slice(0, 4).join("\n")}` : "",
    packet.spoken ? `Spoken words:\n${clip(packet.spoken, 6000)}` : "Spoken words: not available.",
    sources ? `Sources:\n${sources}` : "Sources: none retrieved.",
  ].filter(Boolean).join("\n\n");
}

export async function answerFilm(
  packet: FilmAsk,
  question: string,
  mode: "ask" | "tutor",
  turns: Turn[] = [],
): Promise<{ text: string } | { error: string }> {
  const apiKey = key();
  const history = turns
    .filter((turn) => (turn.role === "user" || turn.role === "assistant") && turn.content.trim())
    .slice(-8)
    .map((turn) => `${turn.role === "user" ? "Learner" : "Tutor"}: ${clip(turn.content, 800)}`)
    .join("\n");
  const hasSpoken = packet.spoken.trim().length >= 80;
  const stance = mode === "tutor"
    ? "Teach one step of this subject, then ask one question. If there is no transcript, teach the subject in the title. Do not invent a quote from the speaker."
    : hasSpoken
      ? "Answer from the spoken words and the notes. If they do not contain the point, say the film did not say that, then teach the closest point that is in the words."
      : "There is no transcript. Teach the subject named in the title so the person can use it. Do not invent what the speaker said. Do not say the film is empty when the question is about that subject.";
  const result = await complete(apiKey, `${stance}\n\n${packetText(packet)}\n\n${mapNote(question)}`, `${history ? `${history}\n\n` : ""}${clip(question, 800)}`);
  if ("error" in result) return result;
  return { text: closeAnswer(result.text, `${packetText(packet)}\n${mapNote(packet.title)}`) };
}

export async function researchReport(question: string, pages = ""): Promise<{ text: string } | { error: string }> {
  const apiKey = key();
  const q = clip(question, 700);
  const [packet, news] = await Promise.all([libraryPacket(q), headlines(q)]);
  const map = mapNote(q);
  const notes = [packet.text, news ? `Headlines:\n${news}` : "", pages ? `Pages opened:\n${pages.slice(0, 4000)}` : "", map, studyBrief(q)].filter(Boolean).join("\n\n");
  const result = await complete(
    apiKey,
    [
      "Write a study board the learner can study from. Use these markdown headings, in this order:",
      "## Study notes",
      "## Research",
      "## References",
      "## Practice",
      "## What to study next",
      "Study notes: several short paragraphs. Say what it is, why it matters, and how it works. Enough to study, not a one-line definition. If this is an exam, say who gives it, where to register, what it covers, and what to practise. If the length, price, or passing score is not in the notes, write not on record.",
      "Research: what the opened pages actually say. If a page is a different subject, say it does not answer this question.",
      "References: cite an official vendor or free resource from the allowed study references when this subject matches them. Also cite a URL that appears in the retrieved notes. Do not invent any other URL. If nothing matches, write: No page was opened for this question.",
      "Practice: three short questions, then the answers.",
      "What to study next: one next step on this same subject.",
      "Do not invent a URL, a paper, a quote, or a date. If a retrieved page is a different subject, say so, then teach the subject that was asked. A missed check does not shrink the lesson. Still write every heading, including the steps, one worked example, and what to practise. Do not stop after explaining the check. Do not write an evidence status. Do not stop after a definition.",
    ].join("\n"),
    `Question: ${q}\n\nRetrieved notes:\n${notes || "No page was opened."}`,
    false,
    3600,
  );
  if ("error" in result) {
    return {
      text: closeAnswer(
        `Study notes\nThe report could not be written. These are the notes that were retrieved.\n\n${notes.slice(0, 2500) || "No page was opened for this question."}\n\nReferences\nNo page was opened for this question.`,
        notes,
      ),
    };
  }
  return { text: closeAnswer(result.text, notes) };
}

export async function tutorReply(turns: Turn[], pages = ""): Promise<{ text: string } | { error: string }> {
  const apiKey = key();
  const last = [...turns].reverse().find((turn) => turn.role === "user");
  const question = clip(last?.content, 500);
  const [packet, news] = await Promise.all([libraryPacket(question), headlines(question)]);
  const notes = [packet.text, news ? `Headlines:\n${news}` : "", pages ? `Pages opened:\n${pages.slice(0, 3000)}` : "", mapNote(question)].filter(Boolean).join("\n\n");
  const history = turns.slice(-8).map((turn) => `${turn.role === "user" ? "Learner" : "Tutor"}: ${clip(turn.content, 800)}`).join("\n");
  const result = await complete(
    apiKey,
    "You are a tutor. Do the next step only, then ask one question. Explain simply, or give one analogy, or check the learner's last answer and name the weak spot. Use the retrieved notes and the clinic map when they exist. If they do not, say you are explaining without a retrieved source. Do not invent a citation. Do not write an evidence status.",
    `${notes ? `Retrieved notes:\n${notes}\n\n` : ""}${history}`,
  );
  if ("error" in result) return result;
  return { text: closeAnswer(result.text, notes) };
}
