import enum
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Enum, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Role(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"

class ScanStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class ProofState(str, enum.Enum):
    DISCOVERED = "DISCOVERED"
    OBSERVATION_CONFIRMED = "OBSERVATION_CONFIRMED"
    CONTROL_GAP_CONFIRMED = "CONTROL_GAP_CONFIRMED"
    ATTACK_PATH_CORRELATED = "ATTACK_PATH_CORRELATED"
    ATTACK_PATH_VALIDATED = "ATTACK_PATH_VALIDATED"
    RUNTIME_REPRODUCED = "RUNTIME_REPRODUCED"
    CONFIRMED_ADMIN_AUTH = "CONFIRMED_ADMIN_AUTH"
    IMPACT_VERIFIED = "IMPACT_VERIFIED"
    REMEDIATION_VERIFIED = "REMEDIATION_VERIFIED"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_VULNERABLE = "NOT_VULNERABLE"
    BLOCKED_BY_SCOPE = "BLOCKED_BY_SCOPE"
    NOT_TESTED = "NOT_TESTED"

class ExecutionStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    BLOCKED_BY_SCOPE = "BLOCKED_BY_SCOPE"
    SKIPPED = "SKIPPED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class SelectionStatus(str, enum.Enum):
    ELIGIBLE = "ELIGIBLE"
    BLOCKED_BY_SCOPE = "BLOCKED_BY_SCOPE"
    UNSUPPORTED = "UNSUPPORTED"
    ALREADY_EXECUTED = "ALREADY_EXECUTED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.ADMIN)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Engagement(Base):
    __tablename__ = "engagements"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    client_name: Mapped[str] = mapped_column(String(200))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(30), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    roe: Mapped["RulesOfEngagement | None"] = relationship(back_populates="engagement", uselist=False)

class RulesOfEngagement(Base):
    __tablename__ = "rules_of_engagement"
    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), unique=True)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    allowed_origins: Mapped[list] = mapped_column(JSON, default=list)
    allow_private_networks: Mapped[bool] = mapped_column(Boolean, default=False)
    max_requests: Mapped[int] = mapped_column(Integer, default=30)
    max_concurrency: Mapped[int] = mapped_column(Integer, default=1)
    profile: Mapped[str] = mapped_column(String(30), default="read_only")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    engagement: Mapped[Engagement] = relationship(back_populates="roe")

class Scan(Base):
    __tablename__ = "scans"
    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    target_url: Mapped[str] = mapped_column(String(2048))
    status: Mapped[ScanStatus] = mapped_column(Enum(ScanStatus), default=ScanStatus.QUEUED)
    profile: Mapped[str] = mapped_column(String(30), default="read_only")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Finding(Base):
    __tablename__ = "findings"
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_key: Mapped[str] = mapped_column(String(120), index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20))
    proof_state: Mapped[ProofState] = mapped_column(Enum(ProofState), default=ProofState.OBSERVATION_CONFIRMED)
    cvss_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(30), nullable=True)
    cwe_id: Mapped[str | None] = mapped_column(String(30), nullable=True)
    remediation: Mapped[str] = mapped_column(Text)
    risk_priority: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"
    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), nullable=True)
    artifact_type: Mapped[str] = mapped_column(String(60))
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    storage_path: Mapped[str] = mapped_column(String(2048))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    collector_version: Mapped[str] = mapped_column(String(40), default="trepath-core/0.1.0")
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Retest(Base):
    __tablename__ = "retests"
    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"))
    status: Mapped[str] = mapped_column(String(30), default="pending")
    expected_state: Mapped[str] = mapped_column(Text)
    functional_test: Mapped[str] = mapped_column(Text)
    boundary_test: Mapped[str] = mapped_column(Text)
    result_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(120))
    resource_type: Mapped[str] = mapped_column(String(80))
    resource_id: Mapped[str] = mapped_column(String(120))
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

# ==============================================================================
# TrePath 2.0 Assessment Orchestrator v1 Canonical Database Records
# Every record links back to the canonical engagement_id and scan_id.
# ==============================================================================

