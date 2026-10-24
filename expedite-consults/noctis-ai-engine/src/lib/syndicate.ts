import { FOCUS_POST, nextInOrder } from "@/lib/feed-virtual";
import { holdPlay, kickFocusedPlay, skipFocusUntil } from "@/lib/playback";
import { useFeedStore } from "@/lib/feed-store";

export { SOURCE, SOURCE_HREF } from "@/lib/source";

let userMovedAt = 0;
let moveArmed = false;

function armUserMove() {
  if (moveArmed || typeof window === "undefined") return;
  moveArmed = true;
  const mark = () => {
    userMovedAt = Date.now();
  };
  window.addEventListener("wheel", mark, { passive: true });
  window.addEventListener("touchmove", mark, { passive: true });
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp" || ev.key === "PageDown" || ev.key === "PageUp" || ev.key === " ") mark();
  });
}

/** A click in the notes under a film is reading, not a request to jump back up. */
export function holdReading() {
  userMovedAt = Date.now();
}

export function nextFeedId(fromId: string) {
  const nodes = [...document.querySelectorAll<HTMLElement>("article[id^='post-']")];
  const i = nodes.findIndex((n) => n.id === `post-${fromId}`);
  if (i >= 0) {
    for (let n = i + 1; n < nodes.length; n++) {
      const id = nodes[n]!.id.replace(/^post-/, "");
      if (id && id !== fromId) return id;
    }
  }
  const listed = nextInOrder(fromId);
  if (listed && listed !== fromId && document.getElementById(`post-${listed}`)) return listed;
  return null;
}

export function scrollToFeed(id: string) {
  window.dispatchEvent(new CustomEvent(FOCUS_POST, { detail: id }));
  window.setTimeout(() => {
    document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 40);
}

function headerClearance() {
  const header = document.querySelector("header");
  return Math.ceil((header?.getBoundingClientRect().height ?? 0) + 8);
}

/** Put the film under the header, not behind it and not down the page. */
export function liftIntoView(el: HTMLElement | null) {
  if (!el) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const gap = headerClearance();
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight + 12) {
      const delta = el.getBoundingClientRect().top - parent.getBoundingClientRect().top - 8;
      parent.scrollTo({ top: Math.max(0, parent.scrollTop + delta), behavior: "smooth" });
    }
    parent = parent.parentElement;
  }
  const y = el.getBoundingClientRect().top + window.scrollY - gap;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

export function scrollClipToTop(id: string) {
  const safe = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id.replace(/"/g, "");
  const el =
    document.getElementById(`post-${id}`) ??
    document.querySelector<HTMLElement>(`[data-reel="${safe}"]`) ??
    document.querySelector<HTMLElement>(`[data-lesson-film="${safe}"]`) ??
    document.querySelector<HTMLElement>(`[data-clip="${safe}"]`) ??
    document.querySelector<HTMLElement>(`[data-youtube="${safe}"]`) ??
    document.querySelector<HTMLElement>(`[data-youtube="lesson-${safe}"]`) ??
    document.querySelector<HTMLElement>(".clinic-stage, [data-hall-stage], article[id^='post-'], [data-lesson-film]");
  liftIntoView(el);
}

/** Clinic: the clip that just started should be on screen. Skip if the person is already scrolling. */
export function revealPlayingClip(id: string) {
  armUserMove();
  if (Date.now() - userMovedAt < 900) return;
  const el = document.getElementById(`post-${id}`);
  if (el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (vis > Math.min(r.height, vh) * 0.62 && r.top < 160 && r.top > -24) return;
  }
  holdPlay(1600);
  window.dispatchEvent(new CustomEvent(FOCUS_POST, { detail: id }));
  scrollClipToTop(id);
  window.setTimeout(() => scrollClipToTop(id), 280);
}

function pageClipIds() {
  const ids: string[] = [];
  document.querySelectorAll<HTMLElement>("article[id^='post-']").forEach((node) => {
    const id = node.id.replace(/^post-/, "");
    if (id) ids.push(id);
  });
  document.querySelectorAll<HTMLElement>("article[data-lesson-film]").forEach((node) => {
    const id = node.dataset.lessonFilm;
    if (id) ids.push(`lesson-${id}`);
  });
  return ids;
}

export function advanceClinic(fromId: string) {
  const ids = pageClipIds();
  const at = ids.indexOf(fromId);
  const next = (at >= 0 ? ids[at + 1] : undefined) ?? ids.find((id) => id !== fromId);
  if (!next) return null;
  skipFocusUntil(fromId, 14_000);
  holdPlay(1600);
  const st = useFeedStore.getState();
  st.closePip();
  st.setPlayingId(next);
  const scrollId = next.startsWith("lesson-") ? next.slice("lesson-".length) : next;
  scrollClipToTop(scrollId);
  window.setTimeout(() => scrollClipToTop(scrollId), 80);
  window.setTimeout(() => kickFocusedPlay(), 450);
  window.setTimeout(() => kickFocusedPlay(), 1100);
  window.dispatchEvent(new CustomEvent("clip:permute", { detail: { fromId, next } }));
  return next;
}

export function nextReelId(fromId: string) {
  const nodes = [...document.querySelectorAll<HTMLElement>("[data-reel]")];
  const i = nodes.findIndex((n) => n.dataset.reel === fromId);
  return nodes[i + 1]?.dataset.reel ?? nodes[0]?.dataset.reel ?? null;
}

export function scrollToReel(id: string) {
  const slide = document.querySelector<HTMLElement>(`[data-reel="${id}"]`);
  const picture = slide?.querySelector<HTMLElement>(".reel-picture") ?? slide;
  const scroller = picture?.closest(".reel-scroller");
  if (!picture || !(scroller instanceof HTMLElement)) {
    picture?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const top = picture.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 10;
  scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function focusedReel(root: HTMLElement) {
  const line = root.getBoundingClientRect().top + 72;
  let id: string | null = null;
  root.querySelectorAll<HTMLElement>("[data-reel]").forEach((slide) => {
    if (slide.getBoundingClientRect().top <= line) id = slide.getAttribute("data-reel");
  });
  return id;
}
