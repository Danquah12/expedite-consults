import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ClipCaption } from "@/components/feed/ClipCaption";
import { SourceStamp } from "@/components/feed/EndHold";
import { isVideoStory } from "@/lib/feed-data";
import { preziPlaySrc } from "@/lib/prezi";
import { speakClinic, stopClinicVoice } from "@/lib/clinic-voice";
import { useFeedStore } from "@/lib/feed-store";
import { StudyThisButton } from "@/components/feed/StudyThisButton";

export function StoryViewerModal({ open, index }: { open: boolean; index: number }) {
  const stories = useFeedStore((s) => s.stories);
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);
  const liveStreams = useFeedStore((s) => s.liveStreams);
  const isMuted = useFeedStore((s) => s.isMuted);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const viewable = stories.filter((s) => !s.isUser);
  const posts = useFeedStore((s) => s.posts);
  const [i, setI] = useState(Math.max(0, index));
  const story = stories[i] ?? viewable[0];
  const storyPost =
    story?.caption && story.caption.length > 12
      ? posts.find((post) => post.caption.includes(story.caption!.slice(0, 32)) || post.teach.hook.includes(story.caption!.slice(0, 32)))
      : undefined;

  useEffect(() => {
    setI(index);
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const el = document.querySelector<HTMLVideoElement>("video[data-story-view]");
    if (!el) return;
    el.volume = 1;
    el.muted = true;
    void el
      .play()
      .then(() => {
        el.muted = isMuted;
      })
      .catch(() => undefined);
  }, [open, i, story, isMuted]);

  useEffect(() => {
    if (!open || !story?.preziEmbed) {
      stopClinicVoice();
      return;
    }
    if (isMuted) {
      stopClinicVoice();
      return;
    }
    const line = `${story.displayName}. ${story.caption ?? ""}`.trim();
    const t = window.setTimeout(() => speakClinic(line), 400);
    return () => {
      window.clearTimeout(t);
      stopClinicVoice();
    };
  }, [open, i, story, isMuted]);

  useEffect(() => {
    if (!open || !story || story.preziEmbed) return;
    const ms = isVideoStory(story) ? 8000 : 5000;
    const id = window.setTimeout(() => {
      const next = i + 1;
      if (next >= stories.length) closeModal();
      else setI(next);
    }, ms);
    return () => window.clearTimeout(id);
  }, [open, i, story, stories.length, closeModal]);

  if (!story) return null;

  function go(delta: number) {
    const next = i + delta;
    if (next < 0) closeModal();
    else if (next >= stories.length) closeModal();
    else {
      const target = stories[next];
      if (target.hasLive) {
        const live = liveStreams.find((l) => l.username === target.username);
        if (live) {
          openModal({ type: "live", streamId: live.id });
          return;
        }
      }
      setI(next);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="w-[min(92vw,420px)] overflow-hidden bg-surface p-2">
        <DialogTitle className="sr-only">{story.displayName}</DialogTitle>
        <div className="clip-plate relative aspect-[9/16] max-h-[80dvh] bg-bg" data-plate="reel">
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
            {stories.map((s, idx) => (
              <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <span
                  className={`block h-full bg-fg ${idx === i ? (story.preziEmbed ? "scale-x-100" : "story-bar") : idx < i ? "scale-x-100" : "scale-x-0"}`}
                  style={idx === i && !story.preziEmbed ? { ["--story-duration" as string]: isVideoStory(story) ? "8s" : "5s" } : undefined}
                />
              </span>
            ))}
          </div>
          {story.preziEmbed ? (
            <iframe
              src={preziPlaySrc(story.preziEmbed)}
              title={story.displayName}
              allow="autoplay; fullscreen; clipboard-write"
              allowFullScreen
              className="h-full w-full border-0 bg-bg"
            />
          ) : isVideoStory(story) ? (
            <video
              src={story.mediaUrl}
              autoPlay
              muted={isMuted}
              playsInline
              data-story-view
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={story.mediaUrl} alt="" className="h-full w-full object-cover" />
          )}
          <SourceStamp />
          {isVideoStory(story) && !story.preziEmbed ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute left-3 top-8 z-20 inline-flex h-9 items-center gap-1.5 rounded-full bg-bg/55 px-3 text-[11px] font-semibold backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              {isMuted ? "Sound off" : "Sound"}
            </button>
          ) : story.preziEmbed ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute left-3 top-8 z-20 inline-flex h-9 items-center gap-1.5 rounded-full bg-bg/55 px-3 text-[11px] font-semibold backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              {isMuted ? "Tap to hear" : "Clinic voice"}
            </button>
          ) : null}
          <ClipCaption
            size="feed"
            kicker={story.hasLive ? "Live" : story.displayName}
            body={story.caption || story.displayName}
            meta={`@${story.username}`}
          />
          {storyPost ? <StudyThisButton postId={storyPost.id} className="absolute bottom-16 left-3 z-20" /> : null}
          <button type="button" aria-label="Previous" className="absolute inset-y-0 left-0 z-10 w-10" onClick={() => go(-1)} />
          <button type="button" aria-label="Next" className="absolute inset-y-0 right-0 z-10 w-10" onClick={() => go(1)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