class Asset(Base):
    __tablename__ = "assets"
    id: Mapped[int] = mapped_column(primary_key=True)
    asset_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. ASSET-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    hostname: Mapped[str] = mapped_column(String(255), index=True)
    target_url: Mapped[str] = mapped_column(String(2048))
    asset_type: Mapped[str] = mapped_column(String(60), default="web_application")
    scheme: Mapped[str] = mapped_column(String(20), default="http")
    primary_port: Mapped[int] = mapped_column(Integer, default=80)
    open_ports: Mapped[list] = mapped_column(JSON, default=list)
    http_origins: Mapped[list] = mapped_column(JSON, default=list)
    services_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Endpoint(Base):
    __tablename__ = "endpoints"
    id: Mapped[int] = mapped_column(primary_key=True)
    endpoint_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. EP-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    url: Mapped[str] = mapped_column(String(2048))
    canonical_signature: Mapped[str] = mapped_column(String(512), index=True)
    method: Mapped[str] = mapped_column(String(16), default="GET")
    path: Mapped[str] = mapped_column(String(1024), default="/")
    surface_type: Mapped[str] = mapped_column(String(60), default="web_root")
    functionality: Mapped[str] = mapped_column(String(60), default="general")
    auth_required: Mapped[bool] = mapped_column(Boolean, default=False)
    parameters: Mapped[list] = mapped_column(JSON, default=list)
    input_types: Mapped[list] = mapped_column(JSON, default=list)
    sensitivity: Mapped[str] = mapped_column(String(20), default="low")
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class Technology(Base):
    __tablename__ = "technologies"
    id: Mapped[int] = mapped_column(primary_key=True)
    tech_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. TECH-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    version: Mapped[str | None] = mapped_column(String(60), nullable=True)
    category: Mapped[str] = mapped_column(String(60), default="service")
    cpe: Mapped[str | None] = mapped_column(String(255), nullable=True)
    banner: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_outdated: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.9)
    evidence_artifact_id: Mapped[int | None] = mapped_column(ForeignKey("evidence_artifacts.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class IntelligenceMatch(Base):
    __tablename__ = "intelligence_matches"
    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    technology_id: Mapped[int | None] = mapped_column(ForeignKey("technologies.id"), nullable=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    cwe_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    cwe_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    cvss_score: Mapped[float] = mapped_column(Float, default=5.0)
    epss_score: Mapped[float] = mapped_column(Float, default=0.05)
    epss_percentile: Mapped[float] = mapped_column(Float, default=0.50)
    in_cisa_kev: Mapped[bool] = mapped_column(Boolean, default=False)
    exploit_maturity: Mapped[str] = mapped_column(String(40), default="unproven")
    summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class TestDefinition(Base):
    __tablename__ = "test_definitions"
    id: Mapped[int] = mapped_column(primary_key=True)
    test_id: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. API-AUTHZ-001
    name: Mapped[str] = mapped_column(String(200))
    family: Mapped[str] = mapped_column(String(100), index=True)
    target_feature: Mapped[str] = mapped_column(String(80), index=True)
    risk_classification: Mapped[str] = mapped_column(String(40), default="read_only")  # read_only | safe_active | intrusive | destructive
    adapter_name: Mapped[str] = mapped_column(String(80))
    supported: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_auth: Mapped[bool] = mapped_column(Boolean, default=False)
    applicable_asset_types: Mapped[list] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class AssessmentPlan(Base):
    __tablename__ = "assessment_plans"
    id: Mapped[int] = mapped_column(primary_key=True)
    plan_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. PLAN-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    endpoint_id: Mapped[int | None] = mapped_column(ForeignKey("endpoints.id"), nullable=True)
    technology_id: Mapped[int | None] = mapped_column(ForeignKey("technologies.id"), nullable=True)
    test_id: Mapped[str] = mapped_column(String(60), index=True)
    test_family: Mapped[str] = mapped_column(String(100))
    discovered_feature: Mapped[str] = mapped_column(String(100))
    selection_status: Mapped[SelectionStatus] = mapped_column(Enum(SelectionStatus), default=SelectionStatus.ELIGIBLE)
    rationale: Mapped[str] = mapped_column(Text, default="")
    priority: Mapped[int] = mapped_column(Integer, default=50)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class TestExecution(Base):
    __tablename__ = "test_executions"
    id: Mapped[int] = mapped_column(primary_key=True)
    execution_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)  # e.g. EXEC-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    asset_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. ASSET-00001
    plan_id: Mapped[int | None] = mapped_column(ForeignKey("assessment_plans.id"), nullable=True)
    test_id: Mapped[str] = mapped_column(String(60), index=True)  # e.g. API-AUTHZ-001
    status: Mapped[ExecutionStatus] = mapped_column(Enum(ExecutionStatus), default=ExecutionStatus.QUEUED)
    proof_state: Mapped[ProofState] = mapped_column(Enum(ProofState), default=ProofState.NOT_TESTED)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    limitations: Mapped[list] = mapped_column(JSON, default=list)
    findings_produced: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class ExecutionEvent(Base):
    __tablename__ = "execution_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    execution_id: Mapped[str | None] = mapped_column(String(40), index=True, nullable=True)
    stage: Mapped[str] = mapped_column(String(60))
    engine: Mapped[str] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(40), default="INFO")
    percent: Mapped[int] = mapped_column(Integer, default=0)
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class AttackPath(Base):
    __tablename__ = "attack_paths"
    id: Mapped[int] = mapped_column(primary_key=True)
    path_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. PATH-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    severity: Mapped[str] = mapped_column(String(20), default="high")
    composite_risk_score: Mapped[float] = mapped_column(Float, default=7.5)
    proof_state: Mapped[ProofState] = mapped_column(Enum(ProofState), default=ProofState.OBSERVATION_CONFIRMED)
    finding_ids: Mapped[list] = mapped_column(JSON, default=list)
    steps_json: Mapped[list] = mapped_column(JSON, default=list)
    narrative: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class RemediationTask(Base):
    __tablename__ = "remediation_tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    task_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. REM-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    title: Mapped[str] = mapped_column(String(300))
    owner: Mapped[str] = mapped_column(String(120), default="SecOps / Platform Engineering")
    priority: Mapped[str] = mapped_column(String(20), default="P1")
    status: Mapped[str] = mapped_column(String(30), default="open")
    fix_guidance: Mapped[str] = mapped_column(Text)
    verification_criteria: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

class RetestExecution(Base):
    __tablename__ = "retest_executions"
    id: Mapped[int] = mapped_column(primary_key=True)
    retest_exec_key: Mapped[str] = mapped_column(String(40), index=True)  # e.g. RTEX-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    remediation_task_id: Mapped[int | None] = mapped_column(ForeignKey("remediation_tasks.id"), nullable=True)
    retest_id: Mapped[int | None] = mapped_column(ForeignKey("retests.id"), nullable=True)
    status: Mapped[ExecutionStatus] = mapped_column(Enum(ExecutionStatus), default=ExecutionStatus.QUEUED)
    proof_state: Mapped[ProofState] = mapped_column(Enum(ProofState), default=ProofState.NOT_TESTED)
    evidence_artifact_id: Mapped[int | None] = mapped_column(ForeignKey("evidence_artifacts.id"), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.3 — Exploit Validation Engine (EVE) Canonical Database Entities
# Shared service architecture for TrePath 2.3 and Expedite Strike
# ==============================================================================

class EVEProofOutcome(str, enum.Enum):
    DISCOVERED = "DISCOVERED"
    OBSERVATION_CONFIRMED = "OBSERVATION_CONFIRMED"
    PRECONDITION_VALIDATED = "PRECONDITION_VALIDATED"
    EXPLOIT_ATTEMPTED = "EXPLOIT_ATTEMPTED"
    RUNTIME_REPRODUCED = "RUNTIME_REPRODUCED"
    CONFIRMED_UNAUTHORIZED_ACCESS = "CONFIRMED_UNAUTHORIZED_ACCESS"
    CONFIRMED_PRIVILEGE_ESCALATION = "CONFIRMED_PRIVILEGE_ESCALATION"
    IMPACT_VERIFIED = "IMPACT_VERIFIED"
    EXPLOITATION_FAILED = "EXPLOITATION_FAILED"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    OUT_OF_SCOPE_BLOCKED = "OUT_OF_SCOPE_BLOCKED"


class EVEJobStatus(str, enum.Enum):
    INGESTED = "INGESTED"
    ANALYZED = "ANALYZED"
    PLANNED_AWAITING_APPROVAL = "PLANNED_AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    STOPPED = "STOPPED"
    BLOCKED_OUT_OF_SCOPE = "BLOCKED_OUT_OF_SCOPE"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class EVEPlatformTier(str, enum.Enum):
    VULNERABILITY_DETECTED = "VULNERABILITY_DETECTED"
    EXPLOITABILITY_VALIDATED = "EXPLOITABILITY_VALIDATED"
    IMPACT_VERIFIED = "IMPACT_VERIFIED"
    REMEDIATION_VERIFIED = "REMEDIATION_VERIFIED"


class ExploitAdapterRecord(Base):
    __tablename__ = "exploit_adapter_registry"
    id: Mapped[int] = mapped_column(primary_key=True)
    adapter_id: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE-AUTH-001
    name: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80), index=True)
    priority_wave: Mapped[int] = mapped_column(Integer, default=1)  # 1 = First 5 core adapters, 2 = Extended 10 categories
    version: Mapped[str] = mapped_column(String(40), default="eve-adapter/2.3.0")
    safety_profile: Mapped[str] = mapped_column(String(60), default="READ_ONLY_DETERMINISTIC")
    requires_explicit_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    max_requests_limit: Mapped[int] = mapped_column(Integer, default=6)
    max_timeout_seconds: Mapped[int] = mapped_column(Integer, default=12)
    what_it_proves: Mapped[str] = mapped_column(Text, default="")
    supported_cwe_ids: Mapped[list] = mapped_column(JSON, default=list)
    supported_finding_prefixes: Mapped[list] = mapped_column(JSON, default=list)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitValidationJob(Base):
    __tablename__ = "exploit_validation_jobs"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE-JOB-00001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    asset_key: Mapped[str] = mapped_column(String(60), index=True, default="")
    effective_origin: Mapped[str] = mapped_column(String(512), default="")
    target_endpoint: Mapped[str] = mapped_column(String(2048), default="")
    service_name: Mapped[str] = mapped_column(String(120), default="http")
    service_port: Mapped[int] = mapped_column(Integer, default=80)
    vulnerability_class: Mapped[str] = mapped_column(String(80), index=True, default="general")
    adapter_id: Mapped[str] = mapped_column(String(60), index=True, default="EVE-AUTH-001")
    caller_service: Mapped[str] = mapped_column(String(60), default="trepath-2.3")  # trepath-2.3 | expedite-strike
    status: Mapped[str] = mapped_column(String(40), index=True, default=EVEJobStatus.INGESTED.value)
    current_stage: Mapped[int] = mapped_column(Integer, default=1)  # 1..9
    proof_outcome: Mapped[str] = mapped_column(String(60), index=True, default=EVEProofOutcome.DISCOVERED.value)
    platform_tier: Mapped[str] = mapped_column(String(60), default=EVEPlatformTier.VULNERABILITY_DETECTED.value)
    finding_decision: Mapped[str] = mapped_column(String(40), default="PENDING")  # CONFIRMED | REJECTED | DOWNGRADED | INCONCLUSIVE | BLOCKED
    scope_decision: Mapped[str] = mapped_column(String(40), default="IN_SCOPE")
    scope_evidence: Mapped[str] = mapped_column(Text, default="")
    validation_objective: Mapped[str] = mapped_column(Text, default="")
    permitted_actions_json: Mapped[dict] = mapped_column(JSON, default=dict)
    max_requests: Mapped[int] = mapped_column(Integer, default=5)
    max_execution_seconds: Mapped[int] = mapped_column(Integer, default=10)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    emergency_stopped: Mapped[bool] = mapped_column(Boolean, default=False)
    emergency_stop_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_confidence: Mapped[float] = mapped_column(Float, default=0.5)
    exploitability_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    impact_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    summary_decision: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitPrecondition(Base):
    __tablename__ = "exploit_preconditions"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    vulnerability_class: Mapped[str] = mapped_column(String(80))
    affected_technology: Mapped[str] = mapped_column(String(160), default="unknown")
    detected_version: Mapped[str | None] = mapped_column(String(80), nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cwe_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cve_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    in_cisa_kev: Mapped[bool] = mapped_column(Boolean, default=False)
    public_exploit_available: Mapped[bool] = mapped_column(Boolean, default=False)
    exploit_db_refs: Mapped[list] = mapped_column(JSON, default=list)
    required_auth_level: Mapped[str] = mapped_column(String(60), default="unauthenticated")
    required_privileges: Mapped[str] = mapped_column(String(60), default="none")
    network_reachable: Mapped[bool] = mapped_column(Boolean, default=True)
    mitigating_controls_detected: Mapped[list] = mapped_column(JSON, default=list)
    preconditions_satisfied: Mapped[bool] = mapped_column(Boolean, default=False)
    precondition_checks_json: Mapped[list] = mapped_column(JSON, default=list)
    exploitability_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_confidence: Mapped[float] = mapped_column(Float, default=0.5)
    rationale: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitExecutionApproval(Base):
    __tablename__ = "exploit_execution_approvals"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    approved_by_operator: Mapped[str] = mapped_column(String(160), default="secops-lead@expedite-consults.io")
    approval_status: Mapped[str] = mapped_column(String(40), default="APPROVED")  # APPROVED | REJECTED | REVOKED
    roe_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    safety_mode: Mapped[str] = mapped_column(String(60), default="READ_ONLY_DETERMINISTIC")
    max_requests_authorized: Mapped[int] = mapped_column(Integer, default=5)
    approval_token_sha256: Mapped[str] = mapped_column(String(64), index=True)
    approval_notes: Mapped[str] = mapped_column(Text, default="")
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitExecutionAttempt(Base):
    __tablename__ = "exploit_execution_attempts"
    id: Mapped[int] = mapped_column(primary_key=True)
    attempt_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE-ATT-00001
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    adapter_id: Mapped[str] = mapped_column(String(60), index=True)
    adapter_version: Mapped[str] = mapped_column(String(40), default="eve-adapter/2.3.0")
    approval_id: Mapped[int | None] = mapped_column(ForeignKey("exploit_execution_approvals.id"), nullable=True)
    worker_id: Mapped[str] = mapped_column(String(80), default="eve-safe-worker-01")
    execution_status: Mapped[str] = mapped_column(String(40), default="COMPLETED")
    requests_sent: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    expected_outcome: Mapped[str] = mapped_column(Text, default="")
    actual_outcome: Mapped[str] = mapped_column(Text, default="")
    reproduced_behavior: Mapped[bool] = mapped_column(Boolean, default=False)
    transcript_json: Mapped[dict] = mapped_column(JSON, default=dict)
    transcript_sha256: Mapped[str] = mapped_column(String(64), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitProofResult(Base):
    __tablename__ = "exploit_proof_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("exploit_execution_attempts.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    prior_proof_state: Mapped[str] = mapped_column(String(60))
    validated_proof_outcome: Mapped[str] = mapped_column(String(60), index=True)
    platform_tier: Mapped[str] = mapped_column(String(60))
    finding_decision: Mapped[str] = mapped_column(String(40))  # CONFIRMED | REJECTED | DOWNGRADED | INCONCLUSIVE
    prior_severity: Mapped[str] = mapped_column(String(20))
    recommended_severity: Mapped[str] = mapped_column(String(20))
    severity_changed: Mapped[bool] = mapped_column(Boolean, default=False)
    evidence_confidence: Mapped[float] = mapped_column(Float, default=0.8)
    exploitability_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    impact_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    proof_rationale: Mapped[str] = mapped_column(Text, default="")
    not_proven_boundary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitImpactResult(Base):
    __tablename__ = "exploit_impact_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("exploit_execution_attempts.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    impact_category: Mapped[str] = mapped_column(String(80), index=True)
    impact_established: Mapped[bool] = mapped_column(Boolean, default=False)
    security_boundary_crossed: Mapped[str] = mapped_column(String(160), default="NONE")
    unauthorized_access_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    auth_control_failure_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    authorization_bypass_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    privilege_escalation_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    sensitive_data_exposure_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    isolated_rce_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    controlled_ssrf_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    deterministic_injection_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    analytical_dos_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_criteria_json: Mapped[dict] = mapped_column(JSON, default=dict)
    impact_summary: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitEvidenceRecord(Base):
    __tablename__ = "exploit_evidence_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    evidence_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE-EVID-00001
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("exploit_execution_attempts.id"), index=True)
    original_finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    evidence_artifact_id: Mapped[int | None] = mapped_column(ForeignKey("evidence_artifacts.id"), nullable=True)
    asset_and_origin_identity: Mapped[str] = mapped_column(String(512))
    approved_scope_and_roe: Mapped[str] = mapped_column(Text)
    validation_adapter_and_version: Mapped[str] = mapped_column(String(120))
    test_timestamp: Mapped[str] = mapped_column(String(64))
    preconditions_json: Mapped[dict] = mapped_column(JSON, default=dict)
    execution_transcript_json: Mapped[dict] = mapped_column(JSON, default=dict)
    request_response_evidence_json: Mapped[dict] = mapped_column(JSON, default=dict)
    expected_vs_actual_json: Mapped[dict] = mapped_column(JSON, default=dict)
    execution_outcome: Mapped[str] = mapped_column(String(60))
    evidence_confidence: Mapped[float] = mapped_column(Float, default=0.8)
    exploitability_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    impact_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    sha256_evidence_digest: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    operator_or_approving_identity: Mapped[str] = mapped_column(String(160))
    sealed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitStateTransition(Base):
    __tablename__ = "exploit_state_transitions"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    stage_number: Mapped[int] = mapped_column(Integer)
    stage_name: Mapped[str] = mapped_column(String(80))
    from_state: Mapped[str] = mapped_column(String(60))
    to_state: Mapped[str] = mapped_column(String(60))
    rule_id: Mapped[str] = mapped_column(String(60))
    evidence_digest_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)
    rationale: Mapped[str] = mapped_column(Text, default="")
    transitioned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitCleanupRecord(Base):
    __tablename__ = "exploit_cleanup_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("exploit_execution_attempts.id"), index=True)
    adapter_id: Mapped[str] = mapped_column(String(60))
    artifacts_created_count: Mapped[int] = mapped_column(Integer, default=0)
    artifacts_removed_count: Mapped[int] = mapped_column(Integer, default=0)
    cleanup_status: Mapped[str] = mapped_column(String(40), default="CLEAN_VERIFIED_READ_ONLY")
    residual_state_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    cleanup_notes: Mapped[str] = mapped_column(Text, default="")
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitAuditEvent(Base):
    __tablename__ = "exploit_audit_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int | None] = mapped_column(ForeignKey("exploit_validation_jobs.id"), index=True, nullable=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    actor_identity: Mapped[str] = mapped_column(String(160), default="eve-orchestrator@trepath.local")
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    stage: Mapped[str] = mapped_column(String(60))
    severity: Mapped[str] = mapped_column(String(30), default="INFO")
    details_json: Mapped[dict] = mapped_column(JSON, default=dict)
    event_sha256: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.4 — Unified Finding Registry (XTRIKE SAST + TrePath + Expedite Strike + Noctis)
