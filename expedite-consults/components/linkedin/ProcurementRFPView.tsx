"use client"

import React, { useState } from "react"
import {
  Building2,
  DollarSign,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Send,
  Lock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Briefcase
} from "lucide-react"
import {
  CORPORATE_PROCUREMENT_DATA,
  RFP_MARKETPLACE_DATA,
  ProcurementSpendDashboard,
  RFPQuoteRequest
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface ProcurementRFPViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function ProcurementRFPView({
  currentUser,
  onNavigateTab
}: ProcurementRFPViewProps) {
  const [activeTab, setActiveTab] = useState<'procurement' | 'rfp'>('procurement')
  const [procurement] = useState<ProcurementSpendDashboard>(CORPORATE_PROCUREMENT_DATA)
  const [rfps, setRfps] = useState<RFPQuoteRequest[]>(RFP_MARKETPLACE_DATA)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
            <Building2 className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Enterprise Corporate Procurement &amp; RFP Hub
          </span>
          <h1 className="text-2xl font-black text-white">
            {procurement.companyName}
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Enterprise spend governance, multi-tier procurement approvals, contract renewals, and competitive vendor RFP bidding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('procurement')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'procurement' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            🏢 Procurement Desk
          </button>
          <button
            onClick={() => setActiveTab('rfp')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'rfp' ? "bg-white text-zinc-950 shadow-md font-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            📋 RFP Bids ({rfps.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: CORPORATE PROCUREMENT DESK */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          {/* 4 Financial Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
              <span className="text-zinc-400 text-[10px] font-mono uppercase">Annual ConnectIn Spend</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{procurement.annualSpend}</p>
              <span className="text-[10px] text-zinc-400">All Enterprise Licenses</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
              <span className="text-zinc-400 text-[10px] font-mono uppercase">Pending Approvals</span>
              <p className="text-xl font-black text-amber-500">{procurement.pendingApprovalsCount}</p>
              <span className="text-[10px] text-zinc-400">3 High-Priority SOWs</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
              <span className="text-zinc-400 text-[10px] font-mono uppercase">Active Vendors</span>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400">{procurement.activeVendorsCount}</p>
              <span className="text-[10px] text-zinc-400">FedRAMP/SOC 2 Audited</span>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
              <span className="text-zinc-400 text-[10px] font-mono uppercase">Active Subscriptions</span>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{procurement.activeSubscriptionsCount}</p>
              <span className="text-[10px] text-zinc-400">{procurement.renewalsThisMonthCount} Renewals in Sept</span>
            </div>
          </div>

          {/* 4-Step Approval Workflow Chain */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-600" />
              <span>Multi-Tier Enterprise Procurement Approval Governance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {procurement.approvalWorkflow.map((step) => (
                <div
                  key={step.step}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    step.status === 'Approved'
                      ? "bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800"
                      : step.status === 'Pending Review'
                      ? "bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700"
                      : "bg-zinc-50 border-zinc-200 dark:bg-zinc-800/40 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                    <span>Step {step.step}</span>
                    <span className={step.status === 'Approved' ? "text-emerald-600" : step.status === 'Pending Review' ? "text-amber-600" : "text-zinc-400"}>
                      {step.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{step.role}</h4>
                  <p className="text-[11px] text-zinc-500">{step.assignee}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Purchase Requisitions Table */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Active Software &amp; SOW Purchase Requisitions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Requisition ID</th>
                    <th className="pb-2">Product / SOW</th>
                    <th className="pb-2">Vendor</th>
                    <th className="pb-2">Requested By</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {procurement.activeRequisitions.map((req) => (
                    <tr key={req.id} className="py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">{req.id}</td>
                      <td className="py-3 font-semibold text-[#0A66C2]">{req.product}</td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-300">{req.vendor}</td>
                      <td className="py-3 text-zinc-500">{req.requestedBy} ({req.department})</td>
                      <td className="py-3 font-mono font-bold text-emerald-600">{req.amount}</td>
                      <td className="py-3 text-right">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {req.status}
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

      {/* VIEW 2: RFP / RFQ BIDDING MARKETPLACE */}
      {activeTab === 'rfp' && (
        <div className="space-y-6">
          {rfps.map((rfp) => (
            <div
              key={rfp.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0A66C2] dark:bg-blue-950 dark:text-blue-300">
                    {rfp.clientType}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{rfp.deadline}</span>
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{rfp.title}</h3>
                <p className="text-xs text-zinc-500">{rfp.scope}</p>
                <p className="text-xs font-mono font-bold text-emerald-600">Budget Range: {rfp.budgetRange}</p>
              </div>

              {/* Vendor Competitive Bids */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                  Submitted Competitive Bids ({rfp.bids.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {rfp.bids.map((bid, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-800/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{bid.vendorLogo}</span>
                          <span className="font-mono text-base font-black text-emerald-600">{bid.bidAmount}</span>
                        </div>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{bid.vendorName}</h5>
                        <p className="text-[10px] text-amber-500 font-bold">{bid.rating} ⭐ Rating</p>
                        <p className="text-[11px] text-zinc-500">Timeline: <strong>{bid.estimatedTimeline}</strong></p>

                        <div className="pt-2 space-y-1 text-[10px] text-zinc-600 dark:text-zinc-400">
                          {bid.deliverables.map((d, dIdx) => (
                            <p key={dIdx} className="flex items-center gap-1">✓ {d}</p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateTab('messaging')}
                        className="w-full rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white py-1.5 text-xs font-bold transition-colors"
                      >
                        Select Vendor &amp; Hold Escrow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
