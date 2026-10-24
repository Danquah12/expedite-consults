export type NistPub = {
  id: string;
  code: string;
  title: string;
  role: string;
  line: string;
  href: string;
  when: string;
};

export const NIST_LOOP = [
  "CSF — the language",
  "RMF — how you authorize",
  "800-53 — which controls",
  "800-30 — the risk",
  "Then IR, CUI, Zero Trust, AI",
] as const;

export const NIST_PUBS: NistPub[] = [
  {
    id: "csf",
    code: "CSF 2.0",
    title: "Cybersecurity Framework",
    role: "The language",
    line: "Govern, Identify, Protect, Detect, Respond, Recover. CSF 2.0 added Govern. This is how you talk about a program — not a checklist you print once.",
    href: "https://www.nist.gov/cyberframework",
    when: "Day one. Every other NIST pub maps back here.",
  },
  {
    id: "rmf",
    code: "SP 800-37",
    title: "Risk Management Framework",
    role: "How government ships systems",
    line: "Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor. The ATO is a person accepting residual risk — not a green scanner.",
    href: "https://csrc.nist.gov/pubs/sp/800/37/r2/final",
    when: "ISSO / ISSE / AO path. After CSF.",
  },
  {
    id: "controls",
    code: "SP 800-53",
    title: "Security and Privacy Controls",
    role: "The catalog",
    line: "The control families (AC, AU, CM, IA, SC, SI…). FedRAMP, FISMA, and many SSPs are this catalog, selected and tailored.",
    href: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    when: "After RMF Select. You do not implement all of 800-53. You select.",
  },
  {
    id: "risk",
    code: "SP 800-30",
    title: "Guide for Conducting Risk Assessments",
    role: "Likelihood × impact",
    line: "How you argue residual risk to the authorizing official. Without this, RMF is theatre.",
    href: "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
    when: "Beside 800-37, not after it.",
  },
  {
    id: "ir",
    code: "SP 800-61",
    title: "Incident Handling",
    role: "Detect → recover",
    line: "Preparation, detection and analysis, containment, eradication, recovery, lessons learned. The SOC lab uses this story.",
    href: "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
    when: "Defensive track. After CSF Respond / Recover.",
  },
  {
    id: "cui",
    code: "SP 800-171",
    title: "Protecting CUI",
    role: "Contractors and CMMC",
    line: "Controlled Unclassified Information on nonfederal systems. CMMC sits on this. If you sell to DoD, this is the desk.",
    href: "https://csrc.nist.gov/pubs/sp/800/171/r3/final",
    when: "After 800-53. Then CMMC.",
  },
  {
    id: "scrm",
    code: "SP 800-161",
    title: "Cybersecurity Supply-Chain Risk",
    role: "Who built it",
    line: "C-SCRM. SBOM, provenance, third parties. The SCA / Strike desks practice this.",
    href: "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
    when: "With the supply-chain track.",
  },
  {
    id: "zt",
    code: "SP 800-207",
    title: "Zero Trust Architecture",
    role: "Never trust, always verify",
    line: "Identity, device, network, application, data — continuously. Not a VPN slogan.",
    href: "https://csrc.nist.gov/pubs/sp/800/207/final",
    when: "After IAM fundamentals.",
  },
  {
    id: "ai",
    code: "AI RMF 1.0",
    title: "AI Risk Management Framework",
    role: "Govern the model",
    line: "Govern, Map, Measure, Manage. Agentic systems need this before they get a kill switch on Strike.",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
    when: "AI security and agent tracks.",
  },
  {
    id: "ssdf",
    code: "SP 800-218",
    title: "Secure Software Development Framework",
    role: "Build it securely",
    line: "SSDF. How you argue that the pipeline is a control, not a convenience. Maps to SAST / DAST / SCA desks.",
    href: "https://csrc.nist.gov/pubs/sp/800/218/final",
    when: "DevSecOps track. Before first merge to main.",
  },
  {
    id: "id",
    code: "SP 800-63",
    title: "Digital Identity Guidelines",
    role: "Who is at the keyboard",
    line: "Identity proofing, authentication, federation. Passkeys and phishing-resistant MFA live here.",
    href: "https://pages.nist.gov/800-63-3/",
    when: "With MFA / NHI. Before Zero Trust.",
  },
  {
    id: "pqc",
    code: "PQC",
    title: "Post-Quantum Cryptography",
    role: "The next crypto",
    line: "NIST selected algorithms for a world with cryptographically relevant quantum computers. Inventory first, then migrate.",
    href: "https://csrc.nist.gov/projects/post-quantum-cryptography",
    when: "Cryptography module. After TLS fundamentals.",
  },
];

export function nistById(id: string) {
  return NIST_PUBS.find((p) => p.id === id);
}

export const SELECT_STEPS = [
  {
    n: "01",
    title: "Categorize the system",
    body: "FIPS 199 / SP 800-60. Rate Confidentiality, Integrity, and Availability as Low, Moderate, or High. Civilian systems typically take the high-water mark: if any of CIA is High, the impact is High.",
    href: "https://csrc.nist.gov/pubs/fips/199/final",
    label: "FIPS 199",
  },
  {
    n: "02",
    title: "Start from a baseline — not the whole catalog",
    body: "SP 800-53 is every control that exists. SP 800-53B is the starting set: Low, Moderate, High, and a Privacy baseline. FedRAMP, DoD, and intelligence overlays start here too. Nobody implements all of 800-53.",
    href: "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final",
    label: "SP 800-53B",
  },
  {
    n: "03",
    title: "Apply overlays",
    body: "An overlay adds, removes, or strengthens controls for a mission or technology — cloud (FedRAMP), ICS, privacy, classified. Overlays come after the baseline, not instead of it.",
    href: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    label: "SP 800-53 Rev. 5",
  },
  {
    n: "04",
    title: "Tailor",
    body: "Scope what does not apply. Assign organization-defined parameters. Add compensating controls when a baseline control is impractical — and write why. Tailoring without a rationale is just skipping work.",
    href: "https://csrc.nist.gov/pubs/sp/800/37/r2/final",
    label: "RMF Select · 800-37",
  },
  {
    n: "05",
    title: "Allocate: system, inherited, or hybrid",
    body: "Common controls (identity, SOC, physical) are inherited from the organization. System-specific controls sit on this system. Hybrid is both. If you inherit it, name the provider and the inheritance in the SSP.",
    href: "https://csrc.nist.gov/pubs/sp/800/18/r1/final",
    label: "SP 800-18 · SSP",
  },
  {
    n: "06",
    title: "Document, then assess",
    body: "The selected set lives in the System Security Plan. Assessment procedures are SP 800-53A — how an assessor tests each control. Selection without 53A is a list. Selection with 53A is a program.",
    href: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final",
    label: "SP 800-53A",
  },
] as const;