# ==============================================================================

class UnifiedFindingRecord(Base):
    __tablename__ = "unified_finding_registry"
    id: Mapped[int] = mapped_column(primary_key=True)
    unified_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. UFR-00001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), index=True)
    asset_key: Mapped[str] = mapped_column(String(60), index=True)
    effective_origin: Mapped[str] = mapped_column(String(512))
    endpoint_url: Mapped[str] = mapped_column(String(2048))
    # XTRIKE SAST Source-to-Sink Provenance
    xtrike_sast_finding_id: Mapped[str | None] = mapped_column(String(80), index=True, nullable=True)
    repository_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    commit_sha: Mapped[str | None] = mapped_column(String(64), nullable=True)
    vulnerable_file: Mapped[str | None] = mapped_column(String(512), nullable=True)
    vulnerable_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_to_sink_trace_json: Mapped[dict] = mapped_column(JSON, default=dict)
    proposed_sast_patch: Mapped[str] = mapped_column(Text, default="")
    # Expedite Strike & EVE Runtime Verification
    expedite_strike_job_key: Mapped[str | None] = mapped_column(String(60), nullable=True)
    admin_boundary_level: Mapped[str] = mapped_column(String(80), default="NOT_ADMIN_ROUTE")
    runtime_verification_state: Mapped[str] = mapped_column(String(60), default="OBSERVATION_CONFIRMED")
    platform_tier: Mapped[str] = mapped_column(String(60), default="VULNERABILITY_DETECTED")
    # 4-Track Scoring
    vulnerability_cvss: Mapped[float | None] = mapped_column(Float, nullable=True)
    configuration_control_priority: Mapped[float] = mapped_column(Float, default=0.0)
    reconnaissance_intelligence_priority: Mapped[float] = mapped_column(Float, default=0.0)
    exploitability_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    # RTEX & Noctis Closure
    remediation_task_key: Mapped[str | None] = mapped_column(String(60), nullable=True)
    retest_exec_key: Mapped[str | None] = mapped_column(String(60), nullable=True)
    remediation_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    security_closure_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    functional_regression_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    noctis_correlation_id: Mapped[str] = mapped_column(String(60), index=True)
    noctis_posture_state: Mapped[str] = mapped_column(String(60), default="OPEN_DETECTED")
    evidence_sha256: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.6 — RFC 6238 TOTP Two-Factor Authentication (2FA) & Backup Codes
