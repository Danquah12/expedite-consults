"use client";

import { useState } from "react";
import {
  Heart, MessageCircle, Share2, Bookmark, Music,
  Volume2, VolumeX, Play, Flame, ChevronUp, ChevronDown
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Reel {
  id: string;
  author: { name: string; username: string; img: string; followers: number };
  caption: string;
  music: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  bgImg: string;
}

const mockReels: Reel[] = [
  {
    id: "r1",
    author: { name: "Amara Diallo", username: "amara_creates", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", followers: 248000 },
    caption: "The glow up is real 🔥 From broke college student building in the dark to shipping products used by millions worldwide. Keep going. 💫",
    music: "Afrobeats Future Mix Vol. 4 — DJ Khaled",
    hashtags: ["#motivation", "#techlife", "#buildInPublic", "#sphera"],
    likeCount: 182400,
    commentCount: 3210,
    shareCount: 8900,
    saveCount: 12300,
    bgImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    isLiked: true,
  },
  {
    id: "r2",
    author: { name: "Marcus Johnson", username: "mj_tech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", followers: 94000 },
    caption: "5 VS Code & AI shortcuts that changed my development workflow in 2026. Number 3 will save you 2 hours every day 🤯",
    music: "Lo-Fi Study Beats — ChillHop Cafe",
    hashtags: ["#coding", "#webdev", "#programming", "#vscode"],
    likeCount: 94200,
    commentCount: 1780,
    shareCount: 14200,
    saveCount: 31000,
    bgImg: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80",
  },
];

export default function ReelsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const currentReel = mockReels[activeIndex];

  const goNext = () => setActiveIndex((i) => Math.min(i + 1, mockReels.length - 1));
  const goPrev = () => setActiveIndex((i) => Math.max(i - 1, 0));

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0" }}>
      {/* ── Vertical Theater Canvas ───────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "calc(100vh - 120px)",
          maxHeight: "760px",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "#10121a",
          border: "1px solid #1c202e",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Background Visual */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentReel.bgImg} alt="Reel video" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,9,13,0.95) 0%, transparent 40%, rgba(8,9,13,0.5) 100%)" }} />
        </div>

        {/* Top Header */}
        <div style={{ position: "relative", zIndex: 10, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", color: "#ffffff", padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
            <Flame size={14} color="#ec4899" /> For You
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "none", color: "#ffffff", height: "36px", width: "36px", borderRadius: "9999px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Center Play Button if paused */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ position: "absolute", inset: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}
        >
          {!isPlaying && (
            <div style={{ height: "64px", width: "64px", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.7)", border: "2px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={28} fill="#ffffff" color="#ffffff" style={{ marginLeft: "4px" }} />
            </div>
          )}
        </button>

        {/* Right Floating Actions */}
        <div style={{ position: "absolute", right: "16px", bottom: "110px", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          {/* Creator Avatar */}
          <div style={{ position: "relative" }}>
            <div style={{ height: "46px", width: "46px", borderRadius: "9999px", overflow: "hidden", border: "2px solid #00d4ff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentReel.author.img} alt={currentReel.author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#00d4ff", color: "#08090d", fontSize: "10px", fontWeight: "900", borderRadius: "9999px", padding: "1px 5px" }}>
              +
            </span>
          </div>

          {/* Like */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ height: "42px", width: "42px", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={22} color={currentReel.isLiked ? "#ef4444" : "#ffffff"} fill={currentReel.isLiked ? "#ef4444" : "none"} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff" }}>{formatNumber(currentReel.likeCount)}</span>
          </div>

          {/* Comment */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ height: "42px", width: "42px", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
              <MessageCircle size={22} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff" }}>{formatNumber(currentReel.commentCount)}</span>
          </div>

          {/* Share */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ height: "42px", width: "42px", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
              <Share2 size={22} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff" }}>{formatNumber(currentReel.shareCount)}</span>
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div style={{ position: "relative", zIndex: 10, padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#ffffff" }}>@{currentReel.author.username}</span>
            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "6px" }}>· {formatNumber(currentReel.author.followers)} followers</span>
          </div>

          <p style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.5", margin: 0 }}>
            {currentReel.caption}
          </p>

          <div style={{ display: "flex", gap: "6px" }}>
            {currentReel.hashtags.map((h) => (
              <span key={h} style={{ fontSize: "12px", fontWeight: "800", color: "#00d4ff" }}>
                {h}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", padding: "6px 12px", borderRadius: "9999px", alignSelf: "flex-start" }}>
            <Music size={13} color="#00d4ff" />
            <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: "600", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentReel.music}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
