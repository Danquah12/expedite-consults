"""
Automated Acceptance Tests for TrePath Assessment Orchestrator v1.

Verifies the 10 mandatory acceptance criteria:
  1. A completed discovery scan creates normalized asset records.
  2. Duplicate endpoints are correctly identified.
  3. Technology fingerprints are linked to their source evidence.
  4. The orchestrator generates an assessment plan.
  5. Tests outside the approved ROE are blocked (BLOCKED_BY_SCOPE).
  6. Unsupported tests are marked as UNSUPPORTED rather than falsely executed.
  7. Eligible tests are queued and dispatched.
  8. Execution results are linked to the correct asset (EXEC-xxxxx -> ASSET-xxxxx).
  9. Evidence is preserved and its SHA-256 hash can be independently verified.
 10. Findings cannot be marked exploitable without the required proof.
"""

from __future__ import annotations

import json
import tempfile
from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base
from app import models
from app.discovery import classify_endpoints, normalize_discovered_assets
from app.orchestrator import execute_orchestrated_ingestion_and_lifecycle, format_execution_record
from app.evidence import verify_evidence_integrity, seal_finding_with_evidence
from app.testing import select_tests_for_asset
from app.risk import compute_asset_risk_profile
from app.remediation import execute_finding_retest
from app.reporting import (
    build_finding_investigation_workspace,
    generate_markdown_assessment_report,
    sanitize_forensic_text,
)


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with TestingSession() as session:
        yield session


@pytest.fixture()
def sample_telemetry():
    port_findings = [
        {
            "finding_key": "PORT-OPEN-80-HTTP",
            "title": "Open Network Service: TCP/80 (HTTP)",
            "description": "TCP port 80 is open.",
            "severity": "low",
            "proof_state": models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": 3.7,
            "cve_id": None,
            "cwe_id": "CWE-200",
            "remediation": "Restrict port 80.",
            "risk_priority": 25.0,
            "evidence": json.dumps({"port": 80, "service": "http", "banner": "Apache/2.4.49 (Unix)"}),
        },
        {
            "finding_key": "PORT-OPEN-443-HTTPS",
            "title": "Open Network Service: TCP/443 (HTTPS)",
            "description": "TCP port 443 is open.",
            "severity": "low",
            "proof_state": models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": 3.7,
            "cve_id": None,
            "cwe_id": "CWE-200",
            "remediation": "Verify TLS configuration.",
            "risk_priority": 25.0,
            "evidence": json.dumps({"port": 443, "service": "https", "banner": "nginx/1.18.0"}),
        },
        {
            "finding_key": "PORT-OPEN-8080-HTTP-ALT",
            "title": "Open Network Service: TCP/8080 (Tomcat)",
            "description": "TCP port 8080 is open.",
            "severity": "medium",
            "proof_state": models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": 5.3,
            "cve_id": None,
            "cwe_id": "CWE-200",
            "remediation": "Restrict Tomcat manager port.",
            "risk_priority": 45.0,
            "evidence": json.dumps({"port": 8080, "service": "http-proxy", "banner": "Apache-Coyote/1.1"}),
        },
    ]
    posture_findings = [
        {
            "finding_key": "HTTP-CSP-MISSING",
            "title": "Content-Security-Policy header not present",
            "description": "Missing CSP header.",
            "severity": "medium",
            "proof_state": models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": 5.0,
            "cve_id": None,
            "cwe_id": "CWE-693",
            "remediation": "Add CSP header.",
            "risk_priority": 40.0,
            "evidence": json.dumps({"url": "http://192.168.195.140/", "headers": {"Server": "Apache/2.4.49"}}),
        }
    ]
    web_findings = [
        {
            "finding_key": "WEB-EXPOSED-ADMIN",
            "title": "Exposed Administrative Console (/admin)",
            "description": "Administrative interface discovered.",
            "severity": "high",
            "proof_state": models.ProofState.CONTROL_GAP_CONFIRMED,
            "cvss_score": 7.5,
            "cve_id": None,
            "cwe_id": "CWE-284",
            "remediation": "Restrict /admin access.",
            "risk_priority": 72.0,
            "evidence": json.dumps({"url": "http://192.168.195.140/admin", "status": 200}),
        }
    ]
    nmap_findings = [
        {
            "finding_key": "NMAP-PORT-80-HTTP",
            "title": "Nmap Service Fingerprint: TCP/80 (Apache httpd 2.4.49)",
            "description": "Nmap version detection identified Apache httpd 2.4.49.",
            "severity": "medium",
            "proof_state": models.ProofState.OBSERVATION_CONFIRMED,
            "cvss_score": 5.3,
            "cve_id": None,
            "cwe_id": "CWE-200",
            "remediation": "Upgrade Apache.",
            "risk_priority": 50.0,
            "evidence": json.dumps({
                "port": 80,
                "service": "http",
                "product": "Apache httpd",
                "version": "2.4.49",
                "cpes": ["cpe:/a:apache:http_server:2.4.49"],
            }),
        }
    ]
    discovered_urls = [
        "http://192.168.195.140/login",
        "http://192.168.195.140/api/v1/users?user_id=42",
        "http://192.168.195.140/api/v1/users?user_id=99",  # Duplicate signature of ?user_id=
        "http://192.168.195.140/search?q=test",
        "http://192.168.195.140/upload",
    ]
    return {
        "port_findings": port_findings,
        "posture_findings": posture_findings,
        "web_findings": web_findings,
        "nmap_findings": nmap_findings,
        "discovered_urls": discovered_urls,
    }