# ==============================================================================

class UserTwoFactorConfig(Base):
    __tablename__ = "user_2fa_configs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    totp_secret: Mapped[str] = mapped_column(String(64))
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    backup_codes_json: Mapped[list] = mapped_column(JSON, default=list)
    verified_count: Mapped[int] = mapped_column(Integer, default=0)
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.12 — Developer Implementation Specification Logical Entities
# Preserves all existing identifiers and historical scan records while adding
# the 14 canonical Section 4 logical entities for AttackGraph 2.12, Noctis AI,
# EVE 3.1, RiskEngine 2.12, EvidenceCore 2.12, and RTEX 2.12.
# ==============================================================================

class AuthorizationRecord(Base):
    __tablename__ = "authorization_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    auth_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. AUTH-ROE-0001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int | None] = mapped_column(ForeignKey("scans.id"), index=True, nullable=True)
    tenant_id: Mapped[str] = mapped_column(String(80), index=True, default="TENANT-EXPEDITE-PROD")
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorized_by: Mapped[str] = mapped_column(String(160), default="ciso-approval@expedite-consults.io")
    scope_inclusion: Mapped[str] = mapped_column(String(40), default="IN_SCOPE")  # IN_SCOPE | OUT_OF_SCOPE
    exploitation_permission: Mapped[str] = mapped_column(String(60), default="CONTROLLED_VALIDATION_ALLOWED")  # PASSIVE_ONLY | CONTROLLED_VALIDATION_ALLOWED | DENIED
    allowed_adapter_families: Mapped[list] = mapped_column(JSON, default=list)
    max_requests_per_second: Mapped[int] = mapped_column(Integer, default=10)
    execution_quota: Mapped[int] = mapped_column(Integer, default=250)
    human_approval_required_for_high_impact: Mapped[bool] = mapped_column(Boolean, default=True)
    signature_sha256: Mapped[str] = mapped_column(String(64), index=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SecurityFindingRecord(Base):
    __tablename__ = "security_findings"
    id: Mapped[int] = mapped_column(primary_key=True)
    security_finding_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. SF-212-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    legacy_finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    tenant_id: Mapped[str] = mapped_column(String(80), index=True, default="TENANT-EXPEDITE-PROD")
    title: Mapped[str] = mapped_column(String(300))
    vulnerability_class: Mapped[str] = mapped_column(String(80), index=True)
    cwe_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cve_applicability_state: Mapped[str] = mapped_column(String(60), default="FIRST_PARTY_CODE_FLAW")  # CONFIRMED_APPLICABLE | BANNER_ONLY_UNVERIFIED | FIRST_PARTY_CODE_FLAW | NOT_APPLICABLE
    epistemic_category: Mapped[str] = mapped_column(String(60), default="CONFIRMED_FACT")  # CONFIRMED_FACT | INFERRED_CONCLUSION | SIMULATED_SCENARIO | UNVERIFIED_HYPOTHESIS
    execution_status: Mapped[str] = mapped_column(String(60), default="EXPLOITATION_ATTEMPTED")
    technical_outcome: Mapped[str] = mapped_column(String(60), default="IMPACT_VERIFIED")
    cvss_base_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    technical_security_risk: Mapped[float] = mapped_column(Float, default=0.0)
    business_exposure_risk: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_confidence: Mapped[float] = mapped_column(Float, default=0.95)
    remediation_state: Mapped[str] = mapped_column(String(60), default="REMEDIATION_VERIFIED")
    supporting_evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SourceProvenance(Base):
    __tablename__ = "source_provenance"
    id: Mapped[int] = mapped_column(primary_key=True)
    provenance_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. SRC-PROV-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    repository_url: Mapped[str] = mapped_column(String(512))
    branch: Mapped[str] = mapped_column(String(120), default="main")
    commit_sha_before: Mapped[str] = mapped_column(String(64), index=True)
    commit_sha_after: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    file_path: Mapped[str] = mapped_column(String(512))
    start_line: Mapped[int] = mapped_column(Integer, default=1)
    end_line: Mapped[int] = mapped_column(Integer, default=1)
    ast_source_expression: Mapped[str] = mapped_column(Text, default="")
    ast_sink_expression: Mapped[str] = mapped_column(Text, default="")
    sanitizer_present: Mapped[bool] = mapped_column(Boolean, default=False)
    sast_rule_id: Mapped[str] = mapped_column(String(60), default="PLG-001")
    dast_endpoint_url: Mapped[str] = mapped_column(String(1024), default="")
    sast_dast_correlation_confidence: Mapped[float] = mapped_column(Float, default=0.99)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AttackGraphNodeRecord(Base):
    __tablename__ = "attack_graph_nodes"
    id: Mapped[int] = mapped_column(primary_key=True)
    node_key: Mapped[str] = mapped_column(String(80), index=True)  # e.g. NODE-ASSET-LAB-01
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    node_type: Mapped[str] = mapped_column(String(60), index=True)  # ENTRY_ENDPOINT | IDENTITY_ROLE | VULNERABILITY_SINK | PRIVILEGE_BOUNDARY | DATA_CROWN_JEWEL
    label: Mapped[str] = mapped_column(String(255))
    origin: Mapped[str] = mapped_column(String(255), index=True)
    privilege_level: Mapped[str] = mapped_column(String(60), default="ROLE_CUSTOMER")
    is_chokepoint: Mapped[bool] = mapped_column(Boolean, default=False)
    blast_radius_score: Mapped[float] = mapped_column(Float, default=0.0)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AttackGraphEdgeRecord(Base):
    __tablename__ = "attack_graph_edges"
    id: Mapped[int] = mapped_column(primary_key=True)
    edge_key: Mapped[str] = mapped_column(String(80), index=True)  # e.g. EDGE-212-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    path_classification: Mapped[str] = mapped_column(String(40), index=True)  # OBSERVED_PATH | SIMULATED_PATH | VALIDATED_PATH
    source_node_key: Mapped[str] = mapped_column(String(80), index=True)
    destination_node_key: Mapped[str] = mapped_column(String(80), index=True)
    evidence_identifier: Mapped[str] = mapped_column(String(120), index=True)
    relationship_type: Mapped[str] = mapped_column(String(80))  # EXPLOITS_SINK | ESCALATES_PRIVILEGE | ACCESSES_TENANT_DATA | OBSERVED_SURFACE
    provenance_classification: Mapped[str] = mapped_column(String(60))  # EMPIRICAL_EVE_PROOF | SAST_DAST_CORRELATED | DIGITAL_TWIN_SIMULATION | PASSIVE_OBSERVATION
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95)
    validation_timestamp: Mapped[str] = mapped_column(String(64))
    supporting_artifact: Mapped[str] = mapped_column(String(255))
    inferred_only: Mapped[bool] = mapped_column(Boolean, default=False)
    promoted_to_validated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ValidationJobRecord(Base):
    __tablename__ = "validation_jobs"
    id: Mapped[int] = mapped_column(primary_key=True)
    validation_job_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE31-JOB-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), index=True)
    validation_domain: Mapped[str] = mapped_column(String(80), index=True)  # SQL_INJECTION | BOLA | BFLA | AUTH_WEAKNESS | SESSION_MGMT | API_SECURITY | BUSINESS_LOGIC | TENANT_ISOLATION | PRIVILEGE_BOUNDARY
    adapter_id: Mapped[str] = mapped_column(String(60), index=True)
    execution_status: Mapped[str] = mapped_column(String(60))  # EXECUTED | HELD_BY_ROE | PRECONDITION_NOT_MET | TEST_BLOCKED | TEST_NOT_APPLICABLE
    safe_rate_limit_rps: Mapped[int] = mapped_column(Integer, default=5)
    negative_control_included: Mapped[bool] = mapped_column(Boolean, default=True)
    destructive_actions_permitted: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ValidationResultRecord(Base):
    __tablename__ = "validation_results"
    id: Mapped[int] = mapped_column(primary_key=True)
    result_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE31-RES-0001
    validation_job_key: Mapped[str] = mapped_column(String(60), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    execution_status: Mapped[str] = mapped_column(String(60))  # EXECUTED | HELD_BY_ROE | BLOCKED
    technical_outcome: Mapped[str] = mapped_column(String(60))  # IMPACT_VERIFIED | EXPLOITABILITY_VALIDATED | EXPLOITATION_FAILED | OBSERVATION_CONFIRMED
    negative_control_outcome: Mapped[str] = mapped_column(String(60), default="PASSED_NEGATIVE_CONTROL")
    boundary_crossed: Mapped[str] = mapped_column(String(160), default="NONE")
    evidence_artifact_sha256: Mapped[str] = mapped_column(String(64), index=True)
    ed25519_signature_b64: Mapped[str] = mapped_column(Text, default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class RetestRecord(Base):
    __tablename__ = "retest_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    retest_record_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. RTEX212-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    remediation_state: Mapped[str] = mapped_column(String(60))  # REMEDIATION_VERIFIED | PARTIALLY_REMEDIATED | REGRESSION_REOPENED | WAF_MASKED_REJECTED
    commit_before: Mapped[str] = mapped_column(String(64))
    commit_after: Mapped[str] = mapped_column(String(64))
    waf_only_block_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    regression_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    sla_due_at: Mapped[str] = mapped_column(String(64))
    sla_status: Mapped[str] = mapped_column(String(40), default="WITHIN_SLA")
    evidence_t0_sha256: Mapped[str] = mapped_column(String(64))
    evidence_t1_sha256: Mapped[str] = mapped_column(String(64))
    closure_decision: Mapped[str] = mapped_column(String(60))  # CLOSED_VERIFIED | REMAINS_OPEN | REOPENED_ON_REGRESSION
    qualifies_for_risk_reduction: Mapped[bool] = mapped_column(Boolean, default=True)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class RiskSnapshotRecord(Base):
    __tablename__ = "risk_snapshots"
    id: Mapped[int] = mapped_column(primary_key=True)
    snapshot_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. RISK-212-T0
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    phase_label: Mapped[str] = mapped_column(String(40))  # T0_BASELINE | T1_POST_RTEX | T2_REGRESSION_CHECK
    technical_security_risk_10: Mapped[float] = mapped_column(Float)
    business_exposure_risk_10: Mapped[float] = mapped_column(Float)
    composite_trepath_risk_10: Mapped[float] = mapped_column(Float)
    max_cvss_reference: Mapped[float] = mapped_column(Float, default=8.6)
    banner_only_cve_count_excluded: Mapped[int] = mapped_column(Integer, default=3)
    third_party_observations_isolated: Mapped[bool] = mapped_column(Boolean, default=True)
    formula_documentation_json: Mapped[dict] = mapped_column(JSON, default=dict)
    trigger_evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SigningKeyRecord(Base):
    __tablename__ = "signing_keys"
    id: Mapped[int] = mapped_column(primary_key=True)
    key_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)  # e.g. trepath-ed25519-2026-q4-active
    algorithm: Mapped[str] = mapped_column(String(40), default="Ed25519 (RFC 8032)")
    public_key_pem: Mapped[str] = mapped_column(Text)
    public_key_fingerprint_sha256: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(40), default="ACTIVE")  # ACTIVE | ROTATED | REVOKED
    custody_provider: Mapped[str] = mapped_column(String(80), default="EvidenceCore-HSM-Enclave-v2.15")
    rotated_from_key_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revocation_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.15 — Section 5 Principal Database Entities (Completing All 19 Tables)
