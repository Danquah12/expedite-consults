export const CUT_SPEEDS = [0.5, 1, 1.5, 2] as const;
export const CUT_LOOKS = [
  { id: "none", label: "Original" },
  { id: "vivid", label: "Vivid" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "mono", label: "Mono" },
] as const;

export type CutLook = (typeof CUT_LOOKS)[number]["id"];

type Cut = {
  start: number;
  end: number;
  line: string;
  portrait: boolean;
  speed: number;
  look: CutLook;
  text: string;
  lesson: string;
  flip: boolean;
  silent: boolean;
  captions: string;
};

const LOOK: Record<CutLook, string> = {
  none: "none",
  vivid: "contrast(1.12) saturate(1.35)",
  warm: "sepia(0.28) saturate(1.12)",
  cool: "saturate(0.8) hue-rotate(18deg)",
  mono: "grayscale(1) contrast(1.08)",
};

function captionAt(script: string, start: number, end: number, now: number) {
  const words = script.trim().split(/\s+/).filter(Boolean);
  if (!words.length || end <= start) return "";
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += 5) groups.push(words.slice(i, i + 5).join(" "));
  const at = Math.min(groups.length - 1, Math.max(0, Math.floor(((now - start) / (end - start)) * groups.length)));
  return groups[at] ?? "";
}

