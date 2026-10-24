import { useEffect } from "react";
import { engageFocused, markGesture, wakeSound } from "@/lib/playback";

export function SoundUnlock() {
  useEffect(() => {
    let last = 0;
    const onGesture = () => {
      markGesture();
      wakeSound();
      engageFocused();
    };
    const onMove = () => {
      const now = Date.now();
      if (now - last < 80) return;
      last = now;
      engageFocused();
    };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", onGesture, opts);
    window.addEventListener("pointerup", onGesture, opts);
    window.addEventListener("touchstart", onGesture, opts);
    window.addEventListener("touchend", onGesture, opts);
    window.addEventListener("touchmove", onMove, opts);
    window.addEventListener("scroll", onMove, opts);
    window.addEventListener("wheel", onMove, opts);
    window.addEventListener("click", onGesture, opts);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture, opts);
      window.removeEventListener("pointerup", onGesture, opts);
      window.removeEventListener("touchstart", onGesture, opts);
      window.removeEventListener("touchend", onGesture, opts);
      window.removeEventListener("touchmove", onMove, opts);
      window.removeEventListener("scroll", onMove, opts);
      window.removeEventListener("wheel", onMove, opts);
      window.removeEventListener("click", onGesture, opts);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);
  return null;
}
