"use client";
import { useState } from "react";
import {
  Database,
  Search,
  Filter,
  Layers,
  Terminal,
  Code,
  Download,
  Copy,
  CheckCircle,
  HardDrive,
  Globe,
  Radio,
  FileCode,
  Sparkles
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

  const handleRunSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setQueryExecutionTime(Math.floor(Math.random() * 20 + 15));
    }, 400);
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Database size={20} color="#06b6d4" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
              Federated Security Data Lake & OpenSearch Workbench
            </h1>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>
              Unified querying across binary decompilation ASTs, S3 recovery manifests, DAST fuzz logs, and Zeek PCAP streams.
            </p>
          </div>
        </div>

        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          padding: "6px 14px",
          borderRadius: 6,
          fontSize: 11.5,
          color: "var(--muted)"
        }}>
          Indexed Volume: <strong style={{ color: "#10b981" }}>44.2 TB</strong> · Query Engine: <strong style={{ color: "#06b6d4" }}>OpenSearch v2.14</strong>
        </div>
      </div>

      {/* Query Bar with KQL Search */}
      <div className="card-tactical" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "var(--surface-2)", padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <Search size={16} color="#06b6d4" />
            <input
              placeholder="KQL Query (e.g. partition:re_binaries AND tags:ransomware OR host:api.customer*)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunSearch()}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f8fafc",
                fontSize: 13,
                width: "100%",
                fontFamily: "monospace"
              }}
            />
          </div>

          <button
            onClick={handleRunSearch}
            className="btn-primary"
          >
            <span>Execute Search</span>
          </button>
        </div>

        {/* Preset Quick Queries */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>QUICK PRESETS:</span>
          {[
            { label: "LockBit Payloads", q: "tags:ransomware" },
            { label: "WORM S3 Snapshots", q: "tags:s3_worm" },
            { label: "JWT Fuzzing Traces", q: "tags:jwt_fuzzing" },
            { label: "TLS 1.3 PCAP Matches", q: "tags:ja3_match" }
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(preset.q);
                handleRunSearch();
              }}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--fg-2)",
                fontSize: 10.5,
                padding: "3px 8px",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partition Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        {[
          { id: "ALL", label: "All Federated Partitions" },
          { id: "re_binaries", label: "Malware AST & Decompilation" },
          { id: "recovery_snapshots", label: "Aegis Recovery WORM Snapshots" },
          { id: "dast_http_traces", label: "AXIOM DAST HTTP Traces" },
          { id: "zeek_network_pcap", label: "Zeek Network PCAP Handshakes" }
        ].map((part) => {
          const isSelected = selectedPartition === part.id;
          return (
            <button
              key={part.id}
              onClick={() => setSelectedPartition(part.id)}
              style={{
                background: isSelected ? "rgba(6,182,212,0.15)" : "var(--surface)",
                border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                color: isSelected ? "#06b6d4" : "var(--muted)",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: isSelected ? 800 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {part.label}
            </button>
          );
        })}
      </div>

      {/* Search Results & Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Results List */}
        <div className="card-tactical" style={{ padding: 16, height: 560, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
              Search Results ({filteredRecords.length} records found)
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
              Latency: {queryExecutionTime}ms · 24/24 Shards Scanned
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.12)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: "rgba(168,85,247,0.15)",
                        color: "#c084fc",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontFamily: "monospace"
                      }}>
                        {rec.partition}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 12, color: "#f8fafc" }}>
                        {rec.id}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>
                      {rec.timestamp}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginBottom: 6 }}>
                    {rec.summary}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {rec.tags.map((t, idx) => (
                        <span key={idx} style={{
                          fontSize: 9,
                          background: "var(--surface-3)",
                          color: "var(--muted)",
                          padding: "1px 5px",
                          borderRadius: 3
                        }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>
                      {(rec.rawSizeKb / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Record Deep Inspector */}
        <div className="card-tactical" style={{ padding: 16, height: 560, display: "flex", flexDirection: "column" }}>
          {selectedRecord ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>
                  Record Schema Viewer ({selectedRecord.id})
                </span>
                <span style={{ fontSize: 10, color: "#06b6d4", fontFamily: "monospace" }}>
                  {selectedRecord.source.toUpperCase()}
                </span>
              </div>

              <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, fontSize: 11, marginBottom: 10 }}>
                <div style={{ color: "var(--muted)", marginBottom: 2 }}>Subject Hash or Host Target:</div>
                <div style={{ fontFamily: "monospace", color: "#34d399", wordBreak: "break-all" }}>
                  {selectedRecord.subjectHashOrHost}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", background: "#050811", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
                <pre style={{ fontFamily: "monospace", fontSize: 11, color: "#06b6d4", margin: 0, whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(selectedRecord.indexedFields, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
              Select a data lake record to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
