import { useEffect, useRef, useState } from "react";
import { pauseAllYoutube } from "@/lib/youtube";
import { pauseAllVimeo, vimeoCommand, vimeoEmbedSrc, vimeoEvent } from "@/lib/vimeo";
import { useFeedStore } from "@/lib/feed-store";
import { ClipDock } from "@/components/feed/ClipDock";
import { wantMute } from "@/lib/playback";
import { cn } from "@/lib/utils";

export function VimeoFrame({
  postId,
  vimeoId,
  posterUrl,
  playing,
  muted,
  onToggle,
  onEnded,
  onTime,
  seekAt = null,
  chrome = true,
  className,
}: {
  postId: string;
  vimeoId: string;
  posterUrl?: string;
  playing: boolean;
  muted: boolean;
  onToggle: () => void;
  onEnded?: () => void;
  onTime?: (time: number, duration: number) => void;
  seekAt?: number | null;
  chrome?: boolean;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const noteWatch = useFeedStore((s) => s.noteWatch);
  const ended = useRef(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;
  const durationRef = useRef(0);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (playing) {
      ended.current = false;
      noteWatch(postId);
    }
  }, [playing, postId, noteWatch]);

  useEffect(() => {
    if (!playing) {
      ended.current = false;
      setPaused(true);
      vimeoCommand(iframeRef.current, "pause");
      vimeoCommand(iframeRef.current, "setVolume", 0);
      return;
    }
    const kick = () => {
      const frame = iframeRef.current;
      if (!frame || ended.current) return;
      if (playingRef.current) {
        vimeoCommand(frame, "setPlaybackRate", 1);
        vimeoCommand(frame, "play");
        vimeoCommand(frame, "setVolume", wantMute() ? 0 : 1);
      } else {
        vimeoCommand(frame, "pause");
        vimeoCommand(frame, "setVolume", 0);
      }
      vimeoCommand(frame, "addEventListener", "play");
      vimeoCommand(frame, "addEventListener", "pause");
      vimeoCommand(frame, "addEventListener", "ended");
      vimeoCommand(frame, "addEventListener", "timeupdate");
      vimeoCommand(frame, "addEventListener", "error");
    };
    if (playing) {
      pauseAllYoutube();
      pauseAllVimeo(iframeRef.current);
    }
    const retries = playing ? [400, 1200].map((ms) => window.setTimeout(kick, ms)) : [];
    const iframe = iframeRef.current;
    iframe?.addEventListener("load", kick);
    kick();
    const onMsg = (e: MessageEvent) => {
      const info = vimeoEvent(e.data, e.source, iframeRef.current);
      if (!info?.event) return;
      if (info.event === "ended" || info.event === "finish") {
        if (ended.current) return;
        ended.current = true;
        setPaused(true);
        onEnded?.();
        return;
      }
      if (info.event === "play") {
        setPaused(false);
        if (!wantMute()) vimeoCommand(iframeRef.current, "setVolume", 1);
      }
      if (info.event === "pause") setPaused(true);
      if (typeof info.seconds === "number") {
        timeRef.current = info.seconds;
        setTime(info.seconds);
        onTimeRef.current?.(info.seconds, durationRef.current);
      }
      if (typeof info.duration === "number" && info.duration > 0) {
        durationRef.current = info.duration;
        setDuration(info.duration);
        onTimeRef.current?.(timeRef.current, info.duration);
      }
      if (info.event === "error") {
        ended.current = true;
        setPaused(true);
      }
    };
    window.addEventListener("message", onMsg);
    return () => {
      retries.forEach((t) => window.clearTimeout(t));
      iframe?.removeEventListener("load", kick);
      window.removeEventListener("message", onMsg);
      if (!playingRef.current) vimeoCommand(iframe, "pause");
    };
  }, [playing, onEnded]);

  useEffect(() => {
    if (!playing) return;
    vimeoCommand(iframeRef.current, "setVolume", muted || wantMute() ? 0 : 1);
  }, [muted, playing]);

  useEffect(() => {
    if (!playing || seekAt == null || Number.isNaN(seekAt)) return;
    vimeoCommand(iframeRef.current, "setCurrentTime", seekAt);
    timeRef.current = seekAt;
    setTime(seekAt);
  }, [seekAt, playing]);

  function seek(value: number) {
    vimeoCommand(iframeRef.current, "setCurrentTime", value);
    setTime(value);
  }

  return (
    <div
      data-vimeo={postId}
      className={cn("yt-stage", chrome ? undefined : "min-h-0 h-full", className)}
    >
      {playing ? (
        <>
          <div className="yt-fit">
            <iframe
              key={vimeoId}
              ref={iframeRef}
              src={vimeoEmbedSrc(vimeoId, { autoplay: true, mute: true })}
              title="Vimeo video"
              className="yt-touch"
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
          </div>
          {playing && chrome ? <ClipDock time={time} duration={duration} onSeek={seek} /> : null}
        </>
      ) : (
        <button type="button" onClick={onToggle} className="absolute inset-0">
          <span className="yt-fit">
            {posterUrl ? <img src={posterUrl} alt="" loading="lazy" decoding="async" /> : <span className="block h-full bg-elevated" />}
          </span>
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-fg">
            Play
          </span>
          {chrome ? <ClipDock /> : null}
        </button>
      )}
    </div>
  );
}
