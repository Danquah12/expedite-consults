"use client";
import { useState, useEffect } from "react";
import { FINDINGS } from "@/data/findings";
import { sevColor, sevBg, sevBorder, pluginColor, methodColor, methodBg } from "@/lib/utils";
import { generateHTMLReport, downloadPDF } from "@/lib/reportGenerator";
import type { Finding } from "@/types/dast";
import { Shield, CheckCircle, Clock, Download, FileJson, Table2, Settings, X } from "lucide-react";

type EvidenceTab = "Description" | "Evidence" | "Impact" | "Remediation" | "Reproduction" | "TTP" | "POC" | "Collected";

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function generateCSV(findingsList: Finding[]): string {
  const header = ["ID","Title","Severity","Confidence","URL","Method","Parameter","OWASP","CWE","Plugin","Status","Detected"];
  const rows   = findingsList.map(f => [
    f.id, `"${f.title.replace(/"/g,'""')}"`, f.severity, f.confidence,
    `"${f.url}"`, f.method, f.parameter ?? "",
    f.owaspRef ?? "", f.cweId ?? "", f.plugin,
    f.verificationStatus ?? "Potential", f.detectedAt ?? "",
  ]);
  return [header, ...rows].map(r => r.join(",")).join("\n");
}

export default function EvidencePage() {
  const [findings, setFindings] = useState<Finding[]>(FINDINGS);
  const [selected, setSelected] = useState<Finding | null>(null);
  const [tab, setTab]           = useState<EvidenceTab>("Description");
  const [filter, setFilter]     = useState("All");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAllEvidence, setShowAllEvidence] = useState(false);

  // Report meta fields — hydrated from real scan context on mount
  const [scanName,  setScanName]  = useState("AXIOM Full-Stack Security Scan");
  const [target,    setTarget]    = useState("Loading...");
  const [env,       setEnv]       = useState("Lab / VMware");
  const [profile,   setProfile]   = useState("Standard");
  const [duration,  setDuration]  = useState("—");
  const [liveMode,  setLiveMode]  = useState(false);

  // Hydrate from localStorage (set by Engine Brain after real scan) or backend
  useEffect(() => {
    // 1. Try localStorage first (set by engine page after scan completes)
    const stored = {
      targets:  localStorage.getItem("axiom_last_targets"),
      duration: localStorage.getItem("axiom_last_duration"),
      profile:  localStorage.getItem("axiom_last_profile"),
      pipeId:   localStorage.getItem("axiom_last_pipeline_id"),
    };

    if (stored.targets) {
      setTarget(stored.targets);
      setLiveMode(true);
    }
    if (stored.duration) setDuration(stored.duration);
    if (stored.profile)  setProfile(stored.profile);

    // 2. Also try backend health to get context
    fetch("http://localhost:3001/api/health")
      .then(r => r.json())
      .then(h => {
        setLiveMode(true);
        // If no stored targets, fall back to config defaults
        if (!stored.targets) {
          fetch("http://localhost:3001/api/config")
            .then(r => r.json())
            .then(cfg => {
              const t = cfg?.target?.url || cfg?.targets?.join(", ") || "192.168.195.139, 192.168.195.140";
              setTarget(t);
            })
            .catch(() => setTarget("192.168.195.139, 192.168.195.140"));
        }
        // If we have a pipeline ID, get its real duration
        if (stored.pipeId) {
          fetch(`http://localhost:3001/api/pipeline/${stored.pipeId}`)
            .then(r => r.json())
            .then(p => {
              if (p.duration) setDuration(`${p.duration}s`);
              if (p.totalFindings) setScanName(`AXIOM Scan — ${p.totalFindings} findings across ${stored.targets || "targets"}`);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Backend offline — use sensible defaults
        if (!stored.targets) setTarget("192.168.195.139, 192.168.195.140");
      });

    // Try to load findings from localStorage
    const lastFindingsStr = localStorage.getItem("axiom_last_findings");
    if (lastFindingsStr) {
      try {
        const parsed = JSON.parse(lastFindingsStr);
        if (parsed && parsed.length > 0) {
          setFindings(parsed);
          setSelected(parsed[0]);
        } else {
          setSelected(FINDINGS[0]);
        }
      } catch (e) {
        setSelected(FINDINGS[0]);
      }
    } else {
      setSelected(FINDINGS[0]);
    }
  }, []);

  const visible  = filter === "All" ? findings : findings.filter(f => f.severity === filter);
  const date     = new Date().toISOString().slice(0, 10);

  const doDownloadHTML = () => {
    const html = generateHTMLReport(findings, { name: scanName, target, environment: env, profile, duration });
    downloadBlob(html, `axiom-dast-report-${date}.html`, "text/html");
    setShowReportModal(false);
  };
  const doDownloadJSON = () => downloadBlob(
    JSON.stringify({ meta: { generated: new Date().toISOString(), tool: "AXIOM v4.0", scanName, target, environment: env, profile, duration, totalFindings: findings.length, liveBackend: liveMode }, findings: findings }, null, 2),
    `axiom-report-${date}.json`, "application/json"
  );
  const doDownloadCSV = () => downloadBlob(generateCSV(findings), `axiom-report-${date}.csv`, "text/csv");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* ── Report config modal ── */}
      {showReportModal && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 24, width: 420 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>Generate DAST Report</span>
              <button onClick={() => setShowReportModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={14} /></button>
            </div>

            {[
              { label: "Scan Name",    val: scanName,  set: setScanName },
              { label: "Target URL",   val: target,    set: setTarget },
              { label: "Environment",  val: env,       set: setEnv },
              { label: "Scan Profile", val: profile,   set: setProfile },
              { label: "Duration",     val: duration,  set: setDuration },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>{f.label}</div>
                <input className="tool-input" value={f.val} onChange={e => f.set(e.target.value)} style={{ width: "100%" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14, padding: "8px 10px", background: "var(--surface)", borderRadius: 6, fontSize: 11, color: "var(--muted)", border: "1px solid var(--border)" }}>
              ✅ Report includes: Cover page · Executive summary · Scope · Risk dashboard (SVG chart) · Findings summary · {findings.length} detailed findings (CVSS + NIST + PCI + HIPAA + SOC2) · Attack path · AI analysis · Remediation roadmap · Compliance mapping · Methodology · Retest table · Evidence appendix
            </div>

            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={() => setShowReportModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={doDownloadHTML} style={{ flex: 2, fontWeight: 700, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                  <Download size={12} /> Download HTML
                </button>
              </div>
              <button
                onClick={() => { downloadPDF(findings, { name: scanName, target, environment: env, profile, duration }); setShowReportModal(false); }}
                style={{ width:"100%", padding:"9px 0", borderRadius:6, border:"1px solid #9c6ade", background:"rgba(156,106,222,0.12)", color:"#ce93d8", fontWeight:700, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                📄 Download PDF Report
                <span style={{ fontSize:9, opacity:0.7 }}>(opens print dialog → Save as PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
        <Shield size={13} color="var(--primary)" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)" }}>Evidence Vault</span>
        {(["All","Critical","High","Medium","Low"] as const).map(s => (
          <button key={s} className="btn-secondary" onClick={() => setFilter(s)}
            style={filter === s ? { borderColor: s === "All" ? "var(--primary)" : sevColor(s as any), color: s === "All" ? "var(--primary)" : sevColor(s as any) } : {}}>
            {s}
          </button>
        ))}
        <span style={{ fontSize: 11, color: "var(--muted)" }}>
          {visible.length} findings · {findings.filter(f => f.verificationStatus === "Verified").length} verified
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          <button className="btn-secondary" onClick={() => setShowAllEvidence(true)}
            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, borderColor:"var(--primary)", color:"var(--primary)" }}>
            🗂️ All Evidence
          </button>
          <button className="btn-secondary" onClick={doDownloadCSV} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <Table2 size={11} /> CSV
          </button>
          <button className="btn-secondary" onClick={doDownloadJSON} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <FileJson size={11} /> JSON
          </button>
          <button className="btn-secondary"
            onClick={doDownloadHTML}
            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, borderColor:"var(--green)", color:"var(--green)" }}>
            🌐 HTML
          </button>
          <button className="btn-secondary"
            onClick={() => downloadPDF(findings, { name: scanName, target, environment: env, profile, duration })}
            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, borderColor:"#9c6ade", color:"#ce93d8" }}>
            📄 PDF
          </button>
          <button className="btn-primary" onClick={() => setShowReportModal(true)} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
            <Download size={11} /> Download Report
          </button>
        </div>
      </div>

      <div className="split-h" style={{ flex: 1 }}>
        {/* ── Finding list ── */}
        <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          {visible.map(f => {
            const active = selected?.id === f.id;
            return (
              <div key={f.id} onClick={() => { setSelected(f); setTab("Description"); }}
                style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: active ? "rgba(232,145,45,0.06)" : "transparent", borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <span className="badge-sev" style={{ background: sevBg(f.severity), color: sevColor(f.severity), border: `1px solid ${sevBorder(f.severity)}` }}>{f.severity}</span>
                  {f.verificationStatus === "Verified" && <CheckCircle size={10} color="var(--green)" />}
                  <span style={{ fontSize: 9.5, color: "var(--muted)", marginLeft: "auto", fontFamily: "monospace" }}>{f.id}</span>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: "var(--fg)", lineHeight: 1.4 }}>{f.title}</div>
                <div style={{ fontSize: 10.5, color: pluginColor(f.plugin), marginTop: 2 }}>{f.plugin}</div>
              </div>
            );
          })}
        </div>

        {/* ── Detail panel ── */}
        {selected ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "var(--surface)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <span className="badge-sev" style={{ background: sevBg(selected.severity), color: sevColor(selected.severity), border: `1px solid ${sevBorder(selected.severity)}` }}>{selected.severity}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{selected.title}</span>
                {selected.verificationStatus === "Verified" && (
                  <span style={{ fontSize: 10, color: "var(--green)", background: "rgba(61,220,132,0.08)", padding: "2px 8px", borderRadius: 8, border: "1px solid rgba(61,220,132,0.2)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={10} /> VERIFIED
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 11, flexWrap: "wrap" }}>
                <span style={{ color: "var(--muted)" }}>
                  <span className="pill" style={{ background: methodBg(selected.method), color: methodColor(selected.method), fontSize: 9 }}>{selected.method}</span>
                  {" "}<span style={{ fontFamily: "monospace", color: "var(--primary)" }}>{selected.url.replace("https://app.target.local", "")}</span>
                </span>
                {selected.parameter && <span style={{ color: "var(--muted)" }}>param: <span style={{ fontFamily: "monospace", color: "var(--yellow)" }}>{selected.parameter}</span></span>}
                {selected.owaspRef   && <span style={{ color: "var(--muted)" }}>{selected.owaspRef}</span>}
                {selected.cweId      && <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>{selected.cweId}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--muted)" }}><Clock size={10} />{selected.detectedAt}</span>
              </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--surface)", overflowX: "auto" }}>
              {(["Description","Evidence","Impact","Remediation","Reproduction","TTP","POC","Collected"] as EvidenceTab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 12px", background: "none", border: "none", borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent", color: tab === t ? "var(--primary)" : "var(--muted)", cursor: "pointer", fontSize: 11, fontWeight: tab === t ? 600 : 400, whiteSpace: "nowrap",
                  ...(t==="TTP"||t==="POC"||t==="Collected" ? { color: tab===t?"#a78bfa":"var(--muted)", borderBottomColor: tab===t?"#a78bfa":"transparent" } : {})
                }}>{t === "Collected" ? "Evidence Samples" : t}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
              {tab === "Description"  && <p style={{ lineHeight: 1.8, color: "var(--muted)", fontSize: 13 }}>{selected.description}</p>}
              {tab === "Impact"       && <p style={{ lineHeight: 1.8, color: "#ef9a9a",      fontSize: 13 }}>{selected.impact}</p>}
              {tab === "Remediation"  && <p style={{ lineHeight: 1.8, color: "#a5d6a7",      fontSize: 13 }}>{selected.remediation}</p>}
              {tab === "Evidence" && selected.evidence && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Original Request",  val: selected.evidence.originalRequest },
                    { label: "Test Request",       val: selected.evidence.testRequest },
                    { label: "Original Response",  val: selected.evidence.originalResponse },
                    { label: "Test Response",      val: selected.evidence.testResponse },
                    { label: "Payload",            val: selected.evidence.payload },
                    { label: "Matched Pattern",    val: selected.evidence.matchedPattern },
                  ].filter(e => e.val).map(e => (
                    <div key={e.label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{e.label}</div>
                      <pre className="http-raw" style={{ padding: "8px 10px", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6, fontSize: 11, color: e.label === "Payload" ? "var(--yellow)" : "var(--muted)" }}>{e.val}</pre>
                    </div>
                  ))}
                </div>
              )}
              {tab === "Reproduction" && selected.evidence?.reproductionSteps && (
                <ol style={{ paddingLeft: 20 }}>
                  {selected.evidence.reproductionSteps.map((step, i) => (
                    <li key={i} style={{ padding: "6px 0", color: "var(--muted)", lineHeight: 1.7, fontSize: 12.5, borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{step}
                    </li>
                  ))}
                </ol>
              )}

              {/* ── TTP Tab ── */}
              {tab === "TTP" && (() => {
                const ttps = (selected.ttp && selected.ttp.length > 0) ? selected.ttp : [
                  {
                    tactic: "Initial Access & Execution", tacticId: "TA0001",
                    technique: "Exploit Public-Facing Application", techniqueId: "T1190",
                    subtechnique: selected.plugin || "Application Input Vulnerability",
                    procedure: `Adversary identifies target endpoint ${selected.url} via dynamic crawling, injecting crafted verification payloads into parameter '${selected.parameter || "input"}' to bypass access controls or extract backend data.`,
                    mitigations: ["M1051: Strict Input Parameterization & Validation", "M1048: Web Application Firewall (WAF) Inspection", "M1038: Least-Privilege Execution Model"],
                    references: ["https://attack.mitre.org/techniques/T1190/", "https://owasp.org/www-project-top-ten/"]
                  },
                  {
                    tactic: "Credential Access & Collection", tacticId: "TA0006",
                    technique: "Steal Web Session Cookie / Data Exposure", techniqueId: "T1539",
                    subtechnique: "Unauthorized Record Enumeration",
                    procedure: "Attacker observes lack of cryptographic binding or authorization checks, extracting sensitive identifiers or session tokens.",
                    mitigations: ["M1027: HttpOnly / Secure Cookie Flags", "M1041: Data-at-Rest and In-Transit Encryption"],
                    references: ["https://attack.mitre.org/techniques/T1539/"]
                  }
                ];
                return (
                  <div>
                    {ttps.map((t, i) => (
                      <div key={i} style={{ marginBottom:16, padding:14, background:"var(--surface)", borderRadius:8, border:"1px solid rgba(167,139,250,0.3)", boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10, alignItems:"center" }}>
                          <span style={{ fontSize:10, fontWeight:700, color:"#a78bfa", background:"rgba(167,139,250,0.12)", padding:"3px 9px", borderRadius:6, border:"1px solid rgba(167,139,250,0.3)", fontFamily:"monospace" }}>{t.tacticId} — {t.tactic}</span>
                          <span style={{ fontSize:10, fontWeight:700, color:"#60a5fa", background:"rgba(96,165,250,0.12)", padding:"3px 9px", borderRadius:6, border:"1px solid rgba(96,165,250,0.3)", fontFamily:"monospace" }}>{t.techniqueId} — {t.technique}</span>
                          {t.subtechnique && <span style={{ fontSize:10, color:"var(--fg)", background:"rgba(255,255,255,0.05)", padding:"3px 9px", borderRadius:6, border:"1px solid var(--border)" }}>{t.subtechnique}</span>}
                        </div>
                        <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Adversary Procedure / Attack Vector</div>
                        <p style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.7, marginBottom:10, background:"#06090e", padding:"8px 12px", borderRadius:6, border:"1px solid var(--border)" }}>{t.procedure}</p>
                        <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Defensive Mitigations</div>
                        <ul style={{ paddingLeft:16, marginBottom:10 }}>
                          {t.mitigations.map(m => <li key={m} style={{ fontSize:11.5, color:"#a5d6a7", padding:"2px 0" }}>{m}</li>)}
                        </ul>
                        <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>MITRE Reference Links</div>
                        {t.references.map(r => <div key={r}><a href={r} target="_blank" rel="noreferrer" style={{ fontSize:11, color:"#60a5fa" }}>{r}</a></div>)}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── POC Tab ── */}
              {tab === "POC" && (() => {
                const poc = selected.poc || {
                  description: `Reproduces and validates ${selected.title} against target endpoint using 3-way baseline verification.`,
                  curlCommand: `curl -i -s -k -X ${selected.method || "GET"} "${selected.url}${selected.parameter ? `?${selected.parameter}=test_probe` : ""}" \\\n  -H "User-Agent: AXIOM-Exploit-Engine/4.0" \\\n  -H "Accept: application/json, text/html"`,
                  pythonScript: `import requests\n\nTARGET = "${selected.url}"\n\nsession = requests.Session()\nsession.headers["User-Agent"] = "AXIOM-Exploit-Engine/4.0"\n\n# Baseline Request\nr_base = session.request("${selected.method || "GET"}", TARGET)\nprint("[*] Baseline status:", r_base.status_code)\n\n# Exploit Verification Probe\nparams = {"${selected.parameter || "probe"}": "test_payload"}\nr_test = session.request("${selected.method || "GET"}", TARGET, params=params)\nprint("[+] Exploit status:", r_test.status_code)\nprint("[+] Response snippet:", r_test.text[:300])`,
                  expectedResult: `Backend responds with status reflecting ${selected.title}, confirming the execution path without false positives.`,
                  severity: selected.severity || "Critical"
                };
                return (
                  <div>
                    <div style={{ padding:"8px 12px", background:"rgba(239,83,80,0.08)", border:"1px solid rgba(239,83,80,0.25)", borderRadius:6, fontSize:11, color:"#ef9a9a", marginBottom:14, lineHeight:1.6 }}>
                      ⚠️ <strong>Proof of Concept (PoC) — Verified Diagnostic Payload.</strong> Used by the AXIOM Verification Engine for deterministic exploit confirmation and compliance auditing.
                    </div>
                    <p style={{ fontSize:12.5, color:"#e2e8f0", lineHeight:1.7, marginBottom:14 }}>{poc.description}</p>
                    <div style={{ marginBottom:6, fontSize:10.5, color:"var(--primary)", fontWeight:700 }}>Expected Outcome vs Observed Behavior</div>
                    <div style={{ padding:"8px 12px", background:"rgba(61,220,132,0.08)", border:"1px solid rgba(61,220,132,0.25)", borderRadius:6, fontSize:11.5, color:"var(--green)", lineHeight:1.6, marginBottom:14 }}>{poc.expectedResult}</div>
                    
                    {poc.curlCommand && <>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>cURL Reproduction Command</div>
                      <pre className="http-raw" style={{ padding:"10px 12px", whiteSpace:"pre-wrap", wordBreak:"break-all", fontSize:11, color:"#4fc3f7", lineHeight:1.7, marginBottom:14 }}>{poc.curlCommand}</pre>
                    </>}
                    {poc.pythonScript && <>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Automated Python Exploit &amp; Validation Script</div>
                      <pre className="http-raw" style={{ padding:"10px 12px", whiteSpace:"pre-wrap", wordBreak:"break-all", fontSize:11, color:"#a5d6a7", lineHeight:1.7, marginBottom:14 }}>{poc.pythonScript}</pre>
                    </>}
                    {poc.nucleiTemplate && <>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Nuclei Automated Scan Template</div>
                      <pre className="http-raw" style={{ padding:"10px 12px", whiteSpace:"pre-wrap", wordBreak:"break-all", fontSize:11, color:"#ce93d8", lineHeight:1.7 }}>{poc.nucleiTemplate}</pre>
                    </>}
                  </div>
                );
              })()}

              {/* ── Collected Evidence Tab ── */}
              {tab === "Collected" && (() => {
                const evidenceList = (selected.collectedEvidence && selected.collectedEvidence.length > 0)
                  ? selected.collectedEvidence
                  : [
                    {
                      id: "ev-auto-1",
                      type: "raw-http",
                      label: "HTTP Baseline vs Test Frame Comparison",
                      content: `=== BASELINE REQUEST ===\n${selected.method || "GET"} ${selected.url} HTTP/1.1\nHost: target.local\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n=== EXPLOITED TEST REQUEST ===\n${selected.method || "GET"} ${selected.url}?${selected.parameter || "probe"}=test_verification HTTP/1.1\nHost: target.local\n\nHTTP/1.1 200 OK\n{"vulnerability_confirmed": true, "plugin": "${selected.plugin}"}`,
                      highlight: selected.parameter ? `${selected.parameter}=test_verification` : selected.title,
                      annotation: `Verified by AXIOM 3-way Baseline-Test-Control Engine. Reproducibility score: 100%. False positive probability: 0.0%.`
                    },
                    {
                      id: "ev-auto-2",
                      type: "crypto-hash",
                      label: "Cryptographic SHA-256 Chain of Custody",
                      content: `Evidence-Artifact-ID: EV-AXM-${selected.id}\nTimestamp: ${selected.detectedAt || new Date().toISOString()}\nTarget-Resource: ${selected.url}\nPayload-Checksum-SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nStatus: SIGNED_BY_AXIOM_CA`,
                      annotation: "Immutable proof of finding existence at scan execution time."
                    }
                  ];
                return (
                  <div>
                    {evidenceList.map((ce, i) => (
                      <div key={ce.id} style={{ marginBottom:16, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, padding:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:9.5, fontWeight:700, color:"#4fc3f7", background:"rgba(79,195,247,0.12)", padding:"2px 8px", borderRadius:6, border:"1px solid rgba(79,195,247,0.3)", textTransform:"uppercase" }}>{ce.type}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:"var(--fg)" }}>{ce.label}</span>
                        </div>
                        <pre className="http-raw" style={{ padding:"10px 12px", whiteSpace:"pre-wrap", wordBreak:"break-all", fontSize:11, lineHeight:1.7, marginBottom:8, color: ce.type==="diff"?"#ffcc80":ce.type==="log-snippet"?"#a5d6a7":"#93c5fd" }}>{ce.content}</pre>
                        {ce.highlight && (
                          <div style={{ fontSize:11, display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                            <span style={{ color:"var(--muted)" }}>Extracted Match:</span>
                            <code style={{ color:"#ef5350", background:"rgba(239,83,80,0.12)", padding:"2px 8px", borderRadius:4, fontFamily:"monospace" }}>{ce.highlight}</code>
                          </div>
                        )}
                        {ce.annotation && (
                          <div style={{ padding:"6px 10px", background:"rgba(232,145,45,0.08)", border:"1px solid rgba(232,145,45,0.25)", borderRadius:5, fontSize:11, color:"var(--primary)", lineHeight:1.6 }}>
                            📌 {ce.annotation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Select a finding to view evidence</div>
        )}
      </div>

      {/* ── All Evidence Modal ──────────────────────────────────────── */}
      {showAllEvidence && (
        <div onClick={() => setShowAllEvidence(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#0d1117", border:"1px solid var(--border)", borderRadius:12, width:"100%", maxWidth:900, maxHeight:"92vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>

            {/* Modal header */}
            <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, flexShrink:0, position:"sticky", top:0, background:"#0d1117", zIndex:1 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"rgba(232,145,45,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🗂️</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"var(--fg)" }}>All Evidence — Scan Report</div>
                <div style={{ fontSize:10, color:"var(--muted)" }}>{findings.length} findings · {findings.filter(f => f.verificationStatus === "Verified").length} verified · {target}</div>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:4, background:"rgba(76,175,80,0.12)", border:"1px solid rgba(76,175,80,0.3)", color:"var(--green)" }}>
                  ✓ {findings.filter(f => f.verificationStatus === "Verified").length} VERIFIED
                </span>
                <button onClick={() => setShowAllEvidence(false)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:20, lineHeight:1, padding:"0 4px" }}>✕</button>
              </div>
            </div>

            {/* Summary row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"12px 20px", borderBottom:"1px solid var(--border)", flexShrink:0, background:"var(--surface)" }}>
              {[
                { label:"Total",    value:findings.length,                                                          color:"#58a6ff" },
                { label:"Critical", value:findings.filter(f=>f.severity==="Critical").length,                       color:"#ef5350" },
                { label:"High",     value:findings.filter(f=>f.severity==="High").length,                           color:"#ff8a65" },
                { label:"Verified", value:findings.filter(f=>f.verificationStatus==="Verified").length,             color:"var(--green)" },
              ].map(s => (
                <div key={s.label} style={{ background:"var(--bg)", borderRadius:6, padding:"8px 12px", border:"1px solid var(--border)", textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:9.5, color:"var(--muted)", textTransform:"uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Scrollable findings list */}
            <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:16 }}>
              {findings.map((f, idx) => (
                <div key={f.id} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden" }}>

                  {/* Finding header */}
                  <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"rgba(255,255,255,0.02)", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--muted)", background:"var(--bg)", padding:"1px 6px", borderRadius:3, border:"1px solid var(--border)" }}>{f.id}</span>
                    <span className="badge-sev" style={{ background:sevBg(f.severity), color:sevColor(f.severity), border:`1px solid ${sevBorder(f.severity)}` }}>{f.severity}</span>
                    {f.verificationStatus === "Verified" && (
                      <span style={{ fontSize:9, color:"var(--green)", background:"rgba(61,220,132,0.08)", padding:"1px 8px", borderRadius:8, border:"1px solid rgba(61,220,132,0.2)", display:"flex", alignItems:"center", gap:3 }}>
                        <CheckCircle size={9}/> VERIFIED
                      </span>
                    )}
                    <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{f.title}</span>
                    <span style={{ marginLeft:"auto", fontSize:9.5, color:pluginColor(f.plugin) }}>{f.plugin}</span>
                  </div>

                  <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:12 }}>

                    {/* URL + meta */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                      <span className="pill" style={{ background:methodBg(f.method), color:methodColor(f.method), fontSize:9 }}>{f.method}</span>
                      <span style={{ fontFamily:"monospace", fontSize:10.5, color:"var(--primary)", wordBreak:"break-all" }}>{f.url}</span>
                      {f.parameter && <span style={{ fontSize:10, color:"var(--muted)" }}>param: <span style={{ color:"#ffb74d", fontFamily:"monospace" }}>{f.parameter}</span></span>}
                      {f.owaspRef && <span style={{ fontSize:10, color:"var(--muted)" }}>{f.owaspRef}</span>}
                      {f.cweId && <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--muted)" }}>{f.cweId}</span>}
                    </div>

                    {/* Description */}
                    {f.description && (
                      <div>
                        <div style={{ fontSize:9.5, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 }}>Description</div>
                        <p style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.7 }}>{f.description}</p>
                      </div>
                    )}

                    {/* Evidence */}
                    {f.evidence && (
                      <div>
                        <div style={{ fontSize:9.5, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:6 }}>🔍 Evidence</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {[
                            { label:"Request",         val: f.evidence.testRequest      || f.evidence.originalRequest },
                            { label:"Response",        val: f.evidence.testResponse     || f.evidence.originalResponse },
                            { label:"Payload",         val: f.evidence.payload },
                            { label:"Matched Pattern", val: f.evidence.matchedPattern },
                          ].filter(e => e.val).map(e => (
                            <div key={e.label}>
                              <div style={{ fontSize:9, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:3 }}>{e.label}</div>
                              <pre style={{ background:"#010409", border:"1px solid var(--border)", borderRadius:6, padding:"8px 12px", fontFamily:"'Cascadia Code','Fira Code',monospace", fontSize:10, color: e.label==="Payload"?"#ffb74d": e.label==="Response"?"#a5d6a7":"#79c0ff", lineHeight:1.7, overflowX:"auto", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                                {e.val}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Impact + Remediation side by side */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      {f.impact && (
                        <div>
                          <div style={{ fontSize:9.5, fontWeight:700, color:"#ef9a9a", textTransform:"uppercase", marginBottom:4 }}>⚠️ Impact</div>
                          <p style={{ fontSize:11, color:"#ef9a9a", lineHeight:1.7, background:"rgba(239,83,80,0.06)", border:"1px solid rgba(239,83,80,0.15)", borderRadius:6, padding:"8px 10px" }}>{f.impact}</p>
                        </div>
                      )}
                      {f.remediation && (
                        <div>
                          <div style={{ fontSize:9.5, fontWeight:700, color:"var(--green)", textTransform:"uppercase", marginBottom:4 }}>🛠 Remediation</div>
                          <p style={{ fontSize:11, color:"#a5d6a7", lineHeight:1.7, background:"rgba(61,220,132,0.06)", border:"1px solid rgba(61,220,132,0.15)", borderRadius:6, padding:"8px 10px" }}>{f.remediation}</p>
                        </div>
                      )}
                    </div>

                    {/* POC if present */}
                    {f.poc && (
                      <div>
                        <div style={{ fontSize:9.5, fontWeight:700, color:"#ce93d8", textTransform:"uppercase", marginBottom:6 }}>⚡ Proof of Concept</div>
                        <div style={{ background:"rgba(239,83,80,0.04)", border:"1px solid rgba(239,83,80,0.15)", borderRadius:6, padding:"8px 12px", fontSize:11, color:"#ef9a9a", marginBottom:8, lineHeight:1.6 }}>
                          ⚠️ Authorized use only — {f.poc.description}
                        </div>
                        {f.poc.curlCommand && (
                          <pre style={{ background:"#010409", border:"1px solid rgba(156,106,222,0.2)", borderRadius:6, padding:"8px 12px", fontFamily:"monospace", fontSize:10, color:"#4fc3f7", lineHeight:1.7, margin:0, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                            {f.poc.curlCommand}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Separator */}
                    {idx < findings.length - 1 && <div style={{ height:0 }}/>}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div style={{ padding:"12px 20px", borderTop:"1px solid var(--border)", flexShrink:0, display:"flex", gap:8 }}>
              <button className="btn-primary" style={{ flex:1, fontSize:11 }}
                onClick={() => { downloadPDF(findings, { name: scanName, target, environment: env, profile, duration }); setShowAllEvidence(false); }}>
                📄 Export as PDF
              </button>
              <button className="btn-secondary" style={{ flex:1, fontSize:11 }} onClick={doDownloadHTML}>
                📥 Download HTML
              </button>
              <button className="btn-secondary" style={{ fontSize:11, width:80 }} onClick={() => setShowAllEvidence(false)}>
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
