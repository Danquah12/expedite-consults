"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Video,
  MessageCircle,
  Bell,
  Users,
  Globe,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Settings,
  Zap,
  Store,
  Sparkles,
  Heart,
  ShieldCheck,
  Flame,
  CalendarDays,
  Compass,
  Plus,
  ChevronDown,
  ChevronRight,
  Radio,
  BookOpen,
  Music,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppStore } from "@/store/useAppStore";

interface DiscoverItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  isHot?: boolean;
}

const discoverItems: DiscoverItem[] = [
  { label: "Reels & Shorts", href: "/reels", icon: <Video size={17} />, isHot: true },
  { label: "Spaces & Guilds", href: "/spaces", icon: <Globe size={17} /> },
  { label: "Bazaar Marketplace", href: "/bazaar", icon: <ShoppingBag size={17} /> },
  { label: "Esports & Gaming", href: "/gaming", icon: <Gamepad2 size={17} />, isHot: true },
  { label: "Career & Bounties", href: "/career", icon: <Briefcase size={17} />, badge: "$2.5K", badgeColor: "#10b981" },
  { label: "Campus Operating OS", href: "/campus", icon: <GraduationCap size={17} /> },
  { label: "Events & Meetups", href: "/events", icon: <CalendarDays size={17} /> },
  { label: "Verified Pages", href: "/pages", icon: <Store size={17} /> },
  { label: "Sphera Vault & Pay", href: "/vault", icon: <Briefcase size={17} className="text-[#10b981]" />, badge: "$4.8K", badgeColor: "#10b981" },
];

