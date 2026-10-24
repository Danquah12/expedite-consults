import type { FeedPost } from "@/lib/feed-data";
import { tabOf, type AppTab } from "@/lib/tab-split";
import { youtubeIdOf, youtubePoster } from "@/lib/youtube";
import { TICKETS, careerOf, type HallCard, type HallId } from "@/lib/hall";

const TABS: AppTab[] = ["clinic", "hub", "study", "music", "reels", "market", "tickets", "career", "crews"];
const TAB_LABEL: Record<AppTab, string> = {
  clinic: "Clinic",
  hub: "Hub",
  study: "Study",
  music: "Music",
  reels: "Reels",
  market: "Market",
  tickets: "Tickets",
  career: "Career",
  crews: "Knowledge",
};
const PER_TAB = 8;

function heat(post: FeedPost) {
  const words = post.caption.trim().split(/\s+/).filter(Boolean).length;
  return post.views + post.likes * 20 + post.comments * 40 + post.shares * 25 + (words >= 8 ? 500 : 0);
}

function line(post: FeedPost) {
  const text = post.caption.replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 87)}…` : text || post.teach?.hook || "Film";
}

/** Hottest unique films from every hall tab. One copy of each video. */
export function liveHallCards(posts: FeedPost[], hall: HallId = "all"): HallCard[] {
  const seen = new Set<string>();
  const buckets = new Map<AppTab, FeedPost[]>();
  for (const tab of TABS) buckets.set(tab, []);
  const ranked = [...posts].filter((post) => post.author && post.teach && (post.mediaType === "video" || youtubeIdOf(post))).sort((a, b) => heat(b) - heat(a));
  for (const post of ranked) {
    const key = youtubeIdOf(post) || post.mediaUrl;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const tab = tabOf(post);
    const bag = buckets.get(tab);
    if (!bag || bag.length >= PER_TAB) continue;
    bag.push(post);
  }
  const picked: { tab: AppTab; post: FeedPost }[] = [];
  for (let i = 0; i < PER_TAB; i++) {
    for (const tab of TABS) {
      const post = buckets.get(tab)?.[i];
      if (post) picked.push({ tab, post });
    }
  }
  const cards = picked.flatMap(({ tab, post }) => {
    const ticketId = careerOf(post);
    const ticket = TICKETS.find((row) => row.id === ticketId);
    if (!ticket) return [];
    const yt = youtubeIdOf(post);
    return [{
      id: `hall-${post.id}`,
      hall: ticket.hall,
      ticket: ticket.id,
      title: line(post),
      mentor: post.author.name,
      shift: TAB_LABEL[tab],
      mediaType: yt ? "image" as const : post.mediaType === "image" ? "image" as const : "video" as const,
      mediaUrl: yt ? youtubePoster(yt) : post.mediaUrl,
      posterUrl: yt ? youtubePoster(yt) : post.posterUrl,
      postId: post.id,
      badge: ticket.label,
      post,
    } satisfies HallCard];
  });
  if (hall === "all") return cards;
  const narrowed = cards.filter((card) => card.hall === hall);
  return narrowed.length ? narrowed : cards;
}
