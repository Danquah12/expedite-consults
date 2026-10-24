import { AudioLines, Captions, ChevronUp, Circle, Download, Hand, ImagePlus, Link2, Mic, MicOff, MonitorUp, MoreHorizontal, PhoneOff, Pin, Smile, UserPlus, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { defaultIceServers } from "@/lib/multiplayer/p2p";
import { useFeedStore } from "@/lib/feed-store";
import { holdMeeting, silenceStage } from "@/lib/playback";
import { dialHref, studyChat, studyLiveBeat, studyLiveLeave, studyLiveSignal, studyRing, studyRoom, studySavePhone, studySend } from "@/lib/study-group-api";

type Remote = { id: string; name: string; stream: MediaStream };
type Note = { id: number; mine: boolean; name: string; body: string };
type Person = { userId: string; name: string; phone: string; live: boolean };
type MeetScene = { src?: string; film?: boolean; blur?: number };

const FOREST_MEET: MeetScene = { src: "/media/meet/forest.jpg" };

export function StudyCall({
  groupId,
  title,
  selfId,
  onClose,
  video = true,
  muted = false,
  console: askedMeet = false,
  onAdd,
  onShare,
  onRecorded,
}: {
  groupId: string;
  title: string;
  selfId: string;
  onClose: () => void;
  video?: boolean;
  muted?: boolean;
  console?: boolean;
  onAdd?: () => void;
  onShare?: () => void | Promise<"shared" | "copied" | "aborted" | "failed" | void>;
  onRecorded?: (url: string) => void;
}) {
  const meet = askedMeet || video;
  const localRef = useRef<HTMLVideoElement>(null);
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(video);
  const [err, setErr] = useState<string | null>(null);
  const [count, setCount] = useState(1);
  const [roster, setRoster] = useState<{ id: string; name: string }[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const links = useRef(new Map<string, RTCPeerConnection>());
  const heldCamera = useRef<MediaStreamTrack | null>(null);
  const restoring = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [backdrop, setBackdrop] = useState<MeetScene | null>(meet ? FOREST_MEET : null);
  const [camReady, setCamReady] = useState(false);
  const cameraHold = useRef<MediaStreamTrack | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const tape = useRef<MediaRecorder | null>(null);
  const paint = useRef(0);
  const [hear, setHear] = useState(true);
  const [speaker, setSpeaker] = useState("");
  const [marks, setMarks] = useState<Record<string, { hand: boolean; muted: boolean }>>({});
  const sentMark = useRef("");
  const [host, setHost] = useState(false);
  const [hostPin, setHostPin] = useState("");
  const [panel, setPanel] = useState<null | "chat" | "people">(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [phone, setPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const after = useRef(0);

  useEffect(() => {
    const setPlayingId = useFeedStore.getState().setPlayingId;
    setPlayingId(null);
    holdMeeting(true);
    silenceStage();
    const quiet = window.setInterval(silenceStage, 2000);
    let dead = false;
    const pcs = new Map<string, RTCPeerConnection>();
    links.current = pcs;
    const streams = new Map<string, MediaStream>();
    const pendingIce = new Map<string, RTCIceCandidateInit[]>();
    const pendingAnswer = new Map<string, RTCSessionDescriptionInit>();

    async function flushIce(pc: RTCPeerConnection, from: string) {
      if (!pc.remoteDescription) return;
      const bag = pendingIce.get(from) ?? [];
      pendingIce.delete(from);
      for (const ice of bag) {
        try {
          await pc.addIceCandidate(ice);
        } catch {
          /* A candidate can arrive before the answer is applied. */
        }
      }
    }

    function holdIce(from: string, body: RTCIceCandidateInit) {
      const bag = pendingIce.get(from) ?? [];
      bag.push(body);
      pendingIce.set(from, bag);
    }

    async function takeAnswer(pc: RTCPeerConnection, from: string) {
      const answer = pendingAnswer.get(from);
      if (!answer || pc.signalingState !== "have-local-offer") return;
      pendingAnswer.delete(from);
      await pc.setRemoteDescription(answer);
      await flushIce(pc, from);
    }
    const names = new Map<string, string>();
    const restarted = new Set<string>();
    let cursor = 0;
    let timer = 0;

    function show() {
      const next: Remote[] = [];
      pcs.forEach((pc, id) => {
        const tracks = pc.getReceivers().map((r) => r.track).filter((track): track is MediaStreamTrack => Boolean(track));
        if (!tracks.length) return;
        let media = streams.get(id);
        if (!media) {
          media = new MediaStream();
          streams.set(id, media);
        }
        const have = new Set(media.getTracks());
        for (const track of tracks) {
          if (!have.has(track)) media.addTrack(track);
        }
        next.push({ id, name: names.get(id) ?? "Member", stream: media });
      });
      setRemotes((cur) => {
        if (cur.length === next.length && cur.every((row, i) => row.id === next[i]?.id && row.stream === next[i]?.stream && row.name === next[i]?.name)) return cur;
        return next;
      });
    }

    async function signal(to: string, kind: "offer" | "answer" | "ice", payload: unknown) {
      await studyLiveSignal({ data: { groupId, to, kind, payload: JSON.stringify(payload) } });
    }

    function peer(id: string) {
      const existing = pcs.get(id);
      if (existing) return existing;
      const pc = new RTCPeerConnection({ iceServers: defaultIceServers() });
      streamRef.current?.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, streamRef.current!);
        if (track.kind === "video") void sharp(sender);
      });
      pc.onicecandidate = (ev) => {
        if (ev.candidate) void signal(id, "ice", ev.candidate.toJSON());
      };
      pc.ontrack = () => show();
      pc.onconnectionstatechange = () => {
        if (pc.connectionState !== "failed" || restarted.has(id)) return;
        if (selfId < id || pc.signalingState !== "stable") return;
        restarted.add(id);
        void pc
          .createOffer({ iceRestart: true })
          .then(async (offer) => {
            await pc.setLocalDescription(offer);
            await signal(id, "offer", offer);
          })
          .catch(() => undefined);
      };
      pcs.set(id, pc);
      if (selfId > id) {
        void pc
          .createOffer()
          .then(async (offer) => {
            await pc.setLocalDescription(offer);
            await signal(id, "offer", offer);
            await takeAnswer(pc, id);
            pc.getSenders().forEach((sender) => void sharp(sender));
          })
          .catch(() => undefined);
      }
      return pc;
    }

    async function apply(from: string, kind: string, raw: string) {
      if (kind === "mark") {
        try {
          const body = JSON.parse(raw) as { hand?: boolean; muted?: boolean };
          setMarks((cur) => ({ ...cur, [from]: { hand: Boolean(body.hand), muted: Boolean(body.muted) } }));
        } catch {
          /* a bad mark is ignored */
        }
        return;
      }
      const pc = peer(from);
      const body = JSON.parse(raw) as RTCSessionDescriptionInit | RTCIceCandidateInit;
      if (kind === "offer" && selfId < from) {
        await pc.setRemoteDescription(body as RTCSessionDescriptionInit);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await signal(from, "answer", answer);
        pc.getSenders().forEach((sender) => void sharp(sender));
        for (const ice of pendingIce.get(from) ?? []) {
          try {
            await pc.addIceCandidate(ice);
          } catch {
            /* ignore a candidate that arrived too early */
          }
        }
        pendingIce.delete(from);
        return;
      }
      if (kind === "answer" && selfId > from) {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(body as RTCSessionDescriptionInit);
          await flushIce(pc, from);
        } else {
          pendingAnswer.set(from, body as RTCSessionDescriptionInit);
        }
        return;
      }
      if (kind === "ice") {
        const ice = body as RTCIceCandidateInit;
        if (!pc.remoteDescription) {
          holdIce(from, ice);
          return;
        }
        try {
          await pc.addIceCandidate(ice);
        } catch {
          holdIce(from, ice);
        }
      }
    }

    async function loop() {
      if (dead) return;
      try {
        const beat = await studyLiveBeat({ data: { groupId, cursor } });
        cursor = beat.cursor;
        const others = beat.seats.filter((seat) => seat.userId !== selfId);
        setCount(beat.seats.length || 1);
        setHost(beat.hostId === selfId);
        if (beat.stage) {
          try {
            const body = JSON.parse(beat.stage) as { pin?: string };
            if (typeof body.pin === "string" && body.pin) setHostPin(body.pin);
          } catch {
            /* a bad stage note is ignored */
          }
        }
        setRoster(others.map((seat) => ({ id: seat.userId, name: seat.name })));
        const linked = new Set(others.slice(0, 32).map((seat) => seat.userId));
        for (const seat of others) {
          names.set(seat.userId, seat.name);
          if (linked.has(seat.userId)) peer(seat.userId);
        }
        for (const id of [...pcs.keys()]) {
          if (!linked.has(id)) {
            pcs.get(id)?.close();
            pcs.delete(id);
          }
        }
        for (const row of beat.signals) {
          if (row.kind === "stage") continue;
          await apply(row.from, row.kind, row.payload);
        }
        setRemotes((cur) => cur.filter((remote) => pcs.has(remote.id)));
        const picture = streamRef.current?.getVideoTracks().find((track) => track.readyState === "live" && track.enabled);
        if (picture) {
          pcs.forEach((pc) => {
            const sender = pc.getSenders().find((row) => row.track?.kind === "video");
            if (sender?.track && sender.track !== picture && sender.track.readyState !== "live") void sender.replaceTrack(picture);
          });
        }
      } catch (caught) {
        if (dead) return;
        const message = caught instanceof Error ? caught.message : "The room dropped";
        if (/gone|join the group/i.test(message)) {
          onClose();
          return;
        }
        if (!/addIceCandidate|remote description/i.test(message)) setErr(message);
      }
      timer = window.setTimeout(() => void loop(), 1200);
    }

    void navigator.mediaDevices
      .getUserMedia({
        video: video
          ? {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      .then(async (stream) => {
        if (dead) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = localRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const picture = stream.getVideoTracks()[0];
        if (picture) picture.contentHint = "motion";
        streamRef.current = stream;
        video.srcObject = stream;
        setCamReady(true);
        await video.play();
        void loop();
      })
      .catch(() => {
        if (!dead) setErr(video ? "Allow the camera and microphone to study live." : "Allow the microphone to place the call.");
      });

    return () => {
      dead = true;
      window.clearInterval(quiet);
      holdMeeting(false);
      window.clearTimeout(timer);
      window.clearInterval(paint.current);
      if (tape.current && tape.current.state !== "inactive") {
        try {
          tape.current.stop();
        } catch {
          /* already stopped */
        }
      }
      const tracks = new Set<MediaStreamTrack>();
      const take = (stream?: MediaStream | null) => stream?.getTracks().forEach((track) => tracks.add(track));
      const el = localRef.current;
      if (el?.srcObject instanceof MediaStream) take(el.srcObject);
      take(streamRef.current);
      if (heldCamera.current) tracks.add(heldCamera.current);
      if (cameraHold.current) tracks.add(cameraHold.current);
      tracks.forEach((track) => {
        track.enabled = false;
        try {
          track.stop();
        } catch {
          /* already stopped */
        }
      });
      heldCamera.current = null;
      cameraHold.current = null;
      streamRef.current = null;
      if (el) {
        el.pause();
        el.srcObject = null;
      }
      pcs.forEach((pc) => pc.close());
      links.current = new Map();
      void studyLiveLeave({ data: { groupId } }).catch(() => undefined);
    };
  }, [groupId, selfId, video]);

  useEffect(() => {
    const video = localRef.current;
    const stream = streamRef.current;
    if (!video || !stream || video.srcObject === stream) return;
    video.srcObject = stream;
    void video.play().catch(() => undefined);
  });

  useEffect(() => {
    setMic(!muted);
  }, [muted]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = mic;
    });
  }, [mic]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = cam;
    });
  }, [cam]);

  useEffect(() => {
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const ears = new Map<string, { stream: MediaStream; clone: MediaStream; source: MediaStreamAudioSourceNode; analyser: AnalyserNode }>();
    let shown = "";
    let until = 0;
    const timer = window.setInterval(() => {
      void ctx.resume().catch(() => undefined);
      const rows: { id: string; stream: MediaStream }[] = remotes.map((remote) => ({ id: remote.id, stream: remote.stream }));
      const mine = streamRef.current;
      if (mic && mine?.getAudioTracks().some((track) => track.enabled && track.readyState === "live")) rows.push({ id: "self", stream: mine });
      const live = new Set(rows.map((row) => row.id));
      for (const [id, ear] of ears) {
        if (live.has(id) && ear.stream === rows.find((row) => row.id === id)?.stream) continue;
        ear.source.disconnect();
        ear.clone.getTracks().forEach((track) => track.stop());
        ears.delete(id);
      }
      let best = "";
      let loud = 0;
      let next = 0;
      for (const row of rows) {
        if (!row.stream.getAudioTracks().length) continue;
        let ear = ears.get(row.id);
        if (!ear) {
          const clone = new MediaStream(row.stream.getAudioTracks().map((track) => track.clone()));
          const source = ctx.createMediaStreamSource(clone);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          ear = { stream: row.stream, clone, source, analyser };
          ears.set(row.id, ear);
        }
        const data = new Uint8Array(ear.analyser.fftSize);
        ear.analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const sample = ((data[i] ?? 128) - 128) / 128;
          sum += sample * sample;
        }
        const level = Math.sqrt(sum / data.length);
        if (level > loud) {
          next = loud;
          loud = level;
          best = row.id;
        } else if (level > next) next = level;
      }
      const now = Date.now();
      if (!best || loud < 0.045 || loud < next * 1.6) return;
      if (best === shown) {
        until = now + 1400;
        return;
      }
      if (now < until) return;
      shown = best;
      until = now + 1400;
      setSpeaker(best);
    }, 200);
    return () => {
      window.clearInterval(timer);
      ears.forEach((ear) => {
        ear.source.disconnect();
        ear.clone.getTracks().forEach((track) => track.stop());
      });
      void ctx.close();
    };
  }, [remotes, mic]);

  useEffect(() => {
    let stop = false;
    async function pull() {
      try {
        const rows = await studyChat({ data: { groupId, after: after.current } });
        if (stop || !rows.length) return;
        after.current = rows[rows.length - 1]!.id;
        setNotes((cur) => [...cur, ...rows].slice(-80));
      } catch {
        /* the next poll retries */
      }
    }
    void pull();
    const timer = window.setInterval(() => void pull(), 2000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [groupId]);

  useEffect(() => {
    if (panel !== "people") return;
    let stop = false;
    void studyRoom({ data: { groupId } })
      .then((room) => {
        if (stop) return;
        setPeople(room.people);
        setPhone(room.phone);
      })
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [panel, groupId]);

  async function post(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await studySend({ data: { groupId, body } });
    } catch (caught) {
      setNote(caught instanceof Error ? caught.message : "Could not send");
    }
  }

  async function swapTrack(kind: "audio" | "video", track: MediaStreamTrack) {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((row) => {
      if (row.kind !== kind) return;
      stream.removeTrack(row);
      if (row !== track) row.stop();
    });
    stream.addTrack(track);
    links.current.forEach((pc) => {
      const sender = pc.getSenders().find((row) => row.track?.kind === kind);
      if (sender) void sender.replaceTrack(track);
      else pc.addTrack(track, stream);
    });
    if (localRef.current) localRef.current.srcObject = stream;
  }

  useEffect(() => {
    if (!backdrop || sharing) return;
    const stream = streamRef.current;
    const live = stream?.getVideoTracks().find((track) => track.readyState === "live" && track !== cameraHold.current);
    const camera = cameraHold.current?.readyState === "live" ? cameraHold.current : live;
    if (!camera || !stream) return;
    cameraHold.current = camera;
    let dead = false;
    let frame = 0;
    const hidden = document.createElement("video");
    hidden.muted = true;
    hidden.playsInline = true;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    const person = document.createElement("canvas");
    person.width = 640;
    person.height = 360;
    const personCtx = person.getContext("2d");
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    const bgVideo = backdrop.film ? document.createElement("video") : null;
    const bgImage = !backdrop.film && backdrop.src ? new Image() : null;
    let segmenter: { segmentForVideo: (frame: HTMLVideoElement, time: number) => { confidenceMasks?: { width: number; height: number; getAsFloat32Array: () => Float32Array; close: () => void }[] }; close: () => void } | null = null;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;left:-9999px;top:0;width:640px;height:360px;pointer-events:none";
    document.body.appendChild(canvas);
    if (!ctx || !personCtx || !maskCtx) {
      canvas.remove();
      return;
    }
    const draw = ctx;
    const face = personCtx;
    const maskDraw = maskCtx;
    let outgoing: MediaStreamTrack | null = null;

    async function run() {
      hidden.srcObject = new MediaStream([camera!]);
      await hidden.play().catch(() => undefined);
      if (bgVideo && backdrop?.src) {
        bgVideo.muted = true;
        bgVideo.loop = true;
        bgVideo.playsInline = true;
        bgVideo.src = backdrop.src;
        await bgVideo.play().catch(() => undefined);
      }
      if (bgImage && backdrop?.src) {
        bgImage.src = backdrop.src;
        await bgImage.decode?.().catch(() => undefined);
      }
      try {
        const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
        const wasm = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm");
        try {
          segmenter = await ImageSegmenter.createFromOptions(wasm, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            outputConfidenceMasks: true,
          });
        } catch {
          segmenter = await ImageSegmenter.createFromOptions(wasm, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputConfidenceMasks: true,
          });
        }
      } catch {
        if (!dead) setErr("The background could not start.");
        return;
      }
      if (dead || !segmenter) return;
      let painted: MediaStreamTrack | null = null;
      const emit = () => {
        const frameTrack = painted ?? canvas.captureStream(30).getVideoTracks()[0] ?? null;
        if (!frameTrack) return;
        if (!painted) {
          painted = frameTrack;
          outgoing = painted;
          painted.contentHint = "motion";
          stream!.getVideoTracks().forEach((track) => {
            if (track !== camera) {
              stream!.removeTrack(track);
              track.stop();
            } else stream!.removeTrack(track);
          });
          stream!.addTrack(painted);
          links.current.forEach((pc) => {
            const sender = pc.getSenders().find((row) => row.track?.kind === "video");
            if (sender) void sender.replaceTrack(painted);
            else pc.addTrack(painted!, stream!);
          });
          if (localRef.current) localRef.current.srcObject = stream!;
        }
        (painted as MediaStreamTrack & { requestFrame?: () => void }).requestFrame?.();
      };
      let last = 0;
      let nextSeg = 0;
      let smooth: Float32Array | null = null;
      let maskW = 0;
      let maskH = 0;
      const soft = document.createElement("canvas");
      soft.width = 320;
      soft.height = 180;
      const softCtx = soft.getContext("2d");
      const paint = () => {
        if (dead || !segmenter || !softCtx) return;
        frame = window.requestAnimationFrame(paint);
        if (hidden.readyState < 2) return;
        const now = performance.now();
        if (now >= nextSeg) {
          nextSeg = now + 80;
          last = Math.max(last + 1, now);
          const result = segmenter.segmentForVideo(hidden, last);
          const mask = result.confidenceMasks?.[0];
          if (mask) {
            const values = mask.getAsFloat32Array();
            if (!smooth || smooth.length !== values.length) smooth = new Float32Array(values.length);
            maskW = mask.width;
            maskH = mask.height;
            for (let i = 0; i < values.length; i += 1) {
              const raw = values[i] ?? 0;
              const solid = raw >= 0.65 ? 1 : raw <= 0.4 ? 0 : (raw - 0.4) / 0.25;
              const prev = smooth[i] ?? solid;
              smooth[i] = solid === 0 ? 0 : prev * 0.25 + solid * 0.75;
            }
            mask.close();
          }
        }
        draw.fillStyle = "#111";
        draw.fillRect(0, 0, 640, 360);
        if (!smooth || !maskW || !maskH) {
          draw.drawImage(hidden, 0, 0, 640, 360);
          emit();
          return;
        }
        if (maskCanvas.width !== maskW) maskCanvas.width = maskW;
        if (maskCanvas.height !== maskH) maskCanvas.height = maskH;
        const pixels = maskDraw.createImageData(maskW, maskH);
        for (let i = 0; i < smooth.length; i += 1) {
          const amount = smooth[i] ?? 0;
          const alpha = amount >= 0.78 ? 255 : amount <= 0.22 ? 0 : Math.round(amount * 255);
          const at = i * 4;
          pixels.data[at] = 255;
          pixels.data[at + 1] = 255;
          pixels.data[at + 2] = 255;
          pixels.data[at + 3] = alpha;
        }
        maskDraw.putImageData(pixels, 0, 0);
        softCtx.clearRect(0, 0, soft.width, soft.height);
        softCtx.drawImage(maskCanvas, 0, 0, soft.width, soft.height);
        face.clearRect(0, 0, 640, 360);
        face.drawImage(hidden, 0, 0, 640, 360);
        face.globalCompositeOperation = "destination-in";
        face.imageSmoothingEnabled = true;
        face.drawImage(soft, 0, 0, 640, 360);
        face.globalCompositeOperation = "source-over";
        if (backdrop?.blur) {
          draw.filter = `blur(${backdrop.blur}px)`;
          draw.drawImage(hidden, -24, -24, 688, 408);
          draw.filter = "none";
        } else if (bgVideo && bgVideo.readyState >= 2) {
          draw.drawImage(bgVideo, 0, 0, 640, 360);
        } else if (bgImage && bgImage.complete && bgImage.naturalWidth) {
          draw.drawImage(bgImage, 0, 0, 640, 360);
        } else {
          draw.drawImage(hidden, 0, 0, 640, 360);
        }
        draw.drawImage(person, 0, 0);
        emit();
      };
      frame = window.requestAnimationFrame(paint);
    }
    void run();
    return () => {
      dead = true;
      window.cancelAnimationFrame(frame);
      segmenter?.close();
      outgoing?.stop();
      canvas.remove();
      bgVideo?.pause();
      hidden.pause();
      hidden.srcObject = null;
      const held = cameraHold.current;
      const current = streamRef.current;
      const showing = current?.getVideoTracks()[0];
      if (held && held.readyState === "live" && current && showing === outgoing) {
        current.getVideoTracks().forEach((track) => {
          current.removeTrack(track);
          if (track !== held) track.stop();
        });
        current.addTrack(held);
        links.current.forEach((pc) => {
          const sender = pc.getSenders().find((row) => row.track?.kind === "video");
          if (sender) void sender.replaceTrack(held);
        });
        if (localRef.current) localRef.current.srcObject = current;
      }
    };
  }, [backdrop, sharing, camReady]);

  async function restorePicture() {
    if (restoring.current) return;
    restoring.current = true;
    const back = heldCamera.current;
    heldCamera.current = null;
    setSharing(false);
    try {
      if (back && back.readyState === "live") {
        back.enabled = true;
        await swapTrack("video", back);
        setCam(true);
        return;
      }
      const fresh = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      const track = fresh.getVideoTracks()[0];
      if (track) {
        await swapTrack("video", track);
        setCam(true);
      }
    } catch {
      setErr("The camera did not come back.");
    } finally {
      restoring.current = false;
    }
  }

  function record() {
    if (tape.current && tape.current.state === "recording") {
      tape.current.stop();
      window.clearInterval(paint.current);
      return;
    }
    const local = streamRef.current;
    if (!local) {
      setErr("The camera is not on yet.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErr("This browser cannot record the meeting.");
      return;
    }
    const draw = () => {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const root = document.querySelector("[data-meeting]");
      const videos = root ? ([...root.querySelectorAll("video")] as HTMLVideoElement[]) : [];
      const shown = videos.filter((el) => el.videoWidth > 0).slice(0, 4);
      if (!shown.length) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "32px sans-serif";
        ctx.fillText(title || "Noctis meeting", 48, 88);
        return;
      }
      const cols = shown.length > 1 ? 2 : 1;
      const rows = Math.ceil(shown.length / cols);
      const w = canvas.width / cols;
      const h = canvas.height / rows;
      shown.forEach((el, index) => {
        try {
          ctx.drawImage(el, (index % cols) * w, Math.floor(index / cols) * h, w, h);
        } catch {
          /* a frame that is not ready is skipped */
        }
      });
    };
    paint.current = window.setInterval(draw, 100);
    draw();
    const picture = canvas.captureStream(10);
    const mix = new MediaStream(picture.getVideoTracks());
    try {
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const add = (stream: MediaStream) => {
        const tracks = stream.getAudioTracks().filter((track) => track.readyState === "live");
        if (!tracks.length) return;
        audioCtx.createMediaStreamSource(new MediaStream(tracks)).connect(dest);
      };
      add(local);
      for (const remote of remotes) add(remote.stream);
      for (const track of dest.stream.getAudioTracks()) mix.addTrack(track);
    } catch {
      for (const track of local.getAudioTracks()) mix.addTrack(track);
    }
    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type)) || "";
    let rec: MediaRecorder;
    try {
      rec = mime ? new MediaRecorder(mix, { mimeType: mime }) : new MediaRecorder(mix);
    } catch {
      window.clearInterval(paint.current);
      setErr("This browser cannot record the meeting.");
      return;
    }
    const parts: Blob[] = [];
    rec.ondataavailable = (event) => {
      if (event.data.size) parts.push(event.data);
    };
    rec.onstop = () => {
      window.clearInterval(paint.current);
      const blob = new Blob(parts, { type: rec.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordingUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      onRecorded?.(url);
      setRecording(false);
      tape.current = null;
    };
    rec.start(1000);
    tape.current = rec;
    setRecording(true);
  }

  async function present() {
    if (sharing) {
      await restorePicture();
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = display.getVideoTracks()[0];
      if (!track) return;
      const current = streamRef.current?.getVideoTracks()[0];
      if (current && current.readyState === "live") {
        current.enabled = false;
        heldCamera.current = current;
        streamRef.current?.removeTrack(current);
      }
      track.contentHint = "detail";
      track.onended = () => {
        void restorePicture();
      };
      await swapTrack("video", track);
      setSharing(true);
      setCam(true);
    } catch {
      /* the person closed the share picker */
    }
  }

  async function useDevice(device: MediaDeviceInfo) {
    if (device.kind === "videoinput" && sharing) return;
    try {
      const fresh = await navigator.mediaDevices.getUserMedia(
        device.kind === "audioinput" ? { audio: { deviceId: { exact: device.deviceId } } } : { video: { deviceId: { exact: device.deviceId } } },
      );
      const track = device.kind === "audioinput" ? fresh.getAudioTracks()[0] : fresh.getVideoTracks()[0];
      if (!track) return;
      track.enabled = device.kind === "audioinput" ? mic : cam;
      await swapTrack(device.kind === "audioinput" ? "audio" : "video", track);
    } catch {
      setErr("That device did not open.");
    }
  }

  async function holdFront(_nextFollow: boolean, pin: string) {
    const who = pin === "self" ? selfId : pin;
    if (who) setHostPin(who);
    const payload = JSON.stringify({ follow: false, pin: who });
    const targets = [...new Set([selfId, ...roster.map((person) => person.id)])];
    await Promise.all(
      targets.map((to) => studyLiveSignal({ data: { groupId, to, kind: "stage", payload } }).catch(() => undefined)),
    );
  }

  function tellPresence(hand: boolean, muted: boolean) {
    const payload = JSON.stringify({ hand, muted });
    const who = roster.map((person) => person.id).join(",");
    const key = `${payload}|${who}`;
    if (key === sentMark.current || !who) return;
    sentMark.current = key;
    void Promise.all(
      roster.map((person) => studyLiveSignal({ data: { groupId, to: person.id, kind: "mark", payload } }).catch(() => undefined)),
    );
  }

  function leave() {
    window.clearInterval(paint.current);
    if (tape.current && tape.current.state !== "inactive") {
      try {
        tape.current.stop();
      } catch {
        /* already stopped */
      }
    }
    const tracks = new Set<MediaStreamTrack>();
    const take = (stream?: MediaStream | null) => stream?.getTracks().forEach((track) => tracks.add(track));
    const el = localRef.current;
    if (el?.srcObject instanceof MediaStream) take(el.srcObject);
    take(streamRef.current);
    if (heldCamera.current) tracks.add(heldCamera.current);
    if (cameraHold.current) tracks.add(cameraHold.current);
    tracks.forEach((track) => {
      track.enabled = false;
      try {
        track.stop();
      } catch {
        /* already stopped */
      }
    });
    heldCamera.current = null;
    cameraHold.current = null;
    streamRef.current = null;
    if (el) {
      el.pause();
      el.srcObject = null;
    }
    links.current.forEach((pc) => pc.close());
    onClose();
  }

  return meet ? (
    <Meet
      title={title}
      remotes={remotes}
      roster={roster}
      count={count}
      waiting={count < 2}
      cam={cam}
      mic={mic}
      hear={hear}
      sharing={sharing}
      err={err}
      localRef={localRef}
      speaker={speaker}
      host={host}
      hostPin={hostPin}
      selfId={selfId}
      onHold={(next, pin) => void holdFront(next, pin)}
      onMic={() => setMic((on) => !on)}
      onCam={() => setCam((on) => !on)}
      onHear={() => setHear((on) => !on)}
      onPresent={() => void present()}
      onRecord={record}
      recording={recording}
      recordingUrl={recordingUrl}
      onDevice={(device) => void useDevice(device)}
      onAdd={onAdd}
      onShare={onShare}
      onScene={setBackdrop}
      initialScene={FOREST_MEET}
      marks={marks}
      onPresence={tellPresence}
      onClose={leave}
    />
  ) : (
    <div data-meeting="" className="overflow-hidden rounded-2xl bg-[#0b1220] text-[#f6f3ec]">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <p className="min-w-0 truncate text-sm font-semibold">{title}</p>
        <span className="shrink-0 rounded-md bg-[#b42318] px-1.5 py-0.5 text-[10px] font-bold tracking-wide">LIVE · {count}</span>
      </div>
      <div className={remotes.length ? "grid gap-1 px-1 sm:grid-cols-2" : "px-1"}>
        <Stage gold={sharing}>
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            className={`absolute inset-0 h-full w-full bg-black ${sharing ? "object-contain" : "-scale-x-100 object-cover"}`}
            style={{ maxWidth: "none", height: "100%" }}
          />
        </Stage>
        {remotes.map((remote) => (
          <RemoteTile key={remote.id} name={remote.name} stream={remote.stream} />
        ))}
      </div>
      {err ? <p className="px-3 pt-2 text-xs text-[#f3c7c2]">{err}</p> : null}
      {note ? <p className="px-3 pt-2 text-xs text-[#f3c7c2]">{note}</p> : null}
      {panel === "chat" ? (
        <div className="mx-3 mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl bg-white/5 p-2">
          {notes.length === 0 ? <p className="text-xs text-white/60">No messages yet.</p> : null}
          {notes.map((row) => (
            <p key={row.id} className="text-sm">
              <span className="font-semibold">{row.mine ? "You" : row.name}: </span>
              {row.body}
            </p>
          ))}
          <form className="flex gap-2 pt-1" onSubmit={(event) => void post(event)}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message the group"
              maxLength={500}
              className="min-h-11 min-w-0 flex-1 rounded-xl bg-black/40 px-3 text-sm"
            />
            <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-white/10 px-3 text-xs font-semibold">
              Send
            </button>
          </form>
        </div>
      ) : null}
      {panel === "people" ? (
        <div className="mx-3 mt-2 space-y-2 rounded-xl bg-white/5 p-2">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void studySavePhone({ data: { groupId, phone } })
                .then(() => setNote("Your phone is saved for this group."))
                .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not save the phone"));
            }}
          >
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone, so they can call you"
              className="min-h-11 min-w-0 flex-1 rounded-xl bg-black/40 px-3 text-sm"
            />
            <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-white/10 px-3 text-xs font-semibold">
              Save
            </button>
          </form>
          {people.length === 0 ? <p className="text-xs text-white/60">No one else has joined this group yet.</p> : null}
          {people.map((person) => (
            <div key={person.userId} className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm">
                {person.name}
                <span className="text-xs text-white/60">{person.live ? " · in the room" : ""}</span>
              </p>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void studyRing({ data: { groupId, to: person.userId } })
                      .then(() => setNote(`Calling ${person.name} in the app.`))
                      .catch((caught: unknown) => setNote(caught instanceof Error ? caught.message : "Could not call"))
                  }
                  className="min-h-11 rounded-full bg-white/10 px-3 text-xs font-semibold"
                >
                  Call in app
                </button>
                {person.phone && dialHref(person.phone) ? (
                  <a href={dialHref(person.phone)} className="grid min-h-11 place-items-center rounded-full bg-white/10 px-3 text-xs font-semibold">
                    Call phone
                  </a>
                ) : (
                  <span className="grid min-h-11 place-items-center px-2 text-[11px] text-white/50">No phone</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 px-3 py-3">
        <button type="button" onClick={() => setPanel((v) => (v === "chat" ? null : "chat"))} className="min-h-11 flex-1 rounded-full bg-white/10 text-xs font-semibold">
          Messages{notes.length ? ` ${notes.length}` : ""}
        </button>
        <button type="button" onClick={() => setPanel((v) => (v === "people" ? null : "people"))} className="min-h-11 flex-1 rounded-full bg-white/10 text-xs font-semibold">
          Call
        </button>
        <button type="button" onClick={() => setMic((v) => !v)} className="min-h-11 flex-1 rounded-full bg-white/10 text-xs font-semibold">
          {mic ? "Mute" : "Unmute"}
        </button>
        <button type="button" onClick={() => setCam((v) => !v)} className="min-h-11 flex-1 rounded-full bg-white/10 text-xs font-semibold">
          {cam ? "Camera off" : "Camera on"}
        </button>
        <button type="button" onClick={leave} className="min-h-11 flex-1 rounded-full bg-[#b42318] text-xs font-semibold">
          Leave
        </button>
      </div>
    </div>
  );
}

async function sharp(sender: RTCRtpSender) {
  if (sender.track?.kind !== "video") return;
  try {
    const params = sender.getParameters();
    if (!params.encodings.length) params.encodings = [{}];
    const encoding = params.encodings[0]!;
    encoding.maxBitrate = 350_000;
    encoding.maxFramerate = 30;
    params.degradationPreference = "maintain-framerate";
    await sender.setParameters(params);
  } catch {
    /* the browser keeps its own bitrate */
  }
}

const MEET_SCENES: (MeetScene & { label: string })[] = [
  { src: "/media/meet/forest.jpg", label: "Forest" },
  { label: "Blur", blur: 14 },
  { src: "/media/meet-loft.jpg", label: "Loft" },
  { src: "/media/meet-beams.jpg", label: "Beams" },
  { src: "/media/meet-hills.jpg", label: "Hills" },
  { src: "/brand/login-1.jpg", label: "Friends" },
  { src: "/brand/login-3.jpg", label: "Galaxy" },
  { src: "/brand/login-4.jpg", label: "Choir" },
  { src: "/brand/login-6.jpg", label: "Library" },
  { src: "/media/study-room.jpg", label: "Study" },
  { src: "/media/covers/nightmarket.jpg", label: "Night" },
  { src: "/media/covers/hall.jpg", label: "Hall" },
  { src: "/media/desk/pulpit.jpg", label: "Pulpit" },
  { src: "/media/clips/spot.mp4", label: "City", film: true },
  { src: "/media/clips/run.mp4", label: "Road", film: true },
  { src: "/media/hall/physician.mp4", label: "Clinic", film: true },
  { src: "/media/hall/developer.mp4", label: "Build", film: true },
];

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function tileTint(name: string) {
  const colors = ["#1e8e3e", "#1a73e8", "#9334e6", "#e37400", "#129eaf", "#d93025"];
  let n = 0;
  for (const ch of name) n += ch.charCodeAt(0);
  return colors[n % colors.length] ?? "#1e8e3e";
}

function videoLive(stream?: MediaStream) {
  return Boolean(stream?.getVideoTracks().some((row) => row.readyState === "live" && row.enabled && !row.muted));
}

function audioLive(stream?: MediaStream) {
  const track = stream?.getAudioTracks().find((row) => row.readyState === "live");
  if (!track) return true;
  return track.enabled && !track.muted;
}

function Meet({
  title,
  remotes,
  roster,
  count,
  waiting,
  cam,
  mic,
  hear,
  sharing,
  err,
  localRef,
  speaker,
  host,
  hostPin,
  selfId,
  onHold,
  onMic,
  onCam,
  onHear,
  onPresent,
  onRecord,
  recording,
  recordingUrl,
  onDevice,
  onAdd,
  onShare,
  onScene,
  initialScene = null,
  marks,
  onPresence,
  onClose,
}: {
  title: string;
  remotes: Remote[];
  roster: { id: string; name: string }[];
  count: number;
  waiting: boolean;
  cam: boolean;
  mic: boolean;
  hear: boolean;
  sharing: boolean;
  err: string | null;
  localRef: RefObject<HTMLVideoElement | null>;
  speaker: string;
  host: boolean;
  hostPin: string;
  selfId: string;
  onHold: (follow: boolean, pin: string) => void;
  onMic: () => void;
  onCam: () => void;
  onHear: () => void;
  onPresent: () => void;
  onRecord: () => void;
  recording: boolean;
  recordingUrl: string;
  onDevice: (device: MediaDeviceInfo) => void;
  onAdd?: () => void;
  onShare?: () => void | Promise<"shared" | "copied" | "aborted" | "failed" | void>;
  onScene: (scene: MeetScene | null) => void;
  initialScene?: MeetScene | null;
  marks: Record<string, { hand: boolean; muted: boolean }>;
  onPresence: (hand: boolean, muted: boolean) => void;
  onClose: () => void;
}) {
  const [pinned, setPinned] = useState("");
  useEffect(() => {
    if (!hostPin) return;
    setPinned(hostPin === selfId ? "self" : hostPin);
  }, [hostPin, selfId]);
  const [sent, setSent] = useState("");
  const [open, setOpen] = useState<"" | "gear" | "react" | "more" | "scene">("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [hand, setHand] = useState(false);
  const [burst, setBurst] = useState("");
  const [captions, setCaptions] = useState(false);
  const [caption, setCaption] = useState("");
  const [scene, setScene] = useState<MeetScene | null>(initialScene);
  const ownScene = useRef("");
  const mark = (title || "?").slice(0, 1).toUpperCase();
  const faces = ["👍", "❤️", "😂", "😮", "😢", "😡"];
  const presence = useRef(onPresence);
  presence.current = onPresence;
  useEffect(() => {
    presence.current(hand, !mic);
  }, [hand, mic, roster.length]);

  useEffect(() => {
    if (!captions) {
      setCaption("");
      return;
    }
    const host = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = host.SpeechRecognition || host.webkitSpeechRecognition;
    if (!Ctor) {
      setCaption("This browser cannot write captions.");
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      const row = event.results[event.results.length - 1];
      const said = row?.[0]?.transcript?.trim();
      if (said) setCaption(said);
    };
    rec.onend = () => {
      try {
        rec.start();
      } catch {
        /* already stopped */
      }
    };
    try {
      rec.start();
    } catch {
      setCaption("Allow the microphone for captions.");
    }
    return () => {
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [captions]);

  function react(face: string) {
    setBurst(face);
    setOpen("");
    window.setTimeout(() => setBurst(""), 1600);
  }

  function useScene(next: MeetScene | null) {
    if (ownScene.current) {
      URL.revokeObjectURL(ownScene.current);
      ownScene.current = "";
    }
    setScene(next);
    onScene(next);
    setOpen("");
  }

  function useOwnScene(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (ownScene.current) URL.revokeObjectURL(ownScene.current);
    ownScene.current = url;
    const next = { src: url, film: file.type.startsWith("video") };
    setScene(next);
    onScene(next);
    setOpen("");
  }

  const icon = "grid size-10 shrink-0 place-items-center rounded-full text-white hover:bg-white/10";
  const strip = roster.length > 0;
  const pin = pinned === "self" || roster.some((person) => person.id === pinned) ? pinned : sharing ? "self" : roster[0]?.id || "self";
  const selfLarge = !strip || pin === "self";
  const stageRemote = !selfLarge ? remotes.find((row) => row.id === pin) : undefined;
  const stageName = roster.find((person) => person.id === pin)?.name || "Guest";
  function bring(id: string) {
    if (!host) return;
    setPinned(id);
    onHold(false, id);
  }
  return (
    <div data-meeting="" className="flex h-full min-h-0 flex-col bg-[#0c0c0c] text-white">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 min-w-0 flex-1">
          <p className="absolute top-3 left-4 z-30 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">{count} / 200</p>
          {recording ? <span className="absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#ea4335] px-3 py-1 text-[11px] font-semibold">Recording</span> : null}
          {host && speaker && speaker !== pin ? (
            <button
              type="button"
              onClick={() => bring(speaker)}
              className="absolute top-3 right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-[#e4b86a] px-3 py-1 text-[11px] font-semibold text-[#1a1408]"
            >
              <Pin className="size-3.5" />
              Bring to front
            </button>
          ) : null}
          {selfLarge ? (
            <div
              className={
                sharing
                  ? "absolute inset-2 z-10 overflow-hidden rounded-2xl border-[5px] border-[#e4b86a] bg-black sm:inset-3"
                  : `absolute inset-2 overflow-hidden rounded-2xl bg-zinc-900 sm:inset-3 ${speaker === "self" ? "border-4 border-[#34a853]" : ""}`
              }
            >
              <video
                ref={localRef}
                autoPlay
                muted
                playsInline
                disablePictureInPicture
                className={cam || sharing ? `h-full w-full bg-black ${sharing ? "object-contain" : "-scale-x-100 object-cover"}` : "hidden"}
              />
              {cam || sharing ? null : (
                <div className="grid h-full place-items-center text-center text-white/70">
                  <div>
                    <div className="mx-auto grid size-24 place-items-center rounded-full bg-white/10 text-4xl font-semibold">{mark}</div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{strip ? "You" : title}</p>
                  </div>
                </div>
              )}
              {sharing ? <span className="absolute top-3 left-3 rounded-full bg-[#e4b86a] px-2.5 py-1 text-[11px] font-semibold text-[#1a1408]">Screen</span> : null}
              {hand ? <span className="absolute top-3 left-3 z-20 text-4xl leading-none">👋</span> : null}
              {!mic ? (
                <span className="absolute bottom-3 left-4 z-20 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-sm">
                  <MicOff className="size-3.5 text-[#f28b82]" />
                  You
                </span>
              ) : (
                <span className="absolute bottom-3 left-4 z-20 rounded-md bg-black/60 px-2 py-0.5 text-sm">{strip ? "You" : waiting ? "You · calling" : "You"}</span>
              )}
            </div>
          ) : stageRemote ? (
            <RemoteTile fill live={stageRemote.id === speaker} name={stageRemote.name} stream={stageRemote.stream} quiet={!hear} />
          ) : (
            <div className={`absolute inset-2 grid place-items-center rounded-2xl bg-zinc-900 sm:inset-3 ${pin === speaker ? "border-4 border-[#34a853]" : ""}`}>
              <div className="text-center">
                <div className="mx-auto grid size-24 place-items-center rounded-full bg-white/10 text-4xl font-semibold">{stageName.slice(0, 1).toUpperCase()}</div>
                <p className="mt-4 text-2xl font-semibold">{stageName}</p>
                <p className="mt-1 text-sm text-white/60">Connecting the camera</p>
              </div>
            </div>
          )}
          {burst ? <p className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 text-6xl">{burst}</p> : null}
          {caption ? (
            <p className="absolute bottom-6 left-1/2 z-30 max-w-[80%] -translate-x-1/2 rounded-xl bg-black/75 px-3 py-1.5 text-center text-sm">{caption}</p>
          ) : null}
          {err ? <p className="absolute top-12 right-4 left-4 z-20 rounded-xl bg-black/70 px-3 py-2 text-sm text-[#f3c7c2]">{err}</p> : null}
        </div>
        <div className="flex h-[7.25rem] shrink-0 gap-2 overflow-x-auto px-3 py-2">
            {roster.map((person) => {
              const remote = remotes.find((row) => row.id === person.id);
              const talking = person.id === speaker;
              const raised = Boolean(marks[person.id]?.hand);
              const quietMic = Boolean(marks[person.id]?.muted) || !audioLive(remote?.stream);
              const picture = videoLive(remote?.stream);
              return (
                <div
                  key={person.id}
                  role={host ? "button" : undefined}
                  tabIndex={host ? 0 : undefined}
                  onClick={() => bring(person.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") bring(person.id);
                  }}
                  className={`relative h-full w-40 shrink-0 overflow-hidden rounded-xl bg-[#202124] text-left ${talking ? "ring-[3px] ring-[#34a853]" : pin === person.id ? "ring-2 ring-white/70" : ""}`}
                >
                  {remote && picture ? (
                    <RemoteTile tall name={remote.name} stream={remote.stream} quiet={!hear || person.id === stageRemote?.id} />
                  ) : (
                    <span className="grid h-full place-items-center">
                      <span className="grid size-12 place-items-center rounded-2xl text-xl font-semibold text-white" style={{ background: tileTint(person.name) }}>
                        {(person.name || "?").slice(0, 1).toUpperCase()}
                      </span>
                    </span>
                  )}
                  {raised ? <span className="absolute top-1.5 left-1.5 z-20 text-2xl leading-none">👋</span> : null}
                  {talking ? <span className="pointer-events-none absolute inset-0 z-30 rounded-xl border-[3px] border-[#34a853]" /> : null}
                  <span className="absolute bottom-1.5 left-1.5 z-20 inline-flex max-w-[90%] items-center gap-1 truncate rounded-md bg-black/70 px-1.5 py-0.5 text-[11px]">
                    {quietMic ? <MicOff className="size-3 shrink-0 text-[#f28b82]" /> : null}
                    {person.name}
                  </span>
                </div>
              );
            })}
            <div
              role={host ? "button" : undefined}
              tabIndex={host ? 0 : undefined}
              onClick={() => bring("self")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") bring("self");
              }}
              className={`relative h-full w-40 shrink-0 overflow-hidden rounded-xl bg-[#202124] text-left ${speaker === "self" ? "ring-[3px] ring-[#34a853]" : !sharing && pin === "self" ? "ring-2 ring-white/70" : ""}`}
            >
              {selfLarge ? (
                <Mirror source={localRef} className={cam && !sharing ? "absolute inset-0 h-full w-full -scale-x-100 object-cover" : "hidden"} />
              ) : (
                <video
                  ref={localRef}
                  autoPlay
                  muted
                  playsInline
                  disablePictureInPicture
                  className={cam && !sharing ? "absolute inset-0 h-full w-full -scale-x-100 object-cover" : "hidden"}
                />
              )}
              {cam && !sharing ? null : (
                <span className="grid h-full place-items-center">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#1e8e3e] text-xl font-semibold text-white">{mark}</span>
                </span>
              )}
              {hand ? <span className="absolute top-1.5 left-1.5 z-20 text-2xl leading-none">👋</span> : null}
              {speaker === "self" ? <span className="pointer-events-none absolute inset-0 z-30 rounded-xl border-[3px] border-[#34a853]" /> : null}
              <span className="absolute bottom-1.5 left-1.5 z-20 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px]">
                {!mic ? <MicOff className="size-3 text-[#f28b82]" /> : null}
                You
              </span>
            </div>
          </div>
      </div>
      {open === "gear" && devices.length ? (
        <div className="mx-auto mb-2 flex max-h-36 w-fit max-w-[calc(100%-1.5rem)] flex-col overflow-y-auto rounded-2xl bg-[#2a2a2a] p-1 ring-1 ring-white/10">
          {devices.map((device) => (
            <button
              key={device.deviceId}
              type="button"
              onClick={() => {
                onDevice(device);
                setOpen("");
              }}
              className="truncate rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10"
            >
              {device.label || (device.kind === "audioinput" ? "Microphone" : "Camera")}
            </button>
          ))}
        </div>
      ) : null}
      {open === "react" ? (
        <div className="mx-auto mb-2 flex w-[min(46rem,calc(100%-1.5rem))] items-center justify-center gap-6 rounded-full border border-[#e4b86a]/70 bg-[#12141c] px-6 py-2.5 shadow-[0_0_0_1px_rgba(228,184,106,0.25)]">
          {faces.map((face) => (
            <button key={face} type="button" onClick={() => react(face)} aria-label={`React ${face}`} className="grid size-10 place-items-center rounded-full text-2xl leading-none hover:bg-white/10">
              {face}
            </button>
          ))}
        </div>
      ) : null}
      {open === "scene" ? (
        <div className="mx-3 mb-2 flex gap-2 overflow-x-auto rounded-2xl bg-[#2a2a2a] p-2 ring-1 ring-white/10">
          <button type="button" onClick={() => useScene(null)} className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-black text-[10px] font-semibold text-white/80">
            None
          </button>
          <label className="grid h-16 w-16 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/10 text-center text-[10px] font-semibold leading-tight text-white">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                useOwnScene(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            Yours
          </label>
          {MEET_SCENES.map((item) => (
            <button key={item.label} type="button" onClick={() => useScene(item)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800 ${scene?.src && scene.src === item.src ? "ring-2 ring-white" : ""}`}>
              {item.blur ? (
                <span className="grid h-full place-items-center text-[11px] font-semibold">Blur</span>
              ) : item.film ? (
                <video src={item.src} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
      {open === "more" ? (
        <div className="mx-auto mb-2 flex w-fit gap-1 rounded-full bg-[#2a2a2a] p-1 ring-1 ring-white/10">
          {onAdd ? (
            <button type="button" onClick={() => { setOpen(""); onAdd(); }} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-white/10">
              <UserPlus className="size-4" />
              Add
            </button>
          ) : null}
          {onShare ? (
            <button
              type="button"
              onClick={() => {
                setOpen("");
                void Promise.resolve(onShare()).then((result) => {
                  if (result === "copied") setSent("Link copied");
                  if (result === "failed") setSent("Could not copy the link");
                  if (result === "copied" || result === "failed") window.setTimeout(() => setSent(""), 2500);
                });
              }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-white/10"
            >
              <Link2 className="size-4" />
              {sent || "Copy link"}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="flex shrink-0 justify-center px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-[#2a2a2a] px-2 py-2 ring-1 ring-white/10 scrollbar-none">
          <button type="button" aria-label={hear ? "Mute speaker" : "Unmute speaker"} onClick={onHear} className={`${icon} ${hear ? "" : "bg-white text-black"}`}>
            <AudioLines className="size-5" />
          </button>
          <button type="button" aria-label={mic ? "Mute microphone" : "Unmute microphone"} onClick={onMic} className={`${icon} ${mic ? "" : "bg-white text-black"}`}>
            {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <button
            type="button"
            aria-label="Choose a microphone or camera"
            onClick={() => {
              if (open === "gear") {
                setOpen("");
                return;
              }
              void navigator.mediaDevices.enumerateDevices().then((list) => {
                setDevices(list.filter((device) => device.kind === "audioinput" || device.kind === "videoinput"));
                setOpen("gear");
              });
            }}
            className={icon}
          >
            <ChevronUp className="size-5" />
          </button>
          <button type="button" aria-label={cam ? "Turn camera off" : "Turn camera on"} onClick={onCam} className={`${icon} ${cam ? "" : "bg-white text-black"}`}>
            {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
          <button type="button" aria-label="Choose a meeting background" onClick={() => setOpen((now) => (now === "scene" ? "" : "scene"))} className={`${icon} ${scene ? "bg-white text-black" : ""}`}>
            <ImagePlus className="size-5" />
          </button>
          <button type="button" aria-label={sharing ? "Stop sharing" : "Share your screen"} onClick={onPresent} className={`${icon} ${sharing ? "bg-white text-black" : ""}`}>
            <MonitorUp className="size-5" />
          </button>
          <button type="button" aria-label={recording ? "Stop recording" : "Record the meeting"} onClick={onRecord} className={`${icon} ${recording ? "bg-[#ea4335] text-white" : ""}`}>
            <Circle className={`size-5 ${recording ? "fill-white" : ""}`} />
          </button>
          {recordingUrl ? (
            <a href={recordingUrl} download="vibetok-meeting.webm" className="inline-flex h-10 shrink-0 items-center rounded-full bg-white px-3 text-xs font-semibold text-black">
              Download
            </a>
          ) : null}
          <button type="button" aria-label="Send a reaction" onClick={() => setOpen((now) => (now === "react" ? "" : "react"))} className={`${icon} ${open === "react" ? "bg-white/15" : ""}`}>
            <Smile className="size-5" />
          </button>
          <button type="button" aria-label={captions ? "Hide captions" : "Show captions"} onClick={() => setCaptions((on) => !on)} className={`${icon} ${captions ? "bg-white text-black" : ""}`}>
            <Captions className="size-5" />
          </button>
          <button type="button" aria-label={hand ? "Lower hand" : "Raise hand"} onClick={() => setHand((on) => !on)} className={`${icon} ${hand ? "bg-[#e4b86a] text-[#1a1408]" : ""}`}>
            <Hand className="size-5" />
          </button>
          <button type="button" aria-label="More" onClick={() => setOpen((now) => (now === "more" ? "" : "more"))} className={`${icon} ${open === "more" ? "bg-white/15" : ""}`}>
            <MoreHorizontal className="size-5" />
          </button>
          <button type="button" onClick={onClose} aria-label="End call" className="grid size-12 shrink-0 place-items-center rounded-full bg-[#ea4335] text-white">
            <PhoneOff className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Mirror({ source, className }: { source: RefObject<HTMLVideoElement | null>; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const pull = () => {
      const from = source.current?.srcObject;
      const el = ref.current;
      if (!el || !from || el.srcObject === from) return;
      el.srcObject = from;
      void el.play().catch(() => undefined);
    };
    pull();
    const id = window.setInterval(pull, 400);
    return () => window.clearInterval(id);
  }, [source]);
  return <video ref={ref} autoPlay muted playsInline disablePictureInPicture className={className} />;
}

function Stage({ children, gold = false }: { children: ReactNode; gold?: boolean }) {
  return <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black ${gold ? "border-4 border-[#e4b86a]" : ""}`}>{children}</div>;
}

function RemoteTile({ name, stream, fill = false, tall = false, quiet = false, live = false }: { name: string; stream: MediaStream; fill?: boolean; tall?: boolean; quiet?: boolean; live?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const clone = stream.clone();
    el.srcObject = clone;
    el.playsInline = true;
    el.volume = 1;
    el.muted = quiet;
    const start = () => {
      if (!el.paused && el.readyState >= 2 && el.videoWidth > 0) {
        el.muted = quiet;
        setNeedsTap(false);
        return;
      }
      void el
        .play()
        .then(() => {
          el.muted = quiet;
          setNeedsTap(false);
        })
        .catch(() => {
          el.muted = true;
          void el
            .play()
            .then(() => setNeedsTap(true))
            .catch(() => setNeedsTap(true));
        });
    };
    start();
    const tracks = clone.getTracks();
    tracks.forEach((track) => track.addEventListener("unmute", start));
    return () => {
      tracks.forEach((track) => track.removeEventListener("unmute", start));
      el.srcObject = null;
    };
  }, [stream, quiet]);
  const framed = stream.getVideoTracks().some((track) => track.contentHint === "detail" || /screen|display|window|monitor/i.test(track.label));
  return (
    <div className={`${fill ? "absolute inset-0 overflow-hidden bg-black" : tall ? "relative h-full min-h-0 overflow-hidden rounded-xl bg-black" : "relative aspect-video w-full overflow-hidden rounded-xl bg-black"}${framed ? " border-4 border-[#e4b86a]" : live ? " border-4 border-[#34a853]" : ""}`}>
      <video
        ref={ref}
        autoPlay
        playsInline
        disablePictureInPicture
        className={`absolute inset-0 h-full w-full bg-black ${fill || framed ? "object-contain" : "object-cover"}`}
      />
      {needsTap ? (
        <button
          type="button"
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            el.muted = false;
            void el.play().then(() => setNeedsTap(false)).catch(() => undefined);
          }}
          className="absolute inset-0 z-10 grid place-items-center bg-black/55 px-3 text-center text-sm font-semibold"
        >
          Tap to hear {name}
        </button>
      ) : null}
      <span className="absolute bottom-2 left-2 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[11px]">{name}</span>
    </div>
  );
}
