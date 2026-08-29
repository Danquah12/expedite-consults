"use client";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Key, Users, Building, Plus, Copy, Trash2, Lock, Unlock,
  CheckCircle, RefreshCw, Globe, Sliders, Radio, Eye, EyeOff, Search,
  Filter, ShieldAlert, Check, X, ArrowRight, Zap, Play, Terminal,
  Cpu, RotateCcw, UserCheck, Smartphone, Laptop, AlertOctagon, CheckCircle2,
  FileKey, Settings, ChevronRight
} from "lucide-react";
import { IDENTITY_TENANTS, SCOPED_API_TOKENS, CONNECTED_PLATFORMS } from "@/data/integrationData";
import { ScopedApiToken, IdentityTenant, PlatformId } from "@/types/integration";

interface ActiveSession {
  id: string;
  userPrincipal: string;
  role: string;
  tenantName: string;
  ipAddress: string;
  location: string;
  deviceTrust: "TRUSTED" | "MANAGED" | "UNTRUSTED";
  mfaMethod: string;
  targetPlatform: string;
  decision: "ALLOW" | "STEP_UP" | "QUARANTINED";
  loginTime: string;
}

export default function UnifiedIdentityPage() {
  const [tenants, setTenants] = useState<IdentityTenant[]>(IDENTITY_TENANTS);
  const [tokens, setTokens] = useState<ScopedApiToken[]>(SCOPED_API_TOKENS);
  const [selectedTenant, setSelectedTenant] = useState<IdentityTenant | null>(null);
  const [activeTab, setActiveTab] = useState<"TOKENS" | "RBAC_MATRIX" | "SESSIONS" | "POLICIES">("TOKENS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tokenStatusFilter, setTokenStatusFilter] = useState<string>("ALL");
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [generatedSecretModal, setGeneratedSecretModal] = useState<{ id: string; key: string } | null>(null);

  // New Token Form State
  const [newTokenName, setNewTokenName] = useState<string>("");
  const [issuedToEmail, setIssuedToEmail] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(["cerberus-re", "aegis-recovery"]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["telemetry:read", "ioc:write"]);
  const [rateLimit, setRateLimit] = useState<number>(5000);
  const [tokenExpiryDays, setTokenExpiryDays] = useState<number>(365);

  // Zero-Trust Active Sessions Stream
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: "SESS-8810",
      userPrincipal: "sarah.connor@acmefinancial.com",
      role: "Security Administrator",
      tenantName: "Acme Financial Global Corp",
      ipAddress: "192.88.99.14 (Corp VPN)",
      location: "New York, USA",
      deviceTrust: "TRUSTED",
      mfaMethod: "FIDO2 WebAuthn (YubiKey 5C)",
      targetPlatform: "Platform 17 (Aegis Recovery)",
      decision: "ALLOW",
      loginTime: "Just now"
    },
    {
      id: "SESS-8809",
      userPrincipal: "alex.mercer@apexhealth.org",
      role: "Malware Reverse Engineer",
      tenantName: "Apex Healthcare & LifeSciences",
      ipAddress: "172.56.21.90 (Healthcare VLAN)",
      location: "Boston, USA",
      deviceTrust: "MANAGED",
      mfaMethod: "Microsoft Authenticator (Push + Number)",
      targetPlatform: "Platform 16 (CERBERUS-RE)",
      decision: "ALLOW",
      loginTime: "3m ago"
    },
    {
      id: "SESS-8808",
      userPrincipal: "svc-github-actions@defensedynamics.mil",
      role: "CI/CD Pipeline Machine Principal",
      tenantName: "Defense Dynamics Aerospace",
      ipAddress: "52.14.88.201 (AWS us-east-1)",
      location: "Ashburn, USA",
      deviceTrust: "TRUSTED",
      mfaMethod: "Mutual TLS + HSM Scoped Token",
      targetPlatform: "Platform 11 (SAST-2 / DAST AXIOM)",
      decision: "ALLOW",
      loginTime: "12m ago"
    },
    {
      id: "SESS-8807",
      userPrincipal: "unknown.dev@contractor-relay.net",
      role: "External Auditor",
      tenantName: "Acme Financial Global Corp",
      ipAddress: "185.220.101.5 (Tor Exit Node)",
      location: "Frankfurt, Germany",
      deviceTrust: "UNTRUSTED",
      mfaMethod: "Password Only (No WebAuthn)",
      targetPlatform: "Platform 18 (Unified Integration)",
      decision: "QUARANTINED",
      loginTime: "18m ago"
    }
  ]);

  // RBAC Roles & Permissions Matrix State
  const [roles, setRoles] = useState([
    {
      id: "role-admin",
      name: "Security Administrator",
      desc: "Full administrative read/write/kill privileges across all 16 platforms and KMS vaults.",
      usersCount: 6,
      permissions: {
        sast_scan: true,
        dast_fuzz: true,
        malware_reverse: true,
        worm_recovery: true,
        soar_execute: true,
        kms_rotate: true
      }
    },
    {
      id: "role-analyst",
      name: "SOC Incident Responder",
      desc: "Investigate alerts, correlate cross-platform IOCs, and execute pre-approved SOAR playbooks.",
      usersCount: 24,
      permissions: {
        sast_scan: true,
        dast_fuzz: true,
        malware_reverse: true,
        worm_recovery: false,
        soar_execute: true,
        kms_rotate: false
      }
    },
    {
      id: "role-pentester",
      name: "PenTester & Red Team Lead",
      desc: "Execute autonomous DAST fuzzers, API security tests, and exploitability verification runs.",
      usersCount: 8,
      permissions: {
        sast_scan: true,
        dast_fuzz: true,
        malware_reverse: false,
        worm_recovery: false,
        soar_execute: false,
        kms_rotate: false
      }
    },
    {
      id: "role-auditor",
      name: "Executive Auditor & CISO",
      desc: "Read-only access to compliance reports, SEC 8-K disclosures, and zero-trust audit ledgers.",
      usersCount: 4,
      permissions: {
        sast_scan: false,
        dast_fuzz: false,
        malware_reverse: false,
        worm_recovery: false,
        soar_execute: false,
        kms_rotate: false
      }
    }
  ]);

  // Policy Settings State
  const [policyMfaMandatory, setPolicyMfaMandatory] = useState<boolean>(true);
  const [policySessionTimeoutMin, setPolicySessionTimeoutMin] = useState<number>(15);
  const [policyBlockTorExitNodes, setPolicyBlockTorExitNodes] = useState<boolean>(true);
  const [policyKmsAutoRotationDays, setPolicyKmsAutoRotationDays] = useState<number>(90);

  // Generate Token Handler
  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    const rawSecret = `exp_live_sec_${Math.random().toString(36).substring(2, 14)}_${Math.random().toString(36).substring(2, 14)}`;
    const created: ScopedApiToken = {
      id: `TOK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTokenName,
      prefix: rawSecret.substring(0, 18) + "...",
      issuedTo: issuedToEmail,
      assignedPlatforms: selectedPlatforms,
      permissions: selectedPermissions,
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: new Date(Date.now() + tokenExpiryDays * 86400000).toISOString().split("T")[0],
      lastUsedAt: "Never",
      rateLimitPerMin: rateLimit,
      status: "ACTIVE"
    };

    setTokens([created, ...tokens]);
    setIsGenerateModalOpen(false);
    setGeneratedSecretModal({ id: created.id, key: rawSecret });
    setNewTokenName("");
    setIssuedToEmail("");
  };

  // Revoke Token Handler
  const handleRevokeToken = (id: string) => {
    setTokens(tokens.map((t) => (t.id === id ? { ...t, status: "REVOKED" } : t)));
  };

  // Kill Session Handler
  const handleKillSession = (sessId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessId));
  };

  // Toggle RBAC Permission Handler
  const togglePermission = (roleId: string, permKey: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !(r.permissions as any)[permKey]
          }
        };
      }
      return r;
    }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const togglePlatformSelection = (pId: PlatformId) => {
    if (selectedPlatforms.includes(pId)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== pId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  const togglePermissionSelection = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  // Filter Tokens
  const filteredTokens = tokens.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.issuedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.prefix.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (tokenStatusFilter === "ALL") return true;
    return t.status === tokenStatusFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.1) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.35)"
          }}>
            <ShieldCheck size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Unified Identity, SSO & Zero-Trust RBAC Hub
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                ZERO-TRUST ACTIVE
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              Federated OAuth2 / OIDC & SAML 2.0 with continuous session auditing, Hardware HSM token generation, and multi-tenant enclave isolation.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 16px" }}
          >
            <Plus size={14} />
            <span>Generate Scoped API Token</span>
          </button>
        </div>
      </div>

      {/* ── 4 Identity Posture KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "MFA Enforcement", val: "100.0%", sub: "FIDO2 WebAuthn mandatory", color: "#10b981" },
          { label: "Zero-Trust Health Score", val: "96.8 / 100", sub: "Continuous session auditing", color: "#06b6d4" },
          { label: "Federated Identity Tenants", val: `${tenants.length} Active`, sub: "Okta, Entra ID, PingFederate", color: "#a855f7" },
          { label: "Active API Service Tokens", val: `${tokens.filter(t => t.status === "ACTIVE").length} Scoped`, sub: "Hardware HSM backed", color: "#f59e0b" }
        ].map((kpi, i) => (
          <div key={i} className="card-tactical" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{kpi.val}</div>
            <div style={{ fontSize: 11, color: kpi.color, fontWeight: 600 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Multi-Tenant Isolated Enclaves Directory ── */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Building size={17} color="#06b6d4" />
            <h2 style={{ fontSize: 15, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Multi-Tenant Isolated Enclaves
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Click any tenant enclave to inspect KMS keys, SAML 2.0 metadata, and compliance posture:
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          {tenants.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTenant(t)}
              style={{
                background: selectedTenant?.id === t.id ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                border: `1px solid ${selectedTenant?.id === t.id ? "#06b6d4" : "var(--border)"}`,
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 0.15s ease"
              }}
              className="hover:border-cyan-500"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>{t.tenantName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.domain}</div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}>
                  {t.complianceTier}
                </span>
              </div>

              <div style={{ background: "var(--surface-3)", padding: "8px 12px", borderRadius: 6, fontSize: 11, display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>SSO Provider:</span>
                  <strong style={{ color: "#06b6d4" }}>{t.ssoProvider}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Zero-Trust Score:</span>
                  <strong style={{ color: "#10b981" }}>{t.zeroTrustPostureScore}% Posture</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Active Users / Tokens:</span>
                  <span style={{ color: "#f8fafc" }}>{t.activeUsersCount} users · {t.apiTokensCount} keys</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>DB: {t.isolatedDbCluster}</span>
                <span style={{ color: "#06b6d4", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Inspect Enclave</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Studio Tabs: Scoped Tokens / RBAC Matrix / Active Sessions / Policies ── */}
      <div className="card-tactical" style={{ padding: 20 }}>
        
        {/* Navigation Tab Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "TOKENS", label: "Scoped Service Tokens", icon: Key, count: tokens.length },
              { id: "RBAC_MATRIX", label: "RBAC Permission Matrix", icon: ShieldCheck, count: roles.length },
              { id: "SESSIONS", label: "Active Zero-Trust Sessions", icon: UserCheck, count: activeSessions.length },
              { id: "POLICIES", label: "Zero-Trust Enforcement Policies", icon: Sliders }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isActive ? "1px solid #10b981" : "1px solid var(--border)",
                    background: isActive ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                    color: isActive ? "#10b981" : "var(--muted)",
                    transition: "all 0.15s"
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4 }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search bar when on Tokens tab */}
          {activeTab === "TOKENS" && (
            <div style={{ position: "relative", width: 240 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search tokens, users, fleets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  fontSize: 11.5,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "#f8fafc",
                  outline: "none"
                }}
              />
            </div>
          )}
        </div>

        {/* ── TAB 1: Scoped Service Tokens ── */}
        {activeTab === "TOKENS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {["ALL", "ACTIVE", "REVOKED"].map(st => (
                <button
                  key={st}
                  onClick={() => setTokenStatusFilter(st)}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 4,
                    border: tokenStatusFilter === st ? "1px solid #10b981" : "1px solid var(--border)",
                    background: tokenStatusFilter === st ? "rgba(16,185,129,0.15)" : "transparent",
                    color: tokenStatusFilter === st ? "#10b981" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 13.5, color: "#f8fafc" }}>
                        {token.name}
                      </span>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: token.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                        color: token.status === "ACTIVE" ? "#10b981" : "#f43f5e",
                        border: `1px solid ${token.status === "ACTIVE" ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`
                      }}>
                        {token.status}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        Issued to: <strong style={{ color: "#38bdf8" }}>{token.issuedTo}</strong>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>AUTHORIZED FLEETS:</span>
                      {token.assignedPlatforms.map((p, idx) => (
                        <span key={idx} style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          background: "rgba(6,182,212,0.1)",
                          color: "#06b6d4",
                          padding: "1px 5px",
                          borderRadius: 3
                        }}>
                          {p.toUpperCase()}
                        </span>
                      ))}
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>
                        · Rate: {token.rateLimitPerMin.toLocaleString()} req/min
                      </span>
                    </div>

                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>
                      Prefix: <strong style={{ color: "#a855f7" }}>{token.prefix}</strong> · Expires: {token.expiresAt} · Last Used: {token.lastUsedAt}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => handleCopy(token.id, token.prefix)}
                      style={{
                        background: "var(--surface-3)",
                        border: "1px solid var(--border)",
                        color: "var(--fg)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Copy size={12} />
                      <span>{copiedTokenId === token.id ? "Copied!" : "Copy"}</span>
                    </button>

                    {token.status === "ACTIVE" && (
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        style={{
                          background: "rgba(244,63,94,0.15)",
                          border: "1px solid rgba(244,63,94,0.3)",
                          color: "#f43f5e",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Revoke Token
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: RBAC Permission Matrix ── */}
        {activeTab === "RBAC_MATRIX" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              Interactive Zero-Trust Role-Based Access Control matrix. Click any permission cell to toggle granular authorization:
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                    <th style={{ padding: "10px 12px" }}>ROLE NAME & DESCRIPTION</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>SAST SCAN</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>DAST FUZZ</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>MALWARE DISSECT</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>WORM RECOVERY</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>SOAR DISPATCH</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>KMS ROTATION</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px 12px", maxWidth: 300 }}>
                        <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: 13 }}>{r.name}</div>
                        <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{r.desc}</div>
                        <span style={{ fontSize: 9.5, color: "#a855f7", fontWeight: 700 }}>{r.usersCount} Active Users</span>
                      </td>

                      {[
                        { key: "sast_scan", val: r.permissions.sast_scan },
                        { key: "dast_fuzz", val: r.permissions.dast_fuzz },
                        { key: "malware_reverse", val: r.permissions.malware_reverse },
                        { key: "worm_recovery", val: r.permissions.worm_recovery },
                        { key: "soar_execute", val: r.permissions.soar_execute },
                        { key: "kms_rotate", val: r.permissions.kms_rotate }
                      ].map((p) => (
                        <td key={p.key} style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button
                            onClick={() => togglePermission(r.id, p.key)}
                            style={{
                              background: p.val ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.1)",
                              border: `1px solid ${p.val ? "#10b981" : "rgba(244,63,94,0.3)"}`,
                              color: p.val ? "#10b981" : "#f43f5e",
                              padding: "4px 10px",
                              borderRadius: 4,
                              fontSize: 10.5,
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            {p.val ? "✓ ALLOW" : "✗ DENY"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: Active Zero-Trust Sessions ── */}
        {activeTab === "SESSIONS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Continuous Zero-Trust session evaluation with real-time risk scoring and device telemetry:
              </span>
              <span style={{ fontSize: 10.5, color: "#10b981", fontWeight: 800 }}>
                {activeSessions.filter(s => s.decision === "ALLOW").length} HEALTHY · {activeSessions.filter(s => s.decision === "QUARANTINED").length} QUARANTINED
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                    <th style={{ padding: "8px 12px" }}>USER PRINCIPAL & ROLE</th>
                    <th style={{ padding: "8px 12px" }}>TENANT</th>
                    <th style={{ padding: "8px 12px" }}>IP & LOCATION</th>
                    <th style={{ padding: "8px 12px" }}>DEVICE TRUST</th>
                    <th style={{ padding: "8px 12px" }}>MFA METHOD</th>
                    <th style={{ padding: "8px 12px" }}>DECISION</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((sess) => (
                    <tr key={sess.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 800, color: "#f8fafc" }}>{sess.userPrincipal}</div>
                        <div style={{ fontSize: 10, color: "#38bdf8" }}>{sess.role}</div>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{sess.tenantName}</td>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>
                        <div>{sess.ipAddress}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{sess.location}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          background: sess.deviceTrust === "TRUSTED" ? "rgba(16,185,129,0.15)" : sess.deviceTrust === "MANAGED" ? "rgba(6,182,212,0.15)" : "rgba(244,63,94,0.15)",
                          color: sess.deviceTrust === "TRUSTED" ? "#10b981" : sess.deviceTrust === "MANAGED" ? "#06b6d4" : "#f43f5e",
                          padding: "2px 6px",
                          borderRadius: 3
                        }}>
                          {sess.deviceTrust}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 10.5, color: "var(--foreground-muted)" }}>{sess.mfaMethod}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 900,
                          color: sess.decision === "ALLOW" ? "#10b981" : "#f43f5e",
                          background: sess.decision === "ALLOW" ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                          padding: "2px 6px",
                          borderRadius: 4
                        }}>
                          {sess.decision}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleKillSession(sess.id)}
                          style={{
                            background: "rgba(244,63,94,0.15)",
                            border: "1px solid rgba(244,63,94,0.3)",
                            color: "#f43f5e",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 4,
                            cursor: "pointer"
                          }}
                        >
                          Kill Session
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: Zero-Trust Enforcement Policies ── */}
        {activeTab === "POLICIES" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 800 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              
              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#f8fafc" }}>Mandatory FIDO2 WebAuthn for Admin Roles</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Requires hardware security key (YubiKey / Passkey) for all elevated tier permissions.</div>
                </div>
                <button
                  onClick={() => setPolicyMfaMandatory(!policyMfaMandatory)}
                  style={{
                    background: policyMfaMandatory ? "#10b981" : "var(--surface-3)",
                    color: policyMfaMandatory ? "#050811" : "var(--muted)",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {policyMfaMandatory ? "ENFORCED" : "OPTIONAL"}
                </button>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#f8fafc" }}>Block Anonymized Tor & VPN Exit Nodes</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Automatically quarantines authentication requests originating from known bulletproof VPNs.</div>
                </div>
                <button
                  onClick={() => setPolicyBlockTorExitNodes(!policyBlockTorExitNodes)}
                  style={{
                    background: policyBlockTorExitNodes ? "#10b981" : "var(--surface-3)",
                    color: policyBlockTorExitNodes ? "#050811" : "var(--muted)",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {policyBlockTorExitNodes ? "BLOCK ACTIVE" : "ALLOW"}
                </button>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#f8fafc" }}>Continuous Session Inactivity Timeout</strong>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Forces cryptographic re-authentication when session is idle.</div>
                </div>
                <select
                  value={policySessionTimeoutMin}
                  onChange={e => setPolicySessionTimeoutMin(Number(e.target.value))}
                  className="tool-select"
                  style={{ width: 140 }}
                >
                  <option value={5}>5 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Generate Scoped API Token ── */}
      {isGenerateModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            width: "100%",
            maxWidth: 580,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Key size={18} color="#10b981" />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  Issue Scoped Ecosystem API Token
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateToken} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  TOKEN NAME / PURPOSE
                </label>
                <input
                  required
                  placeholder="e.g. AWS GuardDuty to Aegis Recovery Bridge"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  ISSUED TO (SERVICE ACCOUNT OR ENGINEER EMAIL)
                </label>
                <input
                  required
                  type="email"
                  placeholder="e.g. secops-automation@enterprise.corp"
                  value={issuedToEmail}
                  onChange={(e) => setIssuedToEmail(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  AUTHORIZED PLATFORMS
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 130, overflowY: "auto" }}>
                  {CONNECTED_PLATFORMS.map((p) => {
                    const isChecked = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => togglePlatformSelection(p.id)}
                        style={{
                          background: isChecked ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                          border: `1px solid ${isChecked ? "#10b981" : "var(--border)"}`,
                          color: isChecked ? "#10b981" : "var(--muted)",
                          padding: "5px 8px",
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontWeight: isChecked ? 700 : 500,
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        {isChecked ? "✓ " : "+ "} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    RATE LIMIT (REQ/MIN)
                  </label>
                  <select
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="tool-select"
                    style={{ width: "100%" }}
                  >
                    <option value={1000}>1,000 req/min</option>
                    <option value={5000}>5,000 req/min</option>
                    <option value={10000}>10,000 req/min</option>
                    <option value={50000}>50,000 req/min (Dedicated)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    TOKEN VALIDITY
                  </label>
                  <select
                    value={tokenExpiryDays}
                    onChange={(e) => setTokenExpiryDays(Number(e.target.value))}
                    className="tool-select"
                    style={{ width: "100%" }}
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year (365 Days)</option>
                    <option value={730}>2 Years</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "7px 16px" }}
                >
                  Generate Token (HSM Signed)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Generated Secret Key Display ── */}
      {generatedSecretModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            width: "100%",
            maxWidth: 500,
            background: "var(--surface)",
            border: "1px solid #10b981",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 size={22} color="#10b981" />
              <strong style={{ fontSize: 16, color: "#fff" }}>Scoped API Token Generated</strong>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              Copy your secret key now. For your security, this key will not be displayed again.
            </p>

            <div style={{
              background: "#050811",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 12,
              fontFamily: "monospace",
              fontSize: 12,
              color: "#34d399",
              wordBreak: "break-all"
            }}>
              {generatedSecretModal.key}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSecretModal.key);
                  setGeneratedSecretModal(null);
                }}
                className="btn-primary"
                style={{ fontSize: 12, padding: "8px 16px" }}
              >
                Copy & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal / Drawer: Tenant Enclave Detail Inspector ── */}
      {selectedTenant && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            width: "100%",
            maxWidth: 620,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Building size={20} color="#06b6d4" />
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#fff", margin: 0 }}>
                  {selectedTenant.tenantName} Enclave
                </h3>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Zero-Trust Score</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981" }}>{selectedTenant.zeroTrustPostureScore}%</div>
              </div>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Active Users</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4" }}>{selectedTenant.activeUsersCount}</div>
              </div>
              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Compliance</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#c084fc", marginTop: 4 }}>{selectedTenant.complianceTier}</div>
              </div>
            </div>

            <div style={{ background: "#050811", padding: 12, borderRadius: 6, fontFamily: "monospace", fontSize: 11, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 4 }}>
              <div><strong style={{ color: "#fff" }}>Domain:</strong> {selectedTenant.domain}</div>
              <div><strong style={{ color: "#fff" }}>SSO Provider:</strong> {selectedTenant.ssoProvider}</div>
              <div><strong style={{ color: "#fff" }}>Database Cluster:</strong> {selectedTenant.isolatedDbCluster}</div>
              <div><strong style={{ color: "#fff" }}>KMS Key ARN:</strong> arn:aws:kms:us-east-1:tenant-key-891024</div>
              <div><strong style={{ color: "#fff" }}>Auto-Rotation:</strong> ENABLED (Every 90 Days)</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setSelectedTenant(null)}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