def _bootstrap_engagement_and_scan(db: Session, target_url: str = "http://192.168.195.140/"):
    user = models.User(email="auditor@trepath.local", password_hash="hash", role=models.Role.ADMIN)
    db.add(user)
    db.flush()

    eng = models.Engagement(name="Enterprise Acceptance Audit", client_name="Acme Corp", owner_id=user.id, status="authorized")
    db.add(eng)
    db.flush()

    roe = models.RulesOfEngagement(
        engagement_id=eng.id,
        approved=True,
        approved_by=user.id,
        allowed_origins=["http://192.168.195.140:80", "https://192.168.195.140:443"],
        allow_private_networks=True,
        max_requests=50,
        max_concurrency=2,
        profile="read_only",
    )
    db.add(roe)
    db.flush()

    scan = models.Scan(
        engagement_id=eng.id,
        target_url=target_url,
        status=models.ScanStatus.RUNNING,
        profile="read_only",
        started_at=datetime.now(timezone.utc),
        created_by=user.id,
    )
    db.add(scan)
    db.flush()
    return user, eng, roe, scan


def test_acceptance_1_2_3_4_5_6_7_8_9(db_session: Session, sample_telemetry: dict):
    """Verify Acceptance Criteria 1 through 9 end-to-end through the Orchestrator Execution Manager."""
    _, eng, roe, scan = _bootstrap_engagement_and_scan(db_session)

    with tempfile.TemporaryDirectory() as tmp_ev_dir:
        # Check #2 directly on classifier first: duplicate endpoints are flagged is_duplicate=True
        norm_preview = normalize_discovered_assets(
            scan.target_url,
            sample_telemetry["port_findings"],
            sample_telemetry["posture_findings"],
            sample_telemetry["web_findings"],
        )
        classified_all = classify_endpoints(
            norm_preview,
            sample_telemetry["web_findings"],
            extra_urls=sample_telemetry["discovered_urls"],
        )
        duplicates = [ep for ep in classified_all if ep.is_duplicate]
        assert len(duplicates) >= 1, "Acceptance Test #2 failed: duplicate endpoint was not identified."

        # Run full Orchestrator lifecycle
        summary = execute_orchestrated_ingestion_and_lifecycle(
            db=db_session,
            scan=scan,
            roe=roe,
            evidence_dir=tmp_ev_dir,
            posture_findings=sample_telemetry["posture_findings"],
            port_findings=sample_telemetry["port_findings"],
            web_findings=sample_telemetry["web_findings"],
            active_findings=[],
            nmap_findings=sample_telemetry["nmap_findings"],
            tls_findings=[],
            nuclei_findings=[],
            zap_findings=[],
            openvas_findings=[],
            extra_discovered_urls=sample_telemetry["discovered_urls"],
        )
        db_session.commit()

        # 1. A completed discovery scan creates normalized asset records.
        assert summary.asset is not None
        assert summary.asset.asset_key == "ASSET-00001"
        assert summary.asset.hostname == "192.168.195.140"
        assert 80 in summary.asset.open_ports and 8080 in summary.asset.open_ports

        # 2. Duplicate endpoints are suppressed from persisted canonical endpoints.
        persisted_sigs = [ep.canonical_signature for ep in summary.endpoints]
        assert len(persisted_sigs) == len(set(persisted_sigs)), "Persisted endpoints must be deduplicated."

        # 3. Technology fingerprints are linked to their source evidence.
        assert len(summary.technologies) >= 1
        for tech in summary.technologies:
            assert tech.evidence_artifact_id is not None, f"Tech {tech.name} missing evidence_artifact_id link."
            ev_obj = db_session.get(models.EvidenceArtifact, tech.evidence_artifact_id)
            assert ev_obj is not None and len(ev_obj.sha256) == 64

        # 4. The orchestrator generates an assessment plan covering the 8 feature families.
        assert len(summary.assessment_plans) >= 10
        families = {p.test_family for p in summary.assessment_plans}
        assert "Authentication and session security" in families
        assert "API authorization and input validation" in families
        assert "Object-level authorization" in families
        assert "Injection and input-handling tests" in families
        assert "File validation and upload security" in families
        assert "Access-control and privilege-boundary tests" in families
        assert "TLS and certificate assessment" in families
        assert "Version intelligence and verification" in families

        # 5. Tests outside the approved ROE are blocked (BLOCKED_BY_SCOPE).
        blocked_plans = [
            p for p in summary.assessment_plans
            if p.selection_status == models.SelectionStatus.BLOCKED_BY_SCOPE
        ]
        assert any(p.test_id == "EXPLOIT-DESTRUCTIVE-001" for p in blocked_plans), (
            "Acceptance Test #5 failed: destructive test outside read_only ROE was not BLOCKED_BY_SCOPE."
        )
        # Also verify out-of-scope target origin is blocked
        out_of_scope_items = select_tests_for_asset(
            db=db_session,
            asset=summary.asset,
            endpoints=summary.endpoints,
            technologies=summary.technologies,
            intelligence_matches=summary.intelligence_matches,
            roe=roe,
            target_url_override="http://evil-out-of-scope.example.com/",
        )
        assert all(
            item.selection_status in (models.SelectionStatus.BLOCKED_BY_SCOPE, models.SelectionStatus.UNSUPPORTED)
            for item in out_of_scope_items
        ), "All supported tests on an out-of-scope origin must be BLOCKED_BY_SCOPE."

        # 6. Unsupported tests are marked as UNSUPPORTED rather than falsely executed.
        unsupported_plans = [
            p for p in summary.assessment_plans
            if p.selection_status == models.SelectionStatus.UNSUPPORTED
        ]
        assert any(p.test_id == "CLOUD-K8S-EBFP-001" for p in unsupported_plans)
        ebpf_exec = next(ex for ex in summary.test_executions if ex.test_id == "CLOUD-K8S-EBFP-001")
        assert ebpf_exec.status == models.ExecutionStatus.SKIPPED
        assert ebpf_exec.proof_state == models.ProofState.NOT_TESTED

        # 7. Eligible tests are queued and dispatched.
        completed_execs = [
            ex for ex in summary.test_executions
            if ex.status == models.ExecutionStatus.COMPLETED
        ]
        assert len(completed_execs) >= 8

        # 8. Execution results are linked to the correct asset (EXEC-00001 -> ASSET-00001).
        first_formatted = format_execution_record(completed_execs[0])
        assert first_formatted["execution_id"].startswith("EXEC-")
        assert first_formatted["asset_id"] == "ASSET-00001"
        assert first_formatted["status"] == "completed"
        assert first_formatted["started_at"] is not None
        assert first_formatted["completed_at"] is not None

        # 9. Evidence is preserved and its SHA-256 hash can be independently verified.
        assert len(summary.evidence_artifacts) >= 1
        for artifact in summary.evidence_artifacts:
            verification = verify_evidence_integrity(artifact)
            assert verification["verified"] is True
            assert verification["expected_sha256"] == verification["computed_sha256"]


