"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import type { Severity } from "@/types/sast";

const TABS: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

type Props = {
  filter:          Severity | "All";
  search:          string;
  sortBy:          string;
  onFilter:        (f: Severity | "All") => void;
  onSearch:        (s: string) => void;
  onSort:          (s: string) => void;
  counts:          Record<string, number>;
  displayMode?:    "grid" | "table";
  onDisplayMode?:  (m: "grid" | "table") => void;
};

const TAB_COLOR: Record<string, string> = {
  All:      "var(--primary)",
  Critical: "var(--critical)",
  High:     "var(--high)",
  Medium:   "var(--medium)",
  Low:      "var(--low)",
};

export default function FindingsFilter({
  filter,
  search,
  sortBy,
  onFilter,
  onSearch,
  onSort,
  counts,
  displayMode = "grid",
  onDisplayMode,
}: Props) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Top row: Severity filter pills + Grid/Table toggle */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TABS.map((tab) => {
            const count  = tab === "All" ? (counts.total ?? 0) : (counts[tab.toLowerCase()] ?? 0);
            const active = filter === tab;
            const color  = TAB_COLOR[tab];
            return (
              <button
                key={tab}
                onClick={() => onFilter(tab)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 13px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: active ? "rgba(122, 162, 247, 0.1)" : "var(--background)",
                  border: `1px solid ${active ? color : "var(--border)"}`,
                  color: active ? color : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span>{tab}</span>
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: active ? "rgba(255, 255, 255, 0.08)" : "var(--surface)",
                    color: active ? color : "var(--muted)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {onDisplayMode && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            <button
              onClick={() => onDisplayMode("grid")}
              title="Card Grid View"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 600,
                background: displayMode === "grid" ? "var(--surface)" : "transparent",
                color: displayMode === "grid" ? "var(--foreground)" : "var(--muted)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => onDisplayMode("table")}
              title="Compact Triage Table View"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 600,
                background: displayMode === "table" ? "var(--surface)" : "transparent",
                color: displayMode === "table" ? "var(--foreground)" : "var(--muted)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>
        )}
      </div>

      {/* Bottom row: Search input + Sort dropdown */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            className="w-4 h-4"
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search findings by title, CWE, OWASP category, or file path... (Press /)"
            style={{
              width: "100%",
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 10,
              fontSize: 13,
              outline: "none",
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowSort(!showSort)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 600,
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            <span>Sort: {sortBy}</span>
          </button>
          {showSort && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 6,
                borderRadius: 10,
                overflow: "hidden",
                zIndex: 30,
                minWidth: 160,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.45)",
              }}
            >
              {["Severity", "CVSS", "Confidence", "File"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onSort(opt);
                    setShowSort(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 14px",
                    fontSize: 12.5,
                    fontWeight: sortBy === opt ? 600 : 400,
                    color: sortBy === opt ? "var(--primary)" : "var(--foreground)",
                    background: sortBy === opt ? "rgba(122, 162, 247, 0.08)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
