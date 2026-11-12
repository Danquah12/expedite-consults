# ConnectLn DevHub — Standalone Engineering Control Plane (v1.0)

**ConnectLn DevHub** is a standalone Internal Developer Platform (IDP) and Engineering Control Plane built and deployed at its own dedicated URL (`https://connectln-devhub.vercel.app`), strictly separated from the live ConnectLn member platform (`https://conectln.com`).

## 1. Architecture & Separation Guarantee
- **ConnectLn Production (`https://conectln.com`):** Live professional networking application serving member profiles, connections, vouches, tickets, E2EE messaging, NoctisComms WebRTC, and Noctis CareerTwin.
- **ConnectLn DevHub (`https://connectln-devhub.vercel.app`):** Standalone engineering platform for source control governance, isolated ephemeral PR environments, database management, OpenAPI 3.1 contract testing, 10-layer automated testing, 8-pillar security scanning, dual-approved CI/CD release orchestration, DORA observability, AI engineering copilot, and SHA-256 hash-chained audit logging.
- **GitHub (`https://github.com/Danquah12/expedite-consults`):** Protected source repositories, feature/bugfix/hotfix branches, pull requests, and HMAC-SHA256 webhooks.

## 2. Repository Structure (Section 15)
```text
connectln-devhub/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # 14-Module Engineering Control Center UI
│   │   └── api/
│   │       ├── devhub/route.ts              # Control-Plane State & RBAC Action Engine
│   │       └── devhub/webhooks/github/      # HMAC-SHA256 GitHub Webhook Receiver
│   └── lib/
│       └── devhub-engine.ts                 # 21 DB Tables, 20 E2E Scenarios, 20 DevHub Gates
├── database/
│   └── schemas/devhub_21_tables.sql         # Full PostgreSQL DDL for 21 Core Tables
├── docs/                                    # All 12 Mandatory Delivery Documents (Section 18)
├── docker-compose.yml                       # Local Sandbox Orchestration
└── package.json
```
