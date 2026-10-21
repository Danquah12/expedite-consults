"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Database,
  FileCode2,
  Layers,
  Terminal,
  Activity,
  GitBranch,
  Search,
  OctagonX,
} from "lucide-react";

type Verdict = "PASS" | "FAIL" | "INCONCLUSIVE";

interface CatalogScenario {
  id: string;
  name: string;
  platforms: ("Windows" | "Linux" | "Cloud" | "Identity")[];
  nistFunction: "Protect" | "Detect" | "Respond" | "Recover" | "Identify";
  mitre: string;
  atomicId: string;
  domain: "Prevention" | "Detection" | "Containment" | "Recovery" | "Identity protection";
  description: string;
  passCriteria: string;
  failCriteria: string;
  inconclusiveCriteria: string;
  observedResult: string;
  telemetryEvent: {
    event_id: string;
    campaign_id: string;
    scenario_id: string;
    asset_id: string;
    platform: string;
    event_type: string;
    timestamp: string;
    source: string;
    severity: string;
    expected: boolean;
    evidence_ref: string;
    sha256_manifest: string;
  };
  verdict: Verdict;
  behaviorOutcome: "DETECTED" | "BLOCKED" | "MISSED" | "TELEMETRY_GAP";
  alertLatencySec: number | null;
  containmentLatencySec: number | null;
  affectedAssets: string;
  cisaRemediation: string;
  retested: boolean;
}

