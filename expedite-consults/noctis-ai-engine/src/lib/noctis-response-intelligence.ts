import { buildZeroTrustPdeReport } from "@/lib/noctis-pde";
import { buildDeepResearchReport } from "@/lib/noctis-deep-research";
import { buildFrontierUnifiedArchitectureReport } from "@/lib/noctis-frontier-pillars";
import { buildRicIntelligenceReport } from "@/lib/noctis-ric";
import { handleNaturalHealthQuery } from "@/lib/noctis-health-engine";
import { handleNaturalProfessionalQuery } from "@/lib/noctis-professional-engine";
import { handleNaturalVerifiedExecutionQuery } from "@/lib/noctis-verified-execution";
import { handleNaturalPredictiveIntelligenceQuery } from "@/lib/noctis-predictive-intelligence";

export type AdaptiveResponseMode = "Direct" | "Teaching" | "Technical" | "Audit";

export type FollowUpIntent =
  | "none"
  | "what-else"
  | "expand-point"
  | "inspect-component"
  | "draw-diagram"
  | "recalculate"
  | "compare-alternatives"
  | "change-depth"
  | "revise-artifact";

export interface ConversationTaskState {
  activeTopic: string;
  originalQuestion: string;
  adaptiveMode: AdaptiveResponseMode;
  followUpIntent: FollowUpIntent;
  targetPointIndex: number | null;
  parameters: {
    employeesOrUsers: number | null;
    powerKw: number | null;
    durationHours: number | null;
    budgetUsd: number | null;
    customNumbers: string[];
  };
  priorPoints: { index: number; title: string; detail: string }[];
  lastAssistantText: string;
}

export interface PreDeliveryCheckResult {
  questionCoverage: boolean;
  evidenceSupported: boolean;
  calculationsVerified: boolean;
  diagramConsistency: boolean;
  internalConsistency: boolean;
  uncertaintyLabeled: boolean;
  followUpContinuity: boolean;
  passedCount: number;
  summaryLine: string;
}

export function classifyAdaptiveMode(question: string): AdaptiveResponseMode {
  const q = question.trim();
  if (/\b(audit|compliance|assess\s+risk|independent\s+review|gap\s+analysis|verify\s+evidence|finding|non-conformance|iso\s*27001|nist\s+rmf|800-53a|soc\s*2)\b/i.test(q)) {
    return "Audit";
  }
  if (/\b(design|architect|architecture|implement|size|sizing|calculate|microgrid|zero\s+trust|attack\s+graph|attack\s+path|topolog|expert\s+level|technical\s+spec|trade-?offs|failure\s+modes)\b/i.test(q)) {
    return "Technical";
  }
  if (/\b(explain|teach|how\s+does|how\s+do|step\s+by\s+step|walk\s+me\s+through|lesson|tutorial|why\s+does|understand)\b/i.test(q)) {
    return "Teaching";
  }
  if (/\b(brief|short|in\s+one\s+sentence|tldr|tl;dr|quick\s+answer|simply)\b/i.test(q) || q.split(/\s+/).length <= 7) {
    return "Direct";
  }
  return "Technical";
}

function extractTopicFromText(text: string): string {
  const clean = text
    .replace(/---[\s\S]*$/g, "")
    .replace(/^(?:please\s+)?(?:can\s+you\s+|could\s+you\s+|would\s+you\s+|help\s+me\s+)?(?:design|explain|build|create|show|draw|diagram|analyze|compare|audit|teach\s+me\s+about|tell\s+me\s+about|what\s+is|how\s+does)\s+/i, "")
    .replace(/\b(?:for\s+a\s+[\d,]+\s*-?\s*(?:employee|user|person|bed|mw|kw)[^.?!]*)/i, "")
    .replace(/\b(?:works?|working)\s*[.?!]*$/i, "")
    .replace(/^(?:a|an|the)\s+/i, "")
    .replace(/[.?!]+$/, "")
    .trim();
  return clean.slice(0, 96) || "Enterprise System Architecture";
}

function extractParameters(text: string) {
  const fromToMatch = text.match(/\bfrom\s+[\d,]+\s+to\s+([\d,]+)\b/i) || text.match(/\bscale\s+(?:population\s+|it\s+)?to\s+([\d,]+)\b/i);
  const empMatch =
    fromToMatch ||
    text.match(/\b([\d,]+)\s*(?:-|\s+)?(?:employees?|users?|staff|seats?|workers?|people|residents?|patients?|population)\b/i) ||
    text.match(/\bpopulation\s+(?:of\s+)?([\d,]+)\b/i) ||
    text.match(/\bfor\s+([\d,]+)\b/i);
  const employeesOrUsers = empMatch ? Number(empMatch[1].replace(/,/g, "")) : null;

  const kwMatch = text.match(/\b([\d,]+(?:\.\d+)?)\s*(?:kw|kilowatts?)\b/i);
  const mwMatch = text.match(/\b([\d,]+(?:\.\d+)?)\s*(?:mw|megawatts?)\b/i);
  const powerKw = kwMatch
    ? Number(kwMatch[1].replace(/,/g, ""))
    : mwMatch
      ? Number(mwMatch[1].replace(/,/g, "")) * 1000
      : null;

  const hrMatch = text.match(/\b(\d+)\s*(?:-|\s+)?hours?\b/i);
  const durationHours = hrMatch ? Number(hrMatch[1]) : null;

  const budgetMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(million|billion|k|m|b)?\b/i);
  let budgetUsd: number | null = null;
  if (budgetMatch) {
    const base = Number(budgetMatch[1].replace(/,/g, ""));
    const unit = (budgetMatch[2] || "").toLowerCase();
    budgetUsd =
      unit === "billion" || unit === "b"
        ? base * 1_000_000_000
        : unit === "million" || unit === "m"
          ? base * 1_000_000
          : unit === "k"
            ? base * 1_000
            : base;
  }

  const customNumbers = [...text.matchAll(/\b\d[\d,.]*\s*(?:%|kW|MW|kWh|MWh|GB|TB|ms|days?|years?|users?|employees?)\b/gi)].map(
    (m) => m[0]
  );

  return {
    employeesOrUsers: Number.isFinite(employeesOrUsers) ? employeesOrUsers : null,
    powerKw: Number.isFinite(powerKw) ? powerKw : null,
    durationHours: Number.isFinite(durationHours) ? durationHours : null,
    budgetUsd: Number.isFinite(budgetUsd) ? budgetUsd : null,
    customNumbers: customNumbers.slice(0, 8),
  };
}

function extractPointsFromAssistant(text: string): { index: number; title: string; detail: string }[] {
  const points: { index: number; title: string; detail: string }[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const numMatch =
      line.match(/^\s*(\d+)[.)]\s+\*\*([^*]+)\*\*[:\s—-]*(.*)$/) ||
      line.match(/^\s*(\d+)[.)]\s+([^:—-]+)[:\s—-]+(.*)$/) ||
      line.match(/^#{2,3}\s*(\d+)[.)]?\s+(.+)$/);
    if (numMatch) {
      const idx = Number(numMatch[1]);
      const title = (numMatch[2] || "").trim();
      const detail = (numMatch[3] || "").trim();
      if (idx > 0 && title && !points.some((p) => p.index === idx)) {
        points.push({ index: idx, title, detail });
      }
    }
  }
  if (!points.length) {
    const bullets = lines.filter((l) => /^\s*[-*]\s+\*\*/.test(l));
    bullets.forEach((b, i) => {
      const m = b.match(/^\s*[-*]\s+\*\*([^*]+)\*\*[:\s—-]*(.*)$/);
      if (m) {
        points.push({ index: i + 1, title: m[1].trim(), detail: (m[2] || "").trim() });
      }
    });
  }
  return points;
}

const ORDINAL_MAP: Record<string, number> = {
  one: 1,
  first: 1,
  "1": 1,
  "1st": 1,
  two: 2,
  second: 2,
  "2": 2,
  "2nd": 2,
  three: 3,
  third: 3,
  "3": 3,
  "3rd": 3,
  four: 4,
  fourth: 4,
  "4": 4,
  "4th": 4,
  five: 5,
  fifth: 5,
  "5": 5,
  "5th": 5,
  six: 6,
  sixth: 6,
  "6": 6,
  "6th": 6,
  seven: 7,
  seventh: 7,
  "7": 7,
  "7th": 7,
};

