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
              background: mobileMenuOpen ? "#1e293b" : "#0f172a",
              border: "1px solid #334155",
              color: "#f8fafc",
              borderRadius: 6,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {mobileMenuOpen ? <X size={15} color="#94a3b8" /> : <Menu size={15} color="#38bdf8" />}
            <span>{mobileMenuOpen ? "Close" : "Studios"}</span>
          </button>

          <Link href="/engine" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: "#1e293b",
              border: "1px solid #334155",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <Globe size={14} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#f8fafc", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                XTRIKE™ · DAST
              </div>
              <div style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 600, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                WEB &amp; API SECURITY
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { href: "/vuln-management", label: "Vuln Mgmt" },
            { href: "/engine", label: "Engine Brain" },
            { href: "/app", label: "ÆGIS · SOC" },
            { href: "/", label: "Overview" }
          ].map(nav => {
            const isAct = path === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  textDecoration: "none",
                  fontSize: 10.5,
                  fontWeight: isAct ? 700 : 500,
                  padding: "5px 9px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  background: isAct ? "rgba(56, 189, 248, 0.12)" : "#0f172a",
                  border: `1px solid ${isAct ? "rgba(56, 189, 248, 0.4)" : "#1e293b"}`,
                  color: isAct ? "#f8fafc" : "#94a3b8"
                }}
              >
                {nav.label}
              </Link>
            );
          })}
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
          background: "#090d16",
          borderRight: "1px solid #1e293b", 
          overflowY: "auto",
          display: "flex", flexDirection: "column",
          zIndex: 50
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Link href="/engine" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "#0f172a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid #1e293b",
                  flexShrink: 0
                }}>
                  <Globe size={15} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 5 }}>
                    XTRIKE™ · DAST
                    <span style={{ fontSize: 8.5, background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155", borderRadius: 4, padding: "0 4px", fontWeight: 700 }}>WEB</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>ENTERPRISE DAST PLATFORM</div>
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close drawer"
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                color: "#94a3b8",
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
          padding: "10px 12px", borderTop: "1px solid #1e293b",
          background: "#090d16", fontSize: 9.5, color: "#64748b"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 5 }}>
              <span className="beacon-green" /> ENGINE BRAIN ONLINE
            </span>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>4 DAEMONS</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 9 }}>ZAP · Burp · OpenVAS · Nmap</div>
        </div>
      </aside>
    </>
  );
}
