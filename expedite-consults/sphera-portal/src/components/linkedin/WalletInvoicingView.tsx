"use client"

import React, { useState } from "react"
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Lock
} from "lucide-react"
import {
  USER_WALLET_DATA,
  ConnectInWallet,
  WalletTransaction
} from "@/lib/professional-superapp-data"
import { UserProfile } from "@/lib/linkedin-data"

interface WalletInvoicingViewProps {
  currentUser: UserProfile
  onNavigateTab: (tab: string) => void
}

export function WalletInvoicingView({
  currentUser,
  onNavigateTab
}: WalletInvoicingViewProps) {
  const [wallet, setWallet] = useState<ConnectInWallet>(USER_WALLET_DATA)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [invoiceClient, setInvoiceClient] = useState("")
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceDesc, setInvoiceDesc] = useState("")
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState<string | null>(null)

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceClient || !invoiceAmount) return

    setInvoiceSuccessMsg(`✓ Invoice for ${invoiceAmount} sent to ${invoiceClient}! Funds will be held in ConnectIn Institutional Escrow upon client acceptance.`)
    setIsCreatingInvoice(false)
    setInvoiceClient("")
    setInvoiceAmount("")
    setInvoiceDesc("")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 w-fit">
            <CreditCard className="h-3.5 w-3.5 text-amber-300" />
            ConnectIn Pay, Wallet &amp; Invoicing Operations
          </span>
          <h1 className="text-2xl font-black text-white">
            Professional Wallet &amp; Institutional Escrow
          </h1>
          <p className="text-xs text-zinc-300 max-w-xl">
            Collect marketplace revenue, advisory retainer payouts, creator brand briefs, and issue enterprise SOW invoices.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingInvoice(!isCreatingInvoice)}
          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create &amp; Send Invoice</span>
        </button>
      </div>

      {invoiceSuccessMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200">
          {invoiceSuccessMsg}
        </div>
      )}

      {/* INVOICE CREATION MODAL DRAWER */}
      {isCreatingInvoice && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0A66C2]" />
            <span>Draft New B2B Enterprise SOW Invoice</span>
          </h3>

          <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Client / Company Name</label>
              <input
                type="text"
                placeholder="e.g. Stripe Defense Enclave"
                value={invoiceClient}
                onChange={(e) => setInvoiceClient(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Invoice Amount ($ USD)</label>
              <input
                type="text"
                placeholder="e.g. $4,500.00"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">Scope of Work &amp; Deliverables</label>
              <textarea
                placeholder="Describe completed architecture audit, AWS GovCloud landing zone deployment, or consultation..."
                value={invoiceDesc}
                onChange={(e) => setInvoiceDesc(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingInvoice(false)}
                className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0A66C2] text-white px-5 py-2 font-bold shadow-xs hover:bg-[#004182]"
              >
                Issue Invoice &amp; Escrow Link →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WALLET METRICS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Available Balance</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{wallet.availableBalance}</p>
          <span className="text-xs text-zinc-500">Auto-payout to {wallet.payoutMethod}</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Held in Institutional Escrow</span>
          <p className="text-3xl font-black text-amber-500">{wallet.escrowBalance}</p>
          <span className="text-xs text-zinc-500">Released upon client sign-off</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-1.5">
          <span className="text-[10px] uppercase font-mono text-zinc-400">Total Earned (YTD 2026)</span>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{wallet.totalEarnedYTD}</p>
          <span className="text-xs text-zinc-500">Marketplace + Advisory + Creators</span>
        </div>
      </div>

      {/* RECENT TRANSACTION LEDGER */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Transaction &amp; Escrow Settlement Ledger
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {wallet.transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  tx.amount.startsWith('+') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {tx.amount.startsWith('+') ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{tx.counterparty}</p>
                  <p className="text-[10px] text-zinc-500">{tx.type} · {tx.date}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-mono font-bold text-sm block ${
                  tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
                }`}>
                  {tx.amount}
                </span>
                <span className={`text-[10px] font-bold ${
                  tx.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
