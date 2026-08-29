"use client"

import React, { useState } from "react"
import {
  Users,
  UserPlus,
  Check,
  X,
  Plus,
  Building,
  Calendar,
  Newspaper,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Award,
  Cake,
  Send
} from "lucide-react"
import { SuggestedConnection, CatchUpEvent, initialCatchUpEvents, UserProfile, currentUser as defaultUser } from "@/lib/linkedin-data"
import { WarmIntroModal } from "./WarmIntroModal"

interface NetworkViewProps {
  suggestedPeople: SuggestedConnection[]
  onToggleConnect: (personId: string) => void
  currentUser?: UserProfile
}

export function NetworkView({
  suggestedPeople,
  onToggleConnect,
  currentUser = defaultUser
}: NetworkViewProps) {
  const [activeNetworkTab, setActiveNetworkTab] = useState<'grow' | 'catchup'>('grow')
  const [catchUpEvents, setCatchUpEvents] = useState<CatchUpEvent[]>(initialCatchUpEvents)
  const [warmIntroTarget, setWarmIntroTarget] = useState<SuggestedConnection | null>(null)
  const [isWarmIntroOpen, setIsWarmIntroOpen] = useState(false)
  const [congratsInput, setCongratsInput] = useState<{ [key: string]: string }>({})

  const [invitations, setInvitations] = useState([
    {
      id: 'inv_1',
      name: 'Victoria Hastings',
      headline: 'Chief Technology Officer @ Horizon FinTech Systems',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      mutualCount: 31,
      timeAgo: '1 day ago'
    },
    {
      id: 'inv_2',
      name: 'Dr. Liam O’Connor',
      headline: 'Head of Quantum Cryptography @ DARPA Partner Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      mutualCount: 14,
      timeAgo: '3 days ago'
    }
  ])

  const handleAcceptInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id))
  }

  const handleIgnoreInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id))
  }

  const handleSendCongrats = (eventId: string) => {
    setCatchUpEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, hasCongratulated: true } : e))
    )
  }

  return (
    <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-5 pb-12">
      {/* Left Rail: Manage My Network */}
      <div className="md:col-span-4 lg:col-span-3 space-y-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3">
            Manage my network
          </h3>
          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-zinc-500" />
                <span>Connections</span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">842</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Building className="h-4 w-4 text-zinc-500" />
                <span>Companies</span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">48</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Events</span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">6</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Newspaper className="h-4 w-4 text-zinc-500" />
                <span>Newsletters</span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">12</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-zinc-500" />
                <span>Pages</span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">29</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="md:col-span-8 lg:col-span-9 space-y-4">
        {/* Sub-Tab Selector: Grow vs Catch Up */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveNetworkTab('grow')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              activeNetworkTab === 'grow'
                ? "bg-[#0A66C2] text-white"
                : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            Grow Network
          </button>
          <button
            onClick={() => setActiveNetworkTab('catchup')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeNetworkTab === 'catchup'
                ? "bg-[#0A66C2] text-white"
                : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Catch Up (3 new milestones)</span>
          </button>
        </div>

        {/* 1. GROW NETWORK VIEW */}
        {activeNetworkTab === 'grow' && (
          <>
            {/* Invitations Box */}
            {invitations.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Invitations ({invitations.length})
                  </h3>
                  <button className="text-xs font-semibold text-[#0A66C2] hover:underline">
                    Manage all
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={inv.avatar}
                          alt={inv.name}
                          className="h-12 w-12 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-800"
                        />
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {inv.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {inv.headline}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {inv.mutualCount} mutual connections · {inv.timeAgo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleIgnoreInvite(inv.id)}
                          className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => handleAcceptInvite(inv.id)}
                          className="rounded-full border border-[#0A66C2] px-4 py-1.5 text-xs font-semibold text-[#0A66C2] hover:bg-[#0A66C2]/10"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People You May Know Grid */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  People you may know based on your recent activity
                </h3>
                <button className="text-xs font-semibold text-[#0A66C2] hover:underline">
                  See all
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedPeople.map((person) => (
                  <div
                    key={person.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-16 w-full bg-gradient-to-r from-[#0A66C2] to-sky-700">
                        {person.coverImage && (
                          <img
                            src={person.coverImage}
                            alt="Cover"
                            className="h-full w-full object-cover opacity-60"
                          />
                        )}
                      </div>
                      <div className="relative px-3 pb-2 pt-0 text-center -mt-9">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="mx-auto h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm dark:border-zinc-900"
                        />
                        <h4 className="mt-2 font-bold text-xs sm:text-sm text-zinc-900 truncate hover:underline cursor-pointer dark:text-zinc-100">
                          {person.name}
                        </h4>
                        <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 h-8 dark:text-zinc-400">
                          {person.headline}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-2">
                          {person.mutualConnections} mutual connections
                        </p>
                      </div>
                    </div>

                    <div className="p-3 pt-0 space-y-1.5">
                      <button
                        onClick={() => onToggleConnect(person.id)}
                        className={`w-full rounded-full border py-1.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          person.isPending
                            ? "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
                            : person.isConnected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                            : "border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10"
                        }`}
                      >
                        {person.isPending ? (
                          <span>Pending</span>
                        ) : person.isConnected ? (
                          <>
                            <Check className="h-3 w-3" /> Connected
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" /> Connect
                          </>
                        )}
                      </button>

                      {person.mutualConnections > 0 && (
                        <button
                          onClick={() => {
                            setWarmIntroTarget(person)
                            setIsWarmIntroOpen(true)
                          }}
                          className="w-full rounded-full border border-purple-600/30 bg-purple-50/70 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>Request Warm Intro</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 2. CATCH UP / MILESTONES VIEW */}
        {activeNetworkTab === 'catchup' && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Catch up with your network
              </h3>
              <p className="text-xs text-zinc-500">
                Celebrate work anniversaries, new jobs, and birthdays with colleagues.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {catchUpEvents.map((evt) => (
                <div key={evt.id} className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={evt.person.avatar}
                      alt={evt.person.name}
                      className="h-12 w-12 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {evt.person.name}
                        </p>
                        {evt.eventType === 'anniversary' && <Award className="h-4 w-4 text-amber-500" />}
                        {evt.eventType === 'new_job' && <Sparkles className="h-4 w-4 text-emerald-500" />}
                        {evt.eventType === 'birthday' && <Cake className="h-4 w-4 text-pink-500" />}
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {evt.details}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{evt.timeAgo}</p>
                    </div>
                  </div>

                  <div>
                    {evt.hasCongratulated ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-4 py-1.5 rounded-full">
                        <Check className="h-3.5 w-3.5" /> Congrats Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendCongrats(evt.id)}
                        className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#004182] transition-colors shadow-xs"
                      >
                        Say Congrats 🎉
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warm Intro Graph Engine Modal */}
      <WarmIntroModal
        isOpen={isWarmIntroOpen}
        onClose={() => setIsWarmIntroOpen(false)}
        targetPerson={warmIntroTarget}
        currentUser={currentUser}
      />
    </div>
  )
}
