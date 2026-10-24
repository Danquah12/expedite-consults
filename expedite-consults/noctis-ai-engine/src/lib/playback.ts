import { useEffect, useState } from "react";
import { ytCommand } from "@/lib/youtube";
import { vimeoCommand } from "@/lib/vimeo";
import { useFeedStore } from "@/lib/feed-store";

let playHold = 0;
let meeting = 0;
export function holdPlay(ms = 1400) {
  playHold = Date.now() + ms;
}
export function playHeld() {
  return Date.now() < playHold;
}
export function meetingHeld() {
  return meeting > 0;
}
export function silenceStage() {
  document.querySelectorAll<HTMLIFrameElement>("iframe").forEach((frame) => {
    if (frame.closest("[data-meeting]")) return;
    ytCommand(frame, "pauseVideo");
    ytCommand(frame, "mute");
    vimeoCommand(frame, "pause");
    vimeoCommand(frame, "setVolume", 0);
  });
  document.querySelectorAll<HTMLMediaElement>("video, audio").forEach((node) => {
    if (node.closest("[data-meeting]")) return;
    node.pause();
    node.muted = true;
  });
}
export function holdMeeting(on: boolean) {
  meeting += on ? 1 : -1;
  if (meeting < 0) meeting = 0;
  if (!on) return;
  const st = useFeedStore.getState();
  st.setPlayingId(null);
  st.closePip();
  silenceStage();
}

const skipFocus = new Set<string>();
export function skipFocusUntil(id: string, ms = 12_000) {
  skipFocus.add(id);
  if (typeof window !== "undefined") {
    window.setTimeout(() => skipFocus.delete(id), ms);
  }
}
export function focusSkipped(id: string) {
  return skipFocus.has(id);
}

let gestureAt = 0;
let audioGranted = false;
const ARM_KEY = "vibetok-start";
export function markGesture() {
  gestureAt = Date.now();
  audioGranted = true;
}
export function armClinicPlay() {
  markGesture();
  try {
    sessionStorage.setItem(ARM_KEY, "1");
  } catch {
    /* private mode */
  }
}
export function clinicArmed() {
  try {
    return sessionStorage.getItem(ARM_KEY) === "1";
  } catch {
    return false;
  }
}
export function clearClinicArm() {
  try {
    sessionStorage.removeItem(ARM_KEY);
  } catch {
    /* private mode */
  }
}
export function gestureFresh() {
  return Date.now() - gestureAt < 900;
}
export function audioAllowed() {
  return audioGranted;
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
}

export function wantMute() {
  return useFeedStore.getState().isMuted;
}

export function observeFocus(
  nodes: HTMLElement[],
  getId: (el: HTMLElement) => string | null,
  onFocus: (id: string | null) => void,
  opts?: { root?: Element | null; min?: number; rootMargin?: string },
) {
  const ratios = new Map<string, number>();
  const seen = new Map<string, HTMLElement>();
  let current: string | null = null;
  const pick = () => {
    const vh = window.innerHeight || 1;
    const target = vh * (isCoarsePointer() ? 0.38 : 0.4);
    let best: string | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const [id, el] of seen) {
      const box = el.getBoundingClientRect();
      if (box.height < 24) continue;
      const visible = Math.min(box.bottom, vh) - Math.max(box.top, 0);
      if (visible < 8) continue;
      const ratio = Math.max(ratios.get(id) ?? 0, visible / Math.max(box.height, 1));
      if (ratio < 0.04) continue;
      const mid = (box.top + box.bottom) / 2;
      const dist = Math.abs(mid - target) / vh;
      const score = ratio * 0.25 - dist;
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    if (best === current) return;
    current = best;
    onFocus(best);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const id = getId(el);
        if (!id) continue;
        seen.set(id, el);
        ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      pick();
    },
    {
      root: opts?.root ?? null,
      threshold: [0, 0.06, 0.12, 0.2, 0.35, 0.5, 0.7, 0.9, 1],
      rootMargin: opts?.rootMargin ?? (isCoarsePointer() ? "-6% 0px -28% 0px" : "-10% 0px -35% 0px"),
    },
  );
  nodes.forEach((n) => {
    const id = getId(n);
    if (id) seen.set(id, n);
    io.observe(n);
  });
  pick();
  return () => io.disconnect();
}

