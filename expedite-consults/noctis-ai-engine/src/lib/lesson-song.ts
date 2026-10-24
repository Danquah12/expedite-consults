import type { Teach } from "@/lib/feed-data";
import type { VibeLane } from "@/lib/noctis";
import { splitSentences } from "@/lib/utils";

export type LessonVoice = "female" | "male";
export type LessonScene = {
  caption: string;
  visual: string;
  imageUrl?: string;
};

export type LessonSong = {
  title: string;
  source: string;
  stamp: string;
  hook: string;
  chorus: string[];
  lines: string[];
  scenes: LessonScene[];
  bpm: number;
  lane: VibeLane;
  voice: LessonVoice;
  teach: Teach;
};

export const HALL_VOICES: { id: LessonVoice; label: string; tts: string; line: string }[] = [
  { id: "female", label: "Female", tts: "eve", line: "Eve — bright, sings the hook" },
  { id: "male", label: "Male", tts: "helix", line: "Helix — bold, carries the beat" },
];

const BPM: Record<VibeLane, number> = { learn: 96, laugh: 118, local: 104 };

const SETS: { test: RegExp; beds: string[] }[] = [
  {
    test: /nist|cyber|iam|control|security|identity|rmf|fisma|access|catalog/,
    beds: [
      "cinematic night security operations room, dark monitors with amber reflections only, shallow depth of field, no text no logos",
      "brass key and frosted access card on black stone, single warm spotlight, identity still life, no text",
      "empty data-hall corridor, teal emergency lights in fog, cathedral of racks, no text no logos",
      "abstract golden lattice of control architecture receding into darkness, volumetric light, no text",
    ],
  },
  {
    test: /bible|psalm|proverb|genesis|gospel|john |matthew|isaiah|scripture|sermon/,
    beds: [
      "dawn through a chapel window onto an empty lectern, dust in the beam, no text",
      "olive grove at first light, stone path, cinematic still, no people, no text",
      "candle and open vellum on oak, night window, letters too soft to read, no text",
      "empty choir stalls, warm lamps, reverence, no text",
    ],
  },
  {
    test: /space|planet|nasa|universe|galaxy|orbit|star /,
    beds: [
      "earth from orbit at terminator, thin gold atmosphere, no text no logos",
      "nebula in deep indigo with a single warm star, cinematic IMAX still, no text",
      "quiet mission control at night, consoles dark, one amber lamp, no screens readable, no text",
      "lunar surface at sunrise, long shadows, no text no flags",
    ],
  },
  {
    test: /health|clinic|patient|anatomy|nursing|medicine/,
    beds: [
      "empty clinic corridor at dusk, chart light on a desk, no text no faces",
      "glass anatomy model in warm museum light, shallow focus, no labels",
      "linen and stethoscope on a wooden table, morning window, no text",
      "quiet ward window, rain, city lights, no text",
    ],
  },
];

const DEFAULT_BEDS = [
  "open book on a walnut desk, single brass lamp, night rain on the window, no text",
  "hands turning a worn page beside a notebook, warm study light, no faces, no text",
  "quiet campus hall with lamps and empty chairs, dusk, no text no logos",
  "dawn through tall windows onto a lectern, dust in the light, no text",
];

