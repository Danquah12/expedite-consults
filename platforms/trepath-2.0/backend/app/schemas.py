from datetime import datetime
from typing import Any
from pydantic import BaseModel, EmailStr, Field, HttpUrl, ConfigDict
from .models import Role, ScanStatus, ProofState, ExecutionStatus, SelectionStatus

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: Role
    model_config = ConfigDict(from_attributes=True)

class EngagementIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    client_name: str = Field(min_length=2, max_length=200)

class EngagementOut(BaseModel):
    id: int
    name: str
    client_name: str
    status: str
    model_config = ConfigDict(from_attributes=True)

class RoeIn(BaseModel):
    approved: bool = False
    allowed_origins: list[str] = Field(min_length=1, max_length=25)
    allow_private_networks: bool = False
    max_requests: int = Field(default=30, ge=1, le=100)
    max_concurrency: int = Field(default=1, ge=1, le=3)
    profile: str = "read_only"

class ScanIn(BaseModel):
    engagement_id: int
    target_url: HttpUrl
    profile: str = "read_only"
    scan_depth: str = "deep_exhaustive"

class ScanOut(BaseModel):
    id: int
    engagement_id: int
    target_url: str
    status: ScanStatus
    profile: str
    model_config = ConfigDict(from_attributes=True)

class ScanEventItem(BaseModel):
    id: int
    timestamp: str
    percent: int
    stage: str
    engine: str
    message: str
    level: str = "info"

class ScanEventsOut(BaseModel):
    scan_id: int
    status: str
    percent: int
    stage: str
    events: list[ScanEventItem]

class FindingOut(BaseModel):
    id: int
    finding_key: str
    title: str
    description: str
    severity: str
    proof_state: ProofState
    cvss_score: float | None
    cve_id: str | None
    cwe_id: str | None
    remediation: str
    risk_priority: float
    model_config = ConfigDict(from_attributes=True)

class RetestIn(BaseModel):
    expected_state: str
    functional_test: str
    boundary_test: str

# ==============================================================================
# TrePath Assessment Orchestrator v1 Schemas
# ==============================================================================

class AssetOut(BaseModel):
    id: int
    asset_key: str
    engagement_id: int
    scan_id: int
    hostname: str
    target_url: str
    asset_type: str
    scheme: str
    primary_port: int
    open_ports: list[int]
    http_origins: list[str]
    services_json: dict[str, Any]
    model_config = ConfigDict(from_attributes=True)

class EndpointOut(BaseModel):
    id: int
    endpoint_key: str
    asset_id: int
    url: str
    canonical_signature: str
    method: str
    path: str
    surface_type: str
    functionality: str
    auth_required: bool
    parameters: list[str]
    input_types: list[str]
    sensitivity: str
    is_duplicate: bool
    model_config = ConfigDict(from_attributes=True)

class TechnologyOut(BaseModel):
    id: int
    tech_key: str
    asset_id: int
    name: str
    version: str | None
    category: str
    cpe: str | None
    banner: str | None
    is_outdated: bool
    confidence: float
    evidence_artifact_id: int | None
    model_config = ConfigDict(from_attributes=True)

class IntelligenceMatchOut(BaseModel):
    id: int
    asset_id: int
    technology_id: int | None
    finding_id: int | None
    cve_id: str | None
    cwe_id: str | None
    cwe_name: str | None
    cvss_score: float
    epss_score: float
    epss_percentile: float
    in_cisa_kev: bool
    exploit_maturity: str
    summary: str
    model_config = ConfigDict(from_attributes=True)

class TestDefinitionOut(BaseModel):
    id: int
    test_id: str
    name: str
    family: str
    target_feature: str
    risk_classification: str
    adapter_name: str
    supported: bool
    requires_auth: bool
    description: str
    model_config = ConfigDict(from_attributes=True)

class AssessmentPlanOut(BaseModel):
    id: int
    plan_key: str
    asset_id: int
    endpoint_id: int | None
    technology_id: int | None
    test_id: str
    test_family: str
    discovered_feature: str
    selection_status: SelectionStatus
    rationale: str
    priority: int
    model_config = ConfigDict(from_attributes=True)

class TestExecutionOut(BaseModel):
    execution_id: str
    asset_id: str
    test_id: str
    status: str
    status_code: ExecutionStatus
    proof_state: ProofState
    started_at: str | None
    completed_at: str | None
    evidence_ids: list[int]
    limitations: list[str]
    findings_produced: int

class AttackPathOut(BaseModel):
    id: int
    path_key: str
    asset_id: int
    title: str
    severity: str
    composite_risk_score: float
    proof_state: ProofState
    finding_ids: list[int]
    steps_json: list[dict[str, Any]]
    narrative: str
    model_config = ConfigDict(from_attributes=True)

class RemediationTaskOut(BaseModel):
    id: int
    task_key: str
    asset_id: int
    finding_id: int
    title: str
    owner: str
    priority: str
    status: str
    fix_guidance: str
    verification_criteria: str
    model_config = ConfigDict(from_attributes=True)

class DiscoveryIngestionIn(BaseModel):
    engagement_id: int
    target_url: HttpUrl
    discovered_urls: list[str] = Field(default_factory=list)
    port_findings: list[dict[str, Any]] = Field(default_factory=list)
    posture_findings: list[dict[str, Any]] = Field(default_factory=list)
    web_findings: list[dict[str, Any]] = Field(default_factory=list)
    nmap_findings: list[dict[str, Any]] = Field(default_factory=list)
    nuclei_findings: list[dict[str, Any]] = Field(default_factory=list)
