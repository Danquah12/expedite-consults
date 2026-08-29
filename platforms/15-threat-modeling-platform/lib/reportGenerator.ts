import type { Finding } from "@/types/dast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportMeta {
  name?: string;
  target?: string;
  environment?: string;
  profile?: string;
  duration?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity: string): string {
  switch ((severity ?? "").toLowerCase()) {
    case "critical": return "#da3633";
    case "high":     return "#e85e2c";
    case "medium":   return "#e3b341";
    case "low":      return "#3fb950";
    case "info":     return "#58a6ff";
    default:         return "#8b949e";
  }
}

function severityBgColor(severity: string): string {
  switch ((severity ?? "").toLowerCase()) {
    case "critical": return "rgba(218,54,51,0.18)";
    case "high":     return "rgba(232,94,44,0.18)";
    case "medium":   return "rgba(227,179,65,0.18)";
    case "low":      return "rgba(63,185,80,0.18)";
    case "info":     return "rgba(88,166,255,0.18)";
    default:         return "rgba(139,148,158,0.18)";
  }
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function countBySeverity(findings: Finding[], severity: string): number {
  return findings.filter(
    (f) => (f.severity ?? "").toLowerCase() === severity.toLowerCase()
  ).length;
}

function countVerified(findings: Finding[]): number {
  return findings.filter(
    (f) =>
      (f.verificationStatus ?? "").toLowerCase() === "verified" ||
      (f.verificationStatus ?? "").toLowerCase() === "confirmed"
  ).length;
}

function getTarget(finding: Finding): string {
  return (
    (finding as any).url ||
    (finding as any).target ||
    (finding as any).source ||
    ""
  );
}

// ---------------------------------------------------------------------------
// generateHTMLReport
// ---------------------------------------------------------------------------

export function generateHTMLReport(
  findings: Finding[],
  meta?: ReportMeta
): string {
  const reportName  = meta?.name        ?? "DAST Security Scan Report";
  const target      = meta?.target      ?? "\u2014";
  const environment = meta?.environment ?? "\u2014";
  const profile     = meta?.profile     ?? "\u2014";
  const duration    = meta?.duration    ?? "\u2014";
  const reportDate  = new Date().toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const total         = findings.length;
  const criticalCount = countBySeverity(findings, "critical");
  const highCount     = countBySeverity(findings, "high");
  const mediumCount   = countBySeverity(findings, "medium");
  const lowCount      = countBySeverity(findings, "low");
  const infoCount     = countBySeverity(findings, "info");
  const verifiedCount = countVerified(findings);

  const pct = (n: number) =>
    total > 0 ? Math.max(2, Math.round((n / total) * 100)) : 0;

  const findingCards = findings
    .map((f, idx) => {
      const sev     = f.severity ?? "Unknown";
      const fTarget = escapeHtml(getTarget(f));
      const verified =
        (f.verificationStatus ?? "").toLowerCase() === "verified" ||
        (f.verificationStatus ?? "").toLowerCase() === "confirmed";
      return `
      <div class="finding-card" id="finding-${escapeHtml(f.id ?? String(idx + 1))}">
        <div class="finding-header">
          <div class="finding-meta-row">
            <span class="finding-id">#${escapeHtml(f.id ?? String(idx + 1))}</span>
            <span class="badge" style="background:${severityBgColor(sev)};color:${severityColor(sev)};border:1px solid ${severityColor(sev)}40;">${escapeHtml(sev.toUpperCase())}</span>
            ${verified ? `<span class="badge badge-verified">VERIFIED</span>` : ""}
            ${f.plugin ? `<span class="finding-plugin">${escapeHtml(f.plugin)}</span>` : ""}
          </div>
          <h3 class="finding-title">${escapeHtml(f.title ?? "Untitled Finding")}</h3>
        </div>
        <div class="finding-body">
          ${f.description ? `<div class="finding-section"><div class="section-label">Description</div><div class="section-content">${escapeHtml(f.description)}</div></div>` : ""}
          ${fTarget ? `<div class="finding-section"><div class="section-label">Target / URL</div><div class="section-content mono">${fTarget}</div></div>` : ""}
          ${f.method ? `<div class="finding-section"><div class="section-label">Method</div><div class="section-content mono">${escapeHtml(f.method)}</div></div>` : ""}
          ${f.remediation ? `<div class="finding-section"><div class="section-label">Remediation</div><div class="section-content remediation">${escapeHtml(f.remediation)}</div></div>` : ""}
        </div>
      </div>`;
    })
    .join("\n");

  const severityRows = (
    [
      { label: "Critical", key: "critical", count: criticalCount },
      { label: "High",     key: "high",     count: highCount     },
      { label: "Medium",   key: "medium",   count: mediumCount   },
      { label: "Low",      key: "low",      count: lowCount      },
      { label: "Info",     key: "info",     count: infoCount     },
    ] as const
  )
    .map(({ label, key, count }) => `
      <tr>
        <td><span class="badge" style="background:${severityBgColor(key)};color:${severityColor(key)};border:1px solid ${severityColor(key)}40;">${label.toUpperCase()}</span></td>
        <td style="text-align:right;padding-right:12px;">${count}</td>
        <td style="width:60%;"><div class="dist-bar-bg"><div class="dist-bar" style="width:${pct(count)}%;background:${severityColor(key)};"></div></div></td>
        <td style="text-align:right;color:#8b949e;font-size:12px;">${total > 0 ? Math.round((count / total) * 100) : 0}%</td>
      </tr>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(reportName)} - AXIOM Security</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#0d1117;color:#e6edf3;line-height:1.6;min-height:100vh}
    a{color:#58a6ff;text-decoration:none}
    a:hover{text-decoration:underline}
    .page-wrapper{max-width:1080px;margin:0 auto;padding:0 24px 80px}
    .cover{background:linear-gradient(135deg,#161b22 0%,#0d1117 60%,#1a1f2e 100%);border-bottom:2px solid #e8912d;padding:56px 24px 48px;margin-bottom:48px;position:relative;overflow:hidden}
    .cover::before{content:'';position:absolute;top:-80px;right:-80px;width:340px;height:340px;background:radial-gradient(circle,rgba(232,145,45,0.10) 0%,transparent 70%);pointer-events:none}
    .cover-inner{max-width:1080px;margin:0 auto;position:relative}
    .brand-row{display:flex;align-items:center;gap:14px;margin-bottom:32px}
    .brand-logo{width:44px;height:44px;background:#e8912d;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#0d1117;letter-spacing:-1px;flex-shrink:0}
    .brand-name{font-size:18px;font-weight:700;color:#e6edf3;letter-spacing:0.04em}
    .brand-tagline{font-size:11px;color:#8b949e;letter-spacing:0.12em;text-transform:uppercase}
    .report-title{font-size:36px;font-weight:800;color:#e6edf3;line-height:1.2;margin-bottom:8px;letter-spacing:-0.5px}
    .report-subtitle{font-size:14px;color:#8b949e;margin-bottom:36px}
    .meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
    .meta-item{background:rgba(255,255,255,0.04);border:1px solid #30363d;border-radius:8px;padding:14px 16px}
    .meta-label{font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#8b949e;margin-bottom:4px}
    .meta-value{font-size:14px;font-weight:600;color:#e6edf3;word-break:break-all}
    .confidential-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(218,54,51,0.15);border:1px solid rgba(218,54,51,0.4);color:#da3633;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:16px}
    .stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
    .stat-card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:20px 16px;text-align:center;position:relative;overflow:hidden}
    .stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px}
    .stat-card.total::after{background:#58a6ff}
    .stat-card.critical::after{background:#da3633}
    .stat-card.high::after{background:#e85e2c}
    .stat-card.verified::after{background:#3fb950}
    .stat-value{font-size:40px;font-weight:800;line-height:1;margin-bottom:6px}
    .stat-card.total .stat-value{color:#58a6ff}
    .stat-card.critical .stat-value{color:#da3633}
    .stat-card.high .stat-value{color:#e85e2c}
    .stat-card.verified .stat-value{color:#3fb950}
    .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8b949e;font-weight:600}
    .section{margin-bottom:48px}
    .section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #21262d}
    .section-icon{width:32px;height:32px;border-radius:8px;background:rgba(232,145,45,0.15);display:flex;align-items:center;justify-content:center;font-size:16px}
    .section-title{font-size:20px;font-weight:700;color:#e6edf3}
    .section-count{margin-left:auto;font-size:13px;color:#8b949e;background:#21262d;padding:2px 10px;border-radius:12px}
    .dist-table{width:100%;border-collapse:collapse;background:#161b22;border:1px solid #30363d;border-radius:10px;overflow:hidden}
    .dist-table td{padding:12px 14px;vertical-align:middle;border-bottom:1px solid #21262d}
    .dist-table tr:last-child td{border-bottom:none}
    .dist-bar-bg{background:#21262d;border-radius:4px;height:8px;overflow:hidden}
    .dist-bar{height:8px;border-radius:4px}
    .findings-list{display:flex;flex-direction:column;gap:20px}
    .finding-card{background:#161b22;border:1px solid #30363d;border-radius:10px;overflow:hidden}
    .finding-header{padding:18px 20px 14px;border-bottom:1px solid #21262d;background:rgba(255,255,255,0.02)}
    .finding-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .finding-id{font-size:12px;color:#8b949e;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;background:#21262d;padding:2px 8px;border-radius:4px}
    .badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:0.06em;text-transform:uppercase}
    .badge-verified{background:rgba(63,185,80,0.15)!important;color:#3fb950!important;border:1px solid rgba(63,185,80,0.35)!important}
    .finding-plugin{font-size:11px;color:#8b949e;background:#21262d;padding:2px 8px;border-radius:4px;margin-left:auto}
    .finding-title{font-size:17px;font-weight:700;color:#e6edf3;line-height:1.4}
    .finding-body{padding:16px 20px;display:flex;flex-direction:column;gap:14px}
    .section-label{font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#8b949e;font-weight:700;margin-bottom:6px}
    .section-content{font-size:14px;color:#c9d1d9;line-height:1.65;white-space:pre-wrap;word-break:break-word}
    .section-content.mono{font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:13px;background:#0d1117;padding:10px 14px;border-radius:6px;border:1px solid #30363d;color:#79c0ff}
    .section-content.remediation{background:rgba(63,185,80,0.06);border-left:3px solid #3fb950;padding:10px 14px;border-radius:0 6px 6px 0}
    .compliance-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
    .compliance-card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:20px}
    .compliance-name{font-size:15px;font-weight:700;color:#e8912d;margin-bottom:6px}
    .compliance-desc{font-size:13px;color:#8b949e;line-height:1.55}
    .empty-state{text-align:center;padding:60px 24px;color:#8b949e}
    .empty-icon{font-size:48px;margin-bottom:16px}
    .empty-title{font-size:20px;font-weight:700;color:#e6edf3;margin-bottom:8px}
    .footer{margin-top:80px;padding:32px 0 24px;border-top:1px solid #21262d;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
    .footer-brand{font-size:13px;font-weight:700;color:#e8912d}
    .footer-version{font-size:12px;color:#8b949e}
    .footer-confidential{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#da3633}
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-inner">
      <div class="brand-row">
        <div class="brand-logo">AX</div>
        <div>
          <div class="brand-name">AXIOM</div>
          <div class="brand-tagline">Security Intelligence Platform</div>
        </div>
      </div>
      <div class="confidential-badge">CONFIDENTIAL</div>
      <h1 class="report-title">${escapeHtml(reportName)}</h1>
      <p class="report-subtitle">Dynamic Application Security Testing &mdash; Full Scan Report</p>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">Target</div><div class="meta-value">${escapeHtml(target)}</div></div>
        <div class="meta-item"><div class="meta-label">Environment</div><div class="meta-value">${escapeHtml(environment)}</div></div>
        <div class="meta-item"><div class="meta-label">Scan Profile</div><div class="meta-value">${escapeHtml(profile)}</div></div>
        <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${escapeHtml(duration)}</div></div>
        <div class="meta-item"><div class="meta-label">Report Generated</div><div class="meta-value" style="font-size:12px;">${escapeHtml(reportDate)}</div></div>
        <div class="meta-item"><div class="meta-label">Total Findings</div><div class="meta-value" style="color:#e8912d;">${total}</div></div>
      </div>
    </div>
  </div>
  <div class="page-wrapper">
    <div class="stats-bar">
      <div class="stat-card total"><div class="stat-value">${total}</div><div class="stat-label">Total Findings</div></div>
      <div class="stat-card critical"><div class="stat-value">${criticalCount}</div><div class="stat-label">Critical</div></div>
      <div class="stat-card high"><div class="stat-value">${highCount}</div><div class="stat-label">High</div></div>
      <div class="stat-card verified"><div class="stat-value">${verifiedCount}</div><div class="stat-label">Verified</div></div>
    </div>
    <div class="section">
      <div class="section-header"><div class="section-icon">&#x1F4CA;</div><h2 class="section-title">Severity Distribution</h2></div>
      ${total === 0
        ? `<div class="empty-state"><div class="empty-icon">&#x2705;</div><div class="empty-title">No findings to display</div><p>No vulnerabilities were detected during this scan.</p></div>`
        : `<table class="dist-table">${severityRows}</table>`}
    </div>
    <div class="section">
      <div class="section-header"><div class="section-icon">&#x1F50D;</div><h2 class="section-title">Finding Details</h2><span class="section-count">${total} finding${total !== 1 ? "s" : ""}</span></div>
      ${findings.length === 0
        ? `<div class="empty-state"><div class="empty-icon">&#x2705;</div><div class="empty-title">No findings detected</div><p>The scan completed with no vulnerabilities identified.</p></div>`
        : `<div class="findings-list">${findingCards}</div>`}
    </div>
    <div class="section">
      <div class="section-header"><div class="section-icon">&#x1F3DB;&#xFE0F;</div><h2 class="section-title">Compliance Frameworks</h2></div>
      <div class="compliance-grid">
        <div class="compliance-card"><div class="compliance-name">NIST SP 800-115</div><div class="compliance-desc">Technical Guide to Information Security Testing and Assessment. This report supports NIST-aligned vulnerability identification and risk scoring workflows.</div></div>
        <div class="compliance-card"><div class="compliance-name">PCI DSS</div><div class="compliance-desc">Payment Card Industry Data Security Standard. DAST scanning addresses requirements 6.3.2 and 11.3 for application vulnerability testing and penetration testing.</div></div>
        <div class="compliance-card"><div class="compliance-name">HIPAA Security Rule</div><div class="compliance-desc">Health Insurance Portability and Accountability Act. Supports evaluation requirements and technical safeguard verification for ePHI systems.</div></div>
        <div class="compliance-card"><div class="compliance-name">SOC 2 Type II</div><div class="compliance-desc">System and Organization Controls. Addresses the CC6 Common Criteria related to logical and physical access controls and risk mitigation activities.</div></div>
        <div class="compliance-card"><div class="compliance-name">OWASP Top 10</div><div class="compliance-desc">Open Web Application Security Project. Findings are categorized against the OWASP Top 10 for industry-standard vulnerability classification and prioritization.</div></div>
        <div class="compliance-card"><div class="compliance-name">ISO/IEC 27001</div><div class="compliance-desc">Information Security Management System. DAST results support Annex A.14 system acquisition, development, and maintenance security controls.</div></div>
      </div>
    </div>
  </div>
  <div style="max-width:1080px;margin:0 auto;padding:0 24px;">
    <div class="footer">
      <div>
        <div class="footer-brand">AXIOM Security Intelligence Platform v4.0</div>
        <div class="footer-version">DAST Module &mdash; ${escapeHtml(reportDate)}</div>
      </div>
      <div class="footer-confidential">CONFIDENTIAL</div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// generateCSV
// ---------------------------------------------------------------------------

export function generateCSV(findings: Finding[]): string {
  const headers = ["id", "severity", "title", "url"];
  const escape = (val: string | undefined | null): string => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = findings.map((f) =>
    [escape(f.id), escape(f.severity), escape(f.title), escape(getTarget(f))].join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
}

// ---------------------------------------------------------------------------
// downloadBlob
// ---------------------------------------------------------------------------

export function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ---------------------------------------------------------------------------
// generatePDFReport
// ---------------------------------------------------------------------------

const PRINT_CSS = `<style>
  @page { size: A4 portrait; margin: 14mm 12mm; }
  @media print {
    *,-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    body { background:#ffffff!important; color:#1a1a2e!important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }

    /* Cover */
    .cover { background:#f0f4f8!important; border-bottom:3px solid #e8912d!important; }
    .cover::before { display:none!important; }
    .brand-name { color:#1a1a2e!important; }
    .brand-tagline { color:#4a5568!important; }
    .brand-logo { background:#e8912d!important; color:#ffffff!important; }
    .report-title { color:#1a1a2e!important; }
    .report-subtitle { color:#4a5568!important; }
    .confidential-badge { background:rgba(218,54,51,0.12)!important; color:#c53030!important; border-color:rgba(218,54,51,0.4)!important; }

    /* Meta grid */
    .meta-item { background:#f7fafc!important; border-color:#e2e8f0!important; }
    .meta-label { color:#4a5568!important; }
    .meta-value { color:#1a1a2e!important; }

    /* Stat cards */
    .stats-bar { break-inside:avoid; }
    .stat-card { background:#f7fafc!important; border-color:#e2e8f0!important; }
    .stat-label { color:#4a5568!important; }
    .stat-card.total .stat-value { color:#2563eb!important; }
    .stat-card.critical .stat-value { color:#dc2626!important; }
    .stat-card.high .stat-value { color:#ea580c!important; }
    .stat-card.verified .stat-value { color:#16a34a!important; }
    .stat-card.total::after { background:#2563eb!important; }
    .stat-card.critical::after { background:#dc2626!important; }
    .stat-card.high::after { background:#ea580c!important; }
    .stat-card.verified::after { background:#16a34a!important; }

    /* Sections */
    .section-header { border-bottom-color:#e2e8f0!important; }
    .section-icon { background:rgba(232,145,45,0.12)!important; }
    .section-title { color:#1a1a2e!important; }
    .section-count { color:#4a5568!important; background:#f0f4f8!important; }

    /* Distribution table */
    .dist-table { background:#f7fafc!important; border-color:#e2e8f0!important; }
    .dist-table td { border-bottom-color:#e2e8f0!important; color:#1a1a2e!important; }
    .dist-bar-bg { background:#e2e8f0!important; }

    /* Finding cards */
    .finding-card { background:#ffffff!important; border-color:#e2e8f0!important; break-inside:avoid; }
    .finding-header { background:#f7fafc!important; border-bottom-color:#e2e8f0!important; }
    .finding-meta-row { color:#1a1a2e!important; }
    .finding-id { color:#4a5568!important; background:#f0f4f8!important; }
    .finding-title { color:#1a1a2e!important; }
    .finding-plugin { color:#4a5568!important; background:#f0f4f8!important; }
    .finding-body { color:#1a1a2e!important; }
    .section-label { color:#4a5568!important; }
    .section-content { color:#1a1a2e!important; }
    .section-content.mono { background:#f0f4f8!important; border-color:#e2e8f0!important; color:#1e40af!important; }
    .section-content.remediation { background:rgba(22,163,74,0.06)!important; color:#1a1a2e!important; }

    /* Compliance */
    .compliance-card { background:#f7fafc!important; border-color:#e2e8f0!important; }
    .compliance-name { color:#e8912d!important; }
    .compliance-desc { color:#4a5568!important; }

    /* Footer */
    .footer { border-top-color:#e2e8f0!important; }
    .footer-brand { color:#e8912d!important; }
    .footer-version { color:#4a5568!important; }
    .footer-confidential { color:#dc2626!important; }

    /* Page breaks */
    .page-wrapper,.cover-inner { max-width:100%!important; }
    .section { break-before:auto; }
    .findings-list { break-inside:auto; }
  }
</style>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},800);});<\/script>`;


export function generatePDFReport(findings: Finding[], meta?: ReportMeta): string {
  const html = generateHTMLReport(findings, meta);
  return html.replace("</head>", `${PRINT_CSS}\n</head>`);
}

// ---------------------------------------------------------------------------
// downloadPDF
// ---------------------------------------------------------------------------

export function downloadPDF(findings: Finding[], meta?: ReportMeta): void {
  const html = generatePDFReport(findings, meta);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (!win) {
    downloadBlob(html, "axiom-security-report.html", "text/html;charset=utf-8");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}