"use client"

import React, { useState } from "react"
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserX,
  UserCheck,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Building2,
  X,
  Laptop,
  Fingerprint,
  Key,
  LogOut,
  Zap,
  Activity
} from "lucide-react"
import {
  ADMIN_USERS_DIRECTORY,
  MODERATION_CASES_DATA,
  ADMIN_AUDIT_LOG_DATA,
  FOUR_EYES_APPROVALS_DATA,
  AdminUserRecord,
  ModerationCase,
  AdminAuditLogEntry,
  FourEyesApprovalItem,
  UserEnforcementStatus
} from "@/lib/connectin-iam-data"
import { UserProfile } from "@/lib/linkedin-data"
import { loadStoredAdminUsers } from "@/lib/connectin-storage"

interface AdminIAMConsoleViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function AdminIAMConsoleView({
  currentUser,
  onNavigateTab
}: AdminIAMConsoleViewProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'users' | 'moderation' | 'four_eyes' | 'audit_log' | 'soc_alerts'
  >('users')

  const [users, setUsers] = useState<AdminUserRecord[]>(ADMIN_USERS_DIRECTORY)

  React.useEffect(() => {
    const stored = loadStoredAdminUsers()
    if (stored && stored.length > 0) {
      setUsers(stored)
    }
  }, [])
  const [cases, setCases] = useState<ModerationCase[]>(MODERATION_CASES_DATA)
  const [approvals, setApprovals] = useState<FourEyesApprovalItem[]>(FOUR_EYES_APPROVALS_DATA)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(ADMIN_AUDIT_LOG_DATA)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const [selectedUserForInspection, setSelectedUserForInspection] = useState<AdminUserRecord | null>(null)

  const handleUpdateUserStatus = (userId: string, newStatus: UserEnforcementStatus) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, enforcementStatus: newStatus } : u))
    )

    if (selectedUserForInspection && selectedUserForInspection.id === userId) {
      setSelectedUserForInspection(prev => prev ? { ...prev, enforcementStatus: newStatus } : null)
    }

    // Append to immutable audit ledger
    const newAuditEntry: AdminAuditLogEntry = {
      id: `LOG-${Date.now()}`,
      adminEmail: currentUser.email || 'alex.taylor@connectin.internal',
      action: 'USER_SUSPENDED',
      targetEntity: `User ID: ${userId}`,
      reason: `Enforcement transition to ${newStatus} per administrative policy review`,
      ipAddress: '198.51.100.42 (Internal Admin Enclave)',
      timestamp: 'Just Now',
      status: 'Success'
    }

    setAuditLogs(prev => [newAuditEntry, ...prev])
    setActionNotice(`✓ Enforcement applied: ${userId} is now ${newStatus}. Logged to Immutable Audit Ledger.`)
    setTimeout(() => setActionNotice(null), 3500)
  }

  const handleApproveFourEyes = (reqId: string) => {
    setApprovals(prev =>
      prev.map(a =>
        a.id === reqId
          ? { ...a, currentApprovals: 2, status: 'Approved & Executed' }
          : a
      )
    )

    const newAuditEntry: AdminAuditLogEntry = {
      id: `LOG-${Date.now()}`,
      adminEmail: currentUser.email || 'alex.taylor@connectin.internal',
      action: 'FOUR_EYES_APPROVED',
      targetEntity: `Request: ${reqId}`,
      reason: 'Second administrative signature verified. Permanent sanitized deletion executed.',
      ipAddress: '198.51.100.42',
      timestamp: 'Just Now',
      status: 'Success'
    }

    setAuditLogs(prev => [newAuditEntry, ...prev])
    setActionNotice(`✓ 4-Eyes Second Approval Verified. Request ${reqId} executed.`)
    setTimeout(() => setActionNotice(null), 3500)
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Top Admin Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-red-500/20 px-3 py-0.5 text-xs font-bold text-red-300 border border-red-400/40 flex items-center gap-1.5 w-fit font-mono">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            ConnectIn Platform Administration &amp; IAM Governance Console
          </span>
          <h1 className="text-2xl font-black text-white">
            Administrative Identity, User Tracking &amp; Moderation Hub
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Real-time user tracking, active session monitoring, RBAC/ABAC policy enforcement, and immutable audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('trustcenter')}
            className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2 text-xs shadow-md hover:bg-zinc-100 shrink-0"
          >
            Public Trust Center →
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 animate-in fade-in font-mono">
          {actionNotice}
        </div>
      )}

      {/* METRICS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Total Registered Users</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">4,283,921</p>
          <span className="text-[10px] text-emerald-600 font-bold">3,829,112 Active Sessions</span>
        </div>
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Suspended / Banned</span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">12,481</p>
          <span className="text-[10px] text-zinc-500 font-mono">0.29% Violation Rate</span>
        </div>
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Open Moderation Cases</span>
          <p className="text-2xl font-black text-amber-500">{cases.length} Queued</p>
          <span className="text-[10px] text-zinc-500 font-mono">Avg SLA: 14 Mins</span>
        </div>
        <div className="p-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400">4-Eyes Approvals</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{approvals.filter(a => a.status === 'Pending Second Review').length} Pending</p>
          <span className="text-[10px] text-purple-600 font-bold">Dual Sign-Off Req.</span>
        </div>
      </div>

      {/* ADMIN SUB-TABS */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
            activeAdminTab === 'users'
              ? "bg-[#0A66C2] text-white shadow-sm"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          👥 User Directory &amp; 6 Enforcement States
        </button>
        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
            activeAdminTab === 'moderation'
              ? "bg-[#0A66C2] text-white shadow-sm"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          ⚖️ Moderation Case Queue ({cases.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('four_eyes')}
          className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
            activeAdminTab === 'four_eyes'
              ? "bg-[#0A66C2] text-white shadow-sm"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          🧑‍⚖️ 4-Eyes Approvals Desk
        </button>
        <button
          onClick={() => setActiveAdminTab('audit_log')}
          className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
            activeAdminTab === 'audit_log'
              ? "bg-[#0A66C2] text-white shadow-sm"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          📜 Immutable Audit Ledger
        </button>
        <button
          onClick={() => setActiveAdminTab('soc_alerts')}
          className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
            activeAdminTab === 'soc_alerts'
              ? "bg-red-600 text-white shadow-sm"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          🚨 SOC Threat Alerts (2 Active)
        </button>
      </div>

      {/* TAB 1: USER DIRECTORY & 6 ENFORCEMENT STATES */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by User ID, Name, Email, or Organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-zinc-500 text-[11px]">{user.id}</span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{user.name}</h4>
                      <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                        user.enforcementStatus === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        user.enforcementStatus === 'Under Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {user.enforcementStatus}
                      </span>
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.2 text-[9px] font-mono text-zinc-600 dark:text-zinc-400">
                        {user.mfaStatus}
                      </span>
                      <span className={`rounded-full px-2 py-0.2 text-[9px] font-mono font-bold ${
                        user.riskLevel === 'Low' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' :
                        user.riskLevel === 'High' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' :
                        'text-red-600 bg-red-50 dark:bg-red-950/40'
                      }`}>
                        Risk: {user.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500">
                      {user.email} · Org: <strong>{user.organization}</strong> · Last Active: {user.lastLogin}
                    </p>
                    <div className="flex items-center gap-1">
                      {user.roles.map(r => (
                        <span key={r} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-600 dark:text-zinc-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Enforcement & Inspection Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedUserForInspection(user)}
                      className="rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, 'Active')}
                      className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold transition-colors"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, 'Restricted')}
                      className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 text-[11px] font-bold transition-colors"
                    >
                      Restrict
                    </button>
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, 'Suspended')}
                      className="rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 text-[11px] font-bold transition-colors"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION CASE QUEUE */}
      {activeAdminTab === 'moderation' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Active Moderation Cases &amp; Reported Violations
            </h3>

            <div className="space-y-3 text-xs">
              {cases.map((c) => (
                <div key={c.caseId} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono font-bold text-zinc-400 text-[10px]">{c.caseId}</span>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {c.category}: {c.reportedEntity}
                      </h4>
                      <p className="text-[11px] text-zinc-500">Reported by: {c.reportedBy} · {c.timestamp}</p>
                    </div>
                    <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 text-[10px] font-bold">
                      {c.severity} Severity
                    </span>
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    "{c.evidenceSummary}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500">Assignee: {c.assignedModerator}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActionNotice(`✓ Case ${c.caseId} resolved. User restriction enforced.`)
                          setTimeout(() => setActionNotice(null), 3000)
                        }}
                        className="rounded-lg bg-[#0A66C2] text-white px-3 py-1 text-[11px] font-bold"
                      >
                        Enforce Action →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 4-EYES APPROVALS DESK */}
      {activeAdminTab === 'four_eyes' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Four-Eyes Dual Administrative Sign-Off Engine</span>
                <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.2 text-[9px] font-bold">
                  FedRAMP High Compliant
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                High-risk operations (organization deletion, VIP banning, cryptographic policy mutation) strictly require 2 independent administrative approvals.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {approvals.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono font-bold text-zinc-400 text-[10px]">{req.id}</span>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {req.actionType}: {req.targetObject}
                      </h4>
                      <p className="text-[11px] text-zinc-500">Initiated by: {req.requestedBy} · {req.timestamp}</p>
                    </div>

                    <span className="rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                      {req.currentApprovals} / {req.requiredApprovals} Approvals
                    </span>
                  </div>

                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900">
                    Justification: {req.justification}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Status: {req.status}
                    </span>

                    {req.status === 'Pending Second Review' && (
                      <button
                        onClick={() => handleApproveFourEyes(req.id)}
                        className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 text-xs shadow-xs"
                      >
                        ✓ Sign Off as Second Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOG */}
      {activeAdminTab === 'audit_log' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Immutable Administrative Audit Ledger (Write-Once Append-Only)
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-mono">
              {auditLogs.map((entry) => (
                <div key={entry.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.action}</span>
                      <span className="text-zinc-400">➔</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{entry.targetEntity}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">({entry.status})</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{entry.reason}</p>
                    <p className="text-[10px] text-zinc-400">By: {entry.adminEmail} · IP: {entry.ipAddress}</p>
                  </div>

                  <span className="text-[10px] text-zinc-400 shrink-0">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SOC THREAT ALERTS & RISK SIGNALS */}
      {activeAdminTab === 'soc_alerts' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs dark:border-red-900/60 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Real-Time Security Operations Center (SOC) Threat Stream</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900 dark:text-red-200">🚨 Impossible Travel Anomaly (High Confidence)</span>
                  <span className="font-mono text-[10px] text-zinc-400">Detected 12m ago</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  User <strong>Dmitri V. (USR-89411)</strong> authenticated from Laurel, MD (IP 198.51.100.42) and then Frankfurt, Germany (IP 185.220.101.5) within 12 minutes.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateUserStatus('USR-89411', 'Suspended')}
                    className="rounded-lg bg-red-600 text-white font-bold px-3 py-1 text-[11px]"
                  >
                    Kill All Sessions &amp; Suspend User
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200">⚠️ Automated Lead Gen InMail Crawler Violation</span>
                  <span className="font-mono text-[10px] text-zinc-400">Detected 2h ago</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  User <strong>Bot_Scraper_994 (USR-89413)</strong> triggered rate limit threshold (19 reports in 60 minutes) targeting clearance engineers.
                </p>
                <div className="flex gap-2 pt-1">
                  <span className="text-[10px] font-bold text-emerald-600">✓ Account already placed in Suspended enforcement state.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL INSPECTOR MODAL */}
      {selectedUserForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-400">Administrative Deep Inspection</span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{selectedUserForInspection.name}</span>
                  <span className="text-xs font-mono font-normal text-zinc-400">({selectedUserForInspection.id})</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForInspection(null)}
                className="rounded-full p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Email Address</span>
                <span className="font-bold text-white truncate block">{selectedUserForInspection.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Enforcement State</span>
                <span className="font-bold text-emerald-400">{selectedUserForInspection.enforcementStatus}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Risk Engine Score</span>
                <span className={`font-bold ${selectedUserForInspection.riskLevel === 'Low' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUserForInspection.riskLevel}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Organization</span>
                <span className="font-bold text-white">{selectedUserForInspection.organization}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Authentication Method</span>
                <span className="font-bold text-white">{selectedUserForInspection.mfaStatus}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Violation Reports</span>
                <span className="font-bold text-amber-400">{selectedUserForInspection.reportsCount} Reports</span>
              </div>
            </div>

            {/* Active Sessions Telemetry */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Laptop className="h-3.5 w-3.5 text-sky-400" />
                <span>Live Active Sessions &amp; Device Registry</span>
              </h4>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] space-y-1">
                <p className="text-emerald-400">● Session 1: Chrome 128 (Windows Desktop) · Laurel, MD · IP: 198.51.100.42 (Active Now)</p>
                <p className="text-zinc-400">● Session 2: ConnectIn iOS App (iPhone 15 Pro) · Washington, DC · IP: 172.56.21.9 (2h ago)</p>
              </div>
            </div>

            {/* Granular RBAC + ABAC Policies */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Granular RBAC + ABAC Policy Matrix</span>
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                {['user.read', 'user.profile_edit', 'bounty.escrow_submit', 'guild.ts_sci_access', 'marketplace.vendor_publish'].map((perm) => (
                  <span key={perm} className="rounded-lg bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-white/10">
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedUserForInspection(null)}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-zinc-300"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateUserStatus(selectedUserForInspection.id, 'Restricted')}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 text-xs shadow-xs"
                >
                  Restrict Account
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(selectedUserForInspection.id, 'Suspended')}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 text-xs shadow-xs"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(selectedUserForInspection.id, 'Active')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs shadow-xs"
                >
                  Set Active ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
