import { useFeedStore } from "@/lib/feed-store";
import { PostComposerModal } from "@/components/feed/PostComposerModal";
import { VideoRecorderModal } from "@/components/feed/VideoRecorderModal";
import { StoryViewerModal } from "@/components/feed/StoryViewerModal";
import { LiveBroadcastModal } from "@/components/feed/LiveBroadcastModal";
import { SmarterSheet } from "@/components/learn/SmarterSheet";
import { LessonSheet } from "@/components/learn/LessonSheet";
import { MeaningSheet } from "@/components/learn/MeaningSheet";
import { SettingsSheet } from "@/components/feed/SettingsSheet";
import { LessonSongModal } from "@/components/feed/LessonSongModal";
import { HallDrillSheet } from "@/components/learn/HallDrillSheet";
import { HallNavSheet } from "@/components/feed/HallNavSheet";
import { CreateDesk } from "@/components/feed/CreateDesk";
import { SendSheet } from "@/components/feed/SendSheet";
import { CommentSheet } from "@/components/feed/CommentSheet";
import { MediaAnalyzeSheet } from "@/components/learn/MediaAnalyzeSheet";
import { VideoAskSheet } from "@/components/learn/VideoAskSheet";
import { ThinkingCoachSheet } from "@/components/learn/ThinkingCoachSheet";
import { AlertSheet } from "@/components/feed/AlertSheet";
import { StudyCalls } from "@/components/learn/StudyCalls";
import { PhoneSheet } from "@/components/noctis/PhoneSheet";

export function FeedModals() {
  const modal = useFeedStore((s) => s.modal);
  return (
    <>
      <PostComposerModal open={modal.type === "composer"} quoteOf={modal.type === "composer" ? modal.quoteOf : undefined} pick={modal.type === "composer" ? modal.pick : undefined} />
      <VideoRecorderModal open={modal.type === "recorder"} />
      <StoryViewerModal open={modal.type === "story"} index={modal.type === "story" ? modal.index : 0} />
      <LiveBroadcastModal open={modal.type === "live"} streamId={modal.type === "live" ? modal.streamId : ""} />
      <SmarterSheet open={modal.type === "smarter"} />
      <LessonSheet open={modal.type === "lesson"} postId={modal.type === "lesson" ? modal.postId : ""} />
      <MeaningSheet open={modal.type === "meaning"} postId={modal.type === "meaning" ? modal.postId : ""} />
      <SettingsSheet open={modal.type === "settings"} />
      <LessonSongModal open={modal.type === "lesson-song"} />
      <HallDrillSheet open={modal.type === "hall-drill"} cardId={modal.type === "hall-drill" ? modal.cardId : ""} />
      <CreateDesk open={modal.type === "create"} />
      <HallNavSheet open={modal.type === "hall-nav"} />
      <SendSheet open={modal.type === "send"} postId={modal.type === "send" ? modal.postId : ""} />
      <CommentSheet open={modal.type === "comments"} postId={modal.type === "comments" ? modal.postId : ""} />
      <MediaAnalyzeSheet open={modal.type === "analyze"} claim={modal.type === "analyze" ? modal.claim : ""} offered={modal.type === "analyze" ? modal.offered : undefined} />
      <ThinkingCoachSheet open={modal.type === "think"} claim={modal.type === "think" ? modal.claim : ""} />
      <VideoAskSheet
        open={modal.type === "video"}
        postId={modal.type === "video" ? modal.postId : ""}
        title={modal.type === "video" ? modal.title : ""}
        caption={modal.type === "video" ? modal.caption : ""}
        youtubeId={modal.type === "video" ? modal.youtubeId : ""}
      />
      <AlertSheet open={modal.type === "alerts"} page={modal.type === "alerts" ? modal.page : undefined} />
      <StudyCalls open={modal.type === "calls"} />
      <PhoneSheet open={modal.type === "phone"} video={modal.type === "phone" && Boolean(modal.video)} join={modal.type === "phone" ? (modal.join ?? "") : ""} />
    </>
  );
}