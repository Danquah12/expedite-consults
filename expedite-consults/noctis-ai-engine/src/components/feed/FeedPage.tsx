import { useEffect, useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { ComposerBar } from "@/components/feed/ComposerBar";
import { DailyBrief } from "@/components/feed/DailyBrief";
import { FeedChrome } from "@/components/feed/FeedChrome";
import { HallDirectory } from "@/components/feed/HallDirectory";
import { FeedPlaybackSync } from "@/components/feed/FeedPlaybackSync";
import { HydrateMedia } from "@/components/feed/HydrateMedia";
import { LiveGrid } from "@/components/feed/LiveGrid";
import { MediaGrid } from "@/components/feed/MediaGrid";
import { FeedStream } from "@/components/feed/FeedStream";
import { MobileCampusDesk } from "@/components/feed/LiveSidebar";
import { TakeFeed } from "@/components/feed/TakeFeed";
import { TheaterView } from "@/components/feed/TheaterView";
import { SubjectRail, filmsForLens, type StudyLens } from "@/components/feed/SubjectRail";
import { rankFeed, useFeedStore } from "@/lib/feed-store";
import { favoriteDesk } from "@/lib/shuffle";
import { askedShare, filmForShare, pinSharedPlay } from "@/lib/share";
import { feedLane } from "@/lib/feed-virtual";
import { isCoarsePointer, kickFocusedPlay, clinicArmed, clearClinicArm } from "@/lib/playback";
import { scrollToFeed, revealPlayingClip } from "@/lib/syndicate";
import { pullSlot } from "@/lib/ingest-sources";

export function FeedPage() {
  const stored = useFeedStore((s) => s.posts);
  const posts = useMemo(() => stored.filter((post) => post.author && post.teach), [stored]);
  const mix = useFeedStore((s) => s.vibeMix);
  const mode = useFeedStore((s) => s.feedMode);
  const joined = useFeedStore((s) => s.joinedCrews);
  const clinicId = useFeedStore((s) => s.clinicPostId);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const viewStyle = useFeedStore((s) => s.viewStyle);
  const surface = useFeedStore((s) => s.surface);
  const heartBurst = useFeedStore((s) => s.heartBurst);
  const hall = useFeedStore((s) => s.hall);
  const ticket = useFeedStore((s) => s.ticket);
  const hallFocus = useFeedStore((s) => s.hallFocus);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const ingestLog = useFeedStore((s) => s.ingestLog);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const dayWatch = useFeedStore((s) => s.dayWatch);
  const ingestAt = useFeedStore((s) => s.ingestAt);
  const openedPlay = useRef(false);
  const openedTaste = useRef(false);
  const [lens, setLens] = useState<StudyLens>("For you");

  useEffect(() => {
    if (openedTaste.current) return;
    openedTaste.current = true;
    const fav = favoriteDesk(useFeedStore.getState().dayWatch);
    if (!fav) return;
    document.querySelector(`[data-taste="${fav}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);
  const playingId = useFeedStore((s) => s.playingId);
  const pipId = useFeedStore((s) => s.pipId);
  const ledgerIds = waveIds.length ? waveIds : (ingestLog[0]?.clips.map((c) => c.postId) ?? []);
  const rankKey = `${pullSlot()}:${deckSeed}:${hall}:${ticket}:${hallFocus}:${clinicDesk}:${ingestAt}:${waveIds.join(",")}:${priorWaveIds.join(",")}`;
  const ranked = useMemo(
    () => rankFeed(posts, mix, mode, joined, clinicId, deckSeed, hall, ticket, hallFocus, ledgerIds, clinicDesk, priorWaveIds, dayWatch, null),
    // Re-deal on ingest / desk / seed — never on play, or the focused clip hops and React loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dayWatch and playingId are intentionally frozen
    [posts, mix, mode, joined, clinicId, rankKey],
  );
  const seated = useMemo(() => {
    const rows = filmsForLens(ranked, lens);
    const sent = filmForShare(posts, askedShare());
    const rest = rows.filter((post) => !sent || (post.id !== sent.id && post.youtubeId !== sent.youtubeId));
    return sent ? [sent, ...rest] : rows;
  }, [ranked, lens, posts]);
  const orderRef = useRef<string[] | null>(null);
  const steady = useMemo(() => {
    const rankedYears = [...seated].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    const playing = useFeedStore.getState().playingId;
    const hit = playing ? rankedYears.find((post) => post.id === playing) : undefined;
    const next = hit ? [hit, ...rankedYears.filter((post) => post.id !== hit.id)] : rankedYears;
    orderRef.current = next.map((post) => post.id);
    return next;
  }, [seated]);
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const focusId = hash.startsWith("post-") ? hash.slice(5) : hash.startsWith("post") ? hash : "";

  useEffect(() => {
    if (openedPlay.current || viewStyle !== "stream" || surface !== "feed") return;
    const st = useFeedStore.getState();
    const asked = askedShare();
    const sent = filmForShare(steady, asked) ?? (asked.id ? steady.find((post) => post.id === asked.id) : undefined);
    const justIn = clinicArmed();
    if (sent) {
      openedPlay.current = true;
      if (justIn) clearClinicArm();
      pinSharedPlay(sent.id);
      st.setPlayingId(sent.id);
      window.setTimeout(() => scrollToFeed(sent.id), 40);
      [80, 250, 700, 1400, 2400].forEach((ms) => window.setTimeout(() => kickFocusedPlay(), ms));
      return;
    }
    if (!justIn && (st.playingId || st.pipId)) {
      openedPlay.current = true;
      [80, 250, 700, 1400].forEach((ms) => window.setTimeout(() => kickFocusedPlay(), ms));
      return;
    }
    if (st.modal.type === "story" || st.modal.type === "live") return;
    const first = steady.find((post) => post.mediaType === "video" || post.youtubeId);
    if (!first) return;
    openedPlay.current = true;
    if (justIn) clearClinicArm();
    st.setPlayingId(first.id);
    window.setTimeout(() => scrollToFeed(first.id), 40);
    [80, 250, 700, 1400, 2400].forEach((ms) => window.setTimeout(() => kickFocusedPlay(), ms));
  }, [steady, viewStyle, surface]);

  useEffect(() => {
    if (!openedPlay.current) return;
    const st = useFeedStore.getState();
    if (st.pipId || st.playingId) return;
    const first = steady.find((post) => post.mediaType === "video" || post.youtubeId);
    if (!first) return;
    st.setPlayingId(first.id);
    window.setTimeout(() => scrollToFeed(first.id), 40);
  }, [ingestAt, steady]);

  useEffect(() => {
    if (focusId) {
      window.setTimeout(() => scrollToFeed(focusId), 80);
      return;
    }
    const asked = askedShare();
    if (asked.youtubeId || asked.id) {
      const sent = filmForShare(useFeedStore.getState().posts, asked);
      window.setTimeout(() => scrollToFeed(sent?.id || asked.id), 160);
      return;
    }
    feedLane()?.scrollTo({ top: 0 });
  }, [hall, ticket, hallFocus, deckSeed, focusId, clinicDesk]);

  useEffect(() => {
    if (!playingId || playingId === pipId || viewStyle === "theater" || surface !== "feed") return;
    if (isCoarsePointer()) return;
    const t = window.setTimeout(() => revealPlayingClip(playingId), 160);
    const t2 = window.setTimeout(() => revealPlayingClip(playingId), 700);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [playingId, pipId, viewStyle, surface]);

  if (viewStyle === "theater") {
    return (
      <>
        <HydrateMedia />
        <TheaterView />
      </>
    );
  }

  return (
    <ClinicFrame wide>
      <HydrateMedia />
      <FeedPlaybackSync />
      <DailyBrief />
      <HallDirectory compact />
      <MobileCampusDesk />
      <section className="space-y-3 rounded-2xl bg-surface p-3 shadow-border">
        <FeedChrome />
        <SubjectRail lens={lens} onLens={setLens} posts={steady} />
      </section>
      {mode === "DROPS" ? <LiveGrid /> : (
        <>
          <ComposerBar />
        </>
      )}
      {surface === "takes" ? (
        <TakeFeed posts={steady} />
      ) : surface === "board" ? (
        <MediaGrid posts={steady} />
      ) : steady.length ? (
        <FeedStream posts={steady} />
      ) : (
        <p className="rounded-2xl bg-surface p-5 text-sm text-muted shadow-border">
          {lens === "For you" ? "Clinic is seating the next wave." : `No ${lens} film is in this wave.`}
        </p>
      )}
      {heartBurst ? (
        <Heart
          key={heartBurst.id}
          className="heart-burst pointer-events-none fixed z-50 size-14 fill-primary text-primary"
          style={{ left: heartBurst.x - 28, top: heartBurst.y - 28 }}
        />
      ) : null}
    </ClinicFrame>
  );
}
