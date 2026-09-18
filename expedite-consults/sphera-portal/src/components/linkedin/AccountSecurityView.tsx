"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Key,
  Smartphone,
  Laptop,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Trash2
} from "lucide-react"
import {
  USER_ACCOUNT_SECURITY_DATA,
  AccountSecurityProfile,
  ActiveUserSession,
  ConnectedOAuthApp
} from "@/lib/connectin-iam-data"
import { UserProfile } from "@/lib/linkedin-data"

interface AccountSecurityViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function AccountSecurityView({
  currentUser,
  onNavigateTab
}: AccountSecurityViewProps) {
  const [secData, setSecData] = useState<AccountSecurityProfile>(USER_ACCOUNT_SECURITY_DATA)
  const [sessions, setSessions] = useState<ActiveUserSession[]>(USER_ACCOUNT_SECURITY_DATA.activeSessions)
  const [connectedApps, setConnectedApps] = useState<ConnectedOAuthApp[]>(USER_ACCOUNT_SECURITY_DATA.connectedApps)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false)
  const [appealReason, setAppealReason] = useState("")

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    setStatusFeedback("✓ Session terminated and authentication token revoked.")
    setTimeout(() => setStatusFeedback(null), 3000)
  }

  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrentSession))
    setStatusFeedback("✓ Signed out of all 2 remote devices and secondary sessions.")
    setTimeout(() => setStatusFeedback(null), 3000)
  }

  const handleRevokeApp = (appId: string) => {
    setConnectedApps(prev => prev.filter(a => a.id !== appId))
    setStatusFeedback("✓ OAuth 2.0 grant revoked. Application no longer has token access.")
    setTimeout(() => setStatusFeedback(null), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Top Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/40 flex items-center gap-1.5 w-fit">
            <Lock className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Identity &amp; Account Security Center
          </span>
          <h1 className="text-2xl font-black text-white">
            Security, Passkeys &amp; Privacy Controls
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
            Manage your cryptographic passkeys, active multi-device sessions, OAuth application grants, and account standing.
          </p>
        </div>

        <div className="rounded-2xl bg-black/40 p-3.5 border border-white/15 text-center min-w-[170px] shrink-0 space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Account Standing</span>
          <p className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> 🟢 Good Standing
          </p>
          <span className="text-[10px] text-zinc-400 font-mono">Risk Score: {secData.riskScore}</span>
        </div>
      </div>

      {statusFeedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 animate-in fade-in">
          {statusFeedback}
        </div>
      )}

      {/* 2-COLUMN SECURITY TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authentication Methods & Passkeys (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card 1: Multi-Factor & Passkeys */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Key className="h-4 w-4 text-[#0A66C2]" />
              <span>Authentication &amp; Passwordless Passkeys</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>FIDO2 / WebAuthn Passkeys</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 text-[9px] font-bold">
                      {secData.passkeysCount} Active Keys
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">Sign in with Touch ID, Face ID, Windows Hello, or YubiKey.</p>
                </div>
                <button
                  onClick={() => {
                    setStatusFeedback("✓ Passkey challenge verified. Hardware token registered.")
                    setTimeout(() => setStatusFeedback(null), 3000)
                  }}
                  className="rounded-xl bg-[#0A66C2] text-white px-3 py-1.5 font-bold shadow-xs hover:bg-[#004182] text-xs shrink-0"
                >
                  + Add Key
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Authenticator App (TOTP)</h4>
                  <p className="text-[11px] text-zinc-500">Google Authenticator, 1Password, or YubiKey TOTP generator.</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">Enabled ✓</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Emergency Recovery Codes</h4>
                  <p className="text-[11px] text-zinc-500">{secData.recoveryCodesCount} single-use offline recovery codes remaining.</p>
                </div>
                <button
                  onClick={() => {
                    setStatusFeedback("✓ Downloaded encrypted recovery code bundle.")
                    setTimeout(() => setStatusFeedback(null), 3000)
                  }}
                  className="rounded-lg bg-zinc-100 dark:bg-zinc-700 px-3 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                >
                  Download Codes
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Connected OAuth Apps */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Connected Ecosystem &amp; OAuth 2.0 Grants</span>
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {connectedApps.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{app.name}</h4>
                      <p className="text-[10px] text-zinc-500">Scopes: {app.scope.join(', ')} · Connected {app.connectedDate}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeApp(app.id)}
                    className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Sessions & Real-Time Device Map (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-sky-500" />
                <span>Active Sessions &amp; Device Registry</span>
              </h3>

              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeAllOtherSessions}
                  className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 text-[11px] font-bold transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out All Other Devices</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border transition-all ${
                    sess.isCurrentSession
                      ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{sess.device}</h4>
                        {sess.isCurrentSession && (
                          <span className="rounded-full bg-blue-100 text-[#0A66C2] dark:bg-blue-900 dark:text-blue-200 px-2 py-0.2 text-[9px] font-bold">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">{sess.browser} · {sess.location}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">IP: {sess.ipAddress} · Last Active: {sess.lastActive}</p>
                    </div>

                    {!sess.isCurrentSession && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="rounded-lg bg-zinc-200 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Visibility Settings */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Privacy &amp; Enclave Visibility Controls
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Profile &amp; Clearance Visibility</p>
                  <p className="text-[11px] text-zinc-500">Visible to Verified Cleared Network &amp; Enterprise Buyers only.</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                  Protected ✓
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Inbound Messaging Recruiter Bounties</p>
                  <p className="text-[11px] text-zinc-500">Require $250 escrow deposit for non-connection InMails.</p>
                </div>
                <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-[10px] font-bold">
                  $250 Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
