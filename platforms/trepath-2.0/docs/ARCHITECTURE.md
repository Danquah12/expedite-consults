# TrePath 2.0 Architecture

## Runtime flow
1. Analyst creates an engagement.
2. Analyst records an explicit ROE with exact HTTP(S) origins and approval.
3. Scan request is checked against ROE and destination-address policy.
4. Read-only HTTP posture adapter runs.
5. Observations are stored as findings with explicit proof states.
6. Raw evidence bytes are stored by SHA-256 digest; metadata records collector and time.
7. Audit event records scan completion.
8. Analyst reviews findings and records a retest plan.

## Planned service boundaries
- API Gateway / Identity
- Engagement & ROE Service
- Scan Orchestrator
- Discovery Service
- DAST Adapter Runtime
- Vulnerability Intelligence Ingestion
- Finding Registry / Deduplication
- Evidence Core
- Risk Engine
- Retest & Remediation Service
- Reporting Service
- Integration Gateway

## Canonical proof states
DISCOVERED, OBSERVATION_CONFIRMED, CONTROL_GAP_CONFIRMED, ATTACK_PATH_VALIDATED,
RUNTIME_REPRODUCED, IMPACT_VERIFIED, REMEDIATION_VERIFIED, INCONCLUSIVE,
NOT_VULNERABLE, BLOCKED_BY_SCOPE, NOT_TESTED.

A mapping to ATT&CK or D3FEND is not evidence that a technique was executed or a control implemented.
