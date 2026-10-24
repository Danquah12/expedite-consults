import { useEffect, useMemo, useState } from "react";
import { useFeedStore } from "@/lib/feed-store";
import { preziNeedsVoice, preziPlaySrc } from "@/lib/prezi";
import { speakClinic, stopClinicVoice } from "@/lib/clinic-voice";
import { cn } from "@/lib/utils";

export function PreziFrame({
  postId,
  embedUrl,
  posterUrl,
  playing,
  muted,
  voiceText,
  onToggle,
  className,
}: {
  postId: string;
  embedUrl: string;
  posterUrl?: string;
  playing: boolean;
  muted: boolean;
  voiceText?: string;
  onToggle: () => void;
  className?: string;
}) {
  const noteWatch = useFeedStore((s) => s.noteWatch);
  const src = useMemo(() => preziPlaySrc(embedUrl), [embedUrl]);
  const voice = preziNeedsVoice(embedUrl);
  const [held, setHeld] = useState(playing);

  useEffect(() => {
    if (playing) {
      setHeld(true);
      return;
    }
    const t = window.setTimeout(() => setHeld(false), 900);
    return () => window.clearTimeout(t);
  }, [playing]);

  useEffect(() => {
    if (playing) noteWatch(postId);
  }, [playing, postId, noteWatch]);

  useEffect(() => {
    if (!playing) {
      stopClinicVoice();
      return;
    }
    if (!voice || muted || !voiceText) {
      stopClinicVoice();
      return;
    }
    const t = window.setTimeout(() => speakClinic(voiceText), 500);
    return () => {
      window.clearTimeout(t);
      stopClinicVoice();
    };
  }, [playing, muted, voice, voiceText]);

  return (
    <div data-prezi={postId} className={cn("yt-stage", className)}>
      <div className="yt-fit">
      {held ? (
        <iframe
          src={src}
          title="Prezi"
          allow="autoplay; fullscreen; clipboard-write"
          allowFullScreen
          className="yt-touch"
        />
      ) : (
        <button type="button" onClick={onToggle} className="absolute inset-0">
          {posterUrl ? (
            <img src={posterUrl} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
          ) : (
            <span className="absolute inset-0 bg-elevated" />
          )}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-fg">
            Play Prezi
          </span>
        </button>
      )}
      </div>
    </div>
  );
}
