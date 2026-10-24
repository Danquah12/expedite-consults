import { useEffect, useRef, useState } from "react";
import { FlipHorizontal2, Mic, MicOff, MonitorUp, ScrollText, X } from "lucide-react";
import { PrompterPane } from "@/components/feed/PrompterPane";
import {
  followVoice,
  PROMPT_PACES,
  scriptWords,
  speechEngine,
  wordsAtWpm,
  type PromptPace,
} from "@/lib/prompter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaFileField } from "@/components/feed/MediaFileField";
import { ME } from "@/lib/current-user";
import { SOURCE } from "@/lib/source";
import { endPick, isPickingMedia } from "@/lib/local-media";
import { cutFilm, writeFilm, CUT_LOOKS, CUT_SPEEDS, type CutLook } from "@/lib/clip-edit";
import { useFeedStore } from "@/lib/feed-store";
import type { FeedPost } from "@/lib/feed-data";
import { cn } from "@/lib/utils";
import { ClipPlate } from "@/components/feed/ClipPlate";

const DESKS = [
  {
    id: "news",
    label: "News",
    kicker: "Breaking",
    stamp: "News desk",
    network: "ConnectLn News",
    prompt: "What is the one fact that must stick?",
    tags: ["#news", "#desk"],
    backdrop: "/media/desk/news.jpg",
    seat: { x: 0.46, y: 0.08, w: 0.38, h: 0.54, fade: 0.7, occlude: 0.56 },
  },
  {
    id: "brief",
    label: "Briefing",
    kicker: "Briefing",
    stamp: "Briefing",
    network: "Briefing desk",
    prompt: "What should the room take away?",
    tags: ["#briefing", "#desk"],
    backdrop: "/media/desk/brief.jpg",
    seat: { x: 0.54, y: 0.22, w: 0.3, h: 0.5, fade: 0.7, occlude: 0.6 },
  },
  {
    id: "lesson",
    label: "Lesson",
    kicker: "Lesson",
    stamp: "Lesson",
    network: "ConnectLn Study",
    prompt: "What should they be able to do after this?",
    tags: ["#lesson", "#study"],
    backdrop: "/media/desk/brief.jpg",
    seat: { x: 0.52, y: 0.16, w: 0.32, h: 0.52, fade: 0.7, occlude: 0.58 },
  },
  {
    id: "pulpit",
    label: "Pulpit",
    kicker: "Word",
    stamp: "Pulpit",
    network: "ConnectLn Pulpit",
    prompt: "What is the one line to remember?",
    tags: ["#pulpit", "#word"],
    backdrop: "/media/desk/pulpit.jpg",
    seat: { x: 0.33, y: 0.04, w: 0.36, h: 0.54, fade: 0.72, occlude: 0.48 },
  },
  {
    id: "take",
    label: "Take",
    kicker: "Take",
    stamp: "Take",
    network: "ConnectLn",
    prompt: "What is the point, in one line?",
    tags: ["#take", "#now"],
    backdrop: "/media/desk/take.jpg",
    seat: { x: 0.14, y: 0.12, w: 0.36, h: 0.62, fade: 0.78, occlude: 0.74 },
  },
] as const;

