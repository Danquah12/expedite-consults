import type { FeedPost } from "@/lib/feed-data";

export const FOCUS_POST = "clinic:focus-post";
const OVERSCAN = 3;

function overscan() {
  if (typeof window === "undefined") return OVERSCAN;
  return window.innerWidth < 768 ? 1 : OVERSCAN;
}

export function feedLane() {
  return document.querySelector<HTMLElement>("[data-feed-lane]");
}

let order: string[] = [];

export function setFeedOrder(ids: string[]) {
  order = ids;
}

export function estimateHeight(post: Pick<FeedPost, "mediaType">) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 390;
  const well = Math.min(vw, 920);
  const media = Math.round(Math.min(well * 0.92, 860) * (9 / 16)) + 20;
  if (post.mediaType === "audio") return media + 180;
  if (post.mediaType === "image") return media + 220;
  return media + 260;
}

export function prefixHeights(posts: Pick<FeedPost, "id" | "mediaType">[], measured: Record<string, number>) {
  const off = new Array<number>(posts.length + 1);
  off[0] = 0;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]!;
    off[i + 1] = off[i]! + (measured[post.id] ?? estimateHeight(post));
  }
  return off;
}

export function visibleRange(off: number[], startY: number, endY: number) {
  const n = off.length - 1;
  if (n <= 0) return { start: 0, end: 0 };
  let start = 0;
  let hi = n - 1;
  while (start < hi) {
    const mid = (start + hi) >> 1;
    if ((off[mid + 1] ?? 0) < startY) start = mid + 1;
    else hi = mid;
  }
  let end = start;
  while (end < n && (off[end] ?? 0) < endY) end += 1;
  const pad = overscan();
  return {
    start: Math.max(0, start - pad),
    end: Math.min(n, end + pad),
  };
}

export function nextInOrder(fromId: string) {
  if (order.length < 2) return null;
  const i = order.indexOf(fromId);
  if (i < 0) return order[0] ?? null;
  return order[(i + 1) % order.length] ?? null;
}

export function prevInOrder(fromId: string) {
  if (order.length < 2) return null;
  const i = order.indexOf(fromId);
  if (i < 0) return order[0] ?? null;
  return order[(i - 1 + order.length) % order.length] ?? null;
}
