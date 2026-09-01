"use client";

import { useState } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Hand, Users,
  X, ChevronUp, ChevronDown, Radio, Sparkles,
  Music, Flame, MessageSquare, Headphones
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Stage {
  id: string;
  title: string;
  topic: string;
  category: "Campus" | "Founders" | "Gaming";
  host: { name: string; img: string; role: string };
  speakers: { name: string; img: string; isSpeaking?: boolean }[];
  listenerCount: number;
}

const activeStages: Stage[] = [
  {
    id: "stg-campus",
    title: "CMSC 414 & 420 Study Lounge (24/7 Lo-Fi)",
    topic: "Midterm Review, Zero-Trust Enclaves & Group Prep",
    category: "Campus",
    host: { name: "Aisha Mensah", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", role: "TA @ UMD" },
    speakers: [
      { name: "Aisha Mensah", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", isSpeaking: true },
      { name: "Jordan Park", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { name: "David Osei", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    ],
    listenerCount: 48,
  },
  {
    id: "stg-founders",
    title: "DMV Tech Founders & Angel Syndicate Stage",
    topic: "Autonomous AI Agent Commercialization & GovTech",
    category: "Founders",
    host: { name: "Marcus Johnson", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", role: "Venture Partner" },
    speakers: [
      { name: "Marcus Johnson", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", isSpeaking: true },
      { name: "Zara Williams", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" },
    ],
    listenerCount: 192,
  },
];

export function LiveStageDock() {
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  const joinStage = (stage: Stage) => {
    setCurrentStage(stage);
    setIsExpanded(true);
  };

  const leaveStage = () => {
    setCurrentStage(null);
    setIsExpanded(false);
    setHandRaised(false);
  };

  if (!currentStage) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 40,
        }}
      >
        <button
          onClick={() => joinStage(activeStages[0])}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 20px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
            cursor: "pointer",
            fontWeight: "800",
            fontSize: "13px",
            transition: "all 0.2s ease",
          }}
        >
          <Radio size={16} className="animate-pulse" />
          <span>Join Live Study Stage ({activeStages[0].listenerCount} in room)</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Persistent Floating Audio Pill ──────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          padding: "10px 18px",
          borderRadius: "9999px",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#10b981", animation: "pulse 1.5s infinite" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-pure)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentStage.title}
            </span>
            <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700" }}>
              ● Live Audio Stage · {formatNumber(currentStage.listenerCount)} in room
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "9999px",
              backgroundColor: isMuted ? "var(--bg-card-hover)" : "rgba(16, 185, 129, 0.2)",
              color: isMuted ? "var(--text-muted)" : "#10b981",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Expand Modal */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "9999px",
              backgroundColor: "var(--bg-card-hover)",
              color: "var(--text-pure)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* Leave Stage */}
          <button
            onClick={leaveStage}
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "9999px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Expandable Stage Theatre Modal ──────────────────────────── */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(14px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "620px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Stage Header */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ backgroundColor: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "900" }}>
                    LIVE STAGE
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>
                    Host: {currentStage.host.name}
                  </span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: "4px 0 0 0" }}>
                  {currentStage.title}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--accent-cyan)", margin: "2px 0 0 0", fontWeight: "700" }}>
                  {currentStage.topic}
                </p>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                style={{ height: "36px", width: "36px", borderRadius: "9999px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Speaker Podium Grid */}
            <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  SPEAKERS ON STAGE ({currentStage.speakers.length})
                </span>

                <div style={{ display: "flex", gap: "24px", paddingTop: "14px", flexWrap: "wrap" }}>
                  {currentStage.speakers.map((sp) => (
                    <div key={sp.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          height: "72px",
                          width: "72px",
                          borderRadius: "9999px",
                          padding: "3px",
                          background: sp.isSpeaking ? "linear-gradient(135deg, #10b981, #00d4ff)" : "var(--border-subtle)",
                          boxShadow: sp.isSpeaking ? "0 0 20px rgba(16, 185, 129, 0.5)" : "none",
                          position: "relative",
                        }}
                      >
                        <div style={{ width: "100%", height: "100%", borderRadius: "9999px", overflow: "hidden", backgroundColor: "var(--bg-surface)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sp.img} alt={sp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        {sp.isSpeaking && (
                          <span style={{ position: "absolute", bottom: "0", right: "0", height: "14px", width: "14px", borderRadius: "9999px", backgroundColor: "#10b981", border: "2px solid var(--bg-card)" }} />
                        )}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-pure)" }}>{sp.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  onClick={() => setHandRaised(!handRaised)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    backgroundColor: handRaised ? "rgba(245, 158, 11, 0.2)" : "var(--bg-surface)",
                    color: handRaised ? "#f59e0b" : "var(--text-pure)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  <Hand size={16} />
                  <span>{handRaised ? "Hand Raised ✋" : "Raise Hand"}</span>
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "12px",
                      backgroundColor: isMuted ? "var(--bg-surface)" : "#10b981",
                      color: isMuted ? "var(--text-pure)" : "#ffffff",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isMuted ? "Unmute Mic" : "Muted"}</span>
                  </button>

                  <button
                    onClick={leaveStage}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Leave Quietly
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