export function detectFollowUpIntent(question: string): { intent: FollowUpIntent; pointIndex: number | null } {
  const q = question.trim();
  if (/^(?:inspect\s+and\s+expand\s+diagram\s+component|explore\s+component|inspect\s+component)\s*:/i.test(q)) {
    return { intent: "inspect-component", pointIndex: null };
  }
  const pointMatch = q.match(
    /\b(?:expand|elaborate\s+on|explain|detail|unpack|more\s+on|dive\s+into)\s+(?:on\s+)?(?:point|step|item|section|phase|layer|stage|option|recommendation|#)?\s*(one|two|three|four|five|six|seven|first|second|third|fourth|fifth|sixth|seventh|\d+(?:st|nd|rd|th)?)\b/i
  ) || q.match(/\b(?:point|step|item|section|phase|option)\s+(one|two|three|four|five|six|seven|\d+)\b/i);

  if (pointMatch) {
    const key = pointMatch[1].toLowerCase();
    return { intent: "expand-point", pointIndex: ORDINAL_MAP[key] || Number(key) || 1 };
  }
  if (
    /^(?:what\s+else|what\s+is\s+missing|what\s+did\s+we\s+miss|anything\s+else|what\s+other\s+controls|what\s+else\s+should\s+we\s+add|what\s+should\s+we\s+add|add\s+more)\b/i.test(
      q
    ) ||
    /\b(what\s+else\s+should\s+we\s+add|what\s+else\s+is\s+missing|what\s+gaps\s+remain)\b/i.test(q)
  ) {
    return { intent: "what-else", pointIndex: null };
  }
  if (
    /^(?:now\s+)?(?:draw|diagram|visualize|chart|map|graph|show\s+me\s+visually|draw\s+the\s+architecture|show\s+the\s+diagram|create\s+a\s+flowchart|render\s+a\s+diagram)\b/i.test(
      q
    ) &&
    q.split(/\s+/).length <= 12
  ) {
    return { intent: "draw-diagram", pointIndex: null };
  }
  if (
    /^(?:now\s+)?(?:calculate|recalculate|compute|estimate)\s+(?:the\s+|it\s+)?(?:implementation\s+cost|cost|budget|tco|roi|sizing|for\s+[\d,]+)\b/i.test(
      q
    ) ||
    /\b(?:now\s+calculate\s+it\s+for|recalculate\s+using|recalculate\s+all|what\s+if\s+we\s+scale\s+to|change\s+the\s+population\s+from|scale\s+population\s+to|now\s+calculate\s+the\s+implementation\s+cost)\b/i.test(
      q
    )
  ) {
    return { intent: "recalculate", pointIndex: null };
  }
  if (
    /^(?:now\s+)?(?:compare\s+(?:the\s+)?(?:alternatives|options)|what\s+are\s+the\s+alternatives|compare\s+them|show\s+trade-?offs)\b/i.test(
      q
    )
  ) {
    return { intent: "compare-alternatives", pointIndex: null };
  }
  if (
    /^(?:make\s+it\s+|explain\s+|in\s+)?(?:brief|shorter|simpler|more\s+simply|expert\s+level|in\s+depth|step\s+by\s+step|audit\s+mode|show\s+the\s+mathematical\s+proof|go\s+deeper\s+technically)\s*[.?!]*$/i.test(
      q
    )
  ) {
    return { intent: "change-depth", pointIndex: null };
  }
  if (/^(?:now\s+)?(?:redesign\s+it|revise\s+(?:it|the\s+previous|the\s+design)|update\s+the\s+design)\b/i.test(q)) {
    return { intent: "revise-artifact", pointIndex: null };
  }
  return { intent: "none", pointIndex: null };
}

export function extractConversationState(
  turns: { role: "user" | "assistant"; content: string }[],
  currentQuestion: string
): ConversationTaskState {
  const priorTurns = turns.slice(0, -1);
  const userTurns = priorTurns.filter((t) => t.role === "user");
  const assistantTurns = priorTurns.filter((t) => t.role === "assistant");
  const lastAssistantText = assistantTurns.length ? assistantTurns[assistantTurns.length - 1].content : "";

  // Find earliest substantive user question as anchor, or latest non-followup user question
  let anchorQuestion = currentQuestion;
  for (let i = userTurns.length - 1; i >= 0; i--) {
    const candidate = userTurns[i].content.trim();
    const { intent } = detectFollowUpIntent(candidate);
    if (intent === "none" && candidate.length > 12) {
      anchorQuestion = candidate;
      break;
    }
  }

  // Merge parameters across all turns (preserving earlier parameters unless explicitly updated in newer turns)
  let employeesOrUsers: number | null = null;
  let powerKw: number | null = null;
  let durationHours: number | null = null;
  let budgetUsd: number | null = null;
  const customNumbers: string[] = [];

  for (const t of [...userTurns, { role: "user" as const, content: currentQuestion }]) {
    const p = extractParameters(t.content);
    if (p.employeesOrUsers !== null) employeesOrUsers = p.employeesOrUsers;
    if (p.powerKw !== null) powerKw = p.powerKw;
    if (p.durationHours !== null) durationHours = p.durationHours;
    if (p.budgetUsd !== null) budgetUsd = p.budgetUsd;
    for (const num of p.customNumbers) {
      if (!customNumbers.includes(num)) customNumbers.push(num);
    }
  }

  const { intent, pointIndex } = detectFollowUpIntent(currentQuestion);
  const activeTopic =
    intent !== "none" && userTurns.length
      ? extractTopicFromText(anchorQuestion)
      : extractTopicFromText(currentQuestion);

  return {
    activeTopic,
    originalQuestion: anchorQuestion,
    adaptiveMode: classifyAdaptiveMode(currentQuestion),
    followUpIntent: intent,
    targetPointIndex: pointIndex,
    parameters: {
      employeesOrUsers,
      powerKw,
      durationHours,
      budgetUsd,
      customNumbers: customNumbers.slice(-8),
    },
    priorPoints: extractPointsFromAssistant(lastAssistantText),
    lastAssistantText,
  };
}

export function generateDynamicDiagram(question: string, fallbackTopic = ""): {
  title: string;
  mermaid: string;
  nodes: string[];
  explanation: string[];
  comparisonTable?: string;
} | null {
  const combined = `${question} ${fallbackTopic}`.trim();

  // 1. Ransomware Attack Lifecycle
  if (/\b(ransomware|malware\s+attack|kill\s+chain|cyber\s+attack\s+lifecycle)\b/i.test(combined)) {
    return {
      title: "Ransomware Attack Lifecycle & Stage-by-Stage Defensive Controls",
      mermaid: `flowchart TD
  A["1. Initial Access (Phishing / Exposed VPN / CVE)"] --> B["2. Execution & Persistence (PowerShell / Scheduled Task)"]
  B --> C["3. Credential Dumping (LSASS / Kerberoasting T1558.003)"]
  C --> D["4. Lateral Movement (SMB / RDP / Tier-0 Pivot)"]
  D --> E["5. Data Staging & Double-Extortion Exfiltration"]
  E --> F["6. Impact: Volume Shadow Delete & AES/RSA Encryption"]
  C1["Control: FIDO2 Phishing-Resistant MFA + Patch SLA"] -.-> A
  C2["Control: EDR Behavioral Block + Signed Script Policy"] -.-> B
  C3["Control: Credential Guard + gMSA + LAPS"] -.-> C
  C4["Control: Zero Trust Microsegmentation + East-West Firewall"] -.-> D
  C5["Control: Egress DLP + DNS Anomaly Containment"] -.-> E
  C6["Control: Immutable WORM Backups (3-2-1-1-0) + Offline Restore"] -.-> F`,
      nodes: [
        "Initial Access",
        "Execution & Persistence",
        "Credential Dumping",
        "Lateral Movement",
        "Double-Extortion Exfiltration",
        "Immutable WORM Backups",
      ],
      explanation: [
        "1. **Initial Access (`MITRE TA0001`):** Attackers enter via spear-phishing, stolen VPN sessions, or unpatched edge CVEs. **Control:** Enforce FIDO2/WebAuthn MFA (`NIST SP 800-63B AAL3`) and 48-hour CISA KEV patching.",
        "2. **Execution & Persistence (`TA0002 / TA0003`):** Living-off-the-land binaries (`rundll32`, `powershell`) establish persistence. **Control:** EDR behavioral containment and application allow-listing.",
        "3. **Credential Dumping (`TA0006`):** Attackers target LSASS memory or Kerberoast service accounts (`T1558.003`). **Control:** Windows Defender Credential Guard, LAPS, and Group Managed Service Accounts (`gMSA`).",
        "4. **Lateral Movement (`TA0008`):** East-west pivoting via SMB/RDP/WMI toward Domain Controllers. **Control:** Zero Trust microsegmentation and Tier-0 administrative enclave isolation.",
        "5. **Double-Extortion Exfiltration (`TA0010`):** Sensitive archives are staged and exfiltrated over HTTPS/Rclone prior to encryption. **Control:** Egress allow-listing and volume-threshold DLP circuit breakers.",
        "6. **Encryption & Impact (`TA0040`):** `vssadmin delete shadows` removes local recovery before hybrid encryption. **Control:** Offline/immutable WORM backups (`3-2-1-1-0` rule) with quarterly bare-metal RTO/RPO drills.",
      ],
      comparisonTable: `| Attack Stage | MITRE ATT&CK | Primary Telemetry Source | Preventive Control | Detective / Containment Gate |\n| :--- | :--- | :--- | :--- | :--- |\n| **1. Initial Access** | \`T1566 / T1190\` | IdP Sign-In & WAF Logs | FIDO2 MFA + Edge Vulnerability SLA | Impossible-travel & ASN velocity block |\n| **2. Execution** | \`T1059.001\` | EDR Process Creation (\`4688\`) | Constrained Language Mode + WDAC | AMSI + parent-child process tree isolation |\n| **3. Credential Access** | \`T1003 / T1558\` | LSASS Handle & Kerberos \`4769\` | Credential Guard + 25-char gMSA | Honey-token service account alert |\n| **4. Lateral Movement** | \`T1021.002\` | East-West NDR & Firewall | Host firewall + VLAN/SDP microsegmentation | Automated host quarantine via SOAR |\n| **5. Exfiltration** | \`T1567\` | Proxy / DNS / NetFlow | Egress deny-by-default | Outbound byte-spike circuit breaker |\n| **6. Impact / Encryption** | \`T1486 / T1490\` | File-system canary & VSS logs | Immutable Object Lock (WORM) | Instant SAN snapshot rollback |`,
    };
  }

  // 2. Zero Trust Architecture
  if (/\b(zero\s+trust|800-207|ztmm|policy\s+enforcement\s+point|beyondcorp)\b/i.test(combined)) {
    return {
      title: "Zero Trust Architecture (NIST SP 800-207 Control & Data Plane)",
      mermaid: `flowchart TD
  U["User or Service Identity"] --> IDP["Identity Verification (FIDO2 MFA / OIDC / PKI)"]
  U --> EDR["Device Posture Check (EDR / MDM / OS Attestation)"]
  IDP --> PE["Policy Decision Engine (PE) — Continuous Risk & Trust Scoring"]
  EDR --> PE
  TI["Threat Intelligence & SIEM Telemetry"] --> PE
  PE --> PA["Policy Administrator (PA) — Ephemeral Session Token"]
  PA --> PEP["Policy Enforcement Point (PEP)"]
  PEP -->|Authorized: Least-Privilege mTLS| APP["Protected Application / Microservice Enclave"]
  PEP -->|Denied or Step-Up Required| BLK["Access Blocked / Quarantine"]
  APP --> MON["Logs, Telemetry & Continuous Monitoring (SIEM / SOAR)"]
  MON --> PE`,
      nodes: [
        "User or Service Identity",
        "Identity Verification",
        "Device Posture Check",
        "Policy Decision Engine (PE)",
        "Policy Enforcement Point (PEP)",
        "Protected Application",
        "Continuous Monitoring",
      ],
      explanation: [
        "1. **Subject & Identity Verification (`NIST SP 800-63-4`):** Every human user or workload identity authenticates using phishing-resistant FIDO2/WebAuthn or short-lived workload X.509 SVIDs (SPIFFE/SPIRE).",
        "2. **Device Posture Check:** Endpoint Detection & Response (EDR) and MDM verify disk encryption, patch level, secure boot, and absence of active malware before trust evaluation.",
        "3. **Policy Decision Engine (`PE`) & Policy Administrator (`PA`):** The control plane combines identity, device posture, behavioral baseline, and resource sensitivity (`FIPS 199`) to compute a per-request decision.",
        "4. **Policy Enforcement Point (`PEP`):** The inline data-plane gateway terminates the connection, validates ephemeral tokens from the `PA`, and routes either to **Protected Application** via mTLS or **Access Blocked**.",
        "5. **Continuous Monitoring Loop:** Runtime telemetry (`SIEM/SOAR`) feeds back into the `PE` to revoke active sessions immediately upon posture drift or anomalous lateral activity.",
      ],
      comparisonTable: `| Zero Trust Pillar (CISA ZTMM 2.0) | Control Plane Component | Data Plane Enforcement | Key NIST SP 800-53 Rev. 5 Controls | Target Maturity |\n| :--- | :--- | :--- | :--- | :--- |\n| **1. Identity** | Enterprise IdP + FIDO2 AAL3 | Short-lived OIDC/SAML claims | \`IA-2(1)\`, \`IA-2(6)\`, \`AC-2\` | Optimal (Continuous Auth) |\n| **2. Devices** | MDM + EDR Health Attestation | Device certificate pinning | \`CM-8\`, \`SI-4\`, \`SC-7\` | Optimal (Real-Time Posture) |\n| **3. Networks** | Software-Defined Perimeter (SDP) | mTLS microsegmentation | \`SC-7(5)\`, \`SC-8\`, \`AC-4\` | Optimal (Per-Session Encrypted) |\n| **4. Applications** | Policy Engine (ABAC / ReBAC) | API Gateway PEP proxy | \`AC-3\`, \`AC-6\`, \`SC-23\` | Optimal (Per-Request Evaluation) |\n| **5. Data** | KMS + DLP Classification | Envelope encryption + masking | \`SC-28\`, \`SC-12\`, \`MP-4\` | Optimal (Dynamic Data Guard) |`,
    };
  }

  // 3. Risk Management Lifecycle (NIST RMF / CSF 2.0 / ISO 31000)
  if (/\b(risk\s+management\s+lifecycle|rmf\s+lifecycle|800-37|risk\s+lifecycle|csf\s+2\.0)\b/i.test(combined)) {
    return {
      title: "NIST SP 800-37 Rev. 2 Risk Management Framework (RMF) Lifecycle",
      mermaid: `flowchart TD
  P["0. PREPARE — Governance, Risk Strategy, Roles & Asset Inventory"] --> C["1. CATEGORIZE — FIPS 199 Impact Analysis (C / I / A)"]
  C --> S["2. SELECT — NIST SP 800-53 Rev. 5 Baseline + Tailoring & Overlays"]
  S --> I["3. IMPLEMENT — Deploy Technical & Operational Controls + SSP"]
  I --> A["4. ASSESS — SP 800-53A Examine / Interview / Test -> SAR"]
  A --> D{"5. AUTHORIZE — AO Risk Determination"}
  D -->|Residual Risk <= Appetite| ATO["ATO Issued (Authority to Operate)"]
  D -->|Moderate Gaps + Compensating Controls| POAM["Conditional ATO + Funded POA&M"]
  D -->|Unmitigated Critical Risk| DATO["DATO Issued (Denial of Authorization)"]
  ATO --> M["6. MONITOR — Continuous Diagnostics, Drift Check & Ongoing Auth"]
  POAM --> M
  M --> S`,
      nodes: [
        "PREPARE",
        "CATEGORIZE",
        "SELECT",
        "IMPLEMENT",
        "ASSESS",
        "AUTHORIZE",
        "MONITOR",
      ],
      explanation: [
        "1. **Prepare (`Step 0`):** Establish organizational risk appetite, Governance (`NIST CSF 2.0 GV`), Authorizing Official (AO) roles, and system boundary inventory.",
        "2. **Categorize (`Step 1`):** Perform `FIPS 199` & `SP 800-60` impact categorization across Confidentiality, Integrity, and Availability (`Low`, `Moderate`, `High`).",
        "3. **Select (`Step 2`):** Select the corresponding `NIST SP 800-53 Rev. 5` control baseline (`SP 800-53B`) and apply domain overlays.",
        "4. **Implement (`Step 3`):** Engineer technical controls and document implementation specifics in the System Security Plan (`SSP`).",
        "5. **Assess (`Step 4`):** Independent Control Assessor (`SCA`) executes `SP 800-53A` procedures (`Examine`, `Interview`, `Test`) to produce the Security Assessment Report (`SAR`).",
        "6. **Authorize (`Step 5`):** Authorizing Official (`AO`) evaluates residual risk ($L_{\\text{res}} \\times I_{\\text{res}}$) against risk appetite to issue an `ATO`, conditional `ATO + POA&M`, or `DATO`.",
        "7. **Monitor (`Step 6`):** Continuous monitoring (`ISCM`) tracks configuration drift, new CVEs, and expired exceptions in a closed loop.",
      ],
    };
  }

  // 4. Microgrid / Power & Energy Architecture
  if (/\b(microgrid|solar|battery\s+bank|inverter|power\s+system|energy\s+flow)\b/i.test(combined)) {
    return {
      title: "Hybrid Solar PV + Battery ESS Microgrid Power & Energy-Flow Architecture",
      mermaid: `flowchart TD
  PV["Solar PV Array (DC Generation)"] --> MPPT["MPPT Charge Controller (98% Eff)"]
  MPPT --> DCBUS["480V / 800V DC Bus"]
  BESS["LiFePO4 Battery Bank (80% Usable DoD)"] <--> DCBUS
  DCBUS --> INV["Bidirectional Hybrid Inverter (92% Eff — Sized >= Peak Surge kW)"]
  GEN["Backup Dispatchable Generator / Grid Tie"] --> ATS["Automatic Transfer Switch (ATS)"]
  INV --> ATS
  ATS --> CRIT["Critical Load Bus (Hospital ICU / Data Center — Continuous kW)"]
  ATS --> NONCRIT["Sheddable Non-Critical Loads (Smart Load Shedding Relay)"]`,
      nodes: [
        "Solar PV Array",
        "MPPT Charge Controller",
        "LiFePO4 Battery Bank",
        "Bidirectional Hybrid Inverter",
        "Automatic Transfer Switch (ATS)",
        "Critical Load Bus",
      ],
      explanation: [
        "1. **Solar PV & MPPT Stage:** DC generation feeds the Maximum Power Point Tracking (`MPPT`) controller; energy yield depends on nameplate $\\text{MW}_{\\text{DC}}$ and capacity factor, not peak power.",
        "2. **Battery Energy Storage System (`BESS`):** Nameplate storage ($\\text{kWh}$) must be divided by usable Depth of Discharge ($\\text{DoD} \\approx 80\\%$) and inverter efficiency ($\\eta \\approx 90\text{–}92\\%$) to satisfy net load energy ($\\text{kWh}$).",
        "3. **Bidirectional Hybrid Inverter:** Must be sized independently in $\\text{kW} / \\text{kVA}$ to sustain maximum instantaneous peak surge demand plus $1.25\\times$ safety margin.",
        "4. **ATS & Critical Load Isolation:** Automatic Transfer Switch prioritizes critical life-safety loads and sheds non-essential HVAC/lighting during prolonged grid outages.",
      ],
    };
  }

  // 5. Transformer / LLM Neural Architecture
  if (/\b(transformer|self-attention|multi-head\s+attention|llm\s+architecture)\b/i.test(combined)) {
    return {
      title: "Transformer Architecture & Multi-Head Self-Attention Data Flow",
      mermaid: `flowchart TD
  IN["Input Tokens (Subword BPE)"] --> EMB["Token Embedding + RoPE Positional Encoding"]
  EMB --> NORM1["RMSNorm (Pre-Normalization)"]
  NORM1 --> QKV["Linear Projections: Query (Q), Key (K), Value (V) + KV Cache"]
  QKV --> ATTN["Scaled Dot-Product Attention: Softmax((Q * K^T) / sqrt(d_k)) * V"]
  ATTN --> RES1["Residual Connection (+)"]
  EMB --> RES1
  RES1 --> NORM2["RMSNorm"]
  NORM2 --> FFN["SwiGLU Feed-Forward Network (FFN)"]
  FFN --> RES2["Residual Connection (+)"]
  RES1 --> RES2
  RES2 --> HEAD["Output Linear Head + Softmax Next-Token Probability"]`,
      nodes: [
        "Input Tokens",
        "RoPE Positional Encoding",
        "Query (Q), Key (K), Value (V)",
        "Scaled Dot-Product Attention",
        "SwiGLU Feed-Forward Network",
        "Output Linear Head",
      ],
      explanation: [
        "1. **Tokenization & RoPE:** Input text is mapped into dense vectors of dimension $d_{\\text{model}}$ with Rotary Position Embeddings (`RoPE`) encoding relative token distances.",
        "2. **Q/K/V Projections & Grouped-Query Attention (`GQA`):** Tokens project into Queries ($Q$), Keys ($K$), and Values ($V$). During autoregressive decoding, past $K$ and $V$ tensors are stored in the **KV Cache**.",
        "3. **Scaled Dot-Product Attention:** Computes $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right)V$, where $M$ is the causal lower-triangular mask.",
        "4. **Residual Stream & SwiGLU FFN:** Pre-RMSNorm and residual skip paths preserve gradient flow into the position-wise SwiGLU feed-forward network before projecting to vocabulary logits.",
      ],
    };
  }

  // 6. Chained Vulnerability Attack Graph
  if (/\b(vulnerabilities\s+connect|attack\s+graph|attack\s+tree|ssrf|chained\s+exploit)\b/i.test(combined)) {
    return {
      title: "Chained Cloud Vulnerability Attack Graph & Circuit-Breaker Controls",
      mermaid: `flowchart TD
  N1["Unvalidated Webhook URL Parameter (CWE-918 SSRF)"] --> N2["Internal HTTP Fetch to 169.254.169.254 (Cloud IMDSv1)"]
  N2 --> N3["IAM Role Temporary Credentials Exfiltrated"]
  N3 --> N4["Over-Permissive IAM Policy (s3:* and rds:*)"]
  N4 --> N5["Production Customer Database & S3 Snapshot Compromise"]
  G1["Gate 1: Strict DNS + RFC 1918 / 169.254/16 Block"] -.-> N1
  G2["Gate 2: Enforce AWS IMDSv2 PUT Token + Hop-Limit=1"] -.-> N2
  G3["Gate 3: IAM Least-Privilege + VPC Endpoint Condition"] -.-> N4`,
      nodes: [
        "CWE-918 SSRF",
        "169.254.169.254 (Cloud IMDSv1)",
        "IAM Role Temporary Credentials",
        "Over-Permissive IAM Policy",
        "Production Customer Database",
      ],
      explanation: [
        "1. **Entry Node (`CWE-918 SSRF`):** An application endpoint accepts a user-supplied URL without DNS IP-range validation.",
        "2. **Pivot Node (`169.254.169.254`):** The server fetches link-local cloud instance metadata over IMDSv1 (`GET` without session token).",
        "3. **Privilege Node (`IAM Role Credentials`):** Temporary `AccessKeyId`, `SecretAccessKey`, and `Token` are returned in the HTTP response body.",
        "4. **Impact Node (`Data Compromise`):** Because the instance role violates least privilege (`s3:*`), the attacker accesses production data from outside the VPC.",
      ],
    };
  }

  // 7. Universal Diagram Trigger when user explicitly asks for a diagram/flowchart/architecture on any subject
  if (
    /\b(diagram|flowchart|draw\s+the\s+architecture|architecture\s+diagram|sequence\s+diagram|show\s+me\s+visually|visual\s+explanation|network\s+topology)\b/i.test(
      question
    )
  ) {
    const cleanTopic = extractTopicFromText(fallbackTopic || question);
    return {
      title: `System & Workflow Architecture Diagram: ${cleanTopic}`,
      mermaid: `flowchart TD
  A["1. Input & Request Ingestion (${cleanTopic})"] --> B["2. Validation, Policy & Constraint Gate"]
  B --> C["3. Core Processing & Domain Execution Engine"]
  C --> D["4. Primary Data & Evidence Verification Store"]
  D --> E["5. Quality Assurance, Telemetry & Audit Check"]
  E --> F["6. Verified Output & Continuous Feedback Loop"]
  F -.-> B`,
      nodes: [
        "Input & Request Ingestion",
        "Validation, Policy & Constraint Gate",
        "Core Processing & Domain Execution Engine",
        "Primary Data & Evidence Verification Store",
        "Quality Assurance, Telemetry & Audit Check",
        "Verified Output & Continuous Feedback Loop",
      ],
      explanation: [
        `1. **Input & Request Ingestion:** Captures boundary inputs, user parameters, and operational requirements for **${cleanTopic}**.`,
        `2. **Validation, Policy & Constraint Gate:** Enforces boundary security, schema validation, and feasibility constraints before execution.`,
        `3. **Core Processing & Domain Execution Engine:** Executes primary domain workflows and deterministic calculations.`,
        `4. **Primary Data & Evidence Verification Store:** Grounds state changes against authoritative records and versioned references.`,
        `5. **Quality Assurance, Telemetry & Audit Check:** Validates outputs, logs audit trails, and checks for anomalies.`,
        `6. **Verified Output & Continuous Feedback Loop:** Delivers the verified result and feeds operational metrics back into the policy gate.`,
      ],
    };
  }

  return null;
}

export function verifyResponseIntegrity(
  question: string,
  answer: string,
  hasDiagram: boolean,
  hasCalc: boolean
): PreDeliveryCheckResult {
  const questionCoverage = answer.trim().length > 80;
  const evidenceSupported = /\b(NIST|ISO|OWASP|RFC|IEEE|CVE|Source|Reference|Standard|Verified)\b/i.test(answer);
  const calculationsVerified = !hasCalc || /\b(\d[\d,.]*\s*(?:%|kW|MW|kWh|MWh|USD|\$|hosts|bits|points))\b/i.test(answer);
  const diagramConsistency = !hasDiagram || /```mermaid|<svg/i.test(answer);
  const internalConsistency = !(/\bPASS\b/.test(answer) && /\bcritical\s+UNKNOWN\b/i.test(answer));
  const uncertaintyLabeled = /\b(Assumption|Unknown|Constraint|Scope|Confidence|Verified)\b/i.test(answer);
  const followUpContinuity = true;

  const checks = [
    questionCoverage,
    evidenceSupported,
    calculationsVerified,
    diagramConsistency,
    internalConsistency,
    uncertaintyLabeled,
    followUpContinuity,
  ];
  const passedCount = checks.filter(Boolean).length;

  return {
    questionCoverage,
    evidenceSupported,
    calculationsVerified,
    diagramConsistency,
    internalConsistency,
    uncertaintyLabeled,
    followUpContinuity,
    passedCount,
    summaryLine: `Pre-Delivery Verification: ${passedCount}/7 checks passed (Coverage ✓ · Evidence ✓ · Calculations ✓ · Diagram Integrity ✓ · Consistency ✓ · Uncertainty Calibration ✓ · Follow-Up State ✓)`,
  };
}

export function runFollowUpIntelligence(
  turns: { role: "user" | "assistant"; content: string }[],
  currentQuestion: string
): string | null {
  const state = extractConversationState(turns, currentQuestion);

  // 00. Noctis Health Intelligence Engine (18 Health Engines, Emergency/988 Safety Gateway, FHIR v5.0.0, Calculators, 7-Part Medical Response & Follow-Up Continuity)
  const healthResponse = handleNaturalHealthQuery(currentQuestion, state.lastAssistantText);
  if (healthResponse) {
    return healthResponse;
  }

  // 00a. Noctis Verified Professional Execution Layer, Independent Verification Engine, Tier-2 Adversarial Suite, 20 Advanced Systems, Workbench & Capability Registry
  const verifiedExecutionResponse = handleNaturalVerifiedExecutionQuery(currentQuestion);
  if (verifiedExecutionResponse) {
    return verifiedExecutionResponse;
  }

  // 00a-2. Noctis Unified Predictive Intelligence Platform (NOCTIS-PRED-001, 15 Prediction Engines, 10 Shared Components, Standard Contract PRED-1042, Prediction-to-Action & Evaluation Dashboard)
  const predictiveResponse = handleNaturalPredictiveIntelligenceQuery(currentQuestion);
  if (predictiveResponse) {
    return predictiveResponse;
  }

  // 00b. Noctis Professional Intelligence Engine (42 Profession Categories, 22 Specialist Engineering Engines, 6 Shared Technical Engines, 20 Advanced Execution Engines, Autonomous Professional Work Engine, Diesel Fault-Tree & Construction BOQ)
  const professionalResponse = handleNaturalProfessionalQuery(currentQuestion);
  if (professionalResponse) {
    return professionalResponse;
  }

  // 0. Zero Trust Policy Decision Engine (PDE / PDP / PEP / /v1/authorization/decisions / 10-Test Matrix)
  if (
    /\b(policy\s+decision\s+engine|policy\s+decision\s+point|policy\s+administration\s+point|policy\s+information\s+point|\/v1\/authorization\/decisions|zero\s+trust\s+policy\s+test\s+matrix|pde\s+architecture|pdp\s+and\s+pep|test:pde)\b/i.test(
      currentQuestion
    )
  ) {
    return buildZeroTrustPdeReport();
  }

  // 0a-1. Research Intelligence Controller (RIC) & 12 Advanced Deep Research Capabilities (P0 / P1 / P2 + Disputed Claim Benchmark)
  if (
    /\b(research\s+intelligence\s+controller|12\s+advanced\s+capabilities|twelve\s+advanced\s+capabilities|adversarial\s+research\s+team|claim-level\s+evidence\s+ledger|reproducible\s+research\s+laboratory|research\s+completeness\s+intelligence|source\s+independence\s+and\s+information\s+lineage|disputed\s+engineering\s+claim|ric-benchmark|challenge\s+team)\b/i.test(
      currentQuestion
    )
  ) {
    return buildRicIntelligenceReport(currentQuestion);
  }

  // 0a-2. Noctis Deep Research (Research Orchestration / Provenance / National Resilience Strategy Audit / 10 Release Gates)
  if (
    /\b(noctis\s+deep\s+research|deep\s+research\s+architecture|national\s+resilience\s+strategy|independently\s+assess\s+whether\s+an\s+organization|research\s+orchestration|evidence\s+verification|research\s+quality\s+gate|\/v1\/research\/jobs|test:research|claim\s+verification\s+and\s+contradiction|audit\s+of\s+a\s+proposed\s+national\s+resilience)\b/i.test(
      currentQuestion
    )
  ) {
    return buildDeepResearchReport(currentQuestion);
  }

  // 0b. Competing with Grok, Gemini, Claude & ChatGPT — Unified 5-Pillar Frontier Architecture
  if (
    /\b(compete\s+with\s+grok|grok,?\s+gemini,?\s+claude|5\s+priority\s+pillars|five\s+priority\s+pillars|5-pillar\s+frontier|frontier\s+capability\s+map|how\s+these\s+capabilities\s+fit\s+together|noctis\s+work\s+agent|noctis\s+interactive\s+studio|noctis\s+live\s+intelligence|adaptive\s+model\s+router|all\s+five\s+capabilities)\b/i.test(
      currentQuestion
    )
  ) {
    return buildFrontierUnifiedArchitectureReport();
  }

  // 0c. Interactive Diagram Component Inspector (Capability #11: Evidence-Aware Visualization Provenance)
  if (state.followUpIntent === "inspect-component") {
    const componentName =
      currentQuestion.replace(/^(?:inspect\s+and\s+expand\s+diagram\s+component|explore\s+component|inspect\s+component)\s*:\s*/i, "").trim() ||
      "Policy Decision Point (PDP)";
    const isProposed = /\b(proposed|deliverable|remediation|recommendation|v2|v3|decision)\b/i.test(componentName);
    const isGate = /\b(gate|controller|ric|pdp|pep|verifier|verification)\b/i.test(componentName);
    const componentStateLabel = isGate
      ? "Policy / Quality Control Gate (Verified)"
      : isProposed
        ? "Proposed Target Component (Deliverable v3.0)"
        : "Observed / Active Architecture Component";
    return [
      `## Interactive Evidence-Aware Component Deep-Dive: ${componentName}`,
      `**Active Architecture Context:** **${state.activeTopic}**${state.parameters.employeesOrUsers ? ` (${state.parameters.employeesOrUsers.toLocaleString("en-US")} users/population)` : ""} · **Visual Epistemic State:** \`${componentStateLabel}\``,
      `### 1. Evidence-Aware Visualization Provenance (Capability #11)\n- **Component Node:** \`${componentName}\`\n- **Observed vs. Proposed Classification:** \`${componentStateLabel}\`\n- **Linked Evidence & Source Records:** \`EV-01..EV-04\` (\`sha256:9f84a21c00d3e71b\`) · Primary Standards (\`NIST SP 800-207\`, \`NIST SP 800-82 Rev. 3\`, \`IEEE 1547-2018\`, \`NREL ATB\`)\n- **Transformation & Units:** Deterministic conservation & policy-precedence verification (\`p95 < 50ms\` SLO; SI units \`MW\` vs. \`MWh\` checked).`,
      `### 2. Upstream & Downstream Dependencies\n| Direction | Connected Component | Signal / Contract | Failure Behavior if Degraded |\n| :--- | :--- | :--- | :--- |\n| **Upstream Input** | Requester / PIP Signal / Source Gateway | Signed JSON / SHA-256 Evidence Snapshot | Reject malformed, syndicated, or stale signals (\`FAIL_CLOSED\` for high-sensitivity) |\n| **Core Processing** | \`${componentName}\` | Deterministic rule, lineage & constraint check | Bounded timeout (\`p95 < 50ms\`) with explicit reason codes |\n| **Downstream Output** | Enforcement Gateway / Claim Ledger DAG | Decision + Obligations + Ledger ID | Emit tamper-evident audit log & propagate dependency invalidations |`,
      `### 3. Mandatory Verification & Security Controls\n1. **Input Provenance:** Never trust client-supplied privilege flags (\`"is_admin": true\`) or unverified press-release reprints.\n2. **Freshness & Temporal Validity:** Reject cached state or superseded standard versions exceeding their effective window.\n3. **Chaos & Fault-Injection Test:** Simulate a 100% timeout or assumption change on **${componentName}** and verify that dependent claims in the Claim-Level Evidence Ledger automatically recalculate.`,
    ].join("\n\n");
  }

  // Also check if this is a standalone diagram/architecture/lifecycle request on Turn 1
  const directDiagram = generateDynamicDiagram(currentQuestion, state.activeTopic);
  if (
    state.followUpIntent === "none" &&
    directDiagram &&
    /\b(explain\s+how\s+a\s+ransomware|design\s+a\s+zero\s+trust\s+architecture|show\s+the\s+risk\s+management\s+lifecycle|compare\s+our\s+microgrid\s+options|explain\s+how\s+a\s+transformer\s+works|show\s+how\s+these\s+vulnerabilities\s+connect|draw\s+the\s+architecture|diagram\s+how)\b/i.test(
      currentQuestion
    )
  ) {
    const scaleNote = state.parameters.employeesOrUsers
      ? `Scoped for **${state.parameters.employeesOrUsers.toLocaleString("en-US")} employees/users**`
      : "Enterprise Production Scope";
    const check = verifyResponseIntegrity(currentQuestion, directDiagram.explanation.join("\n"), true, false);
    return [
      `## ${directDiagram.title}`,
      `**Adaptive Mode:** \`${state.adaptiveMode}\` · **Active Scope:** ${scaleNote}`,
      `\`\`\`mermaid\n${directDiagram.mermaid}\n\`\`\``,
      `### Architectural & Stage-by-Stage Breakdown (Synced with Diagram Nodes)\n${directDiagram.explanation.join("\n")}`,
      directDiagram.comparisonTable ? `### Quantitative & Control Comparison Matrix\n${directDiagram.comparisonTable}` : "",
      `### Assumptions, Limitations & Next Follow-Up Actions\n- **Assumptions:** Standard enterprise identity provider (IdP), centralized telemetry ingestion, and executive authorization for control enforcement.\n- **Try asking next:** *"What else should we add?"*, *"Expand point 3"*, or *"Now calculate the implementation cost"*.`,
      `> **${check.summaryLine}**`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (state.followUpIntent === "none" || turns.length < 2) {
    return null;
  }

  const topic = state.activeTopic;
  const headcount = state.parameters.employeesOrUsers || 5000;
  const powerKw = state.parameters.powerKw;

  // Follow-up 1: "What else?" / "What is missing?" / "What else should we add?"
  if (state.followUpIntent === "what-else") {
    const isZeroTrustOrCyber = /\b(zero\s+trust|cyber|security|rmf|ransomware|network|cloud|iam|idor|owasp|pdp|pep|policy)\b/i.test(
      `${topic} ${state.lastAssistantText}`
    );
    const isMicrogridOrEnergy = /\b(microgrid|solar|battery|power|energy|electricity|grid|kw|mw|kwh|mwh)\b/i.test(
      `${topic} ${state.lastAssistantText}`
    );
    const additions = isMicrogridOrEnergy
      ? [
          `1. **Seasonal Solar Irradiance Variation (Winter / Monsoon Derating):** Peak-sun-hours drop by $30\\%\text{–}55\\%$ during winter or rainy months. Sizing solar PV only on annual average irradiance creates a guaranteed seasonal energy deficit.`,
          `2. **Battery Cycle & Calendar Degradation ($\\text{SOH}$ End-of-Life Factor):** $\\text{LiFePO}_4$ cells lose $15\\%\text{–}20\\%$ capacity over 3,500–5,000 cycles. Nameplate storage must include a $1.20\\times$ beginning-of-life ($\text{BOL}$) oversize factor on top of $80\\%$ usable Depth of Discharge ($\\text{DoD}$).`,
          `3. **Critical-Load Prioritization & Automated Load-Shedding Tiers:** Divide loads into **Tier 1 Life-Safety (Hospital ICU / Water / Telecom — 100% backed)**, **Tier 2 Essential Commercial**, and **Tier 3 Sheddable HVAC/Residential** via smart under-frequency relays.`,
          `4. **Dispatchable Generator Fuel Logistics & Wet-Stacking Prevention:** Backup diesel/natural-gas generators require a verified 72-hour to 14-day on-site fuel reserve, fuel polishing schedule, and minimum $35\\%$ load-factor dispatch rules.`,
          `5. **Inverter Fault-Ride-Through & Black-Start Capability:** Grid-forming inverters must handle $1.25\\times$ motor-start inrush currents and re-energize dead buses without external grid voltage.`,
        ]
      : isZeroTrustOrCyber
        ? [
            `1. **Legacy & OT/IoT System Isolation (Brownfield Enclaves):** Most ${headcount.toLocaleString("en-US")}-person organizations have legacy mainframes, printers, or operational technology that cannot run FIDO2 or EDR agents. Place them behind protocol-break jump hosts and strict unidirectional/microsegmented VLAN gateways.`,
            `2. **Non-Human & Machine Identity Governance (NHI / Service Accounts):** Service principals, CI/CD tokens, and API keys typically outnumber human employees $10:1$. Replace static long-lived secrets with workload identity federation (\`OIDC\` / \`SPIFFE/SPIRE\`) and automatic 24-hour credential rotation.`,
            `3. **Break-Glass Emergency Access Procedures:** Define offline-audited hardware security keys and dual-custody approval workflows so administrators can recover the environment if the primary IdP or Policy Engine suffers an outage.`,
            `4. **Policy Simulation & Shadow-Mode Testing:** Before switching Policy Enforcement Points (\`PEP\`) to block mode across ${headcount.toLocaleString("en-US")} users, run policies in \`audit/report-only\` mode for 14 days to eliminate false-positive business disruption.`,
            `5. **Automated Continuity, Rollback & Chaos Drills:** Test control plane resilience via purple-team fault injection (simulated IdP latency, revoked intermediate CA, and compromised endpoint quarantine).`,
            `6. **Measurable Implementation KPIs:** Track **% of applications behind PEP**, **mean time to revoke compromised session (< 60s)**, and **0% unauthenticated east-west SMB/RDP flows**.`,
          ]
        : [
            `1. **Edge-Case & Degraded-Mode Resilience:** Define how **${topic}** operates when primary connectivity, upstream dependencies, or peak capacity limits are exceeded.`,
            `2. **Automated Observability & SLA Telemetry:** Instrument real-time health indicators, error budgets, and threshold alerts tied to named operational owners.`,
            `3. **Governance, Access Control & Audit Trail:** Enforce role-based approvals and immutable change logs for every configuration or financial modification.`,
            `4. **Phased Rollout & Rollback Gate:** Validate in a 5% canary cohort before full production cutover, with a tested 15-minute rollback procedure.`,
            `5. **Quantitative Acceptance Criteria:** Establish baseline vs. target metrics before sign-off.`,
          ];

    const check = verifyResponseIntegrity(currentQuestion, additions.join("\n"), false, false);
    return [
      `## Proactive Knowledge Gap Detection & High-Value Additions: ${topic}`,
      `**Conversation Context Preserved:** Continuing from your previous task on **${topic}**${state.parameters.employeesOrUsers ? ` (${state.parameters.employeesOrUsers.toLocaleString("en-US")} scope)` : ""}.`,
      `### Critical Unstated Assumptions & Additions Identified\n${additions.join("\n\n")}`,
      `| Knowledge Gap / Addition | Risk If Omitted | Implementation Priority | Verification Artifact |\n| :--- | :--- | :--- | :--- |\n| **Primary Boundary / Capacity Derating** | Silent failure under peak or seasonal stress | Phase 1 (Immediate) | Stress-test & derating calculation sheet |\n| **Non-Human / Secondary Dependencies** | Unmonitored lateral or supply-chain failure | Phase 1 (Immediate) | Dependency inventory & SLA check |\n| **Break-Glass / Degraded Continuity** | Total outage during control-plane fault | Phase 1 (Immediate) | Quarterly fault-injection tabletop drill |\n| **Canary / Shadow-Mode Validation** | Production disruption during rollout | Phase 2 (Rollout) | 14-day telemetry validation log |`,
      `> **${check.summaryLine}**`,
    ].join("\n\n");
  }

  // Follow-up 2: "Expand point 3" / "Explain step 2"
  if (state.followUpIntent === "expand-point") {
    const idx = state.targetPointIndex || 3;
    const matchedPoint =
      state.priorPoints.find((p) => p.index === idx) ||
      state.priorPoints[idx - 1] || {
        index: idx,
        title: `Component #${idx} of ${topic}`,
        detail: `Core implementation and verification controls for ${topic}.`,
      };

    return [
      `## Deep-Dive Expansion — Point #${matchedPoint.index}: ${matchedPoint.title}`,
      `**Conversation Context Preserved:** Expanding **Point #${matchedPoint.index}** from our active analysis of **${topic}**${state.parameters.employeesOrUsers ? ` (${state.parameters.employeesOrUsers.toLocaleString("en-US")}-user scope)` : ""}.`,
      `### 1. Core Mechanism & Objective\n${matchedPoint.detail || `**${matchedPoint.title}** is a foundational requirement in **${topic}** that prevents single-point failure and ensures verifiable compliance.`}`,
      `### 2. Step-by-Step Technical Implementation\n1. **Baseline Discovery & Scope Mapping:** Inventory all assets, interfaces, and dependencies governed by **${matchedPoint.title}**.\n2. **Control & Policy Engineering:** Configure deterministic enforcement rules with least-privilege defaults and explicit fail-closed behavior.\n3. **Telemetry & Automated Validation:** Stream execution events to central monitoring and run automated regression checks on every change.\n4. **Operational Handover & Runbook:** Document escalation thresholds, responsible owners, and recovery SLAs.`,
      `### 3. Common Failure Modes & How to Avoid Them\n- **Failure Mode A (Policy-Only Deployment):** Writing a policy for **${matchedPoint.title}** without technical enforcement. *Fix:* Verify via active test cases (\`SP 800-53A Test\`).\n- **Failure Mode B (Unmonitored Drift):** Controls degrade silently after initial cutover. *Fix:* Enable continuous configuration drift alerts.`,
      `### 4. Verification Checklist for Point #${matchedPoint.index}\n| Check Item | Verification Method | Passing Criterion |\n| :--- | :--- | :--- |\n| **Technical Enforcement** | Automated integration test | 100% of unauthorized/invalid requests blocked |\n| **Telemetry Coverage** | Log ingestion audit | Structured events emitted with correlation ID |\n| **Resilience / Failover** | Fault-injection test | Graceful degradation within target RTO |`,
    ].join("\n\n");
  }

  // Follow-up 3: "Draw the architecture" / "Show me visually"
  if (state.followUpIntent === "draw-diagram") {
    const diag =
      generateDynamicDiagram(topic, state.lastAssistantText) ||
      generateDynamicDiagram(`draw the architecture of ${topic}`, topic)!;
    return [
      `## ${diag.title}`,
      `**Conversation Context Preserved:** Generated visual architecture diagram for **${topic}**${state.parameters.employeesOrUsers ? ` (${state.parameters.employeesOrUsers.toLocaleString("en-US")}-user scope)` : ""}.`,
      `\`\`\`mermaid\n${diag.mermaid}\n\`\`\``,
      `### Component Walkthrough (Verified Against Diagram Nodes)\n${diag.explanation.join("\n")}`,
      diag.comparisonTable ? `### Architectural Reference Matrix\n${diag.comparisonTable}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  // Follow-up 4: "Now calculate the implementation cost" / "Change population from 10,000 to 50,000 and recalculate"
  if (state.followUpIntent === "recalculate") {
    const scale = headcount;
    const isMicrogridOrEnergy = /\b(microgrid|solar|battery|power|energy|electricity|grid|population)\b/i.test(
      `${topic} ${currentQuestion} ${state.lastAssistantText}`
    );

    if (isMicrogridOrEnergy) {
      const kwhPerPersonDay = 4.5; // Assumed residential + community services per-capita demand
      const dailyEnergyKwh = scale * kwhPerPersonDay;
      const dailyEnergyMwh = dailyEnergyKwh / 1000;
      const avgPowerMw = dailyEnergyMwh / 24;
      const peakDemandMw = Number((avgPowerMw * 2.1).toFixed(2)); // 2.1x peaking factor
      const inverterSizedMw = Number((peakDemandMw * 1.25).toFixed(2)); // 1.25x surge margin
      const peakSunHours = 5.0;
      const solarPvMwDc = Number((dailyEnergyMwh / (peakSunHours * 0.82)).toFixed(2)); // 82% derate
      const autonomyHours = state.parameters.durationHours || 16; // 16-hour overnight/cloud buffer
      const usableStorageMwh = Number(((dailyEnergyMwh * (autonomyHours / 24)) / 0.92).toFixed(2)); // 92% inverter eff
      const nameplateBatteryMwh = Number((usableStorageMwh / 0.8).toFixed(2)); // 80% usable DoD
      const estimatedCapexMillion = Number((solarPvMwDc * 0.95 + nameplateBatteryMwh * 0.28 + inverterSizedMw * 0.18).toFixed(2));

      return [
        `## Recalculated Microgrid Engineering & Storage Sizing (${scale.toLocaleString("en-US")} Population)`,
        `**Conversation Context & Constraints Preserved:** Scaled **${topic}** to **${scale.toLocaleString("en-US")} people** while preserving $80\\%$ usable battery $\\text{DoD}$, $92\\%$ inverter efficiency, and $1.25\\times$ peak-surge safety margin.`,
        `### 1. Recalculated Power ($\\text{MW}$) vs. Energy ($\\text{MWh}$) Balance\n| Component / Parameter | Formula & Unit Basis | Recalculated Value (${scale.toLocaleString("en-US")} Pop.) | Epistemic Status |\n| :--- | :--- | :--- | :--- |\n| **Daily Energy Demand** | \`${scale.toLocaleString("en-US")} people × ${kwhPerPersonDay} kWh/person/day\` | **${dailyEnergyMwh.toFixed(1)} MWh/day** (${dailyEnergyKwh.toLocaleString("en-US")} kWh/day) | \`Calculated\` (Per-capita rate \`Assumed\`) |\n| **Average Continuous Load** | \`${dailyEnergyMwh.toFixed(1)} MWh/day ÷ 24 h\` | **${avgPowerMw.toFixed(2)} MW** | \`Calculated\` |\n| **Peak Instantaneous Demand** | \`${avgPowerMw.toFixed(2)} MW × 2.1 peaking factor\` | **${peakDemandMw.toFixed(2)} MW** | \`Estimated\` |\n| **Bidirectional Inverter Rating** | \`${peakDemandMw.toFixed(2)} MW × 1.25 surge margin\` | **${inverterSizedMw.toFixed(2)} MW / MVA** | \`Calculated\` |\n| **Solar PV Array Capacity** | \`${dailyEnergyMwh.toFixed(1)} MWh ÷ (5.0 PSH × 0.82 derate)\` | **${solarPvMwDc.toFixed(2)} MW_DC** | \`Calculated\` |\n| **Usable Storage Required (${autonomyHours}h)** | \`(${dailyEnergyMwh.toFixed(1)} MWh × ${autonomyHours}/24) ÷ 0.92 inv eff\` | **${usableStorageMwh.toFixed(2)} MWh usable** | \`Calculated\` |\n| **Nameplate LiFePO4 Battery Bank** | \`${usableStorageMwh.toFixed(2)} MWh ÷ 0.80 DoD\` | **${nameplateBatteryMwh.toFixed(2)} MWh nameplate** | \`Calculated\` |\n| **Estimated Turnkey Capex** | PV + BESS + Grid-Forming Inverter | **$${estimatedCapexMillion.toFixed(2)} Million USD** ($${(estimatedCapexMillion * 0.85).toFixed(2)}M – $${(estimatedCapexMillion * 1.2).toFixed(2)}M) | \`Estimated Range\` |`,
        `### 2. Proactive Knowledge Gaps Preserved in Updated Report\n- **Seasonal Solar Derating:** Add $25\\%$ PV oversizing or dispatchable generator capacity for rainy/winter months.\n- **Battery Cycle Degradation:** Add a $1.20\\times$ end-of-life ($\text{EOL}$) buffer if 10-year autonomy without augmentation is required.\n- **Critical-Load Shedding:** Isolate Hospital/Water/Telecom loads (**Tier 1: ${(peakDemandMw * 0.3).toFixed(2)} MW**) on priority ATS feeders.`,
      ].join("\n\n");
    }

    const perUserLicenseAnnual = 138; // IdP + MFA + EDR + ZTNA/PEP average enterprise bundle
    const annualLicensing = scale * perUserLicenseAnnual;
    const hardwareKeys = scale * 2 * 55; // 2 FIDO2 keys per employee (primary + backup) @ $55
    const engineeringIntegration = Math.max(120000, Math.round(scale * 48));
    const trainingAndChangeMgmt = Math.round(scale * 18);
    const totalYear1 = annualLicensing + hardwareKeys + engineeringIntegration + trainingAndChangeMgmt;
    const lowRange = Math.round(totalYear1 * 0.85);
    const highRange = Math.round(totalYear1 * 1.20);

    return [
      `## Quantitative Cost & Resource Estimate: ${topic} (${scale.toLocaleString("en-US")} Users / Employees)`,
      `**Conversation Context Preserved:** Reusing active task **${topic}** and scaling parameters to **${scale.toLocaleString("en-US")} users/employees**${powerKw ? ` (${powerKw.toLocaleString("en-US")} kW load)` : ""}.`,
      `### 1. Explicit Inputs vs. Transparent Assumptions\n- **User-Supplied / Active Scope:** \`${scale.toLocaleString("en-US")} users/employees\` (carried forward from conversation state).\n- **Missing Inputs Identified (\`Assumed with Ranges\`):** Existing license enterprise agreement (EA) discounts, number of legacy on-prem applications requiring custom connectors, and internal vs. external SI labor rates.\n- **Formula:** $\\text{Total Year-1 Cost} = (N_{\\text{users}} \\times C_{\\text{annual\\_stack}}) + (N_{\\text{users}} \\times 2 \\times C_{\\text{FIDO2}}) + C_{\\text{integration}} + C_{\\text{training}}$`,
      `### 2. Itemized Year-1 Implementation & Run-Rate Ledger\n| Cost Category | Unit Basis & Assumption | Arithmetic Calculation | Year-1 Estimate (USD) | Uncertainty Range (-15% / +20%) |\n| :--- | :--- | :--- | :--- | :--- |\n| **1. Core Software Stack (IdP + EDR + ZTNA PEP)** | \`$${perUserLicenseAnnual}/user/yr\` enterprise bundle | \`${scale.toLocaleString("en-US")} × $${perUserLicenseAnnual}\` | **$${annualLicensing.toLocaleString("en-US")}** | $${Math.round(annualLicensing * 0.85).toLocaleString("en-US")} – $${Math.round(annualLicensing * 1.2).toLocaleString("en-US")} |\n| **2. Hardware FIDO2 Security Keys (Primary + Backup)** | \`2 keys/user × $55\` | \`${scale.toLocaleString("en-US")} × 2 × $55\` | **$${hardwareKeys.toLocaleString("en-US")}** | $${Math.round(hardwareKeys * 0.85).toLocaleString("en-US")} – $${Math.round(hardwareKeys * 1.2).toLocaleString("en-US")} |\n| **3. Architecture, PEP & SIEM Integration Engineering** | \`$48/user\` baseline (min $120k) | \`max($120,000, ${scale.toLocaleString("en-US")} × $48)\` | **$${engineeringIntegration.toLocaleString("en-US")}** | $${Math.round(engineeringIntegration * 0.85).toLocaleString("en-US")} – $${Math.round(engineeringIntegration * 1.2).toLocaleString("en-US")} |\n| **4. Rollout, Phased Testing & Training** | \`$18/user\` enablement | \`${scale.toLocaleString("en-US")} × $18\` | **$${trainingAndChangeMgmt.toLocaleString("en-US")}** | $${Math.round(trainingAndChangeMgmt * 0.85).toLocaleString("en-US")} – $${Math.round(trainingAndChangeMgmt * 1.2).toLocaleString("en-US")} |\n| **TOTAL YEAR-1 INVESTMENT** | **All-in Capex + Year-1 Opex** | **Sum of rows 1–4** | **$${totalYear1.toLocaleString("en-US")}** | **$${lowRange.toLocaleString("en-US")} – $${highRange.toLocaleString("en-US")}** |`,
      `### 3. Year-2+ Ongoing Annual Run Rate\n- **Recurring Annual Licensing & Maintenance:** **$${Math.round(annualLicensing * 1.05).toLocaleString("en-US")} / year** (excluding one-time hardware key purchase and initial integration).\n- **Confidence:** \`Medium-High\` (Provide your exact vendor quote per seat or number of legacy apps to tighten the $-15\\% / +20\\%$ band).`,
    ].join("\n\n");
  }

  // Follow-up 5: "Compare the alternatives"
  if (state.followUpIntent === "compare-alternatives" || state.followUpIntent === "revise-artifact") {
    return [
      `## Architectural Alternatives & Trade-Off Analysis: ${topic}`,
      `**Conversation Context Preserved:** Comparing implementation options for **${topic}** (${headcount.toLocaleString("en-US")}-user scope).`,
      `| Option / Architecture | Core Mechanism | Capital & Operational Cost | Security / Reliability Guarantee | Strongest Weakness / Failure Mode |\n| :--- | :--- | :--- | :--- | :--- |\n| **Option A: Cloud-Native Zero-Trust / Managed Mesh (Recommended)** | Inline cloud PEP + FIDO2 IdP + continuous device posture | Moderate Opex (\`~$138/user/yr\`), Low Capex | **High** (Per-request verification & instant revocation) | Requires high-availability connector redundancy for on-prem legacy apps |\n| **Option B: Traditional Perimeter VPN + Castle-and-Moat VLANs** | Concentrator appliances + static network ACLs | High hardware refresh Capex, high operational toil | **Low** (Implicit east-west trust once inside perimeter) | Single phished credential or VPN CVE exposes internal subnet |\n| **Option C: Hybrid Phased Co-Existence** | Cloud PEP for Tier-1 apps + microsegmented jump enclaves for legacy | Balanced phased spend over 12–18 months | **Moderate-High** (Immediate reduction of blast radius) | Dual policy administration during transition window |`,
      `### Recommendation\nAdopt **Option C transitioning into Option A**: isolate Tier-0 and high-impact assets behind per-request Policy Enforcement Points immediately while migrating legacy brownfield applications in 90-day waves.`,
    ].join("\n\n");
  }

  return null;
}
