import type { FeedPost } from "@/lib/feed-data";
import { CLINIC_DESKS, postDesk } from "@/lib/ingest-sources";
import { dealFeed, type DayWatch } from "@/lib/shuffle";
import { onTab } from "@/lib/tab-split";
import { LANE_LABEL, type VibeMix } from "@/lib/noctis";

export const WAVE_PULLS = [
  { name: "Newest ledger videos", pull: 3 },
  { name: "Standing library", pull: 2 },
  { name: "Previous ledger pull", pull: 1 },
  { name: "Older ledger videos", pull: 1 },
];

export function lanePulls(mix: VibeMix) {
  return (["learn", "laugh", "local"] as const).map((lane) => ({
    name: LANE_LABEL[lane],
    share: mix[lane] ?? 0,
    pull: Math.max(1, Math.round((mix[lane] ?? 0) / 22)),
  }));
}

function deskName(id: string) {
  return CLINIC_DESKS.find((row) => row.id === id)?.label ?? id;
}

export function diversityOf(posts: FeedPost[], mix: VibeMix, seed: number, watch: DayWatch, waveIds: string[], priorIds: string[]) {
  const ordered = dealFeed(onTab(posts, "clinic"), mix, seed, watch, waveIds, priorIds);
  const next = ordered.filter((post) => !post.id.startsWith("u-")).slice(0, 12);
  const desks = next.map((post) => postDesk(post));
  const counts = new Map<string, number>();
  for (const desk of desks) counts.set(desk, (counts.get(desk) ?? 0) + 1);
  let topId = "";
  let top = 0;
  for (const [id, n] of counts) {
    if (n > top) {
      top = n;
      topId = id;
    }
  }
  let runs = 0;
  for (let i = 1; i < desks.length; i++) {
    if (desks[i] === desks[i - 1]) runs += 1;
  }
  const played = next.filter((post) => (watch.played ?? []).includes(post.id)).length;
  const unique = counts.size;
  const narrow = next.length > 0 && top / next.length > 0.5;
  const mixed = next.length > 0 && unique >= 4 && !narrow && runs <= 3;
  const note = next.length === 0
    ? "No clinic videos are queued."
    : mixed
      ? "The next videos are mixed across subjects."
      : narrow
        ? "One subject is taking most of the next videos because you have stayed with it."
        : "A few subjects repeat. A less-tried subject is still in the mix.";
  return {
    count: next.length,
    unique,
    top: topId ? deskName(topId) : "",
    topCount: top,
    runs,
    played,
    note,
  };
}
