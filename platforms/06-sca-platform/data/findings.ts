import type { SCACVEFinding, DependencyStats, LicenseSummary, EcosystemBreakdown } from "@/types/sca";

export const SCA_FINDINGS: SCACVEFinding[] = [
  // ── F-001: Log4Shell (Log4j) ──────────────────────────────────────────────
  {
    id: "SCA-001", packageName: "log4j-core", packageVersion: "2.14.1",
    ecosystem: "Maven", severity: "Critical", status: "Patched Available",
    cves: [{
      id: "CVE-2021-44228", cvss: 10.0, epss: 0.975,
      description: "Log4Shell — remote code execution via JNDI injection in log messages. Attacker controls a LDAP server and injects a lookup string that triggers class loading from a remote URL.",
      publishedAt: "2021-12-10", severity: "Critical", patchedIn: "2.15.0",
      exploitInWild: true,
    }],
    license: { name: "Apache-2.0", spdxId: "Apache-2.0", risk: "Permissive", copyleft: false, commercial: true, notes: "Permissive open-source license. Allowed in commercial products." },
    isDirect: false, depth: 3,
    transitivePaths: [{ chain: ["customer-api", "spring-boot-starter", "spring-core", "log4j-core"], depth: 3 }],
    dependentCount: 47, internetFacing: true, activelyExploited: true, reachable: true,
    fixAvailable: true, fixVersion: "2.17.1", breakingChange: false,
    businessImpact: "Critical remote code execution vulnerability actively exploited in the wild. Attackers can execute arbitrary code on your servers, leading to complete system compromise, data exfiltration, and ransomware deployment.",
    executiveSummary: "Log4Shell (CVE-2021-44228) is one of the most critical vulnerabilities ever discovered, scoring a perfect 10.0 on the CVSS scale. The log4j-core library version 2.14.1 in your dependency tree is actively being exploited. Immediate patching to 2.17.1 is required.",
    remediation: "Upgrade log4j-core from 2.14.1 to 2.17.1 in pom.xml. Interim mitigation: set JVM flag -Dlog4j2.formatMsgNoLookups=true and LOG4J_FORMAT_MSG_NO_LOOKUPS=true environment variable.",
    validationSteps: ["Run mvn dependency:tree | grep log4j to confirm version change", "Deploy to staging and run nuclei scanner with log4j templates", "Check WAF rules block ${jndi: patterns", "Run ZAP scan against all endpoints that log user input"],
    slaDeadline: "2026-08-21", owner: "Platform Team",
    compliance: [
      { framework: "PCI DSS", reference: "6.3.3", description: "All system components are protected from known vulnerabilities by installing applicable security patches." },
      { framework: "NIST 800-53", reference: "SI-2", description: "Flaw Remediation — identify, report and correct information system flaws." },
    ],
    repository: "https://github.com/example/customer-api", firstSeen: "2021-12-10", lastUpdated: "2026-08-20",
  },

  // ── F-002: Spring4Shell ───────────────────────────────────────────────────
  {
    id: "SCA-002", packageName: "spring-webmvc", packageVersion: "5.3.17",
    ecosystem: "Maven", severity: "Critical", status: "Patched Available",
    cves: [{
      id: "CVE-2022-22965", cvss: 9.8, epss: 0.971,
      description: "Spring4Shell — Remote code execution via data binding on JDK 9+ with Tomcat. Attacker can write a JSP webshell to the server root directory.",
      publishedAt: "2022-03-31", severity: "Critical", patchedIn: "5.3.18",
      exploitInWild: true,
    }],
    license: { name: "Apache-2.0", spdxId: "Apache-2.0", risk: "Permissive", copyleft: false, commercial: true, notes: "" },
    isDirect: true, depth: 1,
    transitivePaths: [{ chain: ["customer-api", "spring-webmvc"], depth: 1 }],
    dependentCount: 1, internetFacing: true, activelyExploited: true, reachable: true,
    fixAvailable: true, fixVersion: "5.3.18", breakingChange: false,
    businessImpact: "Direct dependency with RCE exposure. Attackers can write a webshell and achieve persistent server access, leading to full data exfiltration and lateral movement.",
    executiveSummary: "Spring4Shell affects the core MVC framework of your Java web application. This is a direct dependency at depth 1, meaning it is directly under your control to upgrade. Exploitation requires JDK 9+ and Tomcat — both of which your environment uses.",
    remediation: "Upgrade spring-webmvc to 5.3.18 or 6.0.7 in pom.xml. If upgrade is delayed, add DataBinder.setDisallowedFields configuration to block class.*, Class.*, module.*, Module.* bindings.",
    validationSteps: ["Verify spring-webmvc 5.3.18+ in mvn dependency:list", "Run Spring4Shell PoC test against /login endpoint", "Check logs for class.module.classLoader pattern"],
    slaDeadline: "2026-08-22", owner: "Backend Team",
    compliance: [
      { framework: "OWASP Top 10", reference: "A06:2021", description: "Vulnerable and Outdated Components" },
      { framework: "PCI DSS", reference: "6.3.3", description: "Install applicable security patches/updates." },
    ],
    repository: "https://github.com/example/customer-api", firstSeen: "2022-04-01", lastUpdated: "2026-08-19",
  },

  // ── F-003: Lodash Prototype Pollution ─────────────────────────────────────
  {
    id: "SCA-003", packageName: "lodash", packageVersion: "4.17.15",
    ecosystem: "npm", severity: "High", status: "Patched Available",
    cves: [
      { id: "CVE-2020-8203", cvss: 7.4, epss: 0.042, description: "Prototype pollution via zipObjectDeep function. Attacker-controlled input can modify Object.prototype affecting all JavaScript objects in the runtime.", publishedAt: "2020-07-15", severity: "High", patchedIn: "4.17.21", exploitInWild: false },
      { id: "CVE-2021-23337", cvss: 7.2, epss: 0.019, description: "Command injection via template function when processing untrusted template strings.", publishedAt: "2021-02-15", severity: "High", patchedIn: "4.17.21", exploitInWild: false },
    ],
    license: { name: "MIT", spdxId: "MIT", risk: "Permissive", copyleft: false, commercial: true, notes: "Permissive MIT license. No restrictions on commercial use." },
    isDirect: false, depth: 2,
    transitivePaths: [
      { chain: ["frontend-app", "webpack", "lodash"], depth: 2 },
      { chain: ["frontend-app", "babel-core", "lodash"], depth: 2 },
    ],
    dependentCount: 12, internetFacing: false, activelyExploited: false, reachable: true,
    fixAvailable: true, fixVersion: "4.17.21", breakingChange: false,
    businessImpact: "Prototype pollution can lead to denial of service or privilege escalation in Node.js server contexts. Impact is limited since lodash appears in build toolchain rather than runtime server code.",
    executiveSummary: "Lodash 4.17.15 contains two high-severity vulnerabilities. While neither is being actively exploited in the wild, the library is present in 12 transitive dependency paths. Upgrading to 4.17.21 resolves both issues with zero breaking changes.",
    remediation: "Run npm update lodash --depth=10 or add a resolution override in package.json: {\"resolutions\": {\"lodash\": \"4.17.21\"}}. For Yarn: add resolutions block to package.json.",
    validationSteps: ["Run npm ls lodash to confirm all instances are 4.17.21+", "Check for any direct imports of lodash.template with user input", "Run npm audit after upgrade to confirm CVEs resolved"],
    slaDeadline: "2026-08-28", owner: "Frontend Team",
    compliance: [
      { framework: "OWASP Top 10", reference: "A06:2021", description: "Vulnerable and Outdated Components" },
    ],
    repository: "https://github.com/example/frontend-app", firstSeen: "2020-07-16", lastUpdated: "2026-08-15",
  },

  // ── F-004: axios SSRF ─────────────────────────────────────────────────────
  {
    id: "SCA-004", packageName: "axios", packageVersion: "0.21.1",
    ecosystem: "npm", severity: "High", status: "Patched Available",
    cves: [{ id: "CVE-2021-3749", cvss: 7.5, epss: 0.021, description: "ReDoS vulnerability via crafted URL that causes catastrophic backtracking in URL parsing regex, leading to denial of service.", publishedAt: "2021-08-31", severity: "High", patchedIn: "0.21.4", exploitInWild: false }],
    license: { name: "MIT", spdxId: "MIT", risk: "Permissive", copyleft: false, commercial: true, notes: "" },
    isDirect: true, depth: 1,
    transitivePaths: [{ chain: ["customer-api", "axios"], depth: 1 }],
    dependentCount: 1, internetFacing: true, activelyExploited: false, reachable: true,
    fixAvailable: true, fixVersion: "1.6.0", breakingChange: true,
    businessImpact: "A crafted URL sent to any endpoint that uses axios for outbound requests could freeze the Node.js event loop for seconds, effectively causing a denial of service for all concurrent requests.",
    executiveSummary: "axios 0.21.1 is vulnerable to ReDoS. Given that your API accepts user-controlled URLs in the proxy endpoint, this is directly reachable. Note: the fix requires upgrading to 1.x which includes a breaking API change.",
    remediation: "Upgrade axios to 1.6.0+. Update import syntax from require('axios') to import axios from 'axios' and review any custom instance configuration. Alternatively, upgrade to 0.27.2 which is patched without breaking changes.",
    validationSteps: ["Verify axios version in package-lock.json", "Test all outbound HTTP call endpoints with long URL strings", "Check no custom axios adapters are broken after upgrade"],
    slaDeadline: "2026-09-03", owner: "API Team",
    compliance: [{ framework: "OWASP Top 10", reference: "A06:2021", description: "Vulnerable and Outdated Components" }],
    repository: "https://github.com/example/customer-api", firstSeen: "2021-09-01", lastUpdated: "2026-08-10",
  },

  // ── F-005: PyYAML RCE ─────────────────────────────────────────────────────
  {
    id: "SCA-005", packageName: "PyYAML", packageVersion: "5.3.1",
    ecosystem: "PyPI", severity: "Critical", status: "Patched Available",
    cves: [{ id: "CVE-2020-14343", cvss: 9.8, epss: 0.031, description: "Unsafe deserialization via yaml.load() without Loader argument allows arbitrary Python object instantiation, leading to remote code execution.", publishedAt: "2020-07-21", severity: "Critical", patchedIn: "5.4", exploitInWild: false }],
    license: { name: "MIT", spdxId: "MIT", risk: "Permissive", copyleft: false, commercial: true, notes: "" },
    isDirect: true, depth: 1,
    transitivePaths: [{ chain: ["ml-pipeline", "PyYAML"], depth: 1 }],
    dependentCount: 1, internetFacing: false, activelyExploited: false, reachable: true,
    fixAvailable: true, fixVersion: "6.0.1", breakingChange: false,
    businessImpact: "If untrusted YAML is parsed via yaml.load() in the ML pipeline configuration loader, an attacker who can control config files can achieve remote code execution on the ML training servers.",
    executiveSummary: "PyYAML 5.3.1 is vulnerable to arbitrary code execution when yaml.load() is called without a safe Loader. The ml-pipeline service loads YAML configuration files directly.",
    remediation: "Upgrade PyYAML to 6.0.1. Change all yaml.load(data) calls to yaml.safe_load(data) or yaml.load(data, Loader=yaml.SafeLoader). Never parse YAML from untrusted sources.",
    validationSteps: ["grep -r 'yaml.load(' --include='*.py' to find unsafe calls", "Verify yaml.safe_load is used everywhere after fix", "Run pip show PyYAML to confirm version"],
    slaDeadline: "2026-09-05", owner: "ML Team",
    compliance: [{ framework: "NIST 800-53", reference: "SI-2", description: "Flaw Remediation" }],
    repository: "https://github.com/example/ml-pipeline", firstSeen: "2020-07-22", lastUpdated: "2026-08-01",
  },

  // ── F-006: GPL License Violation ─────────────────────────────────────────
  {
    id: "SCA-006", packageName: "gpl-library", packageVersion: "3.2.1",
    ecosystem: "Maven", severity: "High", status: "Open",
    cves: [],
    license: { name: "GPL-3.0", spdxId: "GPL-3.0-only", risk: "Copyleft", copyleft: true, commercial: false, notes: "GPL-3.0 requires derivative works to be released under the same GPL-3.0 license. Using this in a closed-source commercial product may violate the license terms and expose your company to legal liability." },
    isDirect: true, depth: 1,
    transitivePaths: [{ chain: ["payment-service", "gpl-library"], depth: 1 }],
    dependentCount: 1, internetFacing: false, activelyExploited: false, reachable: true,
    fixAvailable: false, fixVersion: null, breakingChange: true,
    businessImpact: "Using GPL-3.0 licensed code in a closed-source commercial product may require open-sourcing your entire codebase under GPL-3.0. This is a significant legal and intellectual property risk.",
    executiveSummary: "The payment-service directly depends on a GPL-3.0 licensed library. Commercial products incorporating GPL code must release their source code under GPL-3.0 unless a commercial license exception is obtained from the library author.",
    remediation: "Replace gpl-library with an Apache-2.0 or MIT alternative. Contact legal team immediately. Options: (1) Find MIT/Apache equivalent library, (2) Obtain commercial license from vendor, (3) Rewrite the functionality in-house.",
    validationSteps: ["Legal team review of all GPL dependencies", "Identify Apache-2.0 replacement library", "Test payment-service functionality with replacement"],
    slaDeadline: "2026-09-01", owner: "Legal + Platform Team",
    compliance: [{ framework: "ISO 27001", reference: "A.18.1.2", description: "Intellectual Property Rights — ensure compliance with software licensing." }],
    repository: "https://github.com/example/payment-service", firstSeen: "2024-03-15", lastUpdated: "2026-08-20",
  },

  // ── F-007: xmlrpc DoS ─────────────────────────────────────────────────────
  {
    id: "SCA-007", packageName: "org.apache.xmlrpc", packageVersion: "3.1.3",
    ecosystem: "Maven", severity: "Medium", status: "No Fix",
    cves: [{ id: "CVE-2019-17570", cvss: 6.5, epss: 0.011, description: "Unsafe deserialization in XMLRPC client — allows server to deserialize arbitrary objects into client.", publishedAt: "2020-01-17", severity: "Medium", patchedIn: null, exploitInWild: false }],
    license: { name: "Apache-2.0", spdxId: "Apache-2.0", risk: "Permissive", copyleft: false, commercial: true, notes: "" },
    isDirect: false, depth: 4,
    transitivePaths: [{ chain: ["admin-service", "wordpress-xmlrpc-client", "commons-httpclient", "org.apache.xmlrpc"], depth: 4 }],
    dependentCount: 1, internetFacing: false, activelyExploited: false, reachable: false,
    fixAvailable: false, fixVersion: null, breakingChange: false,
    businessImpact: "Low impact — the vulnerable code path is not reachable in your application since the XMLRPC client is only used for internal admin communications with no untrusted server endpoints.",
    executiveSummary: "org.apache.xmlrpc 3.1.3 has a deserialization vulnerability with no available patch as the project is no longer maintained. However, analysis confirms the vulnerable code path is unreachable in your deployment.",
    remediation: "Replace wordpress-xmlrpc-client with a REST API client. Until then, accept the risk with a documented exception since the vulnerable code is unreachable and the library receives no untrusted data.",
    validationSteps: ["Confirm XMLRPC client only connects to internal admin WordPress instance", "Document risk acceptance with security team sign-off", "Schedule replacement in next major refactor"],
    slaDeadline: "2026-10-01", owner: "Admin Team",
    compliance: [{ framework: "NIST 800-53", reference: "SI-2", description: "Flaw Remediation" }],
    repository: "https://github.com/example/admin-service", firstSeen: "2020-01-18", lastUpdated: "2026-07-01",
  },

  // ── F-008: Pillow Image Processing RCE ───────────────────────────────────
  {
    id: "SCA-008", packageName: "Pillow", packageVersion: "8.2.0",
    ecosystem: "PyPI", severity: "Critical", status: "Patched Available",
    cves: [
      { id: "CVE-2021-34552", cvss: 9.8, epss: 0.008, description: "Buffer overflow in Convert.c allows RCE via a crafted image. Affects JPEG, TIFF, BMP parsing.", publishedAt: "2021-07-13", severity: "Critical", patchedIn: "8.3.0", exploitInWild: false },
    ],
    license: { name: "HPND", spdxId: "HPND", risk: "Permissive", copyleft: false, commercial: true, notes: "Historical Permission Notice and Disclaimer — permissive license." },
    isDirect: true, depth: 1,
    transitivePaths: [{ chain: ["image-service", "Pillow"], depth: 1 }],
    dependentCount: 1, internetFacing: true, activelyExploited: false, reachable: true,
    fixAvailable: true, fixVersion: "10.1.0", breakingChange: false,
    businessImpact: "The image-service accepts user-uploaded images. A maliciously crafted image can trigger a buffer overflow in Pillow, potentially achieving remote code execution on the image processing server.",
    executiveSummary: "Pillow 8.2.0 is vulnerable to a critical buffer overflow affecting JPEG, TIFF, and BMP image processing. Since image-service accepts user uploads and processes them server-side, this is directly exploitable.",
    remediation: "Upgrade Pillow to 10.1.0. Run pip install --upgrade Pillow. Also consider adding image magic number validation before processing and running Pillow in an isolated subprocess/sandbox.",
    validationSteps: ["pip show Pillow to confirm version 10.1.0+", "Upload crafted test images from Pillow CVE PoC repository", "Confirm image-service sandbox isolation is in place"],
    slaDeadline: "2026-08-23", owner: "Image Service Team",
    compliance: [{ framework: "PCI DSS", reference: "6.3.3", description: "Install applicable security patches." }],
    repository: "https://github.com/example/image-service", firstSeen: "2021-07-14", lastUpdated: "2026-08-18",
  },
];

