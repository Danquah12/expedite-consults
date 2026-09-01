"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile,
  Plus,
  CheckCircle2,
  Share2,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Video,
  BarChart3,
  MapPin,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { cn, formatNumber, formatRelativeTime } from "@/lib/utils";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
    location?: string;
    roleTag?: string;
  };
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likedByText: string;
}

const mockPosts: Post[] = [
  {
    id: "p1",
    author: {
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "San Francisco, CA",
      roleTag: "SpheraNet Creator Lead",
    },
    content: "3 years of building in the dark, countless late nights, and today our largest platform update is finally live across the entire SpheraNet Universe! 🚀✨ Full keynote breakdown dropping on Reels tonight.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    likes: 4821,
    commentsCount: 312,
    timeAgo: "2h ago",
    likedByText: "Liked by mj_tech and 4,820 others",
    isLiked: true,
  },
  {
    id: "p2",
    author: {
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Washington, DC",
      roleTag: "Cyber Architect",
    },
    content: "Weekend workspace setup in DC. Dual 4K OLED displays, custom mechanical keyboard, and testing our new Zero-Trust cybersecurity enclave architecture for defense bounties 🦾💻 What is your workstation looking like this week?",
    imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    likes: 2190,
    commentsCount: 84,
    timeAgo: "5h ago",
    likedByText: "Liked by zara.w and 2,189 others",
  },
  {
    id: "p3",
    author: {
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "College Park, MD",
      roleTag: "Founder @ Orbit AI",
    },
    content: "Collegiate hackathon kickoff at University of Maryland! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen gaming protocols 🔥 The energy in the Iribe Center is unbelievable.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    likes: 3410,
    commentsCount: 142,
    timeAgo: "1d ago",
    likedByText: "Liked by kwesi and 3,409 others",
  },
];