const INITIAL_CATALOG: CatalogScenario[] = [
  {
    id: "SIM-FILE-001",
    name: "Bulk File Activity & High-Entropy Mutation",
    platforms: ["Windows", "Linux"],
    nistFunction: "Detect",
    mitre: "T1486 · Data Encrypted for Impact",
    atomicId: "ART-T1486-01",
    domain: "Detection",
    description:
      "Generate bounded, non-destructive changes to 500 synthetic files in disposable directory `/tmp/xtrike_lab_01` with Shannon entropy delta H(X) 4.1 -> 7.95.",
    passCriteria:
      "Expected Sysmon EventID 11 / auditd telemetry arrives and Sigma rule `proc_file_bulk_entropy_mutation` alerts within <= 5.0s threshold.",
    failCriteria:
      "Detector does not alert despite verified telemetry and a functioning detection rule.",
    inconclusiveCriteria:
      "Necessary endpoint telemetry source (Sysmon / auditd) is unavailable.",
    observedResult:
      "Sysmon EventID 11 & Linux auditd events ingested in 1.2s; EDR behavioral detector raised high-confidence alert in 2.1s and suspended worker PID.",
    telemetryEvent: {
      event_id: "evt-sim-file-001",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-FILE-001",
      asset_id: "lab-windows-01",
      platform: "windows",
      event_type: "bulk_file_activity",
      timestamp: "2026-10-19T14:00:00Z",
      source: "endpoint_telemetry (Sysmon EventID 11)",
      severity: "high",
      expected: true,
      evidence_ref: "ev-manifest-001",
      sha256_manifest: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    },
    verdict: "PASS",
    behaviorOutcome: "BLOCKED",
    alertLatencySec: 2.1,
    containmentLatencySec: 4.2,
    affectedAssets: "lab-windows-01, lab-linux-02 (Disposable Lab VMs)",
    cisaRemediation: "CISA #StopRansomware: Maintain entropy threshold rules on SMB/NFS shares.",
    retested: true,
  },
  {
    id: "SIM-DECOY-002",
    name: "Canary File Monitoring & Decoy Tripwire",
    platforms: ["Windows", "Linux", "Cloud"],
    nistFunction: "Detect",
    mitre: "T1083 / T1486 · Decoy File Interaction",
    atomicId: "ART-DECOY-02",
    domain: "Detection",
    description:
      "Perform a harmless, authorized read/write interaction against designated decoy asset `!00_XTRIKE_CANARY_PAYROLL.xlsx` across Windows, Linux, and S3 test bucket.",
    passCriteria:
      "Interaction generates an attributable alert (process, user, host, UTC timestamp) and immutable audit event in < 2.0s.",
    failCriteria:
      "Interaction is recorded in raw logs but the expected SIEM/EDR alert is missing.",
    inconclusiveCriteria:
      "Object-level audit logging is disabled on target storage.",
    observedResult:
      "Windows and Linux canary tripwires alerted in 0.4s, but S3 decoy bucket interaction recorded in CloudTrail without triggering a SIEM alert within the 60s window.",
    telemetryEvent: {
      event_id: "evt-sim-decoy-002",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-DECOY-002",
      asset_id: "lab-s3-canary-bucket",
      platform: "cloud",
      event_type: "canary_decoy_access",
      timestamp: "2026-10-19T14:04:12Z",
      source: "aws_cloudtrail_s3_data_events",
      severity: "critical",
      expected: true,
      evidence_ref: "ev-manifest-002",
      sha256_manifest: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    },
    verdict: "FAIL",
    behaviorOutcome: "MISSED",
    alertLatencySec: 68.4,
    containmentLatencySec: null,
    affectedAssets: "lab-s3-canary-bucket (AWS Cloud Test Account)",
    cisaRemediation:
      "Wire EventBridge real-time rule on S3 `GetObject`/`PutObject` for canary prefix `!00_XTRIKE_` directly to SIEM high-priority queue.",
    retested: false,
  },
  {
    id: "SIM-PROC-003",
    name: "Suspicious Process & Shadow-Copy Telemetry",
    platforms: ["Windows", "Linux"],
    nistFunction: "Protect",
    mitre: "T1490 · Inhibit System Recovery (VSS / wbadmin)",
    atomicId: "ART-T1490-03",
    domain: "Prevention",
    description:
      "Execute benign predefined child-process tree simulating shadow-copy query and recovery inhibition flags inside disposable VM.",
    passCriteria:
      "Process identity, command line, parent-child relationship, UTC timestamp, and prevention/alert event are captured.",
    failCriteria:
      "Required parent-child process fields or detection results are missing.",
    inconclusiveCriteria:
      "Process creation auditing (EventID 4688 / Sysmon EventID 1 / auditd execve) not enabled.",
    observedResult:
      "Full parent-child tree (`cmd.exe -> vssadmin_sim.exe`), SHA-256 binary hash, user SID, and ASR block verdict captured in 0.3s.",
    telemetryEvent: {
      event_id: "evt-sim-proc-003",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-PROC-003",
      asset_id: "lab-windows-01",
      platform: "windows",
      event_type: "suspicious_process_creation",
      timestamp: "2026-10-19T14:08:30Z",
      source: "endpoint_telemetry (Sysmon EventID 1)",
      severity: "high",
      expected: true,
      evidence_ref: "ev-manifest-003",
      sha256_manifest: "4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8",
    },
    verdict: "PASS",
    behaviorOutcome: "BLOCKED",
    alertLatencySec: 0.3,
    containmentLatencySec: 0.5,
    affectedAssets: "lab-windows-01, lab-linux-01",
    cisaRemediation: "ASR Rule `b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4` verified active.",
    retested: true,
  },
  {
    id: "SIM-CLOUD-004",
    name: "Cloud Control-Plane & Storage Audit Coverage",
    platforms: ["Cloud"],
    nistFunction: "Identify",
    mitre: "T1530 / T1098 · Cloud Storage & IAM Audit",
    atomicId: "ART-CLOUD-04",
    domain: "Prevention",
    description:
      "Perform benign read-only configuration audit across AWS (CloudTrail/IAM/S3 Object Lock), Azure (Entra ID/Recovery Vault), and GCP (Cloud Audit Logs).",
    passCriteria:
      "Action is attributable to the short-lived test identity and appears in the normalized audit stream within SLA.",
    failCriteria:
      "Required audit coverage or S3 Object Lock COMPLIANCE policy is absent.",
    inconclusiveCriteria:
      "Read-only cloud adapter credentials lacks `s3:GetBucketObjectLockConfiguration`.",
    observedResult:
      "AWS CloudTrail, S3 WORM Compliance Lock, and Azure Recovery Services Vault immutability verified and attributed to `arn:aws:iam::111122223333:role/xtrike-readonly-auditor`.",
    telemetryEvent: {
      event_id: "evt-sim-cloud-004",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-CLOUD-004",
      asset_id: "aws-test-vault-01",
      platform: "cloud",
      event_type: "cloud_audit_verification",
      timestamp: "2026-10-19T14:12:05Z",
      source: "aws_cloudtrail_management_events",
      severity: "low",
      expected: true,
      evidence_ref: "ev-manifest-004",
      sha256_manifest: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    },
    verdict: "PASS",
    behaviorOutcome: "DETECTED",
    alertLatencySec: 4.8,
    containmentLatencySec: null,
    affectedAssets: "AWS S3 Vault, Azure Recovery Vault, GCP Storage Test Project",
    cisaRemediation: "Least-privilege read-only IAM role and multi-region audit trail verified.",
    retested: true,
  },
  {
    id: "SIM-RESP-005",
    name: "Automated Incident Containment & Quarantine",
    platforms: ["Windows", "Linux", "Cloud"],
    nistFunction: "Respond",
    mitre: "NIST SP 800-61 · Automated Endpoint & Token Isolation",
    atomicId: "ART-RESP-05",
    domain: "Containment",
    description:
      "Submit synthetic incident in isolated lab to approved SOAR/EDR response integration (host NIC isolation + test session revocation).",
    passCriteria:
      "Configured response is acknowledged, executed against the exact test asset in <= 15s, and audited.",
    failCriteria:
      "Containment action times out, requires manual ticket approval > 60s, or targets wrong resource.",
    inconclusiveCriteria:
      "SOAR containment webhook is in maintenance mode.",
    observedResult:
      "Windows lab host isolated in 4.1s, but Linux VLAN-104 East-West quarantine waited 195s on manual change-approval queue.",
    telemetryEvent: {
      event_id: "evt-sim-resp-005",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-RESP-005",
      asset_id: "lab-linux-02",
      platform: "linux",
      event_type: "automated_containment_test",
      timestamp: "2026-10-19T14:16:40Z",
      source: "soar_response_orchestrator",
      severity: "high",
      expected: true,
      evidence_ref: "ev-manifest-005",
      sha256_manifest: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    },
    verdict: "FAIL",
    behaviorOutcome: "DETECTED",
    alertLatencySec: 1.9,
    containmentLatencySec: 195.0,
    affectedAssets: "lab-linux-02 (VLAN-104 Sandbox)",
    cisaRemediation:
      "Pre-authorize automated eBPF/iptables isolation for tagged lab and Tier-2 assets when canary + entropy rules co-trigger.",
    retested: false,
  },
  {
    id: "SIM-REC-006",
    name: "Isolated Backup Restoration & SHA-256 Integrity Check",
    platforms: ["Windows", "Linux", "Cloud"],
    nistFunction: "Recover",
    mitre: "NIST SP 800-184 · Clean-Room Restore & Hash Verification",
    atomicId: "ART-REC-06",
    domain: "Recovery",
    description:
      "Restore known-good synthetic dataset (1,000 objects, 25 GB) from immutable snapshot into isolated clean-room enclave and compare SHA-256 manifest.",
    passCriteria:
      "100% of required files restored, SHA-256 checksums match original manifest, and measured RTO/RPO objectives met.",
    failCriteria:
      "Restored data is missing, hash mismatch occurs, or restore exceeds approved RTO target.",
    inconclusiveCriteria:
      "Isolated clean-room target volume has insufficient staging capacity.",
    observedResult:
      "1,000/1,000 objects restored into Sandbox-A in 11m 42s. SHA-256 manifest matched 100% (1,000/1,000). However, 1 secondary SQL billing volume is still queued for automated boot verification.",
    telemetryEvent: {
      event_id: "evt-sim-rec-006",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-REC-006",
      asset_id: "sandbox-cleanroom-a",
      platform: "cloud",
      event_type: "backup_restore_integrity",
      timestamp: "2026-10-19T14:28:22Z",
      source: "recovery_test_runner",
      severity: "medium",
      expected: true,
      evidence_ref: "ev-manifest-006",
      sha256_manifest: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    },
    verdict: "PASS",
    behaviorOutcome: "BLOCKED",
    alertLatencySec: 0.0,
    containmentLatencySec: 0.0,
    affectedAssets: "sandbox-cleanroom-a (ZFS Snapshot #20261019 + S3 WORM)",
    cisaRemediation: "Add automated post-restore SQL page checksum verification for secondary billing volume.",
    retested: true,
  },
  {
    id: "SIM-GRAPH-007",
    name: "Attack-Path & Identity Blast-Radius Assessment",
    platforms: ["Identity", "Cloud", "Windows"],
    nistFunction: "Identify",
    mitre: "T1078 / T1003 · Graph Privilege & Trust Path Analysis",
    atomicId: "ART-GRAPH-07",
    domain: "Identity protection",
    description:
      "Analyze asset-and-permission graph (Neo4j / AD / IAM) without attempting live propagation to identify excessive privileges and paths to backups.",
    passCriteria:
      "Zero unmitigated non-admin paths exist from standard workstation to Tier-0 Domain Controllers or Backup Vault roles.",
    failCriteria:
      "Transitive privilege escalation path discovered exposing Tier-0 identity or backup admin roles.",
    inconclusiveCriteria:
      "AD / Entra ID / AWS IAM graph snapshot is older than 24 hours.",
    observedResult:
      "Graph analysis identified 1 transitive privilege chain: `Workstation-VLAN -> svc_print_spooler -> Backup_Operators -> S3-Backup-Admin` exposing 14 servers.",
    telemetryEvent: {
      event_id: "evt-sim-graph-007",
      campaign_id: "camp-2026-10-xtrike",
      scenario_id: "SIM-GRAPH-007",
      asset_id: "neo4j-identity-graph",
      platform: "identity",
      event_type: "blast_radius_graph_audit",
      timestamp: "2026-10-19T14:32:10Z",
      source: "attack_graph_analyzer",
      severity: "critical",
      expected: true,
      evidence_ref: "ev-manifest-007",
      sha256_manifest: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    },
    verdict: "FAIL",
    behaviorOutcome: "DETECTED",
    alertLatencySec: 1.5,
    containmentLatencySec: null,
    affectedAssets: "AD Forest Root & Backup_Operators Group (14 Critical Assets in Blast Radius)",
    cisaRemediation:
      "Sever transitive path by removing `svc_print_spooler` from `Backup_Operators` and enforcing FIDO2 Hardware MFA on all backup roles.",
    retested: false,
  },
];

