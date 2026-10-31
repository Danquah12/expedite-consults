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
    ATTACK_PATH_VALIDATED = "ATTACK_PATH_VALIDATED"
    RUNTIME_REPRODUCED = "RUNTIME_REPRODUCED"
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
