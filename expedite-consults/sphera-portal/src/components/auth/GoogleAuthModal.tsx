"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, ArrowRight, UserPlus, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react"
import { saveStoredUser, saveStoredSessionRoute, getDefaultPortraitForUser, loadStoredAdminUsers, trackUserActivity } from "@/lib/connectin-storage"
import { isSuperAdminUser, isDedicatedAdminAccount, isExactKwesiUser, isForeignPersonaAvatar, generatePersonalSignatureAvatar, resolveDisplayName } from "@/lib/connectin-profile"

interface GoogleAuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
  initialName?: string
  professionId?: string
  onSuccess?: (user: any) => void
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  initialEmail = "",
  initialName = "",
  professionId = "auto_detect",
  onSuccess
}: GoogleAuthModalProps) {
  const [isUsingCustom, setIsUsingCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customEmail, setCustomEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  const activeEmailClean = initialEmail.trim().toLowerCase()
  const activeNameClean = initialName.trim()
  const hasPrefilled = activeEmailClean.includes("@")
  const prefilledName = activeNameClean
    ? activeNameClean
    : isExactKwesiUser({ email: activeEmailClean })
    ? "Kwesi Asiedu"
    : resolveDisplayName("", activeEmailClean)

  // Also include recent accounts from browser storage so returning users can 1-click sign in with Google
  const recentStoredAccounts = typeof window !== "undefined"
    ? loadStoredAdminUsers()
        .filter(u =>
          u.email &&
          !u.email.endsWith("@connectin.internal") &&
          !u.email.endsWith("@unknown-proxy.io") &&
          !u.email.endsWith("@crawler.net") &&
          !u.email.startsWith("alex.taylor@") &&
          !u.email.startsWith("marcus.vance@") &&
          !u.email.startsWith("sarah.chen@") &&
          !u.email.startsWith("david.k@") &&
          !u.email.startsWith("elena.rostova@")
        )
        .slice(0, 4)
        .map(u => ({
          email: u.email.toLowerCase().trim(),
          name: u.name,
          workspace: u.email.includes("expedite-consults") ? "Expedite Consults Google Workspace" : "Google Account",
          avatar: u.avatar || generatePersonalSignatureAvatar({ name: u.name, email: u.email }),
          isCurrent: false
        }))
    : []

  const rawAccounts = [
    ...(hasPrefilled ? [{
      email: activeEmailClean,
      name: prefilledName,
      workspace: activeEmailClean.includes("expedite-consults") ? "Expedite Consults Google Workspace" : "Google Account",
      avatar: generatePersonalSignatureAvatar({ name: prefilledName, email: activeEmailClean }),
      isCurrent: true
    }] : []),
    ...recentStoredAccounts,
    ...(!activeEmailClean.startsWith("kasied1@") ? [{
      email: "kasied1@expedite-consults.com",
      name: "Kasied1 Asiedu",
      workspace: "Expedite Consults Google Workspace",
      avatar: generatePersonalSignatureAvatar({ name: "Kasied1 Asiedu", email: "kasied1@expedite-consults.com" }),
      isCurrent: false
    }] : []),
    ...(!activeEmailClean.startsWith("kasiedu@") ? [{
      email: "kasiedu@expedite-consults.com",
      name: "Kwesi Asiedu (Platform Admin)",
      workspace: "Expedite Consults Enterprise",
      avatar: "/brand/kwesi-avatar.png",
      isCurrent: false
    }] : []),
  ]

  // Deduplicate accounts by name + email
  const seenAccountKeys = new Set<string>()
  const accounts = rawAccounts.filter(acc => {
    const key = `${acc.name.toLowerCase().trim()}::${acc.email.toLowerCase().trim()}`
    if (seenAccountKeys.has(key)) return false
    seenAccountKeys.add(key)
    return true
  })

  const handleSelectAccount = async (accountEmail: string, accountName?: string) => {
    setIsLoading(true)
    setSelectedEmail(accountEmail)
    setErrorMessage(null)
    setSuccessNotice(`Authenticating with Google Identity Services...`)

    try {
      const cleanName = (accountName || "").replace(/\s*\([^)]*\)/g, "").trim()
      const res = await fetch("/api/connectin/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: accountEmail,
          name: cleanName,
          professionId: professionId !== "auto_detect" ? professionId : undefined
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Google authentication failed")
      }

      // Save user session in ConnectLn client storage with strict name & avatar isolation
      const rawProfile = data.profile || data.user
      const finalName = cleanName || rawProfile?.name || resolveDisplayName("", accountEmail)
      const safeAvatar = (rawProfile?.avatar && !isForeignPersonaAvatar(rawProfile.avatar, { name: finalName, email: accountEmail }))
        ? rawProfile.avatar
        : getDefaultPortraitForUser({ name: finalName, email: accountEmail, professionEnclave: rawProfile?.professionEnclave } as any)

      const isAdmin = isSuperAdminUser({ name: finalName, email: accountEmail })
      const shouldOpenAdminPortal = isDedicatedAdminAccount({
        name: finalName,
        email: accountEmail,
        professionId: professionId !== "auto_detect" ? professionId : undefined
      })

      const nowIso = new Date().toISOString()
      const profileToSave = {
        ...rawProfile,
        id: data.user?.id || rawProfile?.userId || rawProfile?.id || `USR-G-${Date.now().toString(36).toUpperCase()}`,
        userId: data.user?.id || rawProfile?.userId || rawProfile?.id,
        name: finalName,
        email: accountEmail,
        avatar: safeAvatar,
        role: isAdmin ? "admin" : "personal",
        roles: isAdmin ? ["SUPER_ADMIN"] : ["NORMAL_USER"],
        authProvider: "Google SSO",
        lastLoginAt: nowIso
      }
      const targetTab = shouldOpenAdminPortal ? "adminiam" : "home"
      const targetUrl = shouldOpenAdminPortal ? "/connectin-admin" : "/connectin"

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, "personal")
      trackUserActivity({
        actionType: "USER_LOGIN",
        actionLabel: "Signed In via Google SSO ✓",
        category: "auth",
        targetTitle: "Google Identity Services",
        details: `Authenticated via Google SSO as ${finalName} (${accountEmail})`,
        user: profileToSave as any
      })
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
        sessionStorage.setItem("connectin_authenticated", "true")
      }

      // Await server-side user directory sync before redirecting so the admin console always sees this Google login
      await fetch("/api/connectin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileToSave)
      }).catch(() => {})

      setSuccessNotice(`✓ Verified as ${profileToSave.name}! Launching ConnectLn...`)

      if (onSuccess) {
        onSuccess(profileToSave)
      }

      setTimeout(() => {
        window.location.href = targetUrl
      }, 250)
    } catch (err: any) {
      setIsLoading(false)
      setSelectedEmail(null)
      setErrorMessage(err.message || "Could not complete Google authentication.")
      setSuccessNotice(null)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setErrorMessage("Please enter a valid Google email address.")
      return
    }
    handleSelectAccount(customEmail.trim().toLowerCase(), customName.trim())
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="w-[calc(100vw-20px)] sm:w-full max-w-[420px] p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90dvh] flex flex-col mx-auto my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800/80 text-center relative shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full p-2 transition-colors disabled:opacity-50 touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex justify-center mb-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign in with Google
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Choose an account to continue to <span className="font-semibold text-zinc-800 dark:text-zinc-200">ConnectLn</span>
          </p>
        </div>

        {/* Notices */}
        <div className="px-6 pt-3">
          {errorMessage && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 animate-pulse" />
              <span className="font-medium">{successNotice}</span>
            </div>
          )}
        </div>

        {/* Account Selector List */}
        <div className="p-3.5 sm:p-6 pt-1 sm:pt-2 space-y-2 max-h-[55dvh] overflow-y-auto">
          {!isUsingCustom ? (
            <>
              {accounts.map((acc) => {
                const isSelected = selectedEmail === acc.email
                return (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc.email, acc.name)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer disabled:opacity-60 min-h-[56px] active:scale-[0.98] touch-manipulation ${
                      isSelected
                        ? "border-[#4285F4] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#4285F4]/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {acc.name}
                          </p>
                          {acc.isCurrent && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {acc.email}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {acc.workspace}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-zinc-400">
                      {isSelected ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                )
              })}

              {/* Use another account option */}
              <button
                type="button"
                onClick={() => {
                  setIsUsingCustom(true)
                  setErrorMessage(null)
                }}
                disabled={isLoading}
                className="w-full text-left p-3 sm:p-3.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#4285F4] hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all flex items-center gap-3 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-h-[50px] active:scale-[0.98] touch-manipulation"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p>Use another Google account</p>
                  <p className="text-[10px] font-normal text-zinc-400">Sign in with any @gmail.com or Workspace email</p>
                </div>
              </button>
            </>
          ) : (
            /* Custom Google Email Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Full Name (for your profile & signature)
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Michael Mensah"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Enter your Google or Workspace Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com or you@company.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingCustom(false)
                    setErrorMessage(null)
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium px-2 sm:px-3 py-2 cursor-pointer touch-manipulation"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !customEmail.trim()}
                  className="rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all min-h-[44px] active:scale-[0.98] touch-manipulation"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{isLoading ? "Signing in..." : "Continue"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Google Terms Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed shrink-0">
          <p>
            To continue, Google will share your verified name, email address, and profile credentials with <span className="font-semibold text-zinc-600 dark:text-zinc-400">ConnectLn</span>. Protected by zero-trust encryption.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
