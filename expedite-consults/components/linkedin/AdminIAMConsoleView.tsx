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
  Building2
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
  const [cases, setCases] = useState<ModerationCase[]>(MODERATION_CASES_DATA)
  const [approvals, setApprovals] = useState<FourEyesApprovalItem[]>(FOUR_EYES_APPROVALS_DATA)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(ADMIN_AUDIT_LOG_DATA)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const handleUpdateUserStatus = (userId: string, newStatus: UserEnforcementStatus) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, enforcementStatus: newStatus } : u))
    )

    // Append to immutable audit ledger
    const newAuditEntry: AdminAuditLogEntry = {
      id: `LOG-${Date.now()}`,
      adminEmail: currentUser.email || 'alex.taylor@connectin.internal',
      action: 'USER_SUSPENDED',
      targetEntity: `User ID: ${userId}`,
      reason: `Manual enforcement transition to ${newStatus} per administrative policy review`,
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
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
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
            Administrative Identity, Moderation &amp; 4-Eyes Hub
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Separate, highly privileged enclave enforcing granular RBAC/ABAC policies, case investigation queues, and immutable administrative audit logging.
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
          <span className="text-[10px] text-emerald-600 font-bold">3,829,112 Active Now</span>
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
                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    </div>

                    <p className="text-[11px] text-zinc-500">
                      {user.email} · Org: <strong>{user.organization}</strong> · Last Login: {user.lastLogin}
                    </p>
                    <div className="flex items-center gap-1">
                      {user.roles.map(r => (
                        <span key={r} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-600 dark:text-zinc-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Enforcement Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
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
    </div>
  )
}
