"use client";

import { useState } from "react";
import {
  Wallet, ShieldCheck, ArrowUpRight, ArrowDownLeft,
  Sparkles, Lock, RefreshCw, CheckCircle2, DollarSign,
  Heart, Send, AlertTriangle, ExternalLink
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface EscrowDeal {
  id: string;
  itemTitle: string;
  amount: number;
  partner: { name: string; img: string; role: "Buyer" | "Seller" };
  status: "Funds Locked in Escrow" | "Pending Inspection" | "Completed";
  step: number;
  totalSteps: number;
  date: string;
}

const mockDeals: EscrowDeal[] = [
  {
    id: "esc-8921",
    itemTitle: "Apple MacBook Pro 14\" M3 Pro Space Black",
    amount: 1200,
    partner: { name: "Alex Mensah", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", role: "Seller" },
    status: "Funds Locked in Escrow",
    step: 2,
    totalSteps: 3,
    date: "Today · 2:15 PM",
  },
  {
    id: "esc-7419",
    itemTitle: "Cleared TS/SCI Zero-Trust Architecture Bounty Payout",
    amount: 3200,
    partner: { name: "Expedite Federal Systems", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80", role: "Buyer" },
    status: "Completed",
    step: 3,
    totalSteps: 3,
    date: "Aug 29, 2026",
  },
];

export default function VaultPage() {
  const [deals, setDeals] = useState(mockDeals);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [selectedTip, setSelectedTip] = useState(5);

  const releaseEscrow = (id: string) => {
    setDeals(prev =>
      prev.map(d => (d.id === id ? { ...d, status: "Completed", step: 3 } : d))
    );
  };

  const sendTip = () => {
    setTipSuccess(true);
    setTimeout(() => setTipSuccess(false), 3000);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── Vault Hero Header ─────────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800 flex justify-between items-center gap-6 flex-wrap">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex gap-2 items-center">
            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Wallet & Escrow
            </span>
            <span className="text-xs text-zinc-400 font-medium">· Secure Payment & Balance Protection</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Account Balance & <span className="text-zinc-100 underline decoration-zinc-600 underline-offset-4">Protected Transactions</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Marketplace escrow protection, earnings payouts, and simple creator appreciation tips.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer shadow-xs">
            <ArrowDownLeft size={16} />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* ── Balance & Escrow Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Available Balance", val: "$4,850.00", sub: "Ready for withdrawal or use", icon: <Wallet size={18} className="text-zinc-400" /> },
          { label: "Escrow in Holding", val: "$1,200.00", sub: "Pending buyer inspection", icon: <Lock size={18} className="text-amber-400" /> },
          { label: "Bounties & Earnings", val: "$3,200.00", sub: "Total completed payouts", icon: <ShieldCheck size={18} className="text-emerald-400" /> },
          { label: "Creator Tips", val: "$450.00", sub: "18 creators supported", icon: <Heart size={18} className="text-rose-400" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.val}</p>
            <p className="text-[11px] text-zinc-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Active Escrow Contracts ───────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-zinc-400" />
          <h2 className="text-base font-bold text-white">Active Escrow Transactions</h2>
        </div>

        <div className="flex flex-col gap-3">
          {deals.map((deal) => {
            const isDone = deal.status === "Completed";
            return (
              <div
                key={deal.id}
                className={`bg-zinc-900/40 rounded-2xl p-5 flex justify-between items-center gap-4 flex-wrap border transition-all ${
                  isDone ? "border-zinc-800" : "border-zinc-700"
                }`}
              >
                <div className="flex gap-3.5 flex-1 min-w-[260px]">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                    <img src={deal.partner.img} alt={deal.partner.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isDone ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}>
                        {deal.status}
                      </span>
                      <span className="text-xs text-zinc-500">{deal.date}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white">
                      {deal.itemTitle}
                    </h3>

                    <p className="text-xs text-zinc-400">
                      Counterparty: <strong className="text-zinc-200">{deal.partner.name}</strong> ({deal.partner.role})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-medium uppercase">Amount</p>
                    <p className={`text-lg font-bold ${isDone ? "text-emerald-400" : "text-white"}`}>${deal.amount.toLocaleString()}</p>
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => releaseEscrow(deal.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Release to Seller ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Creator Micro-Tipping ─────────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Creator Appreciation Tipping</h3>
            <p className="text-xs text-zinc-400">Support independent community creators with direct tips.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[1, 5, 25, 100].map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedTip(amt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                selectedTip === amt
                  ? "bg-white text-zinc-950 font-semibold border-white"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              ${amt}
            </button>
          ))}

          <button
            onClick={sendTip}
            className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors cursor-pointer ml-1 shadow-xs"
          >
            {tipSuccess ? "Tip Sent! ✓" : `Send $${selectedTip}`}
          </button>
        </div>
      </div>
    </div>
  );
}