function clampText(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).trim()}…`;
}

function sentences(passage: string) {
  return splitSentences(passage, ".?!;:").filter((s) => s.length > 2);
}

function chunkWords(text: string, max = 7) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += max) lines.push(words.slice(i, i + max).join(" "));
  return lines;
}

function bedsFor(passage: string, source: string) {
  const hay = `${passage} ${source}`.toLowerCase();
  return SETS.find((s) => s.test.test(hay))?.beds ?? DEFAULT_BEDS;
}

function localScenes(passage: string, source: string): LessonScene[] {
  const bits = sentences(passage);
  const groups = bits.length >= 4 ? bits.slice(0, 4) : chunkWords(passage, 10).slice(0, 4);
  while (groups.length < 4) groups.push(groups[0] ?? passage);
  const beds = bedsFor(passage, source);
  return groups.map((caption, i) => ({
    caption: clampText(caption, 90),
    visual: beds[i % beds.length],
  }));
}

function localChorus(bits: string[], hook: string) {
  const a = clampText(bits[0] ?? hook, 42);
  const b = clampText(bits[1] ?? bits[0] ?? hook, 42);
  return a === b ? [a, clampText(`${a}`, 42)] : [a, b];
}

export function localLessonSong(passage: string, source: string, lane: VibeLane, voice: LessonVoice = "female"): LessonSong {
  const bits = sentences(passage);
  const first = bits[0] ?? clampText(passage, 72);
  const rest = bits.slice(1).join(" ");
  const lines = chunkWords(rest || first, 7).filter(Boolean).slice(0, 8);
  while (lines.length < 4) lines.push(clampText(first, 48));
  const hook = clampText(first, 64);
  const chorus = localChorus(bits, hook);
  const stamp = clampText(source || "Hall lesson", 22);
  const title = clampText(source ? `${source}` : hook, 42);
  const distractor = lines[1] ?? "The comments";
  return {
    title,
    source: stamp,
    stamp,
    hook,
    chorus,
    lines,
    scenes: localScenes(passage, source),
    bpm: BPM[lane],
    lane,
    voice,
    teach: {
      hook,
      stamp,
      prompt: "What should stick from this lesson song?",
      options: [
        { id: "a", label: hook, ok: true },
        { id: "b", label: clampText(distractor, 48), ok: false },
        { id: "c", label: "Skip the drill", ok: false },
      ],
    },
  };
}

export function parseLessonSong(raw: string, passage: string, source: string, lane: VibeLane, voice: LessonVoice = "female"): LessonSong {
  const fallback = localLessonSong(passage, source, lane, voice);
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return fallback;
    const data = JSON.parse(json) as Partial<LessonSong> & {
      drill?: Teach;
      options?: Teach["options"];
      prompt?: string;
    };
    const lines = Array.isArray(data.lines) ? data.lines.map((l) => String(l).trim()).filter(Boolean).slice(0, 10) : fallback.lines;
    const chorus = Array.isArray(data.chorus)
      ? data.chorus.map((l) => String(l).trim()).filter(Boolean).slice(0, 4)
      : fallback.chorus;
    const hook = String(data.hook || chorus[0] || lines[0] || fallback.hook);
    const stamp = String(data.stamp || source || fallback.stamp);
    const options = data.teach?.options ?? data.drill?.options ?? data.options;
    const prompt = data.teach?.prompt ?? data.drill?.prompt ?? data.prompt ?? fallback.teach.prompt;
    const safeOptions =
      Array.isArray(options) && options.length >= 2
        ? options.slice(0, 3).map((o, i) => ({
            id: String(o.id ?? ["a", "b", "c"][i]),
            label: clampText(String(o.label ?? ""), 56),
            ok: Boolean(o.ok),
          }))
        : fallback.teach.options;
    if (!safeOptions.some((o) => o.ok)) safeOptions[0].ok = true;
    const beds = bedsFor(passage, source);
    const scenes = Array.isArray(data.scenes)
      ? data.scenes.slice(0, 4).map((s, i) => ({
          caption: clampText(String(s?.caption || chorus[i] || lines[i] || hook), 90),
          visual: String(s?.visual || beds[i % beds.length]),
          imageUrl: s?.imageUrl,
        }))
      : fallback.scenes;
    while (scenes.length < 4) scenes.push(fallback.scenes[scenes.length] ?? fallback.scenes[0]);
    return {
      title: clampText(String(data.title || stamp), 42),
      source: clampText(String(data.source || source || stamp), 48),
      stamp: clampText(stamp, 22),
      hook: clampText(hook, 72),
      chorus: chorus.length ? chorus : fallback.chorus,
      lines: lines.length ? lines : fallback.lines,
      scenes,
      bpm: Math.min(126, Math.max(88, Number(data.bpm) || BPM[lane])),
      lane,
      voice,
      teach: { hook: clampText(hook, 72), stamp: clampText(stamp, 22), prompt, options: safeOptions },
    };
  } catch {
    return fallback;
  }
}

function env(ctx: OfflineAudioContext, start: number, dur: number, peak: number, dest: AudioNode) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  g.connect(dest);
  return g;
}

function noise(ctx: OfflineAudioContext, start: number, dur: number, peak: number, hp: number, dest: AudioNode) {
  const frames = Math.floor(dur * ctx.sampleRate);
  const buf = ctx.createBuffer(1, Math.max(1, frames), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  src.connect(filter);
  filter.connect(env(ctx, start, dur, peak, dest));
  src.start(start);
}

function kick(ctx: OfflineAudioContext, t: number, dest: AudioNode, peak = 0.9) {
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(168, t);
  o.frequency.exponentialRampToValueAtTime(36, t + 0.14);
  o.connect(env(ctx, t, 0.32, peak, dest));
  o.start(t);
  o.stop(t + 0.32);
}

function clap(ctx: OfflineAudioContext, t: number, dest: AudioNode) {
  noise(ctx, t, 0.11, 0.42, 900, dest);
  noise(ctx, t + 0.014, 0.08, 0.22, 2400, dest);
}

function hat(ctx: OfflineAudioContext, t: number, dest: AudioNode, open = false) {
  noise(ctx, t, open ? 0.11 : 0.028, open ? 0.14 : 0.09, open ? 6200 : 9000, dest);
}

function tone(ctx: OfflineAudioContext, t: number, dur: number, freq: number, type: OscillatorType, peak: number, dest: AudioNode) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.connect(env(ctx, t, dur, peak, dest));
  o.start(t);
  o.stop(t + dur);
}

export async function renderBed(bpm: number, bars: number, lane: VibeLane): Promise<AudioBuffer> {
  const sr = 44100;
  const beat = 60 / bpm;
  const dur = bars * 4 * beat + 0.4;
  const ctx = new OfflineAudioContext(2, Math.ceil(dur * sr), sr);
  const master = ctx.createGain();
  master.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3.4;
  comp.attack.value = 0.004;
  comp.release.value = 0.14;
  master.connect(comp);
  comp.connect(ctx.destination);
  const groove = lane === "laugh" ? "floor" : lane === "local" ? "swing" : "gospel";
  const roots = groove === "floor" ? [196, 220, 174, 247] : groove === "swing" ? [146, 174, 164, 196] : [164, 196, 174, 220];
  const scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];

  for (let bar = 0; bar < bars; bar++) {
    const root = roots[bar % roots.length];
    const t0 = bar * 4 * beat;
    for (let b = 0; b < 4; b++) {
      const swing = groove === "swing" && b % 2 === 1 ? beat * 0.07 : 0;
      const t = t0 + b * beat + swing;
      if (groove === "floor" || b === 0 || b === 2 || (groove === "gospel" && b === 3)) kick(ctx, t, master, b === 0 ? 0.95 : 0.7);
      if (groove === "gospel" && b === 1) kick(ctx, t + beat * 0.5, master, 0.38);
      if (b === 1 || b === 3) clap(ctx, t, master);
      hat(ctx, t, master, false);
      hat(ctx, t + beat * 0.5, master, groove === "floor");
      if (groove === "floor") {
        hat(ctx, t + beat * 0.25, master, false);
        hat(ctx, t + beat * 0.75, master, false);
      }
    }
    tone(ctx, t0, 4 * beat * 0.9, root / 2, "sine", 0.3, master);
    if (groove !== "floor") tone(ctx, t0 + 2.5 * beat, beat * 0.55, (root / 2) * 1.125, "sine", 0.18, master);
    for (const r of [1, 5 / 4, 3 / 2]) tone(ctx, t0 + 0.03, 4 * beat * 0.86, root * r, "triangle", 0.05, master);
    if (bar % 2 === 0) {
      for (let i = 0; i < 4; i++) {
        const note = scale[(bar + i * 2) % scale.length];
        tone(ctx, t0 + i * beat + beat * 0.5, beat * 0.32, root * note * 2, "sine", 0.07, master);
      }
    }
  }
  return ctx.startRendering();
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const ch = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const frames = buffer.length;
  const bytes = frames * ch * 2;
  const out = new ArrayBuffer(44 + bytes);
  const view = new DataView(out);
  const write = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + bytes, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, bytes, true);
  const channels = Array.from({ length: ch }, (_, i) => buffer.getChannelData(i));
  let o = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([out], { type: "audio/wav" });
}

export async function decodeAudio(src: Blob | string, sampleRate?: number): Promise<AudioBuffer> {
  const ctx = new AudioContext(sampleRate ? { sampleRate } : undefined);
  const data = typeof src === "string" ? await (await fetch(src)).arrayBuffer() : await src.arrayBuffer();
  const buf = await ctx.decodeAudioData(data.slice(0));
  await ctx.close();
  return buf;
}

export async function mixVocal(bed: AudioBuffer, vocal: AudioBuffer): Promise<AudioBuffer> {
  const sr = bed.sampleRate;
  const length = Math.max(bed.length, Math.ceil(vocal.duration * sr) + Math.floor(sr * 0.4));
  const off = new OfflineAudioContext(2, length, sr);
  const bedSrc = off.createBufferSource();
  bedSrc.buffer = bed;
  bedSrc.loop = true;
  const bedGain = off.createGain();
  bedGain.gain.value = 0.5;
  const hp = off.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 70;
  bedSrc.connect(hp).connect(bedGain).connect(off.destination);
  bedSrc.start(0);
  bedSrc.stop(length / sr);
  const take = off.createBufferSource();
  take.buffer = vocal;
  const takeGain = off.createGain();
  takeGain.gain.value = 1.12;
  take.connect(takeGain).connect(off.destination);
  take.start(0.12);
  return off.startRendering();
}

export async function mixTake(bed: AudioBuffer, vocalBlob: Blob): Promise<AudioBuffer> {
  const vocal = await decodeAudio(vocalBlob, bed.sampleRate);
  return mixVocal(bed, vocal);
}

function token(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number, limit = 4) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  let n = 0;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (c.measureText(next).width > max) {
      c.fillText(line, x, yy);
      line = w;
      yy += lh;
      n += 1;
      if (n >= limit) return;
    } else line = next;
  }
  if (line) c.fillText(line, x, yy);
}

const PALETTES = [
  { sky: "#070b14", mid: "#152238", glow: "#e4b86a", fog: "#1c3a48", ink: "#05070c" },
  { sky: "#100814", mid: "#2a1630", glow: "#d4785c", fog: "#1a2848", ink: "#0a0610" },
  { sky: "#061410", mid: "#123028", glow: "#c9b07a", fog: "#204050", ink: "#04100c" },
  { sky: "#0c1018", mid: "#243044", glow: "#8eb4d4", fog: "#2a3848", ink: "#080c12" },
];

function paintAtmosphere(c: CanvasRenderingContext2D, w: number, h: number, index: number) {
  const p = PALETTES[index % PALETTES.length];
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, p.sky);
  sky.addColorStop(0.45, p.mid);
  sky.addColorStop(1, p.ink);
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  const lamp = c.createRadialGradient(w * (0.35 + (index % 3) * 0.15), h * 0.28, 8, w * 0.45, h * 0.32, w * 0.7);
  lamp.addColorStop(0, `${p.glow}cc`);
  lamp.addColorStop(0.18, `${p.glow}44`);
  lamp.addColorStop(1, "transparent");
  c.fillStyle = lamp;
  c.fillRect(0, 0, w, h);
  c.fillStyle = p.fog;
  c.globalAlpha = 0.28;
  c.beginPath();
  c.ellipse(w * 0.5, h * 0.72, w * 0.7, h * 0.18, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;
  c.fillStyle = p.ink;
  c.globalAlpha = 0.55;
  const base = h * 0.62 + (index % 2) * 20;
  c.fillRect(0, base, w, h);
  for (let i = 0; i < 5; i++) {
    const x = (i / 5) * w + (index * 17) % 40;
    const bw = 28 + ((i + index) % 3) * 18;
    const bh = 80 + ((i * 37 + index * 13) % 160);
    c.globalAlpha = 0.35;
    c.fillRect(x, base - bh, bw, bh);
  }
  c.globalAlpha = 1;
  const vig = c.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.72);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  c.fillStyle = vig;
  c.fillRect(0, 0, w, h);
  const grain = c.getImageData(0, 0, w, h);
  const d = grain.data;
  for (let i = 0; i < d.length; i += 16) {
    const n = (Math.random() - 0.5) * 18;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  c.putImageData(grain, 0, 0);
}

export function paintPoster(title: string, source: string, hook: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 900;
  const c = canvas.getContext("2d");
  if (!c) return "";
  paintAtmosphere(c, 720, 900, 0);
  const fg = token("--color-fg", "#e8eef6");
  const accent = token("--color-primary", "#e4b86a");
  c.fillStyle = accent;
  c.font = "600 20px Syne, sans-serif";
  c.fillText("LESSON VIDEO", 56, 100);
  c.fillStyle = fg;
  c.font = "700 40px Syne, sans-serif";
  wrap(c, title, 56, 170, 600, 48);
  c.globalAlpha = 0.8;
  c.font = "500 22px Figtree, sans-serif";
  wrap(c, source, 56, 340, 600, 32);
  c.globalAlpha = 0.95;
  c.font = "500 24px Figtree, sans-serif";
  wrap(c, hook, 56, 720, 600, 34);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function paintSceneStill(caption: string, source: string, index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1280;
  const c = canvas.getContext("2d");
  if (!c) return "";
  paintAtmosphere(c, 720, 1280, index);
  const accent = token("--color-primary", "#e4b86a");
  const fg = token("--color-fg", "#e8eef6");
  c.fillStyle = accent;
  c.font = "600 18px Syne, sans-serif";
  c.fillText((source || "HALL LESSON").toUpperCase().slice(0, 28), 48, 88);
  c.fillStyle = fg;
  c.globalAlpha = 0.2;
  c.font = "700 28px Syne, sans-serif";
  wrap(c, caption, 48, 1180, 624, 34, 2);
  c.globalAlpha = 1;
  return canvas.toDataURL("image/jpeg", 0.86);
}

export function loadPic(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("pic"));
    img.src = src;
  });
}

export function drawLessonFrame(
  ctx: CanvasRenderingContext2D,
  pic: CanvasImageSource,
  t: number,
  caption: string,
  source: string,
  title: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const scale = 1.08 + t * 0.08;
  const dw = w * scale;
  const dh = h * scale;
  ctx.fillStyle = token("--color-bg", "#0b1220");
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(pic, (w - dw) / 2, (h - dh) / 2 - 12, dw, dh);
  const g = ctx.createLinearGradient(0, h * 0.48, 0, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.45, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.45, w, h * 0.55);
  ctx.fillStyle = token("--color-primary", "#e4b86a");
  ctx.font = "600 20px Syne, sans-serif";
  ctx.fillText((source || title).toUpperCase().slice(0, 32), 44, h - 210);
  ctx.fillStyle = token("--color-fg", "#e8eef6");
  ctx.font = "700 34px Syne, sans-serif";
  wrap(ctx, caption, 44, h - 164, w - 88, 40, 3);
}

async function scenePics(scenes: LessonScene[], source: string) {
  return Promise.all(
    scenes.map(async (scene, i) => {
      if (scene.imageUrl) {
        try {
          return await loadPic(scene.imageUrl);
        } catch {
          /* painted still */
        }
      }
      return loadPic(paintSceneStill(scene.caption, source, i));
    }),
  );
}

export function runLessonPreview(
  canvas: HTMLCanvasElement,
  scenes: LessonScene[],
  pics: HTMLImageElement[],
  source: string,
  title: string,
  sceneMs: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx || pics.length === 0) return () => undefined;
  canvas.width = 720;
  canvas.height = 1280;
  let raf = 0;
  let start = 0;
  const total = sceneMs * pics.length;
  const tick = (now: number) => {
    if (!start) start = now;
    const t = (now - start) % total;
    const i = Math.min(pics.length - 1, Math.floor(t / sceneMs));
    const local = (t - i * sceneMs) / sceneMs;
    drawLessonFrame(ctx, pics[i], local, scenes[i]?.caption ?? "", source, title);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export async function renderLessonVideo(
  scenes: LessonScene[],
  audio: AudioBuffer,
  source: string,
  title: string,
): Promise<Blob> {
  const pics = await scenePics(scenes, source);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const audioCtx = new AudioContext();
  const src = audioCtx.createBufferSource();
  src.buffer = audio;
  const dest = audioCtx.createMediaStreamDestination();
  src.connect(dest);
  const canvasStream = canvas.captureStream(30);
  const stream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((t) =>
    MediaRecorder.isTypeSupported(t),
  );
  const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  const dur = audio.duration;
  const sceneDur = dur / Math.max(1, pics.length);
  return new Promise((resolve, reject) => {
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onerror = () => {
      void audioCtx.close();
      reject(new Error("record"));
    };
    rec.onstop = () => {
      void audioCtx.close();
      resolve(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
    };
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      if (t >= dur) {
        try {
          src.stop();
        } catch {
          /* already stopped */
        }
        if (rec.state === "recording") rec.stop();
        return;
      }
      const i = Math.min(pics.length - 1, Math.floor(t / sceneDur));
      const local = (t - i * sceneDur) / sceneDur;
      drawLessonFrame(ctx, pics[i], local, scenes[i]?.caption ?? "", source, title);
      requestAnimationFrame(tick);
    };
    rec.start(200);
    src.start();
    requestAnimationFrame(tick);
  });
}

export { scenePics };
