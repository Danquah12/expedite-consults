"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Brain, LayoutDashboard, Radio, Flame, GitMerge,
  Globe, Shield, Bot, SearchCode, Crosshair,
  Map, FlipHorizontal2, Wand2, Shuffle, Activity,
  ListOrdered, SlidersHorizontal, ScrollText, Layers, Target, Settings, Zap,
  MessageSquare, Share2, Store, Package, Lock, ClipboardList, Network,
  FolderOpen, Server, GitBranch, CheckSquare, TrendingUp, Workflow,
  ShieldAlert, Swords, Waypoints, Sparkles, Search, Menu, X
} from "lucide-react";

const SECTIONS = [
  {
    title: "Command Center",
    items: [
      { href: "/vuln-management", icon: ShieldAlert,      label: "DAST Vuln Mgmt",    badge: "0-100", hot: true },
      { href: "/engine",          icon: Brain,            label: "Engine Brain",      badge: "AUTO", hot: true },
      { href: "/app",             icon: Swords,           label: "ÆGIS · SOC Portal", badge: "PRO", hot: true },
      { href: "/",                icon: LayoutDashboard,  label: "Security Overview" },
      { href: "/live-scan",       icon: Waypoints,        label: "4-Stage Pipeline",  badge: "LIVE", hot: true },
    ],
  },
  {
    title: "AI & Threat Intel",
    items: [
      { href: "/copilot",         icon: MessageSquare,    label: "AXIOM Copilot",     badge: "AI",   hot: true },
      { href: "/knowledge-graph", icon: Share2,           label: "Knowledge Graph",   badge: "GNN",  hot: true },
      { href: "/ai",              icon: Bot,              label: "Autonomous Analyst" },
    ],
  },
  {
    title: "Dynamic Interceptor",
    items: [
      { href: "/proxy",           icon: Radio,            label: "Traffic Interceptor", badge: "8" },
      { href: "/repeater",        icon: Flame,            label: "Attack Forge" },
      { href: "/match-replace",   icon: GitMerge,         label: "Rule Mutation Engine" },
    ],
  },
  {
    title: "Active Attack & Probe",
    items: [
      { href: "/scanner",         icon: Crosshair,        label: "Vuln Probe Matrix", badge: "24" },
      { href: "/intruder",        icon: Shuffle,          label: "Fuzz Engine" },
      { href: "/crawler",         icon: Globe,            label: "Web Spider" },
      { href: "/api-scanner",     icon: SearchCode,       label: "API Inspector" },
      { href: "/exploit",         icon: Zap,              label: "Exploit Engine",    hot: true },
      { href: "/post-exploit",    icon: ShieldAlert,      label: "Priv Esc / Lateral",badge: "NEW", hot: true },
    ],
  },
  {
    title: "Recon & Surface",
    items: [
      { href: "/auth",            icon: Shield,           label: "Auth Manager",      hot: true },
      { href: "/parameters",      icon: SlidersHorizontal,label: "Parameter Lab" },
      { href: "/planner",         icon: Layers,           label: "Attack Planner",    hot: true },
      { href: "/profiles",        icon: Target,           label: "Scan Profiles" },
      { href: "/sitemap",         icon: Map,              label: "Application Map" },
      { href: "/scope",           icon: Target,           label: "Scope Guard" },
      { href: "/oob",             icon: Network,          label: "OOB Monitor",       hot: true },
      { href: "/scan-queue",      icon: ListOrdered,      label: "Scan Queue" },
    ],
  },
  {
    title: "Enterprise Governance",
    items: [
      { href: "/vuln-management", icon: ShieldAlert,      label: "DAST Vuln Mgmt",    badge: "RISK", hot: true },
      { href: "/projects",        icon: FolderOpen,       label: "Projects & Orgs",   hot: true },
      { href: "/assets",          icon: Server,           label: "Asset Inventory",   hot: true },
      { href: "/pipeline",        icon: GitBranch,        label: "Findings Pipeline", hot: true },
      { href: "/validation",      icon: CheckSquare,      label: "Validation Service",hot: true },
      { href: "/risk-engine",     icon: TrendingUp,       label: "Risk Engine",       hot: true },
      { href: "/workflow",        icon: Workflow,         label: "Workflow Engine",   hot: true },
      { href: "/marketplace",     icon: Store,            label: "Marketplace",       badge: "HUB", hot: true },
      { href: "/plugins",         icon: Package,          label: "Plugin Manager",    badge: "5" },
      { href: "/rbac",            icon: Lock,             label: "Access Control",    hot: true },
      { href: "/audit",           icon: ClipboardList,    label: "Audit Log",         badge: "SOC2",hot: true },
    ],
  },
  {
    title: "Forensic Utilities",
    items: [
      { href: "/decoder",         icon: Wand2,            label: "Transform Lab" },
      { href: "/comparer",        icon: FlipHorizontal2,  label: "Diff Inspector" },
      { href: "/sequencer",       icon: Activity,         label: "Entropy Lab" },
      { href: "/logger",          icon: ScrollText,       label: "Full Trace Log" },
      { href: "/evidence",        icon: Layers,           label: "Evidence Vault",    hot: true },
      { href: "/settings",        icon: Settings,         label: "Global Settings" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const [filter, setFilter] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Command Center": true,
    "Active Attack & Probe": true
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const allExpanded = SECTIONS.every(s => expandedSections[s.title]);
  const toggleAllSections = () => {
    const nextState: Record<string, boolean> = {};
    SECTIONS.forEach(s => {
      nextState[s.title] = !allExpanded;
    });
    setExpandedSections(nextState);
  };

  return (
    <>
      {/* Mobile & Tablet Top Navigation Bar (visible on screens <= 960px) */}
      <header className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              background: mobileMenuOpen ? "rgba(225, 29, 72, 0.25)" : "rgba(56, 189, 248, 0.14)",
              border: `1px solid ${mobileMenuOpen ? "#f43f5e" : "rgba(56, 189, 248, 0.45)"}`,
              color: "#f8fafc",
              borderRadius: 6,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            {mobileMenuOpen ? <X size={15} color="#f43f5e" /> : <Menu size={15} color="#38bdf8" />}
            <span>{mobileMenuOpen ? "Close" : "Studios"}</span>
          </button>

          <Link href="/engine" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: "linear-gradient(135deg, #0284c7, #10b981)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <Globe size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 900, color: "#fff", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                XTRIKE™ · DAST WEB
              </div>
              <div style={{ fontSize: 8.5, color: "#38bdf8", fontWeight: 800, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                🌐 WEB INTERFACE DAST
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Link
            href="/vuln-management"
            style={{
              textDecoration: "none",
              fontSize: 10,
              fontWeight: 800,
              padding: "5px 8px",
              borderRadius: 5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: path === "/vuln-management" ? "rgba(244, 63, 94, 0.25)" : "rgba(244,63,94,0.12)",
              border: `1px solid ${path === "/vuln-management" ? "#f43f5e" : "rgba(244,63,94,0.4)"}`,
              color: "#fda4af"
            }}
          >
            🎯 Vuln Mgmt (0-100)
          </Link>
          <Link
            href="/engine"
            style={{
              textDecoration: "none",
              fontSize: 10,
              fontWeight: 800,
              padding: "5px 8px",
              borderRadius: 5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: path === "/engine" ? "rgba(16, 185, 129, 0.22)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${path === "/engine" ? "#10b981" : "var(--border)"}`,
              color: path === "/engine" ? "#10b981" : "#f8fafc"
            }}
          >
            🌐 DAST Scanner
          </Link>
          <Link
            href="/app"
            style={{
              textDecoration: "none",
              fontSize: 10,
              fontWeight: 800,
              padding: "5px 8px",
              borderRadius: 5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: path === "/app" ? "rgba(225, 29, 72, 0.22)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${path === "/app" ? "#f43f5e" : "var(--border)"}`,
              color: path === "/app" ? "#ff4d79" : "#cbd5e1"
            }}
          >
            ⚔️ Aegis.SOC
          </Link>
          <Link
            href="/live-scan"
            style={{
              textDecoration: "none",
              fontSize: 10,
              fontWeight: 800,
              padding: "5px 8px",
              borderRadius: 5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              background: path === "/live-scan" ? "rgba(56, 189, 248, 0.22)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${path === "/live-scan" ? "#38bdf8" : "var(--border)"}`,
              color: path === "/live-scan" ? "#38bdf8" : "#cbd5e1"
            }}
          >
            ⚡ Pipeline
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`app-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
        style={{
          width: 220, flexShrink: 0, 
          background: "rgba(11, 15, 23, 0.98)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)", 
          overflowY: "auto",
          display: "flex", flexDirection: "column",
          zIndex: 50
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Link href="/engine" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg, #0284c7, #0f172a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(56, 189, 248, 0.45)",
                  flexShrink: 0
                }}>
                  <Globe size={16} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 5 }}>
                    XTRIKE™ · DAST
                    <span style={{ fontSize: 8.5, background: "rgba(16,185,129,0.18)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 4, padding: "0 4px", fontWeight: 800 }}>WEB</span>
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>AXIOM DAST ENGINE</div>
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close drawer"
              style={{
                background: "rgba(244,63,94,0.15)",
                border: "1px solid rgba(244,63,94,0.4)",
                color: "#f43f5e",
                borderRadius: 6,
                padding: 4,
                cursor: "pointer"
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Filter */}
          <div style={{ marginTop: 10, position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 8, top: 8, color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search 36 studios..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: "100%", background: "rgba(6, 8, 13, 0.8)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "5px 8px 5px 26px", fontSize: 11, color: "var(--fg)",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>7 STUDIO GROUPS</span>
            <button
              type="button"
              onClick={toggleAllSections}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0
              }}
            >
              {allExpanded ? "Collapse Groups" : "Expand All (36)"}
            </button>
          </div>
        </div>

        {/* Navigation Sections (Collapsible Accordions) */}
        <nav style={{ flex: 1, padding: "8px 6px" }}>
          {SECTIONS.map(section => {
            const matchingItems = section.items.filter(item =>
              !filter || item.label.toLowerCase().includes(filter.toLowerCase())
            );
            if (filter && matchingItems.length === 0) return null;

            const hasActiveChild = section.items.some(
              item => path === item.href || (item.href !== "/" && item.href !== "/app" && path.startsWith(item.href)) || (item.href === "/app" && path === "/app")
            );
            const isExpanded = Boolean(filter) || Boolean(expandedSections[section.title]) || hasActiveChild;

            return (
              <div key={section.title} style={{ marginBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.02)",
                    border: "none",
                    borderRadius: 5,
                    padding: "6px 10px",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: hasActiveChild ? "#38bdf8" : "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer"
                  }}
                >
                  <span>{section.title}</span>
                  <span style={{ fontSize: 9, color: "var(--muted)", fontFamily: "monospace" }}>
                    {matchingItems.length} {isExpanded ? "▾" : "▸"}
                  </span>
                </button>
                {isExpanded && matchingItems.map(item => {
                  const Icon = item.icon;
                  const active = path === item.href || (item.href !== "/" && item.href !== "/app" && path.startsWith(item.href)) || (item.href === "/app" && path === "/app");
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 10px", margin: "1px 0", borderRadius: 6,
                        background: active ? "rgba(56, 189, 248, 0.14)" : "transparent",
                        border: active ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid transparent",
                        cursor: "pointer", transition: "all 0.15s ease-out"
                      }}>
                        <Icon size={13.5} color={active ? "#38bdf8" : "var(--muted)"} />
                        <span style={{
                          fontSize: 11.5,
                          color: active ? "#fff" : "var(--fg-2)",
                          fontWeight: active ? 700 : 500,
                          flex: 1
                        }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            fontSize: 8.5, padding: "1px 5px", borderRadius: 4, fontWeight: 700,
                            background: active ? "rgba(56, 189, 248, 0.2)" : "rgba(255,255,255,0.04)",
                            color: active ? "#38bdf8" : "var(--muted)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Telemetry */}
        <div style={{
          padding: "10px 12px", borderTop: "1px solid var(--border)",
          background: "rgba(6, 8, 13, 0.9)", fontSize: 9.5, color: "var(--muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
              <span className="beacon-green" /> LIVE RADAR
            </span>
            <span style={{ color: "#00f0ff", fontWeight: 700 }}>4 ENGINES</span>
          </div>
          <div style={{ color: "var(--fg-2)", fontSize: 9 }}>ZAP · Burp · OpenVAS · Nmap</div>
          <div style={{ color: "#10b981", fontWeight: 600, marginTop: 2 }}>● Mobile &amp; Desktop Ready</div>
        </div>
      </aside>
    </>
  );
}
