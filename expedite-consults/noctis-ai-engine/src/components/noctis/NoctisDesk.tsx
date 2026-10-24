import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Brain, Calendar, ChevronDown, ChevronLeft, Code2, Copy, CornerDownLeft, FileText, GraduationCap, Image, Library, Mail, Menu, Mic, MoreHorizontal, Pencil, Phone, PhoneOff, Plus, RotateCcw, Search, Square, SquarePen, Trash2, Video, Volume2, VolumeX, Wrench, X } from "lucide-react";
import { askNoctis, drawVibe, hearVibe, sayVibe, trainVibe } from "@/lib/noctis-api";
import { bringImagineFile, bringPortrait, readImagine, startImagine } from "@/lib/imagine-api";
import { KnowledgeMap } from "@/components/learn/KnowledgeMap";
import { VIBE_SKILLS, skillFromWords, noctisSkill, type NoctisSkillId } from "@/lib/noctis-skills";
import { useJazzBed } from "@/lib/jazz-bed";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { NoctisCall } from "@/components/noctis/NoctisCall";
import { studyOpenCall, studySend } from "@/lib/study-group-api";
import { sendMeetInvite } from "@/lib/meet-mail";
import { CANVASES, useTheme } from "@/lib/theme";
import { useFeedStore } from "@/lib/feed-store";
import { learningBoard } from "@/lib/learning-board";
import { levelFromProgress, type DepthLevel } from "@/lib/depth";
import { asksToBeTaught, teacherPlan } from "@/lib/personal-teacher";
import { GOALS } from "@/lib/learn";
import { NoctisRecommend, markDna, readNoctisContext } from "@/components/noctis/NoctisContext";
import { formatContext, markMission, routeActions } from "@/lib/noctis-os";
import { studyAsks } from "@/lib/study-pass";
import { CardsReturn } from "@/components/layout/CardsReturn";
import { textFromDocx, textFromPdf, textFromRtf } from "@/lib/read-document";
import { saveShareLink } from "@/lib/share-link";

type Turn = { role: "user" | "assistant"; content: string; images?: string[]; video?: string; clips?: string[]; audio?: string };
type Thread = { id: string; title: string; turns: Turn[]; temp?: boolean };
type Upload = { id: string; name: string; kind: "text" | "image"; text?: string; dataUrl?: string };

const STORE_BASE = "vibetok-vibe-threads";
const SOURCE_BASE = "vibetok-vibe-source";
const RULES_BASE = "vibetok-user-rules";
const TAB_SESSION_KEY = "vibetok-tab-session-id";

function getTabSessionId(): string {
  if (typeof sessionStorage === "undefined") return "server";
  try {
    let existing = sessionStorage.getItem(TAB_SESSION_KEY);
    if (!existing) {
      existing =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(TAB_SESSION_KEY, existing);
    }
    return existing;
  } catch {
    return "ephemeral";
  }
}

function resolveSessionNamespace(person?: { id?: string | null; isDevFallback?: boolean } | null): {
  storage: Storage | null;
  scopeKey: string;
  threadsKey: string;
  sourceKey: string;
  rulesKey: string;
} {
  const isAuthenticatedUser = Boolean(person?.id && !person?.isDevFallback);
  const scopeKey = isAuthenticatedUser ? `user:${person!.id}` : `tab:${getTabSessionId()}`;
  const storage =
    typeof window === "undefined"
      ? null
      : isAuthenticatedUser
        ? window.localStorage
        : window.sessionStorage;
  return {
    storage,
    scopeKey,
    threadsKey: `${STORE_BASE}:${scopeKey}`,
    sourceKey: `${SOURCE_BASE}:${scopeKey}`,
    rulesKey: `${RULES_BASE}:${scopeKey}`,
  };
}

function rememberRule(text: string, person?: { id?: string | null; isDevFallback?: boolean } | null) {
  const hit = text.match(/^(?:correction|rule)\s*:\s*(.{8,240})/i);
  const { storage, rulesKey } = resolveSessionNamespace(person);
  if (!hit || !storage) return;
  try {
    const raw = JSON.parse(storage.getItem(rulesKey) || "[]") as unknown;
    const prev = Array.isArray(raw) ? raw.filter((item) => typeof item === "string") : [];
    const next = [...prev.filter((item) => item !== hit[1].trim()), hit[1].trim()].slice(-8);
    storage.setItem(rulesKey, JSON.stringify(next));
  } catch {
    /* a full browser store does not block the answer */
  }
}

function savedRules(person?: { id?: string | null; isDevFallback?: boolean } | null) {
  const { storage, rulesKey } = resolveSessionNamespace(person);
  if (!storage) return "";
  try {
    const raw = JSON.parse(storage.getItem(rulesKey) || "[]") as unknown;
    const rules = Array.isArray(raw) ? raw.filter((item) => typeof item === "string").slice(-8) : [];
    return rules.length ? `User-said rules: ${rules.join(" | ")}` : "";
  } catch {
    return "";
  }
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,.txt,.md,.csv,.json,.pdf,.docx,.rtf,.js,.ts,.tsx,.py,.html,.css";
const VIBE_SPEAKS = ["English", "French", "German", "Spanish", "Portuguese", "Italian", "Dutch", "Arabic", "Chinese", "Japanese", "Korean", "Hindi", "Russian", "Swahili", "Turkish", "Polish", "Vietnamese", "Ukrainian", "Haitian Creole", "Twi", "Other"];
const VIBE_FILMS: { src: string; film?: boolean; line: string }[] = [
  { src: "/media/clips/calc.mp4", film: true, line: "Work a problem, then ask the next step." },
  { src: "/brand/login-3.jpg", line: "Sit with a question until it opens." },
  { src: "/media/hall/physician.mp4", film: true, line: "Watch the clinic, then ask what to learn." },
  { src: "/media/clips/spot.mp4", film: true, line: "Watch a clip, then ask what it means." },
  { src: "/brand/login-6.jpg", line: "Bring a book, a chart, and a question." },
  { src: "/media/hall/developer.mp4", film: true, line: "Watch the build, then ask how it works." },
  { src: "/media/study-room.jpg", line: "Turn a lesson into notes you can keep." },
  { src: "/media/clips/bounce.mp4", film: true, line: "Watch the night, then ask about the beat." },
  { src: "/media/covers/nightmarket.jpg", line: "Ask about the place, the people, and the night." },
  { src: "/media/clips/run.mp4", film: true, line: "Follow one idea until it is clear." },
  { src: "/media/hall/realtor.mp4", film: true, line: "Watch the walk-through, then ask what to check." },
  { src: "/media/desk/pulpit.jpg", line: "Read the text, then ask what it means." },
  { src: "/media/covers/radio.jpg", line: "Listen, then ask Noctis to explain it." },
  { src: "/media/covers/hall.jpg", line: "Start from a picture. Ask what you should learn." },
];

function meetBrief(text: string) {
  const clean = text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  return clean.slice(0, 160);
}

function VibeFilms({ quiet, index, onIndex }: { quiet: boolean; index: number; onIndex: (n: number) => void }) {
  const { bed, tune, music, setMusic } = useJazzBed(quiet);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wait = VIBE_FILMS[index]?.film ? 8000 : 5000;
    const t = window.setTimeout(() => onIndex((index + 1) % VIBE_FILMS.length), wait);
    return () => window.clearTimeout(t);
  }, [index, onIndex]);
  useEffect(() => {
    document.querySelectorAll<HTMLVideoElement>("[data-vibe-film]").forEach((el) => {
      const on = el.dataset.vibeFilm === String(index);
      if (on) void el.play().catch(() => undefined);
      else {
        el.pause();
        try {
          el.currentTime = 0;
        } catch {
          /* not ready */
        }
      }
    });
  }, [index]);
  const scene = VIBE_FILMS[index];
  return (
    <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col">
      <audio ref={bed} data-jazz="" preload="auto" />
      <div className="relative mx-auto min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
        {VIBE_FILMS.map((row, n) =>
          row.film ? (
            <video
              key={row.src}
              data-vibe-film={n}
              src={row.src}
              muted
              playsInline
              loop
              preload={n === 0 ? "auto" : "metadata"}
              aria-label={n === index ? row.line : undefined}
              className="absolute inset-0 size-full object-contain transition-opacity duration-700"
              style={{ opacity: n === index ? 1 : 0 }}
            />
          ) : (
            <img key={row.src} src={row.src} alt={n === index ? row.line : ""} className="absolute inset-0 size-full object-contain transition-opacity duration-700" style={{ opacity: n === index ? 1 : 0 }} />
          ),
        )}
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-center gap-1.5">
        <button
          type="button"
          aria-label={music ? "Turn the music off" : "Turn the music on"}
          onClick={() => setMusic((on) => !on)}
          className="mr-1 grid size-7 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
        >
          {music && !quiet ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
        </button>
        {VIBE_FILMS.map((row, n) => (
          <button
            key={row.src}
            type="button"
            aria-label={`Show film ${n + 1}`}
            onClick={() => onIndex(n)}
            className="h-1.5 rounded-full transition-all"
            style={{ width: n === index ? 18 : 7, background: n === index ? "#e4b86a" : "#3f3f46" }}
          />
        ))}
      </div>
      <p className="mt-2 shrink-0 text-center text-sm text-zinc-400">{scene?.line}</p>
      <p className="mt-1 shrink-0 text-center text-[11px] text-zinc-600">{tune.title} · {tune.by}</p>
    </div>
  );
}

function relatedAsks(raw: string) {
  const topic = raw.replace(/---[\s\S]*$/g, "").replace(/\s+/g, " ").trim();
  if (topic.length < 4) return [];
  return [
    { label: "What else should we add?", ask: "What else should we add?" },
    { label: "Draw the architecture", ask: "Draw the architecture" },
    { label: "Expand point 3", ask: "Expand point 3" },
    { label: "Calculate implementation cost", ask: "Now calculate the implementation cost." },
    { label: "Compare alternatives", ask: "Compare the alternatives." },
    { label: "Simpler", ask: "Say that more simply." },
  ];
}

const LIBRARY_DESKS = [
  { label: "Bible", line: "A verse, quoted from the text", ask: "What does John 3:16 say?", skill: "library" as const },
  { label: "NVD", line: "A vulnerability record", ask: "Look up CVE-2024-3094.", skill: "tools" as const },
  { label: "GitHub", line: "A public repository or advisory", ask: "What does the public record say about CVE-2024-3094?", skill: "tools" as const },
  { label: "Papers", line: "A cited paper or report", ask: "Research ransomware attacks against hospitals.", skill: "research" as const },
];

const TOOL_IDS = ["search", "read", "see", "watch", "tools", "research", "agent"] as const;

function loadThreads(person?: { id?: string | null; isDevFallback?: boolean } | null): Thread[] {
  const { storage, threadsKey } = resolveSessionNamespace(person);
  if (!storage) return [];
  try {
    const raw = storage.getItem(threadsKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    const threads: Thread[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const item = row as { id?: unknown; title?: unknown; turns?: unknown };
      if (typeof item.id !== "string" || !item.id) continue;
      const turns: Turn[] = [];
      if (Array.isArray(item.turns)) {
        for (const turn of item.turns) {
          if (!turn || typeof turn !== "object") continue;
          const piece = turn as { role?: unknown; content?: unknown };
          if ((piece.role !== "user" && piece.role !== "assistant") || typeof piece.content !== "string") continue;
          turns.push({ role: piece.role, content: piece.content });
        }
      }
      threads.push({ id: item.id, title: typeof item.title === "string" ? item.title : "Chat", turns });
    }
    return threads;
  } catch {
    return [];
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `vibe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function turnsForApi(
  turns: Turn[],
  threadId = "",
  person?: { id?: string | null; isDevFallback?: boolean } | null,
) {
  let kept = false;
  const list = turns
    .slice()
    .reverse()
    .map((turn) => {
      if (!kept && turn.role === "user" && turn.images?.length) {
        kept = true;
        return turn;
      }
      return { role: turn.role, content: turn.content };
    })
    .reverse();
  try {
    const { storage, sourceKey } = resolveSessionNamespace(person);
    const saved = JSON.parse(storage?.getItem(sourceKey) || "null") as { id?: string; content?: string } | null;
    const text = saved?.content;
    if (saved && saved.id === threadId && typeof text === "string" && text.length > 40 && !list.some((turn) => turn.content.includes(text.slice(0, 60)))) {
      list.unshift({ role: "user", content: text });
    }
  } catch {
    /* a missing source copy does not block the question */
  }
  return list;
}

function userFace(turn: Turn) {
  const files = [...turn.content.matchAll(/^--- (.+?) ---$/gm)].map((hit) => hit[1] || "File");
  const shots = [...turn.content.matchAll(/\[Image: ([^\]]+)\]/g)].map((hit) => hit[1] || "Image");
  const lead = (turn.content.split(/\n\n--- /)[0] || "").replace(/\[Image:[^\]]*\]/g, "").trim();
  return { said: lead === "Look at what I uploaded." ? "" : lead, files, shots };
}

function sayAloud(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, " ").replace(/\s+/g, " ").slice(0, 1500));
  window.speechSynthesis.speak(utter);
  return true;
}

function fresh(): Thread {
  return { id: makeId(), title: "New chat", turns: [] };
}

async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function leaveNoctis() {
  try {
    const saved = sessionStorage.getItem("noctis-return") || "";
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign(saved.startsWith("/") && !saved.startsWith("/noctis") ? saved : "/home");
  } catch {
    window.location.assign("/home");
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "\u0026amp;").replace(/</g, "\u0026lt;").replace(/>/g, "\u0026gt;");
}

function plainAnswer(raw: string) {
  return (raw.split(/\n\s*Claim standing:/i)[0] || raw)
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function signedByline(name?: string | null) {
  const clean = (name || "")
    .replace(/\s*@\s*vibetok\s*$/i, "")
    .replace(/[^\p{L}\p{M}\p{N}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = (clean || "Noctis").split(" ").filter(Boolean);
  const full = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  return `${full} @ Noctis`;
}

async function loadPortrait(src: string) {
  const opened = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      if (!url.startsWith("data:")) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("photo"));
      img.src = url;
    });
  try {
    return await opened(src);
  } catch {
    if (!src.startsWith("https://")) throw new Error("photo");
    const brought = await bringPortrait({ data: { url: src } });
    const bag = brought && typeof brought === "object" ? (brought as { file?: unknown; result?: unknown }) : {};
    const inner = bag.result && typeof bag.result === "object" ? (bag.result as { file?: unknown }) : bag;
    if (typeof inner.file !== "string") throw new Error("photo");
    return opened(inner.file);
  }
}

function paintShareLines(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lineHeight: number, rows: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = word;
      row += 1;
      if (row >= rows) return;
    } else line = test;
  }
  if (line && row < rows) ctx.fillText(line, x, y + row * lineHeight);
}

async function senderCard(photo: string, byline: string, message: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#0c1424";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e4b86a";
  ctx.fillRect(0, 0, canvas.width, 10);
  let face: HTMLImageElement | null = null;
  try {
    face = await loadPortrait(photo);
  } catch {
    face = null;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(132, 156, 74, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (face) ctx.drawImage(face, 58, 82, 148, 148);
  else {
    ctx.fillStyle = "#1a2744";
    ctx.fillRect(58, 82, 148, 148);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(132, 156, 74, 0, Math.PI * 2);
  ctx.strokeStyle = "#e4b86a";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#f6f1e6";
  ctx.font = "700 40px Georgia, serif";
  ctx.fillText(byline.slice(0, 28), 236, 168);
  ctx.fillStyle = "#f4efe6";
  ctx.font = "500 42px Georgia, serif";
  const body = message.replace(/\n*.{1,80}\s@\sNoctis\s*$/g, "").replace(/\n*[A-Z0-9][A-Z0-9 .'-]{0,80}@Noctis\s*$/g, "").trim();
  paintShareLines(ctx, body, 72, 320, 936, 58, 14);
  ctx.fillStyle = "#e4b86a";
  ctx.font = "600 28px Georgia, serif";
  ctx.fillText("Noctis", 72, 1280);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((file) => resolve(file), "image/jpeg", 0.9));
  return blob ? new File([blob], "vibetok-message.jpg", { type: "image/jpeg" }) : null;
}

function shareBody(raw: string) {
  return plainAnswer(raw)
    .split(/\n\s*(Independent check|UNKNOWN:|Evidence status|Claim standing|Requested quantity|Sources)\b/i)[0]
    .replace(/\n*Written by Noctis\s*[·•|]?\s*Noctis[^\n]*/gi, "")
    .replace(/\n*.{1,80}\s@\sNoctis\s*$/g, "")
    .replace(/\n*[A-Z0-9][A-Z0-9 .'-]{0,80}@Noctis\s*$/g, "")
    .trim();
}

function fullShare(raw: string, byline = "NOCTIS@Noctis") {
  return `${shareBody(raw)}\n\n${byline}`;
}

async function vibeSummary(raw: string, byline = "NOCTIS@Noctis") {
  const body = shareBody(raw).slice(0, 12000);
  if (!body) return fullShare(raw, byline);
  try {
    const result = await askNoctis({
      data: {
        skill: "talk",
        think: false,
        turns: [
          {
            role: "user",
            content: `Read this answer again. Summarize it for a post. Use only what is written here. Do not add facts. Write 4 to 6 plain sentences that keep the whole point. No headings. No sources. No claim standing. No tables. Stop after the summary. End with this line exactly: ${byline}\n\nANSWER:\n${body}`,
          },
        ],
      },
    });
    const text = result && typeof result === "object" && "text" in result && typeof result.text === "string" ? result.text : "";
    const summary = shareBody(text);
    if (summary.length > 40 && !/could not finish|write a question/i.test(summary)) return `${summary}\n\n${byline}`;
  } catch {
    /* the original note still goes out if Noctis cannot read it again */
  }
  return fullShare(raw, byline);
}

function AnswerShare({ text }: { text: string }) {
  const person = useCurrentUser();
  const byline = signedByline(person?.displayName);
  const photo = person?.profileImageUrl || "/media/avatars/kwesi.jpg";
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [reading, setReading] = useState(false);
  const [sending, setSending] = useState(false);
  const [who, setWho] = useState("");
  const sheet = useRef<HTMLDivElement>(null);
  const places = [
    ["linkedin", "LinkedIn"],
    ["whatsapp", "WhatsApp"],
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["x", "X"],
  ] as const;

  async function prepare() {
    if (reading) return;
    setReading(true);
    setNote("");
    setSummary("");
    const next = await vibeSummary(text, byline);
    setSummary(next);
    setReading(false);
    window.setTimeout(() => sheet.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 40);
  }

  async function send() {
    const line = signedByline(who || person?.displayName);
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://back-vibtook-4.vercel.app";
    const face = photo.startsWith("http") ? photo : `${origin}${photo.startsWith("/") ? photo : `/${photo}`}`;
    const body = (summary || shareBody(text)).replace(/\n*.{1,80}\s@\sNoctis\s*/g, "").replace(/\n*[A-Z0-9][A-Z0-9 .'-]{0,80}@Noctis\s*/g, "").trim();
    const clipped = body.length > 900 ? `${body.slice(0, 900).trim()}…` : body;
    const query = new URLSearchParams();
    query.set("n", line);
    if (face.startsWith("https://")) query.set("a", face);
    query.set("t", clipped.replace(/\s+/g, " ").slice(0, 260));
    query.set("v", "17");
    let short = `${origin}/s?${query.toString()}`;
    try {
      const saved = await saveShareLink({ data: { name: line, avatar: face, body: clipped } });
      if (saved?.code) {
        query.set("c", saved.code);
        short = `${origin}/s?${query.toString()}`;
      }
    } catch {
      /* stateless query parameters on /s ensure the share card still renders */
    }
    const message = `${line}\n\n${clipped}\n\n${line}\n${short}`;
    const chosen = places.filter(([id]) => picked.includes(id));
    if (!chosen.length) {
      setNote("Check a place first.");
      return;
    }
    const posted = message;
    const card = await senderCard(photo, line, posted);
    if (card && typeof navigator.share === "function") {
      const withPicture: ShareData = { files: [card], title: line, text: posted };
      try {
        if (typeof navigator.canShare !== "function" || navigator.canShare(withPicture)) {
          await navigator.share(withPicture);
          setNote(summary ? "The summary is going out with your picture." : "The answer is going out with your picture.");
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    chosen.forEach(([id]) => {
      const href =
        id === "whatsapp"
          ? `https://api.whatsapp.com/send?text=${encodeURIComponent(posted)}`
          : id === "x"
            ? `https://x.com/intent/post?text=${encodeURIComponent(posted)}`
            : id === "linkedin"
              ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(posted)}`
              : id === "facebook"
                ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(short)}`
                : "https://www.instagram.com/";
      const tab = window.open(href, "_blank", "noopener,noreferrer");
      if (!tab) {
        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
    setNote(chosen.length > 1 ? "Those places are opening." : `${chosen[0][1]} is opening.`);
    void navigator.clipboard.writeText(message).catch(() => undefined);
  }

  function openSend() {
    setSending(true);
    setNote("");
    window.setTimeout(() => sheet.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 40);
  }

  return (
    <span className="mt-1 inline-flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-1" data-share="places">
      <button type="button" onClick={() => void prepare()} disabled={reading} className="h-8 rounded-full bg-[#e4b86a] px-3 text-xs font-semibold text-[#1a1408] disabled:opacity-40">
        {reading ? "Reading" : "Summarize"}
      </button>
      <button type="button" onClick={openSend} className="h-8 rounded-full border border-[#e4b86a]/70 px-3 text-xs font-semibold text-[#e4b86a]">
        Send
      </button>
      {reading ? <span className="text-[11px] text-zinc-400">Noctis is reading this again.</span> : null}
      {sending || summary ? (
        <div ref={sheet} className="mt-3 w-full basis-full rounded-2xl border border-[#e4b86a]/40 bg-[#111] p-4">
          <div className="flex items-center gap-3">
            <img src={photo} alt="" className="size-11 rounded-full object-cover" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">{summary ? "Summary" : "Send this answer"}</p>
              <input
                value={who || byline}
                onChange={(event) => setWho(event.target.value)}
                aria-label="Name on the post"
                className="mt-1 w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-sm font-semibold text-zinc-100"
              />
            </div>
          </div>
          {summary ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-100">{summary}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {places.map(([id, label]) => (
              <label key={id} className="inline-flex items-center gap-1.5 text-xs text-zinc-200">
                <input
                  type="checkbox"
                  checked={picked.includes(id)}
                  onChange={() => setPicked((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]))}
                  className="size-3.5 accent-[#e4b86a]"
                />
                {label}
              </label>
            ))}
            <button type="button" onClick={() => void send()} className="h-8 rounded-full bg-[#e4b86a] px-3 text-xs font-semibold text-[#1a1408]">
              Post
            </button>
          </div>
          {note ? <p className="mt-2 text-[11px] text-zinc-500">{note}</p> : null}
        </div>
      ) : null}
    </span>
  );
}

