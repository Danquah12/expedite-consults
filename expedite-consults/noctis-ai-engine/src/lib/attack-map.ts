export const MAP_LAW = [
  "Map what you observed, not what you wish you had run.",
  "One finding → one primary technique. Secondary IDs are optional. A laundry list is not a map.",
  "If you cannot name the log that would fire, the mapping is unfinished.",
] as const;

export const MAP_STEPS = [
  { n: "1", title: "Evidence", line: "Request, log, screenshot, atomic GUID. Time. Host. Principal." },
  { n: "2", title: "Goal", line: "Which tactic column? Why was the adversary here?" },
  { n: "3", title: "How", line: "Technique / sub-technique (Txxxx.xxx). Read the ATT&CK page. Do not guess from the title." },
  { n: "4", title: "Test", line: "Atomic test number or Caldera ability. Same ID. Range only." },
  { n: "5", title: "See", line: "Log / alert / miss. If miss, that is a finding for blue." },
  { n: "6", title: "Fix", line: "Mitigation Mxxxx or control in the SSP. Owner. Date." },
] as const;

export type AttackMapRow = {
  id: string;
  finding: string;
  tactic: string;
  tech: string;
  title: string;
  atomic: string;
  detect: string;
  owasp: string;
  stride: string;
  href: string;
  labId: string;
};

export const CLINIC_MAP: AttackMapRow[] = [
  {
    id: "ssti",
    finding: "Search box evaluates {{7*7}}",
    tactic: "TA0001 Initial Access",
    tech: "T1190",
    title: "Exploit Public-Facing Application",
    atomic: "Prefer WSTG proof over a destructive atomic. No reverse shell.",
    detect: "WAF / app log of template tokens. Miss = no app logging.",
    owasp: "A05 Injection",
    stride: "T / E",
    href: "https://attack.mitre.org/techniques/T1190/",
    labId: "api",
  },
  {
    id: "bola",
    finding: "Ada token reads Tunde invoice",
    tactic: "TA0004 Privilege Escalation / TA0001",
    tech: "T1078",
    title: "Valid Accounts",
    atomic: "Not an atomic — two HTTP requests. Map anyway.",
    detect: "API gateway 200 on cross-tenant id. Miss = no object-level log.",
    owasp: "A01 Broken Access Control",
    stride: "E / I",
    href: "https://attack.mitre.org/techniques/T1078/",
    labId: "api",
  },
  {
    id: "imds",
    finding: "Webhook fetched instance metadata",
    tactic: "TA0006 Credential Access",
    tech: "T1552.005",
    title: "Cloud Instance Metadata API",
    atomic: "Caldera/cloud abilities only on range account. IMDSv2 is the control.",
    detect: "VPC flow / app outbound to IMDS. CloudTrail on the role.",
    owasp: "A01 (SSRF rolled in)",
    stride: "I / E",
    href: "https://attack.mitre.org/techniques/T1552/005/",
    labId: "path",
  },
  {
    id: "ps",
    finding: "Encoded PowerShell on jump box",
    tactic: "TA0002 Execution",
    tech: "T1059.001",
    title: "PowerShell",
    atomic: "Invoke-AtomicTest T1059.001 — one test number. Cleanup. Did 4104 fire?",
    detect: "Event 4104 / EDR script block. Miss = logging not enabled.",
    owasp: "—",
    stride: "T / E",
    href: "https://attack.mitre.org/techniques/T1059/001/",
    labId: "soc",
  },
  {
    id: "lolbin",
    finding: "Signed binary spawned unusual child",
    tactic: "TA0005 Defense Evasion",
    tech: "T1218",
    title: "System Binary Proxy Execution",
    atomic: "Pick the sub-technique (T1218.xxx) from the YAML. Do not run All.",
    detect: "Parent/child in EDR. Miss = no process lineage.",
    owasp: "—",
    stride: "E",
    href: "https://attack.mitre.org/techniques/T1218/",
    labId: "soc",
  },
  {
    id: "s3",
    finding: "Public bucket, intern s3:*",
    tactic: "TA0010 Exfiltration",
    tech: "T1530",
    title: "Data from Cloud Storage",
    atomic: "No flood. One GetObject in the lab account.",
    detect: "CloudTrail GetObject from intern. Miss = no trail on the bucket.",
    owasp: "A02 Misconfiguration",
    stride: "I",
    href: "https://attack.mitre.org/techniques/T1530/",
    labId: "s3",
  },
  {
    id: "escape",
    finding: "Privileged pod + docker.sock",
    tactic: "TA0004 Privilege Escalation",
    tech: "T1611",
    title: "Escape to Host",
    atomic: "K8s lab only. Not a cluster you do not own.",
    detect: "API audit privileged + hostPath. Miss = no audit log.",
    owasp: "A01",
    stride: "E",
    href: "https://attack.mitre.org/techniques/T1611/",
    labId: "k8s",
  },
];

export const MAP_SHEET = {
  student: "One row: evidence · tactic · T-ID · atomic/ability · detect hit/miss · M-ID · owner.",
  study: "clinic-corp sheet is CLINIC_MAP. Students add their own row from the range, not a copy of all 200 techniques.",
};