export function clipNodes() {
  return [...document.querySelectorAll<HTMLElement>("[data-clip], [data-youtube], [data-prezi], article[id^='post-'] video, article[id^='post-'] audio")].filter(
    (el) => !el.hasAttribute("data-story-still") && !el.closest("[data-pip]") && !el.closest("[data-lesson-film]"),
  );
}

export function useClipFocus(sel: string, attr: string, seed = "") {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>(sel)];
    if (!nodes.length) return;
    return observeFocus(
      nodes,
      (el) => el.getAttribute(attr),
      (next) => {
        if (next) setId(next);
      },
      { min: 0.32, rootMargin: "-12% 0px -38% 0px" },
    );
  }, [sel, attr, seed]);
  return id;
}

export function clipIdOf(el: HTMLElement) {
  return (
    el.closest("article")?.id.replace(/^post-/, "") ||
    el.getAttribute("data-youtube") ||
    el.getAttribute("data-prezi") ||
    null
  );
}

export function pickVisiblePost() {
  const articles = [...document.querySelectorAll<HTMLElement>("article[id^='post-']")];
  if (!articles.length) return null;
  const vh = window.innerHeight || 1;
  const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  const hall = document.querySelector(".phone-hall")?.getBoundingClientRect().bottom ?? header;
  const target = Math.min(vh * 0.42, Math.max(hall + 48, vh * 0.32));
  let best: string | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const el of articles) {
    const media = el.querySelector<HTMLElement>("[data-clip], [data-youtube], video, audio, [data-prezi]");
    if (!media) continue;
    const r = media.getBoundingClientRect();
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (vis < 40) continue;
    const mid = (r.top + r.bottom) / 2;
    const score = vis / Math.max(r.height, 1) - Math.abs(mid - target) / vh;
    if (score > bestScore) {
      bestScore = score;
      best = el.id.replace(/^post-/, "") || null;
    }
  }
  return best ?? articles[0]?.id.replace(/^post-/, "") ?? null;
}

export function pickLaneClip() {
  const lane = document.querySelector("[data-feed-lane]");
  if (!lane) return pickVisiblePost();
  const box = lane.getBoundingClientRect();
  if (box.height < 40) return pickVisiblePost();

  if (lane.scrollTop < 32) {
    const first = lane.querySelector<HTMLElement>("article[id^='post-']");
    const id = first?.id.replace(/^post-/, "") || null;
    if (id) return id;
  }

  const hits: { id: string; vis: number; top: number }[] = [];
  for (const el of lane.querySelectorAll<HTMLElement>("article[id^='post-']")) {
    const media = el.querySelector<HTMLElement>("[data-clip], [data-youtube], video, audio, [data-prezi]");
    if (!media) continue;
    const r = media.getBoundingClientRect();
    const vis = Math.min(r.bottom, box.bottom) - Math.max(r.top, box.top);
    if (vis < 72) continue;
    const id = el.id.replace(/^post-/, "");
    if (!id) continue;
    hits.push({ id, vis, top: r.top });
  }
  if (!hits.length) return pickVisiblePost();
  hits.sort((a, b) => b.vis - a.vis || a.top - b.top);
  return hits[0]!.id;
}

const kickedAt = new WeakMap<HTMLIFrameElement, number>();

const autoplayNodes = new Map<string, HTMLElement>();
let autoplayIo: IntersectionObserver | null = null;
let autoplayRaf = 0;

