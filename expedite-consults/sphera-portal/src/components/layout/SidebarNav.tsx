"use client";

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
  CalendarDays
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  isHot?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home Feed", href: "/feed", icon: <Home size={20} />, activeIcon: <Home size={20} className="stroke-[2.5]" /> },
  { label: "Search", href: "/search", icon: <Search size={20} />, activeIcon: <Search size={20} className="stroke-[2.5]" /> },
  { label: "Reels & Shorts", href: "/reels", icon: <Video size={20} />, activeIcon: <Video size={20} className="stroke-[2.5]" />, isHot: true },
  { label: "SpheraChat", href: "/messages", icon: <MessageCircle size={20} />, activeIcon: <MessageCircle size={20} className="stroke-[2.5]" />, badge: 3, badgeColor: "#00d4ff" },
  { label: "Notifications", href: "/notifications", icon: <Heart size={20} />, activeIcon: <Heart size={20} className="stroke-[2.5] fill-current" />, badge: 12, badgeColor: "#ef4444" },
  { label: "Friends & Graph", href: "/friends", icon: <Users size={20} />, activeIcon: <Users size={20} className="stroke-[2.5]" /> },
  { label: "Spaces & Guilds", href: "/spaces", icon: <Globe size={20} />, activeIcon: <Globe size={20} className="stroke-[2.5]" /> },
  { label: "Bazaar Marketplace", href: "/bazaar", icon: <ShoppingBag size={20} />, activeIcon: <ShoppingBag size={20} className="stroke-[2.5]" /> },
  { label: "Esports & Gaming", href: "/gaming", icon: <Gamepad2 size={20} />, activeIcon: <Gamepad2 size={20} className="stroke-[2.5]" />, isHot: true },
  { label: "Career & Bounties", href: "/career", icon: <Briefcase size={20} />, activeIcon: <Briefcase size={20} className="stroke-[2.5]" /> },
  { label: "Campus Operating OS", href: "/campus", icon: <GraduationCap size={20} />, activeIcon: <GraduationCap size={20} className="stroke-[2.5]" /> },
  { label: "Events & Meetups", href: "/events", icon: <CalendarDays size={20} />, activeIcon: <CalendarDays size={20} className="stroke-[2.5]" /> },
  { label: "Verified Pages", href: "/pages", icon: <Store size={20} />, activeIcon: <Store size={20} className="stroke-[2.5]" /> },
  { label: "Sphera Vault & Pay", href: "/vault", icon: <Briefcase size={20} className="text-[#10b981]" />, activeIcon: <Briefcase size={20} className="text-[#10b981] fill-current" />, badge: "$4.8K", badgeColor: "#10b981" },
  { label: "Sphera AI Agent", href: "/ai", icon: <Sparkles size={20} className="text-[#00d4ff]" />, activeIcon: <Sparkles size={20} className="text-[#00d4ff] fill-current" /> },
];

export function SidebarNav({ user }: { user?: { name: string; username: string } }) {
  const pathname = usePathname();

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
        padding: "20px 14px",
        overflowY: "auto",
        boxSizing: "border-box",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* ── Brand Logo Header ─────────────────────────────────────── */}
      <div style={{ padding: "0 6px 18px 6px" }}>
        <Link href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              height: "38px",
              width: "38px",
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
              <Zap size={20} color="#00d4ff" fill="#00d4ff" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "19px", fontWeight: "900", color: "var(--text-pure)", letterSpacing: "0.5px", lineHeight: "1.1" }}>SpheraNet</span>
            <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--accent-cyan)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Sovereign Social</span>
          </div>
        </Link>
      </div>

      {/* ── Navigation Tree ────────────────────────────────────────── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "9px 12px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: isActive ? "800" : "500",
                color: isActive ? "var(--text-pure)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--bg-card-hover)" : "transparent",
                border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "var(--accent-cyan)" : "inherit" }}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>

              {item.isHot && (
                <span
                  style={{
                    backgroundColor: "rgba(236, 72, 153, 0.15)",
                    color: "#ec4899",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                    fontSize: "9px",
                    fontWeight: "900",
                    padding: "1px 5px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <Flame size={10} /> HOT
                </span>
              )}

              {item.badge && (
                <span
                  style={{
                    backgroundColor: item.badgeColor ?? "#ef4444",
                    color: item.badgeColor === "#00d4ff" ? "#08090d" : "#ffffff",
                    fontSize: "10px",
                    fontWeight: "900",
                    height: "18px",
                    minWidth: "18px",
                    padding: "0 5px",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 8px ${item.badgeColor ?? "#ef4444"}`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Profile & Theme Switcher Dock ─────────────────────────── */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* User Card */}
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "12px",
            textDecoration: "none",
            backgroundColor: pathname === "/profile" ? "var(--bg-card-hover)" : "var(--bg-card)",
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
            <p style={{ fontSize: "10px", color: "var(--accent-cyan)", margin: 0, fontWeight: "600" }}>@kwesi · Founder</p>
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

          {/* 3-Theme Switcher (Black / White / Blue) */}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
