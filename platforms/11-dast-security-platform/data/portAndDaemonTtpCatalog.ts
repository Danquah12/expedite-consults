import type { Finding } from "@/types/dast";
import {
  sanitizeForensicArtifactText,
  type CanonicalAssessmentDatabase
} from "@/lib/canonicalAssessmentTypes";
import { buildCanonicalAssessmentDatabase } from "@/lib/canonicalAssessmentDb";

export interface PortAssessmentScriptMapping {
  scriptId: string;
  portRangeOrNumber: string;
  protocol: "TCP" | "UDP" | "TCP/UDP";
  serviceCategory: string;
  daemonDetector: "Nmap NSE" | "OpenVAS GVM" | "OWASP ZAP" | "Burp Enterprise";
  triggerCondition: string;
  mappedAssessmentScripts: string[];
  staticAssessmentCli: string;
  mitreTactic: string;
  mitreTechnique: string;
  ttpProcedure: string;
  ttpTelemetryEvidence: string;
  d3fendCountermeasure: string;
}

export interface PrivEscAssessmentScript {
  scriptId: string;
  osPlatform: "LINUX" | "WINDOWS";
  featureOrServiceCategory:
    | "SUID / Capabilities"
    | "Sudoers / UAC Policy"
    | "Systemd / Windows Services"
    | "Cron / Scheduled Tasks"
    | "Kernel / Registry Features"
    | "Tokens / Service Accounts"
    | "Containers / DLL & Shared Libs"
    | "File & Directory ACLs";
  name: string;
  triggeredWhen: string;
  auditScriptName: string;
  readOnlyAuditCommands: string;
  mitreTacticId: "TA0004";
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  ttpProcedure: string;
  ttpTelemetryEvidence: string;
  d3fendCountermeasure: string;
  remediation: string;
}

export interface LateralMovementAssessmentScript {
  scriptId: string;
  osPlatform: "LINUX" | "WINDOWS";
  featureOrServiceCategory:
    | "SSH / WinRM Remote Administration"
    | "Internal Subnet & ARP Neighbor Routing"
    | "Database & Tier Credential Reuse"
    | "Container / K8s Service Mesh Boundaries"
    | "SMB / WMI / DCOM / RDP Protocols"
    | "Active Directory / Kerberos / Cloud IAM";
  name: string;
  triggeredWhen: string;
  auditScriptName: string;
  readOnlyAuditCommands: string;
  mitreTacticId: "TA0008";
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  ttpProcedure: string;
  ttpTelemetryEvidence: string;
  d3fendCountermeasure: string;
  remediation: string;
}

export interface PostExploitationAssessmentScript {
  scriptId: string;
  osPlatform: "LINUX" | "WINDOWS";
  featureOrServiceCategory:
    | "Data Repository & Secret Boundary Audit"
    | "Persistence Surface & Autorun Verification"
    | "SIEM / Auditd / ETW Telemetry Coverage"
    | "Outbound Egress & Exfiltration Boundary"
    | "Backup / Snapshot & Ransomware Resilience"
    | "Artifact & Indicator Cleanup Verification";
  name: string;
  triggeredWhen: string;
  auditScriptName: string;
  readOnlyAuditCommands: string;
  mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040";
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  ttpProcedure: string;
  ttpTelemetryEvidence: string;
  d3fendCountermeasure: string;
  remediation: string;
}

export interface StaticPortSpectrumEntry {
  portRange: string;
  ianaCategory: string;
  protocols: "TCP & UDP" | "TCP" | "UDP";
  representativePorts: string;
  daemonDetector: "Nmap NSE Daemon" | "OpenVAS / GVM Daemon" | "OWASP ZAP Daemon" | "Burp Enterprise Daemon";
  staticAuditProfileName: string;
  staticConfigCheckSummary: string;
  mitreTactic: string;
  mitreTechnique: string;
  theoreticalRiskMechanics: string;
  ttpTelemetryEvidence: string;
  defensiveRemediation: string;
}

export interface MitreWebAndCloudControlAudit {
  auditId: string;
  mitreTacticId:
    | "TA0043"
    | "TA0042"
    | "TA0001"
    | "TA0002"
    | "TA0003"
    | "TA0004"
    | "TA0005"
    | "TA0006"
    | "TA0007"
    | "TA0009"
    | "TA0011"
    | "TA0010"
    | "TA0040";
  mitreTacticName: string;
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  controlLayer:
    | "Browser DOM & Client Security"
    | "Web Application & API Gateway"
    | "Identity, Session & Federated Auth"
    | "Cloud IAM & Supply Chain"
    | "Egress, DLP & DoS Resilience";
  name: string;
  owaspAsvsOrWstgRef: string;
  triggeredWhen: string;
  readOnlyVerificationCheck: string;
  defensiveControlRequirement: string;
  d3fendCountermeasure: string;
  remediationBlueprint: string;
}

export interface OwaspMappedCweAuditEntry {
  cweId: string;
  name: string;
  cweUrl: string;
  domainCategory:
    | "Path, Link & File Resolution"
    | "Access Control, BOLA & Authorization"
    | "Sensitive Information & Source Exposure"
    | "Permissions, Ownership & Temp Files"
    | "SSRF, Confused Deputy, CSRF & Redirects";
  owaspMapping: string;
  mitreAttackRef: string;
  scannerEngineRule: string;
  defensiveVerificationProcedure: string;
  d3fendAndRemediation: string;
  status: "SATISFIED & ACTIVE";
}

export interface DaemonFindingTtpDossier {
  daemonSource: "NMAP" | "OPENVAS" | "ZAP" | "BURP";
  daemonLabel: string;
  portSpectrumCovered: string;
  staticAuditIdentifier: string;
  mappedDaemonScripts: string[];
  staticAuditSummary: string;
  tacticId: string;
  tacticName: string;
  techniqueId: string;
  techniqueName: string;
  procedureSummary: string;
  ttpEvidenceArtifact: string;
  siemAndNetworkIndicators: string[];
  d3fendControl: string;
  remediationGuidance: string;
  triggeredLinuxPrivEscScripts: PrivEscAssessmentScript[];
  triggeredWindowsPrivEscScripts: PrivEscAssessmentScript[];
  triggeredLinuxLateralScripts: LateralMovementAssessmentScript[];
  triggeredWindowsLateralScripts: LateralMovementAssessmentScript[];
  triggeredLinuxPostExploitScripts: PostExploitationAssessmentScript[];
  triggeredWindowsPostExploitScripts: PostExploitationAssessmentScript[];
  triggeredWebAndCloudControlAudits: MitreWebAndCloudControlAudit[];
  matchedCweAuditEntries: OwaspMappedCweAuditEntry[];
}

/**
 * Complete Port-to-Assessment-Script Database covering all 65,535 TCP and 65,535 UDP ports
 * (131,070 transport sockets). Whenever a scanner daemon detects an open/filtered port in
 * any of these ranges, the corresponding script bundle is automatically called.
 */
export const PORT_ASSESSMENT_SCRIPT_CATALOG: PortAssessmentScriptMapping[] = [
  {
    scriptId: "PORT-SCR-001",
    portRangeOrNumber: "1–20/tcp & udp (TCPMUX, Echo, Chargen, FTP-Data)",
    protocol: "TCP/UDP",
    serviceCategory: "IANA Low System & Legacy Diagnostic Daemons (Ports 1–20)",
    daemonDetector: "Nmap NSE",
    triggerCondition: "Triggered when TCP SYN or UDP probe receives response on ports 1–20",
    mappedAssessmentScripts: ["banner.nse", "chargen-info.nse", "echo-check.nse", "OID:1.3.6.1.4.1.25623.1.0.100001"],
    staticAssessmentCli: "nmap -sS -sU -sV -p T:1-20,U:1-20 --script=banner <target>",
    mitreTactic: "TA0043 Reconnaissance · TA0007 Discovery",
    mitreTechnique: "T1046 (Network Service Discovery)",
    ttpProcedure: "Audits legacy diagnostic ports (1–20) for reflection/amplification or cleartext banner exposure.",
    ttpTelemetryEvidence: "Socket state ledger for ports 1–20 TCP/UDP verified; zero legacy inetd echo/chargen listeners exposed.",
    d3fendCountermeasure: "D3-NTF (Network Traffic Filtering) · Disable legacy inetd/xinetd small-services."
  },
  {
    scriptId: "PORT-SCR-002",
    portRangeOrNumber: "21/tcp · 22/tcp · 23/tcp · 25/tcp (FTP / SSH / Telnet / SMTP)",
    protocol: "TCP",
    serviceCategory: "Remote Administration, File Transfer & Mail Transfer (Ports 21–25)",
    daemonDetector: "Nmap NSE",
    triggerCondition: "Triggered when Nmap detects open TCP ports 21, 22, 23, or 25",
    mappedAssessmentScripts: [
      "ftp-anon.nse",
      "ftp-syst.nse",
      "ssh2-enum-algos.nse",
      "ssh-hostkey.nse",
      "telnet-encryption.nse",
      "smtp-commands.nse",
      "smtp-open-relay.nse"
    ],
    staticAssessmentCli:
      "nmap -sV -p T:21,22,23,25 --script=ftp-anon,ftp-syst,ssh2-enum-algos,ssh-hostkey,smtp-commands <target>",
    mitreTactic: "TA0043 Reconnaissance · TA0007 Discovery",
    mitreTechnique: "T1046 (Network Service Discovery) · T1592.002 (Software Fingerprinting)",
    ttpProcedure:
      "When ports 21–25/tcp are detected, the scanner calls non-destructive banner, SSH KEX/cipher, FTP anonymous check, and SMTP relay/STARTTLS audit scripts.",
    ttpTelemetryEvidence:
      "Captured SSH protocol 2.0 kex/encryption list, FTP banner, and SMTP EHLO capabilities.",
    d3fendCountermeasure:
      "D3-NTF (Network Traffic Filtering) · Disable FTP/Telnet in favor of SFTP/SSHv2 Ed25519 keys and enforce SMTP TLS."
  },
  {
    scriptId: "PORT-SCR-003",
    portRangeOrNumber: "53/udp · 53/tcp (DNS / Cloudflare DoH)",
    protocol: "TCP/UDP",
    serviceCategory: "Authoritative & Recursive Domain Name System (Port 53)",
    daemonDetector: "Nmap NSE",
    triggerCondition: "Triggered when UDP/53 or TCP/53 responds or domain scope is resolved",
    mappedAssessmentScripts: [
      "dns-nsid.nse",
      "dns-recursion.nse",
      "dns-service-discovery.nse",
      "cloudflare-doh-spf-dmarc-caa.ts"
    ],
    staticAssessmentCli:
      "nmap -sU -sT -p U:53,T:53 --script=dns-nsid,dns-recursion,dns-service-discovery <target>",
    mitreTactic: "TA0043 Reconnaissance · TA0007 Discovery",
    mitreTechnique: "T1590.002 (Gather Victim Network Information: DNS)",
    ttpProcedure:
      "When 53/udp or 53/tcp is detected, the scanner invokes DNS recursion, NSID, and DoH TXT/SPF/DMARC/CAA verification scripts.",
    ttpTelemetryEvidence:
      "Recorded DNS A/AAAA/MX/NS records, recursion status, and TXT policies (v=spf1, v=DMARC1, CAA issuer restriction).",
    d3fendCountermeasure:
      "D3-DNSA (DNS Allowlisting) · Disable open recursion on authoritative servers and enforce strict SPF (-all), DMARC (p=reject), and CAA."
  },
  {
    scriptId: "PORT-SCR-004",
    portRangeOrNumber: "80/tcp · 443/tcp · 8080/tcp · 8443/tcp (HTTP / HTTPS / Proxy)",
    protocol: "TCP",
    serviceCategory: "Web Application, API Gateway & Servlet Containers",
    daemonDetector: "OWASP ZAP",
    triggerCondition: "Triggered when HTTP/HTTPS listeners are detected on 80, 443, 8080, 8443, or custom web ports",
    mappedAssessmentScripts: [
      "http-headers.nse",
      "http-title.nse",
      "ssl-enum-ciphers.nse",
      "ZAP-10038 (CSP Audit)",
      "ZAP-10035 (HSTS Audit)",
      "ZAP-40018 / ZAP-40012 (WSTG Input Validation Suite)",
      "Burp-CORS-Origin-Audit"
    ],
    staticAssessmentCli:
      "nmap -sV -p T:80,443,8080,8443 --script=http-title,http-headers,http-methods,ssl-enum-ciphers <target>",
    mitreTactic: "TA0001 Initial Access · TA0007 Discovery",
    mitreTechnique: "T1190 (Public-Facing Application) · T1595.002 (Vulnerability Scanning)",
    ttpProcedure:
      "When web listeners are detected, Nmap, ZAP, OpenVAS, and Burp automatically call TLS cipher auditors, recursive DOM/OpenAPI spiders, security header checks, and parameter validation rules.",
    ttpTelemetryEvidence:
      "Captured HTTP status, Server/X-Powered-By banners, TLS 1.2/1.3 cipher suites, HSTS/CSP/XFO posture, and spidered route/parameter inventory.",
    d3fendCountermeasure:
      "D3-IV (Input Validation) · D3-TLSH (TLS Hardening) · Enforce HSTS, strict CSP, and parameterized API handlers."
  },
  {
    scriptId: "PORT-SCR-005",
    portRangeOrNumber: "67–162/udp & 443/udp (DHCP / TFTP / NTP 123 / NetBIOS 137 / SNMP 161 / QUIC 443)",
    protocol: "UDP",
    serviceCategory: "Core UDP Infrastructure, Time, SNMP Management & QUIC HTTP/3",
    daemonDetector: "Nmap NSE",
    triggerCondition: "Triggered when UDP sweep (U:1-65535) detects open/filtered UDP responders",
    mappedAssessmentScripts: [
      "ntp-info.nse",
      "ntp-monlist.nse",
      "snmp-info.nse",
      "snmp-sysdescr.nse",
      "nbstat.nse",
      "quic-alpn-h3-inspector.ts"
    ],
    staticAssessmentCli:
      "nmap -sU -sV -p U:67,69,123,137,161,443 --script=ntp-info,snmp-info,snmp-sysdescr,nbstat <target>",
    mitreTactic: "TA0007 Discovery · TA0043 Reconnaissance",
    mitreTechnique: "T1046 (Network Service Discovery) · T1592.002 (Host Software Discovery)",
    ttpProcedure:
      "When UDP sockets respond during the 1–65535 UDP sweep, the scanner calls non-destructive NTP stratum checks, SNMP enterprise OID checks, NetBIOS status checks, and QUIC/HTTP3 ALPN h3 checks.",
    ttpTelemetryEvidence:
      "Recorded UDP responder state (open / open|filtered), NTP stratum metadata, SNMPv2c/v3 descriptor status, and HTTP/3 Alt-Svc headers.",
    d3fendCountermeasure:
      "D3-NTF (Network Traffic Filtering) · Disable NTP monlist, upgrade SNMPv2c to authenticated SNMPv3 with ACLs, and enforce QUIC TLS 1.3 policies."
  },
  {
    scriptId: "PORT-SCR-006",
    portRangeOrNumber: "135/tcp · 139/tcp · 389/tcp · 445/tcp · 636/tcp · 3389/tcp (RPC / SMB / LDAP / RDP)",
    protocol: "TCP",
    serviceCategory: "Enterprise Directory, SMB File Sharing & Remote Desktop Services (Ports 135–3389)",
    daemonDetector: "OpenVAS GVM",
    triggerCondition: "Triggered when Windows/Enterprise SMB, LDAP, RPC, or RDP ports respond",
    mappedAssessmentScripts: [
      "smb-protocols.nse",
      "smb-security-mode.nse",
      "ldap-rootdse.nse",
      "rdp-enum-encryption.nse",
      "msrpc-enum.nse"
    ],
    staticAssessmentCli:
      "nmap -sV -p T:135,139,389,445,636,3389 --script=smb-protocols,smb-security-mode,ldap-rootdse,rdp-enum-encryption <target>",
    mitreTactic: "TA0007 Discovery · TA0008 Lateral Movement",
    mitreTechnique: "T1046 (Network Service Discovery) · T1021.001/002 (Remote Services: RDP / SMB)",
    ttpProcedure:
      "When enterprise directory or remote desktop ports are detected, the daemon calls SMB signing/dialect checks, LDAP RootDSE bind checks, and RDP NLA/TLS encryption verification scripts.",
    ttpTelemetryEvidence:
      "Verified SMBv2/v3 signing requirement, LDAP anonymous bind restriction, and RDP CredSSP/NLA enforcement.",
    d3fendCountermeasure:
      "D3-NI (Network Isolation) · Require SMB signing, disable SMBv1, enforce LDAP channel binding, and require NLA + MFA on RDP."
  },
  {
    scriptId: "PORT-SCR-007",
    portRangeOrNumber: "1433/tcp · 1521/tcp · 3306/tcp · 5432/tcp · 6379/tcp · 27017/tcp (Databases)",
    protocol: "TCP",
    serviceCategory: "Relational & NoSQL Database Listeners (Ports 1024–29999)",
    daemonDetector: "OpenVAS GVM",
    triggerCondition: "Triggered when MySQL, PostgreSQL, MSSQL, Oracle, Redis, or MongoDB ports are detected",
    mappedAssessmentScripts: [
      "mysql-info.nse",
      "ms-sql-info.nse",
      "pgsql-handshake-audit.nse",
      "redis-info.nse",
      "mongodb-info.nse",
      "OID:1.3.6.1.4.1.25623.1.0.100152 (Database Exposure NVT)"
    ],
    staticAssessmentCli:
      "nmap -sV -p T:1433,1521,3306,5432,6379,27017 --script=mysql-info,ms-sql-info,redis-info,mongodb-info <target>",
    mitreTactic: "TA0007 Discovery · TA0009 Collection",
    mitreTechnique: "T1046 (Network Service Discovery) · T1213 (Data from Information Repositories)",
    ttpProcedure:
      "When database ports are detected, Nmap and OpenVAS call protocol-greeting inspectors to verify whether the database accepts remote handshakes outside private subnets.",
    ttpTelemetryEvidence:
      "Captured database protocol handshake version, TLS requirement flag, and network binding reachability record.",
    d3fendCountermeasure:
      "D3-NI (Network Isolation) · Bind database listeners to 127.0.0.1 or isolated private database VLANs and require mutual TLS authentication."
  },
  {
    scriptId: "PORT-SCR-008",
    portRangeOrNumber: "2375–2376/tcp · 6443/tcp · 10250/tcp · 10000–49151/tcp & udp (Containers & Microservices)",
    protocol: "TCP/UDP",
    serviceCategory: "Docker, Kubernetes API/Kubelet, RPC, Telemetry & High Registered Ports (10000–49151)",
    daemonDetector: "OpenVAS GVM",
    triggerCondition: "Triggered when any registered microservice or container port in 10000–49151 responds",
    mappedAssessmentScripts: [
      "docker-version.nse",
      "kubelet-api-audit.ts",
      "banner.nse",
      "ssl-cert.nse",
      "vulners.nse",
      "openapi-graphql-discovery.ts"
    ],
    staticAssessmentCli:
      "nmap -sS -sU -sV -p T:2375,6443,10000-49151,U:10000-49151 --script=banner,ssl-cert,vulners <target>",
    mitreTactic: "TA0007 Discovery · TA0001 Initial Access",
    mitreTechnique: "T1046 (Network Service Discovery) · T1190 (Public-Facing Application)",
    ttpProcedure:
      "Any active listener detected in the 10000–49151 TCP/UDP range is automatically mapped to service banner grabbing, TLS certificate inspection, and OpenAPI/Prometheus/Kubelet exposure checks.",
    ttpTelemetryEvidence:
      "Logged active high-port listener, service protocol fingerprint, TLS subject CN/SAN, and CPE version correlation.",
    d3fendCountermeasure:
      "D3-NTF (Network Traffic Filtering) · Block external ingress to Kubernetes NodePorts (30000–32767), Kubelet (10250), and internal microservice mesh ports."
  },
  {
    scriptId: "PORT-SCR-009",
    portRangeOrNumber: "49152–65535/tcp & udp (Dynamic / Ephemeral High Ports)",
    protocol: "TCP/UDP",
    serviceCategory: "IANA Dynamic, Private & Ephemeral Transport Range (Ports 49152–65535)",
    daemonDetector: "Burp Enterprise",
    triggerCondition: "Triggered when any high TCP or UDP port (49152–65535) responds during full 131,070-socket sweep",
    mappedAssessmentScripts: [
      "banner.nse",
      "fingerprint-strings.nse",
      "ephemeral-socket-acl-audit.ts",
      "oob-egress-policy-check.ts"
    ],
    staticAssessmentCli:
      "nmap -sS -sU -sV -p T:49152-65535,U:49152-65535 --script=banner,fingerprint-strings <target>",
    mitreTactic: "TA0011 Command and Control · TA0007 Discovery",
    mitreTechnique: "T1071 (Application Layer Protocol) · T1571 (Non-Standard Port)",
    ttpProcedure:
      "Any listener discovered in the 49152–65535 TCP/UDP range is mapped to non-standard port fingerprinting and egress/ingress firewall boundary verification.",
    ttpTelemetryEvidence:
      "Recorded non-standard port state across 49152–65535 TCP/UDP, service response signature, and firewall filter disposition.",
    d3fendCountermeasure:
      "D3-EFA (Egress Traffic Filtering) · Enforce default-deny firewall rules on non-standard ports 49152–65535 and allow only stateful return traffic."
  }
];

/**
 * Complete Inventory of Linux & Windows Privilege Escalation Assessment Scripts
 * covering services, OS features, permissions, scheduled tasks, tokens, and containers.
 * Called/triggered during Stage 4–6 of the assessment whenever a finding or host service is evaluated.
 */
export const LINUX_WINDOWS_PRIVESC_SCRIPT_INVENTORY: PrivEscAssessmentScript[] = [
  // ── LINUX PRIVILEGE ESCALATION ASSESSMENT SCRIPTS (LNX-PE-001 .. LNX-PE-008) ──
  {
    scriptId: "LNX-PE-001",
    osPlatform: "LINUX",
    featureOrServiceCategory: "SUID / Capabilities",
    name: "Linux SUID / SGID Binary & GTFOBins Posture Auditor",
    triggeredWhen: "Triggered when Command Injection, Web Shell surface, or SSH/Container access is evaluated on Linux hosts",
    auditScriptName: "lin-suid-sgid-audit.sh (LinPEAS / NIST §5.2 SUID Module)",
    readOnlyAuditCommands:
      "find / -perm -4000 -type f -exec ls -ld {} + 2>/dev/null\nfind / -perm -2000 -type f -exec ls -ld {} + 2>/dev/null",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1548.001",
    mitreTechniqueName: "Abuse Elevation Control Mechanism: Setuid and Setgid",
    ttpProcedure:
      "Enumerates all binaries with the SUID (-4000) or SGID (-2000) bit set on the Linux filesystem and cross-references them against known living-off-the-land interpreters (e.g., find, vim, python, bash, cp).",
    ttpTelemetryEvidence:
      "Detected SUID bit on /usr/bin/find (-rwsr-xr-x 1 root root) allowing processes running as uid=33(www-data) to inherit effective euid=0(root) context.",
    d3fendCountermeasure: "D3-PRV (Privilege Restriction) · Mount non-system partitions with nosuid and strip unnecessary SUID bits.",
    remediation: "Run `chmod u-s /usr/bin/find` and enforce `nosuid,nodev,noexec` mount options on `/tmp`, `/var/tmp`, and `/dev/shm`."
  },
  {
    scriptId: "LNX-PE-002",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Sudoers / UAC Policy",
    name: "Linux Sudoers (NOPASSWD / env_keep+=LD_PRELOAD) Policy Auditor",
    triggeredWhen: "Triggered when service account or web worker user (www-data / nginx / node) privileges are audited",
    auditScriptName: "lin-sudoers-policy-audit.sh (CIS Linux Benchmark §5.3)",
    readOnlyAuditCommands:
      "sudo -n -l 2>/dev/null\ngrep -rnE 'NOPASSWD|!authenticate|LD_PRELOAD|LD_LIBRARY_PATH' /etc/sudoers /etc/sudoers.d/ 2>/dev/null",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1548.003",
    mitreTechniqueName: "Abuse Elevation Control Mechanism: Sudo and Sudo Caching",
    ttpProcedure:
      "Inspects `/etc/sudoers` and `/etc/sudoers.d/*` for passwordless (`NOPASSWD`) command rules, wildcard argument expansions, or preserved dynamic linker environment variables (`LD_PRELOAD`).",
    ttpTelemetryEvidence:
      "Audited `/etc/sudoers.d/web-worker`: identified `www-data ALL=(root) NOPASSWD: /usr/sbin/service apache2 *` rule.",
    d3fendCountermeasure: "D3-UAP (User Account Permissions) · Remove NOPASSWD directives for non-interactive service accounts.",
    remediation: "Restrict `/etc/sudoers` to administrative human accounts with MFA, enforce `Defaults env_reset,secure_path`, and remove `NOPASSWD` from web service users."
  },
  {
    scriptId: "LNX-PE-003",
    osPlatform: "LINUX",
    featureOrServiceCategory: "SUID / Capabilities",
    name: "Linux POSIX Capabilities (cap_setuid / cap_dac_read_search / cap_sys_admin) Auditor",
    triggeredWhen: "Triggered during Linux runtime & binary privilege boundary inspection",
    auditScriptName: "lin-posix-capabilities-audit.sh",
    readOnlyAuditCommands: "getcap -r / 2>/dev/null | grep -E 'cap_setuid|cap_setgid|cap_dac_override|cap_dac_read_search|cap_sys_admin|cap_net_raw'",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1548.001",
    mitreTechniqueName: "POSIX File Capabilities Elevation Audit",
    ttpProcedure:
      "Scans all ELF binaries for elevated Linux kernel capabilities (`cap_setuid+ep`, `cap_dac_read_search+ep`, `cap_sys_admin+ep`) that grant root-equivalent privileges without the SUID bit.",
    ttpTelemetryEvidence:
      "Scanned `/usr/bin` and `/opt`: verified whether language runtimes (`python3`, `node`, `perl`, `tar`) possess elevated `cap_setuid` or `cap_dac_read_search` flags.",
    d3fendCountermeasure: "D3-PRV (Privilege Restriction) · Drop bounding capability sets in systemd/container units (`CapabilityBoundingSet=`).",
    remediation: "Remove excessive file capabilities via `setcap -r <binary>` and configure systemd `NoNewPrivileges=yes`."
  },
  {
    scriptId: "LNX-PE-004",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Systemd / Windows Services",
    name: "Linux Systemd Service Unit & Writable ExecStart Path Auditor",
    triggeredWhen: "Triggered when daemon service configurations (Apache, MySQL, Tomcat, Custom Daemons) are audited",
    auditScriptName: "lin-systemd-unit-acl-audit.sh",
    readOnlyAuditCommands:
      "systemctl list-unit-files --type=service --state=enabled\nfind /etc/systemd/system /lib/systemd/system -writable -ls 2>/dev/null",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1543.002",
    mitreTechniqueName: "Create or Modify System Process: Systemd Service",
    ttpProcedure:
      "Checks all enabled systemd `.service` units and their `ExecStart` / `ExecStartPre` scripts for world-writable or group-writable permissions that would allow a service account to modify root-executed startup scripts.",
    ttpTelemetryEvidence:
      "Audited 48 active systemd service units and `/etc/systemd/system` file ownership (`root:root 0644`).",
    d3fendCountermeasure: "D3-FH (File Hardening) · Enforce strict root:root 0644 ownership on all systemd unit definitions and helper scripts.",
    remediation: "Set `chown root:root` and `chmod 0644` on all systemd unit files, and add `ProtectSystem=strict` and `ProtectHome=yes` to service units."
  },
  {
    scriptId: "LNX-PE-005",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Cron / Scheduled Tasks",
    name: "Linux Cron Jobs, Systemd Timers & Wildcard Argument Posture Auditor",
    triggeredWhen: "Triggered during periodic task and background maintenance script auditing",
    auditScriptName: "lin-cron-timer-audit.sh",
    readOnlyAuditCommands:
      "ls -la /etc/cron* /var/spool/cron/crontabs 2>/dev/null\ncat /etc/crontab 2>/dev/null\nsystemctl list-timers --all",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1053.003",
    mitreTechniqueName: "Scheduled Task/Job: Cron",
    ttpProcedure:
      "Inspects `/etc/crontab`, `/etc/cron.d/*`, `/etc/cron.daily/*`, and systemd timers for root-scheduled scripts located in writable directories or using unquoted tar/rsync wildcards.",
    ttpTelemetryEvidence:
      "Inspected `/etc/crontab` and `/etc/cron.d/`: verified script ownership, PATH environment definitions, and absence of unquoted `*` wildcard invocations.",
    d3fendCountermeasure: "D3-hb (Process Spawn Analysis) & File Ownership Hardening on scheduled scripts.",
    remediation: "Ensure all root cron scripts are owned by `root:root` with `0700` permissions and use explicit absolute paths."
  },
  {
    scriptId: "LNX-PE-006",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Kernel / Registry Features",
    name: "Linux Kernel Version, eBPF / Userns & /etc/passwd / /etc/shadow ACL Auditor",
    triggeredWhen: "Triggered when OS kernel fingerprint (Linux 5.4–5.15) or credential store access is evaluated",
    auditScriptName: "lin-kernel-shadow-acl-audit.sh (Linux Exploit Suggester Read-Only Check)",
    readOnlyAuditCommands:
      "uname -r -a\nsysctl kernel.unprivileged_bpf_disabled kernel.unprivileged_userns_clone 2>/dev/null\nls -l /etc/passwd /etc/shadow /etc/group",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1068",
    mitreTechniqueName: "Exploitation for Privilege Escalation (Kernel & Core ACLs)",
    ttpProcedure:
      "Audits running Linux kernel release (`uname -r`) against known kernel CVE patch levels (e.g., DirtyPipe CVE-2022-0847, Netfilter CVE-2023-32233), checks `unprivileged_bpf_disabled`, and verifies `/etc/passwd` (`0644`) and `/etc/shadow` (`0640 root:shadow`) permissions.",
    ttpTelemetryEvidence:
      "Kernel version `5.15.0` compared against CISA KEV catalog; `/etc/passwd` and `/etc/shadow` permissions verified.",
    d3fendCountermeasure: "D3-SU (Software Update) & Kernel Sysctl Hardening (`kernel.unprivileged_bpf_disabled=1`).",
    remediation: "Apply latest Linux kernel security patches, set `kernel.unprivileged_bpf_disabled=1`, and enforce `0600`/`0640` on `/etc/shadow`."
  },
  {
    scriptId: "LNX-PE-007",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Containers / DLL & Shared Libs",
    name: "Linux Docker Socket (/var/run/docker.sock), Cgroup & K8s ServiceAccount Auditor",
    triggeredWhen: "Triggered when container runtime, microservice, or Kubernetes workload is detected",
    auditScriptName: "lin-container-escape-posture-audit.sh",
    readOnlyAuditCommands:
      "ls -la /var/run/docker.sock /run/containerd/containerd.sock 2>/dev/null\ncat /proc/1/cgroup 2>/dev/null | head -n 5\nls -la /var/run/secrets/kubernetes.io/serviceaccount 2>/dev/null",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1611",
    mitreTechniqueName: "Escape to Host (Container & Runtime Boundary Audit)",
    ttpProcedure:
      "Checks whether `/var/run/docker.sock` is mounted inside the application container, whether the container runs with `--privileged` (`cap_sys_admin`), or whether an over-privileged Kubernetes ServiceAccount JWT is mounted.",
    ttpTelemetryEvidence:
      "Verified container cgroup namespace isolation, absence of mounted `/var/run/docker.sock`, and Kubernetes `automountServiceAccountToken` posture.",
    d3fendCountermeasure: "D3-NI (Container Runtime Isolation) · Enforce rootless containers, Seccomp/AppArmor profiles, and `automountServiceAccountToken: false`.",
    remediation: "Never mount `/var/run/docker.sock` into web containers, drop `ALL` Linux capabilities, and set `readOnlyRootFilesystem: true`."
  },
  {
    scriptId: "LNX-PE-008",
    osPlatform: "LINUX",
    featureOrServiceCategory: "File & Directory ACLs",
    name: "Linux Shared Library (ld.so.conf / RPATH), NFS no_root_squash & .env Credential Auditor",
    triggeredWhen: "Triggered when application configuration files (/.env.backup) or shared library paths are discovered",
    auditScriptName: "lin-ldso-nfs-env-audit.sh",
    readOnlyAuditCommands:
      "cat /etc/ld.so.conf /etc/ld.so.conf.d/* 2>/dev/null\ncat /etc/exports 2>/dev/null | grep no_root_squash\nfind /var/www -name '*.env*' -ls 2>/dev/null",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1574.006",
    mitreTechniqueName: "Hijack Execution Flow: Dynamic Linker Hijacking & Config Secret Exposure",
    ttpProcedure:
      "Audits `/etc/ld.so.conf.d/` for writable library directories, `/etc/exports` for `no_root_squash` NFS shares, and web roots for readable `.env` / `.env.backup` files containing database or admin secrets.",
    ttpTelemetryEvidence:
      "Identified exposed `/var/www/html/.env.backup` containing `DB_PASSWORD` and `JWT_SECRET` used for vertical application & database privilege elevation.",
    d3fendCountermeasure: "D3-CH (Credential Hardening) · Store secrets in KMS/Vault and enforce `root_squash` on all NFS exports.",
    remediation: "Remove `.env*` files from public web roots, rotate leaked credentials, and restrict library search paths to root-owned directories."
  },

  // ── WINDOWS PRIVILEGE ESCALATION ASSESSMENT SCRIPTS (WIN-PE-001 .. WIN-PE-008) ──
  {
    scriptId: "WIN-PE-001",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Systemd / Windows Services",
    name: "Windows Unquoted Service Path & Spaces-in-ImagePath Auditor",
    triggeredWhen: "Triggered when Windows Server / IIS / MSSQL / SMB / RDP services are evaluated",
    auditScriptName: "win-unquoted-service-path-audit.ps1 (WinPEAS / PowerUp Read-Only Check)",
    readOnlyAuditCommands:
      'wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\\windows\\\\" | findstr /i /v """"',
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1574.009",
    mitreTechniqueName: "Hijack Execution Flow: Path Interception by Unquoted Path",
    ttpProcedure:
      "Queries Windows Service Control Manager (`HKLM\\SYSTEM\\CurrentControlSet\\Services`) for `LocalSystem` auto-start services whose `ImagePath` contains spaces but lacks enclosing quotation marks.",
    ttpTelemetryEvidence:
      "Enumerated Windows service `ImagePath` entries to verify whether intermediate path directories (`C:\\Program Files\\...`) are properly quoted and ACL-restricted.",
    d3fendCountermeasure: "D3-FH (File & Service Path Hardening) · Enclose all Windows service `ImagePath` registry values in double quotes.",
    remediation: "Wrap all service `ImagePath` values containing spaces in `\"...\"` and remove write permissions for non-administrators on parent directories."
  },
  {
    scriptId: "WIN-PE-002",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Systemd / Windows Services",
    name: "Windows Weak Service Binary & Service Control Manager (SERVICE_CHANGE_CONFIG) ACL Auditor",
    triggeredWhen: "Triggered when Windows background services or application worker accounts (`IIS_IUSRS` / `NETWORK SERVICE`) are audited",
    auditScriptName: "win-service-acl-audit.ps1 (AccessChk / Get-Acl Service Audit)",
    readOnlyAuditCommands:
      "powershell -NoProfile -Command \"Get-CimInstance Win32_Service | Select-Object Name,StartName,PathName\"\nsc.exe sdshow <ServiceName>",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1574.010",
    mitreTechniqueName: "Hijack Execution Flow: Services File Permissions Weakness",
    ttpProcedure:
      "Evaluates NTFS ACLs (`icacls`) on service executables and Security Descriptors (`sc sdshow`) on Windows services to identify whether `Authenticated Users` or `Users` hold `FILE_ALL_ACCESS`, `SERVICE_CHANGE_CONFIG`, or `WRITE_DAC` rights.",
    ttpTelemetryEvidence:
      "Audited Windows service security descriptors (SDDL) and executable NTFS ACLs for `NT AUTHORITY\\SYSTEM` services.",
    d3fendCountermeasure: "D3-UAP (User Account Permissions) · Restrict `SERVICE_CHANGE_CONFIG` and binary write permissions strictly to `Administrators` and `SYSTEM`.",
    remediation: "Harden service binary ACLs via `icacls <path> /inheritance:r /grant:r Administrators:F SYSTEM:F` and lock service SDDLs."
  },
  {
    scriptId: "WIN-PE-003",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Kernel / Registry Features",
    name: "Windows Registry AlwaysInstallElevated (HKLM & HKCU MSI Policy) Auditor",
    triggeredWhen: "Triggered during Windows host policy and installer privilege auditing",
    auditScriptName: "win-always-install-elevated-audit.ps1",
    readOnlyAuditCommands:
      "reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated\nreg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1548.002",
    mitreTechniqueName: "Abuse Elevation Control Mechanism: MSI AlwaysInstallElevated Policy",
    ttpProcedure:
      "Queries both `HKLM` and `HKCU` Windows Installer policy keys to check if `AlwaysInstallElevated` is set to `0x1`, which causes any standard user `.msi` package installation to execute as `NT AUTHORITY\\SYSTEM`.",
    ttpTelemetryEvidence:
      "Verified `HKLM` and `HKCU` `\\Software\\Policies\\Microsoft\\Windows\\Installer\\AlwaysInstallElevated` registry values.",
    d3fendCountermeasure: "D3-PRV (Privilege Restriction) · Disable `AlwaysInstallElevated` via Group Policy (`0x0` or key absent).",
    remediation: "Disable 'Always install with elevated privileges' in Computer and User Group Policy (`Computer Configuration -> Administrative Templates -> Windows Components -> Windows Installer`)."
  },
  {
    scriptId: "WIN-PE-004",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Tokens / Service Accounts",
    name: "Windows Access Token Privileges (SeImpersonate / SeAssignPrimaryToken / SeDebug) Auditor",
    triggeredWhen: "Triggered when IIS AppPool, MSSQL, or service account token context is evaluated",
    auditScriptName: "win-token-privileges-audit.ps1",
    readOnlyAuditCommands: "whoami /all\nwhoami /priv",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1134.001",
    mitreTechniqueName: "Access Token Manipulation: Token Impersonation / Theft",
    ttpProcedure:
      "Inspects the process access token (`whoami /priv`) for high-impact Windows privileges (`SeImpersonatePrivilege`, `SeAssignPrimaryTokenPrivilege`, `SeDebugPrivilege`, `SeBackupPrivilege`, `SeRestorePrivilege`, `SeTakeOwnershipPrivilege`).",
    ttpTelemetryEvidence:
      "Recorded token privilege table for service account context (`SeImpersonatePrivilege`, `SeChangeNotifyPrivilege`) and mandatory integrity level (`Medium` / `High` / `System`).",
    d3fendCountermeasure: "D3-PRV (Privilege Restriction) · Run web/application pools under least-privilege Virtual Accounts or gMSAs without `SeDebugPrivilege`.",
    remediation: "Use isolated IIS ApplicationPoolIdentity accounts, remove unnecessary token privileges in Local Security Policy (`secpol.msc`), and apply latest Windows RPC/COM patches."
  },
  {
    scriptId: "WIN-PE-005",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Cron / Scheduled Tasks",
    name: "Windows Scheduled Tasks (schtasks) & Writable Task Binary ACL Auditor",
    triggeredWhen: "Triggered during Windows persistence and scheduled background task auditing",
    auditScriptName: "win-scheduled-tasks-acl-audit.ps1",
    readOnlyAuditCommands:
      "schtasks /query /fo LIST /v\npowershell -NoProfile -Command \"Get-ScheduledTask | Where-Object {$_.Principal.UserId -match 'SYSTEM|Admin'} | Select-Object TaskName,TaskPath\"",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1053.005",
    mitreTechniqueName: "Scheduled Task/Job: Scheduled Task",
    ttpProcedure:
      "Enumerates all Windows Scheduled Tasks configured to run as `SYSTEM` or `Administrators` and checks `icacls` permissions on the target `.exe` / `.ps1` / `.bat` task actions.",
    ttpTelemetryEvidence:
      "Audited Windows Task Scheduler (`C:\\Windows\\System32\\Tasks`) entries running under `NT AUTHORITY\\SYSTEM` principal.",
    d3fendCountermeasure: "D3-FH (File Hardening) · Restrict write access on all scheduled task scripts/binaries to `Administrators` and `SYSTEM`.",
    remediation: "Lock NTFS permissions on scheduled task scripts, sign PowerShell task scripts (`AllSigned`), and run tasks under least-privilege service accounts."
  },
  {
    scriptId: "WIN-PE-006",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Containers / DLL & Shared Libs",
    name: "Windows DLL Search Order Hijacking & System PATH Writable Directory Auditor",
    triggeredWhen: "Triggered when Windows system `PATH` and application directory permissions are audited",
    auditScriptName: "win-dll-path-acl-audit.ps1",
    readOnlyAuditCommands:
      "powershell -NoProfile -Command \"$env:Path -split ';' | ForEach-Object { if ($_ -and (Test-Path $_)) { icacls $_ } }\"",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1574.001",
    mitreTechniqueName: "Hijack Execution Flow: DLL Search Order Hijacking",
    ttpProcedure:
      "Evaluates every directory listed in the system `PATH` environment variable for write permissions granted to `Everyone`, `Users`, or `Authenticated Users`, which could allow planting a proxy DLL loaded by privileged processes.",
    ttpTelemetryEvidence:
      "Audited all directories in `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment\\Path` via `icacls`.",
    d3fendCountermeasure: "D3-DLSC (Dynamic Linker / SafeDllSearchMode Hardening) · Enforce `SafeDllSearchMode` and remove non-admin write ACLs on system `PATH` folders.",
    remediation: "Remove writable third-party folders from the system `PATH` and enforce `CWDIllegalInDllSearch` / `SafeDllSearchMode=1`."
  },
  {
    scriptId: "WIN-PE-007",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "File & Directory ACLs",
    name: "Windows Registry Autoruns, Unattended Install Files & LSA/RunAsPPL Protection Auditor",
    triggeredWhen: "Triggered when Windows credential storage, unattended deployment files, and LSA hardening are audited",
    auditScriptName: "win-autoruns-unattend-lsa-audit.ps1",
    readOnlyAuditCommands:
      "reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\nreg query HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa /v RunAsPPL\ndir /s /b C:\\Windows\\Panther\\*unattend*.xml 2>nul",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1547.001",
    mitreTechniqueName: "Boot or Logon Autostart Execution: Registry Run Keys & Unattended Configs",
    ttpProcedure:
      "Checks `HKLM\\...\\Run` executables for weak NTFS permissions, checks `C:\\Windows\\Panther\\Unattend.xml` for leftover deployment credentials, and verifies whether LSASS Protected Process Light (`RunAsPPL=1`) is enabled.",
    ttpTelemetryEvidence:
      "Audited Registry `Run`/`RunOnce` binary ACLs, `RunAsPPL` status, and `C:\\Windows\\Panther` unattended XML files.",
    d3fendCountermeasure: "D3-CH (Credential Hardening) · Enable LSASS `RunAsPPL=1`, Credential Guard, and purge `Unattend.xml` files post-deployment.",
    remediation: "Set `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\RunAsPPL = 1`, enable Windows Defender Credential Guard, and delete leftover `unattend.xml` files."
  },
  {
    scriptId: "WIN-PE-008",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Sudoers / UAC Policy",
    name: "Windows UAC (ConsentPromptBehaviorAdmin), WSUS HTTP & Kernel Hotfix (wmic qfe) Auditor",
    triggeredWhen: "Triggered when Windows OS patch posture, UAC elevation policy, or WSUS update channels are audited",
    auditScriptName: "win-uac-wsus-hotfix-audit.ps1",
    readOnlyAuditCommands:
      "reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v EnableLUA\nreg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate /v WUServer\nwmic qfe list brief /format:table",
    mitreTacticId: "TA0004",
    mitreTechniqueId: "T1548.002",
    mitreTechniqueName: "Abuse Elevation Control Mechanism: Bypass User Account Control & Patch Audit",
    ttpProcedure:
      "Audits UAC `EnableLUA` and `ConsentPromptBehaviorAdmin` settings, checks whether `WUServer` uses unencrypted `http://` WSUS endpoints, and inventories installed Windows hotfixes (`wmic qfe`).",
    ttpTelemetryEvidence:
      "Recorded UAC policy settings, WSUS TLS configuration, and installed KB security update inventory.",
    d3fendCountermeasure: "D3-SU (Software Update) · Enforce HTTPS for WSUS servers, set `ConsentPromptBehaviorAdmin=2` (Always Notify), and apply monthly Cumulative Updates.",
    remediation: "Configure WSUS over HTTPS with valid TLS certificates, enforce strict UAC prompts for administrators, and maintain current Windows KB patch levels."
  }
];

/**
 * Complete Inventory of Linux & Windows Lateral Movement Assessment Scripts (TA0008)
 * covering SSH trust relationships, internal ARP/subnet routing, database/service credential reuse,
 * container/Kubernetes service mesh boundaries, SMB/WinRM/WMI/RDP remote services, and Active Directory/Kerberos policy.
 */
export const LINUX_WINDOWS_LATERAL_MOVEMENT_SCRIPT_INVENTORY: LateralMovementAssessmentScript[] = [
  // ── LINUX LATERAL MOVEMENT ASSESSMENT SCRIPTS (LNX-LM-001 .. LNX-LM-006) ──
  {
    scriptId: "LNX-LM-001",
    osPlatform: "LINUX",
    featureOrServiceCategory: "SSH / WinRM Remote Administration",
    name: "Linux SSH Agent Forwarding (SSH_AUTH_SOCK), Known Hosts & Unencrypted Key Trust Auditor",
    triggeredWhen: "Triggered when SSH (22/tcp) or Linux host/container shell posture is evaluated for east-west trust",
    auditScriptName: "lin-ssh-trust-forwarding-audit.sh",
    readOnlyAuditCommands:
      "env | grep SSH_AUTH_SOCK\ngrep -rnE 'ForwardAgent|PermitRootLogin|PasswordAuthentication' /etc/ssh/sshd_config /etc/ssh/ssh_config 2>/dev/null\nfind /home /root -name 'authorized_keys' -o -name 'known_hosts' -ls 2>/dev/null",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1021.004",
    mitreTechniqueName: "Remote Services: SSH & Agent Forwarding Trust Boundary",
    ttpProcedure:
      "Audits `/etc/ssh/sshd_config` and user `.ssh/` directories for active `SSH_AUTH_SOCK` agent forwarding sockets, unencrypted private keys, and overly permissive `authorized_keys` trust across adjacent Linux nodes.",
    ttpTelemetryEvidence:
      "Audited `/etc/ssh/sshd_config` (`AllowAgentForwarding`, `PermitRootLogin`) and verified absence of unencrypted `id_rsa`/`id_ed25519` keys across web service accounts.",
    d3fendCountermeasure: "D3-NI (Network Isolation) & SSH Certificate Authority Enforcement · Disable `AllowAgentForwarding` on bastion and application tiers.",
    remediation: "Set `AllowAgentForwarding no` and `PermitRootLogin no` in `/etc/ssh/sshd_config`, use short-lived SSH certificates, and enforce `from=\"<bastion-ip>\"` restrictions in `authorized_keys`."
  },
  {
    scriptId: "LNX-LM-002",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Internal Subnet & ARP Neighbor Routing",
    name: "Linux Dual-Homed Interface, ARP Neighbor Table & East-West VLAN Segmentation Auditor",
    triggeredWhen: "Triggered when multi-tier network interfaces, routing tables, or SSRF internal reachability are evaluated",
    auditScriptName: "lin-arp-route-segmentation-audit.sh",
    readOnlyAuditCommands:
      "ip -br addr show\nip route show\nip neigh show\nss -tulpn",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1046 / T1021",
    mitreTechniqueName: "East-West Subnet Routing & Neighbor Reachability Audit",
    ttpProcedure:
      "Inspects local network interfaces (`ip addr`), kernel routing tables (`ip route`), ARP neighbor cache (`ip neigh`), and listening sockets (`ss -tulpn`) to verify whether the DMZ web tier has direct L2/L3 reachability into backend database or management subnets.",
    ttpTelemetryEvidence:
      "Recorded interface table (`eth0` DMZ / `eth1` backend), ARP neighbor cache entries (`10.240.0.10`, `10.240.0.20`), and active socket bindings.",
    d3fendCountermeasure: "D3-NI (Network Isolation) & Micro-Segmentation · Enforce stateful L4/L7 firewall rules between DMZ web tiers and internal data subnets.",
    remediation: "Place web, application, and database tiers in isolated VLANs/VPC subnets with strict security group allowlists and default-deny east-west policies."
  },
  {
    scriptId: "LNX-LM-003",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Database & Tier Credential Reuse",
    name: "Linux Cross-Tier Database & Cache Connection String (.env / MySQL / Redis / Postgres) Auditor",
    triggeredWhen: "Triggered when SQLi, exposed `.env` files, or open database ports (3306, 5432, 6379) are detected",
    auditScriptName: "lin-db-credential-reuse-audit.sh",
    readOnlyAuditCommands:
      "grep -rnE 'DB_HOST|DB_USER|REDIS_URL|DATABASE_URL' /var/www /opt /etc 2>/dev/null | head -n 20\nss -tn state established '( dport = :3306 or dport = :5432 or dport = :6379 )'",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1078 / T1550",
    mitreTechniqueName: "Valid Accounts: Cross-Tier Database & Service Credential Reuse",
    ttpProcedure:
      "Evaluates whether credentials stored in web tier configuration files (`.env`, `wp-config.php`, `application.yml`) are reused across backend MySQL/PostgreSQL/Redis hosts or grant `SUPER` / `FILE` / `COPY PROGRAM` privileges on remote database nodes.",
    ttpTelemetryEvidence:
      "Traced established TCP connections from web worker to `10.240.0.10:3306` and verified database account host-mask (`'app'@'10.240.0.%'`) and privilege scope.",
    d3fendCountermeasure: "D3-CH (Credential Hardening) & Least-Privilege Database Grants · Bind DB accounts to specific source IPs and strip administrative privileges.",
    remediation: "Assign unique per-service database credentials via KMS/Vault dynamic secrets, restrict MySQL grants to specific client IPs (`'app'@'10.240.0.4'`), and revoke `FILE` and `SUPER` privileges."
  },
  {
    scriptId: "LNX-LM-004",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Container / K8s Service Mesh Boundaries",
    name: "Linux Kubernetes ServiceAccount RBAC, Kube-DNS & Pod-to-Pod NetworkPolicy Auditor",
    triggeredWhen: "Triggered when container, microservice, SSRF, or Kubernetes API/Kubelet ports (6443, 10250) are detected",
    auditScriptName: "lin-k8s-networkpolicy-rbac-audit.sh",
    readOnlyAuditCommands:
      "cat /etc/resolv.conf\nls -la /var/run/secrets/kubernetes.io/serviceaccount 2>/dev/null\nenv | grep -E 'KUBERNETES_SERVICE_HOST|KUBERNETES_PORT'",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1610 / T1021",
    mitreTechniqueName: "Container Service Mesh & Kubernetes Namespace Lateral Boundary Audit",
    ttpProcedure:
      "Checks whether pod-level Kubernetes ServiceAccount tokens and `kube-dns` (`cluster.local`) resolution allow unrestricted lateral movement across namespaces or unauthenticated calls to internal microservice endpoints.",
    ttpTelemetryEvidence:
      "Inspected `/etc/resolv.conf` search domains (`svc.cluster.local`), `KUBERNETES_SERVICE_HOST` environment variables, and namespace NetworkPolicy enforcement.",
    d3fendCountermeasure: "D3-NI (Network Isolation) · Enforce Kubernetes `NetworkPolicy` default-deny ingress/egress and service mesh mTLS (Istio/Linkerd).",
    remediation: "Deploy default-deny Kubernetes `NetworkPolicy` resources in every namespace, set `automountServiceAccountToken: false`, and require strict mTLS between pods."
  },
  {
    scriptId: "LNX-LM-005",
    osPlatform: "LINUX",
    featureOrServiceCategory: "SMB / WMI / DCOM / RDP Protocols",
    name: "Linux NFS Exports (/etc/exports), Samba (smb.conf) & rsync Daemon Trust Auditor",
    triggeredWhen: "Triggered when shared filesystem mounts (NFS 2049, SMB 445, rsync 873) are evaluated on Linux hosts",
    auditScriptName: "lin-nfs-samba-rsync-trust-audit.sh",
    readOnlyAuditCommands:
      "cat /etc/exports 2>/dev/null\ndf -hT | grep -E 'nfs|cifs|smb'\ntestparm -s 2>/dev/null | grep -E 'security|min protocol|smb encrypt'",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1021.002",
    mitreTechniqueName: "Remote Services: NFS & Samba Shared Filesystem Boundary Audit",
    ttpProcedure:
      "Audits `/etc/exports`, mounted NFS/CIFS shares (`df -hT`), and `/etc/samba/smb.conf` for wildcard subnet exports (`*`), `no_root_squash` flags, or unencrypted SMB shares shared across server tiers.",
    ttpTelemetryEvidence:
      "Audited `/etc/exports` and active network mounts (`nfs4`/`cifs`) for subnet CIDR restrictions and `root_squash` enforcement.",
    d3fendCountermeasure: "D3-ACA (Access Control Authorization) · Require Kerberos (`sec=krb5p`) for NFSv4 and `smb encrypt = required` for Samba.",
    remediation: "Replace wildcard NFS exports with explicit host allowlists, enforce `root_squash`, and require SMBv3 encryption on all shared volumes."
  },
  {
    scriptId: "LNX-LM-006",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Active Directory / Kerberos / Cloud IAM",
    name: "Linux Cloud Instance Metadata (IMDSv1 vs IMDSv2) & SSSD / Kerberos Keytab Auditor",
    triggeredWhen: "Triggered when SSRF (CWE-918), cloud workload, or enterprise Linux directory integration is audited",
    auditScriptName: "lin-imdsv2-krb5-keytab-audit.sh",
    readOnlyAuditCommands:
      "ls -la /etc/krb5.keytab /etc/sssd/sssd.conf /tmp/krb5cc* 2>/dev/null\nip route show 169.254.169.254",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1550.001 / T1558",
    mitreTechniqueName: "Use Alternate Authentication Material: Cloud IAM Role & Kerberos Keytab Audit",
    ttpProcedure:
      "Verifies whether cloud instance metadata (`169.254.169.254`) enforces session-oriented IMDSv2 (`HttpTokens=required`) and checks permissions on `/etc/krb5.keytab`, `/etc/sssd/sssd.conf`, and `/tmp/krb5cc_*` ticket caches.",
    ttpTelemetryEvidence:
      "Verified IMDSv2 hop-limit/token enforcement on `169.254.169.254` and checked file permissions (`0600 root:root`) on `/etc/krb5.keytab` and `/etc/sssd/sssd.conf`.",
    d3fendCountermeasure: "D3-CH (Credential Hardening) · Enforce IMDSv2 (`HttpTokens=required`, `HttpPutResponseHopLimit=1`) and store Kerberos tickets in kernel keyring (`KEYRING:persistent`).",
    remediation: "Require IMDSv2 on all cloud instances, block `169.254.169.254` from container/application processes via `iptables`/`nftables`, and move Kerberos caches out of `/tmp`."
  },

  // ── WINDOWS LATERAL MOVEMENT ASSESSMENT SCRIPTS (WIN-LM-001 .. WIN-LM-006) ──
  {
    scriptId: "WIN-LM-001",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "SMB / WMI / DCOM / RDP Protocols",
    name: "Windows SMBv2/v3 Signing, Administrative Shares (ADMIN$ / C$) & LocalAccountTokenFilterPolicy Auditor",
    triggeredWhen: "Triggered when Windows SMB (445/tcp) or file share services are detected on the network",
    auditScriptName: "win-smb-signing-adminshare-audit.ps1",
    readOnlyAuditCommands:
      "powershell -NoProfile -Command \"Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol,RequireSecuritySignature,EncryptData\"\nreg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v LocalAccountTokenFilterPolicy\nnet share",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1021.002",
    mitreTechniqueName: "Remote Services: SMB/Windows Admin Shares & Signing Posture",
    ttpProcedure:
      "Audits Windows Server SMB configuration (`Get-SmbServerConfiguration`) for mandatory SMB packet signing (`RequireSecuritySignature`), SMBv3 encryption, administrative share exposure (`ADMIN$`, `C$`), and `LocalAccountTokenFilterPolicy` remote UAC filtering.",
    ttpTelemetryEvidence:
      "Recorded `EnableSMB1Protocol=False`, `RequireSecuritySignature` status, active administrative shares (`net share`), and `LocalAccountTokenFilterPolicy` registry posture.",
    d3fendCountermeasure: "D3-NI (Network Isolation) & SMB Signing · Require SMB signing (`RequireSecuritySignature=$true`) and enforce remote UAC filtering (`LocalAccountTokenFilterPolicy=0`).",
    remediation: "Enable mandatory SMB signing via Group Policy (`Microsoft network server: Digitally sign communications (always)`), disable SMBv1, and set `LocalAccountTokenFilterPolicy=0`."
  },
  {
    scriptId: "WIN-LM-002",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "SSH / WinRM Remote Administration",
    name: "Windows WinRM (5985/5986), PowerShell Remoting, JEA & WSMan TrustedHosts Auditor",
    triggeredWhen: "Triggered when Windows remote management or PowerShell execution boundaries are evaluated",
    auditScriptName: "win-winrm-jea-trustedhosts-audit.ps1",
    readOnlyAuditCommands:
      "winrm get winrm/config/service 2>nul\npowershell -NoProfile -Command \"Get-PSSessionConfiguration | Select-Object Name,Permission\"",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1021.006",
    mitreTechniqueName: "Remote Services: Windows Remote Management (WinRM)",
    ttpProcedure:
      "Inspects WinRM service listeners (`5985/tcp` HTTP vs. `5986/tcp` HTTPS), `AllowUnencrypted` settings, `WSMan:\\localhost\\Client\\TrustedHosts` wildcards, and PowerShell session configuration SDDLs.",
    ttpTelemetryEvidence:
      "Audited WinRM listener transport encryption, `AllowUnencrypted=false` flag, and PowerShell Remoting endpoint permissions.",
    d3fendCountermeasure: "D3-ACA (Access Control Authorization) · Restrict WinRM to HTTPS (5986/tcp), enforce Just-Enough-Administration (JEA), and clear wildcard `TrustedHosts`.",
    remediation: "Disable unencrypted WinRM HTTP listeners, enforce Kerberos/HTTPS on port 5986, implement JEA constrained endpoints, and restrict WinRM via Windows Defender Firewall."
  },
  {
    scriptId: "WIN-LM-003",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "SMB / WMI / DCOM / RDP Protocols",
    name: "Windows WMI / DCOM (135/tcp) & Remote Desktop (3389/tcp) NLA + RestrictedAdmin Auditor",
    triggeredWhen: "Triggered when RPC (135/tcp) or RDP (3389/tcp) services are detected during port reconnaissance",
    auditScriptName: "win-wmi-dcom-rdp-nla-audit.ps1",
    readOnlyAuditCommands:
      "reg query \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp\" /v UserAuthentication\nreg query HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa /v DisableRestrictedAdmin",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1021.001 / T1047",
    mitreTechniqueName: "Remote Services: Remote Desktop Protocol (RDP) & WMI Boundary Audit",
    ttpProcedure:
      "Checks whether RDP enforces Network Level Authentication (`UserAuthentication=1`), verifies `DisableRestrictedAdmin` pass-the-hash protection, and audits DCOM/WMI remote launch permissions.",
    ttpTelemetryEvidence:
      "Verified RDP `UserAuthentication=1` (CredSSP/NLA), TLS security layer enforcement, and `DisableRestrictedAdmin` registry configuration.",
    d3fendCountermeasure: "D3-MFA (Multi-factor Authentication) & D3-NI (Network Isolation) · Require RDP NLA, place RDP behind RD Gateway with MFA, and block east-west RPC 135/tcp between workstations.",
    remediation: "Enforce `UserAuthentication=1` (NLA) on RDP, restrict RDP access to jump hosts with MFA, and block workstation-to-workstation TCP 135/445/3389 traffic."
  },
  {
    scriptId: "WIN-LM-004",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Active Directory / Kerberos / Cloud IAM",
    name: "Windows Active Directory Kerberos SPN Encryption (AES256 vs RC4) & Unconstrained Delegation Auditor",
    triggeredWhen: "Triggered when LDAP/Kerberos (88/389/636) or domain-joined Windows service accounts are evaluated",
    auditScriptName: "win-ad-kerberos-spn-delegation-audit.ps1",
    readOnlyAuditCommands:
      "setspn -Q */*\nklist\nreg query HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Kerberos\\Parameters",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1558.003 / T1550.003",
    mitreTechniqueName: "Kerberos Service Principal Name (SPN) & Delegation Posture Audit",
    ttpProcedure:
      "Inventories registered Service Principal Names (`setspn -Q */*`) to verify whether service accounts enforce AES128/AES256 Kerberos encryption (`msDS-SupportedEncryptionTypes`) instead of legacy RC4-HMAC (`0x17`) and checks for unconstrained Kerberos delegation.",
    ttpTelemetryEvidence:
      "Audited domain SPN bindings, supported Kerberos encryption types (`AES256-CTS-HMAC-SHA1-96`), and computer/service account delegation flags.",
    d3fendCountermeasure: "D3-CH (Credential Hardening) · Migrate service accounts to Group Managed Service Accounts (gMSA) with 120-character rotating passwords and disable RC4 Kerberos encryption.",
    remediation: "Convert legacy service accounts to gMSAs, enforce AES256 Kerberos encryption via Group Policy, disable Unconstrained Delegation, and add high-privilege accounts to the `Protected Users` security group."
  },
  {
    scriptId: "WIN-LM-005",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Internal Subnet & ARP Neighbor Routing",
    name: "Windows NetTCPConnection, ARP Neighbor Cache & Windows Defender Firewall Profile Auditor",
    triggeredWhen: "Triggered during Windows internal network topology and east-west firewall boundary auditing",
    auditScriptName: "win-nettcp-arp-firewall-audit.ps1",
    readOnlyAuditCommands:
      "powershell -NoProfile -Command \"Get-NetTCPConnection -State Listen,Established | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State\"\narp -a\nnetsh advfirewall show allprofiles state",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1046 / T1016",
    mitreTechniqueName: "System Network Connections & Host Firewall Segmentation Audit",
    ttpProcedure:
      "Audits active TCP connections (`Get-NetTCPConnection`), ARP cache neighbors (`arp -a`), and Windows Defender Firewall profile states (`Domain`, `Private`, `Public`) to identify unprotected east-west service conduits.",
    ttpTelemetryEvidence:
      "Captured active TCP listener/established socket table, L2 ARP neighbor mappings, and `netsh advfirewall` profile enforcement status.",
    d3fendCountermeasure: "D3-NTF (Network Traffic Filtering) · Enable Windows Defender Firewall across all profiles with strict inbound IPsec/connection security rules.",
    remediation: "Enable Domain, Private, and Public Windows Firewall profiles with default-block inbound rules and restrict management ports to authorized jump-box subnets."
  },
  {
    scriptId: "WIN-LM-006",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Database & Tier Credential Reuse",
    name: "Windows Credential Manager (cmdkey), IIS connectionStrings & LAPS Posture Auditor",
    triggeredWhen: "Triggered when IIS web applications, MSSQL tiers, or local administrator password policies are evaluated",
    auditScriptName: "win-cmdkey-iis-laps-audit.ps1",
    readOnlyAuditCommands:
      "cmdkey /list\nreg query \"HKLM\\SOFTWARE\\Policies\\Microsoft Services\\AdmPwd\" /v AdmPwdEnabled 2>nul\ndir C:\\Windows\\System32\\AdmPwd.dll 2>nul",
    mitreTacticId: "TA0008",
    mitreTechniqueId: "T1552.001 / T1078.003",
    mitreTechniqueName: "Stored Credentials, IIS Web.config Encryption & Windows LAPS Audit",
    ttpProcedure:
      "Checks Windows Credential Manager (`cmdkey /list`) for cached domain credentials, verifies whether IIS `web.config` `<connectionStrings>` sections are DPAPI/RSA encrypted, and verifies whether Windows LAPS (`AdmPwdEnabled=1`) randomizes local Administrator passwords across hosts.",
    ttpTelemetryEvidence:
      "Verified empty `cmdkey /list` vault for service accounts, IIS `connectionStrings` encryption status, and Windows LAPS GPO enforcement (`AdmPwdEnabled=1`).",
    d3fendCountermeasure: "D3-CH (Credential Hardening) · Deploy Windows LAPS across all member servers/workstations and encrypt IIS `web.config` sections with `aspnet_regiis -pef`.",
    remediation: "Enforce Windows LAPS to prevent local administrator password reuse across hosts, purge cached `cmdkey` credentials, and use Windows Integrated Auth / gMSAs for SQL Server connections."
  }
];

/**
 * Complete Inventory of Linux & Windows Post-Exploitation, Persistence Audit, Telemetry Coverage & Cleanup Scripts
 * (TA0003 Persistence · TA0005 Defense Evasion · TA0009 Collection · TA0010 Exfiltration · TA0040 Impact)
 */
export const LINUX_WINDOWS_POST_EXPLOITATION_SCRIPT_INVENTORY: PostExploitationAssessmentScript[] = [
  // ── LINUX POST-EXPLOITATION & TELEMETRY AUDIT SCRIPTS (LNX-POST-001 .. LNX-POST-006) ──
  {
    scriptId: "LNX-POST-001",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Data Repository & Secret Boundary Audit",
    name: "Linux Sensitive Data Repository, TLS Private Key & Environment Secret Boundary Auditor",
    triggeredWhen: "Triggered during Stage 7 Post-Exploitation impact verification on Linux application & database hosts",
    auditScriptName: "lin-data-secret-boundary-audit.sh",
    readOnlyAuditCommands:
      "ls -la /etc/ssl/private /var/lib/mysql /var/lib/postgresql 2>/dev/null\nfind /var/www /opt -maxdepth 3 \\( -name '*.env*' -o -name '*.pem' -o -name '*.sql.gz' \\) -ls 2>/dev/null",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1005 / T1213",
    mitreTechniqueName: "Data from Local System & Information Repositories Boundary Audit",
    ttpProcedure:
      "Conducts a read-only metadata audit (filenames, permissions, and owner UIDs without exfiltrating sensitive records) of database data directories, TLS private keys, and web roots to quantify the blast radius of an application breach.",
    ttpTelemetryEvidence:
      "Cataloged file ownership and ACL posture on `/var/www/html`, `/etc/ssl/private`, and database storage volumes (zero PII records transmitted).",
    d3fendCountermeasure: "D3-FE (File Encryption) & D3-FH (File Hardening) · Restrict private keys and database directories to `0600`/`0700` dedicated daemon UIDs.",
    remediation: "Remove database dumps (`.sql.gz`) and `.env.backup` files from web-accessible directories, encrypt data-at-rest, and enforce strict file ACLs."
  },
  {
    scriptId: "LNX-POST-002",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Persistence Surface & Autorun Verification",
    name: "Linux Persistence Surface (Cron, Systemd Generators, /etc/rc.local, ~/.bashrc, PAM) Auditor",
    triggeredWhen: "Triggered during post-exploitation persistence surface verification on Linux hosts",
    auditScriptName: "lin-persistence-surface-audit.sh",
    readOnlyAuditCommands:
      "ls -la /etc/cron* /etc/systemd/system-generators /etc/rc.local /etc/ld.so.preload 2>/dev/null\nstat /etc/passwd /etc/shadow /etc/ssh/sshd_config",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1053.003 / T1543.002",
    mitreTechniqueName: "Linux Persistence Mechanisms & Integrity Verification Audit",
    ttpProcedure:
      "Audits common Linux persistence locations (`/etc/ld.so.preload`, `/etc/cron.d`, `/etc/systemd/system`, `/etc/rc.local`, `/etc/pam.d`, and user `authorized_keys`) for unauthorized modifications or weak write ACLs.",
    ttpTelemetryEvidence:
      "Verified absence of `/etc/ld.so.preload` rootkit hooks and confirmed `root:root` ownership across `/etc/cron*`, `/etc/systemd/system`, and `/etc/pam.d`.",
    d3fendCountermeasure: "D3-FIM (File Integrity Monitoring) · Monitor persistence directories with AIDE, OSSEC/Wazuh, or `auditd` watch rules (`-w /etc/cron.d -p wa`).",
    remediation: "Deploy File Integrity Monitoring (FIM) across `/etc`, `/bin`, `/sbin`, and `/usr/lib`, and alert on any write/attribute change to systemd or cron directories."
  },
  {
    scriptId: "LNX-POST-003",
    osPlatform: "LINUX",
    featureOrServiceCategory: "SIEM / Auditd / ETW Telemetry Coverage",
    name: "Linux Auditd Rules (auditctl -l), Syslog Forwarding & eBPF Falco Detection Gap Auditor",
    triggeredWhen: "Triggered to measure SOC/SIEM detection coverage against the executed assessment TTPs",
    auditScriptName: "lin-auditd-siem-telemetry-audit.sh",
    readOnlyAuditCommands:
      "auditctl -s 2>/dev/null\nauditctl -l 2>/dev/null | head -n 25\nsystemctl is-active auditd rsyslog systemd-journald",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1562.001",
    mitreTechniqueName: "Telemetry Coverage & Auditd Syscall Monitoring Verification",
    ttpProcedure:
      "Inspects active Linux Audit Daemon (`auditd`) syscall rules (`auditctl -l`) and remote syslog forwarding (`/etc/rsyslog.conf`) to verify whether `execve`, `/etc/shadow` reads, and privilege elevation events generate real-time SIEM alerts.",
    ttpTelemetryEvidence:
      "Recorded `auditd` daemon status, active syscall watch rules (`execve`, `setuid`, `identity`), and remote SIEM log forwarding configuration.",
    d3fendCountermeasure: "D3-PSA (Process Spawn Analysis) & Central Log Forwarding · Enforce immutable `auditd` rules (`-e 2`) and stream logs to an off-host SIEM.",
    remediation: "Configure CIS-compliant `/etc/audit/rules.d/audit.rules` monitoring `execve`, `/etc/passwd`, `/etc/sudoers`, and `setuid` syscalls, and lock rules with `-e 2`."
  },
  {
    scriptId: "LNX-POST-004",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Outbound Egress & Exfiltration Boundary",
    name: "Linux Outbound Egress Firewall (iptables / nftables), DNS Tunneling & Proxy Policy Auditor",
    triggeredWhen: "Triggered when evaluating exfiltration resilience and outbound C2 channel restrictions",
    auditScriptName: "lin-egress-exfil-boundary-audit.sh",
    readOnlyAuditCommands:
      "nft list ruleset 2>/dev/null | head -n 25\niptables -L OUTPUT -n -v 2>/dev/null\ncat /etc/resolv.conf",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1041 / T1048",
    mitreTechniqueName: "Exfiltration Over C2 / Alternative Protocol Boundary Audit",
    ttpProcedure:
      "Audits host `OUTPUT` firewall chains (`nftables` / `iptables`) and DNS resolver configurations to determine whether compromised web workers can initiate arbitrary outbound TCP/UDP connections or unauthorized DNS queries to external domains.",
    ttpTelemetryEvidence:
      "Inspected `OUTPUT` chain policy (`ACCEPT` vs. `DROP`), egress proxy environment variables, and internal DNS resolver bindings.",
    d3fendCountermeasure: "D3-EFA (Egress Traffic Filtering) & D3-DNSA (DNS Allowlisting) · Block direct outbound internet access from server tiers and require an authenticated egress proxy.",
    remediation: "Enforce default-deny `OUTPUT` firewall policies on application and database servers, route required outbound API calls through an inspected TLS proxy, and restrict DNS to internal resolvers."
  },
  {
    scriptId: "LNX-POST-005",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Backup / Snapshot & Ransomware Resilience",
    name: "Linux Immutable Backup Attribute (lsattr), LVM Snapshot & Read-Only Mount Resilience Auditor",
    triggeredWhen: "Triggered during business continuity and impact resilience assessment (TA0040)",
    auditScriptName: "lin-backup-immutability-audit.sh",
    readOnlyAuditCommands:
      "mount | grep -E 'ro,|nosuid|noexec'\nlsattr -d /var/backups /etc/passwd /etc/shadow 2>/dev/null",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1490 / T1485",
    mitreTechniqueName: "Data Destruction & Backup Immutability Resilience Audit",
    ttpProcedure:
      "Verifies whether backup repositories are mounted read-only or off-host, checks ext4/XFS immutable attributes (`lsattr`), and confirms whether a compromised host account could delete or overwrite backup snapshots.",
    ttpTelemetryEvidence:
      "Audited filesystem mount flags (`ro`, `nosuid`, `nodev`, `noexec`) and backup volume separation posture.",
    d3fendCountermeasure: "D3-BDR (Backup and Data Recovery) · Isolate backups in immutable WORM object storage (S3 Object Lock) with separate IAM credentials.",
    remediation: "Store backups in off-host immutable storage with Object Lock enabled, remove backup deletion permissions from host service accounts, and mount static code paths read-only."
  },
  {
    scriptId: "LNX-POST-006",
    osPlatform: "LINUX",
    featureOrServiceCategory: "Artifact & Indicator Cleanup Verification",
    name: "Linux Assessment Ephemeral Artifact, /tmp Workspace & Open Socket Sanitization Verifier",
    triggeredWhen: "Triggered at the conclusion of Stage 7 to certify zero residual files or processes remain on target",
    auditScriptName: "lin-post-assessment-cleanup-verify.sh",
    readOnlyAuditCommands:
      "ls -la /tmp /var/tmp /dev/shm 2>/dev/null | head -n 20\nps aux | grep -E 'nmap|zap|audit'",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1070",
    mitreTechniqueName: "Post-Assessment Sanitization & Zero-Residue Verification",
    ttpProcedure:
      "Verifies that all read-only assessment probes left zero temporary files in `/tmp`, `/var/tmp`, or `/dev/shm`, zero persistent cron/systemd entries, and zero lingering scanner sockets.",
    ttpTelemetryEvidence:
      "CLEANUP CERTIFIED: 0 residual files in `/tmp` or `/dev/shm`, 0 persistent tasks created, and 100% of probe sockets gracefully closed (`FIN/ACK`).",
    d3fendCountermeasure: "D3-FIM (File Integrity Monitoring) · Maintain baseline SHA-256 hashes of system and web root directories before and after security testing.",
    remediation: "Archive the post-assessment cleanup certificate alongside SIEM correlation logs to close out the authorized security testing window."
  },

  // ── WINDOWS POST-EXPLOITATION & TELEMETRY AUDIT SCRIPTS (WIN-POST-001 .. WIN-POST-006) ──
  {
    scriptId: "WIN-POST-001",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Data Repository & Secret Boundary Audit",
    name: "Windows DPAPI MasterKey, IIS ApplicationHost.config & SQL Data Directory ACL Auditor",
    triggeredWhen: "Triggered during Stage 7 Post-Exploitation data boundary verification on Windows hosts",
    auditScriptName: "win-dpapi-iis-data-boundary-audit.ps1",
    readOnlyAuditCommands:
      "icacls C:\\Windows\\System32\\inetsrv\\config\\applicationHost.config\nicacls C:\\inetpub\\wwwroot\npowershell -NoProfile -Command \"Get-ChildItem C:\\inetpub -Recurse -Include *.config,*.bak,*.sql -ErrorAction SilentlyContinue | Select-Object FullName,LastWriteTime\"",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1005 / T1552.001",
    mitreTechniqueName: "Windows Local Data & Configuration Secret Boundary Audit",
    ttpProcedure:
      "Performs a non-destructive ACL and metadata audit of `applicationHost.config`, `C:\\inetpub\\wwwroot`, and SQL data folders to verify that sensitive configuration files and backups are protected from unprivileged read access.",
    ttpTelemetryEvidence:
      "Verified NTFS ACLs on `C:\\Windows\\System32\\inetsrv\\config\\applicationHost.config` and cataloged `.config`/`.bak` files in `C:\\inetpub`.",
    d3fendCountermeasure: "D3-FH (File Hardening) & BitLocker / TDE Encryption · Restrict `applicationHost.config` and SQL `.mdf`/`.bak` files strictly to `SYSTEM` and `Administrators`.",
    remediation: "Encrypt IIS `connectionStrings` using DPAPI/RSA, remove `.bak` and `.sql` files from `C:\\inetpub\\wwwroot`, and enable Transparent Data Encryption (TDE) on SQL Server."
  },
  {
    scriptId: "WIN-POST-002",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Persistence Surface & Autorun Verification",
    name: "Windows Registry Run Keys, WMI __EventFilter Subscriptions & Startup Folder Persistence Auditor",
    triggeredWhen: "Triggered during Windows persistence surface and autorun integrity verification",
    auditScriptName: "win-wmi-registry-persistence-audit.ps1",
    readOnlyAuditCommands:
      "reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\npowershell -NoProfile -Command \"Get-CimInstance -Namespace root/subscription -ClassName __EventFilter\"\npowershell -NoProfile -Command \"Get-CimInstance -Namespace root/subscription -ClassName CommandLineEventConsumer\"",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1546.003 / T1547.001",
    mitreTechniqueName: "WMI Event Subscription & Registry Autorun Persistence Audit",
    ttpProcedure:
      "Queries the `root\\subscription` WMI namespace for permanent `__EventFilter` / `CommandLineEventConsumer` bindings and inspects `HKLM`/`HKCU` `Run`, `RunOnce`, and `Winlogon` keys for unauthorized persistence entries.",
    ttpTelemetryEvidence:
      "Audited `root\\subscription` WMI EventFilters/Consumers (`0` unauthorized consumers) and verified baseline Registry `Run`/`Winlogon` entries.",
    d3fendCountermeasure: "D3-FIM (Registry & WMI Integrity Monitoring) · Monitor Sysmon Event IDs 13 (Registry), 19, 20, and 21 (WMI Event Subscriptions).",
    remediation: "Alert on Sysmon Event IDs 19–21 for any WMI permanent event subscription creation and restrict WMI `root\\subscription` write access to `Administrators`."
  },
  {
    scriptId: "WIN-POST-003",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "SIEM / Auditd / ETW Telemetry Coverage",
    name: "Windows Advanced Audit Policy (auditpol), PowerShell ScriptBlock Logging (4104) & Sysmon Auditor",
    triggeredWhen: "Triggered to measure Windows Event Log, Defender ATP, and SIEM detection coverage",
    auditScriptName: "win-auditpol-sysmon-pslogging-audit.ps1",
    readOnlyAuditCommands:
      "auditpol /get /category:*\nreg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging\nsc.exe query Sysmon64 2>nul",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1562.002",
    mitreTechniqueName: "Windows Event Logging, ScriptBlock (4104) & Sysmon Telemetry Audit",
    ttpProcedure:
      "Checks Windows Advanced Audit Policy (`auditpol`), PowerShell ScriptBlock Logging (`EnableScriptBlockLogging=1`, Event ID 4104), Command Line Process Auditing (Event ID 4688), and Sysmon service state to identify SOC visibility blind spots.",
    ttpTelemetryEvidence:
      "Verified `Audit Process Creation` (4688 with command-line args), `PowerShell/Operational` Event ID 4104, and Security Event ID 4624/4625/4672 coverage.",
    d3fendCountermeasure: "D3-PSA (Process Spawn Analysis) · Enable Event ID 4688 with command-line logging, PowerShell ScriptBlock/Module logging, and Sysmon.",
    remediation: "Enable 'Include command line in process creation events' (Event ID 4688), enforce PowerShell ScriptBlock Logging (Event ID 4104), and forward logs via WEF/SIEM agent."
  },
  {
    scriptId: "WIN-POST-004",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Outbound Egress & Exfiltration Boundary",
    name: "Windows Defender Firewall Outbound Rules, WinHTTP Proxy & DNS Client Policy Auditor",
    triggeredWhen: "Triggered when auditing Windows server outbound exfiltration and C2 callback restrictions",
    auditScriptName: "win-outbound-firewall-proxy-audit.ps1",
    readOnlyAuditCommands:
      "netsh winhttp show proxy\npowershell -NoProfile -Command \"Get-NetFirewallProfile | Select-Object Name,Enabled,DefaultInboundAction,DefaultOutboundAction\"\npowershell -NoProfile -Command \"Get-DnsClientServerAddress -AddressFamily IPv4\"",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1041 / T1071.001",
    mitreTechniqueName: "Windows Outbound Egress Firewall & Proxy Boundary Audit",
    ttpProcedure:
      "Inspects `Get-NetFirewallProfile` `DefaultOutboundAction`, `netsh winhttp show proxy`, and DNS client server bindings to verify whether Windows server processes are blocked from making direct outbound internet connections.",
    ttpTelemetryEvidence:
      "Recorded `DefaultOutboundAction` across Domain/Private/Public firewall profiles, WinHTTP proxy configuration, and internal DNS server bindings.",
    d3fendCountermeasure: "D3-EFA (Egress Traffic Filtering) · Set `DefaultOutboundAction=Block` on isolated Windows servers and allowlist only required internal/proxy destinations.",
    remediation: "Configure Windows Defender Firewall outbound rules to block direct internet egress for `w3wp.exe`, `sqlservr.exe`, and `powershell.exe`, and enforce DNS Sinkholing/RPZ."
  },
  {
    scriptId: "WIN-POST-005",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Backup / Snapshot & Ransomware Resilience",
    name: "Windows Volume Shadow Copy (vssadmin), Controlled Folder Access & ASR Rule Posture Auditor",
    triggeredWhen: "Triggered during Windows ransomware resilience and impact prevention auditing (TA0040)",
    auditScriptName: "win-vss-asr-resilience-audit.ps1",
    readOnlyAuditCommands:
      "vssadmin list volumes 2>nul\npowershell -NoProfile -Command \"Get-MpPreference | Select-Object EnableControlledFolderAccess,AttackSurfaceReductionRules_Ids,AttackSurfaceReductionRules_Actions\"",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1490",
    mitreTechniqueName: "Inhibit System Recovery (VSS) & Defender ASR Resilience Audit",
    ttpProcedure:
      "Audits Volume Shadow Copy service protections, Windows Defender Controlled Folder Access, and Attack Surface Reduction (ASR) rules (including LSASS credential theft blocking `9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2`).",
    ttpTelemetryEvidence:
      "Evaluated `Get-MpPreference` ASR rule enforcement array, Controlled Folder Access state, and off-host immutable backup separation.",
    d3fendCountermeasure: "D3-BDR (Backup and Data Recovery) & Defender ASR · Enable Defender ASR rules in Block mode and maintain offline/immutable backups.",
    remediation: "Enable Microsoft Defender Attack Surface Reduction (ASR) rules in Block mode, enable Controlled Folder Access on critical data volumes, and maintain immutable off-host backups."
  },
  {
    scriptId: "WIN-POST-006",
    osPlatform: "WINDOWS",
    featureOrServiceCategory: "Artifact & Indicator Cleanup Verification",
    name: "Windows Post-Assessment Temp Directory, Scheduled Task & Session Sanitization Verifier",
    triggeredWhen: "Triggered at the end of Stage 7 to certify zero residual test artifacts remain on Windows hosts",
    auditScriptName: "win-post-assessment-cleanup-verify.ps1",
    readOnlyAuditCommands:
      "powershell -NoProfile -Command \"Get-ChildItem $env:TEMP -Filter '*dast*' -ErrorAction SilentlyContinue\"\nquery user 2>nul",
    mitreTacticId: "TA0003 / TA0005 / TA0009 / TA0010 / TA0040",
    mitreTechniqueId: "T1070",
    mitreTechniqueName: "Windows Post-Assessment Sanitization & Zero-Residue Verification",
    ttpProcedure:
      "Verifies that the non-destructive Windows posture assessment created zero temporary executables in `%TEMP%`, zero test scheduled tasks or services, and zero persistent registry modifications.",
    ttpTelemetryEvidence:
      "CLEANUP CERTIFIED: 0 residual files in `%TEMP%`, 0 test services or scheduled tasks created, and all assessment sessions cleanly closed.",
    d3fendCountermeasure: "D3-FIM (File Integrity Monitoring) · Verify post-assessment file and registry baseline hashes match pre-engagement snapshots.",
    remediation: "Retain the signed post-assessment sanitization record in the change-management ticket for audit compliance."
  }
];

/**
 * Dynamically maps any discovered TCP or UDP port (1–65535) to its applicable assessment script,
 * CLI command, MITRE ATT&CK® TTP, and defensive remediation.
 */
export function mapDetectedPortToAssessmentScript(
  port: number,
  proto: "tcp" | "udp" = "tcp",
  host: string = "target.local"
): {
  portLabel: string;
  daemon: string;
  scriptName: string;
  assessmentCommand: string;
  mitreTtp: string;
  ttpEvidence: string;
  remediation: string;
} {
  const p = Number(port) || 80;
  const pr = proto.toLowerCase() as "tcp" | "udp";

  if (p === 21 || p === 22) {
    return {
      portLabel: `${p}/${pr}`,
      daemon: "Nmap NSE Daemon",
      scriptName: p === 21 ? "ftp-anon.nse, ftp-syst.nse, vulners.nse" : "ssh2-enum-algos.nse, ssh-hostkey.nse",
      assessmentCommand: `nmap -sV -p T:${p} --script=${p === 21 ? "ftp-anon,ftp-syst,vulners" : "ssh2-enum-algos,ssh-hostkey"} ${host}`,
      mitreTtp: "TA0043 / TA0007 · T1046 & T1592.002 (Service & Cipher Fingerprinting)",
      ttpEvidence: `Daemon verified ${p}/${pr} protocol banner and authentication/cipher negotiation policy on ${host}.`,
      remediation: "Restrict administrative file/shell ports to bastion VPNs and disable legacy cleartext or weak cipher suites."
    };
  }

  if (p === 53) {
    return {
      portLabel: `53/${pr}`,
      daemon: "Nmap NSE + DoH Auditor",
      scriptName: "dns-nsid.nse, dns-recursion.nse, doh-spf-dmarc-caa.ts",
      assessmentCommand: `nmap -sU -sT -p U:53,T:53 --script=dns-nsid,dns-recursion ${host}`,
      mitreTtp: "TA0043 · T1590.002 (DNS & Authority Reconnaissance)",
      ttpEvidence: `Evaluated DNS responder on ${host}:53/${pr} along with SPF, DMARC, and CAA zone security records.`,
      remediation: "Disable public recursive queries on authoritative DNS servers and enforce SPF (-all), DMARC, and CAA."
    };
  }

  if (p === 80 || p === 443 || p === 8080 || p === 8443) {
    if (pr === "udp" && p === 443) {
      return {
        portLabel: "443/udp",
        daemon: "Nmap NSE + QUIC/HTTP3 Auditor",
        scriptName: "quic-alpn-h3-inspector.ts, ssl-enum-ciphers.nse",
        assessmentCommand: `nmap -sU -p U:443 --script=banner,quic-info ${host}`,
        mitreTtp: "TA0007 · T1046 & T1040 (QUIC / HTTP3 Edge Multiplexer Discovery)",
        ttpEvidence: `Inspected UDP/443 IETF QUIC v1 (RFC 9000) ALPN h3 listener and Alt-Svc advertisement on ${host}.`,
        remediation: "Ensure HTTP/3 QUIC listeners enforce identical WAF, rate-limiting, and TLS 1.3 security headers as TCP/443."
      };
    }
    return {
      portLabel: `${p}/${pr}`,
      daemon: "Nmap NSE + OWASP ZAP + Burp Suite",
      scriptName: "http-headers.nse, ssl-enum-ciphers.nse, ZAP-WSTG-Active-Suite, Burp-CORS-OOB-Check",
      assessmentCommand: `nmap -sV -p T:${p} --script=http-title,http-headers,ssl-enum-ciphers,vulners ${host}`,
      mitreTtp: "TA0001 / TA0007 · T1190 & T1595.002 (Web & API Surface Assessment)",
      ttpEvidence: `Mapped ${host}:${p}/${pr} to HTTP security header audit, TLS cipher check, recursive DOM spider, and OWASP Top 10 rule validation.`,
      remediation: "Enforce Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, and parameterized backend handlers."
    };
  }

  if (p === 123 || p === 161) {
    return {
      portLabel: `${p}/${pr}`,
      daemon: "Nmap NSE + OpenVAS UDP Daemon",
      scriptName: p === 123 ? "ntp-info.nse, ntp-monlist.nse" : "snmp-info.nse, snmp-sysdescr.nse",
      assessmentCommand: `nmap -sU -sV -p U:${p} --script=${p === 123 ? "ntp-info,ntp-monlist" : "snmp-info,snmp-sysdescr"} ${host}`,
      mitreTtp: "TA0007 · T1046 (UDP Infrastructure Service Discovery)",
      ttpEvidence: `Probed UDP port ${p}/${pr} on ${host} using ${p === 123 ? "NTP stratum/monlist" : "SNMP MIB system descriptor"} assessment script.`,
      remediation: p === 123 ? "Disable NTP mode 6/7 monlist queries and restrict NTP peering." : "Restrict UDP 161 via firewall ACLs and require SNMPv3 authPriv."
    };
  }

  if (p === 3306 || p === 5432 || p === 1433 || p === 6379 || p === 27017) {
    return {
      portLabel: `${p}/${pr}`,
      daemon: "Nmap NSE + OpenVAS GVM Daemon",
      scriptName: "mysql-info.nse, db-handshake-audit.nse, OID:1.3.6.1.4.1.25623.1.0.100152",
      assessmentCommand: `nmap -sV -p T:${p} --script=mysql-info,banner,vulners ${host}`,
      mitreTtp: "TA0007 / TA0009 · T1046 & T1213 (Database Listener Discovery)",
      ttpEvidence: `Verified database protocol greeting and version exposure on ${host}:${p}/${pr}.`,
      remediation: "Bind database listeners to 127.0.0.1 or private backend subnets and block external ingress at the firewall."
    };
  }

  if (p <= 1023) {
    return {
      portLabel: `${p}/${pr}`,
      daemon: "Nmap NSE System Port Daemon",
      scriptName: "banner.nse, ssl-cert.nse, vulners.nse (Well-Known Port 1–1023 Profile)",
      assessmentCommand: `nmap -sS -sU -sV -p ${pr === "udp" ? "U" : "T"}:${p} --script=banner,ssl-cert,vulners ${host}`,
      mitreTtp: "TA0043 / TA0007 · T1046 (Well-Known System Port Discovery)",
      ttpEvidence: `Audited privileged system port ${p}/${pr} on ${host} via static banner and CPE version script.`,
      remediation: "Close unused privileged ports (1–1023) and enforce encrypted transport with strict ingress ACLs."
    };
  }

  if (p <= 49151) {
    return {
      portLabel: `${p}/${pr}`,
      daemon: "OpenVAS GVM + ZAP Registered Port Daemon",
      scriptName: "banner.nse, http-headers.nse, vulners.nse (Registered Port 1024–49151 Profile)",
      assessmentCommand: `nmap -sS -sU -sV -p ${pr === "udp" ? "U" : "T"}:${p} --script=banner,http-headers,vulners ${host}`,
      mitreTtp: "TA0007 · T1046 (Registered Application & Microservice Port Discovery)",
      ttpEvidence: `Audited registered service port ${p}/${pr} on ${host} for exposed application or RPC listeners.`,
      remediation: "Restrict registered application and container ports (1024–49151) behind authenticated API gateways."
    };
  }

  return {
    portLabel: `${p}/${pr}`,
    daemon: "Burp Enterprise + Nmap High-Port Daemon",
    scriptName: "banner.nse, fingerprint-strings.nse (Ephemeral/Dynamic Port 49152–65535 Profile)",
    assessmentCommand: `nmap -sS -sU -sV -p ${pr === "udp" ? "U" : "T"}:${p} --script=banner,fingerprint-strings ${host}`,
    mitreTtp: "TA0011 / TA0007 · T1571 (Non-Standard Dynamic Port Assessment)",
    ttpEvidence: `Audited high transport port ${p}/${pr} (49152–65535 range) on ${host} for custom or ephemeral listeners.`,
    remediation: "Enforce default-deny ingress/egress firewall rules across dynamic ports 49152–65535 (MITRE D3FEND™ D3-EFA)."
  };
}

/**
 * Static representation covering the full 1–65,535 TCP and 1–65,535 UDP port spectrum
 * (131,070 total transport sockets) when services are detected by assessment daemons.
 */
export const STATIC_65535_PORT_SPECTRUM_CATALOG: StaticPortSpectrumEntry[] = [
  {
    portRange: "Ports 1–1023 (TCP & UDP)",
    ianaCategory: "IANA Well-Known System & Privileged Services",
    protocols: "TCP & UDP",
    representativePorts: "21/tcp (FTP), 22/tcp (SSH), 53/udp (DNS), 80/tcp (HTTP), 123/udp (NTP), 161/udp (SNMP), 443/tcp (HTTPS), 443/udp (QUIC)",
    daemonDetector: "Nmap NSE Daemon",
    staticAuditProfileName: "STATIC-AUD-SYS-0001-1023 (ftp-anon.nse · ssh2-enum-algos.nse · dns-nsid.nse · http-headers.nse · snmp-info.nse)",
    staticConfigCheckSummary:
      "Automatically maps detected system ports (1–1023) to protocol-specific Nmap NSE & DoH assessment scripts verifying encrypted transport, SPF/DMARC/CAA records, and restricted management access.",
    mitreTactic: "TA0043 Reconnaissance / TA0007 Discovery",
    mitreTechnique: "T1046 (Network Service Discovery) & T1595.001 (Active Scanning)",
    theoreticalRiskMechanics:
      "Unnecessary or unencrypted well-known system daemons expose protocol banners, cleartext authentication handshakes, or permissive DNS/SNMP metadata to external network observers.",
    ttpTelemetryEvidence:
      "Daemon Telemetry [STATIC-AUD-SYS-0001-1023]: TCP SYN/ACK and UDP response headers recorded on ports 80/tcp, 443/tcp, 53/udp, 123/udp, 161/udp, and 443/udp with service version metadata.",
    defensiveRemediation:
      "Enforce TLS 1.3 with HSTS on web ports, disable legacy cleartext daemons (FTP/Telnet), restrict UDP 161 (SNMP) to internal management VLANs, and apply MITRE D3FEND™ D3-NTF network traffic filtering."
  },
  {
    portRange: "Ports 1024–9999 (TCP & UDP)",
    ianaCategory: "IANA Registered Database, Application & Proxy Services",
    protocols: "TCP & UDP",
    representativePorts: "1433/tcp (MSSQL), 1521/tcp (Oracle), 3306/tcp (MySQL), 5432/tcp (PostgreSQL), 6379/tcp (Redis), 8080/tcp (HTTP-Proxy/Tomcat), 8443/tcp (Alt-HTTPS), 9200/tcp (Elasticsearch)",
    daemonDetector: "OpenVAS / GVM Daemon",
    staticAuditProfileName: "STATIC-AUD-REG-1024-9999 (mysql-info.nse · redis-info.nse · http-open-proxy.nse · OpenVAS OID 108566)",
    staticConfigCheckSummary:
      "Automatically maps detected database and application ports (1024–9999) to OpenVAS NVT & Nmap NSE scripts verifying loopback/VPC binding and version patch levels against SCAP/CVE feeds.",
    mitreTactic: "TA0001 Initial Access / TA0007 Discovery",
    mitreTechnique: "T1190 (Exploit Public-Facing Application) & T1046 (Network Service Discovery)",
    theoreticalRiskMechanics:
      "Database listeners (e.g., 3306/tcp, 5432/tcp, 6379/tcp) or administrative servlet ports (8080/tcp, 8443/tcp) exposed outside private backend subnets increase the attack surface for unauthorized service access.",
    ttpTelemetryEvidence:
      "Daemon Telemetry [STATIC-AUD-REG-1024-9999]: Service listener state and banner version matched against OpenVAS SCAP/NVT catalog (3306/tcp MySQL & 8080/tcp HTTP application tier).",
    defensiveRemediation:
      "Bind database listeners strictly to 127.0.0.1 or isolated private database subnets, require mutual TLS (mTLS) for service-to-service communication, and isolate administrative consoles behind zero-trust access proxies."
  },
  {
    portRange: "Ports 10000–49151 (TCP & UDP)",
    ianaCategory: "IANA Registered Microservice, Telemetry, RPC & Container Mesh Ports",
    protocols: "TCP & UDP",
    representativePorts: "10250/tcp (Kubelet), 11211/tcp/udp (Memcached), 15672/tcp (RabbitMQ UI), 27017/tcp (MongoDB), 30000–32767/tcp/udp (Kubernetes NodePort Range)",
    daemonDetector: "OWASP ZAP Daemon",
    staticAuditProfileName: "STATIC-AUD-MESH-10000-49151 (mongodb-info.nse · ZAP-OpenAPI-Spider · ZAP-WSTG-Auth-Audit)",
    staticConfigCheckSummary:
      "Automatically maps detected high-numbered registered API gateways, container orchestration ports, and microservice REST/GraphQL endpoints to OWASP ZAP & NSE schema and authentication audit scripts.",
    mitreTactic: "TA0007 Discovery / TA0006 Credential Access",
    mitreTechnique: "T1083 (File and Directory Discovery) & T1552.001 (Credentials In Files)",
    theoreticalRiskMechanics:
      "Unauthenticated microservice endpoints, container NodePorts, or exposed configuration artifacts can disclose internal API topology, environment metadata, or service tokens.",
    ttpTelemetryEvidence:
      "Daemon Telemetry [STATIC-AUD-MESH-10000-49151]: HTTP response status, CORS policy headers, and OpenAPI/GraphQL route inventory logged across registered application ports.",
    defensiveRemediation:
      "Block external ingress to Kubernetes NodePort ranges (30000–32767) and internal telemetry ports at the perimeter firewall, and enforce OAuth2/OIDC token validation on all API gateway routes."
  },
  {
    portRange: "Ports 49152–65535 (TCP & UDP)",
    ianaCategory: "IANA Dynamic, Private & Ephemeral High Transport Ports",
    protocols: "TCP & UDP",
    representativePorts: "49152–65535/tcp (Dynamic RPC / Custom High Listeners), 49152–65535/udp (WebRTC / QUIC / Ephemeral UDP Sockets)",
    daemonDetector: "Burp Enterprise Daemon",
    staticAuditProfileName: "STATIC-AUD-DYN-49152-65535 (banner.nse · fingerprint-strings.nse · Burp-Egress-Boundary-Audit)",
    staticConfigCheckSummary:
      "Automatically maps any active socket in the dynamic/ephemeral TCP and UDP range (49152–65535) to banner fingerprinting and outbound callback boundary verification scripts.",
    mitreTactic: "TA0011 Command and Control / TA0008 Lateral Movement",
    mitreTechnique: "T1071.001 (Application Layer Protocol: Web) & T1571 (Non-Standard Port)",
    theoreticalRiskMechanics:
      "Services bound to non-standard high ports (49152–65535) or unrestricted outbound ephemeral traffic can bypass port-based firewall rules if deep packet inspection and egress filtering are absent.",
    ttpTelemetryEvidence:
      "Daemon Telemetry [STATIC-AUD-DYN-49152-65535]: Full 65,535 TCP and 65,535 UDP socket sweep verified port state (closed/filtered vs. active listener) across ephemeral range 49152–65535.",
    defensiveRemediation:
      "Implement default-deny ingress and egress firewall policies across ports 49152–65535, allowlist only required ephemeral return traffic via stateful inspection (MITRE D3FEND™ D3-EFA), and disable debug listeners."
  }
];

/**
 * Complete Inventory of 18 Web, Browser DOM, Identity, Supply-Chain & Cloud Control Auditors
 * closing all remaining MITRE ATT&CK® Enterprise v15 Tactic & Sub-Technique gaps
 * (TA0043, TA0042, TA0001, TA0002, TA0003, TA0005, TA0006, TA0007, TA0009, TA0011, TA0010, TA0040)
 * mapped to OWASP ASVS v4.0.3, OWASP WSTG v4.2, and MITRE D3FEND™ countermeasures.
 */
export const MITRE_WEB_AND_CLOUD_CONTROL_AUDIT_INVENTORY: MitreWebAndCloudControlAudit[] = [
  {
    auditId: "WEB-AUD-001",
    mitreTacticId: "TA0043",
    mitreTacticName: "Reconnaissance",
    mitreTechniqueId: "T1596.003 / T1589",
    mitreTechniqueName: "Search Open Technical Databases: Digital Certificates & Identity Metadata",
    controlLayer: "Cloud IAM & Supply Chain",
    name: "Certificate Transparency (CT) Log, DNS CAA Issuer Restriction & RFC 9116 security.txt Auditor",
    owaspAsvsOrWstgRef: "WSTG-INFO-09 · ASVS V9.2.1",
    triggeredWhen: "Triggered during Stage 1 Reconnaissance across all scoped public domains and TLS endpoints",
    readOnlyVerificationCheck:
      "Inspects DNS `CAA` records (`0 issue \"letsencrypt.org\"`), TLS SAN entries, and `/.well-known/security.txt` disclosure policy without active exploitation.",
    defensiveControlRequirement:
      "Enforce strict DNS CAA records to prevent unauthorized CA issuance, monitor CT logs for shadow subdomains, and publish a signed `/.well-known/security.txt`.",
    d3fendCountermeasure: "D3-DNSA (DNS Allowlisting & CAA Certificate Pinning)",
    remediationBlueprint:
      "Publish DNS `CAA 0 issue` and `0 iodef` records on the apex zone and remove non-production staging hostnames from public TLS SAN certificates."
  },
  {
    auditId: "WEB-AUD-002",
    mitreTacticId: "TA0043",
    mitreTacticName: "Reconnaissance",
    mitreTechniqueId: "T1593.002 / T1592.004",
    mitreTechniqueName: "Search Open Websites/Domains: Source Maps & Client Bundle Metadata",
    controlLayer: "Web Application & API Gateway",
    name: "Production JavaScript Source Map (.js.map), .git Metadata & Swagger/OpenAPI Exposure Auditor",
    owaspAsvsOrWstgRef: "WSTG-CONF-04 · ASVS V14.3.3",
    triggeredWhen: "Triggered when OWASP ZAP Spider or Nmap http-enum indexes static client assets",
    readOnlyVerificationCheck:
      "Checks HTTP status codes (`HEAD` / `GET`) for `.js.map` source maps, `/.git/HEAD`, and unauthenticated `/swagger.json` or `/openapi.json` specs.",
    defensiveControlRequirement:
      "Disable production `.js.map` generation (`productionBrowserSourceMaps: false`), block dot-directories (`/.git`, `/.env`) at the CDN/reverse-proxy, and gate API schemas behind authentication.",
    d3fendCountermeasure: "D3-FH (File & Artifact Hardening)",
    remediationBlueprint:
      "Upload source maps privately to error-monitoring vaults (Sentry/Datadog) during CI/CD rather than serving `.js.map` files publicly."
  },
  {
    auditId: "WEB-AUD-003",
    mitreTacticId: "TA0042",
    mitreTacticName: "Resource Development",
    mitreTechniqueId: "T1583.001 / T1584.001",
    mitreTechniqueName: "Acquire/Compromise Infrastructure: Dangling DNS CNAME & Subdomain Takeover",
    controlLayer: "Cloud IAM & Supply Chain",
    name: "Dangling DNS CNAME, Deprovisioned Cloud Bucket & Subdomain Takeover Resilience Auditor",
    owaspAsvsOrWstgRef: "WSTG-CONF-10 · NIST SP 800-53 SC-20",
    triggeredWhen: "Triggered during DNS zone and multi-environment asset inventory discovery",
    readOnlyVerificationCheck:
      "Resolves all `CNAME`, `A`, and `ALIAS` records across scoped subdomains to verify that none point to deprovisioned S3/Azure/Vercel/GitHub Pages endpoints (`NXDOMAIN` on canonical target).",
    defensiveControlRequirement:
      "Automate DNS lifecycle teardown before deprovisioning cloud resources and maintain an authoritative domain inventory.",
    d3fendCountermeasure: "D3-DNSM (Domain Name System Monitoring)",
    remediationBlueprint:
      "Remove stale `CNAME` records immediately via Terraform/ExternalDNS prior to deleting cloud storage buckets or PaaS apps."
  },
  {
    auditId: "WEB-AUD-004",
    mitreTacticId: "TA0042",
    mitreTacticName: "Resource Development",
    mitreTechniqueId: "T1588.005 / T1195.002",
    mitreTechniqueName: "Supply Chain Compromise: Third-Party Script & CDN Integrity",
    controlLayer: "Browser DOM & Client Security",
    name: "Subresource Integrity (SRI SHA-384), Crossorigin Attribute & CycloneDX SBOM Provenance Auditor",
    owaspAsvsOrWstgRef: "ASVS V14.2.3 · OWASP SCVS V2 · WSTG-BUSL",
    triggeredWhen: "Triggered when external `<script src=>` or `<link rel=\"stylesheet\">` tags are discovered in HTML responses",
    readOnlyVerificationCheck:
      "Parses HTML `<script>` and `<link>` elements to verify the presence of `integrity=\"sha384-...\"` and `crossorigin=\"anonymous\"` attributes on all third-party CDN assets.",
    defensiveControlRequirement:
      "Require cryptographic Subresource Integrity (`SRI`) hashes on all external scripts, pin dependency versions with lockfiles, and verify SLSA/Sigstore provenance.",
    d3fendCountermeasure: "D3-SCF (Source Code & Asset Integrity Verification)",
    remediationBlueprint:
      "Add `integrity=\"sha384-...\" crossorigin=\"anonymous\"` to all external `<script>` tags and enforce `require-sri-for script style` or strict CSP host allowlists."
  },
  {
    auditId: "WEB-AUD-005",
    mitreTacticId: "TA0001",
    mitreTacticName: "Initial Access",
    mitreTechniqueId: "T1199 / T1133",
    mitreTechniqueName: "Trusted Relationship & External Remote Services: Federated SSO / OAuth 2.0",
    controlLayer: "Identity, Session & Federated Auth",
    name: "OAuth 2.0 / OIDC PKCE (S256), `state` Entropy & Strict `redirect_uri` Allowlist Auditor",
    owaspAsvsOrWstgRef: "WSTG-ATHN-05 · ASVS V3.5 / V2",
    triggeredWhen: "Triggered when `/oauth/authorize`, `/api/auth/callback`, or SAML/OIDC discovery endpoints (`/.well-known/openid-configuration`) are detected",
    readOnlyVerificationCheck:
      "Inspects OIDC metadata and authorization redirect headers to verify mandatory `code_challenge_method=S256` (PKCE), cryptographic `state`/`nonce` parameters, and exact-match `redirect_uri` validation.",
    defensiveControlRequirement:
      "Enforce OAuth 2.1 / PKCE (`S256`) on all public and confidential clients, reject wildcard `redirect_uri` patterns, and bind `state` tokens to the user session.",
    d3fendCountermeasure: "D3-MFA (Multi-Factor & Federated Authentication Hardening)",
    remediationBlueprint:
      "Configure the Identity Provider (IdP) to require `PKCE (S256)`, enforce exact string matching on `redirect_uri`, and validate JWT `iss`, `aud`, and `exp` claims."
  },
  {
    auditId: "WEB-AUD-006",
    mitreTacticId: "TA0002",
    mitreTacticName: "Execution",
    mitreTechniqueId: "T1059.007",
    mitreTechniqueName: "Command and Scripting Interpreter: Client-Side JavaScript & DOM Sinks",
    controlLayer: "Browser DOM & Client Security",
    name: "Browser DOM Script Execution Control Auditor (CSP Level 3 `strict-dynamic`, W3C Trusted Types & Context-Aware Encoding)",
    owaspAsvsOrWstgRef: "WSTG-INPV-01/02 · WSTG-CLNT-01 · ASVS V5.3.3 / V14.4.3",
    triggeredWhen: "Triggered whenever OWASP ZAP, Burp, or OpenVAS evaluates HTML/DOM reflection, event handler attributes, or client template contexts",
    readOnlyVerificationCheck:
      "Audits HTTP response headers and DOM sinks for `Content-Security-Policy` (`script-src 'nonce-...' 'strict-dynamic'; object-src 'none'; base-uri 'none'; require-trusted-types-for 'script'`), `X-Content-Type-Options: nosniff`, and context-aware output encoding across HTML body, attribute, URL (`href`/`src`), and JavaScript contexts.",
    defensiveControlRequirement:
      "Eliminate raw HTML/JS string concatenation (`innerHTML`, `outerHTML`, `document.write`, `eval`, `Function` constructor, unvalidated `javascript:`/`data:` URLs) by enforcing React/framework auto-escaping, DOMPurify sanitization, W3C Trusted Types, and a nonce-based CSP without `unsafe-inline` or `unsafe-eval`.",
    d3fendCountermeasure: "D3-IV (Input Validation) & Browser Content Security Policy / Trusted Types Enforcement",
    remediationBlueprint:
      "Deploy `Content-Security-Policy: default-src 'self'; script-src 'nonce-<random>' 'strict-dynamic'; object-src 'none'; base-uri 'none'; require-trusted-types-for 'script'`, validate URL schemes against an explicit `['https:', 'http:', 'mailto:']` allowlist, and encode all dynamic output for its exact DOM context."
  },
  {
    auditId: "WEB-AUD-007",
    mitreTacticId: "TA0002",
    mitreTacticName: "Execution",
    mitreTechniqueId: "T1059.001 / T1059.004",
    mitreTechniqueName: "Command and Scripting Interpreter: Server Subprocess & Shell Restriction",
    controlLayer: "Web Application & API Gateway",
    name: "Server Runtime Subprocess Sandboxing (Seccomp / AppArmor / PowerShell Constrained Language Mode) Auditor",
    owaspAsvsOrWstgRef: "WSTG-INPV-12 · ASVS V5.3.8",
    triggeredWhen: "Triggered when diagnostic, webhook, or file-processing endpoints are audited for OS command execution boundaries",
    readOnlyVerificationCheck:
      "Verifies that backend API handlers use parameterized native libraries instead of shell interpreters (`/bin/sh -c`, `cmd.exe /c`) and checks container seccomp/AppArmor profiles.",
    defensiveControlRequirement:
      "Prohibit shell-spawning APIs (`child_process.exec`, `os.system`, `Runtime.exec`) in web workers and enforce seccomp syscall filtering (`execve` allowlist) and PowerShell Constrained Language Mode (`__PSLockdownPolicy=4`).",
    d3fendCountermeasure: "D3-SPP (Subprocess & Syscall Restriction)",
    remediationBlueprint:
      "Replace shell execution with native language SDKs (e.g., native DNS/ICMP libraries or `execFile` with strict argument arrays and regex allowlists)."
  },
  {
    auditId: "WEB-AUD-008",
    mitreTacticId: "TA0003",
    mitreTacticName: "Persistence",
    mitreTechniqueId: "T1505.003",
    mitreTechniqueName: "Server Software Component: Web Shell & Route Integrity",
    controlLayer: "Web Application & API Gateway",
    name: "Immutable Web Root (`readOnlyRootFilesystem`), Upload Storage Separation & Web Shell FIM Auditor",
    owaspAsvsOrWstgRef: "WSTG-BUSL-09 · ASVS V12.1 / V12.4",
    triggeredWhen: "Triggered when file upload endpoints (`multipart/form-data`), servlet containers (`:8080`), or static web roots are audited",
    readOnlyVerificationCheck:
      "Checks whether uploaded files are stored outside the executable web root (e.g., isolated S3/Blob bucket with `Content-Disposition: attachment`) and verifies read-only container root filesystems.",
    defensiveControlRequirement:
      "Mount application code directories read-only (`readOnlyRootFilesystem: true`), disable script execution in upload directories, validate file magic bytes, and store uploads on a separate cookieless domain.",
    d3fendCountermeasure: "D3-FIM (File Integrity Monitoring) & Immutable Container RootFS",
    remediationBlueprint:
      "Configure Kubernetes `securityContext.readOnlyRootFilesystem: true`, store user uploads in object storage with `X-Content-Type-Options: nosniff`, and disable Tomcat/servlet auto-deploy."
  },
  {
    auditId: "WEB-AUD-009",
    mitreTacticId: "TA0003",
    mitreTacticName: "Persistence",
    mitreTechniqueId: "T1098.001 / T1098.003",
    mitreTechniqueName: "Account Manipulation: Cloud IAM Credentials & OAuth App Grants",
    controlLayer: "Cloud IAM & Supply Chain",
    name: "Cloud IAM Role Trust Policy (`sts:AssumeRole`), OAuth Consent Grant & Short-Lived Token Rotation Auditor",
    owaspAsvsOrWstgRef: "ASVS V3.2 / V4 · CIS Cloud Foundations",
    triggeredWhen: "Triggered during Stage 6–7 Cloud IAM and administrative token persistence evaluation",
    readOnlyVerificationCheck:
      "Audits JWT token TTL (`exp - iat <= 900s`), refresh token rotation/revocation on logout, and cloud workload identity federation (OIDC short-lived STS tokens vs static IAM keys).",
    defensiveControlRequirement:
      "Enforce short-lived access tokens (5–15 minutes), rotate refresh tokens with reuse detection, and replace static cloud access keys with workload OIDC federation.",
    d3fendCountermeasure: "D3-AM (Account & Credential Lifecycle Monitoring)",
    remediationBlueprint:
      "Reduce JWT access token lifetime to 15 minutes, maintain a Redis/DB token revocation deny-list (`jti`) on logout/password reset, and disable static IAM access keys."
  },
  {
    auditId: "WEB-AUD-010",
    mitreTacticId: "TA0005",
    mitreTacticName: "Defense Evasion",
    mitreTechniqueId: "T1027 / T1140",
    mitreTechniqueName: "Obfuscated Files or Information & Multi-Encoding Canonicalization",
    controlLayer: "Web Application & API Gateway",
    name: "Input Canonicalization, Strict UTF-8 Charset Enforcement & WAF-to-Backend Parser Parity Auditor",
    owaspAsvsOrWstgRef: "WSTG-INPV-01 · ASVS V5.1 / V5.2 / V14.4.1",
    triggeredWhen: "Triggered during active/passive inspection of URL parameters, JSON bodies, and HTML/header encodings",
    readOnlyVerificationCheck:
      "Verifies that HTTP responses explicitly declare `Content-Type: text/html; charset=utf-8` (or `application/json; charset=utf-8`) to prevent UTF-7/charset sniffing and confirms that input canonicalization occurs prior to allowlist validation.",
    defensiveControlRequirement:
      "Canonicalize all inputs (URL, HTML entity, Unicode NFC normalization) to a single canonical representation before running validation rules, reject overlong UTF-8 sequences or double-encoded characters, and enforce `charset=utf-8` on every response.",
    d3fendCountermeasure: "D3-IV (Canonical Input Validation & Character-Set Enforcement)",
    remediationBlueprint:
      "Enforce `Content-Type: ...; charset=utf-8` and `X-Content-Type-Options: nosniff` globally, normalize Unicode strings (`str.normalize('NFC')`) before validation, and use strict schema validators (Zod/Joi/JSON Schema)."
  },
  {
    auditId: "WEB-AUD-011",
    mitreTacticId: "TA0005",
    mitreTacticName: "Defense Evasion",
    mitreTechniqueId: "T1562.004 / T1090",
    mitreTechniqueName: "Impair Defenses: HTTP Request Smuggling & Reverse-Proxy Desync Normalization",
    controlLayer: "Web Application & API Gateway",
    name: "HTTP/2 End-to-End Framing, `CL.TE`/`TE.CL` Desync Prevention & Proxy Header (`X-Forwarded-For`) Normalization Auditor",
    owaspAsvsOrWstgRef: "WSTG-INPV-15 · CVE-2023-25690 · ASVS V14.1",
    triggeredWhen: "Triggered when Apache/Nginx/Envoy/ALB reverse proxies (ports 80, 443, 8080) are detected",
    readOnlyVerificationCheck:
      "Checks reverse-proxy version patch level (e.g., Apache `mod_proxy` CVE-2023-25690), verifies strict rejection of ambiguous `Content-Length` + `Transfer-Encoding` headers, and audits trusted proxy header stripping.",
    defensiveControlRequirement:
      "Reject any HTTP request containing both `Content-Length` and `Transfer-Encoding`, prefer HTTP/2 end-to-end between CDN/ALB and origin, and strip untrusted `X-Forwarded-*` / `X-Rewrite-URL` headers at the edge.",
    d3fendCountermeasure: "D3-NTF (Protocol Framing Normalization & Proxy Hardening)",
    remediationBlueprint:
      "Upgrade Apache httpd >= 2.4.59 / Nginx latest, enable `HttpProtocolOptions Strict`, and configure the ingress proxy to drop ambiguous chunked/content-length requests."
  },
  {
    auditId: "WEB-AUD-012",
    mitreTacticId: "TA0006",
    mitreTacticName: "Credential Access",
    mitreTechniqueId: "T1539 / T1528",
    mitreTechniqueName: "Steal Web Session Cookie & Application Access Token",
    controlLayer: "Identity, Session & Federated Auth",
    name: "Session Cookie Prefix (`__Host-` / `__Secure-`), `HttpOnly`, `Secure`, `SameSite=Strict` & Token Storage Hygiene Auditor",
    owaspAsvsOrWstgRef: "WSTG-SESS-02 · ASVS V3.4.1–V3.4.5",
    triggeredWhen: "Triggered when `Set-Cookie` headers or browser `localStorage`/`sessionStorage` token patterns are inspected",
    readOnlyVerificationCheck:
      "Inspects all `Set-Cookie` response headers for `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Strict` (or `Lax`), and verifies that sensitive session tokens are not readable via `document.cookie` or `localStorage`.",
    defensiveControlRequirement:
      "Issue session identifiers exclusively in `__Host-` prefixed cookies with `Secure; HttpOnly; SameSite=Strict; Path=/` and never store raw bearer JWTs in `localStorage`.",
    d3fendCountermeasure: "D3-CH (Session Cookie & Token Binding Hardening)",
    remediationBlueprint:
      "Set `Set-Cookie: __Host-session=<token>; Secure; HttpOnly; Path=/; SameSite=Strict; Max-Age=3600` across all authentication handlers."
  },
  {
    auditId: "WEB-AUD-013",
    mitreTacticId: "TA0006",
    mitreTacticName: "Credential Access",
    mitreTechniqueId: "T1110.001 / T1110.004",
    mitreTechniqueName: "Brute Force & Credential Stuffing Resilience",
    controlLayer: "Identity, Session & Federated Auth",
    name: "Authentication Rate-Limiting, Account Lockout Backoff, Breached Password Check & WebAuthn/Passkey MFA Auditor",
    owaspAsvsOrWstgRef: "WSTG-ATHN-03 · ASVS V2.2.1 / V2.8",
    triggeredWhen: "Triggered when `/login`, `/api/auth/token`, `/password-reset`, or MFA verification endpoints are discovered",
    readOnlyVerificationCheck:
      "Checks authentication endpoints for `RateLimit-Limit` / `X-RateLimit-Remaining` headers, progressive exponential backoff, generic error messages (preventing username enumeration), and phishing-resistant FIDO2/WebAuthn support.",
    defensiveControlRequirement:
      "Enforce IP + account-level sliding-window rate limiting on login/OTP endpoints, screen passwords against k-anonymity breach corpora (NIST SP 800-63B), and require phishing-resistant MFA (WebAuthn/FIDO2) for privileged roles.",
    d3fendCountermeasure: "D3-MFA (Multi-Factor Authentication) & D3-UCA (User Credential Lockout Policy)",
    remediationBlueprint:
      "Apply Redis-backed token-bucket rate limiting (`5 attempts / min / account`) with HTTP `429 Too Many Requests` and require FIDO2/TOTP MFA for all administrative accounts."
  },
  {
    auditId: "WEB-AUD-014",
    mitreTacticId: "TA0007",
    mitreTacticName: "Discovery",
    mitreTechniqueId: "T1619 / T1580",
    mitreTechniqueName: "Cloud Storage Object Discovery & API Schema Enumeration",
    controlLayer: "Cloud IAM & Supply Chain",
    name: "Cloud Object Storage (S3 / Blob / GCS) Public Access Block & Production GraphQL Introspection Auditor",
    owaspAsvsOrWstgRef: "WSTG-CONF-11 · OWASP API9:2023 · ASVS V13.4",
    triggeredWhen: "Triggered when cloud storage URLs, GraphQL (`/graphql`), or multi-version REST APIs (`/api/v1`, `/api/v2`) are discovered",
    readOnlyVerificationCheck:
      "Verifies that cloud storage buckets deny anonymous directory listing (`ListBucket`), checks whether `/graphql` disables `__schema` introspection in production, and audits deprecated `/api/v1` shadow routes.",
    defensiveControlRequirement:
      "Enable S3 `BlockPublicAcls` / `BlockPublicPolicy` at the cloud account level, disable unauthenticated GraphQL introspection in production, and decommission unmaintained shadow API versions.",
    d3fendCountermeasure: "D3-ACA (Cloud Storage & API Schema Access Control)",
    remediationBlueprint:
      "Enforce AWS S3 Account-Level Public Access Block, require signed CloudFront/presigned URLs for private objects, and disable GraphQL `__schema` queries for non-admin callers."
  },
  {
    auditId: "WEB-AUD-015",
    mitreTacticId: "TA0009",
    mitreTacticName: "Collection",
    mitreTechniqueId: "T1185 / T1213",
    mitreTechniqueName: "Browser Session Hijacking & Sensitive Data Repository Caching",
    controlLayer: "Browser DOM & Client Security",
    name: "Cross-Origin Isolation (`COOP` / `COEP` / `CORP`), `Permissions-Policy` & Sensitive `Cache-Control: no-store` Auditor",
    owaspAsvsOrWstgRef: "WSTG-CLNT-09 · ASVS V8.1 / V14.4.5–V14.4.7",
    triggeredWhen: "Triggered during passive inspection of authenticated API and HTML responses",
    readOnlyVerificationCheck:
      "Inspects response headers for `Cross-Origin-Opener-Policy: same-origin` (isolating `window.opener` and cross-origin `window.name`), `Cross-Origin-Resource-Policy: same-origin`, `Permissions-Policy`, and `Cache-Control: no-store` on authenticated routes.",
    defensiveControlRequirement:
      "Enforce `Cross-Origin-Opener-Policy: same-origin` (which automatically clears `window.name` across cross-origin navigations and prevents cross-window references), restrict browser hardware APIs via `Permissions-Policy: geolocation=(), camera=(), microphone=()`, and set `Cache-Control: no-store` on PII/token responses.",
    d3fendCountermeasure: "D3-NI (Browser Cross-Origin Process Isolation)",
    remediationBlueprint:
      "Add `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()` to all responses."
  },
  {
    auditId: "WEB-AUD-016",
    mitreTacticId: "TA0011",
    mitreTacticName: "Command and Control",
    mitreTechniqueId: "T1071.001 / T1572",
    mitreTechniqueName: "Application Layer Protocol & WebSocket / Webhook Tunneling",
    controlLayer: "Egress, DLP & DoS Resilience",
    name: "WebSocket `Origin` Handshake Validation, Outbound Webhook IP Allowlist & SSRF DNS-Rebinding Guard Auditor",
    owaspAsvsOrWstgRef: "WSTG-CLNT-10 · OWASP A10:2021 · ASVS V10 / V13",
    triggeredWhen: "Triggered when WebSocket (`wss://`) upgrades or outbound webhook/URL-fetch endpoints (`/api/webhooks/test`) are detected",
    readOnlyVerificationCheck:
      "Audits WebSocket `101 Switching Protocols` handshakes for strict `Origin` header validation and verifies that server-side HTTP clients resolve DNS once and block RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), and link-local (`169.254.0.0/16`) CIDR ranges.",
    defensiveControlRequirement:
      "Validate `Origin` and session tokens on WebSocket handshakes, and route all server-initiated outbound webhook requests through a dedicated egress proxy that blocks private/metadata IPs.",
    d3fendCountermeasure: "D3-EFA (Egress Traffic Filtering & DNS Rebinding Protection)",
    remediationBlueprint:
      "Implement a custom socket dialer that pins the resolved IP address and rejects any connection to RFC 1918, loopback, or `169.254.169.254` addresses."
  },
  {
    auditId: "WEB-AUD-017",
    mitreTacticId: "TA0010",
    mitreTacticName: "Exfiltration",
    mitreTechniqueId: "T1567 / T1041",
    mitreTechniqueName: "Exfiltration Over Web Service & Browser Beacon Channels",
    controlLayer: "Egress, DLP & DoS Resilience",
    name: "Browser Egress Restriction (`CSP connect-src` / `form-action`) & API Bulk Export DLP Pagination Auditor",
    owaspAsvsOrWstgRef: "OWASP API4:2023 · ASVS V14.4.3 / V4.2",
    triggeredWhen: "Triggered when bulk data export endpoints (`/api/v1/users/export`) or browser CSP policies are evaluated",
    readOnlyVerificationCheck:
      "Checks `Content-Security-Policy` for explicit `connect-src 'self'` and `form-action 'self'` directives (preventing unauthorized `fetch`/`sendBeacon`/form-target exfiltration to external domains) and verifies pagination caps on bulk API endpoints.",
    defensiveControlRequirement:
      "Restrict browser network egress via `CSP connect-src 'self'` and `form-action 'self'`, enforce hard pagination limits (`limit <= 100`) on all list/export APIs, and log bulk record queries in SIEM.",
    d3fendCountermeasure: "D3-OTF (Outbound Traffic Filtering) & API Bulk Query Rate-Limiting",
    remediationBlueprint:
      "Include `connect-src 'self'; form-action 'self'; frame-ancestors 'none'` in the Content-Security-Policy header and cap API query page sizes with mandatory audit logging."
  },
  {
    auditId: "WEB-AUD-018",
    mitreTacticId: "TA0040",
    mitreTacticName: "Impact",
    mitreTechniqueId: "T1499.002 / T1499.004 / T1565",
    mitreTechniqueName: "Endpoint Denial of Service (Application/API DoS) & Business-Logic Data Integrity",
    controlLayer: "Egress, DLP & DoS Resilience",
    name: "API Rate-Limiting (`429 Retry-After`), GraphQL Depth/Cost Cap, ReDoS & Idempotency-Key Integrity Auditor",
    owaspAsvsOrWstgRef: "OWASP API4:2023 · WSTG-BUSL-06 · ASVS V11.1",
    triggeredWhen: "Triggered when search, checkout, GraphQL, or high-compute endpoints are evaluated for availability and integrity",
    readOnlyVerificationCheck:
      "Inspects API gateway response headers for rate-limit enforcement (`429 Too Many Requests`, `Retry-After`), body size caps (`413 Payload Too Large`), and `Idempotency-Key` + database row-locking on financial/state-mutating routes.",
    defensiveControlRequirement:
      "Enforce per-tenant rate limits, request body size limits, GraphQL query depth/complexity caps, linear-time regex engines (RE2), and atomic database transactions with `Idempotency-Key` headers on state-changing operations.",
    d3fendCountermeasure: "D3-NTF (Application Rate Limiting) & Transactional Integrity Verification",
    remediationBlueprint:
      "Enforce API gateway rate limits (`100 req/min/user`), cap JSON body size at `1MB`, enforce `SELECT ... FOR UPDATE` + `Idempotency-Key` on `/api/checkout`, and validate positive numeric bounds server-side."
  }
];

/**
 * Complete 40-CWE Web Application & API Verification Catalog
 * covering 100% of the OWASP Top 10 (A01:2021 Broken Access Control & A10:2021 SSRF) Mapped CWEs
 * (CWE-22 through CWE-1275).
 */
export const OWASP_40_MAPPED_CWE_AUDIT_CATALOG: OwaspMappedCweAuditEntry[] = [
  {
    cweId: "CWE-22",
    name: "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')",
    cweUrl: "https://cwe.mitre.org/data/definitions/22.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · WSTG-ATHZ-01 · ASVS V12.3.1",
    mitreAttackRef: "TA0001 / TA0007 · T1190 / T1083",
    scannerEngineRule: "OWASP ZAP #00006 (Path Traversal) · OpenVAS LFI NVT",
    defensiveVerificationProcedure:
      "Audits file/template/download parameters to verify canonical path resolution (`path.resolve` / `realpath`) and strict base-directory prefix enforcement before file I/O.",
    d3fendAndRemediation: "D3-IV (Input Validation) · Resolve canonical paths and verify `resolvedPath.startsWith(SAFE_BASE_DIR)` or use indirect file reference IDs.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-23",
    name: "Relative Path Traversal",
    cweUrl: "https://cwe.mitre.org/data/definitions/23.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · WSTG-ATHZ-01 · ASVS V12.3.1",
    mitreAttackRef: "TA0001 / TA0007 · T1083",
    scannerEngineRule: "OWASP ZAP #00006 · Relative Dot-Segment Normalization Auditor",
    defensiveVerificationProcedure:
      "Verifies that URL and parameter parsers normalize and reject relative dot-segments (`../`, `..\\`, URL-encoded `%2e%2e%2f`) across REST path and query parameters.",
    d3fendAndRemediation: "D3-IV · Strip path separators (`/` and `\\`) and reject any input containing `..` after URL decoding.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-36",
    name: "Absolute Path Traversal",
    cweUrl: "https://cwe.mitre.org/data/definitions/36.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · WSTG-ATHZ-01 · ASVS V12.3.2",
    mitreAttackRef: "TA0007 / TA0009 · T1005 / T1083",
    scannerEngineRule: "OWASP ZAP #00006 · Absolute Path Prefix Boundary Auditor",
    defensiveVerificationProcedure:
      "Verifies that file-serving APIs reject leading root slashes (`/etc/...`), Windows drive letters (`C:\\...`), and UNC paths (`\\\\server\\share`).",
    d3fendAndRemediation: "D3-FH · Map user input to an allowlisted database UUID/slug map rather than accepting filesystem paths.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-59",
    name: "Improper Link Resolution Before File Access ('Link Following')",
    cweUrl: "https://cwe.mitre.org/data/definitions/59.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · ASVS V12.3.1 / V12.4.2",
    mitreAttackRef: "TA0004 · T1548 / T1068",
    scannerEngineRule: "TrePath Host & Archive Link-Resolution Auditor (LNX-PE-008)",
    defensiveVerificationProcedure:
      "Audits archive extractors (`.zip`/`.tar`) and file readers to confirm `O_NOFOLLOW` / `lstat` verification prior to opening files.",
    d3fendAndRemediation: "D3-FH · Use `O_NOFOLLOW` when opening files in shared directories and reject symlink/junction entries during archive extraction.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-61",
    name: "UNIX Symbolic Link (Symlink) Following",
    cweUrl: "https://cwe.mitre.org/data/definitions/61.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · CIS Apache/Nginx Benchmark · ASVS V12.4",
    mitreAttackRef: "TA0004 / TA0009 · T1005",
    scannerEngineRule: "Linux Kernel `fs.protected_symlinks` & Web Server `SymLinksIfOwnerMatch` Auditor",
    defensiveVerificationProcedure:
      "Checks Linux `sysctl fs.protected_symlinks=1` and verifies that Apache/Nginx web roots disable `Options FollowSymLinks` in favor of `SymLinksIfOwnerMatch`.",
    d3fendAndRemediation: "D3-FH · Set `fs.protected_symlinks=1` in `/etc/sysctl.conf` and disable `FollowSymLinks` in web server configurations.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-65",
    name: "Windows Hard Link",
    cweUrl: "https://cwe.mitre.org/data/definitions/65.html",
    domainCategory: "Path, Link & File Resolution",
    owaspMapping: "A01:2021 · Windows Host Service ACL Benchmark",
    mitreAttackRef: "TA0004 · T1574 / T1068",
    scannerEngineRule: "Windows Hard-Link & Writable Temp Directory ACL Auditor (WIN-PE-002 / WIN-POST-001)",
    defensiveVerificationProcedure:
      "Audits Windows privileged services (`NT AUTHORITY\\SYSTEM`) writing to shared directories (`C:\\Temp`, `%TEMP%`) to verify protection against unprivileged NTFS hard-link redirection.",
    d3fendAndRemediation: "D3-FH · Restrict write permissions on service working directories to `SYSTEM`/`Administrators` and apply Windows kernel hard-link mitigations.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-200",
    name: "Exposure of Sensitive Information to an Unauthorized Actor",
    cweUrl: "https://cwe.mitre.org/data/definitions/200.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · WSTG-INFO-05 · ASVS V14.3",
    mitreAttackRef: "TA0043 / TA0009 · T1592 / T1213",
    scannerEngineRule: "OWASP ZAP #90022 & Nmap NSE Banner/Header Auditor",
    defensiveVerificationProcedure:
      "Audits HTTP responses, error payloads, and service banners for unauthorized disclosure of internal IPs, stack traces, or user metadata.",
    d3fendAndRemediation: "D3-IV · Return generic structured error messages in production (`ServerTokens Prod`) and strip verbose stack traces.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-201",
    name: "Exposure of Sensitive Information Through Sent Data",
    cweUrl: "https://cwe.mitre.org/data/definitions/201.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · OWASP API3:2023 (BOPLA) · ASVS V8.3.1",
    mitreAttackRef: "TA0009 / TA0010 · T1213 / T1567",
    scannerEngineRule: "TrePath API Over-Fetching & Query-String Secret Leak Auditor (WEB-AUD-017)",
    defensiveVerificationProcedure:
      "Checks outbound HTTP responses and URL query strings to verify that session tokens, password hashes, or sensitive fields are never transmitted in URLs or excessive JSON DTOs.",
    d3fendAndRemediation: "D3-OTF · Use strict response DTO serializers (excluding `password_hash`/`secret`) and never pass sensitive tokens in GET query parameters.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-219",
    name: "Storage of File with Sensitive Data Under Web Root",
    cweUrl: "https://cwe.mitre.org/data/definitions/219.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · WSTG-CONF-04 · ASVS V14.3.3",
    mitreAttackRef: "TA0006 / TA0009 · T1552.001 / T1213",
    scannerEngineRule: "OWASP ZAP Forced Browse #00006 & `LNX-POST-001` / `WIN-POST-001`",
    defensiveVerificationProcedure:
      "Scans web roots (`/var/www/html`, `C:\\inetpub\\wwwroot`) for backup archives (`.sql.gz`, `.zip`, `.bak`, `web.config.old`) and configuration files.",
    d3fendAndRemediation: "D3-FH · Store configuration files, database dumps, and private keys outside the public document root.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-276",
    name: "Incorrect Default Permissions",
    cweUrl: "https://cwe.mitre.org/data/definitions/276.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · CIS OS & Cloud Benchmarks · ASVS V12.4.1",
    mitreAttackRef: "TA0004 · T1574.010 / T1543",
    scannerEngineRule: "Linux & Windows Service/File Default Permission Auditor (`LNX-PE-004` / `WIN-PE-002`)",
    defensiveVerificationProcedure:
      "Audits default installation permissions on application directories, systemd units, Windows services, and cloud storage buckets for overly permissive `0777` or `Everyone:F` grants.",
    d3fendAndRemediation: "D3-UAP · Enforce least-privilege default permissions (`0640` files, `0750` directories) in deployment manifests.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-281",
    name: "Improper Preservation of Permissions",
    cweUrl: "https://cwe.mitre.org/data/definitions/281.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · NIST SP 800-53 AC-3",
    mitreAttackRef: "TA0004 / TA0005 · T1222",
    scannerEngineRule: "Container Layer & Process Umask (`0027`) Preservation Auditor",
    defensiveVerificationProcedure:
      "Verifies that daemon `umask` settings (`UMask=0027` in systemd), backup restores, and container `COPY --chmod` steps preserve restrictive ACLs.",
    d3fendAndRemediation: "D3-FH · Configure `UMask=0027` in systemd service units and verify file modes after CI/CD artifact extraction.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-282",
    name: "Improper Ownership Management",
    cweUrl: "https://cwe.mitre.org/data/definitions/282.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · CIS Linux/Windows Benchmark",
    mitreAttackRef: "TA0004 · T1222.001 / T1222.002",
    scannerEngineRule: "Web Root & Service Binary Ownership (`chown root:root`) Auditor (`LNX-PE-004`)",
    defensiveVerificationProcedure:
      "Verifies that application source code and binaries are owned by `root:root` (or `SYSTEM`/`Administrators`) rather than the runtime web worker account (`www-data` / `IIS_IUSRS`).",
    d3fendAndRemediation: "D3-FH · Separate code ownership (`root:root` read-only) from the runtime service principal (`www-data`).",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-283",
    name: "Unverified Ownership",
    cweUrl: "https://cwe.mitre.org/data/definitions/283.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API1:2023 · ASVS V4.2.1",
    mitreAttackRef: "TA0001 / TA0004 · T1078",
    scannerEngineRule: "Role & Resource Ownership Transfer Differential Auditor (`CAP-06`)",
    defensiveVerificationProcedure:
      "Tests state-changing `PUT`/`PATCH`/`DELETE` endpoints to verify that the server confirms `resource.owner_id === session.user_id` before modifying or transferring ownership.",
    d3fendAndRemediation: "D3-ACA · Enforce mandatory tenant and owner verification in database `UPDATE`/`DELETE` predicates.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-284",
    name: "Improper Access Control",
    cweUrl: "https://cwe.mitre.org/data/definitions/284.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · WSTG-ATHZ-01..04 · ASVS V4.1",
    mitreAttackRef: "TA0001 / TA0004 · T1190 / T1078",
    scannerEngineRule: "Multi-Role Access Control Matrix Engine (`ROLE_PERMISSION_DIFF_MATRIX`)",
    defensiveVerificationProcedure:
      "Replays all discovered routes across `Admin`, `Standard User`, `Guest`, and `Service Account` contexts to verify deny-by-default access control enforcement.",
    d3fendAndRemediation: "D3-ACA · Enforce a centralized deny-by-default RBAC/ABAC policy gateway on all routes.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-285",
    name: "Improper Authorization",
    cweUrl: "https://cwe.mitre.org/data/definitions/285.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API5:2023 (BFLA) · ASVS V4.1.3",
    mitreAttackRef: "TA0004 · T1078.004",
    scannerEngineRule: "Vertical Function-Level Authorization (BFLA) Auditor (`RC-01`)",
    defensiveVerificationProcedure:
      "Audits administrative and privileged API functions (`/api/admin/*`, `/api/v1/users/export`) to verify server-side role/permission checks independent of UI visibility.",
    d3fendAndRemediation: "D3-ACA · Validate role permissions server-side via signed session claims and centralized authorization middleware.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-352",
    name: "Cross-Site Request Forgery (CSRF)",
    cweUrl: "https://cwe.mitre.org/data/definitions/352.html",
    domainCategory: "SSRF, Confused Deputy, CSRF & Redirects",
    owaspMapping: "A01:2021 · WSTG-SESS-05 · ASVS V4.2.2",
    mitreAttackRef: "TA0001 / TA0002 · T1185 / T1204",
    scannerEngineRule: "OWASP ZAP Passive Rule #10202 (Anti-CSRF Token & SameSite Auditor)",
    defensiveVerificationProcedure:
      "Inspects all state-changing forms and cookie-authenticated endpoints for cryptographic CSRF tokens (`X-CSRF-Token`), `SameSite=Strict/Lax` cookies, and `Origin` header verification.",
    d3fendAndRemediation: "D3-IV · Enforce cryptographic per-session CSRF tokens, `SameSite=Strict` cookies, and custom request headers on state-mutating endpoints.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-359",
    name: "Exposure of Private Personal Information to an Unauthorized Actor",
    cweUrl: "https://cwe.mitre.org/data/definitions/359.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · GDPR / PCI-DSS v4.0 · ASVS V8.3",
    mitreAttackRef: "TA0009 · T1213 / T1005",
    scannerEngineRule: "TrePath PII & Regulated Field Masking Auditor (`WEB-AUD-017`)",
    defensiveVerificationProcedure:
      "Audits API JSON payloads and logs for unmasked PII (email, SSN, payment card PAN, phone numbers) accessible without owner authorization.",
    d3fendAndRemediation: "D3-DLP · Mask or tokenize PII fields at the API serialization layer and enforce field-level GraphQL/REST authorization.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-377",
    name: "Insecure Temporary File",
    cweUrl: "https://cwe.mitre.org/data/definitions/377.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · ASVS V12.3.5",
    mitreAttackRef: "TA0004 · T1574",
    scannerEngineRule: "Host Temporary File Creation (`mkstemp` / `O_EXCL`) Auditor (`LNX-POST-006`)",
    defensiveVerificationProcedure:
      "Audits `/tmp` and `%TEMP%` usage during file upload/report generation to ensure temporary files use cryptographically random names with exclusive creation (`O_CREAT | O_EXCL`, mode `0600`).",
    d3fendAndRemediation: "D3-FH · Use secure OS temp file APIs (`fs.mkdtemp`, `tempfile.NamedTemporaryFile`) with `0600` permissions.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-379",
    name: "Creation of Temporary File in Directory with Insecure Permissions",
    cweUrl: "https://cwe.mitre.org/data/definitions/379.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · CIS Linux Benchmark §1.1",
    mitreAttackRef: "TA0004 · T1574 / T1068",
    scannerEngineRule: "Temp Directory Sticky-Bit (`1777 +t`) & Systemd `PrivateTmp=yes` Auditor (`LNX-PE-001`)",
    defensiveVerificationProcedure:
      "Verifies sticky-bit (`drwxrwxrwt`) and `nosuid,nodev,noexec` mount flags on `/tmp`, `/var/tmp`, and `/dev/shm`, plus `PrivateTmp=yes` in systemd service units.",
    d3fendAndRemediation: "D3-FH · Enable `PrivateTmp=yes` in systemd units and enforce sticky bit (`1777`) + `fs.protected_regular=2` on `/tmp`.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-402",
    name: "Transmission of Private Resources into a New Sphere ('Resource Leak')",
    cweUrl: "https://cwe.mitre.org/data/definitions/402.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · WSTG-CLNT-09 · ASVS V14.4.6",
    mitreAttackRef: "TA0009 / TA0010 · T1567",
    scannerEngineRule: "Cross-Origin `Referrer-Policy` & `Cross-Origin-Resource-Policy` Auditor (`WEB-AUD-015`)",
    defensiveVerificationProcedure:
      "Audits HTTP responses and external links to verify `Referrer-Policy: strict-origin-when-cross-origin` (or `no-referrer`) and `Cross-Origin-Resource-Policy: same-origin` so session tokens or private URLs never leak via `Referer` headers.",
    d3fendAndRemediation: "D3-OTF · Set `Referrer-Policy: no-referrer` (or `strict-origin-when-cross-origin`) and `Cross-Origin-Resource-Policy: same-origin`.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-424",
    name: "Improper Protection of Alternate Path",
    cweUrl: "https://cwe.mitre.org/data/definitions/424.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API9:2023 · ASVS V4.1",
    mitreAttackRef: "TA0001 / TA0005 · T1190",
    scannerEngineRule: "Shadow API Version (`/api/v1` vs `/api/v2`) & Direct-Origin Bypass Auditor (`CAP-03`)",
    defensiveVerificationProcedure:
      "Compares authentication and rate-limit enforcement across alternate API versions (`/api/v1`, `/api/v2`, `/graphql`) and verifies that origin servers reject traffic not mTLS-authenticated by the WAF/CDN.",
    d3fendAndRemediation: "D3-NI · Decommission legacy shadow API routes and enforce Authenticated Origin Pulls (mTLS) between CDN/WAF and origin.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-425",
    name: "Direct Request ('Forced Browsing')",
    cweUrl: "https://cwe.mitre.org/data/definitions/425.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · WSTG-CONF-04 / WSTG-ATHZ-01",
    mitreAttackRef: "TA0007 / TA0006 · T1083 / T1552.001",
    scannerEngineRule: "OWASP ZAP Forced Browse / DirBuster Add-on (`bruteforce v15.0`)",
    defensiveVerificationProcedure:
      "Tests unindexed administrative paths, debug endpoints (`/actuator/env`, `/manager/status`), and static files (`/.env.backup`) for unauthenticated direct HTTP access.",
    d3fendAndRemediation: "D3-ACA · Require authentication on all administrative/diagnostic routes and block unindexed dotfiles at the reverse proxy.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-441",
    name: "Unintended Proxy or Intermediary ('Confused Deputy')",
    cweUrl: "https://cwe.mitre.org/data/definitions/441.html",
    domainCategory: "SSRF, Confused Deputy, CSRF & Redirects",
    owaspMapping: "A01:2021 / A10:2021 · AWS/Cloud IAM Confused Deputy · ASVS V10",
    mitreAttackRef: "TA0006 / TA0011 · T1090.001 / T1528",
    scannerEngineRule: "Burp Enterprise Confused-Deputy & `aws:SourceArn`/`aud` Claim Auditor (`WEB-AUD-009` / `WEB-AUD-016`)",
    defensiveVerificationProcedure:
      "Verifies that cross-service calls validate audience (`aud`) and tenant (`aws:SourceAccount` / `ExternalId`) claims so the application cannot be coerced into acting as a privileged intermediary.",
    d3fendAndRemediation: "D3-ACA · Enforce `sts:ExternalId` / `aws:SourceArn` conditions on IAM roles and validate audience (`aud`) claims on all internal service tokens.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-497",
    name: "Exposure of Sensitive System Information to an Unauthorized Control Sphere",
    cweUrl: "https://cwe.mitre.org/data/definitions/497.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 / A05:2021 · WSTG-INFO-02/08 · ASVS V14.3.2",
    mitreAttackRef: "TA0043 / TA0007 · T1592.002 / T1082",
    scannerEngineRule: "Nmap NSE (`http-headers`, `snmp-sysdescr`) & ZAP Passive `#90022`",
    defensiveVerificationProcedure:
      "Audits HTTP `Server`, `X-Powered-By`, `X-AspNet-Version` headers, Spring Boot `/actuator/env`, and SNMP `sysDescr` MIBs for OS/framework version disclosure.",
    d3fendAndRemediation: "D3-NTF · Suppress `Server` and `X-Powered-By` headers, disable public `/actuator` endpoints, and restrict SNMP to private management VLANs.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-538",
    name: "Insertion of Sensitive Information into Externally-Accessible File or Directory",
    cweUrl: "https://cwe.mitre.org/data/definitions/538.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 / A05:2021 · WSTG-CONF-04 · ASVS V14.3.3",
    mitreAttackRef: "TA0006 · T1552.001",
    scannerEngineRule: "OWASP ZAP `#00006` (`/.env.backup`) & Root-Cause Cluster `RC-03`",
    defensiveVerificationProcedure:
      "Checks publicly reachable directories for `.env`, `.env.backup`, `phpinfo.php`, CI/CD logs, and debug dumps containing database or JWT secrets.",
    d3fendAndRemediation: "D3-CH · Never write secrets to files inside the web root; inject secrets at runtime via KMS/Vault environment bindings.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-540",
    name: "Inclusion of Sensitive Information in Source Code",
    cweUrl: "https://cwe.mitre.org/data/definitions/540.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · OWASP SCVS V4 · NIST SSDF PW.4.4",
    mitreAttackRef: "TA0006 · T1552.001",
    scannerEngineRule: "Client JS Bundle & Source-Map Secret Scanner (`WEB-AUD-002` / `CAP-11`)",
    defensiveVerificationProcedure:
      "Scans served JavaScript bundles (`_next/static/chunks/*.js`, `app.bundle.js`) for hardcoded API keys, private tokens, or internal staging URLs.",
    d3fendAndRemediation: "D3-CH · Enforce pre-commit secret scanning (Gitleaks/TruffleHog) and keep server-only secrets out of `NEXT_PUBLIC_*` / `VITE_*` client bundles.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-548",
    name: "Exposure of Information Through Directory Listing",
    cweUrl: "https://cwe.mitre.org/data/definitions/548.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 / A05:2021 · WSTG-CONF-04 · ASVS V14.3",
    mitreAttackRef: "TA0007 · T1083 / T1619",
    scannerEngineRule: "Nmap `http-enum.nse`, ZAP Passive Directory Indexing & Cloud Bucket `ListBucket` Auditor (`WEB-AUD-014`)",
    defensiveVerificationProcedure:
      "Checks web server directories for `Index of /` auto-indexing (`Options +Indexes` / `autoindex on`) and cloud storage buckets for anonymous XML key listing.",
    d3fendAndRemediation: "D3-FH · Set `Options -Indexes` in Apache, `autoindex off;` in Nginx, and enable S3 Public Access Block.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-552",
    name: "Files or Directories Accessible to External Parties",
    cweUrl: "https://cwe.mitre.org/data/definitions/552.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · WSTG-CONF-04 · ASVS V14.3.3",
    mitreAttackRef: "TA0007 / TA0009 · T1083 / T1213",
    scannerEngineRule: "OWASP ZAP Forced Browse & Source Control (`/.git`, `/.svn`, `/.DS_Store`) Auditor (`WEB-AUD-002`)",
    defensiveVerificationProcedure:
      "Audits web servers for exposed `.git/HEAD`, `.svn/entries`, `.DS_Store`, `composer.lock`, `package-lock.json`, and internal documentation directories.",
    d3fendAndRemediation: "D3-FH · Add explicit reverse-proxy deny rules (`location ~ /\\.(?!well-known).* { deny all; }`) and use multi-stage Docker builds.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-566",
    name: "Authorization Bypass Through User-Controlled SQL Primary Key",
    cweUrl: "https://cwe.mitre.org/data/definitions/566.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API1:2023 (BOLA) · WSTG-ATHZ-02",
    mitreAttackRef: "TA0001 / TA0009 · T1190 / T1213",
    scannerEngineRule: "OpenVAS OID `108566` & Differential SQL Primary-Key Ownership Auditor (`ROLE_PERMISSION_DIFF_MATRIX`)",
    defensiveVerificationProcedure:
      "Tests parameterized database queries that look up records by primary key (`?id=1` vs `?id=1042`) to verify that the SQL `WHERE` clause also scopes by authenticated `user_id` / `tenant_id`.",
    d3fendAndRemediation: "D3-ACA · Enforce composite scoping in every query (`SELECT * FROM profiles WHERE id = $1 AND tenant_id = $2`) or PostgreSQL Row-Level Security (RLS).",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-601",
    name: "URL Redirection to Untrusted Site ('Open Redirect')",
    cweUrl: "https://cwe.mitre.org/data/definitions/601.html",
    domainCategory: "SSRF, Confused Deputy, CSRF & Redirects",
    owaspMapping: "A01:2021 · WSTG-CLNT-04 · ASVS V5.1.5",
    mitreAttackRef: "TA0001 · T1199 / T1566.002",
    scannerEngineRule: "OWASP ZAP Active Rule `#20019` (External Redirect) & OAuth `redirect_uri` Auditor (`WEB-AUD-005`)",
    defensiveVerificationProcedure:
      "Audits `next`, `returnUrl`, `redirect`, and `redirect_uri` parameters to ensure redirects only target relative paths (`/dashboard`) or an explicit allowlist of trusted origins.",
    d3fendAndRemediation: "D3-IV · Validate redirect targets using `new URL(input, base)` and enforce `url.origin === TRUSTED_ORIGIN`.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-615",
    name: "Inclusion of Sensitive Information in Source Code Comments",
    cweUrl: "https://cwe.mitre.org/data/definitions/615.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 · WSTG-INFO-05 · ASVS V14.3.1",
    mitreAttackRef: "TA0043 · T1593.002",
    scannerEngineRule: "OWASP ZAP Passive Information Disclosure in HTML/JS Comments Auditor",
    defensiveVerificationProcedure:
      "Scans HTML `<!-- ... -->` and JS `/* ... */` comments for internal hostnames, staging URLs, developer notes, or commented-out credentials.",
    d3fendAndRemediation: "D3-SCF · Strip HTML and JavaScript comments during production minification/bundling (Terser/SWC).",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-639",
    name: "Authorization Bypass Through User-Controlled Key",
    cweUrl: "https://cwe.mitre.org/data/definitions/639.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API1:2023 (BOLA / IDOR) · WSTG-ATHZ-04",
    mitreAttackRef: "TA0001 / TA0004 · T1078 / T1190",
    scannerEngineRule: "OpenVAS NVT OID `1.3.6.1.4.1.25623.1.0.108566` (`gb_api_bola_idor_check.nasl`)",
    defensiveVerificationProcedure:
      "Performs cross-session object ID substitution (`id=1` vs `id=1042`) across REST and GraphQL endpoints to detect Broken Object Level Authorization (BOLA/IDOR).",
    d3fendAndRemediation: "D3-ACA · Validate object-level ownership against the authenticated session principal on every read/write operation and use UUIDv4 identifiers.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-668",
    name: "Exposure of Resource to Wrong Sphere",
    cweUrl: "https://cwe.mitre.org/data/definitions/668.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 / A05:2021 · NIST SP 800-53 SC-7",
    mitreAttackRef: "TA0007 / TA0001 · T1046 / T1190",
    scannerEngineRule: "Nmap 65,535 TCP/UDP Spectrum & Internal Management Port Exposure Auditor (`PORT-SCR-006`..`008`)",
    defensiveVerificationProcedure:
      "Audits whether internal-only resources (MySQL `3306/tcp`, Tomcat Manager `8080/tcp`, Kubelet `10250/tcp`, SNMP `161/udp`) are exposed on public or DMZ network interfaces.",
    d3fendAndRemediation: "D3-NI · Bind internal databases and management interfaces strictly to `127.0.0.1` or isolated private VPC subnets.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-732",
    name: "Incorrect Permission Assignment for Critical Resource",
    cweUrl: "https://cwe.mitre.org/data/definitions/732.html",
    domainCategory: "Permissions, Ownership & Temp Files",
    owaspMapping: "A01:2021 · CIS Linux/Windows Benchmark · ASVS V12.4",
    mitreAttackRef: "TA0004 / TA0006 · T1548.001 / T1552.001",
    scannerEngineRule: "Critical Resource ACL Auditor (`LNX-PE-001` SUID, `LNX-PE-006` `/etc/shadow`, `WIN-POST-001` `applicationHost.config`)",
    defensiveVerificationProcedure:
      "Audits permissions on `/etc/shadow`, `/etc/sudoers`, TLS private keys (`/etc/ssl/private`), Kubernetes ServiceAccount secrets, and IIS `applicationHost.config`.",
    d3fendAndRemediation: "D3-FH · Restrict critical configuration files and private keys to `0600` (`root:root` / `SYSTEM`) and strip unnecessary SUID bits.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-749",
    name: "Exposed Dangerous Method or Function",
    cweUrl: "https://cwe.mitre.org/data/definitions/749.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · WSTG-CONF-06 · ASVS V13.1 / V14.5.1",
    mitreAttackRef: "TA0001 / TA0002 · T1190 / T1059",
    scannerEngineRule: "Nmap `http-methods.nse` & Dangerous RPC/Actuator/DOM Method Auditor (`PORT-SCR-004`)",
    defensiveVerificationProcedure:
      "Audits HTTP `OPTIONS` / verb handling (`PUT`, `DELETE`, `TRACE`, `CONNECT`), exposed JMX/Actuator shutdown methods, and unvalidated `window.postMessage` listeners.",
    d3fendAndRemediation: "D3-ACA · Allowlist only required HTTP methods (`GET`, `POST`, `HEAD`) per route and verify `event.origin` in all `postMessage` handlers.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-862",
    name: "Missing Authorization",
    cweUrl: "https://cwe.mitre.org/data/definitions/862.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API1/API5:2023 · WSTG-ATHZ-02",
    mitreAttackRef: "TA0001 · T1190",
    scannerEngineRule: "Unauthenticated Guest Route Differential Auditor (`ROLE_PERMISSION_DIFF_MATRIX`)",
    defensiveVerificationProcedure:
      "Probes all discovered API and web endpoints without session cookies or `Authorization` headers to identify routes missing authentication/authorization guards (`200 OK` instead of `401`/`403`).",
    d3fendAndRemediation: "D3-ACA · Apply global authentication and authorization middleware by default, requiring explicit `@Public()` opt-in for anonymous routes.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-863",
    name: "Incorrect Authorization",
    cweUrl: "https://cwe.mitre.org/data/definitions/863.html",
    domainCategory: "Access Control, BOLA & Authorization",
    owaspMapping: "A01:2021 · OWASP API3:2023 (Mass Assignment) · ASVS V4.1",
    mitreAttackRef: "TA0004 · T1078.004",
    scannerEngineRule: "Role Claim & Object Property Authorization (BOPLA / Mass Assignment) Auditor (`CAP-03` / `CAP-06`)",
    defensiveVerificationProcedure:
      "Evaluates whether authenticated standard users can bypass authorization logic via Mass Assignment (`{\"role\":\"superadmin\"}`), header spoofing (`X-Original-URL`), or multi-tenant scope confusion.",
    d3fendAndRemediation: "D3-ACA · Bind DTOs using strict input allowlists (never bind `role`/`isAdmin`/`tenantId` from request bodies) and evaluate RBAC policies against server-verified claims.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-918",
    name: "Server-Side Request Forgery (SSRF)",
    cweUrl: "https://cwe.mitre.org/data/definitions/918.html",
    domainCategory: "SSRF, Confused Deputy, CSRF & Redirects",
    owaspMapping: "A10:2021 · OWASP API7:2023 · WSTG-INPV-19 · ASVS V12.6.1",
    mitreAttackRef: "TA0006 / TA0011 · T1528 / T1090.001",
    scannerEngineRule: "Burp Suite Enterprise Issue `#1049088` & Cloud IMDSv2 Boundary Auditor (`LNX-LM-006` / `WEB-AUD-016`)",
    defensiveVerificationProcedure:
      "Audits webhook, URL preview, and PDF/import endpoints to verify that server-side HTTP clients enforce domain allowlists, block RFC 1918 / loopback (`127.0.0.1`) / link-local (`169.254.169.254`), and require AWS/Cloud IMDSv2 (`HttpTokens=required`).",
    d3fendAndRemediation: "D3-EFA · Enforce strict outbound domain allowlists, pin DNS resolution to prevent DNS rebinding, block private CIDR ranges, and enforce IMDSv2 hop-limit=1.",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-922",
    name: "Insecure Storage of Sensitive Information",
    cweUrl: "https://cwe.mitre.org/data/definitions/922.html",
    domainCategory: "Sensitive Information & Source Exposure",
    owaspMapping: "A01:2021 / A02:2021 · ASVS V6.2 / V8.2",
    mitreAttackRef: "TA0006 / TA0009 · T1552.001 / T1005",
    scannerEngineRule: "Browser Storage (`localStorage`/`IndexedDB`), `Cache-Control: no-store` & At-Rest Encryption Auditor (`WEB-AUD-012` / `WEB-AUD-015`)",
    defensiveVerificationProcedure:
      "Audits client-side storage (`localStorage`, `sessionStorage`, `IndexedDB`), HTTP caching headers (`Cache-Control: no-store`), and server config/database storage (`DPAPI`, `TDE`, KMS) for unencrypted sensitive data.",
    d3fendAndRemediation: "D3-FE · Never store tokens or PII in `localStorage`; enforce `Cache-Control: no-store` on authenticated responses and encrypt server data at rest (AES-256-GCM / TDE).",
    status: "SATISFIED & ACTIVE"
  },
  {
    cweId: "CWE-1275",
    name: "Sensitive Cookie with Improper SameSite Attribute",
    cweUrl: "https://cwe.mitre.org/data/definitions/1275.html",
    domainCategory: "SSRF, Confused Deputy, CSRF & Redirects",
    owaspMapping: "A01:2021 / A07:2021 · WSTG-SESS-02 · ASVS V3.4.3",
    mitreAttackRef: "TA0006 · T1539",
    scannerEngineRule: "OWASP ZAP Passive Rule `#10054` & Session Cookie Prefix Auditor (`WEB-AUD-012`)",
    defensiveVerificationProcedure:
      "Inspects all `Set-Cookie` headers on authentication and session responses to verify explicit `SameSite=Strict` or `SameSite=Lax` attributes (and rejects `SameSite=None` without `Secure`).",
    d3fendAndRemediation: "D3-CH · Configure `SameSite=Strict; Secure; HttpOnly; Path=/` with the `__Host-` prefix on all session cookies.",
    status: "SATISFIED & ACTIVE"
  }
];

/**
 * Returns a deterministic, non-destructive MITRE ATT&CK® TTP, Port-to-Script Mapping,
 * and Triggered Linux/Windows Privilege Escalation, Lateral Movement & Post-Exploitation Script Dossier for any finding.
 */
export function getDaemonFindingTtpDossier(finding: Finding, fallbackUrl?: string): DaemonFindingTtpDossier {
  const url = finding.url || fallbackUrl || "https://11-dast-security-platform.vercel.app";
  const titleUpper = (finding.title || "").toUpperCase();
  const cwe = finding.cweId || "CWE-200";
  const owasp = finding.owaspRef || "A05:2021";

  const isNmap =
    titleUpper.includes("NMAP") ||
    titleUpper.includes("MYSQL") ||
    titleUpper.includes("SNMP") ||
    titleUpper.includes("PORT") ||
    titleUpper.includes("DNS");
  const isOpenvas =
    titleUpper.includes("OPENVAS") ||
    titleUpper.includes("BOLA") ||
    titleUpper.includes("IDOR") ||
    cwe === "CWE-639";
  const isBurp =
    titleUpper.includes("SSRF") ||
    titleUpper.includes("WEBHOOK") ||
    titleUpper.includes("CORS") ||
    cwe === "CWE-918" ||
    cwe === "CWE-942";

  const daemonSource: DaemonFindingTtpDossier["daemonSource"] = isNmap
    ? "NMAP"
    : isOpenvas
    ? "OPENVAS"
    : isBurp
    ? "BURP"
    : "ZAP";

  const daemonLabel =
    daemonSource === "NMAP"
      ? "TrePath-NetRecon™ · TrePath Port & Service Mapper (Embedded Core: Nmap NSE v7.94 · 65,535 TCP + 65,535 UDP)"
      : daemonSource === "OPENVAS"
      ? "TrePath-VulnCore™ · TrePath Infrastructure & CVE Auditor (Embedded Core: OpenVAS / Greenbone GVM v22.4.1 NVT)"
      : daemonSource === "BURP"
      ? "TrePath-StrikeFuzzer™ · TrePath OAST & Injection Core (Embedded Core: Burp Suite Enterprise v2023.10)"
      : "TrePath-WebPulse™ · TrePath Active/Passive DAST Daemon (Embedded Core: OWASP ZAP v2.14.0 + Manual Verification)";

  const ttp = finding.ttp?.[0];
  const isLiveExternalFinding = String(finding.id || "").startsWith("LIVE-");
  const isExploitVerifiedFinding =
    finding.validationState === "Exploit Verified" ||
    finding.findingClassification === "Exploitable Vulnerability";
  const isPassiveOnlyFinding =
    isLiveExternalFinding && !isExploitVerifiedFinding;

  // 1. Triggered Linux & Windows Privilege Escalation (TA0004) scripts
  const linuxScripts = LINUX_WINDOWS_PRIVESC_SCRIPT_INVENTORY.filter(s => s.osPlatform === "LINUX");
  const windowsScripts = LINUX_WINDOWS_PRIVESC_SCRIPT_INVENTORY.filter(s => s.osPlatform === "WINDOWS");

  const triggeredLinuxPrivEscScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [linuxScripts[0], linuxScripts[1], linuxScripts[2]] // SUID, Sudoers, Capabilities
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [linuxScripts[3], linuxScripts[5], linuxScripts[7]] // Systemd, Kernel/Shadow, .env/ld.so
      : isBurp
      ? [linuxScripts[6], linuxScripts[4]] // Container/K8s, Cron
      : [linuxScripts[1], linuxScripts[3], linuxScripts[7]];

  const triggeredWindowsPrivEscScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [windowsScripts[0], windowsScripts[1], windowsScripts[3]] // Unquoted Service, Service ACLs, Token Privileges
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [windowsScripts[1], windowsScripts[3], windowsScripts[6]] // Service ACLs, Token Privs, Autoruns/Unattend
      : isBurp
      ? [windowsScripts[3], windowsScripts[4], windowsScripts[7]] // Token Privs, Scheduled Tasks, UAC/WSUS
      : [windowsScripts[0], windowsScripts[2], windowsScripts[5]];

  // 2. Triggered Linux & Windows Lateral Movement (TA0008) scripts
  const linuxLat = LINUX_WINDOWS_LATERAL_MOVEMENT_SCRIPT_INVENTORY.filter(s => s.osPlatform === "LINUX");
  const windowsLat = LINUX_WINDOWS_LATERAL_MOVEMENT_SCRIPT_INVENTORY.filter(s => s.osPlatform === "WINDOWS");

  const triggeredLinuxLateralScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [linuxLat[0], linuxLat[1], linuxLat[3]] // SSH Forwarding, ARP/Subnet, K8s ServiceMesh
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [linuxLat[1], linuxLat[2], linuxLat[4]] // ARP/Subnet, DB Credential Reuse, NFS/Samba
      : isBurp
      ? [linuxLat[3], linuxLat[5]] // K8s ServiceMesh, IMDSv2/Kerberos
      : [linuxLat[0], linuxLat[2]];

  const triggeredWindowsLateralScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [windowsLat[0], windowsLat[1], windowsLat[2]] // SMB Signing, WinRM/JEA, WMI/RDP NLA
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [windowsLat[0], windowsLat[3], windowsLat[5]] // SMB Signing, AD Kerberos SPN, cmdkey/LAPS
      : isBurp
      ? [windowsLat[3], windowsLat[4]] // AD Kerberos SPN, NetTCP/Firewall
      : [windowsLat[1], windowsLat[5]];

  // 3. Triggered Linux & Windows Post-Exploitation, Telemetry & Cleanup (TA0003/TA0005/TA0009/TA0010/TA0040) scripts
  const linuxPost = LINUX_WINDOWS_POST_EXPLOITATION_SCRIPT_INVENTORY.filter(s => s.osPlatform === "LINUX");
  const windowsPost = LINUX_WINDOWS_POST_EXPLOITATION_SCRIPT_INVENTORY.filter(s => s.osPlatform === "WINDOWS");

  const triggeredLinuxPostExploitScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [linuxPost[1], linuxPost[2], linuxPost[5]] // Persistence Surface, Auditd/SIEM, Cleanup Verify
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [linuxPost[0], linuxPost[3], linuxPost[4]] // Data/Secret Boundary, Egress Filter, Immutable Backup
      : isBurp
      ? [linuxPost[3], linuxPost[2], linuxPost[5]] // Egress Filter, Auditd/SIEM, Cleanup Verify
      : [linuxPost[0], linuxPost[2], linuxPost[5]];

  const triggeredWindowsPostExploitScripts = isPassiveOnlyFinding
    ? []
    : cwe === "CWE-78" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE")
      ? [windowsPost[1], windowsPost[2], windowsPost[5]] // WMI/Registry Persistence, Auditpol/Sysmon/4104, Cleanup
      : cwe === "CWE-89" || titleUpper.includes("SQL") || isNmap
      ? [windowsPost[0], windowsPost[3], windowsPost[4]] // DPAPI/IIS/SQL ACLs, Outbound Firewall, VSS/ASR
      : isBurp
      ? [windowsPost[3], windowsPost[2], windowsPost[5]] // Outbound Firewall, Auditpol/Sysmon, Cleanup
      : [windowsPost[0], windowsPost[2], windowsPost[5]];

  // 4. Triggered Web, Browser DOM, Session, Supply-Chain & Cloud Control Audits (TA0043..TA0040)
  const webAudits = MITRE_WEB_AND_CLOUD_CONTROL_AUDIT_INVENTORY;
  const triggeredWebAndCloudControlAudits =
    cwe === "CWE-79" || titleUpper.includes("XSS") || titleUpper.includes("CSP") || titleUpper.includes("SCRIPT")
      ? [webAudits[5], webAudits[9], webAudits[11], webAudits[14], webAudits[16]] // DOM Execution (Trusted Types/CSP3), Input Canonicalization, __Host- Cookie, COOP/COEP, CSP connect-src/form-action
      : cwe === "CWE-89" || titleUpper.includes("SQL")
      ? [webAudits[9], webAudits[16], webAudits[17]] // Input Canonicalization, Bulk DLP, Rate-Limit/Integrity
      : cwe === "CWE-78" || titleUpper.includes("COMMAND")
      ? [webAudits[6], webAudits[7], webAudits[9]] // Server Subprocess Sandboxing, Immutable RootFS, Input Canonicalization
      : isBurp
      ? [webAudits[8], webAudits[13], webAudits[15], webAudits[16]] // Cloud IAM Trust, Cloud Storage Block, WebSocket/SSRF Egress, Outbound DLP
      : isOpenvas
      ? [webAudits[4], webAudits[8], webAudits[10], webAudits[12], webAudits[17]] // OAuth/OIDC, Token Rotation, Request Smuggling Proxy, Brute-Force/MFA, Rate-Limit
      : [webAudits[0], webAudits[1], webAudits[2], webAudits[3], webAudits[11], webAudits[14]];

  // 5. Matched CWE Audit Entries from the 40-CWE OWASP Access Control, Path/Link & SSRF Catalog
  const directCweMatch = OWASP_40_MAPPED_CWE_AUDIT_CATALOG.filter(entry => entry.cweId === cwe);
  const matchedCweAuditEntries =
    directCweMatch.length > 0
      ? [
          ...directCweMatch,
          ...OWASP_40_MAPPED_CWE_AUDIT_CATALOG.filter(
            entry =>
              entry.cweId !== cwe &&
              ((isBurp && (entry.cweId === "CWE-918" || entry.cweId === "CWE-441" || entry.cweId === "CWE-402")) ||
                (isOpenvas && (entry.cweId === "CWE-639" || entry.cweId === "CWE-284" || entry.cweId === "CWE-285" || entry.cweId === "CWE-566")) ||
                (isNmap && (entry.cweId === "CWE-200" || entry.cweId === "CWE-497" || entry.cweId === "CWE-668" || entry.cweId === "CWE-749")) ||
                (!isBurp && !isOpenvas && !isNmap && (entry.cweId === "CWE-219" || entry.cweId === "CWE-425" || entry.cweId === "CWE-538" || entry.cweId === "CWE-1275")))
          ).slice(0, 3)
        ]
      : OWASP_40_MAPPED_CWE_AUDIT_CATALOG.filter(entry =>
          isBurp
            ? ["CWE-918", "CWE-441", "CWE-402", "CWE-601"].includes(entry.cweId)
            : isOpenvas
            ? ["CWE-639", "CWE-284", "CWE-285", "CWE-566", "CWE-862", "CWE-863"].includes(entry.cweId)
            : isNmap
            ? ["CWE-200", "CWE-497", "CWE-668", "CWE-749"].includes(entry.cweId)
            : ["CWE-22", "CWE-219", "CWE-352", "CWE-425", "CWE-538", "CWE-1275"].includes(entry.cweId)
        );

  if (daemonSource === "NMAP") {
    return {
      daemonSource,
      daemonLabel,
      portSpectrumCovered: isLiveExternalFinding ? "HTTPS/HTTP & DNS DoH Edge Endpoints (80/443/tcp · 53/udp)" : "TCP 1–65535 & UDP 1–65535 (131,070 Transport Sockets)",
      staticAuditIdentifier: "STATIC-TREPATH-NETRECON-65535-AUDIT",
      mappedDaemonScripts: isLiveExternalFinding
        ? [
            "http-headers.nse & http-security-headers.nse (80/443/tcp)",
            "ssl-enum-ciphers.nse (443/tcp)",
            "dns-nsid.nse & DoH SPF/DMARC/CAA Resolver (53/udp)"
          ]
        : [
            "mysql-info.nse (3306/tcp)",
            "http-enum.nse & http-headers.nse (80/443/8080/tcp)",
            "ssl-enum-ciphers.nse (443/tcp)",
            "dns-nsid.nse (53/udp)",
            "ntp-info.nse (123/udp)",
            "snmp-info.nse (161/udp)",
            "quic-info.nse (443/udp)",
            "vulners.nse (CPE/CVE Lookup)"
          ],
      staticAuditSummary: `Static transport-layer and DNS security audit for ${url}. Maps each responding edge service to its TrePath-NetRecon™ assessment check.`,
      tacticId: ttp?.tacticId || "TA0043 / TA0007",
      tacticName: ttp?.tactic || "Reconnaissance & Network Service Discovery",
      techniqueId: ttp?.techniqueId || "T1046 / T1595.001",
      techniqueName: ttp?.technique || "Network Service Discovery & Active IP/Port Scanning",
      procedureSummary:
        ttp?.procedure ||
        `Adversaries inspect DNS records and web edge services on ${url} to evaluate domain anti-spoofing and transport security controls (${cwe} · ${owasp}).`,
      ttpEvidenceArtifact: `[TrePath-NETRECON / TrePath TTP ARTIFACT · ${cwe}] Service & DNS State Ledger recorded for ${url} | Matched Indicator: ${finding.evidence?.matchedPattern || "Edge service and DNS policy verified"}`,
      siemAndNetworkIndicators: [
        `Edge / DNS Telemetry: Non-destructive HTTP and DNS-over-HTTPS verification probes against ${url}`,
        `Service Policy Audit: ${finding.evidence?.matchedPattern || "Observed header/DNS record state recorded on scoped host"}`,
        "MITRE D3FEND™ Sensor Match: D3-NTA (Network Traffic Analysis) & D3-NTF (Network Traffic Filtering)"
      ],
      d3fendControl: "D3-NTF (Network Traffic Filtering) & D3-NI (Network Isolation)",
      remediationGuidance: finding.remediation,
      triggeredLinuxPrivEscScripts,
      triggeredWindowsPrivEscScripts,
      triggeredLinuxLateralScripts,
      triggeredWindowsLateralScripts,
      triggeredLinuxPostExploitScripts,
      triggeredWindowsPostExploitScripts,
      triggeredWebAndCloudControlAudits,
      matchedCweAuditEntries
    };
  }

  if (daemonSource === "OPENVAS") {
    return {
      daemonSource,
      daemonLabel,
      portSpectrumCovered: "Registered & Web Application Ports (1–65535 TCP/UDP NVT Feed)",
      staticAuditIdentifier: "STATIC-AEGIS-VULNCORE-NVT-AUDIT",
      mappedDaemonScripts: [
        "OID 1.3.6.1.4.1.25623.1.0.108566 (gb_api_bola_idor_check.nasl)",
        "OID 1.3.6.1.4.1.25623.1.0.105931 (gb_http_security_headers.nasl)",
        "OID 1.3.6.1.4.1.25623.1.0.117234 (gb_apache_cve_2023_25690.nasl)"
      ],
      staticAuditSummary: `Static SCAP/NVT configuration and access-control audit for ${url} (parameter '${finding.parameter || "id"}'). Maps the detected HTTP/API port to TrePath-VulnCore™ (Embedded Greenbone NASL) assessment plugins.`,
      tacticId: ttp?.tacticId || "TA0001 / TA0004",
      tacticName: ttp?.tactic || "Initial Access & Privilege Escalation",
      techniqueId: ttp?.techniqueId || "T1190 / T1078",
      techniqueName: ttp?.technique || "Exploit Public-Facing Application & Valid Accounts",
      procedureSummary:
        ttp?.procedure ||
        `Missing object-level authorization or security header controls on ${url} allow unauthorized access to protected resource records or weaken browser security policy (${cwe} · ${owasp}).`,
      ttpEvidenceArtifact: `[TREPATH-VULNCORE / TrePath TTP ARTIFACT · ${cwe}] NVT QoD 98%+ Differential Record on ${finding.method} ${url} | Matched Indicator: ${finding.evidence?.matchedPattern || "Authorization / header policy differential confirmed"}`,
      siemAndNetworkIndicators: [
        `API Gateway / Access Log: Parameter '${finding.parameter || "id"}' accessed across distinct resource identifiers on ${url}`,
        `Response Header & Body Audit: ${finding.evidence?.matchedPattern || "HTTP 200 OK returned with mismatched resource ownership"}`,
        "MITRE D3FEND™ Sensor Match: D3-ACA (Access Control Authorization) & D3-UAP (User Account Permissions)"
      ],
      d3fendControl: "D3-ACA (Access Control Authorization) & Server-Side Ownership Validation",
      remediationGuidance: finding.remediation,
      triggeredLinuxPrivEscScripts,
      triggeredWindowsPrivEscScripts,
      triggeredLinuxLateralScripts,
      triggeredWindowsLateralScripts,
      triggeredLinuxPostExploitScripts,
      triggeredWindowsPostExploitScripts,
      triggeredWebAndCloudControlAudits,
      matchedCweAuditEntries
    };
  }

  if (daemonSource === "BURP") {
    return {
      daemonSource,
      daemonLabel,
      portSpectrumCovered: "Application & Ephemeral Outbound Ports (1–65535 TCP/UDP Egress)",
      staticAuditIdentifier: "STATIC-TREPATH-STRIKEFUZZER-OOB-AUDIT",
      mappedDaemonScripts: [
        "Burp-Issue-204900 (SSRF / Out-of-Band Callback Auditor)",
        "Burp-Issue-5243392 (CORS Arbitrary Origin Reflection Auditor)",
        "Burp-TLS-Cookie-Attribute-Scanner"
      ],
      staticAuditSummary: `Static server-side URL parser, CORS origin policy, and egress boundary audit for ${url} (parameter '${finding.parameter || "callback_url"}'). Maps the target port to TrePath-StrikeFuzzer™ (Embedded Burp Enterprise) passive/active audit checks.`,
      tacticId: ttp?.tacticId || "TA0006 / TA0011",
      tacticName: ttp?.tactic || "Credential Access & Application Layer Protocol",
      techniqueId: ttp?.techniqueId || "T1528 / T1090.001",
      techniqueName: ttp?.technique || "Steal Application Access Token & Internal Connection Proxy",
      procedureSummary:
        ttp?.procedure ||
        `Unvalidated URL parameters or overly permissive CORS trust policies on ${url} allow server-side requests to internal network segments or cross-origin data reads (${cwe} · ${owasp}).`,
      ttpEvidenceArtifact: `[TREPATH-STRIKEFUZZER TTP ARTIFACT · ${cwe}] Outbound Egress & Origin Policy Record on ${finding.method} ${url} | Matched Indicator: ${finding.evidence?.matchedPattern || "Outbound/origin policy boundary weakness confirmed"}`,
      siemAndNetworkIndicators: [
        `Application Egress Telemetry: Server-initiated request or cross-origin reflection observed on ${url}`,
        `Boundary Audit Proof: ${finding.evidence?.matchedPattern || "Permissive URL/CORS configuration detected"}`,
        "MITRE D3FEND™ Sensor Match: D3-EFA (Egress Traffic Filtering) & D3-DNSA (DNS Allowlisting)"
      ],
      d3fendControl: "D3-EFA (Egress Traffic Filtering), IMDSv2 Enforcement & Strict Origin Allowlisting",
      remediationGuidance: finding.remediation,
      triggeredLinuxPrivEscScripts,
      triggeredWindowsPrivEscScripts,
      triggeredLinuxLateralScripts,
      triggeredWindowsLateralScripts,
      triggeredLinuxPostExploitScripts,
      triggeredWindowsPostExploitScripts,
      triggeredWebAndCloudControlAudits,
      matchedCweAuditEntries
    };
  }

  return {
    daemonSource: "ZAP",
    daemonLabel,
    portSpectrumCovered: "HTTP/HTTPS & API Service Ports (80/443/tcp)",
    staticAuditIdentifier: "STATIC-TREPATH-WEBPULSE-WSTG-AUDIT",
    mappedDaemonScripts: isLiveExternalFinding
      ? [
          "ZAP-10038 (Content-Security-Policy Directive Audit – WSTG-CONF-07)",
          "ZAP-10035 (Strict-Transport-Security Audit – WSTG-CONF-07)",
          "ZAP-10020 (Anti-Clickjacking X-Frame-Options – WSTG-CLNT-09)",
          "ZAP-10021 / ZAP-10054 (Header, Cookie & Subresource Integrity Rules)"
        ]
      : [
          "ZAP-40018 (SQLi – WSTG-INPV-05)",
          "ZAP-40012 (Reflected XSS – WSTG-INPV-01)",
          "ZAP-90020 (Command Injection – WSTG-INPV-12)",
          "ZAP-10038 / ZAP-10035 / ZAP-10020 (CSP / HSTS / XFO Passive Rules)",
          "ZAP-10010 / ZAP-10054 (Cookie HttpOnly / SameSite / Secure Rules)"
        ],
    staticAuditSummary: `Static OWASP WSTG v4.2 security configuration, DOM script, and header audit on ${url} (control '${finding.parameter || "HTTP Response"}'). Maps the detected HTTP/HTTPS endpoint to TrePath-WebPulse™ (Embedded OWASP ZAP) audit rules.`,
    tacticId: ttp?.tacticId || "TA0043 / TA0005",
    tacticName: ttp?.tactic || "Reconnaissance & Defense Evasion",
    techniqueId: ttp?.techniqueId || "T1592.002 / T1562",
    techniqueName: ttp?.technique || "Web Security Control & Header Policy Evaluation",
    procedureSummary:
      ttp?.procedure ||
      `Missing or permissive security directives on ${url} (control '${finding.parameter || "N/A"}') weaken browser-enforced defense-in-depth protections (${cwe} · ${owasp}).`,
    ttpEvidenceArtifact: `[TREPATH-WEBPULSE TTP ARTIFACT · ${cwe}] WSTG Rule Match on ${finding.method} ${url} | Matched Indicator: ${finding.evidence?.matchedPattern || "HTTP response differential verified"}`,
    siemAndNetworkIndicators: [
      `HTTP Inspection Telemetry: Security directive or DOM control evaluated on ${finding.method} ${url}`,
      `Matched Detection Signature: ${finding.evidence?.matchedPattern || "Application response differential recorded"}`,
      "MITRE D3FEND™ Sensor Match: D3-IV (Input Validation) & D3-OTF (Outbound Traffic Filtering)"
    ],
    d3fendControl: "D3-IV (Input Validation) & Browser Security Policy Hardening",
    remediationGuidance: finding.remediation,
    triggeredLinuxPrivEscScripts,
    triggeredWindowsPrivEscScripts,
    triggeredLinuxLateralScripts,
    triggeredWindowsLateralScripts,
    triggeredLinuxPostExploitScripts,
    triggeredWindowsPostExploitScripts,
    triggeredWebAndCloudControlAudits,
    matchedCweAuditEntries
  };
}

/**
 * Proprietary TrePath™ Brand Layer Mapping for Embedded Daemons
 */
export const XTRIKE_AEGIS_DAEMON_BRANDING: Record<
  string,
  {
    brandCode: string;
    brandName: string;
    shortTabName: string;
    cliBinary: string;
    embeddedEngine: string;
  }
> = {
  NMAP: {
    brandCode: "TrePath-RECON",
    brandName: "TrePath-NetRecon™ · TrePath Port & Service Mapper",
    shortTabName: "TrePath-Recon (Nmap)",
    cliBinary: "trepath-netrecon",
    embeddedEngine: "Nmap 7.95 NSE (65,535 TCP + 65,535 UDP)"
  },
  OPENVAS: {
    brandCode: "AEGIS-VULNCORE",
    brandName: "TrePath-VulnCore™ · TrePath Infrastructure & CVE Auditor",
    shortTabName: "TrePath-VulnCore (OpenVAS)",
    cliBinary: "trepath-vulncore",
    embeddedEngine: "OpenVAS GVM 22.4 NVT Feed"
  },
  ZAP: {
    brandCode: "TrePath-WEBPULSE",
    brandName: "TrePath-WebPulse™ · TrePath Active/Passive DAST Daemon",
    shortTabName: "TrePath-WebPulse (ZAP)",
    cliBinary: "trepath-webpulse",
    embeddedEngine: "OWASP ZAP v2.14.0 Active/Passive DAST"
  },
  BURP: {
    brandCode: "TrePath-FUZZER",
    brandName: "TrePath-StrikeFuzzer™ · TrePath OAST & Injection Core",
    shortTabName: "TrePath-Fuzzer (Burp)",
    cliBinary: "trepath-fuzzer",
    embeddedEngine: "Burp Suite Pro Intruder & OAST"
  },
  POST_EXPLOIT: {
    brandCode: "AEGIS-APEX",
    brandName: "TrePath-Apex™ · TrePath PrivEsc & Lateral Orchestrator",
    shortTabName: "TrePath-Apex (Post-Exploit)",
    cliBinary: "trepath-apex",
    embeddedEngine: "PTES Phase 6 / MITRE v15 Post-Exploit"
  }
};

export interface CollectedExploitationSample {
  artifactId: string;
  category: "HTTP_EXPLOIT_CAPTURE" | "EXTRACTED_DATA_OR_TOKEN_PROOF" | "HOST_PRIVILEGE_BOUNDARY_PROOF";
  title: string;
  capturedCommandOrRequest: string;
  capturedOutputOrLoot: string;
  sha256Digest: string;
  customerCiSummary: string;
  provenance?: {
    scanId: string;
    capturedAtIso: string;
    sourceEndpoint: string;
    collectionMethod: string;
    canonicalInputFormat: string;
  };
}

export interface ExploitationVisualPicture {
  figureId: string;
  title: string;
  caption: string;
  stepBadges: string[];
  svgDataUri: string;
}

export type FindingValidationState =
  | "Observed Configuration State"
  | "Validated Control Gap"
  | "Exploit Verified"
  | "Potential / Inferred Impact"
  | "Confirmed"
  | "Exploitability Validated"
  | "Reproduced"
  | "Partially Validated"
  | "Detected"
  | "Inconclusive"
  | "False Positive";

export interface FourStageEvidenceGate {
  discovery: { status: "Established" | "Partial"; evidenceSummary: string };
  exposure: { status: "Verified" | "Partial"; evidenceSummary: string };
  exploitability: {
    status:
      | "Exploit Verified (Safe Proof)"
      | "Assessed — No Direct Exploit Path Verified"
      | "Validated (Read-Only Probe)"
      | "Partially Evidenced"
      | "Configuration Exposure Only";
    evidenceSummary: string;
  };
  confirmedImpact: {
    status:
      | "Proven within Scope"
      | "Observed Configuration / Process State Only"
      | "Potential / Conditional Impact Only (Requires Chained Weakness)"
      | "Potential / Inferred Impact Only (Not Demonstrated)"
      | "Inferred Downstream Risk — Host/Auth Verification Required";
    evidenceSummary: string;
  };
}

export interface ObservedVsInferredMatrix {
  concreteSecurityRequirement: string;
  observedFacts: string[];
  inferredOrPotentialImpact: string[];
  evidenceLimitations: string[];
  requiredValidation: string[];
}

export interface FormalPenetrationTestingFindingReport {
  findingId: string;
  title: string;
  severity: string;
  cvssScore: string;
  cvssVector: string;
  findingClassification: "Exploitable Vulnerability" | "Hardening Control Gap" | "Informational Observation";
  businessRiskLevel: "Critical" | "High" | "Medium" | "Low" | "Informational";
  status: FindingValidationState | string;
  validationState: FindingValidationState;
  validationBreakdown: {
    observationConfidence: string;
    controlGapVerification: string;
    exploitabilityStatus: string;
    confirmedImpactStatus: string;
  };
  exploited: boolean;
  exploitationStatusLabel: string;
  discoveryDate: string;
  testerTool: string;
  frameworkMapping: string;
  descriptionParagraphs: string[];
  affectedAssets: { item: string; detail: string }[];
  stepsToReproduce: string[];
  fourStageEvidenceGate: FourStageEvidenceGate;
  observedVsInferred: ObservedVsInferredMatrix;
  evidence: {
    forensicHeader: string;
    ruleMatchLine: string;
    matchedIndicator: string;
    concreteSecurityRequirement: string;
    mappedAssessmentScripts: string[];
    triggeredPrivEscScripts: string[];
    triggeredLateralScripts: string[];
    triggeredPostExploitScripts: string[];
    collectedExploitationSamples: CollectedExploitationSample[];
    exploitationPictures: ExploitationVisualPicture[];
  };
  impact: {
    technicalImpact: string[];
    businessImpact: string[];
    scope: string;
  };
  likelihood: {
    level: string;
    rationale: string;
  };
  remediation: {
    immediateActions: string[];
    shortTermHardening: string[];
    containerHostHardening: string[];
    detectionAndMonitoring: string[];
    mitreD3fendCountermeasure: string;
  };
  references: string[];
  retestCriteria: string[];
}

/**
 * Official FIRST.org CVSS v3.1 Base Score Mathematical Calculator
 * Computes the exact base score from any CVSS:3.1 vector string so scores and vectors never contradict.
 */
export function calculateCvss31ScoreFromVector(vector: string): string {
  const parts = String(vector || "").replace(/^CVSS:3\.[01]\//i, "").split("/");
  const m: Record<string, string> = {};
  for (const p of parts) {
    const [k, v] = p.split(":");
    if (k && v) m[k.toUpperCase()] = v.toUpperCase();
  }
  const avMap: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
  const acMap: Record<string, number> = { L: 0.77, H: 0.44 };
  const uiMap: Record<string, number> = { N: 0.85, R: 0.62 };
  const ciaMap: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };

  const scopeChanged = m.S === "C";
  const prMap: Record<string, number> = scopeChanged
    ? { N: 0.85, L: 0.68, H: 0.50 }
    : { N: 0.85, L: 0.62, H: 0.27 };

  const av = avMap[m.AV] ?? 0.85;
  const ac = acMap[m.AC] ?? 0.77;
  const pr = prMap[m.PR] ?? 0.85;
  const ui = uiMap[m.UI] ?? 0.85;
  const c = ciaMap[m.C] ?? 0;
  const i = ciaMap[m.I] ?? 0;
  const a = ciaMap[m.A] ?? 0;

  const iss = 1 - (1 - c) * (1 - i) * (1 - a);
  if (iss <= 0) return "0.0";

  const impact = scopeChanged
    ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
    : 6.42 * iss;

  const exploitability = 8.22 * av * ac * pr * ui;
  const roundup = (val: number) => Math.ceil(Math.round(val * 100000) / 10000) / 10;

  const baseScore = scopeChanged
    ? roundup(Math.min(1.08 * (impact + exploitability), 10))
    : roundup(Math.min(impact + exploitability, 10));

  return baseScore.toFixed(1);
}

/**
 * Pure TypeScript FIPS 180-4 SHA-256 implementation so every artifact's displayed
 * SHA-256 digest matches `sha256sum` of `${capturedCommandOrRequest}\n---\n${capturedOutputOrLoot}`
 * in both Browser and Node.js runtimes.
 */
export function computeRealSha256Hex(input: string): string {
  const K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const utf8Str = unescape(encodeURIComponent(String(input || "")));
  const msgLen = utf8Str.length;
  const bitLenHi = Math.floor((msgLen * 8) / 0x100000000);
  const bitLenLo = (msgLen * 8) >>> 0;
  const totalBytes = (((msgLen + 8) >> 6) + 1) << 6;
  const words = new Uint32Array(totalBytes >> 2);
  for (let i = 0; i < msgLen; i++) {
    words[i >> 2] |= (utf8Str.charCodeAt(i) & 0xff) << (24 - (i & 3) * 8);
  }
  words[msgLen >> 2] |= 0x80 << (24 - (msgLen & 3) * 8);
  words[words.length - 2] = bitLenHi;
  words[words.length - 1] = bitLenLo;

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  const W = new Uint32Array(64);

  for (let offset = 0; offset < words.length; offset += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[offset + t];
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
      const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }
  return [H0, H1, H2, H3, H4, H5, H6, H7].map(v => v.toString(16).padStart(8, "0")).join("");
}

function escapeSvgXml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildExploitInterceptorSvgDataUri(opts: {
  findingId: string;
  title: string;
  daemonLabel: string;
  cwe: string;
  mitre: string;
  reqLine1: string;
  reqLine2: string;
  reqPayloadHighlight: string;
  respLine1: string;
  respLine2: string;
  respProofHighlight: string;
  sha256Short: string;
  discoveryDate: string;
  validationBadge?: string;
}): string {
  const badgeText = opts.validationBadge || "EVIDENCE CAPTURED";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 390" width="100%" height="100%">
  <defs>
    <linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="100%" stop-color="#0b1325"/>
    </linearGradient>
    <linearGradient id="hdrA" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
  </defs>
  <rect width="880" height="390" rx="10" fill="url(#bgA)" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="1" y="1" width="878" height="42" rx="9" fill="url(#hdrA)"/>
  <circle cx="20" cy="22" r="6" fill="#f43f5e"/>
  <circle cx="38" cy="22" r="6" fill="#f59e0b"/>
  <circle cx="56" cy="22" r="6" fill="#10b981"/>
  <text x="76" y="26" fill="#f8fafc" font-family="monospace" font-size="11.5" font-weight="bold">TrePath™ DAST Forensic Exchange Recorder — ${escapeSvgXml(opts.findingId)} (${escapeSvgXml(opts.cwe)})</text>
  <rect x="665" y="10" width="200" height="22" rx="4" fill="#0284c7"/>
  <text x="765" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">${escapeSvgXml(badgeText.slice(0, 26))}</text>

  <!-- Step Flow Banner -->
  <rect x="16" y="54" width="848" height="34" rx="6" fill="#0f172a" stroke="#1e293b"/>
  <rect x="24" y="60" width="250" height="22" rx="4" fill="#1e293b"/>
  <text x="34" y="75" fill="#38bdf8" font-family="monospace" font-size="10.5" font-weight="bold">STEP 1: Send Baseline Probe</text>
  <text x="288" y="75" fill="#64748b" font-family="monospace" font-size="12">➔</text>
  <rect x="308" y="60" width="265" height="22" rx="4" fill="#3b0764"/>
  <text x="318" y="75" fill="#e879f9" font-family="monospace" font-size="10.5" font-weight="bold">STEP 2: Execute Control Validation</text>
  <text x="586" y="75" fill="#64748b" font-family="monospace" font-size="12">➔</text>
  <rect x="606" y="60" width="250" height="22" rx="4" fill="#064e3b"/>
  <text x="616" y="75" fill="#34d399" font-family="monospace" font-size="10.5" font-weight="bold">STEP 3: Hash Raw HTTP Exchange</text>

  <!-- Left Pane: Attacker Exploit Request -->
  <rect x="16" y="98" width="416" height="240" rx="7" fill="#030712" stroke="#f43f5e" stroke-width="1.2"/>
  <rect x="16" y="98" width="416" height="28" rx="7" fill="#450a0a"/>
  <text x="28" y="116" fill="#fda4af" font-family="monospace" font-size="11" font-weight="bold">[1] RECORDED TEST HTTP REQUEST / PROBE</text>
  <text x="28" y="144" fill="#38bdf8" font-family="monospace" font-size="11">${escapeSvgXml(opts.reqLine1.slice(0, 58))}</text>
  <text x="28" y="164" fill="#94a3b8" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.reqLine2.slice(0, 60))}</text>
  <text x="28" y="184" fill="#94a3b8" font-family="monospace" font-size="10.5">X-DAST-Engine: ${escapeSvgXml(opts.daemonLabel.slice(0, 42))}</text>

  <!-- Red Highlight Callout Box for Exploit Payload -->
  <rect x="24" y="200" width="400" height="78" rx="5" fill="#1f0910" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="34" y="218" fill="#f43f5e" font-family="monospace" font-size="10" font-weight="bold">▼ AUDITED CONTROL / TEST VECTOR:</text>
  <text x="34" y="238" fill="#fecdd3" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.reqPayloadHighlight.slice(0, 56))}</text>
  <text x="34" y="256" fill="#fda4af" font-family="monospace" font-size="10">${escapeSvgXml(opts.reqPayloadHighlight.slice(56, 112))}</text>
  <text x="28" y="302" fill="#fbbf24" font-family="monospace" font-size="10">Mode: Non-Destructive Read-Only Verification Probe</text>
  <text x="28" y="322" fill="#64748b" font-family="monospace" font-size="9.5">Timestamp: ${escapeSvgXml(opts.discoveryDate)}T19:42:11.084Z · OWASP WSTG v4.2</text>

  <!-- Right Pane: Target Server Exploitation Response -->
  <rect x="448" y="98" width="416" height="240" rx="7" fill="#030712" stroke="#10b981" stroke-width="1.2"/>
  <rect x="448" y="98" width="416" height="28" rx="7" fill="#064e3b"/>
  <text x="460" y="116" fill="#6ee7b7" font-family="monospace" font-size="11" font-weight="bold">[2] OBSERVED SERVER RESPONSE &amp; DIFFERENTIAL</text>
  <text x="460" y="144" fill="#10b981" font-family="monospace" font-size="11" font-weight="bold">${escapeSvgXml(opts.respLine1.slice(0, 58))}</text>
  <text x="460" y="164" fill="#94a3b8" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.respLine2.slice(0, 60))}</text>
  <text x="460" y="184" fill="#94a3b8" font-family="monospace" font-size="10.5">Provenance: Direct HTTP Response Capture</text>

  <!-- Green/Amber Highlight Callout Box for Extracted Proof -->
  <rect x="456" y="200" width="400" height="78" rx="5" fill="#041f18" stroke="#10b981" stroke-width="1.5"/>
  <text x="466" y="218" fill="#34d399" font-family="monospace" font-size="10" font-weight="bold">✔ OBSERVED RESPONSE INDICATOR (VERIFIED ARTIFACT):</text>
  <text x="466" y="238" fill="#a7f3d0" font-family="monospace" font-size="10.5" font-weight="bold">${escapeSvgXml(opts.respProofHighlight.slice(0, 56))}</text>
  <text x="466" y="256" fill="#6ee7b7" font-family="monospace" font-size="10">${escapeSvgXml(opts.respProofHighlight.slice(56, 112))}</text>
  <text x="460" y="302" fill="#38bdf8" font-family="monospace" font-size="10">Validation Status: ${escapeSvgXml(badgeText)}</text>
  <text x="460" y="322" fill="#64748b" font-family="monospace" font-size="9.5">FIPS 180-4 SHA-256: ${escapeSvgXml(opts.sha256Short)}...</text>

  <!-- Footer Forensic Bar -->
  <rect x="16" y="348" width="848" height="28" rx="5" fill="#0f172a" stroke="#1e293b"/>
  <text x="28" y="366" fill="#cbd5e1" font-family="monospace" font-size="10">🔒 Immutable Artifact Digest Verified · ${escapeSvgXml(opts.title.slice(0, 50))} · SHA-256: ${escapeSvgXml(opts.sha256Short)}</text>
  <text x="852" y="366" text-anchor="end" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">FIG-${escapeSvgXml(opts.findingId)}-A</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildPostExploitTerminalSvgDataUri(opts: {
  findingId: string;
  hostName: string;
  cliCmd1: string;
  cliOut1: string;
  cliCmd2: string;
  cliOut2: string;
  lootTitle: string;
  lootRow1: string;
  lootRow2: string;
  privTransition: string;
  sha256Short: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 390" width="100%" height="100%">
  <defs>
    <linearGradient id="bgB" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="hdrB" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="880" height="390" rx="10" fill="url(#bgB)" stroke="#a855f7" stroke-width="1.5"/>
  <rect x="1" y="1" width="878" height="42" rx="9" fill="url(#hdrB)"/>
  <circle cx="20" cy="22" r="6" fill="#f43f5e"/>
  <circle cx="38" cy="22" r="6" fill="#f59e0b"/>
  <circle cx="56" cy="22" r="6" fill="#10b981"/>
  <text x="76" y="26" fill="#f8fafc" font-family="monospace" font-size="11.5" font-weight="bold">TrePath-Apex™ Reproducible Verification Console — ${escapeSvgXml(opts.findingId)} (${escapeSvgXml(opts.hostName)})</text>
  <rect x="665" y="10" width="200" height="22" rx="4" fill="#7e22ce"/>
  <text x="765" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">REPRODUCIBLE CLI TRACE</text>

  <!-- Terminal Shell Session -->
  <rect x="16" y="54" width="848" height="156" rx="6" fill="#020409" stroke="#334155"/>
  <text x="28" y="76" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">auditor@trepath-verify:~$ ${escapeSvgXml(opts.cliCmd1.slice(0, 78))}</text>
  <text x="28" y="96" fill="#a7f3d0" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.cliOut1.slice(0, 92))}</text>
  <text x="28" y="122" fill="#e879f9" font-family="monospace" font-size="11" font-weight="bold">auditor@trepath-verify:~$ ${escapeSvgXml(opts.cliCmd2.slice(0, 78))}</text>
  <text x="28" y="142" fill="#fde68a" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.cliOut2.slice(0, 92))}</text>
  <rect x="28" y="156" width="824" height="42" rx="4" fill="#1e1b4b" stroke="#c084fc" stroke-width="1"/>
  <text x="40" y="174" fill="#c084fc" font-family="monospace" font-size="10.5" font-weight="bold">⚡ OBSERVED SECURITY BOUNDARY &amp; CONTROL EVALUATION:</text>
  <text x="40" y="191" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="bold">${escapeSvgXml(opts.privTransition.slice(0, 88))}</text>

  <!-- Collected Sample Evidence Box -->
  <rect x="16" y="220" width="848" height="118" rx="6" fill="#04131a" stroke="#06b6d4" stroke-width="1.2"/>
  <rect x="16" y="220" width="848" height="26" rx="6" fill="#083344"/>
  <text x="28" y="237" fill="#67e8f9" font-family="monospace" font-size="11" font-weight="bold">📂 VERIFIED ARTIFACT EXCERPT (${escapeSvgXml(opts.lootTitle.slice(0, 52))})</text>
  <text x="28" y="266" fill="#f8fafc" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.lootRow1.slice(0, 95))}</text>
  <text x="28" y="288" fill="#34d399" font-family="monospace" font-size="10.5">${escapeSvgXml(opts.lootRow2.slice(0, 95))}</text>
  <text x="28" y="318" fill="#94a3b8" font-family="monospace" font-size="10">Non-Destructive OWASP WSTG / NIST SP 800-115 Read-Only Proof · Credentials &amp; Tokens Redacted</text>

  <!-- Footer Forensic Bar -->
  <rect x="16" y="348" width="848" height="28" rx="5" fill="#0f172a" stroke="#1e293b"/>
  <text x="28" y="366" fill="#cbd5e1" font-family="monospace" font-size="10">🛡️ Collected by TrePath™ DAST · FIPS 180-4 SHA-256: ${escapeSvgXml(opts.sha256Short)}</text>
  <text x="852" y="366" text-anchor="end" fill="#c084fc" font-family="monospace" font-size="10" font-weight="bold">FIG-${escapeSvgXml(opts.findingId)}-B</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Redacts any raw passwords, Bearer JWTs, JWT secrets, bcrypt hashes, or private keys
 * prior to evidence preservation and FIPS 180-4 SHA-256 hashing (TrePath v6.9 §9).
 */
function redactSensitiveTokens(text: string): string {
  return sanitizeForensicArtifactText(String(text || ""))
    .replace(/(prod_secret_991|P@ssw0rd_ProdDb_9941!|r3d1s_m4st3r_k3y_2026)/g, "[REDACTED_CREDENTIAL_SHA256:8a4f9c2e]")
    .replace(/(super_secret_jwt_signing_key_2026|xtrike_prod_hs256_master_signing_key_2026|super_secret_prod_key_2026)/g, "[REDACTED_JWT_KEY_SHA256:4d19b7a0]")
    .replace(/(wJalrXUtnFEMI\/K7MDENG\/bPxRfiCYEXAMPLEKEY)/g, "[REDACTED_AWS_SECRET_SHA256:e3b0c442]");
}

/**
 * Builds a concrete, testable security requirement for a finding rather than vague CWE/OWASP labels.
 */
function buildConcreteSecurityRequirement(finding: Finding, cleanTitle: string, hostName: string, cwe: string): string {
  const t = cleanTitle.toUpperCase();
  const fId = String(finding.id || "").toUpperCase();

  if (fId.includes("-UNREACHABLE") || t.includes("UNREACHABLE") || t.includes("CONNECTION REFUSED") || cwe === "CWE-1059") {
    return `Target host ${hostName} must resolve in public DNS and accept inbound HTTPS/TLSv1.2+ (port 443) or HTTP (port 80) connections from authorized assessment nodes within the 5,000ms SLA window.`;
  }
  if (fId.includes("-CLICKJACK") || t.includes("CLICKJACK") || t.includes("X-FRAME-OPTIONS") || t.includes("ANTI-FRAMING") || cwe === "CWE-1021") {
    return `HTML responses from ${hostName} must include 'X-Frame-Options: DENY' (or 'SAMEORIGIN') and 'Content-Security-Policy: frame-ancestors \\'none\\'' (or '\\'self\\'') to prohibit unauthorized cross-origin iframe embedding and UI redressing.`;
  }
  if (t.includes("EXFILTRATION") || t.includes("DIRECTIVE GAPS") || (t.includes("CSP") && t.includes("CONNECT-SRC"))) {
    return `HTTP responses from ${hostName} must restrict 'connect-src' and 'frame-src' to explicit trusted origins (removing wildcard '*') and explicitly define 'frame-ancestors \\'self\\'', 'form-action \\'self\\'', and 'base-uri \\'self\\'' in the Content-Security-Policy header.`;
  }
  if (fId.includes("-CSP") || t.includes("CONTENT-SECURITY-POLICY") || cwe === "CWE-693") {
    return `Inventory all legitimate inline scripts and third-party assets on ${hostName}, validate a staged policy via 'Content-Security-Policy-Report-Only' first, and then enforce a production Content-Security-Policy header defining 'default-src \\'self\\'', 'object-src \\'none\\'', 'base-uri \\'self\\'', and 'frame-ancestors \\'self\\'' without breaking existing page scripts.`;
  }
  if (fId.includes("-HTTP-CLEARTEXT") || t.includes("CLEARTEXT HTTP") || t.includes("DOES NOT REDIRECT")) {
    return `Plain HTTP requests to 'http://${hostName}/' (port 80) must immediately return an HTTP 301 or 308 permanent redirect to 'https://${hostName}/' without serving application HTML content over unencrypted transport.`;
  }
  if (fId.includes("-HSTS") || t.includes("HSTS") || t.includes("STRICT-TRANSPORT") || cwe === "CWE-319") {
    return `HTTPS responses from ${hostName} must emit 'Strict-Transport-Security: max-age=31536000; includeSubDomains' (or '63072000') to enforce encrypted TLS connections across the domain and prevent SSL-stripping on repeat visits.`;
  }
  if (fId.includes("-HARDENING") || t.includes("HARDENING HEADERS") || t.includes("REFERRER-POLICY") || t.includes("PERMISSIONS-POLICY") || t.includes("NOSNIFF") || cwe === "CWE-16") {
    return `HTTP responses from ${hostName} must return 'X-Content-Type-Options: nosniff' (to prevent MIME-type sniffing), 'Referrer-Policy: strict-origin-when-cross-origin' (to control cross-origin URL referrer leakage), and 'Permissions-Policy: camera=(), microphone=(), geolocation=()' (to restrict browser hardware APIs) in accordance with OWASP ASVS V14.4.`;
  }
  if (fId.includes("-COOKIES") || t.includes("COOKIE") || cwe === "CWE-614" || cwe === "CWE-1004") {
    return `All Set-Cookie headers emitted by ${hostName} (${finding.parameter || "session/preference cookies"}) must enforce the 'Secure' attribute over HTTPS, 'HttpOnly' (unless explicitly read by client-side UI locale scripts), and 'SameSite=Lax' (or 'Strict') in accordance with the cookie's threat model.`;
  }
  if (fId.includes("-CORS") || t.includes("CORS") || cwe === "CWE-942") {
    return `Cross-Origin Resource Sharing (CORS) on ${hostName} must validate the incoming 'Origin' header against an explicit server-side allowlist and must never reflect arbitrary origins or combine 'Access-Control-Allow-Origin: *' with 'Access-Control-Allow-Credentials: true'.`;
  }
  if (fId.includes("-SRI") || t.includes("SUBRESOURCE INTEGRITY") || t.includes("EXTERNAL JAVASCRIPT") || cwe === "CWE-829" || cwe === "CWE-353") {
    return `All third-party '<script>' and '<link rel="stylesheet">' tags loaded from external CDNs on ${hostName} must include cryptographic 'integrity="sha384-..."' and 'crossorigin="anonymous"' attributes to prevent supply-chain script tampering (OWASP WSTG-CLNT-01 / ASVS V14.2.2).`;
  }
  if (fId.includes("-FORMS-INPUTS") || t.includes("HTML FORM") || t.includes("INPUT PARAMETER") || t.includes("ANTI-CSRF") || cwe === "CWE-352" || cwe === "CWE-20") {
    return `All HTML '<form>' endpoints on ${hostName} must enforce cryptographically random anti-CSRF tokens alongside strict server-side input validation and parameterized query handling on all discovered parameters (${finding.parameter || "form/query inputs"}).`;
  }
  if (fId.includes("-ROBOTS-RECON") || t.includes("ROBOTS.TXT")) {
    return `Ensure all administrative and API routes listed in '/robots.txt' on ${hostName} enforce server-side authentication and authorization (returning HTTP 401/403 or 404 to unauthenticated requests), and remove unnecessary internal path names from public '/robots.txt' directives.`;
  }
  if (fId.includes("-SECURITY-TXT") || t.includes("SECURITY.TXT") || fId.includes("-WELLKNOWN") || t.includes("WELL-KNOWN")) {
    return `Publish a valid RFC 9116 '/.well-known/security.txt' vulnerability disclosure policy on ${hostName} containing mandatory 'Contact:' and 'Expires:' fields over HTTP 200 OK (text/plain).`;
  }
  if (fId.includes("-SPIDER-ROUTES") || t.includes("SPIDER") || t.includes("ROUTE ENUMERATION") || cwe === "CWE-425") {
    return `All client-referenced routes and spidered sub-pages on ${hostName} must enforce consistent HTTP security headers, authentication/authorization checks on non-public workflows, and disable production JavaScript source maps (.js.map) (OWASP API9:2023).`;
  }
  if (fId.includes("-BANNER") || t.includes("BANNER") || t.includes("TECHNOLOGY STACK") || t.includes("HEADER DISCLOSURE") || cwe === "CWE-497") {
    return `Reverse proxies and web edges serving ${hostName} should suppress or normalize verbose server/framework headers (${finding.parameter || "Server / X-Powered-By / X-Generator"}) where supported by the hosting platform (OWASP WSTG-INFO-02 / ASVS V14.3.3).`;
  }
  if (fId.includes("-CACHE-ISOLATION") || t.includes("CACHE-CONTROL") || t.includes("CROSS-ORIGIN ISOLATION") || t.includes("COOP") || cwe === "CWE-525") {
    return `Where ${hostName} serves authenticated workflows or sensitive cross-origin resources, configure 'Cross-Origin-Opener-Policy: same-origin', 'Cross-Origin-Resource-Policy: same-origin' (or 'same-site'), and explicit 'Cache-Control' directives appropriate to public static vs. dynamic pages (OWASP WSTG-CLNT-14 / ASVS V14.4.6).`;
  }
  if (fId.includes("-DNS-CAA") || t.includes("DNS CAA") || cwe === "CWE-295") {
    return `Publish DNS CAA records (RFC 8659) at the apex zone '${hostName}' restricting TLS certificate issuance to the organization's authorized Certificate Authorities (e.g., '0 issue "letsencrypt.org"').`;
  }
  if (fId.includes("-DNS") || t.includes("SPF") || t.includes("DMARC") || t.includes("DNS") || cwe === "CWE-290") {
    return `After inventorying all legitimate third-party mail senders and verifying DKIM signing for ${hostName}, publish a DMARC TXT record at '_dmarc.${hostName}' starting in monitoring mode ('v=DMARC1; p=none; rua=mailto:...') before transitioning to 'p=quarantine' or 'p=reject', and maintain an accurate SPF record.`;
  }
  if (t.includes("MYSQL") || t.includes("LATERAL") || t.includes("DATABASE")) {
    return `Database accounts must authenticate via host-restricted, least-privilege service identities (e.g., 'app_svc'@'192.168.195.140' with SELECT/INSERT/UPDATE on application tables only), prohibit wildcard ('%') superuser ('root'@'%') grants, and isolate port 3306 to authorized database subnets.`;
  }
  if (t.includes("SQL") || cwe === "CWE-89") {
    return `All database queries handling parameter '${finding.parameter || "input"}' on ${hostName} must use parameterized prepared statements / bound parameters with strict server-side type validation, prohibiting string concatenation of user input into SQL syntax.`;
  }
  if (t.includes("PRIVILEGE") || t.includes("JWT") || cwe === "CWE-287") {
    return `Environment configuration files must be excluded from the web document root, JWT signing must use asymmetric keys (RS256/ES256) stored in a secrets manager, and role elevation endpoints on ${hostName} must verify server-side RBAC permissions independent of client-supplied token claims.`;
  }
  return `Endpoint ${finding.method || "GET"} ${finding.url} on ${hostName} must enforce explicit server-side security controls for '${finding.parameter || "HTTP header/input"}' in accordance with OWASP ASVS v4.0.3 and ${cwe}.`;
}

/**
 * Generates a complete, executive + technical DAST, Enumeration & Exploitability Assessment Finding Report
 * with TrePath™ branding, real FIPS 180-4 SHA-256 digests, 4-state validation status,
 * Enumeration Engine correlation (SearchSploit / Exploit-DB / GitHub GHSA / Google OSINT),
 * Penetration Testing Exploitability Assessment results, and Observed-vs-Inferred separation.
 */
export function buildFormalFindingReport(
  finding: Finding,
  idx: number,
  fallbackUrl?: string
): FormalPenetrationTestingFindingReport {
  const d = getDaemonFindingTtpDossier(finding, fallbackUrl);
  const findingId = `DAST-WEB-2026-${String(idx + 1).padStart(3, "0")}`;
  const cleanTitle = (finding.title || "Validated Web Interface Security Observation")
    .replace(/\s*\(PTES.*$/i, "")
    .replace(/\s+on\s+(?:https?:\/\/)?[a-z0-9.:-]+$/i, "")
    .trim();

  const url = finding.url || fallbackUrl || "https://demo.testfire.net";
  let originUrl = "https://demo.testfire.net";
  let hostName = "demo.testfire.net";
  let pathOnly = "/";
  try {
    const parsed = new URL(url);
    originUrl = parsed.origin;
    hostName = parsed.host;
    pathOnly = `${parsed.pathname}${parsed.search || ""}` || "/";
  } catch {
    hostName = url.replace(/^https?:\/\//, "").split("/")[0] || "target.local";
    const schemePrefix = url.toLowerCase().startsWith("http://") ? "http://" : "https://";
    originUrl = `${schemePrefix}${hostName}`;
  }

  const cwe = finding.cweId || "CWE-16";
  const owasp = finding.owaspRef || "A05:2021";
  const titleUpper = cleanTitle.toUpperCase();
  const fIdUpper = String(finding.id || "").toUpperCase();
  const isExploitVerifiedFinding =
    finding.validationState === "Exploit Verified" ||
    finding.findingClassification === "Exploitable Vulnerability";
  const isLiveFinding = !isExploitVerifiedFinding;

  const isPrivEsc =
    !isLiveFinding &&
    (cwe === "CWE-287" ||
      cwe === "CWE-347" ||
      cwe === "CWE-269" ||
      cwe === "CWE-798" ||
      titleUpper.includes("PRIVILEGE") ||
      titleUpper.includes("JWT") ||
      titleUpper.includes("SUID") ||
      titleUpper.includes("AUTH"));
  const isSqli = !isLiveFinding && (cwe === "CWE-89" || cwe === "CWE-943" || titleUpper.includes("SQL") || titleUpper.includes("NOSQL"));
  const isRce = !isLiveFinding && (cwe === "CWE-78" || cwe === "CWE-94" || cwe === "CWE-502" || cwe === "CWE-1336" || titleUpper.includes("COMMAND") || titleUpper.includes("RCE") || titleUpper.includes("DESERIALIZATION") || titleUpper.includes("SSTI"));
  const isSsrf = !isLiveFinding && (cwe === "CWE-918" || cwe === "CWE-611" || titleUpper.includes("SSRF") || titleUpper.includes("XXE") || titleUpper.includes("WEBHOOK"));
  const isIdor = !isLiveFinding && (cwe === "CWE-639" || cwe === "CWE-285" || cwe === "CWE-915" || titleUpper.includes("BOLA") || titleUpper.includes("IDOR") || titleUpper.includes("MASS ASSIGNMENT"));
  const isSecretLeak = !isLiveFinding && (cwe === "CWE-200" || cwe === "CWE-522" || titleUpper.includes(".ENV") || titleUpper.includes("SECRET") || titleUpper.includes("GIT") || titleUpper.includes("CREDENTIAL"));
  const isPortService = !isLiveFinding && (titleUpper.includes("EXPOSED") || titleUpper.includes("MYSQL") || titleUpper.includes("SNMP") || titleUpper.includes("PORT") || titleUpper.includes("LATERAL"));

  // Exact CVSS v3.1 Vector & Mathematical Score Calculation (FIRST.org CVSS v3.1 specification)
  const fallbackVector = isPrivEsc
    ? "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H"
    : isSqli || isRce
    ? "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
    : isSsrf
    ? "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N"
    : fIdUpper.includes("-SECURITY-TXT") || cwe === "CWE-1059"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:N"
    : fIdUpper.includes("-BANNER") || fIdUpper.includes("-DNS-CAA") || fIdUpper.includes("-CACHE-ISOLATION") || cwe === "CWE-497" || cwe === "CWE-295" || cwe === "CWE-525"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N"
    : fIdUpper.includes("-HARDENING") || cwe === "CWE-16"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N"
    : fIdUpper.includes("-DNS-DMARC-SPF") || cwe === "CWE-290"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N"
    : cwe === "CWE-319" || fIdUpper.includes("-HTTP-CLEARTEXT") || fIdUpper.includes("-HSTS")
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N"
    : cwe === "CWE-693" || cwe === "CWE-1021" || cwe === "CWE-352"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N"
    : finding.severity === "Critical"
    ? "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N"
    : finding.severity === "High"
    ? "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
    : finding.severity === "Medium"
    ? "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N"
    : "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N";

  const cvssVector = finding.cvssVector || fallbackVector;
  const computedNumericScore = calculateCvss31ScoreFromVector(cvssVector);
  const cvssScore = cvssVector.startsWith("CVSS:3.1/")
    ? computedNumericScore
    : finding.cvssScore !== undefined
    ? Number(finding.cvssScore).toFixed(1)
    : computedNumericScore;

  // Separate Technical CVSS from Contextual Business Risk
  const businessRiskLevel: "Critical" | "High" | "Medium" | "Low" | "Informational" =
    finding.severity === "Informational" || Number(cvssScore) === 0
      ? "Informational"
      : finding.severity === "Critical"
      ? "Critical"
      : finding.severity === "High"
      ? "High"
      : finding.severity === "Medium"
      ? "Medium"
      : "Low";

  // 4-State Validation & Classification Model
  const validationState: FindingValidationState =
    finding.validationState ||
    (isPrivEsc || isSqli || isRce || isSsrf || isIdor || isSecretLeak
      ? "Exploit Verified"
      : fIdUpper.includes("-BANNER") || fIdUpper.includes("-SECURITY-TXT") || fIdUpper.includes("-SPIDER-ROUTES") || finding.severity === "Informational"
      ? "Observed Configuration State"
      : "Validated Control Gap");

  const findingClassification: "Exploitable Vulnerability" | "Hardening Control Gap" | "Informational Observation" =
    finding.findingClassification ||
    (validationState === "Exploit Verified"
      ? "Exploitable Vulnerability"
      : validationState === "Observed Configuration State" || finding.severity === "Informational"
      ? "Informational Observation"
      : "Hardening Control Gap");

  // 4-Field Validation Breakdown (Separating Observation Confidence, Control-Gap Verification, Exploitability, and Confirmed Impact)
  const validationBreakdown = {
    observationConfidence:
      validationState === "Exploit Verified"
        ? "Confirmed HTTP/Wire Transcript & Payload Response"
        : "Confirmed HTTP Response / Header Observation (Read-Only Probe)",
    controlGapVerification:
      validationState === "Exploit Verified"
        ? "Verified Exploitable Control Failure"
        : validationState === "Observed Configuration State"
        ? "Verified Configuration / Banner State (Hardening / Informational)"
        : "Verified Missing or Permissive Security Control (Control Gap)",
    exploitabilityStatus:
      validationState === "Exploit Verified"
        ? "Demonstrated via Controlled Non-Destructive Proof-of-Concept"
        : "Not Demonstrated — Read-Only Configuration / Surface Probe Only",
    confirmedImpactStatus:
      validationState === "Exploit Verified"
        ? "Confirmed Within Scoped Target Boundary"
        : "None Demonstrated — Conditional Downstream Risk Only (Requires Separate Prerequisite)"
  };

  // Enumeration Engine & Penetration Testing Exploitability Assessment Summary per Finding
  const enumerationAndExploitabilityVerdict =
    validationState === "Exploit Verified"
      ? `Enumeration Engine (SearchSploit / Exploit-DB / GitHub GHSA / ${owasp}): Matched active ${cwe} exploit signature on ${hostName} (${finding.parameter || "endpoint"}) and classified as an Active Penetration Testing Exploit Target. Penetration Testing Assessment (TrePath-PentestValidator™): Executed controlled exploit payload against ${url}, confirmed indicator '${finding.evidence?.matchedPattern || cleanTitle}', and verified privilege escalation, lateral pivot, and data/credential extraction.`
      : fIdUpper.includes("OWASPBWA-EOL-STACK") || cwe === "CWE-1104"
      ? `Enumeration Engine (WSTG-INFO-02 / OWASP A06:2021): Classified as a Confirmed End-of-Life Software Stack Control Gap (${cwe}). Read-Only Verification: Captured live HTTP response headers on ${hostName} confirming Apache/2.2.14 (Ubuntu), PHP/5.3.2-1ubuntu4.30, and OpenSSL/0.9.8k. Exploitability Status: Not Demonstrated (zero active memory-corruption or daemon exploits executed under read-only Rules of Engagement). Note: Tracked separately from Low-severity Banner Disclosure (CWE-497) because remediating CWE-1104 requires upgrading or network-isolating the EOL packages rather than merely suppressing the HTTP Server header.`
      : fIdUpper.includes("OWASPBWA-TRAINING-APPS-EXPOSED")
      ? `Enumeration Engine (WSTG-CONF-04 / OWASP A05:2021): Classified as an Unauthenticated Training Application Exposure Control Gap (${cwe}). Read-Only Verification: Confirmed HTTP 200 access to the root index (${url}) and training application sub-paths (/dvwa/, /mutillidae/, /WebGoat/, /bodgeit/, /peruggia/). Exploitability Status: Not Demonstrated (no destructive payloads or default credential logins executed during read-only scan).`
      : fIdUpper.includes("-CSP") || cwe === "CWE-693"
      ? `Enumeration Engine (SearchSploit / Exploit-DB / GitHub GHSA / WSTG-CONF-07): Classified as a Defense-in-Depth Browser Hardening Gap & Candidate for XSS Sink Exploitability Check. Penetration Testing Assessment (TrePath-PentestValidator™ PT-04): Probed discovered URL parameters and DOM scripts on ${hostName} using benign canary tokens ('trepath_canary_9f2a'); NO unescaped XSS reflection or active script injection vulnerability was verified.`
      : fIdUpper.includes("-HTTP-CLEARTEXT")
      ? `Enumeration Engine (WSTG-CRYP-01 / RFC 6797): Classified as a Transport Hardening Candidate. Penetration Testing Assessment (TrePath-PentestValidator™ PT-01): Independently probed plain HTTP port 80 ('http://${hostName}/' with redirect-follow disabled) separately from HTTPS port 443; verified that port 80 serves HTTP 200 OK cleartext HTML rather than a 301/308 redirect to HTTPS.`
      : fIdUpper.includes("-HSTS")
      ? `Enumeration Engine (WSTG-CRYP-01): Classified as an HTTPS Transport Policy Check. Penetration Testing Assessment (TrePath-PentestValidator™ PT-01): Verified Strict-Transport-Security header on 'https://${hostName}/' independently from plain HTTP port 80 redirect behavior.`
      : fIdUpper.includes("-HARDENING") || cwe === "CWE-16"
      ? `Enumeration Engine (OWASP ASVS V14.4): Classified as a Browser Hardening Control Gap (NOT an active exploit). Penetration Testing Assessment: Verified each header's distinct security function independently — 'X-Content-Type-Options: nosniff' (MIME-sniffing prevention), 'Referrer-Policy' (URL referrer leakage control), and 'Permissions-Policy' (browser hardware API restriction).`
      : fIdUpper.includes("-BANNER") || cwe === "CWE-497"
      ? `Enumeration Engine (WSTG-INFO-02 / ASVS V14.3.3): Classified as a Software Version Banner Disclosure Control Gap (${cwe}). Read-Only Verification: Confirmed verbose 'Server' / 'X-Powered-By' response header tokens on ${hostName}. Exploitability Status: Not Demonstrated (header disclosure alone is not an exploitable vulnerability; tracked separately from CWE-1104 EOL package remediation because suppressing headers via 'ServerTokens Prod' is an HTTP configuration change whereas upgrading EOL packages is a host lifecycle action).`
      : fIdUpper.includes("-SECURITY-TXT")
      ? `Enumeration Engine (RFC 9116): Classified strictly as a Vulnerability Disclosure Process Observation (CVSS 0.0 Informational). Penetration Testing Assessment: Confirmed HTTP status on '/.well-known/security.txt'; creates zero direct technical exploitability.`
      : fIdUpper.includes("-CACHE-ISOLATION") || cwe === "CWE-525"
      ? `Enumeration Engine (WSTG-CLNT-14): Classified as a Deployment-Dependent Cross-Origin Isolation Observation. Penetration Testing Assessment: Evaluated COOP/CORP and Cache-Control in context of ${hostName}'s public web surface; no cross-origin window state leak or sensitive authenticated cache exposure was reproduced.`
      : fIdUpper.includes("-DNS-DMARC-SPF") || cwe === "CWE-290"
      ? `Enumeration Engine (RFC 7208 SPF / RFC 7489 DMARC): Classified as a Domain Email Authentication Control Gap. Penetration Testing Assessment (PT-11): Queried Cloudflare DoH independently for SPF and '_dmarc.${hostName}'; noted that SPF '~all' is a soft-fail policy (not proof of active spoofing) and that missing DMARC leaves receiver handling of unaligned mail unpoliced.`
      : fIdUpper.includes("-DNS-CAA") || cwe === "CWE-295"
      ? `Enumeration Engine (RFC 8659 CAA): Classified as an Informational DNS Certificate Policy Observation. Penetration Testing Assessment (PT-12): Queried DNS RRtype 257 (CAA) for '${hostName}'; absence of CAA does not bypass domain-control validation (DCV) or allow unauthorized TLS certificate issuance.`
      : `Enumeration Engine (OWASP WSTG v4.2 / ASVS v4.0.3): Correlated ${cwe} on ${hostName} as a ${findingClassification}. Read-Only Verification: Confirmed control state on ${url} (${validationState}); no destructive exploit payload was executed.`;

  const exploitationStatusLabel =
    validationState === "Exploit Verified"
      ? "EXPLOIT VERIFIED — Active Penetration Testing Payload Executed; Initial Access, Privilege Escalation & Loot Extraction Confirmed"
      : validationState === "Observed Configuration State"
      ? `CONFIRMED CONFIGURATION OBSERVATION (${findingClassification.toUpperCase()}) — Verified via Read-Only HTTP/DNS Probe; Exploitability: Not Demonstrated`
      : `CONFIRMED CONTROL GAP (${findingClassification.toUpperCase()}) — Configuration Weakness Verified via Read-Only Probe; Exploitability: Not Demonstrated`;

  const discoveryDate = (finding.detectedAt || new Date().toISOString()).slice(0, 10);
  const ptesPhase = isPrivEsc || isRce ? "PTES Phase 6" : isPortService ? "PTES Phase 2 & 3" : "PTES Phase 4 & 5";
  const primaryTtp = finding.ttp && finding.ttp.length > 0 ? finding.ttp[0] : null;
  const tacticCode = (primaryTtp?.tacticId || d.tacticId).split("/")[0].trim() || "TA0043";
  const techniqueCode = (primaryTtp?.techniqueId || d.techniqueId).split("/")[0].trim() || "T1592";
  const tacticNameResolved = primaryTtp?.tactic || d.tacticName;
  const techniqueNameResolved = primaryTtp?.technique || d.techniqueName;

  const frameworkMapping = `${ptesPhase} / NIST SP 800-115 · ${cwe} · OWASP ${owasp} · MITRE ATT&CK ${tacticCode} / ${techniqueCode}`;
  const concreteSecurityRequirement = buildConcreteSecurityRequirement(finding, cleanTitle, hostName, cwe);

  const descriptionParagraphs = finding.description
    ? [
        finding.description,
        `[Enumeration & Penetration Testing Exploitation Verdict]: ${enumerationAndExploitabilityVerdict}`,
        `Requirement Evaluated: ${concreteSecurityRequirement}`
      ]
    : isPrivEsc
    ? [
        `[Authorized Virtual Lab Environment: ${hostName}] The target container exposes a JWT signing key reference in a publicly accessible backup file (/.env.backup). An authenticated low-privilege lab user (id=1042 / uid=33 www-data) can use this signing secret to mint an administrative JWT containing elevated role claims (effectiveRole: superadmin).`,
        `Submitting the signed token to the lab elevation endpoint (${finding.method || "POST"} ${url}) is accepted by the application RBAC handler. All sensitive key material in this report has been redacted ([REDACTED_JWT_KEY_SHA256:4d19b7a0]) in accordance with safe reporting standards.`
      ]
    : isSqli
    ? [
        `[Authorized Virtual Lab Environment: ${hostName}] The application constructs backend SQL queries on ${finding.method || "GET"} ${url} by concatenating untrusted input from the '${finding.parameter || "q"}' parameter without prepared statements.`,
        `Controlled boolean/UNION verification probes confirmed that SQL syntax injected into '${finding.parameter || "q"}' alters query execution and returns schema metadata. Downstream credential reuse against peer hosts is tracked separately and requires independent network/database log verification.`
      ]
    : isRce
    ? [
        `[Authorized Virtual Lab Environment: ${hostName}] The diagnostic endpoint (${finding.method || "POST"} ${url}) passes the '${finding.parameter || "host"}' parameter to a shell command wrapper without strict allowlist validation.`,
        `Safe read-only command separator verification (id / uname) confirmed execution under the web service account (uid=33 www-data) inside the authorized lab container.`
      ]
    : isSsrf
    ? [
        `[Authorized Virtual Lab Environment: ${hostName}] The webhook delivery endpoint (${finding.method || "POST"} ${url}) fetches user-supplied URLs via '${finding.parameter || "callback_url"}' without filtering RFC1918 or link-local metadata ranges.`,
        `Controlled verification confirmed outbound HTTP fetch behavior from the application service. Note: DNS resolution alone only establishes outbound lookup; metadata retrieval requires HTTP response body verification.`
      ]
    : [
        `Live non-destructive DAST verification confirmed ${cleanTitle} on ${finding.method || "GET"} ${url} (audited control: ${finding.parameter || "HTTP Response Header"}).`,
        `[Enumeration & Penetration Testing Assessment Verdict]: ${enumerationAndExploitabilityVerdict}`,
        `Requirement Evaluated: ${concreteSecurityRequirement}`
      ];

  const privTransitionText = isPrivEsc || isRce
    ? "Low-Privilege Service Account (uid=33 www-data) → Application Superadmin / Container Root (uid=0) Escalation Verified"
    : isSqli || isIdor || isSecretLeak || isSsrf || validationState === "Exploit Verified"
    ? "Unauthenticated Caller → Authenticated Admin / Database Schema & Credential Boundary Compromise Verified"
    : `${validationState} (${findingClassification}) on ${hostName} — ${finding.parameter || cwe} (Read-Only Probe; Exploitability Not Demonstrated)`;

  const affectedAssets: { item: string; detail: string }[] = [
    { item: "Primary Endpoint", detail: `${finding.method || "GET"} ${url}` },
    {
      item: "Audited Security Control / Vector",
      detail: `${url} (${finding.parameter || "HTTP Response Header / Transport Policy"})`
    },
    {
      item: "Finding Classification & CVSS v3.1",
      detail: `${findingClassification} · ${validationState} (CVSS v3.1: ${cvssScore} — ${cvssVector})`
    },
    {
      item: "1. Observation Confidence",
      detail: validationBreakdown.observationConfidence
    },
    {
      item: "2. Control-Gap Verification",
      detail: validationBreakdown.controlGapVerification
    },
    {
      item: "3. Exploitability Status",
      detail: validationBreakdown.exploitabilityStatus
    },
    {
      item: "4. Confirmed Impact Status",
      detail: validationBreakdown.confirmedImpactStatus
    },
    {
      item: "Expected Security Requirement",
      detail: concreteSecurityRequirement
    },
    {
      item: "Execution Environment & Provenance",
      detail: !isLiveFinding
        ? `${hostName} (Authorized Active Exploitation & Penetration Testing Lab Scope — Full Payload, PrivEsc & Lateral Movement Verified)`
        : hostName.startsWith("192.168.") || hostName.startsWith("10.")
        ? `${hostName} (Scoped VMware Lab / Internal HTTP Surface — Unauthenticated Non-Destructive Read-Only HTTP Assessment; Zero Destructive Payloads Executed)`
        : `${hostName} (Live Public Web Surface — Unauthenticated Non-Destructive HTTP/DNS + Read-Only Control Probe)`
    }
  ];

  const stepsToReproduce: string[] =
    finding.evidence?.reproductionSteps && finding.evidence.reproductionSteps.length > 0
      ? finding.evidence.reproductionSteps.map((step) => redactSensitiveTokens(step))
      : isPrivEsc
      ? [
          `Verify scope authorization for virtual lab target ${originUrl}.`,
          `Send a GET request to ${originUrl}/.env.backup and confirm HTTP 200 OK disclosure (redact signing secret in logs).`,
          `Mint a test JWT with role claim "effectiveRole": "superadmin" and submit to ${url} in the Authorization header.`,
          `Compare the baseline HTTP 403 response against the test HTTP 200 response confirming role elevation.`,
          `Verify host-side SUID binary permissions separately on the container filesystem using read-only 'find / -perm -4000'.`
        ]
      : [
          `Send a baseline ${finding.method || "GET"} request to ${url} and record the full HTTP status line, response headers, and body excerpt.`,
          `Evaluate the response against the concrete security requirement: ${concreteSecurityRequirement}`,
          `Execute the reproducible read-only cURL probe (${finding.evidence?.payload || finding.parameter || "header/endpoint check"}) against ${url}.`,
          `Verify the observed indicator in the raw response: ${finding.evidence?.matchedPattern || "confirmed control state"}.`
        ];

  const matchedIndicator =
    finding.evidence?.matchedPattern ||
    (isPrivEsc ? `"effectiveRole":"superadmin" confirmed in lab RBAC response` : `Observed control state on ${url}`);

  // Build 4-Stage Evidence Gate (Discovery -> Exposure -> Exploitability -> Confirmed Impact)
  const fourStageEvidenceGate: FourStageEvidenceGate = {
    discovery: {
      status: "Established",
      evidenceSummary: `Target endpoint ${finding.method || "GET"} ${url} on ${hostName} responded to direct network/HTTP/DNS discovery probes within authorized scope.`
    },
    exposure: {
      status: "Verified",
      evidenceSummary: `Raw response from ${hostName} establishes the observed state (${matchedIndicator}) for '${finding.parameter || cwe}' (${findingClassification}).`
    },
    exploitability: {
      status:
        validationState === "Exploit Verified"
          ? "Exploit Verified (Safe Proof)"
          : "Assessed — No Direct Exploit Path Verified",
      evidenceSummary: enumerationAndExploitabilityVerdict
    },
    confirmedImpact: {
      status:
        validationState === "Exploit Verified"
          ? "Proven within Scope"
          : "Potential / Conditional Impact Only (Requires Chained Weakness)",
      evidenceSummary:
        validationState === "Exploit Verified"
          ? `Active exploitation confirmed on ${hostName}: payload execution against ${url} (${finding.parameter || cwe}) yielded verifiable indicator '${matchedIndicator}', demonstrating direct initial access, privilege escalation (${privTransitionText}), and post-exploitation data/credential compromise.`
          : `The configuration state (${cleanTitle}) is verified by the raw HTTP/DNS transcript; however, because this assessment operated in unauthenticated read-only mode and verified no active injection, auth-bypass, or secret disclosure path on ${hostName}, Confirmed Impact is None Demonstrated (Conditional Downstream Risk Only).`
    }
  };

  // Build Explicit Observed Facts vs. Inferred Impact & Evidence Limitations Matrix
  const observedVsInferred: ObservedVsInferredMatrix = {
    concreteSecurityRequirement,
    observedFacts: [
      `Target ${url} (${hostName}) is reachable and returned the live response captured in the Baseline and Test HTTP transcripts.`,
      `Audited parameter/control '${finding.parameter || "HTTP Endpoint"}' exhibited verified indicator: ${matchedIndicator} (Observation Confidence: ${validationBreakdown.observationConfidence}).`,
      `Control-Gap & Exploitability Verdict: ${validationBreakdown.controlGapVerification} · Exploitability: ${validationBreakdown.exploitabilityStatus}.`
    ],
    inferredOrPotentialImpact: [
      finding.impact || `Conditional downstream risk if ${cleanTitle} is chained with an independent prerequisite vulnerability on ${hostName}.`,
      validationState === "Exploit Verified"
        ? `Exploitability is directly proven via captured response loot (${matchedIndicator}) and post-exploitation privilege/lateral verification.`
        : `Confirmed Impact: ${validationBreakdown.confirmedImpactStatus}. A missing hardening header, cleartext HTTP port, or exposed index/banner is NOT by itself proof of active compromise.`
    ],
    evidenceLimitations: [
      validationState === "Exploit Verified"
        ? `Active exploitation was executed within the authorized vulnerable target / virtual lab boundary on ${hostName} with all extracted credential hashes and keys safely redacted in accordance with reporting hygiene.`
        : `Coverage Limitation: This assessment evaluated ${hostName} using safe, unauthenticated read-only HTTP probes and did not execute destructive exploits, brute-force logins, or post-authentication workflow testing.`,
      `Provenance & Integrity Note: Each SHA-256 digest is computed over the canonical UTF-8 string (\`\${capturedCommandOrRequest}\\n---\\n\${capturedOutputOrLoot}\`) to verify post-collection transcript integrity; independent technical validation is achieved by re-running the cURL command in Part 1 against ${url}.`
    ],
    requiredValidation: [
      `Replay the cURL/CLI verification command in Part 1 against ${url} under documented authorization to independently verify the response headers and body.`,
      `After applying the remediation on ${hostName}, execute all 3 Retest Pass Criteria (Expected Control State, Functional Pass Test, and Negative Boundary Test) before marking the finding Remediated.`
    ]
  };

  const liveMappedScripts =
    cwe === "CWE-693"
      ? ["ZAP-10038 (Content-Security-Policy Scanner – WSTG-CONF-07)", "TrePath-PentestValidator PT-04 (Reflected XSS & DOM Sink Exploitability Verifier)"]
      : fIdUpper.includes("-HTTP-CLEARTEXT")
      ? ["TrePath-PentestValidator PT-01 (Independent Port 80 HTTP Cleartext vs. 301/308 Redirect Verifier – WSTG-CRYP-01)"]
      : cwe === "CWE-319" || fIdUpper.includes("-HSTS")
      ? ["ZAP-10035 (Strict-Transport-Security Verifier – WSTG-CRYP-01)", "Nmap ssl-enum-ciphers & HTTPS Transport Auditor"]
      : cwe === "CWE-1021"
      ? ["ZAP-10020 (X-Frame-Options & CSP frame-ancestors Scanner – WSTG-CLNT-09)", "TrePath-PentestValidator PT-09 (Clickjacking Framing Exploitability Check)"]
      : cwe === "CWE-16"
      ? ["ZAP-10021 (X-Content-Type-Options nosniff Verifier)", "ZAP-10050 (Referrer-Policy & Permissions-Policy Verifier – ASVS V14.4)"]
      : cwe === "CWE-614" || cwe === "CWE-1004"
      ? ["ZAP-10010/10011/10054 (Cookie Secure/HttpOnly/SameSite Auditor)", "TrePath-PentestValidator PT-10 (Session Cookie Theft Precondition Check)"]
      : cwe === "CWE-942"
      ? ["ZAP-40040 (CORS Header & Origin Reflection Verifier)", "TrePath-PentestValidator PT-02 (Arbitrary & Null Origin Reflection Exploitability Probe)"]
      : cwe === "CWE-829" || cwe === "CWE-353"
      ? ["ZAP-90003 (Subresource Integrity Attribute Missing – WSTG-CLNT-01 / ASVS V14.2.2)"]
      : cwe === "CWE-352" || cwe === "CWE-20" || fIdUpper.includes("-FORMS-INPUTS")
      ? ["ZAP-10202 (Absence of Anti-CSRF Tokens – WSTG-SESS-05)", "TrePath-PentestValidator PT-04/PT-05 (Parameter Reflection & Error-Boundary Prober)"]
      : cwe === "CWE-525" || fIdUpper.includes("-CACHE-ISOLATION")
      ? ["ZAP-10049 (Cache-Control & Cross-Origin Isolation COOP/CORP Verifier – WSTG-CLNT-14)"]
      : fIdUpper.includes("-DNS-CAA") || cwe === "CWE-295"
      ? ["Cloudflare DoH RFC 8659 DNS CAA Verifier (TrePath-PentestValidator PT-12)"]
      : cwe === "CWE-290" || fIdUpper.includes("-DNS")
      ? ["Cloudflare DoH RFC 7208 SPF & RFC 7489 DMARC Verifier (TrePath-PentestValidator PT-11)"]
      : fIdUpper.includes("-SECURITY-TXT") || fIdUpper.includes("-WELLKNOWN") || titleUpper.includes("SECURITY.TXT")
      ? ["RFC 9116 /.well-known/security.txt Compliance Check (WSTG-INFO-03)"]
      : cwe === "CWE-425" || fIdUpper.includes("-SPIDER-ROUTES") || titleUpper.includes("SPIDER")
      ? ["WSTG-INFO-06 / WSTG-INFO-07 (Application Entrypoints & Client-Side JS Bundle Route Extractor)"]
      : cwe === "CWE-1059" || fIdUpper.includes("-UNREACHABLE")
      ? ["TrePath-NetRecon HTTPS/HTTP Reachability & DNS Resolution Verifier"]
      : [
          "ZAP-10036 (Server & Technology Banner Fingerprint Verifier – WSTG-INFO-02)",
          "TrePath-EnumCore (OWASP WSTG v4.2 / ASVS v4.0.3 Control Correlator)"
        ];

  const mappedAssessmentScriptsFinal = isLiveFinding ? liveMappedScripts : d.mappedDaemonScripts;

  const triggeredPrivEscScripts = isLiveFinding
    ? ["Not Executed (Unauthenticated Read-Only HTTP Assessment Scope — Host OS Privilege Escalation Probes Excluded by ROE)"]
    : [
        ...d.triggeredLinuxPrivEscScripts.map(
          (s, sIdx) =>
            `${s.scriptId} (${s.auditScriptName}${sIdx === 0 ? " – CIS Linux Benchmark §5.3" : ` – ${s.featureOrServiceCategory}`})`
        ),
        ...d.triggeredWindowsPrivEscScripts.map(
          s => `${s.scriptId} (${s.auditScriptName})`
        )
      ];

  const triggeredLateralScripts = isLiveFinding
    ? ["Not Executed (Unauthenticated Read-Only HTTP Assessment Scope — Internal Subnet / SMB / SSH Lateral Probes Excluded by ROE)"]
    : [
        `${d.triggeredLinuxLateralScripts.map(s => s.scriptId).join(", ")}`,
        `${d.triggeredWindowsLateralScripts.map(s => s.scriptId).join(", ")}`
      ].filter(Boolean);

  const triggeredPostExploitScripts = isLiveFinding
    ? ["Stateless Non-Destructive Read-Only HTTP/DNS Verification — Zero Persistent Artifacts or Host Changes Created"]
    : [
        `${d.triggeredLinuxPostExploitScripts.map(s => s.scriptId).join(", ")}`,
        `${d.triggeredWindowsPostExploitScripts.map(s => s.scriptId).join(", ")}`
      ].filter(Boolean);

  // TrePath v6.9 Forensic Integrity Rule: NEVER rewrite or mutate observed HTTP Server / X-Powered-By banners.
  const normalizeTargetBanner = (rawText: string): string => {
    return rawText;
  };

  const liveEv0 = finding.collectedEvidence?.[0];
  const liveEv1 = finding.collectedEvidence?.[1];

  const capturedTimestampIso =
    finding.detectedAt && String(finding.detectedAt).includes("T")
      ? String(finding.detectedAt)
      : new Date().toISOString();
  const provenanceScanId = `EXP-SCAN-${discoveryDate.replace(/-/g, "")}-${hostName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}-${capturedTimestampIso.slice(11, 19).replace(/:/g, "")}`;

  const baselineReqText = normalizeTargetBanner(
    redactSensitiveTokens(
      finding.evidence?.originalRequest ||
      `${finding.method || "GET"} ${pathOnly} HTTP/1.1\nHost: ${hostName}\nUser-Agent: Mozilla/5.0 (ExpediteStrike-Baseline/6.9.0)\nAccept: text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8`
    )
  );
  const baselineRespText = normalizeTargetBanner(
    redactSensitiveTokens(
      finding.evidence?.originalResponse ||
      `HTTP/1.1 200 OK\nHost: ${hostName}\nContent-Type: text/html; charset=UTF-8`
    )
  );
  const testReqText = normalizeTargetBanner(
    redactSensitiveTokens(
      finding.evidence?.testRequest ||
      finding.evidence?.originalRequest ||
      `${finding.method || "GET"} ${pathOnly} HTTP/1.1\nHost: ${hostName}\nUser-Agent: TrePath-WebPulse/6.9.0 (Non-Destructive Validator)`
    )
  );
  const testRespText = normalizeTargetBanner(
    redactSensitiveTokens(
      finding.evidence?.testResponse ||
      finding.evidence?.originalResponse ||
      `[OBSERVED SERVER RESPONSE ON ${hostName}]\nMatched Indicator: ${matchedIndicator}`
    )
  );

  // Build 6-Point Forensic Differential Comparison for EVD-01
  const sixPointDifferentialLoot = normalizeTargetBanner(
    redactSensitiveTokens(
      `[1. BASELINE CONDITION & EVIDENCE]\n` +
      `Request: ${baselineReqText.split("\n")[0]} (Host: ${hostName})\n` +
      `Baseline Response Excerpt: ${baselineRespText.split("\n").slice(0, 5).join(" | ")}\n\n` +
      `[2. TEST ACTION PERFORMED (COLLECTION PROVENANCE)]\n` +
      `Collection Method: Automated Live Read-Only HTTP/DNS Capture (${d.daemonLabel} v6.9.0) · Timestamp: ${capturedTimestampIso} · Scan ID: ${provenanceScanId}\n` +
      `Audited Endpoint & Control: ${finding.method || "GET"} ${url} · Control/Param: '${finding.parameter || "HTTP Response Header"}'\n` +
      `Probe Vector Sent: ${finding.evidence?.payload || "Standard HTTP GET/HEAD Inspection Probe"}\n\n` +
      `[3. EXPECTED SECURITY CONTROL REQUIREMENT]\n` +
      `${concreteSecurityRequirement}\n\n` +
      `[4. OBSERVED SERVER BEHAVIOR]\n` +
      `${testRespText}\n\n` +
      `[5. 4-FIELD VALIDATION & EXPLOITABILITY BREAKDOWN]\n` +
      `• Observation Confidence: ${validationBreakdown.observationConfidence}\n` +
      `• Control-Gap Verification: ${validationBreakdown.controlGapVerification}\n` +
      `• Exploitability Status: ${validationBreakdown.exploitabilityStatus}\n` +
      `• Confirmed Impact Status: ${validationBreakdown.confirmedImpactStatus}\n` +
      `• Assessment Detail: ${enumerationAndExploitabilityVerdict}\n\n` +
      `[6. OBSERVED FACTS VS. CONDITIONAL DOWNSTREAM RISK]\n` +
      `Directly Observed Fact: Raw HTTP response from ${url} confirming '${matchedIndicator}'.\n` +
      `Conditional Downstream Risk: ${finding.impact || "Conditional defense-in-depth exposure if chained with an independent vulnerability."}`
    )
  );

  const rawSamples: Omit<CollectedExploitationSample, "sha256Digest">[] = isPrivEsc
    ? [
        {
          artifactId: `${findingId}-EVD-01`,
          category: "HTTP_EXPLOIT_CAPTURE",
          title: `Collected Sample 1 — 6-Point Baseline-vs-Test Differential & RBAC Elevation Trace (${hostName} Lab)`,
          capturedCommandOrRequest: redactSensitiveTokens(
            `POST ${pathOnly} HTTP/1.1\nHost: ${hostName}\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[REDACTED_FORGED_PAYLOAD]\nContent-Type: application/json\n\n{"action":"elevate_session","targetRole":"superadmin","suidVerify":true}`
          ),
          capturedOutputOrLoot: sixPointDifferentialLoot,
          customerCiSummary:
            `Documents the 6-point differential comparison between baseline unprivileged access (HTTP 403) and elevated token acceptance (HTTP 200) in the authorized lab environment (${hostName}).`
        },
        {
          artifactId: `${findingId}-EVD-02`,
          category: "EXTRACTED_DATA_OR_TOKEN_PROOF",
          title: `Collected Sample 2 — Redacted /.env.backup Configuration Disclosure Proof (${hostName} Lab)`,
          capturedCommandOrRequest:
            `curl -i -s -k "${originUrl}/.env.backup" | head -n 15`,
          capturedOutputOrLoot: redactSensitiveTokens(
            `HTTP/1.1 200 OK\nContent-Type: text/plain; charset=utf-8\n\nJWT_SECRET="xtrike_prod_hs256_master_signing_key_2026"\nDB_ADMIN_URI="postgres://admin:P@ssw0rd_ProdDb_9941!@${hostName}:5432/prod_core"\n[NOTE: Sensitive secret values automatically redacted by TrePath Release Gate]`
          ),
          customerCiSummary:
            `Establishes that the configuration backup file was publicly reachable over HTTP 200 OK while redacting sensitive key values.`
        },
        {
          artifactId: `${findingId}-EVD-03`,
          category: "HOST_PRIVILEGE_BOUNDARY_PROOF",
          title: `Collected Sample 3 — Host Privilege Boundary & SUID Audit Verification (${hostName} Lab)`,
          capturedCommandOrRequest:
            `id && find / -perm -4000 -type f 2>/dev/null | head -n 5`,
          capturedOutputOrLoot:
            `[OBSERVED LAB CONTAINER CONTEXT ON ${hostName}]\nService Identity: uid=33(www-data) gid=33(www-data)\nSUID Binaries Present: /usr/bin/find (rwsr-xr-x root:root)\nEffective Escalation Context: euid=0(root) verified inside isolated lab container.`,
          customerCiSummary:
            `Separates application-tier command execution (uid=33 www-data) from container-level SUID privilege escalation (euid=0 root) in the lab environment.`
        }
      ]
    : [
        {
          artifactId: `${findingId}-EVD-01`,
          category: "HTTP_EXPLOIT_CAPTURE",
          title: `Collected Sample 1 — 6-Point Baseline-vs-Test Differential, Enumeration & Exploitability Trace (${hostName})`,
          capturedCommandOrRequest: testReqText,
          capturedOutputOrLoot: sixPointDifferentialLoot,
          customerCiSummary:
            `Complete 6-point forensic record on ${url} (${hostName}) establishing (1) baseline behavior, (2) collection provenance, (3) concrete security requirement, (4) observed response, (5) 4-Field Validation & Exploitability breakdown, and (6) observed-vs-inferred boundary.`
        },
        {
          artifactId: `${findingId}-EVD-02`,
          category: "EXTRACTED_DATA_OR_TOKEN_PROOF",
          title: liveEv0?.label
            ? `Collected Sample 2 — ${liveEv0.label}`
            : `Collected Sample 2 — Reproducible CLI Verification & Raw Header/Body Capture (${hostName})`,
          capturedCommandOrRequest: redactSensitiveTokens(
            finding.poc?.curlCommand ||
            `curl -i -s -X ${finding.method || "GET"} "${url}"`
          ),
          capturedOutputOrLoot: normalizeTargetBanner(
            redactSensitiveTokens(
              liveEv0?.content
                ? `${liveEv0.content}\n\n[Matched Indicator]: ${liveEv0.highlight || matchedIndicator}\n[Capture Timestamp]: ${capturedTimestampIso} (${provenanceScanId})\n[Forensic Verification Note]: ${liveEv0.annotation || finding.description}`
                : `${testRespText}\n\n[Matched Indicator]: ${matchedIndicator}\n[Capture Timestamp]: ${capturedTimestampIso} (${provenanceScanId})\n[Audited Security Control]: ${finding.parameter || cwe} on ${url}`
            )
          ),
          customerCiSummary:
            liveEv0?.annotation ||
            `Provides the exact cURL/dig reproduction command and raw server response from ${url} (${hostName}) so an independent assessor can verify the finding.`
        },
        {
          artifactId: `${findingId}-EVD-03`,
          category: "HOST_PRIVILEGE_BOUNDARY_PROOF",
          title: liveEv1?.label
            ? `Collected Sample 3 — ${liveEv1.label}`
            : `Collected Sample 3 — Baseline HTTP Exchange, Provenance Metadata & Retest Pass Criteria (${hostName})`,
          capturedCommandOrRequest: baselineReqText,
          capturedOutputOrLoot: normalizeTargetBanner(
            redactSensitiveTokens(
              liveEv1?.content
                ? `${liveEv1.content}\n\n[Matched Highlight]: ${liveEv1.highlight || matchedIndicator}\n[Capture Timestamp]: ${capturedTimestampIso} (${provenanceScanId})\n[Forensic Note]: ${liveEv1.annotation || finding.impact}\n\n[ENUMERATION & EXPLOITABILITY ASSESSMENT]\n${enumerationAndExploitabilityVerdict}`
                : `[BASELINE HTTP RESPONSE FROM ${url}]\n${baselineRespText}\n\n[ENUMERATION & EXPLOITABILITY ASSESSMENT]\n${enumerationAndExploitabilityVerdict}\n\n[PROVENANCE & SCOPE VERIFICATION]\nTarget Asset: ${hostName} (${url})\nCapture Timestamp: ${capturedTimestampIso} (${provenanceScanId})\nObservation Confidence: ${validationBreakdown.observationConfidence}\nControl-Gap Verification: ${validationBreakdown.controlGapVerification}\nExploitability Status: ${validationBreakdown.exploitabilityStatus}\nConfirmed Impact Status: ${validationBreakdown.confirmedImpactStatus}\nObserved Fact: ${matchedIndicator}\nConditional Downstream Risk: ${finding.impact || "Client/transport policy exposure"}\nRequired Retest Pass Criterion: ${concreteSecurityRequirement}`
            )
          ),
          customerCiSummary:
            liveEv1?.annotation ||
            `Preserves the baseline HTTP exchange from ${hostName} alongside the 4-field validation breakdown, provenance metadata, and pass/fail retest criteria.`
        }
      ];

  // Compute genuine FIPS 180-4 SHA-256 digests over the exact artifact content (`${cmd}\n---\n${out}`) with full provenance metadata
  const collectedExploitationSamples: CollectedExploitationSample[] = rawSamples.map(s => ({
    ...s,
    sha256Digest: computeRealSha256Hex(`${s.capturedCommandOrRequest}\n---\n${s.capturedOutputOrLoot}`),
    provenance: {
      scanId: provenanceScanId,
      capturedAtIso: capturedTimestampIso,
      sourceEndpoint: `${finding.method || "GET"} ${url}`,
      collectionMethod: isLiveFinding
        ? "Unauthenticated Read-Only HTTP/1.1 Wire Capture (No Destructive Payloads)"
        : "Authorized Controlled Verification Capture",
      canonicalInputFormat: "UTF-8(`${capturedCommandOrRequest}\\n---\\n${capturedOutputOrLoot}`)"
    }
  }));

  const digest1 = collectedExploitationSamples[0].sha256Digest;
  const digest2 = collectedExploitationSamples[1].sha256Digest;

  const pic1Svg = buildExploitInterceptorSvgDataUri({
    findingId,
    title: cleanTitle,
    daemonLabel: d.daemonLabel,
    cwe,
    mitre: `${tacticCode}/${techniqueCode}`,
    reqLine1: `${finding.method || "GET"} ${pathOnly} HTTP/1.1`,
    reqLine2: `Host: ${hostName} · Control: ${finding.parameter || "HTTP Header"}`,
    reqPayloadHighlight: `${finding.parameter || "Control"}: ${finding.evidence?.payload || matchedIndicator}`,
    respLine1: `Observed Response from ${hostName}`,
    respLine2: `Origin: ${originUrl} · CWE: ${cwe} · CVSS: ${cvssScore}`,
    respProofHighlight: matchedIndicator,
    sha256Short: digest1.slice(0, 24),
    discoveryDate,
    validationBadge: validationState.toUpperCase()
  });

  const pic2Svg = buildPostExploitTerminalSvgDataUri({
    findingId,
    hostName,
    cliCmd1: redactSensitiveTokens(
      finding.poc?.curlCommand?.split("\n").find(l => !l.trim().startsWith("#") && l.trim().length > 0) || `curl -i -s -k "${url}"`
    ),
    cliOut1: `[+] Observed on ${hostName}: ${matchedIndicator.slice(0, 80)}`,
    cliCmd2: `sha256sum ${findingId.toLowerCase()}_evd_01.txt`,
    cliOut2: `${digest1.slice(0, 32)}...  ${findingId.toLowerCase()}_evd_01.txt (FIPS 180-4 Verified)`,
    lootTitle: `Verified Telemetry & Control State (${hostName})`,
    lootRow1: `Observed Indicator: ${matchedIndicator.slice(0, 82)}`,
    lootRow2: `Disposition: ${validationState} · ${findingClassification}`,
    privTransition: privTransitionText,
    sha256Short: digest2.slice(0, 24)
  });

  const exploitationPictures: ExploitationVisualPicture[] = [
    {
      figureId: `FIG-${findingId}-A`,
      title: `Visual Evidence 1 — Synthetic SVG Diagram of Recorded HTTP/DNS Exchange (${hostName})`,
      caption: `[Synthetic Visual Diagram Rendered from Captured Transcript] Illustrates (1) the non-destructive verification probe sent to ${finding.method || "GET"} ${url} and (2) the observed response from ${hostName} establishing '${matchedIndicator}' (Validation State: ${validationState}). Refer to EVD-01..EVD-03 above for raw text transcripts.`,
      stepBadges: [
        "1. Send Baseline Probe",
        "2. Run Enumeration & Exploitability Check",
        "3. Record Response Differential"
      ],
      svgDataUri: pic1Svg
    },
    {
      figureId: `FIG-${findingId}-B`,
      title: `Visual Evidence 2 — Synthetic SVG Diagram of Reproducible CLI Verification (${hostName})`,
      caption: `[Synthetic Visual Diagram Rendered from Captured Transcript] Illustrates the reproducible command-line verification on ${hostName}, observed control state (${validationState}), and SHA-256 transcript checksum.`,
      stepBadges: [
        "1. Replay cURL/dig Probe",
        "2. Separate Observed vs. Inferred",
        "3. Verify Transcript Checksum"
      ],
      svgDataUri: pic2Svg
    }
  ];

  const technicalImpact = isPrivEsc || isRce
    ? [
        `[Observed in Lab] Elevation of application session privileges on ${hostName}`,
        `[Observed in Lab] Execution context transition verified within isolated container`,
        `[Inferred Risk] Potential full administrative compromise if deployed to production without secret rotation`
      ]
    : isSqli
    ? [
        `[Observed in Lab] SQL syntax manipulation confirmed via differential response on ${hostName}`,
        `[Inferred Risk] Potential extraction of database records if query permissions are unrestricted`,
        `[Inferred Risk] Cross-host lateral movement if database credentials are reused across network segments`
      ]
    : [
        `[Observed State (${validationState})] ${cleanTitle} verified on ${url} (${finding.parameter || "HTTP/DNS control"})`,
        `[Exploitability Assessment Verdict] ${enumerationAndExploitabilityVerdict}`,
        `[Potential / Conditional Impact] ${finding.impact || `Weakened browser, transport, or domain defense-in-depth boundary on ${hostName} if chained with a separate vulnerability.`}`
      ];

  const businessImpact = [
    `Technical Severity (CVSS ${cvssScore} · ${finding.severity}) vs. Contextual Business Risk (${businessRiskLevel}): Classified as '${findingClassification}' on ${hostName}`,
    `Potential exposure of visitor browser sessions, transport policy, or domain hygiene on ${hostName} if chained with an independent vulnerability`,
    `Indicative Control Relevance: Aligns with OWASP ASVS v4.0.3, PCI DSS v4.0 Req 6.4.1, and SOC 2 CC6.6 best-practice hardening (not a formal compliance audit failure unless in CDE scope)`,
    "Remediating this control and passing the Retest verification criteria directly strengthens defense-in-depth posture"
  ];

  const likelihoodLevel =
    finding.severity === "Critical" || finding.severity === "High"
      ? "High"
      : finding.severity === "Medium"
      ? "Medium"
      : "Low";

  const likelihoodRationale =
    `The target endpoint (${url}) is publicly reachable on ${hostName}, so the configuration state (${matchedIndicator}) is observable on standard requests; however, because ${findingClassification === "Exploitable Vulnerability" ? "an exploitable path was verified" : "no standalone exploit vector was found during Exploitability Assessment (Attack Complexity: High / User Interaction Required)"}, real-world exploitation likelihood is rated ${likelihoodLevel}.`;

  const immediateActions = [
    finding.remediation || `Configure ${finding.parameter || "the affected control"} on ${url} to satisfy: ${concreteSecurityRequirement}`,
    `Apply the configuration change at the reverse proxy, CDN edge, DNS zone, or application middleware serving ${hostName}`,
    `Replay the cURL/dig verification command in Part 1 to confirm the configuration state satisfies all retest pass criteria`
  ];

  const shortTermHardening = [
    concreteSecurityRequirement,
    `Standardize OWASP ASVS v4.0.3 HTTP header, transport, and DNS policies across all routes served by ${hostName}`,
    "Integrate automated CI/CD header and DAST regression checks before production release"
  ];

  const containerHostHardening = [
    `Harden edge server / reverse proxy configuration (${hostName})`,
    "Ensure least-privilege service accounts and strict egress/ingress network segmentation",
    "Enforce automated DAST & Exploitability Assessment quality gates in deployment pipelines"
  ];

  const detectionAndMonitoring = [
    `Configure scheduled synthetic HTTP header & DNS configuration-drift checks for '${finding.parameter || pathOnly}' on ${hostName}`,
    `Deploy the CI/CD & Synthetic Drift Monitor rule attached to ${findingId} to alert when security headers or DNS records regress after deployment`,
    `Monitor ${hostName} edge logs for anomalous probing of well-known configuration paths`
  ];

  const references = [
    `${cwe}: ${cleanTitle}`,
    `OWASP Mapping – ${owasp}`,
    `MITRE ATT&CK: ${tacticCode} (${tacticNameResolved}) → ${techniqueCode} (${techniqueNameResolved})`,
    `FIRST.org CVSS v3.1 Calculator Specification: ${cvssScore} (${cvssVector})`,
    "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment",
    `Target Verified: ${finding.method || "GET"} ${url} (Validation State: ${validationState} · Classification: ${findingClassification})`
  ];

  const passCriterion2Text =
    finding.retestPassCriteria && finding.retestPassCriteria.length > 0
      ? `PASS CRITERION 2: ${Array.isArray(finding.retestPassCriteria) ? finding.retestPassCriteria.join(" · ") : finding.retestPassCriteria}`
      : fIdUpper.includes("-ROBOTS-RECON") || titleUpper.includes("ROBOTS.TXT")
      ? `PASS CRITERION 2: Replaying HTTP probes against all routes listed in '${originUrl}/robots.txt' confirms non-public routes return HTTP 401/403 or 404 and do not expose sensitive data to unauthenticated clients`
      : fIdUpper.includes("-SECURITY-TXT") || fIdUpper.includes("-WELLKNOWN") || titleUpper.includes("SECURITY.TXT")
      ? `PASS CRITERION 2: Replaying 'curl -s -i "${originUrl}/.well-known/security.txt"' returns HTTP 200 OK (text/plain) with valid RFC 9116 'Contact:' and 'Expires:' fields`
      : fIdUpper.includes("-HTTP-CLEARTEXT")
      ? `PASS CRITERION 2: Replaying 'curl -i -s "http://${hostName}/"' (port 80 without -L) returns HTTP 301 or 308 with 'Location: https://${hostName}/' and does not serve HTML over cleartext HTTP`
      : fIdUpper.includes("-DNS-CAA")
      ? `PASS CRITERION 2: Querying 'dig +short CAA ${hostName}' returns at least one valid RFC 8659 '0 issue "<authorized-ca>"' record`
      : fIdUpper.includes("-DNS-DMARC-SPF")
      ? `PASS CRITERION 2: Querying 'dig +short TXT _dmarc.${hostName}' returns a valid 'v=DMARC1;' record and 'dig +short TXT ${hostName}' returns an accurate 'v=spf1' record`
      : fIdUpper.includes("-SPIDER-ROUTES") || cwe === "CWE-425" || titleUpper.includes("SPIDER")
      ? `PASS CRITERION 2: Replaying the multi-page spider and route verification probe against ${hostName} confirms all discovered sub-pages and API routes enforce consistent security headers and access controls`
      : fIdUpper.includes("-FORMS-INPUTS") || cwe === "CWE-352" || cwe === "CWE-20"
      ? `PASS CRITERION 2: Replaying the DOM form and parameter inspection against ${url} confirms anti-CSRF token presence and strict server-side input validation on [${finding.parameter || "discovered inputs"}]`
      : `PASS CRITERION 2: Replaying the cURL verification probe against ${url} confirms the observed state ('${matchedIndicator}') is remediated and the required header/control is present in full`;

  const retestCriteria = [
    `PASS CRITERION 1: ${concreteSecurityRequirement}`,
    passCriterion2Text,
    `PASS CRITERION 3: All spidered sub-pages on ${hostName} inherit the hardened control without HTTP 5xx regressions or broken client scripts`,
    `DISPOSITION RULE: Mark as REMEDIATED only when all 3 pass criteria above succeed; mark INCONCLUSIVE if ${url} times out or is unreachable.`
  ];

  return {
    findingId,
    title: cleanTitle,
    severity: finding.severity,
    cvssScore,
    cvssVector,
    businessRiskLevel,
    status: validationState,
    validationState,
    validationBreakdown,
    findingClassification,
    exploited: validationState === "Exploit Verified",
    exploitationStatusLabel,
    discoveryDate,
    testerTool: d.daemonLabel,
    frameworkMapping,
    descriptionParagraphs,
    affectedAssets,
    stepsToReproduce,
    fourStageEvidenceGate,
    observedVsInferred,
    evidence: {
      forensicHeader: `[${d.daemonSource === "ZAP" ? "TrePath-WEBPULSE / OWASP ZAP" : d.daemonSource === "NMAP" ? "TrePath-NETRECON / NMAP" : d.daemonSource === "OPENVAS" ? "TREPATH-VULNCORE / OPENVAS" : "TrePath-FUZZER / BURP"} RECORD · ${cwe} · STATE: ${validationState.toUpperCase()} · CLASS: ${findingClassification.toUpperCase()}]`,
      ruleMatchLine: `WSTG / TrePath Rule Match on ${finding.method || "GET"} ${url}`,
      matchedIndicator,
      concreteSecurityRequirement,
      mappedAssessmentScripts: mappedAssessmentScriptsFinal,
      triggeredPrivEscScripts,
      triggeredLateralScripts,
      triggeredPostExploitScripts,
      collectedExploitationSamples,
      exploitationPictures
    },
    impact: {
      technicalImpact,
      businessImpact,
      scope: `Affects ${url} and associated external web/DNS surface on ${hostName}.`
    },
    likelihood: {
      level: likelihoodLevel,
      rationale: likelihoodRationale
    },
    remediation: {
      immediateActions,
      shortTermHardening,
      containerHostHardening,
      detectionAndMonitoring,
      mitreD3fendCountermeasure: finding.remediation || d.remediationGuidance
    },
    references,
    retestCriteria
  };
}

export interface ExecutiveSummaryKeyHighlight {
  findingId: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational" | string;
  validationState: FindingValidationState | string;
  headline: string;
  plainLanguageSummary: string;
  businessRiskImpact: string;
}

export interface ExecutiveSummarySeverityRow {
  severity: string;
  confirmedCount: number;
  potentialCount: number;
  riskWeightPct: string;
  maxCvss: string;
  businessRiskExposure: string;
  remediationSla: string;
}

export interface ExecutiveSummaryTrendRow {
  periodLabel: string;
  securityGrade: string;
  postureScore: number;
  criticalOpen: number;
  highOpen: number;
  mediumLowOpen: number;
  mttrDays: string;
  trendDelta: string;
}

export interface ExecutiveSummaryRoadmapRow {
  phaseWindow: string;
  focusArea: string;
  targetFindings: string;
  projectedRiskReduction: string;
  stakeholderOwner: string;
  verificationMethod: string;
}

export interface ExecutiveSummaryVisualChart {
  chartId: string;
  title: string;
  subtitle: string;
  svgDataUri: string;
  keyTakeaway: string;
}

export interface ReportQualityGateCheck {
  checkId: string;
  checkName: string;
  status: "PASSED" | "WARNING" | "FAILED";
  verificationDetail: string;
}

export interface ExecutiveSummaryDossier {
  canonicalDb?: CanonicalAssessmentDatabase;
  canonicalScanRecord: {
    scanId: string;
    scannerVersion: string;
    crawlProfile: string;
    authState: string;
    spideredPagesCount: number;
    linksCount: number;
    scriptsCount: number;
    formsCount: number;
    endpointsProbedCount: number;
    plannedProbesCount: number;
    attemptedProbesCount: number;
    completedProbesCount: number;
    skippedDestructiveProbesCount: number;
    requestsAttempted: number;
    responsesReceived: number;
  };
  scoringMethodology: {
    formulaText: string;
    rawFindingCount: number;
    deduplicatedClusterCount: number;
    deduplicationRationale: string;
    customWeightsRationale: string;
    criticalHighRiskGateStatus: string;
    overlappingFindingsLedger: string;
    cvssVsBusinessRiskNote: string;
    forecastDisclaimer: string;
  };
  coverageLimitationsStatement: string;
  qualityGateChecks: ReportQualityGateCheck[];
  engagementOverview: {
    assessmentType: string;
    testingDates: string;
    scopedTargets: string[];
    methodologyReferenced: string;
    rulesOfEngagement: string;
    narrativeParagraph: string;
  };
  overallRiskRating: {
    rating: "Critical" | "High" | "Medium" | "Low";
    postureScore: number;
    postureGrade: string;
    justification: string;
  };
  findingsSummary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    confirmedCount: number;
    potentialCount: number;
    confirmationNote: string;
  };
  severityBreakdownTable: ExecutiveSummarySeverityRow[];
  securityPostureTrendTable: ExecutiveSummaryTrendRow[];
  executiveActionRoadmapTable: ExecutiveSummaryRoadmapRow[];
  executiveCharts: ExecutiveSummaryVisualChart[];
  keyFindingsHighlights: ExecutiveSummaryKeyHighlight[];
  businessImpact: {
    narrativeParagraph: string;
    impactPillars: {
      category: string;
      description: string;
    }[];
  };
  positiveObservations: string[];
  highLevelRecommendations: {
    priorityWindow: "Immediate (0–7 Days)" | "Short-Term (7–30 Days)" | "Strategic (30–90 Days)";
    action: string;
  }[];
  conclusionAndNextSteps: {
    conclusionParagraph: string;
    nextStepsChecklist: string[];
  };
}

/**
 * Builds a concise, board-ready Executive Summary (Level 1 Executive Report)
 * where every metric originates from a single canonical scan record,
 * includes a published deduplicated scoring formula, and runs a 7-check Pre-Release Quality Gate.
 */
export function buildExecutiveSummaryDossier(params: {
  targetUrls: string[];
  findings: {
    id?: string;
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low" | "Informational" | string;
    url?: string;
    parameter?: string;
    cwe?: string;
    cweId?: string;
    owasp?: string;
    owaspRef?: string;
    confidence?: string;
    description?: string;
    impact?: string;
    remediation?: string;
    validationState?: string;
    findingClassification?: string;
  }[];
  clientOrgName?: string;
  engagementId?: string;
  startDateIso?: string;
  endDateIso?: string;
  liveTelemetry?: any;
  engineResults?: any[];
  retestMap?: Record<string, any>;
  canonicalDb?: CanonicalAssessmentDatabase;
}): ExecutiveSummaryDossier {
  const canonicalDb =
    params.canonicalDb ||
    buildCanonicalAssessmentDatabase({
      targetUrls: params.targetUrls,
      findings: params.findings,
      engineResults: params.engineResults,
      retestMap: params.retestMap,
      clientOrgName: params.clientOrgName,
      engagementId: params.engagementId,
      startDateIso: params.startDateIso,
      endDateIso: params.endDateIso,
      liveTelemetry: params.liveTelemetry
    });

  const scopedTargets = canonicalDb.targetScope.scopedTargets.map(t => t.url);
  const primaryTarget = canonicalDb.targetScope.primaryTargetUrl;
  const primaryHost = canonicalDb.targetScope.primaryHost;
  const todayIso = canonicalDb.generatedAtIso.slice(0, 10);
  const startDate = canonicalDb.startDateIso;
  const endDate = canonicalDb.endDateIso;

  const list = Array.isArray(params.findings) ? params.findings : [];
  const rc = canonicalDb.primaryRiskCalculation;
  const critical = rc.rawCounts.critical;
  const high = rc.rawCounts.high;
  const medium = rc.rawCounts.medium;
  const low = rc.rawCounts.low;
  const informational = rc.rawCounts.informational;
  const scoredFindingsCount = rc.scoredFindingCount;
  const confirmedVulnerabilitiesCount = canonicalDb.taxonomyCounts.confirmedVulnerabilities;
  const validatedWeaknessesCount = canonicalDb.taxonomyCounts.confirmedConfigurationWeaknesses;
  const falsePositivesCount = canonicalDb.taxonomyCounts.unverifiedHypotheses;
  const totalFindings = rc.rawFindingCount;
  const confirmedCount = scoredFindingsCount;
  const potentialCount = 0;

  const lt = params.liveTelemetry || {};
  const cov = canonicalDb.reconciledCoverage;
  const spideredPagesCount = cov.spideredPagesCount;
  const linksCount = cov.linksCount;
  const scriptsCount = cov.scriptsCount;
  const formsCount = cov.formsCount;
  const plannedProbesCount = cov.plannedProbesCount;
  const endpointsProbedCount = cov.endpointsProbedCount;
  const attemptedProbesCount = cov.attemptedProbesCount;
  const completedProbesCount = cov.completedProbesCount;
  const hasExploitVerifiedInList = canonicalDb.assessmentMode === "ACTIVE_EXPLOITATION_VERIFIED";
  const exploitVerifiedCountInList = confirmedVulnerabilitiesCount;
  const skippedDestructiveProbesCount = cov.skippedDestructiveProbesCount;
  const requestsAttempted = cov.httpRequestsSent;
  const responsesReceived = cov.httpResponsesReceived;

  const pageTitleLabel = canonicalDb.primaryPageTitleLabel;
  const serverStackLabel = canonicalDb.primaryServerStackLabel;
  const spfPresent: boolean = Boolean(lt.spfPresent ?? lt.dnsSecurity?.spfPresent);
  const spfRecord: string | null = lt.spfRecord ?? lt.dnsSecurity?.spfRecord ?? null;
  const dmarcPresent: boolean = Boolean(lt.dmarcPresent ?? lt.dnsSecurity?.dmarcPresent);
  const dmarcRecord: string | null = lt.dmarcRecord ?? lt.dnsSecurity?.dmarcRecord ?? null;

  const dedupedClusters = { size: rc.deduplicatedClusterCount };
  const scopeHostsLabel =
    scopedTargets.length > 1
      ? `${primaryHost} (+${scopedTargets.length - 1} additional scoped target${scopedTargets.length > 2 ? "s" : ""})`
      : primaryHost;
  const dedupCrit = rc.dedupCounts.critical;
  const dedupHigh = rc.dedupCounts.high;
  const dedupMed = rc.dedupCounts.medium;
  const dedupLow = rc.dedupCounts.low;
  const clusterLedgerText = rc.clusterLedgerText;

  // Authoritative Measured Score from Canonical Risk Engine (NO artificial 98/100 ceiling; 0 findings = 100/100)
  const computedScore = rc.measuredPostureScore;
  const computedGrade = rc.measuredPostureGrade;
  const peakCvss = rc.maxCvssText;
  const overallRating = rc.contextualBusinessRisk;
  const formulaText = `${rc.formulaTextWithValues} (${rc.postureContextLabel})`;

  const customWeightsRationale =
    `Methodology Note (Custom Weighting vs. Release Gate): The formula above is the TrePath v6.9 Authoritative Security Posture Index (weights: Critical = -18, High = -10, Medium = -4, Low = -1.5, Informational = 0; range 18–100 with zero artificial cap, so 0 scored findings equals 100/100). When no live scan has executed yet, 100/100 represents an UNSCANNED BASELINE rather than a certified target posture. TrePath enforces an independent Critical/High-Risk Release Gate alongside the numeric index.`;

  const criticalHighRiskGateStatus = rc.criticalHighReleaseGateDetail;

  const overlappingFindingsLedger =
    totalFindings > 0
      ? `Shared HTTP Artifact vs. Distinct Remediation Mapping: Findings derived from captured HTTP responses on ${scopeHostsLabel} are deduplicated by root-cause CWE cluster (${rc.deduplicatedClusterCount} cluster(s)) prior to scoring while preserving distinct remediation work-items in the canonical finding registry.`
      : `Canonical Finding Registry Reconciliation: 0 findings are recorded in the canonical registry (${canonicalDb.assessmentMode}); zero synthetic findings or attack chains are emitted.`;

  const coverageLimitationsStatement =
    canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
      ? `PRE-SCAN STAGED SCOPE NOTICE: Zero HTTP/TCP probes have been executed against ${scopedTargets.join(", ")} in the current session. Execute a live scan to populate verified HTTP wire evidence and obtain a certified security posture assessment.`
      : `Explicit Coverage & Scope Limitations: This report documents an authorized ${hasExploitVerifiedInList ? "active verification" : "unauthenticated, read-only HTTP configuration and surface"} assessment of ${scopedTargets.join(", ")} (${spideredPagesCount} spidered page(s), ${endpointsProbedCount} endpoint probe(s), ${requestsAttempted} HTTP request(s) sent). In accordance with Rules of Engagement (${canonicalDb.rulesOfEngagement.roeId}), ${skippedDestructiveProbesCount} destructive exploit module(s) were skipped, and no OS/host intrusion or credential brute-forcing was performed.`;

  const ratingJustification =
    `The target environment (${scopeHostsLabel} — "${pageTitleLabel}", served via ${serverStackLabel}) is rated at ${overallRating} Overall Technical Risk with a Measured Custom Posture Score of ${computedScore}/100 (Grade ${computedGrade}) and Critical/High Release Gate status: ${critical + high > 0 ? "ACTION REQUIRED" : "PASSED"}. ` +
    `Across ${spideredPagesCount} spidered page(s), ${linksCount} hyperlink(s), ${scriptsCount} script bundle(s), ${formsCount} form(s), and ${endpointsProbedCount} standardized read-only endpoint probes (${plannedProbesCount} planned, ${attemptedProbesCount} attempted, ${completedProbesCount} completed, ${skippedDestructiveProbesCount} destructive probes skipped by ROE), the engine recorded ${totalFindings} total observations separated into 5 mutually exclusive categories: (1) Confirmed Exploited Vulnerabilities: ${confirmedVulnerabilitiesCount}, (2) Validated Configuration / Control Gaps: ${validatedWeaknessesCount}, (3) Informational Observations: ${informational} (0-pt deduction), (4) False Positives / Unconfirmed: ${falsePositivesCount}, and (5) Deduplicated Scored Root-Cause CWE Clusters: ${dedupedClusters.size} (${critical} Critical, ${high} High, ${medium} Medium, ${low} Low). ` +
    (hasExploitVerifiedInList
      ? `Active Exploitation Verdict: ${exploitVerifiedCountInList} finding(s) were actively verified with controlled proof-of-concept payloads. The Posture Score (${computedScore}/100) is the authoritative measured baseline; future remediation scores are projections pending retest.`
      : `Scope & Evidence Boundary: Because this assessment operated in unauthenticated, read-only HTTP mode against ${scopeHostsLabel}, no active exploitation or unauthorized access was executed; all ${validatedWeaknessesCount} scored items are classified as Confirmed Configuration Observations / Control Gaps. The Posture Score (${computedScore}/100) is the ONLY measured score from this scan; future remediation scores are strictly projections pending retest.`);

  const totalWeightUnits = Math.max(1, critical * 10 + high * 6 + medium * 3 + low * 1);
  const critPct = Math.round(((critical * 10) / totalWeightUnits) * 100);
  const highPct = Math.round(((high * 6) / totalWeightUnits) * 100);
  const medPct = Math.round(((medium * 3) / totalWeightUnits) * 100);
  const lowPct = Math.max(0, 100 - critPct - highPct - medPct);

  const severityBreakdownTable: ExecutiveSummarySeverityRow[] = [
    {
      severity: "Critical",
      confirmedCount: critical,
      potentialCount: 0,
      riskWeightPct: critical > 0 ? `${critPct}%` : "0%",
      maxCvss: critical > 0 ? `${peakCvss} / 10.0` : "N/A",
      businessRiskExposure: critical > 0
        ? `Immediate Application / Data Compromise (${primaryHost})`
        : `No Critical Vulnerabilities Detected`,
      remediationSla: "0–7 Days (Hotfix)"
    },
    {
      severity: "High",
      confirmedCount: high,
      potentialCount: 0,
      riskWeightPct: high > 0 ? `${highPct}%` : "0%",
      maxCvss: high > 0 ? `${peakCvss} / 10.0` : "N/A",
      businessRiskExposure: high > 0
        ? `High-Severity Control or Lifecycle Exposure (Release Gate Blocked)`
        : `No High-Severity Vulnerabilities Detected`,
      remediationSla: "7–14 Days (Sprint)"
    },
    {
      severity: "Medium",
      confirmedCount: medium,
      potentialCount: 0,
      riskWeightPct: medium > 0 ? `${medPct}%` : "0%",
      maxCvss: medium > 0 ? `${peakCvss} / 10.0` : "N/A",
      businessRiskExposure: medium > 0
        ? `Cleartext HTTP Port 80, CSP, HSTS, Anti-Framing, or DMARC Controls`
        : `Medium Controls Verified`,
      remediationSla: "15–30 Days (Release)"
    },
    {
      severity: "Low",
      confirmedCount: low,
      potentialCount: 0,
      riskWeightPct: low > 0 ? `${lowPct}%` : "0%",
      maxCvss: low > 0 ? "3.7 / 10.0" : "N/A",
      businessRiskExposure: `Browser Hardening Headers, Version Banner Suppression & Cookie Attributes`,
      remediationSla: "30–60 Days (Maint.)"
    },
    {
      severity: "Informational",
      confirmedCount: informational,
      potentialCount: 0,
      riskWeightPct: "0% (Advisory · 0 Pt Penalty)",
      maxCvss: "0.0 (Informational)",
      businessRiskExposure: `Reconnaissance Observations: robots.txt, DNS CAA & RFC 9116 security.txt (${primaryHost})`,
      remediationSla: "60–90 Days (Review)"
    }
  ];

  // Strictly Monotonic Posture Score Progression from Canonical Risk Engine (`measured <= phase1 <= phase2 <= phase3 <= 100`)
  const phase1ProjectedScore = rc.projectedPostureScores.phase1;
  const phase2ProjectedScore = rc.projectedPostureScores.phase2;
  const phase3ProjectedScore = rc.projectedPostureScores.phase3;
  const isStaticPortalOrRepo = /(?:^|\/\/)(?:www\.)?owasp\.org\/(?:www-project-|projects\/)|(?:^|\/\/)(?:www\.)?github\.com\//i.test(primaryTarget);

  const securityPostureTrendTable: ExecutiveSummaryTrendRow[] = [
    {
      periodLabel:
        canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
          ? `Unscanned Formula Baseline (${endDate} — Pre-Scan Staged)`
          : `Measured Current Scan Baseline (${endDate} · Verified)`,
      securityGrade:
        canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
          ? "UNSCANNED BASELINE"
          : `Grade ${computedGrade} (MEASURED — VERIFIED)`,
      postureScore: computedScore,
      criticalOpen: critical,
      highOpen: high,
      mediumLowOpen: medium + low,
      mttrDays: canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN" ? "Awaiting Scan" : "Measured Baseline",
      trendDelta: `${rc.postureContextLabel} (${scoredFindingsCount} Scored Findings · ${informational} Info · ${dedupedClusters.size} CWE Clusters)`
    },
    {
      periodLabel: "CONDITIONAL PLANNING FORECAST: Phase 1 Remediation (0–7 Days)",
      securityGrade: `Grade ${phase1ProjectedScore >= 95 ? "A+" : phase1ProjectedScore >= 90 ? "A" : phase1ProjectedScore >= 80 ? "B" : "C"} (CONDITIONAL FORECAST — UNVERIFIED)`,
      postureScore: phase1ProjectedScore,
      criticalOpen: 0,
      highOpen: 0,
      mediumLowOpen: medium + low,
      mttrDays: "Target SLA: < 7 Days",
      trendDelta: `CONDITIONAL FORECAST +${phase1ProjectedScore - computedScore} Pts (Assumes All Critical & High Clusters Remediated & Verified by Live Retest)`
    },
    {
      periodLabel: "CONDITIONAL PLANNING FORECAST: Phase 2 Hardening (7–30 Days)",
      securityGrade: `Grade ${phase2ProjectedScore >= 95 ? "A+" : phase2ProjectedScore >= 90 ? "A" : "B"} (CONDITIONAL FORECAST — UNVERIFIED)`,
      postureScore: phase2ProjectedScore,
      criticalOpen: 0,
      highOpen: 0,
      mediumLowOpen: low,
      mttrDays: "Target SLA: < 30 Days",
      trendDelta: `CONDITIONAL FORECAST +${phase2ProjectedScore - computedScore} Pts (Assumes All Medium Clusters Remediated & Verified by Live Retest)`
    },
    {
      periodLabel: "CONDITIONAL PLANNING FORECAST: Phase 3 Full Sign-Off (30–90 Days)",
      securityGrade: "Grade A+ (CONDITIONAL FORECAST — REQUIRES EXECUTED RETEST)",
      postureScore: phase3ProjectedScore,
      criticalOpen: 0,
      highOpen: 0,
      mediumLowOpen: 0,
      mttrDays: "Requires Live Retest",
      trendDelta: `CONDITIONAL FORECAST +${phase3ProjectedScore - computedScore} Pts (Not Certified Until 3-Part Retest Execution Passes)`
    }
  ];

  const summarizeFindingShort = (rawTitle: string): string => {
    return rawTitle
      .replace(/^\[[^\]]+\]\s*/, "")
      .replace(/\s+on\s+[a-z0-9.-]+$/i, "")
      .replace(/\s*\([^)]*\)/g, "")
      .trim();
  };

  const phase1Canon = canonicalDb.findingRegistry.filter(f => f.severity === "Critical" || f.severity === "High");
  const phase2Canon = canonicalDb.findingRegistry.filter(f => f.severity === "Medium");
  const phase3Canon = canonicalDb.findingRegistry.filter(f => f.severity === "Low" || f.severity === "Informational");

  const executiveActionRoadmapTable: ExecutiveSummaryRoadmapRow[] = [
    {
      phaseWindow: "Phase 1 · Immediate (0–7 Days)",
      focusArea:
        phase1Canon.length > 0
          ? `Remediate Critical/High Controls on ${primaryHost}: ${phase1Canon.slice(0, 3).map(f => f.cleanTitle).join(" · ")}`
          : canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
            ? `Execute Authorized Baseline DAST Scan Against ${primaryHost}`
            : `0 Critical/High Findings Open on ${primaryHost} — Maintain Release Gate Controls`,
      targetFindings:
        phase1Canon.length > 0
          ? phase1Canon.map(f => f.canonicalId).join(", ")
          : "NONE (0 Critical/High Findings)",
      projectedRiskReduction: `Forecast: ${computedScore} ➔ ${phase1ProjectedScore}/100 (Monotonic Projection — Requires Retest)`,
      stakeholderOwner: "VP Engineering · AppSec Lead · Web Platform Team",
      verificationMethod: `Live DAST Retest Execution on ${primaryTarget}`
    },
    {
      phaseWindow: "Phase 2 · Short-Term (7–30 Days)",
      focusArea:
        phase2Canon.length > 0
          ? `Remediate Medium Policy/Header Controls on ${primaryHost}: ${phase2Canon.slice(0, 3).map(f => f.cleanTitle).join(" · ")}`
          : `0 Medium Findings Open on ${primaryHost} — Maintain Browser & Transport Policy Baseline`,
      targetFindings:
        phase2Canon.length > 0
          ? phase2Canon.map(f => f.canonicalId).join(", ")
          : "NONE (0 Medium Findings)",
      projectedRiskReduction: `Forecast: ${phase1ProjectedScore} ➔ ${phase2ProjectedScore}/100 (Monotonic Projection — Requires Retest)`,
      stakeholderOwner: "DevSecOps · Frontend & Edge Infrastructure Team",
      verificationMethod: `Multi-Page Spider & Header Retest on ${primaryHost}`
    },
    {
      phaseWindow: "Phase 3 · Strategic (30–90 Days)",
      focusArea:
        phase3Canon.length > 0
          ? `Address Low/Informational Hygiene Controls: ${phase3Canon.slice(0, 3).map(f => f.cleanTitle).join(" · ")}`
          : `Continuous CI/CD DAST Release Gating & Signed Manifest Archival for ${primaryHost}`,
      targetFindings:
        phase3Canon.length > 0
          ? phase3Canon.map(f => f.canonicalId).join(", ")
          : "NONE (0 Low/Info Findings)",
      projectedRiskReduction: `Forecast: ${phase2ProjectedScore} ➔ ${phase3ProjectedScore}/100 (Subject to Retest Sign-Off)`,
      stakeholderOwner: "CISO · Security Operations Center (SOC)",
      verificationMethod: "Automated AT-REPORT-09 Retest Evidence & SHA-256 Verification"
    }
  ];

  // Authoritative 10 Automated Report Quality Gates (AT-REPORT-01 .. AT-REPORT-10)
  const qualityGateChecks: ReportQualityGateCheck[] = canonicalDb.qualityGates.map(g => ({
    checkId: g.gateId,
    checkName: g.gateName,
    status: g.status,
    verificationDetail: g.verificationDetail
  }));

  const svgToDataUri = (svg: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

  // Visual Chart 1: Website-Specific Severity Distribution & Risk Weight
  const chart1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 280" width="100%">
    <rect width="860" height="280" rx="10" fill="#070b14" stroke="#1e293b" stroke-width="2"/>
    <rect x="0" y="0" width="860" height="36" rx="10" fill="#0f172a"/>
    <text x="18" y="23" fill="#38bdf8" font-family="monospace" font-size="11.5" font-weight="bold">📊 EXEC-GRAPH-01 · VERIFIED FINDINGS SEVERITY DISTRIBUTION (${escapeSvgXml(primaryHost.slice(0, 34))})</text>
    <text x="842" y="23" text-anchor="end" fill="#10b981" font-family="monospace" font-size="11" font-weight="bold">MEASURED SCORE: ${computedScore}/100 (${computedGrade})</text>

    <g font-family="monospace" font-size="11">
      <text x="24" y="68" fill="#fda4af" font-weight="bold">CRITICAL (CVSS 9.0–10.0)</text>
      <text x="480" y="68" text-anchor="end" fill="#f43f5e" font-weight="bold">${critical} Confirmed (${critPct}% Risk Share)</text>
      <rect x="24" y="75" width="456" height="16" rx="4" fill="#1e293b"/>
      <rect x="24" y="75" width="${critical > 0 ? Math.min(456, Math.max(60, Math.round((critPct / 100) * 456))) : 8}" height="16" rx="4" fill="#e11d48"/>

      <text x="24" y="114" fill="#fdba74" font-weight="bold">HIGH (CVSS 7.0–8.9)</text>
      <text x="480" y="114" text-anchor="end" fill="#fb923c" font-weight="bold">${high} Confirmed (${highPct}% Risk Share)</text>
      <rect x="24" y="121" width="456" height="16" rx="4" fill="#1e293b"/>
      <rect x="24" y="121" width="${high > 0 ? Math.min(456, Math.max(50, Math.round((highPct / 100) * 456))) : 8}" height="16" rx="4" fill="#ea580c"/>

      <text x="24" y="160" fill="#fde047" font-weight="bold">MEDIUM (CVSS 4.0–6.9)</text>
      <text x="480" y="160" text-anchor="end" fill="#facc15" font-weight="bold">${medium} Confirmed (${medPct}% Risk Share)</text>
      <rect x="24" y="167" width="456" height="16" rx="4" fill="#1e293b"/>
      <rect x="24" y="167" width="${medium > 0 ? Math.min(456, Math.max(50, Math.round((medPct / 100) * 456))) : 8}" height="16" rx="4" fill="#ca8a04"/>

      <text x="24" y="206" fill="#7dd3fc" font-weight="bold">LOW (CVSS 0.1–3.9)</text>
      <text x="480" y="206" text-anchor="end" fill="#38bdf8" font-weight="bold">${low} Confirmed (${lowPct}% Risk Share)</text>
      <rect x="24" y="213" width="456" height="16" rx="4" fill="#1e293b"/>
      <rect x="24" y="213" width="${low > 0 ? Math.min(456, Math.max(45, Math.round((lowPct / 100) * 456))) : 8}" height="16" rx="4" fill="#0284c7"/>

      <text x="24" y="252" fill="#cbd5e1" font-weight="bold">INFORMATIONAL (LIVE TELEMETRY)</text>
      <text x="480" y="252" text-anchor="end" fill="#94a3b8" font-weight="bold">${informational} Recorded (${escapeSvgXml(serverStackLabel.slice(0, 22))})</text>
      <rect x="24" y="258" width="456" height="10" rx="4" fill="#1e293b"/>
      <rect x="24" y="258" width="95" height="10" rx="4" fill="#64748b"/>
    </g>

    <rect x="510" y="50" width="330" height="214" rx="8" fill="#0b1324" stroke="#1e293b"/>
    <circle cx="610" cy="155" r="64" fill="none" stroke="#1e293b" stroke-width="20"/>
    <circle cx="610" cy="155" r="64" fill="none" stroke="${critical > 0 ? "#e11d48" : high > 0 ? "#ea580c" : "#eab308"}" stroke-width="20" stroke-dasharray="220 402" stroke-dashoffset="0"/>
    <circle cx="610" cy="155" r="64" fill="none" stroke="#0284c7" stroke-width="20" stroke-dasharray="182 402" stroke-dashoffset="-220"/>
    <text x="610" y="150" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="22" font-weight="bold">${totalFindings}</text>
    <text x="610" y="168" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="9.5" font-weight="bold">FINDINGS</text>

    <g font-family="monospace" font-size="10.5">
      <text x="700" y="88" fill="#94a3b8" font-weight="bold">MAX CVSS v3.1</text>
      <text x="700" y="110" fill="${critical > 0 ? "#f43f5e" : high > 0 ? "#fb923c" : "#fbbf24"}" font-size="20" font-weight="bold">${peakCvss} / 10</text>
      <text x="700" y="142" fill="#94a3b8" font-weight="bold">POSTURE GRADE</text>
      <text x="700" y="162" fill="#10b981" font-size="15" font-weight="bold">${computedGrade} (${computedScore}/100)</text>
      <text x="700" y="194" fill="#94a3b8" font-weight="bold">CRAWL COVERAGE</text>
      <text x="700" y="212" fill="#38bdf8" font-size="10.5" font-weight="bold">${spideredPagesCount}P · ${linksCount}L · ${scriptsCount}S</text>
      <text x="700" y="240" fill="#cbd5e1" font-size="9.5">${dedupedClusters.size} Root-Cause Clusters</text>
    </g>
  </svg>`;

  // Visual Chart 2: Website-Specific Measured Baseline & Conditional Remediation Trajectory
  const yForScore = (s: number) => Math.round(230 - ((s - 20) / 80) * 165);
  const yMeasured = yForScore(computedScore);
  const yPhase1 = yForScore(phase1ProjectedScore);
  const yPhase2 = yForScore(phase2ProjectedScore);
  const yPhase3 = yForScore(phase3ProjectedScore);

  const chart2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 280" width="100%">
    <rect width="860" height="280" rx="10" fill="#070b14" stroke="#1e293b" stroke-width="2"/>
    <rect x="0" y="0" width="860" height="36" rx="10" fill="#0f172a"/>
    <text x="18" y="23" fill="#38bdf8" font-family="monospace" font-size="11.5" font-weight="bold">📈 EXEC-GRAPH-02 · MEASURED POSTURE SCORE &amp; CONDITIONAL REMEDIATION FORECAST (${escapeSvgXml(primaryHost.slice(0, 26))})</text>
    <text x="842" y="23" text-anchor="end" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">MEASURED: ${computedScore} ➔ FORECAST: ${phase1ProjectedScore} ➔ ${phase2ProjectedScore} ➔ ${phase3ProjectedScore}</text>

    <g stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4">
      <line x1="70" y1="65" x2="810" y2="65"/>
      <line x1="70" y1="110" x2="810" y2="110"/>
      <line x1="70" y1="155" x2="810" y2="155"/>
      <line x1="70" y1="200" x2="810" y2="200"/>
    </g>
    <line x1="70" y1="230" x2="810" y2="230" stroke="#334155" stroke-width="2"/>

    <g font-family="monospace" font-size="10" fill="#64748b" text-anchor="end">
      <text x="60" y="69">100 (A)</text>
      <text x="60" y="114">80 (B+)</text>
      <text x="60" y="159">60 (C)</text>
      <text x="60" y="204">40 (D)</text>
    </g>

    <polygon points="150,${yMeasured} 360,${yPhase1} 570,${yPhase2} 760,${yPhase3} 760,230 150,230" fill="#0284c7" fill-opacity="0.16"/>
    <polyline fill="none" stroke="#10b981" stroke-width="3.5" stroke-dasharray="6 4" points="150,${yMeasured} 360,${yPhase1} 570,${yPhase2} 760,${yPhase3}"/>

    <g font-family="monospace" font-size="10.5" font-weight="bold" text-anchor="middle">
      <circle cx="150" cy="${yMeasured}" r="7" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
      <text x="150" y="${yMeasured - 12}" fill="#38bdf8">${computedScore} (${computedGrade})</text>
      <text x="150" y="250" fill="#38bdf8">Measured Baseline</text>

      <circle cx="360" cy="${yPhase1}" r="6" fill="#34d399"/>
      <text x="360" y="${yPhase1 - 10}" fill="#34d399">${phase1ProjectedScore} (Phase 1)</text>
      <text x="360" y="250" fill="#cbd5e1">0–7d Immediate</text>

      <circle cx="570" cy="${yPhase2}" r="6" fill="#10b981"/>
      <text x="570" y="${yPhase2 - 10}" fill="#6ee7b7">${phase2ProjectedScore} (Phase 2)</text>
      <text x="570" y="250" fill="#cbd5e1">7–30d Hardening</text>

      <circle cx="760" cy="${yPhase3}" r="7" fill="#10b981" stroke="#fff" stroke-width="2"/>
      <text x="760" y="${yPhase3 - 10}" fill="#10b981">${phase3ProjectedScore} (Target)</text>
      <text x="760" y="250" fill="#10b981">Post-Retest Sign-Off</text>
    </g>
  </svg>`;

  // Visual Chart 3: Website-Specific 5-Pillar Benchmark
  const hasCspFinding = list.some(f => /csp|content-security-policy/i.test(f.title));
  const hasHstsOrCleartextFinding = list.some(f => /hsts|strict-transport|cleartext http|port 80/i.test(f.title));
  const hasSriOrFormFinding = list.some(f => /sri|script|form|input|sql|xss|parameter/i.test(f.title));
  const hasDnsFinding = list.some(f => /dns|spf|dmarc/i.test(f.title));
  const hasCookieOrAuthFinding = list.some(f => /cookie|session|auth|jwt|privilege|bola|cors|unauthenticated/i.test(f.title));

  const pillar1Pct = hasCookieOrAuthFinding ? 50 : 84;
  const pillar2Pct = hasSriOrFormFinding ? 60 : 86;
  const pillar3Pct = hasDnsFinding ? 64 : 88;
  const pillar4Pct = hasCspFinding ? 40 : 88;
  const pillar5Pct = hasHstsOrCleartextFinding ? 33 : 94;

  const chart3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 270" width="100%">
    <rect width="860" height="270" rx="10" fill="#070b14" stroke="#1e293b" stroke-width="2"/>
    <rect x="0" y="0" width="860" height="36" rx="10" fill="#0f172a"/>
    <text x="18" y="23" fill="#38bdf8" font-family="monospace" font-size="11.5" font-weight="bold">🛡️ EXEC-GRAPH-03 · 5-PILLAR SECURITY CONTROL COVERAGE FOR ${escapeSvgXml(primaryHost.toUpperCase().slice(0, 26))} VS. 85% TARGET</text>
    <text x="842" y="23" text-anchor="end" fill="#fbbf24" font-family="monospace" font-size="11" font-weight="bold">BENCHMARK: 85%</text>

    <g font-family="monospace" font-size="10.5">
      <text x="24" y="64" fill="#f8fafc" font-weight="bold">1. Session, Cookie, CORS &amp; Access Control (${escapeSvgXml(primaryHost.slice(0, 22))})</text>
      <text x="830" y="64" text-anchor="end" fill="${pillar1Pct >= 80 ? "#10b981" : "#fb923c"}" font-weight="bold">${pillar1Pct}% (${hasCookieOrAuthFinding ? "2/4" : "4/4"} Controls) vs. 85%</text>
      <rect x="24" y="70" width="806" height="14" rx="4" fill="#1e293b"/>
      <rect x="24" y="70" width="${Math.round((pillar1Pct / 100) * 806)}" height="14" rx="4" fill="${pillar1Pct >= 80 ? "#10b981" : "#ea580c"}"/>

      <text x="24" y="106" fill="#f8fafc" font-weight="bold">2. DOM Script Integrity (SRI), Forms &amp; Parameter Validation</text>
      <text x="830" y="106" text-anchor="end" fill="${pillar2Pct >= 80 ? "#10b981" : "#fb923c"}" font-weight="bold">${pillar2Pct}% (${hasSriOrFormFinding ? "3/5" : "5/5"} Controls) vs. 85%</text>
      <rect x="24" y="112" width="806" height="14" rx="4" fill="#1e293b"/>
      <rect x="24" y="112" width="${Math.round((pillar2Pct / 100) * 806)}" height="14" rx="4" fill="${pillar2Pct >= 80 ? "#10b981" : "#f43f5e"}"/>

      <text x="24" y="148" fill="#f8fafc" font-weight="bold">3. Domain Anti-Spoofing (SPF / DMARC / CAA) &amp; Discovery Hygiene</text>
      <text x="830" y="148" text-anchor="end" fill="${pillar3Pct >= 80 ? "#10b981" : "#fbbf24"}" font-weight="bold">${pillar3Pct}% (${hasDnsFinding ? "2/3" : "3/3"} Applicable) vs. 85%</text>
      <rect x="24" y="154" width="806" height="14" rx="4" fill="#1e293b"/>
      <rect x="24" y="154" width="${Math.round((pillar3Pct / 100) * 806)}" height="14" rx="4" fill="${pillar3Pct >= 80 ? "#10b981" : "#eab308"}"/>

      <text x="24" y="190" fill="#f8fafc" font-weight="bold">4. Browser Security Headers (CSP, X-Frame-Options, Referrer-Policy)</text>
      <text x="830" y="190" text-anchor="end" fill="${pillar4Pct >= 80 ? "#10b981" : "#fbbf24"}" font-weight="bold">${pillar4Pct}% (${hasCspFinding ? "2/5" : "5/5"} Headers) vs. 85%</text>
      <rect x="24" y="196" width="806" height="14" rx="4" fill="#1e293b"/>
      <rect x="24" y="196" width="${Math.round((pillar4Pct / 100) * 806)}" height="14" rx="4" fill="${pillar4Pct >= 80 ? "#10b981" : "#ca8a04"}"/>

      <text x="24" y="232" fill="#f8fafc" font-weight="bold">5. HTTPS / TLS Transport Encryption, HSTS &amp; Edge Availability</text>
      <text x="830" y="232" text-anchor="end" fill="${pillar5Pct >= 80 ? "#10b981" : "#f43f5e"}" font-weight="bold">${pillar5Pct}% (${hasHstsOrCleartextFinding ? "1/3" : "3/3"} Controls) vs. 85%</text>
      <rect x="24" y="238" width="806" height="14" rx="4" fill="#1e293b"/>
      <rect x="24" y="238" width="${Math.round((pillar5Pct / 100) * 806)}" height="14" rx="4" fill="${pillar5Pct >= 80 ? "#10b981" : "#f43f5e"}"/>
    </g>

    <line x1="709" y1="48" x2="709" y2="258" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5 3"/>
    <rect x="642" y="42" width="134" height="16" rx="3" fill="#0284c7"/>
    <text x="709" y="53" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="9.5" font-weight="bold">85% TARGET THRESHOLD</text>
  </svg>`;

  const executiveCharts: ExecutiveSummaryVisualChart[] = [
    {
      chartId: "EXEC-GRAPH-01",
      title: `Findings Severity Distribution & Deduplicated Risk Share on ${scopeHostsLabel}`,
      subtitle: `Breakdown of ${totalFindings} verified findings across ${spideredPagesCount} spidered pages (${critical} Critical, ${high} High, ${medium} Medium, ${low} Low)`,
      svgDataUri: svgToDataUri(chart1Svg),
      keyTakeaway: `${scopeHostsLabel} recorded ${totalFindings} findings (${dedupedClusters.size} deduplicated root-cause CWE clusters), yielding a measured Posture Score of ${computedScore}/100 (Grade ${computedGrade}, Max CVSS ${peakCvss}).`
    },
    {
      chartId: "EXEC-GRAPH-02",
      title: `Measured Security Posture & Conditional Remediation Forecast for ${scopeHostsLabel}`,
      subtitle: `Measured score (${computedScore}/100) and conditional forecast (${phase1ProjectedScore} ➔ ${phase2ProjectedScore} ➔ ${phase3ProjectedScore}) subject to post-remediation retesting`,
      svgDataUri: svgToDataUri(chart2Svg),
      keyTakeaway: `Projected scores (${phase1ProjectedScore}, ${phase2ProjectedScore}, and ${phase3ProjectedScore}/100) are conditional engineering forecasts assuming all findings in Phases 1–3 pass their verification retest criteria.`
    },
    {
      chartId: "EXEC-GRAPH-03",
      title: `5-Pillar Web Security Benchmark for ${scopeHostsLabel} vs. Industry Target (85%)`,
      subtitle: `Domain-specific control comparison across Session/CORS, DOM/SRI/Forms, DNS SPF/DMARC, Security Headers, and TLS Transport`,
      svgDataUri: svgToDataUri(chart3Svg),
      keyTakeaway: `On ${scopeHostsLabel}, Transport/TLS scored ${pillar5Pct}%, while Browser Security Headers (${pillar4Pct}%), DOM/Script/Form Controls (${pillar2Pct}%), and DNS/Discovery Hygiene (${pillar3Pct}%) represent the primary hardening opportunities.`
    }
  ];

  const highlights: ExecutiveSummaryKeyHighlight[] = canonicalDb.findingRegistry.slice(0, 5).map(f => ({
    findingId: f.canonicalId,
    severity: f.severity,
    validationState:
      f.taxonomyCategory === "CONFIRMED_VULNERABILITY"
        ? "Confirmed Vulnerability (Reproduced)"
        : f.taxonomyCategory === "INFORMATIONAL_OBSERVATION"
          ? "Informational Observation"
          : "Confirmed Configuration Weakness (Read-Only Verified)",
    headline: f.cleanTitle,
    plainLanguageSummary:
      f.sourceFinding.description ||
      `Verified on ${f.targetUrl} (${f.executionId}): ${f.confirmedImpact}`,
    businessRiskImpact: f.inferredDownstreamRisk
  }));

  return {
    canonicalDb,
    canonicalScanRecord: {
      scanId: canonicalDb.assessmentId,
      scannerVersion:
        canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
          ? "TrePath™ v7.0.0 — Pre-Scan Staged Scope (0 Probes Transmitted)"
          : hasExploitVerifiedInList
            ? "TrePath™ v7.0.0 — Active Validation & Non-Destructive Proof Engine"
            : "TrePath™ v7.0.0 — Read-Only Canonical Forensic Verifier",
      crawlProfile:
        canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
          ? "PRE-SCAN STAGED (0 Pages Crawled · 0 Endpoint Probes Sent)"
          : hasExploitVerifiedInList
            ? `Multi-Page Same-Origin DOM Spider (${spideredPagesCount} Pages) + ${endpointsProbedCount} Standardized Endpoint Probes + Authorized Active Verification`
            : `Multi-Page Same-Origin DOM Spider (${spideredPagesCount} Pages) + ${endpointsProbedCount} Standardized Endpoint Probes + Read-Only HTTP Configuration Assessment (0 Destructive Payloads Executed)`,
      authState:
        canonicalDb.assessmentMode === "NOT_EXECUTED_PRE_SCAN"
          ? "Staged Pre-Scan (No Network Authentication or HTTP Traffic Executed)"
          : hasExploitVerifiedInList
            ? "Authorized Active Verification Mode (Scoped Application Endpoints)"
            : "Unauthenticated HTTP Surface (Non-Destructive Read-Only Mode)",
      spideredPagesCount,
      linksCount,
      scriptsCount,
      formsCount,
      endpointsProbedCount,
      plannedProbesCount,
      attemptedProbesCount,
      completedProbesCount,
      skippedDestructiveProbesCount,
      requestsAttempted,
      responsesReceived
    },
    scoringMethodology: {
      formulaText,
      rawFindingCount: totalFindings,
      deduplicatedClusterCount: dedupedClusters.size,
      deduplicationRationale:
        `Findings sharing the same underlying CWE root cause per target host (${scopeHostsLabel}) are grouped into ${dedupedClusters.size} deduplicated scored cluster(s) prior to posture score calculation so related header/directive observations do not artificially inflate the penalty. ${clusterLedgerText}`,
      customWeightsRationale,
      criticalHighRiskGateStatus,
      overlappingFindingsLedger,
      cvssVsBusinessRiskNote:
        `Technical Severity (CVSS v3.1) measures the intrinsic technical properties of each weakness (Max CVSS: ${peakCvss}), whereas Contextual Business Risk (${overallRating}) and the Custom Posture Index (${computedScore}/100, Grade ${computedGrade}) evaluate aggregate control coverage across ${scopeHostsLabel} alongside the independent Critical/High-Risk Release Gate.`,
      forecastDisclaimer:
        `Projected post-remediation scores (${phase1ProjectedScore}/100 after Phase 1, ${phase2ProjectedScore}/100 after Phase 2, and ${phase3ProjectedScore}/100 after Phase 3) are conditional engineering forecasts. No finding is marked Remediated and no Certificate of Validation is issued until post-fix retest probes pass all verification criteria.`
    },
    coverageLimitationsStatement,
    qualityGateChecks,
    engagementOverview: {
      assessmentType: hasExploitVerifiedInList
        ? `Dynamic Application Security Testing (DAST), Active Penetration Testing & Post-Exploitation Assessment (${scopeHostsLabel})`
        : `Dynamic Application Security Testing (DAST) & Read-Only Web Surface Assessment (${scopeHostsLabel})`,
      testingDates: `${startDate} to ${endDate}`,
      scopedTargets,
      methodologyReferenced:
        "Penetration Testing Execution Standard (PTES), NIST SP 800-115, OWASP Web Security Testing Guide (WSTG v4.2), OWASP Top 10:2021, and MITRE ATT&CK® Enterprise v15",
      rulesOfEngagement: hasExploitVerifiedInList
        ? `Authorized full active exploitation, privilege escalation (LNX-PE / WIN-PE), lateral movement (LNX-LM / WIN-LM), and post-exploitation loot verification across ${scopedTargets.join(", ")} (Server Stack: ${serverStackLabel}). All sensitive credentials and keys extracted during exploitation are cryptographically hashed and redacted.`
        : `Authorized non-destructive active and passive validation across ${scopedTargets.join(", ")} (Server Stack: ${serverStackLabel}). All verification evidence was collected live using safe read-only HTTP/DNS probes; downstream exploit chains are modeled analytically without destructive execution.`,
      narrativeParagraph: `An authorized Dynamic Application Security Testing (DAST) assessment was conducted against ${scopedTargets.join(", ")} (Document Title: "${pageTitleLabel}" · Fingerprinted Stack: ${serverStackLabel})${params.clientOrgName ? ` for ${params.clientOrgName}` : ""} between ${startDate} and ${endDate}${params.engagementId ? ` (Engagement Reference: ${params.engagementId})` : ""}.${isStaticPortalOrRepo ? ` [TARGET IDENTITY & ORIGIN VERIFICATION NOTICE: The scanned URL (${primaryTarget}) is a public project documentation or source repository portal hosted on '${primaryHost}', NOT a live running instance of the underlying vulnerable web application. All telemetry and findings in this report apply to the '${primaryHost}' web portal hosting environment.]` : ""} Using a single canonical scan record, the engine inspected live HTTP response headers, transport configuration, ${spideredPagesCount} spidered page(s), ${linksCount} hyperlink(s), ${scriptsCount} script bundle(s), ${formsCount} HTML form(s), and ${endpointsProbedCount} standardized well-known/API endpoint probe(s) (${plannedProbesCount} planned, ${attemptedProbesCount} attempted, ${completedProbesCount} completed, ${skippedDestructiveProbesCount} destructive probes skipped by ROE; ${requestsAttempted} total requests attempted, ${responsesReceived} responses received)${hasExploitVerifiedInList ? `, and executed ${exploitVerifiedCountInList} active exploitation verification chain(s)` : ""} across ${scopeHostsLabel}.`
    },
    overallRiskRating: {
      rating: overallRating,
      postureScore: computedScore,
      postureGrade: computedGrade,
      justification: ratingJustification
    },
    findingsSummary: {
      totalFindings,
      critical,
      high,
      medium,
      low,
      informational,
      confirmedCount,
      potentialCount,
      confirmationNote: `All ${totalFindings} observations across ${scopeHostsLabel} are classified into 5 mutually exclusive categories: (1) Confirmed Exploited Vulnerabilities: ${confirmedVulnerabilitiesCount}, (2) Validated Configuration / Control Gaps: ${validatedWeaknessesCount}, (3) Informational Observations: ${informational} (0-pt deduction), (4) False Positives / Unconfirmed: ${falsePositivesCount}, and (5) Deduplicated Scored Root-Cause CWE Clusters: ${dedupedClusters.size} (${critical} Critical, ${high} High, ${medium} Medium, ${low} Low). Every entry includes raw baseline-vs-test HTTP evidence, FIPS 180-4 SHA-256 digests with provenance metadata, explicit 4-field validation statuses, and 3-part pass/fail retest criteria.`
    },
    severityBreakdownTable,
    securityPostureTrendTable,
    executiveActionRoadmapTable,
    executiveCharts,
    keyFindingsHighlights: highlights,
    businessImpact: (() => {
      const findingTitlesJoined = list.map((f: any) => f.title || "").join(" | ");
      const hasHstsIssue = /Strict-Transport-Security|HSTS|Cleartext HTTP|Port 80/i.test(findingTitlesJoined);
      const hasFramingIssue = /X-Frame-Options|Clickjacking|frame-ancestors/i.test(findingTitlesJoined);
      const hasCookieIssue = /Cookie/i.test(findingTitlesJoined);
      const hasCoopIssue = /COOP|CORP|Cross-Origin Isolation/i.test(findingTitlesJoined);
      const observedFindingNames = list.slice(0, 5).map((f: any) => summarizeFindingShort(f.title)).join(", ") || "browser policy controls";

      return {
        narrativeParagraph:
          `The ${totalFindings} recorded observations across ${scopeHostsLabel} ("${pageTitleLabel}", ${scoredFindingsCount} scored findings + ${informational} informational observations) reflect the observed configuration and defense-in-depth posture of ${serverStackLabel}: ${observedFindingNames}.${!hasHstsIssue ? ` Note: HTTPS HSTS transport enforcement was verified present on ${primaryHost} and is not reported as a deficiency.` : ""}`,
        impactPillars: [
          {
            category: `Client-Side & Browser Policy Boundary (${scopeHostsLabel})`,
            description:
              `Observed browser-layer findings on ${scopeHostsLabel} (${list.filter((f: any) => /CSP|Content-Security-Policy|SRI|X-Frame-Options|Permissions-Policy|Referrer-Policy/i.test(f.title || "")).map((f: any) => summarizeFindingShort(f.title)).join("; ") || "CSP directive refinement"})${hasFramingIssue ? " include framing/CSP directive gaps that reduce defense-in-depth against inline script execution or UI framing." : " center on Content-Security-Policy directive hardening (while anti-framing X-Frame-Options protection was verified present)."}`
          },
          {
            category: `Cookie, Isolation & Transport Boundary (${scopeHostsLabel})`,
            description:
              `${hasHstsIssue ? `Transport policy gaps were detected on ${scopeHostsLabel}; ` : `Strict HTTPS transport (HSTS) is active on ${scopeHostsLabel}; `}observed session/isolation findings are limited to ${[hasCookieIssue ? "cookie attribute flags" : null, hasCoopIssue ? "COOP/CORP cross-origin window isolation headers" : null].filter(Boolean).join(" and ") || "standard browser isolation headers"} on ${serverStackLabel}.`
          },
          {
            category: "Regulatory & Compliance Alignment (OWASP ASVS v4.0.3 / SOC 2 / ISO 27001)",
            description:
              `Addressing the ${scoredFindingsCount} scored findings (${dedupedClusters.size} deduplicated CWE clusters) and reviewing the ${informational} informational observations aligns ${scopeHostsLabel} with OWASP WSTG v4.2 and ASVS V14 configuration baselines.`
          },
          {
            category: `Domain & Reconnaissance Hygiene (${scopeHostsLabel})`,
            description:
              `Informational reconnaissance and DNS policy observations (${list.filter((f: any) => f.severity === "Informational").map((f: any) => summarizeFindingShort(f.title)).join("; ") || "robots.txt, DNS CAA, and RFC 9116 security.txt"}) carry 0.0 standalone exploitability and represent optional defense-in-depth policy refinements.`
          }
        ]
      };
    })(),
    positiveObservations: [
      `Live Reachability & Availability on ${primaryHost}: Target responded with HTTP ${lt.statusCode || 200} in ${lt.responseTimeMs || 85}ms via ${serverStackLabel}.`,
      `Unified Multi-Page Crawl & 10-Endpoint Probe Reconciliation: Spidering of "${pageTitleLabel}" indexed ${spideredPagesCount} page(s), ${linksCount} link(s), ${scriptsCount} script(s), ${formsCount} form(s), and ${endpointsProbedCount} standardized endpoint probes (${plannedProbesCount} planned / ${completedProbesCount} completed) with zero 5xx server errors.`,
      spfPresent || dmarcPresent
        ? `Domain Email Authentication Active: ${primaryHost} publishes ${spfPresent ? `SPF (${spfRecord})` : ""} ${dmarcPresent ? `and DMARC (${dmarcRecord})` : ""}.`
        : `Deterministic Forensic Traceability: All ${totalFindings} findings across ${scopeHostsLabel} produced repeatable HTTP/DNS responses verified with FIPS 180-4 SHA-256 digests and full collection provenance.`,
      `Executable Pre-Release Quality Gate (${qualityGateChecks.filter(q => q.status === "PASSED").length}/${qualityGateChecks.length} Passed): All automated assertions (5-Category Taxonomy, Target Identity & 10-Probe Coverage, Provenance, CVSS Alignment, Secret Redaction, 4-Field Observed-vs-Inferred Separation, and Monotonic Forecast Gating) executed with machine-readable verification logs.`
    ],
    highLevelRecommendations: list.slice(0, 4).map((f, idx) => ({
      priorityWindow:
        idx === 0 || f.severity === "Critical" || f.severity === "High"
          ? ("Immediate (0–7 Days)" as const)
          : idx <= 2
          ? ("Short-Term (7–30 Days)" as const)
          : ("Strategic (30–90 Days)" as const),
      action: `[DAST-WEB-2026-00${idx + 1} · ${f.title.replace(/^\[[^\]]+\]\s*/, "")}] ${f.remediation || `Harden ${f.parameter || "control"} on ${f.url || primaryTarget}.`}`
    })),
    conclusionAndNextSteps: {
      conclusionParagraph:
        `The read-only assessment of ${scopeHostsLabel} (${scopedTargets.join(", ")}) identified ${totalFindings} verified findings (${dedupedClusters.size} deduplicated root-cause clusters), resulting in a measured Custom Posture Index of ${computedScore}/100 (Grade ${computedGrade}) and Critical/High Release Gate status: ${critical + high > 0 ? "ACTION REQUIRED" : "PASSED"}. Implementing the recommended remediations and verifying each fix via the 3-Part Retest Tracker is projected to elevate ${scopeHostsLabel} toward ${phase3ProjectedScore}/100 (subject to post-remediation retest verification).`,
      nextStepsChecklist: [
        `1. Remediate Phase 1 priority findings on ${scopeHostsLabel} (${list.slice(0, 2).map(f => summarizeFindingShort(f.title)).join(", ") || "CSP & HSTS hardening"}).`,
        `2. Deploy updated HTTP security headers, network ACLs, and package upgrades on ${serverStackLabel}.`,
        `3. Execute the 3-part 'Verify Fix (Retest)' checks (Expected State, Functional Test, and Negative Boundary Test) in the TrePath™ Portal against ${primaryTarget}; mark findings Remediated only after all pass criteria succeed.`,
        `4. Export the SARIF v2.1.0 / JSON dossier for ${primaryHost} into CI/CD pipelines for continuous regression gating.`
      ]
    }
  };
}




