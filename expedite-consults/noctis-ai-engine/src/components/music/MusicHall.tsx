import { useEffect, useMemo, useRef, useState } from "react";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { FeedMediaCard } from "@/components/feed/FeedMediaCard";
import { PostActionBar } from "@/components/feed/PostActionBar";
import { ReactBar } from "@/components/feed/ReactMarks";
import { FeedPlaybackSync } from "@/components/feed/FeedPlaybackSync";
import { HydrateMedia } from "@/components/feed/HydrateMedia";
import { hymnOfPost } from "@/lib/hymn-desk";
import { useFeedStore } from "@/lib/feed-store";
import { holdPlay } from "@/lib/playback";
import { leadNew, shuffleWith } from "@/lib/shuffle";
import { setFeedOrder } from "@/lib/feed-virtual";
import { scrollClipToTop } from "@/lib/syndicate";
import { applySong, readSong } from "@/lib/reel-services";
import { knowledgeAsset } from "@/lib/knowledge-asset";
import { KnowledgeActions } from "@/components/learn/KnowledgeActions";
import { askFilm } from "@/components/learn/VideoAskSheet";
import type { FeedPost } from "@/lib/feed-data";

function applySpin<T extends { id: string }>(rows: T[], spin: string[] | null) {
  if (!spin) return rows;
  const byId = new Map(rows.map((row) => [row.id, row]));
  const ranked = spin.map((id) => byId.get(id)).filter((row): row is T => row != null);
  const rest = rows.filter((row) => !spin.includes(row.id));
  return [...ranked, ...rest];
}

function songName(post: FeedPost) {
  return hymnOfPost(post)?.title || post.musicTitle || post.author.name;
}

/** Talks, drills, and sermons are not songs. The music tab only plays songs. */
const NOT_A_SONG = new Set([
  "mu-brain",
  "mu-repeat",
  "mu-talgam",
  "mu-elsistema",
  "mu-listen",
  "mu-emotion",
  "mu-zander",
  "mu-dudamel",
  "mu-hymn-kingdom",
  "mu-hymn-path",
  "mu-bobby",
]);

/** Christian, jazz, and soul. Talks stay off this tab. */
const SONG = /#gospel|#hymn|#worship|#choir|#christian|#jazz|#soul/;

type Lane = "all" | "christian" | "jazz" | "soul";

