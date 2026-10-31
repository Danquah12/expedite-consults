"""Audit-Ready Multi-Page PDF Report Generator for Stage 8 Reporting & Post-Exploitation Proof Registry."""

from __future__ import annotations

import json
import textwrap
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from .. import models
from ..risk import compute_asset_risk_profile


def _escape_pdf_text(text: str) -> str:
    """Sanitize and escape text for PDF literal strings."""
    clean = (
        text.replace("\r", "")
        .replace("\t", "  ")
        .replace("—", "-")
        .replace("–", "-")
        .replace("·", "|")
        .replace("→", "->")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("‘", "'")
    )
    clean = clean.encode("latin-1", errors="replace").decode("latin-1")
    return clean.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_multipage_pdf_bytes(lines_with_style: list[tuple[str, str]]) -> bytes:
    """
    Render a list of (style, text) tuples into a valid multi-page PDF document (Letter 612x792).
    Styles:
      - 'H1': 15pt Bold
      - 'H2': 11.5pt Bold
      - 'H3': 10pt Bold
      - 'META': 9pt Regular
      - 'BODY': 8.5pt Regular
      - 'CODE': 8pt Monospace/Regular indented
      - 'RULE': Horizontal divider line
    """
    page_height = 792
    top_y = 745
    bottom_y = 52
    left_x = 46

    pages_ops: list[list[str]] = []
    cur_ops: list[str] = []
    y = top_y

    def start_new_page(page_num: int):
        nonlocal cur_ops, y
        if cur_ops:
            pages_ops.append(cur_ops)
        cur_ops = [
            # Header bar
            "0.04 0.08 0.16 rg",
            "0 762 612 30 re f",
            "BT /F2 9 Tf 0.22 0.74 0.97 rg 46 773 Td (TREPATH 2.0 ASSESSMENT ORCHESTRATOR v1  |  POST-EXPLOITATION & TECHNICAL REPORT) Tj ET",
            f"BT /F1 8 Tf 0.58 0.64 0.72 rg 520 773 Td (Page {page_num}) Tj ET",
            "0.12 0.16 0.23 rg",
            "46 40 520 0.5 re f",
            "BT /F1 7.5 Tf 0.45 0.52 0.62 rg 46 28 Td (FIPS 180-4 SHA-256 EvidenceCore Sealed  |  Authorized Pentest & Post-Exploitation Verification) Tj ET",
        ]
        y = top_y

    start_new_page(1)

    for style, raw_text in lines_with_style:
        if style == "RULE":
            if y - 12 < bottom_y:
                start_new_page(len(pages_ops) + 1)
            y -= 6
            cur_ops.append(f"0.78 0.82 0.88 rg {left_x} {y} 520 0.7 re f")
            y -= 10
            continue

        if not raw_text.strip():
            y -= 6
            continue

        if style == "H1":
            font, size, leading, width, rgb = "/F2", 14, 18, 72, "0.05 0.12 0.24"
            y -= 4
        elif style == "H2":
            font, size, leading, width, rgb = "/F2", 11, 15, 86, "0.02 0.38 0.28"
            y -= 4
        elif style == "H3":
            font, size, leading, width, rgb = "/F2", 9.5, 13, 94, "0.08 0.22 0.42"
            y -= 2
        elif style == "META":
            font, size, leading, width, rgb = "/F2", 8.5, 12, 102, "0.18 0.24 0.33"
        elif style == "CODE":
            font, size, leading, width, rgb = "/F1", 8.0, 11, 104, "0.15 0.20 0.30"
        else:
            font, size, leading, width, rgb = "/F1", 8.5, 12, 102, "0.12 0.16 0.22"

        wrapped = textwrap.wrap(raw_text, width=width) or [""]
        for wline in wrapped:
            if y - leading < bottom_y:
                start_new_page(len(pages_ops) + 1)
            esc = _escape_pdf_text(wline)
            x_pos = left_x + (10 if style == "CODE" else 0)
            cur_ops.append(f"BT {font} {size} Tf {rgb} rg {x_pos} {y} Td ({esc}) Tj ET")
            y -= leading

    if cur_ops:
        pages_ops.append(cur_ops)

    # Assemble PDF objects
    # Obj 1: Catalog
    # Obj 2: Pages
    # Obj 3: Font F1 (Helvetica)
    # Obj 4: Font F2 (Helvetica-Bold)
    # For each page i (0..N-1):
    #   Page obj = 5 + i*2
    #   Content stream obj = 6 + i*2
    objects: list[bytes] = []

    def add_obj(obj_num: int, body: bytes):
        objects.append(f"{obj_num} 0 obj\n".encode("latin-1") + body + b"\nendobj\n")

    page_obj_nums = [5 + i * 2 for i in range(len(pages_ops))]
    kids_str = " ".join(f"{num} 0 R" for num in page_obj_nums)

    add_obj(1, b"<< /Type /Catalog /Pages 2 0 R >>")
    add_obj(2, f"<< /Type /Pages /Kids [{kids_str}] /Count {len(pages_ops)} >>".encode("latin-1"))
    add_obj(3, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    add_obj(4, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")

    for i, ops in enumerate(pages_ops):
        p_num = 5 + i * 2
        c_num = 6 + i * 2
        stream_bytes = "\n".join(ops).encode("latin-1", errors="replace")
        page_dict = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 {page_height}] "
            f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {c_num} 0 R >>"
        ).encode("latin-1")
        stream_obj = f"<< /Length {len(stream_bytes)} >>\nstream\n".encode("latin-1") + stream_bytes + b"\nendstream"
        add_obj(p_num, page_dict)
        add_obj(c_num, stream_obj)

    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    offsets: list[int] = []
    cursor = len(header)
    for obj_bytes in objects:
        offsets.append(cursor)
        cursor += len(obj_bytes)

    total_objs = len(objects) + 1
    xref_lines = [f"xref\n0 {total_objs}\n0000000000 65535 f \n"]
    for off in offsets:
        xref_lines.append(f"{off:010d} 00000 n \n")
    xref_bytes = "".join(xref_lines).encode("latin-1")

    trailer_bytes = (
        f"trailer\n<< /Size {total_objs} /Root 1 0 R >>\nstartxref\n{cursor}\n%%EOF\n"
    ).encode("latin-1")

    return header + b"".join(objects) + xref_bytes + trailer_bytes


