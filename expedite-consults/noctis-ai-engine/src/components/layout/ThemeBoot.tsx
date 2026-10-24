import { useEffect } from "react";
import { readTheme, useTheme } from "@/lib/theme";

export function ThemeBoot() {
  const setTheme = useTheme((s) => s.setTheme);
  useEffect(() => {
    setTheme(readTheme());
  }, [setTheme]);
  useEffect(() => {
    const root = document.documentElement;
    const mark = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      root.dataset.pointer = coarse ? "coarse" : "fine";
      root.classList.toggle("touch-device", coarse);
    };
    mark();
    const apply = () => {
      if (document.documentElement.dataset.sheet === "1") return;
      const box = window.visualViewport;
      const h = box?.height ?? window.innerHeight;
      root.style.setProperty("--app-vh", `${Math.round(h)}px`);
    };
    apply();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener?.("change", mark);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    try {
      window.screen?.orientation?.unlock?.();
    } catch {
      /* some webviews block unlock */
    }
    return () => {
      mq.removeEventListener?.("change", mark);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);
  return null;
}
