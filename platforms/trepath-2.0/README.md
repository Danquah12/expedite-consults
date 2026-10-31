# TrePath 2.0 — Greenfield Full-Platform Foundation

A runnable, safety-first foundation for an evidence-driven DAST and penetration-testing platform.
This repository is an initial executable MVP foundation, not a claim that every advanced scanner
or integration is complete.

## Included
- FastAPI backend with JWT authentication and role checks
- PostgreSQL persistence through SQLAlchemy
- Engagements, explicit Rules of Engagement (ROE), scans, findings, evidence and retests
- Scope enforcement for HTTP(S) targets, host allowlists, private-network policy and request budgets
- Read-only HTTP posture checks (security headers, HTTPS redirect, server banner)
- SHA-256 evidence integrity, metadata provenance and append-only audit records
- Explainable risk-priority calculation kept separate from CVSS
- React + TypeScript dashboard starter
- Docker Compose, migrations, API tests and CI workflow

## Important safety defaults
- Scans require an engagement with an approved ROE.
- Only explicitly allowlisted HTTP(S) origins may be scanned.
- Active/destructive tests are not implemented or enabled.
- The initial scanner performs low-impact GET/HEAD-style posture observations only.
- Private, loopback, link-local and reserved IP destinations are blocked by default.
- AI or scanner modules cannot override ROE enforcement.

## Quick start
1. Copy `.env.example` to `.env` and change `JWT_SECRET`.
2. Run `docker compose up --build`.
3. API: http://localhost:8000/docs
4. Frontend: http://localhost:5173

For local backend development:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

For frontend development:
```bash
cd frontend
npm install
npm run dev
```

## API outline
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/token`
- `POST /api/v1/engagements`
- `POST /api/v1/engagements/{id}/roe`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{id}`
- `GET /api/v1/scans/{id}/findings`
- `GET /api/v1/findings/{id}`
- `GET /api/v1/findings/{id}/evidence`
- `POST /api/v1/findings/{id}/retests`
- `GET /api/v1/scans/{id}/report/pdf`
- `GET /api/v1/scans/{id}/report/export`
- `GET /api/v1/health`

## Safe Lab PoC Exploitation & PDF Reporting (`authorized_pentest`)

### Enabling `authorized_pentest` ROE
1. Open the TrePath 2.0 UI and select your VMware lab target (`192.168.195.140`, `192.168.195.139`, or `192.168.195.130`).
2. Launch an assessment — the orchestrator configures the `authorized_pentest` Rules of Engagement profile for authorized lab targets.
3. Open the **Report & Post-Exploit** tab and click **Print / Download PDF Report (.pdf)** to download the full multi-page PDF report.

### Safe Lab PoC Adapters
| Test ID | Adapter Module | Description |
| :--- | :--- | :--- |
| `SMB-LIST-001` | `smb_share_probe.py` | Enumerates anonymous SMB shares (`IPC$`, `ADMIN$`, `C$`) over ports 139/445 without modifying state (`IMPACT_VERIFIED`). |
| `PHPINFO-001` | `phpinfo_probe.py` | Retrieves `/phpinfo.php` and verifies post-exploitation extraction of PHP runtime directives and `DOCUMENT_ROOT` (`IMPACT_VERIFIED`). |
| `TOMCAT-MGR-001` | `tomcat_manager_probe.py` | Probes Apache Tomcat Manager (`/manager/html` on port 8080) and verifies read-only administrative access (`IMPACT_VERIFIED`). |

> **Disclaimer**: All PoC exploitation and post-exploitation checks are strictly read-only and intended only for isolated lab environments.

## Current implementation boundaries
The included scan engine is intentionally limited to safe HTTP posture checks. It does not yet
perform injection, authentication bypass, exploit execution, fuzzing, or destructive validation.
Those engines should be added as isolated adapters with policy checks, test fixtures, explicit
approval gates and per-test evidence contracts.

The initial user-registration endpoint is suitable for a single-tenant development environment.
Before production, implement invitation-only provisioning, email verification, MFA, tenant-aware
authorization, secrets rotation, rate limiting, object-store encryption, backup/restore tests,
and an external security review.