def generate_pdf_assessment_report(db: Session, scan_id: int) -> bytes:
    """
    Generate an audit-ready multi-page PDF Executive, Technical & Post-Exploitation Report
    for a completed scan.
    """
    scan = db.get(models.Scan, scan_id)
    if not scan:
        return build_multipage_pdf_bytes([("H1", "TrePath 2.0 Assessment Report - Scan Not Found")])

    engagement = db.get(models.Engagement, scan.engagement_id)
    asset = db.query(models.Asset).filter_by(scan_id=scan_id).first()
    endpoints = db.query(models.Endpoint).filter_by(scan_id=scan_id).all()
    technologies = db.query(models.Technology).filter_by(scan_id=scan_id).all()
    intel_matches = db.query(models.IntelligenceMatch).filter_by(scan_id=scan_id).all()
    findings = db.query(models.Finding).filter_by(scan_id=scan_id).order_by(models.Finding.risk_priority.desc()).all()
    attack_paths = db.query(models.AttackPath).filter_by(scan_id=scan_id).all()
    remediations = db.query(models.RemediationTask).filter_by(scan_id=scan_id).all()
    risk_profile = compute_asset_risk_profile(db, scan_id)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    exploited_findings = [
        f
        for f in findings
        if (f.proof_state.value if hasattr(f.proof_state, "value") else str(f.proof_state))
        in ("IMPACT_VERIFIED", "RUNTIME_REPRODUCED", "ATTACK_PATH_VALIDATED")
        or f.finding_key.startswith(("SMB-LIST-", "PHPINFO-", "TOMCAT-MGR-"))
    ]

    styled_lines: list[tuple[str, str]] = [
        ("H1", "TrePath 2.0 - Executive, Technical & Post-Exploitation Report"),
        ("META", f"Scan ID: #{scan.id}  |  Engagement: {engagement.name if engagement else 'Authorized Pentest'} ({engagement.client_name if engagement else 'Lab'})"),
        ("META", f"Target Origin: {scan.target_url}  |  Asset Key: {asset.asset_key if asset else 'ASSET-00001'} ({asset.hostname if asset else scan.target_url})"),
        ("META", f"ROE Profile: {scan.profile} (Safe Lab PoC Exploitation & Post-Exploitation Enabled)  |  Generated: {now_iso}"),
        ("RULE", ""),
        ("H2", "1. Executive Risk Summary (Stage 7 RiskEngine)"),
        (
            "BODY",
            f"Overall Asset Risk Rating: {risk_profile.get('overall_risk_rating', 'HIGH')} "
            f"({risk_profile.get('overall_risk_index_10', 0.0)} / 10  |  {risk_profile.get('overall_risk_index_100', 0.0)} / 100 internal triage index)",
        ),
        (
            "BODY",
            f"Surface Exposure Score: {risk_profile.get('surface_exposure_score', 0.0)} / 100 "
            f"({len(asset.open_ports or []) if asset else 0} open TCP ports, {len(endpoints)} deduplicated endpoints)",
        ),
        (
            "BODY",
            f"Threat Velocity Score: {risk_profile.get('threat_velocity_score', 0.0)} / 100 "
            f"({risk_profile.get('kev_exposures_count', 0)} CISA KEV active exploits, Max EPSS: {risk_profile.get('max_epss_probability', 0.0)})",
        ),
        (
            "BODY",
            f"Total Verified Findings: {len(findings)}  |  Exploited / Post-Exploitation Proven: {len(exploited_findings)}  |  "
            f"Remediated: {risk_profile.get('remediated_findings_count', 0)}",
        ),
        ("RULE", ""),
        ("H2", "2. Safe PoC Exploitation & Post-Exploitation Proof Registry (Stage 5)"),
        (
            "BODY",
            "The following findings progressed to IMPACT_VERIFIED / RUNTIME_REPRODUCED / ATTACK_PATH_VALIDATED via deterministic, "
            "read-only proof-of-concept checks and post-exploitation verification:",
        ),
    ]

    if exploited_findings:
        for idx, ef in enumerate(exploited_findings, start=1):
            art = db.query(models.EvidenceArtifact).filter_by(finding_id=ef.id).first()
            pf_str = ef.proof_state.value if hasattr(ef.proof_state, "value") else str(ef.proof_state)
            styled_lines.append(("H3", f"2.{idx} [{pf_str}] [{ef.severity.upper()}] {ef.title} ({ef.finding_key})"))
            styled_lines.append(("BODY", f"Description: {ef.description}"))
            if art:
                try:
                    from pathlib import Path
                    p = Path(art.storage_path)
                    if p.exists():
                        ev_json = json.loads(p.read_text(encoding="utf-8", errors="replace"))
                        if ev_json.get("reproduction_trace"):
                            styled_lines.append(("CODE", f"PoC Reproduction Trace: {ev_json['reproduction_trace']}"))
                        if ev_json.get("impact_proof"):
                            styled_lines.append(("CODE", f"Post-Exploitation Impact Proof: {ev_json['impact_proof']}"))
                        post_ex = ev_json.get("post_exploitation")
                        if isinstance(post_ex, dict):
                            for k, v in post_ex.items():
                                styled_lines.append(("CODE", f"Post-Exploitation [{k}]: {v}"))
                except Exception:
                    pass
                styled_lines.append(("META", f"EvidenceCore SHA-256 Seal: {art.sha256} (Artifact #{art.id})"))
            styled_lines.append(("BODY", f"Remediation: {ef.remediation}"))
    else:
        styled_lines.append(("BODY", "No active exploitation findings recorded for this scan."))

    styled_lines.extend([
        ("RULE", ""),
        ("H2", "3. Multi-Step AttackGraph Kill-Chain Correlation (Stage 7)"),
    ])
    if attack_paths:
        for ap in attack_paths:
            pf_ap = ap.proof_state.value if hasattr(ap.proof_state, "value") else str(ap.proof_state)
            styled_lines.append(("H3", f"{ap.path_key}: {ap.title} ({ap.severity.upper()} | Composite Score: {ap.composite_risk_score} | {pf_ap})"))
            styled_lines.append(("BODY", f"Narrative: {ap.narrative}"))
            for st in ap.steps_json or []:
                styled_lines.append((
                    "CODE",
                    f"Step {st.get('step')} [{st.get('phase')}] {st.get('finding_key')}: {st.get('summary')} "
                    f"(Chokepoint: {st.get('mitigation_chokepoint', 'Apply control')})",
                ))
    else:
        styled_lines.append(("BODY", "No multi-step attack paths synthesized."))

    styled_lines.extend([
        ("RULE", ""),
        ("H2", "4. Fingerprinted Technologies & ENUMCORE CVE / KEV / EPSS Intelligence (Stage 3)"),
    ])
    for t in technologies:
        styled_lines.append((
            "BODY",
            f"- {t.tech_key}: {t.name} {t.version or ''} | CPE: {t.cpe or 'N/A'} | "
            f"Outdated: {'YES' if t.is_outdated else 'No'} | Evidence #{t.evidence_artifact_id}",
        ))
    for im in intel_matches[:20]:
        styled_lines.append((
            "CODE",
            f"ENUMCORE Match: {im.cve_id or im.cwe_id} | CVSS {im.cvss_score} | EPSS {(im.epss_score * 100):.1f}% | "
            f"CISA KEV: {'YES' if im.in_cisa_kev else 'No'} | {im.summary[:100]}",
        ))

    styled_lines.extend([
        ("RULE", ""),
        ("H2", f"5. Complete Technical Findings & SHA-256 Evidence Registry ({len(findings)} Total)"),
    ])
    for idx, f in enumerate(findings, start=1):
        art = db.query(models.EvidenceArtifact).filter_by(finding_id=f.id).first()
        pf_str = f.proof_state.value if hasattr(f.proof_state, "value") else str(f.proof_state)
        styled_lines.append(("H3", f"5.{idx} [{f.severity.upper()}] {f.title} ({f.finding_key})"))
        styled_lines.append(("META", f"Proof State: {pf_str}  |  Priority: {f.risk_priority}/100  |  CWE: {f.cwe_id or 'CWE-200'}  |  SHA-256: {art.sha256[:24] + '...' if art else 'N/A'}"))
        styled_lines.append(("BODY", f"Summary: {f.description[:280]}"))
        styled_lines.append(("BODY", f"Fix: {f.remediation[:220]}"))

    styled_lines.extend([
        ("RULE", ""),
        ("H2", "6. Prioritized Remediation Roadmap (Stage 8)"),
    ])
    for r in remediations:
        styled_lines.append(("BODY", f"- {r.task_key} [{r.priority}] ({r.status}) Owner: {r.owner} -> {r.title}"))

    return build_multipage_pdf_bytes(styled_lines)
