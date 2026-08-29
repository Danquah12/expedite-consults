"use client"

import React, { useState } from "react"
import {
  Calendar,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Video,
  Play,
  Share2,
  ExternalLink,
  ShieldCheck,
  Plus
} from "lucide-react"
import {
  PLATFORM_EVENTS_DATA,
  ConnectInEvent
} from "@/lib/connectin-os-data"
import { UserProfile } from "@/lib/linkedin-data"

interface EventsViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function EventsView({
  currentUser,
  onNavigateTab
}: EventsViewProps) {
  const [events, setEvents] = useState<ConnectInEvent[]>(PLATFORM_EVENTS_DATA)
  const [selectedType, setSelectedType] = useState<string>('All')

  const toggleRegister = (id: string) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              isRegistered: !e.isRegistered,
              attendeesCount: e.isRegistered ? e.attendeesCount - 1 : e.attendeesCount + 1
            }
          : e
      )
    )
  }

  const filteredEvents = events.filter(e => {
    if (selectedType === 'All') return true
    return e.type === selectedType
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-sky-500/30 px-3 py-0.5 text-xs font-bold text-sky-200 border border-sky-400/40 flex items-center gap-1.5 w-fit">
            <Calendar className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Global Professional Events Hub
          </span>
          <h1 className="text-2xl font-black text-white">
            Conferences, Webinars &amp; Product Demos
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Register for live technical masterclasses, continuous ATO briefings, and autonomous product teardowns with instant trial sandboxes.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('marketplace')}
          className="rounded-xl bg-white text-zinc-950 font-black px-4 py-2.5 text-xs shadow-md hover:bg-zinc-100 shrink-0"
        >
          Explore Featured Products →
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Product Demo', 'Webinar', 'Hands-On Workshop', 'Conference'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 ${
              selectedType === type
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-[#0A66C2] hover:shadow-lg transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300">
                  {evt.type}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {evt.attendeesCount} Registered
                </span>
              </div>

              <h3 className="font-bold text-base text-zinc-900 leading-snug dark:text-zinc-100">
                {evt.title}
              </h3>

              <div className="space-y-1 text-xs text-zinc-500">
                <p className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{evt.date}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{evt.time}</span>
                </p>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {evt.description}
              </p>

              {/* Speaker Card */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <img src={evt.speakerAvatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-300" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{evt.speakerName}</p>
                  <p className="text-[10px] text-zinc-400">{evt.speakerRole}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleRegister(evt.id)}
                className={`w-full rounded-full py-2 text-xs font-bold transition-all shadow-xs ${
                  evt.isRegistered
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                }`}
              >
                {evt.isRegistered ? "✓ Registered (Calendar Invite Sent)" : "Register for Event (Free)"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
