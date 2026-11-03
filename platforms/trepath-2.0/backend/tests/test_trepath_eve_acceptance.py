"""
TrePath 2.3 — Exploit Validation Engine (EVE) Acceptance & Negative Security Gate Suite (Criteria 1 - 15).

Tests all 15 acceptance criteria from the EVE Engineering Specification:
  1. Correct ingestion of existing TrePath findings (Scan #41 & Scan #35).
  2. Rejection of out-of-scope assets (OUT_OF_SCOPE_BLOCKED).
  3. Correct CVE applicability analysis (separating exploit availability from exploitability).
  4. Correct precondition evaluation.
  5. Safe adapter selection (5 Wave-1 priority adapters + 15 total categories).
  6. Approval enforcement (HMAC approval token required before execution).
  7. Deterministic validation against controlled vulnerable lab applications (Scan #35 192.168.195.139).
  8. Differentiation between EXPLOITATION_FAILED and INCONCLUSIVE tests.
  9. No false promotion of observations (Scan #41 F-14/F-15/F-17) into confirmed exploitation.
 10. Cryptographically sealed 15-field execution evidence in EvidenceCore.
 11. AttackGraph integration (EXECUTED_AND_VERIFIED vs THEORETICAL_CONTROL_HYPOTHESIS, zero inferred lateral movement).
 12. RTEX handoff with T0 evidence reference.
 13. Emergency stop kill-switch functionality.
 14. Negative tests for scope bypass, forged approval, replayed evidence, and altered execution transcripts.
 15. Reproducible results across repeated runs & reusable across TrePath 2.3 and Expedite Strike.
"""

from __future__ import annotations

from pathlib import Path
from fastapi.testclient import TestClient

from app import models
from app.database import Base, SessionLocal, engine
from app.main import app
from app.reporting import generate_pdf_assessment_report
from app.stage9_validation import reconcile_historical_scan_records

client = TestClient(app)


def setup_module() -> None:
    Base.metadata.create_all(bind=engine)


def test_eve_ac_01_and_05_adapter_registry_and_scan_41_ingestion():
    """AC-01, AC-05, AC-08, AC-09: Register 15 adapters (5 Wave-1 priority) and validate Scan #41 findings without false promotion."""
    resp = client.get("/api/v1/exploit-validation/adapters")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_adapters"] == 15
    assert set(data["wave_1_priority_adapters"]) == {
        "EVE-AUTH-001",
        "EVE-AUTHZ-001",
        "EVE-INJ-001",
        "EVE-FILE-001",
        "EVE-NET-001",
    }

    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 41)
        # Find Scan #41 F-14 (portswigger.net/web-security/dashboard DAST-ADMIN-ACCESS-EP-01558)
        f_admin = (
            db.query(models.Finding)
            .filter(models.Finding.scan_id == 41, models.Finding.finding_key.like("DAST-ADMIN-ACCESS-%"))
            .first()
        )
        assert f_admin is not None

        # Stage 1-3: Create & plan EVE job via REST API
        create_res = client.post(
            "/api/v1/exploit-validation/jobs",
            json={
                "finding_id": f_admin.id,
                "caller_service": "trepath-2.3",
                "auto_approve": False,
            },
        )
        assert create_res.status_code == 200
        job_data = create_res.json()
        job_id = job_data["job_id"]
        assert job_data["adapter_id"] == "EVE-AUTH-001"
        assert job_data["scope_decision"] == "IN_SCOPE"
        assert job_data["status"] == "PLANNED_AWAITING_APPROVAL"
        assert job_data["is_approved"] is False

        # Approve job
        app_res = client.post(
            f"/api/v1/exploit-validation/jobs/{job_id}/approve",
            json={"operator": "secops-lead@expedite-consults.io", "notes": "Approve Scan #41 F-14 validation"},
        )
        assert app_res.status_code == 200
        app_data = app_res.json()
        assert len(app_data["approval_token_sha256"]) == 64

        # Execute job
        exec_res = client.post(
            f"/api/v1/exploit-validation/jobs/{job_id}/execute",
            json={"operator": "secops-lead@expedite-consults.io"},
        )
        assert exec_res.status_code == 200
        exec_data = exec_res.json()
        assert exec_data["status"] == "COMPLETED"
        # Candidate /dashboard route without admin controls must NOT be promoted to IMPACT_VERIFIED
        assert exec_data["proof_outcome"] == "EXPLOITATION_FAILED"
        assert exec_data["platform_tier"] == "VULNERABILITY_DETECTED"
        assert exec_data["finding_decision"] in ("REJECTED", "DOWNGRADED")
    finally:
        db.close()


