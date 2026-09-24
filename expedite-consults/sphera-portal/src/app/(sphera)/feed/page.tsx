"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FeedPost,
  StoryItem,
  LiveStreamItem,
  initialFeedPosts,
  initialStories,
  initialLiveStreams,
} from "@/lib/feed-store";
import { XComposer } from "@/components/feed/XComposer";
import { XPostCard } from "@/components/feed/XPostCard";
import { GospelHub } from "@/components/feed/GospelHub";
import { VideoRecorderModal } from "@/components/feed/VideoRecorderModal";
import { StoryViewerModal } from "@/components/feed/StoryViewerModal";
import { LiveBroadcastModal } from "@/components/feed/LiveBroadcastModal";
import { ShareModal } from "@/components/feed/ShareModal";
import { getLocalFeedPosts, saveLocalFeedPost } from "@/lib/indexed-db-media";
import { BookOpen, Sparkles, Plus, Loader2 } from "lucide-react";

function SpheraFeedContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const subParam = searchParams?.get("sub");

  const [activeTab, setActiveTab] = useState<"FYP" | "FOLLOWING" | "GOSPEL" | "CAMPUS">(
    tabParam === "GOSPEL" ? "GOSPEL" : "FYP"
  );
  const [gospelSubTab, setGospelSubTab] = useState<"devotional" | "music" | "prayers" | "promises" | "media">(
    subParam === "music" ? "music" : "devotional"
  );

  const [posts, setPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>(initialLiveStreams);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStreamItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState<FeedPost | null>(null);

  useEffect(() => {
    if (tabParam === "GOSPEL") {
      setActiveTab("GOSPEL");
    }
    if (subParam === "music") {
      setActiveTab("GOSPEL");
      setGospelSubTab("music");
    }
  }, [tabParam, subParam]);

  useEffect(() => {
    async function hydrateLocalData() {
      try {
        const localPosts = await getLocalFeedPosts();
        if (localPosts && localPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const freshLocal = localPosts.filter((lp) => !existingIds.has(lp.id));
            return [...freshLocal, ...prev];
          });
        }
      } catch (err) {
        console.warn("IndexedDB hydration notice:", err);
      }
    }
    hydrateLocalData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddNewPost = (newPost: FeedPost) => {
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    showToast("✨ Your post was published to SpheraNet!");
    try {
      saveLocalFeedPost(newPost);
    } catch (e) {}
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const handleRepost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextReposted = !p.isReposted;
          return {
            ...p,
            isReposted: nextReposted,
            repostsCount: nextReposted ? (p.repostsCount || 0) + 1 : Math.max(0, (p.repostsCount || 0) - 1),
          };
        }
        return p;
      })
    );
    showToast("🔁 Reposted to your timeline!");
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          return {
            ...p,
            isSaved: nextSaved,
            savesCount: nextSaved ? (p.savesCount || 0) + 1 : Math.max(0, (p.savesCount || 0) - 1),
          };
        }
        return p;
      })
    );
    showToast("🔖 Post saved to bookmarks");
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.poll && p.poll.userVotedIndex === undefined) {
          const updatedOptions = p.poll.options.map((opt, idx) => {
            if (idx === optionIndex) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          });
          const newTotal = p.poll.totalVotes + 1;
          const recalculated = updatedOptions.map((opt) => ({
            ...opt,
            percentage: Math.round((opt.votes / newTotal) * 100),
          }));

          return {
            ...p,
            poll: {
              ...p.poll,
              options: recalculated,
              totalVotes: newTotal,
              userVotedIndex: optionIndex,
            },
          };
        }
        return p;
      })
    );
    showToast("🗳️ Vote recorded!");
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: "c-" + Date.now(),
      user: "Kwesi Asiedu",
      username: "kwesi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      text,
      time: "Just now",
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [newComment, ...(p.commentsList || [])],
          };
        }
        return p;
      })
    );
    showToast("💬 Reply posted!");
  };

  const handleOpenShare = (post: FeedPost) => {
    setSelectedSharePost(post);
    setIsShareModalOpen(true);
  };

  const handleShareCompleted = (platform: string) => {
    if (!selectedSharePost) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedSharePost.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p
      )
    );
    showToast("🚀 Shared to " + platform.toUpperCase() + "!");
  };

  const handleToggleFollow = (username: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.author.username === username
          ? { ...p, author: { ...p.author, isFollowed: !p.author.isFollowed } }
          : p
      )
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "GOSPEL") {
      return (
        p.isGospel ||
        p.scriptureRef ||
        p.hashtags?.some((h) =>
          ["#Gospel", "#Faith", "#DailyGrace", "#WordOfGod", "#CampusMinistry"].includes(h)
        )
      );
    }
    if (activeTab === "FOLLOWING") {
      return p.author.isFollowed;
    }
    if (activeTab === "CAMPUS") {
      return (
        p.streamCategory === "campus" ||
        p.hashtags?.some((h) =>
          ["#CampusHacks2026", "#SalisburyUniversity", "#UMD", "#UMBC", "#JohnsHopkins"].includes(h)
        )
      );
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col min-h-screen bg-black/40 text-neutral-100 rounded-3xl border border-neutral-800/80 overflow-hidden font-sans">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 border border-amber-500/40 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Header with Navigation Tabs */}
      <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
        <div className="grid grid-cols-4 text-center">
          <button
            onClick={() => setActiveTab("FYP")}
            className="relative py-3.5 text-sm font-bold transition hover:bg-white/5"
          >
            <span className={activeTab === "FYP" ? "text-white font-extrabold" : "text-neutral-400 font-medium"}>
              For you
            </span>
            {activeTab === "FYP" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-sky-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("FOLLOWING")}
            className="relative py-3.5 text-sm font-bold transition hover:bg-white/5"
          >
            <span className={activeTab === "FOLLOWING" ? "text-white font-extrabold" : "text-neutral-400 font-medium"}>
              Following
            </span>
            {activeTab === "FOLLOWING" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-sky-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("GOSPEL")}
            className="relative py-3.5 text-sm font-bold transition hover:bg-amber-500/10 group"
          >
            <span
              className={
                "flex items-center justify-center gap-1.5 " +
                (activeTab === "GOSPEL" ? "text-amber-400 font-extrabold" : "text-amber-500/80 font-semibold")
              }
            >
              <span>✝️ Gospel</span>
              <span className="text-[9px] bg-amber-500 text-black px-1 rounded font-black">NEW</span>
            </span>
            {activeTab === "GOSPEL" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("CAMPUS")}
            className="relative py-3.5 text-sm font-bold transition hover:bg-white/5"
          >
            <span className={activeTab === "CAMPUS" ? "text-white font-extrabold" : "text-neutral-400 font-medium"}>
              🎓 Campus
            </span>
            {activeTab === "CAMPUS" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Stories Tray */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3 border-b border-neutral-800/80 scrollbar-none bg-neutral-950/40">
        {stories.map((story, idx) => (
          <div
            key={story.id || idx}
            onClick={() => {
              setSelectedStoryIndex(idx);
              setIsStoryViewerOpen(true);
            }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div
              className={
                "relative w-14 h-14 rounded-full p-0.5 transition transform group-hover:scale-105 " +
                (story.hasLive
                  ? "bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 animate-pulse"
                  : story.isUser
                  ? "bg-neutral-700"
                  : "bg-gradient-to-tr from-sky-400 to-indigo-600")
              }
            >
              <img
                src={story.avatar}
                alt={story.username}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
              {story.isUser && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center border border-black text-white">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              {story.hasLive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-1 rounded-sm uppercase tracking-tighter">
                  LIVE
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 group-hover:text-white max-w-[60px] truncate">
              {story.isUser ? "Your story" : story.displayName || story.username}
            </span>
          </div>
        ))}
      </div>

      {/* In-Line Twitter / X Post Composer */}
      <XComposer
        onPostCreated={handleAddNewPost}
        isGospelMode={activeTab === "GOSPEL"}
      />

      {/* Dedicated Gospel Hub View */}
      {activeTab === "GOSPEL" && (
        <div className="p-4 border-b border-neutral-800/80 bg-gradient-to-b from-amber-950/20 via-black to-black">
          <GospelHub
            initialSubTab={gospelSubTab}
            onShareToFeed={(verseText, verseRef) => {
              const newPost: FeedPost = {
                id: `p-faith-${Date.now()}`,
                type: "gospel_scripture",
                category: "gospel",
                author: {
                  id: "u-current",
                  name: "Kwesi Asiedu",
                  username: "kwesi",
                  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                  verified: true,
                  badgeType: "gospel",
                  timeAgo: "Just now",
                  privacy: "Public",
                },
                content: `🕊️ ${verseText}\n\n— ${verseRef} (#GospelMenu #SpheraNet)`,
                scripture: {
                  book: verseRef.split(' ')[0] || "Scripture",
                  reference: verseRef,
                  text: verseText,
                  translation: "NIV",
                  theme: "Faith & Worship",
                },
                hashtags: ["#GospelMenu", "#Worship", "#DailyGrace", "#Faith"],
                likes: 1,
                repostsCount: 0,
                commentsCount: 0,
                viewsCount: 1,
                sharesCount: 0,
                savesCount: 0,
                isLiked: false,
                isBookmarked: false,
                createdAt: new Date().toISOString(),
              };
              handleAddNewPost(newPost);
            }}
          />
        </div>
      )}

      {/* Feed Post Timeline */}
      <div className="divide-y divide-neutral-800/80">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <XPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onRepost={handleRepost}
              onBookmark={handleBookmark}
              onVotePoll={handleVotePoll}
              onAddComment={handleAddComment}
              onShare={handleOpenShare}
              onFollow={handleToggleFollow}
            />
          ))
        ) : (
          <div className="py-16 text-center text-neutral-500 space-y-2">
            <p className="text-base font-bold text-neutral-300">No posts yet in this tab</p>
            <p className="text-xs">Be the first to share an update or testimony!</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      <VideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onPostCreated={handleAddNewPost}
      />

      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        stories={stories}
        initialIndex={selectedStoryIndex}
        onClose={() => setIsStoryViewerOpen(false)}
        onAddStory={(newStory) => setStories((prev) => [newStory, ...prev])}
      />

      <LiveBroadcastModal
        isOpen={isLiveModalOpen}
        stream={activeLiveStream}
        onClose={() => setIsLiveModalOpen(false)}
        onSendGift={(giftName, recipient) => showToast("✨ Sent " + giftName + " to @" + recipient + "!")}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={selectedSharePost}
        onShareCompleted={handleShareCompleted}
      />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Loading SpheraNet Feed...</span>
        </div>
      }
    >
      <SpheraFeedContent />
    </Suspense>
  );
}