function chooseInView() {
  if (meetingHeld()) return;
  if (playHeld()) return;
  const st = useFeedStore.getState();
  if (st.modal.type === "story" || st.modal.type === "live") return;
  if (st.pipId) return;
  const vh = window.innerHeight || 1;
  let bestId: string | null = null;
  let best = 0;
  for (const [id, node] of autoplayNodes) {
    if (!node.isConnected) continue;
    if (node.closest("[data-pip]")) continue;
    const box = node.getBoundingClientRect();
    const vis = Math.min(box.bottom, vh) - Math.max(box.top, 0);
    if (vis < 160) continue;
    if (vis > best) {
      best = vis;
      bestId = id;
    }
  }
  if (!bestId || st.playingId === bestId) return;
  st.setPlayingId(bestId);
  window.setTimeout(() => kickFocusedPlay(), 60);
  window.setTimeout(() => kickFocusedPlay(), 400);
}

function ensureAutoplay() {
  if (autoplayIo || typeof IntersectionObserver === "undefined") return;
  autoplayIo = new IntersectionObserver(
    () => {
      if (autoplayRaf) return;
      autoplayRaf = window.requestAnimationFrame(() => {
        autoplayRaf = 0;
        chooseInView();
      });
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
}

export function bindAutoplay(id: string, node: HTMLElement) {
  ensureAutoplay();
  autoplayNodes.set(id, node);
  autoplayIo?.observe(node);
  chooseInView();
  return () => {
    autoplayIo?.unobserve(node);
    if (autoplayNodes.get(id) === node) autoplayNodes.delete(id);
  };
}

export function kickFocusedPlay() {
  if (meetingHeld()) {
    silenceStage();
    return;
  }
  const st = useFeedStore.getState();
  const id = st.playingId ?? st.pipId;
  if (!id) return;
  const mute = wantMute();
  const roots: Element[] = [];
  const post = document.getElementById(`post-${id}`);
  if (post) roots.push(post);
  const reel = document.querySelector(`[data-reel="${id}"]`);
  if (reel) roots.push(reel);
  document.querySelectorAll(`[data-youtube="${id}"]`).forEach((n) => roots.push(n));
  const pip = document.querySelector("[data-pip]");
  if (pip) roots.push(pip);

  for (const root of roots) {
    const live = Boolean(root.closest("[data-live]") || root.querySelector("[data-live]"));
    root.querySelectorAll("iframe").forEach((frame) => {
      const started = live || frame.closest("[data-live]");
      if (!started) {
        const last = kickedAt.get(frame) ?? 0;
        if (Date.now() - last < 700) return;
        kickedAt.set(frame, Date.now());
        ytCommand(frame, "mute");
        ytCommand(frame, "playVideo");
        vimeoCommand(frame, "play");
        if (!mute) {
          window.setTimeout(() => {
            ytCommand(frame, "unMute");
            ytCommand(frame, "setVolume", [100]);
            vimeoCommand(frame, "setVolume", 1);
          }, 600);
        }
        return;
      }
      if (mute) {
        ytCommand(frame, "mute");
        vimeoCommand(frame, "setVolume", 0);
      } else {
        ytCommand(frame, "unMute");
        ytCommand(frame, "setVolume", [100]);
        vimeoCommand(frame, "setVolume", 1);
      }
    });
    root.querySelectorAll<HTMLMediaElement>("video, audio").forEach((el) => {
      if (el.hasAttribute("data-story-still")) return;
      el.playbackRate = 1;
      el.volume = 1;
      el.muted = mute;
      if (!el.paused) return;
      void el.play().catch(() => {
        el.muted = true;
        void el.play().then(() => {
          if (!wantMute()) el.muted = false;
        }).catch(() => undefined);
      });
    });
  }
}

export function engageFocused() {
  if (meetingHeld()) {
    silenceStage();
    return;
  }
  const st = useFeedStore.getState();
  if (!st.playingId && !st.pipId) {
    const id = pickLaneClip() ?? pickVisiblePost();
    if (id) st.setPlayingId(id);
  }
  kickFocusedPlay();
  window.setTimeout(() => kickFocusedPlay(), 400);
}

export function wakeSound() {
  markGesture();
  const store = useFeedStore.getState();
  if (!store.soundUnlocked) store.unlockSound();
  engageFocused();
}
