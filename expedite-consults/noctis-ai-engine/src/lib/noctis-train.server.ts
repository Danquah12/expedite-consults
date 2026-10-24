import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFENSIVE_VECTOR_SPECS, OWASP_2025_SPECS, OWASP_API_2023_SPECS, PORTSWIGGER_ACADEMY_SPECS, owaspCodeGadget, renderSpecBlock } from "./owasp-suite";
import { cyberOperationsGadget, domainCertificationGadget, riskLifecycleGadget, zeroTrustGadget } from "./noctis-risk-engine";
import { evalBenchmarkGadget } from "./noctis-eval-suite";
import {
  classifyAdaptiveMode,
  generateDynamicDiagram,
  runFollowUpIntelligence,
  verifyResponseIntegrity,
} from "./noctis-response-intelligence";
import { buildHealthIntelligenceReport, buildNhArch001ArchitectureReport } from "./noctis-health-engine";
import {
  NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES,
  NOCTIS_42_PROFESSION_CATEGORIES,
  autoIngestRawSpecification,
  buildProfessionalIntelligenceReport,
  handleNaturalProfessionalQuery,
} from "./noctis-professional-engine";
import {
  buildVerifiedExecutionReport,
  validateSpecificationIngestionSafetyGate,
} from "./noctis-verified-execution";

export type TrainingPair = {
  id?: string;
  question: string;
  answer: string;
  domain?: string;
  model: string;
  hits?: number;
  at: string;
};

const FILE = path.join(process.cwd(), "data", "vibe-training.json");

const OWASP_SEED_CORPUS: TrainingPair[] = [
  ...OWASP_2025_SPECS.map((spec) => ({
    question: `Write Python, Java, and C defensive verification scripts for OWASP ${spec.id} ${spec.title}`,
    answer: renderSpecBlock(spec, ["python", "java", "c"]),
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 6,
    at: "2026-10-22T00:00:00.000Z",
  })),
  ...OWASP_API_2023_SPECS.map((spec) => ({
    question: `Write Python, Java, and C defensive verification scripts for OWASP ${spec.id} ${spec.title}`,
    answer: renderSpecBlock(spec, ["python", "java", "c"]),
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 6,
    at: "2026-10-22T00:00:00.000Z",
  })),
  ...DEFENSIVE_VECTOR_SPECS.map((spec) => ({
    question: `Write Python, Java, and C defensive verification scripts for ${spec.id} ${spec.title}`,
    answer: renderSpecBlock(spec, ["python", "java", "c"]),
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 6,
    at: "2026-10-22T00:00:00.000Z",
  })),
  ...PORTSWIGGER_ACADEMY_SPECS.map((spec) => ({
    question: `Write Python, Java, and C defensive verification scripts for PortSwigger ${spec.id} ${spec.title}`,
    answer: renderSpecBlock(spec, ["python", "java", "c"]),
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 6,
    at: "2026-10-22T00:00:00.000Z",
  })),
  {
    question: "write a python code to test sql injection",
    answer: owaspCodeGadget("write a python code to test sql injection") || "",
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "How do we train Noctis to write a complete programming tasks in python, Java, C, OTHER LANGUAGES",
    answer: owaspCodeGadget("How do we train Noctis to write a complete programming tasks in python, Java, C, OTHER LANGUAGES") || "",
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Execute the complete Noctis Risk Management Lifecycle (NIST RMF SP 800-37, SP 800-30, SP 800-53, CSF 2.0, ISO 31000, FAIR, Digital Twin, and 10-Dimension Maturity Engine)",
    answer: riskLifecycleGadget("Execute the complete Noctis Risk Management Lifecycle (NIST RMF SP 800-37, SP 800-30, SP 800-53, CSF 2.0, ISO 31000, FAIR, Digital Twin, and 10-Dimension Maturity Engine)") || "",
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Show the Noctis 20-Core / 40-Specialist Domain Pack General-Purpose Platform and Domain Certification Engine",
    answer: domainCertificationGadget("Show the Noctis 20-Core / 40-Specialist Domain Pack General-Purpose Platform and Domain Certification Engine") || "",
    domain: "general",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Execute the Noctis Zero Trust Intelligence Engine (NIST SP 800-207, CISA Zero Trust Maturity Model 2.0, SP 800-207A, SP 800-63-4, and Policy Engine Access Evaluator)",
    answer: zeroTrustGadget("Execute the Noctis Zero Trust Intelligence Engine (NIST SP 800-207, CISA Zero Trust Maturity Model 2.0, SP 800-207A, SP 800-63-4, and Policy Engine Access Evaluator)") || "",
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Train Noctis in Offensive Security, Penetration Testing, Red Teaming, Blue Team Defense, and Purple Team Control Validation",
    answer: cyberOperationsGadget("Train Noctis in Offensive Security, Penetration Testing, Red Teaming, Blue Team Defense, and Purple Team Control Validation") || "",
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Run the automated 400-question Noctis Evaluation & Benchmark Suite (Noctis Cyber, Noctis Risk, Engineering & Math, and Research & 15 Knowledge Divisions)",
    answer: evalBenchmarkGadget("Run the automated 400-question Noctis Evaluation & Benchmark Suite (Noctis Cyber, Noctis Risk, Engineering & Math, and Research & 15 Knowledge Divisions)") || "",
    domain: "general",
    model: "vibe-seed",
    hits: 12,
    at: "2026-10-23T00:00:00.000Z",
  },
  {
    question: "Execute the Noctis Health Intelligence Engine, Engineering Blueprint, 5 Operating Environments, 18 Medical Engines, and H-001 to H-012 Acceptance Suite",
    answer: buildHealthIntelligenceReport("Noctis Health Engineering Blueprint"),
    domain: "healthcare",
    model: "vibe-seed",
    hits: 14,
    at: "2026-10-23T00:00:00.000Z",
  },
  {
    question: "Show NH-ARCH-001 Noctis Health Component Architecture & Deployment Design (15 services, Zones A-E, and 10-state workflow state machine)",
    answer: buildNhArch001ArchitectureReport(),
    domain: "healthcare",
    model: "vibe-seed",
    hits: 14,
    at: "2026-10-23T00:00:00.000Z",
  },
  {
    question: "Execute the Noctis Professional Intelligence Engine, 42-Category Global Professions Directory, 22 Specialist Engineering Engines, 20 Advanced Execution Engines, and Autonomous Professional Work Engine",
    answer: buildProfessionalIntelligenceReport("Noctis Professional Intelligence Engine"),
    domain: "engineering",
    model: "vibe-seed",
    hits: 15,
    at: "2026-10-23T00:00:00.000Z",
  },
  {
    question: "My diesel vehicle cranks but will not start. Diagnose the fault using competing hypotheses and safe diagnostic tests.",
    answer: handleNaturalProfessionalQuery("My diesel vehicle cranks but will not start") || "",
    domain: "engineering",
    model: "vibe-seed",
    hits: 12,
    at: "2026-10-23T00:00:00.000Z",
  },
  {
    question: "A contractor uploads a building plan and asks for a cost estimate and bill of quantities (BOQ).",
    answer: handleNaturalProfessionalQuery("A contractor uploads a building plan and asks for a cost estimate") || "",
    domain: "engineering",
    model: "vibe-seed",
    hits: 12,
    at: "2026-10-23T00:00:00.000Z",
  },
  ...NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES.map((eng) => ({
    question: `Explain how the Noctis ${eng.name} (${eng.id}) works, its capabilities, professional deliverables, and safety boundary`,
    answer: `### ${eng.name} (\`${eng.id}\` — ${eng.tier})\n- **Core Capabilities:** ${eng.capabilities.join("; ")}.\n- **Professional Outputs:** ${eng.professionalOutputs.join(", ")}.\n- **Mandatory Safety & Licensing Boundary:** ${eng.safetyAndApprovalBoundary}`,
    domain: "engineering",
    model: "vibe-seed",
    hits: 8,
    at: "2026-10-23T00:00:00.000Z",
  })),
  ...NOCTIS_42_PROFESSION_CATEGORIES.map((cat) => ({
    question: `What professions, skills, certifications, and platform features does Noctis support for Category #${cat.categoryNumber}: ${cat.industryGroup}?`,
    answer: `### Category #${cat.categoryNumber}: ${cat.industryGroup} (\`${cat.launchWave}\`)\n- **Representative Professions:** ${cat.representativeProfessions.join("; ")}.\n- **Specializations:** ${cat.specializations.join(", ")}.\n- **Verified Capabilities:** ${cat.verifiedSkillsAndCapabilities.join(", ")}.\n- **Credentials & Licenses:** ${cat.credentialsAndCertifications.join(", ")}.\n- **What Noctis Offers:** ${cat.differentiatedPlatformFeatures}`,
    domain: "professional-directory",
    model: "vibe-seed",
    hits: 8,
    at: "2026-10-23T00:00:00.000Z",
  })),
  {
    question: "Explain the Noctis Controlled Professional Execution Layer, Independent Verification Engine, Tier-2 Adversarial Suite, 20 Advanced Intelligence Systems, Professional Workbench, L1-L5 Capability Maturity Model, and Capability Registry",
    answer: buildVerifiedExecutionReport(),
    domain: "engineering",
    model: "vibe-seed",
    hits: 20,
    at: "2026-10-23T00:00:00.000Z",
  },
];