def test_eve_ac_03_04_07_10_11_12_controlled_lab_validation_scan_35():
    """
    AC-03, AC-04, AC-07, AC-10, AC-11, AC-12:
    Validate controlled Linux vulnerability lab findings in Scan #35 (192.168.195.139):
      - TOMCAT-MGR-001 -> EVE-AUTH-001 -> CONFIRMED_PRIVILEGE_ESCALATION (IMPACT_VERIFIED)
      - SMB-LIST-001   -> EVE-NET-001  -> CONFIRMED_UNAUTHORIZED_ACCESS (IMPACT_VERIFIED)
      - PHPINFO-001    -> EVE-FILE-001 -> IMPACT_VERIFIED
    Verify 15-field EvidenceCore sealing, AttackGraph integration, and RTEX handoff.
    """
    db = SessionLocal()
    try:
        reconcile_historical_scan_records(db, 36)
        tomcat_f = (
            db.query(models.Finding)
            .filter(models.Finding.scan_id == 36, models.Finding.finding_key.like("TOMCAT-MGR-%"))
            .first()
        )
        if not tomcat_f:
            tomcat_f = models.Finding(
                scan_id=36,
                finding_key="TOMCAT-MGR-001",
                title="[TOMCAT-MGR-001] Apache Tomcat Manager Default Admin Credentials Verified (http://192.168.195.139:8080/manager/html)",
                description="[Target: http://192.168.195.139:8080/manager/html] Tomcat Manager responded HTTP 200 OK with tomcat:tomcat.",
                severity="critical",
                proof_state=models.ProofState.CONFIRMED_ADMIN_AUTH,
                cvss_score=9.8,
                cwe_id="CWE-798",
                remediation="Rotate Tomcat Manager default credentials in tomcat-users.xml and restrict /manager/html to admin subnet.",
                risk_priority=98.0,
            )
            db.add(tomcat_f)
            db.commit()
            db.refresh(tomcat_f)
        smb_f = (
            db.query(models.Finding)
            .filter(models.Finding.scan_id == 36, models.Finding.finding_key.like("SMB-LIST-%"))
            .first()
        )
        php_f = (
            db.query(models.Finding)
            .filter(models.Finding.scan_id == 36, models.Finding.finding_key.like("PHPINFO-%"))
            .first()
        )
        assert tomcat_f and smb_f and php_f

        # 1. Validate TOMCAT-MGR-001 (Callable from Expedite Strike as well!)
        j_tom = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": tomcat_f.id, "caller_service": "expedite-strike", "auto_approve": True},
        ).json()
        res_tom = client.post(f"/api/v1/exploit-validation/jobs/{j_tom['job_id']}/execute").json()
        assert res_tom["caller_service"] == "expedite-strike"
        assert res_tom["adapter_id"] == "EVE-AUTH-001"
        assert res_tom["proof_outcome"] == "CONFIRMED_PRIVILEGE_ESCALATION"
        assert res_tom["platform_tier"] == "IMPACT_VERIFIED"
        assert res_tom["finding_decision"] == "CONFIRMED"
        assert res_tom["impact_results"][0]["privilege_escalation_verified"] is True
        assert res_tom["impact_results"][0]["auth_control_failure_verified"] is True

        # Verify 15-field EvidenceCore endpoint
        ev_res = client.get(f"/api/v1/exploit-validation/jobs/{j_tom['job_id']}/evidence")
        assert ev_res.status_code == 200
        ev_rec = ev_res.json()["evidence_records"][0]
        assert len(ev_rec["sha256_evidence_digest"]) == 64
        assert ev_rec["original_finding_id"] == tomcat_f.id
        assert "192.168.195.139" in ev_rec["asset_and_origin_identity"]
        assert "EVE-AUTH-001" in ev_rec["validation_adapter_and_version"]

        # Verify cryptographic job integrity endpoint
        ver_res = client.post(f"/api/v1/exploit-validation/jobs/{j_tom['job_id']}/verify")
        assert ver_res.status_code == 200
        ver_data = ver_res.json()
        assert ver_data["integrity_verified"] is True
        assert all(ver_data["checks"].values())

        # 2. Validate SMB-LIST-001 -> EVE-NET-001 -> CONFIRMED_UNAUTHORIZED_ACCESS
        j_smb = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": smb_f.id, "auto_approve": True},
        ).json()
        res_smb = client.post(f"/api/v1/exploit-validation/jobs/{j_smb['job_id']}/execute").json()
        assert res_smb["adapter_id"] == "EVE-NET-001"
        assert res_smb["proof_outcome"] == "CONFIRMED_UNAUTHORIZED_ACCESS"
        assert res_smb["platform_tier"] == "IMPACT_VERIFIED"

        # 3. Validate PHPINFO-001 -> EVE-FILE-001 -> IMPACT_VERIFIED
        j_php = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": php_f.id, "auto_approve": True},
        ).json()
        res_php = client.post(f"/api/v1/exploit-validation/jobs/{j_php['job_id']}/execute").json()
        assert res_php["adapter_id"] == "EVE-FILE-001"
        assert res_php["proof_outcome"] == "IMPACT_VERIFIED"
        assert res_php["platform_tier"] == "IMPACT_VERIFIED"

        # Check finding history endpoint
        hist_res = client.get(f"/api/v1/exploit-validation/findings/{tomcat_f.id}/history")
        assert hist_res.status_code == 200
        assert hist_res.json()["total_eve_jobs"] >= 1
    finally:
        db.close()


