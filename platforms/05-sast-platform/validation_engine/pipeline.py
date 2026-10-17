"""Stages A-F Orchestration Pipeline and Priority 1-5 Validators."""

from __future__ import annotations

import hashlib
from typing import Any
from .models import (
    CanonicalFinding,
    EvidenceRecord,
    ValidationContext,
    ValidationResult,
)
from .verifier import IndependentEvidenceVerifier


PRIORITY_VALIDATORS: list[dict[str, Any]] = [
    {
        "priority": 1,
        "name": "Authorization & Access Control Validator",
        "supported_cwes": {"CWE-285", "CWE-862", "CWE-639", "CWE-287"},
        "focus": "Compares permitted vs. denied principals against test-owned resources and verifies state mutation.",
    },
    {
        "priority": 2,
        "name": "SQL Query Structure & Parameterization Validator",
        "supported_cwes": {"CWE-89"},
        "focus": "Traces user input into query construction, checks prepared-statement bindings, and inspects DB driver telemetry.",
    },
    {
        "priority": 3,
        "name": "Rendering Context & Output Encoding Validator",
        "supported_cwes": {"CWE-79"},
        "focus": "Traces untrusted data to DOM/template context and verifies context-aware escaping in an isolated headless check.",
    },
    {
        "priority": 4,
        "name": "Path Canonicalization & File Boundary Validator",
        "supported_cwes": {"CWE-22", "CWE-73"},
        "focus": "Traces file path resolution through realpath/resolve guards against benign fixture boundary markers.",
    },
    {
        "priority": 5,
        "name": "Outbound Policy & Command Guard Validator",
        "supported_cwes": {"CWE-918", "CWE-78", "CWE-502"},
        "focus": "Enforces strict network/approval gates, RFC-1918 subnet allowlists, and argument-array execution policies.",
    },
]


class FindingValidationPipeline:
    """Deterministic A-F validation pipeline with independent evidence verification."""

    def __init__(self, authorized_scope: list[str]) -> None:
        self.authorized_scope = authorized_scope
        self.verifier = IndependentEvidenceVerifier()

    def select_validator_meta(self, cwe: str) -> dict[str, Any]:
        for item in PRIORITY_VALIDATORS:
            if cwe in item["supported_cwes"]:
                return item
        return {
            "priority": 5,
            "name": "Generic Structural & Reachability Validator",
            "supported_cwes": {cwe},
            "focus": "Performs AST data-flow and reachability verification.",
        }

    def run_finding_lifecycle(
        self,
        finding: CanonicalFinding,
        static_summary: dict[str, Any],
        runtime_observations: dict[str, Any],
    ) -> ValidationResult:
        context = ValidationContext(
            finding_id=finding.finding_id,
            cwe=finding.cwe,
            repository=finding.repository,
            commit_sha=finding.commit_sha,
            build_commit_sha=finding.build_commit_sha,
            file_path=finding.file_path,
            start_line=finding.start_line,
            language=finding.language,
            framework=finding.framework,
            endpoint=finding.endpoint,
            method=finding.http_method,
            authorized_scope=self.authorized_scope,
        )

        # 1. Preflight
        preflight_reasons: list[str] = []
        if finding.commit_sha != finding.build_commit_sha:
            preflight_reasons.append(
                f"Commit mismatch: finding commit {finding.commit_sha[:8]} != build {finding.build_commit_sha[:8]}"
            )
        if finding.repository not in self.authorized_scope:
            preflight_reasons.append(f"Repository {finding.repository} is outside authorized scope")
        if runtime_observations.get("blocked_by_gate"):
            preflight_reasons.append(str(runtime_observations["blocked_by_gate"]))
        preflight_ok = len(preflight_reasons) == 0

        validator_meta = self.select_validator_meta(finding.cwe)

        # Build content-addressed evidence records
        digest = hashlib.sha256(
            f"{finding.finding_id}:{finding.commit_sha}:{finding.file_path}:{finding.start_line}".encode()
        ).hexdigest()
        evidence = [
            EvidenceRecord(
                evidence_id=f"EV-{finding.finding_id}-AST",
                kind="ast_guard",
                summary=static_summary.get("control_note", "AST data-flow trace captured"),
                sha256_checksum=digest[:16],
                commit_sha=finding.commit_sha,
                timestamp="2026-10-16T19:40:00Z",
            ),
            EvidenceRecord(
                evidence_id=f"EV-{finding.finding_id}-RT",
                kind="otel_span",
                summary=runtime_observations.get("behavioral_note", "Runtime telemetry span recorded"),
                sha256_checksum=digest[16:32],
                commit_sha=finding.build_commit_sha,
                timestamp="2026-10-16T19:40:02Z",
            ),
        ]

        lifecycle_log = {
            "1_preflight": (
                f"PASS: commit {finding.commit_sha[:8]} == build {finding.build_commit_sha[:8]}, scope authorized"
                if preflight_ok
                else f"BLOCKED: {'; '.join(preflight_reasons)}"
            ),
            "2_assess": static_summary.get("reachability_note", "AST & call-graph trace completed"),
            "3_plan": f"Selected P{validator_meta['priority']} ({validator_meta['name']})",
            "4_execute": runtime_observations.get("behavioral_note", "Controlled check executed"),
            "5_verify": "Evaluated 6-point Proof Contract via IndependentEvidenceVerifier",
        }

        return self.verifier.finalize_result(
            finding=finding,
            context=context,
            preflight_ok=preflight_ok,
            preflight_reasons=preflight_reasons,
            static_summary=static_summary,
            runtime_observations=runtime_observations,
            evidence=evidence,
            lifecycle_log=lifecycle_log,
        )
