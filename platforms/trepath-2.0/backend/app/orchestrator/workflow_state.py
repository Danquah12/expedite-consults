"""Orchestrator Workflow State — Tracks the 8-stage TrePath 2.0 Assessment Pipeline."""

from __future__ import annotations

import enum
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from .. import models


class PipelineStage(str, enum.Enum):
    WEBPULSE_NETRECON = "1_WEBPULSE_NETRECON"
    ASSET_NORMALIZATION = "2_ASSET_NORMALIZATION"
    ENUMCORE_INTELLIGENCE = "3_ENUMCORE_INTELLIGENCE"
    ASSESSMENT_ORCHESTRATOR = "4_ASSESSMENT_ORCHESTRATOR"
    DAST_AND_VALIDATOR = "5_DAST_AND_VALIDATOR"
    EVIDENCE_CORE = "6_EVIDENCE_CORE"
    RISK_AND_ATTACK_GRAPH = "7_RISK_AND_ATTACK_GRAPH"
    REMEDIATION_AND_REPORTING = "8_REMEDIATION_AND_REPORTING"


def record_execution_event(
    db: Session,
    engagement_id: int,
    scan_id: int,
    stage: str,
    engine: str,
    message: str,
    percent: int = 0,
    status: str = "INFO",
    execution_id: str | None = None,
) -> models.ExecutionEvent:
    """Persist an ExecutionEvent audit trail record for real-time progress tracking."""
    ev = models.ExecutionEvent(
        engagement_id=engagement_id,
        scan_id=scan_id,
        execution_id=execution_id,
        stage=stage,
        engine=engine,
        status=status,
        percent=min(max(percent, 0), 100),
        message=message,
        created_at=datetime.now(timezone.utc),
    )
    db.add(ev)
    db.flush()
    return ev
