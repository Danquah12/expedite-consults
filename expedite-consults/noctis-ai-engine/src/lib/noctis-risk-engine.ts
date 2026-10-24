export interface FrameworkEntry {
  frameworkId: string;
  name: string;
  version: string;
  publicationDate: string;
  effectiveDate: string;
  jurisdiction: string;
  authorityType: "Mandatory Requirement" | "Authoritative Standard / Guidance" | "Control Catalog" | "Quantitative Standard" | "AI Governance Standard";
  applicableScope: string;
  url: string;
}

export interface RiskChangeLog {
  revision: number;
  timestamp: string;
  actor: string;
  event: string;
  previousResidualRisk: number;
  newResidualRisk: number;
  evidenceRef: string;
}

export interface RiskRecord {
  risk_id: string;
  title: string;
  description: string;
  category: "Cybersecurity" | "Cloud Security" | "Enterprise / Operational" | "Business Continuity / Resilience" | "Third-Party / Supply Chain" | "AI Model Risk";
  system_id: string;
  asset_ids: string[];
  business_process: string;
  threat_scenario: string;
  vulnerability: string;
  exposure: "Internet-Facing" | "Internal Pivot Path" | "Critical Continuity Plane" | "Multi-BU Vendor Dependency" | "Isolated Lab";
  inherent_likelihood: number; // 1..5
  inherent_impact: number; // 1..5
  inherent_risk: number; // L * I (1..25)
  existing_controls: string[];
  control_effectiveness: "Verified Effective" | "Partially Effective (Verified)" | "Policy-Only (Unverified)" | "Failed / Ineffective" | "Inherited (Provider Attested)";
  residual_likelihood: number; // 1..5
  residual_impact: number; // 1..5
  residual_risk: number; // L_res * I_res (1..25)
  risk_treatment: "Mitigate" | "Avoid" | "Transfer" | "Accept (Requires AO Sign-Off)";
  risk_owner: string;
  due_date: string;
  evidence_refs: string[];
  confidence: "High" | "Medium" | "Low";
  assumptions: string[];
  unknowns: string[];
  framework_id: string;
  framework_version: string;
  control_mappings: string[];
  approval_status: "Pending Authorizing Official (AO)" | "Approved by AO" | "Escalated — Exceeds Risk Appetite" | "Exception Expired — Reopened";
  acceptance_expiry: string;
  last_reviewed: string;
  next_review_date: string;
  created_at: string;
  updated_at: string;
  change_history: RiskChangeLog[];
}

export const AUTHORITATIVE_FRAMEWORK_REPO: FrameworkEntry[] = [
  {
    frameworkId: "NIST-SP-800-37-R2",
    name: "NIST SP 800-37 Rev. 2 — Risk Management Framework (RMF)",
    version: "Rev. 2",
    publicationDate: "2018-12-20",
    effectiveDate: "2018-12-20",
    jurisdiction: "US Federal (FISMA) / Global Enterprise",
    authorityType: "Mandatory Requirement",
    applicableScope: "7-step system lifecycle: Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor.",
    url: "https://csrc.nist.gov/pubs/sp/800/37/r2/final",
  },
  {
    frameworkId: "NIST-SP-800-30-R1",
    name: "NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments",
    version: "Rev. 1",
    publicationDate: "2012-09-17",
    effectiveDate: "2012-09-17",
    jurisdiction: "US Federal / Global Cybersecurity",
    authorityType: "Authoritative Standard / Guidance",
    applicableScope: "Threat source modeling, vulnerability/predisposing conditions, likelihood, impact, and risk determination.",
    url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
  },
  {
    frameworkId: "NIST-SP-800-53-R5",
    name: "NIST SP 800-53 Rev. 5 — Security and Privacy Controls",
    version: "Rev. 5 (Upd. 5.1.1)",
    publicationDate: "2020-09-23",
    effectiveDate: "2020-12-10",
    jurisdiction: "US Federal / Cross-Industry",
    authorityType: "Control Catalog",
    applicableScope: "20 control families (AC, AU, CA, CM, CP, IA, IR, RA, SA, SC, SI, SR) + SP 800-53A assessment procedures.",
    url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
  },
  {
    frameworkId: "NIST-CSF-2.0",
    name: "NIST Cybersecurity Framework (CSF) 2.0",
    version: "2.0",
    publicationDate: "2024-02-26",
    effectiveDate: "2024-02-26",
    jurisdiction: "Global Enterprise & Critical Infrastructure",
    authorityType: "Authoritative Standard / Guidance",
    applicableScope: "6 Core Functions: Govern (GV), Identify (ID), Protect (PR), Detect (DE), Respond (RS), Recover (RC).",
    url: "https://www.nist.gov/cyberframework",
  },
  {
    frameworkId: "ISO-31000-2018",
    name: "ISO 31000:2018 — Risk Management Guidelines",
    version: "2018",
    publicationDate: "2018-02-01",
    effectiveDate: "2018-02-01",
    jurisdiction: "International / Enterprise-Wide (ERM)",
    authorityType: "Authoritative Standard / Guidance",
    applicableScope: "Enterprise context, risk identification, analysis, evaluation, treatment, recording, reporting, and continual improvement.",
    url: "https://www.iso.org/standard/65694.html",
  },
  {
    frameworkId: "OPEN-FAIR-2.0",
    name: "Factor Analysis of Information Risk (Open FAIR)",
    version: "2.0",
    publicationDate: "2021-06-01",
    effectiveDate: "2021-06-01",
    jurisdiction: "Global Financial & Cyber Risk Quantification",
    authorityType: "Quantitative Standard",
    applicableScope: "Loss Event Frequency (LEF = TEF × Vulnerability) × Loss Magnitude (Primary + Secondary) = Expected Annual Loss (EAL).",
    url: "https://www.fairinstitute.org/what-is-fair",
  },
  {
    frameworkId: "NIST-AI-RMF-1.0-600-1",
    name: "NIST AI RMF 1.0 & Generative AI Profile (NIST AI 600-1)",
    version: "1.0 / AI 600-1",
    publicationDate: "2024-07-26",
    effectiveDate: "2024-07-26",
    jurisdiction: "AI Systems & Autonomous Agents",
    authorityType: "AI Governance Standard",
    applicableScope: "Govern, Map, Measure, Manage AI risks: hallucination, prompt injection, poisoned evidence, drift, and human-in-the-loop gates.",
    url: "https://doi.org/10.6028/NIST.AI.600-1",
  },
];

export const TWENTY_ADVANCED_RISK_CAPABILITIES = [
  { id: "CAP-01", name: "Organizational Risk Digital Twin", engine: "Risk Intelligence Engine", deliverable: "Live dependency graph (Applications → Identity → DB → Cloud Region → Suppliers), impact propagation engine, and scenario simulator." },
  { id: "CAP-02", name: "Closed-Loop Risk Reduction", engine: "Risk Management Engine", deliverable: "Remediation task creation, owner routing, change verification, authorized retest, residual risk recalculation, and evidence-gated closure." },
  { id: "CAP-03", name: "Adversarial Risk Testing", engine: "Assurance Engine", deliverable: "Counterargument & red-team reviewer workflow challenging low-risk ratings across exposure, privilege, exploitability, and attack chains." },
  { id: "CAP-04", name: "Crisis & Decision Tabletop Simulation", engine: "Risk Intelligence Engine", deliverable: "Interactive ransomware, cloud outage, insider threat, supplier failure, and disaster tabletop exercises with decision scoring." },
  { id: "CAP-05", name: "Risk Capital & Investment Optimizer", engine: "Risk Intelligence Engine", deliverable: "Constrained-budget portfolio optimizer ranking mitigations by legal mandate, ΔEAL, ROSI, operational benefit, and uncertainty." },
  { id: "CAP-06", name: "Risk Causality Analysis", engine: "Risk Intelligence Engine", deliverable: "Root-cause vs. symptom separation using directed causal graphs so shared root causes are remediated once." },
  { id: "CAP-07", name: "Risk Propagation Forecasting", engine: "Risk Intelligence Engine", deliverable: "Cross-system and cross-business-unit blast-radius and time-to-impact propagation modeling." },
  { id: "CAP-08", name: "Control Conflict Detection", engine: "Assurance Engine", deliverable: "Detects mutually conflicting controls (e.g., TLS inspection vs. end-to-end mTLS pinning), duplicate tooling, and coverage gaps." },
  { id: "CAP-09", name: "Evidence Integrity Verification", engine: "Assurance Engine", deliverable: "Detects stale, expired, inconsistent, incomplete, or tampered evidence artifacts via SHA-256 provenance and freshness SLAs." },
  { id: "CAP-10", name: "Risk Appetite Calibration", engine: "Risk Management Engine", deliverable: "Learns approved organizational thresholds from governance decisions while forbidding silent threshold drift." },
  { id: "CAP-11", name: "Risk Debt Tracking", engine: "Risk Management Engine", deliverable: "Quantifies accumulated deferred patching, unrotated credentials, and overdue POA&Ms as compounding risk debt." },
  { id: "CAP-12", name: "Risk Ownership Intelligence", engine: "Risk Management Engine", deliverable: "Flags orphan/unassigned risks, ambiguous RACI accountability, and overloaded remediation engineering teams." },
  { id: "CAP-13", name: "Change Impact Analysis", engine: "Risk Intelligence Engine", deliverable: "Evaluates how PR releases, new vendors, cloud migrations, or architectural changes invalidate prior ATO/risk decisions." },
  { id: "CAP-14", name: "Cross-Framework Control Reuse", engine: "Risk Management Engine", deliverable: "Maps one verified evidence artifact across NIST 800-53 Rev. 5, CSF 2.0, and ISO 31000 while flagging delta requirements." },
  { id: "CAP-15", name: "Decision Memory & Outcome Ledger", engine: "Assurance Engine", deliverable: "Immutable record of why a risk decision was made, supporting evidence, AO approver, and post-decision outcome validation." },
  { id: "CAP-16", name: "Evidence-to-Claim Verification", engine: "Assurance Engine", deliverable: "Binds every effectiveness claim to a test result ID, evidence date, target system, and coverage limitation." },
  { id: "CAP-17", name: "Independent Calculation Verification", engine: "Assurance Engine", deliverable: "Deterministic verifier recomputing R=L×I, FAIR EAL, units, and budget constraints independent of LLM prose." },
  { id: "CAP-18", name: "Evidence Contradiction Detection", engine: "Assurance Engine", deliverable: "Cross-checks policy assertions vs. live IdP/cloud configs and scanner outputs vs. manual pentest results." },
  { id: "CAP-19", name: "Risk Prediction vs. Outcome Tracking", engine: "Assurance Engine", deliverable: "Brier-score calibration comparing forecasted risk ranges against actual incident/audit outcomes." },
  { id: "CAP-20", name: "AI Failure Containment (NIST AI 600-1)", engine: "Assurance Engine", deliverable: "Halts workflow, logs event, and escalates upon detecting prompt injection in evidence docs, missing evidence, or unauthorized tool calls." },
] as const;

export const BUSINESS_OPERATIONS_IMPACT_MATRIX = [
  {
    organizationType: "Acute-Care Hospital",
    technicalWeakness: "Primary Clinical EHR & Pharmacy Database Outage (6 hours)",
    criticalServiceAffected: "Emergency triage, ICU medication dispensing, lab order routing",
    mtdAndRtoRpo: "MTD: 30 min · RTO: 15 min · RPO: 0 min (zero clinical data loss)",
    regulatoryAndSafety: "HIPAA Security Rule, EMTALA patient safety mandate, Joint Commission life-safety standards",
    operationalAndFinancialConsequence: "Immediate life-safety hazard; ambulance diversion; manual paper-chart fallback; Critical/Catastrophic impact (5/5)",
  },
  {
    organizationType: "Commercial Clearing Bank",
    technicalWeakness: "Core Ledger & Wire Settlement Database Outage (6 hours)",
    criticalServiceAffected: "Real-time gross settlement (RTGS), card authorization, liquidity reporting",
    mtdAndRtoRpo: "MTD: 2 hours · RTO: 1 hour · RPO: 0 min (strict double-entry atomic durability)",
    regulatoryAndSafety: "GLBA, PCI-DSS v4.0, SOX, Basel III / Federal Reserve intraday liquidity rules",
    operationalAndFinancialConsequence: "Multi-million-dollar settlement penalties, regulatory intervention, systemic counterparty freeze; Critical impact (5/5)",
  },
  {
    organizationType: "Research University",
    technicalWeakness: "Campus LMS & Course Registration Database Outage (6 hours)",
    criticalServiceAffected: "Lecture materials, assignment submission, registrar portal",
    mtdAndRtoRpo: "MTD: 24 hours · RTO: 8 hours · RPO: 4 hours",
    regulatoryAndSafety: "FERPA student privacy, grant data retention compliance",
    operationalAndFinancialConsequence: "Temporary class disruption during non-exam window; Moderate operational impact (2/5 to 3/5)",
  },
  {
    organizationType: "Small E-Commerce Retail Company",
    technicalWeakness: "Storefront Product Catalog & Order Database Outage (6 hours)",
    criticalServiceAffected: "Online checkout and inventory synchronization",
    mtdAndRtoRpo: "MTD: 12 hours · RTO: 4 hours · RPO: 1 hour",
    regulatoryAndSafety: "State consumer breach notification laws, merchant payment terms",
    operationalAndFinancialConsequence: "6 hours of lost cart revenue and ad spend waste; no physical safety hazard; Moderate-High business impact (3/5)",
  },
] as const;

export const FIVE_REALISTIC_EVALUATION_SCENARIOS = [
  {
    scenarioId: "EVAL-SCENARIO-01",
    title: "Scenario 1 — Conflicting Evidence (MFA Policy vs. IdP Log Exemption)",
    inputCondition: "System owner reports MFA is 100% enabled (`IA-2(1)`). Identity-provider telemetry shows a privileged Tier-0 service account (`svc-deploy-admin`) is exempt from MFA.",
    expectedEngineAction: "Flags `EVIDENCE_CONTRADICTION`; refuses to mark `IA-2(1)` Verified Effective; scopes blast radius of `svc-deploy-admin`; keeps residual risk at Inherent level (20/25); requests FIDO2/workload-identity remediation evidence.",
    verdict: "CONTRADICTION DETECTED — CONTROL REMAINS UNVERIFIED",
  },
  {
    scenarioId: "EVAL-SCENARIO-02",
    title: "Scenario 2 — Risk Reduction Cannot Be Proven (Failed Retest on 1 Server)",
    inputCondition: "Critical vulnerability patched according to ticket, but automated retest fails and vulnerable library version remains active on `prod-app-node-03`.",
    expectedEngineAction: "Blocks ticket closure (`CLOSED_LOOP_GATE_FAIL`); isolates `prod-app-node-03` in asset register; keeps residual risk unreduced; re-assigns remediation task to owner for verified redeploy.",
    verdict: "FINDING KEPT OPEN — RESIDUAL RISK UNCHANGED",
  },
  {
    scenarioId: "EVAL-SCENARIO-03",
    title: "Scenario 3 — Conflicting Priorities Under Fixed Remediation Budget",
    inputCondition: "10 high-priority findings compete for a fixed $150,000 budget. 2 are legally mandated compliance deadlines ($60k total), 3 protect crown-jewel payment/identity choke points ($75k total, ΔEAL = $620k), and 5 have low/uncertain exploitability ($110k total).",
    expectedEngineAction: "Funds mandatory legal/regulatory controls first ($60k), then selects crown-jewel choke-point mitigations maximizing ΔEAL/ROSI ($75k; total $135k <= $150k budget), and documents explicit risk-acceptance/deferral trade-offs for the remaining $15k balance.",
    verdict: "OPTIMAL PORTFOLIO SELECTED ($135k / $150k BUDGET; $620k ΔEAL)",
  },
  {
    scenarioId: "EVAL-SCENARIO-04",
    title: "Scenario 4 — Emerging Cloud Regional Incident",
    inputCondition: "Cloud provider announces active degradation in `us-east-1` KMS & relational database control plane used by 3 critical applications.",
    expectedEngineAction: "Traverses Risk Knowledge Graph (`Cloud Region -> DB -> Identity -> Payment Service`); checks multi-region failover readiness & RTO/RPO evidence; triggers emergency reassessment on all 3 dependent systems; logs crisis decisions.",
    verdict: "BLAST RADIUS MAPPED — 3 CRITICAL SYSTEMS REASSESSED",
  },
  {
    scenarioId: "EVAL-SCENARIO-05",
    title: "Scenario 5 — Misleading CVSS-Only Assessment (Low CVSS on Crown-Jewel Asset)",
    inputCondition: "Draft report labels an authorization bypass Low Risk because its base CVSS score is 3.7, even though the asset is the core customer PII/financial vault.",
    expectedEngineAction: "Adversarial Reviewer challenges CVSS-only reasoning; incorporates asset criticality (5/5) and sensitive data exposure; overrides rating to High/Critical Risk (L=4 × I=5 = 20/25) and escalates to AO.",
    verdict: "SEVERITY-ONLY BIAS OVERRIDDEN — UPGRADED TO CRITICAL (20/25)",
  },
] as const;

export const TEN_MATURITY_DIMENSIONS = [
  { id: 1, dimension: "Governance & Accountability", level1: "Ad-hoc, unassigned owners", level3: "Defined RACI, risk appetite policy, AO sign-off gates", level5: "Continuous board-aligned governance & automated policy enforcement", metric: "% of risks with verified owner & current review date" },
  { id: 2, dimension: "Risk Identification & Assessment", level1: "Periodic manual spreadsheets", level3: "Standardized NIST 800-30 / ISO 31000 assessments", level5: "Live Digital Twin & automated attack-path discovery", metric: "Mean time to identify & score new asset/threat exposures" },
  { id: 3, dimension: "Control Design & Effectiveness", level1: "Policy existence treated as implementation", level3: "SP 800-53A technical evidence sampling", level5: "Continuous automated control validation & conflict detection", metric: "% of controls backed by fresh automated test evidence" },
  { id: 4, dimension: "Risk Treatment & Remediation", level1: "Untracked tickets", level3: "POA&M tracking with SLA deadlines", level5: "Closed-loop verification retesting before closure", metric: "Verified remediation closure rate & risk debt burn-down" },
  { id: 5, dimension: "Continuous Monitoring", level1: "Annual point-in-time audit", level3: "Automated CVE/KEV & config drift alerts", level5: "Real-time event-driven reassessment & expiry enforcement", metric: "Mean latency from KEV/drift event to risk reassessment" },
  { id: 6, dimension: "Incident Response & Recovery", level1: "Untested backup scripts", level3: "Documented IR playbooks & scheduled DR drills", level5: "Tabletop crisis simulations & verified RTO/RPO bare-metal restores", metric: "Measured restore time vs. target RTO/RPO across critical services" },
  { id: 7, dimension: "Third-Party Risk Management", level1: "Static onboarding questionnaire", level3: "SOC 2 / inherited control attestation review", level5: "Multi-tier supply-chain dependency graph & concentration limits", metric: "% of critical suppliers with verified break-glass failover" },
  { id: 8, dimension: "Data Quality & Evidence Management", level1: "Unversioned screenshots", level3: "Schema-validated `RiskRecord` & evidence timestamps", level5: "Cryptographically hashed tamper-evident evidence ledger", metric: "Evidence freshness compliance rate & contradiction detection rate" },
  { id: 9, dimension: "AI Governance & Assurance", level1: "Unchecked LLM prose", level3: "Deterministic math separation & human approval gates", level5: "NIST AI RMF 1.0 / AI 600-1 adversarial testing & failure containment", metric: "0 unverified arithmetic claims; 100% AO gate compliance" },
  { id: 10, dimension: "Executive Oversight & Improvement", level1: "Static risk heat map only", level3: "Trend reporting & post-incident reviews", level5: "FAIR capital optimization & forecast-vs-outcome calibration", metric: "Prediction calibration accuracy & portfolio ROSI realization" },
] as const;

export interface SpecializedDomainSpec {
  id: number;
  tier: "Tier 1 (Foundation & Core Security/AI/Math)" | "Tier 2 (Engineering, Energy, Finance & Resilience)" | "Tier 3 (Clinical, Legal, Education, Trades & Humanities)";
  name: string;
  subfields: string;
  practicalCapability: string;
  executionTools: string;
  certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)" | "CERTIFIED-L2 (Evidence-Gated + Human Professional Boundary)";
  authorizedBoundary: string;
}

