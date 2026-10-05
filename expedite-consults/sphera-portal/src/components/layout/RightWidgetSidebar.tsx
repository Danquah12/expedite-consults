"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp, Users, Calendar,
  ArrowUpRight, Sparkles, Search
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const trendingTopics = [
  { tag: "#TechFounders", posts: "24.5K posts", category: "Technology" },
  { tag: "#CampusLife2026", posts: "18.2K posts", category: "University" },
  { tag: "#CyberDefense", posts: "12.4K posts", category: "Security" },
  { tag: "#DesignSystems", posts: "9.8K posts", category: "Design" },
];

const suggestedConnections = [
  { name: "Amara Diallo", handle: "@amara_creates", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", role: "Product & Design" },
  { name: "Marcus Johnson", handle: "@mj_tech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", role: "Cloud Architect" },
  { name: "Zara Williams", handle: "@zara.w", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", role: "Founder @ Orbit" },
];

export function RightWidgetSidebar() {
  const pathname = usePathname();

  if (pathname === "/reels") {
    return null;
  }

  return (
    <aside
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flexShrink: 0,
      }}
    >
      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          placeholder="Search community, posts, tags..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-pure)",
            fontSize: "13px",
            width: "100%",
          }}
        />
      </div>

      {/* ── Trending Discussions ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-pure)", margin: 0 }}>
            Trending Topics
          </h3>
          <Link href="/search" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "none" }}>
            Explore
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trendingTopics.map((t) => (
            <Link
              key={t.tag}
              href={`/search?q=${encodeURIComponent(t.tag)}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{t.category}</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-pure)", margin: "1px 0 0 0" }}>{t.tag}</p>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.posts}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Suggested People to Follow ────────────────────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-pure)", margin: 0 }}>
            People to Follow
          </h3>
          <Link href="/friends" style={{ fontSize: "11px", color: "var(--text-muted)", textDecoration: "none" }}>
            See All
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {suggestedConnections.map((p) => (
            <div
              key={p.handle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div style={{ height: "36px", width: "36px", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-pure)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{p.role}</p>
                </div>
              </div>

              <button
                style={{
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: "var(--text-pure)",
                  color: "var(--bg-core)",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{ padding: "4px 8px", fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.6" }}>
        <p style={{ margin: 0 }}>
          <span>Privacy</span> · <span>Terms</span> · <span>Community Guidelines</span> · <span>About</span>
        </p>
        <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
          © 2026 Sphera Network
        </p>
      </div>
    </aside>
  );
}
