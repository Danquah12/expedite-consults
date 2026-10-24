export type AxiomLink = { label: string; href: string };

export type AxiomTool = {
  id: string;
  title: string;
  family: string;
  blurb: string;
  href: string;
  note: string[];
  when: string;
  watch: { title: string; youtubeId: string };
  library: AxiomLink[];
  procedure: string[];
  trackId: string;
  labId: string;
  stamp: string;
  tags: string[];
};

export const AXIOM_SUITE = "AXIOM · CERBERUS · Strike";

export const AXIOM_LOOP = ["Watch", "Library", "Clinic note", "Procedure", "Launch tool", "Range lab", "Stamp"] as const;

const app = (slug: string) => `https://${slug}.vercel.app/`;

export const AXIOM_TOOLS: AxiomTool[] = [
  {
    id: "sast",
    title: "SAST Platform (AXIOM NG-SAST)",
    family: "AppSec",
    blurb: "Static analysis, tainted dataflow, AI remediation notes.",
    href: app("05-sast-platform"),
    note: [
      "SAST is the first gate: find the bug in the source, before it is a CVE in prod.",
      "Teach injection and unsafe dataflow — then write the report, not a screenshot of 12,000 findings.",
    ],
    when: "After Python foundations. Before any patient or payment code ships.",
    watch: { title: "MIT OCW — computation, then you read code", youtubeId: "k6U-i4gXkLM" },
    library: [
      { label: "OWASP Source Code Analysis Tools", href: "https://owasp.org/www-community/Source_Code_Analysis_Tools" },
      { label: "NIST SAMATE", href: "https://www.nist.gov/itl/ssd/software-quality-group/samate" },
      { label: "OWASP Code Review Guide", href: "https://owasp.org/www-project-code-review-guide/" },
      { label: "Semgrep docs", href: "https://semgrep.dev/docs/" },
      { label: "CodeQL docs", href: "https://codeql.github.com/docs/" },
      { label: "OWASP Top 10", href: "https://owasp.org/www-project-top-ten/" },
    ],
    procedure: [
      "Watch the film. Write one sentence: what is a dataflow?",
      "Open the OWASP SAST list. Name three classes of bug SAST should catch.",
      "Launch AXIOM NG-SAST on the range repo only — never a production org.",
      "Run the scan. Sort by reachability, not by volume.",
      "Pick one true positive. Write the fix. Ignore the noise.",
      "Bring the finding into the supply-chain lab and stamp it.",
    ],
    trackId: "devsecops",
    labId: "supply",
    stamp: "SBOM Steward",
    tags: ["#SAST", "#AppSec"],
  },
  {
    id: "sca",
    title: "SCA Platform (AXIOM SCA)",
    family: "Supply chain",
    blurb: "Dependencies, SBOM, malicious packages.",
    href: app("06-sca-platform"),
    note: [
      "Most of the attack is in a package you did not write. SBOM is the bill. Pin + hash is the control.",
    ],
    when: "Any lockfile. Before npm install in CI.",
    watch: { title: "CISA — how attackers actually get in", youtubeId: "6UzRjq12VQg" },
    library: [
      { label: "CISA SBOM", href: "https://www.cisa.gov/sbom" },
      { label: "OWASP Dependency-Check", href: "https://owasp.org/www-project-dependency-check/" },
    ],
    procedure: [
      "Read CISA SBOM in one pass. Write: name, version, supplier, hash.",
      "Launch AXIOM SCA against the lab lockfile.",
      "Mark typosquats and extra indexes. Do not 'upgrade to latest'.",
      "Export the SBOM. That file is evidence for the lab.",
      "Fix: pin + hash, private index, drop the bad package.",
    ],
    trackId: "supply",
    labId: "supply",
    stamp: "SBOM Steward",
    tags: ["#SCA", "#SBOM"],
  },
  {
    id: "secrets",
    title: "Secrets Scanner (AXIOM Secrets)",
    family: "Identity",
    blurb: "Keys, tokens, honeytokens.",
    href: app("07-secrets-platform"),
    note: [
      "A leaked key is standing admin. Rotation is the lesson. Honeytokens teach detection.",
    ],
    when: "Before first deploy. After any git rewrite.",
    watch: { title: "CISA — phishing-resistant MFA", youtubeId: "XIlF2qkav5c" },
    library: [
      { label: "CISA #StopRansomware", href: "https://www.cisa.gov/stopransomware" },
      { label: "OWASP Secrets in CI/CD", href: "https://owasp.org/www-project-top-10-ci-cd-security-risks/" },
    ],
    procedure: [
      "Watch the MFA film. Secrets without phishing-resistant MFA are theatre.",
      "Launch AXIOM Secrets on the range git history — including reflog.",
      "Triage live keys vs stubs. Revoke live keys in the lab tenant only.",
      "Plant one honeytoken. Document who would be paged.",
      "Open the NHI lab with the finding.",
    ],
    trackId: "nhi",
    labId: "nhi",
    stamp: "NHI Steward",
    tags: ["#Secrets", "#NHI"],
  },
  {
    id: "container",
    title: "Container Security (AXIOM Container)",
    family: "Cloud-native",
    blurb: "Image layers, base diffs, registry gate.",
    href: app("08-container-security-platform"),
    note: ["The image is the supply chain you ship. Root in the container is a gift."],
    when: "Any Dockerfile. Before the registry is public.",
    watch: { title: "CNCF — Kubernetes security defaults", youtubeId: "xdizlpIdrYw" },
    library: [
      { label: "CNCF", href: "https://www.cncf.io/" },
      { label: "NIST SP 800-190", href: "https://csrc.nist.gov/publications/detail/sp/800-190/final" },
    ],
    procedure: [
      "Watch the CNCF talk. Write: what is a Pod Security Standard?",
      "Launch AXIOM Container. Scan the lab image, not a random Hub image you do not own.",
      "List CVEs in the base layer vs the app layer.",
      "Recommend distroless / non-root. Do not 'apt upgrade' and call it done.",
      "Carry the image finding into the Kubernetes lab.",
    ],
    trackId: "cnapp",
    labId: "k8s",
    stamp: "Cloud-Native Security Practitioner",
    tags: ["#Docker", "#Containers"],
  },
  {
    id: "k8s",
    title: "K8s Security (AXIOM Kubernetes)",
    family: "Cloud-native",
    blurb: "RBAC, Kyverno, eBPF runtime.",
    href: app("09-k8s-security-platform"),
    note: ["cluster-admin is the incident. NetworkPolicy default-deny is the control."],
    when: "After containers. Before EKS/AKS/GKE prod.",
    watch: { title: "CNCF — Kubernetes security", youtubeId: "xdizlpIdrYw" },
    library: [
      { label: "Kubernetes security", href: "https://kubernetes.io/docs/concepts/security/" },
      { label: "NSA/CISA Kubernetes Hardening", href: "https://www.cisa.gov/news-events/news/nsa-cisa-release-kubernetes-hardening-guidance" },
    ],
    procedure: [
      "Read CISA Kubernetes hardening. Circle RBAC, secrets, network.",
      "Launch AXIOM Kubernetes against the range cluster only.",
      "Flag: exposed dashboard, cluster-admin, privileged pods, no NetworkPolicy.",
      "Apply the remediations in the k8s lab — do not click-fix production.",
      "Retest. Screenshot the before/after as lab evidence.",
    ],
    trackId: "cnapp",
    labId: "k8s",
    stamp: "Cloud-Native Security Practitioner",
    tags: ["#Kubernetes", "#eBPF"],
  },
  {
    id: "iac",
    title: "IaC Platform (AXIOM IaC)",
    family: "Cloud-native",
    blurb: "Terraform, CloudFormation, Helm — policy as code.",
    href: app("10-iac-security-platform"),
    note: ["The public bucket was a .tf file first. Policy-as-code is the drill."],
    when: "Before terraform apply. Always.",
    watch: { title: "AWS IAM — policies and least privilege", youtubeId: "qsF6Kauh2J4" },
    library: [
      { label: "AWS IAM", href: "https://aws.amazon.com/iam/" },
      { label: "CIS AWS Foundations", href: "https://www.cisecurity.org/benchmark/amazon_web_services" },
    ],
    procedure: [
      "Watch IAM. Write the difference between a role and a star policy.",
      "Launch AXIOM IaC on the lab Terraform.",
      "Find public S3, open SGs, secrets in state.",
      "Fix in code. Re-scan. Then open the S3 lab.",
    ],
    trackId: "devsecops",
    labId: "s3",
    stamp: "AWS Cloud Security",
    tags: ["#IaC", "#Terraform"],
  },
  {
    id: "dast",
    title: "AXIOM DAST Platform",
    family: "AppSec",
    blurb: "Running-app crawl, fuzz, OWASP Top 10.",
    href: app("11-dast-security-platform"),
    note: ["SAST reads source. DAST hits the live app. Authorized staging only."],
    when: "Every release candidate, on the range URL.",
    watch: { title: "CISA — how phishing and web attacks land", youtubeId: "6UzRjq12VQg" },
    library: [
      { label: "OWASP Testing Guide", href: "https://owasp.org/www-project-web-security-testing-guide/" },
      { label: "OWASP Top 10", href: "https://owasp.org/www-project-top-ten/" },
    ],
    procedure: [
      "Read OWASP WSTG chapter on injection. One page.",
      "Launch AXIOM DAST only against the lab host on the authorization sheet.",
      "Crawl, fuzz, export. Map each hit to Top 10.",
      "Do not scan a site you do not own.",
      "Take one finding into the API lab.",
    ],
    trackId: "offensive",
    labId: "api",
    stamp: "API Gatekeeper",
    tags: ["#DAST", "#OWASP"],
  },
  {
    id: "api",
    title: "API Security (AXIOM API)",
    family: "AppSec",
    blurb: "OWASP API Top 10, BOLA/BFLA, schema.",
    href: app("12-api-security-platform"),
    note: ["A JWT is authentication. Object-level checks are authorization. Mix them and you have BOLA."],
    when: "Any REST/GraphQL that holds a patient or a payment.",
    watch: { title: "AWS IAM — identity is not authorization", youtubeId: "qsF6Kauh2J4" },
    library: [
      { label: "OWASP API Security", href: "https://owasp.org/www-project-api-security/" },
      { label: "CISA Secure by Design", href: "https://www.cisa.gov/securebydesign" },
    ],
    procedure: [
      "Read OWASP API1:2023 Broken Object Level Authorization.",
      "Launch AXIOM API. Ingest the lab OpenAPI. Do not fuzz production.",
      "Run the BOLA matrix. Note tenant A reading tenant B.",
      "Fix object-level checks. Retest. Then the API lab quiz.",
    ],
    trackId: "api",
    labId: "api",
    stamp: "API Gatekeeper",
    tags: ["#API", "#BOLA"],
  },
  {
    id: "mobile",
    title: "Mobile Security (AXIOM Mobile)",
    family: "AppSec",
    blurb: "Android / iOS binary analysis.",
    href: app("13-mobile-security-platform"),
    note: ["The APK leaks tokens. The API is still the crown jewel."],
    when: "Before store submit. Lab binaries only.",
    watch: { title: "Harvard CS50 — how programs are built", youtubeId: "IDDmrzzB14M" },
    library: [
      { label: "OWASP MASVS", href: "https://mas.owasp.org/" },
      { label: "OWASP API Security", href: "https://owasp.org/www-project-api-security/" },
    ],
    procedure: [
      "Read MASVS storage and crypto controls.",
      "Launch AXIOM Mobile on the clinic sample APK — never a random store app.",
      "List leaked tokens, pinning gaps, deeplinks.",
      "The fix is usually on the API. Open the API lab next.",
    ],
    trackId: "offensive",
    labId: "api",
    stamp: "API Gatekeeper",
    tags: ["#Mobile", "#MASVS"],
  },
  {
    id: "red",
    title: "Exploitability Lab & Red Team",
    family: "Offensive",
    blurb: "EPSS, CVSS, proof-of-path — authorized only.",
    href: app("14-exploitability-platform"),
    note: ["CVSS is a score. EPSS is a bet. The path is the lesson. Written scope or you stop."],
    when: "After Web/API. Never without a rules of engagement sheet.",
    watch: { title: "NIST CSF — Identify before you 'hack'", youtubeId: "pPPiaGU12Og" },
    library: [
      { label: "CISA KEV", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
      { label: "FIRST EPSS", href: "https://www.first.org/epss/" },
    ],
    procedure: [
      "Write scope: assets, time, stop conditions. No scope, no scan.",
      "Launch AXIOM Exploitability. Filter KEV + reachable paths.",
      "Ignore the 12,000 CVSS 4s. Walk hop 1 → jewel.",
      "The report is the product. Then the attack-path lab.",
    ],
    trackId: "offensive",
    labId: "path",
    stamp: "Attack-Path Analyst",
    tags: ["#EPSS", "#RedTeam"],
  },
  {
    id: "threat",
    title: "Threat Modeling (AXIOM Threat)",
    family: "Design",
    blurb: "STRIDE and MITRE ATT&CK as a diagram.",
    href: app("15-threat-modeling-platform"),
    note: ["Draw the data flow before you buy another scanner. The control sentence goes in the SSP."],
    when: "Design review. New agent. New vendor.",
    watch: { title: "NIST CSF — Identify and Protect", youtubeId: "pPPiaGU12Og" },
    library: [
      { label: "OWASP Threat Modeling", href: "https://owasp.org/www-community/Threat_Modeling" },
      { label: "Microsoft STRIDE", href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats" },
      { label: "MITRE ATT&CK", href: "https://attack.mitre.org/" },
      { label: "NIST SP 800-154", href: "https://csrc.nist.gov/pubs/sp/800/154/iprd" },
      { label: "OWASP A06 Insecure Design", href: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/" },
    ],
    procedure: [
      "Name assets, actors, data stores. STRIDE each arrow.",
      "Launch AXIOM Threat. Build the lab diagram, not a slide.",
      "Map two ATT&CK techniques to compensating controls.",
      "Export the diagram into the attack-path lab.",
    ],
    trackId: "attackpath",
    labId: "path",
    stamp: "Attack-Path Analyst",
    tags: ["#STRIDE", "#ATT&CK"],
  },
  {
    id: "dfir",
    title: "CERBERUS-RE DFIR Suite",
    family: "Response",
    blurb: "Malware analysis, evidence that holds.",
    href: app("16-malware-analysis-platform"),
    note: ["Preserve first. Image second. Opinion last. If you cannot explain the hash, you cannot testify."],
    when: "After IR tabletop. Lab samples only.",
    watch: { title: "CISA — incident basics", youtubeId: "6UzRjq12VQg" },
    library: [
      { label: "NIST SP 800-61", href: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final" },
      { label: "CISA Incident Response", href: "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response" },
    ],
    procedure: [
      "Read 800-61: detect, analyze, contain, eradicate, recover, lessons.",
      "Launch CERBERUS on the clinic sample — never a live patient disk.",
      "Hash, timeline, one narrative. Chain of custody sheet filled.",
      "If there is no malware file, hunt tokens (living-off-the-cloud lab).",
    ],
    trackId: "dfir",
    labId: "lotc",
    stamp: "Cloud-Native Hunter",
    tags: ["#DFIR", "#Malware"],
  },
  {
    id: "aegis",
    title: "Aegis Recovery (Ransomware)",
    family: "Response",
    blurb: "Triage, key carving, immutable vault.",
    href: app("17-ransomware-recovery-platform"),
    note: ["Do not pay in the lab. Isolate, preserve, restore from the vault. RTO/RPO is the drill."],
    when: "After SOC investigator. Tabletop before a real incident.",
    watch: { title: "CISA — ransomware is a process, not a file", youtubeId: "6UzRjq12VQg" },
    library: [
      { label: "CISA #StopRansomware", href: "https://www.cisa.gov/stopransomware" },
      { label: "NIST 800-61", href: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final" },
    ],
    procedure: [
      "Write RTO and RPO for the lab clinic. Hours, not slogans.",
      "Launch Aegis Recovery on the range vault only.",
      "Isolate, preserve, restore a file. Document time.",
      "Open the SOC lab and tell the story without paying.",
    ],
    trackId: "defensive",
    labId: "soc",
    stamp: "SOC Investigator",
    tags: ["#Ransomware", "#IR"],
  },
  {
    id: "grc",
    title: "AXIOM Unified Integration & GRC Layer",
    family: "GRC",
    blurb: "SIEM/SOAR, one threat picture, owners on controls.",
    href: app("18-unified-integration-layer"),
    note: ["GRC is the same finding mapped to a control with an owner. A binder is not a program."],
    when: "ISSO path. After NIST CSF. Before ATO language.",
    watch: { title: "NIST Cybersecurity Framework", youtubeId: "pPPiaGU12Og" },
    library: [
      { label: "NIST CSF", href: "https://www.nist.gov/cyberframework" },
      { label: "NIST SP 800-53", href: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final" },
      { label: "NIST SP 800-53B", href: "https://csrc.nist.gov/pubs/sp/800/53/b/upd1/final" },
      { label: "NIST SP 800-53A", href: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final" },
    ],
    procedure: [
      "Watch CSF. Map one finding to Identify / Protect / Detect / Respond / Recover.",
      "Start from the 800-53B baseline (Low / Moderate / High). Do not implement the whole catalog.",
      "Launch the GRC layer. Attach the finding to a 800-53 control and an owner.",
      "Write the tailoring rationale: control ID, action (scope / overlay / parameter / compensate / supplement), operational fact, residual risk, AO.",
      "Reject 'N/A we are cloud-native.' That is an omission, not a rationale.",
      "Assess with 800-53A: Examine the SSP and config, Interview the owner, Test on the range. Write the SAR.",
      "Write the POA&M line. Due date, not 'ongoing'.",
      "CTEM lab next — weekly walk, not annual binder.",
    ],
    trackId: "grc",
    labId: "ctem",
    stamp: "CTEM Operator",
    tags: ["#GRC", "#NIST"],
  },
  {
    id: "cspm",
    title: "CSPM Cloud Security & IAM PrivEsc",
    family: "Cloud",
    blurb: "Multi-cloud posture, CIS / SOC2 / HIPAA / PCI.",
    href: app("19-cloud-security-platform"),
    note: ["Misconfig beats malware. A public bucket is hop 1. IAM paths are the graph."],
    when: "Cloud Security Engineer L2. Lab accounts only.",
    watch: { title: "AWS IAM", youtubeId: "qsF6Kauh2J4" },
    library: [
      { label: "CIS Benchmarks", href: "https://www.cisecurity.org/cis-benchmarks" },
      { label: "AWS Security Hub", href: "https://aws.amazon.com/security-hub/" },
    ],
    procedure: [
      "Connect only the range AWS/Azure/GCP accounts.",
      "Launch AXIOM CSPM. Sort by attack path, not by CIS count.",
      "Fix public storage and standing admin first.",
      "Re-scan. Evidence goes into the S3 lab.",
    ],
    trackId: "multicloud",
    labId: "s3",
    stamp: "AWS Cloud Security",
    tags: ["#CSPM", "#IAM"],
  },
  {
    id: "strike",
    title: "Expedite Strike & Fusion 2026",
    family: "Autonomous",
    blurb: "CTEM, hybrid scan, autonomous pentest — with a kill switch.",
    href: app("aegis-strike"),
    note: [
      "Agentic defense without identity, human-in-the-loop, and a kill switch is an attacker you hired.",
      "Run Strike only on the range. Write what the agent was allowed to do.",
    ],
    when: "Capstone. After CTEM + agent labs.",
    watch: { title: "NIST CSF — Govern before you automate", youtubeId: "pPPiaGU12Og" },
    library: [
      { label: "OWASP Top 10 for LLMs", href: "https://genai.owasp.org/" },
      { label: "NIST AI RMF", href: "https://www.nist.gov/itl/ai-risk-management-framework" },
    ],
    procedure: [
      "Write the agent's identity, tools, and kill switch before you launch.",
      "Launch Strike on the range tenant only.",
      "Watch one path. HITL on any change that could break prod.",
      "If the agent exceeds scope, kill it. That is the drill.",
      "Stamp Agent Defender in the agent lab.",
    ],
    trackId: "ctem",
    labId: "agent",
    stamp: "Agent Defender",
    tags: ["#CTEM", "#Strike"],
  },
];

export function axiomById(id: string) {
  return AXIOM_TOOLS.find((t) => t.id === id);
}

export function axiomByFamily() {
  const map = new Map<string, AxiomTool[]>();
  for (const tool of AXIOM_TOOLS) {
    const list = map.get(tool.family) ?? [];
    list.push(tool);
    map.set(tool.family, list);
  }
  return [...map.entries()].map(([family, tools]) => ({ family, tools }));
}

export function toolsForLab(labId: string) {
  return AXIOM_TOOLS.filter((t) => t.labId === labId);
}

export const CORE_LIBRARIES = [
  { label: "NIST CSF", href: "https://www.nist.gov/cyberframework" },
  { label: "CISA", href: "https://www.cisa.gov/" },
  { label: "OWASP", href: "https://owasp.org/" },
];

export function librariesForLab(labId: string) {
  const seen = new Set<string>();
  const out: { label: string; href: string }[] = [];
  for (const link of [...toolsForLab(labId).flatMap((t) => t.library), ...CORE_LIBRARIES]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

export function youtubeWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}