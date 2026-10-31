"""Orchestrator Scheduler — Manages deterministic job queue ordering and concurrency bounds."""

from __future__ import annotations

from dataclasses import dataclass
from .. import models


@dataclass
class ScheduledTestJob:
    plan_id: int
    plan_key: str
    asset_id: int
    asset_key: str
    test_id: str
    test_family: str
    selection_status: models.SelectionStatus
    priority: int
    rationale: str


def build_ordered_job_queue(
    asset: models.Asset,
    plans: list[models.AssessmentPlan],
) -> list[ScheduledTestJob]:
    """Order assessment plan items by priority (highest first) into a deterministic job queue."""
    ordered = sorted(plans, key=lambda p: (-p.priority, p.id))
    return [
        ScheduledTestJob(
            plan_id=p.id,
            plan_key=p.plan_key,
            asset_id=asset.id,
            asset_key=asset.asset_key,
            test_id=p.test_id,
            test_family=p.test_family,
            selection_status=p.selection_status,
            priority=p.priority,
            rationale=p.rationale,
        )
        for p in ordered
    ]