/** How each Select step shows up on Study — not a second catalog. */
export const SELECT_ON_STUDY = [
  { n: "01", desk: "NIST / CISA", does: "Watch CSF. Then FIPS 199. This is Categorize — not a scanner." },
  { n: "02", desk: "NIST / CISA", does: "Open 800-53B. Low / Moderate / High is the starting set." },
  { n: "03", desk: "Cloud / Identity / AI", does: "FedRAMP and cloud overlays live with AWS / Azure films, not as a separate feed." },
  { n: "04", desk: "AXIOM tools · GRC", does: "Tailor in the GRC layer: one finding → one control → one owner. Write the reason." },
  { n: "05", desk: "AXIOM tools · CSPM / IAM", does: "Inherited vs system-specific. CSPM shows what the account actually has." },
  { n: "06", desk: "Range · CTEM lab", does: "SSP is the list. The lab is 53A: prove it, then stamp." },
] as const;

/** SP 800-53B tailoring — every deviation needs a sentence the AO can sign. */
export const TAILOR_MOVES = [
  {
    id: "scope",
    title: "Scope",
    line: "Drop a baseline control only when the technology, location, or mission is not present. 'We do not have wireless' can scope AC-18. 'It is hard' cannot.",
  },
  {
    id: "overlay",
    title: "Overlay",
    line: "FedRAMP, ICS, privacy, classified — overlays add, remove, or strengthen after the baseline. Name the overlay in the SSP. Do not silently mix two baselines.",
  },
  {
    id: "parameter",
    title: "Parameters",
    line: "Organization-defined values (assignment / selection) are tailoring. 'As needed' is not a value. Write the number, the role, or the frequency.",
  },
  {
    id: "compensate",
    title: "Compensate",
    line: "A compensating control must provide equivalent or comparable protection, and you must say why the baseline control is impractical. A different logo is not equivalent.",
  },
  {
    id: "supplement",
    title: "Supplement",
    line: "Adding controls above the baseline is also tailoring. Risk from 800-30 is the reason — not a sales slide.",
  },
] as const;

export const RATIONALE_RULES = [
  "State the baseline control (or enhancement) by ID.",
  "State the tailoring action: scoped, overlay, parameterized, compensated, or supplemented.",
  "State the operational / environmental / mission fact — not a preference.",
  "If compensated: name the replacement and why protection is equivalent.",
  "Name residual risk and who accepts it (the AO, not the scanner).",
  "Put that paragraph in the SSP (SP 800-18). If it is only in a ticket, it is not tailored — it is missing.",
] as const;

export const RATIONALE_EXAMPLE = {
  bad: "AC-18 is N/A. We are cloud-native.",
  good: "AC-18 (Wireless Access) is scoped as not applicable. The system has no wireless interfaces, no WLAN, and no guest SSID. Access is VPC + identity only (inherited SC-7, AC-17). Residual risk: none from wireless. AO: accept as scoped.",
};

export type ControlFamily = {
  id: string;
  name: string;
  line: string;
  examples: string;
  desk: string;
  href: string;
};

const F = "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final";

/** SP 800-53 Rev. 5 families. 800-53B picks a subset per Low / Moderate / High — not the whole family. */
export const CONTROL_FAMILIES: ControlFamily[] = [
  { id: "AC", name: "Access Control", line: "Who may do what. Least privilege, accounts, wireless, remote.", examples: "AC-2, AC-3, AC-6, AC-17", desk: "AXIOM CSPM / IAM", href: F },
  { id: "AT", name: "Awareness and Training", line: "People are a control. Role-based, insider, literacy.", examples: "AT-2, AT-3", desk: "Study hall", href: F },
  { id: "AU", name: "Audit and Accountability", line: "What happened, who did it, can you prove it.", examples: "AU-2, AU-3, AU-6, AU-12", desk: "SOC lab · SIEM", href: F },
  { id: "CA", name: "Assessment, Authorization, and Monitoring", line: "RMF live: assess, authorize, continuous monitor.", examples: "CA-2, CA-5, CA-7", desk: "CTEM lab · GRC", href: F },
  { id: "CM", name: "Configuration Management", line: "Baselines, change, inventory. Drift is a finding.", examples: "CM-2, CM-3, CM-6, CM-8", desk: "CSPM · IaC", href: F },
  { id: "CP", name: "Contingency Planning", line: "When it fails: backup, recover, alternate site.", examples: "CP-2, CP-4, CP-9, CP-10", desk: "Aegis Recovery", href: F },
  { id: "IA", name: "Identification and Authentication", line: "Who is at the keyboard — or the workload.", examples: "IA-2, IA-5, IA-8, IA-9", desk: "Passkeys · NHI", href: F },
  { id: "IR", name: "Incident Response", line: "800-61 in control language: prepare, detect, contain.", examples: "IR-4, IR-6, IR-8", desk: "SOC · CERBERUS", href: F },
  { id: "MA", name: "Maintenance", line: "Who touches the box, and how you watch them.", examples: "MA-2, MA-4", desk: "Open at NIST", href: F },
  { id: "MP", name: "Media Protection", line: "Disks, USBs, paper, sanitize, mark.", examples: "MP-2, MP-6", desk: "Open at NIST", href: F },
  { id: "PE", name: "Physical and Environmental", line: "Doors, power, visitors. Cloud inherits a lot of this.", examples: "PE-2, PE-3, PE-6", desk: "Inherited common controls", href: F },
  { id: "PL", name: "Planning", line: "The SSP, the architecture, the privacy plan.", examples: "PL-2, PL-8", desk: "GRC · SSP", href: F },
  { id: "PM", name: "Program Management", line: "Org-level: strategy, resources, POA&M program.", examples: "PM-1, PM-4, PM-9", desk: "GRC layer", href: F },
  { id: "PS", name: "Personnel Security", line: "Hire, screen, transfer, terminate.", examples: "PS-2, PS-4", desk: "Open at NIST", href: F },
  { id: "PT", name: "PII Processing and Transparency", line: "Rev. 5 privacy family. Consent, notice, minimization.", examples: "PT-2, PT-3, PT-5", desk: "Privacy overlay", href: F },
  { id: "RA", name: "Risk Assessment", line: "800-30 in controls: assess, scan, vulnerability.", examples: "RA-3, RA-5, RA-7", desk: "CTEM · Strike", href: F },
  { id: "SA", name: "System and Services Acquisition", line: "How you buy and build. Developers and vendors.", examples: "SA-3, SA-8, SA-11, SA-15", desk: "SSDF · SAST", href: F },
  { id: "SC", name: "System and Communications Protection", line: "Boundary, crypto, isolation, denial of service.", examples: "SC-7, SC-8, SC-13, SC-28", desk: "Cloud · K8s · CSPM", href: F },
  { id: "SI", name: "System and Information Integrity", line: "Flaw, malware, monitoring, spam, integrity.", examples: "SI-2, SI-3, SI-4, SI-7", desk: "SOC · container scan", href: F },
  { id: "SR", name: "Supply Chain Risk Management", line: "Rev. 5. Provenance, SBOM, who built it.", examples: "SR-1, SR-3, SR-4, SR-11", desk: "SCA · 800-161", href: F },
];