function mime() {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function recorderOptions(type: string): MediaRecorderOptions {
  const opts: MediaRecorderOptions = { videoBitsPerSecond: 1_200_000, audioBitsPerSecond: 96_000 };
  if (type) opts.mimeType = type;
  return opts;
}

function audioFrom(video: HTMLVideoElement) {
  const host = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
  const stream = host.captureStream?.() ?? host.mozCaptureStream?.();
  return stream?.getAudioTracks() ?? [];
}

/** Trim and burn a lower-third. The cut stays in the browser. Nothing is uploaded. */
export async function cutFilm(src: string, opts: Cut, onProgress?: (n: number) => void) {
  const video = document.createElement("video");
  video.src = src;
  video.playsInline = true;
  video.muted = false;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("The clip could not be opened."));
  });
  const span = Math.max(0.4, video.duration || opts.end);
  const start = Math.max(0, Math.min(opts.start, span - 0.4));
  const end = Math.max(start + 0.4, Math.min(opts.end || span, span));
  const w = opts.portrait ? 720 : 1280;
  const h = opts.portrait ? 1280 : 720;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw the cut.");
  const out = canvas.captureStream(30);
  if (!opts.silent) {
    for (const track of audioFrom(video)) out.addTrack(track);
  }
  const type = mime();
  const rec = new MediaRecorder(out, recorderOptions(type));
  const chunks: Blob[] = [];
  rec.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: type || "video/webm" }));
  });
  video.currentTime = start;
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
  });
  video.playbackRate = opts.speed > 0 ? opts.speed : 1;
  await video.play();
  rec.start(200);
  await new Promise<void>((resolve) => {
    const draw = () => {
      if (video.currentTime >= end || video.ended) {
        video.pause();
        if (rec.state !== "inactive") rec.stop();
        resolve();
        return;
      }
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, w, h);
      const vw = video.videoWidth || w;
      const vh = video.videoHeight || h;
      const scale = Math.min(w / vw, h / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      ctx.save();
      if (opts.flip) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.filter = LOOK[opts.look] ?? "none";
      ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.filter = "none";
      ctx.restore();
      const text = opts.text.trim();
      if (text) {
        ctx.font = `700 ${Math.round(h * 0.045)}px sans-serif`;
        const label = text.slice(0, 72);
        const width = Math.min(w - 48, ctx.measureText(label).width + 36);
        const x = (w - width) / 2;
        const y = Math.round(h * 0.08);
        ctx.fillStyle = "rgba(5,7,12,0.72)";
        ctx.fillRect(x, y, width, Math.round(h * 0.07));
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + 18, y + Math.round(h * 0.048));
      }
      if (opts.lesson.trim()) {
        ctx.fillStyle = "rgba(5,7,12,0.66)";
        ctx.fillRect(24, Math.round(h * 0.18), w - 48, Math.round(h * 0.07));
        ctx.fillStyle = "#d7deea";
        ctx.font = `600 ${Math.round(h * 0.028)}px sans-serif`;
        ctx.fillText(opts.lesson.trim().slice(0, 90), 40, Math.round(h * 0.222));
      }
      const bar = Math.round(h * 0.16);
      const said = captionAt(opts.captions, start, end, video.currentTime);
      if (said) {
        ctx.font = `700 ${Math.round(h * 0.038)}px sans-serif`;
        const width = Math.min(w - 48, ctx.measureText(said).width + 32);
        const x = (w - width) / 2;
        const y = h - bar - Math.round(h * 0.09);
        ctx.fillStyle = "rgba(5,7,12,0.8)";
        ctx.fillRect(x, y, width, Math.round(h * 0.06));
        ctx.fillStyle = "#ffffff";
        ctx.fillText(said, x + 16, y + Math.round(h * 0.042));
      }
      ctx.fillStyle = "rgba(5,7,12,0.78)";
      ctx.fillRect(0, h - bar, w, bar);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.round(h * 0.04)}px sans-serif`;
      ctx.fillText((opts.line || "On air").slice(0, 80), 28, h - bar + Math.round(bar * 0.4));
      ctx.fillStyle = "#d7deea";
      ctx.font = `700 ${Math.round(h * 0.026)}px sans-serif`;
      ctx.fillText("Expedite Consults LLC", 28, h - bar + Math.round(bar * 0.74));
      onProgress?.((video.currentTime - start) / (end - start));
      requestAnimationFrame(draw);
    };
    draw();
  });
  const blob = await done;
  video.pause();
  video.src = "";
  return URL.createObjectURL(blob);
}

/** A film from the words you wrote. The picture is the desk. No outside generator. */
export async function writeFilm(opts: { backdrop: string; line: string; script: string; lesson: string; portrait: boolean }) {
  const w = opts.portrait ? 720 : 1280;
  const h = opts.portrait ? 1280 : 720;
  const plate = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The desk picture did not load."));
    img.src = opts.backdrop;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw the film.");
  const words = (opts.script.trim() || opts.line).split(/\s+/).filter(Boolean);
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += 5) groups.push(words.slice(i, i + 5).join(" "));
  if (!groups.length) groups.push(opts.line || "On air");
  const seconds = Math.min(24, Math.max(6, groups.length * 2));
  const out = canvas.captureStream(30);
  const type = mime();
  const rec = new MediaRecorder(out, recorderOptions(type));
  const chunks: Blob[] = [];
  rec.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: type || "video/webm" }));
  });
  const started = performance.now();
  rec.start(200);
  await new Promise<void>((resolve) => {
    const draw = () => {
      const t = (performance.now() - started) / 1000;
      if (t >= seconds) {
        if (rec.state !== "inactive") rec.stop();
        resolve();
        return;
      }
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, w, h);
      const scale = Math.max(w / plate.width, h / plate.height);
      const dw = plate.width * scale;
      const dh = plate.height * scale;
      ctx.drawImage(plate, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.fillStyle = "rgba(5,7,12,0.28)";
      ctx.fillRect(0, 0, w, h);
      const said = groups[Math.min(groups.length - 1, Math.floor((t / seconds) * groups.length))] ?? "";
      ctx.font = `700 ${Math.round(h * 0.05)}px sans-serif`;
      const width = Math.min(w - 64, ctx.measureText(said).width + 40);
      const x = (w - width) / 2;
      const y = Math.round(h * 0.38);
      ctx.fillStyle = "rgba(5,7,12,0.78)";
      ctx.fillRect(x, y, width, Math.round(h * 0.09));
      ctx.fillStyle = "#ffffff";
      ctx.fillText(said, x + 20, y + Math.round(h * 0.06));
      if (opts.lesson.trim()) {
        ctx.font = `600 ${Math.round(h * 0.028)}px sans-serif`;
        ctx.fillStyle = "#d7deea";
        ctx.fillText(opts.lesson.trim().slice(0, 90), 36, Math.round(h * 0.22));
      }
      const bar = Math.round(h * 0.16);
      ctx.fillStyle = "rgba(5,7,12,0.82)";
      ctx.fillRect(0, h - bar, w, bar);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.round(h * 0.04)}px sans-serif`;
      ctx.fillText((opts.line || "On air").slice(0, 80), 28, h - bar + Math.round(bar * 0.4));
      ctx.fillStyle = "#d7deea";
      ctx.font = `700 ${Math.round(h * 0.026)}px sans-serif`;
      ctx.fillText("Expedite Consults LLC", 28, h - bar + Math.round(bar * 0.74));
      requestAnimationFrame(draw);
    };
    draw();
  });
  const blob = await done;
  return URL.createObjectURL(blob);
}
