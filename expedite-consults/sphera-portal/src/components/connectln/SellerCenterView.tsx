"use client"

import React, { useState } from "react"
import {
  Store,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  ShieldCheck,
  CreditCard,
  Lock,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  BarChart3,
  Layers,
  ArrowUpRight
} from "lucide-react"
import {
  SELLER_CENTER_METRICS,
  EXPEDITE_CONSULTS_COMPANY_DATA
} from "@/lib/connectin-os-data"
import { UserProfile } from "@/lib/connectln-data"

interface SellerCenterViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function SellerCenterView({
  currentUser,
  onNavigateTab
}: SellerCenterViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'escrow' | 'analytics' | 'support'>('overview')

  const orders = [
    { id: 'ORD-9842', product: 'AXIOM AI Cyber Suite (Annual)', customer: 'Lockheed Martin Corp', amount: '$5,988', date: 'August 28, 2026', status: 'Paid & Active' },
    { id: 'ORD-9841', product: 'Expedite Strike ASPM', customer: 'Northrop Grumman Defense', amount: '$499', date: 'August 27, 2026', status: 'Active 14-Day Trial' },
    { id: 'ORD-9840', product: 'AWS GovCloud cATO Retainer', customer: 'Federal Systems Partner', amount: '$15,000', date: 'August 25, 2026', status: 'Held in Escrow' },
    { id: 'ORD-9839', product: 'OSCAL Automated cATO Generator', customer: 'Booz Allen Hamilton', amount: '$799', date: 'August 24, 2026', status: 'Paid & Active' }
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 text-zinc-900 dark:text-zinc-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-[#0A66C2] dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 w-fit">
              <Store className="h-3.5 w-3.5 text-[#0A66C2]" />
              Seller Hub &amp; Revenue Operations
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Seller Dashboard &amp; Solutions Catalog
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Manage product listings, subscriptions, active client licenses, and sales analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('marketplace')}
              className="rounded-full bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 text-xs font-semibold transition-colors shadow-xs"
            >
              + List New Solution
            </button>
          </div>
        </div>

        {/* 4 Core Metrics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <span className="text-zinc-500 text-[11px] font-semibold uppercase">Monthly Recurring</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{SELLER_CENTER_METRICS.mrr}</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" /> +14.2% MoM</span>
          </div>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <span className="text-zinc-500 text-[11px] font-semibold uppercase">Active Licenses</span>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{SELLER_CENTER_METRICS.activeLicenses}</p>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{SELLER_CENTER_METRICS.activeTrials} in Free Trial</span>
          </div>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <span className="text-zinc-500 text-[11px] font-semibold uppercase">Escrow Payouts</span>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{SELLER_CENTER_METRICS.escrowPending.split(' ')[0]}</p>
            <span className="text-[10px] text-zinc-400">Milestone protected</span>
          </div>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-3.5 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <span className="text-zinc-500 text-[11px] font-semibold uppercase">Trial Conversion</span>
            <p className="text-xl font-bold text-[#0A66C2]">{SELLER_CENTER_METRICS.conversionRate}</p>
            <span className="text-[10px] text-zinc-400">Industry Avg: 12%</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2 text-xs dark:border-zinc-800">
        {[
          { id: 'overview', label: '📊 Operations Overview' },
          { id: 'products', label: '📦 Product Catalog' },
          { id: 'orders', label: '💳 Orders & Subscriptions' },
          { id: 'escrow', label: '🔒 Secure Escrow Payments' },
          { id: 'analytics', label: '📈 Conversion Analytics' },
          { id: 'support', label: '💬 Support Desk (2 Open)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-2 font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & RECENT TRANSACTIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Recent Enterprise Subscriptions &amp; Orders
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Product / Engagement</th>
                    <th className="pb-2">Enterprise Customer</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">{ord.id}</td>
                      <td className="py-3 font-semibold text-[#0A66C2]">{ord.product}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-300">{ord.customer}</td>
                      <td className="py-3 font-bold text-emerald-600">{ord.amount}</td>
                      <td className="py-3 text-zinc-400 font-mono text-[11px]">{ord.date}</td>
                      <td className="py-3 text-right">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ord.status.includes('Paid') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          ord.status.includes('Escrow') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ESCROW MILESTONE PAYMENTS */}
      {activeTab === 'escrow' && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/40 p-6 dark:bg-amber-950/20 space-y-4">
          <div className="flex items-center gap-2 text-base font-black text-amber-950 dark:text-amber-300">
            <Lock className="h-5 w-5 text-amber-600" />
            <span>ConnectIn Escrow &amp; Milestone Protection Engine</span>
          </div>

          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            ConnectIn holds funds in institutional escrow for high-value professional services (e.g. $15,000 GovCloud cATO SOW). Funds are automatically released upon client milestone approval.
          </p>

          <div className="rounded-xl bg-white p-4 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span>Active Milestone: AWS GovCloud cATO Sprint (Phase 1: Architecture Gap Analysis)</span>
              <span className="text-emerald-600 font-black">$7,500</span>
            </div>
            <p className="text-zinc-500 text-[11px]">Client: Federal Systems Partner · Status: In Progress (Deliverable Due Sept 5)</p>
          </div>
        </div>
      )}
    </div>
  )
}