# Every entity is traceable to an assessment (scan_id), an asset (asset_id),
# and an authorization record (authorization_record_key).
# ==============================================================================

class OrganizationRecord(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. ORG-EXPEDITE-CONSULTS-01
    name: Mapped[str] = mapped_column(String(200), default="Expedite Consults Ltd")
    tenant_id: Mapped[str] = mapped_column(String(80), index=True, default="TENANT-EXPEDITE-PROD")
    scan_id: Mapped[int | None] = mapped_column(ForeignKey("scans.id"), index=True, nullable=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), default="AUTH-ROE-215-0001")
    governance_tier: Mapped[str] = mapped_column(String(60), default="ENTERPRISE_ASSURANCE_2_15")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class RolePermissionRecord(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    role_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. ROLE-SEC-ENG-ADMIN
    role_name: Mapped[str] = mapped_column(String(80), index=True)
    permissions_json: Mapped[list] = mapped_column(JSON, default=list)
    can_approve_high_impact_validation: Mapped[bool] = mapped_column(Boolean, default=False)
    scan_id: Mapped[int | None] = mapped_column(ForeignKey("scans.id"), index=True, nullable=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), default="AUTH-ROE-215-0001")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SensorRecord(Base):
    __tablename__ = "sensors"
    id: Mapped[int] = mapped_column(primary_key=True)
    sensor_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. SENSOR-XTRIKE-SAST-01
    sensor_name: Mapped[str] = mapped_column(String(120))
    sensor_family: Mapped[str] = mapped_column(String(60), index=True)  # SAST | DAST | EVE | PEVE | WEBPULSE | OTEL
    engine_version: Mapped[str] = mapped_column(String(40), default="2.15.0")
    deterministic_authority: Mapped[bool] = mapped_column(Boolean, default=True)
    scan_id: Mapped[int | None] = mapped_column(ForeignKey("scans.id"), index=True, nullable=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), default="AUTH-ROE-215-0001")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SensorExecutionRecord(Base):
    __tablename__ = "sensor_executions"
    id: Mapped[int] = mapped_column(primary_key=True)
    execution_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. SENS-EXEC-215-0001
    sensor_key: Mapped[str] = mapped_column(String(60), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), index=True, default="AUTH-ROE-215-0001")
    reconciliation_state: Mapped[str] = mapped_column(String(60), default="EXECUTED_WITH_FINDINGS")
    raw_observations_count: Mapped[int] = mapped_column(Integer, default=0)
    consolidated_findings_count: Mapped[int] = mapped_column(Integer, default=0)
    evidence_sha256: Mapped[str] = mapped_column(String(64), index=True)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExploitValidationRecord(Base):
    __tablename__ = "exploit_validations"
    id: Mapped[int] = mapped_column(primary_key=True)
    exploit_validation_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. EVE215-VAL-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), index=True, default="AUTH-ROE-215-0001")
    vulnerability_class: Mapped[str] = mapped_column(String(80), index=True)  # 10 required classes
    test_identifier: Mapped[str] = mapped_column(String(80), index=True)
    preconditions: Mapped[str] = mapped_column(Text)
    authorization_validation: Mapped[str] = mapped_column(String(120))
    execution_status: Mapped[str] = mapped_column(String(60))
    evidence_artifact_id: Mapped[str] = mapped_column(String(80))
    evidence_sha256: Mapped[str] = mapped_column(String(64), index=True)
    exploitability_result: Mapped[str] = mapped_column(String(80))
    impact_classification: Mapped[str] = mapped_column(String(120))
    cleanup_confirmation: Mapped[str] = mapped_column(String(160))
    failure_explanation: Mapped[str] = mapped_column(Text)
    environment_provenance: Mapped[str] = mapped_column(String(60), default="CONTROLLED_SANDBOX")  # LIVE_AUTHORIZED_TARGET | CONTROLLED_SANDBOX | SIMULATION
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ModelDecisionRecord(Base):
    __tablename__ = "model_decisions"
    id: Mapped[int] = mapped_column(primary_key=True)
    decision_key: Mapped[str] = mapped_column(String(60), unique=True, index=True)  # e.g. NOCTIS-DEC-215-0001
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("findings.id"), index=True, nullable=True)
    authorization_record_key: Mapped[str] = mapped_column(String(60), index=True, default="AUTH-ROE-215-0001")
    epistemic_classification: Mapped[str] = mapped_column(String(80), index=True)
    # 5 required ER-01 states:
    # FACT_OBSERVED_BY_SENSOR | FINDING_CONFIRMED_BY_DETERMINISTIC_VALIDATION |
    # AI_GENERATED_HYPOTHESIS | SIMULATED_ATTACK_PATH | VERIFIED_COMPROMISE
    deterministic_authority_engine: Mapped[str] = mapped_column(String(80))  # EVE 3.0 | PEVE 2.15 | AttackGraph 2.15 | RTEX 2.15 | EvidenceCore 2.15
    noctis_independently_declared: Mapped[bool] = mapped_column(Boolean, default=False)
    supporting_evidence_ids: Mapped[list] = mapped_column(JSON, default=list)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.95)
    rejected_hypothesis_explanation: Mapped[str] = mapped_column(Text, default="")
    human_approval_status: Mapped[str] = mapped_column(String(60), default="NOT_REQUIRED_READ_ONLY")
    claim_summary: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ==============================================================================
