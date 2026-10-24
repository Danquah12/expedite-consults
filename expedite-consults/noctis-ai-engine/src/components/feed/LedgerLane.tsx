import { useEffect, useMemo, useRef, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import { useFeedStore } from "@/lib/feed-store";
import { leadNew, shuffleWith, uniqueFilms } from "@/lib/shuffle";
import { scrollClipToTop } from "@/lib/syndicate";
import { onTab, type AppTab } from "@/lib/tab-split";

const LABEL: Record<AppTab, string> = {
  clinic: "Clinic",
  reels: "Reels",
  study: "Study",
  hub: "Hub",
  market: "Market",
  music: "Music",
  tickets: "Tickets",
  career: "Career Navigator",
  crews: "Knowledge",
};

/** Films seated only on this tab. The same clip is not on any other tab. */
export function LedgerLane({ tab }: { tab: AppTab }) {
  const posts = useFeedStore((s) => s.posts);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const [salt] = useState(() => (Math.random() * 0x7fffffff) ^ Date.now());
  const [spin, setSpin] = useState<string[] | null>(null);
  const lane = useMemo(() => {
    const rows = leadNew(
      uniqueFilms(onTab(posts, tab).filter((post) => post.mediaType === "video" && post.youtubeId)),
      waveIds,
      priorWaveIds,
    ).slice(0, 24);
    const mixed = rows.length > 8 ? [...rows.slice(0, 8), ...shuffleWith(rows.slice(8), salt)] : rows;
    if (!spin) return mixed;
    const byId = new Map(mixed.map((post) => [post.id, post]));
    const ranked = spin.map((id) => byId.get(id)).filter((post) => post != null);
    const rest = mixed.filter((post) => !spin.includes(post.id));
    return [...ranked, ...rest];
  }, [posts, tab, waveIds, priorWaveIds, salt, spin]);
  const started = useRef(false);
  useEffect(() => {
    const onPermute = (ev: Event) => {
      const detail = (ev as CustomEvent<{ fromId: string; next: string }>).detail;
      if (!detail?.next || detail.next === detail.fromId) return;
      setSpin((prev) => {
        const ids = (prev ?? lane.map((post) => post.id)).filter((id) => id !== detail.fromId && id !== detail.next);
        return [detail.next, ...shuffleWith(ids, Date.now() >>> 0), detail.fromId];
      });
    };
    window.addEventListener("clip:permute", onPermute);
    return () => window.removeEventListener("clip:permute", onPermute);
  }, [lane]);
  useEffect(() => {
    if (started.current || !lane.length) return;
    started.current = true;
    const first = lane[0]!.id;
    useFeedStore.getState().setPlayingId(first);
    window.setTimeout(() => scrollClipToTop(first), 280);
  }, [tab, lane]);
  if (!lane.length) return null;
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
        {LABEL[tab]} · {lane.length} films
      </p>
      {lane.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
