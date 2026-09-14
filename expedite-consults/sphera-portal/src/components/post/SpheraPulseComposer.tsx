"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Smile,
  BarChart2,
  Globe,
  Lock,
  Users,
  Send,
  FileText,
  CheckCircle2,
} from "lucide-react";
import type { PostWithDetails } from "@/types";

interface ThreadNode {
  id: string;
  text: string;
  mediaUrl?: string;
}

interface SpheraPulseComposerProps {
  onPublish?: (post: Partial<PostWithDetails>) => void;
  inline?: boolean;
  onConvertToArticle?: (articleDraft: { title: string; content: string }) => void;
}

const MAX_CHARS = 280;

const trendingPills = [
  "#SpheraLaunch",
  "#CyberDefense2026",
  "#ZeroTrust",
  "#BitcampHackathon",
  "#UMDTerps",
];

export function SpheraPulseComposer({
  onPublish,
  inline = false,
  onConvertToArticle,
}: SpheraPulseComposerProps) {
  const [threads, setThreads] = useState<ThreadNode[]>([
    { id: "node-1", text: "" },
  ]);
  const [activeAudience, setActiveAudience] = useState<"PUBLIC" | "FRIENDS" | "PRIVATE">("PUBLIC");
  const [isArticleConverting, setIsArticleConverting] = useState(false);
  const [articleSuccess, setArticleSuccess] = useState(false);

  const updateThreadText = (id: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: text.slice(0, MAX_CHARS) } : t))
    );
  };

  const addThreadNode = () => {
    if (threads.length >= 8) return;
    setThreads((prev) => [
      ...prev,
      { id: `node-${Date.now()}`, text: "" },
    ]);
  };

  const removeThreadNode = (id: string) => {
    if (threads.length <= 1) return;
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddHashtag = (tag: string) => {
    const lastNode = threads[threads.length - 1];
    if (lastNode.text.includes(tag)) return;
    const separator = lastNode.text.length > 0 && !lastNode.text.endsWith(" ") ? " " : "";
    updateThreadText(lastNode.id, lastNode.text + separator + tag);
  };

  const handleConvertToArticle = () => {
    setIsArticleConverting(true);
    setTimeout(() => {
      setIsArticleConverting(false);
      setArticleSuccess(true);
      const combinedBody = threads.map((t, idx) => `### Part ${idx + 1}\n\n${t.text}`).join("\n\n---\n\n");
      const title = threads[0]?.text.slice(0, 60) || "SpheraNet Deep-Dive Article";

      if (onConvertToArticle) {
        onConvertToArticle({
          title: title.endsWith(".") ? title.slice(0, -1) : title,
          content: `# ${title}\n\n${combinedBody}\n\n*Originally authored as a Sphera Pulse Thread by @kwesi.*`,
        });
      }

      setTimeout(() => setArticleSuccess(false), 3000);
    }, 800);
  };

  const handlePublish = () => {
    if (!threads[0].text.trim()) return;

    const isMultiThread = threads.length > 1;
    const newPost: Partial<PostWithDetails> = {
      id: `pulse-${Date.now()}`,
      type: isMultiThread ? "THREAD" : "TEXT",
      content: threads[0].text,
      visibility: activeAudience,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      isThread: isMultiThread,
      threadIndex: 1,
      threadTotal: threads.length,
      threadReplies: isMultiThread
        ? threads.slice(1).map((t, idx) => ({
            id: `reply-${Date.now()}-${idx}`,
            type: "THREAD",
            content: t.text,
            visibility: activeAudience,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            threadIndex: idx + 2,
            threadTotal: threads.length,
            mediaUrls: t.mediaUrl ? [t.mediaUrl] : [],
            author: {
              id: "u_me",
              role: "ADMIN",
              profile: {
                username: "kwesi",
                displayName: "Kwesi Asiedu",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                bio: "Building SpheraNet sovereign social graph",
                isVerified: true,
                profileVisibility: "PUBLIC",
              },
            },
            _count: { reactions: 0, comments: 0, saves: 0, shares: 0 },
          }))
        : undefined,
      mediaUrls: threads[0].mediaUrl ? [threads[0].mediaUrl] : [],
      author: {
        id: "u_me",
        role: "ADMIN",
        profile: {
          username: "kwesi",
          displayName: "Kwesi Asiedu",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          bio: "Building SpheraNet sovereign social graph",
          isVerified: true,
          profileVisibility: "PUBLIC",
        },
      },
      _count: { reactions: 0, comments: 0, saves: 0, shares: 0 },
      viewsCount: 1,
      repostsCount: 0,
      sharesCount: 0,
    };

    if (onPublish) {
      onPublish(newPost);
    }

    setThreads([{ id: "node-1", text: "" }]);
  };

  const getProgressColor = (chars: number) => {
    const ratio = chars / MAX_CHARS;
    if (ratio > 0.9) return "#ef4444";
    if (ratio > 0.75) return "#f59e0b";
    return "var(--accent-cyan, #00d4ff)";
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card, #111218)",
        border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
        borderRadius: inline ? "16px" : "20px",
        padding: "16px 20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        position: "relative",
      }}
    >
      {/* Pulse Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              height: "24px",
              width: "24px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00d4ff, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#08090d",
              fontWeight: "900",
              fontSize: "12px",
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure, #ffffff)", letterSpacing: "0.3px" }}>
            Sphera Pulse
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "var(--accent-cyan, #00d4ff)",
              backgroundColor: "rgba(0, 212, 255, 0.12)",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            Real-time Discussion
          </span>
        </div>

        {/* Audience Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <select
            value={activeAudience}
            onChange={(e) => setActiveAudience(e.target.value as any)}
            style={{
              backgroundColor: "var(--bg-input, #181922)",
              color: "var(--text-secondary, #94a3b8)",
              border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
              borderRadius: "8px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: "700",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="PUBLIC">🌐 Everyone</option>
            <option value="FRIENDS">👥 Campus Network</option>
            <option value="PRIVATE">🔒 Sovereign Enclave</option>
          </select>
        </div>
      </div>

      {/* Thread Chain Nodes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {threads.map((node, index) => {
          const charCount = node.text.length;
          const isLast = index === threads.length - 1;

          return (
            <div key={node.id} style={{ display: "flex", gap: "12px", position: "relative" }}>
              {/* Left Column: Avatar + Connector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px", flexShrink: 0 }}>
                <div
                  style={{
                    height: "36px",
                    width: "36px",
                    borderRadius: "9999px",
                    overflow: "hidden",
                    border: "2px solid rgba(0, 212, 255, 0.4)",
                    backgroundColor: "#1e293b",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                    alt="Kwesi Asiedu"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {!isLast && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      backgroundColor: "rgba(0, 212, 255, 0.3)",
                      margin: "4px 0",
                      borderRadius: "1px",
                      minHeight: "36px",
                    }}
                  />
                )}
              </div>

              {/* Right Column: Textarea */}
              <div style={{ flex: 1, paddingBottom: isLast ? "12px" : "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--accent-cyan, #00d4ff)" }}>
                    {threads.length > 1 ? `Thread ${index + 1}/${threads.length}` : "Kwesi Asiedu · @kwesi"}
                  </span>

                  {threads.length > 1 && (
                    <button
                      onClick={() => removeThreadNode(node.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted, #64748b)",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      title="Remove thread part"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <textarea
                  value={node.text}
                  onChange={(e) => updateThreadText(node.id, e.target.value)}
                  placeholder={
                    index === 0
                      ? "What is happening on campus or in your sovereign stack? (280 chars)"
                      : "Add to thread / continue your line of thought..."
                  }
                  rows={index === 0 ? 3 : 2}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-pure, #ffffff)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />

                {/* Progress Ring */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                  <div style={{ position: "relative", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke={getProgressColor(charCount)}
                        strokeWidth="2.5"
                        strokeDasharray={56.54}
                        strokeDashoffset={56.54 - (56.54 * (charCount / MAX_CHARS))}
                        strokeLinecap="round"
                        transform="rotate(-90 12 12)"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: charCount >= MAX_CHARS ? "#ef4444" : "var(--text-muted, #64748b)",
                    }}
                  >
                    {MAX_CHARS - charCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Hashtags */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          padding: "8px 0 12px 48px",
          borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--text-muted, #64748b)", fontWeight: "700", display: "flex", alignItems: "center" }}>
          Suggested:
        </span>
        {trendingPills.map((tag) => (
          <button
            key={tag}
            onClick={() => handleAddHashtag(tag)}
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "11px",
              color: "var(--accent-cyan, #00d4ff)",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Footer Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={addThreadNode}
            disabled={threads.length >= 8}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(0, 212, 255, 0.1)",
              border: "1px solid rgba(0, 212, 255, 0.25)",
              color: "var(--accent-cyan, #00d4ff)",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
            }}
            title="Add another post to make a 1/N thread"
          >
            <Plus size={13} />
            <span>Add Thread</span>
          </button>

          <button
            onClick={handleConvertToArticle}
            disabled={isArticleConverting || !threads[0].text.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: articleSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.1)",
              border: articleSuccess ? "1px solid #10b981" : "1px solid rgba(99, 102, 241, 0.3)",
              color: articleSuccess ? "#10b981" : "#a5b4fc",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: "800",
              cursor: !threads[0].text.trim() ? "not-allowed" : "pointer",
              opacity: !threads[0].text.trim() ? 0.5 : 1,
            }}
            title="Convert this thread into a full longform article with AI structuring"
          >
            {articleSuccess ? (
              <>
                <CheckCircle2 size={13} />
                <span>Article Created!</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>{isArticleConverting ? "Synthesizing..." : "Thread → Article"}</span>
              </>
            )}
          </button>

          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary, #94a3b8)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
            title="Attach media"
          >
            <ImageIcon size={16} />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary, #94a3b8)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
            title="Create poll"
          >
            <BarChart2 size={16} />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary, #94a3b8)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
            title="Add emoji"
          >
            <Smile size={16} />
          </button>
        </div>

        <button
          onClick={handlePublish}
          disabled={!threads[0].text.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: !threads[0].text.trim()
              ? "rgba(255,255,255,0.1)"
              : "linear-gradient(135deg, #00d4ff, #0284c7)",
            color: !threads[0].text.trim() ? "var(--text-muted, #64748b)" : "#08090d",
            border: "none",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: "900",
            cursor: !threads[0].text.trim() ? "not-allowed" : "pointer",
            boxShadow: threads[0].text.trim() ? "0 0 14px rgba(0, 212, 255, 0.4)" : "none",
            transition: "all 0.15s ease",
          }}
        >
          <Send size={14} />
          <span>{threads.length > 1 ? `Post Thread (${threads.length})` : "Pulse"}</span>
        </button>
      </div>
    </div>
  );
}
