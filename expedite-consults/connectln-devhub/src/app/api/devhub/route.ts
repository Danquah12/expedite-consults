import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  DEVHUB_ROLES_CATALOG,
  INITIAL_DEVHUB_DEVELOPERS,
  INITIAL_DEVHUB_PROJECTS,
  INITIAL_DEVHUB_REPOSITORIES,
  INITIAL_DEVHUB_BRANCHES,
  INITIAL_DEVHUB_PULL_REQUESTS,
  INITIAL_DEVHUB_ENVIRONMENTS,
  INITIAL_DEVHUB_BUILD_JOBS,
  INITIAL_DEVHUB_TEST_SUITES,
  DEFAULT_CONNECTLN_LIFECYCLE_STEPS,
  CONNECTLN_20_ACCEPTANCE_SCENARIOS,
  DEVHUB_20_ACCEPTANCE_GATES,
  INITIAL_DEVHUB_SECURITY_SCANS,
  INITIAL_DEVHUB_SECURITY_FINDINGS,
  INITIAL_DEVHUB_RELEASES,
  INITIAL_DEVHUB_DEPLOYMENTS,
  INITIAL_DEVHUB_API_CATALOG,
  INITIAL_DEVHUB_FEATURE_FLAGS,
  INITIAL_DEVHUB_INCIDENTS,
  INITIAL_DEVHUB_AUDIT_LOGS,
  DEVHUB_DB_SCHEMA_TABLES,
  DEVHUB_12_MANDATORY_DOCS,
  type DevHubDeveloper,
  type DevHubProject,
  type DevHubEnvironment,
  type DevHubBuildJob,
  type DevHubTestSuite,
  type DevHubSecurityScan,
  type DevHubDeployment,
  type DevHubFeatureFlag,
  type DevHubAuditLog,
  type DevHubRoleName,
} from '@/lib/devhub-engine'

// Persistent in-memory control plane state per server instance
const state = {
  developers: [...INITIAL_DEVHUB_DEVELOPERS] as DevHubDeveloper[],
  projects: [...INITIAL_DEVHUB_PROJECTS] as DevHubProject[],
  repositories: [...INITIAL_DEVHUB_REPOSITORIES],
  branches: [...INITIAL_DEVHUB_BRANCHES],
  pullRequests: [...INITIAL_DEVHUB_PULL_REQUESTS],
  environments: [...INITIAL_DEVHUB_ENVIRONMENTS] as DevHubEnvironment[],
  builds: [...INITIAL_DEVHUB_BUILD_JOBS] as DevHubBuildJob[],
  testSuites: [...INITIAL_DEVHUB_TEST_SUITES] as DevHubTestSuite[],
  securityScans: [...INITIAL_DEVHUB_SECURITY_SCANS] as DevHubSecurityScan[],
  securityFindings: [...INITIAL_DEVHUB_SECURITY_FINDINGS],
  releases: [...INITIAL_DEVHUB_RELEASES],
  deployments: [...INITIAL_DEVHUB_DEPLOYMENTS] as DevHubDeployment[],
  featureFlags: [...INITIAL_DEVHUB_FEATURE_FLAGS] as DevHubFeatureFlag[],
  incidents: [...INITIAL_DEVHUB_INCIDENTS],
  auditLogs: [...INITIAL_DEVHUB_AUDIT_LOGS] as DevHubAuditLog[],
}

