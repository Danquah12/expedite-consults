"use client"

import React, { useState, useEffect } from "react"
import { AdminIAMConsoleView } from "@/components/linkedin/AdminIAMConsoleView"
import { LinkedInNavbar } from "@/components/linkedin/LinkedInNavbar"
import { currentUser as defaultUser, UserProfile } from "@/lib/linkedin-data"
import { getExplicitStoredUser } from "@/lib/connectin-storage"
import { isSuperAdminUser } from "@/lib/connectin-profile"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { useRouter } from "next/navigation"
import { ShieldAlert, Lock, ArrowLeft, Key } from "lucide-react"

export default function ConnectInAdminPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserProfile>(defaultUser)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = getExplicitStoredUser()
    if (stored) {
      setUserData(stored)
    }
  }, [])

  const isAdminUser = isSuperAdminUser(userData)

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-zinc-900 antialiased dark:bg-[#000000] dark:text-zinc-100 selection:bg-[#0A66C2] selection:text-white">
      {/* Top Navbar */}
      <LinkedInNavbar
        activeTab="adminiam"
        onSelectTab={(tab) => {
          if (tab === 'home' || tab === 'network' || tab === 'jobs' || tab === 'marketplace' || tab === 'messaging') {
            router.push(`/connectin?tab=${tab}`)
          }
        }}
        user={userData}
        searchQuery=""
        onSearchChange={() => {}}
      />

      {/* Main Admin Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        {isMounted && !isAdminUser ? (
          /* ─── STRICT ZERO-TRUST 403 ACCESS DENIED GUARD ─── */
          <div className="max-w-2xl mx-auto my-16 bg-white dark:bg-zinc-900 rounded-3xl border border-red-200 dark:border-red-900/60 p-8 sm:p-12 text-center shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="h-20 w-20 rounded-3xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
              <ShieldAlert className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                403 Forbidden · Zero-Trust Policy
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Access Denied: Least-Privilege Enclave
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                The Master Administrator Control Center is restricted to verified <strong>SUPER_ADMIN</strong> and <strong>Platform Security Officers</strong>. Standard user accounts and registered members are enforced with strict least-privilege boundary isolation.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 p-4 text-xs text-left font-mono text-zinc-600 dark:text-zinc-300 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Zero-Trust Telemetry:</p>
              <p>• Authenticated Identity: <span className="font-bold text-[#0A66C2]">{userData.name} ({userData.email || "Registered Member"})</span></p>
              <p>• Assigned Role: <span className="text-amber-600 font-bold uppercase">{(userData as any).role || "personal"} (Standard Member)</span></p>
              <p>• Enclave Requirement: <span className="text-emerald-600 font-bold">SUPER_ADMIN / Root IAM Authority</span></p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => router.push("/connectin")}
                className="w-full sm:w-auto rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-3 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Personal Workspace</span>
              </button>
              <button
                onClick={() => router.push("/connectin-login")}
                className="w-full sm:w-auto rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-6 py-3 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="h-4 w-4 text-amber-500" />
                <span>Sign in with Admin Credentials</span>
              </button>
            </div>
          </div>
        ) : (
          /* ─── AUTHORIZED ADMINISTRATOR CONSOLE ─── */
          <AdminIAMConsoleView
            currentUser={userData}
            onNavigateTab={(tab) => {
              if (tab === 'home') {
                router.push('/connectin')
              } else {
                router.push(`/connectin?tab=${tab}`)
              }
            }}
          />
        )}
      </main>
    </div>
  )
}
