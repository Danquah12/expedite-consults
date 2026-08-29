"use client";
import { useState } from "react";
import {
  ShieldCheck,
  Key,
  Users,
  Building,
  Plus,
  Copy,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  RefreshCw,
  Globe,
  Sliders,
  Radio,
  Eye,
  EyeOff
} from "lucide-react";
import { IDENTITY_TENANTS, SCOPED_API_TOKENS, CONNECTED_PLATFORMS } from "@/data/integrationData";
import { ScopedApiToken, IdentityTenant, PlatformId } from "@/types/integration";

export default function UnifiedIdentityPage() {
  const [tenants, setTenants] = useState<IdentityTenant[]>(IDENTITY_TENANTS);
  const [tokens, setTokens] = useState<ScopedApiToken[]>(SCOPED_API_TOKENS);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // New Token Form State
  const [newTokenName, setNewTokenName] = useState<string>("");
  const [issuedToEmail, setIssuedToEmail] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(["cerberus-re", "aegis-recovery"]);
  const [rateLimit, setRateLimit] = useState<number>(5000);

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ScopedApiToken = {
      id: `TOK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTokenName,
      prefix: `exp_live_${Math.random().toString(36).substring(2, 10)}...`,
      issuedTo: issuedToEmail,
      assignedPlatforms: selectedPlatforms,
      permissions: ["telemetry:read", "ioc:write", "playbook:execute"],
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: "2027-08-24",
      lastUsedAt: "Never",
      rateLimitPerMin: rateLimit,
      status: "ACTIVE"
    };

    setTokens([created, ...tokens]);
    setIsGenerateModalOpen(false);
    setNewTokenName("");
    setIssuedToEmail("");
  };

  const handleRevokeToken = (id: string) => {
    setTokens(tokens.map((t) => (t.id === id ? { ...t, status: "REVOKED" } : t)));
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Unified Identity, SSO & Zero-Trust RBAC Hub
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Federated OAuth2 / OIDC & SAML 2.0 with continuous zero-trust evaluation across all 6 Expedite platforms.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={14} />
          <span>Generate Scoped API Token</span>
        </button>
      </div>

      {/* 4 Identity Posture KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "MFA Enforcement", val: "100.0%", sub: "FIDO2 WebAuthn mandatory", color: "#10b981" },
          { label: "Zero-Trust Health Score", val: "96.8 / 100", sub: "Continuous session auditing", color: "#06b6d4" },
          { label: "Federated Identity Tenants", val: "3 Active", sub: "Okta, Entra ID, PingFederate", color: "#a855f7" },
          { label: "Active API Service Tokens", val: `${tokens.filter(t => t.status === "ACTIVE").length} Scoped`, sub: "Hardware HSM backed", color: "#f59e0b" }
        ].map((kpi, i) => (
          <div key={i} className="card-tactical" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: "4px 0" }}>{kpi.val}</div>
            <div style={{ fontSize: 10.5, color: kpi.color, fontWeight: 600 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Multi-Tenant Organization Directory */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Building size={16} color="#06b6d4" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Multi-Tenant Isolated Enclaves
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Cryptographically Partitioned Storage & SSO Providers
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {tenants.map((t) => (
            <div
              key={t.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{t.tenantName}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.domain}</div>
                </div>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}>
                  {t.complianceTier}
                </span>
              </div>

              <div style={{ background: "var(--surface-3)", padding: 8, borderRadius: 6, fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>SSO Provider:</span>
                  <strong style={{ color: "#06b6d4" }}>{t.ssoProvider}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Zero-Trust Score:</span>
                  <strong style={{ color: "#10b981" }}>{t.zeroTrustPostureScore}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Active Users / Tokens:</span>
                  <span style={{ color: "#f8fafc" }}>{t.activeUsersCount} users · {t.apiTokensCount} keys</span>
                </div>
              </div>

              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                DB: {t.isolatedDbCluster}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoped API Tokens Manager */}
      <div className="card-tactical" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Key size={16} color="#a855f7" />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", margin: 0 }}>
              Scoped Service Tokens & Machine-to-Machine Credentials
            </h2>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            HMAC-SHA256 Signed with Custom Fleet Grants
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tokens.map((token) => (
            <div
              key={token.id}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: "#f8fafc" }}>
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
                    Issued to: <strong style={{ color: "var(--fg-2)" }}>{token.issuedTo}</strong>
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
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <Copy size={12} />
                  <span>{copiedTokenId === token.id ? "Copied" : "Copy"}</span>
                </button>

                {token.status === "ACTIVE" && (
                  <button
                    onClick={() => handleRevokeToken(token.id)}
                    style={{
                      background: "rgba(244,63,94,0.15)",
                      border: "1px solid rgba(244,63,94,0.3)",
                      color: "#f43f5e",
                      padding: "6px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate API Token Modal */}
      {isGenerateModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 520,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 22,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc", marginBottom: 14 }}>
              Issue Scoped Ecosystem API Token
            </h3>

            <form onSubmit={handleGenerateToken} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  TOKEN NAME / IDENTIFIER
                </label>
                <input
                  required
                  placeholder="e.g. AWS Security Hub Ingestion Key"
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
                  placeholder="e.g. svc-telemetry@enterprise.corp"
                  value={issuedToEmail}
                  onChange={(e) => setIssuedToEmail(e.target.value)}
                  className="tool-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  AUTHORIZED FLEET PERMISSIONS
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
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
                          color: isChecked ? "#10b981" : "var(--fg-2)",
                          padding: "6px 8px",
                          borderRadius: 6,
                          fontSize: 11,
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

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  RATE LIMIT TIER (REQUESTS / MINUTE)
                </label>
                <select
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="tool-select"
                  style={{ width: "100%" }}
                >
                  <option value={1000}>1,000 req/min (Standard)</option>
                  <option value={5000}>5,000 req/min (Elevated Service)</option>
                  <option value={10000}>10,000 req/min (Enterprise High Throughput)</option>
                  <option value={50000}>50,000 req/min (Dedicated Streaming Engine)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    padding: "8px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Generate Token (HSM)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