export function familyById(id: string) {
  return CONTROL_FAMILIES.find((f) => f.id.toLowerCase() === id.toLowerCase());
}

export const CLINIC_FAMILY_IDS = ["AC", "IA", "AU", "IR", "CA", "CM", "SC", "SI", "SR", "RA", "PT", "SA", "CP"] as const;

export type FamilyExam = {
  id: string;
  examine: string[];
  interview: string;
  test: string;
  labId?: string;
  toolId?: string;
};

export const FAMILY_EXAMS: FamilyExam[] = [
  {
    id: "AC",
    examine: ["Account list vs SSP (AC-2)", "IAM / RBAC policies (AC-3, AC-6)", "Remote access path (AC-17)", "Wireless: present or scoped (AC-18)"],
    interview: "Who approves access, who recertifies, who owns the admin role.",
    test: "On the range: create a least-privilege user, try a denied action, confirm the deny. Do not test production IAM.",
    labId: "nhi",
    toolId: "cspm",
  },
  {
    id: "IA",
    examine: ["MFA enrollment report (IA-2)", "Authenticator policy vs 800-63 (IA-5)", "Workload / service identities (IA-9)", "Federation / IdP config"],
    interview: "IdP owner. Who can mint a service principal.",
    test: "Range: sign in without MFA — it must fail. Passkeys desk. NHI lab for machine identity.",
    labId: "nhi",
    toolId: "secrets",
  },
  {
    id: "AU",
    examine: ["What is logged (AU-2)", "Log content: who, what, when (AU-3)", "Review tickets (AU-6)", "Clock and retention (AU-12)"],
    interview: "SOC lead: who reads AU-6 reviews, how often.",
    test: "SOC lab: one event in, one alert out, one ticket. Silence is other-than-satisfied.",
    labId: "soc",
  },
  {
    id: "IR",
    examine: ["IR plan vs 800-61 (IR-8)", "Last tabletop record (IR-2)", "Notification path (IR-6)", "Playbook for ransomware"],
    interview: "Incident commander and legal/comms owner.",
    test: "CERBERUS / SOC tabletop. Time-to-contain is the test, not the PDF.",
    labId: "soc",
  },
  {
    id: "CA",
    examine: ["Last assessment (CA-2)", "POA&M that actually moves (CA-5)", "Continuous monitoring cadence (CA-7)", "Authorization package date"],
    interview: "ISSO and AO: when is the next CA-7 walk.",
    test: "CTEM lab — weekly path, not annual binder.",
    labId: "ctem",
    toolId: "grc",
  },
  {
    id: "CM",
    examine: ["Golden image / IaC baseline (CM-2)", "Change tickets (CM-3)", "Hardening standard (CM-6)", "Asset inventory vs reality (CM-8)"],
    interview: "Who can merge to main. Who can click in the console.",
    test: "CSPM: drift from the baseline. IaC scan on the range.",
    toolId: "cspm",
    labId: "s3",
  },
  {
    id: "SC",
    examine: ["Boundary diagram (SC-7)", "TLS / crypto inventory (SC-8, SC-13)", "Encryption at rest (SC-28)", "Public endpoints vs SSP"],
    interview: "Network / cloud owner: what is internet-facing on purpose.",
    test: "CTEM path: public object → role. K8s network policy on the range.",
    labId: "path",
    toolId: "cspm",
  },
  {
    id: "SI",
    examine: ["Patch SLA vs SI-2", "Malware / runtime agent coverage (SI-3)", "Monitoring (SI-4)", "Integrity of images (SI-7)"],
    interview: "Who owns unpatched KEV.",
    test: "Container scan + Falco session. KEV on the CTEM board.",
    labId: "k8s",
    toolId: "sast",
  },
  {
    id: "SR",
    examine: ["Vendor list and provenance (SR-3)", "SBOM for what you ship (SR-4)", "Signed artifacts", "Third-party overlay"],
    interview: "Who can add a dependency. Who can add a model.",
    test: "SCA lab: one poisoned package in the lockfile — would we see it.",
    labId: "supply",
    toolId: "sca",
  },
  {
    id: "RA",
    examine: ["Last 800-30 assessment (RA-3)", "Scan cadence and scope (RA-5)", "Risk response records (RA-7)"],
    interview: "Who accepts residual risk besides the scanner.",
    test: "CTEM: prioritize path over CVSS. Strike only on the range.",
    labId: "ctem",
    toolId: "grc",
  },
  {
    id: "PT",
    examine: ["Notices and purpose (PT-2, PT-3)", "Minimization (PT-5)", "Privacy overlay on the baseline"],
    interview: "Privacy officer. Who can export PII.",
    test: "Do not test with real PII. Hypothetical dataset on the range only.",
    toolId: "grc",
  },
  {
    id: "SA",
    examine: ["SDLC vs SSDF (SA-3, SA-8)", "Code review / SAST gate (SA-11)", "Dev pipeline ownership (SA-15)"],
    interview: "Engineering lead: can a commit skip SAST.",
    test: "SAST desk on a lab repo. Never scan a customer tenant.",
    labId: "supply",
    toolId: "sast",
  },
  {
    id: "CP",
    examine: ["Contingency plan (CP-2)", "Last restore test (CP-4)", "Backup copies (CP-9)", "Recovery time evidence (CP-10)"],
    interview: "Who declares the disaster. Who restores.",
    test: "Aegis: restore a lab backup. A plan without a restore is Examine-only — not Test.",
    toolId: "aegis",
  },
];

