"""Finding Investigation Workspace Builder — Compiles complete forensic investigation records from real backend artifacts."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from sqlalchemy.orm import Session

from .. import models
from ..intelligence.cwe_mapper import CWE_CATALOG, resolve_cwe
from ..evidence import verify_evidence_integrity


PROOF_STATE_DEFINITIONS: dict[str, dict[str, str]] = {
    "DISCOVERED": {
        "validation_status": "Discovery recorded",
        "meaning": "Scanner identified a possible issue or exposed surface; runtime reproduction has not yet been performed.",
        "exploitability_note": "Observation only — does not establish that an attacker exploited or can exploit the finding.",
    },
    "OBSERVATION_CONFIRMED": {
        "validation_status": "Observation confirmed",
        "meaning": "The observed network, protocol, or HTTP response behavior was deterministically captured in a forensic transcript.",
        "exploitability_note": "Confirms the technical observation exists; does not prove active exploitation.",
    },
    "CONTROL_GAP_CONFIRMED": {
        "validation_status": "Security control gap confirmed",
        "meaning": "A defensive security control is demonstrably missing, weak, or misconfigured based on captured response evidence.",
        "exploitability_note": "Confirms a control gap was observed; it does not establish that an attacker successfully exploited it.",
    },
    "ATTACK_PATH_VALIDATED": {
        "validation_status": "Attack path validated",
        "meaning": "A multi-step attack path combining this weakness with reachable prerequisites was validated.",
        "exploitability_note": "Prerequisites and chaining conditions were verified.",
    },
    "RUNTIME_REPRODUCED": {
        "validation_status": "Runtime reproduced",
        "meaning": "The vulnerability was actively reproduced at runtime using a deterministic non-destructive canary or probe.",
        "exploitability_note": "Runtime behavior was reproduced and verified in the response transcript.",
    },
    "IMPACT_VERIFIED": {
        "validation_status": "Security impact verified",
        "meaning": "The downstream security impact (such as unauthorized data access or execution) was directly demonstrated.",
        "exploitability_note": "Exploitability and security impact are cryptographically proven.",
    },
    "REMEDIATION_VERIFIED": {
        "validation_status": "Remediation verified",
        "meaning": "Subsequent retest confirmed the security control is now properly enforced.",
        "exploitability_note": "Previously observed weakness has been remediated.",
    },
    "NOT_VULNERABLE": {
        "validation_status": "Not vulnerable",
        "meaning": "Testing did not establish the suspected vulnerability.",
        "exploitability_note": "Target resisted the test probe.",
    },
    "INCONCLUSIVE": {
        "validation_status": "Inconclusive",
        "meaning": "Captured evidence was insufficient to confirm or rule out the issue.",
        "exploitability_note": "Manual analyst verification is required.",
    },
    "BLOCKED_BY_SCOPE": {
        "validation_status": "Blocked by ROE scope",
        "meaning": "Rules of Engagement (ROE) prevented active testing of this surface.",
        "exploitability_note": "Not tested due to authorization boundary.",
    },
    "NOT_TESTED": {
        "validation_status": "Not tested",
        "meaning": "Test was not performed.",
        "exploitability_note": "No test execution occurred.",
    },
}


SECRET_HEADER_PATTERNS = re.compile(
    r"(?i)^((?:Authorization|Proxy-Authorization|X-Api-Key|Api-Key|X-Auth-Token)\s*:\s*)(.+)$",
    re.MULTILINE,
)
COOKIE_VALUE_PATTERN = re.compile(r"(?i)((?:Set-Cookie|Cookie)\s*:\s*[^=;\r\n]+=)([^;\r\n]+)")
INLINE_SECRET_PATTERN = re.compile(
    r"(?i)((?:password|passwd|secret|access_token|refresh_token|api_key|client_secret)\s*[\"']?\s*[:=]\s*[\"']?)([^\"'\s,&}]+)"
)


def sanitize_forensic_text(text: str | None) -> str:
    """Redact credentials, Authorization tokens, session cookies, and secrets while preserving scheme/structure."""
    if not text:
        return ""

    def _redact_auth(match: re.Match) -> str:
        prefix = match.group(1)
        val = match.group(2).strip()
        parts = val.split(" ", 1)
        if len(parts) == 2 and parts[0].lower() in ("basic", "bearer", "digest", "ntlm", "negotiate"):
            return f"{prefix}{parts[0]} [REDACTED]"
        return f"{prefix}[REDACTED]"

    out = SECRET_HEADER_PATTERNS.sub(_redact_auth, text)
    out = COOKIE_VALUE_PATTERN.sub(r"\1[REDACTED]", out)
    out = INLINE_SECRET_PATTERN.sub(r"\1[REDACTED]", out)
    return out


def _detect_engine_and_category(finding_key: str, title: str) -> tuple[str, str, str]:
    """Return (engine_name, category, owasp_mapping)."""
    fk = finding_key.upper()
    tl = title.lower()
    if fk.startswith("ZAP-"):
        engine = "OWASP ZAP v2.16.1 Active/Passive DAST"
    elif fk.startswith("NUCLEI-"):
        engine = "ProjectDiscovery Nuclei v3.3.7"
    elif fk.startswith("NMAP-"):
        engine = "Nmap v7.95 Service & NSE Engine"
    elif fk.startswith("TLS-"):
        engine = "TrePath TLS/SSL Cryptographic Auditor"
    elif fk.startswith("PORT-"):
        engine = "TrePath 1,000-Port TCP Discovery Engine"
    elif fk.startswith("WEB-"):
        engine = "TrePath Sensitive Route Reconnaissance"
    elif fk.startswith("APP-ACTIVE"):
        engine = "TrePath Active Boundary Fuzzer"
    elif fk.startswith("OPENVAS-"):
        engine = "OpenVAS / Greenbone GVM Sensor"
    else:
        engine = "TrePath Safe DAST Posture Engine"

    if "auth" in tl or "login" in tl or "session" in tl or "cookie" in tl:
        return engine, "Authentication & Session Management", "OWASP_2021_A07 (Identification and Authentication Failures)"
    if "header" in tl or "csp" in tl or "frame" in tl or "nosniff" in tl or "referrer" in tl or "server" in tl:
        return engine, "Security Misconfiguration & Hardening", "OWASP_2021_A05 (Security Misconfiguration)"
    if "tls" in tl or "ssl" in tl or "cipher" in tl or "https" in tl or "cleartext" in tl:
        return engine, "Cryptographic & Transport Security", "OWASP_2021_A02 (Cryptographic Failures)"
    if "sql" in tl or "xss" in tl or "injection" in tl or "reflected" in tl:
        return engine, "Input Validation & Injection", "OWASP_2021_A03 (Injection)"
    if "admin" in tl or "cors" in tl or "traversal" in tl or "access" in tl:
        return engine, "Broken Access Control", "OWASP_2021_A01 (Broken Access Control)"
    if "outdated" in tl or "cve-" in tl or "version" in tl or "tomcat" in tl or "apache" in tl:
        return engine, "Vulnerable and Outdated Components", "OWASP_2021_A06 (Vulnerable and Outdated Components)"
    return engine, "Network & Service Exposure", "OWASP_2021_A05 (Security Misconfiguration)"


def _parse_artifact_transcripts(
    artifact: models.EvidenceArtifact,
    finding: models.Finding,
    target_url: str,
) -> dict[str, Any]:
    """Read actual stored evidence file from disk, sanitize secrets, and extract HTTP/TCP/Scanner transcripts."""
    p = Path(artifact.storage_path)
    raw_text = ""
    if p.exists():
        try:
            raw_text = p.read_text(encoding="utf-8", errors="replace")
        except Exception:
            raw_text = ""

    sanitized_raw = sanitize_forensic_text(raw_text)
    parsed_json: dict[str, Any] | None = None
    try:
        loaded = json.loads(raw_text) if raw_text.strip().startswith("{") else None
        if isinstance(loaded, dict):
            parsed_json = loaded
    except Exception:
        parsed_json = None

    http_request_transcript: str | None = None
    http_response_transcript: str | None = None
    observed_endpoint = target_url
    observed_method = "GET"
    observed_param: str | None = None
    observed_evidence_snippet: str | None = None
    auth_scheme = "None observed in transcript"
    wasc_id: str | None = None
    owasp_tag: str | None = None
    references: list[str] = []
    instances: list[dict[str, Any]] = []

    if parsed_json:
        wasc_raw = parsed_json.get("wasc_id")
        if wasc_raw:
            wasc_id = f"WASC-{wasc_raw}"
        owasp_tag = parsed_json.get("owasp_top10")
        ref_raw = parsed_json.get("reference") or ""
        if isinstance(ref_raw, str) and ref_raw.strip():
            references = [line.strip() for line in re.split(r"[\r\n]+", ref_raw) if line.strip()]

        # 1. OWASP ZAP DAST Record
        if isinstance(parsed_json.get("instances"), list) and parsed_json["instances"]:
            instances = parsed_json["instances"]
            first = instances[0]
            observed_endpoint = first.get("url") or target_url
            observed_method = first.get("method") or "GET"
            observed_param = first.get("param") or None
            observed_evidence_snippet = first.get("evidence") or None

            # Inspect evidence/param for Basic vs Digest vs Cookie auth scheme without conflating them
            ev_lower = f"{observed_evidence_snippet or ''} {observed_param or ''}".lower()
            if "basic" in ev_lower:
                auth_scheme = "HTTP Basic Authentication (observed in header/challenge)"
            elif "digest" in ev_lower:
                auth_scheme = "HTTP Digest Authentication (observed in header/challenge)"
            elif "ntlm" in ev_lower:
                auth_scheme = "NTLM Authentication"
            elif "cookie" in ev_lower or "jsessionid" in ev_lower or "phpsessid" in ev_lower:
                auth_scheme = "Cookie / Session Token"
            elif "www-authenticate" in ev_lower or "10105" in str(parsed_json.get("plugin_id", "")):
                auth_scheme = "HTTP Authentication over unencrypted transport (inspect WWW-Authenticate / Authorization header)"

            if first.get("request_header"):
                req_full = first["request_header"].strip()
                if first.get("request_body"):
                    req_full += "\n\n" + first["request_body"].strip()
                http_request_transcript = sanitize_forensic_text(req_full)
            else:
                parsed_u = urlparse(observed_endpoint)
                path_q = (parsed_u.path or "/") + (f"?{parsed_u.query}" if parsed_u.query else "")
                req_lines = [
                    f"{observed_method} {path_q} HTTP/1.1",
                    f"Host: {parsed_u.netloc or parsed_u.hostname or 'target'}",
                ]
                if first.get("attack"):
                    req_lines.append(f"X-ZAP-Attack-Probe: {sanitize_forensic_text(str(first['attack']))}")
                if observed_param:
                    req_lines.append(f"X-Observed-Parameter: {sanitize_forensic_text(str(observed_param))}")
                http_request_transcript = "\n".join(req_lines)

            if first.get("response_header"):
                resp_full = first["response_header"].strip()
                if first.get("response_body"):
                    resp_full += "\n\n" + first["response_body"][:1500].strip()
                http_response_transcript = sanitize_forensic_text(resp_full)
            elif observed_evidence_snippet:
                http_response_transcript = (
                    f"# Captured ZAP Alert Evidence Snippet on {observed_endpoint}\n"
                    f"Parameter / Header: {observed_param or 'N/A'}\n"
                    f"Matched Evidence: {sanitize_forensic_text(str(observed_evidence_snippet))}"
                )

        # 2. Nuclei / WebPulse / Targeted DAST / Active Fuzzer JSON Record
        elif parsed_json.get("template_id") or parsed_json.get("request") or parsed_json.get("response"):
            observed_endpoint = parsed_json.get("matched_at") or parsed_json.get("url") or target_url
            if parsed_json.get("scheme"):
                auth_scheme = f"HTTP {parsed_json['scheme']} Authentication (Realm: {parsed_json.get('realm', 'default')})"
            if parsed_json.get("request"):
                http_request_transcript = sanitize_forensic_text(str(parsed_json["request"]))
            if parsed_json.get("response"):
                http_response_transcript = sanitize_forensic_text(str(parsed_json["response"]))
            if parsed_json.get("extracted_results"):
                observed_evidence_snippet = ", ".join(str(x) for x in parsed_json["extracted_results"])
            elif parsed_json.get("matched_canary"):
                observed_evidence_snippet = str(parsed_json["matched_canary"])

        # 3. Nmap / TLS / OpenVAS Record
        elif parsed_json.get("host"):
            h = parsed_json.get("host")
            pt = parsed_json.get("port")
            observed_endpoint = f"tcp://{h}:{pt}" if pt else f"tcp://{h}"
            observed_method = "TCP_PROBE"
            http_request_transcript = f"Probe Target: {observed_endpoint}\nEngine: {parsed_json.get('source', artifact.artifact_type)}"
            http_response_transcript = sanitize_forensic_text(json.dumps(parsed_json, indent=2))
    else:
        # Plain-text HTTP or TCP evidence from safe_dast, web_recon, port_discovery, or active_fuzzer
        if raw_text.startswith(("GET ", "POST ", "HEAD ")):
            lines = raw_text.splitlines()
            first_line = lines[0]
            parts = first_line.split(" ")
            if len(parts) >= 2:
                observed_method = parts[0]
                observed_endpoint = parts[1]
            http_request_transcript = sanitize_forensic_text(first_line)
            http_response_transcript = sanitize_forensic_text("\n".join(lines[1:]))
        elif raw_text:
            http_response_transcript = sanitized_raw

    verification = verify_evidence_integrity(artifact)

    return {
        "artifact_id": artifact.id,
        "artifact_type": artifact.artifact_type,
        "sha256": artifact.sha256,
        "storage_path": artifact.storage_path,
        "collector_version": artifact.collector_version,
        "collected_at": artifact.collected_at.isoformat() if artifact.collected_at else None,
        "bytes": len(raw_text.encode("utf-8", errors="replace")),
        "integrity": verification,
        "raw_evidence": sanitized_raw,
        "formatted_json": parsed_json,
        "http_request_transcript": http_request_transcript,
        "http_response_transcript": http_response_transcript,
        "observed_endpoint": observed_endpoint,
        "observed_method": observed_method,
        "observed_param": observed_param,
        "observed_evidence_snippet": sanitize_forensic_text(observed_evidence_snippet) if observed_evidence_snippet else None,
        "auth_scheme": auth_scheme,
        "wasc_id": wasc_id,
        "owasp_tag": owasp_tag,
        "references": references,
        "instances": instances,
    }


def build_finding_investigation_workspace(db: Session, finding_id: int) -> dict[str, Any] | None:
    """
    Assemble the complete 7-section Evidence-Driven Finding Investigation Workspace
    purely from real database and EvidenceCore records.
    """
    finding = db.get(models.Finding, finding_id)
    if not finding:
        return None

    scan = db.get(models.Scan, finding.scan_id)
    engagement = db.get(models.Engagement, scan.engagement_id) if scan else None
    asset = db.query(models.Asset).filter_by(scan_id=finding.scan_id).first()
    artifacts = db.query(models.EvidenceArtifact).filter_by(finding_id=finding.id).all()
    intel = db.query(models.IntelligenceMatch).filter_by(finding_id=finding.id).first()
    technologies = db.query(models.Technology).filter_by(scan_id=finding.scan_id).all()
    remediation_task = db.query(models.RemediationTask).filter_by(finding_id=finding.id).first()
    retests = db.query(models.Retest).filter_by(finding_id=finding.id).order_by(models.Retest.created_at.desc()).all()
    retest_executions = (
        db.query(models.RetestExecution)
        .filter_by(finding_id=finding.id)
        .order_by(models.RetestExecution.id.desc())
        .all()
    )
    scan_attack_paths = db.query(models.AttackPath).filter_by(scan_id=finding.scan_id).all()

    # Cross-scan historical observations of the same finding_key
    historical_findings = (
        db.query(models.Finding, models.Scan)
        .join(models.Scan, models.Finding.scan_id == models.Scan.id)
        .filter(models.Finding.finding_key == finding.finding_key)
        .order_by(models.Finding.created_at.asc())
        .all()
    )

    first_detected = historical_findings[0][0].created_at if historical_findings else finding.created_at
    last_observed = historical_findings[-1][0].created_at if historical_findings else finding.created_at

    target_url = scan.target_url if scan else "http://unknown-target/"
    parsed_artifacts = [_parse_artifact_transcripts(a, finding, target_url) for a in artifacts]
    primary_ev = parsed_artifacts[0] if parsed_artifacts else {}

    engine_name, category, default_owasp = _detect_engine_and_category(finding.finding_key, finding.title)
    cwe_code, cwe_name = resolve_cwe(finding.cwe_id, finding.title)
    owasp_mapping = primary_ev.get("owasp_tag") or default_owasp
    wasc_mapping = primary_ev.get("wasc_id") or "N/A"

    proof_key = finding.proof_state.value if hasattr(finding.proof_state, "value") else str(finding.proof_state)
    proof_meta = PROOF_STATE_DEFINITIONS.get(proof_key, PROOF_STATE_DEFINITIONS["OBSERVATION_CONFIRMED"])

    has_transcript = bool(primary_ev.get("http_request_transcript") or primary_ev.get("http_response_transcript"))
    evidence_confidence = (
        "High (Verified Request/Response Transcript)"
        if (primary_ev.get("http_request_transcript") and primary_ev.get("http_response_transcript"))
        else ("Medium (Captured Scanner Observation Record)" if has_transcript else "Pending Evidence Review")
    )

    observed_ep = primary_ev.get("observed_endpoint") or target_url
    observed_method = primary_ev.get("observed_method") or ("TCP" if finding.finding_key.startswith(("PORT-", "NMAP-")) else "GET")
    observed_scheme = urlparse(observed_ep).scheme.upper() if "://" in observed_ep else ("HTTP" if target_url.startswith("http:") else "HTTPS")
    has_https_service = bool(asset and (443 in (asset.open_ports or []) or 8443 in (asset.open_ports or [])))

    # Build verification checklist tailored to the finding type
    is_weak_auth = "10105" in finding.finding_key or "authentication" in finding.title.lower()
    if is_weak_auth:
        what_observed = (
            f"OWASP ZAP reported finding '{finding.title}' on endpoint '{observed_ep}' over {observed_scheme}. "
            f"Authentication scheme indicator: {primary_ev.get('auth_scheme', 'Unverified')}. "
            "Note: Basic authentication encodes credentials in reversible Base64, whereas Digest authentication uses MD5 challenge-response hashes; "
            "TrePath does not assume cleartext credential recovery unless an Authorization header or challenge is explicitly captured in the transcript."
        )
        verification_questions = [
            {
                "question": "Was the endpoint actually served over unencrypted HTTP?",
                "status": "Confirmed (HTTP)" if observed_scheme == "HTTP" else f"Observed over {observed_scheme}",
            },
            {
                "question": "Was Basic or Digest authentication specifically observed?",
                "status": primary_ev.get("auth_scheme") or "Requires header inspection in Technical Evidence tab",
            },
            {
                "question": "Was an Authorization or WWW-Authenticate header transmitted?",
                "status": (
                    f"Matched evidence: {primary_ev.get('observed_evidence_snippet')}"
                    if primary_ev.get("observed_evidence_snippet")
                    else "No Authorization header captured in alert instance"
                ),
            },
            {
                "question": "Was an HTTPS alternative available on the host?",
                "status": "Yes (Port 443/8443 open on asset)" if has_https_service else "No HTTPS port detected on asset",
            },
            {
                "question": "Was credential exposure or replay demonstrated?",
                "status": "Not demonstrated (Proof State is CONTROL_GAP_CONFIRMED, not IMPACT_VERIFIED)",
            },
        ]
    else:
        what_observed = finding.description.split("\n\n[Standard]:")[0].strip()
        verification_questions = [
            {
                "question": "Was the affected endpoint or service reachable during the scan?",
                "status": f"Confirmed on {observed_ep} ({observed_method})",
            },
            {
                "question": "Was the security control gap or response signature captured?",
                "status": (
                    f"Captured ({primary_ev.get('observed_evidence_snippet')})"
                    if primary_ev.get("observed_evidence_snippet")
                    else f"Confirmed via {primary_ev.get('artifact_type', 'scanner transcript')}"
                ),
            },
            {
                "question": "Does the stored evidence artifact pass independent SHA-256 integrity verification?",
                "status": "Verified (SHA-256 match)" if primary_ev.get("integrity", {}).get("verified") else "Pending verification",
            },
            {
                "question": "Was active exploitation or business impact demonstrated?",
                "status": (
                    "Yes (Runtime / Impact Verified)"
                    if proof_key in ("RUNTIME_REPRODUCED", "IMPACT_VERIFIED")
                    else f"No — current state is {proof_key} (observation/control gap only)"
                ),
            },
        ]

    # Match corresponding TestExecution & TestDefinition for Section 4 (Validation)
    executions = db.query(models.TestExecution).filter_by(scan_id=finding.scan_id).all()
    matched_exec = None
    for ex in executions:
        if any(a.id in (ex.evidence_ids or []) for a in artifacts):
            matched_exec = ex
            break
    if not matched_exec and executions:
        matched_exec = executions[0]

    test_def = (
        db.query(models.TestDefinition).filter_by(test_id=matched_exec.test_id).first()
        if matched_exec
        else None
    )

    # Section 5: Explainable TrePath Risk-Priority Breakdown (never conflated with CVSS)
    sev_lower = (finding.severity or "low").lower()
    base_cvss = finding.cvss_score  # May be None if scanner did not assign a formal CVSS vector
    effective_base = float(base_cvss) if base_cvss is not None else (
        9.5 if sev_lower == "critical" else 7.8 if sev_lower == "high" else 5.5 if sev_lower == "medium" else 3.2 if sev_lower == "low" else 1.0
    )
    epss_val = float(intel.epss_score) if (intel and finding.cve_id) else None
    kev_val = bool(intel.in_cisa_kev) if (intel and finding.cve_id) else False
    proof_weight = (
        1.25 if proof_key == "IMPACT_VERIFIED" else
        1.20 if proof_key == "RUNTIME_REPRODUCED" else
        1.15 if proof_key == "ATTACK_PATH_VALIDATED" else
        1.05 if proof_key == "CONTROL_GAP_CONFIRMED" else 1.00
    )
    raw_priority_100 = float(finding.risk_priority or 0.0)
    priority_10_scale = round(raw_priority_100 / 10.0, 1) if raw_priority_100 > 10.0 else round(raw_priority_100, 1)

    return {
        "finding_id": finding.id,
        "finding_key": finding.finding_key,
        "scan_id": finding.scan_id,
        "engagement_id": scan.engagement_id if scan else None,
        "title": finding.title,
        "severity": finding.severity,
        "proof_state": proof_key,
        "proof_state_meaning": proof_meta["meaning"],
        "exploitability_note": proof_meta["exploitability_note"],
        "validation_status": proof_meta["validation_status"],
        "evidence_confidence": evidence_confidence,
        "first_detected": first_detected.isoformat() if first_detected else None,
        "last_observed": last_observed.isoformat() if last_observed else None,
        # 01 · Finding Overview
        "overview": {
            "finding_category": category,
            "discovery_engine": engine_name,
            "owasp_mapping": owasp_mapping,
            "wasc_mapping": wasc_mapping,
            "cwe_id": cwe_code,
            "cwe_name": cwe_name,
            "affected_asset": asset.asset_key if asset else "ASSET-00001",
            "affected_hostname": asset.hostname if asset else urlparse(target_url).hostname,
            "affected_endpoint": observed_ep,
            "http_method": observed_method,
            "transport_protocol": observed_scheme,
            "authentication_scheme": primary_ev.get("auth_scheme", "None observed"),
            "affected_environment": f"{engagement.name} ({engagement.client_name})" if engagement else "Authorized Lab Environment",
        },
        # 02 · Technical Observation & Analysis
        "technical_observation": {
            "what_trepath_observed": what_observed,
            "expected_secure_behavior": finding.remediation,
            "http_method": observed_method,
            "endpoint": observed_ep,
            "parameters": [primary_ev["observed_param"]] if primary_ev.get("observed_param") else [],
            "authentication_mechanism": primary_ev.get("auth_scheme", "None observed"),
            "technologies": [
                {"name": t.name, "version": t.version, "cpe": t.cpe, "banner": t.banner}
                for t in technologies[:6]
            ],
            "verification_checklist": verification_questions,
            "preconditions_and_limitations": [
                "Assessment executed under deterministic ROE read_only profile.",
                proof_meta["exploitability_note"],
            ],
            "affected_instances": primary_ev.get("instances", []),
        },
        # 03 · Evidence and Forensic Artifacts
        "evidence_management": {
            "artifact_count": len(parsed_artifacts),
            "artifacts": parsed_artifacts,
            "integrity_disclaimer": (
                "SHA-256 hash verifies byte-level storage integrity of the captured artifact; "
                "it does not independently prove that an observation is exploitable."
            ),
        },
        # 04 · Validation Record (PentestValidator)
        "validation": {
            "execution_id": matched_exec.execution_id if matched_exec else "EXEC-00001",
            "test_id": matched_exec.test_id if matched_exec else "DAST-PASSIVE-001",
            "test_name": test_def.name if test_def else f"{engine_name} Check",
            "test_family": test_def.family if test_def else category,
            "adapter_name": test_def.adapter_name if test_def else "dast_adapter",
            "methodology": (
                test_def.description
                if test_def
                else f"Automated inspection via {engine_name} against {observed_ep}."
            ),
            "expected_result": f"Target enforces security control ({cwe_code}: {cwe_name}) and rejects insecure configuration.",
            "actual_result": what_observed,
            "reproduction_steps": [
                f"1. Ensure target '{observed_ep}' is within approved Rules of Engagement allowlist.",
                f"2. Issue {observed_method} request to '{observed_ep}'"
                + (f" inspecting parameter/header '{primary_ev['observed_param']}'." if primary_ev.get("observed_param") else "."),
                f"3. Inspect response headers/body for evidence matching: {primary_ev.get('observed_evidence_snippet') or finding.finding_key}.",
                "4. Compare response against the expected secure control baseline.",
            ],
            "validation_outcome": proof_meta["validation_status"],
            "proof_state": proof_key,
            "proof_state_table": PROOF_STATE_DEFINITIONS,
            "confidence": evidence_confidence,
            "limitations": (matched_exec.limitations if matched_exec else []) or [
                "Executed under ROE read_only safety constraints; destructive payloads were not transmitted."
            ],
        },
        # 05 · Risk Analysis & Attack Scenario
        "risk_analysis": {
            "severity": finding.severity.upper(),
            "trepath_priority_10": priority_10_scale,
            "trepath_priority_100": round(raw_priority_100, 1),
            "cvss_score": base_cvss,
            "cvss_note": (
                f"Assigned CVSS v3 base score: {base_cvss}"
                if base_cvss is not None
                else "No formal CVSS v3 vector assigned for this observation; TrePath uses its internal composite RiskEngine score."
            ),
            "cve_id": finding.cve_id,
            "in_cisa_kev": kev_val if finding.cve_id else None,
            "epss_score": epss_val,
            "epss_percentile": float(intel.epss_percentile) if (intel and finding.cve_id) else None,
            "exploitability_assessment": (
                "Confirmed Runtime Reproduction"
                if proof_key in ("RUNTIME_REPRODUCED", "IMPACT_VERIFIED")
                else "Control Gap / Configuration Weakness (Exploitation Not Demonstrated)"
            ),
            "exposure_level": f"Network Reachable ({observed_scheme} on {asset.hostname if asset else 'target'})",
            "asset_criticality": "High (Primary Assessment Target)",
            "business_impact": (
                "Potential unauthorized access, credential interception, or service compromise if chained by an adversary."
                if sev_lower in ("critical", "high", "medium")
                else "Informational or defense-in-depth hardening gap with low direct impact."
            ),
            "calculation_breakdown": {
                "formula": "min(100, (BaseSeverityWeight * 7.0 + EPSS_Bonus + KEV_Bonus) * ProofStateWeight)",
                "severity_input": round(effective_base * 7.0, 1),
                "epss_bonus": round((epss_val or 0.0) * 15.0, 2),
                "kev_bonus": 15.0 if kev_val else 0.0,
                "proof_state_multiplier": proof_weight,
                "disclaimer": "TrePath Risk Priority is an internal triage metric and is never represented as an official CVSS score.",
            },
            "attack_scenario": {
                "prerequisites": f"Network reachability to {observed_ep}"
                + (" and ability to observe or intercept HTTP traffic on the network path." if observed_scheme == "HTTP" else "."),
                "affected_security_properties": (
                    "Confidentiality & Integrity"
                    if sev_lower in ("critical", "high", "medium")
                    else "Defense-in-Depth / Configuration Hygiene"
                ),
                "abuse_narrative": (
                    f"An adversary with access to {observed_ep} can leverage '{finding.title}' ({cwe_code}) "
                    "to weaken application defenses or chain with adjacent service exposures."
                ),
                "what_was_demonstrated": proof_meta["exploitability_note"],
                "correlated_attack_paths": [
                    {
                        "path_key": ap.path_key,
                        "title": ap.title,
                        "severity": ap.severity,
                        "composite_risk_score": ap.composite_risk_score,
                        "narrative": ap.narrative,
                        "steps": ap.steps_json,
                        "directly_includes_finding": finding.id in (ap.finding_ids or []),
                    }
                    for ap in scan_attack_paths
                ],
            },
        },
        # 06 · Remediation & Verification
        "remediation": {
            "task_key": remediation_task.task_key if remediation_task else f"REM-{finding.id:05d}",
            "owner": remediation_task.owner if remediation_task else "Application & Platform Security Engineering",
            "priority": remediation_task.priority if remediation_task else ("P1-Urgent" if sev_lower in ("critical", "high") else "P2-Planned"),
            "status": remediation_task.status if remediation_task else "open",
            "root_cause": f"{cwe_code} ({cwe_name}) observed on {observed_ep}.",
            "technical_remediation": finding.remediation,
            "implementation_steps": [
                f"1. Locate configuration or route handler serving '{observed_ep}'.",
                f"2. Apply recommended control: {finding.remediation}",
                "3. Deploy change to staging and verify application functionality.",
                "4. Execute TrePath deterministic retest to confirm control enforcement.",
            ],
            "verification_procedure": (
                remediation_task.verification_criteria
                if remediation_task
                else f"Re-issue {observed_method} probe to '{observed_ep}' and confirm {finding.finding_key} is no longer triggered."
            ),
            "functional_test": f"Verify authorized users and API clients can still access '{observed_ep}' over approved transport.",
            "negative_boundary_test": f"Verify unencrypted, unauthenticated, or malformed requests to '{observed_ep}' are rejected or redirected.",
            "retests": [
                {
                    "id": r.id,
                    "status": r.status,
                    "expected_state": r.expected_state,
                    "functional_test": r.functional_test,
                    "boundary_test": r.boundary_test,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in retests
            ],
            "retest_executions": [
                {
                    "id": rx.id,
                    "retest_exec_key": rx.retest_exec_key,
                    "status": rx.status.value if hasattr(rx.status, "value") else str(rx.status),
                    "proof_state": rx.proof_state.value if hasattr(rx.proof_state, "value") else str(rx.proof_state),
                    "evidence_artifact_id": rx.evidence_artifact_id,
                    "notes": rx.notes,
                    "executed_at": rx.executed_at.isoformat() if rx.executed_at else None,
                }
                for rx in retest_executions
            ],
        },
        # 07 · References, Classifications & History
        "references": {
            "cwe": f"{cwe_code}: {cwe_name}",
            "owasp": owasp_mapping,
            "wasc": wasc_mapping,
            "cve": finding.cve_id,
            "external_links": primary_ev.get("references", []),
        },
        "history": [
            {
                "finding_id": hf.id,
                "scan_id": hs.id,
                "observed_at": hf.created_at.isoformat() if hf.created_at else None,
                "severity": hf.severity,
                "proof_state": hf.proof_state.value if hasattr(hf.proof_state, "value") else str(hf.proof_state),
                "risk_priority": hf.risk_priority,
            }
            for hf, hs in historical_findings
        ],
    }
