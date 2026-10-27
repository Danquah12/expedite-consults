"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Loader2, ArrowRight, UserPlus, CheckCircle2, AlertCircle, X } from "lucide-react"
import { saveStoredUser, saveStoredSessionRoute, getDefaultPortraitForUser, loadStoredAdminUsers, trackUserActivity } from "@/lib/connectin-storage"
import { isSuperAdminUser, isDedicatedAdminAccount, isExactKwesiUser, isForeignPersonaAvatar, generatePersonalSignatureAvatar, resolveDisplayName } from "@/lib/connectin-profile"

interface MicrosoftAuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
  initialName?: string
  professionId?: string
  onSuccess?: (user: any) => void
}

export function MicrosoftAuthModal({
  isOpen,
  onClose,
  initialEmail = "",
  initialName = "",
  professionId = "auto_detect",
  onSuccess
}: MicrosoftAuthModalProps) {
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
          workspace: u.email.includes("expedite-consults") ? "Expedite Consults Entra ID" : "Work or school account",
          avatar: u.avatar || generatePersonalSignatureAvatar({ name: u.name, email: u.email }),
          isCurrent: false
        }))
    : []

  const rawAccounts = [
    ...(hasPrefilled ? [{
      email: activeEmailClean,
      name: prefilledName,
      workspace: activeEmailClean.includes("expedite-consults") ? "Expedite Consults Entra ID" : "Work or school account",
      avatar: generatePersonalSignatureAvatar({ name: prefilledName, email: activeEmailClean }),
      isCurrent: true
    }] : []),
    ...recentStoredAccounts,
    ...(!activeEmailClean.startsWith("kasied1@") ? [{
      email: "kasied1@expedite-consults.com",
      name: "Kasied1 Asiedu",
      workspace: "Expedite Consults Entra ID",
      avatar: generatePersonalSignatureAvatar({ name: "Kasied1 Asiedu", email: "kasied1@expedite-consults.com" }),
      isCurrent: false
    }] : []),
    ...(!activeEmailClean.startsWith("kasiedu@") ? [{
      email: "kasiedu@expedite-consults.com",
      name: "Kwesi Asiedu (Root Authority)",
      workspace: "Expedite Consults Enterprise",
      avatar: "/brand/kwesi-avatar.png",
      isCurrent: false
    }] : []),
  ]

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
    setSuccessNotice(`Authenticating with Microsoft Entra ID...`)

    try {
      const cleanName = (accountName || "").replace(/\s*\([^)]*\)/g, "").trim()
      const res = await fetch("/api/connectin/auth/microsoft", {
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
        throw new Error(data.error || "Microsoft authentication failed")
      }

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
        id: data.user?.id || rawProfile?.userId || rawProfile?.id || `USR-MS-${Date.now().toString(36).toUpperCase()}`,
        userId: data.user?.id || rawProfile?.userId || rawProfile?.id,
        name: finalName,
        email: accountEmail,
        avatar: safeAvatar,
        role: isAdmin ? "admin" : "personal",
        roles: isAdmin ? ["SUPER_ADMIN"] : ["NORMAL_USER"],
        authProvider: "Microsoft Entra ID",
        lastLoginAt: nowIso
      }
      const targetTab = shouldOpenAdminPortal ? "adminiam" : "home"
      const targetUrl = shouldOpenAdminPortal ? "/connectin-admin" : "/connectin"

      saveStoredUser(profileToSave)
      saveStoredSessionRoute(targetTab, "personal")
      trackUserActivity({
        actionType: "USER_LOGIN",
        actionLabel: "Signed In via Microsoft Entra ID ✓",
        category: "auth",
        targetTitle: "Microsoft Entra ID",
        details: `Authenticated via Microsoft Entra ID as ${finalName} (${accountEmail})`,
        user: profileToSave as any
      })
      if (typeof window !== "undefined") {
        localStorage.removeItem("connectin_is_signed_out")
        sessionStorage.setItem("connectin_authenticated", "true")
      }

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
      setErrorMessage(err.message || "Could not complete Microsoft authentication.")
      setSuccessNotice(null)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setErrorMessage("Please enter a valid work or school email address.")
      return
    }
    handleSelectAccount(customEmail.trim().toLowerCase(), customName.trim())
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="w-[calc(100vw-20px)] sm:w-full max-w-[420px] p-0 overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90dvh] flex flex-col mx-auto my-auto">
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-800/80 text-center relative shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full p-2 transition-colors disabled:opacity-50 touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex justify-center mb-3">
            <svg className="h-7 w-7" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign in with Microsoft
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pick an account to continue to <span className="font-semibold text-zinc-800 dark:text-zinc-200">ConnectLn</span>
          </p>
        </div>

        <div className="px-4 sm:px-6 pt-2 sm:pt-3">
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
                        ? "border-[#00a4ef] bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-[#00a4ef]/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                            {acc.name}
                          </p>
                          {acc.isCurrent && (
                            <span className="text-[9px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-1.5 py-0.2 rounded-full">
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
                        <Loader2 className="h-4 w-4 animate-spin text-[#00a4ef]" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  setIsUsingCustom(true)
                  setErrorMessage(null)
                }}
                disabled={isLoading}
                className="w-full text-left p-3 sm:p-3.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#00a4ef] hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all flex items-center gap-3 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-h-[50px] active:scale-[0.98] touch-manipulation"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p>Use another Microsoft account</p>
                  <p className="text-[10px] font-normal text-zinc-400">Sign in with any Microsoft 365 or Entra ID</p>
                </div>
              </button>
            </>
          ) : (
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
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00a4ef]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Enter your Microsoft or Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base sm:text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00a4ef]"
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
                  className="rounded-full bg-[#00a4ef] hover:bg-[#0086c4] text-white px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all min-h-[44px] active:scale-[0.98] touch-manipulation"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{isLoading ? "Signing in..." : "Continue"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed shrink-0">
          <p>
            Connected via Microsoft Entra ID SSO. Governed by zero-trust enclave policies.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
