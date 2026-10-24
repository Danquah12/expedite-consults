import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PictureInPicture2, X } from "lucide-react";
import { useFeedStore } from "@/lib/feed-store";
import { youtubeIdOf } from "@/lib/youtube";
import { vimeoIdOf } from "@/lib/vimeo";
import { preziEmbedOf, preziSpeech } from "@/lib/prezi";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { VimeoFrame } from "@/components/feed/VimeoFrame";
import { PreziFrame } from "@/components/feed/PreziFrame";
import { SourceStamp } from "@/components/feed/EndHold";
import { scrollToFeed } from "@/lib/syndicate";
import { ClipPlate } from "@/components/feed/ClipPlate";
import { hostEmbed } from "@/lib/hosts";
import { HostFrame } from "@/components/feed/HostFrame";

export function PipDock() {
  const posts = useFeedStore((s) => s.posts);
  const pipId = useFeedStore((s) => s.pipId);
  const pipClip = useFeedStore((s) => s.pipClip);
  const isMuted = useFeedStore((s) => s.isMuted);
  const closePip = useFeedStore((s) => s.closePip);
  const videoRef = useRef<HTMLVideoElement>(null);
  const post = pipClip ?? posts.find((p) => p.id === pipId) ?? null;
  const ytId = post ? youtubeIdOf(post) : null;
  const vmId = post ? vimeoIdOf(post) : null;
  const prezi = post ? preziEmbedOf(post) : null;
  const host = post && !ytId && !vmId && !prezi ? hostEmbed(post.mediaUrl) : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = isMuted;
    void el.play().catch(() => undefined);
  }, [isMuted, pipId]);

  if (!post || typeof document === "undefined") return null;
  const live = post;

  function restore() {
    closePip();
    scrollToFeed(live.id);
  }

  return createPortal(
    <aside
      data-pip
      className="pointer-events-auto fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-3 z-[80] w-[min(calc(100%-1.5rem),16rem)] overflow-hidden rounded-2xl bg-surface p-1.5 shadow-float md:bottom-6 md:right-6"
    >
      <div className="flex items-center justify-between gap-2 px-1.5 py-1">
        <button type="button" onClick={restore} className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
          <PictureInPicture2 className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{live.teach.stamp}</span>
        </button>
        <button type="button" onClick={closePip} aria-label="Close picture" className="grid size-11 place-items-center rounded-full hover:bg-elevated">
          <X className="size-3.5" />
        </button>
      </div>
      <ClipPlate tone="dock" className="relative aspect-video w-full">
        {ytId ? (
          <YoutubeFrame
            postId={live.id}
            youtubeId={ytId}
            posterUrl={live.posterUrl}
            playing
            muted={isMuted}
            chrome={false}
            onToggle={() => undefined}
            isolate
            className="min-h-0 h-full"
          />
        ) : vmId ? (
          <VimeoFrame
            postId={live.id}
            vimeoId={vmId}
            posterUrl={live.posterUrl}
            playing
            muted={isMuted}
            onToggle={() => undefined}
            className="min-h-0"
          />
        ) : prezi ? (
          <PreziFrame
            postId={live.id}
            embedUrl={prezi}
            posterUrl={live.posterUrl}
            playing
            muted={isMuted}
            voiceText={preziSpeech(live)}
            onToggle={() => undefined}
            className="min-h-0"
          />
        ) : host ? (
          <HostFrame embed={host} posterUrl={live.posterUrl} playing onToggle={() => undefined} className="min-h-0" />
        ) : live.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={live.mediaUrl}
            poster={live.posterUrl}
            autoPlay
            loop
            playsInline
            className="h-full w-full object-cover"
            muted={isMuted}
          />
        ) : live.posterUrl ? (
          <img src={live.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        {!ytId && !prezi ? <SourceStamp /> : null}
      </ClipPlate>
    </aside>,
    document.body,
  );
}