export function examByFamily(id: string) {
  return FAMILY_EXAMS.find((e) => e.id.toLowerCase() === id.toLowerCase());
}

export type ControlArtifact = {
  family: string;
  id: string;
  name: string;
  object: "Specification" | "Mechanism" | "Activity";
  student: string;
  study: string;
};

/** 800-53A Examine objects: what the student must produce vs what Study shows (hypothetical clinic-corp). */
export const CONTROL_ARTIFACTS: ControlArtifact[] = [
  { family: "AC", id: "AC-2", name: "Account Management", object: "Mechanism", student: "Account inventory + last recertification (export).", study: "clinic-corp: 412 accounts, 9 orphaned NHI, recert 14 months stale." },
  { family: "AC", id: "AC-3", name: "Access Enforcement", object: "Mechanism", student: "RBAC / IAM policy for one role.", study: "Billing-api role allows s3:Get* on * — not least privilege." },
  { family: "AC", id: "AC-6", name: "Least Privilege", object: "Mechanism", student: "Admin vs user permission diff. Name who is admin.", study: "8 humans in AdministratorAccess. SSP says 2." },
  { family: "AC", id: "AC-17", name: "Remote Access", object: "Specification", student: "Remote-access path in the SSP (VPN / ZTNA / none).", study: "SSP: ZTNA. Reality: SSH from 0.0.0.0/0 on a bastion." },
  { family: "AC", id: "AC-18", name: "Wireless Access", object: "Specification", student: "In scope, inherited, or scoped with rationale.", study: "Scoped N/A — no WLAN. Rationale in SSP (good example)." },

  { family: "IA", id: "IA-2", name: "Identification and Authentication", object: "Mechanism", student: "MFA enrollment report for interactive users.", study: "MFA on humans 91%. Service accounts: none." },
  { family: "IA", id: "IA-5", name: "Authenticator Management", object: "Specification", student: "Authenticator policy vs 800-63 AAL.", study: "Password-only IdP. No passkeys. AAL1 in a Moderate system." },
  { family: "IA", id: "IA-8", name: "Non-Organizational Users", object: "Specification", student: "How vendors/partners authenticate.", study: "Vendor SSO to the same admin role as staff." },
  { family: "IA", id: "IA-9", name: "Service Identification", object: "Mechanism", student: "Workload / NHI inventory (roles, keys, age).", study: "9 orphaned NHI. One key 4 years old in Secrets Manager." },

  { family: "AU", id: "AU-2", name: "Event Logging", object: "Specification", student: "List of events you log — and what you do not.", study: "CloudTrail on. Console-login without MFA: not in AU-2 list." },
  { family: "AU", id: "AU-3", name: "Content of Audit Records", object: "Mechanism", student: "One sample record: who, what, when, from where.", study: "Sample lacks actor ARN on S3 GetObject." },
  { family: "AU", id: "AU-6", name: "Audit Record Review", object: "Activity", student: "Last review ticket / SIEM hunt with date and owner.", study: "No AU-6 ticket in 90 days. Alerts auto-closed." },
  { family: "AU", id: "AU-12", name: "Audit Record Generation", object: "Mechanism", student: "Retention + clock sync evidence.", study: "90-day retention. SSP says 1 year. NTP drift unmeasured." },

  { family: "IR", id: "IR-4", name: "Incident Handling", object: "Activity", student: "One handled incident (or tabletop) with timeline.", study: "Last event: ransomware tabletop, T+4h still debating who pages legal." },
  { family: "IR", id: "IR-6", name: "Incident Reporting", object: "Specification", student: "Who you notify, in what hours (US-CERT / customer / AO).", study: "Plan says CISA in 24h. Comms tree has a departed VP." },
  { family: "IR", id: "IR-8", name: "Incident Response Plan", object: "Specification", student: "IR plan mapped to 800-61. Date of last signature.", study: "Plan dated 2022. No 800-61 roles. No ransomware annex." },

  { family: "CA", id: "CA-2", name: "Control Assessments", object: "Activity", student: "Last SAP + SAR (or 53A excerpt) with date.", study: "Last SAR: 11 months ago. Scanner PDF only — no Interview." },
  { family: "CA", id: "CA-5", name: "Plan of Action and Milestones", object: "Activity", student: "POA&M with owner and a date, not 'ongoing'.", study: "14 open items. 9 say ongoing. None moved this quarter." },
  { family: "CA", id: "CA-7", name: "Continuous Monitoring", object: "Specification", student: "ISCM cadence (800-137) — what you watch weekly.", study: "Annual assessor. No 137 strategy. CTEM lab is the fix." },

  { family: "CM", id: "CM-2", name: "Baseline Configuration", object: "Specification", student: "Golden image or IaC repo + version pinned.", study: "Terraform in Git. Prod drifted: public ACL on clinic-uploads." },
  { family: "CM", id: "CM-3", name: "Configuration Change Control", object: "Activity", student: "One change ticket that reached prod.", study: "Last prod change: console click. No ticket." },
  { family: "CM", id: "CM-6", name: "Configuration Settings", object: "Mechanism", student: "Hardening standard (CIS / STIG / SCAP) vs actual.", study: "CIS not applied. SSH password auth still on." },
  { family: "CM", id: "CM-8", name: "System Component Inventory", object: "Mechanism", student: "Asset list vs cloud inventory (diff).", study: "SSP: 40 assets. CSPM: 12k. 40 internet-facing unknown to SSP." },

  { family: "SC", id: "SC-7", name: "Boundary Protection", object: "Specification", student: "Boundary diagram + internet-facing list.", study: "Diagram ends at VPC. Public S3 and a bastion are off-diagram." },
  { family: "SC", id: "SC-8", name: "Transmission Confidentiality", object: "Mechanism", student: "TLS inventory (800-52) for one service.", study: "API still offers TLS 1.0 on a forgotten ELB." },
  { family: "SC", id: "SC-13", name: "Cryptographic Protection", object: "Mechanism", student: "FIPS 140-3 module name — or a gap.", study: "'We use AES' in the SSP. No module listed." },
  { family: "SC", id: "SC-28", name: "Protection of Information at Rest", object: "Mechanism", student: "Encryption-at-rest setting + key owner.", study: "RDS encrypted. S3 clinic-uploads: not. Key in the app repo." },

  { family: "SI", id: "SI-2", name: "Flaw Remediation", object: "Activity", student: "Patch SLA vs KEV / one remediated CVE.", study: "3 KEV on public apps. SLA 30 days. Age: 60." },
  { family: "SI", id: "SI-3", name: "Malicious Code Protection", object: "Mechanism", student: "Runtime / malware agent coverage %.", study: "Laptops: yes. Containers: none. Falco not deployed." },
  { family: "SI", id: "SI-4", name: "System Monitoring", object: "Mechanism", student: "What you detect (800-94) and where it pages.", study: "GuardDuty on. No page. SOC lab is the Test." },
  { family: "SI", id: "SI-7", name: "Software Integrity", object: "Mechanism", student: "Image/signature policy (signed artifacts).", study: "latest tag on prod. No signature. SR-4 related." },

  { family: "SR", id: "SR-1", name: "C-SCRM Policy", object: "Specification", student: "C-SCRM policy (800-161) with an owner.", study: "No SR policy. Vendors in a spreadsheet from 2021." },
  { family: "SR", id: "SR-3", name: "Supply Chain Controls", object: "Activity", student: "Vendor list + how you vet one new supplier.", study: "New model API added last month. No review." },
  { family: "SR", id: "SR-4", name: "Provenance", object: "Mechanism", student: "SBOM for what you ship (or a gap).", study: "No SBOM. Lockfile has a typosquat candidate." },
  { family: "SR", id: "SR-11", name: "Component Authenticity", object: "Mechanism", student: "How you know the binary is yours.", study: "Unsigned container. Registry is public-pull." },

  { family: "RA", id: "RA-3", name: "Risk Assessment", object: "Specification", student: "Last 800-30 assessment (likelihood × impact).", study: "CVSS dump labeled 'risk assessment'. No 800-30." },
  { family: "RA", id: "RA-5", name: "Vulnerability Monitoring", object: "Activity", student: "Scan cadence, scope, last report.", study: "Weekly CVSS. No path view. Public S3 missed." },
  { family: "RA", id: "RA-7", name: "Risk Response", object: "Activity", student: "One accepted risk with AO signature.", study: "Risks auto-accepted in the scanner. No AO." },

  { family: "PT", id: "PT-2", name: "Authority to Process", object: "Specification", student: "Purpose / authority to process PII.", study: "No notice. Hypothetical patient field in billing API." },
  { family: "PT", id: "PT-3", name: "Personally Identifiable Information", object: "Specification", student: "PII inventory (types, not real records).", study: "Inventory: name, MRN, email. SSP privacy appendix empty." },
  { family: "PT", id: "PT-5", name: "Minimization", object: "Mechanism", student: "What you do not collect — and proof.", study: "SSN collected 'in case'. No minimization." },

  { family: "SA", id: "SA-3", name: "System Development Life Cycle", object: "Specification", student: "SDLC / SSDF (800-218) mapped to the pipeline.", study: "No SDLC. Prod hotfix from laptops." },
  { family: "SA", id: "SA-8", name: "Security Engineering Principles", object: "Specification", student: "800-160 principle you actually applied.", study: "Architecture review skipped for the billing rewrite." },
  { family: "SA", id: "SA-11", name: "Developer Testing", object: "Activity", student: "SAST/DAST gate evidence — one pipeline run.", study: "SAST can be skipped with a label. Last week: 12 skips." },
  { family: "SA", id: "SA-15", name: "Development Process", object: "Activity", student: "Who can change the pipeline.", study: "Any engineer admin on GitHub org." },

  { family: "CP", id: "CP-2", name: "Contingency Plan", object: "Specification", student: "CP vs 800-34. RTO/RPO written.", study: "Plan exists. RTO 'best effort'. No system list." },
  { family: "CP", id: "CP-4", name: "Contingency Plan Testing", object: "Activity", student: "Last restore test with date and result.", study: "Last restore: never. Backups 'enabled'." },
  { family: "CP", id: "CP-9", name: "System Backup", object: "Mechanism", student: "Backup copies, location, encryption.", study: "Snapshots in the same account. No offsite." },
  { family: "CP", id: "CP-10", name: "System Recovery", object: "Activity", student: "Evidence you met RTO once.", study: "No recovery clock. Aegis lab is the Test." },
];

