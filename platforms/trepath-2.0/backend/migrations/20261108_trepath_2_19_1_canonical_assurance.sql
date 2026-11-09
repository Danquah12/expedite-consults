-- ============================================================================
-- TREPATH 2.19.1 (TP219.1) — Canonical Data Models & Assurance Migration Script
-- Parent Release: TrePath 2.19 | Classification: Engineering / Security Assurance
-- Implements Section 3.1 - 3.4:
--   1. canonical_endpoints (CanonicalEndpoint)
--   2. finding_lineages (FindingLineage)
--   3. canonical_evidence_artifacts (EvidenceArtifact / CanonicalEvidenceArtifact)
--   4. engine_version_manifests (EngineVersionManifest)
-- ============================================================================

CREATE TABLE IF NOT EXISTS canonical_endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id VARCHAR(64) NOT NULL UNIQUE,
    engagement_id INTEGER NOT NULL REFERENCES engagements(id),
    scan_id INTEGER NOT NULL REFERENCES scans(id),
    asset_id VARCHAR(64) NOT NULL,
    canonical_url VARCHAR(2048) NOT NULL,
    normalized_path VARCHAR(1024) NOT NULL DEFAULT '/',
    HTTP_method VARCHAR(16) NOT NULL DEFAULT 'GET',
    discovered_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discovery_source VARCHAR(80) NOT NULL DEFAULT 'WEBPULSE_2_19_1',
    reachability_status VARCHAR(60) NOT NULL DEFAULT 'REACHABLE_CANONICAL',
    endpoint_classification VARCHAR(60) NOT NULL DEFAULT 'PASSIVE_EXTERNAL_ENDPOINT',
    redirect_parent_id VARCHAR(64),
    exclusion_reason VARCHAR(255),
    authorization_level VARCHAR(60) NOT NULL DEFAULT 'PASSIVE_OBSERVATION_ONLY',
    evidence_artifact_ids JSON NOT NULL DEFAULT '[]',
    inventory_version VARCHAR(40) NOT NULL DEFAULT 'TP219.1-INV-v1',
    CONSTRAINT uq_canonical_endpoint_engagement_identity UNIQUE (engagement_id, canonical_url, HTTP_method)
);

CREATE INDEX IF NOT EXISTS ix_canonical_endpoints_engagement_id ON canonical_endpoints(engagement_id);
CREATE INDEX IF NOT EXISTS ix_canonical_endpoints_scan_id ON canonical_endpoints(scan_id);
CREATE INDEX IF NOT EXISTS ix_canonical_endpoints_asset_id ON canonical_endpoints(asset_id);

CREATE TABLE IF NOT EXISTS finding_lineages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineage_id VARCHAR(64) NOT NULL UNIQUE,
    engagement_id INTEGER NOT NULL REFERENCES engagements(id),
    scan_id INTEGER NOT NULL REFERENCES scans(id),
    observation_id VARCHAR(64) NOT NULL,
    normalized_observation_id VARCHAR(64) NOT NULL,
    root_cause_id VARCHAR(64) NOT NULL,
    finding_id VARCHAR(64) NOT NULL,
    directive_id VARCHAR(64) NOT NULL,
    retest_id VARCHAR(64) NOT NULL,
    closure_id VARCHAR(64),
    relationship_type VARCHAR(80) NOT NULL DEFAULT 'MANY_OBS_TO_ONE_ROOT_CAUSE_TO_DIRECTIVES',
    confidence FLOAT NOT NULL DEFAULT 0.99,
    evidence_references JSON NOT NULL DEFAULT '[]',
    created_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_finding_lineages_engagement_id ON finding_lineages(engagement_id);
CREATE INDEX IF NOT EXISTS ix_finding_lineages_scan_id ON finding_lineages(scan_id);
CREATE INDEX IF NOT EXISTS ix_finding_lineages_finding_id ON finding_lineages(finding_id);
CREATE INDEX IF NOT EXISTS ix_finding_lineages_root_cause_id ON finding_lineages(root_cause_id);

CREATE TABLE IF NOT EXISTS canonical_evidence_artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artifact_id VARCHAR(64) NOT NULL UNIQUE,
    engagement_id INTEGER NOT NULL REFERENCES engagements(id),
    scan_id INTEGER NOT NULL REFERENCES scans(id),
    artifact_type VARCHAR(80) NOT NULL,
    producer_engine VARCHAR(80) NOT NULL,
    producer_version VARCHAR(40) NOT NULL DEFAULT '2.19.1',
    content_sha256 VARCHAR(64) NOT NULL,
    signature_reference VARCHAR(128) NOT NULL,
    parent_artifact_id VARCHAR(64),
    collection_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evidence_classification VARCHAR(80) NOT NULL DEFAULT 'SEALED_PRIMARY_EVIDENCE',
    storage_location VARCHAR(1024) NOT NULL,
    manifest_membership VARCHAR(80) NOT NULL DEFAULT 'INCLUDED_IN_CANONICAL_MANIFEST',
    verification_status VARCHAR(60) NOT NULL DEFAULT 'SHA256_AND_PARENT_HASH_VERIFIED'
);

CREATE INDEX IF NOT EXISTS ix_canonical_evidence_artifacts_engagement_id ON canonical_evidence_artifacts(engagement_id);
CREATE INDEX IF NOT EXISTS ix_canonical_evidence_artifacts_scan_id ON canonical_evidence_artifacts(scan_id);
CREATE INDEX IF NOT EXISTS ix_canonical_evidence_artifacts_content_sha256 ON canonical_evidence_artifacts(content_sha256);

CREATE TABLE IF NOT EXISTS engine_version_manifests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    release_id VARCHAR(64) NOT NULL,
    engine_id VARCHAR(64) NOT NULL UNIQUE,
    engine_version VARCHAR(40) NOT NULL,
    schema_version VARCHAR(64) NOT NULL,
    build_hash VARCHAR(64) NOT NULL,
    dependency_versions JSON NOT NULL DEFAULT '{}',
    compatibility_policy VARCHAR(255) NOT NULL,
    migration_reference VARCHAR(128) NOT NULL,
    build_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    signature_reference VARCHAR(128) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_engine_version_manifests_release_id ON engine_version_manifests(release_id);
