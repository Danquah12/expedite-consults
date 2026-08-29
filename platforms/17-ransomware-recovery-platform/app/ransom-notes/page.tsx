"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Key,
  Globe,
  Mail,
  DollarSign,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Sparkles,
  Layers,
  ShieldAlert,
  Sliders
} from "lucide-react";
import { MOCK_RANSOM_NOTES } from "@/data/recoveryData";
import { RansomNoteIntel } from "@/types/recovery";

export default function RansomNoteIntelligence() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>("note-001");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const sampleNotes: RansomNoteIntel[] = [
    MOCK_RANSOM_NOTES[0],
    {
      id: "note-002",
      caseId: "case-002",
      filename: "alphv_readme.txt",
      rawText: `>>> BlackCat / ALPHV Ransomware Notice <<<
Important: All your company databases and backup archives have been encrypted using military grade AES-256 and RSA-4096 algorithms.
Furthermore, we have exfiltrated 8.6 TB of private financial records, client SSNs, and executive emails.
If payment of $4,500,000 in Monero (XMR) or Bitcoin (BTC) is not made within 96 hours, all data will be published to our public leak mirror.
Negotiation Tor Link: http://alphvchat7xnk27b5yvhlkdjfk.onion/apex
Wallet: 888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904
Contact: alphv_negotiations@protonmail.com`,
      detectedLanguage: "English",
      paymentDemands: {
        amount: 72.0,
        currency: "BTC / XMR",
        usdEquivalent: 4500000
      },
      wallets: ["888tNkZrPN6JsEkgFjhx7739YvBkd7993kKlhZ904"],
      torUrls: ["http://alphvchat7xnk27b5yvhlkdjfk.onion/apex"],
      emails: ["alphv_negotiations@protonmail.com"],
      keyExtortionPhrases: [
        "military grade AES-256 and RSA-4096",
        "exfiltrated 8.6 TB of private financial records",
        "published to our public leak mirror"
      ],
      matchedFamilySimilarity: 96.2,
      attributionLead: "Scattered Spider (UNC3944 Affiliate)"
    },
    {
      id: "note-003",
      caseId: "case-003",
      filename: "README_ROYAL.txt",
      rawText: `Royal Ransomware Group.
We have encrypted your entire network and backed up all sensitive CAD blueprints and DoD contract records.
To restore systems, you must purchase the Royal Decryptor for $950,000 in Bitcoin.
Tor Portal: http://royal7xnk27b5yvhlkdjfk.onion/precision
BTC Address: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
Do not attempt third-party recovery software or modified files.`,
      detectedLanguage: "English",
      paymentDemands: {
        amount: 15.2,
        currency: "BTC",
        usdEquivalent: 950000
      },
      wallets: ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"],
      torUrls: ["http://royal7xnk27b5yvhlkdjfk.onion/precision"],
      emails: ["royal_help@onionmail.org"],
      keyExtortionPhrases: [
        "encrypted your entire network",
        "backed up all sensitive CAD blueprints",
        "purchase the Royal Decryptor"
      ],
      matchedFamilySimilarity: 91.8,
      attributionLead: "DEV-0569 (Zeon Syndicate)"
    }
  ];

  const currentNote = sampleNotes.find((n) => n.id === selectedNoteId) || sampleNotes[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const similarityMatches = [
    { campaign: "LockBit 3.0 Affiliate Gang #31", similarity: 98.4, date: "2026-07-14", sector: "Healthcare" },
    { campaign: "LockBit Supporter Group #18", similarity: 94.2, date: "2026-06-29", sector: "Biotech" },
    { campaign: "BlackCat / ALPHV Base Template", similarity: 62.1, date: "2026-08-01", sector: "Finance" },
    { campaign: "Royal Ransomware v2", similarity: 48.7, date: "2026-05-19", sector: "Defense" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#a855f7", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              PILLAR 1: EXTORTION NLP INTELLIGENCE
            </span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(168,85,247,0.15)", color: "#a855f7", fontWeight: 700 }}>
              DARKNET ONION & WALLET CORRELATOR
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", marginTop: 4 }}>
            Ransom Note NLP Intelligence & Wallet Extractor
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Select Note Sample:</span>
          {sampleNotes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNoteId(n.id)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: selectedNoteId === n.id ? "rgba(168,85,247,0.2)" : "var(--surface-2)",
                color: selectedNoteId === n.id ? "#a855f7" : "var(--muted)",
                border: selectedNoteId === n.id ? "1px solid #a855f7" : "1px solid var(--border)"
              }}
            >
              {n.filename}
            </button>
          ))}
        </div>
      </div>

      {/* EXTRACTED ENTITY CHIPS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Extortion Demand
            </span>
            <DollarSign size={15} color="#f43f5e" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f43f5e", marginTop: 8, fontFamily: "monospace" }}>
            ${(currentNote.paymentDemands.usdEquivalent / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            {currentNote.paymentDemands.amount} {currentNote.paymentDemands.currency}
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Identified Wallets
            </span>
            <Key size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b", marginTop: 8, fontFamily: "monospace" }}>
            {currentNote.wallets.length} Addresses
          </div>
          <div style={{ fontSize: 10.5, color: "#10b981", marginTop: 4 }}>
            Tracked on Darknet Ledger
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Tor Onion Mirrors
            </span>
            <Globe size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#06b6d4", marginTop: 8, fontFamily: "monospace" }}>
            {currentNote.torUrls.length} Portals
          </div>
          <div style={{ fontSize: 10.5, color: "#06b6d4", marginTop: 4 }}>
            v3 Onion Gateway Verified
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Similarity Match
            </span>
            <Sparkles size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#a855f7", marginTop: 8, fontFamily: "monospace" }}>
            {currentNote.matchedFamilySimilarity}%
          </div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>
            {currentNote.attributionLead}
          </div>
        </div>
      </div>

      {/* RAW NOTE VIEWER (LEFT) & NLP ENTITY INSPECTOR (RIGHT) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Raw Note Viewer with Syntax Line Numbers */}
        <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={15} color="#a855f7" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                Raw Ransom Note: <code style={{ color: "#a855f7" }}>{currentNote.filename}</code>
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentNote.rawText)}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: copiedText === currentNote.rawText ? "#10b981" : "var(--muted)",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11
              }}
            >
              {copiedText === currentNote.rawText ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedText === currentNote.rawText ? "Copied" : "Copy Raw"}</span>
            </button>
          </div>

          <div
            style={{
              background: "#040711",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "14px 16px",
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.6,
              color: "#38bdf8",
              whiteSpace: "pre-wrap",
              minHeight: 220
            }}
          >
            {currentNote.rawText}
          </div>

          {/* Sentiment and Coercion Analysis */}
          <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>
              NLP Psycholinguistic & Sentiment Assessment:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 10.5 }}>
              <div>
                <span style={{ color: "var(--muted)" }}>Extortion Model:</span>
                <div style={{ color: "#f43f5e", fontWeight: 700 }}>Double Extortion (Leak + Encrypt)</div>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Urgency / Coercion:</span>
                <div style={{ color: "#f59e0b", fontWeight: 700 }}>HIGH (72h Expiration)</div>
              </div>
              <div>
                <span style={{ color: "var(--muted)" }}>Threat Tone:</span>
                <div style={{ color: "#06b6d4", fontWeight: 700 }}>Professionalized Corporate Extortion</div>
              </div>
            </div>
          </div>
        </div>

        {/* NLP Entity Extractor & Cross-Case Matcher */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Extracted Entities */}
          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              EXTRACTED THREAT ENTITIES & TARGETS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Bitcoin / Monero Wallets:</span>
                {currentNote.wallets.map((w, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", padding: "6px 10px", borderRadius: 4, marginTop: 4 }}>
                    <code style={{ fontSize: 11, color: "#f59e0b" }}>{w}</code>
                    <button onClick={() => handleCopy(w)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Darknet Onion Portals:</span>
                {currentNote.torUrls.map((u, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", padding: "6px 10px", borderRadius: 4, marginTop: 4 }}>
                    <code style={{ fontSize: 11, color: "#06b6d4", wordBreak: "break-all" }}>{u}</code>
                    <button onClick={() => handleCopy(u)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Contact Emails:</span>
                {currentNote.emails.map((e, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", padding: "6px 10px", borderRadius: 4, marginTop: 4 }}>
                    <code style={{ fontSize: 11, color: "#10b981" }}>{e}</code>
                    <button onClick={() => handleCopy(e)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                      <Copy size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cross-Case Similarity Matcher */}
          <div className="card-tactical" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              CROSS-CASE NLP SIMILARITY MATRIX
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {similarityMatches.map((match, idx) => (
                <div key={idx} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#f8fafc" }}>{match.campaign}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{match.sector} · Observed {match.date}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: match.similarity > 90 ? "#10b981" : "#f59e0b", fontFamily: "monospace" }}>
                    {match.similarity}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
