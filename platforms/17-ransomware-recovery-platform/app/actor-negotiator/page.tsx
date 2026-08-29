"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
  Send,
  CheckCircle2,
  FileCheck,
  Search,
  Lock,
  Unlock,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from "lucide-react";
import { TorNegotiationMessage, SyndicateDiscountProfile, OfacScreeningCheck } from "@/types/recovery";

// Mock Tor chat messages
const INITIAL_CHAT_MESSAGES: TorNegotiationMessage[] = [
  {
    id: "msg-01",
    timestamp: "2026-08-23 18:14:00 UTC",
    sender: "ACTOR_OPERATOR",
    messageText: "Hello Mercy Health management. We have encrypted all your clinical servers and exfiltrated 850GB of patient medical records. Price to get decryptor and delete data is $1,800,000 in BTC. You have 72 hours.",
    sentimentScore: -0.4,
    frustrationScore: 12,
    bluffProbabilityPct: 82.5,
    extractedTerms: {
      demandedAmountUSD: 1800000,
      cryptoAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      deadlineHoursRemaining: 72
    }
  },
  {
    id: "msg-02",
    timestamp: "2026-08-23 21:05:00 UTC",
    sender: "AEGIS_NEGOTIATOR",
    messageText: "We have received your note. We are a regional non-profit healthcare system caring for acute trauma patients. We are actively investigating and need proof of decryption on 2 non-critical test files.",
    sentimentScore: 0.1,
    frustrationScore: 0,
    bluffProbabilityPct: 0
  },
  {
    id: "msg-03",
    timestamp: "2026-08-24 00:22:00 UTC",
    sender: "ACTOR_AFFILIATE",
    messageText: "Test files decrypted and uploaded back. We can negotiate if you pay within 24 hours. Don't waste our time or call FBI or price goes to $3M.",
    sentimentScore: -0.65,
    frustrationScore: 38,
    bluffProbabilityPct: 78.0,
    extractedTerms: {
      demandedAmountUSD: 1800000,
      deadlineHoursRemaining: 24
    }
  }
];

// Historical syndicate discount curves
const SYNDICATE_PROFILES: SyndicateDiscountProfile[] = [
  {
    syndicateName: "LockBit 3.0 (Black)",
    avgDiscountPct: 45,
    maxHistoricalDiscountPct: 70,
    optimalStallWindowHours: 48,
    bluffThresholdHours: 12,
    paymentRiskScore: 68,
    preferredCoin: "BTC",
    reputationDecryptionSuccessPct: 96.4,
    psycholinguisticDemeanor: "Commercial Support Desk persona. Highly structured discount tiers based on insurance and cashflow counter-proposals."
  },
  {
    syndicateName: "BlackCat / ALPHV",
    avgDiscountPct: 35,
    maxHistoricalDiscountPct: 55,
    optimalStallWindowHours: 36,
    bluffThresholdHours: 8,
    paymentRiskScore: 82,
    preferredCoin: "XMR",
    reputationDecryptionSuccessPct: 88.0,
    psycholinguisticDemeanor: "Aggressive, technical operators. High sensitivity to public disclosure; fast to publish leak snippets on extortion blog."
  },
  {
    syndicateName: "Akira Ransomware",
    avgDiscountPct: 60,
    maxHistoricalDiscountPct: 80,
    optimalStallWindowHours: 60,
    bluffThresholdHours: 18,
    paymentRiskScore: 45,
    preferredCoin: "BTC",
    reputationDecryptionSuccessPct: 98.2,
    psycholinguisticDemeanor: "High willingness to negotiate deep discounts for rapid cryptocurrency settlement within 48-72h."
  },
  {
    syndicateName: "Black Basta",
    avgDiscountPct: 30,
    maxHistoricalDiscountPct: 45,
    optimalStallWindowHours: 24,
    bluffThresholdHours: 6,
    paymentRiskScore: 79,
    preferredCoin: "BTC",
    reputationDecryptionSuccessPct: 92.5,
    psycholinguisticDemeanor: "Rigid corporate extortion tactics. Rapid escalation to DDoS or direct phone calling of C-suite executives."
  }
];

