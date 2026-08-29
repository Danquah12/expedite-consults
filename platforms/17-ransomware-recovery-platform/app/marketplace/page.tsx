"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Key,
  ShieldCheck,
  CheckCircle2,
  Download,
  Play,
  Search,
  Filter,
  ExternalLink,
  Code2,
  Sliders,
  Terminal,
  Cpu,
  RefreshCw,
  HardDrive,
  FileCode,
  Layers,
  Sparkles
} from "lucide-react";
import { MOCK_CASES } from "@/data/recoveryData";

interface DecryptorTool {
  id: string;
  name: string;
  family: string;
  author: string;
  version: string;
  type: "OFFICIAL_PARTNER" | "PROPRIETARY_AEGIS" | "OPEN_SOURCE" | "COMMUNITY";
  signatureStatus: "GPG_VALID" | "AUTHENTICODE_VERIFIED" | "SANDBOX_TESTED";
  supportedExtensions: string[];
  successRatePct: number;
  description: string;
  ciphersTargeted: string;
  requiresMasterKey: boolean;
}

const DECRYPTOR_REGISTRY: DecryptorTool[] = [
  {
    id: "dec-001",
    name: "Aegis DecryptIQ v4.8 (Enterprise Master Engine)",
    family: "Multi-Family (LockBit / BlackCat / Royal)",
    author: "Aegis Threat Intelligence Labs",
    version: "4.8.2-PROD",
    type: "PROPRIETARY_AEGIS",
    signatureStatus: "AUTHENTICODE_VERIFIED",
    supportedExtensions: [".lockbit", ".crypted", ".royal_u"],
    successRatePct: 99.4,
    description: "Enterprise decryption engine integrating hardware-accelerated GPU keyspace search, Merkle tree header validation, and lossless transactional rollback.",
    ciphersTargeted: "AES-256-CTR, ChaCha20, Curve25519",
    requiresMasterKey: false
  },
  {
    id: "dec-002",
    name: "Wanakiwi In-Memory Key Carver",
    family: "WannaCry 2.0 / NotPetya",
    author: "Benjamin Delpy (Gentilkiwi) / NoMoreRansom",
    version: "0.2.1-RELEASE",
    type: "OFFICIAL_PARTNER",
    signatureStatus: "GPG_VALID",
    supportedExtensions: [".wncry", ".wcry"],
    successRatePct: 94.5,
    description: "Extracts prime factors p and q from unallocated Windows CryptReleaseContext heap pages on unbooted infected endpoints.",
    ciphersTargeted: "RSA-2048 Ephemeral Primes",
    requiresMasterKey: false
  },
  {
    id: "dec-003",
    name: "Emsisoft STOP / DJVU Decryptor",
    family: "STOP / DJVU",
    author: "Emsisoft / Michael Gillespie",
    version: "1.0.0.84",
    type: "OFFICIAL_PARTNER",
    signatureStatus: "AUTHENTICODE_VERIFIED",
    supportedExtensions: [".djvu", ".rumba", ".gero", ".foop"],
    successRatePct: 88.0,
    description: "Recovers files locked with offline hardcoded threat actor keys or known keystream pairs for over 140 STOP ransomware variants.",
    ciphersTargeted: "AES-128 + Static Keys",
    requiresMasterKey: false
  },
  {
    id: "dec-004",
    name: "Babuk Source Leak Universal ESXi Decryptor",
    family: "Babuk / Babuk Locker",
    author: "Avast Threat Labs",
    version: "2.1.0",
    type: "OPEN_SOURCE",
    signatureStatus: "GPG_VALID",
    supportedExtensions: [".babyk", ".babuk"],
    successRatePct: 91.0,
    description: "Applies 14 leaked master private ECDH keys to decrypt Babuk-encrypted Linux and ESXi virtual disk datastores.",
    ciphersTargeted: "Curve25519 ECDH + Sosemanuk",
    requiresMasterKey: true
  }
];

