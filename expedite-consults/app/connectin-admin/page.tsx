"use client"

import React, { useState } from "react"
import { AdminIAMConsoleView } from "@/components/linkedin/AdminIAMConsoleView"
import { LinkedInNavbar } from "@/components/linkedin/LinkedInNavbar"
import { currentUser as defaultUser, UserProfile } from "@/lib/linkedin-data"
import { ConnectInLogo } from "@/components/brand/ConnectInLogo"
import { useRouter } from "next/navigation"

export default function ConnectInAdminPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserProfile>(defaultUser)

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
      </main>
    </div>
  )
}
