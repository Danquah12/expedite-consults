import enum
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Enum, Float
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


