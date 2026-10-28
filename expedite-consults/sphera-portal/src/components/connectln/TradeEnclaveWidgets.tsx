"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Briefcase,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Award,
  Calendar,
  X,
  Sparkles
} from "lucide-react"
import { UserProfile } from "@/lib/connectln-data"

interface TradeEnclaveWidgetsProps {
  user: UserProfile
  onNavigateTab?: (tab: string) => void
  variant?: 'sidebar' | 'feed' | 'profile' | 'badge_only' | 'tickets_only' | 'invites_only'
}

export function TradeEnclaveWidgets({
  user,
  onNavigateTab,
  variant = 'sidebar'
}: TradeEnclaveWidgetsProps) {
  const [isOpenToCalls, setIsOpenToCalls] = useState(true)
  const [invites, setInvites] = useState([
    {
      id: "inv-1",
      name: "Keisha Owens",
      role: "Third-year apprentice",
      note: "You've already run pipe with her on the hospital wing.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
      status: "pending" as "pending" | "taken" | "passed",
      location: "Denver, CO",
      guild: "IBEW Local 68"
    },
    {
      id: "inv-2",
      name: "Tomasz Kowalski",
      role: "Master Electrician",
      note: "Hospital sub-station tie-in. Needs an electrician who has been in an ICU wing.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      status: "pending" as "pending" | "taken" | "passed",
      location: "Aurora, CO",
      guild: "IBEW Local 68"
    }
  ])

  const [shopsOnBench] = useState([
    { id: "shop-1", name: "Apex Electric", location: "Denver, CO", openCalls: 3 },
    { id: "shop-2", name: "Mountain View Builders", location: "Boulder, CO", openCalls: 1 }
  ])

  const handleTakeInvite = (id: string) => {
    setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'taken' } : inv))
  }

  const handlePassInvite = (id: string) => {
    setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'passed' } : inv))
  }

  const showBadge = variant === 'badge_only' || variant === 'profile'
  const showTickets = variant === 'tickets_only' || variant === 'sidebar' || variant === 'profile'
  const showInvites = variant === 'invites_only' || variant === 'sidebar' || variant === 'profile' || variant === 'feed'
  const showBench = variant === 'sidebar' || variant === 'profile'

  return (
    <div className="space-y-3">
      {/* 1. "OPEN TO CALLS" TRADE DISPATCH & RATE BADGE */}
      {showBadge && (
        <div className="rounded-xl border border-amber-500/30 bg-[#25211D] text-[#EFE8DC] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsOpenToCalls(!isOpenToCalls)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                isOpenToCalls
                  ? "bg-amber-600 text-white border-amber-500 shadow-2xs"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isOpenToCalls ? "bg-white animate-pulse" : "bg-zinc-500"}`} />
              <span>{isOpenToCalls ? "Open to Calls" : "Offline / On Job"}</span>
            </button>

            <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/20">
              IBEW Local 68 · Denver
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-white flex items-center justify-between">
              <span>Journeyman Electrician</span>
              <span className="text-amber-300 font-mono font-bold">$48–$54/hr</span>
            </p>
            <p className="text-[11px] text-[#EFE8DC]/70">
              Available Immediately · Day Shift · Commercial & Hospital Wire
            </p>
          </div>

          {/* 4 Trade Card Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3E3832] text-xs">
            <div className="flex justify-between py-0.5 border-b border-[#35302B]/60">
              <span className="text-[#EFE8DC]/60 text-[11px]">Shops looked</span>
              <span className="font-mono font-bold text-white">3</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#35302B]/60">
              <span className="text-[#EFE8DC]/60 text-[11px]">Vouches</span>
              <span className="font-mono font-bold text-emerald-400">2</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#EFE8DC]/60 text-[11px]">Hands raised</span>
              <span className="font-mono font-bold text-white">0</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#EFE8DC]/60 text-[11px]">Saved calls</span>
              <span className="font-mono font-bold text-amber-300">1</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TRADE TICKETS & LICENSE EXPIRATION DESK */}
      {showTickets && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Trade Tickets & License Desk</span>
            </p>
            <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
              Active Status
            </span>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="space-y-0.5">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">OSHA 30 Construction</p>
                <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                  Shop recency requirement in 16d
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                16d left
              </span>
            </li>

            <li className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="space-y-0.5">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">First Aid / CPR / AED</p>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                  American Red Cross · Valid card
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                Expires 53d
              </span>
            </li>
          </ul>

          <div className="pt-1 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('wallet')}
              className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open License Desk & Wallet →</span>
            </button>
            <span className="text-[10px] text-zinc-400 font-mono">2 Verified Tickets</span>
          </div>
        </div>
      )}

      {/* 3. TRADE HALL INVITES & VOUCHES (PEER CALL SIGN-OFFS) */}
      {showInvites && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#0A66C2]" />
              <span>Hall Invites & Vouches</span>
            </p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {invites.filter(i => i.status === 'pending').length} Open Calls
            </span>
          </div>

          <div className="space-y-2.5">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  inv.status === 'taken'
                    ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                    : inv.status === 'passed'
                    ? "opacity-40 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
                    : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={inv.avatar}
                    alt={inv.name}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {inv.name}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-400">{inv.guild}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {inv.role} · {inv.location}
                    </p>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 mt-1 leading-snug">
                      {inv.note}
                    </p>

                    {/* Actions */}
                    <div className="mt-2 flex items-center justify-end gap-2">
                      {inv.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePassInvite(inv.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTakeInvite(inv.id)}
                            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-2xs transition-colors cursor-pointer"
                          >
                            Take Call
                          </button>
                        </>
                      )}
                      {inv.status === 'taken' && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Taken · Scheduled with Hall</span>
                        </span>
                      )}
                      {inv.status === 'passed' && (
                        <span className="text-[10px] font-medium text-zinc-400">
                          Passed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHOPS ON YOUR BENCH */}
      {showBench && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
              <span>Shops On Your Bench</span>
            </p>
            <span className="text-[10px] font-mono text-zinc-400">Denver Area</span>
          </div>

          <ul className="space-y-1.5 text-xs">
            {shopsOnBench.map((shop) => (
              <li
                key={shop.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    {shop.name}
                  </p>
                  <p className="text-[10px] text-zinc-400">{shop.location}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40">
                  {shop.openCalls} calls
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
