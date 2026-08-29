"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Scan,
  FileText,
  Binary,
  Layers,
  Key,
  ShieldCheck,
  Archive,
  AlertTriangle,
  GitGraph,
  Sparkles,
  HardDrive,
  ListOrdered,
  Box,
  Store,
  Flame,
  CheckCircle,
  Activity,
  PlaySquare,
  Users,
  Building,
  Radio,
  FileSpreadsheet,
  BookOpen,
  PieChart,
  Terminal,
  Cpu,
  ShieldAlert,
  Zap,
  Target,
  FileCheck,
  Lock,
  Search,
  Network,
  Crosshair,
  TrendingUp,
  FileWarning,
  Eye,
  Server,
  Bot,
  DollarSign,
  Briefcase,
  History,
  HelpCircle,
  Lightbulb,
  Workflow,
  Compass,
  Hourglass,
  Sliders,
  FlaskConical
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      group: "🌟 Master Autopilot & Consoles",
      items: [
        { href: "/autopilot", label: "Resilience Autopilot", icon: Zap, badge: "AI Core" },
        { href: "/", label: "Recovery Command Center", icon: LayoutDashboard, badge: "Master" },
        { href: "/recovery-war-room", label: "Major Incident War Room", icon: ShieldAlert, badge: "Live Ops" },
        { href: "/copilot", label: "Local AI Security Copilot", icon: Bot, badge: "Assistant" },
        { href: "/executive", label: "Executive Impact Board", icon: PieChart, badge: "C-Level" },
        { href: "/soc-analyst", label: "SOC Analyst Workspace", icon: Terminal, badge: "Triage" },
        { href: "/recovery-ops", label: "Recovery Operations Desk", icon: Cpu, badge: "Ops" },
      ]
    },
    {
      group: "🛡️ Stage 1: PREPARE & ASSESS",
      items: [
        { href: "/resilience-score", label: "Resilience Scorecard", icon: TrendingUp, badge: "Radar" },
        { href: "/readiness", label: "Pre-Incident Readiness", icon: Activity, badge: "Posture" },
        { href: "/attack-surface", label: "Ransomware Attack Surface", icon: Target, badge: "ASM" },
        { href: "/vuln-prioritization", label: "Ransomware Vuln Prioritizer", icon: Crosshair, badge: "Risk" },
        { href: "/supply-chain-risk", label: "Supply-Chain & Vendor Risk", icon: Briefcase, badge: "Third-Party" },
        { href: "/insurance-readiness", label: "Cyber Insurance Readiness", icon: ShieldCheck, badge: "Underwrite" },
        { href: "/backup-verification", label: "Proactive Backup Verifier", icon: FileCheck, badge: "Auto-Drill" },
      ]
    },
    {
      group: "🚨 Stage 2: PREVENT & EARLY WARNING",
      items: [
        { href: "/gpu-analytics", label: "GPU Acceleration & RAPIDS", icon: Zap, badge: "FLAGSHIP" },
        { href: "/adaptive-baselining", label: "Adaptive Dynamic Baselining", icon: Sliders, badge: "μ+3σ" },
        { href: "/multi-stage-scoring", label: "Multi-Stage 6-Signal Scoring", icon: Target, badge: "FPR <2%" },
        { href: "/early-warning", label: "Pre-Encryption Early Warning", icon: Zap, badge: "Stream" },
        { href: "/canary-deception", label: "Canary Files & Trap Grid", icon: Eye, badge: "Tripwire" },
        { href: "/identity-defense", label: "Identity & AD Defense", icon: ShieldAlert, badge: "Kerberos" },
        { href: "/exposure-digital-twin", label: "Exposure Digital Twin", icon: GitGraph, badge: "Cascade" },
        { href: "/attack-paths", label: "Attack Paths & Chokepoints", icon: Network, badge: "DAG" },
        { href: "/blast-radius", label: "Blast Radius Prediction", icon: Crosshair, badge: "Impact" },
      ]
    },
    {
      group: "🛑 Stage 3: CONTAIN & INTERRUPT",
      items: [
        { href: "/ebpf-freeze", label: "eBPF Syscall Freeze & Key Rescue", icon: Cpu, badge: "FLAGSHIP" },
        { href: "/attack-progression", label: "Attack-Progression Model", icon: History, badge: "8 Stages" },
        { href: "/killchain-interrupter", label: "Kill-Chain Interrupter", icon: Target, badge: "Mitigate" },
        { href: "/backup-lockdown", label: "Critical Backup Lockdown", icon: Lock, badge: "Emergency" },
        { href: "/point-of-no-return", label: "Point of No Return (PONR)", icon: Hourglass, badge: "Urgency" },
        { href: "/containment", label: "Automated Containment", icon: Lock, badge: "4 Modes" },
        { href: "/pre-encryption-ml", label: "Pre-Encryption ML Model", icon: Sparkles, badge: "99.4%" },
        { href: "/emergency-playbooks", label: "Emergency Playbooks", icon: Workflow, badge: "IF/THEN" },
        { href: "/approvals", label: "Dual-Custody Approvals", icon: Users, badge: "Governance" },
      ]
    },
    {
      group: "🔍 Stage 4: DETECT & TRIAGE",
      items: [
        { href: "/cases", label: "Incident Intake & Cases", icon: Building2, badge: "Case Mgmt" },
        { href: "/triage", label: "Automated Incident Triage", icon: Scan, badge: "1-Click" },
        { href: "/actor-negotiator", label: "AI Actor Negotiator & OFAC", icon: Bot, badge: "FLAGSHIP" },
        { href: "/ransom-notes", label: "Ransom Note Intelligence", icon: FileText, badge: "NLP / Tor" },
        { href: "/file-patterns", label: "Encrypted File Patterns", icon: Binary, badge: "Headers" },
        { href: "/campaigns", label: "Campaign Correlator", icon: Layers, badge: "Nexus" },
        { href: "/cross-customer-intel", label: "Cross-Customer Intel", icon: Compass, badge: "Privacy" },
      ]
    },
    {
      group: "🔬 Stage 5: INVESTIGATE & PRESERVE",
      items: [
        { href: "/crypto-analysis", label: "Cryptographic Analyzer", icon: Key, badge: "ChaCha/RSA" },
        { href: "/root-cause", label: "Automated Root-Cause", icon: Search, badge: "Kill Chain" },
        { href: "/exfiltration-assessor", label: "Data Exfiltration Assessor", icon: FileWarning, badge: "Extortion" },
        { href: "/what-if-simulator", label: "What-If Simulator", icon: HelpCircle, badge: "Scenario" },
        { href: "/evidence", label: "Evidence & Chain of Custody", icon: ShieldCheck, badge: "FRE 901" },
        { href: "/vault", label: "Immutable Evidence Vault", icon: Archive, badge: "WORM S3" },
        { href: "/impact-assessment", label: "Business Impact & Queue", icon: AlertTriangle, badge: "Priority" },
        { href: "/digital-twin", label: "Digital Twin Dependencies", icon: GitGraph, badge: "Impact DAG" },
      ]
    },
    {
      group: "🚀 Stage 6: RECOVER & ORCHESTRATE",
      items: [
        { href: "/zero-loss-workflow", label: "Zero-Loss 5-Step Safe Recovery", icon: FileCheck, badge: "FLAGSHIP" },
        { href: "/diff-reconstruction", label: "Partial-File Reconstructor", icon: Binary, badge: "FLAGSHIP" },
        { href: "/ad-forest-recovery", label: "AD Forest Disaster Recovery", icon: Server, badge: "FLAGSHIP" },
        { href: "/cryptanalytic-bridge", label: "CERBERUS-RE Crypto Bridge", icon: Zap, badge: "FLAGSHIP" },
        { href: "/feasibility", label: "Recovery Feasibility Engine", icon: Sparkles, badge: "Strategy" },
        { href: "/recovery-matrix", label: "Recovery Decision Matrix", icon: ListOrdered, badge: "Ranking" },
        { href: "/cost-estimator", label: "Cost-of-Incident Estimator", icon: DollarSign, badge: "ROI / SLA" },
        { href: "/backup-assessment", label: "Backup Readiness Evaluator", icon: HardDrive, badge: "Snapshots" },
        { href: "/recovery-planner", label: "Recovery Plan Orchestrator", icon: ListOrdered, badge: "RTO / RPO" },
        { href: "/sandbox", label: "Forensic Recovery Sandbox", icon: Box, badge: "Isolated" },
        { href: "/airgap-recovery", label: "Air-Gapped Recovery Zone", icon: Server, badge: "IRE" },
        { href: "/marketplace", label: "Decryptor & Plugin Hub", icon: Store, badge: "Registry" },
      ]
    },
    {
      group: "✅ Stage 7: VALIDATE & PROTECT",
      items: [
        { href: "/synthetic-attack-lab", label: "Synthetic Attack Lab & Bench", icon: FlaskConical, badge: "5 Scenarios" },
        { href: "/reinfection-risk", label: "Reinfection Risk Hunter", icon: Flame, badge: "Persistence" },
        { href: "/clean-validation", label: "Clean Recovery Gatekeeper", icon: CheckCircle, badge: "Sign-off" },
        { href: "/simulation", label: "Tabletop Cyber Simulation", icon: PlaySquare, badge: "Drill" },
        { href: "/recovery-benchmark", label: "Recovery SLA Benchmarks", icon: History, badge: "MTTD/MTTR" },
      ]
    },
    {
      group: "🏛️ Stage 8: GOVERN, LEARN & DISCLOSE",
      items: [
        { href: "/ai-safety", label: "Explainable AI Safety Layer", icon: Lightbulb, badge: "Trust Score" },
        { href: "/confidence-index", label: "Recovery Confidence Index", icon: TrendingUp, badge: "RCI Score" },
        { href: "/compliance-disclosure", label: "Regulatory Disclosures", icon: FileSpreadsheet, badge: "SEC/HIPAA" },
        { href: "/lessons-learned", label: "Lessons Learned & Roadmap", icon: History, badge: "Post-Mortem" },
        { href: "/adaptive-policies", label: "Adaptive Security Policies", icon: ShieldCheck, badge: "Auto-Rule" },
        { href: "/tenants", label: "Multi-Tenant Isolation", icon: Building, badge: "RBAC" },
        { href: "/integrations", label: "Enterprise Integrations", icon: Radio, badge: "SIEM / EDR" },
        { href: "/predictive-ai", label: "Predictive Recovery AI", icon: Sparkles, badge: "ML Forecast" },
        { href: "/reports", label: "Post-Incident Reports", icon: FileSpreadsheet, badge: "Audit" },
        { href: "/knowledge-base", label: "Recovery Knowledge Base", icon: BookOpen, badge: "Wiki" },
        { href: "/platform-dr", label: "Platform Disaster Recovery", icon: Lock, badge: "Break-Glass" },
      ]
    }
  ];

  return (
    <aside style={{
      width: 295,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 54px)",
      overflowY: "auto",
      flexShrink: 0
    }}>
      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 14 }}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div style={{
              fontSize: 9.5,
              fontWeight: 800,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "4px 8px",
              marginBottom: 4
            }}>
              {group.group}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#10b981" : "var(--fg-2)",
                      background: active ? "rgba(16,185,129,0.12)" : "transparent",
                      border: active ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.12s ease"
                    }}
                  >
                    <Icon size={13} color={active ? "#10b981" : "var(--muted)"} />
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: 8.5,
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: 4,
                        background: active ? "rgba(16,185,129,0.2)" : item.badge === "FLAGSHIP" ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
                        color: active ? "#10b981" : item.badge === "FLAGSHIP" ? "#06b6d4" : "var(--muted)",
                        border: item.badge === "FLAGSHIP" ? "1px solid rgba(6,182,212,0.4)" : "1px solid var(--border)",
                        fontFamily: "monospace"
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
