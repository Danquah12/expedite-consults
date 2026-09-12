"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Smile,
  Plus,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  ThumbsUp,
  Globe,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
    timeAgo: string;
    privacy?: string;
  };
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  topReactions?: { emoji: string; count: number }[];
  likedByFriend?: string;
}

const mockPosts: Post[] = [
  {
    id: "p1",
    author: {
      name: "Amara Diallo",
      username: "amara_creates",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "2h ago",
      privacy: "Public",
    },
    content: "3 years of building in the dark, countless late nights, and today our largest platform update is finally live across the entire SpheraNet Universe! 🚀✨ Full keynote breakdown dropping on Reels tonight.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    likes: 4821,
    commentsCount: 312,
    sharesCount: 97,
    isLiked: true,
    likedByFriend: "Marcus Johnson",
    topReactions: [
      { emoji: "👍", count: 2800 },
      { emoji: "❤️", count: 1200 },
      { emoji: "🚀", count: 821 },
    ],
  },
  {
    id: "p2",
    author: {
      name: "Marcus Johnson",
      username: "mj_tech",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "5h ago",
      privacy: "Friends",
    },
    content: "Weekend workspace setup in DC. Dual 4K OLED displays, custom mechanical keyboard, and testing our new Zero-Trust cybersecurity enclave architecture for defense bounties 🦾💻 What is your workstation looking like this week?",
    imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1000&auto=format&fit=crop&q=80",
    likes: 2190,
    commentsCount: 84,
    sharesCount: 23,
    likedByFriend: "Zara Williams",
    topReactions: [
      { emoji: "👍", count: 1500 },
      { emoji: "🔥", count: 690 },
    ],
  },
  {
    id: "p3",
    author: {
      name: "Zara Williams",
      username: "zara.w",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verified: true,
      timeAgo: "1d ago",
      privacy: "Public",
    },
    content: "Collegiate hackathon kickoff at University of Maryland! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen gaming protocols 🔥 The energy in the Iribe Center is unbelievable.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    likes: 3410,
    commentsCount: 142,
    sharesCount: 58,
    likedByFriend: "Kwesi Asiedu",
    topReactions: [
      { emoji: "👍", count: 2000 },
      { emoji: "❤️", count: 900 },
      { emoji: "😮", count: 510 },
    ],
  },
  {
    id: "p4",
    author: {
      name: "Kwesi Asiedu",
      username: "kwesi",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      verified: false,
      timeAgo: "2d ago",
      privacy: "Friends",
    },
    content: "2 years later — still chasing the same sky. Some things never get old. 🌤️",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&auto=format&fit=crop&q=80",
    likes: 218,
    commentsCount: 34,
    sharesCount: 6,
    topReactions: [
      { emoji: "❤️", count: 140 },
      { emoji: "👍", count: 78 },
    ],
  },
];

const mockStories = [
  {
    username: "Your Story",
    img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    isUser: true,
    bgColor: "#1877f2",
  },
  {
    username: "Amara Diallo",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom, transparent 30%, #000000cc)",
  },
  {
    username: "Marcus J.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom, transparent 30%, #000000cc)",
  },
  {
    username: "Zara W.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom, transparent 30%, #000000cc)",
  },
  {
    username: "Koranteng",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom, transparent 30%, #000000cc)",
  },
];

