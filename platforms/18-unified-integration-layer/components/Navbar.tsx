"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Layers,
  ShieldAlert,
  Activity,
  Search,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  AlertOctagon,
  X
} from "lucide-react";
import { CONNECTED_PLATFORMS } from "@/data/integrationData";

export function Navbar() {
  const [defconLevel, setDefconLevel] = useState<number>(3);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [throughput, setThroughput] = useState(24580);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput(prev => Math.floor(24000 + Math.random() * 1200));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleLockdown = () => {
    setIsLockdownActive(!isLockdownActive);
    setIsLockdownModalOpen(false);
  };

  return (
    <>
      <header style={{
        height: 56,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 50,
        position: "sticky",
        top: 0
      }}>
        {/* Left: Brand & Product Ecosystem Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(16,185,129,0.35)"
            }}>
              <Layers size={19} color="#050811" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#f8fafc" }}>
                  EXPEDITE <span style={{ color: "#10b981" }}>UNIFIED</span> NEXUS
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "rgba(168,85,247,0.15)",
                  color: "#c084fc",
                  border: "1px solid rgba(168,85,247,0.3)",
                  fontFamily: "monospace"
                }}>
                  PRODUCT 3 · ECOSYSTEM HUB
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>
                Autonomous Integration Layer & Cross-Platform Orchestration Bus
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div style={{ width: 1, height: 26, background: "var(--border)" }} />

          {/* Connected Ecosystem Switcher Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                fontSize: 11.5,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              <Globe size={13} color="#06b6d4" />
              <span>Ecosystem Platforms ({CONNECTED_PLATFORMS.length})</span>
              <ChevronDown size={12} color="var(--muted)" />
            </button>

            {showPlatformDropdown && (
              <div style={{
                position: "absolute",
                top: 36,
                left: 0,
                width: 320,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                padding: "8px",
                zIndex: 100
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", padding: "4px 8px" }}>
                  Connected Security Fleet
                </div>
                {CONNECTED_PLATFORMS.map((plat) => (
                  <a
                    key={plat.id}
                    href={plat.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px",
                      borderRadius: 6,
                      textDecoration: "none",
                      color: "var(--fg)",
                      fontSize: 12,
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div>
                      <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                        {plat.name}
                        <span style={{ fontSize: 9.5, color: "var(--muted)" }}>({plat.codeName})</span>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{plat.category}</div>
                    </div>
                    <ExternalLink size={12} color="var(--muted)" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: DEFCON Indicator & Telemetry Throughput */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* DEFCON Level selector */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: defconLevel === 1 ? "rgba(244,63,94,0.2)" : defconLevel <= 3 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
            border: `1px solid ${defconLevel === 1 ? "#f43f5e" : defconLevel <= 3 ? "#f59e0b" : "#10b981"}`,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 800,
            color: defconLevel === 1 ? "#f43f5e" : defconLevel <= 3 ? "#f59e0b" : "#10b981"
          }}>
            <ShieldAlert size={13} className="animate-pulse" />
            <span>GLOBAL THREAT: DEFCON {defconLevel}</span>
            <select
              value={defconLevel}
              onChange={(e) => setDefconLevel(Number(e.target.value))}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 11,
                fontWeight: 700,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value={1} style={{ background: "#0a0f1d", color: "#f43f5e" }}>DEFCON 1 (Full Lockdown)</option>
              <option value={2} style={{ background: "#0a0f1d", color: "#f43f5e" }}>DEFCON 2 (Armed Alert)</option>
              <option value={3} style={{ background: "#0a0f1d", color: "#f59e0b" }}>DEFCON 3 (Elevated SOAR)</option>
              <option value={4} style={{ background: "#0a0f1d", color: "#06b6d4" }}>DEFCON 4 (Guarded Mode)</option>
              <option value={5} style={{ background: "#0a0f1d", color: "#10b981" }}>DEFCON 5 (Normal Ops)</option>
            </select>
          </div>

          {/* Live Telemetry Bus Indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.3)",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 11.5,
            color: "#06b6d4",
            fontWeight: 600
          }}>
            <Radio size={13} className="animate-pulse" />
            <span>STREAM: <strong>{throughput.toLocaleString()}</strong> evt/s</span>
          </div>
        </div>

        {/* Right: Quick Search & Emergency Lockdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              fontSize: 11.5,
              padding: "5px 12px",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            <Search size={13} color="#8493a8" />
            <span>Search Ecosystem...</span>
            <kbd style={{
              background: "rgba(255,255,255,0.06)",
              padding: "1px 5px",
              borderRadius: 4,
              fontSize: 9.5,
              fontFamily: "monospace",
              color: "var(--fg-2)"
            }}>
              ⌘K
            </kbd>
          </button>

          {/* Emergency 1-Click Lockdown Switch */}
          <button
            onClick={() => setIsLockdownModalOpen(true)}
            style={{
              background: isLockdownActive ? "rgba(244,63,94,0.25)" : "rgba(244,63,94,0.12)",
              border: isLockdownActive ? "1px solid #f43f5e" : "1px solid rgba(244,63,94,0.35)",
              color: "#f43f5e",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease"
            }}
          >
            {isLockdownActive ? <Lock size={13} /> : <AlertOctagon size={13} />}
            <span>{isLockdownActive ? "ECOSYSTEM LOCKED DOWN" : "1-CLICK LOCKDOWN"}</span>
          </button>
        </div>
      </header>

      {/* Quick Search Command Palette Modal */}
      {isSearchOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 100
        }}>
          <div style={{
            width: "100%",
            maxWidth: 600,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", gap: 10 }}>
              <Search size={16} color="#10b981" />
              <input
                autoFocus
                placeholder="Search IOCs, Telemetry Events, Playbooks, APIs, or Systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f8fafc",
                  fontSize: 14
                }}
              />
              <button onClick={() => setIsSearchOpen(false)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto", padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Recommended Navigation
              </div>
              {[
                { href: "/federated-telemetry", title: "Federated Telemetry Stream (24,500 evt/s)", cat: "Telemetry Bus" },
                { href: "/shared-threat-intel", title: "Enterprise IOC Sync Hub (STIX 2.1)", cat: "Threat Intel" },
                { href: "/cross-platform-playbooks", title: "Cross-Platform SOAR Engine (Autonomous)", cat: "Playbooks" },
                { href: "/unified-identity", title: "Zero-Trust RBAC & Scoped API Tokens", cat: "Identity" },
                { href: "/unified-reporting", title: "Boardroom & SEC 8-K Compliance Reports", cat: "Reporting" },
                { href: "/api-gateway", title: "High-Throughput GraphQL & REST Gateway", cat: "API Gateway" },
                { href: "/data-lake", title: "Federated Security Data Lake (OpenSearch)", cat: "Data Lake" },
                { href: "/webhooks-connectors", title: "SIEM/EDR Enterprise Connectors (Splunk, Sentinel)", cat: "Connectors" },
                { href: "/mesh-health", title: "OpenTelemetry Microservices Mesh & Tracing", cat: "Mesh Health" }
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsSearchOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: "var(--fg)",
                    fontSize: 12.5,
                    marginBottom: 2
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)", background: "var(--surface-3)", padding: "2px 6px", borderRadius: 4 }}>
                    {item.cat}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Lockdown Confirmation Modal */}
      {isLockdownModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 520,
            background: "var(--surface)",
            border: "2px solid #f43f5e",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 0 40px rgba(244,63,94,0.4)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(244,63,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #f43f5e"
              }}>
                <AlertOctagon size={24} color="#f43f5e" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#f8fafc" }}>
                  {isLockdownActive ? "Deactivate Ecosystem Lockdown?" : "ARM EMERGENCY ECOSYSTEM LOCKDOWN"}
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>
                  Affects all 6 interconnected Expedite Security platforms.
                </p>
              </div>
            </div>

            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 14,
              fontSize: 12,
              color: "var(--fg-2)",
              lineHeight: 1.6,
              marginBottom: 18
            }}>
              {isLockdownActive ? (
                <span>Deactivating lockdown will resume standard external egress, restore automated backup rotations, and return API gateway traffic to normal thresholds.</span>
              ) : (
                <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li><strong>Aegis Recovery:</strong> Freezes 44 TB S3 snapshot pools & engages immutable WORM retention locks.</li>
                  <li><strong>CERBERUS-RE:</strong> Quarantines active sandbox hypervisors and severs outbound network bridges.</li>
                  <li><strong>AXIOM DAST:</strong> Suspends public scanning probes to prevent honeypot contamination.</li>
                  <li><strong>API Gateway:</strong> Revokes non-essential bearer tokens and restricts access to Mutual-TLS only.</li>
                </ul>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setIsLockdownModalOpen(false)}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleToggleLockdown}
                style={{
                  background: isLockdownActive ? "#10b981" : "#f43f5e",
                  border: "none",
                  color: "#050811",
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                {isLockdownActive ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{isLockdownActive ? "CONFIRM RESTORE OPS" : "EXECUTE FULL LOCKDOWN"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
