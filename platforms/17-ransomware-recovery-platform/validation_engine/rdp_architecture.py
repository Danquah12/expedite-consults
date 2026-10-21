"""
XTRIKE Ransomware Defense Platform (RDP) — Core Safe Scenario Protocol,
8 Mandatory Pre-Execution Policy Checks, 7-Scenario Catalog (SIM-FILE-001..SIM-GRAPH-007),
10 Negative Safety Tests, and 8-Metric Denominator Scoring Engine.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Protocol, List, Dict


class Outcome(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    INCONCLUSIVE = "INCONCLUSIVE"
    BLOCKED = "BLOCKED"


@dataclass
class ScenarioContext:
    campaign_id: str
    tenant_id: str
    requester_authenticated: bool
    approval_valid_unexpired: bool
    target_asset_id: str
    permitted_assets: List[str]
    scenario_id: str
    approved_scenario_allowlist: List[str]
    isolation_and_limits_verified: bool
    impact_within_scope: bool
    global_stop_clear: bool
    cleanup_and_evidence_configured: bool
    dry_run: bool = True


@dataclass
class ScenarioResult:
    outcome: Outcome
    expected_signals: List[str]
    observed_signals: List[str]
    evidence_ids: List[str]
    notes: str


class Scenario(Protocol):
    scenario_id: str
    risk_level: str

    def validate(self, context: ScenarioContext) -> None:
        """Reject invalid scope or unsafe configuration."""
        ...

    def run(self, context: ScenarioContext) -> ScenarioResult:
        """Run a bounded, authorized, non-destructive test."""
        ...

    def cleanup(self, context: ScenarioContext) -> None:
        """Remove only artifacts owned by this test."""
        ...


class SafetyPolicyEngine:
    """
    Evaluates the 8 mandatory policy conditions before dispatching any scenario.
    Returns BLOCKED with a specific reason if any mandatory condition fails.
    """

    @staticmethod
    def evaluate_pre_execution_checks(ctx: ScenarioContext) -> Dict[str, str | bool]:
        if not ctx.requester_authenticated:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Requester not authenticated or authorized"}
        if not ctx.approval_valid_unexpired:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Campaign approval missing or expired"}
        if ctx.target_asset_id not in ctx.permitted_assets:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": f"Target {ctx.target_asset_id} not in approved asset inventory"}
        if ctx.scenario_id not in ctx.approved_scenario_allowlist:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": f"Scenario {ctx.scenario_id} not on approved allowlist"}
        if not ctx.isolation_and_limits_verified:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Disposable VM isolation, backups, or resource limits unverified"}
        if not ctx.impact_within_scope:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Expected test impact exceeds approved scope"}
        if not ctx.global_stop_clear:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Global kill switch active — execution halted"}
        if not ctx.cleanup_and_evidence_configured:
            return {"allowed": False, "status": Outcome.BLOCKED.value, "reason": "Cleanup procedure or evidence store not configured"}
        return {"allowed": True, "status": "APPROVED", "reason": "All 8 mandatory safety policy gates passed"}
