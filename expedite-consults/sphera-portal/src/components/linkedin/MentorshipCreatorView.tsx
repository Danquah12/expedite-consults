"use client"

import React, { useState } from "react"
import {
  GraduationCap,
  Sparkles,
  Video,
  Star,
  DollarSign,
  Calendar,
  CheckCircle2,
  Send,
  MessageSquare,
  Award,
  ArrowRight,
  ShieldCheck,
  Megaphone
} from "lucide-react"
import {
  MENTORS_DATA,
  CREATOR_CAMPAIGNS_DATA,
  MentorProfile,
  CreatorCampaign
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface MentorshipCreatorViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function MentorshipCreatorView({
  currentUser,
  onNavigateTab
}: MentorshipCreatorViewProps) {
  const [activeTab, setActiveTab] = useState<'mentorship' | 'creator'>('mentorship')
  const [mentors] = useState<MentorProfile[]>(MENTORS_DATA)
  const [campaigns] = useState<CreatorCampaign[]>(CREATOR_CAMPAIGNS_DATA)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/40 flex items-center gap-1.5 w-fit">
            <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Mentorship &amp; Creator Economy Hub
          </span>
          <h1 className="text-2xl font-black text-white">
            1:1 Leadership Mentorship &amp; B2B Technical Creator Briefs
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Book 1:1 sessions with verified CISOs and Fellows, or get paid by enterprise software brands to create technical teardowns and architecture whitepapers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'mentorship' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            👨‍🏫 Find a Mentor ({mentors.length})
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'creator' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            📢 Creator Campaigns ({campaigns.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: MENTORSHIP BOOKING */}
      {activeTab === 'mentorship' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                    <div>
                      <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{m.name}</span>
                        <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
                      </h4>
                      <p className="text-xs text-zinc-500">{m.role} · {m.company}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{m.rating} ({m.reviewsCount})</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold block">{m.slotsAvailable} Slots Open</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {m.bio}
                </p>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Specialties:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {m.specialties.map((sp, idx) => (
                      <span key={idx} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-emerald-600">{m.pricing}</span>
                <button
                  onClick={() => onNavigateTab('messaging')}
                  className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-1.5 text-xs font-bold shadow-xs"
                >
                  Book 1:1 Mentorship
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: B2B CREATOR MARKETPLACE */}
      {activeTab === 'creator' && (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{camp.brandLogo}</span>
                  <div>
                    <span className="text-[11px] font-mono text-purple-600 font-bold uppercase tracking-wider block">
                      {camp.deliverableType}
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{camp.campaignTitle}</h3>
                    <p className="text-xs text-zinc-400">Sponsored by {camp.brandName}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-base font-black text-emerald-600">{camp.compensation}</span>
                  <p className="text-[10px] text-zinc-400">{camp.applicantsCount} Verified Creators Applied</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {camp.description}
              </p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Payment guaranteed via ConnectIn Institutional Escrow</span>
                <button
                  onClick={() => onNavigateTab('messaging')}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 text-xs font-bold shadow-md hover:from-purple-500 hover:to-indigo-500"
                >
                  Submit Creator Proposal &amp; Portfolio →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