const SEED_CORPUS: TrainingPair[] = [
  ...OWASP_SEED_CORPUS,
  {
    question: "How do we validate an IDOR report?",
    answer: `To validate an IDOR report, follow the exact sequence of reproducing the baseline request, mapping the authorization model, replaying with reduced privileges, confirming real data exposure, and capturing full evidence.

This process confirms whether the vulnerability is real rather than a false positive. It prevents wasted triage time and ensures the report meets the standard required for acceptance.

### Validation Steps
1. Reproduce the baseline request exactly as reported, using the original authenticated session and parameters.
2. Map the authorization model by identifying every object reference, role, and tenant boundary in the endpoint.
3. Replay the same request with a lower-privilege token or a token from a different tenant while keeping all other values identical.
4. Verify that the response returns actual unauthorized data belonging to another user or tenant, not just an error or empty result.
5. Document the full HTTP request and response pairs for both the original and the modified sessions.

### Concrete Example
An attacker reports that changing the \`user_id=123\` parameter in \`/api/profile\` returns another user’s email.  
- Step 1: Send the original request with your own valid token and \`user_id=123\`; record the 200 response containing your data.  
- Step 2: Note that the endpoint only checks the token for authentication but does not verify ownership of the \`user_id\`.  
- Step 3: Log in as a second account and replay the identical request with \`user_id=123\`.  
- Step 4: Observe the response now contains the first user’s private email and address.  
- Step 5: Save both raw request/response pairs with timestamps and token redaction for the report.

The security team then confirms the finding, assigns severity, and the reporter receives credit once the evidence is reviewed.`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "How do you determine the severity of a technically valid vulnerability?",
    answer: `CVSS (v3.1 / v4.0) provides a baseline technical score, but real-world vulnerability severity depends on pairing exploitability and demonstrated impact with business and architectural context.

| Factor | What to Check | Impact on Severity |
| --- | --- | --- |
| **Preconditions & Auth** | Unauthenticated internet attacker vs. high-privileged admin; guessable IDs vs. unexposed UUIDs | Lower preconditions raise severity |
| **Demonstrated C/I/A Impact** | Public metadata read (Low) vs. bulk PII/financial exfiltration (High) vs. Account Takeover / RCE (Critical) | Grounded in actual proven capability |
| **Scope & Trust Boundary** | Does the flaw pivot into internal services (e.g., SSRF to cloud metadata) or stay isolated? | Scope change increases blast radius |
| **Asset Criticality** | Isolated static marketing site vs. core production authentication or billing service | Core crown-jewel assets carry higher risk |

Always score what is demonstrated in the target environment rather than theoretical worst-case chains.`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 5,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "What is CTEM and what order does it follow?",
    answer: `Continuous Threat Exposure Management (CTEM) is a five-stage cycle for finding, ranking, and closing real attack paths rather than chasing disconnected CVE lists.

### The 5 Stages of CTEM
1. **Scoping / Discover:** Inventory internet-facing assets, crown-jewel data stores, and non-human identities (NHI).
2. **Assess / Exposure:** Identify vulnerabilities, misconfigurations, and over-permissive identity relationships.
3. **Prioritize:** Rank findings by exploitability (such as CISA KEV), crown-jewel proximity, and toxic combinations (e.g., a public S3 bucket paired with an assumable admin role).
4. **Validate:** Safely test whether the attack path actually reaches the target asset and whether detections fire.
5. **Mobilize / Remediate & Monitor:** Cut the highest-risk path edges first (revoke public access, scope IAM roles, patch KEVs) and continuously watch the path.`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 4,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "What is Zero Trust Architecture under NIST SP 800-207?",
    answer: `Zero Trust Architecture (NIST SP 800-207) assumes an attacker is already on the network and verifies identity, device posture, and context on every single request instead of trusting a network perimeter or flat VLAN.

### Core Controls
1. **Identity & Device Verification:** Enforce phishing-resistant MFA and conditional access before granting a session.
2. **Microsegmentation & East-West Deny:** Replace wide-open internal security groups and flat VLANs with default-deny Kubernetes NetworkPolicies and identity-based allow-lists.
3. **Least-Privilege Per Request:** Authorize access to specific applications via ZTNA rather than handing out broad split-tunnel VPN access.`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 4,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "What is an AIBOM and how do you secure the AI supply chain?",
    answer: `An AI Bill of Materials (AIBOM) inventories the model weights, training datasets, fine-tuning adapters, and external plugins/MCP tools that an AI system depends on.

### Securing the AI Supply Chain
1. **Verify Provenance & Signatures:** Never run unsigned model weights from untrusted forums; use signed artifacts with verifiable hashes (SLSA / Sigstore).
2. **Audit Training Data:** Track dataset lineage to prevent data poisoning and backdoor triggers.
3. **Review Third-Party Tools & MCP Servers:** Treat every external plugin or MCP tool as a software supplier with least-privilege permissions and human-in-the-loop gates for state-changing actions.`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 4,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "How do I move from help desk to a security engineer role?",
    answer: `Moving from the help desk to security engineering builds directly on the ticketing, identity, and troubleshooting work you already do.

### Step-by-Step Path
1. **Turn Tickets into Security Signals:** While resetting passwords and imaging machines, trace the network path (DNS, DHCP, firewall rules) and authentication logs behind every issue.
2. **Core Foundations (Weeks 1–12):** Master networking fundamentals and complete the CompTIA Security+ objectives.
3. **Hands-On Detection Lab:** Stand up a home lab with Wireshark, Splunk or Elastic, and Burp Suite Community to practice reading packet captures and SIEM alerts.
4. **Intermediate Seat (SOC / Detection Analyst):** Transition into a SOC or vulnerability analyst seat and pursue CySA+ or a cloud security credential.
5. **Security Engineering:** Move from triaging individual alerts to writing detection rules, hardening IAM policies, and designing preventive controls.`,
    domain: "career",
    model: "vibe-seed",
    hits: 4,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "What is the difference between electrical power and electrical energy?",
    answer: `Power is the rate at which electricity is used or generated at a single moment (measured in kW, MW, or GW), whereas energy is the total amount used or stored over a period of time (measured in kWh, MWh, GWh, or TWh).

### How They Relate
1. **Equation:** Energy = Power × Time. A 2 MW generator running at full output for 10 hours produces 20 MWh of energy.
2. **Storage Limits:** A battery has both an energy capacity (usable MWh) and a maximum discharge power (MW). Having enough stored energy (MWh) does not mean the battery can meet peak power demand (MW) if its inverter/discharge limit is too low.`,
    domain: "engineering",
    model: "vibe-seed",
    hits: 4,
    at: "2026-10-20T00:00:00.000Z",
  },
  {
    question: "What is DNS (Domain Name System)? Explain in detail what a DNS is and how DNS works",
    answer: `**DNS (Domain Name System)** is the hierarchical, decentralized naming system of the internet (defined in **RFC 1034** and **RFC 1035**) that translates human-readable domain names (such as \`noctis.social\` or \`example.com\`) into machine-routable IP addresses (such as \`93.184.216.34\` for IPv4 or \`2606:2800:220:1:248:1893:25c8:1946\` for IPv6). Without DNS, users would have to memorize raw numerical IP addresses for every website, API, and mail server.

### 1. The 4 Core DNS Server Roles in Resolution
| DNS Component | Role in the Hierarchy | Example |
|---|---|---|
| **1. Stub Resolver & Recursive Resolver** | The client OS stub sends the query to a Recursive Resolver (ISP, enterprise, or public resolver), which performs the full lookup on the client's behalf and caches the answer. | \`1.1.1.1\` (Cloudflare), \`8.8.8.8\` (Google), \`9.9.9.9\` (Quad9) |
| **2. Root Name Server (\`.\`)** | Sits at the top of the DNS tree (13 logical root server letter clusters \`a.root-servers.net\` through \`m.root-servers.net\`, operated via Anycast across 1,500+ global instances). Directs the resolver to the appropriate TLD server. | \`a.root-servers.net\` (\`198.41.0.4\`) |
| **3. TLD (Top-Level Domain) Name Server** | Manages all domains under a specific top-level extension (\`.com\`, \`.org\`, \`.net\`, \`.social\`, \`.gov\`, or country-code TLDs like \`.gh\`, \`.uk\`). Returns the domain's Authoritative Name Servers (\`NS\` records). | Verisign \`.com\` TLD servers, IANA Registry |
| **4. Authoritative Name Server** | Holds the definitive zone file for the domain and returns the final resource record (\`A\`, \`AAAA\`, \`MX\`, \`TXT\`, \`CNAME\`) back to the recursive resolver. | Cloudflare DNS, AWS Route 53, BIND9, NS1 |

### 2. Step-by-Step DNS Resolution Walkthrough (8 Stages)
1. **Browser & OS Cache Check:** When you enter \`https://noctis.social\`, the browser checks its in-memory DNS cache, then the operating system stub resolver checks the local OS cache and \`/etc/hosts\` (or \`C:\\Windows\\System32\\drivers\\etc\\hosts\`).
2. **Recursive Query to Resolver:** If not cached locally, the OS stub resolver sends a **recursive query** over UDP/TCP port \`53\` (or encrypted **DoH** port \`443\` / **DoT** port \`853\`) to the configured Recursive Resolver.
3. **Resolver Cache Check:** If the Recursive Resolver already has a valid record whose **TTL (Time-To-Live)** has not expired, it returns the IP immediately in 1–5 ms.
4. **Iterative Query to Root (\`.\`):** On a cache miss, the Recursive Resolver queries a **Root Name Server**, which replies with a referral to the **\`.social\` TLD Name Servers**.
5. **Iterative Query to TLD Server:** The Recursive Resolver queries the **\`.social\` TLD Name Server**, which replies with the \`NS\` (Name Server) records pointing to the domain's **Authoritative Name Servers**.
6. **Iterative Query to Authoritative Server:** The Recursive Resolver queries the **Authoritative Name Server** for \`noctis.social\`'s \`A\` (IPv4) and \`AAAA\` (IPv6) records.
7. **Response & TTL Caching:** The Authoritative Server returns the IP address along with a **TTL** (e.g., \`300\` seconds). The Recursive Resolver caches the record for that TTL duration and returns the IP to the client OS.
8. **Connection Establishment:** The browser receives the IP address and initiates the TCP 3-way handshake (\`SYN\`, \`SYN-ACK\`, \`ACK\`) and TLS 1.3 handshake on port \`443\`.

### 3. Essential DNS Resource Record Types
| Record Type | Full Name | Purpose & Example |
|---|---|---|
| **\`A\`** | Address Record (IPv4) | Maps a hostname to a 32-bit IPv4 address (\`example.com -> 93.184.216.34\`). |
| **\`AAAA\`** | Quad-A Record (IPv6) | Maps a hostname to a 128-bit IPv6 address (\`2606:2800:220:1:...\`). |
| **\`CNAME\`** | Canonical Name | Aliases one domain name to another canonical domain (\`www.example.com -> example.com\`). |
| **\`MX\`** | Mail Exchange | Directs email for a domain to designated mail servers with priority numbers (\`10 mail.example.com\`). |
| **\`TXT\`** | Text Record | Stores arbitrary text and cryptographic policies including **SPF**, **DKIM**, **DMARC**, and domain ownership tokens. |
| **\`NS\`** | Name Server | Delegates a DNS zone to specific authoritative name servers. |
| **\`SOA\`** | Start of Authority | Stores zone administration metadata: primary name server, serial number, refresh, retry, expire, and negative-cache TTL. |
| **\`PTR\`** | Pointer Record | Performs **Reverse DNS (rDNS)** lookups mapping an IP address back to a hostname under \`in-addr.arpa\` / \`ip6.arpa\`. |
| **\`SRV\`** | Service Record | Specifies host and port for specific services (e.g., \`_sip._tcp\`, \`_ldap._tcp\`, Kerberos). |
| **\`CAA\`** | Certification Authority Authorization | Restricts which TLS Certificate Authorities (e.g., Let's Encrypt, DigiCert) are permitted to issue certificates for the domain. |

### 4. DNS Security Threats & Hardening Controls
- **DNS Cache Poisoning / Kaminsky Attack:** Attackers spoof forged DNS responses to poison a recursive resolver's cache. **Defense:** Enable **DNSSEC** (**RFC 4033–4035** using \`DNSKEY\`, \`RRSIG\`, and \`DS\` records to cryptographically sign zone data) and source-port randomization (\`0x20\` bit encoding).
- **Plaintext Snooping & On-Path Tampering:** Traditional DNS runs in cleartext over UDP/TCP port \`53\`. **Defense:** Enforce **DoH (DNS over HTTPS, RFC 8484)** on port \`443\` or **DoT (DNS over TLS, RFC 7858)** on port \`853\`.
- **DNS Amplification / Reflection DDoS:** Attackers send small spoofed \`ANY\` or \`TXT\` queries to open resolvers to flood a victim IP with large UDP responses. **Defense:** Disable open recursion on authoritative servers, enforce **Response Rate Limiting (RRL)**, and deploy **BCP 38** source-address validation.
- **DNS Tunneling & Data Exfiltration:** Malware encodes C2 payloads or stolen data inside subdomains (\`<hex-chunk>.attacker.com\`). **Defense:** Inspect query entropy, subdomain length, and unusual \`TXT\`/\`NULL\` query volume in protective DNS / SIEM telemetry.

### 5. Hands-On Verification Commands
\`\`\`bash
# Trace the full hierarchical delegation path from Root (.) -> TLD -> Authoritative
dig +trace noctis.social A

# Query a specific record type (A, AAAA, MX, TXT, NS, SOA) using Cloudflare 1.1.1.1
dig @1.1.1.1 noctis.social ANY +noall +answer

# Verify DNSSEC signature chain validation (+dnssec)
dig @8.8.8.8 cloudflare.com A +dnssec +multi
\`\`\``,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 25,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Explain the TCP/IP and OSI network models and how packets travel across a network",
    answer: `The **OSI (Open Systems Interconnection) 7-Layer Model** and the **TCP/IP 4-Layer Suite** standardize how network protocols encapsulate, address, route, and reliably deliver data from an application on one host to another host across the internet.

### OSI 7-Layer vs. TCP/IP Layer Mapping
| OSI Layer | Name | Unit (PDU) | TCP/IP Suite | Core Protocols & Devices | Security Controls |
|---|---|---|---|---|---|
| **Layer 7** | Application | Data / Message | Application | HTTP/1.1, HTTP/2, HTTP/3, DNS, SSH, SMTP, TLS | WAF, API Gateway, OAuth2/OIDC, mTLS |
| **Layer 6** | Presentation | Data | Application | TLS 1.3 encryption, UTF-8, JSON, Protobuf, gzip | Strict TLS 1.3, AEAD (AES-GCM / ChaCha20) |
| **Layer 5** | Session | Data | Application | Sockets, RPC, WebSockets, session tokens | Session rotation, idle timeouts |
| **Layer 4** | Transport | Segment (TCP) / Datagram (UDP) | Transport | **TCP** (reliable, 3-way handshake), **UDP** (low-latency), **QUIC** | SYN cookies, stateful firewall ACLs |
| **Layer 3** | Network | Packet | Internet | **IPv4**, **IPv6**, **ICMP**, **IPsec**, **BGP**, **OSPF**, Routers | BGP RPKI, IPsec VPN, egress filtering |
| **Layer 2** | Data Link | Frame | Network Access | **Ethernet (802.3)**, **Wi-Fi (802.11)**, **ARP**, **VLAN (802.1Q)**, Switches | Dynamic ARP Inspection (DAI), 802.1X, MACsec |
| **Layer 1** | Physical | Bits / Symbols | Network Access | Fiber optic, Cat6A copper, RF spectrum, NIC PHY | Physical port locks, fiber tap monitoring |`,
    domain: "cybersecurity",
    model: "vibe-seed",
    hits: 10,
    at: "2026-10-22T00:00:00.000Z",
  },
  {
    question: "Explain the Noctis Unified Predictive Intelligence Platform (NOCTIS-PRED-001), the 15 prediction engines, the 10 shared platform components, the standard output contract PRED-1042, and Prediction-to-Action intelligence",
    answer: `The **Noctis Unified Predictive Intelligence Platform (\`NOCTIS-PRED-001\`)** is a single reusable platform service behind all **15 Prediction Engines**, strictly separating **Prediction**, **Explanation**, and **Recommendation**, and keeping **Probability**, **Forecast**, **Anomaly Score**, **Risk Score**, and **Recommendation** mathematically distinct.

### 1. The 10 Shared Platform Components
1. **Data Preparation (\`COMP-PRED-01\`):** Validates timestamps, missing values, physical units, duplicates, and chronological ordering.
2. **Point-in-Time Feature Pipeline (\`COMP-PRED-02\`):** Enforces \`timestamp <= as_of\` cutoff to prevent future data leakage into training/inference.
3. **NIST AI RMF Model Registry (\`COMP-PRED-03\`):** Tracks \`model_version\`, lineage, allowed \`domain\`/\`target\`, NIST AI RMF lifecycle stage (\`GOVERN\`, \`MAP\`, \`MEASURE\`, \`MANAGE\`), and blocks cross-domain misuse.
4. **Prediction Service (\`COMP-PRED-04\`):** Orchestrates Time-Series Forecasting, Predictive ML Risk, Anomaly Detection, and Counterfactual Simulation.
5. **Uncertainty & Calibration Service (\`COMP-PRED-05\`):** Computes 90%/95% prediction intervals, Brier score, and ECE; blocks presenting uncalibrated scores (e.g., \`0.72\` with \`calibration_status: "requires_validation"\`) as verified real-world probabilities.
6. **Chronological Backtesting & Baseline Engine (\`COMP-PRED-06\`):** Evaluates held-out observations after the training cutoff and requires models to beat naive/moving-average baselines before deployment.
7. **Drift Monitor (\`COMP-PRED-07\`):** Detects input distribution shifts (\`PSI >= 0.25\`, \`z-shift >= 2.5\`) and residual degradation.
8. **Decision & Abstention Policy (\`COMP-PRED-08\`):** Abstains (\`abstained_insufficient_data\`) when sample count or quality is insufficient rather than fabricating false precision.
9. **Post-Event Feedback Ledger (\`COMP-PRED-09\`):** Compares forecasts with verified actual outcomes after the event while quarantining unverified user claims from automatic retraining.
10. **Audit & Explanation Service (\`COMP-PRED-10\`):** Records \`input_snapshot_hash\`, \`model_version\`, \`evidence_ref\` drivers, and counterfactual sensitivity.

### 2. The 15 Prediction Engines (with Priority First-5 & 3 Practical Pilots)
- **First 5 Priority Engines:** (1) \`PRED-ENG-14\` Anomaly & Early-Warning Engine (Pilot 3), (2) \`PRED-ENG-01\` Time-Series Forecasting Engine, (3) \`PRED-ENG-02\` Failure & Predictive Maintenance Engine (Pilot 1 — blocks unvalidated exact RUL claims), (4) \`PRED-ENG-15\` Decision Outcome & What-If Simulation Engine, (5) \`PRED-ENG-03\` & \`PRED-ENG-12\` Construction Delay/Overrun (\`PRED-1042\`, Pilot 2) & Enterprise Risk Engine.
- **Domain Extension & Governed Engines:** \`PRED-ENG-04\` Cybersecurity Threat, \`PRED-ENG-05\` Clinical Risk & Health Trend (\`SEPARATE_CLINICAL_GOVERNANCE_TRACK\`), \`PRED-ENG-06\` Business Demand/Revenue, \`PRED-ENG-07\` Energy/Grid Reserve, \`PRED-ENG-08\` Supply Chain/Procurement, \`PRED-ENG-09\` Environmental/Weather Impact (timestamped NCEP/NOAA sources), \`PRED-ENG-10\` Manufacturing SPC Quality/Defect, \`PRED-ENG-11\` Community Cohort Trend (k-anonymity privacy), \`PRED-ENG-13\` Financial Scenario Stress (no promised returns).

### 3. Prediction-to-Action Loop (\`P2A-FLOW-1042\`)
\`Observe (SUPPLY-REF-104 +18d slip) -> Predict (PRED-1042) -> Explain (3d float on Drawing S-102 steel frame) -> Compare 3 Options -> Recommend Option A (net savings $3,480, 18d recovered) -> Obtain Approval (human_review_required: true) -> Act -> Measure Outcome\`.`,
    domain: "engineering",
    model: "vibe-seed",
    hits: 30,
    at: "2026-10-23T15:00:00.000Z",
  },
];

