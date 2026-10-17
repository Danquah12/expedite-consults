import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import FindingCard from "./FindingCard";
import type { SASTFinding } from "@/types/sast";

type Props = {
  findings: SASTFinding[];
  displayMode?: "grid" | "table";
  columns?: 2 | 3;
};

const SEV_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  Critical: { text: "var(--critical)", bg: "rgba(229, 72, 77, 0.08)",  border: "rgba(229, 72, 77, 0.25)" },
  High:     { text: "var(--high)",     bg: "rgba(226, 133, 59, 0.08)", border: "rgba(226, 133, 59, 0.25)" },
  Medium:   { text: "var(--medium)",   bg: "rgba(214, 168, 71, 0.08)", border: "rgba(214, 168, 71, 0.25)" },
  Low:      { text: "var(--low)",      bg: "rgba(70, 163, 110, 0.08)", border: "rgba(70, 163, 110, 0.25)" },
};

export default function FindingsGrid({
  findings,
  displayMode = "grid",
  columns = 3,
}: Props) {
  if (findings.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "56px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
          No findings match your current filters
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Try clearing the severity filter or adjusting your search query.
        </p>
      </div>
    );
  }

  if (displayMode === "table") {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr
                style={{
                  background: "var(--background)",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--muted)",
                }}
              >
                <th style={{ padding: "12px 16px" }}>Severity</th>
                <th style={{ padding: "12px 16px" }}>Vulnerability & Location</th>
                <th style={{ padding: "12px 16px" }}>CWE / OWASP</th>
                <th style={{ padding: "12px 16px" }}>CVSS</th>
                <th style={{ padding: "12px 16px" }}>Engines</th>
                <th style={{ padding: "12px 16px" }}>Confidence</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => {
                const sev = SEV_COLOR[f.severity] ?? SEV_COLOR.Low;
                const confirmedCount = f.engines.filter((e) => e.confirmed).length;
                return (
                  <tr
                    key={f.id}
                    className="hover-row"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontSize: 12.5,
                    }}
                  >
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: sev.bg,
                          border: `1px solid ${sev.border}`,
                          color: sev.text,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: sev.text,
                          }}
                        />
                        {f.severity}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", maxWidth: 320 }}>
                      <Link
                        href={`/finding/${f.id}`}
                        style={{
                          color: "var(--foreground)",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span>{f.title}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: "var(--muted)", flexShrink: 0 }} />
                      </Link>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: "var(--muted)",
                          marginTop: 3,
                        }}
                      >
                        {f.file.split("/").slice(-2).join("/")}:{f.line}
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontFamily: "var(--font-mono)",
                          color: "var(--foreground)",
                          fontWeight: 600,
                        }}
                      >
                        {f.cwe}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{f.owasp}</div>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          color: f.cvss >= 9 ? "var(--critical)" : f.cvss >= 7 ? "var(--high)" : "var(--foreground)",
                        }}
                      >
                        {f.cvss.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          color: "var(--low)",
                          background: "rgba(70, 163, 110, 0.08)",
                          border: "1px solid rgba(70, 163, 110, 0.25)",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {confirmedCount}/{f.engines.length}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 56,
                            height: 5,
                            borderRadius: 999,
                            background: "var(--background)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.round(f.confidence * 100)}%`,
                              height: "100%",
                              background: f.confidence >= 0.85 ? "var(--low)" : "var(--primary)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background:
                            f.status === "Open"
                              ? "rgba(229, 72, 77, 0.1)"
                              : f.status === "In Progress"
                              ? "rgba(226, 133, 59, 0.1)"
                              : "rgba(70, 163, 110, 0.1)",
                          color:
                            f.status === "Open"
                              ? "var(--critical)"
                              : f.status === "In Progress"
                              ? "var(--high)"
                              : "var(--low)",
                        }}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        columns === 2
          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      }
    >
      {findings.map((f) => (
        <FindingCard key={f.id} finding={f} />
      ))}
    </div>
  );
}
