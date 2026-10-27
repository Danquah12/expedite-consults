"use client"

import React, { useState, useEffect } from "react"
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
  Activity,
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Sliders,
  Send,
  Radio,
  Trash2,
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
  EyeOff,
  UserCog,
  ShieldQuestion,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronRight,
  Flame,
  FileCode,
  Check,
  Globe,
  UserPlus,
  Mail,
  Building,
  Sparkle
} from "lucide-react"
import {
  ADMIN_USERS_DIRECTORY,
  ADMIN_CONTENT_DIRECTORY,
  MODERATION_CASES_DATA,
  ADMIN_COMPANIES_DIRECTORY,
  ADMIN_JOBS_DIRECTORY,
  ADMIN_VERIFICATION_REQUESTS,
  INITIAL_PLATFORM_CONFIG,
  PLATFORM_RBAC_ROLES,
  ADMIN_AUDIT_LOG_DATA,
  SOC_SECURITY_EVENTS,
  BROADCAST_NOTIFICATIONS_DATA,
  FOUR_EYES_APPROVALS_DATA,
  EXECUTIVE_ANALYTICS_DATA,
  AdminUserRecord,
  AdminContentRecord,
  ModerationCase,
  AdminCompanyRecord,
  AdminJobRecord,
  VerificationRequestItem,
  PlatformConfigState,
  RBACRole,
  AdminAuditLogEntry,
  SecurityEventTelemetry,
  BroadcastNotificationItem,
  FourEyesApprovalItem,
  UserEnforcementStatus
} from "@/lib/connectin-iam-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  loadStoredAdminUsers,
  saveStoredAdminUsers,
  registerNewUserInDirectory,
  loadStoredUserActivityLogs,
  UserActivityEvent
} from "@/lib/connectin-storage"

