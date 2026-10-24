import { useEffect, useRef, useState } from "react";

export const JAZZ_TUNES = [
  { src: "/media/jazz/kool-kats.mp3", title: "Kool Kats", by: "Kevin MacLeod" },
  { src: "/media/jazz/lobby-time.mp3", title: "Lobby Time", by: "Kevin MacLeod" },
  { src: "/media/jazz/george-street.mp3", title: "George Street Shuffle", by: "Kevin MacLeod" },
  { src: "/media/jazz/jazz-brunch.mp3", title: "Jazz Brunch", by: "Kevin MacLeod" },
  { src: "/media/jazz/backed-vibes.mp3", title: "Backed Vibes", by: "Kevin MacLeod" },
  { src: "/media/jazz/hot-swing.mp3", title: "Hot Swing", by: "Kevin MacLeod" },
  { src: "/media/jazz/smooth-lovin.mp3", title: "Smooth Lovin", by: "Kevin MacLeod" },
  { src: "/media/jazz/knew-a-guy.mp3", title: "I Knew a Guy", by: "Kevin MacLeod" },
  { src: "/media/jazz/blue-feather.mp3", title: "Blue Feather", by: "Kevin MacLeod" },
  { src: "/media/jazz/covert-affair.mp3", title: "Covert Affair", by: "Kevin MacLeod" },
] as const;

export function stopJazzBed() {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLAudioElement>("audio[data-jazz]").forEach((el) => {
    el.pause();
    el.src = "";
  });
}
const TUNE_MS = 30_000;

/** `paused` holds the music, for a call or a recording. */
export function useJazzBed(paused: boolean) {
  const [i, setI] = useState(0);
  const [music, setMusic] = useState(true);
  const bed = useRef<HTMLAudioElement>(null);
  const alive = useRef(true);
  const tune = JAZZ_TUNES[i % JAZZ_TUNES.length] ?? JAZZ_TUNES[0];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopJazzBed();
    };
  }, []);

  useEffect(() => {
    if (!music || paused) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % JAZZ_TUNES.length), TUNE_MS);
    return () => window.clearTimeout(t);
  }, [music, paused, i]);

  useEffect(() => {
    const el = bed.current;
    if (!el) return;
    el.volume = 0.3;
    const next = new URL(tune.src, window.location.origin).href;
    if (el.src !== next) {
      el.src = tune.src;
      try {
        el.currentTime = 0;
      } catch {
        /* not ready */
      }
    }
    if (!music || paused) {
      el.pause();
      return;
    }
    void el.play().then(() => {
      if (alive.current) return;
      el.pause();
      el.src = "";
    }).catch(() => undefined);
  }, [music, paused, tune.src]);

  useEffect(() => {
    const unlock = () => {
      const el = bed.current;
      if (!el || !music || paused || !alive.current) return;
      void el.play().then(() => {
        if (alive.current) return;
        el.pause();
        el.src = "";
      }).catch(() => undefined);
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, [music, paused]);

  return { bed, tune, music, setMusic };
}