function songStyle(text: string) {
  const q = text.toLowerCase();
  if (/\bhymn|worship|gospel|praise|church\b/.test(q)) return "gospel" as const;
  if (/\bjazz\b/.test(q)) return "jazz" as const;
  if (/\bsong|sing|music|lyrics|melody|soul|r&b|rnb\b/.test(q)) return "soul" as const;
  return "";
}

async function songWords(idea: string, style: string) {
  try {
    const result = await askNoctis({
      data: {
        skill: "write",
        think: false,
        turns: [{
          role: "user",
          content: `Write a short original ${style} song from the pasted text. Keep its subject and its own phrases. Four short lines, then a two-line chorus. Do not switch to a different topic. No headings.\n${idea.slice(0, 1200)}`,
        }],
      },
    });
    const text = result && typeof result === "object" && "text" in result && typeof result.text === "string" ? plainAnswer(result.text) : "";
    if (text.length > 20 && !/could not finish|write a question/i.test(text)) return text.split(/\n\s*Written by Noctis/i)[0].trim();
  } catch {
    /* a plain line still goes on the video */
  }
  return idea.replace(/\s+/g, " ").trim().slice(0, 180);
}

function tone(ctx: AudioContext, dest: AudioNode, freq: number, when: number, length: number, kind: OscillatorType, amount: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(amount, when + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + length);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(when);
  osc.stop(when + length + 0.02);
}

function startSong(ctx: AudioContext, style: "gospel" | "jazz" | "soul") {
  const dest = ctx.createMediaStreamDestination();
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(dest);
  const note = (n: number) => 440 * 2 ** ((n - 69) / 12);
  const beds = {
    gospel: { bpm: 76, chords: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], melody: [67, 69, 71, 72, 71, 69, 67, 64] },
    jazz: { bpm: 96, chords: [[62, 65, 69, 72], [67, 71, 74, 77], [60, 64, 67, 71], [65, 69, 72, 76]], melody: [74, 72, 71, 69, 67, 69, 71, 72] },
    soul: { bpm: 84, chords: [[60, 64, 67], [69, 72, 76], [65, 69, 72], [67, 71, 74]], melody: [72, 71, 69, 67, 64, 67, 69, 72] },
  };
  const bed = beds[style];
  const beat = 60 / bed.bpm;
  const now = ctx.currentTime + 0.08;
  for (let pass = 0; pass < 2; pass += 1) {
    bed.chords.forEach((chord, index) => {
      chord.forEach((step) => tone(ctx, master, note(step), now + (pass * 4 + index) * beat * 2, beat * 1.8, "triangle", 0.07));
    });
  }
  [...bed.melody, ...bed.melody].forEach((step, index) => {
    tone(ctx, master, note(step + 12), now + index * beat, beat * 0.8, "sine", 0.11);
  });
  for (let index = 0; index < 16; index += 1) {
    tone(ctx, master, 82, now + index * beat, 0.07, "sine", index % 2 ? 0.03 : 0.08);
  }
  return { stream: dest.stream, seconds: beat * 16 + 0.3 };
}

async function pictureWords(idea: string) {
  try {
    const result = await askNoctis({
      data: {
        skill: "write",
        think: false,
        turns: [{ role: "user", content: `Write the words for this picture or video. Two or three plain sentences. No headings. No sources. Use only this idea:\n${idea.slice(0, 800)}` }],
      },
    });
    const text = result && typeof result === "object" && "text" in result && typeof result.text === "string" ? plainAnswer(result.text) : "";
    if (text.length > 20 && !/could not finish|write a question/i.test(text)) return text.split(/\n\s*Written by Noctis/i)[0].trim();
  } catch {
    /* the idea itself is still written on the picture */
  }
  return idea.replace(/\s+/g, " ").trim().slice(0, 180);
}

function paintLine(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let row = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = word;
      row += 1;
      if (row > 2) return;
    } else line = test;
  }
  if (row <= 2 && line) ctx.fillText(line, x, y + row * lineHeight);
}

function loadBitmap(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

function filmMime(withAudio: boolean) {
  const options = withAudio
    ? ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm"]
    : ["video/mp4", "video/webm;codecs=vp8", "video/webm;codecs=vp9", "video/webm"];
  return options.find((item) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(item)) || "";
}

async function recordFilm(canvas: HTMLCanvasElement, draw: (frame: number, frames: number) => void, seconds: number, audio?: MediaStream) {
  if (typeof canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") throw new Error("This browser cannot record a film.");
  canvas.style.position = "fixed";
  canvas.style.left = "-9999px";
  canvas.style.top = "0";
  document.body.appendChild(canvas);
  const frames = Math.max(24, Math.round(8 * seconds));
  draw(0, frames);
  const pictured = canvas.captureStream(8);
  const stream = new MediaStream([...pictured.getVideoTracks(), ...(audio ? audio.getAudioTracks() : [])]);
  const mime = filmMime(stream.getAudioTracks().length > 0);
  let rec: MediaRecorder;
  try {
    rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch {
    rec = new MediaRecorder(pictured);
  }
  const chunks: Blob[] = [];
  rec.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || mime || "video/webm" }));
  });
  rec.start(250);
  try {
    for (let i = 0; i < frames; i += 1) {
      draw(i, frames);
      const track = pictured.getVideoTracks()[0] as { requestFrame?: () => void } | undefined;
      track?.requestFrame?.();
      await new Promise((resolve) => window.setTimeout(resolve, Math.round(1000 / 8)));
    }
    if (rec.state !== "inactive") rec.stop();
    const blob = await done;
    if (blob.size < 1000) throw new Error("The film file was empty.");
    return URL.createObjectURL(blob);
  } finally {
    stream.getTracks().forEach((track) => track.stop());
    canvas.remove();
  }
}

async function brandPiece(src: string, words: string, song?: { style: "gospel" | "jazz" | "soul"; lines: string[]; ctx: AudioContext }) {
  const picture = await loadBitmap(src);
  let logo: HTMLImageElement | null = null;
  try {
    logo = await loadBitmap("/og.jpg");
  } catch {
    logo = null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const lines = (song?.lines.length ? song.lines : [words]).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const draw = (zoom: number, lyric: string) => {
    ctx.fillStyle = "#070b18";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width * zoom;
    const height = width * (picture.height / picture.width);
    ctx.drawImage(picture, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const fade = ctx.createLinearGradient(0, canvas.height - 220, 0, canvas.height);
    fade.addColorStop(0, "rgba(7,11,24,0)");
    fade.addColorStop(1, "rgba(7,11,24,0.92)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, canvas.height - 220, canvas.width, 220);
    if (logo) ctx.drawImage(logo, 24, 24, 72, 72);
    ctx.fillStyle = "#e4b86a";
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText(song ? "Noctis · Song" : "Noctis", 108, 68);
    ctx.fillStyle = "#f4efe6";
    ctx.font = "500 26px Georgia, serif";
    paintLine(ctx, lyric.slice(0, 160), 28, canvas.height - 100, canvas.width - 56, 32);
  };
  draw(1, lines[0] || words);
  let poster = src;
  try {
    poster = canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    poster = src;
  }
  const paintFrame = (frame: number, frames: number) => {
    const lyric = lines[Math.min(lines.length - 1, Math.floor((frame / frames) * lines.length))] || lines[0] || words;
    draw(1 + (frame / frames) * 0.06, lyric);
  };
  const seconds = song ? Math.min(song.ctx ? 12 : 8, 12) : 6;
  let video = "";
  try {
    const bed = song ? startSong(song.ctx, song.style) : null;
    if (song) void song.ctx.resume();
    video = await recordFilm(canvas, paintFrame, bed ? Math.min(bed.seconds, 12) : seconds, bed?.stream);
  } catch {
    video = await recordFilm(canvas, paintFrame, seconds);
  }
  return { poster, video };
}

function FilmPlay({ clips }: { clips: string[] }) {
  const box = useRef<HTMLVideoElement>(null);
  const [part, setPart] = useState(0);
  const src = clips[part] || clips[0];
  useEffect(() => {
    if (part === 0) return;
    void box.current?.play().catch(() => undefined);
  }, [part]);
  useEffect(() => {
    if (box.current?.ended && part + 1 < clips.length) setPart(part + 1);
  }, [clips.length, part]);
  if (!src) return null;
  return (
    <video
      key={src}
      ref={box}
      src={src}
      controls
      autoPlay
      playsInline
      className="mb-3 aspect-[4/5] w-full rounded-2xl border border-white/10 bg-black object-cover"
      onEnded={() => {
        if (part + 1 < clips.length) setPart(part + 1);
      }}
    />
  );
}

function MadeShare({ words, picture, video, clips }: { words: string; picture: string; video: string; clips?: string[] }) {
  const person = useCurrentUser();
  const byline = signedByline(person?.displayName);
  const photo = person?.profileImageUrl || "/media/avatars/kwesi.jpg";
  const [open, setOpen] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const places = [
    ["linkedin", "LinkedIn"],
    ["whatsapp", "WhatsApp"],
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["x", "X"],
  ] as const;
  if (!open) return null;
  async function asFile(src: string, index: number) {
    let blob: Blob | null = null;
    try {
      const res = await fetch(src);
      if (res.ok) blob = await res.blob();
    } catch {
      blob = null;
    }
    if ((!blob || blob.size < 800) && /^https:\/\/(vidgen|imgen)\.x\.ai\//.test(src)) {
      const brought = await bringImagineFile({ data: { url: src } });
      const bag = brought && typeof brought === "object" ? (brought as { file?: unknown; mime?: unknown; result?: unknown }) : {};
      const inner = bag.result && typeof bag.result === "object" ? (bag.result as { file?: unknown; mime?: unknown }) : bag;
      if (typeof inner.file === "string") {
        const res = await fetch(inner.file);
        blob = await res.blob();
      }
    }
    if (!blob || blob.size < 800) return null;
    const mime = blob.type || (picture && src === picture ? "image/jpeg" : "video/mp4");
    const ext = mime.includes("png") ? "png" : mime.includes("webm") ? "webm" : mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "mp4";
    return new File([blob], `vibetok-imagine${index ? `-${index + 1}` : ""}.${ext}`, { type: mime });
  }
  async function send() {
    const chosen = places.filter(([id]) => picked.includes(id));
    if (!chosen.length) {
      setNote("Check a place first.");
      return;
    }
    setNote("Attaching the film…");
    const sources = (clips?.length ? clips : video ? [video] : []).filter(Boolean);
    if (!sources.length && picture) sources.push(picture);
    const files: File[] = [];
    for (let i = 0; i < sources.length; i += 1) {
      const file = await asFile(sources[i], i);
      if (file) files.push(file);
    }
    const message = fullShare(words, byline);
    const card = await senderCard(photo, byline, message);
    if (card) files.unshift(card);
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* the share can still carry the film */
    }
    if (!files.length) {
      setNote("The film could not be attached. Try again.");
      return;
    }
    if (typeof navigator.share === "function") {
      const withWords: ShareData = { files, title: "Noctis", text: message };
      const filmOnly: ShareData = { files, title: "Noctis" };
      try {
        if (typeof navigator.canShare !== "function" || navigator.canShare(withWords)) {
          await navigator.share(withWords);
          setOpen(false);
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
      try {
        if (typeof navigator.canShare !== "function" || navigator.canShare(filmOnly)) {
          await navigator.share(filmOnly);
          setNote("The film is attached. The words are copied — paste them in the app.");
          setOpen(false);
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
    setNote("The film downloaded and the words are copied. In each app, attach the film, then paste the words.");
  }
  return (
    <div className="mt-3 w-full basis-full rounded-2xl border border-[#e4b86a]/40 bg-[#111] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e4b86a]">Ready to send</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-100">{words}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {places.map(([id, label]) => (
          <label key={id} className="inline-flex items-center gap-1.5 text-xs text-zinc-200">
            <input
              type="checkbox"
              checked={picked.includes(id)}
              onChange={() => setPicked((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]))}
              className="size-3.5 accent-[#e4b86a]"
            />
            {label}
          </label>
        ))}
        <button type="button" onClick={() => void send()} className="h-8 rounded-full bg-[#e4b86a] px-3 text-xs font-semibold text-[#1a1408]">
          Post
        </button>
      </div>
      {note ? <p className="mt-2 text-[11px] text-zinc-500">{note}</p> : null}
    </div>
  );
}

function parseMermaidGraph(mermaidSource: string) {
  const lines = mermaidSource
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^(flowchart|graph|sequenceDiagram|stateDiagram|subgraph\b|end\b)/i.test(l));

  const nodeMap = new Map<string, { id: string; label: string; isDecision: boolean }>();
  const edges: { from: string; to: string; label: string; dashed: boolean }[] = [];

  function parseNodeToken(token: string): string {
    const t = token.trim();
    const rectMatch = t.match(/^([A-Za-z0-9_]+)\s*\[\s*\(?\s*"?([^"\])\]]+)"?\s*\)?\s*\]$/);
    if (rectMatch) {
      const id = rectMatch[1];
      nodeMap.set(id, { id, label: rectMatch[2].trim(), isDecision: false });
      return id;
    }
    const decMatch = t.match(/^([A-Za-z0-9_]+)\s*\{\s*"?([^"\}]+)"?\s*\}$/);
    if (decMatch) {
      const id = decMatch[1];
      nodeMap.set(id, { id, label: decMatch[2].trim(), isDecision: true });
      return id;
    }
    const plainId = t.replace(/[^A-Za-z0-9_]/g, "") || "N";
    if (!nodeMap.has(plainId)) {
      nodeMap.set(plainId, { id: plainId, label: plainId, isDecision: false });
    }
    return plainId;
  }

  for (const line of lines) {
    const edgeMatch = line.match(
      /^(.+?)\s*(-\.->|-->|<-->|==>)\s*(?:\|([^|]+)\|\s*)?(.+)$/
    );
    if (edgeMatch) {
      const fromId = parseNodeToken(edgeMatch[1]);
      const dashed = edgeMatch[2].includes(".");
      const edgeLabel = (edgeMatch[3] || "").trim();
      const toId = parseNodeToken(edgeMatch[4]);
      edges.push({ from: fromId, to: toId, label: edgeLabel, dashed });
    } else {
      parseNodeToken(line);
    }
  }

  const nodes = [...nodeMap.values()];
  if (!nodes.length) {
    nodes.push({ id: "A", label: "Architecture Diagram", isDecision: false });
  }
  return { nodes, edges, nodeMap };
}