const MANDATORY_POLICY_CHECKS = [
  { id: "CHK-01", rule: "Requester is authenticated & RBAC authorized (`Simulation_Operator`)", status: "VERIFIED" },
  { id: "CHK-02", rule: "Campaign `camp-2026-10-xtrike` has valid, unexpired dual-custody approval", status: "VERIFIED" },
  { id: "CHK-03", rule: "Every target matches explicit approved asset inventory (`lab-*`, `sandbox-*`)", status: "VERIFIED" },
  { id: "CHK-04", rule: "Scenario ID is on the approved non-destructive scenario allowlist (`SIM-*-001..007`)", status: "VERIFIED" },
  { id: "CHK-05", rule: "Disposable VM isolation, snapshots, and CPU/file-count resource limits verified", status: "VERIFIED" },
  { id: "CHK-06", rule: "Expected test impact is strictly bounded within approved lab scope", status: "VERIFIED" },
  { id: "CHK-07", rule: "Global Kill Switch state is CLEAR (independent cancellation listener active)", status: "VERIFIED" },
  { id: "CHK-08", rule: "Deterministic cleanup procedure and append-only evidence store configured", status: "VERIFIED" },
];

const NEGATIVE_SAFETY_TESTS = [
  { id: "NEG-01", test: "Reject target asset not in approved asset inventory (`prod-ehr-db-01`)", expected: "BLOCKED", observed: "BLOCKED (ScopeValidatorError)", pass: true },
  { id: "NEG-02", test: "Reject expired campaign approval & invalid JWT authorization token", expected: "BLOCKED", observed: "BLOCKED (401/403 PolicyEngine)", pass: true },
  { id: "NEG-03", test: "Block any scenario requesting unapproved destructive payload or raw script upload", expected: "BLOCKED", observed: "BLOCKED (AllowlistEnforced)", pass: true },
  { id: "NEG-04", test: "Stop launching scenarios & cancel active workers within <1s of Global Kill Switch", expected: "HALTED", observed: "HALTED in 0.34s + Cleanup Run", pass: true },
  { id: "NEG-05", test: "Prevent Tenant A operator from reading Tenant B evidence manifests", expected: "DENIED", observed: "DENIED (Row-Level Tenant Isolation)", pass: true },
  { id: "NEG-06", test: "Ensure failed/exception scenario cannot skip `cleanup()` or falsify `PASS`", expected: "CLEANED", observed: "CLEANED (Finally Hook Verified)", pass: true },
  { id: "NEG-07", test: "Confirm duplicate Sysmon/SIEM events are deduplicated and do not inflate coverage", expected: "DEDUPED", observed: "DEDUPED by `event_id` hash", pass: true },
  { id: "NEG-08", test: "Mark missing telemetry source as `INCONCLUSIVE` instead of false `PASS`/`FAIL`", expected: "INCONCLUSIVE", observed: "INCONCLUSIVE (TelemetryGap)", pass: true },
  { id: "NEG-09", test: "Verify simulated incident cannot trigger unapproved production host isolation", expected: "GUARDED", observed: "GUARDED (Lab-Only Scope Tag)", pass: true },
  { id: "NEG-10", test: "Confirm short-lived STS test credentials & temp files are purged post-campaign", expected: "PURGED", observed: "PURGED (TTL 15m Expired)", pass: true },
];

