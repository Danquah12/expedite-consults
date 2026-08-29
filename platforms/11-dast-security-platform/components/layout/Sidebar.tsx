"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain, LayoutDashboard, Radio, Flame, GitMerge,
  Globe, Shield, Bot, SearchCode, Crosshair,
  Map, FlipHorizontal2, Wand2, Shuffle, Activity,
  ListOrdered, SlidersHorizontal, ScrollText, Layers, Target, Settings, Zap,
  MessageSquare, Share2, Store, Package, Lock, ClipboardList, Network,
  FolderOpen, Server, GitBranch, CheckSquare, TrendingUp, Workflow,
  ShieldAlert, Swords, Waypoints
} from "lucide-react";


// ─── AXIOM Navigation v4.0 ────────────────────────────────────────────────────
const SECTIONS = [
  {
    title: "Overview",
    items: [
      { href: "/",         icon: LayoutDashboard, label: "Dashboard" },
      { href: "/engine",   icon: Brain,    label: "Engine Brain", badge: "AUTO", hot: true },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/copilot",         icon: MessageSquare, label: "AXIOM Copilot",    badge: "AI",   hot: true },
      { href: "/knowledge-graph", icon: Share2,        label: "Knowledge Graph",  badge: "NEW",  hot: true },
      { href: "/ai",              icon: Bot,           label: "AI Analyst" },
    ],
  },
  {
    title: "Intercept",
    items: [
      { href: "/proxy",         icon: Radio,      label: "Interceptor",   badge: "8" },
      { href: "/repeater",      icon: Flame,      label: "Forge" },
      { href: "/match-replace", icon: GitMerge,   label: "Rule Engine" },
    ],
  },
  {
    title: "Discover",
    items: [
      { href: "/auth",       icon: Shield,            label: "Auth Manager",  hot: true },
      { href: "/parameters", icon: SlidersHorizontal, label: "Param Lab" },
      { href: "/planner",    icon: Layers,            label: "Test Planner",  hot: true },
      { href: "/profiles",   icon: Target,            label: "Scan Profiles" },
    ],
  },
  {
    title: "Probe",
    items: [
      { href: "/scanner",      icon: Crosshair,   label: "Vuln Probe",        badge: "24" },
      { href: "/intruder",     icon: Shuffle,     label: "Fuzz Engine" },
      { href: "/crawler",      icon: Globe,       label: "Web Spider" },
      { href: "/api-scanner",  icon: SearchCode,  label: "API Inspector" },
      { href: "/exploit",      icon: Zap,         label: "Exploit Engine",    hot: true },
      { href: "/post-exploit", icon: ShieldAlert, label: "Priv Esc / Lateral",badge: "NEW", hot: true },
      { href: "/live-scan",    icon: Waypoints,   label: "Live Pipeline",     badge: "4ENG", hot: true },
    ],
  },

  {
    title: "Monitor",
    items: [
      { href: "/sitemap",     icon: Map,          label: "App Map" },
      { href: "/scope",       icon: Target,       label: "Scope Guard" },
      { href: "/oob",         icon: Network,      label: "OOB Monitor",   hot: true },
      { href: "/scan-queue",  icon: ListOrdered,  label: "Scan Queue" },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/marketplace",  icon: Store,        label: "Marketplace",    badge: "NEW", hot: true },
      { href: "/plugins",      icon: Package,      label: "Plugin Manager", badge: "5" },
      { href: "/rbac",         icon: Lock,         label: "Access Control", hot: true },
      { href: "/audit",        icon: ClipboardList,label: "Audit Log",      badge: "NEW", hot: true },
    ],
  },
  {
    title: "Phase 1 Services",
    items: [
      { href: "/projects",  icon: FolderOpen, label: "Projects & Orgs",    hot: true },
      { href: "/assets",    icon: Server,     label: "Asset Inventory",    hot: true },
      { href: "/pipeline",  icon: GitBranch,  label: "Findings Pipeline",  hot: true },
    ],
  },
  {
    title: "Phase 2 Intel",
    items: [
      { href: "/validation",   icon: CheckSquare, label: "Validation Service", hot: true },
      { href: "/risk-engine",  icon: TrendingUp,  label: "Risk Engine",        hot: true },
      { href: "/workflow",     icon: Workflow,     label: "Workflow Engine",    hot: true },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/decoder",    icon: Wand2,          label: "Transform" },
      { href: "/comparer",   icon: FlipHorizontal2,label: "Delta View" },
      { href: "/sequencer",  icon: Activity,       label: "Entropy Lab" },
      { href: "/logger",     icon: ScrollText,     label: "Trace Log" },
    ],
  },
  {
    title: "Report",
    items: [
      { href: "/evidence", icon: Layers, label: "Evidence Vault", hot: true },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: 190, flexShrink: 0, background: "var(--surface)",
      borderRight: "1px solid var(--border)", overflowY: "auto",
      display: "flex", flexDirection: "column",
    }}>
      {/* Logo */}
      <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #e8912d, #c96c10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>SAST-2 / DAST</div>
            <div style={{ fontSize: 8, color: "#e8912d", fontWeight: 700, letterSpacing: "0.04em" }}>AXIOM INTEL (V2)</div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: "6px 0" }}>
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 2 }}>
            <div style={{ padding: "6px 12px 3px", fontSize: 8.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {section.title}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "5px 12px", margin: "1px 4px", borderRadius: 5,
                    background: active ? "rgba(232,145,45,0.12)" : "transparent",
                    borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                    <Icon size={13} color={active ? "var(--primary)" : "var(--muted)"} />
                    <span style={{ fontSize: 11.5, color: active ? "var(--fg)" : "var(--muted)", fontWeight: active ? 600 : 400, flex: 1 }}>
                      {item.label}
                    </span>
                    {(item as any).badge && (
                      <span style={{
                        fontSize: 8.5, padding: "1px 5px", borderRadius: 8, fontWeight: 700,
                        background: (item as any).hot ? "rgba(232,145,45,0.15)" : "var(--surface)",
                        color: (item as any).hot ? "var(--primary)" : "var(--muted)",
                        border: `1px solid ${(item as any).hot ? "rgba(232,145,45,0.3)" : "var(--border)"}`,
                      }}>
                        {(item as any).badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", fontSize: 9, color: "var(--muted)" }}>
        <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: 2 }}>AXIOM v4.0</div>
        <div>22-stage · 15 agents · 24 plugins</div>
        <div>ZAP · Burp · OpenVAS · Nmap</div>
        <div style={{ marginTop: 2, color: "var(--green)" }}>Phase 1 + Phase 2 Services</div>
      </div>
    </aside>
  );
}
