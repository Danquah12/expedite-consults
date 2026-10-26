"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Brain, LayoutDashboard, Radio, Flame, GitMerge,
  Globe, Shield, Bot, SearchCode, Crosshair,
  Map, FlipHorizontal2, Wand2, Shuffle, Activity,
  ListOrdered, SlidersHorizontal, ScrollText, Layers, Target, Settings, Zap,
  MessageSquare, Share2, Store, Package, Lock, ClipboardList, Network,
  FolderOpen, Server, GitBranch, CheckSquare, TrendingUp, Workflow,
  ShieldAlert, Swords, Waypoints, Sparkles, Search, Menu, X
} from "lucide-react";

export type UiThemeId = "parchment" | "slate-dark" | "obsidian-cyber" | "emerald-soc" | "daylight-slate";

export const UI_THEMES: Array<{
  id: UiThemeId;
  name: string;
  shortLabel: string;
  swatchBg: string;
  swatchAccent: string;
  swatchText: string;
  description: string;
}> = [
  {
    id: "parchment",
    name: "Warm Parchment (Black Ink)",
    shortLabel: "Parchment",
    swatchBg: "#f2ede4",
    swatchAccent: "#8b4528",
    swatchText: "#111111",
    description: "Warm editorial linen background, ivory cards, terracotta buttons & crisp black font"
  },
  {
    id: "slate-dark",
    name: "Classic Slate Dark (Previous)",
    shortLabel: "Classic Dark",
    swatchBg: "#0b0f17",
    swatchAccent: "#38bdf8",
    swatchText: "#f8fafc",
    description: "Our previous calm deep-slate background (#0b0f17) with sky-blue accents"
  },
  {
    id: "obsidian-cyber",
    name: "Obsidian Cyber (Tactical)",
    shortLabel: "Obsidian",
    swatchBg: "#050811",
    swatchAccent: "#06b6d4",
    swatchText: "#f8fafc",
    description: "Deep midnight obsidian (#050811) with high-contrast cyan & violet telemetry"
  },
  {
    id: "emerald-soc",
    name: "TrePath Emerald SOC (Dark)",
    shortLabel: "Emerald SOC",
    swatchBg: "#06100c",
    swatchAccent: "#10b981",
    swatchText: "#ecfdf5",
    description: "Dark forest carbon (#06100c) with emerald green SOC accents"
  },
  {
    id: "daylight-slate",
    name: "Crisp Daylight (Black Ink)",
    shortLabel: "Daylight",
    swatchBg: "#f1f5f9",
    swatchAccent: "#0284c7",
    swatchText: "#111111",
    description: "Cool alabaster light background, pure white cards, cobalt buttons & black font"
  }
];