type DeskId = (typeof DESKS)[number]["id"];
const CAPS = [15, 60, 180, 600] as const;
type Cap = (typeof CAPS)[number];

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoRecorderModal({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const addPost = useFeedStore((s) => s.addPost);
  const enterReels = useFeedStore((s) => s.enterReels);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plateRef = useRef<HTMLImageElement | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const displayRef = useRef<MediaStream | null>(null);
  const drawRef = useRef(0);
  const [deskId, setDeskId] = useState<DeskId>("news");
  const [headline, setHeadline] = useState("");
  const [copy, setCopy] = useState("");
  const [script, setScript] = useState("");
  const [role, setRole] = useState(ME.title);
  const [place, setPlace] = useState(ME.campus);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [muted, setMuted] = useState(false);
  const [cap, setCap] = useState<Cap>(180);
  const [reel, setReel] = useState(false);
  const [prompter, setPrompter] = useState(false);
  const [pace, setPace] = useState<PromptPace>("voice");
  const [cursor, setCursor] = useState(0);
  const [mirror, setMirror] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const startedAt = useRef(0);
  const speechRef = useRef<ReturnType<typeof speechEngine>>(null);
  const [screenOn, setScreenOn] = useState(false);
  const [toHall, setToHall] = useState(true);
  const [toReel, setToReel] = useState(false);
  const [edit, setEdit] = useState(false);
  const [span, setSpan] = useState(0);
  const [inAt, setInAt] = useState(0);
  const [outAt, setOutAt] = useState(0);
  const [cutting, setCutting] = useState(false);
  const [cutNote, setCutNote] = useState("");
  const [speed, setSpeed] = useState<(typeof CUT_SPEEDS)[number]>(1);
  const [look, setLook] = useState<CutLook>("none");
  const [overlay, setOverlay] = useState("");
  const [teachOn, setTeachOn] = useState(true);
  const [silentCut, setSilentCut] = useState(false);
  const [flipCut, setFlipCut] = useState(false);
  const [capsOn, setCapsOn] = useState(true);
  const desk = DESKS.find((d) => d.id === deskId) ?? DESKS[0];
  const line = headline.trim() || defaultHeadline(deskId);
  const meta = useRef({
    desk,
    line,
    role,
    place,
    recording: false,
    camera: false,
    count: null as number | null,
    seconds: 0,
    screen: false,
    reel: false,
  });
  meta.current = {
    desk,
    line,
    role,
    place,
    recording,
    camera: !blocked,
    count,
    seconds,
    screen: screenOn,
    reel,
  };

  useEffect(() => {
    if (!url) {
      setEdit(false);
      setSpan(0);
      return;
    }
    const probe = document.createElement("video");
    probe.src = url;
    probe.onloadedmetadata = () => {
      const length = Number.isFinite(probe.duration) ? probe.duration : 0;
      setSpan(length);
      setInAt(0);
      setOutAt(length);
    };
  }, [url]);

  useEffect(() => {
    const img = new Image();
    img.src = desk.backdrop;
    img.onload = () => {
      plateRef.current = img;
      paint();
    };
  }, [desk.backdrop]);

  useEffect(() => {
    if (!open) {
      stopDraw();
      killStreams();
      recorder.current?.state === "recording" && recorder.current.stop();
      return;
    }
    void openCam("user");
    return () => {
      stopDraw();
      killStreams();
    };
  }, [open]);

  useEffect(() => {
    if (!recording) return;
    const t = window.setInterval(() => {
      setSeconds((n) => {
        const next = n + 1;
        if (next >= cap) window.setTimeout(() => stop(), 20);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [recording, cap]);

  useEffect(() => {
    if (!recording || !prompter) {
      speechRef.current?.stop();
      speechRef.current = null;
      return;
    }
    startedAt.current = Date.now();
    setCursor(0);
    const words = scriptWords(script);
    const wpm = PROMPT_PACES.find((p) => p.id === pace)?.wpm ?? 140;
    if (pace === "voice") {
      const rec = speechEngine();
      if (!rec) {
        setVoiceHint("Voice not on this browser. Use News or Sermon speed.");
        setPace("news");
        return;
      }
      setVoiceHint("Voice-follow — the script waits if you pause.");
      rec.onresult = (ev) => {
        let heard = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) heard += ` ${ev.results[i][0].transcript}`;
        setCursor((c) => followVoice(words, c, heard));
      };
      rec.onerror = () => setVoiceHint("Voice dropped. Keep reading, or switch to News speed.");
      try {
        rec.start();
        speechRef.current = rec;
      } catch {
        setVoiceHint("Mic for the prompter is blocked. Using News speed.");
        setPace("news");
      }
      return () => {
        rec.stop();
        speechRef.current = null;
      };
    }
    setVoiceHint(`${wpm} words a minute.`);
    const t = window.setInterval(() => {
      setCursor(Math.min(words.length, wordsAtWpm(Date.now() - startedAt.current, wpm)));
    }, 200);
    return () => window.clearInterval(t);
  }, [recording, prompter, pace, script]);

  function killStreams() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    displayRef.current?.getTracks().forEach((t) => t.stop());
    displayRef.current = null;
  }

  async function openCam(nextFacing: "user" | "environment") {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: reel ? 720 : 1280, height: reel ? 1280 : 720, facingMode: nextFacing },
        audio: true,
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
      setHasStream(true);
      setBlocked(false);
      setFacing(nextFacing);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        paint();
      }
    } catch {
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audio;
        setHasStream(true);
        setBlocked(true);
        paint();
      } catch {
        setBlocked(true);
      }
    }
  }

  async function shareScreen() {
    if (screenOn) {
      displayRef.current?.getTracks().forEach((t) => t.stop());
      displayRef.current = null;
      setScreenOn(false);
      paint();
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      displayRef.current = display;
      display.getVideoTracks()[0]?.addEventListener("ended", () => {
        setScreenOn(false);
        displayRef.current = null;
        paint();
      });
      if (screenRef.current) {
        screenRef.current.srcObject = display;
        await screenRef.current.play();
      }
      setScreenOn(true);
      paint();
    } catch {
      setScreenOn(false);
    }
  }

  function stopDraw() {
    window.cancelAnimationFrame(drawRef.current);
  }

  function paint() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    sizeCanvas(canvas, reel);
    const W = canvas.width;
    const H = canvas.height;
    const tick = () => {
      paintDesk(ctx, W, H, meta.current, plateRef.current, video, screenRef.current);
      drawRef.current = window.requestAnimationFrame(tick);
    };
    stopDraw();
    tick();
  }

  function start() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sizeCanvas(canvas, reel);
    setCount(3);
    window.setTimeout(() => setCount(2), 800);
    window.setTimeout(() => setCount(1), 1600);
    window.setTimeout(() => {
      setCount(null);
      meta.current.recording = true;
      paint();
      chunks.current = [];
      const tracks = [
        ...canvas.captureStream(30).getVideoTracks(),
        ...(streamRef.current?.getAudioTracks() ?? []),
        ...(displayRef.current?.getAudioTracks() ?? []),
      ];
      const mixed = new MediaStream(tracks);
      const mime = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const rec = new MediaRecorder(mixed, {
        ...(mime ? { mimeType: mime } : {}),
        videoBitsPerSecond: 1_200_000,
        audioBitsPerSecond: 96_000,
      });
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        stopDraw();
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setUrl(URL.createObjectURL(blob));
      };
      recorder.current = rec;
      rec.start();
      setSeconds(0);
      setRecording(true);
    }, 2400);
  }

  function stop() {
    recorder.current?.stop();
    setRecording(false);
  }

  function publish(nextUrl = url) {
    if (!nextUrl) return;
    const body = copy.trim();
    const caption = body ? `${line}\n\n${body}` : line;
    const post: FeedPost = {
      id: `rec-${Date.now()}`,
      author: { name: ME.name, username: ME.username, avatar: ME.avatarUrl },
      caption,
      lane: deskId === "take" || reel ? "local" : "learn",
      mediaType: "video",
      mediaUrl: nextUrl,
      posterUrl: desk.backdrop,
      views: 1,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      hashtags: [...desk.tags, ...(reel || toReel ? ["#reel"] : [])],
      musicTitle: desk.network,
      teach: {
        hook: line,
        stamp: desk.stamp,
        prompt: desk.prompt,
        options: [
          { id: "a", label: script.trim().split("\n")[0]?.slice(0, 48) || "The headline", ok: true },
          { id: "b", label: "The comments", ok: false },
          { id: "c", label: "Skip the desk", ok: false },
        ],
      },
    };
    if (toHall || toReel) addPost(post);
    setUrl("");
    setCopy("");
    setHeadline("");
    closeModal();
    if (toReel) enterReels(post.id);
  }

  function cancel() {
    if (recorder.current?.state === "recording") recorder.current.stop();
    speechRef.current?.stop();
    speechRef.current = null;
    killStreams();
    stopDraw();
    endPick();
    closeModal();
  }

  async function applyCut() {
    if (!url || cutting) return;
    setCutting(true);
    setCutNote("Cutting in the app. The film is not sent anywhere.");
    try {
      const next = await cutFilm(url, {
        start: inAt,
        end: outAt || span,
        line,
        portrait: reel,
        speed,
        look,
        text: overlay,
        lesson: teachOn ? desk.prompt : "",
        flip: flipCut,
        silent: silentCut,
        captions: capsOn ? script : "",
      });
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      setUrl(next);
      setCutNote("Cut saved. Post it, or cut again.");
      setEdit(false);
    } catch {
      setCutNote("This browser could not finish the cut. Try Retake.");
    } finally {
      setCutting(false);
    }
  }

  async function writeTake() {
    if (cutting) return;
    setCutting(true);
    setCutNote("Writing the film from your words. Nothing is sent out.");
    try {
      const next = await writeFilm({
        backdrop: desk.backdrop,
        line,
        script: script.trim() || copy.trim() || line,
        lesson: desk.prompt,
        portrait: reel,
      });
      setUrl(next);
      setCutNote("Film is ready. Edit it, or post it.");
    } catch {
      setCutNote("This browser could not write the film.");
    } finally {
      setCutting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPickingMedia()) cancel();
      }}
    >
      <DialogContent
        hideClose
        className="w-[min(96vw,880px)] max-h-[94dvh] overflow-y-auto p-4 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none"
        onPointerDownOutside={(e) => {
          if (isPickingMedia()) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isPickingMedia()) e.preventDefault();
        }}
      >
        <button
          type="button"
          aria-label="Cancel"
          onClick={cancel}
          className="absolute right-3 top-[max(0.65rem,env(safe-area-inset-top))] z-30 grid size-11 place-items-center rounded-full bg-elevated text-fg"
        >
          <X className="size-4" />
        </button>
        <DialogHeader className="mb-2 pr-12">
          <DialogTitle>On air</DialogTitle>
          <DialogDescription>
            A news desk, a lesson, a pulpit — not a phone overlay. Teleprompter for you. Lower-third for the room. Screen share when you teach.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-3 grid grid-cols-5 gap-2">
          {DESKS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDeskId(d.id);
                setReel(d.id === "take");
              }}
              disabled={recording}
              className={cn(
                "relative aspect-[16/10] overflow-hidden rounded-lg text-left clip-plate",
                deskId === d.id ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100",
              )}
            >
              <img src={d.backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-2 pb-1.5 pt-6 text-[11px] font-semibold text-caption">
                {d.label}
              </span>
            </button>
          ))}
        </div>

        <ClipPlate tone="stage" className="relative">
          <div className="clip-well relative">
            {url ? <video src={url} controls className="aspect-video w-full bg-bg object-contain" /> : null}
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className={cn("aspect-video w-full bg-bg object-contain", url && "hidden")}
            />
            {prompter && script.trim() && !url ? <PrompterPane script={script} cursor={cursor} mirror={mirror} /> : null}
            <video ref={videoRef} muted playsInline className="pointer-events-none absolute h-px w-px opacity-0" />
            <video ref={screenRef} muted playsInline className="pointer-events-none absolute h-px w-px opacity-0" />
          </div>
        </ClipPlate>

        {url && edit ? (
          <div className="mt-3 rounded-2xl bg-elevated p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Edit this take</p>
            <p className="mt-1 text-xs text-muted">Trim, speed, look, and text — then a lesson line TikTok does not burn in. The cut stays on this device.</p>
            <label className="mt-3 block text-xs font-semibold">
              In {clock(Math.floor(inAt))}
              <input
                type="range"
                min={0}
                max={Math.max(span, 0.1)}
                step={0.1}
                value={inAt}
                onChange={(e) => setInAt(Math.min(Number(e.target.value), Math.max(outAt - 0.4, 0)))}
                className="mt-1 w-full"
              />
            </label>
            <label className="mt-2 block text-xs font-semibold">
              Out {clock(Math.floor(outAt))}
              <input
                type="range"
                min={0}
                max={Math.max(span, 0.1)}
                step={0.1}
                value={outAt}
                onChange={(e) => setOutAt(Math.max(Number(e.target.value), inAt + 0.4))}
                className="mt-1 w-full"
              />
            </label>
            <p className="mt-3 text-xs font-semibold">Speed</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CUT_SPEEDS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSpeed(n)}
                  className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", speed === n ? "bg-primary text-primary-fg" : "bg-surface")}
                >
                  {n}×
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold">Look</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CUT_LOOKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLook(item.id)}
                  className={cn("min-h-11 rounded-full px-3 text-xs font-semibold", look === item.id ? "bg-primary text-primary-fg" : "bg-surface")}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              value={overlay}
              onChange={(e) => setOverlay(e.target.value)}
              maxLength={72}
              placeholder="Text on the film"
              className="mt-3 h-10 w-full rounded-xl bg-surface px-3 text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
              <label className="inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={teachOn} onChange={(e) => setTeachOn(e.target.checked)} />
                Lesson line
              </label>
              <label className="inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={flipCut} onChange={(e) => setFlipCut(e.target.checked)} />
                Mirror
              </label>
              <label className="inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={silentCut} onChange={(e) => setSilentCut(e.target.checked)} />
                Mute
              </label>
              <label className="inline-flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={capsOn} onChange={(e) => setCapsOn(e.target.checked)} />
                Captions
              </label>
            </div>
            <Button className="mt-3 w-full" onClick={() => void applyCut()} disabled={cutting || span < 0.4}>
              {cutting ? "Cutting…" : "Apply cut"}
            </Button>
          </div>
        ) : null}
        {cutNote ? <p className="mt-2 text-xs text-muted">{cutNote}</p> : null}

        {blocked ? (
          <p className="mt-2 text-xs text-muted">
            {hasStream ? "Camera blocked — the plate still goes out, with your voice." : "Camera blocked here. Attach a clip instead."}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={recording}
            onClick={() => void openCam(facing === "user" ? "environment" : "user")}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-elevated px-3 text-xs font-semibold"
          >
            <FlipHorizontal2 className="size-3.5" />
            Flip
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              streamRef.current?.getAudioTracks().forEach((t) => {
                t.enabled = !next;
              });
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-elevated px-3 text-xs font-semibold"
          >
            {muted ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
            {muted ? "Mic off" : "Mic on"}
          </button>
          <button
            type="button"
            disabled={recording}
            onClick={() => void shareScreen()}
            className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", screenOn ? "bg-primary text-primary-fg" : "bg-elevated")}
          >
            <MonitorUp className="size-3.5" />
            Screen
          </button>
          <button
            type="button"
            onClick={() => setPrompter((v) => !v)}
            className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", prompter ? "bg-primary text-primary-fg" : "bg-elevated")}
          >
            <ScrollText className="size-3.5" />
            Prompter
          </button>
          {prompter
            ? PROMPT_PACES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPace(p.id)}
                  className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold", pace === p.id ? "bg-primary text-primary-fg" : "bg-elevated")}
                >
                  {p.label}
                </button>
              ))
            : null}
          {prompter ? (
            <button
              type="button"
              onClick={() => setMirror((v) => !v)}
              className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold", mirror ? "bg-primary text-primary-fg" : "bg-elevated")}
            >
              Glass
            </button>
          ) : null}
          <button
            type="button"
            disabled={recording}
            onClick={() => {
              setReel((v) => !v);
              window.setTimeout(() => paint(), 40);
            }}
            className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold", reel ? "bg-primary text-primary-fg" : "bg-elevated")}
          >
            {reel ? "9:16 reel" : "16:9 desk"}
          </button>
          {CAPS.map((n) => (
            <button
              key={n}
              type="button"
              disabled={recording}
              onClick={() => setCap(n)}
              className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold", cap === n ? "bg-primary text-primary-fg" : "bg-elevated")}
            >
              {n < 60 ? `${n}s` : `${n / 60}m`}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2">
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={defaultHeadline(deskId)}
            maxLength={90}
            className="h-10 rounded-xl bg-elevated px-3 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Title on air"
              className="h-9 rounded-xl bg-elevated px-3 text-xs"
            />
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Location"
              className="h-9 rounded-xl bg-elevated px-3 text-xs"
            />
          </div>
          {prompter ? (
            <>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={4}
                placeholder="Teleprompter — news copy, a sermon, a lesson. Voice-follow waits when you pause. Glass mirrors the text for a beam-splitter."
                className="resize-none rounded-xl bg-elevated px-3 py-2 text-sm"
              />
              {voiceHint ? <p className="text-xs text-muted">{voiceHint}</p> : null}
              <p className="text-xs text-subtle">
                Hardware: Elgato Prompter, Padcaster, Ikan, Prompter People. Sit the phone or laptop behind the glass. Turn Glass on so the reflection reads forward. The gold Lens line is where your eyes should rest — into the camera.
              </p>
            </>
          ) : null}
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            rows={2}
            placeholder="Caption under the plate — Clinic, Reels, or both."
            className="resize-none rounded-xl bg-elevated px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
          <label className="inline-flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={toHall} onChange={(e) => setToHall(e.target.checked)} />
            Post to Clinic
          </label>
          <label className="inline-flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={toReel} onChange={(e) => setToReel(e.target.checked)} />
            Send to Reels
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          {url ? (
            <>
              <Button className="flex-1" onClick={() => publish()} disabled={!toHall && !toReel}>
                {toReel && !toHall ? "Send to Reels" : toReel ? "Post to Clinic + Reels" : "Post to Clinic"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setUrl("");
                  setSeconds(0);
                  setCutNote("");
                  window.setTimeout(() => paint(), 40);
                }}
              >
                Retake
              </Button>
              <Button variant="secondary" onClick={() => setEdit((v) => !v)} disabled={cutting}>
                {edit ? "Close edit" : "Edit"}
              </Button>
            </>
          ) : recording || count ? (
            <Button className="flex-1" variant="secondary" onClick={stop} disabled={Boolean(count)}>
              {count ? "Stand by" : `Stop · ${clock(seconds)}`}
            </Button>
          ) : (
            <>
              <Button className="flex-1" onClick={start} disabled={!hasStream && blocked}>
                Go live
              </Button>
              <Button type="button" variant="secondary" onClick={() => void writeTake()} disabled={cutting}>
                {cutting ? "Writing…" : "Write a film"}
              </Button>
            </>
          )}
          <Button type="button" variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          <label
            htmlFor="recorder-file"
            className="inline-flex h-10 cursor-pointer items-center rounded-full bg-elevated px-4 text-xs font-semibold"
          >
            Attach
          </label>
        </div>
        <MediaFileField
          id="recorder-file"
          onPicked={(_f, kind, nextUrl) => {
            if (kind !== "video" && kind !== "image") return;
            if (kind === "video") publish(nextUrl);
            else setUrl(nextUrl);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function sizeCanvas(canvas: HTMLCanvasElement, portrait: boolean) {
  const w = portrait ? 720 : 1280;
  const h = portrait ? 1280 : 720;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function defaultHeadline(id: DeskId) {
  if (id === "news") return "Live from the hall";
  if (id === "brief") return "A briefing from the desk";
  if (id === "lesson") return "Today we learn one thing";
  if (id === "pulpit") return "A word for the room";
  return "A take, now";
}

function paintDesk(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  meta: {
    desk: (typeof DESKS)[number];
    line: string;
    role: string;
    place: string;
    recording: boolean;
    camera: boolean;
    count: number | null;
    seconds: number;
    screen: boolean;
    reel: boolean;
  },
  plate: HTMLImageElement | null,
  video: HTMLVideoElement | null,
  screen: HTMLVideoElement | null,
) {
  if (meta.screen && screen && screen.readyState >= 2) {
    ctx.drawImage(screen, 0, 0, W, H);
  } else if (plate && plate.complete) {
    ctx.drawImage(plate, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);
  }

  if (meta.camera && video && video.readyState >= 2) {
    const seat = meta.screen
      ? { x: 0.72, y: 0.58, w: 0.24, h: 0.32, fade: 0.82, occlude: 1 }
      : meta.reel
        ? { ...meta.desk.seat, x: 0.22, y: 0.12, w: 0.56, h: 0.62 }
        : meta.desk.seat;
    seatTalent(ctx, video, seat, W, H);
  }
  if (!meta.screen && plate && plate.complete) {
    const cut = meta.desk.seat.occlude;
    const sy = cut * plate.height;
    const dy = cut * H;
    ctx.drawImage(plate, 0, sy, plate.width, plate.height - sy, 0, dy, W, H - dy);
  }

  const g = ctx.createLinearGradient(0, H - 240, 0, H);
  g.addColorStop(0, "rgba(11,18,32,0)");
  g.addColorStop(0.45, "rgba(11,18,32,0.55)");
  g.addColorStop(1, "rgba(11,18,32,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, H - 240, W, 240);

  ctx.fillStyle = "#e4b86a";
  ctx.fillRect(36, H - 118, 6, 78);

  ctx.fillStyle = "#e4b86a";
  ctx.font = "700 18px Figtree, sans-serif";
  ctx.fillText(meta.desk.kicker.toUpperCase(), 56, H - 96);

  ctx.fillStyle = "#f6f1e8";
  ctx.font = "600 36px Syne, sans-serif";
  ctx.fillText(meta.line.slice(0, 52), 56, H - 54);

  ctx.fillStyle = "rgba(246,241,232,0.78)";
  ctx.font = "500 18px Figtree, sans-serif";
  ctx.fillText(`${ME.name}  ·  ${meta.role}  ·  ${meta.place}  ·  ${SOURCE}`, 56, H - 24);

  ctx.fillStyle = meta.recording ? "#f43f5e" : "rgba(11,18,32,0.7)";
  ctx.fillRect(36, 28, 92, 32);
  ctx.fillStyle = "#fff";
  ctx.font = "700 16px Figtree, sans-serif";
  ctx.fillText(meta.recording ? "LIVE" : "HOLD", 52, 50);

  ctx.fillStyle = "rgba(246,241,232,0.9)";
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.fillText(clock(meta.seconds), 140, 50);

  ctx.fillStyle = "rgba(11,18,32,0.7)";
  ctx.fillRect(W - 220, 28, 184, 32);
  ctx.fillStyle = "#f6f1e8";
  ctx.font = "700 14px Figtree, sans-serif";
  ctx.fillText(meta.desk.network.toUpperCase(), W - 204, 50);

  if (meta.count) {
    ctx.fillStyle = "rgba(11,18,32,0.28)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f6f1e8";
    ctx.font = "600 140px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(meta.count), W / 2, H / 2 + 48);
    ctx.textAlign = "start";
  }
}

const talentPlate = typeof document !== "undefined" ? document.createElement("canvas") : null;

function seatTalent(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  seat: { x: number; y: number; w: number; h: number; fade: number; occlude: number },
  W: number,
  H: number,
) {
  const plate = talentPlate;
  if (!plate) return;
  const dx = seat.x * W;
  const dy = seat.y * H;
  const dw = seat.w * W;
  const dh = seat.h * H;
  plate.width = Math.max(2, Math.round(dw));
  plate.height = Math.max(2, Math.round(dh));
  const o = plate.getContext("2d");
  if (!o) return;

  o.clearRect(0, 0, plate.width, plate.height);
  o.save();
  o.beginPath();
  o.ellipse(plate.width / 2, plate.height * 0.46, plate.width * 0.46, plate.height * 0.48, 0, 0, Math.PI * 2);
  o.closePath();
  o.clip();

  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const vr = vw / vh;
  const dr = plate.width / plate.height;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;
  if (vr > dr) {
    sw = vh * dr;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / dr;
    sy = Math.max(0, (vh - sh) * 0.22);
  }
  o.translate(plate.width, 0);
  o.scale(-1, 1);
  o.drawImage(video, sx, sy, sw, sh, 0, 0, plate.width, plate.height);
  o.restore();

  const fade = o.createLinearGradient(0, plate.height * seat.fade, 0, plate.height);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,1)");
  o.globalCompositeOperation = "destination-out";
  o.fillStyle = fade;
  o.fillRect(0, plate.height * seat.fade, plate.width, plate.height * (1 - seat.fade));
  o.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(dx + dw / 2, dy + dh * 0.84, dw * 0.34, dh * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(plate, dx, dy, dw, dh);
  ctx.restore();
}
