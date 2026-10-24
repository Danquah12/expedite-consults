import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { youtubeEmbedSrc, youtubePoster, youtubePosterSrcSet, POSTER_SIZES, ytCommand, ytEnded, ytGated, ytInfo, ytListen, ytReady } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";
import { ClipDock } from "@/components/feed/ClipDock";
import { wantMute, isCoarsePointer, isIOS, markGesture, holdPlay, bindAutoplay } from "@/lib/playback";
import { notePlayback } from "@/lib/playback-metrics";
import { cn } from "@/lib/utils";

function applySound(frame: HTMLIFrameElement | null) {
  if (!frame) return;
  if (wantMute()) {
    ytCommand(frame, "mute");
    return;
  }
  ytCommand(frame, "unMute");
  ytCommand(frame, "setVolume", [100]);
}

export function YoutubeFrame({
  postId,
  youtubeId,
  posterUrl,
  playing,
  muted,
  start = 0,
  onToggle,
  onEnded,
  onTime,
  seekAt = null,
  chrome = true,
  captions = true,
  isolate = false,
  silent = false,
  fill = false,
  className,
}: {
  postId: string;
  youtubeId: string;
  posterUrl?: string;
  playing: boolean;
  muted: boolean;
  start?: number;
  onToggle: () => void;
  onEnded?: () => void;
  onTime?: (time: number, duration: number) => void;
  seekAt?: number | null;
  chrome?: boolean;
  captions?: boolean;
  isolate?: boolean;
  silent?: boolean;
  primed?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const noteWatch = useFeedStore((s) => s.noteWatch);
  const dropGatedYoutube = useFeedStore((s) => s.dropGatedYoutube);
  const gated = useFeedStore((s) => s.blockedYoutube.includes(youtubeId));
  const soundUnlocked = useFeedStore((s) => s.soundUnlocked);
  const ended = useRef(false);
  const live = useRef(false);
  const userPaused = useRef(false);
  const soundHeld = useRef(false);
  const reloadedAt = useRef(0);
  const armed = useRef(0);
  const counted = useRef(false);
  const resumeAt = useRef(0);
  const stateRef = useRef(-1);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;
  const durationRef = useRef(0);
  const timeRef = useRef(0);
  const durationHeld = useRef(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [shown, setShown] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [warm, setWarm] = useState(playing);
  const src = useMemo(() => youtubeEmbedSrc(youtubeId, { autoplay: true, mute: true }), [youtubeId]);
  const mount = playing || isolate || warm;

  function atTheEnd(fromPlayer = false) {
    const dur = durationRef.current;
    const t = timeRef.current;
    if (dur < 8 || t < 5) return false;
    if (fromPlayer && t >= dur * 0.9) return true;
    return t >= dur - 2;
  }

  function finish(fromPlayer = false) {
    if (ended.current) return;
    if (!atTheEnd(fromPlayer)) return;
    ended.current = true;
    live.current = false;
    setPaused(true);
    setShown(false);
    onEndedRef.current?.();
  }

  useEffect(() => {
    live.current = false;
    ended.current = false;
    userPaused.current = false;
    soundHeld.current = false;
    reloadedAt.current = 0;
    stateRef.current = -1;
    durationRef.current = 0;
    timeRef.current = 0;
    durationHeld.current = 0;
    setShown(false);
    setLoaded(false);
    setNeedsTap(false);
    setTime(0);
    setDuration(0);
  }, [youtubeId]);

  useLayoutEffect(() => {
    if (playing) {
      setWarm(true);
      return;
    }
    const frame = iframeRef.current;
    ytCommand(frame, "pauseVideo");
    ytCommand(frame, "mute");
    const drop = window.setTimeout(() => setWarm(false), 350);
    return () => window.clearTimeout(drop);
  }, [playing]);

  useLayoutEffect(() => {
    return () => {
      ytCommand(iframeRef.current, "pauseVideo");
      ytCommand(iframeRef.current, "mute");
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    armed.current = performance.now();
    counted.current = false;
    const stall = window.setTimeout(() => {
      if (!live.current && playingRef.current) notePlayback("stalled");
    }, 4500);
    return () => window.clearTimeout(stall);
  }, [playing, youtubeId]);

  useEffect(() => {
    if (playing) {
      if (!ended.current && !silent) {
        userPaused.current = false;
        noteWatch(postId);
      }
      return;
    }
    live.current = false;
    setPaused(true);
    setShown(false);
    ytCommand(iframeRef.current, "pauseVideo");
    ytCommand(iframeRef.current, "mute");
  }, [playing, postId, noteWatch]);

  useEffect(() => {
    if (!mount || gated) return;
    const kick = () => {
      const frame = iframeRef.current;
      if (!frame || ended.current || userPaused.current || !playingRef.current) return;
      ytListen(frame);
      if (live.current || stateRef.current === 1) {
        if (!silent && !wantMute()) applySound(frame);
        return;
      }
      ytCommand(frame, "mute");
      ytCommand(frame, "playVideo");
    };
    kick();
    const retries = playing ? [250, 700, 1400].map((ms) => window.setTimeout(kick, ms)) : [];
    const pump = playing
      ? window.setInterval(() => {
          if (!playingRef.current || ended.current || userPaused.current || live.current) return;
          kick();
        }, 900)
      : 0;
    const iframe = iframeRef.current;
    iframe?.addEventListener("load", kick);
    const onMsg = (e: MessageEvent) => {
      if (ytGated(e.data, e.source, iframeRef.current)) {
        dropGatedYoutube(youtubeId);
        return;
      }
      if (ytEnded(e.data, e.source, iframeRef.current)) {
        if (playingRef.current) finish(true);
        return;
      }
      const info = ytInfo(e.data, e.source, iframeRef.current);
      if (!info && ytReady(e.data, e.source, iframeRef.current)) {
        kick();
        return;
      }
      if (!info) return;
      if (typeof info.currentTime === "number") {
        timeRef.current = info.currentTime;
        setTime(info.currentTime);
        onTimeRef.current?.(info.currentTime, durationRef.current);
      }
      if (typeof info.duration === "number" && info.duration > durationRef.current + 0.5) {
        durationRef.current = info.duration;
        durationHeld.current = Date.now();
        setDuration(info.duration);
        onTimeRef.current?.(timeRef.current, info.duration);
      }
      if (live.current && typeof info.playbackRate === "number" && Math.abs(info.playbackRate - 1) > 0.04) {
        ytCommand(iframeRef.current, "setPlaybackRate", [1]);
      }
      if (typeof info.state !== "number") return;
      stateRef.current = info.state;
      if (ended.current) return;
      if (info.state === 0) {
        if (playingRef.current) finish(true);
        return;
      }
      if (info.state === 1) {
        live.current = true;
        setPaused(false);
        setShown(true);
        setNeedsTap(false);
        if (!counted.current) {
          counted.current = true;
          notePlayback("started", performance.now() - armed.current);
          if (!silent && !wantMute()) notePlayback("sound");
        }
        window.setTimeout(() => {
          if (silent || wantMute()) {
            ytCommand(iframeRef.current, "mute");
            return;
          }
          if (!playingRef.current || userPaused.current) return;
          applySound(iframeRef.current);
        }, 200);
        return;
      }
      if (info.state === 3 && live.current) {
        setShown(true);
        return;
      }
      if (info.state === 2 && playingRef.current && !userPaused.current && !ended.current) {
        setPaused(false);
        if (!silent && !wantMute()) applySound(iframeRef.current);
        else ytCommand(iframeRef.current, "mute");
        ytCommand(iframeRef.current, "playVideo");
        return;
      }
      if (!playingRef.current || userPaused.current || silent) {
        if (silent) ytCommand(iframeRef.current, "mute");
        if (info.state === 2) setPaused(true);
        return;
      }
      if (!live.current || wantMute() || silent) {
        ytCommand(iframeRef.current, "mute");
      } else {
        applySound(iframeRef.current);
      }
      ytCommand(iframeRef.current, "playVideo");
    };
    window.addEventListener("message", onMsg);
    const clock = window.setInterval(() => {
      if (!playingRef.current || ended.current || userPaused.current || !live.current) return;
      ytCommand(iframeRef.current, "getCurrentTime");
      ytCommand(iframeRef.current, "getDuration");
      if (!silent && !wantMute()) applySound(iframeRef.current);
      if (atTheEnd(false)) finish(false);
    }, 1000);
    return () => {
      retries.forEach((t) => window.clearTimeout(t));
      if (pump) window.clearInterval(pump);
      window.clearInterval(clock);
      iframe?.removeEventListener("load", kick);
      window.removeEventListener("message", onMsg);
    };
  }, [playing, mount, gated, youtubeId, dropGatedYoutube, captions, silent, src]);

  useEffect(() => {
    if (!playing || ended.current) return;
    if (duration < 8 || time < 3) return;
    if (time < duration - 2) return;
    finish();
  }, [time, duration, playing]);

  useEffect(() => {
    if (silent || !playing) return;
    applySound(iframeRef.current);
    const timers = [200, 700, 1500].map((ms) => window.setTimeout(() => applySound(iframeRef.current), ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [muted, playing, soundUnlocked, silent]);

  useEffect(() => {
    if (!playing || start < 1) return;
    ytCommand(iframeRef.current, "seekTo", [Math.floor(start), true]);
  }, [start, playing]);

  useEffect(() => {
    if (!playing || seekAt == null || Number.isNaN(seekAt)) return;
    ytCommand(iframeRef.current, "seekTo", [seekAt, true]);
    timeRef.current = seekAt;
    setTime(seekAt);
  }, [seekAt, playing]);

  useEffect(() => {
    if (!playing || !isCoarsePointer()) return;
    const go = () => {
      if (ended.current || userPaused.current) return;
      begin(false);
    };
    go();
    const timers = [300, 800].map((ms) => window.setTimeout(go, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [playing, youtubeId]);

  function begin(fromTap: boolean) {
    const frame = iframeRef.current;
    userPaused.current = false;
    setPaused(false);
    setNeedsTap(false);
    if (fromTap) {
      markGesture();
      holdPlay(2200);
      notePlayback("tapped");
    }
    if (!frame) return;
    if (fromTap && !live.current && Date.now() - reloadedAt.current > 1600) {
      reloadedAt.current = Date.now();
      const glue = src.includes("?") ? "&" : "?";
      frame.src = `${src}${glue}_=${Date.now()}`;
      return;
    }
    ytListen(frame);
    ytCommand(frame, "mute");
    ytCommand(frame, "playVideo");
    if (fromTap && !silent && !wantMute()) {
      window.setTimeout(() => {
        if (userPaused.current) return;
        applySound(frame);
      }, 300);
    }
  }

  function seek(value: number) {
    ytCommand(iframeRef.current, "seekTo", [value, true]);
    setTime(value);
  }

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    return bindAutoplay(postId, node);
  }, [postId]);

  const poster = (
    <img
      src={posterUrl ?? youtubePoster(youtubeId)}
      srcSet={posterUrl ? undefined : youtubePosterSrcSet(youtubeId)}
      sizes={POSTER_SIZES}
      alt=""
      loading={playing ? "eager" : "lazy"}
      decoding="async"
    />
  );

  return (
    <div
      ref={stageRef}
      data-youtube={postId}
      {...(isolate ? { "data-lesson": "" } : {})}
      {...(shown ? { "data-live": "" } : {})}
      className={cn("yt-stage", fill && "min-h-0 h-full", className)}
    >
      {gated ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-elevated px-5">
          <p className="text-center text-sm text-muted">This film is not available here.</p>
        </div>
      ) : (
        <>
          <div className="yt-fit">
            {mount ? (
              <iframe
                key={youtubeId}
                ref={iframeRef}
                src={src}
                title="YouTube video"
                className="yt-touch"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="origin"
                tabIndex={-1}
                onLoad={() => setLoaded(true)}
              />
            ) : (
              poster
            )}
          </div>
          {!mount && !playing ? (
            <button type="button" onClick={onToggle} className="absolute inset-0 z-10">
              <span className="yt-fit">{poster}</span>
            </button>
          ) : null}
          {chrome && !silent ? <ClipDock time={time} duration={duration} onSeek={seek} /> : null}
        </>
      )}
    </div>
  );
}
