"use client";

import { useState } from "react";
import {
  GraduationCap, BookOpen, Users, Calendar, Award,
  Sparkles, ShieldCheck, MapPin, Clock, ArrowUpRight,
  Headphones, Radio, MessageSquare, ThumbsUp, Home,
  ShoppingBag, Flame, CheckCircle2, ChevronRight, Play
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface CourseLounge {
  code: string;
  name: string;
  prof: string;
  profAvatar: string;
  time: string;
  activeStudents: number;
  currentTopic: string;
  studentAvatars: string[];
}

const mockCourses: CourseLounge[] = [
  {
    code: "CMSC 414",
    name: "Computer & Network Security",
    prof: "Dr. Michael Hicks",
    profAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    time: "Tue / Thu · 2:00 PM",
    activeStudents: 38,
    currentTopic: "Midterm 1 Review · Buffer Overflow & Enclaves",
    studentAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    ],
  },
  {
    code: "CMSC 420",
    name: "Data Structures & Advanced Algorithms",
    prof: "Dr. Dave Mount",
    profAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    time: "Mon / Wed · 11:00 AM",
    activeStudents: 54,
    currentTopic: "AVL Trees & Spatial KD-Tree Indexing",
    studentAvatars: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    ],
  },
  {
    code: "CMSC 436",
    name: "Distributed Systems & Cloud Computing",
    prof: "Dr. Bobby Bhattacharjee",
    profAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    time: "Tue / Thu · 12:30 PM",
    activeStudents: 29,
    currentTopic: "Raft Consensus & Distributed Key-Value Stores",
    studentAvatars: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    ],
  },
];

const mockCampusClubs = [
  {
    name: "Bitcamp 2026 Hackathon Core",
    members: 1420,
    category: "Hackathons & Dev",
    cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    tagline: "East Coast's premier collegiate hackathon. Over $50k in cash bounties.",
  },
  {
    name: "Terrapin Cyber Defense Guild",
    members: 890,
    category: "Cybersecurity & CTF",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    tagline: "NSA/DoD collegiate cyber challenge winners. Weekly attack & defense drills.",
  },
  {
    name: "UMD Terrapin Esports & Gaming",
    members: 1840,
    category: "Esports & Tournaments",
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80",
    tagline: "Official Valorant, Smash, and Rocket League rosters & viewing arena.",
  },
];

const mockMarketDeals = [
  {
    title: "Courtyards at UMD 4B/4B Spring Sublease",
    price: "$850 / mo",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=80",
    location: "Courtyards Building 300",
    seller: "Elena V.",
  },
  {
    title: "CMSC 414 Textbook + Lab Guide (Mint Condition)",
    price: "$35",
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    location: "Iribe Center Pickup",
    seller: "Marcus J.",
  },
];

export default function CampusPage() {
  const [activeTab, setActiveTab] = useState("All Courses");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "48px" }}>
      {/* ── Cinematic Campus Hero ─────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: "28px",
          overflow: "hidden",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.15)",
        }}
      >
        <div style={{ height: "260px", width: "100%", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
            alt="Collegiate Campus"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(8,9,13,0.95) 0%, rgba(8,9,13,0.8) 55%, rgba(8,9,13,0.4) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ backgroundColor: "#10b981", color: "#08090d", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "900" }}>
              CAMPUS OPERATING SYSTEM
            </span>
            <span style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
              University of Maryland Hub
            </span>
          </div>

          <div style={{ maxWidth: "640px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#ffffff", margin: 0, lineHeight: "1.2" }}>
              Academic Lounges, Study Guilds & <span style={{ color: "#10b981" }}>Collegiate Career Hub</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "6px 0 0 0", lineHeight: "1.5" }}>
              Connect with classmates, join 24/7 lo-fi study voice rooms, trade campus housing, and collaborate on hackathons.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", padding: "6px 14px" }}>
                <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase" }}>VERIFIED GPA</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "#10b981", margin: 0 }}>3.94 / 4.0</p>
              </div>

              <div style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "6px 14px" }}>
                <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase" }}>STUDENT STATUS</span>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", margin: 0 }}>.EDU Verified ✓</p>
              </div>
            </div>

            <button
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Headphones size={16} /> Enter Campus Study Voice Stage
            </button>
          </div>
        </div>
      </div>

      {/* ── Live Course Study Lounges (Rich Visual Cards) ─────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={18} color="#10b981" />
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Live Course Study Lounges</h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "700", cursor: "pointer" }}>Browse All 48 Courses →</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {mockCourses.map((c) => (
            <div
              key={c.code}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "22px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "4px 10px", borderRadius: "8px" }}>
                    {c.code}
                  </span>
                  <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                    ● {c.activeStudents} in lounge
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                    {c.prof} · {c.time}
                  </p>
                </div>

                {/* Active Study Topic */}
                <div style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "10px 12px" }}>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>CURRENT STUDY TOPIC</p>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-pure)", margin: "2px 0 0 0" }}>{c.currentTopic}</p>
                </div>
              </div>

              {/* Student Stack & Join CTA */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {c.studentAvatars.map((av, idx) => (
                    <div key={idx} style={{ height: "28px", width: "28px", borderRadius: "9999px", overflow: "hidden", border: "2px solid var(--bg-card)", marginLeft: idx > 0 ? "-8px" : "0" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={av} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px", fontWeight: "700" }}>+{c.activeStudents - 3}</span>
                </div>

                <button
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    fontSize: "12px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 0 12px rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Headphones size={13} /> Enter Lounge →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Campus Spaces & Student Guilds ────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Campus Spaces & Student Guilds</h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "700", cursor: "pointer" }}>View All 120 Guilds →</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {mockCampusClubs.map((club) => (
            <div
              key={club.name}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ height: "110px", width: "100%", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={club.cover} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg-card) 0%, transparent 80%)" }} />
              </div>

              <div style={{ padding: "0 20px 20px 20px", marginTop: "-30px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "10px" }}>
                  <div style={{ height: "54px", width: "54px", borderRadius: "14px", overflow: "hidden", border: "3px solid var(--bg-card)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={club.avatar} alt={club.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <button
                    style={{
                      padding: "6px 16px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "900",
                      background: "linear-gradient(135deg, #00d4ff, #0284c7)",
                      color: "#08090d",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    + Join Guild
                  </button>
                </div>

                <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>{club.name}</h3>
                <p style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "700", margin: "2px 0 0 0" }}>{club.category} · {formatNumber(club.members)} members</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", margin: "8px 0 0 0" }}>{club.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Campus Housing & Marketplace Bounties ─────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={18} color="#ec4899" />
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Campus Housing & Sublease Exchange</h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "700", cursor: "pointer" }}>Bazaar Housing →</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
          {mockMarketDeals.map((d, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "20px",
                padding: "16px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ height: "80px", width: "80px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.img} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "14px", fontWeight: "900", color: "#10b981" }}>{d.price}</span>
                <h3 style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-pure)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</h3>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>📍 {d.location} · Seller: {d.seller}</p>
              </div>

              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-pure)",
                  fontSize: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Inquire
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
