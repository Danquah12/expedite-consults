export const THREAT_LAW = [
  "Draw the flow before you buy another scanner. A missing arrow is a missing threat.",
  "STRIDE the arrow, not the box. The box is just a name.",
  "Every accepted risk needs an owner and a date. 'We'll fix it later' is not a control.",
] as const;

export const STRIDE = [
  {
    id: "S",
    title: "Spoofing",
    line: "Pretending to be another identity. Authn is the control.",
    student: "Who can claim to be this principal? MFA? Workload identity?",
    study: "Intern role assumed from a leaked key. No MFA on the CI principal.",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#spoofing",
  },
  {
    id: "T",
    title: "Tampering",
    line: "Changing data in transit or at rest. Integrity is the control.",
    student: "What signs the payload? Who can write the store?",
    study: "Unsigned SBOM in the pipeline. Invoice amount editable in the client.",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#tampering",
  },
  {
    id: "R",
    title: "Repudiation",
    line: "Denying an action. Logs that hold up are the control.",
    student: "Can this actor deny the write? Is the log signed / append-only?",
    study: "No AU-6 ticket. Admins can wipe application logs.",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#repudiation",
  },
  {
    id: "I",
    title: "Information disclosure",
    line: "Reading what you should not. Encryption + authz is the control.",
    student: "Who can read this store? TLS? Object-level check?",
    study: "Public S3. Ada reads Tunde's invoice (BOLA).",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#information-disclosure",
  },
  {
    id: "D",
    title: "Denial of service",
    line: "Making it unavailable. Rate limits, quotas, fail-closed. Out of scope if ROE says no DoS tests.",
    student: "What happens if this hop dies? Fail open or closed?",
    study: "Auth timeout fail-open (A10). ROE: no flood tests.",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#denial-of-service",
  },
  {
    id: "E",
    title: "Elevation of privilege",
    line: "Doing more than the role allows. Least privilege is the control.",
    student: "What is the next role from here? IAM path? Privileged pod?",
    study: "s3:* intern. Privileged worker + docker.sock.",
    href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats#elevation-of-privilege",
  },
] as const;

export const THREAT_STEPS = [
  { n: "1", title: "What are we building?", line: "Actors, processes, stores, trust boundaries. One diagram. No decoration." },
  { n: "2", title: "What can go wrong?", line: "STRIDE each arrow. Map two to ATT&CK. OWASP A06 lives here." },
  { n: "3", title: "What will we do?", line: "Mitigate, transfer, accept (named owner), or avoid. Control sentence for the SSP." },
  { n: "4", title: "Did we do a good job?", line: "Revisit when the design changes. New vendor, new agent, new trust boundary." },
] as const;

export const THREAT_LIBS = [
  { label: "OWASP Threat Modeling", href: "https://owasp.org/www-community/Threat_Modeling" },
  { label: "OWASP Threat Model Project", href: "https://owasp.org/www-project-threat-model/" },
  { label: "Microsoft STRIDE", href: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats" },
  { label: "NIST SP 800-154 (draft)", href: "https://csrc.nist.gov/pubs/sp/800/154/iprd" },
  { label: "MITRE ATT&CK", href: "https://attack.mitre.org/" },
  { label: "OWASP Top 10 A06 Insecure Design", href: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/" },
] as const;