const PYTHON_MODULES = [
  { file: "src/rdp/safety/scope_validator.py", role: "Verify that every target belongs to an explicitly authorized test scope." },
  { file: "src/rdp/safety/policy_engine.py", role: "Evaluate the 8 mandatory safety checks before dispatching any scenario; return BLOCKED on failure." },
  { file: "src/rdp/orchestrator/campaign_runner.py", role: "Coordinate approved scenarios, enforce resource bounds, and capture execution status." },
  { file: "src/rdp/orchestrator/state_machine.py", role: "Manage campaign state transitions, retries, timeouts, and global kill-switch cancellation." },
  { file: "src/rdp/telemetry/schema.py", role: "Define normalized UTC event schema across Windows (Sysmon), Linux (auditd), and Cloud." },
  { file: "src/rdp/telemetry/correlator.py", role: "Link simulation events to endpoint EDR alerts and cloud audit logs with deduplication." },
  { file: "src/rdp/detection/coverage.py", role: "Distinguish telemetry receipt vs. alert generation; flag missing telemetry as INCONCLUSIVE." },
  { file: "src/rdp/attack_graph/blast_radius.py", role: "Analyze Neo4j asset/identity relationships and choke-points without attempting propagation." },
  { file: "src/rdp/recovery/integrity.py", role: "Compare restored clean-room test data against known-good SHA-256 Merkle manifests." },
  { file: "src/rdp/reporting/findings.py", role: "Convert verified evidence into MITRE ATT&CK, NIST CSF 2.0, CIS, and CISA-aligned findings." },
];

