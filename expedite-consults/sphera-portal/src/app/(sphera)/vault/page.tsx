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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "48px" }}>
      {/* ── Vault Hero Header ─────────────────────────────────────── */}
      <div
        style={{
          borderRadius: "24px",
          padding: "32px",
          background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(16,18,26,0.9) 60%, var(--bg-core) 100%)",
          border: "1px solid rgba(0,212,255,0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ backgroundColor: "rgba(0,212,255,0.15)", color: "var(--accent-cyan)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: "9999px", padding: "3px 10px", fontSize: "10px", fontWeight: "900" }}>
              SPHERANET PAY & ESCROW ENCLAVE
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>· Zero-Trust Hardware Vault</span>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "var(--text-pure)", margin: 0, lineHeight: "1.2" }}>
            Decentralized Financial Vault & <span style={{ color: "var(--accent-cyan)" }}>Escrow Protection</span>
          </h1>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            Automated marketplace escrow protection, instant TS/SCI bounty disbursement, and 1-click creator tipping.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              background: "linear-gradient(135deg, #00d4ff, #0284c7)",
              color: "#08090d",
              border: "none",
              borderRadius: "14px",
              padding: "12px 24px",
              fontSize: "13px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowDownLeft size={16} /> Deposit Funds
          </button>
        </div>
      </div>

      {/* ── Liquidity & Escrow Summary Cards ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        {[
          { label: "Available Vault Balance", val: "$4,850.00", sub: "Ready for withdrawal or tipping", icon: <Wallet size={20} color="var(--accent-cyan)" /> },
          { label: "Escrow in Safe Holding", val: "$1,200.00", sub: "Protected until buyer verification", icon: <Lock size={20} color="#f59e0b" /> },
          { label: "Cleared Bounties Earned", val: "$3,200.00", sub: "100% Verified TS/SCI payouts", icon: <ShieldCheck size={20} color="#10b981" /> },
          { label: "Creator Tips Sent", val: "$450.00", sub: "Supported 18 SpheraNet creators", icon: <Heart size={20} color="#ec4899" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>{stat.label}</span>
              {stat.icon}
            </div>
            <p style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>{stat.val}</p>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Active Escrow Contracts ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Lock size={18} color="#f59e0b" />
          <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>Active Escrow Transactions</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {deals.map((deal) => {
            const isDone = deal.status === "Completed";
            return (
              <div
                key={deal.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: isDone ? "1px solid var(--border-subtle)" : "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "20px",
                  padding: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "24px",
                  flexWrap: "wrap",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ display: "flex", gap: "16px", flex: 1, minWidth: "280px" }}>
                  <div style={{ height: "48px", width: "48px", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={deal.partner.img} alt={deal.partner.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: isDone ? "#10b981" : "#f59e0b", backgroundColor: isDone ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                        {deal.status}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{deal.date}</span>
                    </div>

                    <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: "2px 0 0 0" }}>
                      {deal.itemTitle}
                    </h3>

                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                      Counterparty: <strong style={{ color: "var(--text-pure)" }}>{deal.partner.name}</strong> ({deal.partner.role})
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>Escrow Amount</p>
                    <p style={{ fontSize: "22px", fontWeight: "900", color: isDone ? "#10b981" : "var(--accent-cyan)", margin: 0 }}>${deal.amount.toLocaleString()}</p>
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => releaseEscrow(deal.id)}
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        padding: "12px 20px",
                        fontSize: "12px",
                        fontWeight: "900",
                        cursor: "pointer",
                        boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
                      }}
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

      {/* ── 1-Click Creator Micro-Tipping Simulator ───────────────── */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ height: "46px", width: "46px", borderRadius: "14px", background: "linear-gradient(135deg, #ec4899, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
            <Heart size={22} fill="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "var(--text-pure)", margin: 0 }}>1-Click Creator Micro-Tipping</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Support independent creators with instant zero-fee tips.</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {[1, 5, 25, 100].map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedTip(amt)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: selectedTip === amt ? "900" : "700",
                backgroundColor: selectedTip === amt ? "#ec4899" : "var(--bg-input)",
                color: selectedTip === amt ? "#ffffff" : "var(--text-pure)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
              }}
            >
              ${amt}
            </button>
          ))}

          <button
            onClick={sendTip}
            style={{
              background: "linear-gradient(135deg, #ec4899, #db2777)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(236, 72, 153, 0.35)",
            }}
          >
            {tipSuccess ? "Tip Sent! 💖✨" : `Send $${selectedTip} Tip`}
          </button>
        </div>
      </div>
    </div>
  );
}
