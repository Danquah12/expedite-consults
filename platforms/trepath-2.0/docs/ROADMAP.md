# Delivery Roadmap

## Foundation included in this repository
- API, persistence models, JWT auth, roles
- Engagement and ROE workflow
- Explicit allowlist and destination IP safety check
- Read-only HTTP security-header posture scan
- Finding and evidence persistence
- SHA-256 integrity metadata and audit events
- Basic frontend health dashboard
- Docker Compose and initial tests

## Next implementation increments
1. Harden tenant model, invitations, MFA, RBAC and audit immutability.
2. Add background job queue, cancellation, concurrency controls and scan event stream.
3. Add crawler with robots/ROE-aware limits, sitemap and link discovery.
4. Add authenticated browser crawling using isolated Playwright workers and vault-managed credentials.
5. Add API schema import (OpenAPI), endpoint inventory and API security test adapters.
6. Add network discovery adapter behind explicit network ROE and isolated worker.
7. Add NVD/CISA KEV/OSV/GHSA ingestion with source provenance and freshness.
8. Add finding deduplication, CVSS validation and explainable prioritization.
9. Add analyst evidence review, export signing and immutable evidence manifests.
10. Add remediation guidance and controlled retest execution.
11. Add report generation and SARIF export.
12. Run independent security assessment, load tests, backup/restore and disaster-recovery exercises.

Do not activate invasive tests until authorization, safety classification, stop controls, test fixtures and acceptance tests exist.
