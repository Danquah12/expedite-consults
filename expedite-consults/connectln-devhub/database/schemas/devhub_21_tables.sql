-- ConnectLn DevHub — Section 7: 21 Core Relational Database Tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  can_deploy_production BOOLEAN NOT NULL DEFAULT FALSE,
  can_access_prod_pii BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(140) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  github_id VARCHAR(100) NOT NULL UNIQUE,
  team_id UUID REFERENCES teams(id),
  status VARCHAR(32) NOT NULL DEFAULT 'Active',
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE developer_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(developer_id, role_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES developers(id),
  status VARCHAR(32) NOT NULL DEFAULT 'Active',
  target_release VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  github_repo_id VARCHAR(64) NOT NULL UNIQUE,
  full_name VARCHAR(180) NOT NULL,
  default_branch VARCHAR(64) NOT NULL DEFAULT 'main',
  webhook_secret_sha256 VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  branch_name VARCHAR(140) NOT NULL,
  head_sha VARCHAR(64) NOT NULL,
  ci_status VARCHAR(32) NOT NULL DEFAULT 'Passed',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  github_pr_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  source_branch VARCHAR(140) NOT NULL,
  target_branch VARCHAR(140) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  env_type VARCHAR(32) NOT NULL,
  url VARCHAR(255) NOT NULL,
  database_name VARCHAR(120) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'Provisioning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE environment_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  commit_sha VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE build_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  branch VARCHAR(140) NOT NULL,
  commit_sha VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  duration_sec INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE build_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
  artifact_uri TEXT NOT NULL,
  sha256_checksum VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_suites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(64) NOT NULL,
  framework VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
  commit_sha VARCHAR(64) NOT NULL,
  passed_cases INT NOT NULL,
  failed_cases INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
  test_code VARCHAR(64) NOT NULL,
  requirement_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  expected_result TEXT NOT NULL
);

CREATE TABLE security_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scan_type VARCHAR(64) NOT NULL,
  engine VARCHAR(120) NOT NULL,
  critical_count INT NOT NULL DEFAULT 0,
  high_count INT NOT NULL DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE security_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
  severity VARCHAR(32) NOT NULL,
  classification VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Open'
);

CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL UNIQUE,
  commit_sha VARCHAR(64) NOT NULL,
  approval_status VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES releases(id),
  environment_id UUID NOT NULL REFERENCES environments(id),
  deployed_by UUID REFERENCES developers(id),
  status VARCHAR(32) NOT NULL,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment_id UUID REFERENCES environments(id),
  severity VARCHAR(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  root_cause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_no BIGINT NOT NULL UNIQUE,
  actor_id UUID REFERENCES developers(id),
  action VARCHAR(120) NOT NULL,
  resource TEXT NOT NULL,
  prev_hash CHAR(64) NOT NULL,
  integrity_hash CHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
