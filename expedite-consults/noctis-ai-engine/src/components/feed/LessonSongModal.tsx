import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ME } from "@/lib/current-user";
import { LANE_LABEL, type VibeLane } from "@/lib/noctis";
import { paintLessonScenes, singLesson, writeLessonSong } from "@/lib/lesson-song-api";
import {
  HALL_VOICES,
  decodeAudio,
  encodeWav,
  localLessonSong,
  mixTake,
  mixVocal,
  paintPoster,
  renderBed,
  renderLessonVideo,
  runLessonPreview,
  scenePics,
  type LessonSong,
  type LessonVoice,
} from "@/lib/lesson-song";
import { useFeedStore } from "@/lib/feed-store";
import type { FeedPost } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

const LANES: VibeLane[] = ["learn", "laugh", "local"];

export function LessonSongModal({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const addPost = useFeedStore((s) => s.addPost);
  const [source, setSource] = useState("");
  const [passage, setPassage] = useState("");
  const [lane, setLane] = useState<VibeLane>("learn");
  const [voice, setVoice] = useState<LessonVoice>("female");
  const [busy, setBusy] = useState<"idle" | "write" | "sing" | "paint" | "bed" | "arm" | "rec" | "mix" | "cut">("idle");
  const [error, setError] = useState("");
  const [song, setSong] = useState<LessonSong | null>(null);
  const [scene, setScene] = useState(0);
  const [mixUrl, setMixUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [blocked, setBlocked] = useState(false);
  const bedBuf = useRef<AudioBuffer | null>(null);
  const mixBuf = useRef<AudioBuffer | null>(null);
  const bedAudio = useRef<HTMLAudioElement | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const mic = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hallCtx = useRef<AudioContext | null>(null);
  const hallSrc = useRef<AudioBufferSourceNode | null>(null);
  const stopPreview = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (open) return;
    stopAll();
    setBusy("idle");
    setError("");
    setSong(null);
    setScene(0);
    setMixUrl("");
    setVideoUrl("");
    setBlocked(false);
  }, [open]);

  useEffect(() => {
    const next = song;
    const canvas = canvasRef.current;
    if (!open || !next || !canvas) return;
    let gone = false;
    void scenePics(next.scenes, next.source).then((pics) => {
      if (gone || !canvasRef.current) return;
      stopPreview.current();
      const ms = Math.max(2200, (60 / next.bpm) * 8 * 1000);
      stopPreview.current = runLessonPreview(canvasRef.current, next.scenes, pics, next.source, next.title, ms);
    });
    return () => {
      gone = true;
      stopPreview.current();
    };
  }, [open, song]);

  function stopAll() {
    rec.current?.state === "recording" && rec.current.stop();
    mic.current?.getTracks().forEach((t) => t.stop());
    mic.current = null;
    bedAudio.current?.pause();
    try {
      hallSrc.current?.stop();
    } catch {
      /* already stopped */
    }
    hallSrc.current = null;
    stopPreview.current();
  }

  function playMix(buffer: AudioBuffer) {
    bedAudio.current?.pause();
    try {
      hallSrc.current?.stop();
    } catch {
      /* already stopped */
    }
    const ctx = hallCtx.current;
    if (!ctx) {
      const el = new Audio(URL.createObjectURL(encodeWav(buffer)));
      bedAudio.current = el;
      void el.play();
      return;
    }
    void ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    hallSrc.current = src;
    src.start();
  }

  async function compose() {
    const text = passage.trim();
    if (text.length < 8) {
      setError("Paste a passage first — a verse, a paragraph, a page of notes.");
      return;
    }
    setError("");
    setMixUrl("");
    setVideoUrl("");
    mixBuf.current = null;
    hallCtx.current ??= new AudioContext();
    void hallCtx.current.resume();
    setBusy("write");
    let next = localLessonSong(text, source, lane, voice);
    try {
      const written = await writeLessonSong({ data: { passage: text, source, lane, voice } });
      if (written.ok) next = written.song;
    } catch {
      /* local mill */
    }
    setSong(next);
    setScene(0);
    setBusy("sing");
    const paintP = paintLessonScenes({ data: { visuals: next.scenes.map((s) => s.visual) } })
      .then((painted) => {
        if (!painted.ok) return;
        next = {
          ...next,
          scenes: next.scenes.map((s, i) => ({ ...s, imageUrl: painted.images[i] ?? s.imageUrl })),
        };
        setSong({ ...next });
      })
      .catch(() => undefined);
    try {
      const [sung, bed] = await Promise.all([
        singLesson({ data: { lines: next.lines, chorus: next.chorus, hook: next.hook, lane, voice } }).catch(() => ({
          ok: false as const,
          error: "tts",
        })),
        renderBed(next.bpm, 8, lane),
      ]);
      bedBuf.current = bed;
      if (sung.ok) {
        const vocal = await decodeAudio(sung.audio, bed.sampleRate);
        const mixed = await mixVocal(bed, vocal);
        mixBuf.current = mixed;
        const url = URL.createObjectURL(encodeWav(mixed));
        setMixUrl(url);
        playMix(mixed);
      } else {
        mixBuf.current = bed;
        setMixUrl(URL.createObjectURL(encodeWav(bed)));
        playMix(bed);
      }
    } catch {
      setError("The hall could not sing this pass. Try again.");
    }
    setBusy("paint");
    await paintP;
    setBusy("idle");
  }

  function playBed() {
    const buf = mixBuf.current ?? bedBuf.current;
    if (!buf) return;
    bedAudio.current?.pause();
    const el = new Audio(URL.createObjectURL(encodeWav(buf)));
    el.loop = true;
    bedAudio.current = el;
    void el.play();
  }

  async function sing() {
    if (!song || !bedBuf.current) return;
    setError("");
    setBusy("arm");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mic.current = stream;
    } catch {
      setBlocked(true);
      setBusy("idle");
      return;
    }
    setBusy("rec");
    chunks.current = [];
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
    const recorder = mime ? new MediaRecorder(mic.current!, { mimeType: mime }) : new MediaRecorder(mic.current!);
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    recorder.onstop = () => {
      void finishTake();
    };
    rec.current = recorder;
    playBed();
    recorder.start();
  }

  function stopSing() {
    if (rec.current?.state === "recording") rec.current.stop();
    bedAudio.current?.pause();
  }

  async function finishTake() {
    mic.current?.getTracks().forEach((t) => t.stop());
    mic.current = null;
    const blob = new Blob(chunks.current, { type: rec.current?.mimeType || "audio/webm" });
    if (!bedBuf.current || blob.size < 800) {
      setBusy("idle");
      setError("The take was too short. Sing the lesson once through.");
      return;
    }
    setBusy("mix");
    try {
      const mixed = await mixTake(bedBuf.current, blob);
      mixBuf.current = mixed;
      setMixUrl(URL.createObjectURL(encodeWav(mixed)));
    } catch {
      setError("The take would not mix. Try again.");
    }
    setBusy("idle");
  }

  async function cutVideo() {
    if (!song) return;
    const audio = mixBuf.current ?? bedBuf.current;
    if (!audio) return;
    setBusy("cut");
    setError("");
    try {
      const video = await renderLessonVideo(song.scenes, audio, song.source, song.title);
      setVideoUrl(URL.createObjectURL(video));
    } catch {
      setError("The cut stalled. Play the preview and try Post again.");
    }
    setBusy("idle");
  }

  async function publish() {
    if (!song) return;
    let media = videoUrl;
    if (!media) {
      setBusy("cut");
      try {
        const audio = mixBuf.current ?? bedBuf.current;
        if (!audio) throw new Error("audio");
        const video = await renderLessonVideo(song.scenes, audio, song.source, song.title);
        media = URL.createObjectURL(video);
        setVideoUrl(media);
      } catch {
        setBusy("idle");
        setError("The cut stalled. Try Post again.");
        return;
      }
      setBusy("idle");
    }
    const id = `song-${Date.now()}`;
    const poster = song.scenes[0]?.imageUrl || paintPoster(song.title, song.source, song.hook);
    const post: FeedPost = {
      id,
      author: { name: ME.name, username: ME.username, avatar: ME.avatarUrl },
      caption: `${song.hook}${song.source ? ` — ${song.source}` : ""}`,
      lane: song.lane,
      mediaType: "video",
      mediaUrl: media,
      posterUrl: poster || undefined,
      views: 1,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      hashtags: ["#lessonvideo", "#clinic"],
      musicTitle: song.title,
      teach: song.teach,
    };
    addPost(post);
    closeModal();
  }

  const canCompose = passage.trim().length >= 8 && busy === "idle";
  const status =
    busy === "write"
      ? "Writing the lesson…"
      : busy === "sing"
        ? "Hall is singing…"
        : busy === "paint"
          ? "Cutting scenes…"
          : busy === "bed"
            ? "Laying the bed…"
            : busy === "mix"
              ? "Mixing your take…"
              : busy === "cut"
                ? "Cutting the video…"
                : "Generate the video";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && busy !== "rec" && busy !== "cut" && closeModal()}>
      <DialogContent className="max-h-[min(92vh,860px)] w-[min(96vw,880px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lesson studio</DialogTitle>
          <DialogDescription>
            Paste a verse or a paragraph. The hall writes a song, sings it in a male or female voice over a real beat, and cuts it against cinematic scenes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[220px]">
            <div className="overflow-hidden rounded-xl bg-bg">
              <canvas ref={canvasRef} className="aspect-[9/16] w-full" />
            </div>
            {song ? (
              <div className="mt-2 flex gap-1.5 overflow-x-auto">
                {song.scenes.map((s, i) => (
                  <button
                    key={`${s.caption}-${i}`}
                    type="button"
                    onClick={() => setScene(i)}
                    className={cn(
                      "relative h-16 w-10 shrink-0 overflow-hidden rounded-md bg-elevated",
                      scene === i && "ring-2 ring-primary",
                    )}
                  >
                    {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-center text-xs text-muted">Preview waits on a passage.</p>
            )}
          </div>

          <div>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Book, chapter, verse — John 3:16, Things Fall Apart…"
              className="w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              rows={5}
              placeholder="Paste the passage. Bible, literature, lecture notes. The hall will cut a study video from this text."
              className="mt-2 w-full resize-none rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {LANES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLane(l)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    lane === l ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                  )}
                >
                  {LANE_LABEL[l]}
                </button>
              ))}
              <span className="mx-1 w-px self-stretch bg-border" />
              {HALL_VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.line}
                  onClick={() => setVoice(v.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    voice === v.id ? "bg-fg text-bg" : "bg-elevated text-muted",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <Button className="mt-3 w-full" onClick={() => void compose()} disabled={!canCompose}>
              {status}
            </Button>
            {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
            {blocked ? <p className="mt-2 text-xs text-muted">Mic blocked. Allow it, wear headphones, sing again.</p> : null}

            {song ? (
              <div className="mt-3 rounded-xl bg-elevated p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {song.source} · {HALL_VOICES.find((v) => v.id === song.voice)?.label ?? "Voice"} · {song.bpm} BPM
                </p>
                <p className="mt-1 font-display text-lg font-semibold">{song.title}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Chorus</p>
                <p className="mt-1 text-sm font-semibold leading-snug">{song.chorus.join(" / ")}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Verse</p>
                <p className="mt-1 text-sm text-muted leading-snug">{song.lines.slice(0, 4).join(" · ")}</p>
              </div>
            ) : null}

            {song && bedBuf.current ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted">
                  {voice === "male" ? "Helix sings over the beat." : "Eve sings over the beat."} Wear headphones if you replace it with your take.
                </p>
                {mixUrl ? <audio src={mixUrl} controls className="w-full" /> : null}
                {videoUrl ? <video src={videoUrl} controls className="w-full rounded-xl" /> : null}
                <div className="flex flex-wrap gap-2">
                  {busy === "rec" ? (
                    <Button className="flex-1" variant="secondary" onClick={stopSing}>
                      <Square className="size-4" />
                      Stop take
                    </Button>
                  ) : (
                    <Button className="flex-1" variant="secondary" onClick={() => void sing()} disabled={busy !== "idle"}>
                      <Mic className="size-4" />
                      Replace with your take
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => void (videoUrl ? publish() : cutVideo())} disabled={busy !== "idle"}>
                    {videoUrl ? "Post Spark" : busy === "cut" ? "Cutting…" : "Cut the video"}
                  </Button>
                </div>
                {videoUrl ? null : (
                  <p className="text-xs text-muted">Cut burns scenes, captions, and the hall voice into a reel.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
