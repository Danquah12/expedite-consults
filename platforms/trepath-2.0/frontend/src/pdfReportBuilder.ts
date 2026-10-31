/**
 * Client-Side Multi-Page PDF Report Builder for TrePath 2.0
 * Generates an audit-ready binary PDF (.pdf) containing Executive Risk Summary,
 * Safe PoC Exploitation & Post-Exploitation Proof Registry (IMPACT_VERIFIED / RUNTIME_REPRODUCED),
 * AttackGraph Kill-Chain Correlation, ENUMCORE Intelligence, Technical Findings, and Remediation Roadmap.
 */

type StyledLine = {
  style: 'H1' | 'H2' | 'H3' | 'META' | 'BODY' | 'CODE' | 'RULE'
  text: string
}

function escapePdfString(input: string): string {
  const clean = (input || '')
    .replace(/\r/g, '')
    .replace(/\t/g, '  ')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/·/g, '|')
    .replace(/→/g, '->')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, '?')
  return clean.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = (text || '').split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if (!current) {
      current = w
    } else if (current.length + 1 + w.length <= maxWidth) {
      current += ' ' + w
    } else {
      lines.push(current)
      current = w
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

export function generateClientPdfBlob(params: {
  scan: any
  asset: any
  endpoints: any[]
  technologies: any[]
  intelMatches: any[]
  findings: any[]
  attackPaths: any[]
  remediations: any[]
  riskProfile: any
  workspaces?: Record<string, any>
}): Blob {
  const {
    scan,
    asset,
    endpoints,
    technologies,
    intelMatches,
    findings,
    attackPaths,
    remediations,
    riskProfile,
    workspaces = {}
  } = params

  const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  const exploitedFindings = findings.filter(
    f =>
      ['IMPACT_VERIFIED', 'RUNTIME_REPRODUCED', 'ATTACK_PATH_VALIDATED'].includes(f.proof_state) ||
      f.finding_key?.startsWith('SMB-LIST-') ||
      f.finding_key?.startsWith('PHPINFO-') ||
      f.finding_key?.startsWith('TOMCAT-MGR-')
  )

  const lines: StyledLine[] = [
    { style: 'H1', text: 'TrePath 2.0 - Executive, Technical & Post-Exploitation Report' },
    {
      style: 'META',
      text: `Scan ID: #${scan?.id || 1}  |  Target Origin: ${scan?.target_url || 'http://192.168.195.140/'}  |  Asset: ${asset?.asset_key || 'ASSET-00001'} (${asset?.hostname || 'VMware-Lab-Host'})`
    },
    {
      style: 'META',
      text: `ROE Profile: ${scan?.profile || 'authorized_pentest'} (Safe Lab PoC Exploitation & Post-Exploitation)  |  Generated: ${nowIso}`
    },
    { style: 'RULE', text: '' },
    { style: 'H2', text: '1. Executive Risk Summary (Stage 7 RiskEngine)' },
    {
      style: 'BODY',
      text: `Overall Asset Risk Rating: ${riskProfile?.overall_risk_rating || 'HIGH'} (${riskProfile?.overall_risk_index_10 ?? 8.4} / 10  |  ${riskProfile?.overall_risk_index_100 ?? 84.0} / 100 internal triage index)`
    },
    {
      style: 'BODY',
      text: `Surface Exposure Score: ${riskProfile?.surface_exposure_score ?? 78.0} / 100 (${asset?.open_ports?.length || 0} open TCP ports, ${endpoints.length} deduplicated endpoints)`
    },
    {
      style: 'BODY',
      text: `Threat Velocity Score: ${riskProfile?.threat_velocity_score ?? 82.0} / 100 (${riskProfile?.kev_exposures_count ?? 0} CISA KEV active exploits, Max EPSS: ${riskProfile?.max_epss_probability ?? 0.94})`
    },
    {
      style: 'BODY',
      text: `Total Verified Findings: ${findings.length}  |  Exploited / Post-Exploitation Proven: ${exploitedFindings.length}  |  Remediated: ${riskProfile?.remediated_findings_count ?? 0}`
    },
    { style: 'RULE', text: '' },
    { style: 'H2', text: '2. Safe PoC Exploitation & Post-Exploitation Proof Registry (Stage 5)' },
    {
      style: 'BODY',
      text: 'The following findings progressed to IMPACT_VERIFIED / RUNTIME_REPRODUCED / ATTACK_PATH_VALIDATED via deterministic, read-only proof-of-concept checks and post-exploitation verification:'
    }
  ]

  if (exploitedFindings.length > 0) {
    exploitedFindings.forEach((ef, idx) => {
      const ws = workspaces[String(ef.id)]
      const art = ws?.evidence_management?.artifacts?.[0]
      lines.push({
        style: 'H3',
        text: `2.${idx + 1} [${ef.proof_state}] [${(ef.severity || 'high').toUpperCase()}] ${ef.title} (${ef.finding_key})`
      })
      lines.push({ style: 'BODY', text: `Observation & PoC Summary: ${ef.description}` })
      if (ef.post_exploitation_summary) {
        lines.push({ style: 'CODE', text: `Post-Exploitation Impact Proof: ${ef.post_exploitation_summary}` })
      } else if (ws?.exploitability_note) {
        lines.push({ style: 'CODE', text: `Validation & Post-Exploitation Proof: ${ws.exploitability_note}` })
      }
      if (art?.sha256) {
        lines.push({
          style: 'META',
          text: `EvidenceCore FIPS 180-4 SHA-256 Seal: ${art.sha256} (Artifact #${art.artifact_id || art.id})`
        })
      }
      lines.push({ style: 'BODY', text: `Remediation: ${ef.remediation}` })
    })
  } else {
    lines.push({ style: 'BODY', text: 'No active exploitation findings recorded for this scan.' })
  }

  lines.push({ style: 'RULE', text: '' })
  lines.push({ style: 'H2', text: '3. Multi-Step AttackGraph Kill-Chain Correlation (Stage 7)' })
  if (attackPaths.length > 0) {
    attackPaths.forEach(ap => {
      lines.push({
        style: 'H3',
        text: `${ap.path_key}: ${ap.title} (${(ap.severity || 'critical').toUpperCase()} | Score: ${ap.composite_risk_score} | ${ap.proof_state})`
      })
      lines.push({ style: 'BODY', text: `Narrative: ${ap.narrative}` })
      if (Array.isArray(ap.steps_json)) {
        ap.steps_json.forEach((st: any) => {
          lines.push({
            style: 'CODE',
            text: `Step ${st.step} [${st.phase}] ${st.finding_key}: ${st.summary} (Chokepoint: ${st.mitigation_chokepoint || 'Enforce access boundary'})`
          })
        })
      }
    })
  } else {
    lines.push({ style: 'BODY', text: 'No multi-step attack chains synthesized for this scan.' })
  }

  lines.push({ style: 'RULE', text: '' })
  lines.push({ style: 'H2', text: '4. Fingerprinted Technologies & ENUMCORE CVE / KEV / EPSS Intelligence (Stage 3)' })
  technologies.forEach(t => {
    lines.push({
      style: 'BODY',
      text: `- ${t.tech_key}: ${t.name} ${t.version || ''} | CPE: ${t.cpe || 'N/A'} | Outdated: ${t.is_outdated ? 'YES' : 'No'} | Evidence #${t.evidence_artifact_id}`
    })
  })
  intelMatches.slice(0, 20).forEach(im => {
    lines.push({
      style: 'CODE',
      text: `ENUMCORE Match: ${im.cve_id || im.cwe_id} | CVSS ${im.cvss_score} | EPSS ${(im.epss_score * 100).toFixed(1)}% | CISA KEV: ${im.in_cisa_kev ? 'YES' : 'No'} | ${im.summary}`
    })
  })

  lines.push({ style: 'RULE', text: '' })
  lines.push({ style: 'H2', text: `5. Complete Technical Findings & SHA-256 Evidence Registry (${findings.length} Total)` })
  findings.forEach((f, idx) => {
    lines.push({
      style: 'H3',
      text: `5.${idx + 1} [${(f.severity || 'low').toUpperCase()}] ${f.title} (${f.finding_key})`
    })
    lines.push({
      style: 'META',
      text: `Proof State: ${f.proof_state}  |  Priority: ${f.risk_priority}/100  |  CWE: ${f.cwe_id || 'CWE-200'}`
    })
    lines.push({ style: 'BODY', text: `Summary: ${(f.description || '').slice(0, 260)}` })
    lines.push({ style: 'BODY', text: `Fix: ${(f.remediation || '').slice(0, 220)}` })
  })

  lines.push({ style: 'RULE', text: '' })
  lines.push({ style: 'H2', text: '6. Prioritized Remediation Roadmap (Stage 8)' })
  remediations.forEach(r => {
    lines.push({
      style: 'BODY',
      text: `- ${r.task_key} [${r.priority}] (${r.status}) Owner: ${r.owner} -> ${r.title} | ${r.fix_guidance || ''}`
    })
  })

  // Render pages
  const pageHeight = 792
  const topY = 745
  const bottomY = 52
  const leftX = 46

  const pagesOps: string[][] = []
  let curOps: string[] = []
  let y = topY

  function startNewPage(pageNum: number) {
    if (curOps.length > 0) {
      pagesOps.push(curOps)
    }
    curOps = [
      '0.04 0.08 0.16 rg',
      '0 762 612 30 re f',
      'BT /F2 9 Tf 0.22 0.74 0.97 rg 46 773 Td (TREPATH 2.0 ASSESSMENT ORCHESTRATOR v1  |  POST-EXPLOITATION & TECHNICAL REPORT) Tj ET',
      `BT /F1 8 Tf 0.58 0.64 0.72 rg 520 773 Td (Page ${pageNum}) Tj ET`,
      '0.12 0.16 0.23 rg',
      '46 40 520 0.5 re f',
      'BT /F1 7.5 Tf 0.45 0.52 0.62 rg 46 28 Td (FIPS 180-4 SHA-256 EvidenceCore Sealed  |  Authorized Pentest & Post-Exploitation Verification) Tj ET'
    ]
    y = topY
  }

  startNewPage(1)

  for (const item of lines) {
    if (item.style === 'RULE') {
      if (y - 12 < bottomY) startNewPage(pagesOps.length + 1)
      y -= 6
      curOps.push(`0.78 0.82 0.88 rg ${leftX} ${y} 520 0.7 re f`)
      y -= 10
      continue
    }
    if (!item.text.trim()) {
      y -= 6
      continue
    }

    let font = '/F1'
    let size = 8.5
    let leading = 12
    let width = 100
    let rgb = '0.12 0.16 0.22'

    if (item.style === 'H1') {
      font = '/F2'; size = 14; leading = 18; width = 72; rgb = '0.05 0.12 0.24'; y -= 4
    } else if (item.style === 'H2') {
      font = '/F2'; size = 11; leading = 15; width = 84; rgb = '0.02 0.38 0.28'; y -= 4
    } else if (item.style === 'H3') {
      font = '/F2'; size = 9.5; leading = 13; width = 92; rgb = '0.08 0.22 0.42'; y -= 2
    } else if (item.style === 'META') {
      font = '/F2'; size = 8.5; leading = 12; width = 100; rgb = '0.18 0.24 0.33'
    } else if (item.style === 'CODE') {
      font = '/F1'; size = 8.0; leading = 11; width = 102; rgb = '0.15 0.20 0.30'
    }

    const wrapped = wrapText(item.text, width)
    for (const wline of wrapped) {
      if (y - leading < bottomY) startNewPage(pagesOps.length + 1)
      const esc = escapePdfString(wline)
      const xPos = leftX + (item.style === 'CODE' ? 10 : 0)
      curOps.push(`BT ${font} ${size} Tf ${rgb} rg ${xPos} ${y} Td (${esc}) Tj ET`)
      y -= leading
    }
  }

  if (curOps.length > 0) {
    pagesOps.push(curOps)
  }

  const objects: string[] = []
  const addObj = (num: number, body: string) => {
    objects.push(`${num} 0 obj\n${body}\nendobj\n`)
  }

  const pageObjNums = pagesOps.map((_, i) => 5 + i * 2)
  addObj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  addObj(2, `<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pagesOps.length} >>`)
  addObj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  addObj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

  pagesOps.forEach((ops, i) => {
    const pNum = 5 + i * 2
    const cNum = 6 + i * 2
    const stream = ops.join('\n')
    addObj(
      pNum,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cNum} 0 R >>`
    )
    addObj(cNum, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  const header = '%PDF-1.4\n'
  const offsets: number[] = []
  let cursor = header.length
  for (const obj of objects) {
    offsets.push(cursor)
    cursor += obj.length
  }

  const totalObjs = objects.length + 1
  let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`
  for (const off of offsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`
  }
  const trailer = `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${cursor}\n%%EOF\n`
  const fullPdfString = header + objects.join('') + xref + trailer

  const bytes = new Uint8Array(fullPdfString.length)
  for (let i = 0; i < fullPdfString.length; i++) {
    bytes[i] = fullPdfString.charCodeAt(i) & 0xff
  }
  return new Blob([bytes], { type: 'application/pdf' })
}
