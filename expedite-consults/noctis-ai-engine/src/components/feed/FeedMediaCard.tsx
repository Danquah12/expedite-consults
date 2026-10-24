import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, PictureInPicture2 } from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf, youtubePoster, youtubePosterSrcSet, POSTER_SIZES } from "@/lib/youtube";
import { vimeoIdOf } from "@/lib/vimeo";
import { preziEmbedOf, preziSpeech } from "@/lib/prezi";
import { advanceClinic } from "@/lib/syndicate";
import { wakeSound, holdPlay, wantMute, skipFocusUntil, focusSkipped } from "@/lib/playback";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { VimeoFrame } from "@/components/feed/VimeoFrame";
import { PreziFrame } from "@/components/feed/PreziFrame";
import { offerFurtherStudy } from "@/lib/further-study";
import { FilmSense } from "@/components/learn/FilmSense";
import { EndHold } from "@/components/feed/EndHold";
import { ProofCheck } from "@/components/feed/ProofCheck";
import { ClipDock } from "@/components/feed/ClipDock";
import { ClipPlate } from "@/components/feed/ClipPlate";
import { englishHear } from "@/lib/english-hear";
import { EnglishCaption } from "@/components/feed/EnglishCaption";
import { hostEmbed } from "@/lib/hosts";
import { HostFrame } from "@/components/feed/HostFrame";
import { ReactBar } from "@/components/feed/ReactMarks";

