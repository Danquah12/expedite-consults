"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Command, Sparkles, Home, Video, MessageCircle,
  ShoppingBag, Briefcase, Gamepad2, GraduationCap, Users,
  Globe, Store, Settings, Plus, Moon, Sun, ArrowRight,
  ShieldCheck, Check, Laptop, Terminal, Calendar
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "People" | "Deals & Bounties";
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, setTheme, toggleTheme } = useTheme();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
    setIsOpen(false);
    setSearch("");
  }, [router]);

  const allCommands: CommandItem[] = [
    // Navigation
    { id: "nav-feed", title: "Home Social Feed", category: "Navigation", icon: <Home size={18} color="var(--accent-cyan)" />, shortcut: "G H", action: () => navigate("/feed") },
    { id: "nav-reels", title: "Sphera Reels Theater", category: "Navigation", icon: <Video size={18} color="#ec4899" />, shortcut: "G R", action: () => navigate("/reels"), badge: "HOT" },
    { id: "nav-bazaar", title: "Bazaar Marketplace", category: "Navigation", icon: <ShoppingBag size={18} color="#6366f1" />, shortcut: "G B", action: () => navigate("/bazaar") },
    { id: "nav-career", title: "TS/SCI Careers & Bounties", category: "Navigation", icon: <Briefcase size={18} color="#f59e0b" />, shortcut: "G C", action: () => navigate("/career"), badge: "98% Match" },
    { id: "nav-gaming", title: "Esports & Tournaments", category: "Navigation", icon: <Gamepad2 size={18} color="#a855f7" />, shortcut: "G G", action: () => navigate("/gaming"), badge: "Live" },
    { id: "nav-ai", title: "Sphera Autonomous AI Agent", category: "Navigation", icon: <Sparkles size={18} color="var(--accent-cyan)" />, shortcut: "G A", action: () => navigate("/ai") },
    { id: "nav-campus", title: "Campus Operating OS (UMD)", category: "Navigation", icon: <GraduationCap size={18} color="#10b981" />, action: () => navigate("/campus") },
    { id: "nav-spaces", title: "Spaces & Guilds Hub", category: "Navigation", icon: <Globe size={18} color="#00d4ff" />, action: () => navigate("/spaces") },
    { id: "nav-events", title: "Events & Meetups", category: "Navigation", icon: <Calendar size={18} color="#ec4899" />, action: () => navigate("/events") },
    { id: "nav-pages", title: "Verified Pages Directory", category: "Navigation", icon: <Store size={18} color="#00d4ff" />, action: () => navigate("/pages") },
    { id: "nav-settings", title: "Settings & Security Enclave", category: "Navigation", icon: <Settings size={18} color="var(--text-muted)" />, action: () => navigate("/settings") },

    // Quick Actions
    { id: "act-theme-dark", title: "Switch to Obsidian Black Mode", category: "Quick Actions", icon: <Moon size={18} color="#f59e0b" />, action: () => { setTheme("dark"); setIsOpen(false); } },
    { id: "act-theme-light", title: "Switch to Solar White Mode", category: "Quick Actions", icon: <Sun size={18} color="#0284c7" />, action: () => { setTheme("light"); setIsOpen(false); } },
    { id: "act-theme-blue", title: "Switch to Sapphire Blue Mode", category: "Quick Actions", icon: <Sparkles size={18} color="#38bdf8" />, action: () => { setTheme("blue"); setIsOpen(false); } },
    { id: "act-create-post", title: "Create a New Feed Post", category: "Quick Actions", icon: <Plus size={18} color="var(--accent-cyan)" />, shortcut: "C", action: () => navigate("/feed") },
    { id: "act-list-item", title: "List an Item on Bazaar", category: "Quick Actions", icon: <Plus size={18} color="#10b981" />, action: () => navigate("/bazaar") },

    // People
    { id: "user-amara", title: "Amara Diallo (@amara_creates)", category: "People", icon: <Users size={18} color="#00d4ff" />, action: () => navigate("/profile"), badge: "Creator Lead" },
    { id: "user-marcus", title: "Marcus Johnson (@mj_tech)", category: "People", icon: <Users size={18} color="#6366f1" />, action: () => navigate("/profile"), badge: "Cyber Architect" },
    { id: "user-zara", title: "Zara Williams (@zara.w)", category: "People", icon: <Users size={18} color="#ec4899" />, action: () => navigate("/profile"), badge: "Founder @ Orbit" },

    // Deals & Bounties
    { id: "deal-macbook", title: "MacBook Pro 14\" M3 — $1,200 in College Park", category: "Deals & Bounties", icon: <Laptop size={18} color="#10b981" />, action: () => navigate("/bazaar") },
    { id: "bounty-iam", title: "Lead Cybersecurity Architect ($185k - $225k TS/SCI)", category: "Deals & Bounties", icon: <ShieldCheck size={18} color="#f59e0b" />, action: () => navigate("/career") },
  ];

  const filtered = allCommands.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation within the filtered results
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMenuNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleMenuNav);
    return () => window.removeEventListener("keydown", handleMenuNav);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(12px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "640px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <Search size={20} color="var(--accent-cyan)" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, world, person, bounty, or item..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-pure)",
              fontSize: "15px",
              fontWeight: "600",
              outline: "none",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-card-hover)",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "10px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>No results found for &ldquo;{search}&rdquo;</p>
              <p style={{ fontSize: "12px", margin: "4px 0 0 0" }}>Try searching for &quot;Reels&quot;, &quot;MacBook&quot;, &quot;TS/SCI&quot;, or &quot;Theme&quot;</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    backgroundColor: isSelected ? "var(--bg-card-hover)" : "transparent",
                    border: isSelected ? "1px solid var(--border-active)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        height: "32px",
                        width: "32px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bg-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {item.icon}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: isSelected ? "800" : "600", color: "var(--text-pure)" }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          color: "var(--accent-cyan)",
                          backgroundColor: "rgba(0, 212, 255, 0.12)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          border: "1px solid rgba(0, 212, 255, 0.25)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.shortcut && (
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", padding: "2px 6px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                        {item.shortcut}
                      </span>
                    )}

                    {isSelected && (
                      <ArrowRight size={14} color="var(--accent-cyan)" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <span><strong style={{ color: "var(--text-pure)" }}>↑ ↓</strong> to navigate</span>
            <span><strong style={{ color: "var(--text-pure)" }}>↵</strong> to select</span>
            <span><strong style={{ color: "var(--text-pure)" }}>esc</strong> to close</span>
          </div>

          <span style={{ fontWeight: "700", color: "var(--accent-cyan)" }}>
            SPHERA SPOTLIGHT
          </span>
        </div>
      </div>
    </div>
  );
}
