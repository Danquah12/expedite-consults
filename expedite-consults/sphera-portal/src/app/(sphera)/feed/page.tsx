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
    showToast("Post shared to community!");
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
            repostsCount: nextReposted
              ? (p.repostsCount || 0) + 1
              : Math.max(0, (p.repostsCount || 1) - 1),
          };
        }
        return p;
      })
    );
    showToast("Reposted to your profile!");
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          return { ...p, isSaved: nextSaved };
        }
        return p;
      })
    );
    showToast("Saved to your bookmarks!");
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.poll) {
          const newTotal = (p.poll.totalVotes || 0) + 1;
          const recalculated = p.poll.options.map((opt, idx) => ({
            ...opt,
            votes: idx === optionIndex ? opt.votes + 1 : opt.votes,
            voted: idx === optionIndex,
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
    showToast("Vote recorded!");
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
    showToast("Comment posted!");
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
    showToast("Shared to " + platform);
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
    <div className="w-full flex flex-col min-h-screen bg-neutral-950/60 text-neutral-100 rounded-2xl border border-neutral-800/80 overflow-hidden font-sans">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-full shadow-xl font-medium text-xs flex items-center gap-2 backdrop-blur-md">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Navigation Tabs (Unified Monochrome/Minimalist) */}
      <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
        <div className="grid grid-cols-4 text-center">
          {[
            { id: "FYP", label: "For you" },
            { id: "FOLLOWING", label: "Following" },
            { id: "GOSPEL", label: "Daily Grace" },
            { id: "CAMPUS", label: "Campus" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative py-3.5 text-xs sm:text-sm font-semibold transition hover:bg-white/5"
              >
                <span className={isSelected ? "text-white font-bold" : "text-neutral-400 font-medium"}>
                  {tab.label}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Stories Tray (Natural, Warm & Human) */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3 border-b border-neutral-800/80 scrollbar-none bg-neutral-950/30">
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
                "relative w-13 h-13 rounded-full p-0.5 transition transform group-hover:scale-105 " +
                (story.hasLive
                  ? "bg-gradient-to-tr from-rose-500 to-amber-500"
                  : story.isUser
                  ? "bg-neutral-700"
                  : "bg-gradient-to-tr from-neutral-600 to-neutral-400")
              }
            >
              <img
                src={story.avatar}
                alt={story.username}
                className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
              />
              {story.isUser && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center text-neutral-950">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 max-w-[64px] truncate text-center font-medium">
              {story.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Post Composer */}
      <XComposer
        onPostCreated={handleAddNewPost}
        isGospelMode={activeTab === "GOSPEL"}
      />

      {/* Gospel Hub Banner (If on Gospel Tab) */}
      {activeTab === "GOSPEL" && (
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/30">
          <GospelHub
            initialSubTab={gospelSubTab}
            onShareToFeed={(verseText, verseRef) => {
              handleAddNewPost(
                feedStore.createPost({
                  author: {
                    name: "Kwesi Asiedu",
                    username: "kwesi",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                    verified: true,
                  },
                  content: `“${verseText}”\n\n— ${verseRef}`,
                  category: "gospel",
                  isGospel: true,
                  scripture: {
                    reference: verseRef,
                    text: verseText,
                    theme: "Daily Reflection",
                    translation: "NIV",
                  },
                })
              );
              showToast("Scripture shared to feed!");
            }}
          />
        </div>
      )}

      {/* Posts Stream */}
      <div className="divide-y divide-neutral-800/80">
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-3 text-neutral-400">
            <BookOpen className="w-10 h-10 mx-auto text-neutral-600" />
            <p className="text-sm font-medium">No posts in this feed yet.</p>
            <button
              onClick={() => setActiveTab("FYP")}
              className="px-4 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700"
            >
              Back to Home Feed
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Modals */}
      {isStoryViewerOpen && (
        <StoryViewerModal
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}

      {isShareModalOpen && selectedSharePost && (
        <ShareModal
          post={selectedSharePost}
          onClose={() => setIsShareModalOpen(false)}
          onShared={handleShareCompleted}
        />
      )}

      {isLiveModalOpen && (
        <LiveBroadcastModal
          onClose={() => setIsLiveModalOpen(false)}
          onLiveStarted={(stream) => {
            setLiveStreams((prev) => [stream, ...prev]);
            showToast("Live broadcast is now streaming!");
          }}
        />
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-neutral-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading feed...</span>
        </div>
      }
    >
      <SpheraFeedContent />
    </Suspense>
  );
}
