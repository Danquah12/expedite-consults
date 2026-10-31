"""Deterministic Policy Engine — Enforces Rules of Engagement (ROE), origin scope, and risk classification."""

from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

from .. import models
from ..scope import normalize_origin


@dataclass
class PolicyDecision:
    allowed: bool
    selection_status: models.SelectionStatus
    execution_status: models.ExecutionStatus
    reason: str


PROFILE_ALLOWED_RISKS: dict[str, set[str]] = {
    "read_only": {"read_only", "safe_active"},
    "safe_active": {"read_only", "safe_active"},
    "deep_exhaustive": {"read_only", "safe_active"},
    "authorized_pentest": {"read_only", "safe_active", "intrusive"},
    "full_pentest": {"read_only", "safe_active", "intrusive"},
}


def evaluate_test_policy(
    test_def: models.TestDefinition,
    roe: models.RulesOfEngagement | None,
    target_url: str,
) -> PolicyDecision:
    """Deterministically evaluate whether a test definition is permitted under the engagement's ROE."""
    # 1. Check adapter & engine support first so unsupported tests are never falsely executed
    if not test_def.supported:
        return PolicyDecision(
            allowed=False,
            selection_status=models.SelectionStatus.UNSUPPORTED,
            execution_status=models.ExecutionStatus.SKIPPED,
            reason=f"Test '{test_def.test_id}' requires adapter '{test_def.adapter_name}' which is marked UNSUPPORTED.",
        )

    # 2. Check ROE existence and approval
    if not roe or not roe.approved:
        return PolicyDecision(
            allowed=False,
            selection_status=models.SelectionStatus.BLOCKED_BY_SCOPE,
            execution_status=models.ExecutionStatus.BLOCKED_BY_SCOPE,
            reason="Engagement lacks an approved Rules of Engagement (ROE) record.",
        )

    # 3. Check target origin against ROE allowed_origins
    try:
        norm_target = normalize_origin(target_url)
        allowed_set = {normalize_origin(o) for o in (roe.allowed_origins or [])}
    except Exception as exc:
        return PolicyDecision(
            allowed=False,
            selection_status=models.SelectionStatus.BLOCKED_BY_SCOPE,
            execution_status=models.ExecutionStatus.BLOCKED_BY_SCOPE,
            reason=f"Invalid target origin format: {exc}",
        )

    if norm_target not in allowed_set:
        return PolicyDecision(
            allowed=False,
            selection_status=models.SelectionStatus.BLOCKED_BY_SCOPE,
            execution_status=models.ExecutionStatus.BLOCKED_BY_SCOPE,
            reason=f"Target origin '{norm_target}' is outside approved ROE allowed_origins {sorted(allowed_set)}.",
        )

    # 4. Check test risk classification against ROE profile
    allowed_risks = PROFILE_ALLOWED_RISKS.get(roe.profile, {"read_only"})
    if test_def.risk_classification not in allowed_risks:
        return PolicyDecision(
            allowed=False,
            selection_status=models.SelectionStatus.BLOCKED_BY_SCOPE,
            execution_status=models.ExecutionStatus.BLOCKED_BY_SCOPE,
            reason=(
                f"Test risk classification '{test_def.risk_classification}' exceeds approved ROE profile "
                f"'{roe.profile}' (permitted: {sorted(allowed_risks)})."
            ),
        )

    return PolicyDecision(
        allowed=True,
        selection_status=models.SelectionStatus.ELIGIBLE,
        execution_status=models.ExecutionStatus.QUEUED,
        reason=f"Authorized under ROE profile '{roe.profile}' for origin '{norm_target}'.",
    )
