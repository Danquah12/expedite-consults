"use client";

import { useState } from "react";
import {
  Gamepad2, Trophy, Flame, Play, Eye, Users,
  Sparkles, Radio, Swords, ChevronRight, ShieldCheck,
  Award, TrendingUp, Filter, CheckCircle2
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StreamItem {
  id: string;
  creator: { name: string; handle: string; avatar: string; verified?: boolean };
  title: string;
  game: string;
  viewers: number;
  thumbnail: string;
  isLive?: boolean;
}

interface Tournament {
  id: string;
  title: string;
  game: string;
  gameBanner: string;
  prizePool: string;
  registeredSquads: number;
  maxSquads: number;
  status: "LIVE NOW" | "REGISTRATION OPEN" | "STARTS SOON";
  date: string;
  organizer: string;
}

const mockStreams: StreamItem[] = [
  {
    id: "st-1",
    creator: { name: "Kai Nakamura", handle: "@kai_fps", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Radiant Ranked 1v1s + Custom AI Bot Arena Builds",
    game: "Valorant",
    viewers: 2840,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
  {
    id: "st-2",
    creator: { name: "Zara Williams", handle: "@zara.w", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Speedrun Any% WR Attempts · Lo-Fi Beats & Chat Q&A",
    game: "Cyberpunk 2077",
    viewers: 1420,
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
  {
    id: "st-3",
    creator: { name: "Elena Vasquez", handle: "@elena_v", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", verified: true },
    title: "Apex Legends Predator Ranked Grind w/ Pro Collegiate Squad",
    game: "Apex Legends",
    viewers: 4050,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    isLive: true,
  },
];

const mockTournaments: Tournament[] = [
  {
    id: "tourn-1",
    title: "Sphera Collegiate Champions Cup — Season 4 Grand Finals",
    game: "Valorant",
    gameBanner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
    prizePool: "$5,000 USD",
    registeredSquads: 32,
    maxSquads: 32,
    status: "LIVE NOW",
    date: "Grand Finals Bo5 · Live Now",
    organizer: "UMD Esports & Sphera Gaming",
  },
  {
    id: "tourn-2",
    title: "DMV Regional Campus Showdown 2026",
    game: "Super Smash Bros. Ultimate",
    gameBanner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80",
    prizePool: "$1,500 USD",
    registeredSquads: 58,
    maxSquads: 64,
    status: "REGISTRATION OPEN",
    date: "Saturday · 4:00 PM EST",
    organizer: "DMV Smash Collegiate League",
  },
  {
    id: "tourn-3",
    title: "Tri-State 3v3 Weekend Invitational",
    game: "Rocket League",
    gameBanner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80",
    prizePool: "$800 USD",
    registeredSquads: 18,
    maxSquads: 24,
    status: "REGISTRATION OPEN",
    date: "Sunday · 2:00 PM EST",
    organizer: "Sphera Gaming Guild",
  },
  {
    id: "tourn-4",
    title: "Collegiate Predator Trios Championship",
    game: "Apex Legends",
    gameBanner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    prizePool: "$2,500 USD",
    registeredSquads: 19,
    maxSquads: 20,
    status: "STARTS SOON",
    date: "Next Friday · 7:00 PM EST",
    organizer: "East Coast Esports Alliance",
  },
];

export default function GamingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Games");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "48px" }}>
      {/* ── Match Score Ticker Bar ───────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          overflowX: "auto",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontWeight: "900", color: "#ef4444", textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px" }}>LIVE MATCHES</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>UMD Terrapins</span>
            <span style={{ backgroundColor: "var(--bg-input)", color: "var(--accent-cyan)", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>13</span>
            <span style={{ color: "var(--text-muted)" }}>vs</span>
            <span style={{ backgroundColor: "var(--bg-input)", color: "#ef4444", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>9</span>
            <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>CyberMatrix</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>(Valorant Finals)</span>
          </div>

          <div style={{ width: "1px", height: "16px", backgroundColor: "var(--border-subtle)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>Orbit DC</span>
            <span style={{ backgroundColor: "var(--bg-input)", color: "var(--accent-cyan)", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>2</span>
            <span style={{ color: "var(--text-muted)" }}>vs</span>
            <span style={{ backgroundColor: "var(--bg-input)", color: "#ef4444", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>1</span>
            <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>Sentinels Acad</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>(Smash Finals)</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
            🏆 Radiant Master 2450 MMR
          </span>
        </div>
      </div>

      {/* ── Grand Finals Hero Stage ───────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: "28px",
          overflow: "hidden",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0, 212, 255, 0.15)",
        }}
      >
        {/* Background Image with Cinematic Gradient */}
        <div style={{ height: "300px", width: "100%", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"
            alt="Esports Arena"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(8,9,13,0.95) 0%, rgba(8,9,13,0.75) 50%, rgba(8,9,13,0.4) 100%)",
            }}
          />
        </div>

        {/* Hero Overlay Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ backgroundColor: "#ef4444", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
              <Radio size={12} className="animate-pulse" /> GRAND FINALS LIVE
            </span>
            <span style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
              SEASON 4 VALORANT
            </span>
          </div>

          <div style={{ maxWidth: "620px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#ffffff", margin: 0, lineHeight: "1.2", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              Sphera Collegiate Champions Cup — <span style={{ color: "#00d4ff" }}>Finals</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "8px 0 0 0", lineHeight: "1.5" }}>
              Top 32 university squads battling for the verified $5,000 cash bounty and the official Sphera Esports trophy.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>VERIFIED BOUNTY</p>
                <p style={{ fontSize: "22px", fontWeight: "900", color: "#10b981", margin: "2px 0 0 0" }}>$5,000 USD</p>
              </div>
              <div style={{ width: "1px", height: "30px", backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div>
                <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>LIVE VIEWERS</p>
                <p style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", margin: "2px 0 0 0" }}>14.8K Watching</p>
              </div>
            </div>

            <button
              style={{
                background: "linear-gradient(135deg, #00d4ff, #0284c7)",
                color: "#08090d",
                border: "none",
                borderRadius: "14px",
                padding: "14px 28px",
                fontSize: "14px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 0 25px rgba(0, 212, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Play size={16} fill="#08090d" /> Watch 4K Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Creator Streams ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={18} color="#ef4444" />
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Live Creator Streams</h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "700", cursor: "pointer" }}>Browse All Channels →</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {mockStreams.map((st) => (
            <div
              key={st.id}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
            >
              {/* Thumbnail 16:9 */}
              <div style={{ position: "relative", width: "100%", height: "170px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={st.thumbnail} alt={st.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "#ef4444", color: "#ffffff", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "900" }}>
                  LIVE
                </div>
                <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", color: "#ffffff", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
                  {formatNumber(st.viewers)} viewers
                </div>
                <div style={{ position: "absolute", bottom: "10px", left: "10px", backgroundColor: "rgba(0,212,255,0.2)", border: "1px solid rgba(0,212,255,0.4)", color: "#00d4ff", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" }}>
                  {st.game}
                </div>
              </div>

              {/* Creator Info */}
              <div style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ height: "40px", width: "40px", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={st.creator.avatar} alt={st.creator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {st.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>{st.creator.name}</span>
                    {st.creator.verified && <CheckCircle2 size={12} color="var(--accent-cyan)" fill="var(--accent-cyan)" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Tournaments & Brackets Grid ────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Swords size={18} color="#f59e0b" />
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Active Tournaments & Brackets</h2>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px" }}>
            {["All Games", "Valorant", "Smash", "Rocket League", "Apex"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: selectedCategory === cat ? "800" : "600",
                  backgroundColor: selectedCategory === cat ? "var(--accent-cyan)" : "var(--bg-card)",
                  color: selectedCategory === cat ? "#08090d" : "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "20px" }}>
          {mockTournaments.map((t) => {
            const isLive = t.status === "LIVE NOW";
            const progress = (t.registeredSquads / t.maxSquads) * 100;

            return (
              <div
                key={t.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: isLive ? "1px solid rgba(0, 212, 255, 0.4)" : "1px solid var(--border-subtle)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "900", color: isLive ? "#ef4444" : "#10b981", backgroundColor: isLive ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                          {t.status}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700" }}>{t.game}</span>
                      </div>
                      <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>{t.title}</h3>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>Hosted by {t.organizer} · {t.date}</p>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>PRIZE BOUNTY</p>
                      <p style={{ fontSize: "18px", fontWeight: "900", color: "#10b981", margin: 0 }}>{t.prizePool}</p>
                    </div>
                  </div>

                  {/* Registered Squads Progress Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Squads Registered</span>
                      <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>{t.registeredSquads} / {t.maxSquads}</span>
                    </div>
                    <div style={{ height: "6px", width: "100%", backgroundColor: "var(--bg-input)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, backgroundColor: isLive ? "#00d4ff" : "#10b981", borderRadius: "9999px" }} />
                    </div>
                  </div>
                </div>

                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Bracket Type: <strong style={{ color: "var(--text-pure)" }}>Double Elimination</strong>
                  </span>

                  <button
                    style={{
                      background: isLive ? "linear-gradient(135deg, #00d4ff, #0284c7)" : "var(--bg-card)",
                      color: isLive ? "#08090d" : "var(--text-pure)",
                      border: isLive ? "none" : "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "8px 18px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: isLive ? "0 0 15px rgba(0, 212, 255, 0.3)" : "none",
                    }}
                  >
                    {isLive ? "Watch Finals ▶" : "Register Squad"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
