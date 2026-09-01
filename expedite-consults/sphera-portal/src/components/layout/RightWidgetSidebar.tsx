"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, TrendingUp, Users, Radio, Calendar,
  ShieldCheck, ArrowUpRight, Flame, ShoppingBag, ExternalLink,
  Cpu, Database, Activity, Lock
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const liveEsports = [
  { team1: "UMD Terps", score1: 13, team2: "CyberGuild", score2: 9, game: "Valorant" },
  { team1: "Orbit DC", score1: 2, team2: "Sentinels", score2: 1, game: "Smash" },
];

const trendingTopics = [
  { tag: "#SpheraLaunch", posts: "48.9K", category: "Technology" },
  { tag: "#CyberDefense2026", posts: "32.4K", category: "Security" },
  { tag: "#BitcampHackathon", posts: "18.2K", category: "Campus" },
  { tag: "#ValorantCollegiate", posts: "14.5K", category: "Esports" },
];

const onlineFriends = [
  { name: "Amara Diallo", handle: "@amara_creates", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", status: "Building in dark" },
  { name: "Marcus Johnson", handle: "@mj_tech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", status: "Testing Enclave" },
  { name: "Zara Williams", handle: "@zara.w", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", status: "Hackathon Lead" },
  { name: "Elena Vasquez", handle: "@elena_v", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", status: "Designing UI" },
];

export function RightWidgetSidebar() {
  const pathname = usePathname();

  if (pathname === "/reels") {
    return null;
  }

  const isAiPage = pathname === "/ai";

  return (
    <aside
      style={{
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        flexShrink: 0,
      }}
    >
      {/* ── Top Contextual Widget (Customized for AI Page vs General) ─ */}
      {isAiPage ? (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "14px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Model Diagnostics</h3>
            </div>
            <span style={{ fontSize: "9px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: "6px" }}>
              HEALTHY
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Inference Latency:</span>
              <span style={{ fontWeight: "800", color: "var(--accent-cyan)" }}>34 ms</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Context Window:</span>
              <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>2,000,000 tokens</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Zero-Trust Enclave:</span>
              <span style={{ fontWeight: "800", color: "#10b981" }}>Active & Encrypted</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Active Index:</span>
              <span style={{ fontWeight: "800", color: "var(--text-pure)" }}>15 Worlds Indexed</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "14px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>SpheraNet AI Copilot</h3>
            </div>
            <span style={{ fontSize: "9px", fontWeight: "900", color: "var(--accent-cyan)", backgroundColor: "rgba(0,212,255,0.2)", padding: "2px 6px", borderRadius: "6px" }}>
              ONLINE
            </span>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
            Autonomous co-pilot for TS/SCI bounty matching, local escrow deals, and instant social graph indexing.
          </p>

          <Link
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
              boxShadow: "0 0 12px rgba(0, 212, 255, 0.3)",
            }}
          >
            Open AI Terminal →
          </Link>
        </div>
      )}

      {/* ── Live Esports & Match Ticker ───────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={16} color="#ef4444" />
            <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>Live Match Scores</h3>
          </div>
          <Link href="/gaming" style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textDecoration: "none" }}>Arena →</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {liveEsports.map((m, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>{m.team1} vs {m.team2}</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{m.game} Finals</p>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "var(--accent-cyan)", backgroundColor: "var(--bg-card)", padding: "2px 6px", borderRadius: "6px" }}>{m.score1}</span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>-</span>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "#ef4444", backgroundColor: "var(--bg-card)", padding: "2px 6px", borderRadius: "6px" }}>{m.score2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Online Graph ───────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} color="#10b981" />
            <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>Active Network (4)</h3>
          </div>
          <Link href="/friends" style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textDecoration: "none" }}>All</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {onlineFriends.map((f) => (
            <Link
              key={f.handle}
              href="/messages"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{ height: "36px", width: "36px", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.img} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ position: "absolute", bottom: "0", right: "0", height: "9px", width: "9px", borderRadius: "9999px", backgroundColor: "#10b981", border: "2px solid var(--bg-card)" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-pure)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{f.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trending Tags ─────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <TrendingUp size={16} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: 0 }}>Trending on SpheraNet</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trendingTopics.map((t) => (
            <div key={t.tag} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, fontWeight: "700" }}>{t.category}</p>
                <p style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-cyan)", margin: "1px 0 0 0" }}>{t.tag}</p>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>{t.posts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{ padding: "0 10px", fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.6" }}>
        <p style={{ margin: 0 }}>
          <span>Privacy</span> · <span>Terms</span> · <span>Security</span> · <span>Zero-Trust API</span>
        </p>
        <p style={{ margin: "4px 0 0 0", fontWeight: "700", color: "var(--text-muted)" }}>
          © 2026 SPHERANET BY EXPEDITE CONSULTS
        </p>
      </div>
    </aside>
  );
}
