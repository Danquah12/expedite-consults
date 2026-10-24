import type { VibeMix } from "@/lib/noctis";
import type { FeedPost } from "@/lib/feed-data";

export const SPARK_LIMIT = 2;

export function composeMix(mix: VibeMix, posts: FeedPost[]) {
  const scored = posts.map((p) => ({ p, s: mix[p.lane] + (p.views % 17) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.map((x) => x.p);
}

export function pickClinic(posts: FeedPost[], passed: Record<string, boolean>) {
  return posts.find((p) => p.lane === "learn" && !passed[p.id]) ?? posts.find((p) => p.lane === "learn");
}

export function injectClinic(posts: FeedPost[], clinic: FeedPost | undefined) {
  if (!clinic) return posts;
  const rest = posts.filter((p) => p.id !== clinic.id);
  if (rest.length < 3) return [clinic, ...rest];
  return [rest[0], rest[1], clinic, ...rest.slice(2)];
}