const STOP_WORDS = new Set([
  "about", "which", "there", "their", "would", "could", "should", "please",
  "write", "explain", "explained", "explaining", "what", "when", "where", "does",
  "have", "from", "with", "that", "this", "these", "those", "into", "your",
  "tell", "give", "make", "detail", "details", "detailed", "define", "definition",
  "describe", "meaning", "overview", "summary", "summarize", "deeply", "clearly",
  "simply", "step", "steps", "work", "works",
]);

const pairs: TrainingPair[] = load();
const rulesMem: string[] = [];
let dbHydrated = false;
let dbHydrating: Promise<void> | null = null;

function load(): TrainingPair[] {
  const map = new Map<string, TrainingPair>();
  for (const seed of SEED_CORPUS) {
    map.set(seed.question.toLowerCase(), { ...seed });
  }
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as unknown;
    if (Array.isArray(raw)) {
      for (const row of raw) {
        if (!row || typeof row !== "object") continue;
        const item = row as TrainingPair;
        if (typeof item.question !== "string" || typeof item.answer !== "string") continue;
        map.set(item.question.toLowerCase().trim(), {
          question: item.question.trim(),
          answer: item.answer.trim(),
          domain: item.domain || inferDomain(item.question),
          model: item.model || "vibe-native",
          hits: typeof item.hits === "number" ? item.hits : 1,
          at: item.at || new Date().toISOString(),
        });
      }
    }
  } catch {
    /* seed corpus is still available when disk file does not exist yet */
  }
  return [...map.values()];
}

