"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PluginStatus = "healthy" | "update_available" | "error";
type Category =
  | "All"
  | "Scanner"
  | "Validation"
  | "Verification"
  | "Ticketing"
  | "Reporting"
  | "Evidence"
  | "AI"
  | "Notification";

interface Plugin {
  id: number;
  name: string;
  category: Exclude<Category, "All">;
  rating: number;
  downloads: number;
  author: string;
  permissions: string[];
  description: string;
  installed: boolean;
  version?: string;
  status?: PluginStatus;
  reviews?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLUGINS: Plugin[] = [
  {
    id: 1,
    name: "Jira Enterprise Connector",
    category: "Ticketing",
    rating: 4.8,
    downloads: 12445,
    author: "AXIOM",
    permissions: ["tickets.create", "tickets.update", "tickets.close"],
    description:
      "Full Jira Cloud & Server integration with auto-ticket creation on findings",
    installed: true,
    version: "2.1.0",
    status: "healthy",
    reviews: 342,
  },
  {
    id: 2,
    name: "Advanced SQL Injection Validator",
    category: "Validation",
    rating: 4.9,
    downloads: 8234,
    author: "AXIOM Labs",
    permissions: ["findings.read", "findings.write"],
    description:
      "Deep SQLi validation with time-based blind and UNION detection",
    installed: true,
    version: "1.4.2",
    status: "healthy",
    reviews: 187,
  },
  {
    id: 3,
    name: "OWASP ZAP Connector",
    category: "Scanner",
    rating: 4.7,
    downloads: 15890,
    author: "AXIOM",
    permissions: ["scan.create", "findings.write"],
    description: "Full ZAP REST API integration — active/passive scanning",
    installed: false,
    reviews: 509,
  },
  {
    id: 4,
    name: "ServiceNow Integration",
    category: "Ticketing",
    rating: 4.5,
    downloads: 6721,
    author: "ServiceNow",
    permissions: ["tickets.create", "tickets.update"],
    description: "Auto-create ServiceNow incidents from AXIOM findings",
    installed: false,
    reviews: 124,
  },
  {
    id: 5,
    name: "Microsoft Teams Notifications",
    category: "Notification",
    rating: 4.6,
    downloads: 9102,
    author: "AXIOM",
    permissions: ["notifications.send"],
    description: "Real-time alerts to Teams channels on Critical/High findings",
    installed: true,
    version: "1.5.2",
    status: "healthy",
    reviews: 215,
  },
  {
    id: 6,
    name: "Nuclei Template Engine",
    category: "Scanner",
    rating: 4.8,
    downloads: 11234,
    author: "ProjectDiscovery",
    permissions: ["scan.create", "findings.write"],
    description: "Run Nuclei templates as AXIOM scan plugins",
    installed: false,
    reviews: 298,
  },
  {
    id: 7,
    name: "Evidence Integrity Validator",
    category: "Evidence",
    rating: 4.9,
    downloads: 4521,
    author: "AXIOM",
    permissions: ["evidence.read", "evidence.write"],
    description:
      "SHA256 hashing, digital signatures, chain of custody verification",
    installed: true,
    version: "1.0.1",
    status: "healthy",
    reviews: 88,
  },
  {
    id: 8,
    name: "AI Risk Analyzer",
    category: "AI",
    rating: 4.7,
    downloads: 3210,
    author: "AXIOM Labs",
    permissions: ["findings.read", "reports.generate"],
    description: "LLM-powered risk analysis and remediation suggestions",
    installed: false,
    reviews: 72,
  },
  {
    id: 9,
    name: "Nmap Discovery Plugin",
    category: "Scanner",
    rating: 4.6,
    downloads: 19872,
    author: "AXIOM",
    permissions: ["scan.create", "assets.write"],
    description:
      "Network discovery via Nmap — host/port/service enumeration",
    installed: false,
    reviews: 445,
  },
  {
    id: 10,
    name: "CVSS Calculator",
    category: "Validation",
    rating: 4.4,
    downloads: 7845,
    author: "AXIOM",
    permissions: ["findings.read", "findings.write"],
    description: "Interactive CVSS 3.1 scoring with vector string generation",
    installed: false,
    reviews: 156,
  },
  {
    id: 11,
    name: "GitHub Issues Connector",
    category: "Ticketing",
    rating: 4.3,
    downloads: 5623,
    author: "AXIOM",
    permissions: ["tickets.create"],
    description:
      "Auto-create GitHub Issues from findings with labels and assignees",
    installed: true,
    version: "1.1.0",
    status: "update_available",
    reviews: 99,
  },
  {
    id: 12,
    name: "Slack Notifications",
    category: "Notification",
    rating: 4.5,
    downloads: 14302,
    author: "AXIOM",
    permissions: ["notifications.send"],
    description: "Real-time Slack alerts with finding details and severity",
    installed: false,
    reviews: 330,
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Scanner",
  "Validation",
  "Verification",
  "Ticketing",
  "Reporting",
  "Evidence",
  "AI",
  "Notification",
];

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  "tickets.create": "Create tickets in the ticketing system",
  "tickets.update": "Update existing tickets",
  "tickets.close": "Close resolved tickets",
  "findings.read": "Read security findings",
  "findings.write": "Write/update security findings",
  "scan.create": "Initiate new scans",
  "notifications.send": "Send notifications to external channels",
  "evidence.read": "Read stored evidence artifacts",
  "evidence.write": "Write and sign evidence artifacts",
  "reports.generate": "Generate security reports",
  "assets.write": "Write discovered assets",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDownloads(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

const CATEGORY_COLORS: Record<string, string> = {
  Scanner: "#3b82f6",
  Validation: "#8b5cf6",
  Verification: "#06b6d4",
  Ticketing: "#f97316",
  Reporting: "#ec4899",
  Evidence: "#10b981",
  AI: "#e8912d",
  Notification: "#6366f1",
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        background: color + "22",
        color: color,
        border: `1px solid ${color}44`,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
      }}
    >
      {category}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: 13,
            color:
              i <= full
                ? "#f59e0b"
                : half && i === full + 1
                ? "#f59e0b"
                : "#374151",
            opacity: half && i === full + 1 ? 0.6 : 1,
          }}
        >
          ★
        </span>
      ))}
      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>
        {rating}
      </span>
    </span>
  );
}

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
        fill="#10b981"
        opacity={0.9}
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const VERSION_HISTORY = [
  {
    version: "2.1.0",
    date: "2026-07-12",
    notes: "OAuth2 PKCE support, bulk ticket sync",
  },
  {
    version: "2.0.1",
    date: "2026-05-30",
    notes: "Bug fixes, improved error handling",
  },
  {
    version: "2.0.0",
    date: "2026-04-10",
    notes: "Major rewrite, SDK 1.0 compatible",
  },
  {
    version: "1.9.3",
    date: "2026-02-18",
    notes: "Stability improvements",
  },
];

