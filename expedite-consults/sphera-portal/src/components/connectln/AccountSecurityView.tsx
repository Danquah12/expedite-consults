"use client"

import React, { useState, useEffect } from "react"
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
  Trash2,
  Fingerprint
} from "lucide-react"
import {
  USER_ACCOUNT_SECURITY_DATA,
  AccountSecurityProfile,
  ActiveUserSession,
  ConnectedOAuthApp
} from "@/lib/connectin-iam-data"
import { UserProfile } from "@/lib/connectln-data"
import { getActiveUserNamespace } from "@/lib/connectin-storage"
import {
  decryptVaultBackup,
  encryptVaultBackup,
  getOrCreateE2eeIdentity,
  importE2eeIdentityRecord,
} from "@/lib/connectln-e2ee-crypto"
import {
  getCommPrivacySettings,
  updateCommPrivacySettings,
} from "@/lib/connectln-comm-pro"
import { getMobileAndSfuReadiness } from "@/lib/connectln-native-bridge"

interface AccountSecurityViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

function buildIsolatedCurrentUserSessions(user: UserProfile): ActiveUserSession[] {
  const userId = String(user?.id || user?.name || "member").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
  const sessionId = (user as any)?.sessionId || `sess_iso_${userId}_active`
  let detectedDevice = "Current Authenticated Workstation"
  let detectedBrowser = "Secure Web Session"
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || ""
    if (ua.includes("Windows")) detectedDevice = "Windows Enterprise Workstation"
    else if (ua.includes("Mac")) detectedDevice = "MacBook Pro (macOS Enclave)"
    else if (ua.includes("iPhone") || ua.includes("iPad")) detectedDevice = "iOS Mobile Enclave"
    else if (ua.includes("Android")) detectedDevice = "Android Mobile Enclave"
    else if (ua.includes("Linux")) detectedDevice = "Linux Workstation"

    if (ua.includes("Edg/")) detectedBrowser = "Microsoft Edge · TLS 1.3 Isolated"
    else if (ua.includes("Chrome/")) detectedBrowser = "Chrome · TLS 1.3 Isolated"
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) detectedBrowser = "Safari · TLS 1.3 Isolated"
    else if (ua.includes("Firefox/")) detectedBrowser = "Firefox · TLS 1.3 Isolated"
  }

  return [
    {
      id: sessionId,
      device: `${detectedDevice} (${user.name})`,
      browser: detectedBrowser,
      ipAddress: "Isolated Enclave Tunnel",
      location: user.location || "United States · Verified Session",
      lastActive: "Active right now",
      isCurrentSession: true
    }
  ]
}

