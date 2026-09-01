"use client";

import { useState } from "react";
import {
  Briefcase, ShieldCheck, Sparkles, Search, MapPin,
  Building2, DollarSign, Bookmark, ArrowUpRight, Check,
  SlidersHorizontal, CheckCircle2, Lock, Award, Clock
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface JobBounty {
  id: string;
  title: string;
  company: { name: string; logo: string; verified?: boolean; location: string };
  salary: string;
  type: "Full-Time" | "Contract Bounty" | "Part-Time";
  clearance?: "TS/SCI Polygraph" | "Secret Required" | "Public Trust" | "Unclassified";
  matchScore: number;
  tags: string[];
  postedTime: string;
  featured?: boolean;
}

const mockJobs: JobBounty[] = [
  {
    id: "job-1",
    title: "Lead Cybersecurity Architect & IAM Enclave Engineer",
    company: {
      name: "Expedite Federal Systems",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Bethesda, MD (Hybrid)",
    },
    salary: "$185,000 - $225,000",
    type: "Full-Time",
    clearance: "TS/SCI Polygraph",
    matchScore: 98,
    tags: ["Zero-Trust Architecture", "FIDO2 Passkeys", "OAuth/SAML", "Next.js 16", "TypeScript"],
    postedTime: "2 hours ago",
    featured: true,
  },
  {
    id: "job-2",
    title: "Autonomous AI Agent Systems & Distributed Core Engineer",
    company: {
      name: "Sphera Core Labs",
      logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Remote (US / Global)",
    },
    salary: "$170,000 - $210,000",
    type: "Full-Time",
    clearance: "Unclassified",
    matchScore: 95,
    tags: ["LLM Agents", "PostgreSQL", "Prisma", "Real-Time WebSockets", "Python"],
    postedTime: "1 day ago",
    featured: true,
  },
  {
    id: "job-3",
    title: "Penetration Tester & AppSec Bounty Specialist",
    company: {
      name: "CyberMatrix Defense",
      logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Annapolis Junction, MD",
    },
    salary: "$120 - $160 / hr",
    type: "Contract Bounty",
    clearance: "Secret Required",
    matchScore: 91,
    tags: ["Burp Suite", "SAST/DAST", "Network Forensics", "Zero-Day Research", "Python"],
    postedTime: "2 days ago",
  },
  {
    id: "job-4",
    title: "Principal Frontend Design Engineer (UI/UX Systems)",
    company: {
      name: "Orbit Digital & Creative",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      location: "Remote (US)",
    },
    salary: "$140,000 - $180,000",
    type: "Full-Time",
    clearance: "Unclassified",
    matchScore: 89,
    tags: ["React 19", "Tailwind CSS", "Framer Motion", "WebGL/Canvas", "Design Tokens"],
    postedTime: "3 days ago",
  },
];

export default function CareerPage() {
  const [selectedFilter, setSelectedFilter] = useState("All Roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const handleApply = (id: string) => {
    setAppliedJobs(prev => ({ ...prev, [id]: true }));
  };

  const toggleSave = (id: string) => {
    setSavedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>
      {/* ── Career Header ─────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: "24px",
          padding: "32px",
          background: "linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(16, 18, 26, 0.9) 60%, var(--bg-core) 100%)",
          border: "1px solid rgba(0, 212, 255, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "680px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ backgroundColor: "rgba(0,212,255,0.15)", color: "var(--accent-cyan)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: "9999px", padding: "3px 10px", fontSize: "10px", fontWeight: "900" }}>
              CONNECTIN CAREER MATRIX
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>· Skill Passport Cryptographically Verified</span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "var(--text-pure)", margin: 0, lineHeight: "1.2" }}>
            High-Impact Tech, Defense Bounties & <span style={{ color: "var(--accent-cyan)" }}>Cleared Careers</span>
          </h1>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            Instant AI algorithmic matching with 90%+ clearance compatibility and 1-click encrypted talent escrow applications.
          </p>
        </div>

        <button
          style={{
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-pure)",
            borderRadius: "12px",
            padding: "10px 18px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldCheck size={16} color="var(--accent-cyan)" /> View Verified Skill Passport
        </button>
      </div>

      {/* ── Skill Passport Match Score Meter ──────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              height: "48px",
              width: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #00d4ff, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#08090d",
            }}
          >
            <Sparkles size={22} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)" }}>Your Skill Passport Match Score: 98%</span>
              <span style={{ fontSize: "9px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: "6px" }}>
                TOP 1% CANDIDATE
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              Your verified background in Zero-Trust, Next.js, and AppSec automatically unlocks Tier-1 enterprise bounties.
            </p>
          </div>
        </div>

        <button
          style={{
            background: "linear-gradient(135deg, #00d4ff, #0284c7)",
            color: "#08090d",
            border: "none",
            borderRadius: "10px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: "900",
            cursor: "pointer",
          }}
        >
          Export Passport
        </button>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
            <Search size={16} color="var(--accent-cyan)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, clearance, or specific skills..."
              style={{
                width: "100%",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "14px",
                padding: "12px 16px 12px 42px",
                color: "var(--text-pure)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {["All Roles", "Full-Time", "Contract", "Defense Bounty", "Remote"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: selectedFilter === f ? "900" : "600",
                  backgroundColor: selectedFilter === f ? "var(--accent-cyan)" : "var(--bg-card)",
                  color: selectedFilter === f ? "#08090d" : "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Job & Bounty Cards List ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {mockJobs.map((job) => {
          const isApplied = !!appliedJobs[job.id];
          const isSaved = !!savedJobs[job.id];

          return (
            <div
              key={job.id}
              style={{
                backgroundColor: "var(--bg-card)",
                border: job.featured ? "1px solid rgba(0, 212, 255, 0.3)" : "1px solid var(--border-subtle)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                transition: "all 0.15s ease",
              }}
            >
              {/* Header Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "14px", flex: 1, minWidth: "280px" }}>
                  <div style={{ height: "48px", width: "48px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.company.logo} alt={job.company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>
                        {job.title}
                      </h3>
                      {job.featured && (
                        <span style={{ fontSize: "9px", fontWeight: "900", color: "#00d4ff", backgroundColor: "rgba(0,212,255,0.15)", padding: "2px 6px", borderRadius: "6px" }}>
                          FEATURED
                        </span>
                      )}
                      {job.clearance && job.clearance !== "Unclassified" && (
                        <span style={{ fontSize: "10px", fontWeight: "900", color: "#a855f7", backgroundColor: "rgba(168,85,247,0.15)", padding: "2px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldCheck size={11} /> {job.clearance}
                        </span>
                      )}
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 6px", borderRadius: "6px" }}>
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                      <strong style={{ color: "var(--text-pure)" }}>{job.company.name}</strong> · 📍 {job.company.location} · <span style={{ color: "var(--text-muted)" }}>{job.postedTime}</span>
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "16px", fontWeight: "900", color: "#10b981", margin: 0 }}>{job.salary}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{job.type}</p>
                </div>
              </div>

              {/* Skill Tags */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Verified Direct Talent Escrow
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => toggleSave(job.id)}
                    style={{
                      height: "36px",
                      width: "36px",
                      borderRadius: "10px",
                      backgroundColor: isSaved ? "rgba(0, 212, 255, 0.2)" : "var(--bg-input)",
                      color: isSaved ? "var(--accent-cyan)" : "var(--text-muted)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => handleApply(job.id)}
                    style={{
                      background: isApplied ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #00d4ff, #0284c7)",
                      color: isApplied ? "#10b981" : "#08090d",
                      border: isApplied ? "1px solid rgba(16,185,129,0.3)" : "none",
                      borderRadius: "10px",
                      padding: "8px 20px",
                      fontSize: "12px",
                      fontWeight: "900",
                      cursor: "pointer",
                      boxShadow: isApplied ? "none" : "0 0 15px rgba(0, 212, 255, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {isApplied ? "Application Dispatched ✓" : "1-Click Easy Apply ↗"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