// Mock OFAC checks
const INITIAL_OFAC_CHECKS: OfacScreeningCheck[] = [
  {
    id: "ofac-01",
    cryptoAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    currency: "BTC",
    sdnMatch: false,
    sanctionedAffiliation: "None (Unsanctioned Private Cluster)",
    chainalysisRiskScore: 24,
    legalClearanceStatus: "CLEARED_LEGAL",
    reviewedBy: "Sarah Jenkins, Esq. (External Counsel)",
    timestamp: "2026-08-23 19:30:00 UTC"
  },
  {
    id: "ofac-02",
    cryptoAddress: "888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904",
    currency: "XMR",
    sdnMatch: false,
    sanctionedAffiliation: "Monero Privacy Pool (Low SDN Correlation)",
    chainalysisRiskScore: 48,
    legalClearanceStatus: "UNDER_REVIEW",
    reviewedBy: "OFAC Compliance Desk",
    timestamp: "2026-08-23 20:15:00 UTC"
  },
  {
    id: "ofac-03",
    cryptoAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    currency: "BTC",
    sdnMatch: true,
    sanctionedAffiliation: "Evil Corp / Maksim Yakubets (OFAC SDN #13849)",
    chainalysisRiskScore: 99,
    legalClearanceStatus: "SANCTIONED_BLOCKED",
    reviewedBy: "Automated OFAC Tripwire",
    timestamp: "2026-08-23 14:00:00 UTC"
  }
];

