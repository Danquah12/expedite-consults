/**
 * AXIOM Report Generator
 * Takes all findings from pipeline → generates HTML, JSON, SARIF reports
 */

const fs   = require("fs");
const path = require("path");

function generateReport(pipeline) {
  const { id, targets, stages } = pipeline;
  const allFindings = collectAllFindings(pipeline);
  const critical    = allFindings.filter(f => f.severity === "Critical");
  const high        = allFindings.filter(f => f.severity === "High");
  const medium      = allFindings.filter(f => f.severity === "Medium");
  const low         = allFindings.filter(f => f.severity === "Low");
  const timestamp   = new Date().toISOString();

  // ── HTML Report ──────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AXIOM Security Report — ${timestamp.slice(0,10)}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#0d0d0d; color:#e0e0e0; line-height:1.6; }
  .header { background:linear-gradient(135deg,#e8912d,#c96c10); padding:32px 48px; }
  .header h1 { font-size:28px; font-weight:900; color:#fff; }
  .header p  { color:rgba(255,255,255,0.8); font-size:14px; margin-top:4px; }
  .content { max-width:1200px; margin:0 auto; padding:32px 24px; }
  .section { background:#161616; border:1px solid #2a2a2a; border-radius:8px; padding:24px; margin-bottom:24px; }
  .section h2 { font-size:18px; font-weight:700; color:#e8912d; margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid #2a2a2a; }
  .section h3 { font-size:14px; font-weight:700; color:#fff; margin:12px 0 6px; }
  .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .stat-card { background:#1a1a1a; border-radius:6px; padding:16px; text-align:center; }
  .stat-num  { font-size:32px; font-weight:900; }
  .stat-label{ font-size:11px; color:#888; margin-top:2px; }
  .critical  { color:#ff4444; } .high { color:#ff8800; }
  .medium    { color:#ffcc00; } .low  { color:#44bb44; }
  .finding-card { background:#1a1a1a; border-left:4px solid #555; border-radius:4px; padding:14px; margin-bottom:10px; }
  .finding-card.Critical { border-color:#ff4444; }
  .finding-card.High     { border-color:#ff8800; }
  .finding-card.Medium   { border-color:#ffcc00; }
  .finding-card.Low      { border-color:#44bb44; }
  .badge { display:inline-block; padding:2px 8px; border-radius:3px; font-size:10px; font-weight:700; margin-right:6px; }
  .badge-crit { background:#ff4444; color:#fff; }
  .badge-high { background:#ff8800; color:#fff; }
  .badge-med  { background:#ffcc00; color:#000; }
  .badge-low  { background:#44bb44; color:#fff; }
  .badge-src  { background:#2a2a2a; color:#aaa; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th    { background:#1a1a1a; padding:8px 10px; text-align:left; color:#888; font-weight:600; border-bottom:1px solid #2a2a2a; }
  td    { padding:7px 10px; border-bottom:1px solid #1e1e1e; }
  tr:hover td { background:#1a1a1a; }
  code  { background:#1e1e1e; padding:2px 6px; border-radius:3px; font-size:11px; font-family:monospace; color:#4fc3f7; word-break:break-all; }
  .pill { display:inline-block; background:#2a2a2a; border-radius:12px; padding:2px 10px; font-size:11px; color:#aaa; margin:2px; }
  .progress-bar { background:#2a2a2a; border-radius:4px; height:8px; overflow:hidden; margin:4px 0; }
  .progress-fill { height:100%; border-radius:4px; }
</style>
</head>
<body>

<div class="header">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="width:50px;height:50px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">🧠</div>
      <div>
        <h1>AXIOM Security Assessment Report</h1>
        <p>Pipeline ID: ${id} &nbsp;·&nbsp; Generated: ${new Date().toLocaleString()} &nbsp;·&nbsp; Targets: ${targets.join(", ")}</p>
      </div>
    </div>
  </div>
</div>

<div class="content">

  <!-- Executive Summary -->
  <div class="section">
    <h2>📊 Executive Summary</h2>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-num critical">${critical.length}</div><div class="stat-label">CRITICAL</div></div>
      <div class="stat-card"><div class="stat-num high">${high.length}</div><div class="stat-label">HIGH</div></div>
      <div class="stat-card"><div class="stat-num medium">${medium.length}</div><div class="stat-label">MEDIUM</div></div>
      <div class="stat-card"><div class="stat-num low">${low.length}</div><div class="stat-label">LOW</div></div>
    </div>
    <div style="margin-top:16px; padding:12px; background:#1a1a1a; border-radius:6px; font-size:13px; color:#aaa;">
      <strong style="color:#fff;">Risk Rating: ${getRating(critical.length, high.length)}</strong> &nbsp;·&nbsp;
      ${allFindings.length} total findings &nbsp;·&nbsp;
      Scanned ${targets.length} target(s) &nbsp;·&nbsp;
      Engines: Nmap + ZAP + OpenVAS
    </div>
    <div style="margin-top:12px; font-size:13px; color:#ccc; line-height:1.8;">
      ${generateExecNarrative(critical, high, medium, targets)}
    </div>
  </div>

  <!-- Scan Coverage -->
  <div class="section">
    <h2>🎯 Scan Coverage & Engines</h2>
    <table>
      <tr><th>Engine</th><th>Target(s)</th><th>Status</th><th>Findings</th><th>Duration</th></tr>
      ${generateEngineSummaryRows(pipeline)}
    </table>
  </div>

  <!-- Attack Surface (Nmap) -->
  ${generateNmapSection(pipeline)}

  <!-- Critical & High Findings -->
  <div class="section">
    <h2>🔴 Critical & High Severity Findings</h2>
    ${[...critical,...high].slice(0,50).map(f => generateFindingCard(f)).join("") || "<p style='color:#555;'>No critical/high findings.</p>"}
  </div>

  <!-- Medium Findings -->
  <div class="section">
    <h2>🟡 Medium Severity Findings</h2>
    <table>
      <tr><th>ID</th><th>Title</th><th>Source</th><th>URL/Target</th><th>CVSS</th></tr>
      ${medium.slice(0,50).map(f => `
        <tr>
          <td><code>${f.id}</code></td>
          <td>${f.title}</td>
          <td><span class="pill">${f.source || "ZAP"}</span></td>
          <td style="font-size:10px;max-width:300px;overflow:hidden;text-overflow:ellipsis;">${f.url || ""}</td>
          <td>${f.cvss || "-"}</td>
        </tr>`).join("") || "<tr><td colspan='5' style='color:#555;'>No medium findings.</td></tr>"}
    </table>
  </div>

  <!-- All Findings Table -->
  <div class="section">
    <h2>📋 All Findings (${allFindings.length} total)</h2>
    <table>
      <tr><th>ID</th><th>Severity</th><th>Title</th><th>Source</th><th>URL</th><th>CVSS</th></tr>
      ${allFindings.slice(0,200).map(f => `
        <tr>
          <td><code>${f.id}</code></td>
          <td><span class="badge badge-${f.severity?.toLowerCase()?.slice(0,4) || "low"}">${f.severity}</span></td>
          <td style="font-size:12px;">${f.title}</td>
          <td><span class="pill">${f.source || "ZAP"}</span></td>
          <td style="font-size:10px;max-width:250px;overflow:hidden;text-overflow:ellipsis;">${f.url || ""}</td>
          <td>${f.cvss || "-"}</td>
        </tr>`).join("")}
    </table>
  </div>

  <!-- Remediation Roadmap -->
  <div class="section">
    <h2>🛠 Remediation Roadmap</h2>
    ${generateRemediationRoadmap(critical, high, medium)}
  </div>

</div>
</body>
</html>`;

  // ── JSON Report ──────────────────────────────────────────────────────────────
  const json = {
    report: {
      id, generated: timestamp, targets,
      summary: { critical:critical.length, high:high.length, medium:medium.length, low:low.length, total:allFindings.length },
      rating: getRating(critical.length, high.length),
    },
    findings: allFindings,
    engines:  getEngineSummary(pipeline),
  };

  // ── SARIF Report ─────────────────────────────────────────────────────────────
  const sarif = {
    "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
    version:   "2.1.0",
    runs: [{
      tool: { driver: { name:"AXIOM", version:"4.0.0",
        rules: allFindings.map(f=>({ id:f.id, name:f.title, shortDescription:{ text:f.title },
          defaultConfiguration:{ level: severityToSARIF(f.severity) } }))
      }},
      results: allFindings.map(f=>({
        ruleId:  f.id,
        level:   severityToSARIF(f.severity),
        message: { text: f.description || f.title },
        locations: [{ physicalLocation: { artifactLocation: { uri: f.url || "" } } }]
      }))
    }]
  };

  return { html, json, sarif, summary: json.report.summary };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function collectAllFindings(pipeline) {
  const all = [];
  for (const stage of Object.values(pipeline.stages || {})) {
    if (stage.findings) all.push(...stage.findings);
  }
  const seen = new Set();
  return all.filter(f => { const k = `${f.title}::${f.url}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a,b) => ({Critical:0,High:1,Medium:2,Low:3,Info:4}[a.severity]??9) - ({Critical:0,High:1,Medium:2,Low:3,Info:4}[b.severity]??9));
}

function getRating(critCount, highCount) {
  if (critCount > 0) return "🔴 CRITICAL";
  if (highCount > 5) return "🟠 HIGH";
  if (highCount > 0) return "🟡 MEDIUM";
  return "🟢 LOW";
}

function severityToSARIF(s) {
  return {Critical:"error",High:"error",Medium:"warning",Low:"note",Info:"none"}[s]||"warning";
}

function generateExecNarrative(critical, high, medium, targets) {
  const parts = [];
  if (critical.length) parts.push(`<strong style="color:#ff4444;">${critical.length} critical vulnerabilities</strong> were identified requiring immediate remediation.`);
  if (high.length) parts.push(`${high.length} high severity findings were confirmed.`);
  if (medium.length) parts.push(`${medium.length} medium severity issues were detected.`);
  parts.push(`Assessment covered ${targets.length} target(s) using automated DAST + SAST scanning via ZAP, Nmap, and OpenVAS.`);
  return parts.join(" ");
}

function generateFindingCard(f) {
  const sev = (f.severity||"Low").toLowerCase().slice(0,4);
  const badgeClass = {crit:"badge-crit",high:"badge-high",medi:"badge-med",low:"badge-low"}[sev]||"badge-low";
  return `
  <div class="finding-card ${f.severity}">
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
      <div>
        <span class="badge ${badgeClass}">${f.severity}</span>
        <span class="badge badge-src">${f.source || "ZAP"}</span>
        <span class="badge badge-src">CVSS ${f.cvss || "-"}</span>
        <code style="font-size:11px;">${f.id}</code>
      </div>
    </div>
    <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:6px;">${f.title}</div>
    <div style="font-size:12px;color:#aaa;margin-bottom:6px;">${(f.description||"").slice(0,300)}</div>
    <div style="font-size:11px;color:#666;"><strong style="color:#888;">URL:</strong> <code>${f.url||""}</code></div>
    ${f.evidence?.payload ? `<div style="font-size:11px;color:#666;margin-top:4px;"><strong style="color:#888;">Attack:</strong> <code>${f.evidence.payload.slice(0,100)}</code></div>` : ""}
    ${f.solution ? `<div style="font-size:11px;color:#4caf50;margin-top:6px;"><strong>Remediation:</strong> ${f.solution.slice(0,200)}</div>` : ""}
  </div>`;
}

function generateNmapSection(pipeline) {
  const nmapStage = pipeline.stages?.enumeration;
  if (!nmapStage?.nmap?.ports?.length) return "";
  const ports = nmapStage.nmap.ports;
  return `
  <div class="section">
    <h2>📡 Network Attack Surface (Nmap)</h2>
    <p style="font-size:12px;color:#888;margin-bottom:12px;">Target: ${nmapStage.nmap.target} &nbsp;·&nbsp; OS: ${nmapStage.nmap.os || "Unknown"} &nbsp;·&nbsp; ${ports.length} open ports</p>
    <table>
      <tr><th>Port</th><th>Protocol</th><th>Service</th><th>Version</th><th>Risk</th></tr>
      ${ports.map(p=>`<tr>
        <td><strong>${p.port}</strong></td>
        <td>${p.proto}</td>
        <td>${p.service}</td>
        <td style="font-size:11px;color:#888;">${p.version||"-"}</td>
        <td><span class="badge ${HIGH_RISK_PORTS_ARRAY.includes(p.port)?"badge-high":"badge-low"}">${HIGH_RISK_PORTS_ARRAY.includes(p.port)?"HIGH":"LOW"}</span></td>
      </tr>`).join("")}
    </table>
  </div>`;
}

const HIGH_RISK_PORTS_ARRAY = [21,22,23,80,135,139,443,445,1433,3306,3389,4444,5900,8080,8443,9200];

function generateEngineSummaryRows(pipeline) {
  const engines = [
    {name:"🔍 Nmap Network Scan",   key:"enumeration.nmap",    icon:"📡"},
    {name:"🕷 ZAP Spider",          key:"enumeration.spider",  icon:"🕷"},
    {name:"⚡ ZAP Active Scan",     key:"exploitation.zap",    icon:"⚡"},
    {name:"🛡 OpenVAS Scan",        key:"exploitation.openvas",icon:"🛡"},
    {name:"🔬 Post-Exploit Valid.",  key:"postExploit",         icon:"🔬"},
    {name:"📊 Report Generation",   key:"report",              icon:"📊"},
  ];
  return engines.map(e => {
    const keys = e.key.split(".");
    const stage = keys.length===2 ? pipeline.stages?.[keys[0]]?.[keys[1]] : pipeline.stages?.[keys[0]];
    const status = stage?.status || "pending";
    const findings = stage?.findings?.length ?? stage?.findingCount ?? "-";
    const dur = stage?.duration ? `${stage.duration}s` : "-";
    const statusColor = {complete:"#4caf50",running:"#4fc3f7",error:"#ef5350",pending:"#555"}[status]||"#555";
    return `<tr>
      <td>${e.name}</td>
      <td style="font-size:11px;color:#888;">${(pipeline.targets||[]).join(", ")}</td>
      <td><span style="color:${statusColor};font-weight:700;">${status.toUpperCase()}</span></td>
      <td>${findings}</td>
      <td style="color:#888;">${dur}</td>
    </tr>`;
  }).join("");
}

function getEngineSummary(pipeline) {
  return Object.entries(pipeline.stages || {}).map(([k,v])=>({
    stage:k, status:v.status, findings:v.findings?.length??0
  }));
}

function generateRemediationRoadmap(critical, high, medium) {
  const items = [
    ...critical.map(f=>({priority:"IMMEDIATE",finding:f})),
    ...high.slice(0,10).map(f=>({priority:"SHORT-TERM",finding:f})),
    ...medium.slice(0,5).map(f=>({priority:"MEDIUM-TERM",finding:f})),
  ];
  if (!items.length) return "<p style='color:#555;'>No findings to remediate.</p>";
  return `<table>
    <tr><th>Priority</th><th>Finding</th><th>Source</th><th>Remediation</th></tr>
    ${items.slice(0,30).map(({priority,finding})=>`<tr>
      <td><span class="badge ${priority==="IMMEDIATE"?"badge-crit":priority==="SHORT-TERM"?"badge-high":"badge-med"}">${priority}</span></td>
      <td style="font-size:12px;">${finding.title}</td>
      <td><span class="pill">${finding.source||"ZAP"}</span></td>
      <td style="font-size:11px;color:#aaa;">${(finding.solution||finding.remediation||"Review and apply security patch.").slice(0,120)}</td>
    </tr>`).join("")}
  </table>`;
}

module.exports = { generateReport };