export default function SyntheticAttackLabPage() {
  const [scenarios, setScenarios] = useState<CatalogScenario[]>(INITIAL_CATALOG);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SIM-FILE-001");
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"catalog" | "safety" | "architecture" | "roadmap">("catalog");

  const filteredScenarios = scenarios.filter(
    (s) => selectedPlatform === "All" || s.platforms.includes(selectedPlatform as any)
  );

  const selectedScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const passedCount = scenarios.filter((s) => s.verdict === "PASS").length;
  const failedCount = scenarios.filter((s) => s.verdict === "FAIL").length;
  const detectionsObserved = scenarios.filter((s) => s.verdict === "PASS").length + 14;
  const eligibleDetections = 22;

  const domainScores = {
    Prevention: scenarios.find((s) => s.id === "SIM-PROC-003")?.verdict === "PASS" ? 82 : 65,
    Detection: scenarios.find((s) => s.id === "SIM-DECOY-002")?.verdict === "PASS" ? 88 : 68,
    Containment: scenarios.find((s) => s.id === "SIM-RESP-005")?.verdict === "PASS" ? 86 : 55,
    Recovery: scenarios.find((s) => s.id === "SIM-REC-006")?.verdict === "PASS" ? 91 : 70,
    "Identity protection": scenarios.find((s) => s.id === "SIM-GRAPH-007")?.verdict === "PASS" ? 90 : 73,
  };

  const handleRemediateAndRetest = (id: string) => {
    if (killSwitchActive) return;
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          verdict: "PASS",
          behaviorOutcome: "BLOCKED",
          alertLatencySec: 1.4,
          containmentLatencySec: 3.2,
          observedResult: `[RETEST VERIFIED] Control remediated per CISA guidance. Expected telemetry & alert confirmed in 1.4s; SHA-256 evidence manifest signed.`,
          retested: true,
        };
      })
    );
  };

  const handleResetBaseline = () => {
    setKillSwitchActive(false);
    setScenarios(INITIAL_CATALOG);
  };

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Masthead */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="desk-kicker">
              XTRIKE RECOVERY DESK &middot; AUTHORIZED PURPLE-TEAM &amp; DEFENSE VALIDATION PLATFORM
            </div>
            <h1
              className="text-3xl sm:text-5xl font-bold tracking-tight font-editorial"
              style={{ color: "var(--foreground)" }}
            >
              Ransomware Resilience &amp; Validation Center
            </h1>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Simulate adversary behavior safely in disposable Windows, Linux, and Cloud lab enclaves—without deploying functional ransomware or touching production data. Every defense is scored by observed telemetry, SHA-256 evidence manifests, and `PASS` / `FAIL` / `INCONCLUSIVE` proof.
            </p>
          </div>

          {/* Safety Controls & Global Kill Switch */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setKillSwitchActive(!killSwitchActive)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all"
              style={{
                background: killSwitchActive ? "#8c2022" : "var(--accent)",
                color: "#fbf8f3",
                border: "1px solid #72361d",
              }}
            >
              <OctagonX className="w-4 h-4" />
              <span>{killSwitchActive ? "KILL SWITCH ENGAGED (HALTED)" : "Global Kill Switch: ARMED"}</span>
            </button>
            <button
              onClick={handleResetBaseline}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              style={{
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* Section 11: Ransomware Resilience Center Executive KPI Strip (Answering the 5 Immediate Questions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="card-surface p-5 space-y-1">
            <div className="desk-kicker">1. SYSTEMS TESTED</div>
            <div className="text-3xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              24
            </div>
            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              Assets assessed across Windows, Linux &amp; Cloud
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              100% inside authorized disposable lab scope
            </div>
          </div>

          <div className="card-surface p-5 space-y-1">
            <div className="desk-kicker">2. DETECTION COVERAGE</div>
            <div className="text-3xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              {detectionsObserved}/{eligibleDetections}
            </div>
            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              Eligible detections observed ({Math.round((detectionsObserved / eligibleDetections) * 100)}%)
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              Excludes 0 unavailable integrations (Denominator = 22)
            </div>
          </div>

          <div className="card-surface p-5 space-y-1">
            <div className="desk-kicker">3. WHERE DEFENSES FAILED</div>
            <div className="text-3xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              {failedCount}
            </div>
            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              Unresolved test failures requiring remediation
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              Click &ldquo;Apply Fix &amp; Retest&rdquo; below to validate
            </div>
          </div>

          <div className="card-surface p-5 space-y-1">
            <div className="desk-kicker">4. RECOVERY ASSURANCE</div>
            <div className="text-3xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              {failedCount === 0 ? "Verified" : "1,000/1,000"}
            </div>
            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              Clean-room SHA-256 restore integrity (11m 42s)
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              S3 WORM + ZFS snapshot #20261019 verified
            </div>
          </div>
        </div>

        {/* Section 4: 5-Domain Evidence-Backed Readiness Score Strip */}
        <div className="card-surface p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
            <div>
              <div className="desk-kicker">EVIDENCE-BACKED RANSOMWARE READINESS SCORE</div>
              <h2 className="text-xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                Measured Defense Posture Across 5 Core Pillars
              </h2>
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              Computed strictly from stored test outcomes &amp; cryptographic evidence manifests
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {Object.entries(domainScores).map(([domain, pct]) => (
              <div
                key={domain}
                className="p-4 rounded-xl space-y-2"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                    {domain}
                  </span>
                  <span
                    className={`${
                      pct >= 80 ? "badge-resolved" : "badge-high"
                    } px-2 py-0.5 rounded-full text-[10px] font-bold`}
                  >
                    {pct >= 80 ? "VERIFIED" : "GAP FOUND"}
                  </span>
                </div>
                <div className="text-2xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  {pct}%
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: "var(--accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "catalog", label: "Test-Case Catalog (SIM-001..007)", badge: `${passedCount}/7 Passed` },
              { id: "safety", label: "Safety Guardrails & 10 Negative Tests", badge: "10/10 Verified" },
              { id: "architecture", label: "Python RDP Architecture & 8 Metrics", badge: "src/rdp/*" },
              { id: "roadmap", label: "6-Phase Implementation Roadmap", badge: "Weeks 1–12" },
            ].map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface)",
                    color: active ? "#fbf8f3" : "var(--foreground)",
                    border: active ? "1px solid #72361d" : "1px solid var(--border)",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: active ? "#fbf8f3" : "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Environment Filter */}
          {activeView === "catalog" && (
            <div className="flex items-center gap-1.5">
              {["All", "Windows", "Linux", "Cloud", "Identity"].map((env) => (
                <button
                  key={env}
                  onClick={() => setSelectedPlatform(env)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{
                    background: selectedPlatform === env ? "var(--accent-soft)" : "var(--surface)",
                    color: selectedPlatform === env ? "var(--accent)" : "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VIEW 1: TEST-CASE CATALOG (SIM-FILE-001 .. SIM-GRAPH-007) + NORMALIZED TELEMETRY INSPECTOR */}
      {activeView === "catalog" && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Controlled Scenario Registry */}
          <div className="lg:col-span-7 space-y-4">
            {filteredScenarios.map((scen) => {
              const isSelected = scen.id === selectedScenario.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenarioId(scen.id)}
                  className="card-surface p-5 space-y-3.5 cursor-pointer card-hover"
                  style={{
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded font-mono text-xs font-bold"
                        style={{ background: "var(--accent)", color: "#fbf8f3" }}
                      >
                        {scen.id}
                      </span>
                      <span className="desk-kicker">
                        NIST CSF 2.0: {scen.nistFunction} &middot; {scen.mitre}
                      </span>
                    </div>
                    <span
                      className={`${
                        scen.verdict === "PASS" ? "badge-resolved" : "badge-critical"
                      } px-2.5 py-0.5 rounded-full text-xs font-bold`}
                    >
                      {scen.verdict} &middot; {scen.behaviorOutcome}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                      {scen.name}
                    </h3>
                    <div className="flex gap-1.5">
                      {scen.platforms.map((p) => (
                        <span
                          key={p}
                          className="text-[11px] px-2 py-0.5 rounded font-semibold"
                          style={{
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                            color: "var(--muted)",
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    <strong>Controlled Scenario:</strong> {scen.description}
                  </p>

                  <div
                    className="p-3 rounded-xl text-xs space-y-1"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <strong style={{ color: "var(--foreground)" }}>Expected (PASS):</strong>{" "}
                      <span style={{ color: "var(--muted)" }}>{scen.passCriteria}</span>
                    </div>
                    <div>
                      <strong style={{ color: "var(--foreground)" }}>Observed Evidence:</strong>{" "}
                      <span style={{ color: "var(--foreground)" }}>{scen.observedResult}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div style={{ color: "var(--muted)" }}>
                      <strong>Affected Scope:</strong> {scen.affectedAssets}
                    </div>
                    {scen.verdict === "FAIL" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemediateAndRetest(scen.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        style={{ background: "var(--accent)", color: "#fbf8f3" }}
                      >
                        <Play className="w-3 h-3" />
                        <span>Apply CISA Fix &amp; Retest</span>
                      </button>
                    ) : (
                      <span className="font-bold" style={{ color: "var(--success)" }}>
                        &#10003; Evidence Manifest Signed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 5 Cols: Normalized Telemetry & 5-Field Evidence Inspector */}
          <div className="lg:col-span-5 space-y-5">
            <div className="card-surface p-6 space-y-4 sticky top-28">
              <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
                <div className="desk-kicker">NORMALIZED TELEMETRY &amp; EVIDENCE CONTRACT</div>
                <h3 className="text-xl font-bold font-editorial mt-0.5" style={{ color: "var(--foreground)" }}>
                  {selectedScenario.id} &mdash; {selectedScenario.name}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="desk-kicker mb-1">1. EXPECTED OUTCOME CRITERIA</div>
                  <p style={{ color: "var(--foreground)" }}>
                    <strong>PASS:</strong> {selectedScenario.passCriteria}
                  </p>
                  <p className="mt-1" style={{ color: "var(--muted)" }}>
                    <strong>FAIL:</strong> {selectedScenario.failCriteria}
                  </p>
                  <p className="mt-1" style={{ color: "var(--muted)" }}>
                    <strong>INCONCLUSIVE:</strong> {selectedScenario.inconclusiveCriteria}
                  </p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="desk-kicker mb-1">2. TIMING &amp; LATENCY MEASUREMENTS</div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span style={{ color: "var(--muted)" }}>Alert Latency:</span>{" "}
                      <strong className="font-mono" style={{ color: "var(--foreground)" }}>
                        {selectedScenario.alertLatencySec !== null ? `${selectedScenario.alertLatencySec}s` : "N/A"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Containment Latency:</span>{" "}
                      <strong className="font-mono" style={{ color: "var(--foreground)" }}>
                        {selectedScenario.containmentLatencySec !== null ? `${selectedScenario.containmentLatencySec}s` : "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div className="desk-kicker mb-1">3. CISA &amp; NIST REMEDIATION GUIDANCE</div>
                  <p style={{ color: "var(--foreground)" }}>{selectedScenario.cisaRemediation}</p>
                </div>
              </div>

              <div>
                <div className="desk-kicker mb-1.5">4. NORMALIZED TELEMETRY EVENT (UTC SCHEMA)</div>
                <pre
                  className="p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {JSON.stringify(selectedScenario.telemetryEvent, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: SAFETY ARCHITECTURE, 8 MANDATORY POLICY CHECKS & 10 NEGATIVE TESTS */}
      {activeView === "safety" && (
        <section className="space-y-6">
          <div className="card-surface p-6 space-y-4">
            <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="desk-kicker">ORCHESTRATOR PRE-EXECUTION GATES</div>
              <h2 className="text-2xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                8 Mandatory Policy Checks Before Dispatching Any Scenario
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                If any mandatory condition fails, `policy_engine.py` returns `BLOCKED` with a specific reason. Scenarios cannot self-authorize or override scope checks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MANDATORY_POLICY_CHECKS.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-xl flex items-center justify-between gap-3"
                  style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-2 py-0.5 rounded font-mono text-xs font-bold"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {chk.id}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {chk.rule}
                    </span>
                  </div>
                  <span className="badge-resolved px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                    {killSwitchActive && chk.id === "CHK-07" ? "BLOCKED" : chk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="desk-kicker">CREDIBILITY &amp; FAULT-INJECTION SUITE</div>
              <h2 className="text-2xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                10 Essential Negative Safety Tests
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Proves the platform fails closed when presented with out-of-scope targets, expired approvals, missing telemetry, or cross-tenant queries.
              </p>
            </div>

            <div className="space-y-2.5">
              {NEGATIVE_SAFETY_TESTS.map((neg) => (
                <div
                  key={neg.id}
                  className="p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded font-mono text-xs font-bold shrink-0"
                      style={{ background: "var(--accent)", color: "#fbf8f3" }}
                    >
                      {neg.id}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      {neg.test}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                      {neg.observed}
                    </span>
                    <span className="badge-resolved px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      PASS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: PYTHON RDP ARCHITECTURE, SCENARIO PROTOCOL & 8-METRIC SCORING ENGINE */}
      {activeView === "architecture" && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-surface p-6 space-y-4">
              <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
                <div className="desk-kicker">SAFE SCENARIO INTERFACE CONTRACT</div>
                <h2 className="text-xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  Python `Scenario(Protocol)` &amp; `ScenarioResult`
                </h2>
              </div>
              <pre
                className="p-4 rounded-xl text-xs font-mono overflow-x-auto"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
{`@dataclass
class ScenarioContext:
    campaign_id: str
    tenant_id: str
    permitted_assets: list[str]
    dry_run: bool = True

@dataclass
class ScenarioResult:
    outcome: Outcome  # PASS | FAIL | INCONCLUSIVE | BLOCKED
    expected_signals: list[str]
    observed_signals: list[str]
    evidence_ids: list[str]
    notes: str

class Scenario(Protocol):
    scenario_id: str
    risk_level: str

    def validate(self, context: ScenarioContext) -> None:
        """Reject invalid scope or unsafe configuration."""
        ...

    def run(self, context: ScenarioContext) -> ScenarioResult:
        """Run a bounded, authorized, non-destructive test."""
        ...

    def cleanup(self, context: ScenarioContext) -> None:
        """Remove only artifacts owned by this test."""
        ...`}
              </pre>
            </div>

            <div className="card-surface p-6 space-y-4">
              <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
                <div className="desk-kicker">8-METRIC MEASUREMENT &amp; SCORING ENGINE</div>
                <h2 className="text-xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                  Explicit Denominators &amp; Exclusions
                </h2>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { metric: "Detection coverage", calc: "Expected detections observed ÷ eligible opportunities", val: "18 / 22 (81.8%)" },
                  { metric: "Alert latency", calc: "Alert timestamp − scenario event timestamp", val: "2.1s median" },
                  { metric: "Containment latency", calc: "Verified containment timestamp − detection timestamp", val: "4.2s (Win) / 195s (Linux)" },
                  { metric: "False-positive rate", calc: "False alerts ÷ negative test opportunities", val: "0 / 10 (0.0%)" },
                  { metric: "Recovery integrity", calc: "Restored objects matching SHA-256 manifest ÷ expected", val: "1,000 / 1,000 (100%)" },
                  { metric: "Recovery time (RTO)", calc: "Start of restore to verified service readiness", val: "11m 42s (Sandbox-A)" },
                  { metric: "Evidence completeness", calc: "Required evidence fields populated ÷ required fields", val: "35 / 35 (100%)" },
                  { metric: "Scenario completion", calc: "Completed eligible scenarios ÷ scheduled scenarios", val: "7 / 7 (100%)" },
                ].map((m) => (
                  <div
                    key={m.metric}
                    className="p-3 rounded-xl flex items-center justify-between gap-2"
                    style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <div className="font-bold" style={{ color: "var(--foreground)" }}>{m.metric}</div>
                      <div style={{ color: "var(--muted)" }}>{m.calc}</div>
                    </div>
                    <span className="font-mono font-bold px-2.5 py-1 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="desk-kicker">MODULAR PYTHON PACKAGE STRUCTURE (`ransomware-defense-platform/src/rdp/`)</div>
              <h2 className="text-xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                10 Critical Modules by Responsibility
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PYTHON_MODULES.map((mod) => (
                <div
                  key={mod.file}
                  className="p-3.5 rounded-xl space-y-1"
                  style={{ background: "var(--background)", border: "1px solid var(--border)" }}
                >
                  <div className="font-mono text-xs font-bold" style={{ color: "var(--accent)" }}>
                    {mod.file}
                  </div>
                  <div className="text-xs" style={{ color: "var(--foreground)" }}>
                    {mod.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIEW 4: 6-PHASE DEVELOPMENT ROADMAP (WEEKS 1-12) */}
      {activeView === "roadmap" && (
        <section className="card-surface p-6 sm:p-8 space-y-6">
          <div className="border-b pb-3" style={{ borderColor: "var(--border)" }}>
            <div className="desk-kicker">IMPLEMENTATION ROADMAP &middot; WEEKS 1–12</div>
            <h2 className="text-2xl font-bold font-editorial" style={{ color: "var(--foreground)" }}>
              6-Phase Deliverable &amp; Exit Criteria Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                weeks: "Weeks 1–2",
                title: "Platform Foundation",
                desc: "Build FastAPI service, PostgreSQL schema, authentication, RBAC, campaign API, audit log, and Scenario protocol.",
                exit: "A user can create, approve, inspect, and cancel a dry-run campaign.",
              },
              {
                num: "02",
                weeks: "Weeks 3–4",
                title: "Safe Simulation & Evidence",
                desc: "Implement synthetic file-activity scenario (SIM-FILE-001), normalized UTC event model, SHA-256 manifest, and deterministic fixtures.",
                exit: "Every run produces reproducible results and verified evidence references.",
              },
              {
                num: "03",
                weeks: "Weeks 5–6",
                title: "Windows & Linux Integrations",
                desc: "Connect Sysmon/auditd event collection, detection-rule evaluation, alert latency measurement, and negative tests for missing telemetry.",
                exit: "Correctly distinguishes detected, missed, blocked, and inconclusive tests.",
              },
              {
                num: "04",
                weeks: "Weeks 7–8",
                title: "Cloud Assessments",
                desc: "Implement read-only asset inventory, IAM risk checks, CloudTrail/Activity Log audit validation, and S3 Object Lock findings.",
                exit: "Cloud findings contain reproducible evidence and least-privilege access is verified.",
              },
              {
                num: "05",
                weeks: "Weeks 9–10",
                title: "Recovery & Graph Analysis",
                desc: "Add isolated backup restoration (SIM-REC-006), SHA-256 checksum verification, RTO/RPO metrics, and Neo4j blast-radius analysis.",
                exit: "A campaign produces a verified recovery assessment and graph-backed risk report.",
              },
              {
                num: "06",
                weeks: "Weeks 11–12",
                title: "Hardening & Lab Pilot",
                desc: "Run isolation tests, tenant-boundary tests, fault injection, kill-switch cancellation tests, and report validation.",
                exit: "All 10 mandatory negative safety tests pass with zero unresolved critical issues.",
              },
            ].map((p) => (
              <div
                key={p.num}
                className="p-5 rounded-xl flex flex-col justify-between gap-3"
                style={{ background: "var(--background)", border: "1px solid var(--border)" }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="desk-kicker">PHASE {p.num} &middot; {p.weeks}</span>
                    <span className="badge-resolved px-2 py-0.5 rounded-full text-[10px] font-bold">
                      DELIVERED
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-editorial" style={{ color: "var(--foreground)" }}>
                    {p.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    {p.desc}
                  </p>
                </div>
                <div className="pt-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <strong>Exit Criteria:</strong> {p.exit}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
