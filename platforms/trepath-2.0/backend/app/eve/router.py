"""
TrePath 2.3 — Exploit Validation Engine (EVE) REST API Router (Section 8).

Implements all 8 required endpoints:
  1. POST /api/v1/exploit-validation/jobs
  2. GET  /api/v1/exploit-validation/jobs/{job_id}
  3. POST /api/v1/exploit-validation/jobs/{job_id}/approve
  4. POST /api/v1/exploit-validation/jobs/{job_id}/execute
  5. POST /api/v1/exploit-validation/jobs/{job_id}/stop
  6. GET  /api/v1/exploit-validation/jobs/{job_id}/evidence
  7. GET  /api/v1/exploit-validation/findings/{finding_id}/history
  8. POST /api/v1/exploit-validation/jobs/{job_id}/verify

Plus reusable service endpoints for TrePath 2.3 and Expedite Strike:
  - GET  /api/v1/exploit-validation/adapters
  - GET  /api/v1/exploit-validation/scans/{scan_id}/summary
  - POST /api/v1/exploit-validation/scans/{scan_id}/validate-all
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.eve.services import (
    ApprovalIntegrityError,
    EvidenceReplayDetectedError,
    ExploitAdapterRegistry,
    ExploitOrchestrator,
    ScopeBypassBlockedError,
    TranscriptTamperDetectedError,
)

router = APIRouter(prefix="/api/v1/exploit-validation", tags=["Exploit Validation Engine (EVE)"])


class CreateEVEJobRequest(BaseModel):
    finding_id: int
    adapter_id: str | None = None
    caller_service: str = Field(default="trepath-2.3", description="trepath-2.3 or expedite-strike")
    target_endpoint_override: str | None = None
    auto_approve: bool = False
    operator: str = "secops-lead@expedite-consults.io"


class ApproveEVEJobRequest(BaseModel):
    operator: str = "secops-lead@expedite-consults.io"
    notes: str = "Approved under ROE read-only deterministic validation profile."


class ExecuteEVEJobRequest(BaseModel):
    operator: str = "secops-lead@expedite-consults.io"
    approval_token_sha256: str | None = None
    offline_mode: bool = True
    lab_synthetic_authz_bypass: bool = False
    lab_synthetic_injection: bool = False
    tamper_transcript_after_run: bool = False
    forced_replay_digest: str | None = None


class StopEVEJobRequest(BaseModel):
    operator: str = "secops-lead@expedite-consults.io"
    reason: str = "Operator initiated emergency kill switch."


class ValidateScanBatchRequest(BaseModel):
    finding_ids: list[int] | None = None
    caller_service: str = "trepath-2.3"
    operator: str = "secops-lead@expedite-consults.io"


@router.get("/adapters")
def list_eve_adapters(db: Session = Depends(get_db)) -> dict[str, Any]:
    records = ExploitAdapterRegistry.sync_registry_to_db(db)
    db.commit()
    return {
        "total_adapters": len(records),
        "wave_1_priority_adapters": [r.adapter_id for r in records if r.priority_wave == 1],
        "adapters": [
            {
                "adapter_id": r.adapter_id,
                "name": r.name,
                "category": r.category,
                "priority_wave": r.priority_wave,
                "version": r.version,
                "safety_profile": r.safety_profile,
                "requires_explicit_approval": r.requires_explicit_approval,
                "max_requests_limit": r.max_requests_limit,
                "max_timeout_seconds": r.max_timeout_seconds,
                "what_it_proves": r.what_it_proves,
                "supported_cwe_ids": r.supported_cwe_ids,
                "supported_finding_prefixes": r.supported_finding_prefixes,
            }
            for r in records
        ],
    }


@router.post("/jobs")
def create_eve_job(req: CreateEVEJobRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        job = ExploitOrchestrator.create_and_plan_job(
            db,
            finding_id=req.finding_id,
            adapter_id=req.adapter_id,
            caller_service=req.caller_service,
            target_endpoint_override=req.target_endpoint_override,
            auto_approve=req.auto_approve,
            operator=req.operator,
        )
        return ExploitOrchestrator.get_job_details(db, job.id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/jobs/{job_id}")
def get_eve_job(job_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return ExploitOrchestrator.get_job_details(db, job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/jobs/{job_id}/approve")
def approve_eve_job(
    job_id: int,
    req: ApproveEVEJobRequest | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    body = req or ApproveEVEJobRequest()
    try:
        approval = ExploitOrchestrator.approve_job(
            db,
            job_id=job_id,
            operator=body.operator,
            notes=body.notes,
        )
        return {
            "job_id": job_id,
            "approval_id": approval.id,
            "approval_status": approval.approval_status,
            "approved_by_operator": approval.approved_by_operator,
            "safety_mode": approval.safety_mode,
            "max_requests_authorized": approval.max_requests_authorized,
            "approval_token_sha256": approval.approval_token_sha256,
            "approved_at": approval.approved_at.isoformat() if approval.approved_at else None,
        }
    except ScopeBypassBlockedError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/jobs/{job_id}/execute")
def execute_eve_job(
    job_id: int,
    req: ExecuteEVEJobRequest | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    body = req or ExecuteEVEJobRequest()
    try:
        return ExploitOrchestrator.execute_job(
            db,
            job_id=job_id,
            operator=body.operator,
            runtime_options={
                "approval_token_sha256": body.approval_token_sha256,
                "offline_mode": body.offline_mode,
                "lab_synthetic_authz_bypass": body.lab_synthetic_authz_bypass,
                "lab_synthetic_injection": body.lab_synthetic_injection,
                "tamper_transcript_after_run": body.tamper_transcript_after_run,
                "forced_replay_digest": body.forced_replay_digest,
            },
        )
    except (ScopeBypassBlockedError, ApprovalIntegrityError) as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except (EvidenceReplayDetectedError, TranscriptTamperDetectedError) as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/jobs/{job_id}/stop")
def stop_eve_job(
    job_id: int,
    req: StopEVEJobRequest | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    body = req or StopEVEJobRequest()
    try:
        return ExploitOrchestrator.stop_job(
            db,
            job_id=job_id,
            operator=body.operator,
            reason=body.reason,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/jobs/{job_id}/evidence")
def get_eve_job_evidence(job_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    job = db.query(models.ExploitValidationJob).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"EVE Job #{job_id} not found.")
    records = db.query(models.ExploitEvidenceRecord).filter_by(job_id=job_id).all()
    return {
        "job_id": job.id,
        "job_key": job.job_key,
        "finding_id": job.finding_id,
        "total_evidence_records": len(records),
        "evidence_records": [
            {
                "evidence_key": r.evidence_key,
                "original_finding_id": r.original_finding_id,
                "evidence_artifact_id": r.evidence_artifact_id,
                "asset_and_origin_identity": r.asset_and_origin_identity,
                "approved_scope_and_roe": r.approved_scope_and_roe,
                "validation_adapter_and_version": r.validation_adapter_and_version,
                "test_timestamp": r.test_timestamp,
                "preconditions": r.preconditions_json,
                "execution_transcript": r.execution_transcript_json,
                "request_response_evidence": r.request_response_evidence_json,
                "expected_vs_actual": r.expected_vs_actual_json,
                "execution_outcome": r.execution_outcome,
                "evidence_confidence": r.evidence_confidence,
                "exploitability_confidence": r.exploitability_confidence,
                "impact_confidence": r.impact_confidence,
                "sha256_evidence_digest": r.sha256_evidence_digest,
                "operator_or_approving_identity": r.operator_or_approving_identity,
                "sealed_at": r.sealed_at.isoformat() if r.sealed_at else None,
            }
            for r in records
        ],
    }


@router.get("/findings/{finding_id}/history")
def get_eve_finding_history(finding_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return ExploitOrchestrator.get_finding_history(db, finding_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/jobs/{job_id}/verify")
def verify_eve_job(job_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return ExploitOrchestrator.verify_job_integrity(db, job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/scans/{scan_id}/summary")
def get_scan_eve_summary(scan_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    return ExploitOrchestrator.get_scan_eve_summary(db, scan_id)


@router.post("/scans/{scan_id}/validate-all")
def validate_all_scan_findings(
    scan_id: int,
    req: ValidateScanBatchRequest | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    body = req or ValidateScanBatchRequest()
    try:
        return ExploitOrchestrator.validate_scan_findings(
            db,
            scan_id=scan_id,
            finding_ids=body.finding_ids,
            caller_service=body.caller_service,
            operator=body.operator,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