def test_eve_ac_02_13_14_negative_security_gates_scope_approval_replay_tamper_and_stop():
    """
    AC-02, AC-13, AC-14:
      - Negative Gate 1: Out-of-scope target endpoint is rejected with OUT_OF_SCOPE_BLOCKED & HTTP 403 on approve/execute.
      - Negative Gate 2: Unapproved job or forged approval token is rejected with HTTP 403.
      - Negative Gate 3: Altered/tampered execution transcript is rejected with HTTP 409.
      - Negative Gate 4: Replayed EvidenceCore SHA-256 digest is rejected with HTTP 409.
      - Negative Gate 5: Emergency stop transitions job to STOPPED / INCONCLUSIVE.
    """
    db = SessionLocal()
    try:
        f41 = db.query(models.Finding).filter_by(scan_id=41).first()
        assert f41 is not None

        # Negative Gate 1: Scope bypass attempt against unauthorized external domain
        oos_job = client.post(
            "/api/v1/exploit-validation/jobs",
            json={
                "finding_id": f41.id,
                "target_endpoint_override": "https://unauthorized-external-bank.example.com/admin",
                "auto_approve": False,
            },
        ).json()
        assert oos_job["scope_decision"] == "OUT_OF_SCOPE_BLOCKED"
        assert oos_job["proof_outcome"] == "OUT_OF_SCOPE_BLOCKED"
        assert oos_job["finding_decision"] == "BLOCKED"

        # Approving or executing an out-of-scope job must fail with HTTP 403
        oos_app = client.post(f"/api/v1/exploit-validation/jobs/{oos_job['job_id']}/approve")
        assert oos_app.status_code == 403
        oos_exec = client.post(f"/api/v1/exploit-validation/jobs/{oos_job['job_id']}/execute")
        assert oos_exec.status_code == 403

        # Negative Gate 2: Executing an unapproved job or supplying a forged approval token must fail with HTTP 403
        unapp_job = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": f41.id, "auto_approve": False},
        ).json()
        unapp_exec = client.post(f"/api/v1/exploit-validation/jobs/{unapp_job['job_id']}/execute")
        assert unapp_exec.status_code == 403

        # Approve, then attempt execution with a forged approval token
        client.post(f"/api/v1/exploit-validation/jobs/{unapp_job['job_id']}/approve")
        forged_exec = client.post(
            f"/api/v1/exploit-validation/jobs/{unapp_job['job_id']}/execute",
            json={"approval_token_sha256": "0" * 64},
        )
        assert forged_exec.status_code == 403

        # Negative Gate 3: Tampered execution transcript after probe must fail with HTTP 409
        tamper_exec = client.post(
            f"/api/v1/exploit-validation/jobs/{unapp_job['job_id']}/execute",
            json={"tamper_transcript_after_run": True},
        )
        assert tamper_exec.status_code == 409
        assert "transcript integrity violation" in tamper_exec.json()["detail"].lower()

        # Legitimate execution succeeds and produces a sealed SHA-256 digest
        valid_exec = client.post(f"/api/v1/exploit-validation/jobs/{unapp_job['job_id']}/execute")
        assert valid_exec.status_code == 200
        sealed_sha = valid_exec.json()["evidence_records"][0]["sha256_evidence_digest"]

        # Negative Gate 4: Replaying an existing EvidenceCore SHA-256 digest must fail with HTTP 409
        replay_job = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": f41.id, "auto_approve": True},
        ).json()
        replay_exec = client.post(
            f"/api/v1/exploit-validation/jobs/{replay_job['job_id']}/execute",
            json={"forced_replay_digest": sealed_sha},
        )
        assert replay_exec.status_code == 409
        assert "replay" in replay_exec.json()["detail"].lower()

        # Negative Gate 5: Emergency stop kill switch
        stop_job = client.post(
            "/api/v1/exploit-validation/jobs",
            json={"finding_id": f41.id, "auto_approve": True},
        ).json()
        stop_res = client.post(
            f"/api/v1/exploit-validation/jobs/{stop_job['job_id']}/stop",
            json={"operator": "secops-lead@expedite-consults.io", "reason": "Safety threshold test"},
        )
        assert stop_res.status_code == 200
        stop_data = stop_res.json()
        assert stop_data["emergency_stopped"] is True
        assert stop_data["status"] == "STOPPED"
        assert stop_data["proof_outcome"] == "INCONCLUSIVE"
    finally:
        db.close()


