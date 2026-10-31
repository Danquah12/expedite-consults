"""Orchestrator Planner — Generates ROE-aware Assessment Plans for normalized assets."""

from __future__ import annotations

from sqlalchemy.orm import Session

from .. import models
from ..testing.test_selector import select_tests_for_asset, persist_assessment_plan
from .scheduler import ScheduledTestJob, build_ordered_job_queue


def generate_asset_assessment_plan(
    db: Session,
    engagement_id: int,
    scan_id: int,
    asset: models.Asset,
    endpoints: list[models.Endpoint],
    technologies: list[models.Technology],
    intelligence_matches: list[models.IntelligenceMatch],
    roe: models.RulesOfEngagement | None,
    already_executed_test_ids: set[str] | None = None,
    target_url_override: str | None = None,
) -> tuple[list[models.AssessmentPlan], list[ScheduledTestJob]]:
    """Run the Test-Selection Intelligence engine and return persisted AssessmentPlan records + ordered job queue."""
    selected_items = select_tests_for_asset(
        db=db,
        asset=asset,
        endpoints=endpoints,
        technologies=technologies,
        intelligence_matches=intelligence_matches,
        roe=roe,
        already_executed_test_ids=already_executed_test_ids,
        target_url_override=target_url_override,
    )
    persisted_plans = persist_assessment_plan(
        db=db,
        engagement_id=engagement_id,
        scan_id=scan_id,
        asset_id=asset.id,
        items=selected_items,
    )
    job_queue = build_ordered_job_queue(asset, persisted_plans)
    return persisted_plans, job_queue