export default function ActorNegotiatorPage() {
  const [messages, setMessages] = useState<TorNegotiationMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [activeSyndicate, setActiveSyndicate] = useState<string>("LockBit 3.0 (Black)");
  const [ofacChecks, setOfacChecks] = useState<OfacScreeningCheck[]>(INITIAL_OFAC_CHECKS);
  const [initialDemandUSD, setInitialDemandUSD] = useState<number>(1800000);
  const [stallHours, setStallHours] = useState<number>(48);

  const selectedProfile = SYNDICATE_PROFILES.find(s => s.syndicateName === activeSyndicate) || SYNDICATE_PROFILES[0];
  const projectedDiscountUSD = initialDemandUSD * (1 - selectedProfile.avgDiscountPct / 100);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: TorNegotiationMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      sender: "AEGIS_NEGOTIATOR",
      messageText: inputText,
      sentimentScore: 0.05,
      frustrationScore: 0,
      bluffProbabilityPct: 0
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");

    // Simulate AI Threat Actor response based on psycholinguistics
    setTimeout(() => {
      const responseMsg: TorNegotiationMessage = {
        id: `msg-${Date.now() + 1}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        sender: "ACTOR_OPERATOR",
        messageText: `We have reviewed your request. Based on your financial disclosures, our management can lower the price to $${(initialDemandUSD * 0.65).toLocaleString()} BTC if transaction confirms within 24h.`,
        sentimentScore: -0.3,
        frustrationScore: 28,
        bluffProbabilityPct: 65.0,
        extractedTerms: {
          demandedAmountUSD: initialDemandUSD * 0.65,
          deadlineHoursRemaining: 24
        }
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 24px", minHeight: "calc(100vh - 54px)" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(6,182,212,0.06) 50%, rgba(14,21,38,0.9) 100%)",
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(245,158,11,0.4)"
          }}>
            <Bot size={24} color="#070b12" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                AI Threat Actor Psycholinguistic Negotiation & Ransom Curve Simulator
              </h1>
              <span style={{
                background: "rgba(245,158,11,0.2)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.4)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "monospace"
              }}>
                NLP TONE TRIAGE
              </span>
              <span style={{
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.35)",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "monospace"
              }}>
                OFAC SDN SCREENED
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>
              Parses Tor chat transcripts for operator demeanor, frustration cues, and deadline bluff probability while modeling historical ransomware discount curves and verifying OFAC sanctions clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>DEADLINE BLUFF PROBABILITY</span>
            <Sparkles size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>78.0% Bluff</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Extended timer likely</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>OPERATOR DEMEANOR</span>
            <Bot size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#06b6d4", marginTop: 4 }}>Affiliate Actor</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>High frustration volatility</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>HISTORICAL DISCOUNT AVG</span>
            <TrendingDown size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>-{selectedProfile.avgDiscountPct}%</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>{selectedProfile.syndicateName}</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>PROJECTED SETTLEMENT</span>
            <DollarSign size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>${(projectedDiscountUSD / 1000).toFixed(0)}k</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>from $1.80M initial demand</div>
        </div>

        <div className="card-tactical" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, fontWeight: 700 }}>
            <span>OFAC SANCTIONS STATUS</span>
            <ShieldCheck size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#10b981", marginTop: 4 }}>CLEARED LEGAL</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-2)", marginTop: 2 }}>Zero SDN list match</div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: 16, flex: 1 }}>
        {/* Left Column: Tor Chat Transcript & Psycholinguistic NLP Analyzer */}
        <div className="card-tactical" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={16} color="#06b6d4" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                LIVE TOR NEGOTIATION TRANSCRIPT STREAM (CASE INC-2026-8841)
              </span>
            </div>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>TOR ONION MIRROR 0x8841</span>
          </div>

          {/* Chat Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, maxHeight: 420, overflowY: "auto", paddingRight: 6 }}>
            {messages.map(msg => {
              const isActor = msg.sender.startsWith("ACTOR");
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isActor ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    background: isActor ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)",
                    border: isActor ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(16,185,129,0.3)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: isActor ? "#f43f5e" : "#10b981" }}>
                      {isActor ? `🔴 THREAT ACTOR (${msg.sender})` : "🟢 AEGIS IR NEGOTIATION TEAM"}
                    </span>
                    <span style={{ fontSize: 9.5, color: "var(--muted)" }}>{msg.timestamp}</span>
                  </div>

                  <p style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    {msg.messageText}
                  </p>

                  {isActor && (
                    <div style={{ display: "flex", gap: 6, fontSize: 9.5, background: "rgba(0,0,0,0.25)", padding: "4px 8px", borderRadius: 4, marginTop: 4 }}>
                      <span>Frustration Index: <strong style={{ color: "#f59e0b" }}>{msg.frustrationScore}/100</strong></span>
                      <span>•</span>
                      <span>Bluff Likelihood: <strong style={{ color: "#10b981" }}>{msg.bluffProbabilityPct}%</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type tactical IR negotiation response or counter-proposal..."
              style={{
                flex: 1,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 12,
                outline: "none"
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: "var(--primary)",
                border: "none",
                color: "#04100c",
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Send size={13} />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Discount Curve Modeler & OFAC Screener */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Syndicate Curve Selector */}
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>SYNDICATE DISCOUNT MODELER</span>
              <select
                value={activeSyndicate}
                onChange={(e) => setActiveSyndicate(e.target.value)}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                  fontSize: 11,
                  padding: "4px 8px",
                  borderRadius: 4,
                  outline: "none"
                }}
              >
                {SYNDICATE_PROFILES.map(s => (
                  <option key={s.syndicateName} value={s.syndicateName}>
                    {s.syndicateName} (-{s.avgDiscountPct}%)
                  </option>
                ))}
              </select>
            </div>

            <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
              {selectedProfile.psycholinguisticDemeanor}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "var(--surface-2)", padding: 10, borderRadius: 6 }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>Optimal Stall Window:</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#06b6d4" }}>{selectedProfile.optimalStallWindowHours} Hours</div>
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>Max Historical Discount:</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>-{selectedProfile.maxHistoricalDiscountPct}%</div>
              </div>
            </div>
          </div>

          {/* OFAC / Crypto Sanctions Screener */}
          <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={14} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)" }}>OFAC / CRYPTO SANCTIONS SCREENER</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ofacChecks.map(chk => (
                <div
                  key={chk.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "#06b6d4" }}>
                      {chk.cryptoAddress.substring(0, 16)}...
                    </span>
                    <span className={`badge-sev ${chk.legalClearanceStatus === "CLEARED_LEGAL" ? "badge-success" : chk.legalClearanceStatus === "SANCTIONED_BLOCKED" ? "badge-critical" : "badge-high"}`}>
                      {chk.legalClearanceStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Affiliation: <span style={{ color: "var(--fg-2)" }}>{chk.sanctionedAffiliation}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--muted)" }}>
                    <span>Chainalysis Risk: <strong>{chk.chainalysisRiskScore}/100</strong></span>
                    <span>Sign-off: {chk.reviewedBy.split(" ")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