const SECTIONS = [
  {
    title: "Command Center",
    items: [
      { href: "/vuln-management", icon: ShieldAlert,      label: "DAST Vuln Mgmt",    badge: "0-100", hot: true },
      { href: "/engine",          icon: Brain,            label: "Engine Brain",      badge: "AUTO", hot: true },
      { href: "/app",             icon: Swords,           label: "TrePath · SOC Portal", badge: "PRO", hot: true },
      { href: "/",                icon: LayoutDashboard,  label: "Security Overview" },
      { href: "/live-scan",       icon: Waypoints,        label: "4-Stage Pipeline",  badge: "LIVE", hot: true },
    ],
  },
  {
    title: "AI & Threat Intel",
    items: [
      { href: "/copilot",         icon: MessageSquare,    label: "TrePath Copilot",     badge: "AI",   hot: true },
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
      { href: "/plugins",         icon: Package,          label: "1,500 Plugins & MITRE", badge: "1532", hot: true },
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
  const [uiTheme, setUiTheme] = useState<UiThemeId>("parchment");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Command Center": true,
    "Active Attack & Probe": true
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("xtrike_dast_ui_theme") as UiThemeId | null;
      const validIds: UiThemeId[] = ["parchment", "slate-dark", "obsidian-cyber", "emerald-soc", "daylight-slate"];
      const initialTheme: UiThemeId = saved && validIds.includes(saved) ? saved : "parchment";
      setUiTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    } catch {
      document.documentElement.setAttribute("data-theme", "parchment");
    }

    const handleExternalThemeChange = (e: Event) => {
      const customEvt = e as CustomEvent<UiThemeId>;
      if (customEvt.detail) {
        setUiTheme(customEvt.detail);
      }
    };
    window.addEventListener("xtrike-theme-change", handleExternalThemeChange);
    return () => window.removeEventListener("xtrike-theme-change", handleExternalThemeChange);
  }, []);

  const applyTheme = (nextTheme: UiThemeId) => {
    setUiTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("xtrike_dast_ui_theme", nextTheme);
      window.dispatchEvent(new CustomEvent("xtrike-theme-change", { detail: nextTheme }));
    } catch {
      // ignore storage errors
    }
  };

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
            className={mobileMenuOpen ? "theme-solid-pill" : ""}
            style={{
              background: mobileMenuOpen ? "var(--primary)" : "var(--surface)",
              border: `1px solid ${mobileMenuOpen ? "var(--primary)" : "var(--border)"}`,
              color: mobileMenuOpen ? "var(--btn-fg)" : "var(--fg)",
              borderRadius: 8,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            <span>{mobileMenuOpen ? "Close" : "Studios"}</span>
          </button>

          <Link href="/engine" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "var(--pill-tint)",
              border: "1px solid var(--pill-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <Globe size={14} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--fg)", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                TrePath™ · DAST
              </div>
              <div style={{ fontSize: 8.5, color: "var(--muted)", fontWeight: 600, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                WEB &amp; API SECURITY
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <select
            value={uiTheme}
            onChange={e => applyTheme(e.target.value as UiThemeId)}
            aria-label="Switch color theme"
            style={{
              background: "var(--surface)",
              color: "var(--fg)",
              border: "1px solid var(--border-2)",
              borderRadius: 999,
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            {UI_THEMES.map(t => (
              <option key={t.id} value={t.id}>
                🎨 {t.shortLabel}
              </option>
            ))}
          </select>

          {[
            { href: "/vuln-management", label: "Vuln Mgmt" },
            { href: "/engine", label: "Engine Brain" },
            { href: "/app", label: "TrePath · SOC" },
            { href: "/", label: "Overview" }
          ].map(nav => {
            const isAct = path === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                className={isAct ? "theme-solid-pill" : ""}
                style={{
                  textDecoration: "none",
                  fontSize: 10.5,
                  fontWeight: isAct ? 700 : 600,
                  padding: "5px 10px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  background: isAct ? "var(--primary)" : "var(--surface)",
                  border: `1px solid ${isAct ? "var(--primary)" : "var(--border)"}`,
                  color: isAct ? "var(--btn-fg)" : "var(--fg)"
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
          width: 230, flexShrink: 0, 
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)", 
          overflowY: "auto",
          display: "flex", flexDirection: "column",
          zIndex: 50
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Link href="/engine" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid var(--border)",
                  flexShrink: 0
                }}>
                  <Globe size={15} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 5 }}>
                    TrePath™ · DAST
                    <span style={{ fontSize: 8.5, background: "var(--pill-tint)", color: "var(--fg)", border: "1px solid var(--pill-border)", borderRadius: 4, padding: "0 4px", fontWeight: 700 }}>WEB</span>
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>ENTERPRISE DAST PLATFORM</div>
                </div>
              </div>
            </Link>

            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close drawer"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                borderRadius: 6,
                padding: 4,
                cursor: "pointer"
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Interactive 5-Theme Background & Color Switcher ── */}
          <div style={{
            marginTop: 10,
            padding: "8px 9px",
            borderRadius: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "var(--fg)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🎨 Workspace Theme
              </span>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "var(--muted)" }}>
                {UI_THEMES.find(t => t.id === uiTheme)?.shortLabel}
              </span>
            </div>

            {/* 5 Quick Swatch Pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 6 }}>
              {UI_THEMES.map((t) => {
                const isSelected = uiTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTheme(t.id)}
                    title={`${t.name} — ${t.description}`}
                    style={{
                      height: 22,
                      borderRadius: 6,
                      background: t.swatchBg,
                      border: isSelected ? `2px solid ${t.swatchAccent}` : "1px solid rgba(120,120,120,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 1px 4px rgba(0,0,0,0.2)" : "none"
                    }}
                  >
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: t.swatchAccent,
                      display: "inline-block"
                    }} />
                  </button>
                );
              })}
            </div>

            <select
              value={uiTheme}
              onChange={(e) => applyTheme(e.target.value as UiThemeId)}
              style={{
                width: "100%",
                background: "var(--surface-2)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "4px 6px",
                fontSize: 10.5,
                fontWeight: 700,
                cursor: "pointer",
                outline: "none"
              }}
            >
              {UI_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter */}
          <div style={{ marginTop: 8, position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 8, top: 8, color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search 36 studios..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "5px 8px 5px 26px", fontSize: 11, color: "var(--fg)",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.05em" }}>7 STUDIO GROUPS</span>
            <button
              type="button"
              onClick={toggleAllSections}
              style={{
                background: "none",
                border: "none",
                color: "var(--fg)",
                fontSize: 9.5,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline"
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
                    background: "transparent",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: "var(--fg)",
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
                      <div
                        className={active ? "theme-solid-pill" : ""}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "6px 10px", margin: "2px 0", borderRadius: 8,
                          background: active ? "var(--primary)" : "transparent",
                          border: active ? "1px solid var(--primary-2)" : "1px solid transparent",
                          cursor: "pointer", transition: "all 0.15s ease-out"
                        }}
                      >
                        <Icon size={13.5} color={active ? "var(--btn-fg)" : "var(--fg)"} />
                        <span style={{
                          fontSize: 11.5,
                          color: active ? "var(--btn-fg)" : "var(--fg)",
                          fontWeight: active ? 700 : 500,
                          flex: 1
                        }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            fontSize: 8.5, padding: "1px 5px", borderRadius: 4, fontWeight: 700,
                            background: active ? "rgba(255, 255, 255, 0.22)" : "var(--surface-3)",
                            color: active ? "var(--btn-fg)" : "var(--fg)",
                            border: active ? "1px solid rgba(255, 255, 255, 0.35)" : "1px solid var(--border)",
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
          background: "var(--sidebar-footer)", fontSize: 9.5, color: "var(--muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: "var(--fg)", display: "flex", alignItems: "center", gap: 5 }}>
              <span className="beacon-green" /> ENGINE BRAIN ONLINE
            </span>
            <span style={{ color: "var(--fg)", fontWeight: 700 }}>4 DAEMONS</span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 9 }}>ZAP · Burp · OpenVAS · Nmap</div>
        </div>
      </aside>
    </>
  );
}