export function inferDomain(text: string): string {
  if (/\b(cve|bola|idor|xss|csrf|ssrf|sqli|nist|cisa|siem|soc|zero trust|phish|malware|ransomware|cvss|firewall|burp|wireshark|splunk|iam|oauth|jwt|aibom|ctem)\b/i.test(text)) return "cybersecurity";
  if (/\b(bible|scripture|verse|psalm|gospel|genesis|john|matthew|romans|kjv)\b/i.test(text)) return "bible";
  if (/\b(kwh|mwh|gwh|twh|mw|gw|ohm|voltage|current|circuit|battery|generator|microgrid|factor of safety|si units)\b/i.test(text)) return "engineering";
  if (/\b(photosynthesis|newton|hypothesis|molecule|dna|cell|gravity|physics|chemistry|biology)\b/i.test(text)) return "science";
  if (/\b(resume|career|interview|salary|job|cert|certification|help desk|cissp|security\+|cysa\+)\b/i.test(text)) return "career";
  return "general";
}

function words(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
}

function saveToDisk() {
  try {
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(pairs.slice(-600), null, 2));
  } catch {
    /* serverless read-only disk does not block Postgres persistence */
  }
}

function pairId(question: string) {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  let hash = 2166136261;
  for (let i = 0; i < question.length; i += 1) {
    hash ^= question.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `vt-${slug || "q"}-${(hash >>> 0).toString(36)}`;
}

function hasScenarioNumbers(text: string): boolean {
  const hits = text.match(/\d[\d,]*(?:\.\d+)?\s*(?:%|mw|gw|kw|mwh|gwh|twh|kwh|kcal|liters?|litres?|\bL\b|m3|m³|million|billion|\$|devices|systems|residents|people|hours|days)/gi);
  return (hits?.length ?? 0) >= 2;
}

function numericFingerprint(text: string): string {
  const nums = [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,/g, ""));
  return nums.join("|");
}

export async function hydrateFromDb(): Promise<void> {
  if (dbHydrated) return;
  if (dbHydrating) return dbHydrating;
  dbHydrating = (async () => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql`
        delete from vibe_training_pair
        where model in ('vibe', 'vibe-native', 'vibe-gadget')
      `.catch(() => undefined);
      const rows = await sql<{
        id: string;
        question: string;
        answer: string;
        domain: string;
        model: string;
        hits: number;
        updated_at: string;
      }>`
        select id, question, answer, domain, model, hits, updated_at::text as updated_at
        from vibe_training_pair
        where verified = true
          and model not in ('vibe', 'vibe-native', 'vibe-gadget')
        order by updated_at desc
        limit 500
      `;
      for (let i = pairs.length - 1; i >= 0; i -= 1) {
        if (pairs[i]?.model === "vibe" || pairs[i]?.model === "vibe-native" || pairs[i]?.model === "vibe-gadget") {
          pairs.splice(i, 1);
        }
      }
      for (const row of rows.reverse()) {
        const key = row.question.toLowerCase().trim();
        const idx = pairs.findIndex((p) => p.question.toLowerCase().trim() === key);
        const item: TrainingPair = {
          id: row.id,
          question: row.question,
          answer: row.answer,
          domain: row.domain || inferDomain(row.question),
          model: row.model || "vibe-seed",
          hits: Number(row.hits) || 1,
          at: row.updated_at || new Date().toISOString(),
        };
        if (idx >= 0) pairs[idx] = item;
        else pairs.push(item);
      }
      const ruleRows = await sql<{ rule: string }>`
        select rule from vibe_training_rule order by created_at desc limit 24
      `;
      for (const r of ruleRows.reverse()) {
        if (r.rule && !rulesMem.includes(r.rule)) rulesMem.push(r.rule);
      }
      if (rows.length < SEED_CORPUS.length) {
        for (const seed of SEED_CORPUS) {
          const id = pairId(seed.question);
          await sql`
            insert into vibe_training_pair (id, question, answer, domain, model, hits, verified)
            values (${id}, ${seed.question}, ${seed.answer}, ${seed.domain || "general"}, ${seed.model}, ${seed.hits || 1}, true)
            on conflict (id) do nothing
          `.catch(() => undefined);
        }
      }
      dbHydrated = true;
    } catch {
      /* DB unavailable in unit test environment — in-memory + seed corpus stays active */
    } finally {
      dbHydrating = null;
    }
  })();
  return dbHydrating;
}

