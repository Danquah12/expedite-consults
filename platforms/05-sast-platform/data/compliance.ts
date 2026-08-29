export const COMPLIANCE_FRAMEWORKS = [
  {
    name: "OWASP Top 10",
    version: "2021",
    color: "#e55c00",
    categories: [
      { ref: "A01:2021", name: "Broken Access Control",                covered: true,  cwes: ["CWE-639", "CWE-352", "CWE-601", "CWE-22", "CWE-284"] },
      { ref: "A02:2021", name: "Cryptographic Failures",               covered: true,  cwes: ["CWE-327", "CWE-798", "CWE-693"] },
      { ref: "A03:2021", name: "Injection",                            covered: true,  cwes: ["CWE-89", "CWE-78", "CWE-611"] },
      { ref: "A04:2021", name: "Insecure Design",                      covered: false, cwes: [] },
      { ref: "A05:2021", name: "Security Misconfiguration",            covered: true,  cwes: ["CWE-611", "CWE-209", "CWE-489"] },
      { ref: "A06:2021", name: "Vulnerable and Outdated Components",   covered: true,  cwes: ["CWE-1395"] },
      { ref: "A07:2021", name: "Identification & Authentication",      covered: true,  cwes: ["CWE-287", "CWE-338", "CWE-307"] },
      { ref: "A08:2021", name: "Software & Data Integrity",            covered: true,  cwes: ["CWE-502"] },
      { ref: "A09:2021", name: "Security Logging & Monitoring",        covered: true,  cwes: ["CWE-532", "CWE-778"] },
      { ref: "A10:2021", name: "Server-Side Request Forgery",          covered: true,  cwes: ["CWE-918"] },
    ],
  },
  {
    name: "PCI DSS",
    version: "4.0",
    color: "#1a6e4a",
    categories: [
      { ref: "Req 6.2.4", name: "Prevent Injection Attacks",           covered: true,  cwes: ["CWE-89", "CWE-78"] },
      { ref: "Req 8.3.2", name: "Strong Authentication",               covered: true,  cwes: ["CWE-287", "CWE-798"] },
      { ref: "Req 8.6.1", name: "Authentication Security",             covered: true,  cwes: ["CWE-287", "CWE-338"] },
      { ref: "Req 4.2",   name: "Transmission Security (TLS)",         covered: true,  cwes: ["CWE-693", "CWE-327"] },
    ],
  },
  {
    name: "NIST 800-53",
    version: "Rev 5",
    color: "#1c3d7a",
    categories: [
      { ref: "SI-10",   name: "Information Input Validation",          covered: true,  cwes: ["CWE-89", "CWE-22", "CWE-611"] },
      { ref: "SI-16",   name: "Memory Protection",                     covered: true,  cwes: ["CWE-502"] },
      { ref: "AC-3",    name: "Access Enforcement",                    covered: true,  cwes: ["CWE-639", "CWE-284"] },
      { ref: "IA-5",    name: "Authenticator Management",              covered: true,  cwes: ["CWE-287", "CWE-798"] },
      { ref: "IA-5(1)", name: "Password-Based Authentication",         covered: true,  cwes: ["CWE-327"] },
      { ref: "SC-7",    name: "Boundary Protection",                   covered: true,  cwes: ["CWE-918"] },
      { ref: "SC-8",    name: "Transmission Confidentiality",          covered: true,  cwes: ["CWE-693"] },
    ],
  },
  {
    name: "ISO 27001",
    version: "2022",
    color: "#5b2d8e",
    categories: [
      { ref: "A.8.24", name: "Use of Cryptography",                   covered: true,  cwes: ["CWE-327", "CWE-798"] },
      { ref: "A.8.28", name: "Secure Coding",                         covered: true,  cwes: ["CWE-89", "CWE-502", "CWE-639"] },
      { ref: "A.8.9",  name: "Configuration Management",              covered: true,  cwes: ["CWE-693", "CWE-489"] },
    ],
  },
  {
    name: "CIS Controls",
    version: "v8",
    color: "#7c3d00",
    categories: [
      { ref: "CIS-12", name: "Network Infrastructure Management",     covered: true,  cwes: ["CWE-918", "CWE-693"] },
      { ref: "CIS-14", name: "Security Awareness & Training",         covered: false, cwes: [] },
      { ref: "CIS-16", name: "Application Software Security",         covered: true,  cwes: ["CWE-89", "CWE-502", "CWE-287"] },
    ],
  },
];