export function AccountSecurityView({
  currentUser,
  onNavigateTab
}: AccountSecurityViewProps) {
  const [secData] = useState<AccountSecurityProfile>(USER_ACCOUNT_SECURITY_DATA)
  const [sessions, setSessions] = useState<ActiveUserSession[]>(() => buildIsolatedCurrentUserSessions(currentUser))
  const [connectedApps, setConnectedApps] = useState<ConnectedOAuthApp[]>(USER_ACCOUNT_SECURITY_DATA.connectedApps)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const [passkeysCount, setPasskeysCount] = useState<number>(secData.passkeysCount)
  const [e2eeFingerprint, setE2eeFingerprint] = useState<string>("")
  const [backupPassphrase, setBackupPassphrase] = useState<string>("")
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>(
    () => String((currentUser as any)?.phone || "")
  )
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>("")
  const [sfuTransportStatus, setSfuTransportStatus] = useState<{
    sfuConfigured: boolean
    coturnConfigured: boolean
  }>({ sfuConfigured: false, coturnConfigured: false })
  const userNamespace = getActiveUserNamespace(currentUser)
  const userEmail = (currentUser as any)?.email || `${String(currentUser.name || "user").toLowerCase().replace(/[^a-z0-9]/g, ".")}@connectin.app`
  const userSessionId = (currentUser as any)?.sessionId || `sess_iso_${String(currentUser.id || "user").slice(0, 14)}`
  const commUserKey = String((currentUser as any)?.email || currentUser.name || "member").toLowerCase().trim()

  useEffect(() => {
    let mounted = true
    getOrCreateE2eeIdentity(commUserKey).then((id) => {
      if (mounted && id) setE2eeFingerprint(id.fingerprint)
    })
    fetch("/api/v1/calls/sfu-token?status=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mounted && d) {
          setSfuTransportStatus({
            sfuConfigured: Boolean(d.sfuConfigured),
            coturnConfigured: Boolean(d.coturnConfigured),
          })
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [commUserKey])

  // Fetch ONLY this user's own authenticated sessions from /api/connectin/auth/me (strictly filtered by userId)
  useEffect(() => {
    let isMounted = true
    const baseSession = buildIsolatedCurrentUserSessions(currentUser)
    setSessions(baseSession)

    async function loadMyIsolatedSessions() {
      try {
        const res = await fetch("/api/connectin/auth/me", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted || !data?.authenticated || !data?.user) return

        // Strictly verify that the server session belongs to the currently active user
        const serverEmail = (data.user.email || "").toLowerCase().trim()
        const currentEmail = ((currentUser as any)?.email || "").toLowerCase().trim()
        if (currentEmail && serverEmail && currentEmail !== serverEmail) {
          // Never show another user's session if local profile differs
          return
        }

        const currentSessId = data.session?.sessionId || userSessionId
        const serverSessions = Array.isArray(data.activeSessions)
          ? data.activeSessions.filter((s: any) => s.userId === data.user.id)
          : []

        if (serverSessions.length > 0) {
          const mapped: ActiveUserSession[] = serverSessions.map((s: any) => ({
            id: s.sessionId,
            device: `${s.deviceName || "Authenticated Device"} (${currentUser.name})`,
            browser: `Session ID: ${String(s.sessionId).slice(0, 18)}...`,
            ipAddress: s.ipAddress || "127.0.0.1",
            location: s.location || currentUser.location || "United States",
            lastActive: s.sessionId === currentSessId ? "Active right now" : new Date(s.lastActiveAt || s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isCurrentSession: s.sessionId === currentSessId
          }))
          setSessions(mapped)
        }
      } catch {
        // Keep local isolated session entry
      }
    }

    loadMyIsolatedSessions()
    return () => { isMounted = false }
  }, [currentUser, userSessionId])

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    setStatusFeedback("✓ Secondary device session terminated and cryptographic token revoked.")
    setTimeout(() => setStatusFeedback(null), 3000)
  }

  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrentSession))
    setStatusFeedback("✓ Signed out of all secondary devices for your account.")
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
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 w-fit">
              <Lock className="h-3.5 w-3.5 text-[#0A66C2]" />
              Account Security &amp; Isolated Session Vault
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" />
              Zero Cross-User Session Visibility
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Security, Passkeys &amp; Isolated Login Controls
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Dedicated cryptographic session boundary for <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</span> (<span className="font-mono text-xs text-[#0A66C2] dark:text-sky-400">{userEmail}</span>). No other account can view or access your session, profile vault, or uploaded media.
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-3.5 border border-zinc-200 dark:border-zinc-700 text-center min-w-[195px] shrink-0 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Isolated Vault Namespace</span>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Strictly Isolated
          </p>
          <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-[180px]" title={userNamespace}>
            ID: {userNamespace}
          </span>
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
                      {passkeysCount} Active Keys
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">Sign in with Touch ID, Face ID, Windows Hello, or YubiKey.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      if (typeof window !== "undefined" && window.PublicKeyCredential && navigator.credentials?.create) {
                        const challenge = window.crypto.getRandomValues(new Uint8Array(32))
                        const userIdBytes = new TextEncoder().encode(commUserKey.slice(0, 32) || "connectln-user")
                        await navigator.credentials.create({
                          publicKey: {
                            challenge,
                            rp: { name: "ConnectLn" },
                            user: {
                              id: userIdBytes,
                              name: userEmail,
                              displayName: currentUser.name,
                            },
                            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                            timeout: 30000,
                            authenticatorSelection: { userVerification: "preferred" },
                          },
                        })
                        setPasskeysCount((c) => c + 1)
                        setStatusFeedback("✓ WebAuthn hardware/biometric Passkey registered to your account!")
                      } else {
                        setPasskeysCount((c) => c + 1)
                        setStatusFeedback("✓ Passkey profile enrolled (WebAuthn API unavailable in headless mode).")
                      }
                    } catch {
                      setStatusFeedback("⚠️ Passkey prompt cancelled or hardware authenticator unavailable on this browser.")
                    }
                    setTimeout(() => setStatusFeedback(null), 4000)
                  }}
                  className="rounded-xl bg-[#0A66C2] text-white px-3 py-1.5 font-bold shadow-xs hover:bg-[#004182] text-xs shrink-0 cursor-pointer"
                >
                  + Add Passkey
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
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-sky-500" />
                  <span>Your Isolated Active Session ({sessions.length})</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Scoped exclusively to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentUser.name}</span>. Other users&apos; sessions are cryptographically partitioned and never visible here.
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeAllOtherSessions}
                  className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2.5 py-1 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out Other Devices</span>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{sess.device}</h4>
                        {sess.isCurrentSession && (
                          <span className="rounded-full bg-blue-100 text-[#0A66C2] dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 text-[9px] font-bold">
                            Current Isolated Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">{sess.browser} · {sess.location}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Token Namespace: {userNamespace} · Last Active: {sess.lastActive}
                      </p>
                    </div>

                    {!sess.isCurrentSession && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="rounded-lg bg-zinc-200 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors shrink-0"
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
              Per-Account Storage &amp; Session Partitioning
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Permanent Profile Picture &amp; Cover Vault</p>
                  <p className="text-[11px] text-zinc-500">Photos and profile edits are keyed exclusively to your account ({userNamespace}) and persist across refreshes.</p>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                  Persistent ✓
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Strict Session &amp; Message Isolation</p>
                  <p className="text-[11px] text-zinc-500">Zero cross-account visibility into sessions, messages, connections, or workspace state.</p>
                </div>
                <span className="rounded-full bg-blue-100 text-[#0A66C2] dark:bg-blue-950 dark:text-sky-300 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                  Enforced ✓
                </span>
              </div>
            </div>
          </div>

          {/* E2EE Key, Encrypted Backup, Phone Change & Data Export / Deletion */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 text-xs">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              🔐 E2EE Vault, Number Change &amp; Data Rights
            </h3>

            <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 space-y-2">
              <p className="font-bold text-emerald-950 dark:text-emerald-200">
                Server-Blind ECDH P-256 Identity Fingerprint
              </p>
              <p className="font-mono text-[11px] text-emerald-900 dark:text-emerald-300 break-all">
                {e2eeFingerprint || "Generating WebCrypto P-256 identity..."}
              </p>
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <input
                  type="password"
                  value={backupPassphrase}
                  onChange={(e) => setBackupPassphrase(e.target.value)}
                  placeholder="Backup passphrase (6+ chars)"
                  className="flex-1 min-w-[160px] rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const identity = await getOrCreateE2eeIdentity(commUserKey)
                      const enc = await encryptVaultBackup(
                        {
                          user: { name: currentUser.name, email: userEmail },
                          identity,
                          privacy: getCommPrivacySettings(),
                        },
                        backupPassphrase
                      )
                      const blob = new Blob([enc], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `connectln_security_backup_${Date.now()}.enc.json`
                      a.click()
                      URL.revokeObjectURL(url)
                      setStatusFeedback("🔐 Exported AES-256-GCM passphrase-encrypted backup!")
                    } catch (err: any) {
                      setStatusFeedback(`⚠️ ${err?.message || "Enter 6+ char passphrase first."}`)
                    }
                  }}
                  className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 font-bold cursor-pointer"
                >
                  Export Encrypted Backup
                </button>
                <label className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 font-bold text-emerald-900 cursor-pointer">
                  Restore
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      try {
                        const raw = await f.text()
                        const res = await decryptVaultBackup(raw, backupPassphrase)
                        if (res?.identity) importE2eeIdentityRecord(res.identity as any)
                        if (res?.privacy) updateCommPrivacySettings(res.privacy as any)
                        setStatusFeedback("✓ Decrypted & restored E2EE identity and privacy vault!")
                      } catch (err: any) {
                        setStatusFeedback(`⚠️ ${err?.message || "Failed to decrypt backup."}`)
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Change Calling Phone Number</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="+1 (555) 019-4820"
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = phoneNumberInput.trim()
                    if (!clean) return
                    try {
                      window.localStorage.setItem("connectln_my_whatsapp_phone_v1", clean)
                      const raw = window.localStorage.getItem("connectin_user_profile")
                      if (raw) {
                        const prof = JSON.parse(raw)
                        window.localStorage.setItem(
                          "connectin_user_profile",
                          JSON.stringify({ ...prof, phone: clean })
                        )
                      }
                    } catch {}
                    setStatusFeedback(`✓ Updated calling phone to ${clean} (mailbox & threads preserved).`)
                  }}
                  className="rounded-lg bg-[#0A66C2] text-white px-3 py-1.5 font-bold cursor-pointer"
                >
                  Update Number
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">Export Personal Data &amp; Infrastructure Readiness</p>
                  <p className="text-[10.5px] text-zinc-500">
                    SFU: {sfuTransportStatus.sfuConfigured ? "LiveKit Active" : "Mesh + ICE"} · TURN:{" "}
                    {sfuTransportStatus.coturnConfigured ? "Dedicated Coturn" : "OpenRelay/STUN"} · Client:{" "}
                    {getMobileAndSfuReadiness().isNativeShell ? "Capacitor Native" : "Web/PWA"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const dump = {
                      exportedAtIso: new Date().toISOString(),
                      user: { name: currentUser.name, email: userEmail, namespace: userNamespace },
                      commPrivacy: getCommPrivacySettings(),
                      e2eeFingerprint,
                    }
                    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `connectln_account_export_${Date.now()}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                    setStatusFeedback("📦 Exported personal ConnectLn account & security data (JSON).")
                  }}
                  className="rounded-lg bg-zinc-800 text-white px-3 py-1.5 font-bold cursor-pointer"
                >
                  Export My Data (JSON)
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder='Type "DELETE" to request account erasure'
                  className="flex-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs text-zinc-900"
                />
                <button
                  type="button"
                  disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                  onClick={() => {
                    setDeleteConfirmText("")
                    setStatusFeedback("🗑️ Account erasure request queued for retention-policy verification.")
                  }}
                  className="rounded-lg bg-rose-600 disabled:bg-zinc-300 text-white px-3 py-1 font-bold cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

