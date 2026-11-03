# TrePath 2.6 — Autonomous Attack-Path Validation, Target-Resolution Intelligence & Remediation Assurance Specification

> [!IMPORTANT]
> **TrePath 2.6 (`TP26-BUILD-20261102-AUTONOMOUS-ASSURANCE`)** resolves every **P0, P1, and P2** engineering directive from the **TrePath 2.5 – Scan #45 Technical Analysis**:
> 1. **Workstream 1 (P0 — Sections 3 & 4)**: Implemented the **6-Type Target-Resolution Intelligence Layer** (`REPOSITORY_URL`, `DOCUMENTATION_PAGE`, `TRAINING_LAB`, `DEPLOYED_APPLICATION`, `API_ENDPOINT`, `WEBSITE`) and **Per-Origin 4-Tier Authorization Matrix**, explicitly separating GitHub repository webpages and OWASP documentation pages from deployed application assessments.
> 2. **Workstream 5 (P0 — Section 12)**: Eliminated false `server.ts:118` SAST mappings on external black-box websites (`owasp.org`, `tryhackme.com`, `github.com`, `portswigger.net`, etc.) by gating XTRIKE source-code file bindings strictly on authorized source-attached targets (`is_source_attached_lab`) and enforcing 4-way provenance separation (`scanner_rule_location`, `finding_source_code_location`, `external_target_endpoint`, `evidence_artifact_location`).
> 3. **Workstream 4 (P1 — Sections 9A, 9B, 9C)**: Replaced flat `CVSS 5.5` across all missing-header findings (`F-01`–`F-12`) with **context-calibrated severity & CVSS** (`LOW 2.8–3.4` vs. `MEDIUM 4.3–4.8`) and a 4-stage **`Content-Security-Policy-Report-Only`** compatibility rollout plan.
> 4. **Workstream 1 & 2 (P1 — Sections 5 & 6)**: Added the **Granular 6-Sensor Execution Matrix** (version/policy, command/flags, covered vs. skipped endpoints, skip rationale) and separated **EVE Observation/Control Jobs (`EVE-TLS-001`)** from **Exploitability Validation Jobs** with a 4-state non-exploited outcome model (`NOT_APPLICABLE`, `BLOCKED_BY_ROE`, `EXPLOITATION_FAILED`, `EXECUTION_ERROR`).
> 5. **Workstream 3 (P1 — Section 7)**: Upgraded [`AttackGraph 2.6`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/attack_graph/__init__.py) to exclude compliant observations (`TLS-COMPLIANT-001`), prevent chaining unrelated passive observations into fake multi-step paths (`PATH-00024`), and track `broken_paths` and `continuous_attack_path_change_ledger`.

---

## 1. Workstream 1 (P0): Target-Resolution Intelligence Layer & Per-Origin Authorization Matrix

Implemented in [`classify_submitted_target_type()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/finding_normalizer.py#L44-L128) and [`build_consolidated_finding_intelligence()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/finding_normalizer.py#L1224-L1330):

| Target Classification Type | Canonical Code | Counted as Deployed App Assessment? | Required Scanner Behavior |
| :--- | :--- | :--- | :--- |
| **Source Repository Webpage** | `REPOSITORY_URL` | `False` | Classify as source-code hosting page (`github.com/...`); collapse multiple repo URLs to `1` reference origin or route to XTRIKE SAST clone. |
| **Project / Reference Documentation** | `DOCUMENTATION_PAGE` | `False` | Classify as informational/documentation web surface (`owasp.org/projects/...`, `genai.owasp.org`, `vwad.owasp.org`); do not claim deployed app assessment. |
| **Interactive Training Lab Portal** | `TRAINING_LAB` | `True` | Classify as external training platform web surface (`tryhackme.com`, `hackthebox.com`, `root-me.org`, `portswigger.net`, `pentesterlab.com`). |
| **Live Deployed Application** | `DEPLOYED_APPLICATION` | `True` | Classify as live deployed application instance (`google-gruyere.appspot.com`, `pentest-ground.com`, `127.0.0.1:3000`). |
| **REST / GraphQL API Surface** | `API_ENDPOINT` | `True` | Classify as structured API endpoint surface. |
| **General Public Website** | `WEBSITE` | `True` | Classify as general web origin under passive ROE. |

---

## 2. Workstream 5 (P0): External Black-Box vs. Source-Attached Lab Provenance Separation

Fixed in [`_match_xtrike_sast_for_finding()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/unified_platform.py#L147-L220) and [`sync_unified_finding_registry()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/unified_platform.py#L356-L378):

- **Root Cause Fixed**: Previously, any finding containing `"HEADER"` in its key/title matched `XTRIKE_SAST_CORRELATION_CATALOG["HEADER"]` (`server.ts:118`), causing third-party external websites (`owasp.org`, `github.com`, `tryhackme.com`) in Section 10.0 to display `server.ts:118`.
- **TrePath 2.6 Rule**: Source-code file locations (`routes/search.ts:23`, `routes/login.ts:34`, `server.ts:412`, `server.ts:265`, `server.ts:118`) are bound **only** when `is_source_attached_lab` is `True`. External black-box targets explicitly report:
  - `scanner_rule_location`: `trepath/finding_normalizer.py:HeaderPolicyEvaluator-2.6`
  - `finding_source_code_location`: `"N/A (External Black-Box Target — Source Not Attached)"`
  - `external_target_endpoint`: Canonical target URL
  - `evidence_artifact_location`: Sealed EvidenceCore artifact ID & SHA-256 digest

---

## 3. Workstream 3 (P1): AttackGraph 2.6 Causal Edge Provenance & Broken-Path Tracking

Implemented in [`evaluate_causal_edge_relationship()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/attack_graph/__init__.py#L31-L82) and [`build_attack_graph_intelligence_summary()`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/app/attack_graph/__init__.py#L85-L185):

- Compliant telemetry (`TLS-COMPLIANT-001`) is never included as an attack-path node.
- Unrelated co-located observations (e.g., pre-auth login form + Nmap header inspection + missing CSP in historical `PATH-00024`) are separated into `broken_paths` (`BROKEN_PATH_PRECONDITION_ABSENT`) rather than chained into a multi-step exploit path.

---

## 4. Verification & Generated Deliverables

- **Automated Pytest Suite**: `11/11` tests passing in [`test_trepath_eve_acceptance.py`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/tests/test_trepath_eve_acceptance.py) and [`test_trepath_2_4_acceptance.py`](file:///d:/Anti-gravity/expedite-consults/platforms/trepath-2.0/backend/tests/test_trepath_2_4_acceptance.py).
- **Updated PDF Reports**:
  - [trepath-post-exploitation-report-scan-45-v2.6.pdf](file:///C:/Users/asied/.gemini/antigravity/brain/b74eac86-cae5-4cb9-add4-602e2ef40dd7/trepath-post-exploitation-report-scan-45-v2.6.pdf)
  - [trepath-juice-shop-e2e-closure-report-v2.6.pdf](file:///C:/Users/asied/.gemini/antigravity/brain/b74eac86-cae5-4cb9-add4-602e2ef40dd7/trepath-juice-shop-e2e-closure-report-v2.6.pdf)
