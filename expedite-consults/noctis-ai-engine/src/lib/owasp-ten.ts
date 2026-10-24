export type OwaspRisk = {
  id: string;
  code: string;
  title: string;
  line: string;
  student: string;
  study: string;
  href: string;
  labId: string;
  appId: string;
};

/** OWASP Top 10:2025 — official list. We link. We do not copy the document. */
export const OWASP_TOP10: OwaspRisk[] = [
  {
    id: "a01",
    code: "A01:2025",
    title: "Broken Access Control",
    line: "Still #1. SSRF is rolled in. Object- and function-level checks fail; the user does something the design forbade.",
    student: "Two requests: user A token on user B object. Status codes. If SSRF: URL you control on the range.",
    study: "Ada GET /invoices/8841 (Tunde) → 200. Webhook fetched IMDS. API + path labs.",
    href: "https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/",
    labId: "api",
    appId: "api",
  },
  {
    id: "a02",
    code: "A02:2025",
    title: "Security Misconfiguration",
    line: "Defaults, open cloud, verbose errors, missing headers. The scanner's favorite — only a finding if it is reachable.",
    student: "One default or open setting vs the SSP. Screenshot. Fix: harden + IaC.",
    study: "clinic-uploads public ACL. CSPM / S3 lab.",
    href: "https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/",
    labId: "s3",
    appId: "dast",
  },
  {
    id: "a03",
    code: "A03:2025",
    title: "Software Supply Chain Failures",
    line: "New. The package, the model, the pipeline. Not just 'outdated components'.",
    student: "Lockfile row: name, version, supplier, hash. One typosquat or unsigned artifact.",
    study: "reqeusts==2.31.0. No SBOM. SCA lab.",
    href: "https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/",
    labId: "supply",
    appId: "sca",
  },
  {
    id: "a04",
    code: "A04:2025",
    title: "Cryptographic Failures",
    line: "Wrong algo, home-rolled crypto, keys in the repo, TLS 1.0 left on.",
    student: "Where secrets sit, TLS versions, FIPS 140 module or a gap.",
    study: "'We use AES' in the SSP. S3 unencrypted. Key in the app repo.",
    href: "https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/",
    labId: "s3",
    appId: "secrets",
  },
  {
    id: "a05",
    code: "A05:2025",
    title: "Injection",
    line: "SQL, command, LDAP, SSTI, XSS. Untrusted input reaches an interpreter.",
    student: "One WSTG injection test ID, request, response. Least-force proof (7*7, not a shell).",
    study: "Search box reflects q=. SSTI {{7*7}} → 49. Stop.",
    href: "https://owasp.org/Top10/2025/A05_2025-Injection/",
    labId: "api",
    appId: "dast",
  },
  {
    id: "a06",
    code: "A06:2025",
    title: "Insecure Design",
    line: "The workflow was never modeled. Threat modeling is the control, not a WAF.",
    student: "One skip: price, quantity, role. Two requests. STRIDE on that arrow.",
    study: "quantity=-1 credits the wallet. Threat-model desk.",
    href: "https://owasp.org/Top10/2025/A06_2025-Insecure_Design/",
    labId: "api",
    appId: "threat",
  },
  {
    id: "a07",
    code: "A07:2025",
    title: "Authentication Failures",
    line: "Credential stuffing, session issues, MFA gaps, passkeys not required.",
    student: "MFA enrollment %, authenticator type vs 800-63, one session finding.",
    study: "Humans 91% MFA. Service accounts none. NHI lab.",
    href: "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/",
    labId: "nhi",
    appId: "secrets",
  },
  {
    id: "a08",
    code: "A08:2025",
    title: "Software or Data Integrity Failures",
    line: "Unsigned updates, insecure CI, deserialization of untrusted bytes.",
    student: "Who can push to main. Signed artifacts? Where untrusted bytes become objects.",
    study: "SAST skip label. Java session cookie. SAST desk — do not fire gadget tools live.",
    href: "https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/",
    labId: "supply",
    appId: "sast",
  },
  {
    id: "a09",
    code: "A09:2025",
    title: "Security Logging and Alerting Failures",
    line: "It happened and nobody knew. Logs missing, alerts auto-closed, no page.",
    student: "One event in, one alert out, one ticket — or the gap.",
    study: "No AU-6 ticket in 90 days. SOC lab.",
    href: "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/",
    labId: "soc",
    appId: "dast",
  },
  {
    id: "a10",
    code: "A10:2025",
    title: "Mishandling of Exceptional Conditions",
    line: "New. Crashes, timeouts, fail-open, leaking stack traces. Errors are an attack surface.",
    student: "Force one error on the range. Did it fail closed? Did it leak internals?",
    study: "clinic API 500 dumps a stack with an IAM role name. Fail-open on auth timeout.",
    href: "https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/",
    labId: "api",
    appId: "dast",
  },
];

export const OWASP_TEN_HREF = "https://owasp.org/www-project-top-ten/";