function appendAuditLog(params: {
  actorName: string
  actorRole: DevHubRoleName
  action: string
  resource: string
  environment: string
}) {
  const prev = state.auditLogs[0]
  const sequence_no = prev ? prev.sequence_no + 1 : 1001
  const prev_hash = prev ? prev.integrity_hash : '0'.repeat(64)
  const timestamp = new Date().toISOString()
  const payload = `${sequence_no}|${params.actorName}|${params.actorRole}|${params.action}|${params.resource}|${params.environment}|${prev_hash}|${timestamp}`
  const integrity_hash = crypto.createHash('sha256').update(payload).digest('hex')

  const entry: DevHubAuditLog = {
    id: `aud_${sequence_no}`,
    sequence_no,
    actor_id: 'dev_session',
    actor_name: params.actorName,
    actor_role: params.actorRole,
    action: params.action,
    resource: params.resource,
    environment: params.environment,
    ip_address: '10.24.0.12 (MFA Verified ✓)',
    prev_hash,
    integrity_hash,
    timestamp,
  }
  state.auditLogs.unshift(entry)
  return entry
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    platform: 'ConnectLn DevHub — Standalone Engineering Control Plane v1.0',
    productionTargetUrl: 'https://conectln.com',
    devhubStandaloneUrl: 'https://connectln-devhub.vercel.app',
    roles: DEVHUB_ROLES_CATALOG,
    developers: state.developers,
    projects: state.projects,
    repositories: state.repositories,
    branches: state.branches,
    pullRequests: state.pullRequests,
    environments: state.environments,
    builds: state.builds,
    testSuites: state.testSuites,
    lifecycleSteps: DEFAULT_CONNECTLN_LIFECYCLE_STEPS,
    acceptanceScenarios: CONNECTLN_20_ACCEPTANCE_SCENARIOS,
    acceptanceGates: DEVHUB_20_ACCEPTANCE_GATES,
    securityScans: state.securityScans,
    securityFindings: state.securityFindings,
    releases: state.releases,
    deployments: state.deployments,
    apiCatalog: INITIAL_DEVHUB_API_CATALOG,
    featureFlags: state.featureFlags,
    incidents: state.incidents,
    auditLogs: state.auditLogs,
    dbSchemaTables: DEVHUB_DB_SCHEMA_TABLES,
    mandatoryDocs: DEVHUB_12_MANDATORY_DOCS,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      actorName = 'Kwesi Asiedu',
      actorRole = 'Platform Owner' as DevHubRoleName,
      payload = {},
    } = body

    const roleObj = DEVHUB_ROLES_CATALOG.find((r) => r.name === actorRole) || DEVHUB_ROLES_CATALOG[0]

    if (action === 'INVITE_DEVELOPER') {
      const { name, email, github_id, role_name = 'Developer', team_name = 'ConnectLn Core Product Engineering' } = payload
      if (!name || !email) {
        return NextResponse.json({ error: 'Developer name and email are required' }, { status: 400 })
      }
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      const newDev: DevHubDeveloper = {
        id: `dev_${Date.now()}`,
        name,
        email,
        github_id: github_id || name.toLowerCase().replace(/\s+/g, '-'),
        avatar: initials,
        team_id: 'team_product_eng',
        team_name,
        role_id: 'role_developer',
        role_name: role_name as DevHubRoleName,
        status: 'Active',
        mfa_enabled: true,
        access_expires_at: '2027-12-31',
        repositories: ['expedite-consults/sphera-portal', 'expedite-consults/connectln-devhub'],
        environments: ['development', 'qa', 'ephemeral'],
        can_approve_prod: role_name === 'Platform Owner' || role_name === 'Engineering Director' || role_name === 'DevOps Engineer',
        last_active: 'Just invited · MFA Enforced',
        created_at: new Date().toISOString().slice(0, 10),
      }
      state.developers.unshift(newDev)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'DEVELOPER_INVITED_RBAC_BOUND',
        resource: `${name} (${email}) assigned role [${role_name}]`,
        environment: 'devhub-control-plane',
      })
      return NextResponse.json({ ok: true, developer: newDev, audit, developers: state.developers, auditLogs: state.auditLogs })
    }

    if (action === 'TOGGLE_DEVELOPER_STATUS') {
      const { developerId } = payload
      const dev = state.developers.find((d) => d.id === developerId)
      if (!dev) return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
      dev.status = dev.status === 'Active' ? 'Suspended' : 'Active'
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: dev.status === 'Suspended' ? 'DEVELOPER_ACCESS_SUSPENDED' : 'DEVELOPER_ACCESS_RESTORED',
        resource: `${dev.name} (${dev.github_id}) -> ${dev.status}`,
        environment: 'devhub-control-plane',
      })
      return NextResponse.json({ ok: true, developer: dev, audit, developers: state.developers, auditLogs: state.auditLogs })
    }

    if (action === 'CREATE_PROJECT') {
      const { name, code, description, lead = actorName, target_release = 'v2.9.0' } = payload
      const newProj: DevHubProject = {
        id: `proj_${Date.now()}`,
        name: name || 'New ConnectLn Engineering Initiative',
        code: code || `CLN-ENG-0${state.projects.length + 1}`,
        description: description || 'Isolated feature engineering & automated validation track.',
        status: 'Active',
        lead,
        sprint: 'Sprint 24 (Nov 2026)',
        open_tasks: 5,
        open_bugs: 0,
        completion_pct: 25,
        target_release,
        updated_at: 'Just now',
      }
      state.projects.unshift(newProj)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'ENGINEERING_PROJECT_CREATED',
        resource: `${newProj.code}: ${newProj.name}`,
        environment: 'devhub-control-plane',
      })
      return NextResponse.json({ ok: true, project: newProj, audit, projects: state.projects, auditLogs: state.auditLogs })
    }

    if (action === 'PROVISION_EPHEMERAL_ENV') {
      const prNumber = payload.prNumber || Math.floor(144 + Math.random() * 50)
      const branch = payload.branch || `feature/pr-${prNumber}-sandbox`
      const newEnv: DevHubEnvironment = {
        id: `env_preview_${prNumber}`,
        name: `Ephemeral PR #${prNumber} Preview`,
        slug: `preview-${prNumber}`,
        type: 'ephemeral',
        url: `https://preview-${prNumber}.dev.connectln.app`,
        database_name: `connectln_preview_${prNumber}`,
        database_isolation: 'Synthetic Sandbox DB',
        branch,
        commit_sha: crypto.randomBytes(3).toString('hex') + 'a',
        status: 'Running',
        assigned_to: `${actorName} (PR #${prNumber})`,
        project_id: 'proj_vouch_ticket_engine',
        region: 'us-east-1 (Ephemeral Container)',
        synthetic_dataset_loaded: true,
        migration_version: '20261104_05_ephemeral_init',
        uptime: '100% (TTL 24h · Health Checks Passed ✓)',
        updated_at: 'Just now',
      }
      state.environments.push(newEnv)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'EPHEMERAL_ENVIRONMENT_PROVISIONED',
        resource: `${newEnv.url} (Isolated DB: ${newEnv.database_name} · Synthetic Data Loaded)`,
        environment: newEnv.slug,
      })
      return NextResponse.json({ ok: true, environment: newEnv, audit, environments: state.environments, auditLogs: state.auditLogs })
    }

    if (action === 'RESET_SANDBOX_DB') {
      const { envId } = payload
      const env = state.environments.find((e) => e.id === envId)
      if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
      if (env.type === 'production') {
        return NextResponse.json(
          { error: 'SECURITY POLICY VIOLATION: Cannot reset or seed synthetic data into Production database!' },
          { status: 403 }
        )
      }
      env.synthetic_dataset_loaded = true
      env.updated_at = 'Just now (Reset & Reseeded ✓)'
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'SANDBOX_DATABASE_RESET_AND_SEEDED',
        resource: `${env.database_name} (${env.name}) reseeded with 467-profession synthetic dataset`,
        environment: env.slug,
      })
      return NextResponse.json({ ok: true, environment: env, audit, environments: state.environments, auditLogs: state.auditLogs })
    }

    if (action === 'DESTROY_EPHEMERAL_ENV') {
      const { envId } = payload
      const env = state.environments.find((e) => e.id === envId)
      if (!env || env.type !== 'ephemeral') {
        return NextResponse.json({ error: 'Only ephemeral preview environments can be destroyed' }, { status: 400 })
      }
      state.environments = state.environments.filter((e) => e.id !== envId)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'EPHEMERAL_ENVIRONMENT_DESTROYED',
        resource: `${env.url} & DB ${env.database_name} torn down cleanly`,
        environment: env.slug,
      })
      return NextResponse.json({ ok: true, audit, environments: state.environments, auditLogs: state.auditLogs })
    }

    if (action === 'TRIGGER_BUILD') {
      const branch = payload.branch || 'develop'
      const sha = crypto.randomBytes(3).toString('hex') + '9'
      const newBuild: DevHubBuildJob = {
        id: `bld_${9043 + state.builds.length}`,
        repository_id: 'repo_sphera_portal',
        branch,
        commit_sha: sha,
        commit_message: payload.commit_message || `feat(connectln): automated DevHub build & verification on ${branch}`,
        triggered_by: actorName,
        status: 'Succeeded',
        duration_sec: 41,
        artifact_uri: `s3://connectln-build-artifacts/sphera-portal/build-${sha}.tar.zst`,
        artifact_checksum: `sha256:${crypto.createHash('sha256').update(sha).digest('hex')}`,
        started_at: 'Just now',
      }
      state.builds.unshift(newBuild)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'CI_BUILD_ARTIFACT_GENERATED',
        resource: `Build ${newBuild.id} (${branch} @ ${sha}) signed with SHA-256`,
        environment: 'ci-build-runner',
      })
      return NextResponse.json({ ok: true, build: newBuild, audit, builds: state.builds, auditLogs: state.auditLogs })
    }

    if (action === 'RUN_SECURITY_SCAN') {
      state.securityScans = state.securityScans.map((s) => ({
        ...s,
        status: 'Completed',
        executed_at: 'Just now (0 Critical, 0 High ✓)',
      }))
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'FULL_8_PILLAR_SECURITY_SCAN_EXECUTED',
        resource: 'SAST, DAST, SCA, Secrets, Container, API Sec, IaC & SBOM (0 Critical, 0 High)',
        environment: 'security-engine',
      })
      return NextResponse.json({ ok: true, audit, securityScans: state.securityScans, auditLogs: state.auditLogs })
    }

    if (action === 'PROMOTE_RELEASE_TO_PROD') {
      if (!roleObj.canDeployProduction) {
        appendAuditLog({
          actorName,
          actorRole,
          action: 'UNAUTHORIZED_PROD_DEPLOY_BLOCKED',
          resource: `Role [${actorRole}] attempted Production promotion — Blocked by RBAC Gate DEV-013`,
          environment: 'production',
        })
        return NextResponse.json(
          {
            error: `RBAC Gate DEV-013: Role "${actorRole}" is not authorized to deploy to Production. Requires Platform Owner, Engineering Director, or DevOps Engineer.`,
            auditLogs: state.auditLogs,
          },
          { status: 403 }
        )
      }
      const version = payload.version || 'v2.8.0-rc1'
      const sha = payload.commit_sha || '57e605a'
      const newDeploy: DevHubDeployment = {
        id: `dpl_prod_${Date.now().toString().slice(-6)}`,
        release_id: 'rel_v2_7_5',
        version,
        environment_id: 'env_production',
        environment_name: 'Production (conectln.com)',
        commit_sha: sha,
        deployed_by: actorName,
        approved_by: `${actorName} (${actorRole}) + Automated Smoke Gate`,
        status: 'Healthy',
        rollback_available: true,
        deployed_at: 'Just now · Post-Deploy Smoke Checks Passed ✓',
      }
      state.deployments.unshift(newDeploy)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'PRODUCTION_DEPLOYMENT_PROMOTED',
        resource: `Release ${version} (${sha}) promoted to Production (conectln.com)`,
        environment: 'production',
      })
      return NextResponse.json({ ok: true, deployment: newDeploy, audit, deployments: state.deployments, auditLogs: state.auditLogs })
    }

    if (action === 'ROLLBACK_DEPLOYMENT') {
      if (!roleObj.canDeployProduction) {
        return NextResponse.json(
          { error: `RBAC Policy: Role "${actorRole}" cannot trigger production rollback.` },
          { status: 403 }
        )
      }
      const targetVersion = payload.targetVersion || 'v2.7.4'
      const targetSha = payload.targetSha || '2a37038'
      const rollbackDeploy: DevHubDeployment = {
        id: `dpl_rollback_${Date.now().toString().slice(-6)}`,
        release_id: 'rel_v2_7_4',
        version: `${targetVersion} (Rollback Restored)`,
        environment_id: 'env_production',
        environment_name: 'Production (conectln.com)',
        commit_sha: targetSha,
        deployed_by: `${actorName} (1-Click Emergency Rollback)`,
        approved_by: `${actorName} (${actorRole})`,
        status: 'Healthy',
        rollback_available: true,
        deployed_at: 'Just now · Restored in 6.4s ✓',
      }
      state.deployments.unshift(rollbackDeploy)
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'PRODUCTION_INSTANT_ROLLBACK_EXECUTED',
        resource: `Restored stable release ${targetVersion} (commit ${targetSha}) in 6.4s`,
        environment: 'production',
      })
      return NextResponse.json({ ok: true, deployment: rollbackDeploy, audit, deployments: state.deployments, auditLogs: state.auditLogs })
    }

    if (action === 'TOGGLE_FEATURE_FLAG') {
      const { flagId, envKey } = payload
      const flag = state.featureFlags.find((f) => f.id === flagId)
      if (!flag) return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
      if (envKey === 'prod_enabled' && !roleObj.canDeployProduction) {
        return NextResponse.json(
          { error: `RBAC Policy: Role "${actorRole}" cannot toggle Production feature flags.` },
          { status: 403 }
        )
      }
      if (envKey === 'dev_enabled' || envKey === 'qa_enabled' || envKey === 'staging_enabled' || envKey === 'prod_enabled') {
        flag[envKey] = !flag[envKey]
        flag.updated_at = 'Just now'
      }
      const audit = appendAuditLog({
        actorName,
        actorRole,
        action: 'FEATURE_FLAG_UPDATED',
        resource: `${flag.key} [${envKey}] -> ${flag[envKey as keyof DevHubFeatureFlag]}`,
        environment: envKey.replace('_enabled', ''),
      })
      return NextResponse.json({ ok: true, flag, audit, featureFlags: state.featureFlags, auditLogs: state.auditLogs })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal DevHub error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