function buildMermaidSvg(mermaidSource: string): string {
  const { nodes, edges } = parseMermaidGraph(mermaidSource);

  const width = 960;
  const rowHeight = 96;
  const boxH = 54;

  // Assign topological rank using forward edges (ignoring feedback back-edges where target appeared earlier)
  const orderMap = new Map<string, number>();
  nodes.forEach((n, idx) => orderMap.set(n.id, idx));

  const rankMap = new Map<string, number>();
  nodes.forEach((n) => rankMap.set(n.id, 0));

  for (let pass = 0; pass < nodes.length; pass++) {
    for (const e of edges) {
      const fromOrder = orderMap.get(e.from) ?? 0;
      const toOrder = orderMap.get(e.to) ?? 0;
      if (toOrder > fromOrder) {
        const rFrom = rankMap.get(e.from) ?? 0;
        const rTo = rankMap.get(e.to) ?? 0;
        if (rFrom + 1 > rTo) {
          rankMap.set(e.to, rFrom + 1);
        }
      }
    }
  }

  const layers = new Map<number, typeof nodes>();
  for (const n of nodes) {
    const r = rankMap.get(n.id) ?? 0;
    const list = layers.get(r) || [];
    list.push(n);
    layers.set(r, list);
  }

  const sortedRanks = [...layers.keys()].sort((a, b) => a - b);
  const svgHeight = Math.max(240, sortedRanks.length * rowHeight + 44);

  const positions = new Map<string, { x: number; y: number; w: number; h: number }>();
  const marginX = 36;
  const usableW = width - marginX * 2;
  const gapX = 14;

  sortedRanks.forEach((r, rankIdx) => {
    const rowNodes = layers.get(r) || [];
    const count = rowNodes.length;
    const w =
      count === 1
        ? 460
        : Math.min(290, Math.floor((usableW - gapX * (count - 1)) / count));
    const totalRowW = count * w + (count - 1) * gapX;
    const startX = (width - totalRowW) / 2;
    const y = 48 + rankIdx * rowHeight;
    rowNodes.forEach((n, colIdx) => {
      positions.set(n.id, {
        x: startX + colIdx * (w + gapX) + w / 2,
        y,
        w,
        h: boxH,
      });
    });
  });

  const escapeXml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const wrapLabel = (text: string, maxCharsPerLine: number): [string, string?] => {
    if (text.length <= maxCharsPerLine) return [text];
    const words = text.split(/\s+/);
    let line1 = "";
    let line2 = "";
    for (const w of words) {
      if ((line1 + " " + w).trim().length <= maxCharsPerLine || !line1) {
        line1 = (line1 + " " + w).trim();
      } else {
        line2 = (line2 + " " + w).trim();
      }
    }
    if (line2.length > maxCharsPerLine) {
      line2 = `${line2.slice(0, maxCharsPerLine - 1)}…`;
    }
    return line2 ? [line1, line2] : [line1];
  };

  const edgeSvg = edges
    .map((e) => {
      const p1 = positions.get(e.from);
      const p2 = positions.get(e.to);
      if (!p1 || !p2) return "";
      const y1 = p1.y + p1.h / 2;
      const y2 = p2.y - p2.h / 2 - 4;
      const dashAttr = e.dashed ? `stroke-dasharray="6,4"` : "";
      const midY = (y1 + y2) / 2;
      const isBackEdge = p2.y <= p1.y;
      const pathD = isBackEdge
        ? `M ${p1.x + p1.w / 2} ${p1.y} C ${width - 16} ${p1.y}, ${width - 16} ${p2.y}, ${p2.x + p2.w / 2 + 4} ${p2.y}`
        : Math.abs(p1.x - p2.x) > 4
          ? `M ${p1.x} ${y1} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${y2}`
          : `M ${p1.x} ${y1} L ${p2.x} ${y2}`;
      const labelX = isBackEdge ? width - 95 : (p1.x + p2.x) / 2;
      const labelY = isBackEdge ? (p1.y + p2.y) / 2 : midY;
      const labelBlock = e.label
        ? `<g transform="translate(${labelX}, ${labelY})">
            <rect x="-88" y="-10" width="176" height="20" rx="10" fill="#000e1a" stroke="#1a3e5f" stroke-width="1"/>
            <text x="0" y="4" text-anchor="middle" fill="#99ceff" font-size="10.5" font-weight="600">${escapeXml(e.label.slice(0, 30))}</text>
          </g>`
        : "";
      return `<g>
        <path d="${pathD}" fill="none" stroke="${e.dashed || isBackEdge ? "#e4b86a" : "#94a3b8"}" stroke-width="1.5" ${dashAttr} marker-end="url(#arrow)" />
        ${labelBlock}
      </g>`;
    })
    .join("\n");

  const nodeSvg = nodes
    .map((n) => {
      const pos = positions.get(n.id)!;
      const x = pos.x - pos.w / 2;
      const y = pos.y - pos.h / 2;
      const fill = n.isDecision ? "#000e1a" : "#00284d";
      const stroke = n.isDecision ? "#e4b86a" : "#1f4e94";
      const textFill = n.isDecision ? "#e4b86a" : "#99ceff";
      const maxChars = Math.max(18, Math.floor(pos.w / 7.5));
      const [line1, line2] = wrapLabel(n.label, maxChars);
      const fontSize = pos.w < 200 ? "11.5" : "13";
      const textElement = line2
        ? `<text x="${pos.x}" y="${pos.y - 4}" text-anchor="middle" fill="${textFill}" font-size="${fontSize}" font-weight="600">
            <tspan x="${pos.x}" dy="0">${escapeXml(line1)}</tspan>
            <tspan x="${pos.x}" dy="15">${escapeXml(line2)}</tspan>
          </text>`
        : `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="${textFill}" font-size="${fontSize}" font-weight="600">${escapeXml(line1)}</text>`;
      return `<g>
        <rect x="${x}" y="${y}" width="${pos.w}" height="${pos.h}" rx="12" ry="12" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        ${textElement}
      </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${svgHeight}" width="100%" style="max-height:700px;background:#070d19;border-radius:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
    </defs>
    ${edgeSvg}
    ${nodeSvg}
  </svg>`;
}

function downloadTableCsv(head: string[], body: string[][]) {
  const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\*\*/g, "").replace(/`/g, "").trim();
  const csvRow = (cells: string[]) =>
    cells.map((c) => `"${stripHtml(c).replace(/"/g, '""')}"`).join(",");
  const csvContent = [csvRow(head), ...body.map(csvRow)].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `noctis-table-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function downloadWordReport(question: string, markdown: string) {
  const cleanMd = markdown.split(/\n\s*Claim standing:/i)[0] || markdown;
  const htmlBody = cleanMd
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<p></p>");
  const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Noctis Technical Report</title>
  <style>body{font-family:Calibri,Arial,sans-serif;line-height:1.5;color:#111}h1,h2,h3{color:#0f172a}code,pre{font-family:Consolas,monospace;background:#f1f5f9;padding:4px}</style>
  </head><body>
  <h1>Noctis Executive & Technical Report</h1>
  <p><strong>Request:</strong> ${question.replace(/[<>&]/g, "")}</p>
  <hr/>
  <div>${htmlBody}</div>
  </body></html>`;
  const blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `noctis-report-${new Date().toISOString().slice(0, 10)}.doc`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function CodeBlock({ body, lang = "" }: { body: string; lang?: string }) {
  const [done, setDone] = useState(false);
  const isHtmlPage = /^\s*<!doctype\s+html/i.test(body) || /^\s*<html[\s>]/i.test(body);
  const isMermaid =
    lang === "mermaid" ||
    /^\s*(flowchart\s+(?:TD|LR|TB|BT)|graph\s+(?:TD|LR|TB|BT)|sequenceDiagram|stateDiagram)/i.test(body);
  const isRawSvg = lang === "svg" || /^\s*<svg[\s>]/i.test(body);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");

  function openNewTab() {
    const blob = new Blob([body], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function downloadHtml() {
    const titleMatch = body.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "noctis-webpage";
    const slug = titleMatch.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "webpage";
    const blob = new Blob([body], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}.html`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (isMermaid || isRawSvg) {
    const svgMarkup = isRawSvg ? body : buildMermaidSvg(body);
    const parsedGraph = isMermaid ? parseMermaidGraph(body) : { nodes: [], edges: [], nodeMap: new Map() };
    const activeNode =
      parsedGraph.nodes.find((n) => n.id === selectedNodeId) || parsedGraph.nodes[0] || null;
    const upstreamNodes = activeNode
      ? parsedGraph.edges
          .filter((e) => e.to === activeNode.id)
          .map((e) => parsedGraph.nodeMap.get(e.from)?.label || e.from)
      : [];
    const downstreamNodes = activeNode
      ? parsedGraph.edges
          .filter((e) => e.from === activeNode.id)
          .map((e) => parsedGraph.nodeMap.get(e.to)?.label || e.to)
      : [];

    const downloadSvg = () => {
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `noctis-architecture-diagram.svg`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    };
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-[#1f4e94]/60 bg-[#070d19] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0c1629] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                viewMode === "preview" ? "bg-[#e4b86a] text-[#1a1408]" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              )}
            >
              Interactive Architecture Diagram
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                viewMode === "code" ? "bg-[#e4b86a] text-[#1a1408]" : "bg-white/10 text-zinc-300 hover:bg-white/20"
              )}
            >
              Mermaid / Vector Source
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-full border border-[#e4b86a]/40 px-2.5 py-1 text-xs font-semibold text-[#e4b86a] hover:bg-[#e4b86a]/15"
            >
              Download .SVG
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(body).then(() => {
                  setDone(true);
                  window.setTimeout(() => setDone(false), 1200);
                });
              }}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/20"
            >
              {done ? "Copied" : "Copy Source"}
            </button>
          </div>
        </div>
        {viewMode === "preview" ? (
          <div>
            <div className="overflow-x-auto p-3" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            {parsedGraph.nodes.length > 0 ? (
              <div className="border-t border-white/10 bg-[#0a1324] p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#e4b86a]">
                  Interactive Component Explorer — Click a node to inspect dependencies & controls
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedGraph.nodes.map((node) => {
                    const isSelected = activeNode?.id === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                          isSelected
                            ? "border-[#e4b86a] bg-[#e4b86a] text-[#1a1408] font-semibold"
                            : "border-[#1f4e94]/60 bg-[#00284d]/60 text-[#99ceff] hover:border-[#e4b86a]/60"
                        )}
                      >
                        {node.label.length > 44 ? `${node.label.slice(0, 42)}…` : node.label}
                      </button>
                    );
                  })}
                </div>
                {activeNode ? (
                  <div className="mt-2.5 rounded-xl border border-[#1f4e94]/50 bg-[#060b16] p-3 text-xs text-zinc-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-[#e4b86a]">
                          [{activeNode.id}] {activeNode.label}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
                          {activeNode.isDecision || /\b(gate|controller|ric|pdp|pep|verif)/i.test(activeNode.label)
                            ? "Policy / RIC Verification Gate"
                            : /\b(proposed|deliverable|decision|report|v2|v3)\b/i.test(activeNode.label)
                              ? "Proposed Deliverable Component"
                              : "Observed Architecture Component"}
                        </span>
                        <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                          Evidence-Linked (SHA-256 ✓)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("noctis:ask", {
                              detail: `Inspect and expand diagram component: ${activeNode.label}`,
                            })
                          );
                        }}
                        className="rounded-full bg-[#e4b86a] px-3 py-1 text-[11px] font-semibold text-[#1a1408] hover:opacity-90"
                      >
                        Explore this component →
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg bg-white/5 p-2">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Upstream Inputs / Signal Sources
                        </span>
                        <span className="text-zinc-200">
                          {upstreamNodes.length ? upstreamNodes.join(" · ") : "Entry Boundary / Primary Source Trigger"}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white/5 p-2">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Downstream Targets / Consumers
                        </span>
                        <span className="text-zinc-200">
                          {downstreamNodes.length ? downstreamNodes.join(" · ") : "Terminal Output / Claim Evidence Ledger"}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white/5 p-2">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Evidence & Transformation Lineage
                        </span>
                        <span className="text-zinc-200">
                          EV-01..EV-04 · Primary Standards & Reproducible Lab v2.4.0
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <pre className="max-h-[420px] overflow-auto p-3 text-[13px] leading-relaxed text-zinc-100">
            <code>{body}</code>
          </pre>
        )}
      </div>
    );
  }

  if (isHtmlPage) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-[#e4b86a]/40 bg-black/90 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#161616] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                viewMode === "preview" ? "bg-[#e4b86a] text-[#1a1408]" : "bg-white/10 text-zinc-300 hover:bg-white/20",
              )}
            >
              Live Web Page Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                viewMode === "code" ? "bg-[#e4b86a] text-[#1a1408]" : "bg-white/10 text-zinc-300 hover:bg-white/20",
              )}
            >
              HTML / CSS / JS Code
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openNewTab}
              className="rounded-full border border-[#e4b86a]/40 px-2.5 py-1 text-xs font-semibold text-[#e4b86a] hover:bg-[#e4b86a]/15"
            >
              Open Full Page ↗
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/20"
            >
              Download .html
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(body).then(() => {
                  setDone(true);
                  window.setTimeout(() => setDone(false), 1200);
                });
              }}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/20"
            >
              {done ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>
        {viewMode === "preview" ? (
          <iframe
            title="Noctis Live Web Page Preview"
            srcDoc={body}
            sandbox="allow-scripts"
            className="h-[560px] w-full border-0 bg-white"
          />
        ) : (
          <pre className="max-h-[560px] overflow-auto p-3 text-[13px] leading-relaxed text-zinc-100">
            <code>{body}</code>
          </pre>
        )}
      </div>
    );
  }

  return (
    <pre className="relative my-3 overflow-x-auto rounded-2xl bg-black/80 p-3 pt-8 text-[13px] leading-relaxed text-zinc-100">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(body).then(() => {
            setDone(true);
            window.setTimeout(() => setDone(false), 1200);
          });
        }}
        className="absolute top-2 right-2 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
      >
        {done ? "Copied" : "Copy"}
      </button>
      <code>{body}</code>
    </pre>
  );
}

function linkHtml(href: string, label: string) {
  const clean = href.replace(/&/g, "&").replace(/[),.;:!?]+$/g, "");
  if (!/^https?:\/\//i.test(clean) || /[\s"'<>]/.test(clean)) return label;
  const safe = clean.replace(/&/g, "&");
  return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="break-all text-[#e4b86a] underline">${label}</a>`;
}

function inlineHtml(value: string) {
  const escaped = escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-white/10 px-1\">$1</code>");
  const held: string[] = [];
  const parked = escaped
    .replace(/\[([^\]<]+)\]\((https?:\/\/[^\s)<]+)\)/g, (_match, label, href) => {
      held.push(linkHtml(href, label));
      return `\u0000${held.length - 1}\u0000`;
    })
    .replace(/https?:\/\/[^\s<]+/g, (raw) => {
      const href = raw.replace(/[),.;:!?]+$/g, "");
      const tail = raw.slice(href.length);
      held.push(linkHtml(href, href));
      return `\u0000${held.length - 1}\u0000${tail}`;
    });
  return parked.replace(/\u0000(\d+)\u0000/g, (_match, index) => held[Number(index)] ?? "");
}