export function artifactsFor(familyId: string) {
  return CONTROL_ARTIFACTS.filter((a) => a.family.toLowerCase() === familyId.toLowerCase());
}

/** SP 800-53A — how you assess what 800-53B selected. */
export const ASSESS_METHODS = [
  {
    id: "examine",
    title: "Examine",
    line: "Read, inspect, observe. Policies, configs, architecture, logs, screenshots. You do not have to touch the live system.",
    objects: "Specifications (SSP, procedures), mechanisms (configs), activities (tickets, change records).",
    clinic: "Open the GRC layer and the CSPM export. That is Examine.",
  },
  {
    id: "interview",
    title: "Interview",
    line: "Ask the people who operate the control. Owners, admins, the SOC. A policy with no owner fails the interview before you test anything.",
    objects: "Individuals and groups named in the SSP.",
    clinic: "GRC owner field. If it is blank, Interview already failed.",
  },
  {
    id: "test",
    title: "Test",
    line: "Exercise the mechanism. Does MFA actually block? Does the bucket stay private? Compare expected vs actual under stated conditions.",
    objects: "Mechanisms and activities — on a range, never on a production tenant you do not own.",
    clinic: "CTEM / Strike labs. That is Test. A scanner dump is not a test by itself.",
  },
] as const;

export const ASSESS_OBJECTS = [
  { id: "spec", title: "Specifications", line: "Plans, policies, procedures, architectures. Examine first." },
  { id: "mech", title: "Mechanisms", line: "Hardware, software, firmware, cloud settings. Examine and Test." },
  { id: "act", title: "Activities", line: "Operations you can watch: patching, reviews, incident drills." },
  { id: "ind", title: "Individuals", line: "The humans named as operators. Interview." },
] as const;