function PluginModal({
  plugin,
  onClose,
  onInstall,
  onUninstall,
}: {
  plugin: Plugin;
  onClose: () => void;
  onInstall: (id: number) => void;
  onUninstall: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface, #111827)",
          border: "1px solid var(--border, #1f2937)",
          borderRadius: 16,
          width: "min(700px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 32,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "var(--muted)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background:
                (CATEGORY_COLORS[plugin.category] ?? "#6b7280") + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {plugin.category === "Scanner"
              ? "🔍"
              : plugin.category === "Ticketing"
              ? "🎫"
              : plugin.category === "Notification"
              ? "🔔"
              : plugin.category === "Evidence"
              ? "🔐"
              : plugin.category === "Validation"
              ? "✅"
              : plugin.category === "AI"
              ? "🤖"
              : "🔌"}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--fg, #f9fafb)",
                }}
              >
                {plugin.name}
              </h2>
              <ShieldIcon size={16} />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                by {plugin.author}
              </span>
              <CategoryBadge category={plugin.category} />
              {plugin.installed && plugin.version && (
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  v{plugin.version}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <StarRating rating={plugin.rating} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            ↓ {formatDownloads(plugin.downloads)} downloads
          </span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {plugin.reviews} reviews
          </span>
        </div>

        <p
          style={{
            margin: "0 0 24px",
            fontSize: 14,
            color: "var(--fg, #d1d5db)",
            lineHeight: 1.7,
          }}
        >
          {plugin.description}
        </p>

        {/* Signature */}
        <div
          style={{
            background: "#10b98111",
            border: "1px solid #10b98133",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <ShieldIcon size={16} />
          <span
            style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}
          >
            Signature Verified
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginLeft: 4,
            }}
          >
            · Signed by AXIOM Certificate Authority ·
            SHA256:a1b2c3d4e5f6...
          </span>
        </div>

        {/* Permissions */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg, #f9fafb)",
            }}
          >
            Permissions Required
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plugin.permissions.map((perm) => (
              <div
                key={perm}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 12px",
                  background: "var(--bg, #0f172a)",
                  borderRadius: 8,
                  border: "1px solid var(--border, #1f2937)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "#e8912d",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    marginTop: 1,
                  }}
                >
                  {perm}
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {PERMISSION_DESCRIPTIONS[perm] ?? perm}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg, #f9fafb)",
            }}
          >
            Dependencies
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["AXIOM SDK ≥ 1.0", "Node.js ≥ 18"].map((dep) => (
              <span
                key={dep}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "var(--bg, #0f172a)",
                  border: "1px solid var(--border, #1f2937)",
                  color: "var(--fg, #d1d5db)",
                }}
              >
                {dep}
              </span>
            ))}
          </div>
        </div>

        {/* Version History */}
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg, #f9fafb)",
            }}
          >
            Version History
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VERSION_HISTORY.map((v) => (
              <div
                key={v.version}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 90px 1fr",
                  gap: 12,
                  padding: "8px 12px",
                  background:
                    v.version === plugin.version
                      ? "#e8912d0d"
                      : "var(--bg, #0f172a)",
                  borderRadius: 8,
                  border: `1px solid ${
                    v.version === plugin.version
                      ? "#e8912d33"
                      : "var(--border, #1f2937)"
                  }`,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color:
                      v.version === plugin.version
                        ? "#e8912d"
                        : "var(--fg)",
                  }}
                >
                  v{v.version}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {v.date}
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {v.notes}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!plugin.installed ? (
            <button
              onClick={() => {
                onInstall(plugin.id);
                onClose();
              }}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                background: "var(--primary, #e8912d)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Install Plugin
            </button>
          ) : (
            <>
              {plugin.status === "update_available" && (
                <button
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    background: "#f59e0b",
                    color: "#000",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Update to v1.2.0
                </button>
              )}
              <button
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "none",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Disable
              </button>
              <button
                onClick={() => {
                  onUninstall(plugin.id);
                  onClose();
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "none",
                  color: "#ef4444",
                  border: "1px solid #ef444433",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Uninstall
              </button>
            </>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              background: "none",
              color: "var(--muted)",
              border: "1px solid var(--border)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plugin Card ──────────────────────────────────────────────────────────────

function PluginCard({
  plugin,
  onClick,
  onInstall,
}: {
  plugin: Plugin;
  onClick: () => void;
  onInstall: (id: number) => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface, #111827)",
        border: "1px solid var(--border, #1f2937)",
        borderRadius: 12,
        padding: "20px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.15s",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e8912d55";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border, #1f2937)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Shield verified top-right */}
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        <ShieldIcon size={15} />
      </div>

      {/* Top row */}
      <div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 6,
            paddingRight: 20,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--fg, #f9fafb)",
            }}
          >
            {plugin.name}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              padding: "1px 7px",
              borderRadius: 4,
              background: "var(--bg, #0f172a)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {plugin.author}
          </span>
          <CategoryBadge category={plugin.category} />
        </div>
      </div>

      {/* Rating + Downloads */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <StarRating rating={plugin.rating} />
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          ↓ {formatDownloads(plugin.downloads)}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--muted)",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {plugin.description}
      </p>

      {/* Permissions chips */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {plugin.permissions.map((perm) => (
          <span
            key={perm}
            style={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              background: "#e8912d11",
              color: "#e8912d",
              border: "1px solid #e8912d22",
              fontFamily: "monospace",
            }}
          >
            {perm}
          </span>
        ))}
      </div>

      {/* Bottom action */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {plugin.installed ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {plugin.status === "healthy" ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "#10b98122",
                  color: "#10b981",
                  border: "1px solid #10b98133",
                }}
              >
                ✓ Installed
              </span>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "#f59e0b22",
                  color: "#f59e0b",
                  border: "1px solid #f59e0b33",
                }}
              >
                ⚠ Update Available
              </span>
            )}
            {plugin.version && (
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                v{plugin.version}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInstall(plugin.id);
            }}
            style={{
              padding: "6px 16px",
              borderRadius: 7,
              background: "#e8912d",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [plugins, setPlugins] = useState<Plugin[]>(PLUGINS);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const filtered = useMemo(() => {
    return plugins.filter((p) => {
      const matchCat =
        activeCategory === "All" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [plugins, activeCategory, search]);

  const installed = plugins.filter((p) => p.installed);

  const stats = {
    installed: installed.length,
    verified: installed.length,
    unsigned: 0,
    violations: 0,
    depIssues: installed.filter((p) => p.status === "update_available").length,
  };

  function handleInstall(id: number) {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, installed: true, version: "latest", status: "healthy" }
          : p
      )
    );
  }

  function handleUninstall(id: number) {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, installed: false, version: undefined, status: undefined }
          : p
      )
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0a0f1e)",
        color: "var(--fg, #f9fafb)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border, #1f2937)",
          background: "var(--surface, #111827)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#e8912d",
          }}
        >
          AXIOM
        </span>
        <span style={{ color: "var(--border)", margin: "0 4px" }}>·</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          Plugin Marketplace
        </span>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 64px" }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              margin: "0 0 6px",
              background: "linear-gradient(90deg, #e8912d, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Plugin Marketplace
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            Browse, install, and manage verified security plugins
          </p>
        </div>

        {/* ── Security Dashboard Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Plugins Installed", value: stats.installed, color: "#e8912d" },
            { label: "Verified Signatures", value: stats.verified, color: "#10b981" },
            { label: "Unsigned Plugins", value: stats.unsigned, color: "#6b7280" },
            {
              label: "Security Violations",
              value: stats.violations,
              color: stats.violations > 0 ? "#ef4444" : "#6b7280",
            },
            {
              label: "Dependency Issues",
              value: stats.depIssues,
              color: stats.depIssues > 0 ? "#f59e0b" : "#6b7280",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface, #111827)",
                border: "1px solid var(--border, #1f2937)",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + Category Filter ── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "0 0 320px" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                fontSize: 15,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search plugins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: 8,
                background: "var(--surface, #111827)",
                border: "1px solid var(--border, #1f2937)",
                color: "var(--fg, #f9fafb)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  border: "1px solid",
                  borderColor:
                    activeCategory === cat ? "#e8912d" : "var(--border, #1f2937)",
                  background: activeCategory === cat ? "#e8912d18" : "none",
                  color:
                    activeCategory === cat ? "#e8912d" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plugin Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {filtered.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onClick={() => setSelectedPlugin(plugin)}
              onInstall={handleInstall}
            />
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 0",
                color: "var(--muted)",
                fontSize: 15,
              }}
            >
              No plugins found matching your search.
            </div>
          )}
        </div>

        {/* ── Installed Plugins Section ── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid var(--border, #1f2937)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--fg, #f9fafb)",
              }}
            >
              Installed Plugins
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: "#e8912d22",
                color: "#e8912d",
              }}
            >
              {installed.length}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {installed.map((plugin) => (
              <div
                key={plugin.id}
                onClick={() => setSelectedPlugin(plugin)}
                style={{
                  background: "var(--surface, #111827)",
                  border: "1px solid var(--border, #1f2937)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      plugin.status === "healthy" ? "#10b981" : "#f59e0b",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--fg)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {plugin.name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
                  >
                    v{plugin.version} · {plugin.category}
                  </div>
                </div>
                <ShieldIcon size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {selectedPlugin && (
        <PluginModal
          plugin={selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
        />
      )}
    </div>
  );
}