function laneOf(post: FeedPost): Lane | null {
  const tags = post.hashtags.join(" ").toLowerCase();
  if (/#jazz/.test(tags)) return "jazz";
  if (/#soul/.test(tags)) return "soul";
  if (/#gospel|#hymn|#worship|#choir|#christian/.test(tags) || post.id.startsWith("mu-hymn-") || post.id.startsWith("hymn-")) return "christian";
  return null;
}

function isSong(post: FeedPost) {
  if (NOT_A_SONG.has(post.id)) return false;
  if (!(post.id.startsWith("mu-") || post.id.startsWith("hymn-"))) return false;
  return laneOf(post) != null && (SONG.test(post.hashtags.join(" ").toLowerCase()) || post.id.startsWith("hymn-") || post.id.startsWith("mu-hymn-"));
}

export function MusicHall() {
  return (
    <ClinicFrame wide>
      <HydrateMedia />
      <FeedPlaybackSync />
      <header className="px-1">
        <h1 className="font-display text-2xl font-semibold">Music</h1>
        <p className="mt-1 text-sm text-muted">Christian, jazz, and soul.</p>
      </header>
      <Songs />
    </ClinicFrame>
  );
}

function Songs() {
  const posts = useFeedStore((s) => s.posts);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const playingId = useFeedStore((s) => s.playingId);
  const [lane, setLane] = useState<Lane>("all");
  const [heard, setHeard] = useState("");
  const [salt, setSalt] = useState(() => (Math.random() * 0x7fffffff) ^ Date.now() ^ deckSeed);
  const [spin, setSpin] = useState<string[] | null>(null);
  const pool = useMemo(() => {
    const clips = posts.filter((p) => p.mediaType === "video" && p.mediaUrl && isSong(p) && (lane === "all" || laneOf(p) === lane));
    const seen = new Set<string>();
    const merged = clips.filter((p) => {
      const key = p.youtubeId || p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return applySpin(leadNew(shuffleWith(merged, salt ^ 0x51ed)), spin);
  }, [posts, salt, spin, lane]);
  const armed = useRef("");

  useEffect(() => {
    if (!pool.length) return;
    setFeedOrder(pool.map((p) => p.id));
  }, [pool]);

  useEffect(() => {
    setSpin(null);
    setSalt((Date.now() ^ deckSeed) >>> 0);
    armed.current = "";
  }, [deckSeed]);

  useEffect(() => {
    const onPermute = (ev: Event) => {
      const detail = (ev as CustomEvent<{ fromId: string; next: string }>).detail;
      if (!detail?.next || detail.next === detail.fromId) return;
      setSpin((prev) => {
        const ids = (prev ?? pool.map((post) => post.id)).filter((id) => id !== detail.fromId && id !== detail.next);
        return [detail.next, ...shuffleWith(ids, Date.now() >>> 0), detail.fromId];
      });
      holdPlay(1600);
      setPlayingId(detail.next);
      window.setTimeout(() => scrollClipToTop(detail.next), 80);
    };
    window.addEventListener("clip:permute", onPermute);
    return () => window.removeEventListener("clip:permute", onPermute);
  }, [pool, setPlayingId]);

  useEffect(() => {
    const start = pool[0]?.id;
    if (!start || armed.current === start) return;
    armed.current = start;
    holdPlay(1200);
    setPlayingId(start);
    const pin = () => scrollClipToTop(start);
    pin();
    const t = window.setTimeout(pin, 160);
    return () => window.clearTimeout(t);
  }, [pool[0]?.id, setPlayingId]);

  useEffect(() => {
    const post = pool.find((row) => row.id === playingId);
    if (!post) return;
    applySong(post);
    setHeard(post.id);
  }, [playingId, pool]);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-none">
        {(
          [
            ["all", "All"],
            ["christian", "Christian"],
            ["jazz", "Jazz"],
            ["soul", "Soul"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setLane(id);
              armed.current = "";
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${lane === id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-border"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {pool.map((post) => (
        <article key={post.id} id={`post-${post.id}`} className="clinic-stage">
          <p className="mb-2 px-1 text-sm font-semibold">{songName(post)}</p>
          <FeedMediaCard post={post} listen />
          <div className="relative z-30 bg-bg">
            <ReactBar postId={post.id} />
            <PostActionBar post={post} />
            <SongAnalysis post={post} heard={heard} />
          </div>
        </article>
      ))}
    </>
  );
}

function SongAnalysis({ post, heard }: { post: FeedPost; heard: string }) {
  const song = readSong(post);
  void heard;
  return (
    <section className="mt-3 rounded-3xl border border-[#e4b86a]/40 bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Vibe Analysis</p>
      <h2 className="mt-1 text-base font-semibold">{song.title}</h2>
      <button
        type="button"
        className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
        onClick={() => askFilm({ postId: post.id, title: song.title, caption: post.caption, youtubeId: post.youtubeId })}
      >
        Ask Noctis about this
      </button>
      <dl className="mt-3 space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Themes</dt>
          <dd className="mt-0.5">{song.themes}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Origins</dt>
          <dd className="mt-0.5">{song.origins}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Context</dt>
          <dd className="mt-0.5">{song.context}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Cultural significance</dt>
          <dd className="mt-0.5">{song.culture}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Why it matters</dt>
          <dd className="mt-0.5">{song.context}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Related lessons</dt>
          <dd className="mt-0.5">{song.lessons.length ? song.lessons.join(" · ") : "No lesson card is stored for this recording."}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Related paths</dt>
          <dd className="mt-0.5">{song.paths.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Knowledge DNA impact</dt>
          <dd className="mt-0.5">{heard === post.id ? song.dna.map((name) => `${name} +1`).join(" · ") : "Recorded the first time this song plays."}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Journey impact</dt>
          <dd className="mt-0.5">Path: Listen. Hours +0.1 the first time this song plays.</dd>
        </div>
      </dl>
      <div className="mt-4">
        <KnowledgeActions
          asset={knowledgeAsset({
            id: post.id,
            title: song.title,
            source: song.origins,
            category: "Music",
            summary: song.themes,
            insight: song.context,
            why: song.context,
          })}
        />
      </div>
    </section>
  );
}