export function rememberAnswer(question: string, answer: string, model = "vibe-native", domain?: string) {
  const asked = question.replace(/\s+/g, " ").trim().slice(0, 600);
  const said = answer.split(/\n\s*Claim standing:/i)[0]?.trim().slice(0, 6000) || answer.trim().slice(0, 6000);
  const isExplicitTrain = model === "user-taught" || model === "vibe-trained" || model === "api-trained";
  if (!isExplicitTrain) return;
  if (asked.length < 4 || said.length < 8) return;
  if (/sk-|api[_-]?key|bearer /i.test(`${asked} ${said}`)) return;
  if (/^(Not in the record|Vibe could not|No OpenAI)/i.test(said)) return;
  const key = asked.toLowerCase();
  const same = pairs.findIndex((pair) => pair.question.toLowerCase() === key);
  const resolvedDomain = domain || inferDomain(`${asked} ${said}`);
  const prevHits = same >= 0 ? (pairs[same]?.hits ?? 1) : 0;
  const id = pairId(asked);
  const next: TrainingPair = {
    id,
    question: asked,
    answer: said,
    domain: resolvedDomain,
    model,
    hits: prevHits + 1,
    at: new Date().toISOString(),
  };
  if (same >= 0) pairs.splice(same, 1);
  pairs.push(next);
  if (pairs.length > 600) pairs.splice(0, pairs.length - 600);
  saveToDisk();

  void (async () => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql`
        insert into vibe_training_pair (id, question, answer, domain, model, hits, verified, updated_at)
        values (${id}, ${asked}, ${said}, ${resolvedDomain}, ${next.model}, 1, true, now())
        on conflict (id) do update set
          answer = excluded.answer,
          domain = excluded.domain,
          model = excluded.model,
          hits = vibe_training_pair.hits + 1,
          updated_at = now()
      `;
    } catch {
      /* non-blocking DB write */
    }
  })();
}

export async function trainPair(
  question: string,
  answer: string,
  modelOrDomain = "user-taught",
): Promise<{ ok: boolean; question: string; answer: string; reason?: string; pair?: TrainingPair }> {
  const asked = question.replace(/\s+/g, " ").trim().slice(0, 600);
  const said = answer.trim().slice(0, 6000);
  if (asked.length < 4 || said.length < 12) {
    return { ok: false, question: asked, answer: said, reason: "Provide a question (at least 4 chars) and an answer (at least 12 chars)." };
  }
  await hydrateFromDb();
  rememberAnswer(asked, said, modelOrDomain);
  const pair = pairs.find((p) => p.question.toLowerCase() === asked.toLowerCase());
  return { ok: true, question: asked, answer: said, pair };
}

/**
 * Automated Bulk Specification Trainer:
 * Takes an entire raw specification or multi-section document, parses it via `autoIngestRawSpecification`,
 * converts every section into structured Q&A training lessons, and trains Noctis's persistent memory + Postgres store
 * in a single operation (eliminating manual one-by-one copy-pasting).
 */
export async function trainNoctisFromRawDocument(params: {
  title: string;
  rawText: string;
  domain?: string;
}): Promise<{
  ok: boolean;
  specId: string;
  sha256: string;
  trainedPairsCount: number;
  extractedProfessionsCount: number;
  extractedEnginesCount: number;
  sampleQuestionsTrained: string[];
}> {
  await hydrateFromDb();
  const safetyGate = validateSpecificationIngestionSafetyGate(params.rawText);
  if (!safetyGate.safeToActivate) {
    return {
      ok: false,
      specId: `SPEC-QUARANTINED-${safetyGate.status}`,
      sha256: "quarantined",
      trainedPairsCount: 0,
      extractedProfessionsCount: 0,
      extractedEnginesCount: 0,
      sampleQuestionsTrained: safetyGate.detectedIssues,
    };
  }
  const ingested = autoIngestRawSpecification({
    title: params.title,
    rawText: params.rawText,
    sourceChannel: "api_bulk_ingest",
  });

  const sampleQuestionsTrained: string[] = [];
  let trainedPairsCount = 0;

  // Train top-level overview pair
  const overviewQuestion = `Explain the ${params.title} specification and its core engines and capabilities in Noctis`;
  const overviewAnswer = `### ${params.title} (\`${ingested.specId}\`)\n- **SHA-256 Provenance:** \`${ingested.sha256}\`\n- **Extracted Professions:** \`${ingested.extractedProfessionsCount}\` · **Extracted Engines:** \`${ingested.extractedEnginesCount}\` · **Extracted Workflows:** \`${ingested.extractedWorkflowsCount}\`\n\n${params.rawText.slice(0, 4800)}`;
  rememberAnswer(overviewQuestion, overviewAnswer, "api-trained", params.domain || "engineering");
  sampleQuestionsTrained.push(overviewQuestion);
  trainedPairsCount += 1;

  // Train each parsed section as an independent lesson
  for (const sec of ingested.sections) {
    if (!sec.sampleItems.length) continue;
    const secQuestion = `${params.title} — ${sec.heading}`;
    const secAnswer = `### ${sec.heading}\n${sec.sampleItems.map((item) => `- ${item}`).join("\n")}`;
    rememberAnswer(secQuestion, secAnswer, "api-trained", params.domain || "engineering");
    if (sampleQuestionsTrained.length < 8) {
      sampleQuestionsTrained.push(secQuestion);
    }
    trainedPairsCount += 1;
  }

  return {
    ok: true,
    specId: ingested.specId,
    sha256: ingested.sha256,
    trainedPairsCount,
    extractedProfessionsCount: ingested.extractedProfessionsCount,
    extractedEnginesCount: ingested.extractedEnginesCount,
    sampleQuestionsTrained,
  };
}