export function FeedMediaCard({ post, listen = false }: { post: FeedPost; listen?: boolean }) {
  const toggleLike = useFeedStore((s) => s.toggleLike);
  const isMuted = useFeedStore((s) => s.isMuted);
  const playingId = useFeedStore((s) => s.playingId);
  const pipId = useFeedStore((s) => s.pipId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const openPip = useFeedStore((s) => s.openPip);
  const closePip = useFeedStore((s) => s.closePip);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalType = useFeedStore((s) => s.modal.type);
  const playing = playingId === post.id && pipId !== post.id && modalType !== "story" && modalType !== "live" && modalType !== "hall-drill" && modalType !== "lesson" && modalType !== "analyze" && modalType !== "think" && modalType !== "comments" && modalType !== "meaning" && modalType !== "send";
  const docked = pipId === post.id;
  const lastTap = useRef(0);
  const advancing = useRef(false);
  const [burst, setBurst] = useState(false);
  const [start, setStart] = useState(0);
  const [clock, setClock] = useState(0);
  const [span, setSpan] = useState(0);
  const [seek, setSeek] = useState<number | null>(null);
  const [hold, setHold] = useState(false);
  const [proof, setProof] = useState(false);
  const ytId = youtubeIdOf(post);
  const vmId = vimeoIdOf(post);
  const prezi = preziEmbedOf(post);
  const host = !ytId && !vmId && !prezi ? hostEmbed(post.mediaUrl) : null;
  const embedded = Boolean(ytId || vmId || prezi || host);
  const canPip = Boolean(ytId || vmId || prezi || post.mediaType === "video");

  const onEnded = useCallback(() => {
    if (advancing.current || proof) return;
    if (useFeedStore.getState().playingId !== post.id) return;
    useFeedStore.getState().rewardClip(post.id, "finish");
    if (!listen) offerFurtherStudy(post.caption);
    advancing.current = true;
    skipFocusUntil(post.id, 14_000);
    const next = advanceClinic(post.id);
    if (!next) {
      advancing.current = false;
      setHold(true);
    }
  }, [post.id, post.teach?.prompt, proof, listen]);

  const watchAgain = useCallback(() => {
    advancing.current = false;
    setHold(false);
    setProof(false);
    setStart((n) => n + 0.01);
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => undefined);
    }
  }, []);

  const goNext = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    skipFocusUntil(post.id, 14_000);
    setHold(false);
    setProof(false);
    const next = advanceClinic(post.id);
    if (!next) advancing.current = false;
  }, [post.id]);

  useEffect(() => {
    if (playing && !focusSkipped(post.id)) advancing.current = false;
    if (!playing) setProof(false);
  }, [playing, post.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing && !hold && !proof) {
      el.muted = true;
      void el
        .play()
        .then(() => {
          el.muted = wantMute();
        })
        .catch(() => {
          el.muted = true;
          void el.play().catch(() => undefined);
        });
    } else {
      el.pause();
    }
  }, [playing, hold, proof]);

  function takeThis() {
    wakeSound();
    holdPlay();
    const st = useFeedStore.getState();
    if (st.pipId && st.pipId !== post.id) st.closePip();
    st.setPlayingId(post.id);
  }

  function onMediaClick(e: React.MouseEvent) {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      toggleLike(post.id, { x: e.clientX, y: e.clientY });
      setBurst(true);
      window.setTimeout(() => setBurst(false), 700);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    if (docked) {
      closePip();
      return;
    }
    const el = videoRef.current;
    if (el && (post.mediaType === "video" || post.mediaType === "audio")) {
      if (el.paused) {
        el.muted = true;
        void el.play().then(() => {
          el.muted = wantMute();
        }).catch(() => undefined);
      }
      takeThis();
      return;
    }
    if (post.mediaType === "video" || post.mediaType === "audio") takeThis();
  }

  function popOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    wakeSound();
    if (docked) {
      closePip();
      setPlayingId(post.id);
      return;
    }
    openPip(post.id);
  }

  const hear = englishHear(post);

  return (
    <div className="sm:px-2.5">
      <ClipPlate className="relative w-full">
        <div className="clip-well" data-clip={post.id}>
        {docked ? (
          <button type="button" onClick={onMediaClick} className="absolute inset-0">
            <img
              src={post.posterUrl ?? (ytId ? youtubePoster(ytId) : post.mediaUrl)}
              srcSet={post.posterUrl || !ytId ? undefined : youtubePosterSrcSet(ytId)}
              sizes={POSTER_SIZES}
              alt=""
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg/75 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
              Playing in picture
            </span>
          </button>
        ) : ytId ? (
          <YoutubeFrame
            postId={post.id}
            youtubeId={ytId}
            posterUrl={post.posterUrl}
            playing={playing && !hold && !proof}
            muted={isMuted}
            start={start}
            seekAt={seek}
            chrome={false}
            onEnded={onEnded}
            onTime={(t, d) => {
              setClock((prev) => (Math.abs(prev - t) < 0.35 ? prev : t));
              if (d > 0) setSpan((prev) => (Math.abs(prev - d) < 0.5 ? prev : d));
            }}
            onToggle={() => takeThis()}
          />
        ) : vmId ? (
          <VimeoFrame
            postId={post.id}
            vimeoId={vmId}
            posterUrl={post.posterUrl}
            playing={playing && !hold && !proof}
            muted={isMuted}
            chrome={false}
            seekAt={seek}
            onEnded={onEnded}
            onTime={(t, d) => {
              setClock((prev) => (Math.abs(prev - t) < 0.35 ? prev : t));
              if (d > 0) setSpan((prev) => (Math.abs(prev - d) < 0.5 ? prev : d));
            }}
            onToggle={() => takeThis()}
          />
        ) : prezi ? (
          <PreziFrame
            postId={post.id}
            embedUrl={prezi}
            posterUrl={post.posterUrl}
            playing={playing && !proof}
            muted={isMuted}
            voiceText={preziSpeech(post)}
            onToggle={() => takeThis()}
          />
        ) : host ? (
          <HostFrame embed={host} posterUrl={post.posterUrl} playing={playing && !hold && !proof} onToggle={() => takeThis()} />
        ) : post.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            poster={post.posterUrl}
            playsInline
            muted={isMuted}
            autoPlay={playing && !hold && !proof}
            {...{ "webkit-playsinline": "true" }}
            preload={playing ? "auto" : "metadata"}
            className="h-full w-full cursor-pointer object-contain"
            onClick={onMediaClick}
            onEnded={onEnded}
            onTimeUpdate={(e) => {
              const node = e.currentTarget;
              setClock((prev) => (Math.abs(prev - node.currentTime) < 0.35 ? prev : node.currentTime));
              if (node.duration) setSpan((prev) => (Math.abs(prev - node.duration) < 0.5 ? prev : node.duration));
            }}
          />
        ) : post.mediaType === "audio" ? (
          <button type="button" className="relative h-full min-h-full w-full cursor-pointer" onClick={onMediaClick}>
            {post.posterUrl ? (
              <img src={post.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <span className="grid h-full place-items-center bg-bg px-8 text-center font-display text-xl font-semibold">
                {post.musicTitle ?? post.teach.stamp}
              </span>
            )}
            <audio src={post.mediaUrl} preload={playing ? "auto" : "none"} className="hidden" onEnded={onEnded} />
          </button>
        ) : (
          <img src={post.mediaUrl} alt="" className="h-full w-full cursor-pointer object-contain" loading="lazy" decoding="async" onClick={onMediaClick} />
        )}
        </div>

        {!prezi ? (
          <ClipDock
            time={clock}
            duration={span}
            onSeek={(n) => {
              if (ytId || vmId) setSeek(n);
              else if (videoRef.current) {
                videoRef.current.currentTime = n;
                setClock(n);
              }
            }}
          />
        ) : null}

        {canPip && !embedded ? (
          <button
            type="button"
            onClick={popOut}
            aria-label="Picture in picture"
            className="absolute right-3 top-3 z-50 grid size-11 place-items-center rounded-full bg-bg/80 text-fg backdrop-blur-md"
          >
            <PictureInPicture2 className="size-4" />
          </button>
        ) : null}

        {burst && !embedded ? (
          <Heart className="heart-burst pointer-events-none absolute left-1/2 top-1/2 z-20 size-16 fill-primary text-primary" />
        ) : null}

        {hold && playingId === post.id && !embedded ? <EndHold onAgain={watchAgain} onNext={goNext} /> : null}
        {playing && hear && !embedded && !listen ? <EnglishCaption hear={hear} time={clock} /> : null}
      </ClipPlate>
      {!listen && (post.mediaType === "video" || embedded) ? <ReactBar postId={post.id} /> : null}
      {hold && playingId === post.id && embedded ? <EndHold placed onAgain={watchAgain} onNext={goNext} /> : null}
      {playing && hear && embedded && !listen ? (
        <div className="px-4 pt-2">
          <EnglishCaption hear={hear} time={clock} className="static" />
        </div>
      ) : null}
      {!listen && proof && playingId === post.id ? (
        <div id={`proof-${post.id}`} className="px-2 pt-2 sm:px-2.5">
          <ProofCheck post={post} onDone={goNext} />
        </div>
      ) : null}
      {!listen && (post.mediaType === "video" || embedded) ? <FilmSense post={post} /> : null}
    </div>
  );
}