export const ASSESS_DEPTH = [
  { id: "depth", title: "Depth", line: "Generalized → focused → detailed. How far into the control you go." },
  { id: "coverage", title: "Coverage", line: "Representative → focused → comprehensive. How much of the system you sample." },
] as const;

export const ASSESS_OUTPUT = [
  "SAP — Security Assessment Plan: which methods, objects, depth, and coverage you will use.",
  "SAR — Security Assessment Report: satisfied or other-than-satisfied, with evidence.",
  "POA&M — every other-than-satisfied becomes a weakness with an owner and a date.",
  "The AO reads the SAR. They do not read your scanner.",
] as const;

export type RmfPub = { code: string; title: string; href: string; applies: string; mark?: "fips" | "sp" };

export type RmfStage = {
  id: string;
  n: string;
  title: string;
  line: string;
  pubs: RmfPub[];
};

const H = {
  fips199: "https://csrc.nist.gov/pubs/fips/199/final",
  fips200: "https://csrc.nist.gov/pubs/fips/200/final",
  fips140: "https://csrc.nist.gov/pubs/fips/140-3/final",
  fips201: "https://csrc.nist.gov/pubs/fips/201/3/final",
  sp37: "https://csrc.nist.gov/pubs/sp/800/37/r2/final",
  sp39: "https://csrc.nist.gov/pubs/sp/800/39/final",
  sp53: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
  sp53b: "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final",
  sp53a: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final",
  sp18: "https://csrc.nist.gov/pubs/sp/800/18/r1/final",
  sp30: "https://csrc.nist.gov/pubs/sp/800/30/r1/final",
  sp60: "https://csrc.nist.gov/pubs/sp/800/60/v1r1/final",
  sp137: "https://csrc.nist.gov/pubs/sp/800/137/final",
  sp137a: "https://csrc.nist.gov/pubs/sp/800/137/a/final",
  sp160: "https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final",
  sp160v2: "https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final",
  sp161: "https://csrc.nist.gov/pubs/sp/800/161/r1/final",
  sp171: "https://csrc.nist.gov/pubs/sp/800/171/r3/final",
  sp171a: "https://csrc.nist.gov/pubs/sp/800/171/a/r3/final",
  sp172: "https://csrc.nist.gov/pubs/sp/800/172/r3/final",
  sp34: "https://csrc.nist.gov/pubs/sp/800/34/r1/final",
  sp40: "https://csrc.nist.gov/pubs/sp/800/40/r4/final",
  sp41: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
  sp46: "https://csrc.nist.gov/pubs/sp/800/46/r2/final",
  sp47: "https://csrc.nist.gov/pubs/sp/800/47/r1/final",
  sp50: "https://csrc.nist.gov/pubs/sp/800/50/final",
  sp52: "https://csrc.nist.gov/pubs/sp/800/52/r2/final",
  sp55: "https://csrc.nist.gov/pubs/sp/800/55/r1/final",
  sp57: "https://csrc.nist.gov/pubs/sp/800/57/part-1/r5/final",
  sp61: "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
  sp63: "https://pages.nist.gov/800-63-3/",
  sp70: "https://csrc.nist.gov/pubs/sp/800/70/r4/final",
  sp82: "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
  sp83: "https://csrc.nist.gov/pubs/sp/800/83/r1/final",
  sp84: "https://csrc.nist.gov/pubs/sp/800/84/final",
  sp86: "https://csrc.nist.gov/pubs/sp/800/86/final",
  sp88: "https://csrc.nist.gov/pubs/sp/800/88/r1/final",
  sp92: "https://csrc.nist.gov/pubs/sp/800/92/final",
  sp94: "https://csrc.nist.gov/pubs/sp/800/94/final",
  sp115: "https://csrc.nist.gov/pubs/sp/800/115/final",
  sp122: "https://csrc.nist.gov/pubs/sp/800/122/final",
  sp124: "https://csrc.nist.gov/pubs/sp/800/124/r2/final",
  sp128: "https://csrc.nist.gov/pubs/sp/800/128/final",
  sp144: "https://csrc.nist.gov/pubs/sp/800/144/final",
  sp181: "https://csrc.nist.gov/pubs/sp/800/181/r1/final",
  sp184: "https://csrc.nist.gov/pubs/sp/800/184/final",
  sp190: "https://csrc.nist.gov/pubs/sp/800/190/final",
  sp204: "https://csrc.nist.gov/pubs/sp/800/204/final",
  sp207: "https://csrc.nist.gov/pubs/sp/800/207/final",
  sp210: "https://csrc.nist.gov/pubs/sp/800/210/final",
  sp218: "https://csrc.nist.gov/pubs/sp/800/218/final",
  csf: "https://www.nist.gov/cyberframework",
  airmf: "https://www.nist.gov/itl/ai-risk-management-framework",
} as const;

function fips(code: string, title: string, href: string, applies: string): RmfPub {
  return { code, title, href, applies, mark: "fips" };
}
function sp(code: string, title: string, href: string, applies: string): RmfPub {
  return { code, title, href, applies, mark: "sp" };
}

