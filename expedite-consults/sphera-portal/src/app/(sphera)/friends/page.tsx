"use client";

import { useState } from "react";
import {
  Users, UserPlus, Check, X, Search, ShieldCheck,
  Building2, GraduationCap, MapPin, Sparkles, ArrowRight
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface FriendRequest {
  id: string;
  name: string;
  username: string;
  img: string;
  role: string;
  university?: string;
  mutualFriends: number;
  timeAgo: string;
}

const mockRequests: FriendRequest[] = [
  {
    id: "fr1",
    name: "Elena Vasquez",
    username: "@elena_v",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "Product Designer @ Figma",
    university: "UMD Computer Science",
    mutualFriends: 21,
    timeAgo: "2m ago",
  },
  {
    id: "fr2",
    name: "Jordan Park",
    username: "@jpark",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Full-Stack Engineer",
    university: "Carnegie Mellon",
    mutualFriends: 8,
    timeAgo: "15m ago",
  },
  {
    id: "fr3",
    name: "Aisha Mensah",
    username: "@aisha.m",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Founder & CEO @ Nova AI",
    university: "Stanford MS AI",
    mutualFriends: 15,
    timeAgo: "1h ago",
  },
];

const mockSuggested = [
  {
    id: "s1",
    name: "David Osei",
    username: "@david.o",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Cybersecurity Analyst",
    mutualFriends: 14,
  },
  {
    id: "s2",
    name: "Priya Sharma",
    username: "@priya_s",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Cloud Architect @ AWS",
    mutualFriends: 29,
  },
];

export default function FriendsPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [activeTab, setActiveTab] = useState("Requests");

  const acceptRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const declineRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1c202e", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", margin: 0 }}>
            Friends & Social Graph
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
            Connect with builders, founders, students, and verified cybersecurity engineers.
          </p>
        </div>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
        {[
          { id: "Requests", label: `Friend Requests (${requests.length})` },
          { id: "Suggested", label: "People You May Know" },
          { id: "All", label: "All Connections (420)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? "800" : "600",
              backgroundColor: activeTab === tab.id ? "#00d4ff" : "#10121a",
              color: activeTab === tab.id ? "#08090d" : "#94a3b8",
              border: "1px solid #1c202e",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Friend Requests Grid ──────────────────────────────────── */}
      {activeTab === "Requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.length === 0 ? (
            <div style={{ backgroundColor: "#10121a", border: "1px solid #1c202e", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
              <Users size={36} color="#64748b" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>No pending friend requests</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "6px 0 0 0" }}>You are connected with everyone in your queue!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: "#10121a",
                    border: "1px solid #1c202e",
                    borderRadius: "20px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  <div style={{ display: "flex", gap: "14px" }}>
                    <div style={{ height: "56px", width: "56px", borderRadius: "16px", overflow: "hidden", border: "1px solid #1c202e", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.img} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#ffffff", margin: 0 }}>{r.name}</h3>
                        <Check size={13} color="#00d4ff" />
                      </div>
                      <p style={{ fontSize: "12px", color: "#00d4ff", fontWeight: "700", margin: "2px 0 0 0" }}>{r.username}</p>
                      <p style={{ fontSize: "11px", color: "#cbd5e1", margin: "4px 0 0 0" }}>{r.role}</p>
                      {r.university && (
                        <p style={{ fontSize: "10px", color: "#94a3b8", margin: "2px 0 0 0" }}>🎓 {r.university}</p>
                      )}
                      <p style={{ fontSize: "10px", color: "#64748b", margin: "6px 0 0 0", fontWeight: "700" }}>{r.mutualFriends} mutual connections</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #1c202e" }}>
                    <button
                      onClick={() => acceptRequest(r.id)}
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #00d4ff, #0284c7)",
                        color: "#08090d",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 0",
                        fontSize: "12px",
                        fontWeight: "900",
                        cursor: "pointer",
                        boxShadow: "0 0 12px rgba(0, 212, 255, 0.3)",
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => declineRequest(r.id)}
                      style={{
                        flex: 1,
                        backgroundColor: "#161924",
                        color: "#94a3b8",
                        border: "1px solid #1c202e",
                        borderRadius: "10px",
                        padding: "10px 0",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Suggested Connections ─────────────────────────────────── */}
      {activeTab === "Suggested" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {mockSuggested.map((s) => (
            <div
              key={s.id}
              style={{
                backgroundColor: "#10121a",
                border: "1px solid #1c202e",
                borderRadius: "20px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ height: "48px", width: "48px", borderRadius: "14px", overflow: "hidden", border: "1px solid #1c202e", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: "900", color: "#ffffff", margin: 0 }}>{s.name}</h3>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0 0" }}>{s.role}</p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0 0" }}>{s.mutualFriends} mutual friends</p>
                </div>
              </div>

              <button
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0284c7)",
                  color: "#08090d",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                + Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