def test_acceptance_10_findings_cannot_be_marked_exploitable_without_proof(db_session: Session):
    """Acceptance Test #10: Findings cannot be marked exploitable without required deterministic proof."""
    _, _, _, scan = _bootstrap_engagement_and_scan(db_session)

    with tempfile.TemporaryDirectory() as tmp_ev_dir:
        # Case A: Finding claims IMPACT_VERIFIED but lacks reproduction/impact proof in evidence -> MUST BE DOWNGRADED
        unproven_raw = {
            "finding_key": "TEST-UNPROVEN-EXPLOIT",
            "title": "Claimed RCE Without Reproduction Proof",
            "description": "Scanner claimed RCE based only on banner.",
            "severity": "critical",
            "proof_state": models.ProofState.IMPACT_VERIFIED,
            "cvss_score": 9.8,
            "cve_id": "CVE-2021-41773",
            "cwe_id": "CWE-22",
            "remediation": "Patch server.",
            "risk_priority": 90.0,
            "evidence": json.dumps({"banner": "Apache/2.4.49"}),
        }
        finding_a, artifact_a = seal_finding_with_evidence(db_session, tmp_ev_dir, scan.id, unproven_raw)
        assert finding_a.proof_state == models.ProofState.CONTROL_GAP_CONFIRMED
        assert artifact_a.metadata_json["proof_validation"]["was_downgraded"] is True

        # Case B: Finding provides verified deterministic reproduction proof -> retains RUNTIME_REPRODUCED
        proven_raw = {
            "finding_key": "TEST-PROVEN-EXPLOIT",
            "title": "Verified Reflected Canary Reproduction",
            "description": "Canary token deterministically reflected in response body.",
            "severity": "high",
            "proof_state": models.ProofState.RUNTIME_REPRODUCED,
            "cvss_score": 7.5,
            "cve_id": None,
            "cwe_id": "CWE-79",
            "remediation": "Encode output.",
            "risk_priority": 80.0,
            "evidence": json.dumps({
                "probe_url": "http://192.168.195.140/?q=trepath_canary_991",
                "matched_canary": "trepath_canary_991",
                "reproduction_trace": "GET /?q=trepath_canary_991 -> 200 OK body contains trepath_canary_991",
            }),
        }
        finding_b, artifact_b = seal_finding_with_evidence(db_session, tmp_ev_dir, scan.id, proven_raw)
        assert finding_b.proof_state == models.ProofState.RUNTIME_REPRODUCED
        assert artifact_b.metadata_json["proof_validation"]["was_downgraded"] is False

        # Verify Finding Investigation Workspace & Credential Redaction
        zap_raw = {
            "finding_key": "ZAP-10105-10105-2",
            "title": "[OWASP ZAP] Weak Authentication Method",
            "description": "HTTP basic or digest authentication has been used over an unsecured connection.",
            "severity": "medium",
            "proof_state": models.ProofState.CONTROL_GAP_CONFIRMED,
            "cvss_score": None,
            "cve_id": None,
            "cwe_id": "CWE-326",
            "remediation": "Protect the connection using HTTPS or use a stronger authentication mechanism.",
            "risk_priority": 41.7,
            "evidence": json.dumps({
                "source": "OWASP ZAP v2.16 Deep Active DAST Engine",
                "plugin_id": "10105",
                "wasc_id": "4",
                "owasp_top10": "OWASP_2021_A07",
                "instances": [{
                    "url": "http://192.168.195.140:8080/manager/html",
                    "method": "GET",
                    "param": "Authorization",
                    "evidence": "WWW-Authenticate: Basic realm=\"Tomcat Manager Application\"",
                    "request_header": "GET /manager/html HTTP/1.1\r\nHost: 192.168.195.140:8080\r\nAuthorization: Basic YWRtaW46c2VjcmV0MTIz\r\nCookie: JSESSIONID=9F8E7D6C5B\r\n",
                    "response_header": "HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm=\"Tomcat Manager Application\"\r\n",
                }],
            }),
        }
        finding_z, _ = seal_finding_with_evidence(db_session, tmp_ev_dir, scan.id, zap_raw)
        db_session.commit()

        ws = build_finding_investigation_workspace(db_session, finding_z.id)
        assert ws is not None
        assert ws["finding_key"] == "ZAP-10105-10105-2"
        assert ws["proof_state"] == "CONTROL_GAP_CONFIRMED"
        assert "Basic [REDACTED]" in ws["evidence_management"]["artifacts"][0]["http_request_transcript"]
        assert "YWRtaW46c2VjcmV0MTIz" not in ws["evidence_management"]["artifacts"][0]["http_request_transcript"]
        assert "JSESSIONID=[REDACTED]" in ws["evidence_management"]["artifacts"][0]["http_request_transcript"]
        assert len(ws["technical_observation"]["verification_checklist"]) == 5
        assert "never represented as an official CVSS score" in ws["risk_analysis"]["calculation_breakdown"]["disclaimer"]