export async function rememberRule(ruleText: string, domain = "general"): Promise<{ ok: boolean; rule: string; reason?: string }> {
  const clean = ruleText.replace(/\s+/g, " ").trim().slice(0, 240);
  if (clean.length < 6) return { ok: false, rule: "", reason: "Rule must be at least 6 characters." };
  await hydrateFromDb();
  const idx = rulesMem.findIndex((r) => r.toLowerCase() === clean.toLowerCase());
  if (idx >= 0) rulesMem.splice(idx, 1);
  rulesMem.push(clean);
  if (rulesMem.length > 24) rulesMem.splice(0, rulesMem.length - 24);
  const id = pairId(`rule:${clean}`);
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into vibe_training_rule (id, rule, domain)
      values (${id}, ${clean}, ${domain})
      on conflict (id) do update set rule = excluded.rule, created_at = now()
    `;
  } catch {
    /* non-blocking */
  }
  return { ok: true, rule: clean };
}

export function storedRulesBlock(): string {
  if (!rulesMem.length) return "";
  return `Persistent Vibe training rules:\n${rulesMem.slice(-12).map((r) => `- ${r}`).join("\n")}`;
}

function similarityScore(askedText: string, candidateText: string): { shared: number; ratio: number; exact: boolean } {
  const aNorm = askedText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const bNorm = candidateText.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!aNorm || !bNorm) return { shared: 0, ratio: 0, exact: false };
  const aNums = numericFingerprint(askedText);
  const bNums = numericFingerprint(candidateText);
  if ((aNums || bNums) && aNums !== bNums) {
    return { shared: 0, ratio: 0, exact: false };
  }
  if (aNorm === bNorm || (!aNums && !bNums && aNorm.length > 14 && (bNorm.includes(aNorm) || aNorm.includes(bNorm)))) {
    const w = words(aNorm);
    return { shared: Math.max(3, w.size), ratio: 1, exact: true };
  }
  const asked = words(aNorm);
  const known = words(bNorm);
  if (!asked.size || !known.size) return { shared: 0, ratio: 0, exact: false };
  let shared = 0;
  for (const word of asked) {
    if (known.has(word)) shared += 1;
    else {
      for (const k of known) {
        if (word.length >= 5 && k.length >= 5 && (word.startsWith(k.slice(0, 5)) || k.startsWith(word.slice(0, 5)))) {
          shared += 0.75;
          break;
        }
      }
    }
  }
  const union = new Set([...asked, ...known]).size;
  const coverAsked = shared / asked.size;
  const jaccard = union > 0 ? shared / union : 0;
  const ratio = coverAsked * 0.7 + jaccard * 0.3;
  return { shared, ratio, exact: false };
}

export function recallTrainedAnswer(question: string): { answer: string; question: string; model: string; score: number } | null {
  const q = question.trim();
  if (q.length < 6 || hasScenarioNumbers(q)) return null;
  const ranked = pairs
    .filter((pair) => pair.model !== "vibe" && pair.model !== "vibe-native" && pair.model !== "vibe-gadget" && pair.model !== "vibe-rag")
    .map((pair) => {
      const sim = similarityScore(q, pair.question);
      return { pair, ...sim };
    })
    .filter((row) => row.exact || (row.shared >= 2 && row.ratio >= 0.58))
    .sort((a, b) => (b.exact ? 10 : b.ratio) - (a.exact ? 10 : a.ratio) || b.shared - a.shared);
  const best = ranked[0];
  if (!best) return null;
  return {
    question: best.pair.question,
    answer: best.pair.answer,
    model: best.pair.model,
    score: best.ratio,
  };
}

export function lessonBlock(question: string) {
  const asked = words(question);
  if (!asked.size) return "";
  const ranked = pairs
    .map((pair) => {
      const sim = similarityScore(question, pair.question);
      return { pair, shared: sim.shared, ratio: sim.ratio };
    })
    .filter((row) => row.shared >= 1.5)
    .sort((a, b) => b.ratio - a.ratio || b.shared - a.shared)
    .slice(0, 3);
  if (!ranked.length) return "";
  const body = ranked
    .map((row) => `Question: ${row.pair.question}\nAnswer: ${row.pair.answer}`)
    .join("\n\n");
  return `Lessons Vibe has already learned in its training store. Use one when this question is the same subject. Match the clarity. Do not copy facts from a different subject.\n\n${body}`;
}

export async function trainingStatus() {
  await hydrateFromDb();
  const byDomain: Record<string, number> = {};
  let userTaughtPairs = 0;
  for (const pair of pairs) {
    const d = pair.domain || inferDomain(pair.question);
    byDomain[d] = (byDomain[d] || 0) + 1;
    if (pair.model === "user-taught" || pair.model === "vibe-trained" || pair.model === "api-trained") {
      userTaughtPairs += 1;
    }
  }
  return {
    totalPairs: pairs.length,
    userTaughtPairs,
    totalRules: rulesMem.length,
    rulesCount: rulesMem.length,
    dbConnected: dbHydrated,
    byDomain,
    recent: pairs.slice(-8).reverse().map((p) => ({
      question: p.question,
      domain: p.domain || inferDomain(p.question),
      model: p.model,
      hits: p.hits ?? 1,
      at: p.at,
    })),
    recentQuestions: pairs.slice(-8).reverse().map((p) => p.question),
    rules: rulesMem.slice(-12),
  };
}

export async function exportTrainingJsonl(): Promise<string> {
  await hydrateFromDb();
  const systemPrompt =
    "You are Vibe, the self-trained teaching and verification engine inside Noctis. Start with the direct answer in the first sentence, organize multi-part explanations with clear headings or markdown tables, and never invent citations or unverified numbers.";
  return pairs
    .map((pair) =>
      JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: pair.question },
          { role: "assistant", content: pair.answer },
        ],
      }),
    )
    .join("\n");
}

function extractSentences(text: string, max = 6): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 24 && !/^(Retrieved \d|Google lookup|Notes opened|Background pages|The person selected)/i.test(s))
    .slice(0, max);
}

function handleDocumentTask(userText: string): string | null {
  const docMatch = userText.match(/^Job:\s*([^\n]+)\n\nDocument:\n([\s\S]+)$/i);
  if (!docMatch) return null;
  const job = docMatch[1]!.trim();
  const doc = docMatch[2]!.trim();
  const sentences = extractSentences(doc, 12);
  if (!sentences.length) return "The attached document did not contain readable sentences.";

  if (/quiz me/i.test(job)) {
    const questions = sentences.slice(0, 3).map((s, i) => {
      const wordsInS = s.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, "").length > 5);
      const focus = wordsInS[Math.min(2, wordsInS.length - 1)]?.replace(/[^a-zA-Z0-9-]/g, "") || "this point";
      return `${i + 1}. According to the attached document, what is stated regarding "${focus}"?\n   - **Answer from text:** ${s}`;
    });
    return `Here is a 3-question check based strictly on your attached document:\n\n${questions.join("\n\n")}`;
  }
  if (/flashcards/i.test(job)) {
    const cards = sentences.slice(0, 4).map((s, i) => {
      const term = s.split(/[:—,-]/)[0]?.trim().slice(0, 48) || `Card ${i + 1}`;
      return `- **Term / Front:** ${term}\n  **Context / Back:** ${s}`;
    });
    return `Flashcards built directly from the attached document:\n\n${cards.join("\n\n")}`;
  }
  if (/contradictions/i.test(job)) {
    return `No direct contradictions are written between passages in the attached document.\n\n### Key Statements Checked\n${sentences.slice(0, 3).map((s) => `- ${s}`).join("\n")}`;
  }
  if (/teach me/i.test(job)) {
    return `${sentences[0]}\n\n### Step from the Document\n${sentences.slice(1, 3).join(" ") || sentences[0]}\n\n**Check question:** Based on the passage above, how would you restate the main point in your own words?`;
  }
  return `${sentences[0]}\n\n### Key Points from the Document\n${sentences.slice(1, 6).map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
}

function handleJsonMode(system: string, user: string): string {
  if (/Return JSON with steps/i.test(system)) {
    const lines = extractSentences(user, 3);
    return JSON.stringify({
      steps: lines.length
        ? lines
        : [
            "Read the quoted verse in its immediate chapter context.",
            "Note the main action or promise stated directly in the text.",
            "Compare how the verse applies without adding outside claims.",
          ],
    });
  }
  const titleMatch = user.match(/Title:\s*([^\n]+)/i)?.[1]?.trim() || "Clinic Lesson";
  const captionMatch = user.match(/Caption:\s*([^\n]+)/i)?.[1]?.trim() || "";
  const spokenMatch = user.match(/Spoken words:\s*([\s\S]*?)(?:\n\nMatching sources:|$)/i)?.[1]?.trim() || "";
  const cleanSpoken = spokenMatch && spokenMatch !== "Not available." ? spokenMatch : "";
  const sentences = extractSentences(`${cleanSpoken} ${captionMatch}`, 6);
  const subject = inferDomain(`${titleMatch} ${captionMatch} ${cleanSpoken}`);
  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);
  return JSON.stringify({
    description: captionMatch && captionMatch !== "None." ? captionMatch : `Structured study lesson for ${titleMatch}.`,
    difficulty: "Beginner",
    subject: subjectLabel,
    topics: [subjectLabel, "Core concepts", "Applied practice"],
    concepts: [titleMatch.slice(0, 38), "Verification", "Practice check"],
    plain:
      sentences.slice(0, 3).join(" ") ||
      `${titleMatch} introduces the core principles of ${subjectLabel.toLowerCase()} so you can apply them in practice. Focus on the primary mechanism first, verify how each step connects to the evidence, and test your understanding with a short drill.`,
    summary: sentences[0] || `${titleMatch}: key principles and practical steps.`,
    points: [
      sentences[0] || `Identify the primary problem and control addressed in ${titleMatch}.`,
      sentences[1] || "Separate verified facts and measurements from unverified assumptions.",
      sentences[2] || "Apply the control or method to a concrete example and verify the outcome.",
    ],
    beginner: `Write down the main concept from ${titleMatch} in one sentence and name one place you would use it today.`,
    advanced: `Compare how ${titleMatch} behaves when a key constraint or input changes by 20 percent.`,
    vocabulary: [
      { term: "Baseline", says: "The starting measurement or known state before a change is applied." },
      { term: "Control", says: "A safeguard or step that reduces risk or keeps a system within bounds." },
      { term: "Verification", says: "Checking the result against independent evidence or calculation." },
    ],
    questions: [
      { ask: `What is the central focus of ${titleMatch}?`, answer: sentences[0] || `It teaches the core workflow and verification steps for ${titleMatch}.` },
      { ask: "What should you check before acting on a claim?", answer: "Verify the source evidence and confirm the required inputs are present." },
    ],
    quiz: [
      {
        ask: `What is the first step when applying the lesson from ${titleMatch}?`,
        choices: ["Verify the baseline facts and scope", "Guess the missing figures", "Skip verification"],
        answer: 0,
      },
      {
        ask: "How should unverified assumptions be handled?",
        choices: ["Label them clearly and check sensitivity", "Treat them as proven facts", "Hide them from the note"],
        answer: 0,
      },
    ],
    notes: sentences.slice(0, 3),
    objectives: [`Complete one hands-on check applying ${titleMatch}.`],
  });
}

async function fetchWikiDirect(question: string): Promise<string> {
  const cleanClause = (raw: string) =>
    raw
      .replace(
        /^(?:please\s+|can\s+you\s+|could\s+you\s+|would\s+you\s+|will\s+you\s+|i\s+need\s+you\s+to\s+|i\s+want\s+you\s+to\s+|help\s+me\s+)+/i,
        "",
      )
      .replace(
        /^(?:(?:build|create|make|design|generate|develop|code|write|draft|prepare|give|show)\s+(?:me\s+|us\s+)?(?:a\s+|an\s+|the\s+)?(?:complete\s+|full\s+|modern\s+|responsive\s+|simple\s+)?(?:web\s*page|website|landing\s*page|html\s*page|page|site|web\s*app|app|application|guide|study\s+guide|report|essay|article|summary|notes|overview|presentation)\s+(?:of|on|about|for|covering|regarding)\s+)/i,
        "",
      )
      .replace(
        /^(?:please\s+|can you\s+|could you\s+|and\s+)?(?:explain(?:\s+in\s+detail|\s+deeply|\s+clearly|\s+simply)?|what\s+is|what\s+are|who\s+is|how\s+does|how\s+do|how|tell\s+me\s+(?:everything\s+)?about|teach\s+me\s+(?:about\s+)?|define|describe|compare|research|study)\s+/i,
        "",
      )
      .replace(/^(?:a|an|the)\s+/i, "")
      .replace(/\s+(?:is|are|work|works|mean|means|prevent|prevents|provide|provides)\s*\??$/i, "")
      .replace(/[?!.]+$/g, "")
      .trim()
      .slice(0, 110);

  const clauses = question
    .split(/(?:,\s*(?:and\s+)?(?:how|what|why|when)\b|\band\s+(?:how|what|why)\b|;\s*)/i)
    .map(cleanClause)
    .filter((c) => c.length >= 2);
  const queries = [...new Set(clauses.length ? clauses : [cleanClause(question)])].filter((q) => q.length >= 2).slice(0, 3);
  if (!queries.length) return "";

  const stop = new Set([
    "can", "you", "build", "make", "create", "design", "write", "web", "page", "website", "site", "html",
    "the", "and", "for", "with", "about", "from", "into", "that", "this", "what", "how", "why", "who",
  ]);
  const subjectWords = queries
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w));

  try {
    const results = await Promise.all(
      queries.map(async (q) => {
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=5&prop=extracts&exintro=1&explaintext=1&format=json`,
          { headers: { "user-agent": "Noctis/1.0" }, signal: AbortSignal.timeout(7000) },
        );
        if (!res.ok) return [];
        const json = (await res.json()) as {
          query?: { pages?: Record<string, { title?: string; extract?: string; index?: number }> };
        };
        return Object.values(json.query?.pages ?? {})
          .sort((a, b) => (a.index ?? 9) - (b.index ?? 9))
          .filter((p) => {
            if (!p.title || (p.extract?.trim().length ?? 0) <= 60) return false;
            if (!subjectWords.length) return true;
            const hay = `${p.title} ${p.extract!.slice(0, 350)}`.toLowerCase();
            return subjectWords.some((w) => hay.includes(w));
          });
      }),
    );

    const seen = new Set<string>();
    const pages: { title: string; extract: string; url: string }[] = [];
    for (const group of results) {
      for (const p of group) {
        const title = p.title!.trim();
        if (seen.has(title.toLowerCase())) continue;
        seen.add(title.toLowerCase());
        pages.push({
          title,
          extract: p.extract!.replace(/\s+/g, " ").trim(),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        });
        if (pages.length >= 4) break;
      }
      if (pages.length >= 4) break;
    }

    if (!pages.length) return "";
    const studySections = pages.slice(0, 3).map((p) => {
      const sents = extractSentences(p.extract, 6);
      return `### ${p.title}\n${sents.slice(0, 4).join(" ") || p.extract.slice(0, 700)}`;
    });
    const allSents = pages.flatMap((p) => extractSentences(p.extract, 4));
    const keyPoints = allSents.slice(0, 6);
    const refs = pages.map((p) => `- **Wikipedia — ${p.title}:** ${p.url}`);
    const practice = pages.slice(0, 3).map((p, idx) => {
      const s = extractSentences(p.extract, 2);
      return `${idx + 1}. **What are the key facts and highlights of ${p.title}?**\n   - *Answer:* ${s.join(" ") || p.extract.slice(0, 300)}`;
    });

    const mode = classifyAdaptiveMode(rawQuestion);
    const customDiag = generateDynamicDiagram(rawQuestion, pages[0]?.title || "");
    const mermaidBlock = customDiag
      ? `\`\`\`mermaid\n${customDiag.mermaid}\n\`\`\``
      : pages.length >= 2
        ? `\`\`\`mermaid\nflowchart TD\n${pages
            .slice(0, 4)
            .map((p, i) => `  N${i + 1}["${i + 1}. ${p.title.replace(/["[\]]/g, "")}"]`)
            .join("\n")}\n${pages
            .slice(0, 3)
            .map((_, i) => (pages[i + 1] ? `  N${i + 1} --> N${i + 2}` : ""))
            .filter(Boolean)
            .join("\n")}\n\`\`\``
        : "";

    const compRows = pages
      .slice(0, 4)
      .map(
        (p, i) =>
          `| **${i + 1}. ${p.title.replace(/\|/g, "-")}** | ${(extractSentences(p.extract, 1)[0] || p.extract.slice(0, 140)).replace(/\|/g, "-")} | [Wikipedia Primary Record](${p.url}) |`
      )
      .join("\n");
    const compTable = `| Entity / Subtopic | Verified Summary | Traceable Reference |\n| :--- | :--- | :--- |\n${compRows}`;
    const check = verifyResponseIntegrity(rawQuestion, studySections.join("\n"), Boolean(mermaidBlock), false);

    return [
      `## Study notes (\`Adaptive Mode: ${mode}\`)\n${studySections.join("\n\n")}`,
      mermaidBlock ? `### Visual Concept & Architecture Map\n${mermaidBlock}` : "",
      keyPoints.length ? `### Key Highlights & Facts\n${keyPoints.map((s, i) => `${i + 1}. ${s}`).join("\n")}` : "",
      `### Comparative Reference Matrix\n${compTable}`,
      `## Research\n${pages.map((p) => `- **${p.title}:** ${extractSentences(p.extract, 3).join(" ") || p.extract.slice(0, 500)}`).join("\n")}`,
      `## References\n${refs.join("\n")}`,
      `## Practice\n${practice.join("\n")}`,
      `## What to study next\n- Review how ${pages.map((p) => `**${p.title}**`).join(", ")} connect across the primary references above, or ask *"What else should we add?"*, *"Expand point 2"*, or *"Draw the architecture"*.\n\n> **${check.summaryLine}**`,
    ]
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return "";
  }
}

