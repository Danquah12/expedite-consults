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
  Store,
  Sparkles,
  Heart,
  ShieldCheck,
  CalendarDays,
  Compass,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Music,
  PenSquare
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAppStore } from "@/store/useAppStore";

interface DiscoverItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const discoverItems: DiscoverItem[] = [
  { label: "Reels & Video", href: "/reels", icon: <Video size={17} /> },
  { label: "Spaces & Communities", href: "/spaces", icon: <Globe size={17} /> },
  { label: "Marketplace", href: "/bazaar", icon: <ShoppingBag size={17} /> },
  { label: "Gaming & Esports", href: "/gaming", icon: <Gamepad2 size={17} /> },
  { label: "Careers & Jobs", href: "/career", icon: <Briefcase size={17} /> },
  { label: "Campus Hub", href: "/campus", icon: <GraduationCap size={17} /> },
  { label: "Events & Meetups", href: "/events", icon: <CalendarDays size={17} /> },
  { label: "Verified Organizations", href: "/pages", icon: <Store size={17} /> },
  { label: "Wallet & Vault", href: "/vault", icon: <Briefcase size={17} /> },
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
      {/* ── Brand Logo Header (Clean & Human) ────────────────────── */}
      <div style={{ padding: "0 6px 14px 6px" }}>
        <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--text-pure)",
              color: "var(--bg-core)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "16px",
              letterSpacing: "-0.5px",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-pure)", letterSpacing: "-0.2px", lineHeight: "1.1" }}>
              Sphera
            </span>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-muted)" }}>
              Community & Network
            </span>
          </div>
        </Link>
      </div>

      {/* ── Core Navigation (Calm, Unified Colors) ────────────────── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {/* 1. 🏠 Home Feed */}
        <Link
          href="/feed"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: isHomeActive ? "700" : "500",
            color: isHomeActive ? "var(--text-pure)" : "var(--text-secondary)",
            backgroundColor: isHomeActive ? "var(--bg-card-hover)" : "transparent",
            border: isHomeActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Home size={19} color={isHomeActive ? "var(--text-pure)" : "currentColor"} />
          <span style={{ flex: 1 }}>Home</span>
        </Link>

        {/* 2. 📖 Daily Inspiration / Gospel Menu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link
            href="/feed?tab=GOSPEL"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "9px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: pathname.includes("GOSPEL") ? "700" : "500",
              color: pathname.includes("GOSPEL") ? "var(--text-pure)" : "var(--text-secondary)",
              backgroundColor: pathname.includes("GOSPEL") ? "var(--bg-card-hover)" : "transparent",
              border: pathname.includes("GOSPEL") ? "1px solid var(--border-subtle)" : "1px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <BookOpen size={19} color="currentColor" />
            <span style={{ flex: 1 }}>Daily Inspiration</span>
          </Link>
        </div>

        {/* 3. 🧭 Discover Hub (Clean Accordion) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <button
            onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "9px 12px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: isDiscoverChildActive ? "700" : "500",
              color: isDiscoverChildActive ? "var(--text-pure)" : "var(--text-secondary)",
              backgroundColor: isDiscoverChildActive ? "var(--bg-card-hover)" : "transparent",
              border: isDiscoverChildActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              width: "100%",
              textAlign: "left",
            }}
          >
            <Compass size={19} color={isDiscoverChildActive ? "var(--text-pure)" : "currentColor"} />
            <span style={{ flex: 1 }}>Explore & Hubs</span>
            {isDiscoverOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {isDiscoverOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                paddingLeft: "14px",
                marginLeft: "8px",
                borderLeft: "1px solid var(--border-subtle)",
                marginTop: "2px",
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
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "var(--text-pure)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "var(--bg-card-hover)" : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. ➕ Human "New Post" Button */}
        <button
          onClick={() => openUniversalCreate("pulse")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            margin: "8px 0",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "700",
            color: "var(--bg-core)",
            backgroundColor: "var(--text-pure)",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <PenSquare size={16} />
          <span>New Post</span>
        </button>

        {/* 5. 💬 Messages */}
        <Link
          href="/messages"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: isMessagesActive ? "700" : "500",
            color: isMessagesActive ? "var(--text-pure)" : "var(--text-secondary)",
            backgroundColor: isMessagesActive ? "var(--bg-card-hover)" : "transparent",
            border: isMessagesActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <MessageCircle size={19} color={isMessagesActive ? "var(--text-pure)" : "currentColor"} />
          <span style={{ flex: 1 }}>Messages</span>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: "var(--text-muted)",
                color: "var(--bg-core)",
                fontSize: "10px",
                fontWeight: "700",
                padding: "1px 6px",
                borderRadius: "9999px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* 6. 🤖 Assistant */}
        <Link
          href="/ai"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: isAiActive ? "700" : "500",
            color: isAiActive ? "var(--text-pure)" : "var(--text-secondary)",
            backgroundColor: isAiActive ? "var(--bg-card-hover)" : "transparent",
            border: isAiActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Sparkles size={19} color="currentColor" />
          <span style={{ flex: 1 }}>Assistant</span>
        </Link>
      </nav>

      {/* ── Quick Utility Bar: Search + Notifications ─────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", margin: "8px 0" }}>
        <Link
          href="/search"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "7px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-card-hover)",
            border: "1px solid var(--border-subtle)",
            textDecoration: "none",
          }}
        >
          <Search size={14} />
          <span>Search</span>
        </Link>

        <Link
          href="/notifications"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "7px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-card-hover)",
            border: "1px solid var(--border-subtle)",
            textDecoration: "none",
          }}
        >
          <Bell size={14} />
          <span>Alerts</span>
        </Link>
      </div>

      {/* ── Profile & Theme Switcher Dock ─────────────────────────── */}
      <div style={{ paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* User Card */}
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "10px",
            textDecoration: "none",
            backgroundColor: isProfileActive ? "var(--bg-card-hover)" : "transparent",
            border: isProfileActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
          }}
        >
          <div
            style={{
              height: "32px",
              width: "32px",
              borderRadius: "9999px",
              backgroundColor: "var(--bg-card-hover)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--text-pure)",
            }}
          >
            K
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-pure)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name ?? "Kwesi Asiedu"}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>@kwesi · Founder</p>
          </div>
        </Link>

        {/* Action Row: Settings + Theme Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
          <Link
            href="/settings"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 10px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontWeight: "500",
              backgroundColor: "var(--bg-card-hover)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