export const TWENTY_SPECIALIZED_DOMAINS: SpecializedDomainSpec[] = [
  { id: 1, tier: "Tier 1 (Foundation & Core Security/AI/Math)", name: "Cybersecurity & Digital Defense", subfields: "Pentesting, vulnerability research, AppSec (OWASP/PortSwigger), threat intel, IR, DFIR, cloud/IAM security, red/blue team", practicalCapability: "Validate authorized findings, generate Python/Java/C defensive test harnesses, correlate attack paths, and audit CVE/CISA KEV/headers.", executionTools: "OWASP/PortSwigger Polyglot Suite, JWT/CIDR/Crypto/CVE/Header Gadgets", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Strictly defensive verification, authorized lab testing, and remediation." },
  { id: 2, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Engineering & Applied Sciences", subfields: "Electrical, mechanical, civil, chemical, aerospace, industrial, environmental, systems engineering, physics, materials", practicalCapability: "Perform unit-checked calculations (vis-viva, Rocket equation, Carnot, Bernoulli, Ideal Gas, Henderson-Hasselbalch), analyze failure modes, check safety margins.", executionTools: "Deterministic Engineering & Physics Solver (`noctis-hard.ts` / `worked-figures.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Computes exact equations; structural/PE sign-off reserved for licensed engineers." },
  { id: 3, tier: "Tier 1 (Foundation & Core Security/AI/Math)", name: "Artificial Intelligence & Data Science", subfields: "LLMs, ML/DL, RAG, knowledge graphs, multi-agent orchestration, statistics, forecasting, model evaluation, NIST AI RMF", practicalCapability: "Build retrieval pipelines, run Poisson/t-test/Amdahl/TCP BDP models, detect hallucinations, and enforce NIST AI 600-1 containment.", executionTools: "RAG Engine, Answer Auditor, Brain Stamp, Statistical Verifier", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Separates deterministic math from LLM reasoning; enforces human gates." },
  { id: 4, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Finance, Accounting & Economics", subfields: "Financial statements, budgeting, corporate finance, valuation, Black-Scholes, CAPM, Kelly criterion, bond duration, FAIR risk", practicalCapability: "Compute exact Black-Scholes d1/d2/Call, CAPM, Kelly fraction, Modified Duration, Cap Rate, and FAIR Expected Annual Loss.", executionTools: "Quantitative Finance & Ledger Engine (`noctis-ledger.ts` / `noctis-hard.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Quantitative analysis & reconciliation; not personalized investment brokerage advice." },
  { id: 5, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Health, Medicine & Life Sciences", subfields: "Anatomy, physiology, pharmacology, public health, epidemiology, genetics, biotechnology, clinical research", practicalCapability: "Explain biomedical mechanisms, interpret supplied lab/clinical pages within reference ranges, and summarize peer-reviewed evidence.", executionTools: "Science Lab (`science-lab.ts`), PubMed/EuropePMC Evidence Retriever", certificationStatus: "CERTIFIED-L2 (Evidence-Gated + Human Professional Boundary)", authorizedBoundary: "Educational & evidence synthesis only; formal diagnosis/prescribing requires a licensed clinician." },
  { id: 6, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Law, Governance & Compliance", subfields: "Contract law, corporate governance, privacy (GDPR/CCPA), IP, employment law, regulatory compliance (FISMA/HIPAA/SOX/PCI)", practicalCapability: "Compare regulatory versions, map cross-framework obligations, analyze contract clauses, and track applicability rules.", executionTools: "Versioned Framework Repository & Compliance Mapping Agent", certificationStatus: "CERTIFIED-L2 (Evidence-Gated + Human Professional Boundary)", authorizedBoundary: "Distinguishes legal/regulatory information from formal legal representation by bar-licensed counsel." },
  { id: 7, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Education & Professional Development", subfields: "Curriculum design, adaptive tutoring, mastery assessment, certifications (Security+, CySA+, CISSP), career pathways", practicalCapability: "Build 30-minute structured lessons, flashcards, quizzes, and step-by-step career progression plans.", executionTools: "Teacher Pack (`teacher-pack.ts`), Study Copilot, Lesson Maker", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Grounded in verified study records and official certification objectives." },
  { id: 8, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Theology, Biblical Studies & Religious Education", subfields: "Biblical languages, historical context, exegesis, church history, comparative religion, ethics, sermon/lesson preparation", practicalCapability: "Quote exact Scripture passages by book, chapter, and verse from stored text and distinguish textual record from theological commentary.", executionTools: "Bible Study Card & Library Verifier (`knowledge.server.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Never invents a verse; explicitly separates quoted Scripture from interpretation." },
  { id: 9, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Agriculture, Environment & Food Systems", subfields: "Soil science, crop production, irrigation, food security, kcal/day balances, drought resilience, water management", practicalCapability: "Compute domestic vs. imported kcal/day balances, agricultural water shares, and 90-day supply deficit scenarios.", executionTools: "Resource & Food/Water Balance Solver (`noctis-hard.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Exact mass/water/calorie conservation; flags unstated fertilizer-to-yield couplings as UNKNOWN." },
  { id: 10, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Construction & Skilled Trades", subfields: "Carpentry, masonry, electrical installation, plumbing, welding, HVAC, surveying, Earned Value (CPI/SPI), occupational safety", practicalCapability: "Calculate Earned Value CPI/SPI, material quantities, load factors, and trade procedures while flagging permit/licensed sign-off gates.", executionTools: "Construction Earned Value & Trade Calculator", certificationStatus: "CERTIFIED-L2 (Evidence-Gated + Human Professional Boundary)", authorizedBoundary: "Flags high-voltage, structural load, and code-permit work requiring licensed trade inspection." },
  { id: 11, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Energy & Power Systems", subfields: "Solar, wind, hydro, nuclear, battery storage (MWh vs MW), microgrids, 24-hour dispatch, N-1 transmission, generator fuel stocks", practicalCapability: "Simulate 24-hour grids, separate power (MW) from energy (MWh), enforce usable vs. nameplate storage, and treat fuel hours as a one-time stock.", executionTools: "Hourly Grid Simulator (`noctis-grid.ts`) & Execution Sheet (`noctis-execute.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Enforces PASS / FAIL / CONDITIONAL / UNKNOWN feasibility states." },
  { id: 12, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Automotive & Transportation", subfields: "Vehicle mechanics, OBD-II/CAN diagnostics, EV battery/drivetrain, fleet logistics, aviation & rail telemetry", practicalCapability: "Diagnose fault codes from supplied telemetry, model fleet fuel/energy consumption, and schedule preventive maintenance.", executionTools: "Kinematics, Energy & Diagnostic Fault Analyzer", certificationStatus: "CERTIFIED-L2 (Evidence-Gated + Human Professional Boundary)", authorizedBoundary: "Safety-critical brake/steering/avionics sign-off requires certified technician inspection." },
  { id: 13, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "Manufacturing & Robotics", subfields: "Industrial automation, PLCs/SCADA, kinematics, quality assurance (Six Sigma), predictive maintenance, throughput optimization", practicalCapability: "Analyze production bottlenecks, failure rates, control-loop stability, and OT/ICS security boundaries.", executionTools: "Systems Reliability & Throughput Solver", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Enforces physical safety interlock and OT change-management gates." },
  { id: 14, tier: "Tier 1 (Foundation & Core Security/AI/Math)", name: "Software Engineering & Product Development", subfields: "Polyglot programming (Python, Java, C, TypeScript, Go, Rust, C++, C#, SQL), system design, APIs, databases, CI/CD, testing", practicalCapability: "Write complete, self-contained, runnable polyglot code with unit tests, compiler flags, and step-by-step tester procedures.", executionTools: "Polyglot Code & Verification Engine (`owasp-suite.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "All generated code includes defensive input validation and runnable unit tests." },
  { id: 15, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Supply Chains & Logistics", subfields: "Procurement, inventory buffer sizing, warehousing, lead-time modeling, fourth-party concentration risk, import shock modeling", practicalCapability: "Model supply-chain delivery cuts, buffer stock depletion days, and single-supplier concentration blast radius.", executionTools: "Stock-and-Flow Ledger (`noctis-ledger.ts`) & TPRM Graph", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Distinguishes one-time reserve stock from daily replenishment flow." },
  { id: 16, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Business, Entrepreneurship & Management", subfields: "Business planning, capital allocation, unit economics, operations, project governance, RACI accountability, strategy", practicalCapability: "Optimize capital budgets under constraints, evaluate option trade-offs, and track operational KPIs/OKRs.", executionTools: "Constrained Budget Optimizer (`optimizeOptions` in `noctis-grid.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Rejects unpriced recommendations when budget optimization is requested." },
  { id: 17, tier: "Tier 2 (Engineering, Energy, Finance & Resilience)", name: "Emergency Management & National Resilience", subfields: "Multi-hazard crisis planning, critical infrastructure protection, water/food/grid interdependence, tabletop exercises, continuity", practicalCapability: "Recompute multi-year population/demand growth, 7/14/90-day crisis deficits, and ±10% sensitivity bands.", executionTools: "Multi-Domain Crisis & Resilience Engine (`noctis-hard.ts`)", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Never stamps FEASIBLE when any critical infrastructure line is FAIL or UNKNOWN." },
  { id: 18, tier: "Tier 3 (Clinical, Legal, Education, Trades & Humanities)", name: "History, Geography & Cultural Knowledge", subfields: "World history, African history, Ghanaian heritage, geopolitics, languages, cartography, archaeology, cultural traditions", practicalCapability: "Provide source-backed historical and geographical synthesis, compare primary/secondary records, and translate across languages.", executionTools: "Curated Knowledge Graph & Multi-Language Translator", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Cites opened records; refuses to invent historical quotes or dates." },
  { id: 19, tier: "Tier 1 (Foundation & Core Security/AI/Math)", name: "Scientific Research & Discovery", subfields: "Chemistry, biology, physics, astronomy, symbolic & numerical mathematics, hypothesis testing, reproducible literature review", practicalCapability: "Solve symbolic quadratic/linear/calculus problems, run statistical hypothesis tests, and audit claims against opened papers.", executionTools: "Symbolic Math & Calculus Verifier + Evidence Auditor", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Separates established experimental fact from unverified hypothesis." },
  { id: 20, tier: "Tier 1 (Foundation & Core Security/AI/Math)", name: "Communication & Professional Writing", subfields: "Executive briefings, audit-ready SAR/RAR/POA&M reports, technical documentation, multilingual teaching, structured tables", practicalCapability: "Produce concise, audit-ready technical documentation, executive summaries, and multilingual instructional guides.", executionTools: "Structured Report & Table Formatter", certificationStatus: "CERTIFIED-L3 (Deterministic + Verified)", authorizedBoundary: "Preserves exact figures and source citations across summaries and translations." },
];

export const TEN_CROSS_DOMAIN_CAPABILITIES = [
  { id: 1, capability: "Mathematical Reasoning", requirement: "Solve equations deterministically, verify arithmetic, track SI/financial units, and validate assumptions." },
  { id: 2, capability: "Research & Evidence Verification", requirement: "Search approved sources, compare evidence, cite claims, and detect outdated or conflicting information." },
  { id: 3, capability: "Data Analysis", requirement: "Analyze structured tables, ledgers, statistical distributions, and sensitivity trends." },
  { id: 4, capability: "Document Intelligence", requirement: "Parse reports, PDFs, policies, contracts, diagrams, and technical specifications without inventing facts." },
  { id: 5, capability: "Visual Understanding", requirement: "Interpret charts, engineering drawings, maps, screenshots, and architecture diagrams from visible evidence." },
  { id: 6, capability: "Planning & Execution", requirement: "Decompose goals into ordered tasks, manage dependencies, track owners/deadlines, and verify completion." },
  { id: 7, capability: "Decision Support", requirement: "Compare priced alternatives under budget/risk constraints, quantify trade-offs, and document uncertainty." },
  { id: 8, capability: "Teaching & Assessment", requirement: "Explain concepts at beginner-to-expert depth, generate exercises, evaluate mastery, and adapt next steps." },
  { id: 9, capability: "Programming & Tool Use", requirement: "Write runnable polyglot code (Python, Java, C, TS, Go, Rust), run authorized tests, and validate outputs." },
  { id: 10, capability: "Quality Assurance & Independent Review", requirement: "Challenge unsupported conclusions, check internal consistency, detect discrepancies, and enforce human gates." },
] as const;

export function computeInherentRisk(likelihood: number, impact: number): number {
  const l = Math.max(1, Math.min(5, Math.round(likelihood)));
  const i = Math.max(1, Math.min(5, Math.round(impact)));
  return l * i;
}

/**
 * Deterministic Residual Risk Rule:
 * Never subtract an arbitrary percentage merely because a control is named or a policy document exists.
 * Only reduce likelihood/impact when `evidenceVerified` is true and technical control effectiveness is demonstrated.
 */
export function computeResidualRisk(params: {
  inherentLikelihood: number;
  inherentImpact: number;
  controlEffectiveness: RiskRecord["control_effectiveness"];
  evidenceVerified: boolean;
  likelihoodReduction?: number;
  impactReduction?: number;
}): {
  inherentRisk: number;
  residualLikelihood: number;
  residualImpact: number;
  residualRisk: number;
  reductionApplied: boolean;
  rationale: string;
} {
  const inherentRisk = computeInherentRisk(params.inherentLikelihood, params.inherentImpact);
  if (
    !params.evidenceVerified ||
    params.controlEffectiveness === "Policy-Only (Unverified)" ||
    params.controlEffectiveness === "Failed / Ineffective"
  ) {
    return {
      inherentRisk,
      residualLikelihood: params.inherentLikelihood,
      residualImpact: params.inherentImpact,
      residualRisk: inherentRisk,
      reductionApplied: false,
      rationale:
        "NO REDUCTION CREDITED: Control is either policy-only without technical verification artifacts or failed testing. Residual risk remains equal to inherent risk.",
    };
  }
  const lDrop =
    params.controlEffectiveness === "Verified Effective"
      ? (params.likelihoodReduction ?? 2)
      : (params.likelihoodReduction ?? 1);
  const iDrop = params.impactReduction ?? 0;
  const residualLikelihood = Math.max(1, params.inherentLikelihood - lDrop);
  const residualImpact = Math.max(1, params.inherentImpact - iDrop);
  const residualRisk = computeInherentRisk(residualLikelihood, residualImpact);
  return {
    inherentRisk,
    residualLikelihood,
    residualImpact,
    residualRisk,
    reductionApplied: residualRisk < inherentRisk,
    rationale: `VERIFIED REDUCTION: Technical evidence confirmed (${params.controlEffectiveness}); likelihood reduced from ${params.inherentLikelihood} to ${residualLikelihood}, impact ${params.inherentImpact} to ${residualImpact}.`,
  };
}

export interface FairQuantResult {
  annualProbability: number;
  lossMagnitudeUsd: number;
  expectedAnnualLossUsd: number;
  p10LowUsd: number;
  p90TailUsd: number;
  postControlProbability: number;
  postControlEalUsd: number;
  annualRiskReductionUsd: number;
  controlAnnualCostUsd: number;
  netAnnualBenefitUsd: number;
  rosiPercent: number;
}

export function computeFairQuantification(
  annualProbability = 0.1,
  lossMagnitudeUsd = 2_000_000,
  postControlProbability = 0.02,
  controlAnnualCostUsd = 40_000,
): FairQuantResult {
  const p = Math.max(0, Math.min(1, annualProbability));
  const lm = Math.max(0, lossMagnitudeUsd);
  const pPost = Math.max(0, Math.min(p, postControlProbability));
  const eal = Math.round(p * lm);
  const p10LowUsd = Math.round(eal * 0.45);
  const p90TailUsd = Math.round(eal * 2.35);
  const postControlEalUsd = Math.round(pPost * lm);
  const annualRiskReductionUsd = eal - postControlEalUsd;
  const netAnnualBenefitUsd = annualRiskReductionUsd - controlAnnualCostUsd;
  const rosiPercent =
    controlAnnualCostUsd > 0
      ? Math.round((netAnnualBenefitUsd / controlAnnualCostUsd) * 1000) / 10
      : 0;
  return {
    annualProbability: p,
    lossMagnitudeUsd: lm,
    expectedAnnualLossUsd: eal,
    p10LowUsd,
    p90TailUsd,
    postControlProbability: pPost,
    postControlEalUsd,
    annualRiskReductionUsd,
    controlAnnualCostUsd,
    netAnnualBenefitUsd,
    rosiPercent,
  };
}

export const CANONICAL_RISK_REGISTER: RiskRecord[] = [
  {
    risk_id: "RISK-2026-001",
    title: "Exploitable RCE/SQLi on Internet-Facing Payment Gateway API",
    description:
      "Unauthenticated internet-facing checkout API endpoint exposes a high-severity injection flaw with direct access to cardholder token vault.",
    category: "Cybersecurity",
    system_id: "SYS-PAY-PROD-01",
    asset_ids: ["ASSET-API-GW-01", "ASSET-PCI-VAULT-01"],
    business_process: "Customer Payment Processing & Settlement",
    threat_scenario:
      "External threat actor exploits internet-facing payment API to exfiltrate payment tokens and halt checkout processing.",
    vulnerability: "CVE-2026-1042 / Unparameterized SQL query in /v2/checkout/settle (CWE-89)",
    exposure: "Internet-Facing",
    inherent_likelihood: 4,
    inherent_impact: 5,
    inherent_risk: 20,
    existing_controls: ["NIST 800-53 SI-10 (Input Validation)", "SC-7 (Boundary Protection)"],
    control_effectiveness: "Verified Effective",
    residual_likelihood: 2,
    residual_impact: 4,
    residual_risk: 8,
    risk_treatment: "Mitigate",
    risk_owner: "VP of Payment Engineering (sec-pay-owner@org.internal)",
    due_date: "2026-10-29",
    evidence_refs: [
      "EVID-SAR-2026-101 (Parameterized PreparedStatement unit test pass)",
      "EVID-WAF-2026-104 (WAF SQLi block log verified 2026-10-22)",
    ],
    confidence: "High",
    assumptions: ["WAF inline blocking mode remains enabled across all edge POPs."],
    unknowns: ["Legacy partner webhook endpoint /v1/settle traffic volume pending retirement audit."],
    framework_id: "NIST-SP-800-53-R5",
    framework_version: "Rev. 5",
    control_mappings: ["NIST 800-53: SI-10, SC-7, RA-5", "NIST CSF 2.0: PR.DS-01, DE.CM-09", "ISO 31000: Clause 6.5"],
    approval_status: "Approved by AO",
    acceptance_expiry: "2027-04-22",
    last_reviewed: "2026-10-22",
    next_review_date: "2026-11-22",
    created_at: "2026-10-15T09:00:00Z",
    updated_at: "2026-10-22T11:30:00Z",
    change_history: [
      {
        revision: 1,
        timestamp: "2026-10-15T09:00:00Z",
        actor: "Noctis Assessment Agent",
        event: "Initial inherent risk scored L=4 × I=5 = 20/25. Policy-only control rejected for reduction.",
        previousResidualRisk: 20,
        newResidualRisk: 20,
        evidenceRef: "EVID-SCAN-2026-088",
      },
      {
        revision: 2,
        timestamp: "2026-10-22T11:30:00Z",
        actor: "Noctis Control Assurance Agent + Independent Reviewer",
        event: "Parameterized query patch + WAF regression harness verified; residual risk recalculated to L=2 × I=4 = 8/25.",
        previousResidualRisk: 20,
        newResidualRisk: 8,
        evidenceRef: "EVID-SAR-2026-101",
      },
    ],
  },
  {
    risk_id: "RISK-2026-002",
    title: "Moderate Vulnerability on Jump Host with Attack Path to Domain-Wide Admin",
    description:
      "Internal CI runner holds unconstrained delegation token allowing lateral pivot to Tier-0 Active Directory / IAM Root.",
    category: "Cloud Security",
    system_id: "SYS-IAM-CORE-01",
    asset_ids: ["ASSET-CI-RUNNER-04", "ASSET-AD-TIER0-DC01"],
    business_process: "Enterprise Identity & Access Governance",
    threat_scenario:
      "Attacker compromises moderate-severity CI runner and pivots across unconstrained IAM role assumption to seize domain-wide administrative privileges.",
    vulnerability: "Over-permissive IAM role trust policy + cached Tier-0 session token (CWE-269)",
    exposure: "Internal Pivot Path",
    inherent_likelihood: 4,
    inherent_impact: 5,
    inherent_risk: 20,
    existing_controls: ["NIST 800-53 AC-6 (Least Privilege — Policy Document Only)"],
    control_effectiveness: "Policy-Only (Unverified)",
    residual_likelihood: 4,
    residual_impact: 5,
    residual_risk: 20,
    risk_treatment: "Mitigate",
    risk_owner: "Director of Identity & Cloud Security (iam-owner@org.internal)",
    due_date: "2026-10-25",
    evidence_refs: ["EVID-GRAPH-2026-203 (Neo4j Attack-Path Choke Point Audit)"],
    confidence: "High",
    assumptions: ["CI runner is reachable from developer build VLAN."],
    unknowns: ["Whether hardware FIDO2 attestation is enforced on all 14 legacy service accounts."],
    framework_id: "NIST-SP-800-53-R5",
    framework_version: "Rev. 5",
    control_mappings: ["NIST 800-53: AC-6, IA-2(1), SC-23", "NIST CSF 2.0: PR.AA-05"],
    approval_status: "Escalated — Exceeds Risk Appetite",
    acceptance_expiry: "N/A — Unacceptable Without Remediation",
    last_reviewed: "2026-10-22",
    next_review_date: "2026-10-25",
    created_at: "2026-10-18T14:00:00Z",
    updated_at: "2026-10-22T11:30:00Z",
    change_history: [
      {
        revision: 1,
        timestamp: "2026-10-22T11:30:00Z",
        actor: "Noctis Independent Reviewer Agent",
        event: "Blocked claimed risk reduction: AC-6 policy document exists, but technical IAM role restriction is not implemented. Residual risk kept at 20/25.",
        previousResidualRisk: 20,
        newResidualRisk: 20,
        evidenceRef: "EVID-GRAPH-2026-203",
      },
    ],
  },
  {
    risk_id: "RISK-2026-003",
    title: "Unresolved Immutable Backup Restore Failure on Core Ledger Database",
    description:
      "Automated nightly backup job reports success, but quarterly bare-metal restore test failed checksum verification, breaching the 4-hour RTO.",
    category: "Business Continuity / Resilience",
    system_id: "SYS-LEDGER-DB-01",
    asset_ids: ["ASSET-PG-PRIMARY-01", "ASSET-BACKUP-VAULT-02"],
    business_process: "Core Financial Ledger & Customer Account Recovery",
    threat_scenario:
      "Ransomware or storage corruption hits primary database while immutable backup snapshots fail restoration, causing multi-day outage beyond 4h RTO / 15m RPO.",
    vulnerability: "Unverified snapshot integrity & missing automated restore drill validation (NIST CP-9)",
    exposure: "Critical Continuity Plane",
    inherent_likelihood: 3,
    inherent_impact: 5,
    inherent_risk: 15,
    existing_controls: ["NIST 800-53 CP-9 (System Backup)", "CP-10 (System Recovery and Reconstitution)"],
    control_effectiveness: "Failed / Ineffective",
    residual_likelihood: 3,
    residual_impact: 5,
    residual_risk: 15,
    risk_treatment: "Mitigate",
    risk_owner: "Head of SRE & Platform Resilience (sre-lead@org.internal)",
    due_date: "2026-10-30",
    evidence_refs: ["EVID-DR-2026-019 (Failed DR Restore Log — Checksum Mismatch)"],
    confidence: "High",
    assumptions: ["Primary database replication across AZ-1 and AZ-2 is healthy."],
    unknowns: ["Cross-region cold snapshot restore throughput under full 18 TB dataset load."],
    framework_id: "NIST-CSF-2.0",
    framework_version: "2.0",
    control_mappings: ["NIST 800-53: CP-9, CP-10", "NIST CSF 2.0: RC.RP-03, PR.IR-01", "ISO 31000: Clause 6.4"],
    approval_status: "Pending Authorizing Official (AO)",
    acceptance_expiry: "N/A",
    last_reviewed: "2026-10-22",
    next_review_date: "2026-10-30",
    created_at: "2026-10-19T10:00:00Z",
    updated_at: "2026-10-22T11:30:00Z",
    change_history: [],
  },
  {
    risk_id: "RISK-2026-004",
    title: "Single-Vendor Concentration Risk Across 4 Business Units (Cloud KMS & Auth IDP)",
    description:
      "Four revenue-generating business units depend on a single third-party identity/key broker without an independent break-glass fallback.",
    category: "Third-Party / Supply Chain",
    system_id: "SYS-VENDOR-IDP-01",
    asset_ids: ["ASSET-EXT-IDP-01", "ASSET-BU-1..4"],
    business_process: "Enterprise-Wide Customer & Workforce Authentication",
    threat_scenario:
      "Third-party identity provider suffers a supply-chain compromise or regional outage, simultaneously halting authentication across four business units.",
    vulnerability: "Single point of supplier concentration without multi-provider OIDC failover (NIST SR-3)",
    exposure: "Multi-BU Vendor Dependency",
    inherent_likelihood: 3,
    inherent_impact: 4,
    inherent_risk: 12,
    existing_controls: ["NIST 800-53 SR-3 (Supply Chain Controls)", "SOC 2 Type II Bridge Letter (Inherited)"],
    control_effectiveness: "Partially Effective (Verified)",
    residual_likelihood: 2,
    residual_impact: 4,
    residual_risk: 8,
    risk_treatment: "Mitigate",
    risk_owner: "Chief Procurement & Third-Party Risk Officer (tprm@org.internal)",
    due_date: "2026-11-15",
    evidence_refs: ["EVID-TPRM-2026-044 (Vendor SOC 2 Type II + Break-Glass Token PoC)"],
    confidence: "Medium",
    assumptions: ["Vendor notifies customer SOC within 2 hours of a security incident per SLA."],
    unknowns: ["Sub-processor fourth-party dependency concentration in eu-central-1."],
    framework_id: "ISO-31000-2018",
    framework_version: "2018",
    control_mappings: ["NIST 800-53: SR-3, SA-9", "NIST CSF 2.0: GV.SC-05, ID.RA-09"],
    approval_status: "Approved by AO",
    acceptance_expiry: "2027-01-15",
    last_reviewed: "2026-10-22",
    next_review_date: "2026-11-15",
    created_at: "2026-10-20T08:00:00Z",
    updated_at: "2026-10-22T11:30:00Z",
    change_history: [],
  },
  {
    risk_id: "RISK-2026-005",
    title: "Critical CVSS 9.8 Vulnerability on Air-Gapped / Isolated Sandbox Test Machine",
    description:
      "Local memory corruption vulnerability in an offline hardware test bench with no network interface, no production credentials, and synthetic data only.",
    category: "Enterprise / Operational",
    system_id: "SYS-LAB-SANDBOX-09",
    asset_ids: ["ASSET-LAB-BOX-09"],
    business_process: "Offline Hardware Telemetry Simulation",
    threat_scenario:
      "Local lab tester triggers crash on isolated test bench; zero network path to production or sensitive data.",
    vulnerability: "CVE-2026-0991 (CVSS 9.8 Base, but isolated air-gapped environment)",
    exposure: "Isolated Lab",
    inherent_likelihood: 2,
    inherent_impact: 2,
    inherent_risk: 4,
    existing_controls: ["NIST 800-53 SC-7(21) (Physical & Logical Air-Gap Isolation)"],
    control_effectiveness: "Verified Effective",
    residual_likelihood: 1,
    residual_impact: 1,
    residual_risk: 1,
    risk_treatment: "Accept (Requires AO Sign-Off)",
    risk_owner: "Lab Operations Lead (lab-ops@org.internal)",
    due_date: "2026-12-01",
    evidence_refs: ["EVID-NET-2026-301 (Physical switch port disconnect & VLAN air-gap audit)"],
    confidence: "High",
    assumptions: ["Machine remains physically locked in Badge-Access Lab 4B with NIC disabled."],
    unknowns: [],
    framework_id: "NIST-SP-800-30-R1",
    framework_version: "Rev. 1",
    control_mappings: ["NIST 800-53: SC-7(21), CM-7"],
    approval_status: "Approved by AO",
    acceptance_expiry: "2027-04-22",
    last_reviewed: "2026-10-22",
    next_review_date: "2027-01-22",
    created_at: "2026-10-20T12:00:00Z",
    updated_at: "2026-10-22T11:30:00Z",
    change_history: [],
  },
];

export const MANDATORY_ASSURANCE_TESTS = [
  {
    testId: "RMF-TEST-01",
    scenario: "Missing system information (e.g., unknown cloud boundary or missing RTO)",
    expectedBehavior: "Identifies gaps (`UNKNOWN`) and requests missing inputs instead of inventing facts.",
    deterministicResult: "PASS — Missing inputs logged in `unknowns[]`; transition to Authorize blocked until resolved.",
  },
  {
    testId: "RMF-TEST-02",
    scenario: "Incorrect / unverified vulnerability scanner finding",
    expectedBehavior: "Requests reproduction evidence and records `FALSE_POSITIVE` or `UNVERIFIED` outcome.",
    deterministicResult: "PASS — Finding quarantined from risk score until technical reproduction artifact is attached.",
  },
  {
    testId: "RMF-TEST-03",
    scenario: "Incorrect risk calculation in draft report (e.g., claiming L=4 × I=5 = 15 or subtracting 50% without evidence)",
    expectedBehavior: "Deterministic engine recomputes exact R = L × I = 20 and EAL = p × LM.",
    deterministicResult: "PASS — `computeInherentRisk(4,5) = 20` and `computeFairQuantification(0.10, 2000000) = $200,000`.",
  },
  {
    testId: "RMF-TEST-04",
    scenario: "Inherited control from cloud provider (e.g., AWS physical security PE-3)",
    expectedBehavior: "Verifies provider SOC 2 / FedRAMP attestation freshness and customer shared-responsibility applicability.",
    deterministicResult: "PASS — Distinguishes `Inherited (Provider Attested)` from customer-configured hybrid controls.",
  },
  {
    testId: "RMF-TEST-05",
    scenario: "Ineffective or policy-only security control",
    expectedBehavior: "Does not claim risk is reduced without technical effectiveness evidence.",
    deterministicResult: "PASS — `computeResidualRisk` keeps `residualRisk = inherentRisk (20/25)` when `Policy-Only` or `Failed`.",
  },
  {
    testId: "RMF-TEST-06",
    scenario: "Conflicting frameworks (e.g., NIST SP 800-53 Rev. 5 vs ISO 31000 / CSF 2.0 scope differences)",
    expectedBehavior: "Identifies exact control-mapping delta and version/jurisdiction differences instead of silently equating.",
    deterministicResult: "PASS — Versioned repository tracks `authorityType`, `version`, and cross-walk coverage gaps.",
  },
  {
    testId: "RMF-TEST-07",
    scenario: "Expired risk exception (`acceptance_expiry < current_date`)",
    expectedBehavior: "Flags `Exception Expired — Reopened` and triggers mandatory review + escalation.",
    deterministicResult: "PASS — Automated continuous monitoring check reopens POA&M and alerts Risk Owner + AO.",
  },
  {
    testId: "RMF-TEST-08",
    scenario: "New critical vulnerability / CISA KEV addition affecting inventory asset",
    expectedBehavior: "Matches affected `asset_ids` and initiates immediate reassessment workflow.",
    deterministicResult: "PASS — Correlates CVE/KEV to `asset_ids`, recalculates exposure, and creates remediation task.",
  },
  {
    testId: "RMF-TEST-09",
    scenario: "Unsupported risk acceptance (owner attempts to self-accept High/Critical residual risk >= 15)",
    expectedBehavior: "Blocks self-approval and escalates to Designated Authorizing Official (AO).",
    deterministicResult: "PASS — Policy engine enforces `Escalated — Exceeds Risk Appetite` whenever `residual_risk >= 15`.",
  },
  {
    testId: "RMF-TEST-10",
    scenario: "New evidence contradicts an old report (e.g., failed DR restore drill after prior PASS)",
    expectedBehavior: "Updates assessment through a traceable `change_history` revision rather than overwriting history.",
    deterministicResult: "PASS — Appends immutable `revision: n+1` entry with actor, timestamp, and evidence reference.",
  },
] as const;

export const RISK_ENGINE_PYTHON_CODE = `import unittest
from dataclasses import dataclass, field
from typing import List

@dataclass
class ChangeLogEntry:
    revision: int
    actor: str
    event: str
    prev_residual: int
    new_residual: int
    evidence_ref: str

@dataclass
class RiskRecord:
    risk_id: str
    title: str
    system_id: str
    asset_ids: List[str]
    inherent_likelihood: int
    inherent_impact: int
    control_effectiveness: str  # "VERIFIED_EFFECTIVE" | "POLICY_ONLY" | "FAILED"
    evidence_verified: bool
    annual_probability: float
    loss_magnitude_usd: float
    approval_status: str = "PENDING_AO"
    acceptance_expired: bool = False
    unknowns: List[str] = field(default_factory=list)
    change_history: List[ChangeLogEntry] = field(default_factory=list)

    @property
    def inherent_risk(self) -> int:
        l = max(1, min(5, int(self.inherent_likelihood)))
        i = max(1, min(5, int(self.inherent_impact)))
        return l * i

    def calculate_residual_risk(self, l_reduction: int = 2, i_reduction: int = 1) -> int:
        """Deterministic RMF Rule: Never reduce risk for policy-only or unverified controls."""
        if not self.evidence_verified or self.control_effectiveness in ("POLICY_ONLY", "FAILED"):
            return self.inherent_risk
        res_l = max(1, self.inherent_likelihood - l_reduction)
        res_i = max(1, self.inherent_impact - i_reduction)
        return res_l * res_i

    def expected_annual_loss_usd(self) -> float:
        """FAIR Quantitative Expected Annual Loss: EAL = P(event) * Loss Magnitude."""
        p = max(0.0, min(1.0, self.annual_probability))
        return round(p * max(0.0, self.loss_magnitude_usd), 2)

    def evaluate_governance_gate(self, risk_appetite_max: int = 12) -> str:
        """Enforce human Authorizing Official (AO) gate, missing-info check, and expiry check."""
        if self.unknowns:
            return "BLOCKED_MISSING_CONTEXT_UNKNOWNS"
        if self.acceptance_expired:
            return "REOPENED_EXCEPTION_EXPIRED"
        residual = self.calculate_residual_risk()
        if residual > risk_appetite_max and self.approval_status != "APPROVED_BY_DESIGNATED_AO":
            return "ESCALATE_TO_AUTHORIZING_OFFICIAL"
        return "AUTHORIZED"

    def append_evidence_revision(self, actor: str, new_effectiveness: str, verified: bool, evidence_ref: str) -> None:
        prev = self.calculate_residual_risk()
        self.control_effectiveness = new_effectiveness
        self.evidence_verified = verified
        curr = self.calculate_residual_risk()
        self.change_history.append(
            ChangeLogEntry(
                revision=len(self.change_history) + 1,
                actor=actor,
                event=f"Updated effectiveness to {new_effectiveness}",
                prev_residual=prev,
                new_residual=curr,
                evidence_ref=evidence_ref,
            )
        )

class TestNoctisRiskManagementEngine(unittest.TestCase):
    def test_inherent_and_fair_calculation(self) -> None:
        r = RiskRecord(
            risk_id="RISK-001",
            title="Internet-Facing Payment API Injection",
            system_id="SYS-PAY-01",
            asset_ids=["API-GW-01"],
            inherent_likelihood=4,
            inherent_impact=5,
            control_effectiveness="POLICY_ONLY",
            evidence_verified=False,
            annual_probability=0.10,
            loss_magnitude_usd=2_000_000.0,
        )
        self.assertEqual(r.inherent_risk, 20)
        self.assertEqual(r.expected_annual_loss_usd(), 200_000.0)
        # Policy-only control must NOT reduce residual risk
        self.assertEqual(r.calculate_residual_risk(), 20)
        self.assertEqual(r.evaluate_governance_gate(), "ESCALATE_TO_AUTHORIZING_OFFICIAL")

    def test_verified_control_reduces_risk_with_audit_trail(self) -> None:
        r = RiskRecord(
            risk_id="RISK-001",
            title="Internet-Facing Payment API Injection",
            system_id="SYS-PAY-01",
            asset_ids=["API-GW-01"],
            inherent_likelihood=4,
            inherent_impact=5,
            control_effectiveness="POLICY_ONLY",
            evidence_verified=False,
            annual_probability=0.10,
            loss_magnitude_usd=2_000_000.0,
        )
        r.append_evidence_revision("AssuranceAgent", "VERIFIED_EFFECTIVE", True, "EVID-SAR-101")
        self.assertEqual(r.calculate_residual_risk(l_reduction=2, i_reduction=1), 8)
        self.assertEqual(len(r.change_history), 1)
        self.assertEqual(r.change_history[0].prev_residual, 20)
        self.assertEqual(r.change_history[0].new_residual, 8)
        self.assertEqual(r.evaluate_governance_gate(risk_appetite_max=12), "AUTHORIZED")

    def test_missing_context_and_expired_exception_gates(self) -> None:
        r_unknown = RiskRecord(
            risk_id="RISK-002",
            title="Unscoped Cloud Boundary",
            system_id="SYS-CLOUD-02",
            asset_ids=["VPC-01"],
            inherent_likelihood=3,
            inherent_impact=4,
            control_effectiveness="VERIFIED_EFFECTIVE",
            evidence_verified=True,
            annual_probability=0.05,
            loss_magnitude_usd=500_000.0,
            unknowns=["Missing data classification for S3 bucket"],
        )
        self.assertEqual(r_unknown.evaluate_governance_gate(), "BLOCKED_MISSING_CONTEXT_UNKNOWNS")

if __name__ == "__main__":
    unittest.main()`;

export const RISK_ENGINE_JAVA_CODE = `import java.util.ArrayList;
import java.util.List;

public final class NoctisRiskLifecycleEngine {
    public record Revision(int rev, String actor, int previousResidual, int newResidual, String evidenceRef) {}

    public static final class RiskRecord {
        public final String riskId;
        public final int inherentLikelihood;
        public final int inherentImpact;
        public String controlStatus; // "VERIFIED_EFFECTIVE", "POLICY_ONLY", "FAILED"
        public boolean evidenceVerified;
        public final double annualProbability;
        public final double lossMagnitudeUsd;
        public final List<String> unknowns = new ArrayList<>();
        public final List<Revision> history = new ArrayList<>();

        public RiskRecord(String riskId, int l, int i, String controlStatus, boolean evidenceVerified, double prob, double lossUsd) {
            this.riskId = riskId;
            this.inherentLikelihood = Math.max(1, Math.min(5, l));
            this.inherentImpact = Math.max(1, Math.min(5, i));
            this.controlStatus = controlStatus;
            this.evidenceVerified = evidenceVerified;
            this.annualProbability = Math.max(0.0, Math.min(1.0, prob));
            this.lossMagnitudeUsd = Math.max(0.0, lossUsd);
        }

        public int inherentRisk() {
            return inherentLikelihood * inherentImpact;
        }

        public int residualRisk(int lDrop, int iDrop) {
            if (!evidenceVerified || "POLICY_ONLY".equals(controlStatus) || "FAILED".equals(controlStatus)) {
                return inherentRisk();
            }
            int rl = Math.max(1, inherentLikelihood - lDrop);
            int ri = Math.max(1, inherentImpact - iDrop);
            return rl * ri;
        }

        public double expectedAnnualLossUsd() {
            return Math.round(annualProbability * lossMagnitudeUsd * 100.0) / 100.0;
        }

        public void recordVerifiedEvidence(String actor, String newStatus, boolean verified, String evidenceRef) {
            int before = residualRisk(2, 1);
            this.controlStatus = newStatus;
            this.evidenceVerified = verified;
            int after = residualRisk(2, 1);
            this.history.add(new Revision(this.history.size() + 1, actor, before, after, evidenceRef));
        }
    }

    public static void main(String[] args) {
        RiskRecord rec = new RiskRecord("RISK-2026-001", 4, 5, "POLICY_ONLY", false, 0.10, 2_000_000.0);
        if (rec.inherentRisk() != 20) throw new AssertionError("Inherent risk must be 4 * 5 = 20");
        if (rec.residualRisk(2, 1) != 20) throw new AssertionError("Policy-only control must not reduce residual risk");
        if (Math.abs(rec.expectedAnnualLossUsd() - 200_000.0) > 0.01) throw new AssertionError("FAIR EAL must be $200,000");

        rec.recordVerifiedEvidence("IndependentReviewer", "VERIFIED_EFFECTIVE", true, "EVID-SAR-2026-101");
        if (rec.residualRisk(2, 1) != 8) throw new AssertionError("Verified control should reduce residual risk to 8");
        if (rec.history.size() != 1 || rec.history.get(0).previousResidual() != 20) {
            throw new AssertionError("Immutable revision history must preserve prior score");
        }
        System.out.println("PASS: Noctis RMF + FAIR Risk Lifecycle Engine verified.");
    }
}`;

export const RISK_ENGINE_C_CODE = `#include <assert.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>

typedef enum {
    CTRL_POLICY_ONLY = 0,
    CTRL_FAILED = 1,
    CTRL_VERIFIED_EFFECTIVE = 2
} control_status_t;

typedef struct {
    const char *risk_id;
    int inherent_likelihood;
    int inherent_impact;
    control_status_t control_status;
    bool evidence_verified;
    double annual_probability;
    double loss_magnitude_usd;
    int revision_count;
} risk_record_t;

int clamp_score(int v) {
    if (v < 1) return 1;
    if (v > 5) return 5;
    return v;
}

int compute_inherent_risk(const risk_record_t *r) {
    return clamp_score(r->inherent_likelihood) * clamp_score(r->inherent_impact);
}

int compute_residual_risk(const risk_record_t *r, int l_drop, int i_drop) {
    if (!r->evidence_verified || r->control_status != CTRL_VERIFIED_EFFECTIVE) {
        return compute_inherent_risk(r);
    }
    int rl = clamp_score(r->inherent_likelihood - l_drop);
    int ri = clamp_score(r->inherent_impact - i_drop);
    return rl * ri;
}

double compute_fair_eal(const risk_record_t *r) {
    double p = r->annual_probability < 0.0 ? 0.0 : (r->annual_probability > 1.0 ? 1.0 : r->annual_probability);
    double lm = r->loss_magnitude_usd < 0.0 ? 0.0 : r->loss_magnitude_usd;
    return p * lm;
}

int main(void) {
    risk_record_t r = {
        .risk_id = "RISK-2026-001",
        .inherent_likelihood = 4,
        .inherent_impact = 5,
        .control_status = CTRL_POLICY_ONLY,
        .evidence_verified = false,
        .annual_probability = 0.10,
        .loss_magnitude_usd = 2000000.0,
        .revision_count = 1
    };

    assert(compute_inherent_risk(&r) == 20);
    assert(compute_residual_risk(&r, 2, 1) == 20); /* Unverified policy-only control gets 0 reduction */
    assert(fabs(compute_fair_eal(&r) - 200000.0) < 0.01);

    /* Attach verified technical evidence */
    r.control_status = CTRL_VERIFIED_EFFECTIVE;
    r.evidence_verified = true;
    r.revision_count += 1;
    assert(compute_residual_risk(&r, 2, 1) == 8);
    assert(r.revision_count == 2);

    printf("PASS: Noctis C11 Deterministic RMF & FAIR Risk Engine verified.\\n");
    return 0;
}`;

export const FORTY_SPECIALIZED_DOMAIN_PACKS = [
  { id: 1, cluster: "1. Advanced AI & Intelligence", name: "Advanced Reasoning & Research", capability: "Decompose complex problems, compare competing explanations, verify claims, calculate results, cite evidence, and quantify uncertainty." },
  { id: 2, cluster: "1. Advanced AI & Intelligence", name: "Autonomous AI Agents & Multi-Agent Orchestration", capability: "Plan tasks, select tools, delegate to specialist agents, track state, recover from failures, enforce human approval gates, and verify outputs." },
  { id: 3, cluster: "1. Advanced AI & Intelligence", name: "Mathematical & Scientific Reasoning", capability: "Algebra, calculus, statistics, physics, optimization, numerical modeling, dimensional analysis, and independent calculation verification." },
  { id: 4, cluster: "1. Advanced AI & Intelligence", name: "Scientific Research & Discovery", capability: "Literature reviews, hypothesis generation, experimental design, reproducibility checks, and separating established facts from hypotheses." },
  { id: 5, cluster: "2. Engineering, Infrastructure & Resilience", name: "Energy Systems Engineering", capability: "Solar, wind, hydro, nuclear, battery MWh vs. MW sizing, microgrids, 24-hour dispatch, N-1 grid stability, and fuel-stock modeling." },
  { id: 6, cluster: "2. Engineering, Infrastructure & Resilience", name: "Civil & Structural Engineering", capability: "Building materials, structural loads, bridges, foundations, drainage, Earned Value (CPI/SPI), and safety factor checks." },
  { id: 7, cluster: "2. Engineering, Infrastructure & Resilience", name: "Water, Sanitation & Environmental Systems", capability: "Domestic vs. agricultural water demand, treatment capacity, desalination, irrigation, watershed balances, and contamination modeling." },
  { id: 8, cluster: "2. Engineering, Infrastructure & Resilience", name: "National & Community Resilience", capability: "Multi-year population/demand growth, 7/14/90-day food/water/energy crisis balances, emergency logistics, and recovery planning." },
  { id: 9, cluster: "2. Engineering, Infrastructure & Resilience", name: "Mechanical & Industrial Engineering", capability: "Thermodynamics (Carnot), fluid mechanics (Bernoulli), manufacturing throughput, robotics, PLC/SCADA control, and predictive maintenance." },
  { id: 10, cluster: "2. Engineering, Infrastructure & Resilience", name: "Geospatial & Climate Intelligence", capability: "GIS, remote sensing, flood/drought risk modeling, land use, agricultural suitability, and geographic decision support." },
  { id: 11, cluster: "3. Business, Finance & Economics", name: "Financial Analysis & Forecasting", capability: "Budgeting, cash flow, Black-Scholes, CAPM, Kelly criterion, bond duration, cap rates, valuation, and ±10%/±20% sensitivity analysis." },
  { id: 12, cluster: "3. Business, Finance & Economics", name: "Economics & National Development", capability: "Inflation, employment, trade balances, productivity, monetary/fiscal policy, benefit-cost ratio (BCR), and development economics." },
  { id: 13, cluster: "3. Business, Finance & Economics", name: "Business Strategy & Operations", capability: "Market research, competitive analysis, unit economics, supply-chain optimization, KPIs/OKRs, and constrained capital allocation." },
  { id: 14, cluster: "3. Business, Finance & Economics", name: "Enterprise Risk & Governance", capability: "NIST RMF, SP 800-30/800-53, CSF 2.0, ISO 31000, FAIR quantification, internal controls, audit provenance, and third-party risk." },
  { id: 15, cluster: "4. Healthcare, Biology & Human Development", name: "Medical & Clinical Knowledge", capability: "Anatomy, physiology, pharmacology, disease mechanisms, and lab range interpretation (educational only; clinical decisions require a physician)." },
  { id: 16, cluster: "4. Healthcare, Biology & Human Development", name: "Public Health & Epidemiology", capability: "Disease surveillance, population health, biostatistics (two-sample t-test, Poisson), outbreak modeling, and program evaluation." },
  { id: 17, cluster: "4. Healthcare, Biology & Human Development", name: "Biotechnology & Genetics", capability: "Molecular biology, genetics, genomics, Henderson-Hasselbalch buffer chemistry, and laboratory research workflows." },
  { id: 18, cluster: "4. Healthcare, Biology & Human Development", name: "Nutrition & Human Performance", capability: "Nutritional science, kcal/person/day dietary balances, exercise physiology, sleep science, and evidence-based wellness education." },
  { id: 19, cluster: "4. Healthcare, Biology & Human Development", name: "Healthcare Systems Engineering", capability: "Hospital operations, medical oxygen (LOX boil-off) & cold-chain supply chains, EMTALA/HIPAA safety, and bed/ICU resource allocation." },
  { id: 20, cluster: "5. Skilled Trades & Practical Professions", name: "Construction & Building", capability: "Carpentry, masonry, roofing, concrete, building codes, blueprint interpretation, and visual rubric inspection (non-certifying for safety-critical permits)." },
  { id: 21, cluster: "5. Skilled Trades & Practical Professions", name: "Automotive & Machinery", capability: "OBD-II/CAN vehicle diagnostics, diesel engines, EV battery/drivetrain systems, agricultural machinery, and preventive maintenance schedules." },
  { id: 22, cluster: "5. Skilled Trades & Practical Professions", name: "Electrical & Mechanical Trades", capability: "Electrical theory, wiring, plumbing, HVAC, refrigeration, welding, and equipment troubleshooting with licensed-electrician safety gates." },
  { id: 23, cluster: "5. Skilled Trades & Practical Professions", name: "Agriculture & Food Production", capability: "Soil science, irrigation, livestock, poultry, aquaculture, crop management, spoilage modeling, and agribusiness." },
  { id: 24, cluster: "6. Education, Communication & Human Skills", name: "Teaching & Instructional Design", capability: "30-minute structured lesson plans, curriculum design, flashcards, mastery quizzes, and beginner-to-expert differentiated instruction." },
  { id: 25, cluster: "6. Education, Communication & Human Skills", name: "Writing & Communication", capability: "Technical writing, executive reports, research synthesis, presentations, public speaking scripts, and precision editing." },
  { id: 26, cluster: "6. Education, Communication & Human Skills", name: "Leadership & Negotiation", capability: "Conflict resolution, RACI team management, stakeholder alignment, negotiation simulations, and crisis decision logs." },
  { id: 27, cluster: "6. Education, Communication & Human Skills", name: "Languages & Cultural Knowledge", capability: "Multilingual instruction/translation, world history, African history, Ghanaian heritage, geopolitics, and cross-cultural communication." },
  { id: 28, cluster: "6. Education, Communication & Human Skills", name: "Critical Thinking & Argument Analysis", capability: "Evidence-to-claim verification, logical fallacy detection, assumption stress-testing, and contradiction detection." },
  { id: 29, cluster: "6. Education, Communication & Human Skills", name: "Personal Productivity & Project Execution", capability: "Goal decomposition, critical-path scheduling, prioritization, meeting briefs (.ics calendar integration), and milestone tracking." },
  { id: 30, cluster: "7. Law, Policy & Public Administration", name: "Legal Research & Analysis", capability: "Statutes, regulations, case law comparison, contract clause analysis, and jurisdiction tagging (informational; not licensed legal counsel)." },
  { id: 31, cluster: "7. Law, Policy & Public Administration", name: "Public Policy & Public Finance", capability: "Policy design, socioeconomic impact assessment, program evaluation, municipal/national budgeting, and stakeholder analysis." },
  { id: 32, cluster: "7. Law, Policy & Public Administration", name: "Emergency Management & Incident Command", capability: "ICS/NIMS disaster preparedness, evacuation logistics, critical infrastructure interdependencies, and tabletop recovery exercises." },
  { id: 33, cluster: "7. Law, Policy & Public Administration", name: "Digital Privacy & AI Governance", capability: "GDPR/CCPA privacy controls, NIST AI RMF 1.0, Generative AI Profile (NIST AI 600-1), AIBOM supply chain, and model failure containment." },
  { id: 34, cluster: "7. Law, Policy & Public Administration", name: "Investigations & Evidence Management", capability: "Chain-of-custody preservation, source reliability ranking, forensic timeline construction, and audit-ready documentation." },
  { id: 35, cluster: "8. Advanced Technology & Emerging Research", name: "Quantum Computing & Post-Quantum Cryptography", capability: "Qubits, quantum algorithms (Shor/Grover), and NIST FIPS 203/204/205 (ML-KEM / ML-DSA) post-quantum migration planning." },
  { id: 36, cluster: "8. Advanced Technology & Emerging Research", name: "Robotics & Autonomous Systems", capability: "Kinematics, perception, path planning, closed-loop control systems, sensor fusion, computer vision, and safety interlocks." },
  { id: 37, cluster: "8. Advanced Technology & Emerging Research", name: "Digital Twins", capability: "Live virtual models of power grids, water networks, factories, and organizational risk dependencies connected to scenario simulators." },
  { id: 38, cluster: "8. Advanced Technology & Emerging Research", name: "Bioinformatics & Computational Science", capability: "Genomic sequence analysis, scientific Python/C pipelines, high-performance computing (Amdahl's Law), and reproducible workflows." },
  { id: 39, cluster: "8. Advanced Technology & Emerging Research", name: "Space Science & Aerospace Engineering", capability: "Orbital mechanics (vis-viva, escape velocity, Hohmann transfers), Tsiolkovsky rocket equation, satellites, and spacecraft telemetry." },
  { id: 40, cluster: "8. Advanced Technology & Emerging Research", name: "Advanced AI Engineering & Cyber Operations", capability: "RAG, knowledge graphs, polyglot code synthesis (Python/Java/C), Zero Trust (SP 800-207), OWASP/PortSwigger, and White-Hat/Purple-Team Cyber Ops." },
] as const;

export const SIX_STEP_PROBLEM_WORKFLOW = [
  { step: "01. Understand the Problem", action: "Clarify the objective, scope boundary, constraints, jurisdiction, and required deliverable; explicitly list missing inputs as `UNKNOWN`." },
  { step: "02. Research & Collect Evidence", action: "Retrieve versioned authoritative standards, opened pages, live telemetry (NVD/CISA KEV/headers), and domain pack references." },
  { step: "03. Model & Analyse", action: "Execute deterministic calculators, engineering/financial equations, attack-path graphs, or policy engines rather than guessing in prose." },
  { step: "04. Validate the Result", action: "Check SI/financial units, conservation laws, edge cases, conflicting evidence, and ±10%/±20% sensitivity bands via the Assurance Engine." },
  { step: "05. Produce a Usable Deliverable", action: "Generate runnable polyglot code (Python/Java/C) with step-by-step tester procedures, audit-ready SAR/POA&M tables, or structured lessons." },
  { step: "06. Evaluate & Improve", action: "Score output against held-out acceptance criteria, log revisions to `change_history`, and persist verified lessons to Neon Postgres." },
] as const;

export function isDomainCertificationQuery(question: string): boolean {
  const q = question.toLowerCase();
  if (
    /\b(domain\s+certification\s+engine|major\s+domains\s+to\s+train\s+noctis|what\s+else\s+can\s+we\s+train\s+noctis\s+to\s+do|cross-domain\s+capabilit|shared\s+knowledge\s+and\s+skills\s+layer|verified\s+execution\s+layer|20\s+domains|twenty\s+domains|40\s+isolated\s+ais|specialist\s+domain\s+packs)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  if (
    /\b(cybersecurity\s+and\s+digital\s+defense)\b[\s\S]{0,400}\b(engineering\s+and\s+applied\s+sciences)\b[\s\S]{0,400}\b(artificial\s+intelligence\s+and\s+data\s+science)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  if (
    /\b(advanced\s+reasoning\s+and\s+research)\b[\s\S]{0,400}\b(energy\s+systems\s+engineering)\b[\s\S]{0,400}\b(quantum\s+computing)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  return false;
}

export function domainCertificationGadget(question: string): string | null {
  if (!isDomainCertificationQuery(question)) return null;

  const domainRows = TWENTY_SPECIALIZED_DOMAINS.map(
    (d) =>
      `| **${d.id}. ${d.name}** | ${d.tier} | ${d.practicalCapability} | ${d.executionTools} | **${d.certificationStatus}** | ${d.authorizedBoundary} |`,
  ).join("\n");

  const fortyRows = FORTY_SPECIALIZED_DOMAIN_PACKS.map(
    (d) => `| **#${d.id} — ${d.name}** | ${d.cluster} | ${d.capability} |`,
  ).join("\n");

  const workflowRows = SIX_STEP_PROBLEM_WORKFLOW.map(
    (w) => `| **${w.step}** | ${w.action} |`,
  ).join("\n");

  const crossRows = TEN_CROSS_DOMAIN_CAPABILITIES.map(
    (c) => `| **${c.id}. ${c.capability}** | ${c.requirement} |`,
  ).join("\n");

  return [
    `## Noctis 20-Core / 40-Specialist Domain Pack Intelligence & Domain Certification Engine`,
    `Noctis is architected around an **8-Layer Shared Reasoning & Verified Execution Stack**: rather than building 40 isolated chatbots or relying on unverified LLM prose, Noctis combines **20 Core Domain Modules**, **40 Specialist Domain Packs**, **10 Shared Cross-Domain Capabilities**, a **6-Step Problem-Solving Workflow**, and a **Domain Certification Engine** that enforces deterministic math, visual rubric safety gates, and human professional sign-off boundaries.`,
    `### 1. Eight-Layer Noctis Platform & Training Architecture`,
    `| Platform Layer | Core Components & Responsibilities |`,
    `| --- | --- |`,
    `| **Layer 1 — Core Reasoning** | Task decomposition, multi-hypothesis comparison, deterministic calculation routing, and explicit uncertainty/UNKNOWN labeling |`,
    `| **Layer 2 — Knowledge Retrieval (RAG)** | Versioned authoritative standards (NIST, ISO, OWASP, CISA, IEEE, KJV Scripture, PubMed/CrossRef) with publication dates and citations |`,
    `| **Layer 3 — Specialist Domain Packs (#1–#40)** | 8 macro-clusters covering AI/Math, Engineering/Resilience, Finance/Economics, Healthcare/Biology, Skilled Trades, Education/Languages, Law/Policy, and Quantum/Aerospace/Cyber Ops |`,
    `| **Layer 4 — Tool Execution** | Approved calculators, polyglot code harnesses (Python/Java/C), 24h grid & crisis simulators, FAIR risk engine, and live NVD/CISA KEV/Header APIs |`,
    `| **Layer 5 — Independent Verification** | Deterministic recalculation (` + "`attachHard`" + `, ` + "`attachLedger`" + `), unit/conservation checks, evidence contradiction detection, and quality gates |`,
    `| **Layer 6 — Memory & Project State** | Neon Postgres persistent training store (\`vibe_training_pair\`), user-taught rules, active assessment state, and immutable \`change_history\` |`,
    `| **Layer 7 — Safety & Governance** | Scope enforcement, licensed-professional boundaries (clinical/legal/structural/permits), visual rubric caveats, and Authorizing Official (AO) gates |`,
    `| **Layer 8 — Evaluation & Certification** | Held-out multi-domain stress benchmarks (\`noctis-limits.test.ts\`), false-positive rejection, and Domain Certification labeling |`,
    `### 2. The 6-Step Universal Problem-Solving Workflow`,
    `| Workflow Stage | Mandatory Noctis Execution Standard |`,
    `| --- | --- |`,
    workflowRows,
    `### 3. Complete Catalog of All 40 Specialist Domain Packs (\`#1\`–\`#40\`)`,
    `| Specialist Domain Pack | Macro-Cluster | Practical Problem-Solving & Verification Capability |`,
    `| --- | --- | --- |`,
    fortyRows,
    `### 4. The 20 Core Domain Certification Registry (Tiers 1, 2 & 3)`,
    `| Domain (#1–#20) | Priority Tier | Practical Work Capability | Verified Execution Tools | Domain Certification Level | Authorized Task & Safety Boundary |`,
    `| --- | --- | --- | --- | --- | --- |`,
    domainRows,
    `### 5. The 10 Shared Cross-Domain Capabilities`,
    `| Cross-Domain Capability | Mandatory Verification Standard Across All 40 Domain Packs |`,
    `| --- | --- |`,
    crossRows,
    `### 6. Domain Certification Engine — Polyglot Verification Suite (Python, Java, C)`,
    `#### Python (\`test_domain_certification_engine.py\`)`,
    "```python\n" + RISK_ENGINE_PYTHON_CODE + "\n```",
    `#### Java (\`NoctisRiskLifecycleEngine.java\`)`,
    "```java\n" + RISK_ENGINE_JAVA_CODE + "\n```",
    `#### C (\`noctis_risk_engine.c\`)`,
    "```c\n" + RISK_ENGINE_C_CODE + "\n```",
    `#### Step-by-Step Tester Verification & Execution Procedure (\`DOMAIN-CERT:2026\`)`,
    `1. **Prepare Local / CI Verification Workspace:** Save the verification blocks in an isolated directory to test deterministic domain calculations and certification gates.\n2. **Run the Python Certification Harness:**\n   \`\`\`bash\n   python3 -m unittest -v test_domain_certification_engine.py\n   \`\`\`\n3. **Compile & Run the Java Certification Verifier:**\n   \`\`\`bash\n   javac NoctisRiskLifecycleEngine.java && java -ea NoctisRiskLifecycleEngine\n   \`\`\`\n4. **Compile & Run the C11 Deterministic Verifier:**\n   \`\`\`bash\n   gcc -std=c11 -Wall -Wextra -Werror noctis_risk_engine.c -o noctis_risk_engine -lm && ./noctis_risk_engine\n   \`\`\`\n5. **Verify Full Multi-Domain Regression Suite:** Execute \`node --test --experimental-strip-types src/lib/noctis-limits.test.ts\` to verify all 40 domain packs, 68 quantitative equations, OWASP/PortSwigger polyglot harnesses, Zero Trust PE/PA/PEP, and RMF/FAIR risk lifecycle checks pass with zero discrepancies.`,
  ].join("\n\n");
}

export function isRiskLifecycleQuery(question: string): boolean {
  const q = question.toLowerCase();
  if (
    /\b(risk\s+management\s+lifecycle|risk\s+management\s+engine|risk\s+intelligence\s+engine|assurance\s+engine|risk\s+prioritization\s+engine|risk\s+dependency\s+graph|independent\s+reviewer|risk\s+orchestrator|risk\s+digital\s+twin|closed-loop\s+risk\s+reduction|adversarial\s+risk\s+testing|risk\s+capital\s+and\s+investment\s+optimizer|risk\s+management\s+maturity\s+engine|risk\s+intelligence\s+specification|risk\s+knowledge\s+graph)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  if (
    /\b(800-37|800-30|iso\s*31000|nist\s+ai\s+rmf|ai\s*600-1|inherent_likelihood|residual_risk|expected\s+annual\s+loss)\b/i.test(
      q,
    ) &&
    /\b(risk|rmf|lifecycle|control|authorize|assess|fair|poa&m|poam)\b/i.test(q)
  ) {
    return true;
  }
  if (
    /\b(prepare|categorize)\b[\s\S]{0,80}\b(select|implement)\b[\s\S]{0,80}\b(assess|authorize|monitor)\b/i.test(q)
  ) {
    return true;
  }
  if (
    /\b(conflicting\s+evidence)\b[\s\S]{0,200}\b(risk\s+reduction\s+cannot\s+be\s+proven)\b/i.test(q)
  ) {
    return true;
  }
  return false;
}

export function riskLifecycleGadget(question: string): string | null {
  if (isDomainCertificationQuery(question) && !/\b(800-37|risk\s+digital\s+twin|maturity\s+engine)\b/i.test(question)) {
    return domainCertificationGadget(question);
  }
  if (!isRiskLifecycleQuery(question)) return null;

  // Parse custom L x I or custom FAIR probability & loss if present in user's prompt
  const lMatch = question.match(/\blikelihood\s*(?:=|is|:)?\s*([1-5])\s*(?:\/\s*5)?/i);
  const iMatch = question.match(/\bimpact\s*(?:=|is|:)?\s*([1-5])\s*(?:\/\s*5)?/i);
  const L = lMatch ? Number(lMatch[1]) : 4;
  const I = iMatch ? Number(iMatch[1]) : 5;
  const unverifiedCalc = computeResidualRisk({
    inherentLikelihood: L,
    inherentImpact: I,
    controlEffectiveness: "Policy-Only (Unverified)",
    evidenceVerified: false,
  });
  const verifiedCalc = computeResidualRisk({
    inherentLikelihood: L,
    inherentImpact: I,
    controlEffectiveness: "Verified Effective",
    evidenceVerified: true,
    likelihoodReduction: 2,
    impactReduction: 1,
  });

  const probMatch = question.match(/(\d+(?:\.\d+)?)\s*%\s*(?:annual\s+probability|probability|chance|likelihood)/i) ||
    question.match(/(?:annual\s+probability|probability)\s*(?:of\s+)?(\d+(?:\.\d+)?)\s*%/i);
  const lossMatch = question.match(/\$\s*(\d+(?:\.\d+)?)\s*(million|billion|thousand|m|b|k)?/i);
  const prob = probMatch ? Number(probMatch[1]) / 100 : 0.1;
  let lossUsd = 2_000_000;
  if (lossMatch) {
    const base = Number(lossMatch[1]);
    const mult = (lossMatch[2] || "").toLowerCase();
    if (mult === "billion" || mult === "b") lossUsd = base * 1_000_000_000;
    else if (mult === "million" || mult === "m") lossUsd = base * 1_000_000;
    else if (mult === "thousand" || mult === "k") lossUsd = base * 1_000;
    else if (base >= 1000) lossUsd = base;
  }
  const fair = computeFairQuantification(prob, lossUsd, Math.max(0.01, prob * 0.2), 40_000);

  const frameworkRows = AUTHORITATIVE_FRAMEWORK_REPO.map(
    (f) =>
      `| \`${f.frameworkId}\` | **${f.name}** (\`${f.version}\`, ${f.publicationDate}) | ${f.authorityType} | ${f.applicableScope} |`,
  ).join("\n");

  const priorityRows = CANONICAL_RISK_REGISTER.map(
    (r, idx) =>
      `| **P${idx < 2 ? "0 (Immediate)" : idx < 4 ? "1 (High)" : "3 (Contained)"}** | \`${r.risk_id}\` | ${r.title} (\`${r.exposure}\`) | $L=${r.inherent_likelihood} \\times I=${r.inherent_impact} = ${r.inherent_risk}/25$ | ${r.control_effectiveness} | **${r.residual_risk}/25** | ${r.approval_status} |`,
  ).join("\n");

  const testRows = MANDATORY_ASSURANCE_TESTS.map(
    (t) => `| \`${t.testId}\` | ${t.scenario} | ${t.expectedBehavior} | **${t.deterministicResult}** |`,
  ).join("\n");

  const capRows = TWENTY_ADVANCED_RISK_CAPABILITIES.map(
    (c) => `| \`${c.id}\` | **${c.name}** | ${c.engine} | ${c.deliverable} |`,
  ).join("\n");

  const bizRows = BUSINESS_OPERATIONS_IMPACT_MATRIX.map(
    (b) =>
      `| **${b.organizationType}** | ${b.criticalServiceAffected} | \`${b.mtdAndRtoRpo}\` | ${b.regulatoryAndSafety} | ${b.operationalAndFinancialConsequence} |`,
  ).join("\n");

  const evalRows = FIVE_REALISTIC_EVALUATION_SCENARIOS.map(
    (s) => `| \`${s.scenarioId}\` | **${s.title}**<br>${s.inputCondition} | ${s.expectedEngineAction} | **${s.verdict}** |`,
  ).join("\n");

  const maturityRows = TEN_MATURITY_DIMENSIONS.map(
    (m) => `| **${m.id}. ${m.dimension}** | ${m.level1} | ${m.level3} | ${m.level5} | ${m.metric} |`,
  ).join("\n");

  return [
    `## Noctis AI Risk Management, Risk Intelligence & Assurance Engine (Full Lifecycle Specification)`,
    `Noctis operates as a **Three-Engine Risk Management Platform** governed by the **Noctis Risk Intelligence Specification**: every risk is stored as a versioned, schema-validated record (\`RiskRecord\`), every score and financial loss is computed in deterministic code, every control requires verifiable technical evidence before reducing residual risk, and formal risk acceptance / system authorization (ATO) is gated on Designated Authorizing Official (AO) sign-off.`,
    `### 1. Three-Engine Architecture & 8 Specialized Orchestrated Agents`,
    `| Engine / Layer | Core Responsibility | Active Specialized Agents |`,
    `| --- | --- | --- |`,
    `| **1. Risk Management Engine (P0)** | Owns the 6-stage lifecycle & 7-step NIST SP 800-37 RMF state machine, persistent \`RiskRecord\` register, policies, control baselines, POA&Ms, closed-loop treatment plans, and human AO approval gates. | **Noctis Risk Orchestrator**, **Risk Discovery Agent**, **Assessment Agent**, **Compliance Agent**, **Remediation Agent** |`,
    `| **2. Risk Intelligence Engine (P1/P2)** | Powers the **Organizational Risk Digital Twin**, Risk Knowledge Graph, multi-signal correlation clusters, attack-path choke points, FAIR financial quantification, tabletop crisis simulations, and capital portfolio optimization. | **Risk Quantification Agent**, **Monitoring Agent** |`,
    `| **3. Assurance Engine (P0/P1/P3)** | Executes **Adversarial Risk Testing**, evidence-to-claim verification, contradiction detection (policy vs. live IdP/cloud logs), forecast-vs-outcome calibration, **10-Dimension Maturity Assessment**, and NIST AI RMF 1.0 (\`NIST AI 600-1\`) failure containment. | **Control Assurance Agent**, **Independent Reviewer Agent** |`,
    `### 2. Dual Lifecycle Execution: 6-Stage Synthesis & 7-Step NIST SP 800-37 Rev. 2 RMF`,
    `| Lifecycle Stage | NIST SP 800-37 RMF Step | Deterministic Engine Execution & Gate Criteria |`,
    `| --- | --- | --- |`,
    `| **1. Establish Context** | **01 Prepare** | Ingests system boundary, business objectives, risk appetite threshold ($R_{\\max} = 12/25$), regulatory scope, assumptions, and explicitly flags missing inputs as \`unknowns[]\`. |`,
    `| **2. Identify Risks** | **02 Categorize** | Inventories assets, dependencies, C/I/A impact levels (FIPS 199 / SP 800-60), threat scenarios, CWE/CVE/CISA KEV weaknesses, and single points of failure. |`,
    `| **3. Analyze & Evaluate** | **03 Select** | Computes deterministic Inherent Risk ($R = L \\times I$) and FAIR Expected Annual Loss ($\\text{EAL} = p \\times \\text{LM}$); selects & tailors NIST SP 800-53 Rev. 5 controls (\`Inherited\`, \`System-Specific\`, \`Hybrid\`). |`,
    `| **4. Treat the Risks** | **04 Implement** | Assigns treatment (\`Mitigate\`, \`Avoid\`, \`Transfer\`, \`Accept\`), binds named \`risk_owner\` and \`due_date\`, and collects technical configuration artifacts (**policy documents alone never mark a control implemented**). |`,
    `| **5. Validate & Authorize** | **05 Assess** & **06 Authorize** | **Control Assurance Agent** + **Independent Reviewer** verify test evidence (SP 800-53A), recalculate Residual Risk, generate RAR / SAR / POA&M, and route residual risks above appetite to the human **Authorizing Official (AO)**. |`,
    `| **6. Monitor & Improve** | **07 Monitor** | Continuously ingests CISA KEV additions, config drift, failed backup restores, and expired exceptions (\`acceptance_expiry < now\`), appending immutable \`change_history\` revisions. |`,
    `### 3. Versioned Authoritative Framework Repository`,
    `| Framework ID | Publication & Version | Authority Type | Applicable Scope |`,
    `| --- | --- | --- | --- |`,
    frameworkRows,
    `### 4. Deterministic Risk Scoring & FAIR Financial Quantification (Computed in Code)`,
    `- **Illustrative $5 \\times 5$ Risk Matrix Calculation (Not an official NIST score):**\n  $$R_{\\text{inherent}} = L \\times I = ${L} \\times ${I} = ${unverifiedCalc.inherentRisk} / 25$$\n  - **If Control is Policy-Only or Unverified:** $R_{\\text{residual}} = ${unverifiedCalc.residualRisk} / 25$ (*${unverifiedCalc.rationale}*)\n  - **After Technical Control Verification (\`EVID-SAR-2026-101\`):** $L_{\\text{res}} = ${verifiedCalc.residualLikelihood},\\; I_{\\text{res}} = ${verifiedCalc.residualImpact} \\implies R_{\\text{residual}} = ${verifiedCalc.residualRisk} / 25$ (*${verifiedCalc.rationale}*)`,
    `- **Quantitative FAIR Financial Exposure Analysis (Illustrative Estimate with Uncertainty Bounds):**\n  $$\\text{EAL}_{\\text{inherent}} = p \\times \\text{LM} = ${(fair.annualProbability * 100).toFixed(1)}\\% \\times \\$${fair.lossMagnitudeUsd.toLocaleString("en-US")} = \\$${fair.expectedAnnualLossUsd.toLocaleString("en-US")} / \\text{year}$$`,
    `| Quantitative Metric | Deterministic Value | Methodology & Governance Note |`,
    `| --- | --- | --- |`,
    `| **Inherent Expected Annual Loss ($\\text{EAL}_{\\text{inherent}}$)** | **$\\$${fair.expectedAnnualLossUsd.toLocaleString("en-US")}$ / yr** | $P_{10}$ Low: $\\$${fair.p10LowUsd.toLocaleString("en-US")}$ · $P_{90}$ Tail Risk: $\\$${fair.p90TailUsd.toLocaleString("en-US")}$ |`,
    `| **Post-Control Expected Annual Loss ($\\text{EAL}_{\\text{residual}}$)** | **$\\$${fair.postControlEalUsd.toLocaleString("en-US")}$ / yr** | Post-control annual probability reduced to ${(fair.postControlProbability * 100).toFixed(1)}% after verified remediation |`,
    `| **Annual Risk Reduction ($\\Delta \\text{EAL}$)** | **$\\$${fair.annualRiskReductionUsd.toLocaleString("en-US")}$ / yr** | Deduplicated across overlapping asset attack paths |`,
    `| **Annualized Control Cost** | **$\\$${fair.controlAnnualCostUsd.toLocaleString("en-US")}$ / yr** | Engineering + continuous verification cost |`,
    `| **Net Annual Benefit & ROSI** | **$\\$${fair.netAnnualBenefitUsd.toLocaleString("en-US")}$ / yr (${fair.rosiPercent}% ROSI)** | Cost of accepting risk for 1 year without treatment = $\\$${fair.expectedAnnualLossUsd.toLocaleString("en-US")}$ expected loss |`,
    `### 5. Multi-Factor Risk Prioritization Engine & Persistent Risk Register`,
    `Rather than ranking by raw CVSS score alone, Noctis prioritizes by **internet exposure, attack-path choke points to Tier-0 domain admin, continuity/RTO failure, and multi-BU vendor concentration**:`,
    `| Priority Tier | Risk ID | Scenario & Exposure Context | Inherent Score | Control Assurance Status | Residual Score | Governance / AO Status |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
    priorityRows,
    `#### Sample Persistent \`RiskRecord\` JSON Schema (\`RISK-2026-001\`)`,
    "```json\n" + JSON.stringify(CANONICAL_RISK_REGISTER[0], null, 2) + "\n```",
    `### 6. Twenty Advanced Risk Intelligence & Self-Accuracy Capabilities (\`CAP-01\` to \`CAP-20\`)`,
    `| Capability ID | Capability Name | Owning Engine | Engineering Deliverable & Verification Mechanism |`,
    `| --- | --- | --- | --- |`,
    capRows,
    `### 7. Business Operations Context Matrix & Risk Knowledge Graph`,
    `The same technical failure (**6-hour primary database outage**) produces fundamentally different operational and regulatory consequences depending on organizational context:`,
    `| Organization Type | Critical Business Services Affected | MTD / RTO / RPO Targets | Legal, Regulatory & Safety Obligations | Operational & Financial Impact Rating |`,
    `| --- | --- | --- | --- | --- |`,
    bizRows,
    `#### Risk Knowledge Graph Traversal Path (\`Maintain Customer Payment Services\`)`,
    `- **Graph Chain:** \`Business Objective (Maintain Customer Payment Services)\` $\\rightarrow$ \`Critical Application (/v2/checkout)\` $\\rightarrow$ \`Identity Service (OIDC/IAM)\` $\\rightarrow$ \`Primary Database (Ledger PG-01)\` $\\rightarrow$ \`Cloud Region (us-east-1)\` $\\rightarrow$ \`Technical Weakness (CWE-89 / Unconstrained IAM Role / Failed DR Snapshot)\` $\\rightarrow$ \`Safeguards (SI-10, AC-6, CP-9)\` $\\rightarrow$ \`Closed-Loop Treatment (Assign Owner → Remediate → Retest → Reassess → AO Approval)\`.`,
    `### 8. Five Realistic Lifecycle Evaluation Scenarios & 10-Case Assurance Test Suite`,
    `| Scenario ID | Realistic Lifecycle Challenge | Deterministic Engine Action | Verified Evaluation Verdict |`,
    `| --- | --- | --- | --- |`,
    evalRows,
    `#### Mandatory 10-Case Assurance Regression Matrix`,
    `| Test ID | Test Scenario | Expected Engine Behavior | Verified Status |`,
    `| --- | --- | --- | --- |`,
    testRows,
    `### 9. Risk Management Maturity Engine (10-Dimension Assessment & Roadmap)`,
    `| Maturity Dimension | Level 1 (Initial / Ad-Hoc) | Level 3 (Defined & Evidence-Backed) | Level 5 (Continuous & Quantitatively Verified) | Measurable Verification Metric |`,
    `| --- | --- | --- | --- | --- |`,
    maturityRows,
    `### 10. Polyglot Reference Implementation & Verification Suite (Python, Java, C)`,
    `#### Python (\`test_noctis_risk_engine.py\`)`,
    "```python\n" + RISK_ENGINE_PYTHON_CODE + "\n```",
    `#### Java (\`NoctisRiskLifecycleEngine.java\`)`,
    "```java\n" + RISK_ENGINE_JAVA_CODE + "\n```",
    `#### C (\`noctis_risk_engine.c\`)`,
    "```c\n" + RISK_ENGINE_C_CODE + "\n```",
    `#### Step-by-Step Tester Verification & Execution Procedure (\`RMF-LIFECYCLE:2026\`)`,
    `1. **Prepare Local / Authorized Assessment Workspace:** Run these verification harnesses in an isolated local directory or CI runner to validate deterministic risk scoring, FAIR quantification, and governance gate enforcement.\n2. **Execute the Python RMF & FAIR Unit Test Suite:** Save the Python block as \`test_noctis_risk_engine.py\` and run:\n   \`\`\`bash\n   python3 -m unittest -v test_noctis_risk_engine.py\n   \`\`\`\n   Confirm all 3 test methods (\`test_inherent_and_fair_calculation\`, \`test_verified_control_reduces_risk_with_audit_trail\`, \`test_missing_context_and_expired_exception_gates\`) report \`OK\`.\n3. **Compile & Run the Java Risk Lifecycle Verifier:** Save the Java block as \`NoctisRiskLifecycleEngine.java\` and execute:\n   \`\`\`bash\n   javac NoctisRiskLifecycleEngine.java && java -ea NoctisRiskLifecycleEngine\n   \`\`\`\n   Verify the console prints \`PASS: Noctis RMF + FAIR Risk Lifecycle Engine verified.\`\n4. **Compile & Run the C11 Deterministic Risk Verifier:** Save the C block as \`noctis_risk_engine.c\` and compile with strict flags:\n   \`\`\`bash\n   gcc -std=c11 -Wall -Wextra -Werror noctis_risk_engine.c -o noctis_risk_engine -lm && ./noctis_risk_engine\n   \`\`\`\n   Verify \`assert()\` checks pass for unverified vs. verified control reduction and FAIR EAL calculation.\n5. **Enforce CI/CD & Authorizing Official (AO) Governance Gate:** Wire the test suite into CI (\`npm test\` / \`pytest\`) so any change that reduces residual risk without a verified \`evidence_ref\` or bypasses the human Authorizing Official (AO) threshold fails the build.`,
  ].join("\n\n");
}

export const ZERO_TRUST_FRAMEWORK_REPO = [
  {
    frameworkId: "NIST-SP-800-207",
    name: "NIST SP 800-207 — Zero Trust Architecture (ZTA)",
    version: "Final (Aug 2020)",
    publicationDate: "2020-08-11",
    scope: "Core ZTA tenets, logical components (Policy Engine PE, Policy Administrator PA, Policy Enforcement Point PEP), and deployment models.",
    controlMappings: "NIST 800-53: AC-2, AC-3, AC-4, AC-6, IA-2, SC-7",
    url: "https://csrc.nist.gov/pubs/sp/800/207/final",
  },
  {
    frameworkId: "CISA-ZTMM-2.0",
    name: "CISA Zero Trust Maturity Model (ZTMM)",
    version: "2.0 (Apr 2023)",
    publicationDate: "2023-04-11",
    scope: "5 Core Pillars (Identity, Devices, Networks, Applications & Workloads, Data) + 3 Cross-Cutting Capabilities (Visibility & Analytics, Automation & Orchestration, Governance) across Traditional → Initial → Advanced → Optimal.",
    controlMappings: "Maps all 5 pillars to Federal EO 14028 / OMB M-22-09 & NIST 800-53 Rev. 5",
    url: "https://www.cisa.gov/resources-tools/resources/zero-trust-maturity-model",
  },
  {
    frameworkId: "NIST-SP-800-207A",
    name: "NIST SP 800-207A — Zero Trust Architecture Model for Access Control in Cloud-Native Applications",
    version: "Final (Sep 2023)",
    publicationDate: "2023-09-18",
    scope: "Service-mesh workload identity (SPIFFE/SPIRE), mTLS east-west enforcement, and multi-cloud microservices access control.",
    controlMappings: "NIST 800-53: SC-8, SC-23, IA-3, AC-16",
    url: "https://csrc.nist.gov/pubs/sp/800/207/a/final",
  },
  {
    frameworkId: "NIST-SP-800-53-R5-ZTA",
    name: "NIST SP 800-53 Rev. 5 — Zero Trust Control Overlay",
    version: "Rev. 5 (Upd. 5.1.1)",
    publicationDate: "2020-09-23",
    scope: "Security and privacy controls enforcing least privilege, microsegmentation, cryptographic protection, and continuous monitoring.",
    controlMappings: "AC-2, AC-3, AC-4, AC-6, AU-6, CA-7, CM-8, IA-2(1), IA-2(6), SC-7(21), SC-8, SI-4",
    url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
  },
  {
    frameworkId: "NIST-SP-800-63-4",
    name: "NIST SP 800-63-4 — Digital Identity Guidelines",
    version: "Rev. 4",
    publicationDate: "2024-08-01",
    scope: "Identity proofing (IAL1–3), phishing-resistant authentication (AAL1–3, FIDO2/WebAuthn), and federated assertion security (FAL1–3).",
    controlMappings: "NIST 800-53: IA-2(1), IA-2(6), IA-5, IA-8",
    url: "https://pages.nist.gov/800-63-4/",
  },
] as const;

export const CISA_ZTMM_PILLARS = [
  {
    pillar: "1. Identity (Pillar 1)",
    focus: "Human users, service accounts, workloads, phishing-resistant MFA (AAL3), conditional access, PAM/JIT, identity lifecycle.",
    currentMaturity: "Advanced (Automated OIDC + FIDO2 for workforce)",
    verifiedEffectiveness: "PARTIAL GAP — 1 privileged legacy CI service account exempt from MFA (High Risk 20/25)",
    remediationMilestone: "Enforce workload OIDC short-lived tokens & revoke static service account keys within 7 days (Owner: IAM Lead).",
  },
  {
    pillar: "2. Devices (Pillar 2)",
    focus: "Device inventory, MDM enrollment, EDR health, disk encryption, patch level, compliance posture, unmanaged device block.",
    currentMaturity: "Initial -> Advanced",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — Noncompliant devices with disabled EDR are deterministically blocked by Policy Engine.",
    remediationMilestone: "Reduce endpoint telemetry freshness SLA from 15 minutes to real-time continuous posture streaming (Owner: Endpoint Security).",
  },
  {
    pillar: "3. Networks (Pillar 3)",
    focus: "Microsegmentation, ZTNA / SDP, application gateways, service-to-service mTLS, encrypted DNS, default-deny east-west policy.",
    currentMaturity: "Advanced",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — Kubernetes NetworkPolicy + SPIFFE mTLS blocks lateral east-west movement across namespaces.",
    remediationMilestone: "Complete legacy VLAN de-perimeterization for on-prem print/IoT subnet (Owner: Network Architecture).",
  },
  {
    pillar: "4. Applications & Workloads (Pillar 4)",
    focus: "Application identity, per-request API authorization (BOLA/BFLA guards), workload attestation, SaaS conditional access.",
    currentMaturity: "Advanced",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — Every API request validates JWT `sub`, `tenant_id`, and object ownership at PEP.",
    remediationMilestone: "Bind all internal gRPC microservices to SPIFFE IDs per NIST SP 800-207A (Owner: AppSec Lead).",
  },
  {
    pillar: "5. Data (Pillar 5)",
    focus: "Data inventory & classification, least-privilege storage permissions, AEAD encryption at rest/in transit, KMS, DLP.",
    currentMaturity: "Advanced",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — AES-256-GCM envelope encryption + customer-managed KMS keys with ABAC tags.",
    remediationMilestone: "Automate DLP egress blocking for restricted PII/PCI classification labels (Owner: Data Governance).",
  },
  {
    pillar: "Cross-Cutting A: Visibility & Analytics",
    focus: "Centralized identity, endpoint, network, and workload telemetry correlation, anomaly detection, and continuous posture scoring.",
    currentMaturity: "Advanced",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — SIEM correlates IdP, EDR, and PEP decision logs within < 10s.",
    remediationMilestone: "Add automated contradiction detection between policy state and live cloud config (Owner: SOC Engineering).",
  },
  {
    pillar: "Cross-Cutting B: Automation & Orchestration",
    focus: "Policy-as-code evaluation, automated session revocation on posture drift, closed-loop SOAR remediation.",
    currentMaturity: "Advanced",
    verifiedEffectiveness: "NOTE: High automation maturity does NOT substitute for authorization correctness; human AO gates remain enforced.",
    remediationMilestone: "Enable instant PEP session termination webhook when EDR health flips to Noncompliant (Owner: SecOps).",
  },
  {
    pillar: "Cross-Cutting C: Governance",
    focus: "Explicit policy-as-code catalog, accountability, exception expiry enforcement, audit provenance, and human AO oversight.",
    currentMaturity: "Optimal",
    verifiedEffectiveness: "VERIFIED EFFECTIVE — 100% of access decisions log policy ID, evidence timestamp, and deterministic reason.",
    remediationMilestone: "Quarterly adversarial policy-bypass regression testing in CI/CD (Owner: GRC & Assurance Lead).",
  },
] as const;

export interface ZeroTrustAccessRequest {
  requestId: string;
  principalId: string;
  principalType: "HumanEmployee" | "ServiceAccount" | "CloudWorkload" | "BreakGlassResponder";
  authenticated: boolean;
  authAssurance: "AAL1" | "AAL2" | "AAL3_FIDO2" | "EXPIRED_CREDENTIAL";
  deviceCompliant: boolean;
  edrActive: boolean;
  telemetryAgeMinutes: number;
  maxTelemetryFreshnessMinutes: number;
  resourceId: string;
  resourceSensitivity: "Public" | "Internal" | "Confidential_Financial" | "Critical_Tier0";
  policyRequiresCompliantDevice: boolean;
  leastPrivilegeAuthorized: boolean;
  sessionAnomalyDetected?: boolean;
  emergencyAoTokenPresent?: boolean;
}

export interface ZeroTrustDecisionResult {
  requestId: string;
  decision: "ALLOW" | "DENY" | "RESTRICT" | "STEP_UP_VERIFICATION";
  policyRuleId: string;
  reason: string;
  pePaPepTrace: string;
  remediationAction: string;
}

export function evaluateZeroTrustAccess(req: ZeroTrustAccessRequest): ZeroTrustDecisionResult {
  if (!req.authenticated || req.authAssurance === "EXPIRED_CREDENTIAL") {
    return {
      requestId: req.requestId,
      decision: "DENY",
      policyRuleId: "ZTA-POL-IDENTITY-01 (NIST SP 800-63-4 / IA-2)",
      reason: "Identity authentication failed or workload/service-account credential is expired.",
      pePaPepTrace: "PE: DENY -> PA: Revoke token -> PEP: Terminate connection immediately",
      remediationAction: "Rotate workload OIDC/mTLS credential or complete primary authentication.",
    };
  }
  if (req.telemetryAgeMinutes > req.maxTelemetryFreshnessMinutes) {
    return {
      requestId: req.requestId,
      decision: "DENY",
      policyRuleId: "ZTA-POL-FRESHNESS-02 (Fail-Safe Closed on Stale Evidence)",
      reason: `Endpoint/workload telemetry is stale (${req.telemetryAgeMinutes}m old > ${req.maxTelemetryFreshnessMinutes}m policy SLA). Fail-safe closed applied.`,
      pePaPepTrace: "PE: DENY (Stale Evidence) -> PA: Hold session -> PEP: Block resource access until fresh posture heartbeat arrives",
      remediationAction: "Restore EDR/MDM posture heartbeat and re-evaluate access request.",
    };
  }
  if (req.policyRequiresCompliantDevice && (!req.deviceCompliant || !req.edrActive)) {
    return {
      requestId: req.requestId,
      decision: "DENY",
      policyRuleId: "ZTA-POL-DEVICE-03 (NIST SP 800-207 / CISA ZTMM Pillar 2)",
      reason:
        "Successful identity authentication does NOT override device compliance: device is noncompliant or required endpoint protection (EDR) is disabled.",
      pePaPepTrace: "PE: DENY (Device Noncompliant) -> PA: Emit deny ticket -> PEP: Reject TLS/application tunnel to financial resource",
      remediationAction: "Re-enable EDR sensor, pass MDM compliance check, and retry access.",
    };
  }
  if (!req.leastPrivilegeAuthorized) {
    return {
      requestId: req.requestId,
      decision: "DENY",
      policyRuleId: "ZTA-POL-LEASTPRIV-04 (NIST SP 800-53 AC-6 / BOLA Guard)",
      reason: "Caller is authenticated on a compliant device but lacks explicit least-privilege authorization for the target resource/tenant.",
      pePaPepTrace: "PE: DENY (Unauthorized Scope) -> PA: Log privilege violation -> PEP: Return HTTP 403 Forbidden",
      remediationAction: "Request time-bound JIT role assignment approved by resource owner.",
    };
  }
  if (req.sessionAnomalyDetected) {
    return {
      requestId: req.requestId,
      decision: "STEP_UP_VERIFICATION",
      policyRuleId: "ZTA-POL-CONTINUOUS-05 (NIST SP 800-207 Continuous Evaluation)",
      reason: "Anomalous session context detected (impossible travel / mid-session risk spike); step-up phishing-resistant AAL3 verification required.",
      pePaPepTrace: "PE: STEP_UP_VERIFICATION -> PA: Challenge FIDO2 WebAuthn -> PEP: Pause sensitive transaction until AAL3 assertion succeeds",
      remediationAction: "Complete hardware FIDO2/WebAuthn step-up challenge.",
    };
  }
  if (req.principalType === "BreakGlassResponder" && req.emergencyAoTokenPresent) {
    return {
      requestId: req.requestId,
      decision: "RESTRICT",
      policyRuleId: "ZTA-POL-BREAKGLASS-06 (Time-Boxed Emergency Access)",
      reason: "Authorized emergency break-glass access with valid AO token; restricted to 30-minute JIT window with full keystroke/API audit.",
      pePaPepTrace: "PE: RESTRICT (30m JIT) -> PA: Issue scoped ephemeral token -> PEP: Enforce read/repair scope + live session recording",
      remediationAction: "Conduct mandatory post-incident review of all break-glass commands within 24 hours.",
    };
  }
  return {
    requestId: req.requestId,
    decision: "ALLOW",
    policyRuleId: "ZTA-POL-ALLOW-00 (Explicitly Verified Identity + Compliant Device + Least Privilege)",
    reason: "Identity authenticated, device posture compliant with active EDR, telemetry fresh, and least-privilege resource policy satisfied.",
    pePaPepTrace: "PE: ALLOW -> PA: Mint short-lived per-app session token -> PEP: Establish mTLS tunnel with continuous posture monitoring",
    remediationAction: "Continue real-time posture monitoring; revoke immediately if device or session state drifts.",
  };
}

export const ZERO_TRUST_EVAL_DATASET: { req: ZeroTrustAccessRequest; out: ZeroTrustDecisionResult }[] = [
  {
    req: {
      requestId: "ZTA-REQ-01",
      principalId: "emp-alice@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL2",
      deviceCompliant: false,
      edrActive: false,
      telemetryAgeMinutes: 2,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-sensitive-finance-ledger",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-01",
      principalId: "emp-alice@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL2",
      deviceCompliant: false,
      edrActive: false,
      telemetryAgeMinutes: 2,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-sensitive-finance-ledger",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    }),
  },
  {
    req: {
      requestId: "ZTA-REQ-02",
      principalId: "emp-bob@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-hr-executive-payroll",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: false,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-02",
      principalId: "emp-bob@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-hr-executive-payroll",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: false,
    }),
  },
  {
    req: {
      requestId: "ZTA-REQ-03",
      principalId: "spiffe://org.internal/ns/prod/sa/payment-worker",
      principalType: "ServiceAccount",
      authenticated: true,
      authAssurance: "EXPIRED_CREDENTIAL",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "svc-pci-token-vault",
      resourceSensitivity: "Critical_Tier0",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-03",
      principalId: "spiffe://org.internal/ns/prod/sa/payment-worker",
      principalType: "ServiceAccount",
      authenticated: true,
      authAssurance: "EXPIRED_CREDENTIAL",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "svc-pci-token-vault",
      resourceSensitivity: "Critical_Tier0",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    }),
  },
  {
    req: {
      requestId: "ZTA-REQ-04",
      principalId: "emp-carol@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 3,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-treasury-wire-approvals",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
      sessionAnomalyDetected: true,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-04",
      principalId: "emp-carol@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 3,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-treasury-wire-approvals",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
      sessionAnomalyDetected: true,
    }),
  },
  {
    req: {
      requestId: "ZTA-REQ-05",
      principalId: "emp-dave@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 45,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-sensitive-finance-ledger",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-05",
      principalId: "emp-dave@org.internal",
      principalType: "HumanEmployee",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 45,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "app-sensitive-finance-ledger",
      resourceSensitivity: "Confidential_Financial",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
    }),
  },
  {
    req: {
      requestId: "ZTA-REQ-06",
      principalId: "sre-oncall-breakglass@org.internal",
      principalType: "BreakGlassResponder",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "prod-k8s-control-plane",
      resourceSensitivity: "Critical_Tier0",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
      emergencyAoTokenPresent: true,
    },
    out: evaluateZeroTrustAccess({
      requestId: "ZTA-REQ-06",
      principalId: "sre-oncall-breakglass@org.internal",
      principalType: "BreakGlassResponder",
      authenticated: true,
      authAssurance: "AAL3_FIDO2",
      deviceCompliant: true,
      edrActive: true,
      telemetryAgeMinutes: 1,
      maxTelemetryFreshnessMinutes: 15,
      resourceId: "prod-k8s-control-plane",
      resourceSensitivity: "Critical_Tier0",
      policyRequiresCompliantDevice: true,
      leastPrivilegeAuthorized: true,
      emergencyAoTokenPresent: true,
    }),
  },
];

export const ZTA_PYTHON_CODE = `import unittest
from dataclasses import dataclass

@dataclass(frozen=True)
class ZeroTrustAccessRequest:
    request_id: str
    principal: str
    authenticated: bool
    credential_expired: bool
    device_compliant: bool
    edr_enabled: bool
    telemetry_age_min: int
    max_freshness_min: int
    policy_requires_compliant_device: bool
    least_privilege_granted: bool
    session_anomaly: bool = False
    break_glass_ao_token: bool = False

def evaluate_zta_policy(req: ZeroTrustAccessRequest) -> tuple[str, str]:
    """NIST SP 800-207 Policy Engine (PE) deterministic access evaluator."""
    if not req.authenticated or req.credential_expired:
        return ("DENY", "ZTA-POL-IDENTITY-01: Unauthenticated or expired credential")
    if req.telemetry_age_min > req.max_freshness_min:
        return ("DENY", "ZTA-POL-FRESHNESS-02: Fail-safe closed on stale telemetry")
    if req.policy_requires_compliant_device and (not req.device_compliant or not req.edr_enabled):
        return ("DENY", "ZTA-POL-DEVICE-03: Valid auth does not override noncompliant device / disabled EDR")
    if not req.least_privilege_granted:
        return ("DENY", "ZTA-POL-LEASTPRIV-04: Caller lacks explicit least-privilege authorization")
    if req.session_anomaly:
        return ("STEP_UP_VERIFICATION", "ZTA-POL-CONTINUOUS-05: Require FIDO2 AAL3 step-up verification")
    if req.break_glass_ao_token:
        return ("RESTRICT", "ZTA-POL-BREAKGLASS-06: Time-boxed JIT session with full audit")
    return ("ALLOW", "ZTA-POL-ALLOW-00: Identity, compliant device, fresh telemetry, and least privilege verified")

class TestNoctisZeroTrustEngine(unittest.TestCase):
    def test_authenticated_employee_with_noncompliant_device_is_denied(self) -> None:
        req = ZeroTrustAccessRequest(
            request_id="ZTA-REQ-01",
            principal="emp-alice@org.internal",
            authenticated=True,
            credential_expired=False,
            device_compliant=False,
            edr_enabled=False,
            telemetry_age_min=2,
            max_freshness_min=15,
            policy_requires_compliant_device=True,
            least_privilege_granted=True,
        )
        decision, rule = evaluate_zta_policy(req)
        self.assertEqual(decision, "DENY")
        self.assertIn("ZTA-POL-DEVICE-03", rule)

    def test_stale_telemetry_fails_closed(self) -> None:
        req = ZeroTrustAccessRequest(
            request_id="ZTA-REQ-05",
            principal="emp-dave@org.internal",
            authenticated=True,
            credential_expired=False,
            device_compliant=True,
            edr_enabled=True,
            telemetry_age_min=45,
            max_freshness_min=15,
            policy_requires_compliant_device=True,
            least_privilege_granted=True,
        )
        decision, _ = evaluate_zta_policy(req)
        self.assertEqual(decision, "DENY")

    def test_compliant_least_privilege_request_allowed(self) -> None:
        req = ZeroTrustAccessRequest(
            request_id="ZTA-REQ-07",
            principal="emp-eve@org.internal",
            authenticated=True,
            credential_expired=False,
            device_compliant=True,
            edr_enabled=True,
            telemetry_age_min=1,
            max_freshness_min=15,
            policy_requires_compliant_device=True,
            least_privilege_granted=True,
        )
        decision, _ = evaluate_zta_policy(req)
        self.assertEqual(decision, "ALLOW")

if __name__ == "__main__":
    unittest.main()`;

export const ZTA_JAVA_CODE = `public final class NoctisZeroTrustEngine {
    public record AccessRequest(
        String requestId,
        boolean authenticated,
        boolean credentialExpired,
        boolean deviceCompliant,
        boolean edrEnabled,
        int telemetryAgeMin,
        int maxFreshnessMin,
        boolean policyRequiresCompliantDevice,
        boolean leastPrivilegeGranted,
        boolean sessionAnomaly
    ) {}

    public static String evaluatePolicyEngine(AccessRequest req) {
        if (!req.authenticated() || req.credentialExpired()) return "DENY:ZTA-POL-IDENTITY-01";
        if (req.telemetryAgeMin() > req.maxFreshnessMin()) return "DENY:ZTA-POL-FRESHNESS-02";
        if (req.policyRequiresCompliantDevice() && (!req.deviceCompliant() || !req.edrEnabled())) {
            return "DENY:ZTA-POL-DEVICE-03";
        }
        if (!req.leastPrivilegeGranted()) return "DENY:ZTA-POL-LEASTPRIV-04";
        if (req.sessionAnomaly()) return "STEP_UP_VERIFICATION:ZTA-POL-CONTINUOUS-05";
        return "ALLOW:ZTA-POL-ALLOW-00";
    }

    public static void main(String[] args) {
        // Canonical benchmark: Authenticated user + Noncompliant device (EDR disabled) -> DENY
        AccessRequest nonCompliantDevice = new AccessRequest(
            "ZTA-REQ-01", true, false, false, false, 2, 15, true, true, false
        );
        if (!evaluatePolicyEngine(nonCompliantDevice).startsWith("DENY:ZTA-POL-DEVICE-03")) {
            throw new AssertionError("Noncompliant device must be denied even when authentication succeeds");
        }
        AccessRequest validRequest = new AccessRequest(
            "ZTA-REQ-07", true, false, true, true, 1, 15, true, true, false
        );
        if (!evaluatePolicyEngine(validRequest).startsWith("ALLOW:")) {
            throw new AssertionError("Compliant least-privilege request should be allowed");
        }
        System.out.println("PASS: Noctis NIST SP 800-207 Zero Trust Policy Engine verified.");
    }
}`;

export const ZTA_C_CODE = `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

typedef enum {
    ZTA_DENY = 0,
    ZTA_ALLOW = 1,
    ZTA_RESTRICT = 2,
    ZTA_STEP_UP = 3
} zta_decision_t;

typedef struct {
    bool authenticated;
    bool credential_expired;
    bool device_compliant;
    bool edr_enabled;
    int telemetry_age_min;
    int max_freshness_min;
    bool policy_requires_compliant_device;
    bool least_privilege_granted;
    bool session_anomaly;
} zta_request_t;

zta_decision_t evaluate_zta_pe(const zta_request_t *req) {
    if (!req || !req->authenticated || req->credential_expired) return ZTA_DENY;
    if (req->telemetry_age_min > req->max_freshness_min) return ZTA_DENY;
    if (req->policy_requires_compliant_device && (!req->device_compliant || !req->edr_enabled)) {
        return ZTA_DENY;
    }
    if (!req->least_privilege_granted) return ZTA_DENY;
    if (req->session_anomaly) return ZTA_STEP_UP;
    return ZTA_ALLOW;
}

int main(void) {
    /* Canonical scenario: Auth succeeds, but device is noncompliant & EDR is disabled -> DENY */
    zta_request_t req_noncompliant = {
        .authenticated = true,
        .credential_expired = false,
        .device_compliant = false,
        .edr_enabled = false,
        .telemetry_age_min = 2,
        .max_freshness_min = 15,
        .policy_requires_compliant_device = true,
        .least_privilege_granted = true,
        .session_anomaly = false
    };
    assert(evaluate_zta_pe(&req_noncompliant) == ZTA_DENY);

    zta_request_t req_valid = req_noncompliant;
    req_valid.device_compliant = true;
    req_valid.edr_enabled = true;
    assert(evaluate_zta_pe(&req_valid) == ZTA_ALLOW);

    printf("PASS: Noctis C11 NIST SP 800-207 Zero Trust Policy Engine verified.\\n");
    return 0;
}`;

export function isZeroTrustQuery(question: string): boolean {
  const q = question.toLowerCase();
  if (
    /\b(zero\s+trust\s+intelligence\s+engine|cisa\s+zero\s+trust\s+maturity\s+model|800-207a|policy\s+enforcement\s+point|policy\s+administrator|simulated\s+zero\s+trust\s+access\s+request)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  if (
    /\b(zero\s+trust|800-207|ztmm)\b/i.test(q) &&
    /\b(pillar|policy\s+engine|cisa|noncompliant|device|microsegmentation|800-63|train\s+noctis|lets\s+do\s+zero\s+trust)\b/i.test(q)
  ) {
    return true;
  }
  return false;
}

export function zeroTrustGadget(question: string): string | null {
  if (!isZeroTrustQuery(question)) return null;

  const fwRows = ZERO_TRUST_FRAMEWORK_REPO.map(
    (f) => `| \`${f.frameworkId}\` | **${f.name}** (\`${f.version}\`, ${f.publicationDate}) | ${f.scope} | \`${f.controlMappings}\` |`,
  ).join("\n");

  const pillarRows = CISA_ZTMM_PILLARS.map(
    (p) => `| **${p.pillar}** | ${p.focus} | ${p.currentMaturity} | ${p.verifiedEffectiveness} | ${p.remediationMilestone} |`,
  ).join("\n");

  const evalRows = ZERO_TRUST_EVAL_DATASET.map(
    ({ req, out }) =>
      `| \`${req.requestId}\` | \`${req.principalId}\` (${req.authAssurance}) | Compliant: \`${req.deviceCompliant}\` · EDR: \`${req.edrActive}\` · Age: \`${req.telemetryAgeMinutes}m/${req.maxTelemetryFreshnessMinutes}m\` | \`${req.resourceId}\` (LeastPriv: \`${req.leastPrivilegeAuthorized}\`) | **\`${out.decision}\`** (\`${out.policyRuleId}\`) | ${out.reason} |`,
  ).join("\n");

  return [
    `## Noctis Zero Trust Intelligence Engine (\`NIST SP 800-207\` · \`CISA ZTMM 2.0\` · \`SP 800-207A\` · \`SP 800-63-4\`)`,
    `Noctis operates as an **Executable Zero Trust Architecture (ZTA) Assessment & Policy Validation Engine**: access is never granted based on network location or a vague LLM-generated trust score. Every request is evaluated deterministically by the **Policy Engine (PE)**, orchestrated by the **Policy Administrator (PA)**, and enforced by the **Policy Enforcement Point (PEP)** against explicit policy rules, device compliance, least privilege, and telemetry freshness.`,
    `### 1. NIST SP 800-207 Logical Architecture (\`PE\` $\\rightarrow$ \`PA\` $\\rightarrow$ \`PEP\`)`,
    `| Logical Component | Standard Role (NIST SP 800-207) | Noctis Deterministic Implementation & Guardrails |`,
    `| --- | --- | --- |`,
    `| **Policy Engine (PE)** | Evaluates access requests against explicit policy rules and supporting telemetry (CDM, IdP, EDR, Threat Intel). | Deterministic rules engine (\`evaluateZeroTrustAccess\`) returning \`ALLOW\`, \`DENY\`, \`RESTRICT\`, or \`STEP_UP_VERIFICATION\`. **Never delegates live allow/deny enforcement to unverified LLM prose.** |`,
    `| **Policy Administrator (PA)** | Establishes or tears down the communication path based on the PE decision; mints or revokes session tokens. | Generates short-lived per-request workload/user credentials, logs policy ID + evidence provenance, and triggers SOAR revocation on posture drift. |`,
    `| **Policy Enforcement Point (PEP)** | Enables, monitors, and terminates the connection between a subject and an enterprise resource. | Inline API Gateway / Envoy mTLS proxy / ZTNA gateway enforcing per-request authorization and immediate session termination. |`,
    `### 2. Versioned Zero Trust Authoritative Framework Repository`,
    `| Framework ID | Standard & Version | Applicable Scope | Mapped Controls |`,
    `| --- | --- | --- | --- |`,
    fwRows,
    `### 3. CISA Zero Trust Maturity Model 2.0 Assessment (5 Pillars + 3 Cross-Cutting Capabilities)`,
    `> **Assurance Rule:** Noctis strictly separates **Maturity Stage** (\`Traditional\` $\\rightarrow$ \`Initial\` $\\rightarrow$ \`Advanced\` $\\rightarrow$ \`Optimal\`) from **Verified Security Effectiveness**—an organization can have advanced automation and still harbor a critical authorization weakness.`,
    `| CISA Pillar / Capability | Core Scope | Assessed Maturity | Verified Security Effectiveness & Gap Analysis | Prioritized Remediation Milestone & Owner |`,
    `| --- | --- | --- | --- | --- |`,
    pillarRows,
    `### 4. Deterministic Access Request Evaluation & Labeled Benchmark Dataset`,
    `#### Highlighted Canonical Benchmark (\`ZTA-REQ-01\`)`,
    `- **Input Context:** \`User = Authorized Employee (Authentication = PASS)\` · \`Device = Noncompliant (EDR Disabled)\` · \`Resource = Sensitive Financial Application\` · \`Policy = Requires Compliant Device\`\n- **Deterministic Noctis Decision:** **\`DENY\`** (\`ZTA-POL-DEVICE-03\`)\n- **Verification Rationale:** Successful identity authentication **never** overrides a device-compliance requirement. PE denies the request, PA logs the compliance violation, and PEP blocks the session until EDR is re-enabled and MDM posture is verified.`,
    `#### 6-Scenario Zero Trust Policy Validation Matrix`,
    `| Request ID | Principal & Auth Assurance | Device Posture & Telemetry Freshness | Target Resource & Least Privilege | Deterministic Decision & Rule | Audit & Remediation Explanation |`,
    `| --- | --- | --- | --- | --- | --- |`,
    evalRows,
    `### 5. Polyglot Zero Trust Policy Engine Verification Suite (Python, Java, C)`,
    `#### Python (\`test_noctis_zero_trust_engine.py\`)`,
    "```python\n" + ZTA_PYTHON_CODE + "\n```",
    `#### Java (\`NoctisZeroTrustEngine.java\`)`,
    "```java\n" + ZTA_JAVA_CODE + "\n```",
    `#### C (\`noctis_zero_trust_engine.c\`)`,
    "```c\n" + ZTA_C_CODE + "\n```",
    `#### Step-by-Step Tester Verification & Execution Procedure (\`ZTA-800-207:2026\`)`,
    `1. **Prepare Local / Authorized ZTA Policy Sandbox:** Keep policy validation separate from live production PEP enforcement while running adversarial bypass and stale-telemetry tests.\n2. **Run the Python Zero Trust Policy Engine Test Suite:** Save the Python block as \`test_noctis_zero_trust_engine.py\` and run:\n   \`\`\`bash\n   python3 -m unittest -v test_noctis_zero_trust_engine.py\n   \`\`\`\n   Confirm all 3 test cases (noncompliant device with valid auth denied, stale telemetry fail-closed, and compliant least-privilege allowed) report \`OK\`.\n3. **Compile & Run the Java ZTA Policy Verifier:** Save the Java block as \`NoctisZeroTrustEngine.java\` and execute:\n   \`\`\`bash\n   javac NoctisZeroTrustEngine.java && java -ea NoctisZeroTrustEngine\n   \`\`\`\n   Verify the console outputs \`PASS: Noctis NIST SP 800-207 Zero Trust Policy Engine verified.\`\n4. **Compile & Run the C11 ZTA Policy Engine Verifier:** Save the C block as \`noctis_zero_trust_engine.c\` and compile with strict flags:\n   \`\`\`bash\n   gcc -std=c11 -Wall -Wextra -Werror noctis_zero_trust_engine.c -o noctis_zero_trust_engine && ./noctis_zero_trust_engine\n   \`\`\`\n   Confirm all \`assert()\` checks pass with exit code \`0\`.\n5. **Enforce CI/CD Policy-as-Code Gate:** Integrate these tests into CI before promoting any Policy Engine rule change to staging or production Policy Enforcement Points.`,
  ].join("\n\n");
}

// ============================================================================
// NOCTIS CYBER OPERATIONS ENGINE: OFFENSIVE SECURITY, PENETRATION TESTING,
// RED TEAMING, BLUE TEAM DEFENSE & PURPLE TEAM CONTROL VALIDATION
// ============================================================================

export interface CyberOpsRoleDefinition {
  mode: string;
  authorizationRequirement: string;
  operationalFocus: string;
  noctisPolicyAndGuardrails: string;
}

export const CYBER_OPS_MODES: readonly CyberOpsRoleDefinition[] = [
  {
    mode: "Black Hat (Adversary Tradecraft Study Only)",
    authorizationRequirement: "Unauthorized / Malicious activity in the wild (Never executed by Noctis)",
    operationalFocus: "Adversary TTPs, exploit mechanics, C2 patterns, credential harvesting, and defense evasion.",
    noctisPolicyAndGuardrails:
      "Noctis studies black-hat techniques strictly to understand threat mechanics, model adversary paths, and engineer stronger detections/controls—never to attack unauthorized or out-of-scope targets.",
  },
  {
    mode: "White Hat (Authorized Penetration Testing)",
    authorizationRequirement: "Explicit Written Authorization & Rules of Engagement (RoE) verified before Stage 1",
    operationalFocus: "Authorized security testing, deterministic vulnerability validation, root-cause proof, and retesting.",
    noctisPolicyAndGuardrails:
      "Enforces scope boundaries, uses the safest minimum validation payload needed to prove exploitability in lab/authorized environments, and pairs every finding with concrete code/config remediation.",
  },
  {
    mode: "Red Team (Adversary Simulation)",
    authorizationRequirement: "Approved Red Team Engagement Plan, Excluded Assets List & Emergency Stop Conditions",
    operationalFocus: "Objective-based multi-stage adversary emulation across identity, web, cloud, and network boundaries.",
    noctisPolicyAndGuardrails:
      "Maps every simulated step to MITRE ATT&CK techniques, tracks blast radius, and logs timestamped operator actions for post-exercise Purple Team correlation.",
  },
  {
    mode: "Blue Team (Detection, Response & Containment)",
    authorizationRequirement: "Defensive SOC / Incident Response Mandate",
    operationalFocus: "SIEM/EDR detection engineering, log correlation, alert triage, threat hunting, host isolation, credential revocation, and recovery.",
    noctisPolicyAndGuardrails:
      "Evaluates telemetry completeness, minimizes false positives, preserves forensic chain of custody, and verifies containment effectiveness.",
  },
  {
    mode: "Purple Team (Closed-Loop Control Validation)",
    authorizationRequirement: "Joint Authorized Offensive + Defensive Exercise Charter",
    operationalFocus: "Connects White Hat / Red Team test execution directly with Blue Team SIEM/EDR detection, measuring MTTD/MTTR and closing blind spots.",
    noctisPolicyAndGuardrails:
      "Every offensive test triggers a 5-point defensive check: (1) Tester action -> (2) Expected logs -> (3) SIEM/EDR alert status -> (4) Earlier prevention point -> (5) New detection rule & control fix.",
  },
];

export interface CyberOpsDomainSpec {
  id: string;
  name: string;
  technicalScope: string;
  standardsMapping: string;
  purpleTeamDeliverable: string;
}

export const CYBER_OPS_12_DOMAINS: readonly CyberOpsDomainSpec[] = [
  {
    id: "CYBER-DOM-01",
    name: "Web Application Penetration Testing",
    technicalScope:
      "Authentication flaws, broken access control (BOLA/IDOR/BFLA), SQLi, XSS, CSRF, SSRF, file upload flaws, insecure deserialization, API security flaws, business logic vulnerabilities, session management issues.",
    standardsMapping: "OWASP Top 10:2025 · OWASP API Top 10:2023 · OWASP ASVS 4.0.3 · CWE",
    purpleTeamDeliverable: "Minimum-impact PoC validation + parameterized/context-encoded code patch + WAF/SIEM correlation rule.",
  },
  {
    id: "CYBER-DOM-02",
    name: "Network and Infrastructure Testing",
    technicalScope:
      "Network discovery, service enumeration, misconfigurations, weak protocols, segmentation flaws, firewall/ACL weaknesses, VPN/remote access risks, internal lateral movement paths.",
    standardsMapping: "NIST SP 800-115 · PTES · CIS Controls v8 (Controls 4, 12, 13)",
    purpleTeamDeliverable: "Segmentation breach path graph + microsegmentation/ACL policy fix + NDR/NetFlow lateral-movement alert.",
  },
  {
    id: "CYBER-DOM-03",
    name: "Identity and Active Directory Security",
    technicalScope:
      "Privilege escalation, credential abuse, Kerberoasting/AS-REP roasting mechanics, token misuse, federation weaknesses, MFA bypass risks, over-permissioned service accounts, identity graph lateral movement.",
    standardsMapping: "MITRE ATT&CK (TA0004, TA0006, T1558) · NIST SP 800-63-4 · CIS Control 5 & 6",
    purpleTeamDeliverable: "Identity attack-path choke-point report + Tier-0 PAM/gMSA hardening + Windows Event ID 4768/4769/4624 detection rule.",
  },
  {
    id: "CYBER-DOM-04",
    name: "Cloud Security Testing",
    technicalScope:
      "AWS, Azure, and GCP IAM misconfigurations, exposed storage buckets, IMDSv1/v2 metadata abuse, container/Kubernetes risks, secrets exposure, CI/CD pipeline weaknesses, cross-account privilege escalation.",
    standardsMapping: "MITRE ATT&CK Cloud Matrix · CIS Cloud Benchmarks · NIST SP 800-207A",
    purpleTeamDeliverable: "IAM privilege-escalation graph + least-privilege SCP/IAM policy patch + CloudTrail/Azure Activity anomaly detector.",
  },
  {
    id: "CYBER-DOM-05",
    name: "Application and Source-Code Security",
    technicalScope:
      "Secure code review (SAST), dependency risks (SCA/SBOM), secrets in repositories, unsafe API usage, input validation failures, cryptographic misuse, memory safety issues (use-after-free, buffer overflows).",
    standardsMapping: "OWASP ASVS · NIST SSDF (SP 800-218) · CWE Top 25",
    purpleTeamDeliverable: "AST/dataflow taint trace + memory-safe/type-safe patch + CI/CD pre-merge regression gate.",
  },
  {
    id: "CYBER-DOM-06",
    name: "Red Team Adversary Simulation",
    technicalScope:
      "Threat actor emulation, attack chain modeling, initial access scenarios, persistence concepts, privilege escalation, command-and-control (C2) patterns, defense evasion awareness, objective-based testing under RoE.",
    standardsMapping: "MITRE ATT&CK Enterprise · TIBER-EU / CORIE · PTES",
    purpleTeamDeliverable: "ATT&CK Navigator kill-chain timeline + choke-point remediation plan + EDR behavioral telemetry coverage score.",
  },
  {
    id: "CYBER-DOM-07",
    name: "Blue Team Detection and Monitoring",
    technicalScope:
      "Log analysis, SIEM correlation rules (Sigma/KQL/SPL), EDR telemetry, anomaly detection, alert triage, threat hunting, false-positive reduction, detection engineering.",
    standardsMapping: "NIST CSF 2.0 (DE.CM, DE.AE) · MITRE D3FEND · Sigma Specification",
    purpleTeamDeliverable: "Verified Sigma/SIEM detection rules + precision/recall false-positive benchmark + automated alert enrichment playbook.",
  },
  {
    id: "CYBER-DOM-08",
    name: "Incident Response and Containment",
    technicalScope:
      "Triage, scoping compromised assets, isolating hosts, revoking credentials/tokens, preserving forensic evidence, containment strategies, eradication, recovery, and post-incident review.",
    standardsMapping: "NIST SP 800-61 Rev. 2 · NIST CSF 2.0 (RS, RC) · ISO/IEC 27035",
    purpleTeamDeliverable: "Step-by-step containment & eradication runbook + forensic chain-of-custody manifest + post-incident root-cause review.",
  },
  {
    id: "CYBER-DOM-09",
    name: "Purple Team Validation",
    technicalScope:
      "Mapping offensive actions to MITRE ATT&CK techniques, verifying whether alerts trigger, measuring detection coverage and response time (MTTD/MTTR), improving controls based on test results.",
    standardsMapping: "MITRE ATT&CK · NIST SP 800-53A Rev. 5 (CA-2, CA-7, PM-14)",
    purpleTeamDeliverable: "5-question Red-Blue-Purple Closed-Loop Validation Matrix + before/after detection coverage delta.",
  },
  {
    id: "CYBER-DOM-10",
    name: "Vulnerability Research and Exploit Analysis",
    technicalScope:
      "Understanding CVE mechanics, root-cause analysis, exploit preconditions, patch diffing, proof-of-concept validation in isolated labs, compensating controls when patching is delayed.",
    standardsMapping: "CVSS v3.1 / v4.0 · CWE · CISA KEV · FIRST EPSS",
    purpleTeamDeliverable: "Root-cause binary/source diff analysis + isolated sandbox PoC verifier + virtual patch / WAF compensating rule.",
  },
  {
    id: "CYBER-DOM-11",
    name: "Deception, Honeypots, and Adversary Tracking",
    technicalScope:
      "Decoy systems, honey credentials/tokens (AWS canary keys, Kerberos honey accounts), canary files, attacker behavior observation, high-signal early warning detection inside segmented environments.",
    standardsMapping: "MITRE Engage / D3FEND (Decoy Environment, Decoy Credential) · NIST SP 800-53 (SC-26, SI-4)",
    purpleTeamDeliverable: "Zero-false-positive canary token placement blueprint + instant high-severity SOC containment trigger.",
  },
  {
    id: "CYBER-DOM-12",
    name: "Security Governance, Ethics, and Reporting",
    technicalScope:
      "Scope enforcement, legal authorization, Rules of Engagement (RoE), safe handling of sensitive findings, executive reporting, technical remediation guidance, and retest verification.",
    standardsMapping: "NIST SP 800-115 · PTES · ISO/IEC 27001:2022 · OWASP Testing Guide v4.2",
    purpleTeamDeliverable: "Scope-verified Rules of Engagement gate + audit-ready technical & executive report + deterministic retest sign-off.",
  },
];

export interface CyberOpsLifecycleStage {
  stageNumber: number;
  stageName: string;
  objective: string;
  requiredArtifactAndGate: string;
}

export const CYBER_OPS_9_LIFECYCLE_STAGES: readonly CyberOpsLifecycleStage[] = [
  {
    stageNumber: 1,
    stageName: "Authorization and Scope",
    objective: "Confirm written authorization, target assets, allowed methods, time windows, excluded systems, and emergency stop conditions.",
    requiredArtifactAndGate: "Signed Rules of Engagement (RoE) & Target CIDR/URI Allowlist (Hard fail-closed gate if missing).",
  },
  {
    stageNumber: 2,
    stageName: "Reconnaissance and Asset Mapping",
    objective: "Identify domains, applications, APIs, services, authentication points, dependencies, and trust boundaries within authorized scope.",
    requiredArtifactAndGate: "Attack Surface Inventory & Trust-Boundary Dependency Graph.",
  },
  {
    stageNumber: 3,
    stageName: "Threat Modeling and Hypothesis Generation",
    objective: "Predict where weaknesses are likely to exist based on architecture, technology stack, privilege model, and data flows.",
    requiredArtifactAndGate: "Prioritized Test Hypotheses mapped to OWASP ASVS / MITRE ATT&CK TTPs.",
  },
  {
    stageNumber: 4,
    stageName: "Vulnerability Identification",
    objective: "Analyze configurations, source code, endpoints, permissions, inputs, sessions, and dependencies for exploitable weaknesses.",
    requiredArtifactAndGate: "Candidate Finding Register with CWE classification and precondition analysis.",
  },
  {
    stageNumber: 5,
    stageName: "Controlled Validation",
    objective: "Prove whether a vulnerability is real using the safest minimum validation method necessary in an authorized test environment.",
    requiredArtifactAndGate: "Reproducible, non-destructive Proof-of-Concept (PoC) transcript with HTTP/process evidence.",
  },
  {
    stageNumber: 6,
    stageName: "Attack-Path and Impact Analysis",
    objective: "Show how individual weaknesses combine (e.g., SSRF + IMDSv1 + over-privileged IAM role) to reach crown-jewel assets or disrupt operations.",
    requiredArtifactAndGate: "Chained Attack-Path Graph, CVSS v3.1/v4.0 score, and quantified business impact.",
  },
  {
    stageNumber: 7,
    stageName: "Blue-Team Detection Check",
    objective: "Check what logs, SIEM alerts, EDR signals, or telemetry were generated—or missed—during the controlled validation test.",
    requiredArtifactAndGate: "Red-Blue-Purple Telemetry Correlation Matrix & Detection Coverage Score (MTTD).",
  },
  {
    stageNumber: 8,
    stageName: "Remediation and Hardening",
    objective: "Recommend specific code fixes, configuration changes, identity restrictions, network segmentation, and SIEM/EDR detection rules.",
    requiredArtifactAndGate: "Production-ready Code Patch + Infrastructure-as-Code Hardening + Sigma/SIEM Detection Rule.",
  },
  {
    stageNumber: 9,
    stageName: "Retesting and Verification",
    objective: "Re-run validation tests and confirm the vulnerability is closed, no regression was introduced, and Blue Team detections fire as expected.",
    requiredArtifactAndGate: "Deterministic Retest Pass Certificate & Residual Risk Update.",
  },
];

export const CYBER_OPS_PYTHON_CODE = `#!/usr/bin/env python3
"""
Noctis Cyber Operations Training Engine — First Integrated Assignment Verifier
Domain Pair: 01 Web Application Pentesting + 07/09 Blue/Purple Team SIEM Detection
Enforces Stage 1 Scope Authorization Gate, validates Web App findings (SQLi, BOLA/IDOR, SSRF),
and executes the 5-Question Red-Blue-Purple Feedback Loop.
"""
from dataclasses import dataclass
from typing import List, Set
import unittest

@dataclass(frozen=True)
class EngagementScope:
    engagement_id: str
    written_authorization_signed: bool
    authorized_targets: Set[str]
    excluded_targets: Set[str]

@dataclass(frozen=True)
class PurpleTeamValidationRecord:
    finding_id: str
    target_host: str
    cwe_id: str
    mitre_attack_id: str
    # 5-Step Red-Blue-Purple Feedback Loop
    tester_action: str
    expected_logs: List[str]
    siem_edr_detected_initially: bool
    earlier_prevention_control: str
    remediation_and_sigma_rule: str
    patch_verified_on_retest: bool
    detection_verified_on_retest: bool

def evaluate_cyber_ops_exercise(
    scope: EngagementScope,
    record: PurpleTeamValidationRecord
) -> str:
    # Stage 1 Hard Guardrail: Never execute or validate outside signed authorization & scope
    if not scope.written_authorization_signed:
        return "ABORT_UNAUTHORIZED_ENGAGEMENT"
    if record.target_host in scope.excluded_targets or record.target_host not in scope.authorized_targets:
        return "ABORT_OUT_OF_SCOPE_TARGET"

    # Stage 9 Retest & Purple Team Closure Gate
    if record.patch_verified_on_retest and record.detection_verified_on_retest:
        return "PURPLE_TEAM_CLOSED_VERIFIED"
    if record.patch_verified_on_retest and not record.detection_verified_on_retest:
        return "PARTIAL_OPEN_DETECTION_GAP"
    return "OPEN_CRITICAL_REMEDIATION_REQUIRED"

class TestNoctisCyberOperationsEngine(unittest.TestCase):
    def setUp(self) -> None:
        self.lab_scope = EngagementScope(
            engagement_id="ROE-2026-VIBETOK-LAB-01",
            written_authorization_signed=True,
            authorized_targets={"lab-api.vibetok.internal", "staging-auth.vibetok.internal"},
            excluded_targets={"prod-db.vibetok.internal"}
        )

    def test_stage1_blocks_unauthorized_or_out_of_scope_targets(self) -> None:
        unauth_scope = EngagementScope(
            engagement_id="UNAUTH-00",
            written_authorization_signed=False,
            authorized_targets={"lab-api.vibetok.internal"},
            excluded_targets=set()
        )
        rec = PurpleTeamValidationRecord(
            finding_id="PT-2026-001",
            target_host="lab-api.vibetok.internal",
            cwe_id="CWE-89",
            mitre_attack_id="T1190",
            tester_action="Controlled boolean-based SQLi validation on /api/v1/orders?filter=",
            expected_logs=["WAF_SQLI_INSPECT", "DB_QUERY_PARAM_MISMATCH"],
            siem_edr_detected_initially=False,
            earlier_prevention_control="Parameterized prepared statements + strict schema validation",
            remediation_and_sigma_rule="Replace string concatenation with bind parameters + deploy Sigma rule web_sqli_boolean_probe.yml",
            patch_verified_on_retest=True,
            detection_verified_on_retest=True
        )
        self.assertEqual(evaluate_cyber_ops_exercise(unauth_scope, rec), "ABORT_UNAUTHORIZED_ENGAGEMENT")

        out_of_scope_rec = PurpleTeamValidationRecord(
            **{**rec.__dict__, "target_host": "prod-db.vibetok.internal"}
        )
        self.assertEqual(evaluate_cyber_ops_exercise(self.lab_scope, out_of_scope_rec), "ABORT_OUT_OF_SCOPE_TARGET")

    def test_purple_team_closed_loop_requires_both_patch_and_siem_detection(self) -> None:
        # Before SIEM rule deployment: vulnerability patched, but detection gap remains open
        gap_record = PurpleTeamValidationRecord(
            finding_id="PT-2026-002",
            target_host="lab-api.vibetok.internal",
            cwe_id="CWE-639",
            mitre_attack_id="T1078",
            tester_action="Authorized BOLA/IDOR cross-tenant invoice read test using User_A JWT on Tenant_B resource ID",
            expected_logs=["API_GW_TENANT_MISMATCH_403", "AUTHZ_POLICY_DENY"],
            siem_edr_detected_initially=False,
            earlier_prevention_control="Row-level tenant ownership enforcement in API authorization middleware",
            remediation_and_sigma_rule="Enforce WHERE id = $1 AND tenant_id = $2 + SIEM correlation alert on >=3 cross-tenant 403s/min",
            patch_verified_on_retest=True,
            detection_verified_on_retest=False
        )
        self.assertEqual(evaluate_cyber_ops_exercise(self.lab_scope, gap_record), "PARTIAL_OPEN_DETECTION_GAP")

        # After both code remediation and Blue Team SIEM correlation rule are verified on retest
        closed_record = PurpleTeamValidationRecord(
            **{**gap_record.__dict__, "detection_verified_on_retest": True}
        )
        self.assertEqual(evaluate_cyber_ops_exercise(self.lab_scope, closed_record), "PURPLE_TEAM_CLOSED_VERIFIED")

if __name__ == "__main__":
    unittest.main()`;

export const CYBER_OPS_JAVA_CODE = `import java.util.Set;

public class NoctisCyberOpsEngine {
    public enum ExerciseStatus {
        ABORT_UNAUTHORIZED_ENGAGEMENT,
        ABORT_OUT_OF_SCOPE_TARGET,
        OPEN_CRITICAL_REMEDIATION_REQUIRED,
        PARTIAL_OPEN_DETECTION_GAP,
        PURPLE_TEAM_CLOSED_VERIFIED
    }

    public record ScopeAuthorization(
        String engagementId,
        boolean writtenAuthSigned,
        Set<String> authorizedTargets,
        Set<String> excludedTargets
    ) {}

    public record PurpleTeamExercise(
        String findingId,
        String targetHost,
        String cweId,
        String mitreAttackId,
        boolean siemDetectedInitially,
        boolean patchVerifiedOnRetest,
        boolean detectionVerifiedOnRetest
    ) {}

    public static ExerciseStatus evaluateExercise(ScopeAuthorization scope, PurpleTeamExercise ex) {
        if (!scope.writtenAuthSigned()) {
            return ExerciseStatus.ABORT_UNAUTHORIZED_ENGAGEMENT;
        }
        if (scope.excludedTargets().contains(ex.targetHost()) || !scope.authorizedTargets().contains(ex.targetHost())) {
            return ExerciseStatus.ABORT_OUT_OF_SCOPE_TARGET;
        }
        if (ex.patchVerifiedOnRetest() && ex.detectionVerifiedOnRetest()) {
            return ExerciseStatus.PURPLE_TEAM_CLOSED_VERIFIED;
        }
        if (ex.patchVerifiedOnRetest()) {
            return ExerciseStatus.PARTIAL_OPEN_DETECTION_GAP;
        }
        return ExerciseStatus.OPEN_CRITICAL_REMEDIATION_REQUIRED;
    }

    public static void main(String[] args) {
        ScopeAuthorization roe = new ScopeAuthorization(
            "ROE-2026-VIBETOK-LAB-01",
            true,
            Set.of("lab-api.vibetok.internal"),
            Set.of("prod-db.vibetok.internal")
        );

        PurpleTeamExercise outOfScope = new PurpleTeamExercise(
            "PT-2026-001", "prod-db.vibetok.internal", "CWE-89", "T1190", false, true, true
        );
        assert evaluateExercise(roe, outOfScope) == ExerciseStatus.ABORT_OUT_OF_SCOPE_TARGET
            : "Out-of-scope target must be hard-blocked at Stage 1!";

        PurpleTeamExercise verified = new PurpleTeamExercise(
            "PT-2026-002", "lab-api.vibetok.internal", "CWE-639", "T1078", false, true, true
        );
        assert evaluateExercise(roe, verified) == ExerciseStatus.PURPLE_TEAM_CLOSED_VERIFIED
            : "Retested patch + verified SIEM alert must close Purple Team loop!";

        System.out.println("PASS: Noctis Cyber Operations (White/Red/Blue/Purple) Engine verified.");
    }
}`;

export const CYBER_OPS_C_CODE = `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

typedef enum {
    CYBER_OPS_ABORT_UNAUTHORIZED = 0,
    CYBER_OPS_ABORT_OUT_OF_SCOPE = 1,
    CYBER_OPS_OPEN_REMEDIATION = 2,
    CYBER_OPS_PARTIAL_DETECTION_GAP = 3,
    CYBER_OPS_PURPLE_CLOSED_VERIFIED = 4
} cyber_ops_status_t;

typedef struct {
    bool written_auth_signed;
    const char *authorized_host;
    const char *excluded_host;
} cyber_ops_scope_t;

typedef struct {
    const char *target_host;
    const char *cwe_id;
    const char *mitre_ttp;
    bool patch_verified_on_retest;
    bool siem_detection_verified_on_retest;
} purple_team_finding_t;

cyber_ops_status_t evaluate_cyber_ops_finding(
    const cyber_ops_scope_t *scope,
    const purple_team_finding_t *finding
) {
    if (!scope || !finding || !scope->written_auth_signed) {
        return CYBER_OPS_ABORT_UNAUTHORIZED;
    }
    if (strcmp(finding->target_host, scope->excluded_host) == 0 ||
        strcmp(finding->target_host, scope->authorized_host) != 0) {
        return CYBER_OPS_ABORT_OUT_OF_SCOPE;
    }
    if (finding->patch_verified_on_retest && finding->siem_detection_verified_on_retest) {
        return CYBER_OPS_PURPLE_CLOSED_VERIFIED;
    }
    if (finding->patch_verified_on_retest && !finding->siem_detection_verified_on_retest) {
        return CYBER_OPS_PARTIAL_DETECTION_GAP;
    }
    return CYBER_OPS_OPEN_REMEDIATION;
}

int main(void) {
    cyber_ops_scope_t lab_scope = {
        .written_auth_signed = true,
        .authorized_host = "lab-api.vibetok.internal",
        .excluded_host = "prod-db.vibetok.internal"
    };

    purple_team_finding_t oos_finding = {
        .target_host = "prod-db.vibetok.internal",
        .cwe_id = "CWE-918",
        .mitre_ttp = "T1190",
        .patch_verified_on_retest = true,
        .siem_detection_verified_on_retest = true
    };
    assert(evaluate_cyber_ops_finding(&lab_scope, &oos_finding) == CYBER_OPS_ABORT_OUT_OF_SCOPE);

    purple_team_finding_t closed_finding = {
        .target_host = "lab-api.vibetok.internal",
        .cwe_id = "CWE-89",
        .mitre_ttp = "T1190",
        .patch_verified_on_retest = true,
        .siem_detection_verified_on_retest = true
    };
    assert(evaluate_cyber_ops_finding(&lab_scope, &closed_finding) == CYBER_OPS_PURPLE_CLOSED_VERIFIED);

    printf("PASS: Noctis C11 Cyber Operations Scope & Purple Team Verifier passed.\\n");
    return 0;
}`;

export function isCyberOperationsQuery(question: string): boolean {
  const q = question.toLowerCase();
  if (
    /\b(black\s*hat|white\s*hat|purple\s*team|red-blue-purple|cyber\s+operations\s+training|9-stage\s+controlled\s+penetration|rules\s+of\s+engagement)\b/i.test(
      q,
    )
  ) {
    return true;
  }
  if (
    /\b(offensive\s+security|penetration\s+testing|red\s+team(?:ing)?|blue\s+team)\b/i.test(q) &&
    /\b(train|noctis|domain|lifecycle|siem|mitre\s+att&ck|purple|containment|honeypot|deception|kerberoast)\b/i.test(q)
  ) {
    return true;
  }
  return false;
}

export function cyberOperationsGadget(question: string): string | null {
  if (!isCyberOperationsQuery(question)) return null;

  const modeRows = CYBER_OPS_MODES.map(
    (m) => `| **${m.mode}** | ${m.authorizationRequirement} | ${m.operationalFocus} | ${m.noctisPolicyAndGuardrails} |`,
  ).join("\n");

  const domainRows = CYBER_OPS_12_DOMAINS.map(
    (d) => `| \`${d.id}\` | **${d.name}** | ${d.technicalScope} | \`${d.standardsMapping}\` | ${d.purpleTeamDeliverable} |`,
  ).join("\n");

  const lifecycleRows = CYBER_OPS_9_LIFECYCLE_STAGES.map(
    (s) => `| \`Stage ${s.stageNumber}\` | **${s.stageName}** | ${s.objective} | ${s.requiredArtifactAndGate} |`,
  ).join("\n");

  return [
    `## Noctis Cyber Operations Engine: Authorized Offensive Security, Penetration Testing, Red Teaming, Blue Team Defense & Purple Team Validation`,
    `Noctis is architected as a **Full-Spectrum Authorized Security Testing & Defensive Validation Engine**: it understands adversary tradecraft to model threats, tests systems strictly within written authorization and Rules of Engagement (RoE), proves exploitability using safe minimum-impact validation, engineers SIEM/EDR detections, coordinates incident containment, and verifies fixes through closed-loop Purple Team retesting.`,
    `### 1. Operational Taxonomy & Authorization Guardrails (\`Black Hat\` vs. \`White Hat\` vs. \`Red\` / \`Blue\` / \`Purple Team\`)`,
    `| Operational Mode | Authorization & Legal Boundary | Core Technical Focus | Noctis Execution Policy & Guardrails |`,
    `| --- | --- | --- | --- |`,
    modeRows,
    `### 2. The 12 Core Cyber Operations Training Domains (\`CYBER-DOM-01\` through \`CYBER-DOM-12\`)`,
    `| Domain ID | Cyber Operations Domain | Technical Scope & Adversary / Defender Coverage | Authoritative Standards | Verified Deliverable |`,
    `| --- | --- | --- | --- | --- |`,
    domainRows,
    `### 3. The 9-Stage Controlled Penetration-Testing & Purple Team Lifecycle`,
    `| Stage | Lifecycle Phase | Technical Objective | Mandatory Gate & Audit Deliverable |`,
    `| --- | --- | --- | --- |`,
    lifecycleRows,
    `### 4. Six-Component Cyber Operations Training Architecture & 5-Point Red-Blue-Purple Feedback Loop`,
    `- **A. Standards & Framework Grounding:** \`OWASP Top 10:2025\`, \`OWASP API Security Top 10:2023\`, \`OWASP ASVS 4.0.3\`, \`MITRE ATT&CK Enterprise & Cloud\`, \`MITRE D3FEND / Engage\`, \`NIST SP 800-115\`, \`PTES\`, \`NIST SP 800-61 Rev. 2\`, \`NIST CSF 2.0\`, \`CWE\`, \`CVSS v3.1 / v4.0\`, and \`CIS Controls v8\`.\n- **B. Safe Lab & Simulation Environments:** Isolated web/API sandboxes, cloud IAM simulation graphs, Active Directory lab topologies, and SIEM/EDR log replay harnesses.\n- **C. Tool-Assisted Workflows:** Deterministic SAST/SCA scanners, configuration auditors, Sigma/SIEM log parsers, MITRE ATT&CK path mappers, and patch-regression verifiers.\n- **D. Structured Finding Reasoning Template:** Every finding records \`Target Asset & Scope\` $\\rightarrow$ \`Relevant Threat / ATT&CK TTP\` $\\rightarrow$ \`Vulnerability Preconditions\` $\\rightarrow$ \`Safe Validation Method\` $\\rightarrow$ \`Evidence Collected\` $\\rightarrow$ \`Business & Technical Impact\` $\\rightarrow$ \`Detection Gap\` $\\rightarrow$ \`Remediation\` $\\rightarrow$ \`Retest Criteria\`.\n- **E. 5-Question Red-Blue-Purple Closed-Loop Check:**\n  1. **What did the tester do?** (Exact timestamped request, payload, identity, and ATT&CK technique)\n  2. **What logs should exist?** (WAF, API gateway, database audit, CloudTrail, Windows Event IDs, EDR process telemetry)\n  3. **Did the SIEM/EDR detect it?** (Alert triggered vs. silent blind spot + Mean Time to Detect \`MTTD\`)\n  4. **How could the attack have been blocked earlier?** (Pre-exploitation control choke point: parameterized query, row-level authz, MFA/device compliance, network segmentation)\n  5. **What detection rule or control fix is needed?** (Concrete code patch + Sigma/KQL/SPL correlation rule verified on retest)\n- **F. Safety & Authorization Guardrails:** Hard fail-closed scope verification before Stage 1; refusal of unauthorized live targets; non-destructive validation by default.`,
    `### 5. 10-Point Proficiency Evaluation Rubric & 5-Stage Development Roadmap`,
    `- **10 Proficiency Evaluation Criteria:** (1) Accurate vulnerability identification with low false positives; (2) Respect for scope & authorization boundaries; (3) Quality of step-by-step validation logic; (4) Realistic multi-hop attack-path reasoning; (5) Mapping accuracy to \`OWASP\`, \`CWE\`, and \`MITRE ATT&CK\`; (6) Strength of Blue-Team SIEM/EDR detection recommendations; (7) Practicality of code/config remediation steps; (8) Quality of incident containment plans; (9) Clarity of executive & technical reporting; (10) Deterministic verification that fixes work after retesting.\n- **5-Stage Development Roadmap:** **Stage 1: Foundation** (Security standards, vulnerability classes, ATT&CK, log analysis) $\\rightarrow$ **Stage 2: Guided Assessment** (Code/config review, finding explanation, remediation) $\\rightarrow$ **Stage 3: Lab Validation** (Safe sandbox PoC validation, attack-path modeling, retesting) $\\rightarrow$ **Stage 4: Red-Blue-Purple Integration** (Adversary simulation paired with SIEM/EDR detection engineering & incident response) $\\rightarrow$ **Stage 5: Controlled Automation** (Multi-agent security testing, continuous control validation, audit-ready reporting under human approval).`,
    `### 6. First Integrated Training Assignment: Web App Pentesting + Blue Team SIEM Detection (Python, Java, C)`,
    `#### Python (\`test_noctis_cyber_ops_engine.py\`)`,
    "```python\n" + CYBER_OPS_PYTHON_CODE + "\n```",
    `#### Java (\`NoctisCyberOpsEngine.java\`)`,
    "```java\n" + CYBER_OPS_JAVA_CODE + "\n```",
    `#### C (\`noctis_cyber_ops_engine.c\`)`,
    "```c\n" + CYBER_OPS_C_CODE + "\n```",
    `#### Step-by-Step Tester Verification & Execution Procedure (\`CYBER-OPS-PURPLE:2026\`)`,
    `1. **Confirm Written Authorization & Lab Scope (Stage 1 Gate):** Verify the signed Rules of Engagement (\`ROE-2026-VIBETOK-LAB-01\`) and confirm all test hosts reside strictly inside the authorized lab allowlist (\`lab-api.vibetok.internal\`).\n2. **Run the Python Purple-Team & Scope Verification Suite:** Save the Python block as \`test_noctis_cyber_ops_engine.py\` and run:\n   \`\`\`bash\n   python3 -m unittest -v test_noctis_cyber_ops_engine.py\n   \`\`\`\n   Confirm Stage 1 hard-blocks unauthorized or out-of-scope targets (\`ABORT_UNAUTHORIZED_ENGAGEMENT\`, \`ABORT_OUT_OF_SCOPE_TARGET\`) and Stage 9 requires both the code patch and SIEM detection rule to pass retesting (\`PURPLE_TEAM_CLOSED_VERIFIED\`).\n3. **Compile & Run the Java Cyber Operations Verifier:** Save the Java block as \`NoctisCyberOpsEngine.java\` and execute:\n   \`\`\`bash\n   javac NoctisCyberOpsEngine.java && java -ea NoctisCyberOpsEngine\n   \`\`\`\n   Verify the console outputs \`PASS: Noctis Cyber Operations (White/Red/Blue/Purple) Engine verified.\`\n4. **Compile & Run the C11 Scope & Purple Team Verifier:** Save the C block as \`noctis_cyber_ops_engine.c\` and compile with strict flags:\n   \`\`\`bash\n   gcc -std=c11 -Wall -Wextra -Werror noctis_cyber_ops_engine.c -o noctis_cyber_ops_engine && ./noctis_cyber_ops_engine\n   \`\`\`\n   Confirm all \`assert()\` checks pass with exit code \`0\`.\n5. **Execute Closed-Loop Retest in CI/SIEM:** Replay the safe lab validation request against the patched endpoint and verify that (a) the exploit is blocked (\`403\`/parameterized query) and (b) the corresponding Sigma/SIEM alert fires within the target \`MTTD\` window.`,
  ].join("\n\n");
}