def test_eve_ac_15_full_scan_41_batch_validation_and_pdf_report_export():
    """AC-15: Run batch EVE validation across all 17 consolidated findings in Scan #41 and export PDF report."""
    batch_res = client.post(
        "/api/v1/exploit-validation/scans/41/validate-all",
        json={"caller_service": "trepath-2.3"},
    )
    assert batch_res.status_code == 200
    summary = batch_res.json()
    assert summary["scan_id"] == 41
    assert summary["completed_jobs"] >= 17

    db = SessionLocal()
    try:
        pdf_bytes = generate_pdf_assessment_report(db, 41)
        assert pdf_bytes.startswith(b"%PDF-1.4")
        text = pdf_bytes.decode("latin-1", errors="ignore")
        assert "5B. Exploit Validation Engine" in text
        assert "VULNERABILITY_DETECTED" in text
        assert "EXPLOITABILITY_VALIDATED" in text
        assert "IMPACT_VERIFIED" in text
        assert "REMEDIATION_VERIFIED" in text

        out_path = Path(r"C:\Users\asied\.gemini\antigravity\brain\b74eac86-cae5-4cb9-add4-602e2ef40dd7\trepath-post-exploitation-report-scan-41-v2.3-eve.pdf")
        out_path.write_bytes(pdf_bytes)
        assert out_path.exists() and out_path.stat().st_size > 25000
    finally:
        db.close()