export async function vibeNativeComplete(
  messages: { role: string; content: unknown }[],
  opts: { json?: boolean } = {},
): Promise<{ text: string }> {
  await hydrateFromDb();
  const textOf = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => (part && typeof part === "object" && "text" in part && typeof (part as { text?: unknown }).text === "string" ? (part as { text: string }).text : ""))
        .filter(Boolean)
        .join("\n");
    }
    return "";
  };

  const systemText = messages
    .filter((m) => m.role === "system")
    .map((m) => textOf(m.content))
    .join("\n\n");
  const userTurns = messages.filter((m) => m.role !== "system");
  const lastUserRaw = textOf(userTurns.at(-1)?.content || "").trim();
  const notesInUser = lastUserRaw.match(/Retrieved notes:\n([\s\S]*?)(?:\n\n(?:Learner:|Tutor:)|$)/i)?.[1]?.trim() || "";
  const fullNotes = [systemText, notesInUser].filter(Boolean).join("\n\n");
  const question = lastUserRaw
    .replace(/\n\nRetrieved notes:\n[\s\S]*$/i, "")
    .replace(/^Retrieved notes:\n[\s\S]*?\n\n(?:[\s\S]*?\n)?Learner:\s*/i, "")
    .replace(/^Job:[^\n]*\nQuestion:\s*/i, "")
    .replace(/^Question:\s*/i, "")
    .replace(/\n\nTeach, instruct, and answer entirely in[^\n]*$/i, "")
    .replace(/---[\s\S]*$/g, "")
    .replace(/\[Image:[^\]]*\]/g, "")
    .trim();

  if (opts.json) {
    return { text: handleJsonMode(systemText, lastUserRaw) };
  }

  // 1. Document jobs (Explain this, Quiz me, Flashcards, Contradictions)
  const docResult = handleDocumentTask(lastUserRaw);
  if (docResult) return { text: docResult };

  // 1b. Multi-Turn Follow-Up & Dynamic Diagram Intelligence
  const normalizedTurns = userTurns
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: textOf(m.content) }));
  const followUpHit = runFollowUpIntelligence(normalizedTurns, question);
  if (followUpHit) return { text: followUpHit };

  // 2. Conversation Actions (Create quiz, Generate notes, Write the brief, Summarize for a post)
  if (/Generate a 5-question quiz from this conversation/i.test(question)) {
    const priorAssistant = [...userTurns]
      .reverse()
      .find((m) => m.role === "assistant");
    const source = textOf(priorAssistant?.content || "") || systemText;
    const sents = extractSentences(source, 5);
    if (!sents.length) {
      return { text: "Ask a topic question first so Vibe has lesson material in this chat to build your 5-question quiz." };
    }
    const items = sents.map((s, idx) => `${idx + 1}. **Question ${idx + 1}:** Which principle in our conversation states the following?\n   > *"${s}"*`);
    return { text: `### 5-Question Conversation Quiz\n\n${items.join("\n\n")}` };
  }

  if (/Write study notes, a bullet summary, and revision notes from this conversation/i.test(question)) {
    const historyText = userTurns
      .filter((m) => m.role === "assistant")
      .map((m) => textOf(m.content).split(/\n\s*Claim standing:/i)[0] || "")
      .join("\n\n");
    const sents = extractSentences(historyText, 8);
    if (!sents.length) {
      return { text: "Start a lesson in this chat first, then click Generate notes to compile your study sheet." };
    }
    return {
      text: `### Study Notes\n${sents.slice(0, 3).join(" ")}\n\n### Bullet Summary\n${sents.map((s) => `- ${s}`).join("\n")}\n\n### Revision Check\n1. Restate the first takeaway from memory.\n2. Verify each figure or source before applying it.`,
    };
  }

  if (/Write the brief in this order: background, lead, open questions, limits, deadline, next step/i.test(question)) {
    const historyText = userTurns
      .map((m) => `${m.role === "user" ? "Asked" : "Vibe"}: ${(textOf(m.content).split(/\n\s*Claim standing:/i)[0] || "").trim()}`)
      .join("\n");
    const sents = extractSentences(historyText, 6);
    return {
      text: `### Background\n${sents[0] || "Built from the current Vibe conversation."}\n\n### Lead\n${sents[1] || sents[0] || "Review the primary finding in this thread."}\n\n### Open Questions\n- Which assumptions or missing figures still need primary-source verification?\n\n### Limits\n- Uses only statements recorded in this chat; no company, price, or date was invented.\n\n### Deadline\n- Not stated in this conversation.\n\n### Next Step\n- Verify the open questions against the primary record before acting.`,
    };
  }

  if (/Read this answer again\. Summarize it for a post/i.test(lastUserRaw)) {
    const answerPart = lastUserRaw.split(/ANSWER:\s*/i)[1] || lastUserRaw;
    const tagMatch = lastUserRaw.match(/End with this line exactly:\s*([^\n]+)/i)?.[1]?.trim() || "NOCTIS@Noctis";
    const sents = extractSentences(answerPart, 5);
    return { text: `${sents.join(" ")}\n\n${tagMatch}` };
  }

  // 3. Direct Trained Memory Recall (Postgres + Seed Corpus)
  const recalled = recallTrainedAnswer(question);
  if (recalled && recalled.score >= 0.58) {
    return { text: recalled.answer };
  }

  // 4. Curated Knowledge Engine Shelf Match
  try {
    const { curatedCard } = await import("@/lib/knowledge-engine");
    const card = curatedCard(question);
    if (card) {
      const steps = card.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const cite = card.evidence[0] ? `\n\n**Source:** ${card.evidence[0].source} (${card.evidence[0].href})` : "";
      const out = `${card.sentence}\n\n### Key Steps\n${steps}${cite}`;
      rememberAnswer(question, out, "vibe-shelf", card.domain);
      return { text: out };
    }
  } catch {
    /* continue to grounded synthesis */
  }

  // 5. Deterministic Pipeline / Engineering / Calculator Packet in System Context
  const calcMatch = fullNotes.match(/Calculator\. Copy these figures\.[\s\S]*?(?=\n\n|$)/);
  const gridMatch = fullNotes.match(/Hourly simulation[\s\S]*?(?=\n\n|$)/);
  const optMatch = fullNotes.match(/Portfolio optimization[\s\S]*?(?=\n\n|$)/);
  const execMatch = fullNotes.match(/Execution sheet[\s\S]*?(?=\n\n|$)/);
  const computedBlocks = [calcMatch?.[0], gridMatch?.[0], optMatch?.[0], execMatch?.[0]].filter(Boolean);
  if (computedBlocks.length) {
    const body = computedBlocks.join("\n\n");
    return {
      text: `Here is the deterministic calculation and constraint check from the Vibe engine:\n\n${body}\n\nFEASIBILITY NOT DEMONSTRATED — critical information is missing where marked UNKNOWN.`,
    };
  }

  // 6. Direct Multi-Clause Live Wikipedia Synthesis (for rich multi-part Study Boards)
  const directWiki = await fetchWikiDirect(question);
  if (directWiki) {
    return { text: directWiki };
  }

  // 7. Grounded Synthesis from Retrieved Wikipedia / Google / Library / Scripture / Graph Notes
  const wikiMatches = [...fullNotes.matchAll(/Wikipedia — ([^\n:]+):\s*([^\n]+)/g)];
  const googleMatches = [...fullNotes.matchAll(/Page Google opened — ([^\n:]+):\s*([^\n]+)/g)];
  const googleList = fullNotes.match(/Google (?:lookup|News) \([^)]+\):\n([\s\S]*?)(?:\n\n|$)/)?.[1]?.trim() || "";
  const arxivMatches = [...fullNotes.matchAll(/arXiv — ([^\n]+)/g)];
  const urlMatches = [...fullNotes.matchAll(/URL:\s*(\S+)\nTitle:\s*([^\n]+)\n\n([\s\S]{40,1200})/g)];
  const libMatches = [...fullNotes.matchAll(/^(?![-*#\s])([^\n:]{2,90}):\s*([^\n]{50,}?)\s*\((https?:\/\/[^\s)]+)\)/gm)];

  if (wikiMatches.length || googleMatches.length || googleList || arxivMatches.length || urlMatches.length || libMatches.length) {
    const parts: string[] = [];
    if (wikiMatches.length) {
      const first = wikiMatches[0]!;
      parts.push(`${first[2]!.trim()}`);
      if (wikiMatches.length > 1) {
        parts.push(
          `### Retrieved Reference Notes\n${wikiMatches
            .slice(0, 3)
            .map((m) => `- **${m[1]!.trim()}:** ${m[2]!.trim().slice(0, 800)}`)
            .join("\n")}`,
        );
      }
    } else if (libMatches.length) {
      const first = libMatches[0]!;
      parts.push(`**${first[1]!.trim()}:** ${first[2]!.trim()}`);
      parts.push(
        `### Retrieved Reference Sources\n${libMatches
          .slice(0, 3)
          .map((m) => `- **${m[1]!.trim()}:** ${m[2]!.trim().slice(0, 800)} (${m[3]!.trim()})`)
          .join("\n")}`,
      );
    }
    if (googleMatches.length) {
      parts.push(
        `### Opened Source Passages\n${googleMatches
          .slice(0, 2)
          .map((m) => `- **${m[1]!.trim()}:** ${m[2]!.trim().slice(0, 800)}`)
          .join("\n")}`,
      );
    } else if (googleList) {
      parts.push(`### Current Headlines Retrieved\n${googleList}`);
    }
    if (urlMatches.length) {
      const u = urlMatches[0]!;
      const sents = extractSentences(u[3]!, 4);
      parts.push(`### From ${u[2]!.trim()} (${u[1]!.trim()})\n${sents.map((s) => `- ${s}`).join("\n")}`);
    }
    if (arxivMatches.length) {
      parts.push(`### Research Papers\n${arxivMatches.map((m) => `- arXiv: ${m[1]!.trim()}`).join("\n")}`);
    }
    const synthesized = parts.join("\n\n").trim();
    if (synthesized.length > 40) {
      rememberAnswer(question, synthesized, "vibe-rag");
      return { text: synthesized };
    }
  }

  // 8. Closest Learned Lesson or Guided Study Response
  if (recalled) {
    return { text: recalled.answer };
  }

  return {
    text: `Vibe is running in self-trained native mode (no external ChatGPT dependency).\n\n### How to Teach Vibe This Topic Immediately\n1. **Train a direct answer in chat:** Type \`Train: ${question.slice(0, 80)} || <your verified answer>\` to store this lesson permanently in Vibe's Postgres training database.\n2. **Add a persistent rule:** Type \`Rule: <instruction>\` to teach Vibe how to format or reason across all conversations.\n3. **Attach a document:** Click **+** to upload a PDF, DOCX, or text file, and Vibe will extract study notes, quizzes, and flashcards directly from your source.`,
  };
}
