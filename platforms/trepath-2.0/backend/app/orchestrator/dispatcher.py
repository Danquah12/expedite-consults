"""Orchestrator Dispatcher — Dispatches eligible test jobs and records explicit lifecycle states."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from .. import models
from ..testing.adapters import map_findings_to_test_execution
from .scheduler import ScheduledTestJob


def dispatch_scheduled_jobs(
    db: Session,
    engagement_id: int,
    scan_id: int,
    jobs: list[ScheduledTestJob],
    persisted_findings: list[models.Finding],
    finding_id_to_evidence_id: dict[int, int],
) -> list[models.TestExecution]:
    """
    Process every job in the assessment plan and create standardized TestExecution records:
      - ELIGIBLE -> QUEUED -> RUNNING -> COMPLETED (linked to EvidenceCore IDs & validated ProofState)
      - BLOCKED_BY_SCOPE -> status=BLOCKED_BY_SCOPE, proof_state=NOT_TESTED
      - UNSUPPORTED -> status=SKIPPED, proof_state=NOT_TESTED (never falsely executed)
      - NOT_APPLICABLE -> status=NOT_APPLICABLE, proof_state=NOT_TESTED
      - ALREADY_EXECUTED -> status=SKIPPED, proof_state=NOT_TESTED
    """
    executions: list[models.TestExecution] = []
    base_count = db.query(models.TestExecution).count()

    test_defs_by_id: dict[str, models.TestDefinition] = {
        t.test_id: t for t in db.query(models.TestDefinition).all()
    }

    for idx, job in enumerate(jobs, start=1):
        exec_key = f"EXEC-{base_count + idx:05d}"
        now_ts = datetime.now(timezone.utc)
        test_def = test_defs_by_id.get(job.test_id)
        adapter_name = test_def.adapter_name if test_def else "orchestrator_adapter"

        if job.selection_status == models.SelectionStatus.BLOCKED_BY_SCOPE:
            rec = models.TestExecution(
                execution_id=exec_key,
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=job.asset_id,
                asset_key=job.asset_key,
                plan_id=job.plan_id,
                test_id=job.test_id,
                status=models.ExecutionStatus.BLOCKED_BY_SCOPE,
                proof_state=models.ProofState.NOT_TESTED,
                started_at=None,
                completed_at=None,
                evidence_ids=[],
                limitations=[job.rationale],
                findings_produced=0,
            )
        elif job.selection_status == models.SelectionStatus.UNSUPPORTED:
            rec = models.TestExecution(
                execution_id=exec_key,
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=job.asset_id,
                asset_key=job.asset_key,
                plan_id=job.plan_id,
                test_id=job.test_id,
                status=models.ExecutionStatus.SKIPPED,
                proof_state=models.ProofState.NOT_TESTED,
                started_at=None,
                completed_at=None,
                evidence_ids=[],
                limitations=[job.rationale],
                findings_produced=0,
            )
        elif job.selection_status == models.SelectionStatus.NOT_APPLICABLE:
            rec = models.TestExecution(
                execution_id=exec_key,
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=job.asset_id,
                asset_key=job.asset_key,
                plan_id=job.plan_id,
                test_id=job.test_id,
                status=models.ExecutionStatus.NOT_APPLICABLE,
                proof_state=models.ProofState.NOT_TESTED,
                started_at=None,
                completed_at=None,
                evidence_ids=[],
                limitations=[job.rationale],
                findings_produced=0,
            )
        elif job.selection_status == models.SelectionStatus.ALREADY_EXECUTED:
            rec = models.TestExecution(
                execution_id=exec_key,
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=job.asset_id,
                asset_key=job.asset_key,
                plan_id=job.plan_id,
                test_id=job.test_id,
                status=models.ExecutionStatus.SKIPPED,
                proof_state=models.ProofState.NOT_TESTED,
                started_at=None,
                completed_at=None,
                evidence_ids=[],
                limitations=[job.rationale],
                findings_produced=0,
            )
        else:
            # ELIGIBLE -> Dispatch to adapter & correlate verified findings/evidence
            adapter_out = map_findings_to_test_execution(
                test_id=job.test_id,
                adapter_name=adapter_name,
                persisted_findings=persisted_findings,
                finding_id_to_evidence_id=finding_id_to_evidence_id,
            )
            done_ts = datetime.now(timezone.utc)
            rec = models.TestExecution(
                execution_id=exec_key,
                engagement_id=engagement_id,
                scan_id=scan_id,
                asset_id=job.asset_id,
                asset_key=job.asset_key,
                plan_id=job.plan_id,
                test_id=job.test_id,
                status=models.ExecutionStatus.COMPLETED,
                proof_state=adapter_out.proof_state,
                started_at=now_ts,
                completed_at=done_ts,
                evidence_ids=adapter_out.evidence_ids,
                limitations=adapter_out.limitations,
                findings_produced=len(adapter_out.findings),
            )

        db.add(rec)
        db.flush()
        executions.append(rec)

    return executions


def format_execution_record(ex: models.TestExecution) -> dict[str, object]:
    """Return the exact standardized JSON structure specified for TestExecution records."""
    return {
        "execution_id": ex.execution_id,
        "asset_id": ex.asset_key,
        "test_id": ex.test_id,
        "status": ex.status.value.lower() if ex.status == models.ExecutionStatus.COMPLETED else ex.status.value,
        "status_code": ex.status.value,
        "proof_state": ex.proof_state.value,
        "started_at": ex.started_at.strftime("%Y-%m-%dT%H:%M:%SZ") if ex.started_at else None,
        "completed_at": ex.completed_at.strftime("%Y-%m-%dT%H:%M:%SZ") if ex.completed_at else None,
        "evidence_ids": ex.evidence_ids or [],
        "limitations": ex.limitations or [],
        "findings_produced": ex.findings_produced,
    }