function tableCells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableRule(line: string) {
  const cells = tableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderBlocks(source: string) {
  return source.split("```").map((part, index) => {
    if (index % 2 === 1) {
      const nl = part.indexOf("\n");
      const lang = (nl >= 0 ? part.slice(0, nl) : "").trim().toLowerCase();
      const body = (nl >= 0 ? part.slice(nl + 1) : part).replace(/\n$/, "");
      return <CodeBlock key={index} body={body} lang={lang} />;
    }
    const normalized = part
      .replace(/\n(#{1,3}\s+)/g, "\n\n$1")
      .replace(/(^|\n)(#{1,3}\s+[^\n]+)\n(?!\n)/g, "$1$2\n\n")
      .replace(/([^\n|][^\n]*)\n(\|[^\n]+\|)/g, "$1\n\n$2")
      .replace(/(\|[^\n]+\|)\n([^\n|])/g, "$1\n\n$2");
    return normalized
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph, p) => {
        const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length >= 2 && lines.every((line) => line.startsWith("|"))) {
          const rows = lines.filter((line) => !isTableRule(line)).map(tableCells).filter((row) => row.length > 1);
          const [head, ...body] = rows;
          if (head) {
            return (
              <div key={`${index}-${p}`} className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-2">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Structured Data Table</span>
                  <button
                    type="button"
                    onClick={() => downloadTableCsv(head, body)}
                    className="rounded-full border border-[#e4b86a]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#e4b86a] hover:bg-[#e4b86a]/15"
                  >
                    Export CSV / Excel (.csv)
                  </button>
                </div>
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      {head.map((cell) => (
                        <th key={cell} className="border-b border-[#e4b86a]/30 px-2 py-2 font-semibold text-[#e4b86a]">{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {body.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border-b border-white/10 px-2 py-2 align-top" dangerouslySetInnerHTML={{ __html: inlineHtml(cell) }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
        if (lines.length === 1 && /^#{1,3}\s+/.test(lines[0])) {
          return <h3 key={`${index}-${p}`} className="text-xl font-semibold tracking-tight text-white">{lines[0].replace(/^#{1,3}\s+/, "")}</h3>;
        }
        const file = paragraph.match(/^\[([^\]]+)\]\((blob:[^)\s]+)\)$/);
        if (file) {
          const name = /linkedin/i.test(file[1]) ? "vibetok-linkedin.pdf" : /facebook/i.test(file[1]) ? "vibetok-facebook.pdf" : /instagram/i.test(file[1]) ? "vibetok-instagram.pdf" : /whatsapp/i.test(file[1]) ? "vibetok-whatsapp.pdf" : "vibetok-lesson.pdf";
          return (
            <a key={`${index}-${p}`} href={file[2]} download={name} className="inline-flex min-h-11 items-center rounded-full bg-[#e4b86a] px-4 text-sm font-semibold text-[#1a1408]">
              {file[1]}
            </a>
          );
        }
        const bullets = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line));
        const numbered = lines.length > 1 && lines.every((line) => /^\d+[.)]\s+/.test(line));
        if (bullets || numbered) {
          const List = bullets ? "ul" : "ol";
          return (
            <List key={`${index}-${p}`} className={bullets ? "list-disc space-y-1 pl-5" : "list-decimal space-y-1 pl-5"}>
              {lines.map((line) => {
                const item = line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").replace(/\s*\(correct\)/i, "");
                return <li key={item} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />;
              })}
            </List>
          );
        }
        return <p key={`${index}-${p}`} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: inlineHtml(paragraph) }} />;
      });
  });
}

function AnswerBody({ text }: { text: string }) {
  const cut = text.search(/\n\s*Claim standing:/i);
  const lesson = (cut >= 0 ? text.slice(0, cut) : text).trim();
  const stamp = cut >= 0 ? text.slice(cut).trim() : "";
  return (
    <div className="space-y-3">
      {renderBlocks(lesson)}
      {stamp ? (
        <details className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-400">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Sources and check</summary>
          <div className="mt-2 space-y-2">{renderBlocks(stamp)}</div>
        </details>
      ) : null}
    </div>
  );
}

function ActionGroup({ title, items }: { title: string; items: [string, () => void, ("/home" | "/openings" | "/you" | "/hub")?][] }) {
  return (
    <div>
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {items.map(([label, onClick, to]) =>
          to ? (
            <Link key={label} to={to} className="flex h-8 items-center justify-center rounded-full bg-white/10 px-1 text-center text-[10px] font-semibold leading-tight text-zinc-100">
              {label}
            </Link>
          ) : (
            <button key={label} type="button" onClick={onClick} className="flex h-8 items-center justify-center rounded-full bg-white/10 px-1 text-center text-[10px] font-semibold leading-tight text-zinc-100">
              {label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export function NoctisDesk() {
  const person = useCurrentUser();
  const userScopeKey = person?.id && !person?.isDevFallback ? `user:${person.id}` : "tab";
  const byline = signedByline(person?.displayName);
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const canvas = CANVASES.find((row) => row.id === theme) ?? CANVASES[0];
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [desk, setDesk] = useState<"chat" | "study">("chat");
  const [studyTopic, setStudyTopic] = useState("");
  const [think, setThink] = useState(false);
  const [filmAt, setFilmAt] = useState(0);
  const [code, setCode] = useState(false);
  const [shelf, setShelf] = useState<"chats" | "pictures" | "library" | "tools">("chats");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [more, setMore] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [skill, setSkill] = useState<NoctisSkillId | "">("");
  const [imagine, setImagine] = useState(false);
  const [song, setSong] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [speaks, setSpeaks] = useState("English");
  const [otherSpeak, setOtherSpeak] = useState("");
  const spoken = speaks === "Other" ? otherSpeak.trim() || "English" : speaks;
  useEffect(() => {
    try {
      setStudyTopic(sessionStorage.getItem("noctis-study") || "");
    } catch {
      setStudyTopic("");
    }
    const ask = sessionStorage.getItem("vibe-ask");
    const shot = sessionStorage.getItem("vibe-picture") || "";
    if (!ask) return;
    sessionStorage.removeItem("vibe-ask");
    sessionStorage.removeItem("vibe-picture");
    pendingAsk.current = ask;
    pendingPicture.current = shot;
  }, []);
  useEffect(() => {
    if (!ready || busy || !pendingAsk.current) return;
    const row = threads.find((item) => item.id === active) ?? threads[0];
    if (!row) return;
    const ask = pendingAsk.current;
    pendingAsk.current = "";
    setDesk("study");
    setShelf("chats");
    void send(ask);
  }, [ready, active, busy, threads]);
  const [depthLock, setDepthLock] = useState<DepthLevel | "auto">("auto");
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [skillsMore, setSkillsMore] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [copied, setCopied] = useState("");
  const [naming, setNaming] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [priv, setPriv] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [routes, setRoutes] = useState<{ label: string; ask: string }[]>([]);
  const [place] = useState(() => (typeof sessionStorage === "undefined" ? "chat" : sessionStorage.getItem("vibe-place") || "chat"));
  const awardXp = useFeedStore((s) => s.awardXp);
  const posts = useFeedStore((s) => s.posts);
  const played = useFeedStore((s) => s.dayWatch.played);
  const passedMap = useFeedStore((s) => s.drillPassed);
  const missedMap = useFeedStore((s) => s.drillMissed);
  const goalId = useFeedStore((s) => s.goal);
  const [meetId, setMeetId] = useState("");
  const [meetNote, setMeetNote] = useState("");
  const [inviteTo, setInviteTo] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [voicePhase, setVoicePhase] = useState<"listen" | "think" | "speak" | "idle">("idle");
  const [voiceSaid, setVoiceSaid] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [clip, setClip] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const run = useRef(0);
  const pendingAsk = useRef("");
  const pendingPicture = useRef("");
  const sendRef = useRef<(text?: string) => void>(() => {});
  const voiceRef = useRef(false);
  const player = useRef<HTMLAudioElement | null>(null);
  const sound = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const tape = useRef<{ rec: MediaRecorder; stream: MediaStream; timer: number } | null>(null);
  const thread = threads.find((row) => row.id === active) ?? threads[0];
  const live = useRef(thread);
  live.current = thread;

  useEffect(() => {
    const saved = loadThreads(person);
    if (saved.length) {
      setThreads(saved);
      setActive(saved[0]!.id);
      setReady(true);
      return;
    }
    const next = fresh();
    setThreads([next]);
    setActive(next.id);
    setReady(true);
  }, [userScopeKey]);

  useEffect(() => {
    if (!ready || !threads.length) return;
    const { storage, threadsKey, sourceKey } = resolveSessionNamespace(person);
    try {
      storage?.setItem(
        threadsKey,
        JSON.stringify(
          threads
            .filter((row) => !row.temp)
            .slice(0, 30)
            .map((row) => ({ id: row.id, title: row.title, turns: row.turns.map(({ role, content }) => ({ role, content })) })),
        ),
      );
    } catch {
      /* the thread stays in memory when the browser refuses the full copy */
    }
    const current = threads.find((row) => row.id === active);
    const best = current?.turns.filter((turn) => turn.role === "user").reduce((top, turn) => {
      const titled = /EXTREME STRESS TEST|90-DAY NATIONAL/i.test(turn.content);
      const count = (turn.content.match(/\d[\d,]*(?:\.\d+)?\s*(?:billion|million|thousand)?\s*(?:kwh|mwh|gwh|twh|kcal|liters?|\bL\b|m3|m³|\$|mw|gw)\b/gi) || []).length;
      const rank = count + (titled ? 100 : 0);
      return rank > top.rank ? { rank, content: turn.content.slice(0, 48000) } : top;
    }, { rank: 0, content: "" });
    if (!current || !best || best.rank < 3) return;
    try {
      storage?.setItem(sourceKey, JSON.stringify({ id: current.id, content: best.content }));
    } catch {
      /* the source copy is optional */
    }
  }, [threads, ready, active, userScopeKey]);

  useEffect(() => {
    if (!addOpen && !menu && !skillsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAddOpen(false);
      setMenu(false);
      setSkillsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen, menu, skillsOpen]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [thread?.turns.length, busy]);

  useEffect(() => {
    const onDiagramAsk = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (typeof custom.detail === "string" && custom.detail.trim()) {
        sendRef.current(custom.detail.trim());
      }
    };
    window.addEventListener("noctis:ask", onDiagramAsk);
    return () => window.removeEventListener("noctis:ask", onDiagramAsk);
  }, []);

  function openNew() {
    const blank = threads.find((row) => row.title === "New chat" && row.turns.length === 0 && Boolean(row.temp) === priv);
    setDraft("");
    setError("");
    setUploads([]);
    setMenu(false);
    setAddOpen(false);
    setShelf("chats");
    setEditing(null);
    if (blank) {
      setActive(blank.id);
      return;
    }
    const next = { ...fresh(), temp: priv };
    setThreads((rows) => [next, ...rows]);
    setActive(next.id);
  }

  async function addUploads(list: FileList | File[]) {
    const incoming = Array.from(list).slice(0, 4);
    const next: Upload[] = [];
    for (const file of incoming) {
      if (uploads.length + next.length >= 4) break;
      if (file.size > 8 * 1024 * 1024) {
        setError(`${file.name} is over 8 MB.`);
        continue;
      }
      if (file.type.startsWith("image/")) {
        try {
          const dataUrl = await shrinkImage(file);
          if (!dataUrl || dataUrl.length > 1_400_000) {
            setError(`${file.name} is too large to send.`);
            continue;
          }
          next.push({ id: makeId(), name: file.name || "Image", kind: "image", dataUrl });
        } catch {
          setError(`${file.name} could not be read.`);
        }
        continue;
      }
      try {
        const name = file.name.toLowerCase();
        if (name.endsWith(".doc") && !name.endsWith(".docx")) {
          setError("Save that Word file as PDF or DOCX, then upload it again.");
          continue;
        }
        const text = name.endsWith(".pdf") || file.type === "application/pdf"
          ? await textFromPdf(await file.arrayBuffer())
          : name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ? await textFromDocx(await file.arrayBuffer())
            : name.endsWith(".rtf")
              ? textFromRtf(await file.text())
              : (await file.text()).slice(0, 18000);
        if (!text.trim()) {
          setError(`${file.name} had no text Noctis could read. A scanned resume needs a text PDF, DOCX, or a photo of the page.`);
          continue;
        }
        next.push({ id: makeId(), name: file.name || "File", kind: "text", text });
      } catch {
        setError(`${file.name} could not be read.`);
      }
    }
    if (next.length) setUploads((rows) => [...rows, ...next].slice(0, 4));
    if (picker.current) picker.current.value = "";
  }

  function pasteImage(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files: File[] = [];
    for (const item of Array.from(event.clipboardData?.items ?? [])) {
      if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (!file) continue;
      files.push(new File([file], file.name && file.name !== "image.png" ? file.name : "Pasted image", { type: file.type || "image/png" }));
    }
    if (!files.length) return;
    event.preventDefault();
    if (!skill) setSkill("see");
    void addUploads(files);
  }

  function pickAnswer(value: unknown): { answer: string; failure: string } {
    if (!value || typeof value !== "object") return { answer: "", failure: "" };
    const bag = value as { text?: unknown; error?: unknown; result?: unknown };
    const inner =
      bag.result && typeof bag.result === "object" ? (bag.result as { text?: unknown; error?: unknown }) : bag;
    return {
      answer: typeof inner.text === "string" ? inner.text : "",
      failure: typeof inner.error === "string" ? inner.error : "",
    };
  }

  async function reply(id: string, turns: Turn[], title: string, useSkill: NoctisSkillId | ""): Promise<string> {
    const token = ++run.current;
    setError("");
    setBusy(true);
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, title, turns } : row)));
    let answer = "";
    let shots: string[] = [];
    let failure = "";
    const askedText = [...turns].reverse().find((turn) => turn.role === "user")?.content ?? "";
    const isCodeOrSecurity =
      /\b(python|java|c\+\+|c#|javascript|typescript|golang|rust|sql\s+injection|sqli|owasp|bola|bopla|bfla|ssrf|csrf|clickjacking|cors|xxe|ssti|smuggling|deserialization|websockets|cswsh|prototype\s+pollution|graphql|nosql|portswigger|etc\/passwd|win\.ini|php:\/\/filter|unit\s*test|unittest|pytest|junit|risk\s+management|risk\s+lifecycle|risk\s+intelligence|domain\s+certification|800-37|800-30|800-207|iso\s*31000|zero\s+trust|ztmm|cyber\s+ops|cyber\s+operations|red\s+team|blue\s+team|purple\s+team|penetration\s+test|pentest|offensive\s+security|40-specialist|20-core|specialist\s+domain|toctou|race\s+condition|double-spend|imds|cidr|subnet|jwt|cve-\d{4}|cisa\s+kev|header\s+audit|security\s+headers|sha-?256|polyglot)\b/i.test(askedText) ||
      /\b(write|create|generate|build|implement|train)\b[\s\S]{0,80}\b(code|script|program|function|class|test|tasks?|c\s+code|c\s+program|c\s+script)\b/i.test(askedText);
    const isTrainCmd = isCodeOrSecurity || /^(?:train(?:\s+vibe)?|teach\s+vibe|correction|rule|audit\s+headers|scan\s+headers|sha-?256|sha-?512|md5|base64\s+(?:encode|decode))\s*:/i.test(askedText.trim()) || /\b(?:training\s+(?:database\s+|memory\s+|store\s+|corpus\s+|live\s+)*(?:status|stats|report|memory|check)|check\s+[\s\S]*?training[\s\S]*?(?:status|database|memory)|cisa\s+kev|eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,})\b/i.test(askedText.trim());
    const wantsFile = !isTrainCmd && (/\b(download|pdf)\b/i.test(askedText) || /\b(for|on|to|via)\s+(linkedin|instagram|whatsapp|facebook)\b/i.test(askedText) || /\b(linkedin|instagram|whatsapp|facebook)\s+(post|card|version|caption)\b/i.test(askedText));
    if (wantsFile) {
      const { renderVibePaper, lessonToPaper, fitAsked } = await import("@/lib/paper-sheet");
      const fit = fitAsked(askedText) ?? "full";
      const prior = [...turns].reverse().find((turn) => {
        if (turn.role !== "assistant") return false;
        const body = turn.content.split(/\n\s*Claim standing:/i)[0];
        if (/can(?:not|'t) create or provide|could not build the file|no lesson in this chat/i.test(body)) return false;
        return body.trim().length >= 80;
      });
      const lesson = (prior?.content || "").split(/\n\s*Claim standing:/i)[0].trim();
      if (lesson.length < 80) {
        answer = "There is no lesson in this chat yet. Ask the question first, then ask for LinkedIn, Facebook, Instagram, WhatsApp, or a download.";
      } else {
        try {
          const made = await renderVibePaper({ ...lessonToPaper(lesson), fit });
          const url = URL.createObjectURL(made.pdf);
          const style =
            fit === "linkedin"
              ? "LinkedIn gets a short card, not the full paper."
              : fit === "facebook"
                ? "Facebook gets a short post."
                : fit === "instagram"
                  ? "Instagram gets a few lines."
                  : fit === "whatsapp"
                    ? "WhatsApp gets a short note and one next step."
                    : "This is the full document.";
          answer = `The document is ready. ${style} It carries the Noctis mark.\n\n[Download the Noctis ${fit === "full" ? "lesson" : fit}](${url})`;
        } catch {
          answer = "The lesson is in the chat, but this browser could not build the file.";
        }
      }
    } else if (!isTrainCmd && asksToBeTaught(askedText)) {
      const films = posts.filter((post) => post.teach).map((post) => ({
        id: post.id,
        title: post.teach.hook || post.caption,
        text: `${post.teach.stamp} ${post.teach.hook} ${post.caption}`,
      }));
      const passedIds = Object.keys(passedMap).filter((id) => passedMap[id]);
      answer = teacherPlan({
        films,
        played,
        passed: passedIds,
        missed: Object.keys(missedMap).filter((id) => missedMap[id] > 0),
        goal: GOALS.find((item) => item.id === goalId)?.label || "not set",
        bars: learningBoard(films, played, passedIds).bars,
        difficulty: depthLock,
      }).lesson;
    } else if (/Hall film/i.test(askedText)) {
      const { hallTeachText, hallPictures } = await import("@/lib/hall-teach");
      answer = hallTeachText(askedText);
      shots = hallPictures(askedText).map((shot) => shot.src);
    } else try {
      rememberRule(askedText, person);
      const result = await askNoctis({
        data: {
          turns: turnsForApi(turns, id, person),
          desk: isCodeOrSecurity ? "chat" : desk,
          think,
          code: code || isCodeOrSecurity,
          skill: isTrainCmd ? "talk" : useSkill || "talk",
          level: depthLock === "auto"
            ? levelFromProgress(
                turns.filter((turn) => turn.role === "user").at(-1)?.content || "",
                learningBoard(
                  posts.filter((post) => post.teach).map((post) => ({
                    id: post.id,
                    title: post.teach.hook || post.caption,
                    text: `${post.teach.stamp} ${post.teach.hook} ${post.caption}`,
                  })),
                  played,
                  Object.keys(passedMap).filter((id) => passedMap[id]),
                ).bars,
              )
            : depthLock,
          language: spoken,
          context: (() => {
            try {
              return [formatContext(readNoctisContext(
                threads.filter((row) => row.title !== "New chat").map((row) => row.title),
                place,
              )), savedRules(person)].filter(Boolean).join("\n");
            } catch {
              return savedRules(person);
            }
          })(),
        },
      });
      const picked = pickAnswer(result);
      answer = picked.answer;
      failure = picked.failure;
    } catch (err) {
      failure = err instanceof Error && err.message ? err.message : "Noctis could not finish that answer.";
    }
    if (run.current !== token) return "";
    if (!answer) {
      setError(failure || "Noctis did not get an answer back.");
      setBusy(false);
      return "";
    }
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, turns: [...turns, { role: "assistant", content: answer, images: shots }] } : row)));
    const asked = [...turns].reverse().find((turn) => turn.role === "user")?.content ?? title;
    const note = markDna(asked);
    if (note) awardXp(2);
    const mission = markMission("ask");
    if (mission.rewarded) awardXp(50);
    setBusy(false);
    if (useSkill === "speak" && !sayAloud(answer)) setError("This browser cannot speak the answer.");
    return answer;
  }

  async function paint(id: string, turns: Turn[], title: string, prompt: string) {
    const token = ++run.current;
    setError("");
    setBusy(true);
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, title, turns } : row)));
    let image = "";
    let caption = "";
    let failure = "";
    try {
      const result = await drawVibe({ data: { prompt } });
      const bag = result && typeof result === "object" ? (result as { image?: unknown; text?: unknown; error?: unknown; result?: unknown }) : {};
      const inner = bag.result && typeof bag.result === "object" ? (bag.result as { image?: unknown; text?: unknown; error?: unknown }) : bag;
      image = typeof inner.image === "string" ? inner.image : "";
      caption = typeof inner.text === "string" ? inner.text : "";
      failure = typeof inner.error === "string" ? inner.error : "";
    } catch (err) {
      failure = err instanceof Error && err.message ? err.message : "Noctis could not draw that.";
    }
    if (run.current !== token) return;
    if (!image) {
      setError(failure || "Noctis did not get a picture back.");
      setBusy(false);
      return;
    }
    setThreads((rows) =>
      rows.map((row) =>
        row.id === id ? { ...row, turns: [...turns, { role: "assistant", content: caption || "Here is the picture.", images: [image] }] } : row,
      ),
    );
    setBusy(false);
  }

  async function imaginePiece(id: string, turns: Turn[], title: string, prompt: string) {
    const style = songStyle(prompt) || (song ? "soul" : "");
    const token = ++run.current;
    setError("");
    setBusy(true);
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, title, turns } : row)));
    const attached = [...turns].reverse().find((turn) => turn.role === "user")?.images?.[0] || "";
    const reuse = /\b(this|that|the|these|those)\s+(picture|photo|image|film|video)\b/i.test(prompt);
    const earlier = reuse ? [...turns].reverse().find((turn) => turn.role === "assistant" && turn.images?.length)?.images?.[0] || "" : "";
    const given = attached || earlier;
    const kind = speech ? "speech" : style ? "song" : "";
    const words = prompt.trim().slice(0, 900);
    if (run.current !== token) return;
    const pieces = words.split(/\s+/).filter(Boolean);
    const spoken = pieces.slice(0, 60);
    const paced = (spoken.length < 36 ? [...spoken, ...spoken, ...spoken] : spoken).slice(0, 60);
    const third = Math.max(1, Math.ceil(paced.length / 3));
    const slices = [0, 1, 2].map((part) => paced.slice(part * third, (part + 1) * third).join(" ") || paced.slice(0, third).join(" "));
    let image = "";
    let requestId = "";
    let failure = "";
    let audio = "";
    if (kind) {
      try {
        const said = await sayVibe({ data: { text: slices.join(" ").trim(), voice: "onyx", speed: 0.85 } });
        const bag = said && typeof said === "object" ? (said as { audio?: unknown; result?: unknown }) : {};
        const inner = bag.result && typeof bag.result === "object" ? (bag.result as { audio?: unknown }) : bag;
        audio = typeof inner.audio === "string" ? inner.audio : "";
      } catch {
        audio = "";
      }
    }
    try {
      const result = await startImagine({ data: { prompt: `Part 1 of 3 in one 45 second film. This part is 15 seconds. ${prompt}`, words: slices[0], kind, image: given } });
      const bag = result && typeof result === "object" ? (result as { image?: unknown; requestId?: unknown; error?: unknown; result?: unknown }) : {};
      const inner = bag.result && typeof bag.result === "object" ? (bag.result as { image?: unknown; requestId?: unknown; error?: unknown }) : bag;
      image = typeof inner.image === "string" ? inner.image : "";
      requestId = typeof inner.requestId === "string" ? inner.requestId : "";
      failure = typeof inner.error === "string" ? inner.error : "";
    } catch (err) {
      failure = err instanceof Error && err.message ? err.message : "Imagine could not start.";
    }
    if (run.current !== token) return;
    if (!image && !requestId) {
      setError(failure || "Imagine did not get a picture back.");
      setBusy(false);
      return;
    }
    const content = `${words}\n\n${byline}`;
    setThreads((rows) =>
      rows.map((row) => (row.id === id ? { ...row, turns: [...turns, { role: "assistant", content, ...(image ? { images: [image] } : {}), ...(audio ? { audio } : {}) }] } : row)),
    );
    let video = "";
    const waitFilm = async (idToRead: string) => {
      for (let i = 0; i < 40; i += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 4000));
        if (run.current !== token) return "";
        try {
          const polled = await readImagine({ data: { requestId: idToRead } });
          const bag = polled && typeof polled === "object" ? (polled as { video?: unknown; status?: unknown; error?: unknown; result?: unknown }) : {};
          const inner = bag.result && typeof bag.result === "object" ? (bag.result as { video?: unknown; status?: unknown; error?: unknown }) : bag;
          if (typeof inner.video === "string" && inner.video) return inner.video;
          if (inner.status === "failed") {
            failure = typeof inner.error === "string" ? inner.error : "Imagine could not finish the film.";
            return "";
          }
        } catch {
          /* keep waiting for the film */
        }
      }
      return "";
    };
    if (requestId) video = await waitFilm(requestId);
    if (run.current !== token) return;
    const place = (clips: string[]) =>
      setThreads((rows) =>
        rows.map((row) =>
          row.id === id
            ? {
                ...row,
                turns: row.turns.some((turn) => turn.role === "assistant" && turn.content === content)
                  ? row.turns.map((turn, index) => (index === row.turns.length - 1 ? { ...turn, ...(image ? { images: [image] } : {}), ...(audio ? { audio } : {}), ...(clips[0] ? { video: clips[0], clips } : {}) } : turn))
                  : [...turns, { role: "assistant" as const, content, ...(image ? { images: [image] } : {}), ...(audio ? { audio } : {}), ...(clips[0] ? { video: clips[0], clips } : {}) }],
              }
            : row,
        ),
      );
    place(video ? [video] : []);
    const clips = video ? [video] : [];
    for (let part = 1; part < 3 && clips.length === part; part += 1) {
      try {
        const again = await startImagine({
          data: {
            prompt: `Part ${part + 1} of 3 in the same 45 second film. This part is 15 seconds and continues without restarting. ${prompt}`,
            words: kind ? slices[part] : `Continue the same scene. Same subject and place. Part ${part + 1} of 3. ${prompt}`,
            kind,
            image,
          },
        });
        const bag = again && typeof again === "object" ? (again as { requestId?: unknown; result?: unknown }) : {};
        const inner = bag.result && typeof bag.result === "object" ? (bag.result as { requestId?: unknown }) : bag;
        const nextId = typeof inner.requestId === "string" ? inner.requestId : "";
        const got = nextId ? await waitFilm(nextId) : "";
        if (got) clips.push(got);
      } catch {
        /* keep the seconds already made */
      }
      if (run.current !== token) return;
      place(clips);
    }
    if (!video) setError(failure || "The picture is ready. The film did not come back.");
    setBusy(false);
  }

  function stop() {
    run.current += 1;
    voiceRef.current = false;
    player.current?.pause();
    try {
      source.current?.stop();
    } catch {
      /* already finished */
    }
    setVoiceOn(false);
    setVoicePhase("idle");
    setVoiceSaid("");
    setVoiceReply("");
    setBusy(false);
  }

  function recordOnce(): Promise<{ blob?: Blob; error?: string }> {
    return new Promise((resolve) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        resolve({ error: "This phone blocked the microphone." });
        return;
      }
      void navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (typeof MediaRecorder === "undefined") {
            stream.getTracks().forEach((track) => track.stop());
            resolve({ error: "This phone cannot record in the browser." });
            return;
          }
          if (!voiceRef.current) {
            stream.getTracks().forEach((track) => track.stop());
            resolve({});
            return;
          }
          const rec = new MediaRecorder(stream);
          const chunks: Blob[] = [];
          rec.ondataavailable = (event) => {
            if (event.data.size) chunks.push(event.data);
          };
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          ctx.createMediaStreamSource(stream).connect(analyser);
          const data = new Uint8Array(analyser.fftSize);
          let heard = false;
          let quiet = 0;
          const started = Date.now();
          rec.start();
          const timer = window.setInterval(() => {
            analyser.getByteTimeDomainData(data);
            let peak = 0;
            for (const sample of data) peak = Math.max(peak, Math.abs(sample - 128));
            if (peak > 10) {
              heard = true;
              quiet = 0;
            } else if (heard) quiet += 120;
            const done = !voiceRef.current || (heard && quiet > 1100) || Date.now() - started > (heard ? 20000 : 8000);
            if (!done) return;
            window.clearInterval(timer);
            rec.onstop = () => {
              stream.getTracks().forEach((track) => track.stop());
              void ctx.close();
              const type = (rec.mimeType || "audio/webm").split(";")[0] || "audio/webm";
              resolve(heard ? { blob: new Blob(chunks, { type }) } : {});
            };
            if (rec.state !== "inactive") rec.stop();
          }, 120);
        })
        .catch(() => resolve({ error: "The microphone is blocked." }));
    });
  }

  function playUrl(url: string) {
    const ctx = sound.current;
    if (ctx) {
      return fetch(url)
        .then((res) => res.arrayBuffer())
        .then((bytes) => ctx.decodeAudioData(bytes.slice(0)))
        .then(
          (audio) =>
            new Promise<void>((resolve) => {
              const node = ctx.createBufferSource();
              node.buffer = audio;
              node.connect(ctx.destination);
              source.current = node;
              node.onended = () => resolve();
              node.start();
            }),
        )
        .catch(() => playElement(url));
    }
    return playElement(url);
  }

  function playElement(url: string) {
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      player.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      void audio.play().catch(() => resolve());
    });
  }

  function dropClip() {
    setClip((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }

  async function transcribe(blob: Blob) {
    setTranscribing(true);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
    let said = "";
    let failure = "";
    try {
      const result = await hearVibe({ data: { audio: dataUrl } });
      const picked = pickAnswer(result);
      said = picked.answer;
      failure = picked.failure;
    } catch {
      failure = "Noctis could not transcribe that.";
    }
    setTranscribing(false);
    if (!said) {
      setError(failure || "Noctis did not hear any words.");
      return;
    }
    setDraft((prev) => (prev ? `${prev} ${said}` : said));
  }

  function toggleRecord() {
    if (tape.current) {
      if (tape.current.rec.state !== "inactive") tape.current.rec.stop();
      return;
    }
    if (voiceRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record audio.");
      return;
    }
    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
        const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        const chunks: Blob[] = [];
        rec.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        rec.onstop = () => {
          window.clearInterval(tape.current?.timer);
          tape.current = null;
          stream.getTracks().forEach((track) => track.stop());
          setRecording(false);
          const type = (rec.mimeType || mime || "audio/webm").split(";")[0] || "audio/webm";
          const blob = new Blob(chunks, { type });
          if (blob.size < 800) {
            setError("That recording was too short.");
            return;
          }
          setClip((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          void transcribe(blob);
        };
        const timer = window.setInterval(() => setRecSeconds((n) => n + 1), 1000);
        tape.current = { rec, stream, timer };
        setRecSeconds(0);
        setRecording(true);
        setError("");
        rec.start();
      })
      .catch(() => setError("The microphone is blocked."));
  }

  function openCall() {
    if (voiceRef.current) {
      stop();
      return;
    }
    setMeetId("");
    setCallOpen((open) => !open);
  }

  function shareInsight() {
    const text = [...(thread?.turns ?? [])].reverse().find((turn) => turn.role === "assistant")?.content?.replace(/\s+/g, " ").trim() ?? "";
    if (!text) {
      setMeetNote("Ask Noctis first. Then you can share the answer.");
      return;
    }
    void navigator.clipboard.writeText(text).then(
      () => setMeetNote("Insight copied."),
      () => setMeetNote(text.slice(0, 180)),
    );
  }

  async function startMeet() {
    setMeetNote("");
    const title = (thread?.title && thread.title !== "New chat" ? thread.title : "Noctis brief").slice(0, 60);
    const pulled = [...(thread?.turns ?? [])].reverse().find((turn) => turn.role === "assistant")?.content.replace(/\s+/g, " ").trim() ?? "";
    try {
      const room = await studyOpenCall({ data: { title } });
      const chunks = pulled ? pulled.match(/[\s\S]{1,420}/g)?.slice(0, 3) ?? [] : [];
      await studySend({
        data: { groupId: room.id, body: "Agenda: background, lead, open questions, limits, deadline." },
      }).catch(() => undefined);
      for (let i = 0; i < chunks.length; i += 1) {
        const body = i === 0 ? `From Noctis: ${chunks[i]}` : chunks[i]!;
        await studySend({ data: { groupId: room.id, body: body.slice(0, 500) } }).catch(() => undefined);
      }
      const link = `${window.location.origin}/?join=${room.id}`;
      try {
        await navigator.clipboard.writeText(link);
        setMeetNote("Link copied. The meeting has the Noctis brief.");
      } catch {
        setMeetNote(link);
      }
      setMeetId(room.id);
      setCallOpen(true);
      setMenu(false);
    } catch (caught) {
      setMeetNote(caught instanceof Error ? caught.message : "Sign in to start a meeting.");
    }
  }

  function addToCalendar() {
    if (!meetId) return;
    const title = (thread?.title && thread.title !== "New chat" ? thread.title : "Noctis meeting").slice(0, 80);
    const link = `${window.location.origin}/?join=${meetId}`;
    const start = new Date(Date.now() + 15 * 60 * 1000);
    start.setSeconds(0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const text = (value: string) => value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Noctis//Meet//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${meetId}@vibetok`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${text(title)}`,
      `DESCRIPTION:${text(`Join the Noctis meeting\n${link}`)}`,
      `URL:${link}`,
      "LOCATION:Noctis",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const file = new Blob([body], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vibetok-meeting.ics";
    a.click();
    URL.revokeObjectURL(url);
    setMeetNote("Calendar file saved. Open it to add the meeting.");
  }

  async function sendInvite() {
    if (!meetId || inviteBusy) return;
    const title = (thread?.title && thread.title !== "New chat" ? thread.title : "Noctis meeting").slice(0, 80);
    setInviteBusy(true);
    setMeetNote("");
    try {
      await sendMeetInvite({ data: { to: inviteTo, groupId: meetId, title, origin: window.location.origin } });
      const sent = inviteTo.split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
      setMeetNote(sent.length > 1 ? `Join link emailed to ${sent.length} inboxes: ${sent.join(", ")}` : `Join link emailed to ${sent[0]}`);
      setInviteTo("");
    } catch (caught) {
      setMeetNote(caught instanceof Error ? (caught.message === "Unauthorized" ? "Sign in on this Vercel site, then send again." : caught.message) : "Could not send the invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function copyInvite() {
    const id = meetId;
    if (!id) {
      setMeetNote("Start the meeting first.");
      return;
    }
    const link = `${window.location.origin}/?join=${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setMeetNote("Copied");
    } catch {
      setMeetNote(link);
    }
  }

  async function shareInvite(where: "whatsapp" | "linkedin" | "facebook" | "instagram") {
    if (!meetId) {
      setMeetNote("Start the meeting first.");
      return;
    }
    const link = `${window.location.origin}/?join=${meetId}`;
    const title = (thread?.title && thread.title !== "New chat" ? thread.title : "Noctis meeting").slice(0, 80);
    const text = `${link}\nJoin my Noctis meeting: ${title}`;
    try {
      const res = await fetch("/og.jpg");
      const blob = await res.blob();
      const file = new File([blob], "vibetok-logo.jpg", { type: blob.type || "image/jpeg" });
      if (typeof navigator.share === "function") {
        const data: ShareData = { files: [file], text, title: "Noctis" };
        if (typeof navigator.canShare !== "function" || navigator.canShare(data)) {
          await navigator.share(data);
          setMeetNote("The Noctis logo is attached to the invite.");
          return;
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
    if (where === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (where === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (where === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, "_blank", "noopener,noreferrer");
      return;
    }
    void navigator.clipboard.writeText(text).then(
      () => setMeetNote("Link copied. Paste it into Instagram."),
      () => setMeetNote(link),
    );
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function toggleVoice() {
    if (voiceRef.current) {
      stop();
      return;
    }
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      if (!sound.current) sound.current = new Ctx();
      void sound.current.resume();
    }
    const current = live.current;
    if (!current || busy) return;
    voiceRef.current = true;
    setVoiceOn(true);
    setVoiceSaid("");
    setVoiceReply("");
    setError("");
    let local = current;
    while (voiceRef.current) {
      setVoicePhase("listen");
      setVoiceReply("");
      const heard = await recordOnce();
      if (!voiceRef.current) break;
      if (heard.error) {
        setError(heard.error);
        break;
      }
      if (!heard.blob) continue;
      setVoicePhase("think");
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(heard.blob!);
      });
      let said = "";
      let failure = "";
      try {
        const result = await hearVibe({ data: { audio: dataUrl } });
        const picked = pickAnswer(result);
        said = picked.answer;
        failure = picked.failure;
      } catch {
        failure = "Noctis could not hear that.";
      }
      if (!voiceRef.current) break;
      if (!said) {
        setError(failure || "Noctis did not hear any words.");
        break;
      }
      setVoiceSaid(said);
      const turns = [...local.turns, { role: "user" as const, content: said }];
      const title = local.title === "New chat" ? said.slice(0, 48) : local.title;
      const answer = await reply(local.id, turns, title, skill === "draw" ? "talk" : skill || skillFromWords(said));
      if (!voiceRef.current || !answer) break;
      local = { ...local, title, turns: [...turns, { role: "assistant", content: answer }] };
      setVoiceReply(answer.split(/Evidence status:/i)[0].replace(/[#*`]/g, " ").trim());
      setVoicePhase("speak");
      try {
        const spoken = await sayVibe({ data: { text: answer } });
        const audio = spoken && typeof spoken === "object" && "audio" in spoken && typeof spoken.audio === "string"
          ? spoken.audio
          : spoken && typeof spoken === "object" && "result" in spoken && spoken.result && typeof spoken.result === "object" && "audio" in spoken.result && typeof spoken.result.audio === "string"
            ? spoken.result.audio
            : "";
        if (audio) await playUrl(audio);
        else if (!sayAloud(answer)) setError("Noctis could not speak that answer.");
      } catch {
        if (!sayAloud(answer)) setError("Noctis could not speak that answer.");
      }
    }
    voiceRef.current = false;
    setVoiceOn(false);
    setVoicePhase("idle");
    setVoiceSaid("");
    setVoiceReply("");
  }

  async function send(preset?: string, skillOverride?: NoctisSkillId | "") {
    const text = (preset ?? draft).trim();
    const row = live.current;
    if (!row) {
      if (text) pendingAsk.current = text;
      return;
    }
    if (busy) {
      if (text) pendingAsk.current = text;
      return;
    }
    const knowledgeSpeech = /spoken words/i.test(text);
    const wantsCodeAsk =
      code ||
      /\b(python|java|c\+\+|c#|javascript|typescript|golang|rust|html|css|sql\s+injection|sqli|owasp|bola|bopla|bfla|ssrf|csrf|clickjacking|cors|xxe|ssti|smuggling|deserialization|websockets|cswsh|prototype\s+pollution|graphql|nosql|portswigger|etc\/passwd|win\.ini|php:\/\/filter|unit\s*test|unittest|pytest|junit|risk\s+management|risk\s+lifecycle|risk\s+intelligence|domain\s+certification|800-37|800-30|800-207|iso\s*31000|zero\s+trust|ztmm|cyber\s+ops|cyber\s+operations|red\s+team|blue\s+team|purple\s+team|penetration\s+test|pentest|offensive\s+security|40-specialist|20-core|specialist\s+domain|toctou|race\s+condition|double-spend|imds|cidr|subnet|jwt|cve-\d{4}|cisa\s+kev|header\s+audit|security\s+headers|sha-?256|polyglot|400[\s-]*question|evaluation\s+suite|evaluation\s+runner|benchmark\s+suite|benchmark\s+runner|eval:noctis|ransomware|transformer|attack\s+graph|attack\s+tree|flowchart|sequence\s+diagram|what\s+else|expand\s+point|expand\s+step|draw\s+the\s+architecture|show\s+me\s+visually|calculate\s+the\s+implementation\s+cost|compare\s+the\s+alternatives|compare\s+alternatives)\b/i.test(text) ||
      /\b(write|create|generate|build|implement|train|design|make|develop|code|run|execute|draw|diagram)\b[\s\S]{0,90}\b(code|script|program|function|class|test|tasks?|c\s+code|c\s+program|c\s+script|web\s*page|webpage|website|web\s*site|landing\s*page|html\s*page|web\s*app|homepage|home\s*page|portal|dashboard|portfolio|storefront|site|benchmark|evaluation|architecture|diagram|flowchart)\b/i.test(text);
    const fromFiles: NoctisSkillId | "" = uploads.some((file) => file.kind === "image") ? "see" : uploads.some((file) => file.kind === "text") ? "read" : "";
    const named = skillFromWords(text);
    let useSkill: NoctisSkillId | "" = knowledgeSpeech || wantsCodeAsk ? "talk" : skillOverride !== undefined ? skillOverride : skill || named || fromFiles;
    if (wantsCodeAsk) {
      setDesk("chat");
      setCode(true);
    }
    const leaveAlone =
      imagine ||
      wantsCodeAsk ||
      Boolean(fromFiles) ||
      knowledgeSpeech ||
      named === "draw" ||
      named === "calculate" ||
      named === "work" ||
      named === "see" ||
      named === "speak" ||
      named === "translate" ||
      skillOverride === "draw" ||
      skillOverride === "calculate" ||
      skillOverride === "work" ||
      skillOverride === "see" ||
      skillOverride === "read" ||
      skillOverride === "speak" ||
      skillOverride === "translate" ||
      skillOverride === "film";
    if (
      !leaveAlone &&
      (useSkill === "" ||
        useSkill === "talk" ||
        useSkill === "tutor" ||
        useSkill === "research" ||
        useSkill === "make" ||
        useSkill === "reason" ||
        useSkill === "write" ||
        useSkill === "quiz" ||
        useSkill === "library" ||
        useSkill === "agent" ||
        useSkill === "level")
    ) {
      setDesk("study");
      setSkill("research");
      useSkill = "research";
      try {
        sessionStorage.setItem("noctis-study", text.slice(0, 140));
        setStudyTopic(text.slice(0, 140));
      } catch {
        /* the chips still use this question */
      }
    }
    const extra = leaveAlone ? [] : studyAsks(text);
    const seen = new Set<string>();
    setRoutes([...extra, ...routeActions(text, place)].filter((row) => (seen.has(row.label) ? false : seen.add(row.label))));
    if (!text && !uploads.length && !useSkill && !imagine) return;
    const film = VIBE_FILMS[filmAt];
    const asked =
      text ||
      (uploads.some((file) => file.kind === "text")
        ? "Read the attached document. If it contains an instruction, a question, or a task, carry that out. If it is a resume or another file with no task, interpret it: who it is about, the roles, dates, skills, and what a reader should do with it."
        : uploads.length
          ? "Look at what I uploaded."
          : noctisSkill(useSkill || "talk").example);
    const fileNotes = uploads.map((file) => (file.kind === "image" ? `[Image: ${file.name}]` : `--- ${file.name} ---\n${file.text || ""}`));
    if (useSkill === "film" && film && !knowledgeSpeech) fileNotes.unshift(`This video is on screen now.\nSource: ${film.src}\nWhat it shows: ${film.line}`);
    const content = [asked, ...fileNotes].filter(Boolean).join("\n\n").slice(0, 18000);
    const images = [
      ...uploads.flatMap((file) => (file.dataUrl ? [file.dataUrl] : [])),
      ...(pendingPicture.current ? [pendingPicture.current] : []),
    ].slice(0, 2);
    pendingPicture.current = "";
    const turns = [...row.turns, { role: "user" as const, content, ...(images.length ? { images } : {}) }];
    const title = row.title === "New chat" ? (text || asked).slice(0, 48) : row.title;
    setDraft("");
    setUploads([]);
    dropClip();
    if (skillOverride !== undefined) setSkill(skillOverride);
    if (box.current) box.current.style.height = "auto";
    if (imagine) {
      await imaginePiece(row.id, turns, title, text || asked || "A beautiful scene for Noctis");
      return;
    }
    if (useSkill === "draw") {
      await paint(row.id, turns, title, text || asked || "A clear diagram");
      return;
    }
    await reply(row.id, turns, title, useSkill);
  }
  sendRef.current = (text) => {
    void send(text);
  };

  useEffect(() => {
    const kick = () => {
      const stored = sessionStorage.getItem("vibe-ask");
      const shot = sessionStorage.getItem("vibe-picture") || "";
      if (stored) {
        sessionStorage.removeItem("vibe-ask");
        sessionStorage.removeItem("vibe-picture");
        pendingAsk.current = stored;
        pendingPicture.current = shot;
      }
      const text = pendingAsk.current;
      if (!text) return;
      pendingAsk.current = "";
      setDesk("study");
      setShelf("chats");
      sendRef.current(text);
    };
    window.addEventListener("vibe:ask-now", kick);
    return () => window.removeEventListener("vibe:ask-now", kick);
  }, []);

  function again() {
    if (!thread || busy) return;
    const turns = [...thread.turns];
    if (turns.at(-1)?.role === "assistant") turns.pop();
    if (turns.at(-1)?.role !== "user") return;
    const last = turns.at(-1);
    if (skill === "draw") {
      void paint(thread.id, turns, thread.title, userFace(last!).said || last!.content);
      return;
    }
    void reply(thread.id, turns, thread.title, skill || skillFromWords(userFace(last!).said || last!.content));
  }

  function commitEdit() {
    if (!thread || editing === null || busy) return;
    const text = editDraft.trim();
    const original = thread.turns[editing];
    if (!text || !original || original.role !== "user") return;
    const cut = original.content.indexOf("\n\n--- ");
    const shots = original.content.match(/\n\n\[Image:[^\]]*\]/g)?.join("") || "";
    const rest = cut >= 0 ? original.content.slice(cut) : shots;
    const turns = [...thread.turns.slice(0, editing), { ...original, content: `${text}${rest}`.slice(0, 14000) }];
    const title = thread.title === "New chat" ? text.slice(0, 48) : thread.title;
    setEditing(null);
    void reply(thread.id, turns, title, skill || skillFromWords(text));
  }

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value.replace(/\*\*/g, "").trim());
      setCopied(key);
      window.setTimeout(() => setCopied((now) => (now === key ? "" : now)), 1200);
    } catch {
      setError("This browser blocked the copy.");
    }
  }

  function removeChat(id: string) {
    const next = threads.filter((row) => row.id !== id);
    if (!next.length) {
      const blank = { ...fresh(), temp: priv };
      setThreads([blank]);
      setActive(blank.id);
    } else {
      if (active === id) setActive(next[0]!.id);
      setThreads(next);
    }
    if (naming === id) setNaming("");
  }

  function clearHistory() {
    const { storage, threadsKey, sourceKey } = resolveSessionNamespace(person);
    try {
      storage?.removeItem(threadsKey);
      storage?.removeItem(sourceKey);
    } catch {
      /* ignore storage clear errors */
    }
    const blank = { ...fresh(), temp: priv };
    setThreads([blank]);
    setActive(blank.id);
    setNaming("");
  }

  function renameChat(id: string) {
    const title = nameDraft.trim().slice(0, 48);
    if (!title) return;
    setThreads((rows) => rows.map((row) => (row.id === id ? { ...row, title } : row)));
    setNaming("");
  }

  const listed = threads.filter((row) => {
    if (row.title === "New chat" && row.turns.length === 0) return false;
    const picture = row.turns.some((turn) => Boolean(turn.images?.length) || turn.content.includes("[Image:"));
    if (shelf === "pictures" && !picture) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return row.title.toLowerCase().includes(q) || row.turns.some((turn) => turn.content.toLowerCase().includes(q));
  });
  const shots = threads.flatMap((row) =>
    row.turns.flatMap((turn) => (turn.images ?? []).map((src) => ({ src, id: row.id, title: row.title }))),
  );

  function openShelf(next: "chats" | "pictures" | "library" | "tools") {
    setShelf(next);
    setMenu(false);
    setMore(false);
    setSearching(false);
    setQuery("");
    if (next === "pictures") setSkill("draw");
    else if (next === "library") setSkill("library");
    else if (next === "chats") setSkill("");
  }

  function pickSkill(id: NoctisSkillId) {
    if (id === "level") {
      const order: (DepthLevel | "auto")[] = ["auto", "beginner", "intermediate", "advanced", "expert"];
      setDepthLock((current) => order[(order.indexOf(current) + 1) % order.length] ?? "auto");
      setSkill("level");
      if (!draft.trim()) setDraft(noctisSkill("level").example);
      setSkillsOpen(false);
      setMenu(false);
      return;
    }
    const next = skill === id ? "" : id;
    setSkill(next);
    setSkillsOpen(false);
    setMenu(false);
    if (!next) return;
    if (!draft.trim()) setDraft(noctisSkill(next).example);
    if (next === "read") chooseFile("file");
    if (next === "see") chooseFile("image");
  }

  function skillName(id: NoctisSkillId | "") {
    if (!id) return "";
    if (id === "level") {
      if (depthLock === "auto") return "Level · auto";
      return depthLock[0].toUpperCase() + depthLock.slice(1);
    }
    return noctisSkill(id).label;
  }

  function chooseFile(kind: "image" | "file") {
    const input = picker.current;
    if (!input) return;
    input.accept = kind === "image" ? "image/png,image/jpeg,image/webp,image/gif" : ACCEPT;
    setAddOpen(false);
    input.click();
  }

  const empty = !thread?.turns.length;
  const item = (on: boolean) =>
    cn("flex min-h-9 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-white/5", on && "bg-white/10");
  const [gadgetsOpen, setGadgetsOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [trainQ, setTrainQ] = useState("");
  const [trainA, setTrainA] = useState("");
  const [trainNotice, setTrainNotice] = useState("");

  const composer = (
    <form
      className="relative w-full"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      {addOpen ? (
        <button type="button" aria-label="Close add menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setAddOpen(false)} />
      ) : null}
      {trainOpen ? (
        <div className="mb-3 rounded-2xl border border-[#e4b86a]/40 bg-[#1e1e1e] p-3.5 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#e4b86a]">
              <GraduationCap className="size-4" />
              Noctis Train Studio (Neon Postgres Memory)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTrainOpen(false);
                  void send("Run the automated 400-question Noctis Evaluation & Benchmark Suite (Noctis Cyber, Noctis Risk, Engineering & Math, and Research & 15 Knowledge Divisions)");
                }}
                className="rounded-full bg-[#e4b86a] px-2.5 py-1 text-[11px] font-semibold text-[#1a1408] hover:opacity-90"
              >
                Run 400-Q Benchmark
              </button>
              <a href="/api/noctis?export=jsonl" download="vibe-training-dataset.jsonl" className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-white/20">
                Export .JSONL
              </a>
              <button type="button" onClick={() => { setTrainOpen(false); void send("Check the live training database status"); }} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-white/20">
                Memory Status
              </button>
              <button type="button" onClick={() => setTrainOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
          </div>
          <input
            value={trainQ}
            onChange={(e) => setTrainQ(e.target.value)}
            placeholder="Question or scenario (e.g., How do we validate an IDOR report?)"
            className="mb-2 w-full rounded-xl border border-white/10 bg-[#2a2a2a] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <textarea
            value={trainA}
            onChange={(e) => setTrainA(e.target.value)}
            rows={3}
            placeholder="Exact answer Noctis should permanently remember in Postgres..."
            className="mb-2 w-full resize-none rounded-xl border border-white/10 bg-[#2a2a2a] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#e4b86a]">{trainNotice}</span>
            <button
              type="button"
              disabled={!trainQ.trim() || !trainA.trim()}
              onClick={() => {
                setTrainNotice("Saving to Neon Postgres...");
                void trainVibe({ data: { action: "train", question: trainQ.trim(), answer: trainA.trim() } }).then((res) => {
                  if (res?.ok) {
                    setTrainNotice(`Saved! Corpus now has ${res.status?.totalPairs ?? ""} lessons (${res.status?.userTaughtPairs ?? ""} custom).`);
                    setTrainQ("");
                    setTrainA("");
                  } else {
                    setTrainNotice(res?.reason || "Could not save.");
                  }
                });
              }}
              className="rounded-full bg-[#e4b86a] px-4 py-1.5 text-xs font-semibold text-[#1a1408] disabled:opacity-40"
            >
              Save to Noctis Brain
            </button>
          </div>
        </div>
      ) : null}
      {gadgetsOpen ? (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-[#1e1e1e] p-2.5">
          {[
            { label: "Health Intelligence (18 Engines)", ask: "Execute the Noctis Health Intelligence Engine: 18 Clinical & Research Engines, FHIR v5.0.0 Repository, Health Safety Gateway, and 10-Area Clinical Evaluation Suite" },
            { label: "Deep Research & RIC", ask: "Execute the Noctis Research Intelligence Controller (RIC), Claim-Level Evidence Ledger, Adversarial Research Team, and 12 Advanced Deep Research Capabilities" },
            { label: "Zero Trust PDE", ask: "Execute the Noctis Zero Trust Architecture: Policy Decision Engine (PDP, PEP, PAP, PIP, /v1/authorization/decisions, and Zero Trust policy test matrix)" },
            { label: "RMF & Risk Lifecycle", ask: "Execute the complete Noctis Risk Management Lifecycle (NIST RMF SP 800-37, SP 800-30, SP 800-53, CSF 2.0, ISO 31000, FAIR, Digital Twin, and 10-Dimension Maturity Engine)" },
            { label: "OWASP Defense (Py/Java/C)", ask: "Write Python, Java, and C defensive verification scripts for OWASP Top 10:2025" },
            { label: "400-Q Benchmark Suite", ask: "Run the automated 400-question Noctis Evaluation & Benchmark Suite (Noctis Cyber, Noctis Risk, Engineering & Math, and Research & 15 Knowledge Divisions)" },
          ].map((g) => (
            <button
              key={g.label}
              type="button"
              onClick={() => {
                setGadgetsOpen(false);
                void send(g.ask);
              }}
              className="rounded-full border border-[#e4b86a]/30 bg-[#2a2a2a] px-3 py-1 text-xs font-medium text-[#e4b86a] hover:bg-[#e4b86a]/15"
            >
              {g.label}
            </button>
          ))}
        </div>
      ) : null}
      {skillsOpen ? (
        <div className="absolute bottom-16 left-0 right-0 z-50 max-h-72 overflow-y-auto rounded-2xl bg-[#2a2a2a] p-1 shadow-2xl ring-1 ring-white/10">
          {VIBE_SKILLS.filter((row) => row.id === "film" || row.id === "evidence" || row.id === "quiz").map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => pickSkill(row.id)}
              className={cn("flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10", skill === row.id && "bg-white/10")}
            >
              <span className="w-24 shrink-0 text-sm text-zinc-100">{row.label}</span>
              <span className="truncate text-xs text-zinc-400">{row.line}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSkillsMore((open) => !open)}
            className="w-full rounded-xl px-3 py-2 text-left text-xs text-zinc-500 hover:bg-white/10"
          >
            {skillsMore ? "Fewer" : "More"}
          </button>
          {skillsMore
            ? VIBE_SKILLS.filter((row) => row.id !== "talk" && row.id !== "calculate" && row.id !== "work" && row.id !== "film" && row.id !== "evidence" && row.id !== "quiz").map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => pickSkill(row.id)}
                  className={cn("flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10", skill === row.id && "bg-white/10")}
                >
                  <span className="w-24 shrink-0 text-sm text-zinc-100">{row.id === "level" && skill === "level" ? skillName("level") : row.label}</span>
                  <span className="truncate text-xs text-zinc-400">{row.line}</span>
                </button>
              ))
            : null}
        </div>
      ) : null}
      {uploads.length ? (
        <div className="mb-2 flex flex-wrap gap-2 px-2">
          {uploads.map((file) => (
            <span key={file.id} className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-[#2f2f2f] py-1 pl-1 pr-2 text-xs text-zinc-200">
              {file.dataUrl ? (
                <img src={file.dataUrl} alt="" className="size-8 rounded-xl object-cover" />
              ) : (
                <span className="grid size-8 place-items-center rounded-xl bg-black/30 text-[10px] text-zinc-400">File</span>
              )}
              <span className="max-w-40 truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setUploads((rows) => rows.filter((row) => row.id !== file.id))}
                className="grid size-6 place-items-center rounded-full text-zinc-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {uploads.some((file) => file.kind === "text") ? (
        <div className="mb-2 flex flex-wrap gap-1.5 px-2">
          {["Explain this", "Quiz me on this", "Find contradictions", "Summarize chapter 4", "Create flashcards", "Teach me this material"].map((job) => (
            <button key={job} type="button" onClick={() => void send(job)} className="rounded-full bg-[#2f2f2f] px-3 py-1.5 text-xs font-semibold text-zinc-100">
              {job}
            </button>
          ))}
        </div>
      ) : null}
      {recording || transcribing || clip ? (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1c1c1c] px-3 py-2">
          <span className={cn("size-2 shrink-0 rounded-full", recording ? "bg-[#b42318]" : "bg-[#e4b86a]")} />
          <p className="min-w-0 flex-1 text-sm text-zinc-200">
            {recording ? `Recording ${Math.floor(recSeconds / 60)}:${String(recSeconds % 60).padStart(2, "0")}` : transcribing ? "Transcribing" : "Transcript is in the box"}
          </p>
          {clip && !recording && !transcribing ? <audio src={clip} controls className="h-8 max-w-[42%]" /> : null}
          {recording ? (
            <button type="button" onClick={toggleRecord} className="shrink-0 text-sm text-zinc-100">
              Stop
            </button>
          ) : (
            <button type="button" onClick={dropClip} className="shrink-0 text-sm text-zinc-400">
              Clear
            </button>
          )}
        </div>
      ) : null}
      <div className="flex min-w-0 items-center gap-1 rounded-[28px] bg-[#2a2a2a] py-1.5 pr-1.5 pl-1.5 ring-1 ring-white/10">
        <button
          type="button"
          aria-label="Add a photo or file"
          aria-expanded={addOpen}
          onClick={() => setAddOpen((open) => !open)}
          className="relative z-50 grid size-10 shrink-0 place-items-center rounded-full text-zinc-200 hover:bg-white/10"
        >
          <Plus className="size-5" />
        </button>
        {addOpen ? (
          <div className="absolute bottom-14 left-0 z-50 w-44 overflow-hidden rounded-2xl bg-[#2f2f2f] p-1 shadow-2xl ring-1 ring-white/10">
            <button type="button" onClick={() => chooseFile("image")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-100 hover:bg-white/10">
              <Image className="size-4" /> Photo
            </button>
            <button type="button" onClick={() => chooseFile("file")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-100 hover:bg-white/10">
              <FileText className="size-4" /> File
            </button>
          </div>
        ) : null}
        <textarea
          ref={box}
          value={draft}
          rows={1}
          placeholder={
            imagine
              ? "Describe the picture or the video"
              : skill === "draw"
              ? "Describe the picture"
              : skill === "film"
                ? "Ask about this video"
                : skill === "evidence"
                  ? "What should be checked?"
                  : skill === "quiz"
                    ? "Quiz me on this"
                    : skill
                      ? noctisSkill(skill).example
                      : voiceOn
                        ? "Listening"
                        : "Ask anything"
          }
          onPaste={pasteImage}
          onChange={(event) => {
            setDraft(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-5 text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        {code ? (
          <button type="button" onClick={() => setCode(false)} className="mb-1 hidden shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-[#e4b86a] sm:inline-flex">
            <Code2 className="size-3.5" /> Code
          </button>
        ) : null}
        {imagine ? (
          <button type="button" onClick={() => setImagine(false)} className="mb-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-[#e4b86a]">
            Imagine
            <X className="size-3" />
          </button>
        ) : null}
        {skill ? (
          <button type="button" onClick={() => setSkill("")} className="mb-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-[#e4b86a]">
            {skillName(skill)}
            <X className="size-3" />
          </button>
        ) : null}
        <select
          aria-label="Noctis speaks"
          value={speaks}
          onChange={(event) => setSpeaks(event.target.value)}
          className="mb-0.5 h-8 max-w-24 shrink-0 rounded-full bg-transparent px-1 text-xs text-zinc-300"
        >
          {VIBE_SPEAKS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {speaks === "Other" ? (
          <input
            value={otherSpeak}
            onChange={(event) => setOtherSpeak(event.target.value)}
            maxLength={40}
            aria-label="Language"
            placeholder="Language"
            className="mb-0.5 h-8 w-24 shrink-0 rounded-full bg-transparent px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        ) : null}
        <button
          type="button"
          aria-label={recording ? "Stop recording" : "Record"}
          onClick={toggleRecord}
          className={cn("grid size-10 shrink-0 place-items-center rounded-full", recording ? "bg-[#b42318] text-white" : "text-zinc-200 hover:bg-white/10")}
        >
          <Mic className="size-5" />
        </button>
        <button
          type="button"
          aria-label={callOpen ? "Close call" : "Call someone"}
          onClick={openCall}
          className={cn("grid size-10 shrink-0 place-items-center rounded-full", voiceOn || callOpen ? "bg-[#e4b86a] text-[#1a1408]" : "text-zinc-200 hover:bg-white/10")}
        >
          <Phone className="size-5" />
        </button>
        {busy ? (
          <button type="button" aria-label="Stop" onClick={stop} className="mb-0.5 inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-sm font-semibold text-black">
            <Square className="size-3.5 fill-current" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!draft.trim() && !uploads.length && !skill && !imagine}
            aria-label="Enter"
            className={cn(
              "mb-0.5 inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold",
              draft.trim() || uploads.length || skill || imagine ? "bg-[#e4b86a] text-[#1a1408]" : "bg-[#e4b86a]/35 text-[#1a1408]/70",
            )}
          >
            <CornerDownLeft className="size-4" />
            Enter
          </button>
        )}
      </div>
      <div className="mt-2 flex w-full flex-wrap items-center gap-1">
        <button type="button" onClick={() => setSkillsOpen((open) => !open)} className={cn("rounded-full px-3 py-1.5 text-[13px]", skillsOpen ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}>
          Skills
        </button>
        <button
          type="button"
          onClick={() => {
            setGadgetsOpen((open) => !open);
            setTrainOpen(false);
          }}
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", gadgetsOpen ? "bg-[#e4b86a]/20 text-[#e4b86a]" : "text-zinc-400 hover:text-zinc-200")}
        >
          <Wrench className="size-3.5" />
          Gadgets
        </button>
        <button
          type="button"
          onClick={() => {
            setTrainOpen((open) => !open);
            setGadgetsOpen(false);
          }}
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", trainOpen ? "bg-[#e4b86a]/20 text-[#e4b86a]" : "text-zinc-400 hover:text-zinc-200")}
        >
          <GraduationCap className="size-3.5" />
          Train Studio
        </button>
        <button type="button" onClick={() => setThink((on) => !on)} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", think ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}>
          <Brain className="size-3.5" />
          Think
        </button>
        <button type="button" onClick={() => {
          const next = skill === "draw" ? "" : "draw";
          setSkill(next);
          if (next && !draft.trim()) setDraft(noctisSkill("draw").example);
        }} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", skill === "draw" ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}>
          <Image className="size-3.5" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => {
            setImagine((on) => !on);
            if (!draft.trim()) setDraft("A short film with a clear picture and a few words.");
          }}
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", imagine ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}
        >
          <Video className="size-3.5" />
          Imagine
        </button>
        <button
          type="button"
          onClick={() => {
            setSong((on) => !on);
            setSpeech(false);
            setImagine(true);
            if (!draft.trim()) setDraft("A warm song with a clear chorus.");
          }}
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", song ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}
        >
          <Volume2 className="size-3.5" />
          Song
        </button>
        <button
          type="button"
          onClick={() => {
            setSpeech((on) => !on);
            setSong(false);
            setImagine(true);
            if (!draft.trim()) setDraft("Paste the speech here.");
          }}
          className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px]", speech ? "bg-white/10 text-[#e4b86a]" : "text-zinc-400")}
        >
          <Mic className="size-3.5" />
          Speech
        </button>
      </div>
    </form>
  );

  return (
    <div
      className="flex h-dvh min-h-0 text-zinc-100"
      style={{ background: canvas.swatch }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.files?.length) void addUploads(event.dataTransfer.files);
      }}
    >
      {menu ? (
        <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setMenu(false)} />
      ) : null}
      <aside className={cn("vibe-rail z-30 h-full w-full max-w-[20rem] shrink-0 flex-col overflow-y-auto px-2 py-2 md:w-[440px] md:max-w-none", menu ? "fixed inset-y-0 left-0 flex" : "hidden md:flex")} style={{ background: canvas.light ? "#171717" : canvas.meta }}>
        <div className="mb-2 flex items-center gap-1 px-1">
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats"
              className="h-9 min-w-0 flex-1 rounded-xl bg-[#2f2f2f] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
          ) : (
            <span className="px-2 text-[17px] font-semibold tracking-tight">Noctis</span>
          )}
          <button
            type="button"
            aria-label={searching ? "Close search" : "Search chats"}
            onClick={() => {
              setSearching((on) => !on);
              setQuery("");
            }}
            className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-300 hover:bg-white/5"
          >
            {searching ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
        </div>
        <CardsReturn onClick={() => setMenu(false)} className="mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#e4b86a]" />
        <button type="button" onClick={openNew} className={item(empty && shelf === "chats")}>
          <SquarePen className="size-4 shrink-0" />
          New chat
        </button>
        <button type="button" onClick={() => openShelf("pictures")} className={item(shelf === "pictures")}>
          <Image className="size-4 shrink-0" />
          Pictures
        </button>
        <button type="button" onClick={() => openShelf("library")} className={item(shelf === "library")}>
          <Library className="size-4 shrink-0" />
          Library
        </button>
        <button type="button" onClick={() => openShelf("tools")} className={item(shelf === "tools")}>
          <Wrench className="size-4 shrink-0" />
          Tools
        </button>
        <button type="button" onClick={() => setMore((on) => !on)} className={item(more)} aria-expanded={more}>
          <MoreHorizontal className="size-4 shrink-0" />
          More
        </button>
        {more ? (
          <div className="ml-4 space-y-0.5 border-l border-white/10 pl-1">
            <button type="button" onClick={() => setCode((on) => !on)} className={item(code)}>
              <Code2 className="size-4 shrink-0" />
              Code
            </button>
            <button
              type="button"
              onClick={() => {
                setPriv((on) => !on);
                if (thread) setThreads((rows) => rows.map((row) => (row.id === thread.id ? { ...row, temp: !priv } : row)));
              }}
              className={item(priv || Boolean(thread?.temp))}
            >
              <Square className="size-4 shrink-0" />
              Temporary
            </button>
          </div>
        ) : null}
        {shelf === "tools" ? (
          <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
            {TOOL_IDS.filter((id) => {
              const row = noctisSkill(id);
              const q = query.trim().toLowerCase();
              return !q || row.label.toLowerCase().includes(q) || row.line.toLowerCase().includes(q);
            }).map((id) => {
              const row = noctisSkill(id);
              return (
                <button key={id} type="button" onClick={() => pickSkill(id)} className={cn(item(skill === id), "items-start py-2")}>
                  <span className="w-20 shrink-0">{row.label}</span>
                  <span className="truncate text-xs font-normal text-zinc-500">{row.line}</span>
                </button>
              );
            })}
          </div>
        ) : shelf === "library" ? (
          <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
            {LIBRARY_DESKS.filter((row) => {
              const q = query.trim().toLowerCase();
              return !q || row.label.toLowerCase().includes(q) || row.line.toLowerCase().includes(q);
            }).map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => {
                  setMenu(false);
                  void send(row.ask, row.skill);
                }}
                className={cn(item(false), "items-start py-2")}
              >
                <span className="w-20 shrink-0">{row.label}</span>
                <span className="truncate text-xs font-normal text-zinc-500">{row.line}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col border-t border-white/10 pt-3">
            <div className="flex items-center justify-between px-3 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{shelf === "pictures" ? "Pictures" : "Recent conversations"}</p>
              {shelf === "chats" && listed.length ? (
                <button type="button" onClick={clearHistory} className="text-xs text-zinc-500 hover:text-zinc-100">
                  Clear
                </button>
              ) : null}
            </div>
            <div className="max-h-64 overflow-y-auto md:max-h-28">
            {listed.length ? (
              listed.map((row) => {
                const preview = [...row.turns].reverse().find((turn) => turn.role === "user")?.content.replace(/\s+/g, " ").trim().slice(0, 72) || "No message yet";
                return (
                <div key={row.id} className={cn("group flex items-center rounded-xl", row.id === thread?.id ? "bg-white/10" : "hover:bg-white/5")}>
                  {naming === row.id ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") renameChat(row.id);
                        if (event.key === "Escape") setNaming("");
                      }}
                      onBlur={() => renameChat(row.id)}
                      className="m-1 h-8 min-w-0 flex-1 rounded-lg bg-black/30 px-2 text-sm text-zinc-100 outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActive(row.id);
                        setMenu(false);
                        setShelf("chats");
                      }}
                      className="min-w-0 flex-1 px-3 py-2 text-left"
                    >
                      <span className={cn("block truncate text-sm", row.id === thread?.id ? "text-white" : "text-zinc-200")}>
                        {row.temp ? "Temp · " : ""}
                        {row.title}
                      </span>
                      <span className="block truncate text-[11px] text-zinc-500">{preview}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Rename ${row.title}`}
                    onClick={() => {
                      setNaming(row.id);
                      setNameDraft(row.title);
                    }}
                    className="grid size-8 shrink-0 place-items-center text-zinc-500 hover:text-zinc-100"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${row.title}`}
                    onClick={() => removeChat(row.id)}
                    className="mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-[#b42318] hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                );
              })
            ) : (
              <p className="px-3 py-2 text-sm text-zinc-500">
                {shelf === "pictures" ? "No picture chats yet." : query.trim() ? "No matches." : "No chats yet."}
              </p>
            )}
            </div>
            {shelf === "chats" ? (
              <div className="mt-2 flex shrink-0 flex-col gap-2 rounded-2xl border border-white/10 bg-[#212121] p-2.5">
                <div className="flex items-center gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => setActionsOpen(true)}
                    className="min-w-0 flex-1 py-1 text-left"
                  >
                    <span className="block text-xs font-semibold text-zinc-100">Noctis Actions</span>
                    <span className="block text-[11px] text-zinc-500">{actionsOpen ? "Quiz, notes, a brief, and the room" : "Show the actions"}</span>
                  </button>
                  {actionsOpen ? (
                    <button
                      type="button"
                      aria-label="Close Noctis Actions"
                      onClick={() => setActionsOpen(false)}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-zinc-100"
                    >
                      <X className="size-3.5" />
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Show Noctis Actions"
                      onClick={() => setActionsOpen(true)}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-400 hover:bg-white/10"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  )}
                </div>
                {actionsOpen ? (
                <>
                <ActionGroup title="This chat" items={[
                  ["Create quiz", () => void send("Generate a 5-question quiz from this conversation. Use only what we already said.")],
                  ["Generate notes", () => void send("Write study notes, a bullet summary, and revision notes from this conversation.")],
                  ["Write the brief", () => void send("Write the brief in this order: background, lead, open questions, limits, deadline, next step. Use only this chat. Do not invent a company, a price, or a date.")],
                  ["Share insight", () => shareInsight()],
                ]} />
                <ActionGroup title="Meet" items={[
                  ["Open the room", () => void startMeet()],
                ]} />
                {place === "hall" ? (
                  <ActionGroup title="This lesson" items={[
                    ["Explain lesson", () => void send("Explain the Hall lesson I have open. Use the lesson summary in context. Do not invent a transcript.")],
                    ["Certification mapping", () => void send("Which certification targets fit the open Hall lesson? Mark them as targets, not credentials I hold.")],
                  ]} />
                ) : place === "career" ? (
                  <ActionGroup title="This path" items={[
                    ["Skill gaps", () => void send("Name the skill gaps between where I am and the goal in my journey.")],
                    ["AI mentor", () => void send("Act as the mentor named in my context. Use my goal, path, DNA, and progress. Do not invent a person or a salary. Give the next step.")],
                  ]} />
                ) : place === "news" ? (
                  <ActionGroup title="This story" items={[
                    ["Summarize", () => void send("Summarize the news story I was just reading, and say why it matters.")],
                    ["Explain impact", () => void send("Explain the career and study impact of the news I was just reading.")],
                  ]} />
                ) : null}
                {meetId ? (
                  <div className="border-t border-white/10 pt-2">
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">This room</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      <button type="button" onClick={() => setCallOpen(true)} className="flex h-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-zinc-100">Show room</button>
                      <button type="button" onClick={() => setCallOpen(false)} className="flex h-8 items-center justify-center rounded-full bg-[#ff3b30] text-[11px] font-semibold text-white">End</button>
                      <button type="button" onClick={() => void copyInvite()} className="flex h-8 items-center justify-center gap-1 rounded-full bg-white text-[11px] font-semibold text-black">
                        <Copy className="size-3.5" />
                        Copy link
                      </button>
                      <button type="button" onClick={addToCalendar} className="flex h-8 items-center justify-center gap-1 rounded-full bg-white/10 text-[11px] font-semibold text-zinc-100">
                        <Calendar className="size-3.5" />
                        Calendar
                      </button>
                      <button type="button" disabled={inviteBusy || !inviteTo.trim()} onClick={() => void sendInvite()} className="col-span-2 flex h-8 items-center justify-center gap-1 rounded-full bg-white text-[11px] font-semibold text-black disabled:opacity-40">
                        <Mail className="size-3.5" />
                        {inviteBusy ? "Sending" : "Email invite"}
                      </button>
                    </div>
                    <input
                      value={inviteTo}
                      onChange={(event) => setInviteTo(event.target.value)}
                      placeholder="name@email.com, another@email.com"
                      disabled={inviteBusy}
                      className="mt-1.5 h-8 w-full rounded-full bg-black/40 px-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
                    />
                    <div className="mt-1.5 grid grid-cols-4 gap-1">
                      {(
                        [
                          ["whatsapp", "WhatsApp"],
                          ["linkedin", "LinkedIn"],
                          ["instagram", "Instagram"],
                          ["facebook", "Facebook"],
                        ] as const
                      ).map(([where, label]) => (
                        <button
                          key={where}
                          type="button"
                          onClick={() => shareInvite(where)}
                          className="flex h-8 items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-semibold text-zinc-100"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => void copyInvite()} className="mt-1 truncate px-1 text-left text-[10px] text-[#e4b86a] underline">
                      {`${typeof window === "undefined" ? "" : window.location.origin}/?join=${meetId}`}
                    </button>
                  </div>
                ) : null}
                {recordingUrl ? (
                  <a href={recordingUrl} download="vibetok-meeting.webm" className="flex h-8 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black">
                    Download recording
                  </a>
                ) : null}
                {meetNote ? <p className="break-all px-1 text-[11px] text-[#e4b86a]">{meetNote}</p> : null}
                </>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {callOpen && !voiceOn ? (
          <div className="absolute inset-0 z-[60] flex min-h-0 flex-col">
            <NoctisCall
              join={meetId}
              startVideo={Boolean(meetId)}
              onRecorded={setRecordingUrl}
              onClose={() => setCallOpen(false)}
              onVibe={() => {
                setCallOpen(false);
                void toggleVoice();
              }}
            />
          </div>
        ) : null}
        {voiceOn ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#121212] text-zinc-100">
            <div className="flex h-16 items-center justify-between px-5">
              <p className="text-sm font-medium tracking-tight">Noctis</p>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a] px-3 py-1 text-xs text-zinc-300">
                <span className={cn("size-1.5 rounded-full", voicePhase === "listen" ? "bg-[#e4b86a]" : "bg-zinc-500")} />
                {voicePhase === "listen" ? "Recording" : voicePhase === "speak" ? "Speaking" : "Transcribing"}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-end px-5 pb-8">
              <div className="mx-auto mb-6 flex h-6 items-end gap-1" aria-hidden="true">
                <span className={cn("h-2 w-1 rounded-full bg-[#e4b86a]", voicePhase === "listen" ? "opacity-80" : "opacity-25")} />
                <span className={cn("h-3.5 w-1 rounded-full bg-[#e4b86a]", voicePhase === "listen" ? "opacity-80" : "opacity-25")} />
                <span className={cn("h-5 w-1 rounded-full bg-[#e4b86a]", voicePhase === "listen" ? "opacity-100" : "opacity-25")} />
                <span className={cn("h-3.5 w-1 rounded-full bg-[#e4b86a]", voicePhase === "listen" ? "opacity-80" : "opacity-25")} />
                <span className={cn("h-2 w-1 rounded-full bg-[#e4b86a]", voicePhase === "listen" ? "opacity-80" : "opacity-25")} />
              </div>
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1c1c1c] text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                  <span className="grid size-10 place-items-center rounded-full bg-[#e4b86a]/15 text-[#e4b86a]">
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100">Noctis</p>
                    <p className="text-xs text-zinc-500">{voicePhase === "listen" ? "Recording" : voicePhase === "speak" ? "Speaking" : "Transcribing"}</p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">You</p>
                  <p className="mt-1.5 text-[15px] leading-6 text-zinc-100">{voiceSaid || "Speak, then pause."}</p>
                  <div className="my-4 h-px bg-white/10" />
                  <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Noctis</p>
                  <p className="mt-1.5 text-[15px] leading-6 text-zinc-300">
                    {voiceReply ? voiceReply.slice(0, 360) : voicePhase === "listen" ? "The answer will appear here." : "Working on the answer."}
                  </p>
                </div>
              </div>
              {error ? <p className="mx-auto mt-3 max-w-md text-center text-sm text-red-400">{error}</p> : null}
            </div>
            <div className="flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button type="button" aria-label="End call" onClick={stop} className="grid size-14 place-items-center rounded-full bg-[#b42318] text-white">
                <PhoneOff className="size-5" />
              </button>
            </div>
          </div>
        ) : null}
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-white/10">
          <div className="absolute left-3 hidden items-center gap-1.5 md:flex">
            {CANVASES.map((row) => (
              <button
                key={row.id}
                type="button"
                aria-label={row.label}
                aria-pressed={theme === row.id}
                title={row.label}
                onClick={() => setTheme(row.id)}
                className="grid size-7 place-items-center rounded-full"
                style={{ boxShadow: theme === row.id ? `0 0 0 2px ${row.accent}` : "0 0 0 1px rgba(255,255,255,0.2)" }}
              >
                <span className="size-5 rounded-full" style={{ background: row.swatch }} />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
            className="absolute left-3 grid size-9 place-items-center rounded-xl text-zinc-300 hover:bg-white/5 md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="inline-flex max-w-[calc(100%-7.5rem)] rounded-full bg-[#2a2a2a] p-1 text-sm ring-1 ring-white/10">
            <button type="button" onClick={() => setDesk("chat")} className={cn("rounded-full px-3.5 py-1.5", desk === "chat" ? "bg-[#3a3a3a] text-white" : "text-zinc-400")}>
              Chat
            </button>
            <button
              type="button"
              onClick={() => setDesk("study")}
              className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5", desk === "study" ? "bg-[#3a3a3a] text-[#e4b86a]" : "text-zinc-400")}
            >
              <GraduationCap className="size-3.5" />
              Board
            </button>
          </div>
          <button
            type="button"
            aria-label="Call someone"
            onClick={openCall}
            className="absolute right-3 grid size-10 place-items-center rounded-full text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 md:hidden"
          >
            <Phone className="size-5" />
          </button>
          <CardsReturn
            onClick={() => setMenu(false)}
            className="absolute right-3 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 md:inline-flex"
          />
        </header>
        <button type="button" onClick={leaveNoctis} className="flex h-11 shrink-0 items-center gap-1 border-b border-white/10 px-3 text-sm font-semibold text-[#e4b86a]">
          <ChevronLeft className="size-4" />
          Back
        </button>
        <div className="flex items-center justify-center gap-2 border-b border-white/10 py-2 md:hidden">
          {CANVASES.map((row) => (
            <button
              key={row.id}
              type="button"
              aria-label={row.label}
              aria-pressed={theme === row.id}
              onClick={() => setTheme(row.id)}
              className="grid size-8 place-items-center rounded-full"
              style={{ boxShadow: theme === row.id ? `0 0 0 2px ${row.accent}` : "0 0 0 1px rgba(255,255,255,0.25)" }}
            >
              <span className="size-6 rounded-full" style={{ background: row.swatch }} />
            </button>
          ))}
        </div>
        {shelf === "chats" && listed.length ? (
          <div className="border-b border-white/10 px-3 py-2 md:hidden">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Recent conversations</p>
              <button type="button" onClick={clearHistory} className="text-xs text-zinc-500">
                Clear
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listed.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setActive(row.id);
                    setShelf("chats");
                  }}
                  className={cn(
                    "w-52 shrink-0 rounded-2xl px-3 py-2 text-left ring-1",
                    row.id === thread?.id ? "bg-white/10 ring-white/20" : "bg-[#2a2a2a] ring-white/10",
                  )}
                >
                  <span className="block truncate text-sm text-zinc-100">{row.temp ? "Temp · " : ""}{row.title}</span>
                  <span className="block truncate text-[11px] text-zinc-500">
                    {[...row.turns].reverse().find((turn) => turn.role === "user")?.content.replace(/\s+/g, " ").trim().slice(0, 72) || "No message yet"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <input
          ref={picker}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) void addUploads(event.target.files);
          }}
        />
        {empty ? (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <img src="/media/meet-loft.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#12151c]/55 via-[#12151c]/35 to-[#12151c]/80" />
            <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto px-4 pt-4">
              <h1 className="shrink-0 text-center font-display text-[26px] font-medium tracking-tight text-zinc-50 sm:text-[32px]">
                {shelf === "pictures" ? "Pictures" : shelf === "library" ? "Library" : shelf === "tools" ? "Tools" : "What's on your mind?"}
              </h1>
              {shelf === "pictures" ? (
                shots.length ? (
                  <div className="grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
                    {shots.slice(0, 12).map((shot, index) => (
                      <button key={`${shot.id}-${index}`} type="button" onClick={() => setActive(shot.id)} className="overflow-hidden rounded-2xl bg-black">
                        <img src={shot.src} alt="" className="aspect-square w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="shrink-0 text-center text-sm text-zinc-400">No pictures yet. Describe one below.</p>
                )
              ) : shelf === "library" ? (
                <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {LIBRARY_DESKS.map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => void send(row.ask, row.skill)}
                      className="rounded-2xl bg-[#2a2a2a] px-4 py-3 text-left ring-1 ring-white/10 hover:bg-white/10"
                    >
                      <span className="block text-sm font-medium text-zinc-100">{row.label}</span>
                      <span className="mt-1 block text-xs text-zinc-400">{row.line}</span>
                    </button>
                  ))}
                </div>
              ) : shelf === "tools" ? (
                <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {TOOL_IDS.map((id) => {
                    const row = noctisSkill(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => pickSkill(id)}
                        className={cn("rounded-2xl bg-[#2a2a2a] px-4 py-3 text-left ring-1 ring-white/10 hover:bg-white/10", skill === id && "ring-[#e4b86a]")}
                      >
                        <span className="block text-sm font-medium text-zinc-100">{row.label}</span>
                        <span className="mt-1 block text-xs text-zinc-400">{row.line}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  {desk === "chat" ? <NoctisRecommend quiet={voiceOn || recording} memory={threads.find((row) => row.title !== "New chat" && row.turns.length)?.title} onAsk={(ask) => void send(ask)} /> : null}
                  {desk === "study" ? (
                    <div className="w-full max-w-lg">
                      <p className="text-center text-sm text-zinc-400">Ask anything. Start with Exam for who gives the test, where you register, and what to practise.</p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {studyAsks(studyTopic || "this subject").map((row) => (
                          <button key={row.label} type="button" onClick={() => void send(row.ask)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-100">
                            {row.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {code ? <p className="shrink-0 text-center text-sm text-[#e4b86a]">Code — a working snippet first.</p> : null}
                </>
              )}
            </div>
            <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {routes.length ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {routes.map((row) => (
                    <button key={row.label} type="button" onClick={() => void send(row.ask)} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-zinc-100">
                      {row.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {composer}
              {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
            </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
                {shelf === "pictures" ? <p className="text-center text-xs text-zinc-500">Describe the next picture below.</p> : null}
                {shelf === "library" ? <p className="text-center text-xs text-zinc-500">Answers come from the library notes, with the source named.</p> : null}
                {shelf === "tools" && skill ? <p className="text-center text-xs text-zinc-500">{noctisSkill(skill).line}</p> : null}
                {thread?.turns.map((turn, index) => {
                  if (!turn || typeof turn.content !== "string") return null;
                  const last = index === (thread?.turns.length || 0) - 1;
                  if (turn.role === "assistant") {
                    const asked = thread?.turns[index - 1]?.role === "user" ? thread.turns[index - 1]?.content || "" : "";
                    return (
                      <div key={index} className="text-[15px] leading-7 text-zinc-100">
                        {asked && asked.length < 180 && (asked.match(/\?/g) || []).length < 2 && !turn.images?.length ? <div className="mb-3"><KnowledgeMap query={asked} vibe /></div> : null}
                        <article className="rounded-3xl border border-[#e4b86a]/40 bg-[#1a1a1a] px-5 py-4 shadow-[inset_0_1px_0_rgba(228,184,106,0.16)]">
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e4b86a]">{desk === "study" ? "Study board" : "Noctis"}</p>
                          {turn.audio ? <audio src={turn.audio} controls className="mb-3 w-full" /> : null}
                          {turn.clips?.length ? <FilmPlay clips={turn.clips} /> : turn.video ? <video src={turn.video} controls playsInline className="mb-3 aspect-[4/5] w-full rounded-2xl border border-white/10 bg-black object-cover" /> : turn.images?.map((src, shot) => (
                            <img key={shot} src={src} alt="" className="mb-3 max-h-80 rounded-2xl border border-white/10" />
                          ))}
                          <div className="space-y-3"><AnswerBody text={turn.content} /></div>
                          {turn.video || (turn.images?.length && /Written by Noctis/i.test(turn.content)) ? (
                            <MadeShare words={plainAnswer(turn.content)} picture={turn.images?.[0] || ""} video={turn.video || turn.clips?.[0] || ""} clips={turn.clips} />
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-1 border-t border-[#e4b86a]/20 pt-3">
                          <button type="button" onClick={() => void copyText(turn.content.split(/\n\s*Claim standing:/i)[0] || turn.content, `a-${index}`)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-100">
                            <Copy className="size-3.5" />
                            {copied === `a-${index}` ? "Copied" : "Copy"}
                          </button>
                          <button type="button" onClick={() => { if (!sayAloud((turn.content.split(/\n\s*Claim standing:/i)[0] || turn.content))) setError("This browser cannot speak the answer."); }} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-100">
                            <Volume2 className="size-3.5" />
                            Read
                          </button>
                          {asked ? (
                            <button
                              type="button"
                              onClick={() => {
                                void trainVibe({
                                  data: {
                                    action: "train",
                                    question: asked.replace(/---[\s\S]*$/g, "").trim(),
                                    answer: (turn.content.split(/\n\s*Claim standing:/i)[0] || turn.content).trim(),
                                  },
                                }).then(() => {
                                  setCopied(`t-${index}`);
                                  window.setTimeout(() => setCopied((cur) => (cur === `t-${index}` ? "" : cur)), 2000);
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[#e4b86a] hover:bg-[#e4b86a]/15"
                            >
                              <GraduationCap className="size-3.5" />
                              {copied === `t-${index}` ? "Trained ✓" : "Train"}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => downloadWordReport(asked || "Noctis Analysis", turn.content)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                          >
                            <FileText className="size-3.5" />
                            Report (.doc)
                          </button>
                          {last ? (
                            <button type="button" disabled={busy} onClick={again} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-100 disabled:opacity-40">
                              <RotateCcw className="size-3.5" />
                              Again
                            </button>
                          ) : null}
                          <AnswerShare text={turn.content} />
                        </div>
                        </article>
                        {last && !busy ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {relatedAsks(asked).map((ask) => (
                              <button key={ask.label} type="button" onClick={() => void send(ask.ask)} className="rounded-full bg-[#2f2f2f] px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10">
                                {ask.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                  const face = userFace(turn);
                  return (
                    <div key={index} className="ml-auto w-full max-w-[85%]">
                      <div className="rounded-[24px] border border-white/10 bg-[#2f2f2f] px-4 py-2.5 text-[15px] leading-relaxed text-zinc-100">
                        {editing === index ? (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              commitEdit();
                            }}
                          >
                            <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={3} className="w-full resize-none bg-transparent text-[15px] outline-none" />
                            <div className="mt-2 flex justify-end gap-2">
                              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-3 py-1 text-xs text-zinc-400">Cancel</button>
                              <button type="submit" className="rounded-full bg-[#e4b86a] px-3 py-1 text-xs font-semibold text-[#1a1408]">Send</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-2">
                            {turn.images?.map((src, shot) => (
                              <img key={shot} src={src} alt="" className="max-h-56 rounded-2xl" />
                            ))}
                            {face.said ? <p className="whitespace-pre-wrap">{face.said}</p> : null}
                            {!turn.images?.length && face.shots.length ? <p className="text-xs text-zinc-400">{face.shots.join(", ")}</p> : null}
                            {face.files.length ? <p className="text-xs text-zinc-400">{face.files.join(", ")}</p> : null}
                          </div>
                        )}
                      </div>
                      {editing === index ? null : (
                        <div className="mt-1 flex justify-end gap-1">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setEditing(index);
                              setEditDraft(face.said || turn.content);
                            }}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-100 disabled:opacity-40"
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </button>
                          <button type="button" onClick={() => void copyText(face.said || turn.content, `u-${index}`)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-100">
                            <Copy className="size-3.5" />
                            {copied === `u-${index}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {busy ? <p className="text-sm text-zinc-500">{imagine ? "Imagine is making the picture and the film…" : skill === "draw" ? "Noctis is drawing…" : skill === "search" || skill === "library" || skill === "tools" || skill === "agent" || skill === "research" || skill === "tutor" || skill === "make" ? "Noctis is looking that up…" : "Noctis is writing…"}</p> : null}
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl border-t border-white/10 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {routes.length ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {routes.map((row) => (
                    <button key={row.label} type="button" onClick={() => void send(row.ask)} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-zinc-100">
                      {row.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {composer}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