export function SidebarNav({ user }: { user?: { name: string; username: string } }) {
  const pathname = usePathname();
  const { openUniversalCreate, unreadCount } = useAppStore();
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(
    discoverItems.some((item) => pathname.startsWith(item.href))
  );

  const isHomeActive = pathname === "/feed" || pathname === "/";
  const isMessagesActive = pathname.startsWith("/messages");
  const isProfileActive = pathname.startsWith("/profile");
  const isAiActive = pathname.startsWith("/ai");
  const isDiscoverChildActive = discoverItems.some((item) => pathname.startsWith(item.href));

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "250px",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px 12px",
        overflowY: "auto",
        boxSizing: "border-box",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* ── Brand Logo Header ─────────────────────────────────────── */}
      <div style={{ padding: "0 6px 14px 6px" }}>
        <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00d4ff, #6366f1, #ec4899)",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(0, 212, 255, 0.3)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--bg-sidebar)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="#00d4ff" fill="#00d4ff" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", letterSpacing: "0.5px", lineHeight: "1.1" }}>
              SpheraNet
            </span>
            <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent-cyan)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Sovereign Social
            </span>
          </div>
        </Link>
      </div>

      {/* ── 5-Point Core Navigation ────────────────────────────────── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {/* 1. 🏠 Home Feed */}
        <Link
          href="/feed"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: isHomeActive ? "800" : "500",
            color: isHomeActive ? "var(--text-pure)" : "var(--text-secondary)",
            backgroundColor: isHomeActive ? "var(--bg-card-hover)" : "transparent",
            border: isHomeActive ? "1px solid var(--border-active)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Home size={20} color={isHomeActive ? "var(--accent-cyan)" : "currentColor"} />
          <span style={{ flex: 1 }}>Home Feed</span>
          <span
            style={{
              fontSize: "9px",
              fontWeight: "900",
              color: "var(--accent-cyan)",
              backgroundColor: "rgba(0,212,255,0.12)",
              padding: "1px 5px",
              borderRadius: "4px",
            }}
          >
            𝕏 FEED
          </span>
        </Link>

        {/* ✝️ Gospel Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link
            href="/feed?tab=GOSPEL"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "9px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: pathname.includes("GOSPEL") ? "800" : "700",
              color: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <BookOpen size={20} color="#f59e0b" />
            <span style={{ flex: 1, fontWeight: "800" }}>Gospel Menu</span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: "900",
                color: "#000",
                backgroundColor: "#f59e0b",
                padding: "1px 5px",
                borderRadius: "4px",
              }}
            >
              NEW
            </span>
          </Link>

          {/* 🎵 Gospel Music Sub-Item */}
          <Link
            href="/feed?tab=GOSPEL&sub=music"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 12px 6px 28px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fbbf24",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <Music size={14} color="#f59e0b" />
            <span style={{ flex: 1 }}>Gospel Music</span>
            <span
              style={{
                fontSize: "8px",
                fontWeight: "900",
                color: "#000",
                backgroundColor: "#f59e0b",
                padding: "0.5px 4px",
                borderRadius: "3px",
              }}
            >
              🎵 LIVE
            </span>
          </Link>
        </div>

        {/* 2. 🧭 Discover Hub (Collapsible Sub-hubs) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <button
            onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "9px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: isDiscoverChildActive ? "800" : "500",
              color: isDiscoverChildActive ? "var(--text-pure)" : "var(--text-secondary)",
              backgroundColor: isDiscoverChildActive ? "var(--bg-card-hover)" : "transparent",
              border: isDiscoverChildActive ? "1px solid var(--border-active)" : "1px solid transparent",
              background: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              boxSizing: "border-box",
              transition: "all 0.15s ease",
            }}
          >
            <Compass size={20} color={isDiscoverChildActive ? "var(--accent-cyan)" : "currentColor"} />
            <span style={{ flex: 1 }}>Discover Hub</span>
            {isDiscoverOpen ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            )}
          </button>

          {/* Sub-Hub list */}
          {isDiscoverOpen && (
            <div
              style={{
                marginLeft: "18px",
                paddingLeft: "10px",
                borderLeft: "2px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginTop: "2px",
                marginBottom: "4px",
              }}
            >
              {discoverItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: isActive ? "800" : "500",
                      color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "rgba(0, 212, 255, 0.1)" : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.label}
                    </span>

                    {item.isHot && (
                      <span
                        style={{
                          backgroundColor: "rgba(236, 72, 153, 0.15)",
                          color: "#ec4899",
                          border: "1px solid rgba(236, 72, 153, 0.3)",
                          fontSize: "8px",
                          fontWeight: "900",
                          padding: "1px 4px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <Flame size={9} /> HOT
                      </span>
                    )}

                    {item.badge && (
                      <span
                        style={{
                          backgroundColor: item.badgeColor ?? "#ef4444",
                          color: "#08090d",
                          fontSize: "9px",
                          fontWeight: "900",
                          padding: "1px 5px",
                          borderRadius: "9999px",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. ➕ Primary Create Button (Universal Matrix) */}
        <button
          onClick={() => openUniversalCreate("pulse")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "11px 16px",
            margin: "6px 0",
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: "900",
            color: "#08090d",
            background: "linear-gradient(135deg, #00d4ff, #6366f1, #ec4899)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 16px rgba(0, 212, 255, 0.35)",
            transition: "all 0.15s ease",
            letterSpacing: "0.4px",
          }}
        >
          <Plus size={18} strokeWidth={3} />
          <span>Create Matrix</span>
        </button>

        {/* 4. 💬 SpheraChat */}
        <Link
          href="/messages"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: isMessagesActive ? "800" : "500",
            color: isMessagesActive ? "var(--text-pure)" : "var(--text-secondary)",
            backgroundColor: isMessagesActive ? "var(--bg-card-hover)" : "transparent",
            border: isMessagesActive ? "1px solid var(--border-active)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <MessageCircle size={20} color={isMessagesActive ? "var(--accent-cyan)" : "currentColor"} />
          <span style={{ flex: 1 }}>SpheraChat</span>
          <span
            style={{
              backgroundColor: "#00d4ff",
              color: "#08090d",
              fontSize: "10px",
              fontWeight: "900",
              height: "18px",
              minWidth: "18px",
              padding: "0 5px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px #00d4ff",
            }}
          >
            {unreadCount || 3}
          </span>
        </Link>

        {/* 5. 🤖 Sphera AI Agent */}
        <Link
          href="/ai"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: isAiActive ? "800" : "500",
            color: isAiActive ? "var(--accent-cyan)" : "var(--text-secondary)",
            backgroundColor: isAiActive ? "var(--bg-card-hover)" : "transparent",
            border: isAiActive ? "1px solid var(--border-active)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Sparkles size={20} color="var(--accent-cyan)" />
          <span style={{ flex: 1 }}>Sphera AI Agent</span>
        </Link>

        {/* Search & Notifications shortcuts */}
        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
          <Link
            href="/search"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "7px 10px",
              borderRadius: "10px",
              fontSize: "11px",
              color: pathname === "/search" ? "var(--text-pure)" : "var(--text-muted)",
              backgroundColor: pathname === "/search" ? "var(--bg-card-hover)" : "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            <Search size={14} />
            <span>Search</span>
          </Link>

          <Link
            href="/notifications"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "7px 10px",
              borderRadius: "10px",
              fontSize: "11px",
              color: pathname === "/notifications" ? "var(--text-pure)" : "var(--text-muted)",
              backgroundColor: pathname === "/notifications" ? "var(--bg-card-hover)" : "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            <Heart size={14} color="#ef4444" />
            <span>Alerts</span>
          </Link>
        </div>
      </nav>

      {/* ── Profile & Theme Switcher Dock ─────────────────────────── */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* User Profile Card */}
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "12px",
            textDecoration: "none",
            backgroundColor: isProfileActive ? "var(--bg-card-hover)" : "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              height: "32px",
              width: "32px",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #00d4ff, #6366f1)",
              padding: "2px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--bg-sidebar)",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "900",
                color: "var(--text-pure)",
              }}
            >
              K
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-pure)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name ?? "Kwesi Asiedu"}
            </p>
            <p style={{ fontSize: "10px", color: "var(--accent-cyan)", margin: 0, fontWeight: "600" }}>
              @kwesi · Sovereign Founder
            </p>
          </div>
          <ShieldCheck size={14} color="#00d4ff" />
        </Link>

        {/* Action Row: Settings + Theme Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", paddingTop: "2px" }}>
          <Link
            href="/settings"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: "600",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Settings size={15} />
            <span>Settings</span>
          </Link>

          {/* 3-Theme Switcher (Dark / Pure Black / Blue) */}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
