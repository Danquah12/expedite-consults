"use client"

import React, { useState } from "react"
import {
  Briefcase,
  Star,
  Clock,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Award,
  Check
} from "lucide-react"
import { advisorsData, AdvisorProfile } from "@/lib/nextgen-data"
import { UserProfile } from "@/lib/linkedin-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AdvisoryMarketplaceViewProps {
  currentUser: UserProfile
}

export function AdvisoryMarketplaceView({ currentUser }: AdvisoryMarketplaceViewProps) {
  const [advisors, setAdvisors] = useState<AdvisorProfile[]>(advisorsData)
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorProfile | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [sessionTopic, setSessionTopic] = useState("")
  const [isBooked, setIsBooked] = useState(false)

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return
    setIsBooked(true)
  }

  const handleClose = () => {
    setSelectedAdvisor(null)
    setSelectedSlot("")
    setSessionTopic("")
    setIsBooked(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-xs font-bold text-sky-300 border border-sky-400/40 flex items-center gap-1.5 w-fit">
              <Award className="h-3.5 w-3.5 text-amber-300" /> ConnectIn Executive Advisory (Fractional CISO/CTO)
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              1:1 Executive Advisory & Fractional Leadership
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-200 max-w-xl">
              Book hourly advisory sessions, architecture audits, and fractional executive support directly with verified industry leaders.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-xs text-center border border-white/10 min-w-[170px]">
            <p className="text-[11px] text-sky-200 uppercase tracking-wider font-semibold">
              Advisory Guarantee
            </p>
            <p className="text-xl font-bold text-white mt-0.5">
              100% Verified CISSP/Fellows
            </p>
          </div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={advisor.avatar}
                    alt={advisor.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-[#0A66C2]/20"
                  />
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      {advisor.name}
                      <ShieldCheck className="h-4 w-4 text-[#0A66C2]" />
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-1">{advisor.headline}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{advisor.rating} ({advisor.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  ${advisor.hourlyRate}/hr
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {advisor.bio}
              </p>

              {/* Fractional Roles */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {advisor.fractionalRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950/40 dark:text-sky-300"
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1">
                {advisor.topExpertise.map((exp) => (
                  <span
                    key={exp}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Next slot: {advisor.availableSlots[0].split('·')[0]}
              </span>

              <button
                onClick={() => setSelectedAdvisor(advisor)}
                className="rounded-full bg-[#0A66C2] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#004182] shadow-xs"
              >
                Book 1:1 Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <Dialog open={Boolean(selectedAdvisor)} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-xl">
          {selectedAdvisor && !isBooked && (
            <>
              <DialogHeader className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAdvisor.avatar}
                    alt={selectedAdvisor.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0A66C2]"
                  />
                  <div>
                    <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Book Advisory Session with {selectedAdvisor.name}
                    </DialogTitle>
                    <p className="text-xs text-zinc-500">${selectedAdvisor.hourlyRate} / hour (Direct Video + Shared Architecture Whiteboard)</p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleBookSession} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200">
                    Select Available Time Slot
                  </label>
                  <div className="mt-1.5 space-y-1.5">
                    {selectedAdvisor.availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full rounded-lg border p-2.5 text-left font-semibold transition-all ${
                          selectedSlot === slot
                            ? "border-[#0A66C2] bg-sky-50 text-[#0A66C2] dark:bg-sky-950/40"
                            : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-800 dark:text-zinc-200">
                    Session Objectives & System Architecture Questions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Seeking review of our zero-trust Kubernetes ingress topology and SOC 2 Type II readiness..."
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-3 text-zinc-900 focus:border-[#0A66C2] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-emerald-600">
                    Total: ${selectedAdvisor.hourlyRate}
                  </span>
                  <button
                    type="submit"
                    disabled={!selectedSlot}
                    className="rounded-full bg-[#0A66C2] px-6 py-2 font-bold text-white hover:bg-[#004182] disabled:opacity-40 shadow-xs"
                  >
                    Confirm & Reserve Slot
                  </button>
                </div>
              </form>
            </>
          )}

          {selectedAdvisor && isBooked && (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Advisory Session Confirmed!
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Your 1:1 session with <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedAdvisor.name}</span> has been booked for <span className="font-bold text-[#0A66C2]">{selectedSlot}</span>. Calendar invite and video room link sent to your email.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="rounded-full bg-[#0A66C2] px-6 py-2 text-xs font-semibold text-white hover:bg-[#004182]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
