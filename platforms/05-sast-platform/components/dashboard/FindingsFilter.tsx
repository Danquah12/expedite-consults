"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Severity } from "@/types/sast";

const TABS: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

type Props = {
  filter:   Severity | "All";
  search:   string;
  sortBy:   string;
  onFilter: (f: Severity | "All") => void;
  onSearch: (s: string) => void;
  onSort:   (s: string) => void;
  counts:   Record<string, number>;
};

const TAB_COLOR: Record<string, string> = {
  All:      "var(--primary)",
  Critical: "var(--critical)",
  High:     "var(--high)",
  Medium:   "var(--medium)",
  Low:      "var(--low)",
};

export default function FindingsFilter({ filter, search, sortBy, onFilter, onSearch, onSort, counts }: Props) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count  = tab === "All" ? (counts.total ?? 0) : (counts[tab.toLowerCase()] ?? 0);
          const active = filter === tab;
          const color  = TAB_COLOR[tab];
          return (
            <button
              key={tab}
              onClick={() => onFilter(tab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? `${color}18` : "var(--surface)",
                border: `1px solid ${active ? color : "var(--border)"}`,
                color: active ? color : "var(--muted)",
              }}
            >
              {tab}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: active ? `${color}30` : "var(--border)", color: active ? color : "var(--muted)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search by title, CWE, file..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Sort: {sortBy}</span>
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-20 min-w-[160px]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
            >
              {["Severity", "CVSS", "Confidence", "File"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onSort(opt); setShowSort(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:text-white"
                  style={{ color: sortBy === opt ? "var(--primary)" : "var(--muted)", background: sortBy === opt ? "rgba(0,212,255,0.08)" : "transparent" }}
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