/** FIPS + 37/160/161/171/137 on each RMF stage — after the 800-53 spine. */
export const RMF_STAGES: RmfStage[] = [
  {
    id: "prepare",
    n: "0",
    title: "Prepare",
    line: "800-37 org + system prepare. 160 is how you engineer. 161 is who you buy from. No FIPS 199 yet.",
    pubs: [
      sp("SP 800-37", "RMF — Prepare tasks", H.sp37, "Every later stage assumes this: roles, strategy, privacy, common controls, authorization boundary."),
      sp("SP 800-39", "Enterprise risk", H.sp39, "Frame risk at the organization. 37 sits inside 39, not the other way around."),
      sp("SP 800-160 Vol. 1", "Systems security engineering", H.sp160, "Requirements and architecture before Categorize. Security is a design property."),
      sp("SP 800-160 Vol. 2", "Cyber resiliency", H.sp160v2, "Anticipate, withstand, recover, adapt — Prepare the system to fail well."),
      sp("SP 800-161", "C-SCRM", H.sp161, "Supplier inventory, provenance, AIBOM. SR family starts here."),
      sp("SP 800-171", "CUI program (nonfederal)", H.sp171, "If you handle CUI off-fed, Prepare a 171 program — not a 53 SSP — unless you are the agency."),
    ],
  },
  {
    id: "categorize",
    n: "1",
    title: "Categorize",
    line: "FIPS 199 is the law of impact. 800-37 records it. 171 starts when the type is CUI on a contractor system.",
    pubs: [
      fips("FIPS 199", "Security categorization", H.fips199, "C / I / A = Low, Moderate, or High. Civilian high-water mark. This is a FIPS, not a guide."),
      sp("SP 800-37", "RMF — Categorize", H.sp37, "Document the system, types, and impact in the SSP. Boundary from Prepare."),
      sp("SP 800-60", "Information types", H.sp60, "Maps data (health, financial, CUI) to FIPS 199 impact."),
      fips("FIPS 200", "Minimum security requirements", H.fips200, "Seventeen areas you must cover once categorized. 53/53B is how federal systems do it."),
      sp("SP 800-171", "Is this CUI?", H.sp171, "Nonfederal system + CUI → 171, not 53B. Same impact idea, different catalog."),
    ],
  },
  {
    id: "select",
    n: "2",
    title: "Select",
    line: "Federal: FIPS 200 → 53B. Contractor CUI: 171 (and 172 if enhanced). 161 adds SR. 37 says write the rationale.",
    pubs: [
      sp("SP 800-37", "RMF — Select", H.sp37, "Baseline + overlay + tailor + allocate. Rationale in the SSP."),
      fips("FIPS 200", "Minimum requirements", H.fips200, "Why you are not allowed to skip a family without a reason."),
      sp("SP 800-53B", "Control baselines", H.sp53b, "Low / Moderate / High from FIPS 199. Then tailor."),
      sp("SP 800-53", "Catalog", H.sp53, "Families you select from — including SR from 161."),
      sp("SP 800-171", "CUI requirements", H.sp171, "Contractor catalog. Mapped to 53, not a replacement for FIPS 199."),
      sp("SP 800-172", "Enhanced CUI", H.sp172, "Select extra 172 requirements when the CUI is high-value / APT-relevant."),
      sp("SP 800-161", "SR family", H.sp161, "Supply-chain controls you add at Select, not at Monitor after a breach."),
      sp("SP 800-18", "SSP", H.sp18, "The selected set, inheritance, and rationale live here."),
    ],
  },
  {
    id: "implement",
    n: "3",
    title: "Implement",
    line: "37: as-implemented SSP. 160: engineering. FIPS 140/201: crypto and PIV. 171: the same requirements on the contractor stack.",
    pubs: [
      sp("SP 800-37", "RMF — Implement", H.sp37, "Update the SSP to as-implemented. Inheritance named."),
      sp("SP 800-160 Vol. 1", "Build the control", H.sp160, "Implementation is engineering, not a checkbox in GRC."),
      fips("FIPS 140-3", "Crypto modules", H.fips140, "SC-13: validated modules. 'We use AES' is not 140."),
      fips("FIPS 201", "PIV", H.fips201, "IA for federal identity badges. Contractors often federate, not skip."),
      sp("SP 800-161", "Implement C-SCRM", H.sp161, "SBOMs, signed artifacts, vendor clauses — SCA / SR desks."),
      sp("SP 800-171", "Implement CUI safeguards", H.sp171, "Same 14 families of 171 requirements, on the system you actually run."),
    ],
  },
  {
    id: "assess",
    n: "4",
    title: "Assess",
    line: "Federal: 53A. CUI contractor: 171A. 37 produces the SAR. 160 evidence is design, not a scan.",
    pubs: [
      sp("SP 800-37", "RMF — Assess", H.sp37, "SAP then SAR. Independent assessor. Findings → POA&M."),
      sp("SP 800-53A", "Assessment methods", H.sp53a, "Examine / Interview / Test on the 53B set."),
      sp("SP 800-171A", "Assessing 171", H.sp171a, "Same three methods against 171 requirements — CMMC assessors live here."),
      sp("SP 800-30", "Risk assessment", H.sp30, "Residual risk after findings. Feeds Authorize."),
      sp("SP 800-160 Vol. 1", "Evidence of design", H.sp160, "Examine architecture artifacts, not only runtime scans."),
    ],
  },
  {
    id: "authorize",
    n: "5",
    title: "Authorize",
    line: "37 is the only pub that creates an ATO. 171 does not issue federal ATOs — CMMC / contracting officer sits here for CUI.",
    pubs: [
      sp("SP 800-37", "RMF — Authorize", H.sp37, "AO accepts residual risk. ATO, denial, or interim. Package: SSP + SAR + POA&M."),
      fips("FIPS 199", "Impact the AO signed", H.fips199, "You cannot authorize High impact on a Moderate baseline without a new categorize."),
      sp("SP 800-30", "What the AO signs", H.sp30, "Residual risk statement. Not a scanner dashboard."),
      sp("SP 800-171", "CUI contractor decision", H.sp171, "No federal ATO. Contracting officer / CMMC status is the analogous gate."),
    ],
  },
  {
    id: "monitor",
    n: "6",
    title: "Monitor",
    line: "137 is ISCM. 37 says authorization is continuous. 161 watches suppliers. 171 still applies after award.",
    pubs: [
      sp("SP 800-37", "RMF — Monitor", H.sp37, "Ongoing authorization. Significant change → re-categorize or re-assess."),
      sp("SP 800-137", "ISCM", H.sp137, "Define → establish → implement → analyze → respond → review. CA-7."),
      sp("SP 800-137A", "Assess the ISCM program", H.sp137a, "You assess the monitoring program, not only the system."),
      sp("SP 800-53A", "Ongoing 53A", H.sp53a, "Smaller coverage, more often. Same methods."),
      sp("SP 800-161", "Ongoing C-SCRM", H.sp161, "New supplier, new model, new SBOM — Monitor, not a one-time Select."),
      sp("SP 800-171", "CUI after award", H.sp171, "171 does not end at contract signature. Same Monitor idea, contractor evidence."),
    ],
  },
];

