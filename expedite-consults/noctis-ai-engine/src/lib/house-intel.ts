import type { FeedPost } from "@/lib/feed-data";
import type { DayWatch } from "@/lib/shuffle";
import { studyHouse } from "@/lib/study-this";

export type HouseLink = { from: string; to: string; because: string };

export type HouseIntel = {
  stayed: string | null;
  minutes: number;
  open: FeedPost | null;
  links: HouseLink[];
  line: string;
};

export function houseIntel(posts: FeedPost[], watch: DayWatch, passed: Record<string, boolean>): HouseIntel {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const minutesByHouse: Record<string, number> = {};
  const seen: FeedPost[] = [];
  for (const id of watch.played ?? []) {
    const post = byId.get(id);
    if (!post) continue;
    seen.push(post);
    const house = studyHouse(post);
    const minutes = ((watch.dwell?.[id] ?? 0) + (watch.counts?.[id] ? 15_000 : 0)) / 60_000;
    minutesByHouse[house] = (minutesByHouse[house] ?? 0) + minutes;
  }
  let stayed: string | null = null;
  let minutes = 0;
  for (const [house, amount] of Object.entries(minutesByHouse)) {
    if (amount > minutes) {
      stayed = house;
      minutes = amount;
    }
  }
  const open =
    (stayed ? seen.find((post) => studyHouse(post) === stayed && !passed[post.id]) : null) ??
    posts.find((post) => !passed[post.id]) ??
    null;
  const links: HouseLink[] = [];
  if (stayed) {
    const pair = seen.filter((post) => studyHouse(post) === stayed);
    for (let i = 0; i < pair.length - 1 && links.length < 2; i++) {
      const from = pair[i]!;
      const to = pair[i + 1]!;
      if ((from.teach?.stamp ?? "") === (to.teach?.stamp ?? "")) continue;
      links.push({
        from: from.teach?.stamp || "Film",
        to: to.teach?.stamp || "Film",
        because: `Both are ${stayed}. You watched them.`,
      });
    }
  }
  const line = !stayed
    ? "Watch a film and take its check. The house learns from that. It does not guess, and it does not tell you what to believe."
    : open
      ? `You stayed with ${stayed}. The next practice is ${open.teach?.stamp || "this film"}. Practice is a skill, not a position.`
      : `You stayed with ${stayed}, and the checks in view are passed. Practice is a skill, not a position.`;
  return { stayed, minutes: Math.round(minutes * 10) / 10, open, links, line };
}
