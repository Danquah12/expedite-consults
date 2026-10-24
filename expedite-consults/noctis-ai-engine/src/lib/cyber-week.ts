import { NETWORK, type NetworkHouse } from "@/lib/source-network";

export type Level = "Beginner" | "Intermediate" | "Advanced" | "Professional";

export type Brief = { kicker: string; title: string; body: string; href: string; house?: string };

export type QuizItem = { q: string; options: string[]; ok: number };

export function isoWeek(at = new Date()) {
  const d = new Date(Date.UTC(at.getFullYear(), at.getMonth(), at.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function rotate<T>(items: T[], week: number, salt: number, count = 1): T[] {
  if (!items.length) return [];
  const start = Math.abs(week * 11 + salt) % items.length;
  return Array.from({ length: Math.min(count, items.length) }, (_, i) => items[(start + i) % items.length]);
}

const THREATS: Brief[] = [
  { kicker: "Threat of the week", title: "CISA KEV — patch what is already exploited", body: "Federal BOD says KEV on public-facing assets first. Rank with EPSS, then CVSS — not CVSS alone.", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", house: "kev" },
  { kicker: "Threat of the week", title: "Identity abuse beats perimeter exploits", body: "Stolen tokens, MFA fatigue, and over-privileged roles. Phishing-resistant MFA is the control.", href: "https://www.cisa.gov/MFA", house: "mfa" },
  { kicker: "Threat of the week", title: "Ransomware still starts with a login", body: "StopRansomware: isolate, preserve logs, do not pay as policy. Walk the eight IR moves.", href: "https://www.cisa.gov/stopransomware", house: "ir-tabletop" },
];

const CLOUD: Brief[] = [
  { kicker: "Cloud", title: "AWS IAM least privilege is still the leak", body: "Policies as JSON string-matching. Access Analyzer before a human ever gets AdministratorAccess.", href: "https://aws.amazon.com/iam/", house: "aws-iam" },
  { kicker: "Cloud", title: "GuardDuty on AI workloads", body: "CloudTrail, VPC flow, EKS audit, S3 — same detector, new blast radius around genAI.", href: "https://aws.amazon.com/guardduty/", house: "aws-guard-ai" },
  { kicker: "Cloud", title: "Azure Zero Trust, not a trusted LAN", body: "Entra + device + Conditional Access. Verify explicitly.", href: "https://learn.microsoft.com/en-us/azure/security/fundamentals/zero-trust", house: "az-zerotrust" },
  { kicker: "Cloud", title: "GCP Security Command Center", body: "Posture and threat in one risk engine. Multi-cloud is not optional.", href: "https://cloud.google.com/security-command-center", house: "gcp-scc" },
];

const AI: Brief[] = [
  { kicker: "AI security", title: "OWASP Top 10 for LLMs — prompt injection first", body: "Direct and indirect injection, RAG leakage, excessive agency. CC BY-SA.", href: "https://genai.owasp.org/", house: "owasp-llm" },
  { kicker: "AI security", title: "NIST AI RMF: Govern, Map, Measure, Manage", body: "Voluntary, measurable. The 2026 question is agentic oversight.", href: "https://www.nist.gov/itl/ai-risk-management-framework", house: "nist-ai-rmf" },
  { kicker: "AI security", title: "Agentic AI is an identity problem", body: "Who is the agent, what may it call, how do you revoke it. CSA + IAM.", href: "https://cloudsecurityalliance.org/", house: "agentic" },
];

const DEFEND: Brief[] = [
  { kicker: "Defender", title: "Map detections to ATT&CK, not to product names", body: "A rule without a technique is a noisy alert. MITRE is the common language.", href: "https://attack.mitre.org/", house: "mitre-attack" },
  { kicker: "Defender", title: "Investigate this attack", body: "Given logs: timeline, technique, finding. That is the SOC lab.", href: "https://attack.mitre.org/", house: "investigate" },
];

const RED: Brief[] = [
  { kicker: "Red team", title: "OWASP WSTG — authorized scope only", body: "Recon → test → report. Nmap and Burp stay at their sites. Practice on systems you own.", href: "https://owasp.org/www-project-web-security-testing-guide/", house: "web-pentest" },
  { kicker: "Red team", title: "Kubernetes defaults are not production", body: "RBAC, network policy, secrets, pod security — CNCF talk.", href: "https://www.cncf.io/", house: "k8s-sec" },
];

const GRC: Brief[] = [
  { kicker: "GRC", title: "RMF is how government actually ships systems", body: "Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor. Then the ATO package.", href: "https://csrc.nist.gov/pubs/sp/800/37/r2/final", house: "80037" },
  { kicker: "GRC", title: "CMMC sits on 800-171", body: "CUI in nonfederal systems. Assessors, not hackers, close the deal.", href: "https://csrc.nist.gov/pubs/sp/800/171/r3/final", house: "800171" },
  { kicker: "GRC", title: "SBOM is now an AI ingredients list too", body: "CISA + G7 minimum elements. You cannot patch what you cannot name.", href: "https://www.cisa.gov/sbom", house: "sbom" },
];

const LABS: Brief[] = [
  { kicker: "Lab of the week", title: "Build an ATO package", body: "Hypothetical federal system: SSP, SAP, SAR, POA&M, then the AO decision.", href: "https://csrc.nist.gov/projects/risk-management", house: "ato" },
  { kicker: "Lab of the week", title: "Ransomware just hit — eight moves", body: "Detect, triage, contain, investigate, eradicate, recover, lessons, report.", href: "https://www.cisa.gov/stopransomware", house: "ir-tabletop" },
  { kicker: "Lab of the week", title: "Investigate this attack", body: "Logs in. ATT&CK technique and a written finding out.", href: "https://attack.mitre.org/", house: "investigate" },
];

const QUIZ: QuizItem[][] = [
  [
    { q: "What does CISA KEV list?", options: ["Every CVE ever", "Vulnerabilities with evidence of active exploitation", "Only CVSS 10s"], ok: 1 },
    { q: "EPSS estimates what?", options: ["Exploit likelihood in the wild", "Asset dollar value", "Password length"], ok: 0 },
    { q: "IAM is primarily about?", options: ["Who may call which action on which resource", "Instance size", "CDN cache"], ok: 0 },
    { q: "Phishing-resistant MFA is strongest as?", options: ["SMS codes", "FIDO2 / security keys / passkeys", "Hint questions"], ok: 1 },
    { q: "ATT&CK catalogs?", options: ["Antivirus signatures", "Adversary tactics and techniques", "Billing SKUs"], ok: 1 },
    { q: "RMF Authorize means?", options: ["A senior official accepts residual risk (ATO)", "The scanner is green", "The firewall is new"], ok: 0 },
    { q: "OWASP LLM01 is?", options: ["Prompt injection", "Broken CSS", "Slow Wi-Fi"], ok: 0 },
    { q: "NIST PQC is about?", options: ["Faster Wi-Fi", "Crypto that survives quantum computers", "GPU cooling"], ok: 1 },
    { q: "An SBOM is?", options: ["An ingredients list for software", "A firewall rule", "A badge"], ok: 0 },
    { q: "First IR move after ransomware detection?", options: ["Pay the actor", "Contain and preserve evidence", "Wipe every laptop immediately with no logs"], ok: 1 },
  ],
];

const LEVELS: Record<Level, string[]> = {
  Beginner: ["iam-fund", "mfa", "nist", "owasp-top10", "cve", "crypto-fund"],
  Intermediate: ["aws-iam", "az-zerotrust", "kev", "mitre-attack", "cvss", "owasp-api", "k8s-sec"],
  Advanced: ["aws-guard-ai", "owasp-llm", "80037", "pqc", "falco", "stix", "ssdf"],
  Professional: ["ato", "cmmc", "fedramp", "ir-tabletop", "800171", "ics", "emass"],
};

export function cyberHouses() {
  return NETWORK.filter((h) => h.desk === "cyber");
}

export function filmsOfWeek(week: number) {
  const films = cyberHouses().filter((h) => h.youtubeId);
  return rotate(films, week, 3, 10);
}

export function thisCyberWeek(week = isoWeek()) {
  return {
    week,
    threat: rotate(THREATS, week, 1)[0],
    cloud: rotate(CLOUD, week, 2)[0],
    ai: rotate(AI, week, 3)[0],
    defend: rotate(DEFEND, week, 4)[0],
    red: rotate(RED, week, 5)[0],
    grc: rotate(GRC, week, 6)[0],
    lab: rotate(LABS, week, 7)[0],
    films: filmsOfWeek(week),
    quiz: QUIZ[0],
  };
}

export function houseById(id: string): NetworkHouse | undefined {
  return NETWORK.find((h) => h.id === id);
}

export function levelMap() {
  return (Object.keys(LEVELS) as Level[]).map((level) => ({
    level,
    houses: LEVELS[level].map(houseById).filter((h): h is NetworkHouse => Boolean(h)),
  }));
}
