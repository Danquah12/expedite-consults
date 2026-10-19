"""
Canonical data models for the XTRIKE Ransomware Simulation & Defense Validation Platform.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional


class EnvironmentTarget(str, Enum):
    WINDOWS = "Windows Endpoints & Active Directory"
    LINUX = "Linux Systems & ESXi Hypervisors"
    CLOUD = "Cloud Infrastructure (AWS S3 / IAM / KMS)"
    HYBRID = "Windows, Linux, and Cloud"


class ValidationVerdict(str, Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    INCONCLUSIVE = "INCONCLUSIVE"


@dataclass
class SafetyAuthorization:
    """Mandatory safety controls before any simulation scenario can execute."""
    authorization_id: str
    authorized_by: str
    isolated_lab_enclave: str
    controlled_test_dir: str
    kill_switch_armed: bool = True
    production_guard_active: bool = True

    def verify_safe_to_run(self) -> bool:
        if not self.kill_switch_armed or not self.production_guard_active:
            return False
        if not self.controlled_test_dir.startswith(("/tmp/xtrike_", "C:\\XtrikeLab\\")):
            return False
        return True


@dataclass
class EvidenceRecord:
    """
    Retains the 5 mandatory evidence-backed validation fields per scenario:
    1. Test scenario and expected defensive behavior
    2. Observed result and supporting evidence
    3. Whether the test passed, failed, or was inconclusive
    4. Affected systems and potential business impact
    5. Recommended remediation and retest status
    """
    scenario_id: str
    phase: int
    domain: str  # Prevention | Detection | Containment | Recovery | Identity protection
    environment: EnvironmentTarget
    mitre_technique: str
    atomic_test_id: str
    test_scenario_and_expected: str
    observed_result_and_evidence: str
    verdict: ValidationVerdict
    behavior_outcome: str  # DETECTED | BLOCKED | MISSED
    mttd_seconds: float
    mttc_seconds: float
    affected_systems_and_impact: str
    remediation_cisa_guidance: str
    retest_status: str  # VERIFIED_ON_RETEST | PENDING_RETEST | SCHEDULED


@dataclass
class DomainReadinessScore:
    domain: str
    score_pct: int
    scenarios_total: int
    scenarios_passed: int
    evidence_records: List[EvidenceRecord] = field(default_factory=list)


@dataclass
class ReadinessScoreReport:
    overall_score_pct: int
    safety_status: SafetyAuthorization
    domains: Dict[str, DomainReadinessScore]
    attack_graph_choke_points: List[str]
    backup_hash_verified: bool
    known_good_sha256: str
    restored_sha256: str