const mockStories = [
  { username: "Your story", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", isUser: true },
  { username: "amara_creates", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { username: "mj_tech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { username: "zara.w", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" },
  { username: "kai.dev", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { username: "priya_s", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
];

const suggestedUsers = [
  { username: "elena_v", name: "Elena Vasquez", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", role: "Design Lead @ Figma" },
  { username: "techminds_dc", name: "Tech Minds DC", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80", role: "12.4K Founders" },
  { username: "umd_esports", name: "UMD Esports League", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80", role: "Official Collegiate Guild" },
];

const trendingTags = [
  { tag: "#SpheraLaunch", count: "48.9K posts", category: "Technology" },
  { tag: "#CyberDefense2026", count: "32.4K posts", category: "Security" },
  { tag: "#BitcampHackathon", count: "18.2K posts", category: "Campus" },
  { tag: "#ValorantFinals", count: "14.5K posts", category: "Esports" },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [composerText, setComposerText] = useState("");

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const toggleSave = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  return (
    <div style={{ display: "flex", gap: "32px", width: "100%" }}>
      {/* ── Main Feed Column ──────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: "660px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── Stories Carousel ────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#10121a",
            border: "1px solid #1c202e",
            borderRadius: "20px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            overflowX: "auto",
          }}
        >
          {mockStories.map((story, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, cursor: "pointer" }}>
              <div
                style={{
                  padding: "2.5px",
                  borderRadius: "9999px",
                  background: story.isUser ? "transparent" : "linear-gradient(135deg, #00d4ff, #6366f1, #ec4899)",
                  border: story.isUser ? "2px dashed #334155" : "none",
                }}
              >
                <div style={{ height: "58px", width: "58px", borderRadius: "9999px", overflow: "hidden", backgroundColor: "#08090d", padding: "2px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.img} alt={story.username} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "9999px" }} />
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", maxWidth: "68px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {story.username}
              </span>
            </div>
          ))}
        </div>

        {/* ── Post Composer ────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "#10121a",
            border: "1px solid #1c202e",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ height: "42px", width: "42px", borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" alt="Kwesi" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <input
              value={composerText}
              onChange={e => setComposerText(e.target.value)}
              placeholder="What's happening in your universe, Kwesi?"
              style={{
                flex: 1,
                backgroundColor: "#161924",
                border: "1px solid #1c202e",
                borderRadius: "9999px",
                padding: "12px 18px",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #1c202e" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <button style={{ background: "none", border: "none", color: "#ec4899", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <Video size={16} /> Reel
              </button>
              <button style={{ background: "none", border: "none", color: "#10b981", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <ImageIcon size={16} /> Photo
              </button>
              <button style={{ background: "none", border: "none", color: "#f59e0b", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <Smile size={16} /> Feeling
              </button>
              <button style={{ background: "none", border: "none", color: "#00d4ff", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <BarChart3 size={16} /> Poll
              </button>
            </div>

            <button
              style={{
                background: "linear-gradient(135deg, #00d4ff, #0284c7)",
                color: "#08090d",
                border: "none",
                borderRadius: "10px",
                padding: "8px 20px",
                fontSize: "12px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(0, 212, 255, 0.3)",
              }}
            >
              Publish
            </button>
          </div>
        </div>

        {/* ── Posts Stream ─────────────────────────────────────────── */}
        {posts.map((post) => (
          <article
            key={post.id}
            style={{
              backgroundColor: "#10121a",
              border: "1px solid #1c202e",
              borderRadius: "20px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "2px", borderRadius: "9999px", background: "linear-gradient(135deg, #00d4ff, #ec4899)" }}>
                  <div style={{ height: "40px", width: "40px", borderRadius: "9999px", overflow: "hidden", backgroundColor: "#08090d" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.author.avatarUrl} alt={post.author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff", cursor: "pointer" }}>
                      {post.author.name}
                    </span>
                    {post.author.verified && (
                      <CheckCircle2 size={15} color="#00d4ff" fill="#00d4ff" />
                    )}
                    <span style={{ fontSize: "12px", color: "#64748b" }}>· {post.timeAgo}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0 0" }}>
                    @{post.author.username} {post.author.location && `· ${post.author.location}`}
                  </p>
                </div>
              </div>

              <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Content Text */}
            <div style={{ padding: "0 20px 14px 20px" }}>
              <p style={{ fontSize: "14px", color: "#f1f5f9", lineHeight: "1.6", margin: 0 }}>
                {post.content}
              </p>
            </div>

            {/* High-Resolution Photo */}
            {post.imageUrl && (
              <div style={{ width: "100%", maxHeight: "480px", overflow: "hidden", backgroundColor: "#08090d" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt="Post media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            {/* Action Bar */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Heart size={22} color={post.isLiked ? "#ef4444" : "#ffffff"} fill={post.isLiked ? "#ef4444" : "none"} />
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>{formatNumber(post.likes)}</span>
                  </button>

                  <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#ffffff" }}>
                    <MessageCircle size={22} />
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>{post.commentsCount}</span>
                  </button>

                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ffffff" }}>
                    <Share2 size={22} />
                  </button>
                </div>

                <button
                  onClick={() => toggleSave(post.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ffffff" }}
                >
                  <Bookmark size={22} fill={post.isSaved ? "#ffffff" : "none"} />
                </button>
              </div>

              {/* Likes caption */}
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", margin: 0 }}>
                {post.likedByText}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* ── Right Column: Sidebar ─────────────────────────────────── */}
      <aside style={{ width: "320px", display: "flex", flexDirection: "column", gap: "24px", flexShrink: 0 }}>
        {/* Sphera AI Quick Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(99,102,241,0.1))",
            border: "1px solid rgba(0,212,255,0.3)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="#00d4ff" />
            <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#ffffff", margin: 0 }}>Sphera AI Agent</h3>
          </div>
          <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: "1.5" }}>
            Your universal co-pilot across Social Graph, Bazaar deals, and TS/SCI career bounties.
          </p>
          <a
            href="/ai"
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00d4ff, #0284c7)",
              color: "#08090d",
              fontSize: "12px",
              fontWeight: "900",
              textDecoration: "none",
              marginTop: "4px",
            }}
          >
            Launch AI Terminal →
          </a>
        </div>

        {/* Suggested Creators */}
        <div
          style={{
            backgroundColor: "#10121a",
            border: "1px solid #1c202e",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Suggested Connections</h3>
            <a href="/friends" style={{ fontSize: "12px", fontWeight: "700", color: "#00d4ff", textDecoration: "none" }}>See All</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {suggestedUsers.map((u) => (
              <div key={u.username} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ height: "36px", width: "36px", borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.img} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff", margin: 0 }}>{u.name}</p>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{u.role}</p>
                  </div>
                </div>
                <button
                  style={{
                    backgroundColor: "rgba(0, 212, 255, 0.15)",
                    color: "#00d4ff",
                    border: "1px solid rgba(0, 212, 255, 0.3)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div
          style={{
            backgroundColor: "#10121a",
            border: "1px solid #1c202e",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={18} color="#00d4ff" />
            <h3 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Trending in Universe</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {trendingTags.map((t) => (
              <div key={t.tag} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0, fontWeight: "600" }}>{t.category}</p>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "#00d4ff", margin: "2px 0 0 0" }}>{t.tag}</p>
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