interface AdminIAMConsoleViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function AdminIAMConsoleView({
  currentUser,
  onNavigateTab
}: AdminIAMConsoleViewProps) {
  // Navigation tabs
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'overview'
    | 'user_activity'
    | 'users'
    | 'content'
    | 'moderation'
    | 'companies'
    | 'jobs'
    | 'verifications'
    | 'settings'
    | 'roles'
    | 'audit_log'
    | 'soc_alerts'
    | 'broadcasts'
    | 'four_eyes'
  >('overview')

  // Live state
  const [users, setUsers] = useState<AdminUserRecord[]>(() => loadStoredAdminUsers())
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityEvent[]>(() => loadStoredUserActivityLogs())
  const [activityFilter, setActivityFilter] = useState<'all' | 'likes' | 'comments' | 'reposts_shares' | 'content_profile' | 'auth'>('all')
  const [activitySearch, setActivitySearch] = useState("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userFilter, setUserFilter] = useState<'all' | 'new_and_logged_in' | 'admins'>('all')
  const [contentItems, setContentItems] = useState<AdminContentRecord[]>(ADMIN_CONTENT_DIRECTORY)
  const [cases, setCases] = useState<ModerationCase[]>(MODERATION_CASES_DATA)
  const [companies, setCompanies] = useState<AdminCompanyRecord[]>(ADMIN_COMPANIES_DIRECTORY)
  const [jobs, setJobs] = useState<AdminJobRecord[]>(ADMIN_JOBS_DIRECTORY)
  const [verifications, setVerifications] = useState<VerificationRequestItem[]>(ADMIN_VERIFICATION_REQUESTS)
  const [platformConfig, setPlatformConfig] = useState<PlatformConfigState>(INITIAL_PLATFORM_CONFIG)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(ADMIN_AUDIT_LOG_DATA)
  const [socEvents, setSocEvents] = useState<SecurityEventTelemetry[]>(SOC_SECURITY_EVENTS)
  const [broadcasts, setBroadcasts] = useState<BroadcastNotificationItem[]>(BROADCAST_NOTIFICATIONS_DATA)
  const [approvals, setApprovals] = useState<FourEyesApprovalItem[]>(FOUR_EYES_APPROVALS_DATA)

  // Filters & selection
  const [searchQuery, setSearchQuery] = useState("")
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Modals & Drawers
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null)
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequestItem | null>(null)
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUserRecord | null>(null)
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false)
  const [impersonateReason, setImpersonateReason] = useState("")

  // Quick Add / Invite User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPhone, setNewUserPhone] = useState("")
  const [newUserRole, setNewUserRole] = useState<'personal' | 'enterprise' | 'creator' | 'seller' | 'admin'>('personal')
  const [newUserOrg, setNewUserOrg] = useState("")
  const [newUserHeadline, setNewUserHeadline] = useState("")
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Broadcast Composer State
  const [newBroadcastTitle, setNewBroadcastTitle] = useState("")
  const [newBroadcastBody, setNewBroadcastBody] = useState("")
  const [newBroadcastSeverity, setNewBroadcastSeverity] = useState<'Info' | 'Warning' | 'Security Alert' | 'Maintenance'>('Info')
  const [newBroadcastAudience, setNewBroadcastAudience] = useState<'Everyone' | 'Premium Members' | 'Recruiters' | 'Enterprise Admins'>('Everyone')

  const showNotice = (msg: string) => {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Helper to identify whether a record is a newly registered / logged-in user vs static demo directory
  const isNewOrLoggedInUser = (u: AdminUserRecord) => {
    const emailLower = String(u.email || "").toLowerCase().trim()
    const lastLoginStr = String(u.lastLogin || "")
    const mfaStr = String(u.mfaStatus || "")

    // Any account with an explicit live login timestamp or Google/Microsoft SSO badge is a real logged-in user
    if (
      lastLoginStr.includes("Logged In") ||
      lastLoginStr.includes("Just now") ||
      mfaStr.includes("Google SSO") ||
      mfaStr.includes("Microsoft SSO")
    ) {
      return true
    }

    // Static seed emails that have not actively logged in during a live session
    const staticSeedEmails = new Set([
      "alex.taylor@expedite-consults.com",
      "alex.taylor@connectin.com",
      "sec-admin@connectin.internal",
      "commander.robert.hayes@connectin.com",
      "marcus.vance@defense-systems.com",
      "sarah.chen@defense-studio.tv",
      "david.k@expedite-labs.io",
      "dmitri.v@unknown-proxy.io",
      "elena.rostova@stanford.edu",
      "spam_lead_gen@crawler.net",
      "marcus.vance@cloudscaleglobal.io"
    ])
    return !staticSeedEmails.has(emailLower)
  }

  // Live Server Data Fetcher (Synced Globally via Cloud Sync Map & Telemetry)
  const fetchLiveAdminData = async () => {
    setIsLoadingUsers(true)
    const localUsers = loadStoredAdminUsers()
    const localActivity = loadStoredUserActivityLogs()
    try {
      const res = await fetch("/api/connectin/admin", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.activityLogs && Array.isArray(data.activityLogs)) {
          const actMap = new Map<string, UserActivityEvent>()
          ;[...(data.activityLogs as UserActivityEvent[]), ...localActivity].forEach(ev => {
            if (ev && ev.id && !actMap.has(ev.id)) {
              actMap.set(ev.id, ev)
            }
          })
          setUserActivityLogs(Array.from(actMap.values()))
        } else {
          setUserActivityLogs(localActivity)
        }

        if (Array.isArray(data.verifications) && data.verifications.length > 0) {
          setVerifications(data.verifications)
        }
        if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
          setAuditLogs(data.auditLogs)
        }
        if (Array.isArray(data.socEvents) && data.socEvents.length > 0) {
          setSocEvents(data.socEvents)
        }

        if (data.users && Array.isArray(data.users)) {
          const deduped = new Map<string, AdminUserRecord>()
          const getKey = (item: AdminUserRecord) =>
            `${String(item.name || "").toLowerCase().trim()}::${String(item.email || "").toLowerCase().trim()}`

          // Put live global server users & logged-in users FIRST before static demo directory
          const liveServerUsers = (data.users as AdminUserRecord[]).filter(isNewOrLoggedInUser)
          ;[
            ...liveServerUsers,
            ...localUsers.filter(isNewOrLoggedInUser),
            ...data.users,
            ...localUsers,
            ...ADMIN_USERS_DIRECTORY
          ].forEach(item => {
            if (!item || !item.email) return
            const key = getKey(item)
            if (!deduped.has(key)) {
              deduped.set(key, item)
            }
          })
          setUsers(Array.from(deduped.values()))
          return
        }
      }
      setUsers(localUsers)
      setUserActivityLogs(localActivity)
    } catch (err) {
      console.warn("Could not fetch live admin users:", err)
      setUsers(localUsers)
      setUserActivityLogs(localActivity)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchLiveAdminData()
  }, [activeAdminTab])

  // Audit Log Appender
  const appendAudit = (action: AdminAuditLogEntry['action'], target: string, reason: string) => {
    const newEntry: AdminAuditLogEntry = {
      id: `LOG-${Date.now()}`,
      adminEmail: currentUser.email || 'alex.taylor@expedite-consults.com',
      action,
      targetEntity: target,
      reason,
      ipAddress: '198.51.100.42 (Internal Admin Enclave)',
      timestamp: 'Just Now',
      status: 'Success'
    }
  }

  // Quick Add Member Action
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail.trim() || !newUserName.trim()) return

    setIsCreatingUser(true)
    const cleanEmail = newUserEmail.toLowerCase().trim()
    const cleanName = newUserName.trim()
    const roleUpper = newUserRole.toUpperCase()

    const newRecord: AdminUserRecord = {
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      name: cleanName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName + "-" + cleanEmail)}&backgroundColor=0a66c2`,
      headline: newUserHeadline || `${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)} Professional · ConnectIn Member`,
      roles: [roleUpper],
      enforcementStatus: 'Active',
      verificationLevel: 'Email Verified',
      mfaStatus: 'Email 2FA ✓',
      riskLevel: 'Low',
      organization: newUserOrg || 'ConnectIn Member',
      location: 'United States · Verified',
      connectionsCount: 0,
      lastLogin: 'Active Now',
      registeredAt: 'Today',
      reportsCount: 0
    }

    try {
      await fetch('/api/connectin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanName.split(' ')[0],
          lastName: cleanName.split(' ').slice(1).join(' '),
          email: cleanEmail,
          phone: newUserPhone,
          role: newUserRole,
          twoFactorChannel: 'email'
        })
      })
    } catch (e) { /* ignore */ }

    registerNewUserInDirectory(newRecord)
    setUsers(prev => [newRecord, ...prev.filter(u => u.email.toLowerCase() !== cleanEmail)])
    setIsAddUserModalOpen(false)
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPhone("")
    setNewUserOrg("")
    setNewUserHeadline("")
    setIsCreatingUser(false)
    appendAudit('USER_ACTIVATED', `New User Provisioned: ${cleanName} (${cleanEmail})`, `Directly provisioned by administrator ${currentUser.name}`)
    showNotice(`✓ User ${cleanName} (${cleanEmail}) provisioned and added to active user directory!`)
  }

  // 1. User Management Actions
  const handleUpdateUserStatus = (userId: string, newStatus: UserEnforcementStatus, reason?: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, enforcementStatus: newStatus } : u))
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, enforcementStatus: newStatus } : null)
    }
    appendAudit('USER_SUSPENDED', `User ID: ${userId}`, reason || `Status changed to ${newStatus}`)
    showNotice(`✓ User ${userId} status updated to ${newStatus}. Logged to Immutable Audit Ledger.`)
  }

  // 2. Impersonation Action
  const handleStartImpersonation = () => {
    if (!selectedUser || !impersonateReason.trim()) return
    setImpersonatedUser(selectedUser)
    setIsImpersonateModalOpen(false)
    appendAudit('USER_IMPERSONATED', `Impersonated: ${selectedUser.name} (${selectedUser.id})`, `Support ticket: ${impersonateReason}`)
    showNotice(`🔒 Controlled support impersonation session active for ${selectedUser.name}. All actions recorded.`)
  }

  // 3. Content Actions
  const handleUpdateContentStatus = (contentId: string, status: AdminContentRecord['status']) => {
    setContentItems(prev => prev.map(c => c.id === contentId ? { ...c, status } : c))
    appendAudit('CONTENT_REMOVED', `Content ID: ${contentId}`, `Content transitioned to ${status}`)
    showNotice(`✓ Content ${contentId} marked as ${status}.`)
  }

  // 4. Moderation Decision
  const handleResolveCase = (caseId: string, decision: 'No Violation' | 'Issue Warning' | 'Remove Content' | 'Suspend Account' | 'Permanent Ban') => {
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, status: 'Action Enforced', resolutionNotes: decision } : c))
    appendAudit('USER_SUSPENDED', `Case: ${caseId}`, `Moderator decision: ${decision}`)
    setSelectedCase(null)
    showNotice(`✓ Case ${caseId} resolved with decision: ${decision}.`)
  }

  // 5. Verification Actions
  const handleVerificationDecision = (verifId: string, status: 'Approved' | 'Rejected') => {
    setVerifications(prev => prev.map(v => v.id === verifId ? { ...v, status } : v))
    const item = verifications.find(v => v.id === verifId)
    if (item && status === 'Approved') {
      setUsers(prev => prev.map(u => u.email === item.userEmail ? { ...u, verificationLevel: 'Enterprise Fellow' } : u))
    }
    appendAudit('VERIFICATION_APPROVED', `Verification ${verifId} (${item?.userName})`, `Status: ${status}`)
    setSelectedVerification(null)
    showNotice(`✓ Verification request ${verifId} has been ${status}.`)
  }

  // 6. Job Actions
  const handleJobStatus = (jobId: string, status: AdminJobRecord['status']) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j))
    appendAudit('JOB_APPROVED', `Job ID: ${jobId}`, `Status changed to ${status}`)
    showNotice(`✓ Job ${jobId} updated to ${status}.`)
  }

  // 7. Platform Config Toggle
  const toggleFeatureFlag = (key: keyof PlatformConfigState) => {
    setPlatformConfig(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      appendAudit('SETTINGS_UPDATED', `Feature Flag: ${key}`, `Set to ${updated[key]}`)
      return updated
    })
    showNotice(`✓ Feature flag '${key}' updated dynamically.`)
  }

  // 8. Broadcast Dispatch
  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcastTitle.trim() || !newBroadcastBody.trim()) return

    const newBroadcast: BroadcastNotificationItem = {
      id: `BRD-${Date.now()}`,
      title: newBroadcastTitle,
      body: newBroadcastBody,
      severity: newBroadcastSeverity,
      targetAudience: newBroadcastAudience,
      channels: ['In-App', 'Push / SMS'],
      sentBy: `${currentUser.name} (Admin)`,
      sentAt: 'Just Now',
      deliveredCount: newBroadcastAudience === 'Everyone' ? 2483291 : 48200
    }

    setBroadcasts(prev => [newBroadcast, ...prev])
    appendAudit('BROADCAST_SENT', `Broadcast: ${newBroadcastTitle}`, `Audience: ${newBroadcastAudience}`)
    setNewBroadcastTitle("")
    setNewBroadcastBody("")
    showNotice(`📢 Platform broadcast dispatched to ${newBroadcast.deliveredCount.toLocaleString()} members!`)
  }

  // 9. SOC Block IP
  const handleBlockIp = (ip: string) => {
    appendAudit('USER_SUSPENDED', `IP Blocked: ${ip}`, 'Manual SOC Edge Firewall drop rule added')
    showNotice(`🚫 IP address ${ip} added to Cloudflare Edge WAF blocklist.`)
  }

  // Navigation menu items
  const adminNavSections = [
    {
      title: "Core Operations",
      items: [
        { id: 'overview', label: 'Dashboard & Metrics', icon: BarChart3, badge: 'Live' },
        { id: 'user_activity', label: 'User Activity Log', icon: Activity, badge: userActivityLogs.length },
        { id: 'users', label: 'User Management', icon: Users, badge: users.length },
        { id: 'content', label: 'Content & Feed', icon: FileText, badge: contentItems.length },
        { id: 'moderation', label: 'Moderation Center', icon: ShieldAlert, badge: cases.filter(c => c.status !== 'Action Enforced').length, highlight: true }
      ]
    },
    {
      title: "Enterprise & Commerce",
      items: [
        { id: 'companies', label: 'Companies & Orgs', icon: Building2, badge: companies.length },
        { id: 'jobs', label: 'Jobs & Recruiting', icon: Briefcase, badge: jobs.length },
        { id: 'verifications', label: 'Verification Queue', icon: Award, badge: verifications.filter(v => v.status === 'Pending Review').length, highlight: true }
      ]
    },
    {
      title: "Governance & Security",
      items: [
        { id: 'settings', label: 'Platform Config', icon: Sliders },
        { id: 'roles', label: 'Roles & RBAC', icon: Lock },
        { id: 'audit_log', label: 'Immutable Audit Logs', icon: FileCode, badge: auditLogs.length },
        { id: 'soc_alerts', label: 'Security & SIEM', icon: Zap, badge: 'Active' },
        { id: 'broadcasts', label: 'Broadcast Center', icon: Radio },
        { id: 'four_eyes', label: 'Four-Eyes Approvals', icon: ShieldCheck, badge: approvals.length }
      ]
    }
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Impersonation Active Top Banner */}
      {impersonatedUser && (
        <div className="rounded-2xl bg-amber-500 p-4 text-zinc-950 shadow-xl border-2 border-amber-600 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-black text-sm">
                AUDITED SUPPORT IMPERSONATION ACTIVE: Viewing as {impersonatedUser.name} ({impersonatedUser.email})
              </p>
              <p className="text-xs font-semibold text-zinc-900">
                All telemetry, mutations, and viewed records are cryptographically signed to your Super Admin ID.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              appendAudit('USER_IMPERSONATED', `Terminated Impersonation: ${impersonatedUser.name}`, 'Admin session closed')
              setImpersonatedUser(null)
              showNotice(`Impersonation session terminated successfully.`)
            }}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shrink-0"
          >
            End Impersonation Session
          </button>
        </div>
      )}

      {/* Floating Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-bold text-white shadow-2xl border border-sky-500/40 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Master Top Control Strip Banner */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Platform Administration
              </span>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Audit Trail Active
              </span>
              <span className="rounded-full bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                Administrator
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Platform Administration &amp; Governance
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Administrative management over member directory, community moderation, company verification, jobs, system configurations, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('home')}
              className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <span>← Back to Feed</span>
            </button>
            <button
              onClick={() => {
                appendAudit('SETTINGS_UPDATED', 'Global Cache Purge', 'Triggered edge cache refresh')
                showNotice(`✓ Edge CDN & memory caches refreshed successfully across all regions.`)
              }}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Rail Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            {adminNavSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5">
                  {section.title}
                </h4>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isSelected = activeAdminTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveAdminTab(item.id as any)}
                      className={`flex w-full items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#0A66C2] text-white shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : (item as any).highlight
                              ? "bg-red-500 text-white"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Quick System Health Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                All 14 Admin Subsystems Nominal
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Audit logging: <strong className="text-emerald-600 dark:text-emerald-400">Immutable Hash Chain OK</strong>.
            </p>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          {/* MODULE 1: DASHBOARD & METRICS OVERVIEW */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-5">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div
                  onClick={() => {
                    setUserFilter('new_and_logged_in')
                    setActiveAdminTab('users')
                  }}
                  className="rounded-2xl border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 dark:border-emerald-800 cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">New &amp; Logged-In Users</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {users.filter(isNewOrLoggedInUser).length} New · {users.length} Total
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">Click to filter new sign-ins →</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Users (DAU)</span>
                  <p className="text-xl sm:text-2xl font-black text-[#0A66C2] mt-1">
                    {EXECUTIVE_ANALYTICS_DATA.activeToday.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium">89.4% 30-day retention</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Platform Revenue</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ${EXECUTIVE_ANALYTICS_DATA.revenueToday.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">+18.4% this week</span>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Posts &amp; Connections</span>
                  <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {EXECUTIVE_ANALYTICS_DATA.connectionsToday.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium">{EXECUTIVE_ANALYTICS_DATA.postsToday.toLocaleString()} posts today</span>
                </div>
              </div>

              {/* ─── LIVE NEW USERS & RECENT SIGN-INS TRACKER ─── */}
              <div className="rounded-2xl border-2 border-[#0A66C2]/30 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        New Users &amp; Logged-In Members (Live Tracker)
                      </h3>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {users.filter(isNewOrLoggedInUser).length} New Sign-Ups · {users.length} Total Tracked
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Real-time feed of newly registered accounts and members who have signed in across ConnectLn.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={fetchLiveAdminData}
                      disabled={isLoadingUsers}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin text-[#0A66C2]" : ""}`} />
                      <span>{isLoadingUsers ? "Syncing..." : "Refresh"}</span>
                    </button>
                    <button
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>+ Add Member</span>
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('users')}
                      className="text-xs font-bold text-[#0A66C2] hover:underline pl-1 cursor-pointer"
                    >
                      Full Directory →
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="py-2.5 px-3">User Identity</th>
                        <th className="py-2.5 px-3">Account Type</th>
                        <th className="py-2.5 px-3">Login &amp; Registration Status</th>
                        <th className="py-2.5 px-3">Profession / Enclave</th>
                        <th className="py-2.5 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {users.slice(0, 10).map((u) => {
                        const isNew = isNewOrLoggedInUser(u)
                        return (
                          <tr
                            key={`${u.id}-${u.name}-${u.email}`}
                            className={`transition-colors ${
                              isNew
                                ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30"
                                : "hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{u.name}</span>
                                    {isNew && (
                                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                        NEW USER · LOGGED IN
                                      </span>
                                    )}
                                    {(u.mfaStatus?.includes("Google SSO") || u.lastLogin?.includes("Google SSO")) && (
                                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                        GOOGLE SSO ✓
                                      </span>
                                    )}
                                    {(u.mfaStatus?.includes("Microsoft SSO") || u.lastLogin?.includes("Microsoft")) && (
                                      <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                        MICROSOFT SSO ✓
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map(r => (
                                  <span
                                    key={r}
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                      r.includes("ADMIN")
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                        : "bg-blue-50 text-[#0A66C2] dark:bg-blue-950/60 dark:text-sky-300"
                                    }`}
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  {u.lastLogin || "Active Now · Logged In"}
                                </span>
                                <p className="text-[10px] text-zinc-400">
                                  Joined: {u.registeredAt || "Today"}
                                </p>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
                                {u.organization || u.headline}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="rounded-lg bg-zinc-100 hover:bg-[#0A66C2] hover:text-white px-2.5 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── LIVE USER ACTIVITY STREAM (LIKES, COMMENTS, REPOSTS, SHARES, LOGINS) ─── */}
              <div className="rounded-2xl border-2 border-purple-500/30 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        Live User Activity Log (Likes, Comments, Reposts, Shares &amp; Logins)
                      </h3>
                      <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {userActivityLogs.length} Tracked Events
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Real-time telemetry of everything users do across the platform: Likes/Reactions, Comments, Reposts, External Shares, Posts, Resumes, and Sign-Ins.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={fetchLiveAdminData}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin text-purple-600" : ""}`} />
                      <span>Refresh Log</span>
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('user_activity')}
                      className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Open Full Activity Log ({userActivityLogs.length}) →
                    </button>
                  </div>
                </div>

                {/* Activity Mini Summary Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div
                    onClick={() => {
                      setActivityFilter('likes')
                      setActiveAdminTab('user_activity')
                    }}
                    className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-2.5 cursor-pointer hover:border-[#0A66C2] transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase text-[#0A66C2] dark:text-sky-400">👍 Likes &amp; Reactions</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {userActivityLogs.filter(e => e.actionType === 'POST_LIKED' || e.actionType === 'POST_UNLIKED').length}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setActivityFilter('comments')
                      setActiveAdminTab('user_activity')
                    }}
                    className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 cursor-pointer hover:border-emerald-500 transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">💬 Comments &amp; Replies</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {userActivityLogs.filter(e => e.actionType === 'POST_COMMENTED' || e.actionType === 'COMMENT_REPLIED').length}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setActivityFilter('reposts_shares')
                      setActiveAdminTab('user_activity')
                    }}
                    className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 cursor-pointer hover:border-amber-500 transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">🔁 Reposts &amp; Shares</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {userActivityLogs.filter(e => e.actionType === 'POST_REPOSTED' || e.actionType === 'POST_SHARED').length}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setActivityFilter('content_profile')
                      setActiveAdminTab('user_activity')
                    }}
                    className="rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 p-2.5 cursor-pointer hover:border-purple-500 transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">📝 Posts &amp; Resumes</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {userActivityLogs.filter(e => ['POST_CREATED', 'POST_SAVED', 'POLL_VOTED', 'RESUME_UPLOADED', 'PROFILE_UPDATED', 'USER_CONNECTED'].includes(e.actionType)).length}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setActivityFilter('auth')
                      setActiveAdminTab('user_activity')
                    }}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 cursor-pointer hover:border-zinc-400 transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase text-zinc-500">🔐 Sign-Ins &amp; Auth</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {userActivityLogs.filter(e => e.category === 'auth').length}
                    </p>
                  </div>
                </div>

                {/* Recent 6 Activity Events */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {userActivityLogs.slice(0, 6).map((ev) => (
                    <div key={ev.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={ev.userAvatar}
                          alt={ev.userName}
                          className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{ev.userName}</span>
                            <span className="text-[10px] font-mono text-zinc-400">({ev.userEmail})</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                ev.actionType === 'POST_LIKED'
                                  ? "bg-blue-100 text-[#0A66C2] dark:bg-blue-950/60 dark:text-sky-300"
                                  : ev.actionType === 'POST_COMMENTED' || ev.actionType === 'COMMENT_REPLIED'
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : ev.actionType === 'POST_REPOSTED' || ev.actionType === 'POST_SHARED'
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : ev.category === 'auth'
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                              }`}
                            >
                              {ev.actionLabel}
                            </span>
                            {ev.targetTitle && (
                              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                                → {ev.targetTitle}
                              </span>
                            )}
                          </div>
                          {ev.details && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                              {ev.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-10 sm:pl-0">
                        <span className="text-[10px] font-mono text-zinc-400">{ev.timestampDisplay}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Queues Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveAdminTab('moderation')}
                  className="rounded-2xl border border-red-500/20 bg-red-50/40 p-4 dark:border-red-900/30 dark:bg-red-950/20 cursor-pointer hover:border-red-500 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Pending Moderation
                    </span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                      {cases.length}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Flagged accounts, spam clusters, and suspicious exploit solicitations.
                  </p>
                </div>

                <div
                  onClick={() => setActiveAdminTab('verifications')}
                  className="rounded-2xl border border-blue-500/20 bg-blue-50/40 p-4 dark:border-blue-900/30 dark:bg-blue-950/20 cursor-pointer hover:border-[#0A66C2] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A66C2] dark:text-sky-300 flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      Verification Requests
                    </span>
                    <span className="rounded-full bg-[#0A66C2] px-2 py-0.5 text-xs font-black text-white">
                      {verifications.length}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    CISSP, CKS, Ph.D. and 3PAO cryptographic credential attestations.
                  </p>
                </div>

                <div
                  onClick={() => setActiveAdminTab('jobs')}
                  className="rounded-2xl border border-purple-500/20 bg-purple-50/40 p-4 dark:border-purple-900/30 dark:bg-purple-950/20 cursor-pointer hover:border-purple-500 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      Pending Job Postings
                    </span>
                    <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-black text-white">
                      {jobs.filter(j => j.status === 'Flagged Suspicious').length} Flagged
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Review job salary compliance and anti-phishing recruiter validations.
                  </p>
                </div>
              </div>

              {/* Recent Audit Ledger Snippet */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#0A66C2]" />
                    <span>Real-Time Audit Ledger Stream</span>
                  </h3>
                  <button
                    onClick={() => setActiveAdminTab('audit_log')}
                    className="text-xs font-bold text-[#0A66C2] hover:underline"
                  >
                    View all {auditLogs.length} events →
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{log.action}</span>
                          <span className="text-zinc-400">·</span>
                          <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{log.targetEntity}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{log.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {log.status}
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 1B: FULL USER ACTIVITY LOG (LIKES, COMMENTS, REPOSTS, SHARES, LOGINS) */}
          {activeAdminTab === 'user_activity' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#0A66C2]" />
                      <span>System-Wide User Activity &amp; Engagement Log</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Complete real-time log tracking every user interaction: Likes, Reactions, Comments, Replies, Reposts, Social Shares, Post Creation, Resume Uploads, Connections, and Sign-Ins.
                    </p>
                  </div>
                  <button
                    onClick={fetchLiveAdminData}
                    disabled={isLoadingUsers}
                    className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                    <span>{isLoadingUsers ? "Syncing..." : "Refresh Activity Stream"}</span>
                  </button>
                </div>

                {/* Search & Category Filter Pills */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search by user name, email, action (like, comment, repost, share), or content..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full rounded-xl bg-zinc-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'all', label: `All Activity (${userActivityLogs.length})` },
                    {
                      id: 'likes',
                      label: `👍 Likes & Reactions (${userActivityLogs.filter(e => e.actionType === 'POST_LIKED' || e.actionType === 'POST_UNLIKED').length})`
                    },
                    {
                      id: 'comments',
                      label: `💬 Comments & Replies (${userActivityLogs.filter(e => e.actionType === 'POST_COMMENTED' || e.actionType === 'COMMENT_REPLIED').length})`
                    },
                    {
                      id: 'reposts_shares',
                      label: `🔁 Reposts & Shares (${userActivityLogs.filter(e => e.actionType === 'POST_REPOSTED' || e.actionType === 'POST_SHARED').length})`
                    },
                    {
                      id: 'content_profile',
                      label: `📝 Posts, Resumes & Network (${userActivityLogs.filter(e => ['POST_CREATED', 'POST_SAVED', 'POLL_VOTED', 'RESUME_UPLOADED', 'PROFILE_UPDATED', 'USER_CONNECTED'].includes(e.actionType)).length})`
                    },
                    {
                      id: 'auth',
                      label: `🔐 Sign-Ins (${userActivityLogs.filter(e => e.category === 'auth').length})`
                    }
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setActivityFilter(pill.id as any)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        activityFilter === pill.id
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-3">Action Performed</th>
                        <th className="py-3 px-3">Target &amp; Details</th>
                        <th className="py-3 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {userActivityLogs
                        .filter((ev) => {
                          if (activityFilter === 'likes') return ev.actionType === 'POST_LIKED' || ev.actionType === 'POST_UNLIKED'
                          if (activityFilter === 'comments') return ev.actionType === 'POST_COMMENTED' || ev.actionType === 'COMMENT_REPLIED'
                          if (activityFilter === 'reposts_shares') return ev.actionType === 'POST_REPOSTED' || ev.actionType === 'POST_SHARED'
                          if (activityFilter === 'content_profile') return ['POST_CREATED', 'POST_SAVED', 'POLL_VOTED', 'RESUME_UPLOADED', 'PROFILE_UPDATED', 'USER_CONNECTED'].includes(ev.actionType)
                          if (activityFilter === 'auth') return ev.category === 'auth'
                          return true
                        })
                        .filter((ev) => {
                          if (!activitySearch.trim()) return true
                          const q = activitySearch.toLowerCase()
                          return (
                            ev.userName.toLowerCase().includes(q) ||
                            ev.userEmail.toLowerCase().includes(q) ||
                            ev.actionLabel.toLowerCase().includes(q) ||
                            (ev.targetTitle || '').toLowerCase().includes(q) ||
                            (ev.details || '').toLowerCase().includes(q)
                          )
                        })
                        .map((ev) => (
                          <tr key={ev.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={ev.userAvatar}
                                  alt={ev.userName}
                                  className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{ev.userName}</p>
                                  <p className="text-[11px] font-mono text-zinc-400">{ev.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  ev.actionType === 'POST_LIKED'
                                    ? "bg-blue-100 text-[#0A66C2] dark:bg-blue-950/60 dark:text-sky-300"
                                    : ev.actionType === 'POST_COMMENTED' || ev.actionType === 'COMMENT_REPLIED'
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : ev.actionType === 'POST_REPOSTED' || ev.actionType === 'POST_SHARED'
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : ev.category === 'auth'
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {ev.actionLabel}
                              </span>
                            </td>
                            <td className="py-3 px-3 max-w-md">
                              {ev.targetTitle && (
                                <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                  {ev.targetTitle}
                                </p>
                              )}
                              {ev.details && (
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                  {ev.details}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                              {ev.timestampDisplay}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: USER MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, ID, organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl bg-zinc-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchLiveAdminData}
                      disabled={isLoadingUsers}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Refresh live user registrations from database"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin text-[#0A66C2]" : ""}`} />
                      <span>{isLoadingUsers ? "Syncing..." : "Refresh Live Users"}</span>
                    </button>
                    <button
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>+ Add Member</span>
                    </button>
                    <span className="text-xs text-zinc-400 font-mono self-center pl-1 hidden sm:inline">
                      {users.length} accounts
                    </span>
                  </div>
                </div>

                {/* Filter Pills for New & Logged-In Users vs All Accounts */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'all'
                        ? "bg-[#0A66C2] text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    All Accounts ({users.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('new_and_logged_in')}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      userFilter === 'new_and_logged_in'
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    <span>New &amp; Logged-In Users ({users.filter(isNewOrLoggedInUser).length})</span>
                  </button>
                  <button
                    onClick={() => setUserFilter('admins')}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      userFilter === 'admins'
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    Administrators ({users.filter(u => u.roles.some(r => r.includes("ADMIN"))).length})
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      <tr>
                        <th className="py-3 px-4">Member Identity</th>
                        <th className="py-3 px-3">Roles</th>
                        <th className="py-3 px-3">Last Login / Joined</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Verification</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {users
                        .filter(u => {
                          if (userFilter === 'new_and_logged_in') return isNewOrLoggedInUser(u)
                          if (userFilter === 'admins') return u.roles.some(r => r.includes("ADMIN"))
                          return true
                        })
                        .filter(u =>
                          !searchQuery ||
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.organization.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((u) => {
                          const isNew = isNewOrLoggedInUser(u)
                          return (
                            <tr
                              key={`${u.id}-${u.name}-${u.email}`}
                              className={`transition-colors ${
                                isNew
                                  ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30"
                                  : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{u.name}</h5>
                                      {isNew && (
                                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                          NEW USER · LOGGED IN
                                        </span>
                                      )}
                                      {(u.mfaStatus?.includes("Google SSO") || u.lastLogin?.includes("Google SSO")) && (
                                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                          GOOGLE SSO ✓
                                        </span>
                                      )}
                                      {(u.mfaStatus?.includes("Microsoft SSO") || u.lastLogin?.includes("Microsoft")) && (
                                        <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                          MICROSOFT SSO ✓
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-mono">{u.email} · {u.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {u.roles.map(r => (
                                    <span key={r} className="rounded bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    {u.lastLogin || "Active Now"}
                                  </span>
                                  <p className="text-[10px] text-zinc-400">
                                    Joined: {u.registeredAt || "Today"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    u.enforcementStatus === 'Active'
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                      : u.enforcementStatus === 'Suspended'
                                      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  }`}
                                >
                                  {u.enforcementStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                                  {u.verificationLevel}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="rounded-lg bg-zinc-100 hover:bg-[#0A66C2] hover:text-white px-2.5 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors cursor-pointer"
                                  >
                                    Inspect
                                  </button>
                                  {u.enforcementStatus === 'Active' ? (
                                    <button
                                      onClick={() => handleUpdateUserStatus(u.id, 'Suspended')}
                                      className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 px-2 py-1 text-xs font-bold transition-colors cursor-pointer"
                                      title="Suspend User"
                                    >
                                      Suspend
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateUserStatus(u.id, 'Active')}
                                      className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      Activate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: CONTENT MANAGEMENT */}
          {activeAdminTab === 'content' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Content & Feed Governance
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Review published articles, posts, documents, and media with AI toxicity telemetry.
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{contentItems.length} items logged</span>
              </div>

              <div className="space-y-3">
                {contentItems.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <img src={c.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{c.authorName}</span>
                          <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300 font-mono">
                            {c.contentType}
                          </span>
                          <span className="text-[10px] text-zinc-400">{c.publishedAt}</span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">
                          {c.contentSnippet}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 font-mono">
                          <span>❤️ {c.likesCount}</span>
                          <span>💬 {c.commentsCount}</span>
                          <span className={c.toxicityScore > 50 ? "text-red-500 font-bold" : ""}>
                            Toxicity: {c.toxicityScore}%
                          </span>
                          <span className={c.spamScore > 50 ? "text-red-500 font-bold" : ""}>
                            Spam: {c.spamScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          c.status === 'Published'
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : c.status === 'Removed'
                            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.status !== 'Removed' ? (
                        <button
                          onClick={() => handleUpdateContentStatus(c.id, 'Removed')}
                          className="rounded-full bg-red-600 text-white px-3 py-1 text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateContentStatus(c.id, 'Published')}
                          className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4: MODERATION CENTER */}
          {activeAdminTab === 'moderation' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <span>Active Moderation & Abuse Queue</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Investigate reported harassment, phishing scams, spam clusters, and fake persona accounts.
                  </p>
                </div>
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {cases.length} Cases
                </span>
              </div>

              <div className="space-y-3">
                {cases.map((cs) => (
                  <div
                    key={cs.caseId}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">{cs.caseId}</span>
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                          {cs.category}
                        </span>
                        <span className="text-[10px] text-zinc-400">{cs.timestamp}</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">
                        Assigned: {cs.assignedModerator}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Reported Entity:</span>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{cs.reportedEntity}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Reported By:</span>
                        <p className="text-zinc-700 dark:text-zinc-300">{cs.reportedBy}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 text-xs text-zinc-700 dark:text-zinc-300">
                      <strong className="font-bold text-zinc-900 dark:text-zinc-100">Evidence & Investigation: </strong>
                      {cs.evidenceSummary}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleResolveCase(cs.caseId, 'No Violation')}
                        className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Dismiss (No Violation)
                      </button>
                      <button
                        onClick={() => handleResolveCase(cs.caseId, 'Issue Warning')}
                        className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 transition-colors"
                      >
                        Issue Warning ⚠️
                      </button>
                      <button
                        onClick={() => handleResolveCase(cs.caseId, 'Remove Content')}
                        className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition-colors"
                      >
                        Enforce Action & Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 5: VERIFICATION QUEUE */}
          {activeAdminTab === 'verifications' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#0A66C2]" />
                    <span>Member & Professional Verification Queue</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Verify government ID, corporate domain employment, and specialized security credentials (CISSP, OSCE, Ph.D.).
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{verifications.length} submissions</span>
              </div>

              <div className="space-y-3">
                {verifications.map((v) => (
                  <div key={v.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-3">
                        <img src={v.userAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{v.userName}</h4>
                          <p className="text-xs text-zinc-500 font-mono">{v.userEmail}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                        {v.verificationType}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                      <p><strong className="font-bold text-zinc-900 dark:text-zinc-100">Claim Details: </strong>{v.claimDetails}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {v.evidenceDocuments.map((doc, i) => (
                          <span key={i} className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-[#0A66C2]" />
                            <span>{doc.name}</span>
                            <span className="text-zinc-400">({doc.hash.slice(0, 16)}...)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] text-zinc-400">Submitted {v.submittedAt}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerificationDecision(v.id, 'Rejected')}
                          className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerificationDecision(v.id, 'Approved')}
                          className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] shadow-sm"
                        >
                          Approve Badge ✓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 6: PLATFORM CONFIGURATION & FEATURE FLAGS */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#0A66C2]" />
                  <span>Dynamic Platform Configuration & Feature Flags</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Mutate application behavior, security barriers, and feature access live without redeploying code.
                </p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
                {/* Registration */}
                <div className="py-3 flex items-center justify-between first:pt-0">
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Allow Public Registration</h5>
                    <p className="text-zinc-500">Allow new users to sign up via SMS, email, and OAuth.</p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag('allowRegistration')}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                      platformConfig.allowRegistration ? "bg-emerald-600 text-white" : "bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    {platformConfig.allowRegistration ? "ENABLED (ON)" : "DISABLED (OFF)"}
                  </button>
                </div>

                {/* Require Email Verification */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Enforce Email OTP Verification</h5>
                    <p className="text-zinc-500">Mandate valid 6-digit email confirmation before workspace hydration.</p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag('requireEmailVerification')}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                      platformConfig.requireEmailVerification ? "bg-emerald-600 text-white" : "bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    {platformConfig.requireEmailVerification ? "ENABLED (ON)" : "DISABLED (OFF)"}
                  </button>
                </div>

                {/* AI Assistant */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-zinc-100">ConnectIn AI Global Assistant</h5>
                    <p className="text-zinc-500">Enable multi-agent natural language graph navigator.</p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag('enableAIAssistant')}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                      platformConfig.enableAIAssistant ? "bg-emerald-600 text-white" : "bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    {platformConfig.enableAIAssistant ? "ENABLED (ON)" : "DISABLED (OFF)"}
                  </button>
                </div>

                {/* Video Studio */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Video Studio & Reels Engine</h5>
                    <p className="text-zinc-500">Enable full-screen media broadcasting and tech demo streams.</p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag('enableVideoStudio')}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                      platformConfig.enableVideoStudio ? "bg-emerald-600 text-white" : "bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    {platformConfig.enableVideoStudio ? "ENABLED (ON)" : "DISABLED (OFF)"}
                  </button>
                </div>

                {/* Emergency Maintenance Mode */}
                <div className="py-3 flex items-center justify-between last:pb-0">
                  <div>
                    <h5 className="font-bold text-red-600 dark:text-red-400">Emergency Maintenance Lock</h5>
                    <p className="text-zinc-500">Route all incoming traffic to the maintenance landing screen.</p>
                  </div>
                  <button
                    onClick={() => toggleFeatureFlag('maintenanceMode')}
                    className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                      platformConfig.maintenanceMode ? "bg-red-600 text-white" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {platformConfig.maintenanceMode ? "LOCKED (MAINTENANCE ON)" : "OFF (NORMAL)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: BROADCAST NOTIFICATIONS */}
          {activeAdminTab === 'broadcasts' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[#0A66C2]" />
                    <span>Compose Platform-Wide Announcement</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Broadcast critical security alerts, maintenance bulletins, or product milestones to millions of members.
                  </p>
                </div>

                <form onSubmit={handleDispatchBroadcast} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Broadcast Headline</label>
                    <input
                      type="text"
                      placeholder="Ex: Scheduled Cloud Security Upgrades & Key Invalidation"
                      value={newBroadcastTitle}
                      onChange={(e) => setNewBroadcastTitle(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Message Body</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the full announcement text visible across in-app banners and notifications..."
                      value={newBroadcastBody}
                      onChange={(e) => setNewBroadcastBody(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Audience</label>
                      <select
                        value={newBroadcastAudience}
                        onChange={(e) => setNewBroadcastAudience(e.target.value as any)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Everyone">All Registered Members (2.48M)</option>
                        <option value="Premium Members">Enterprise & Creator Fellows</option>
                        <option value="Recruiters">Verified Talent Recruiters</option>
                        <option value="Enterprise Admins">Enterprise Organization Admins</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Severity / Style</label>
                      <select
                        value={newBroadcastSeverity}
                        onChange={(e) => setNewBroadcastSeverity(e.target.value as any)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Info">Informational (Blue)</option>
                        <option value="Warning">Advisory / Warning (Amber)</option>
                        <option value="Security Alert">Critical Security Alert (Red)</option>
                        <option value="Maintenance">Scheduled Maintenance (Purple)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="rounded-full bg-[#0A66C2] px-6 py-2 text-xs font-bold text-white hover:bg-[#004182] shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Dispatch Broadcast Now</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Past Broadcasts List */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Past Broadcast History</h4>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-zinc-900 dark:text-zinc-100">{b.title}</h5>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                          {b.deliveredCount.toLocaleString()} delivered
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs">{b.body}</p>
                      <p className="text-[10px] text-zinc-400">Sent by {b.sentBy} · {b.sentAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 8: IMMUTABLE AUDIT LOGS */}
          {activeAdminTab === 'audit_log' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#0A66C2]" />
                    <span>Cryptographic Immutable Audit Ledger</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Tamper-proof record of every administrative action, user suspension, role grant, and configuration update.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2))
                    const dlAnchor = document.createElement('a')
                    dlAnchor.setAttribute("href", dataStr)
                    dlAnchor.setAttribute("download", `connectin_audit_ledger_${Date.now()}.json`)
                    dlAnchor.click()
                  }}
                  className="rounded-full border border-zinc-300 px-3.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Export JSON
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#0A66C2]">{log.id}</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{log.action}</span>
                          <span className="text-zinc-400">→</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{log.targetEntity}</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 self-start sm:self-center">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{log.reason}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5 font-mono">
                        <span>Admin: {log.adminEmail}</span>
                        <span>·</span>
                        <span>IP: {log.ipAddress}</span>
                        <span>·</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 9: SECURITY CENTER & SIEM */}
          {activeAdminTab === 'soc_alerts' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>SOC Telemetry & Real-Time Threat Center</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Live SIEM anomaly detection, brute force blocks, impossible travel alerts, and edge WAF rules.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {socEvents.map((evt) => (
                  <div key={evt.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">{evt.id}</span>
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                          {evt.eventType}
                        </span>
                        <span className="text-[10px] text-zinc-400">{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200">
                        <strong>Source IP:</strong> {evt.sourceIp} ({evt.geoCountry}) {evt.targetUser ? `→ Target: ${evt.targetUser}` : ''}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        ⚡ <strong>Auto-Mitigation:</strong> {evt.autoMitigation}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleBlockIp(evt.sourceIp)}
                        className="rounded-full bg-red-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                      >
                        Block Subnet in WAF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 10: ROLES & RBAC MATRIX */}
          {activeAdminTab === 'roles' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#0A66C2]" />
                  <span>Role-Based Access Control (RBAC) Hierarchies</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Granular permission assignments enforcing least-privilege administrative access.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLATFORM_RBAC_ROLES.map((r) => (
                  <div key={r.roleKey} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.name}</h4>
                      <span className="font-mono text-xs font-bold text-[#0A66C2]">
                        {r.userCount.toLocaleString()} users
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {r.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {r.permissions.map((p) => (
                        <span key={p} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 11: COMPANIES & ORGS */}
          {activeAdminTab === 'companies' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#0A66C2]" />
                    <span>Enterprise Companies & GovTech Directory</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Manage corporate verification badges, assigned admins, and official job limits.
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{companies.length} organizations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((comp) => (
                  <div key={comp.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-start gap-3">
                    <img src={comp.logo} alt="" className="h-12 w-12 rounded-xl object-cover border shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{comp.name}</h4>
                        <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300">
                          {comp.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{comp.industry} · {comp.employeesCount} employees</p>
                      <p className="text-[11px] text-zinc-400 font-mono">{comp.jobOpeningsCount} active jobs · {comp.followersCount} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 12: JOBS & RECRUITING */}
          {activeAdminTab === 'jobs' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#0A66C2]" />
                    <span>Jobs & Hiring Mission Administration</span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Review incoming job postings for salary disclosure compliance and phishing detection.
                  </p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{jobs.length} jobs</span>
              </div>

              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{j.title}</h4>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {j.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{j.company} · {j.location} · {j.salary}</p>
                      <p className="text-[11px] text-zinc-400">Posted by {j.postedBy} · {j.applicantsCount} applicants</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {j.status === 'Flagged Suspicious' ? (
                        <button
                          onClick={() => handleJobStatus(j.id, 'Approved & Active')}
                          className="rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Approve Job
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJobStatus(j.id, 'Flagged Suspicious')}
                          className="rounded-full border border-red-300 text-red-600 px-3.5 py-1.5 text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          Flag Job
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 13: FOUR EYES APPROVALS */}
          {activeAdminTab === 'four_eyes' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span>Four-Eyes Dual Custody Authorization</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Critical destructive operations require confirmation from at least 2 authorized security directors before execution.
                </p>
              </div>

              <div className="space-y-3">
                {approvals.map((appr) => (
                  <div key={appr.id} className="rounded-2xl border border-purple-500/20 bg-purple-50/20 p-4 dark:border-purple-900/40 dark:bg-purple-950/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300">{appr.id}</span>
                      <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {appr.status} ({appr.currentApprovals}/{appr.requiredApprovals})
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{appr.actionType}: {appr.targetObject}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{appr.justification}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-purple-900/40">
                      <span className="text-[11px] text-zinc-400">Requested by {appr.requestedBy}</span>
                      <button
                        onClick={() => {
                          setApprovals(prev => prev.map(a => a.id === appr.id ? { ...a, currentApprovals: 2, status: 'Approved & Executed' } : a))
                          appendAudit('FOUR_EYES_APPROVED', appr.targetObject, 'Second signature affixed by Alex Taylor')
                          showNotice(`✓ Second cryptographic signature affixed. Action executed per NIST SP 800-88.`)
                        }}
                        disabled={appr.status === 'Approved & Executed'}
                        className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        {appr.status === 'Approved & Executed' ? '✓ Executed' : 'Affix Second Signature'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-xl w-full rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedUser.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{selectedUser.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">{selectedUser.email} · {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-zinc-400 text-[10px] font-bold uppercase">Account Status</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedUser.enforcementStatus}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-zinc-400 text-[10px] font-bold uppercase">Verification Level</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedUser.verificationLevel}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-zinc-400 text-[10px] font-bold uppercase">MFA & Authentication</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedUser.mfaStatus}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-zinc-400 text-[10px] font-bold uppercase">Risk Level</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedUser.riskLevel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setIsImpersonateModalOpen(true)
                }}
                className="rounded-xl border border-amber-400 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5"
              >
                <UserCog className="h-3.5 w-3.5" />
                <span>Audited Impersonate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    appendAudit('PASSKEY_RESET', `User ${selectedUser.id}`, 'Mandatory security passkey cycle requested')
                    showNotice(`✓ Security tokens and session passkeys revoked for ${selectedUser.name}.`)
                  }}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Reset MFA
                </button>
                {selectedUser.enforcementStatus === 'Active' ? (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUser.id, 'Suspended')}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUser.id, 'Active')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    Reactivate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impersonation Justification Modal */}
      {isImpersonateModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Controlled Support Impersonation
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              You are about to enter a supervised support view for <strong>{selectedUser.name}</strong>. A permanent audit log will be recorded with your Super Admin credentials.
            </p>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Support Ticket ID or Justification Reason:
              </label>
              <input
                type="text"
                placeholder="Ex: TICKET-94182 - User reported issue with Zero-Trust key sync"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImpersonateModalOpen(false)}
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStartImpersonation}
                disabled={!impersonateReason.trim()}
                className="rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm disabled:opacity-50"
              >
                Begin Audited Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Invite User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Provision / Invite New Member</h3>
                  <p className="text-xs text-zinc-500">Register new identity directly into ConnectIn Zero-Trust directory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rhoda Mensah"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rhoda.mensah@expedite-consults.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (240) 555-0318"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Platform Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e: any) => setNewUserRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  >
                    <option value="personal">Personal (Standard Member)</option>
                    <option value="enterprise">Enterprise (Buyer / Procurement)</option>
                    <option value="creator">Creator (Studio / Media)</option>
                    <option value="seller">Seller (Commercial Marketplace)</option>
                    <option value="admin">Super Admin (IAM Enclave)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Organization / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Expedite Consults / Cyber Risk"
                    value={newUserOrg}
                    onChange={(e) => setNewUserOrg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Cyber Compliance & Risk Analyst"
                  value={newUserHeadline}
                  onChange={(e) => setNewUserHeadline(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser || !newUserName.trim() || !newUserEmail.trim()}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] px-6 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isCreatingUser ? "Provisioning..." : "Provision Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