def test_stage_7_and_8_risk_profile_attack_graph_retest_and_report(db_session: Session, sample_telemetry: dict):
    """Verify Stage 7 (RiskEngine Profile & Multi-Chain AttackGraph) and Stage 8 (Retest Adapter RTEX-00001 & Report Export)."""
    _, _, roe, scan = _bootstrap_engagement_and_scan(db_session)

    with tempfile.TemporaryDirectory() as tmp_ev_dir:
        summary = execute_orchestrated_ingestion_and_lifecycle(
            db=db_session,
            scan=scan,
            roe=roe,
            evidence_dir=tmp_ev_dir,
            posture_findings=sample_telemetry["posture_findings"],
            port_findings=sample_telemetry["port_findings"],
            web_findings=sample_telemetry["web_findings"],
            active_findings=[],
            nmap_findings=sample_telemetry["nmap_findings"],
            tls_findings=[],
            nuclei_findings=[],
            zap_findings=[],
            openvas_findings=[],
            extra_discovered_urls=sample_telemetry["discovered_urls"],
        )
        db_session.commit()

        # Stage 7a: Compute Asset Risk Profile
        risk_prof = compute_asset_risk_profile(db_session, scan.id)
        assert risk_prof["asset_key"] == "ASSET-00001"
        assert risk_prof["overall_risk_index_100"] > 0
        assert risk_prof["kev_exposures_count"] >= 1
        assert len(risk_prof["top_risk_drivers"]) >= 1

        # Stage 7b: Multi-chain AttackGraph synthesis
        assert len(summary.attack_paths) >= 2
        first_path = summary.attack_paths[0]
        assert first_path.path_key == "PATH-00001"
        assert len(first_path.steps_json) >= 2
        assert "mitigation_chokepoint" in first_path.steps_json[0]

        # Stage 8a: Execute deterministic Retest Adapter on a finding whose remediation is marked ready
        target_finding = summary.findings[0]
        rem_task = db_session.query(models.RemediationTask).filter_by(finding_id=target_finding.id).first()
        if rem_task:
            rem_task.status = "resolved_pending_retest"
            db_session.flush()

        retest_res = execute_finding_retest(db_session, target_finding.id, tmp_ev_dir, timeout=0.3)
        db_session.commit()

        rx: models.RetestExecution = retest_res["retest_execution"]
        assert rx.retest_exec_key == "RTEX-00001"
        assert rx.status == models.ExecutionStatus.COMPLETED
        assert rx.evidence_artifact_id is not None

        retest_art = db_session.get(models.EvidenceArtifact, rx.evidence_artifact_id)
        assert retest_art is not None
        assert retest_art.artifact_type == "RETEST_VERIFICATION_TRANSCRIPT"
        assert verify_evidence_integrity(retest_art)["verified"] is True

        # Stage 8b: Generate Executive & Technical Markdown Assessment Report
        md_report = generate_markdown_assessment_report(db_session, scan.id)
        assert "# TrePath 2.0 — Executive & Technical Security Assessment Report" in md_report
        assert "PATH-00001" in md_report
        assert "RTEX-00001" in md_report