# TrePath 2.19.1 (TP219.1) — Canonical Data Models (Section 3.1 - 3.4)
# ReconciliationEngine, IndependentValidationEngine, BenchmarkIntegrityEngine, ReleaseIntegrityEngine
# ==============================================================================

class CanonicalEndpoint(Base):
    __tablename__ = "canonical_endpoints"
    __table_args__ = (
        UniqueConstraint("engagement_id", "canonical_url", "HTTP_method", name="uq_canonical_endpoint_engagement_identity"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    endpoint_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # e.g. CEP-65-0001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    asset_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. ASSET-00001
    canonical_url: Mapped[str] = mapped_column(String(2048), index=True)
    normalized_path: Mapped[str] = mapped_column(String(1024), default="/")
    http_method: Mapped[str] = mapped_column("HTTP_method", String(16), default="GET")
    discovered_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    discovery_source: Mapped[str] = mapped_column(String(80), default="WEBPULSE_2_19_1")
    reachability_status: Mapped[str] = mapped_column(String(60), default="REACHABLE_CANONICAL")  # REACHABLE_CANONICAL | EXCLUDED_STATIC_ASSET | EXCLUDED_REDIRECT_ALIAS | SUB_RESOURCE_MERGED
    endpoint_classification: Mapped[str] = mapped_column(String(60), default="PASSIVE_EXTERNAL_ENDPOINT")  # ACTIVE_LAB_ENDPOINT | PASSIVE_EXTERNAL_ENDPOINT | STATIC_ASSET | REDIRECT_ALIAS
    redirect_parent_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    exclusion_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    authorization_level: Mapped[str] = mapped_column(String(60), default="PASSIVE_OBSERVATION_ONLY")  # FULL_ACTIVE_ROE | PASSIVE_OBSERVATION_ONLY
    evidence_artifact_ids: Mapped[list] = mapped_column(JSON, default=list)
    inventory_version: Mapped[str] = mapped_column(String(40), default="TP219.1-INV-v1")


class FindingLineage(Base):
    __tablename__ = "finding_lineages"
    id: Mapped[int] = mapped_column(primary_key=True)
    lineage_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # e.g. LIN-65-0001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    observation_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. OBS-65-0001
    normalized_observation_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. NOBS-65-0001
    root_cause_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. RC-65-01
    finding_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. F-01
    directive_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. DIR-01
    retest_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. RTEX-VER-SQLI001
    closure_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)  # e.g. CLOSURE-F01-T1
    relationship_type: Mapped[str] = mapped_column(String(80), default="MANY_OBS_TO_ONE_ROOT_CAUSE_TO_DIRECTIVES")
    confidence: Mapped[float] = mapped_column(Float, default=0.99)
    evidence_references: Mapped[list] = mapped_column(JSON, default=list)
    created_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CanonicalEvidenceArtifact(Base):
    __tablename__ = "canonical_evidence_artifacts"
    id: Mapped[int] = mapped_column(primary_key=True)
    artifact_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # e.g. ART-65-0001
    engagement_id: Mapped[int] = mapped_column(ForeignKey("engagements.id"), index=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id"), index=True)
    artifact_type: Mapped[str] = mapped_column(String(80), index=True)  # T0_RAW_SENSOR | EVE_PEVE_VALIDATION | RTEX_RETEST | ATTACKGRAPH_RISK | SCOPE_ROE | VERIFIER_METADATA
    producer_engine: Mapped[str] = mapped_column(String(80), index=True)
    producer_version: Mapped[str] = mapped_column(String(40), default="2.19.1")
    content_sha256: Mapped[str] = mapped_column(String(64), index=True)
    signature_reference: Mapped[str] = mapped_column(String(128))
    parent_artifact_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    collection_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    evidence_classification: Mapped[str] = mapped_column(String(80), default="SEALED_PRIMARY_EVIDENCE")
    storage_location: Mapped[str] = mapped_column(String(1024))
    manifest_membership: Mapped[str] = mapped_column(String(80), default="INCLUDED_IN_CANONICAL_MANIFEST")
    verification_status: Mapped[str] = mapped_column(String(60), default="SHA256_AND_PARENT_HASH_VERIFIED")


class EngineVersionManifestRecord(Base):
    __tablename__ = "engine_version_manifests"
    id: Mapped[int] = mapped_column(primary_key=True)
    release_id: Mapped[str] = mapped_column(String(64), index=True)  # e.g. TP219.1
    engine_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # e.g. ENG-NOCTIS-AI
    engine_version: Mapped[str] = mapped_column(String(40))  # e.g. 2.19.1
    schema_version: Mapped[str] = mapped_column(String(64))  # e.g. Noctis-Schema-v2.19.1
    build_hash: Mapped[str] = mapped_column(String(64))
    dependency_versions: Mapped[dict] = mapped_column(JSON, default=dict)
    compatibility_policy: Mapped[str] = mapped_column(String(255))
    migration_reference: Mapped[str] = mapped_column(String(128))
    build_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    signature_reference: Mapped[str] = mapped_column(String(128))