// ── Aggregate stats ───────────────────────────────────────────────────────────

export const DEPENDENCY_STATS: DependencyStats = {
  total: 1847, direct: 124, transitive: 1723,
  outdated: 312, vulnerable: 47, licenseIssues: 8,
};

export const LICENSE_SUMMARY: LicenseSummary[] = [
  { license: "MIT",        count: 876, risk: "Permissive" },
  { license: "Apache-2.0", count: 542, risk: "Permissive" },
  { license: "BSD-3",      count: 203, risk: "Permissive" },
  { license: "GPL-3.0",    count: 12,  risk: "Copyleft" },
  { license: "LGPL-2.1",   count: 8,   risk: "Copyleft" },
  { license: "Proprietary",count: 4,   risk: "Proprietary" },
  { license: "Unknown",    count: 202, risk: "Unknown" },
];

export const ECOSYSTEM_BREAKDOWN: EcosystemBreakdown[] = [
  { ecosystem: "Maven",    count: 623, vulnerable: 18 },
  { ecosystem: "npm",      count: 891, vulnerable: 21 },
  { ecosystem: "PyPI",     count: 201, vulnerable: 6 },
  { ecosystem: "NuGet",    count: 89,  vulnerable: 2 },
  { ecosystem: "Go",       count: 43,  vulnerable: 0 },
];

export const SAMPLE_MANIFESTS = [
  { name: "WebGoat (Java/Maven)",  file: "pom.xml",          language: "Java",   expectedFindings: 8 },
  { name: "DVWA (PHP/Composer)",   file: "composer.json",    language: "PHP",    expectedFindings: 5 },
  { name: "NodeGoat (Node/npm)",   file: "package.json",     language: "Node.js",expectedFindings: 11 },
];
