"""
XTRIKE Recovery Desk — Automated Ransomware Attack Simulation & Defense Validation Engine.
Implements the 5-Phase Safe Simulation, Sysmon/Sigma Detection Validation, Attack-Path
Blast-Radius Analysis, SHA-256 Backup Integrity Verification, and Evidence-Backed Readiness Scoring.
"""

from .models import (
    EnvironmentTarget,
    ValidationVerdict,
    SafetyAuthorization,
    EvidenceRecord,
    DomainReadinessScore,
    ReadinessScoreReport,
)
from .simulator import RansomwareDefenseValidationEngine

__all__ = [
    "EnvironmentTarget",
    "ValidationVerdict",
    "SafetyAuthorization",
    "EvidenceRecord",
    "DomainReadinessScore",
    "ReadinessScoreReport",
    "RansomwareDefenseValidationEngine",
]
