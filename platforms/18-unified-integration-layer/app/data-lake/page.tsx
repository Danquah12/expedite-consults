"use client";
import { useState } from "react";
import {
  Database, Search, Filter, Layers, Terminal, Code, Download, Copy,
  CheckCircle, HardDrive, Globe, Radio, FileCode, Sparkles, HelpCircle,
  Info, ArrowRight, Eye, CheckCircle2, Clock
} from "lucide-react";
import { DATA_LAKE_RECORDS } from "@/data/integrationData";
import { DataLakeRecord } from "@/types/integration";

export default function DataLakePage() {
  const [records, setRecords] = useState<DataLakeRecord[]>(DATA_LAKE_RECORDS);
  const [selectedPartition, setSelectedPartition] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<DataLakeRecord | null>(DATA_LAKE_RECORDS[0]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number>(34);
  const [activeViewerTab, setActiveViewerTab] = useState<"EXPLAIN" | "RAW_JSON">("EXPLAIN");

  const handleRunSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setQueryExecutionTime(Math.floor(Math.random() * 15 + 12));
    }, 300);
  };

  const handlePresetSearch = (query: string, partition: string = "ALL") => {
    setSearchQuery(query);
    setSelectedPartition(partition);
    handleRunSearch();
  };

  const filteredRecords = records.filter((r) => {
    if (selectedPartition !== "ALL" && r.partition !== selectedPartition) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.subjectHashOrHost.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ── Top Executive Header Banner ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(16,185,129,0.08) 100%)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: 12,
        padding: "18px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(6,182,212,0.35)"
          }}>
            <Database size={24} color="#050811" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
                Federated Security Data Lake & OpenSearch Workbench
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(6,182,212,0.15)",
                color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>
                OPENSEARCH v2.14
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "3px 0 0 0" }}>
              Unified querying across binary decompilation ASTs, S3 recovery manifests, DAST fuzz logs, and Zeek PCAP streams.
            </p>
          </div>
        </div>

        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--muted)"
        }}>
          Indexed Volume: <strong style={{ color: "#10b981" }}>44.2 TB</strong> · Shards: <strong style={{ color: "#06b6d4" }}>24/24 Healthy</strong>
        </div>
      </div>

      {/* ── Plain-English Helper Card ── */}
      <div style={{
        background: "rgba(6,182,212,0.06)",
        border: "1px solid rgba(6,182,212,0.25)",
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }}>
        <HelpCircle size={20} color="#06b6d4" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--foreground-muted)" }}>
          <strong style={{ color: "#06b6d4" }}>What Is A Security Data Lake? </strong>
          This is your central forensic archive. It stores and indexes every single security event, malware binary disassembly, encrypted backup manifest, and network PCAP packet across all 16 platforms. Analysts can search millions of records in milliseconds using the quick buttons or query bar below.
        </div>
      </div>

      {/* ── Query Bar & Quick Presets ── */}
      <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        
        {/* Search Bar */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="KQL Query (e.g. partition:re_binaries AND tags:ransomware OR host:api.customer*)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRunSearch()}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                fontSize: 12.5,
                background: "#050811",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "#f8fafc",
                outline: "none",
                fontFamily: "monospace"
              }}
            />
          </div>

          <button
            onClick={handleRunSearch}
            disabled={isSearching}
            className="btn-primary"
            style={{ padding: "0 20px", fontSize: 12, fontWeight: 800 }}
          >
            {isSearching ? "Searching..." : "Execute Search"}
          </button>
        </div>

        {/* 1-Click Quick Preset Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>QUICK PRESETS:</span>
          {[
            { label: "LockBit Payloads", q: "lockbit", p: "re_binaries" },
            { label: "WORM S3 Snapshots", q: "immutable", p: "recovery_snapshots" },
            { label: "JWT Fuzzing Traces", q: "jwt", p: "dast_http_traces" },
            { label: "TLS 1.3 PCAP Matches", q: "tls", p: "zeek_network_pcap" }
          ].map(pr => (
            <button
              key={pr.label}
              onClick={() => handlePresetSearch(pr.q, pr.p)}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 4,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "#38bdf8",
                cursor: "pointer"
              }}
            >
              {pr.label}
            </button>
          ))}
        </div>

      </div>

      {/* ── Partition Filters ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "ALL", label: "All Federated Partitions" },
          { id: "re_binaries", label: "Malware AST & Decompilation" },
          { id: "recovery_snapshots", label: "Aegis Recovery WORM Snapshots" },
          { id: "dast_http_traces", label: "AXIOM DAST HTTP Traces" },
          { id: "zeek_network_pcap", label: "Zeek Network PCAP Handshakes" }
        ].map(part => (
          <button
            key={part.id}
            onClick={() => setSelectedPartition(part.id)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 6,
              border: selectedPartition === part.id ? "1px solid #06b6d4" : "1px solid var(--border)",
              background: selectedPartition === part.id ? "rgba(6,182,212,0.15)" : "var(--surface-2)",
              color: selectedPartition === part.id ? "#06b6d4" : "var(--muted)",
              cursor: "pointer"
            }}
          >
            {part.label}
          </button>
        ))}
      </div>

      {/* ── Search Results & Record Viewer ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: 18 }}>
        
        {/* Results List */}
        <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong style={{ fontSize: 13, color: "#f8fafc" }}>
              Search Results ({filteredRecords.length} records found)
            </strong>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
              Latency: {queryExecutionTime}ms · 24/24 Shards Scanned
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: "rgba(6,182,212,0.15)",
                        color: "#06b6d4",
                        padding: "1px 5px",
                        borderRadius: 3,
                        fontFamily: "monospace"
                      }}>
                        {rec.partition}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: "#f8fafc" }}>{rec.id}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>{rec.timestamp}</span>
                  </div>

                  <div style={{ fontSize: 11.5, color: "var(--foreground)", fontWeight: 600 }}>
                    {rec.summary}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {rec.tags.map((t, idx) => (
                        <span key={idx} style={{ fontSize: 9.5, color: "#a855f7" }}>#{t}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>{rec.sizeMb} MB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Record Schema Viewer with Plain-English Breakdown */}
        {selectedRecord && (
          <div className="card-tactical" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 13, color: "#f8fafc" }}>Record Schema Viewer ({selectedRecord.id})</strong>
                <div style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "monospace" }}>
                  Subject Hash: {selectedRecord.subjectHashOrHost}
                </div>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setActiveViewerTab("EXPLAIN")}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: activeViewerTab === "EXPLAIN" ? "1px solid #10b981" : "1px solid var(--border)",
                    background: activeViewerTab === "EXPLAIN" ? "rgba(16,185,129,0.2)" : "var(--surface-3)",
                    color: activeViewerTab === "EXPLAIN" ? "#10b981" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  Plain-English Summary
                </button>
                <button
                  onClick={() => setActiveViewerTab("RAW_JSON")}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: activeViewerTab === "RAW_JSON" ? "1px solid #06b6d4" : "1px solid var(--border)",
                    background: activeViewerTab === "RAW_JSON" ? "rgba(6,182,212,0.2)" : "var(--surface-3)",
                    color: activeViewerTab === "RAW_JSON" ? "#06b6d4" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {activeViewerTab === "EXPLAIN" ? (
              <div style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 14,
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--foreground-muted)",
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}>
                <div>
                  <strong style={{ color: "#f8fafc" }}>What This Record Represents:</strong>
                  <p style={{ margin: "2px 0 0 0" }}>{selectedRecord.summary}</p>
                </div>
                <div>
                  <strong style={{ color: "#06b6d4" }}>Indexed Metadata & Artifacts:</strong>
                  <div style={{ background: "#050811", padding: 10, borderRadius: 6, marginTop: 4, fontFamily: "monospace", fontSize: 11 }}>
                    <div>• Partition: {selectedRecord.partition}</div>
                    <div>• Cryptographic Size: {selectedRecord.sizeMb} MB</div>
                    <div>• Ingested Timestamp: {selectedRecord.timestamp}</div>
                    <div>• Tags: {selectedRecord.tags.join(", ")}</div>
                  </div>
                </div>
              </div>
            ) : (
              <pre style={{
                background: "#050811",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 14,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#34d399",
                margin: 0,
                overflowY: "auto",
                maxHeight: 350
              }}>
                {JSON.stringify(selectedRecord.payloadPreview, null, 2)}
              </pre>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