const contacts = [
  { name: "Meta AI", img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=60&auto=format&fit=crop&q=80", online: true, isAI: true },
  { name: "Amara Diallo", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80", online: true },
  { name: "Marcus Johnson", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80", online: true },
  { name: "Zara Williams", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80", online: false },
  { name: "Elena Vasquez", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80", online: true },
  { name: "Nana Wiredu", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop&q=80", online: false },
  { name: "Priya Sharma", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80", online: true },
  { name: "Kai Dev", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80", online: false },
];

const birthdays = [
  { name: "Nana Yaw Wiredu", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop&q=80" },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [composerText, setComposerText] = useState("");

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextLiked = !p.isLiked;
          return { ...p, isLiked: nextLiked, likes: nextLiked ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      })
    );
  };

  const toggleSave = (id: string) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, isSaved: !p.isSaved } : p)));
  };

  const card: React.CSSProperties = {
    backgroundColor: "#242526",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
    overflow: "hidden",
    marginBottom: "16px",
  };

  return (
    <div style={{ display: "flex", gap: "26px", width: "100%", alignItems: "flex-start" }}>

      {/* ── Center Feed ─────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: "590px", minWidth: 0 }}>

        {/* Stories */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
          {mockStories.map((story, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: "112px",
                height: "200px",
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
                cursor: "pointer",
                backgroundColor: "#3a3b3c",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.img}
                alt={story.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: story.isUser
                  ? "linear-gradient(to top, #1877f2 0%, transparent 50%)"
                  : "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)"
              }} />
              {/* Avatar / Plus button */}
              {story.isUser ? (
                <div style={{
                  position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
                  width: "44px", height: "44px", borderRadius: "9999px",
                  border: "3px solid #242526", overflow: "hidden", backgroundColor: "#3a3b3c"
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.img} alt="me" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", bottom: "-2px", right: "-2px",
                    width: "20px", height: "20px", borderRadius: "9999px",
                    backgroundColor: "#1877f2", border: "2px solid #242526",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Plus size={12} color="#fff" strokeWidth={3} />
                  </div>
                </div>
              ) : (
                <div style={{
                  position: "absolute", top: "10px", left: "10px",
                  width: "38px", height: "38px", borderRadius: "9999px",
                  border: "3px solid #1877f2", overflow: "hidden",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.img} alt={story.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              {/* Username */}
              <p style={{
                position: "absolute", bottom: "10px", left: "8px", right: "8px",
                fontSize: "12px", fontWeight: "700", color: "#fff",
                margin: 0, lineHeight: "1.3",
              }}>
                {story.username}
              </p>
            </div>
          ))}
        </div>

        {/* Post Composer */}
        <div style={{ ...card, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop&q=80" alt="me" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <button
              onClick={() => {}}
              style={{
                flex: 1, textAlign: "left",
                backgroundColor: "#3a3b3c",
                border: "none", borderRadius: "9999px",
                padding: "10px 16px",
                color: "#b0b3b8",
                fontSize: "16px", cursor: "pointer",
              }}
            >
              What&apos;s on your mind, Kwesi?
            </button>
          </div>
          <div style={{ borderTop: "1px solid #3a3b3c", paddingTop: "6px", display: "flex", justifyContent: "space-around" }}>
            {[
              { icon: <Video size={18} color="#f02849" />, label: "Live video", color: "#f02849" },
              { icon: <ImageIcon size={18} color="#45bd62" />, label: "Photo/video", color: "#45bd62" },
              { icon: <Smile size={18} color="#f7b928" />, label: "Feeling/activity", color: "#f7b928" },
            ].map(action => (
              <button key={action.label} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "none", borderRadius: "8px",
                padding: "8px 16px", cursor: "pointer",
                color: "#b0b3b8", fontSize: "14px", fontWeight: "600",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a3b3c")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {action.icon}
                <span style={{ fontSize: "13px" }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {posts.map(post => (
          <article key={post.id} style={card}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.author.avatarUrl} alt={post.author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#e4e6eb", cursor: "pointer" }}>
                      {post.author.name}
                    </span>
                    {post.author.verified && <CheckCircle2 size={14} color="#1877f2" fill="#1877f2" />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#b0b3b8" }}>{post.author.timeAgo} ·</span>
                    <Globe size={12} color="#b0b3b8" />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button style={{ background: "none", border: "none", color: "#b0b3b8", cursor: "pointer", borderRadius: "9999px", padding: "6px", display: "flex" }}>
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "0 16px 12px 16px" }}>
              <p style={{ fontSize: "14px", color: "#e4e6eb", lineHeight: "1.6", margin: 0 }}>
                {post.content}
              </p>
            </div>

            {/* Image */}
            {post.imageUrl && (
              <div style={{ width: "100%", maxHeight: "500px", overflow: "hidden", backgroundColor: "#18191a" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt="post" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }} />
              </div>
            )}

            {/* Reaction counts row */}
            <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {post.topReactions?.slice(0, 3).map((r, i) => (
                  <span key={i} style={{ fontSize: "16px", marginLeft: i === 0 ? 0 : "-4px", zIndex: 3 - i }}>{r.emoji}</span>
                ))}
                <span style={{ fontSize: "13px", color: "#b0b3b8", marginLeft: "6px" }}>
                  {post.likedByFriend
                    ? <>{post.likedByFriend} and {formatNumber(post.likes - 1)} others</>
                    : formatNumber(post.likes)
                  }
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: "#b0b3b8" }}>{formatNumber(post.commentsCount)} comments</span>
                <span style={{ fontSize: "13px", color: "#b0b3b8" }}>{formatNumber(post.sharesCount)} shares</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ borderTop: "1px solid #3a3b3c", padding: "4px 12px", display: "flex", justifyContent: "space-around" }}>
              {[
                {
                  icon: <ThumbsUp size={18} color={post.isLiked ? "#1877f2" : "#b0b3b8"} fill={post.isLiked ? "#1877f2" : "none"} />,
                  label: "Like",
                  active: post.isLiked,
                  action: () => toggleLike(post.id),
                },
                {
                  icon: <MessageCircle size={18} color="#b0b3b8" />,
                  label: "Comment",
                  active: false,
                  action: () => {},
                },
                {
                  icon: <Share2 size={18} color="#b0b3b8" />,
                  label: "Share",
                  active: false,
                  action: () => {},
                },
                {
                  icon: <Bookmark size={18} color={post.isSaved ? "#f7b928" : "#b0b3b8"} fill={post.isSaved ? "#f7b928" : "none"} />,
                  label: "Save",
                  active: post.isSaved,
                  action: () => toggleSave(post.id),
                },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none", borderRadius: "8px",
                    padding: "8px 20px", cursor: "pointer",
                    color: btn.active ? "#1877f2" : "#b0b3b8",
                    fontSize: "14px", fontWeight: "600", flex: 1, justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a3b3c")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {btn.icon}
                  <span style={{ color: btn.active ? "#1877f2" : "#b0b3b8" }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* ── Right Sidebar ─────────────────────────────────────────── */}
      <aside style={{ width: "280px", flexShrink: 0, position: "sticky", top: "70px" }}>

        {/* Birthdays */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e4e6eb", margin: "0 0 12px 0" }}>Birthdays</h3>
          {birthdays.map(b => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🎁</span>
              <p style={{ fontSize: "13px", color: "#e4e6eb", margin: 0 }}>
                <strong>{b.name}</strong>&apos;s birthday is today.
              </p>
            </div>
          ))}
        </div>

        {/* Contacts */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e4e6eb", margin: 0 }}>Contacts</h3>
            <div style={{ display: "flex", gap: "4px" }}>
              {["🔍", "⋯"].map(icon => (
                <button key={icon} style={{
                  background: "none", border: "none", cursor: "pointer",
                  width: "32px", height: "32px", borderRadius: "9999px",
                  backgroundColor: "transparent", fontSize: "16px", color: "#b0b3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {contacts.map(contact => (
              <div
                key={contact.name}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "6px 8px", borderRadius: "8px", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a3b3c")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "9999px", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={contact.img} alt={contact.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  {contact.online && (
                    <div style={{
                      position: "absolute", bottom: "1px", right: "1px",
                      width: "10px", height: "10px", borderRadius: "9999px",
                      backgroundColor: "#31a24c", border: "2px solid #18191a",
                    }} />
                  )}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#e4e6eb" }}>{contact.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e4e6eb", margin: "0 0 8px 0" }}>Your Shortcuts</h3>
          {[
            { name: "Expedite Consult LLC", img: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&auto=format&fit=crop&q=80" },
            { name: "SpheraNet Campus", img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=60&auto=format&fit=crop&q=80" },
          ].map(s => (
            <div key={s.name} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px", borderRadius: "8px", cursor: "pointer",
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a3b3c")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#e4e6eb" }}>{s.name}</span>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ marginTop: "20px", paddingLeft: "8px" }}>
          <p style={{ fontSize: "12px", color: "#8a8d91", lineHeight: "1.8", margin: 0 }}>
            Privacy · Terms · Advertising · Ad Choices ·
            Cookies · More · SpheraNet © 2026
          </p>
        </div>
      </aside>
    </div>
  );
}
