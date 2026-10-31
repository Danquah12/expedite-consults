"""Testing Package — Test Registry, Deterministic Policy Engine, ROE-Aware Test Selector, and Adapters."""

from .test_registry import RegisteredTest, BUILTIN_TEST_CATALOG, sync_test_registry
from .policy_engine import PolicyDecision, evaluate_test_policy
from .test_selector import SelectedTestPlanItem, select_tests_for_asset, persist_assessment_plan
from .adapters import AdapterExecutionOutput, map_findings_to_test_execution, run_targeted_dast_adapters

__all__ = [
    "RegisteredTest",
    "BUILTIN_TEST_CATALOG",
    "sync_test_registry",
    "PolicyDecision",
    "evaluate_test_policy",
    "SelectedTestPlanItem",
    "select_tests_for_asset",
    "persist_assessment_plan",
    "AdapterExecutionOutput",
    "map_findings_to_test_execution",
    "run_targeted_dast_adapters",
]