export default function MarketplacePage() {
  const [selectedCaseId, setSelectedCaseId] = useState("case-001");
  const [decryptors, setDecryptors] = useState<DecryptorTool[]>(DECRYPTOR_REGISTRY);
  const [selectedTool, setSelectedTool] = useState<DecryptorTool>(DECRYPTOR_REGISTRY[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLauncherModal, setShowLauncherModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [dryRun, setDryRun] = useState(true);

  const activeCase = MOCK_CASES.find((c) => c.id === selectedCaseId) || MOCK_CASES[0];

  const filteredDecryptors = decryptors.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.family.toLowerCase().includes(q) ||
      d.author.toLowerCase().includes(q) ||
      d.supportedExtensions.some((ext) => ext.toLowerCase().includes(q))
    );
  });

  const launchExecution = () => {
    setIsExecuting(true);
    setProgressCount(0);

    const interval = setInterval(() => {
      setProgressCount((prev) => {
        if (prev >= 47281) {
          clearInterval(interval);
          setIsExecuting(false);
          return 47281;
        }
        return prev + 8500;
      });
    }, 300);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,21,38,0.95) 0%, rgba(22,32,56,0.95) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Store size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.01em" }}>
              Decryptor & Plugin Marketplace Hub
            </h1>
            <span className="badge-sev badge-success">Pillar 3: Recover & Orchestrate</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 840, lineHeight: 1.5 }}>
            Catalog of cryptographically verified, sandboxed ransomware decryptors and DFIR Python/PowerShell plugins.
            Partnership integration with No More Ransom, Emsisoft Labs, and Aegis DecryptIQ with GPG code signatures.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid #10b981",
            borderRadius: 8,
            padding: "8px 14px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>
              Verified Signatures
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
              100% GPG / Authenticode
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Cataloged Decryptors
            </span>
            <Key size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
            {decryptors.length} Verified Tools
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>
            Covering 40+ Ransomware Variants
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              No More Ransom Link
            </span>
            <ShieldCheck size={15} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#06b6d4" }}>
            CONNECTED
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Direct Europol/EC3 Feed
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Target Case Match
            </span>
            <Sparkles size={15} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>
            Aegis DecryptIQ (LockBit)
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Backup-Assisted Key Restoral
          </div>
        </div>

        <div className="card-tactical" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              DFIR Custom Plugins
            </span>
            <Code2 size={15} color="#a855f7" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#a855f7" }}>
            18 Scripts
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Python 3.12 / PowerShell 7.4
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog List & Selected Workbench */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left: Decryptor Tool Catalog */}
        <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
              Validated Decryptor Tools Registry
            </h3>

            <div style={{ position: "relative" }}>
              <Search size={13} color="var(--muted)" style={{ position: "absolute", left: 8, top: 9 }} />
              <input
                type="text"
                placeholder="Search decryptor / extension..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ paddingLeft: 26, fontSize: 11.5, height: 30, width: 220 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredDecryptors.map((tool) => {
              const isSelected = selectedTool.id === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  style={{
                    background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: 13 }}>
                          {tool.name}
                        </span>
                        <span className="badge-sev badge-success">
                          {tool.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Author: <strong style={{ color: "var(--fg-2)" }}>{tool.author}</strong> · Target: <span style={{ color: "#06b6d4" }}>{tool.family}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#10b981" }}>
                        {tool.successRatePct}%
                      </div>
                      <div style={{ fontSize: 9.5, color: "var(--muted)", textTransform: "uppercase" }}>
                        Success Rate
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4, margin: 0 }}>
                    {tool.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 6, fontSize: 10.5 }}>
                    <span style={{ color: "var(--muted)" }}>
                      Extensions: {tool.supportedExtensions.map((ext) => (
                        <code key={ext} style={{ color: "#10b981", marginRight: 4 }}>{ext}</code>
                      ))}
                    </span>
                    <span style={{ color: "#06b6d4", fontWeight: 700 }}>
                      {tool.signatureStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Decryptor Workbench & Enclave Launcher */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-tactical" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <div>
                <span className="badge-sev badge-success">
                  {selectedTool.version}
                </span>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>
                  Decryptor Configuration Workbench
                </h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                  Target Volume / Disk Image Path
                </label>
                <input
                  type="text"
                  defaultValue="D:\Quarantine\Enclave_01\SQL-CLINICAL-01.vmdk"
                  className="tool-input"
                  style={{ width: "100%", fontSize: 11.5 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Execution Threads
                  </label>
                  <select className="tool-select" style={{ width: "100%", fontSize: 11.5 }}>
                    <option>16 Threads (GPU Acceleration)</option>
                    <option>8 Threads (Standard)</option>
                    <option>4 Threads (Low Memory)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Dry-Run Safe Mode
                  </label>
                  <button
                    onClick={() => setDryRun(!dryRun)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      background: dryRun ? "rgba(16,185,129,0.15)" : "var(--surface-2)",
                      border: dryRun ? "1px solid #10b981" : "1px solid var(--border)",
                      color: dryRun ? "#10b981" : "var(--muted)",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {dryRun ? "Dry-Run Active (No writes)" : "Live Decryption Mode"}
                  </button>
                </div>
              </div>

              <button
                onClick={launchExecution}
                disabled={isExecuting}
                className="btn-primary"
                style={{ justifyContent: "center", marginTop: 6 }}
              >
                <Play size={14} className={isExecuting ? "animate-spin" : ""} />
                {isExecuting ? "Executing in Quarantine Enclave..." : "Launch Decryptor in Enclave"}
              </button>

              {/* Progress Bar */}
              {isExecuting && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Files Processed:</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>
                      {progressCount.toLocaleString()} / 47,281
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(progressCount / 47281) * 100}%`, height: "100%", background: "#10b981", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
