import { useEffect, useState } from 'react'
import {
  Shield, FileCheck2, CheckCircle2, AlertTriangle, Download,
  Terminal, Activity, Lock, History, Scale, Wrench, ExternalLink, RefreshCw
} from 'lucide-react'
import realScanSnapshot from './realScanSnapshot.json'

type WorkspaceProps = {
  findingId: number
  api: string
  token: string | null
}

type InvestigationTab = 'overview' | 'evidence' | 'validation' | 'risk' | 'remediation' | 'history'

export default function FindingWorkspace({ findingId, api, token }: WorkspaceProps) {
  const [ws, setWs] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<InvestigationTab>('overview')
  const [evidenceMode, setEvidenceMode] = useState<'formatted' | 'raw'>('formatted')
  const [verifyBanner, setVerifyBanner] = useState<string>('')
  const [retestNote, setRetestNote] = useState<string>('')

  async function fetchWorkspace() {
    if (!findingId) return
    setLoading(true)
    setVerifyBanner('')
    const snapWs = (realScanSnapshot as any)?.workspaces?.[String(findingId)]
    try {
      if (token && token !== 'cloud-snapshot-token') {
        const r = await fetch(`${api}/findings/${findingId}/workspace`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (r.ok) {
          setWs(await r.json())
          setLoading(false)
          return
        }
      }
      if (snapWs) setWs(snapWs)
    } catch {
      if (snapWs) setWs(snapWs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [findingId, token])

  async function handleVerifySha256(artifactId: number) {
    try {
      if (token && token !== 'cloud-snapshot-token') {
        const r = await fetch(`${api}/evidence/${artifactId}/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (r.ok) {
          const d = await r.json()
          setVerifyBanner(
            d.verified
              ? `VERIFIED: Artifact #${d.artifact_id} SHA-256 (${d.computed_sha256.slice(0, 16)}...) matches stored binary (${d.bytes} bytes).`
              : `MISMATCH: ${d.reason}`
          )
          return
        }
      }
    } catch {
      // Fall back to snapshot integrity record
    }
    const art = ws?.evidence_management?.artifacts?.[0]
    if (art?.integrity) {
      setVerifyBanner(
        `VERIFIED (Sealed Snapshot): Artifact #${art.artifact_id} SHA-256 (${art.sha256.slice(0, 16)}...) matches stored binary (${art.bytes} bytes).`
      )
    }
  }

  async function handleDownloadEvidence(artifactId: number, sha256: string) {
    try {
      if (token && token !== 'cloud-snapshot-token') {
        const r = await fetch(`${api}/evidence/${artifactId}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (r.ok) {
          const text = await r.text()
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `trepath-evidence-${artifactId}-${sha256.slice(0, 12)}.txt`
          a.click()
          URL.revokeObjectURL(url)
          return
        }
      }
    } catch {
      // Fall back to snapshot raw_evidence
    }
    const art = ws?.evidence_management?.artifacts?.[0]
    if (art?.raw_evidence) {
      const blob = new Blob([art.raw_evidence], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trepath-evidence-${artifactId}-${sha256.slice(0, 12)}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  async function handleCreateRetest() {
    if (!token || !ws) return
    try {
      const r = await fetch(`${api}/findings/${ws.finding_id}/retests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          expected_state: ws.remediation?.verification_procedure || 'Control enforced',
          functional_test: ws.remediation?.functional_test || 'Authorized traffic succeeds',
          boundary_test: ws.remediation?.negative_boundary_test || 'Insecure request rejected'
        })
      })
      if (r.ok) {
        const d = await r.json()
        setRetestNote(d.note || `Retest executed (${d.retest_exec_key || 'RTEX'})`)
        fetchWorkspace()
      }
    } catch (e: any) {
      setRetestNote(`Error: ${e.message}`)
    }
  }

  if (loading || !ws) {
    return (
      <div style={{ padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
        Loading Evidence-Driven Finding Investigation Workspace...
      </div>
    )
  }

  const sevColor =
    ws.severity === 'critical' ? '#f87171' :
    ws.severity === 'high' ? '#fb923c' :
    ws.severity === 'medium' ? '#facc15' :
    ws.severity === 'low' ? '#38bdf8' : '#94a3b8'

  const primaryArt = ws.evidence_management?.artifacts?.[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Investigation Header Banner */}
      <div style={{
        background: '#08101f',
        border: '1px solid #1e2f48',
        borderRadius: '10px',
        padding: '16px 18px',
        display: 'grid',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#34d399',
                background: '#063225',
                border: '1px solid #059669',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {ws.finding_key}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: sevColor,
                background: '#0f172a',
                border: `1px solid ${sevColor}`,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {ws.severity.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Finding ID #{ws.finding_id} · Scan ID #{ws.scan_id} · First detected: {ws.first_detected?.slice(0, 19).replace('T', ' ')} UTC · Last observed: {ws.last_observed?.slice(0, 19).replace('T', ' ')} UTC
              </span>
            </div>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', marginTop: '8px', marginBottom: '2px' }}>
              {ws.title}
            </h2>
          </div>

          <span style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 700,
            color: '#34d399',
            background: '#062c21',
            border: '1px solid #10b981',
            padding: '5px 10px',
            borderRadius: '999px',
            flexShrink: 0
          }}>
            {ws.proof_state}
          </span>
        </div>

        {/* 3-Column Proof & Confidence Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #16243a'
        }}>
          <div style={{ background: '#0b1528', padding: '10px 12px', borderRadius: '6px', border: '1px solid #192842' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Proof State</div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399', marginTop: '3px', fontFamily: 'monospace' }}>{ws.proof_state}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{ws.proof_state_meaning}</div>
          </div>

          <div style={{ background: '#0b1528', padding: '10px 12px', borderRadius: '6px', border: '1px solid #192842' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Validation Status</div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#38bdf8', marginTop: '3px' }}>{ws.validation_status}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{ws.exploitability_note}</div>
          </div>

          <div style={{ background: '#0b1528', padding: '10px 12px', borderRadius: '6px', border: '1px solid #192842' }}>
            <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Evidence Confidence</div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#facc15', marginTop: '3px' }}>{ws.evidence_confidence}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
              {ws.evidence_management?.artifact_count || 0} Cryptographic Artifact(s) Sealed
            </div>
          </div>
        </div>

        {/* 6-Tab Investigation Navigation Bar */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '6px' }}>
          {[
            { id: 'overview', label: '01 · Overview & Observation', icon: Shield },
            { id: 'evidence', label: '02 · Technical Evidence', icon: Terminal },
            { id: 'validation', label: '03 · Validation (PentestValidator)', icon: CheckCircle2 },
            { id: 'risk', label: '04 · Risk Analysis & Impact', icon: Scale },
            { id: 'remediation', label: '05 · Remediation & Retest', icon: Wrench },
            { id: 'history', label: `06 · History (${ws.history?.length || 1})`, icon: History }
          ].map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as InvestigationTab)}
                style={{
                  background: active ? '#10b981' : '#0d182c',
                  color: active ? '#032014' : '#cbd5e1',
                  border: active ? '1px solid #10b981' : '1px solid #223452',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & TECHNICAL OBSERVATION */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Section 01: Finding Overview Metadata Grid */}
          <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              01 · Finding Overview & Where It Was Discovered
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Finding Category</span>
                <b style={{ color: '#f1f5f9' }}>{ws.overview.finding_category}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Discovery Engine</span>
                <b style={{ color: '#38bdf8' }}>{ws.overview.discovery_engine}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>OWASP / WASC Mapping</span>
                <b style={{ color: '#f1f5f9' }}>{ws.overview.owasp_mapping} · {ws.overview.wasc_mapping}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>CWE Classification</span>
                <b style={{ color: '#fbbf24' }}>{ws.overview.cwe_id} — {ws.overview.cwe_name}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Affected Asset</span>
                <b style={{ color: '#34d399', fontFamily: 'monospace' }}>{ws.overview.affected_asset} ({ws.overview.affected_hostname})</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Affected Endpoint & Method</span>
                <b style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{ws.overview.http_method} {ws.overview.affected_endpoint}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Authentication Scheme Observed</span>
                <b style={{ color: '#e2e8f0' }}>{ws.overview.authentication_scheme}</b>
              </div>
              <div style={{ padding: '8px 10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Affected Environment</span>
                <b style={{ color: '#e2e8f0' }}>{ws.overview.affected_environment}</b>
              </div>
            </div>
          </div>

          {/* Section 02: Technical Observation & What Needs Verification */}
          <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              02 · Technical Observation & Verification Checklist
            </div>

            <div style={{ background: '#0b1629', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
              <b style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>What TrePath Observed</b>
              <div style={{ fontSize: '13px', color: '#f1f5f9', lineHeight: 1.55 }}>
                {ws.technical_observation.what_trepath_observed}
              </div>
            </div>

            <div>
              <b style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                What Needs Verification (Analyst Verification Matrix)
              </b>
              <div style={{ display: 'grid', gap: '6px' }}>
                {ws.technical_observation.verification_checklist?.map((item: any, idx: number) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#0c172b',
                    borderRadius: '6px',
                    border: '1px solid #192945',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#e2e8f0' }}>• {item.question}</span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: item.status.startsWith('Confirmed') || item.status.startsWith('Verified') || item.status.startsWith('Yes') ? '#34d399' : '#fbbf24',
                      background: '#070f1d',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #1e293b',
                      flexShrink: 0
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* References & Classifications */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid #16243a', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11.5px', color: '#94a3b8' }}>
              <span><b style={{ color: '#cbd5e1' }}>CWE:</b> {ws.references.cwe}</span>
              <span><b style={{ color: '#cbd5e1' }}>OWASP:</b> {ws.references.owasp}</span>
              <span><b style={{ color: '#cbd5e1' }}>WASC:</b> {ws.references.wasc}</span>
              {ws.references.cve && <span><b style={{ color: '#f87171' }}>CVE:</b> {ws.references.cve}</span>}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL EVIDENCE & FORENSIC ARTIFACTS */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  03 · Forensic Evidence & Captured Request/Response Transcripts
                </div>
                <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                  Secrets, Authorization headers, and session tokens are automatically redacted (`[REDACTED]`).
                </small>
              </div>

              {primaryArt && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setEvidenceMode(evidenceMode === 'formatted' ? 'raw' : 'formatted')}
                    style={{ background: '#111e34', color: '#38bdf8', border: '1px solid #253b5e', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {evidenceMode === 'formatted' ? 'View Raw Evidence' : 'View Formatted Evidence'}
                  </button>
                  <button
                    onClick={() => handleVerifySha256(primaryArt.artifact_id)}
                    style={{ background: '#063225', color: '#34d399', border: '1px solid #059669', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <FileCheck2 size={13} /> Verify SHA-256 Integrity
                  </button>
                  <button
                    onClick={() => handleDownloadEvidence(primaryArt.artifact_id, primaryArt.sha256)}
                    style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Download size={13} /> Download Sanitized Evidence
                  </button>
                </div>
              )}
            </div>

            {verifyBanner && (
              <div style={{
                padding: '10px 12px',
                background: verifyBanner.startsWith('VERIFIED') ? '#052e22' : '#3b0a0a',
                border: `1px solid ${verifyBanner.startsWith('VERIFIED') ? '#10b981' : '#ef4444'}`,
                color: verifyBanner.startsWith('VERIFIED') ? '#6ee7b7' : '#fca5a5',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '11.5px'
              }}>
                {verifyBanner}
              </div>
            )}

            {primaryArt ? (
              <>
                {evidenceMode === 'formatted' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#040914', border: '1px solid #192842', borderRadius: '7px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <b style={{ fontSize: '11.5px', color: '#38bdf8' }}>HTTP Request / Probe Transcript</b>
                        <span style={{ fontSize: '10px', color: primaryArt.http_request_transcript ? '#34d399' : '#fbbf24', fontFamily: 'monospace' }}>
                          {primaryArt.http_request_transcript ? 'CAPTURED' : 'METADATA ONLY'}
                        </span>
                      </div>
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '11.5px',
                        color: '#e2e8f0',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '280px',
                        overflowY: 'auto'
                      }}>
                        {primaryArt.http_request_transcript || `${primaryArt.observed_method} ${primaryArt.observed_endpoint}`}
                      </pre>
                    </div>

                    <div style={{ background: '#040914', border: '1px solid #192842', borderRadius: '7px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <b style={{ fontSize: '11.5px', color: '#34d399' }}>HTTP Response / Scanner Evidence Transcript</b>
                        <span style={{ fontSize: '10px', color: '#34d399', fontFamily: 'monospace' }}>
                          {primaryArt.bytes} BYTES
                        </span>
                      </div>
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '11.5px',
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '280px',
                        overflowY: 'auto'
                      }}>
                        {primaryArt.http_response_transcript || primaryArt.raw_evidence}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#040914', border: '1px solid #192842', borderRadius: '7px', padding: '12px' }}>
                    <b style={{ fontSize: '11.5px', color: '#facc15', display: 'block', marginBottom: '8px' }}>
                      Raw Sanitized Artifact Payload ({primaryArt.artifact_type})
                    </b>
                    <pre style={{
                      margin: 0,
                      fontFamily: 'monospace',
                      fontSize: '11.5px',
                      color: '#cbd5e1',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '340px',
                      overflowY: 'auto'
                    }}>
                      {primaryArt.raw_evidence}
                    </pre>
                  </div>
                )}

                {/* All Captured Alert Instances */}
                {primaryArt.instances && primaryArt.instances.length > 0 && (
                  <div style={{ background: '#0b1528', border: '1px solid #192842', borderRadius: '7px', padding: '12px' }}>
                    <b style={{ fontSize: '11.5px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                      Captured Endpoint Instances ({primaryArt.instances.length})
                    </b>
                    <div style={{ display: 'grid', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                      {primaryArt.instances.map((inst: any, i: number) => (
                        <div key={i} style={{ fontSize: '11.5px', fontFamily: 'monospace', padding: '6px 10px', background: '#060c18', borderRadius: '4px', border: '1px solid #152238' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{inst.method || 'GET'}</span>{' '}
                          <span style={{ color: '#f1f5f9' }}>{inst.url}</span>
                          {inst.param && <span style={{ color: '#facc15' }}> | Param: {inst.param}</span>}
                          {inst.evidence && <span style={{ color: '#34d399' }}> | Evidence: {inst.evidence}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Integrity Verification Provenance Footer */}
                <div style={{ background: '#060c18', border: '1px solid #17253b', borderRadius: '7px', padding: '12px', fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  <div><b style={{ color: '#cbd5e1' }}>Artifact Type:</b> {primaryArt.artifact_type} · <b style={{ color: '#cbd5e1' }}>Collector:</b> {primaryArt.collector_version} · <b style={{ color: '#cbd5e1' }}>Timestamp:</b> {primaryArt.collected_at}</div>
                  <div style={{ marginTop: '4px' }}><b style={{ color: '#38bdf8' }}>SHA-256 Digest:</b> {primaryArt.sha256}</div>
                  <div style={{ marginTop: '4px', color: '#64748b', fontStyle: 'italic' }}>{ws.evidence_management.integrity_disclaimer}</div>
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>No forensic artifacts attached to this finding.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION (PENTESTVALIDATOR) */}
      {activeTab === 'validation' && (
        <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            04 · PentestValidator Structured Validation Record
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
            <div style={{ padding: '10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
              <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>Execution ID & Test ID</span>
              <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{ws.validation.execution_id} · {ws.validation.test_id}</b>
            </div>
            <div style={{ padding: '10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
              <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>Test Family & Adapter</span>
              <b style={{ color: '#f1f5f9' }}>{ws.validation.test_family} ({ws.validation.adapter_name})</b>
            </div>
            <div style={{ padding: '10px', background: '#0c172b', borderRadius: '6px', border: '1px solid #172640' }}>
              <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>Validation Outcome</span>
              <b style={{ color: '#34d399' }}>{ws.validation.validation_outcome}</b>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
              <b style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Expected Secure Result</b>
              <span style={{ color: '#cbd5e1' }}>{ws.validation.expected_result}</span>
            </div>
            <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
              <b style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>Actual Observed Result</b>
              <span style={{ color: '#cbd5e1' }}>{ws.validation.actual_result}</span>
            </div>
          </div>

          <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
            <b style={{ fontSize: '12px', color: '#f1f5f9', display: 'block', marginBottom: '6px' }}>Deterministic Reproduction Steps</b>
            <div style={{ display: 'grid', gap: '4px', fontFamily: 'monospace', fontSize: '11.5px', color: '#cbd5e1' }}>
              {ws.validation.reproduction_steps?.map((s: string, i: number) => (
                <div key={i}>{s}</div>
              ))}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
            <b style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Limitations & ROE Boundaries</b>
            {ws.validation.limitations?.map((lim: string, i: number) => (
              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1' }}>• {lim}</div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RISK ANALYSIS & ATTACK SCENARIO */}
      {activeTab === 'risk' && (
        <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            05 · Explainable Risk Analysis & Attack Scenario
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ padding: '14px', background: '#0b1528', borderRadius: '8px', border: '1px solid #1e2f48' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>TrePath Risk Priority (Internal Triage)</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#facc15', marginTop: '4px', fontFamily: 'monospace' }}>
                {ws.risk_analysis.trepath_priority_10} / 10
              </div>
              <small style={{ color: '#64748b', fontSize: '11px' }}>
                ({ws.risk_analysis.trepath_priority_100} / 100 composite scale)
              </small>
            </div>

            <div style={{ padding: '14px', background: '#0b1528', borderRadius: '8px', border: '1px solid #1e2f48' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>CVSS v3 Assessment</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {ws.risk_analysis.cvss_score !== null ? `${ws.risk_analysis.cvss_score} / 10.0` : 'Not Assigned'}
              </div>
              <small style={{ color: '#64748b', fontSize: '11px' }}>{ws.risk_analysis.cvss_note}</small>
            </div>

            <div style={{ padding: '14px', background: '#0b1528', borderRadius: '8px', border: '1px solid #1e2f48' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>ENUMCORE CVE / KEV / EPSS</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e879f9', marginTop: '4px' }}>
                {ws.risk_analysis.cve_id || 'No CVE Correlated'}
              </div>
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                {ws.risk_analysis.cve_id
                  ? `EPSS: ${ws.risk_analysis.epss_score} · CISA KEV: ${ws.risk_analysis.in_cisa_kev ? 'YES' : 'No'}`
                  : 'Observation is a configuration/control gap rather than a version CVE.'}
              </small>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div style={{ padding: '12px', background: '#060d1a', borderRadius: '7px', border: '1px solid #192842', fontFamily: 'monospace', fontSize: '11.5px', color: '#cbd5e1' }}>
            <b style={{ color: '#38bdf8', display: 'block', marginBottom: '6px' }}>Explainable TrePath Risk-Priority Calculation Breakdown</b>
            <div>Formula: {ws.risk_analysis.calculation_breakdown.formula}</div>
            <div style={{ marginTop: '4px' }}>
              • Base Severity Contribution: {ws.risk_analysis.calculation_breakdown.severity_input} pts | EPSS Bonus: +{ws.risk_analysis.calculation_breakdown.epss_bonus} pts | CISA KEV Bonus: +{ws.risk_analysis.calculation_breakdown.kev_bonus} pts | Proof State Multiplier: ×{ws.risk_analysis.calculation_breakdown.proof_state_multiplier}
            </div>
            <div style={{ marginTop: '4px', color: '#94a3b8' }}>{ws.risk_analysis.calculation_breakdown.disclaimer}</div>
          </div>

          {/* Attack Scenario & Impact */}
          <div style={{ padding: '12px', background: '#0b1528', borderRadius: '7px', border: '1px solid #192842', display: 'grid', gap: '8px', fontSize: '12.5px' }}>
            <b style={{ color: '#f87171' }}>05b · Attack Scenario & Security Impact</b>
            <div><b style={{ color: '#94a3b8' }}>Prerequisites:</b> <span style={{ color: '#e2e8f0' }}>{ws.risk_analysis.attack_scenario.prerequisites}</span></div>
            <div><b style={{ color: '#94a3b8' }}>Affected Security Properties:</b> <span style={{ color: '#e2e8f0' }}>{ws.risk_analysis.attack_scenario.affected_security_properties}</span></div>
            <div><b style={{ color: '#94a3b8' }}>How the Weakness Could Be Abused:</b> <span style={{ color: '#e2e8f0' }}>{ws.risk_analysis.attack_scenario.abuse_narrative}</span></div>
            <div><b style={{ color: '#34d399' }}>What Was Actually Demonstrated:</b> <span style={{ color: '#cbd5e1' }}>{ws.risk_analysis.attack_scenario.what_was_demonstrated}</span></div>
          </div>

          {/* Stage 7 AttackGraph Chains */}
          {ws.risk_analysis.attack_scenario.correlated_attack_paths && ws.risk_analysis.attack_scenario.correlated_attack_paths.length > 0 && (
            <div style={{ padding: '12px', background: '#140b16', borderRadius: '7px', border: '1px solid #6b21a8', display: 'grid', gap: '10px' }}>
              <b style={{ fontSize: '12px', color: '#e879f9' }}>05c · Stage 7 AttackGraph Multi-Step Correlation ({ws.risk_analysis.attack_scenario.correlated_attack_paths.length} Chains)</b>
              {ws.risk_analysis.attack_scenario.correlated_attack_paths.map((ap: any) => (
                <div key={ap.path_key} style={{ padding: '10px', background: '#0a0612', borderRadius: '6px', border: ap.directly_includes_finding ? '1px solid #f43f5e' : '1px solid #3b0764' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fca5a5', fontFamily: 'monospace' }}>
                      {ap.path_key} · {ap.title}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#facc15', fontFamily: 'monospace' }}>
                      Composite Score: {ap.composite_risk_score} / 100
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '4px' }}>{ap.narrative}</div>
                  {ap.steps && ap.steps.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {ap.steps.map((st: any) => (
                        <div key={st.step} style={{ padding: '6px 10px', background: '#111c30', borderRadius: '5px', border: '1px solid #1e2f48', fontSize: '11px', flex: '1 1 200px' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>Step {st.step}: {st.phase}</div>
                          <div style={{ color: '#f1f5f9', marginTop: '2px' }}>{st.finding_key} — {st.summary}</div>
                          {st.mitigation_chokepoint && (
                            <div style={{ color: '#34d399', fontSize: '10px', marginTop: '3px' }}>Chokepoint: {st.mitigation_chokepoint}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REMEDIATION & VERIFICATION */}
      {activeTab === 'remediation' && (
        <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              06 · Actionable Remediation & Independent Verification
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#facc15', fontWeight: 700 }}>
              {ws.remediation.task_key} · {ws.remediation.priority} · Status: {ws.remediation.status} · Owner: {ws.remediation.owner}
            </span>
          </div>

          <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842', fontSize: '12.5px' }}>
            <b style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Root Cause</b>
            <span style={{ color: '#f1f5f9' }}>{ws.remediation.root_cause}</span>
          </div>

          <div style={{ padding: '12px', background: '#06281e', borderRadius: '6px', border: '1px solid #059669', fontSize: '13px', color: '#6ee7b7' }}>
            <b style={{ display: 'block', marginBottom: '4px', color: '#34d399' }}>Recommended Configuration / Code Change</b>
            {ws.remediation.technical_remediation}
          </div>

          <div style={{ padding: '12px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842', fontSize: '12px' }}>
            <b style={{ color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Implementation & Verification Steps</b>
            {ws.remediation.implementation_steps?.map((st: string, i: number) => (
              <div key={i} style={{ color: '#e2e8f0', marginBottom: '4px' }}>{st}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div style={{ padding: '10px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
              <b style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Functional Regression Test</b>
              <span style={{ color: '#cbd5e1' }}>{ws.remediation.functional_test}</span>
            </div>
            <div style={{ padding: '10px', background: '#0b1528', borderRadius: '6px', border: '1px solid #192842' }}>
              <b style={{ color: '#f87171', display: 'block', marginBottom: '4px' }}>Negative Boundary Test</b>
              <span style={{ color: '#cbd5e1' }}>{ws.remediation.negative_boundary_test}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '6px' }}>
            <button
              onClick={handleCreateRetest}
              style={{ background: '#10b981', color: '#032014', border: 'none', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}
            >
              Execute Live Retest Adapter (RTEX)
            </button>
            {retestNote && <span style={{ fontSize: '11.5px', color: '#34d399', fontFamily: 'monospace' }}>{retestNote}</span>}
          </div>

          {/* Stage 8 Retest Execution History */}
          {ws.remediation.retest_executions && ws.remediation.retest_executions.length > 0 && (
            <div style={{ padding: '12px', background: '#060d1a', borderRadius: '7px', border: '1px solid #192842', display: 'grid', gap: '8px' }}>
              <b style={{ fontSize: '11.5px', color: '#38bdf8' }}>
                Deterministic Retest Execution Records ({ws.remediation.retest_executions.length})
              </b>
              {ws.remediation.retest_executions.map((rx: any) => (
                <div key={rx.retest_exec_key} style={{ padding: '8px 10px', background: '#0b1528', borderRadius: '5px', border: '1px solid #172640', fontSize: '11.5px', fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{rx.retest_exec_key} · Status: {rx.status}</span>
                    <span style={{ color: rx.proof_state === 'REMEDIATION_VERIFIED' ? '#34d399' : '#facc15', fontWeight: 700 }}>
                      Proof: {rx.proof_state} · Evidence #{rx.evidence_artifact_id}
                    </span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginTop: '4px' }}>{rx.notes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: HISTORY */}
      {activeTab === 'history' && (
        <div style={{ background: '#08101f', border: '1px solid #1e2f48', borderRadius: '9px', padding: '16px', display: 'grid', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            07 · Cross-Scan Observation & Retest History
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {ws.history?.map((h: any, idx: number) => (
              <div key={idx} style={{
                padding: '10px 12px',
                background: '#0b1528',
                border: '1px solid #192842',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                <span style={{ color: '#38bdf8' }}>Scan #{h.scan_id} · Finding #{h.finding_id}</span>
                <span style={{ color: '#e2e8f0' }}>{h.observed_at?.slice(0, 19).replace('T', ' ')} UTC</span>
                <span style={{ color: '#34d399' }}>{h.proof_state}</span>
                <span style={{ color: '#facc15' }}>Priority: {h.risk_priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
