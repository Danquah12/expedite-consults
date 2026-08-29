"use client";
import { useState } from "react";
import { Target, CheckCircle, Play } from "lucide-react";

type ProfileKey = "passive" | "safe" | "standard" | "deep" | "api" | "custom";

interface Profile {
  id:          ProfileKey;
  name:        string;
  icon:        string;
  description: string;
  intensity:   string;
  plugins:     string[];
  rateLimit:   string;
  jsEngine:    boolean;
  oob:         boolean;
  auth:        boolean;
  color:       string;
}

const PROFILES: Profile[] = [
  {
    id: "passive", name: "Passive", icon: "👁", color: "#4fc3f7",
    description: "No active payloads. Observe headers, cookies, TLS, and information exposure only. Safe for production.",
    intensity: "None — observation only", rateLimit: "No limit", jsEngine: false, oob: false, auth: false,
    plugins: ["Security Headers","TLS/SSL","Cookie Flags","CORS","Sensitive Data Exposure","Error Messages","Info Disclosure"],
  },
  {
    id: "safe", name: "Safe Active", icon: "🛡", color: "var(--green)",
    description: "Low-rate active testing with minimal payloads. Extremely unlikely to cause disruption.",
    intensity: "Low — 5 req/s max", rateLimit: "5 req/s", jsEngine: false, oob: false, auth: true,
    plugins: ["Security Headers","CORS","Authentication","Rate Limiting","Open Redirect","Error Handling"],
  },
  {
    id: "standard", name: "Standard", icon: "⚡", color: "var(--primary)",
    description: "Comprehensive coverage of common web and API vulnerabilities at a safe scan rate.",
    intensity: "Normal — 15 req/s", rateLimit: "15 req/s", jsEngine: true, oob: false, auth: true,
    plugins: ["SQLi","XSS","SSRF","CSRF","IDOR","JWT Security","CORS","Security Headers","Path Traversal","Open Redirect","Rate Limiting","Auth","Mass Assignment"],
  },
  {
    id: "deep", name: "Deep Scan", icon: "🔬", color: "var(--yellow)",
    description: "Extended payload testing, multiple encodings, JavaScript crawling, OOB interaction monitoring.",
    intensity: "Aggressive — 30 req/s", rateLimit: "30 req/s", jsEngine: true, oob: true, auth: true,
    plugins: ["SQLi (multi-encode)","XSS (stored/reflected/DOM)","SSRF + OOB","CSRF","IDOR","JWT (alg:none, key confusion)","CORS","Headers","Path Traversal","LFI","XXE","SSTI","CMDi","Prototype Pollution","Open Redirect","Mass Assignment","Business Logic","File Upload","WebSocket","Rate Limiting","Auth Bypass","OAuth/OIDC","GraphQL","Serialization"],
  },
  {
    id: "api", name: "API Security", icon: "🔌", color: "#ce93d8",
    description: "Focused on REST and GraphQL APIs. OWASP API Top 10 full coverage with spec-aware testing.",
    intensity: "Normal — 15 req/s", rateLimit: "15 req/s", jsEngine: false, oob: true, auth: true,
    plugins: ["BOLA/IDOR","Broken Auth","Excessive Data Exposure","Rate Limiting","Mass Assignment","Security Misconfiguration","CORS","JWT Security","Injection (API)","Asset Management","GraphQL Security","Schema Validation","API Key Exposure"],
  },
  {
    id: "custom", name: "Custom", icon: "⚙", color: "var(--muted)",
    description: "Build your own profile — select exactly which plugins to run, rate limits, and engine settings.",
    intensity: "User-defined", rateLimit: "User-defined", jsEngine: false, oob: false, auth: false,
    plugins: [],
  },
];

const ALL_PLUGINS = ["SQLi","XSS (Reflected)","XSS (Stored)","XSS (DOM)","SSRF","XXE","SSTI","CMDi","LFI","Path Traversal","IDOR/BOLA","CSRF","JWT Security","CORS","Security Headers","TLS/SSL","Cookie Flags","Open Redirect","Rate Limiting","Mass Assignment","Auth Bypass","OAuth/OIDC","GraphQL","File Upload","WebSocket","Prototype Pollution","Business Logic","Serialization","API Key Exposure","Sensitive Data Exposure","Schema Validation"];

export default function ProfilesPage() {
  const [active,   setActive]   = useState<ProfileKey>("standard");
  const [customPlugins, setCustomPlugins] = useState<Set<string>>(new Set());

  const profile = PROFILES.find(p => p.id === active)!;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <Target size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Scan Profiles</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>— Configure automation intensity and plugin selection</span>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-primary"><Play size={11} /> Start Scan with {profile.name}</button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* Profile cards */}
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", padding: "8px 0" }}>
          {PROFILES.map(p => (
            <div key={p.id} onClick={() => setActive(p.id)}
              style={{ padding: "10px 12px", marginBottom: 2, cursor: "pointer", borderLeft: active === p.id ? `2px solid ${p.color}` : "2px solid transparent", background: active === p.id ? `${p.color}08` : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: active === p.id ? 700 : 500, color: active === p.id ? "#fff" : "var(--fg)" }}>{p.name}</span>
                {active === p.id && <CheckCircle size={11} color={p.color} />}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", paddingLeft: 23 }}>{p.plugins.length || "Custom"} plugins</div>
            </div>
          ))}
        </div>

        {/* Profile detail */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>{profile.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{profile.description}</div>
            </div>
          </div>

          {/* Settings grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { l: "Intensity",   v: profile.intensity,           c: profile.color },
              { l: "Rate Limit",  v: profile.rateLimit,           c: "var(--muted)" },
              { l: "JS Engine",   v: profile.jsEngine ? "✓ Playwright" : "✗ Disabled", c: profile.jsEngine ? "var(--green)" : "var(--muted)" },
              { l: "OOB Monitor", v: profile.oob ? "✓ Enabled" : "✗ Disabled",         c: profile.oob ? "var(--green)" : "var(--muted)" },
              { l: "Auth",        v: profile.auth ? "✓ Required" : "✗ Not Required",    c: profile.auth ? "var(--green)" : "var(--muted)" },
              { l: "Plugins",     v: profile.id === "custom" ? `${customPlugins.size} selected` : profile.plugins.length.toString(), c: profile.color },
            ].map(s => (
              <div key={s.l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Plugin list or selector */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--fg)", marginBottom: 8 }}>
            {profile.id === "custom" ? "Select Plugins" : `Plugins (${profile.plugins.length})`}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.id === "custom" ? ALL_PLUGINS.map(plug => (
              <button key={plug} onClick={() => setCustomPlugins(s => { const n = new Set(s); if (n.has(plug)) n.delete(plug); else n.add(plug); return n; })}
                className="btn-secondary"
                style={customPlugins.has(plug) ? { borderColor: "var(--primary)", color: "var(--primary)", background: "rgba(232,145,45,0.08)", fontSize: 11 } : { fontSize: 11 }}>
                {customPlugins.has(plug) ? "✓ " : ""}{plug}
              </button>
            )) : profile.plugins.map(plug => (
              <span key={plug} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${profile.color}30`, color: profile.color, background: `${profile.color}08`, fontSize: 11 }}>
                {plug}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
