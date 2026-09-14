"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Eye,
  FileText,
  DollarSign
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { PostWithDetails } from "@/types";

interface SpheraPulseThreadCardProps {
  post: PostWithDetails;
  onLike?: (id: string) => void;
  onRepost?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function SpheraPulseThreadCard({
  post,
  onLike,
  onRepost,
  onSave,
}: SpheraPulseThreadCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post._count.reactions || 0);
  const [reposted, setReposted] = useState(post.isReposted ?? false);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
  const [saved, setSaved] = useState(post.isSaved ?? false);

  const handleToggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikesCount(prev => next ? prev + 1 : prev - 1);
    if (onLike) onLike(post.id);
  };

  const handleToggleRepost = () => {
    const next = !reposted;
    setReposted(next);
    setRepostsCount(prev => next ? prev + 1 : prev - 1);
    if (onRepost) onRepost(post.id);
  };

  const handleToggleSave = () => {
    setSaved(!saved);
    if (onSave) onSave(post.id);
  };

  const hasThreadReplies = post.threadReplies && post.threadReplies.length > 0;
  const threadCount = post.threadTotal || (hasThreadReplies ? post.threadReplies!.length + 1 : 1);

  return (
    <article
      style={{
        backgroundColor: "var(--bg-card, #111218)",
        border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        marginBottom: "16px",
      }}
    >
      {/* ── Top Header / Repost Indicator ─────────────────────────── */}
      {post.repostOf && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px 0 16px",
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--text-muted, #64748b)",
          }}
        >
          <Repeat2 size={13} color="var(--accent-cyan, #00d4ff)" />
          <span>Kwesi Asiedu reposted</span>
        </div>
      )}

      {/* ── Root Post (1/N) ───────────────────────────────────────── */}
      <div style={{ padding: "14px 16px 10px 16px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          {/* Avatar + Thread Connector */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px", flexShrink: 0 }}>
            <Link href={`/profile/${post.author.profile?.username || 'user'}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  height: "38px",
                  width: "38px",
                  borderRadius: "9999px",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                  backgroundColor: "#1e293b",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.author.profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={post.author.profile?.displayName || "User"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Link>

            {hasThreadReplies && (
              <div
                style={{
                  width: "2px",
                  flex: 1,
                  backgroundColor: "rgba(0, 212, 255, 0.3)",
                  margin: "6px 0",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>

          {/* Main Body */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-pure, #ffffff)" }}>
                  {post.author.profile?.displayName || "User"}
                </span>
                {post.author.profile?.isVerified && (
                  <CheckCircle2 size={14} color="#00d4ff" fill="#00d4ff" />
                )}
                <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)" }}>
                  @{post.author.profile?.username || "user"} · 2h
                </span>
                {threadCount > 1 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      backgroundColor: "rgba(0, 212, 255, 0.15)",
                      color: "var(--accent-cyan, #00d4ff)",
                      padding: "1px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    1/{threadCount} Thread
                  </span>
                )}
              </div>

              <button style={{ background: "none", border: "none", color: "var(--text-muted, #64748b)", cursor: "pointer" }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Content text */}
            <div style={{ fontSize: "14px", color: "var(--text-pure, #ffffff)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              <FormattedContent text={post.content || ""} />
            </div>

            {/* Media if present */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  maxHeight: "360px",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.mediaUrls[0]}
                  alt="Media"
                  style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                />
              </div>
            )}

            {/* Community Note Box (if attached) */}
            {post.communityNote && (
              <div
                style={{
                  marginTop: "12px",
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={14} color="#f59e0b" />
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Community Context Note
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted, #64748b)", marginLeft: "auto" }}>
                    {post.communityNote.helpfulCount} rated helpful
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-pure, #ffffff)", margin: 0, lineHeight: "1.4" }}>
                  {post.communityNote.content}
                </p>
                {post.communityNote.sources.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    {post.communityNote.sources.map((src, i) => (
                      <span key={i} style={{ fontSize: "10px", color: "var(--accent-cyan, #00d4ff)", textDecoration: "underline", display: "flex", alignItems: "center", gap: "2px" }}>
                        Source [{i+1}] <ExternalLink size={9} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Thread Replies (2/N, 3/N...) ──────────────────────────── */}
      {hasThreadReplies && (
        <div style={{ padding: "0 16px 12px 16px" }}>
          {post.threadReplies!.map((reply, idx) => (
            <div key={reply.id || idx} style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px", flexShrink: 0 }}>
                <div
                  style={{
                    height: "32px",
                    width: "32px",
                    borderRadius: "9999px",
                    overflow: "hidden",
                    border: "1px solid rgba(0, 212, 255, 0.4)",
                    backgroundColor: "#1e293b",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reply.author.profile?.avatar || post.author.profile?.avatar || ""}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                {idx < post.threadReplies!.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      backgroundColor: "rgba(0, 212, 255, 0.3)",
                      margin: "4px 0",
                      borderRadius: "1px",
                      minHeight: "24px",
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure, #ffffff)" }}>
                    {reply.author.profile?.displayName || post.author.profile?.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "800",
                      backgroundColor: "rgba(0, 212, 255, 0.15)",
                      color: "var(--accent-cyan, #00d4ff)",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    {idx + 2}/{threadCount}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary, #cbd5e1)", lineHeight: "1.5" }}>
                  <FormattedContent text={reply.content || ""} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pulse Action Bar (Comments / Reposts / Likes / Views / Save) ── */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Comment */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "var(--text-muted, #64748b)",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "8px",
          }}
          title="Reply to Pulse"
        >
          <MessageCircle size={16} />
          <span>{formatNumber(post._count.comments)}</span>
        </button>

        {/* Repost / Retweet */}
        <button
          onClick={handleToggleRepost}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: reposted ? "#10b981" : "var(--text-muted, #64748b)",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "8px",
          }}
          title="Repost Pulse"
        >
          <Repeat2 size={16} />
          <span>{formatNumber(repostsCount)}</span>
        </button>

        {/* Like */}
        <button
          onClick={handleToggleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: liked ? "#ec4899" : "var(--text-muted, #64748b)",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "8px",
          }}
          title="Like Pulse"
        >
          <Heart size={16} fill={liked ? "#ec4899" : "none"} />
          <span>{formatNumber(likesCount)}</span>
        </button>

        {/* View Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--text-muted, #64748b)",
            fontSize: "12px",
            fontWeight: "700",
          }}
          title="Views"
        >
          <Eye size={15} />
          <span>{formatNumber(post.viewsCount || 1420)}</span>
        </div>

        {/* Save */}
        <button
          onClick={handleToggleSave}
          style={{
            background: "none",
            border: "none",
            color: saved ? "var(--accent-cyan, #00d4ff)" : "var(--text-muted, #64748b)",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "8px",
          }}
          title="Bookmark"
        >
          <Bookmark size={16} fill={saved ? "var(--accent-cyan, #00d4ff)" : "none"} />
        </button>
      </div>
    </article>
  );
}

function FormattedContent({ text }: { text: string }) {
  const parts = text.split(/(#\w+|@\w+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          return (
            <span key={i} style={{ color: "var(--accent-cyan, #00d4ff)", fontWeight: "700", cursor: "pointer" }}>
              {part}
            </span>
          );
        }
        if (part.startsWith("@")) {
          return (
            <span key={i} style={{ color: "#a5b4fc", fontWeight: "700", cursor: "pointer" }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
