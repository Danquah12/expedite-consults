"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = "roles" | "permissions" | "users" | "tenants" | "simulator";

interface Role {
  id: string;
  name: string;
  color: string;
  users: number;
  description: string;
  permissions: string[];
}

interface SimResult {
  decision: "GRANTED" | "DENIED";
  reason: string;
  requiredPermission: string;
  userHasPermission: boolean;
  queryModification?: string;
  auditEvent: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ROLES: Role[] = [
  {
    id: "platform_admin",
    name: "Platform Admin",
    color: "#ef5350",
    users: 2,
    description: "Full system access with all permissions including system administration.",
    permissions: [
      "findings.read","findings.write","evidence.read","evidence.write",
      "tickets.create","tickets.update","verification.execute",
      "reports.generate","plugins.manage","system.admin",
    ],
  },
  {
    id: "security_admin",
    name: "Security Admin",
    color: "#ff8a65",
    users: 4,
    description: "Most permissions except system administration. Manages security operations.",
    permissions: [
      "findings.read","findings.write","evidence.read","evidence.write",
      "tickets.create","tickets.update","verification.execute",
      "reports.generate","plugins.manage",
    ],
  },
  {
    id: "security_analyst",
    name: "Security Analyst",
    color: "#e8912d",
    users: 12,
    description: "Reviews findings, manages evidence, creates tickets, runs verifications, generates reports.",
    permissions: [
      "findings.read","evidence.read","tickets.create",
      "verification.execute","reports.generate",
    ],
  },
  {
    id: "remediation_manager",
    name: "Remediation Manager",
    color: "#ffcc80",
    users: 8,
    description: "Focuses on ticket management and verification of remediated vulnerabilities.",
    permissions: ["findings.read","tickets.create","tickets.update","verification.execute"],
  },
  {
    id: "developer",
    name: "Developer",
    color: "#4fc3f7",
    users: 23,
    description: "Read-only access to assigned findings and ticket creation. No cross-tenant access.",
    permissions: ["findings.read","tickets.create"],
  },
  {
    id: "executive",
    name: "Executive",
    color: "#ce93d8",
    users: 5,
    description: "Summary-level finding visibility and report generation for strategic oversight.",
    permissions: ["findings.read","reports.generate"],
  },
];

const ALL_PERMISSIONS = [
  "findings.read","findings.write","evidence.read","evidence.write",
  "tickets.create","tickets.update","verification.execute",
  "reports.generate","plugins.manage","system.admin",
];

const PERMISSION_MATRIX: Record<string, Record<string, boolean | string>> = {
  platform_admin: Object.fromEntries(ALL_PERMISSIONS.map(p => [p, true])),
  security_admin: Object.fromEntries(ALL_PERMISSIONS.map(p => [p, p !== "system.admin"])),
  security_analyst: Object.fromEntries(ALL_PERMISSIONS.map(p => [
    p, ["findings.read","evidence.read","tickets.create","verification.execute","reports.generate"].includes(p)
  ])),
  remediation_manager: Object.fromEntries(ALL_PERMISSIONS.map(p => [
    p, ["findings.read","tickets.create","tickets.update","verification.execute"].includes(p)
  ])),
  developer: Object.fromEntries(ALL_PERMISSIONS.map(p => {
    if (p === "findings.read") return [p, "assigned only"];
    if (p === "tickets.create") return [p, true];
    return [p, false];
  })),
  executive: Object.fromEntries(ALL_PERMISSIONS.map(p => {
    if (p === "findings.read") return [p, "summary only"];
    if (p === "reports.generate") return [p, true];
    return [p, false];
  })),
};

const MOCK_USERS = [
  { name: "John Smith",  email: "john@abc.com",  role: "security_analyst",    tenant: "ABC Corp", lastLogin: "Today",      status: "Active" },
  { name: "Sarah Lee",   email: "sarah@abc.com", role: "platform_admin",      tenant: "ABC Corp", lastLogin: "Yesterday",  status: "Active" },
  { name: "Mike Chen",   email: "mike@xyz.com",  role: "developer",           tenant: "XYZ Inc",  lastLogin: "2 days ago", status: "Active" },
  { name: "Emma Davis",  email: "emma@xyz.com",  role: "executive",           tenant: "XYZ Inc",  lastLogin: "Aug 19",     status: "Active" },
  { name: "Tom Wilson",  email: "tom@abc.com",   role: "remediation_manager", tenant: "ABC Corp", lastLogin: "Aug 18",     status: "Active" },
  { name: "Lisa Park",   email: "lisa@abc.com",  role: "security_analyst",    tenant: "ABC Corp", lastLogin: "Aug 20",     status: "Active" },
  { name: "James Brown", email: "james@xyz.com", role: "developer",           tenant: "XYZ Inc",  lastLogin: "Aug 15",     status: "Inactive" },
  { name: "Ana Costa",   email: "ana@abc.com",   role: "security_admin",      tenant: "ABC Corp", lastLogin: "Today",      status: "Active" },
];

// ─── Simulation Logic ────────────────────────────────────────────────────────

const SIM_ACTIONS = [
  "View Critical Findings",
  "Download Evidence Package",
  "Create Jira Ticket",
  "Generate Executive Report",
  "Launch Verification",
  "Access Admin Panel",
  "View Another Tenant's Findings",
];

function simulate(roleId: string, action: string): SimResult {
  if (action === "View Another Tenant's Findings") {
    return {
      decision: "DENIED",
      reason: "Cross-tenant access is strictly prohibited. Tenant isolation is enforced at the data layer.",
      requiredPermission: "tenant.cross_access",
      userHasPermission: false,
      auditEvent: `AUDIT: DENIED | ${roleId} | cross_tenant_access | tenant_b | TENANT_ISOLATION_VIOLATION`,
    };
  }

  if (roleId === "platform_admin") {
    return {
      decision: "GRANTED",
      reason: "Platform Admin has unrestricted access to all system resources.",
      requiredPermission: "system.admin",
      userHasPermission: true,
      auditEvent: `AUDIT: GRANTED | platform_admin | ${action.toLowerCase().replace(/ /g, "_")} | ALL_RESOURCES`,
    };
  }

  const role = ROLES.find(r => r.id === roleId)!;

  switch (action) {
    case "View Critical Findings":
      if (role.permissions.includes("findings.read")) {
        const isFiltered = roleId === "developer";
        const isSummary = roleId === "executive";
        return {
          decision: "GRANTED",
          reason: isFiltered
            ? "Access granted with row-level security filter applied — only assigned findings returned."
            : isSummary
            ? "Access granted with summary-only view. Detailed exploitation data redacted."
            : "findings.read permission allows viewing critical findings.",
          requiredPermission: "findings.read",
          userHasPermission: true,
          queryModification: isFiltered ? "WHERE assigned_user = current_user AND severity = 'critical'" : undefined,
          auditEvent: `AUDIT: GRANTED | ${roleId} | search_findings | findings | severity=critical${isFiltered ? " | FILTERED:assigned_only" : isSummary ? " | FILTERED:summary_only" : ""}`,
        };
      }
      return {
        decision: "DENIED",
        reason: "Role does not have findings.read permission.",
        requiredPermission: "findings.read",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | search_findings | findings | PERMISSION_DENIED`,
      };

    case "Download Evidence Package":
      if (role.permissions.includes("evidence.read")) {
        return {
          decision: "GRANTED",
          reason: "evidence.read permission allows downloading evidence packages.",
          requiredPermission: "evidence.read",
          userHasPermission: true,
          auditEvent: `AUDIT: GRANTED | ${roleId} | download_evidence | evidence_package`,
        };
      }
      return {
        decision: "DENIED",
        reason: `Insufficient permission: evidence.read. Role '${role.name}' cannot download evidence packages.`,
        requiredPermission: "evidence.read",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | download_evidence | evidence_package | INSUFFICIENT_PERMISSION:evidence.read`,
      };

    case "Create Jira Ticket":
      if (role.permissions.includes("tickets.create")) {
        return {
          decision: "GRANTED",
          reason: "tickets.create permission allows creating Jira tickets.",
          requiredPermission: "tickets.create",
          userHasPermission: true,
          auditEvent: `AUDIT: GRANTED | ${roleId} | create_ticket | jira_plugin`,
        };
      }
      return {
        decision: "DENIED",
        reason: `Insufficient permission: tickets.create. Role '${role.name}' cannot create tickets.`,
        requiredPermission: "tickets.create",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | create_ticket | jira_plugin | INSUFFICIENT_PERMISSION:tickets.create`,
      };

    case "Generate Executive Report":
      if (role.permissions.includes("reports.generate")) {
        return {
          decision: "GRANTED",
          reason: "reports.generate permission allows generating executive reports.",
          requiredPermission: "reports.generate",
          userHasPermission: true,
          auditEvent: `AUDIT: GRANTED | ${roleId} | generate_report | reporting_plugin`,
        };
      }
      return {
        decision: "DENIED",
        reason: `Insufficient permission: reports.generate. Role '${role.name}' cannot generate reports.`,
        requiredPermission: "reports.generate",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | generate_report | reporting_plugin | INSUFFICIENT_PERMISSION:reports.generate`,
      };

    case "Launch Verification":
      if (role.permissions.includes("verification.execute")) {
        return {
          decision: "GRANTED",
          reason: "verification.execute permission allows launching verification jobs.",
          requiredPermission: "verification.execute",
          userHasPermission: true,
          auditEvent: `AUDIT: GRANTED | ${roleId} | launch_verification | verification_plugin`,
        };
      }
      return {
        decision: "DENIED",
        reason: `Insufficient permission: verification.execute. Role '${role.name}' cannot launch verification jobs.`,
        requiredPermission: "verification.execute",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | launch_verification | verification_plugin | INSUFFICIENT_PERMISSION:verification.execute`,
      };

    case "Access Admin Panel":
      if (role.permissions.includes("system.admin")) {
        return {
          decision: "GRANTED",
          reason: "system.admin permission allows full administrative panel access.",
          requiredPermission: "system.admin",
          userHasPermission: true,
          auditEvent: `AUDIT: GRANTED | ${roleId} | access_admin | admin_panel`,
        };
      }
      return {
        decision: "DENIED",
        reason: `Insufficient permission: system.admin. Admin panel is restricted to Platform Admins only.`,
        requiredPermission: "system.admin",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | access_admin | admin_panel | INSUFFICIENT_PERMISSION:system.admin`,
      };

    default:
      return {
        decision: "DENIED",
        reason: "Unknown action.",
        requiredPermission: "unknown",
        userHasPermission: false,
        auditEvent: `AUDIT: DENIED | ${roleId} | unknown_action`,
      };
  }
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function RoleCard({ role }: { role: Role }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: role.color }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: role.color + "22", border: `1px solid ${role.color}55`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--fg)" }}>{role.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{role.users} users</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            background: role.color + "22", color: role.color,
            border: `1px solid ${role.color}55`,
            borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
          }}>
            {role.permissions.length} permissions
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{role.description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {role.permissions.map(p => (
          <span key={p} style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "2px 7px", fontSize: 11, color: "var(--fg)", fontFamily: "monospace",
          }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

function PermissionsMatrix() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{
              textAlign: "left", padding: "10px 14px", background: "var(--bg)",
              border: "1px solid var(--border)", fontWeight: 600, fontSize: 13, color: "var(--fg)", minWidth: 180,
            }}>Role</th>
            {ALL_PERMISSIONS.map(p => (
              <th key={p} style={{
                padding: "10px 6px", background: "var(--bg)", border: "1px solid var(--border)",
                fontWeight: 600, color: "var(--muted)", minWidth: 95, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, writingMode: "vertical-rl", transform: "rotate(180deg)", padding: "4px 0" }}>
                  {p}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map((role, i) => (
            <tr key={role.id} style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--bg)" }}>
              <td style={{ padding: "10px 14px", border: "1px solid var(--border)", fontWeight: 500, color: "var(--fg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                  {role.name}
                </div>
              </td>
              {ALL_PERMISSIONS.map(perm => {
                const val = PERMISSION_MATRIX[role.id][perm];
                const isNote = typeof val === "string";
                const isGranted = val === true || isNote;
                return (
                  <td key={perm} style={{
                    padding: "10px 8px", border: "1px solid var(--border)", textAlign: "center",
                  }}>
                    {isGranted ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <span style={{ color: "var(--green)", fontSize: 15 }}>✓</span>
                        {isNote && (
                          <span style={{ fontSize: 9, color: "var(--yellow)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                            {val as string}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 15 }}>✗</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user }: { user: typeof MOCK_USERS[0] }) {
  const role = ROLES.find(r => r.id === user.role)!;
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "12px 16px", color: "var(--fg)", fontWeight: 500 }}>{user.name}</td>
      <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>{user.email}</td>
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          background: role.color + "22", color: role.color,
          border: `1px solid ${role.color}44`,
          borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
        }}>{role.name}</span>
      </td>
      <td style={{ padding: "12px 16px", color: "var(--fg)", fontSize: 13 }}>{user.tenant}</td>
      <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>{user.lastLogin}</td>
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          background: user.status === "Active" ? "#4caf5022" : "#9e9e9e22",
          color: user.status === "Active" ? "#4caf50" : "#9e9e9e",
          border: `1px solid ${user.status === "Active" ? "#4caf5044" : "#9e9e9e44"}`,
          borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600,
        }}>{user.status}</span>
      </td>
    </tr>
  );
}

function TenantCard({ name, projects, rowLevel, crossTenant, isolation, activeUsers }: {
  name: string; projects: string[]; rowLevel: string; crossTenant: string;
  isolation?: string; activeUsers: number;
}) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: 20, flex: 1, minWidth: 260,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "var(--primary)22", border: "1px solid var(--primary)44",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>🏢</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--fg)" }}>{name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{activeUsers} active users</div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Projects ({projects.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {projects.map(p => (
            <div key={p} style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "var(--fg)",
            }}>{p}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Row-Level Security</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#4caf50" }}>{rowLevel}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Cross-Tenant Access</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#ef5350" }}>{crossTenant}</span>
        </div>
        {isolation && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Tenant Isolation</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4caf50" }}>{isolation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

function AccessSimulator() {
  const [selectedRole, setSelectedRole] = useState("developer");
  const [selectedAction, setSelectedAction] = useState("View Critical Findings");
  const [result, setResult] = useState<SimResult | null>(null);

  const role = ROLES.find(r => r.id === selectedRole)!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20,
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
          🧪 Simulate Access Decision
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>Role</label>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{
              width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--fg)", cursor: "pointer",
            }}>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 240 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>Action</label>
            <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} style={{
              width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--fg)", cursor: "pointer",
            }}>
              {SIM_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={() => setResult(simulate(selectedRole, selectedAction))} style={{
            background: "var(--primary)", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>▶ Simulate</button>
        </div>
      </div>

      {result && (
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${result.decision === "GRANTED" ? "#4caf5044" : "#ef535044"}`,
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{
              background: result.decision === "GRANTED" ? "#4caf5022" : "#ef535022",
              color: result.decision === "GRANTED" ? "#4caf50" : "#ef5350",
              border: `2px solid ${result.decision === "GRANTED" ? "#4caf50" : "#ef5350"}`,
              borderRadius: 8, padding: "6px 18px", fontSize: 20, fontWeight: 800, letterSpacing: "0.06em",
            }}>
              {result.decision === "GRANTED" ? "✓ GRANTED" : "✗ DENIED"}
            </span>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              <span style={{ color: role.color, fontWeight: 600 }}>{role.name}</span>{" → "}{selectedAction}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <InfoRow label="Reason" value={result.reason} />
            <InfoRow label="Required Permission" value={
              <code style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)" }}>{result.requiredPermission}</code>
            } />
            <InfoRow label="User Has Permission" value={
              <span style={{ color: result.userHasPermission ? "#4caf50" : "#ef5350", fontWeight: 700 }}>
                {result.userHasPermission ? "✓ Yes" : "✗ No"}
              </span>
            } />
          </div>

          {result.queryModification && (
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                Query Modification Applied
              </div>
              <div style={{
                background: "var(--bg)", border: "1px solid #ffcc8044",
                borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: "monospace", color: "#ffcc80",
              }}>{result.queryModification}</div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
              Audit Event Logged
            </div>
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "8px 12px", fontSize: 11, fontFamily: "monospace", color: "var(--muted)",
            }}>{result.auditEvent}</div>
          </div>
        </div>
      )}

      {!result && (
        <div style={{
          background: "var(--surface)", border: "1px dashed var(--border)",
          borderRadius: 12, padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14,
        }}>
          Select a role and action, then click <strong>Simulate</strong> to see the access decision.
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("roles");

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "roles",       label: "Roles",           icon: "🛡️" },
    { key: "permissions", label: "Permissions",     icon: "🔑" },
    { key: "users",       label: "Users",           icon: "👥" },
    { key: "tenants",     label: "Tenant Controls", icon: "🏢" },
    { key: "simulator",   label: "Access Simulator",icon: "🧪" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--fg)" }}>
            🔐 RBAC &amp; Access Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Role-based access control, permission matrix, tenant isolation, and access simulation
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            background: "#4caf5022", color: "#4caf50",
            border: "1px solid #4caf5044", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          }}>✓ Tenant Isolation Active</span>
          <span style={{
            background: "var(--primary)22", color: "var(--primary)",
            border: "1px solid var(--primary)44", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          }}>54 Users · 6 Roles</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content",
      }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            background: activeTab === tab.key ? "var(--primary)" : "transparent",
            color: activeTab === tab.key ? "#fff" : "var(--muted)",
            border: "none", borderRadius: 7, padding: "7px 14px",
            fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "roles" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {ROLES.map(role => <RoleCard key={role.id} role={role} />)}
        </div>
      )}

      {activeTab === "permissions" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>Permission Matrix</h3>
          <PermissionsMatrix />
          <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11, color: "var(--muted)" }}>
            <span><span style={{ color: "#4caf50" }}>✓</span> Granted</span>
            <span><span style={{ color: "var(--muted)" }}>✗</span> Denied</span>
            <span><span style={{ color: "#ffcc80" }}>✓ note</span> Granted with restriction</span>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>User Management</h3>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>8 users across 2 tenants</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  {["User","Email","Role","Tenant","Last Login","Status"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(u => <UserRow key={u.email} user={u} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "tenants" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <TenantCard name="ABC Corporation" projects={["Customer Portal","Payment API","Mobile Backend"]}
              rowLevel="ENABLED" crossTenant="BLOCKED" isolation="ENFORCED" activeUsers={6} />
            <TenantCard name="XYZ Inc" projects={["E-Commerce Platform","Internal Tools"]}
              rowLevel="ENABLED" crossTenant="BLOCKED" activeUsers={4} />
          </div>
          <div style={{
            background: "#ef535011", border: "1px solid #ef535044",
            borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#ef5350", marginBottom: 4 }}>Tenant Isolation Policy</div>
              <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.6 }}>
                Tenant A users cannot see Tenant B resources. Cross-tenant queries return{" "}
                <code style={{ fontFamily: "monospace", background: "var(--bg)", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>404 Not Found</code>{" "}
                (not <code style={{ fontFamily: "monospace", background: "var(--bg)", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>403 Forbidden</code>
                ) to prevent tenant enumeration attacks.
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "🗄️", label: "Data Layer",  detail: "Row-level security enforced on all queries" },
              { icon: "🌐", label: "API Layer",   detail: "Tenant context injected via JWT claims" },
              { icon: "📝", label: "Audit Layer", detail: "All cross-tenant attempts logged as violations" },
              { icon: "🔑", label: "Auth Layer",  detail: "Tenant-scoped tokens, no impersonation allowed" },
            ].map(item => (
              <div key={item.label} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "simulator" && <AccessSimulator />}
    </div>
  );
}