/** Remaining NIST SPs on the cycle — compact under each stage. */
export const RMF_ALSO: Record<string, RmfPub[]> = {
  prepare: [
    sp("CSF 2.0", "Cybersecurity Framework", H.csf, "Govern. Language before FIPS 199."),
    sp("AI RMF", "AI Risk Management Framework", H.airmf, "If the system is or uses a model — Prepare Govern."),
    sp("SP 800-181", "NICE workforce", H.sp181, "Name ISSO, AO, engineer."),
    sp("SP 800-47", "System interconnections", H.sp47, "Authorization boundary and ISA/MOU."),
    sp("SP 800-18", "SSP outline", H.sp18, "Start the plan in Prepare, bind it at Select."),
    sp("SP 800-30", "Frame risk", H.sp30, "How you will assess — not the system scan yet."),
    sp("SP 800-122", "PII confidentiality", H.sp122, "Privacy overlay when PII is in scope."),
    sp("SP 800-50", "Awareness program", H.sp50, "AT family starts as a program, not a video."),
  ],
  categorize: [
    sp("SP 800-122", "PII impact", H.sp122, "PII often raises Confidentiality to Moderate or High."),
    sp("SP 800-82", "OT / ICS impact", H.sp82, "Safety/availability on industrial systems."),
    sp("SP 800-18", "Describe the system", H.sp18, "Types and impact go in the SSP."),
    sp("SP 800-144", "Cloud considerations", H.sp144, "Cloud does not lower FIPS 199 by itself."),
  ],
  select: [
    sp("SP 800-207", "Zero Trust overlay", H.sp207, "Identity, device, path — extra Select, not a slogan."),
    sp("SP 800-82", "OT overlay", H.sp82, "ICS baseline on top of 53B."),
    sp("SP 800-218", "SSDF → SA family", H.sp218, "Pipeline controls at Select."),
    fips("FIPS 140-3", "Crypto in the set", H.fips140, "SC-13: validated modules in the baseline."),
    sp("SP 800-63", "Identity overlay", H.sp63, "IA authenticator assurance."),
  ],
  implement: [
    sp("SP 800-128", "Security-focused CM", H.sp128, "CM-2 / CM-3 / CM-6 as you build."),
    sp("SP 800-63", "Digital identity", H.sp63, "IA-2 / IA-5."),
    sp("SP 800-61", "Incident handling", H.sp61, "IR playbooks before go-live."),
    sp("SP 800-34", "Contingency", H.sp34, "CP-2 / CP-4 restore test."),
    sp("SP 800-88", "Media sanitization", H.sp88, "MP-6."),
    sp("SP 800-92", "Log management", H.sp92, "AU implementation."),
    sp("SP 800-52", "TLS", H.sp52, "SC-8."),
    sp("SP 800-57", "Key management", H.sp57, "SC-12 / SC-13."),
    sp("SP 800-41", "Firewalls", H.sp41, "SC-7."),
    sp("SP 800-70", "SCAP / checklists", H.sp70, "CM-6 hardening."),
    sp("SP 800-83", "Malware", H.sp83, "SI-3."),
    sp("SP 800-94", "IDS/IPS", H.sp94, "SI-4."),
    sp("SP 800-190", "Containers", H.sp190, "CM / SC / SI on Kubernetes."),
    sp("SP 800-204", "Microservices", H.sp204, "API / service mesh."),
    sp("SP 800-210", "Cloud access control", H.sp210, "AC in the cloud account."),
    sp("SP 800-207", "ZTNA implementation", H.sp207, "Never trust the path."),
    sp("SP 800-218", "SSDF in the pipeline", H.sp218, "SA-11 / SA-15."),
    sp("SP 800-46", "Telework", H.sp46, "AC-17 remote."),
    sp("SP 800-124", "Mobile", H.sp124, "MDM as AC / MP / SC."),
    sp("SP 800-82", "OT implementation", H.sp82, "ICS networks."),
    sp("SP 800-40", "Patching as a control", H.sp40, "SI-2."),
    sp("SP 800-84", "TT&E", H.sp84, "CP-4 / IR-3 exercises."),
  ],
  assess: [
    sp("SP 800-115", "Technical testing", H.sp115, "How you Test on a range."),
    sp("SP 800-55", "Performance measures", H.sp55, "Are the controls effective, not only present."),
    sp("SP 800-86", "Forensic techniques", H.sp86, "IR / AU Test evidence."),
    sp("SP 800-84", "Exercise as Test", H.sp84, "CP / IR tabletop is 53A Test."),
    sp("SP 800-18", "SSP as Examine object", H.sp18, "Specifications first."),
  ],
  authorize: [
    sp("SP 800-18", "SSP as authorized", H.sp18, "Bound copy of what the AO accepted."),
    sp("SP 800-55", "Measures the AO can watch", H.sp55, "Ongoing authorization needs numbers."),
  ],
  monitor: [
    sp("SP 800-40", "Enterprise patching", H.sp40, "SI-2 as Monitor, not a project."),
    sp("SP 800-61", "IR as respond", H.sp61, "137 respond step."),
    sp("SP 800-92", "Logs that feed ISCM", H.sp92, "No logs, no 137."),
    sp("SP 800-94", "Detection telemetry", H.sp94, "SI-4 continuous."),
    sp("SP 800-184", "Ransomware event", H.sp184, "IR / CP Monitor scenario."),
    sp("SP 800-55", "ISCM metrics", H.sp55, "137 analyze/review."),
    sp("SP 800-39", "Org Monitor", H.sp39, "Enterprise risk, not one system."),
    sp("AI RMF", "Model Monitor", H.airmf, "Drift, abuse, new tools — same CA-7 idea."),
  ],
};

export const STUDY_CYCLE_PLAN = [
  { step: "watch", label: "Watch", uses: "CSF 2.0 · SP 800-37 · FIPS 199" },
  { step: "families", label: "Families", uses: "SP 800-53 · FIPS 200" },
  { step: "examine", label: "Examine", uses: "SP 800-53A · family-specific SPs" },
  { step: "tailor", label: "Tailor", uses: "SP 800-53B · SP 800-18" },
  { step: "assess", label: "Assess", uses: "SP 800-53A · SP 800-30 · SP 800-171A" },
  { step: "rmf", label: "RMF pubs", uses: "37 · FIPS · 160 · 161 · 171 · 137 · full set below" },
  { step: "lab", label: "Range", uses: "SP 800-115 · SP 800-137 (CTEM as Monitor)" },
] as const;