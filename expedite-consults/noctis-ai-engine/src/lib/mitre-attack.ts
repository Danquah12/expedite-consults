export const ATTACK_HREF = "https://attack.mitre.org/";
export const ATTACK_NAV = "https://mitre-attack.github.io/attack-navigator/";

export const ATTACK_LAW = [
  "ATT&CK is a map of what adversaries have done. It is not a menu.",
  "Students map a finding to a technique ID and a mitigation. They do not run the technique off the range.",
  "A report with T1552.005 beats a report that says 'hacking'.",
] as const;

export const ATTACK_LAYERS = [
  { id: "tactic", title: "Tactic", line: "The adversary's goal (why). Fourteen columns on the Enterprise matrix." },
  { id: "technique", title: "Technique", line: "How they reach that goal (Txxxx). Sub-techniques are Txxxx.xxx." },
  { id: "procedure", title: "Procedure", line: "A real group's instance. We cite it. We do not copy malware." },
  { id: "mitigation", title: "Mitigation", line: "Mxxxx. The control you write into the SSP / detection." },
] as const;

export const ATTACK_TACTICS = [
  { id: "TA0043", title: "Reconnaissance", line: "Learn the target. OSINT only inside the ROE." },
  { id: "TA0042", title: "Resource Development", line: "Accounts, infra, payloads they will use later." },
  { id: "TA0001", title: "Initial Access", line: "The first foothold. Phish, public app, stolen token." },
  { id: "TA0002", title: "Execution", line: "Code runs. On the range: least-force proof, no implant." },
  { id: "TA0003", title: "Persistence", line: "Survive reboot. Scheduled task, extra IAM user." },
  { id: "TA0004", title: "Privilege Escalation", line: "More rights than issued. Role assume, privileged pod." },
  { id: "TA0005", title: "Defense Evasion", line: "Hide from logs and EDR. Living off the land lives here." },
  { id: "TA0006", title: "Credential Access", line: "Steal or guess secrets. Keys in git, IMDS." },
  { id: "TA0007", title: "Discovery", line: "What else is here? Enum in the ROE CIDR only." },
  { id: "TA0008", title: "Lateral Movement", line: "Hop. Identity path beats a new exploit." },
  { id: "TA0009", title: "Collection", line: "Stage the jewel. Object in the public bucket." },
  { id: "TA0011", title: "Command and Control", line: "Talk home. We do not stand up C2 off the range." },
  { id: "TA0010", title: "Exfiltration", line: "Data leaves. S3 get-object to an intern laptop." },
  { id: "TA0040", title: "Impact", line: "Ransomware, wipe. Out of scope unless the ROE says tabletop only." },
] as const;

export const ATTACK_CLINIC = [
  {
    tech: "T1190",
    title: "Exploit Public-Facing Application",
    student: "Which public app, which WSTG/Top 10, least-force proof.",
    study: "clinic search SSTI. A05. Stop at 7*7.",
    href: "https://attack.mitre.org/techniques/T1190/",
    labId: "api",
  },
  {
    tech: "T1078",
    title: "Valid Accounts",
    student: "Which principal, how obtained, what it can do.",
    study: "Intern key with s3:*. No malware needed.",
    href: "https://attack.mitre.org/techniques/T1078/",
    labId: "nhi",
  },
  {
    tech: "T1552.005",
    title: "Cloud Instance Metadata API",
    student: "Did the app fetch IMDS? IMDSv1 or v2?",
    study: "Webhook SSRF. A01. Path lab.",
    href: "https://attack.mitre.org/techniques/T1552/005/",
    labId: "path",
  },
  {
    tech: "T1218",
    title: "System Binary Proxy Execution",
    student: "Which LOLBin, parent process, why allowed.",
    study: "Encoded PowerShell on the jump box. SOC logs.",
    href: "https://attack.mitre.org/techniques/T1218/",
    labId: "soc",
  },
  {
    tech: "T1611",
    title: "Escape to Host",
    student: "Privileged? hostPath? Instance role on the node?",
    study: "Worker + docker.sock. K8s lab.",
    href: "https://attack.mitre.org/techniques/T1611/",
    labId: "k8s",
  },
] as const;