/**
 * AXIOM Nmap Scanner Module
 * Runs Nmap via Docker, parses output → AXIOM asset/service format
 */

const { exec } = require("child_process");
const util     = require("util");
const execP    = util.promisify(exec);

const SERVICE_RISK = {
  ftp:21, telnet:23, smtp:25, http:80, pop3:110, imap:143,
  https:443, mssql:1433, mysql:3306, rdp:3389, smb:445, vnc:5900,
  tomcat:8080, jenkins:8080, redis:6379, mongodb:27017, elasticsearch:9200,
};

const HIGH_RISK_PORTS = new Set([21,22,23,80,135,139,443,445,1433,3306,3389,4444,5900,8080,8443,9200]);

async function runNmap(target, options = {}) {
  const profile = options.profile || "standard"; // fast | standard | deep
  const flagMap = {
    fast:     `-sV -T4 --open -F`,
    standard: `-sV -sC -T4 --open -p 1-10000`,
    deep:     `-sV -sC -O -T4 --open -p 1-65535 --script vuln`,
  };
  const flags = flagMap[profile] || flagMap.standard;

  console.log(`[NMAP] Scanning ${target} with profile: ${profile}`);

  try {
    const cmd = `docker run --rm instrumentisto/nmap ${flags} ${target}`;
    const { stdout, stderr } = await execP(cmd, { timeout: 300000 }); // 5min max
    return parseNmapOutput(stdout, target);
  } catch(e) {
    // Try system nmap as fallback
    try {
      const { stdout } = await execP(`nmap ${flags} ${target}`, { timeout: 300000 });
      return parseNmapOutput(stdout, target);
    } catch(e2) {
      console.error("[NMAP] Error:", e2.message);
      return { error: e2.message, target, ports: [], services: [], assets: [] };
    }
  }
}

function parseNmapOutput(raw, target) {
  const lines    = raw.split("\n");
  const ports    = [];
  const services = [];
  const findings = [];
  let   osGuess  = null;

  for (const line of lines) {
    // Port/service line: "80/tcp   open  http    Apache httpd 2.4.7"
    const portMatch = line.match(/^(\d+)\/(tcp|udp)\s+(open|filtered)\s+(\S+)(?:\s+(.+))?/);
    if (portMatch) {
      const [, port, proto, state, service, version = ""] = portMatch;
      const portNum = parseInt(port);
      const isHighRisk = HIGH_RISK_PORTS.has(portNum);

      ports.push({ port:portNum, proto, state, service, version: version.trim() });
      services.push({
        port: portNum, proto, service,
        version: version.trim(),
        risk: isHighRisk ? "HIGH" : "LOW",
      });

      // Generate finding for risky services
      if (isHighRisk) {
        findings.push({
          id:          `NMAP-F${String(findings.length+1).padStart(3,"0")}`,
          title:       `Open ${service.toUpperCase()} Service Detected`,
          severity:    getPortSeverity(portNum, service),
          confidence:  "HIGH",
          status:      "VERIFIED",
          source:      "Nmap",
          plugin:      "NetworkEnum",
          method:      "TCP",
          url:         `${proto}://${target}:${portNum}`,
          parameter:   `port:${portNum}`,
          description: `Port ${portNum}/${proto} is open running ${service} ${version.trim()}. ${getRisk(portNum, service)}`,
          solution:    getSolution(portNum, service),
          cvss:        getCVSS(portNum, service),
          normalizedAt:new Date().toISOString(),
        });
      }
    }

    // OS detection
    const osMatch = line.match(/OS details: (.+)/);
    if (osMatch) osGuess = osMatch[1];

    // Script output for vulnerabilities
    if (line.includes("VULNERABLE:")) findings.push({
      id:         `NMAP-V${String(findings.length+1).padStart(3,"0")}`,
      title:      "Nmap Script Vulnerability Detected",
      severity:   "High",
      confidence: "MEDIUM",
      status:     "UNVERIFIED",
      source:     "Nmap (NSE Script)",
      plugin:     "NSEVuln",
      method:     "TCP",
      url:        `http://${target}`,
      description:line.trim(),
      normalizedAt:new Date().toISOString(),
    });
  }

  const order = {Critical:0,High:1,Medium:2,Low:3,Info:4};
  findings.sort((a,b)=>(order[a.severity]??9)-(order[b.severity]??9));

  return {
    target, os: osGuess,
    totalPorts: ports.length,
    highRiskPorts: ports.filter(p=>HIGH_RISK_PORTS.has(p.port)).length,
    ports, services, findings,
    rawOutput: raw,
    scannedAt: new Date().toISOString(),
  };
}

function getPortSeverity(port, service) {
  const svc = (service||"").toLowerCase();
  if ([21,23,445,4444].includes(port))           return "Critical";
  if ([3389,5900,1433].includes(port))           return "High";
  if ([80,8080,3306,6379,27017,9200].includes(port)) return "High";
  if ([443,22].includes(port))                   return "Medium";
  return "Low";
}

function getCVSS(port, service) {
  const svc = (service||"").toLowerCase();
  if ([21,23,445].includes(port))  return 9.8;
  if ([3389,4444].includes(port))  return 9.0;
  if ([3306,1433].includes(port))  return 8.2;
  if ([5900,6379].includes(port))  return 7.5;
  return 5.0;
}

function getRisk(port, service) {
  const risks = {
    21: "FTP transmits credentials in cleartext. Anonymous access may be enabled.",
    22: "SSH exposed — brute force risk. Ensure key-based auth only.",
    23: "Telnet is unencrypted and obsolete. Replace with SSH immediately.",
    80: "HTTP service exposed — check for web vulnerabilities.",
    139:"NetBIOS session service — legacy SMB, EternalBlue risk.",
    445:"SMB exposed — high risk for ransomware (WannaCry, EternalBlue).",
    1433:"MSSQL exposed — brute force and injection risk.",
    3306:"MySQL exposed — brute force and remote access risk.",
    3389:"RDP exposed — BlueKeep risk, brute force target.",
    4444:"Common Metasploit reverse shell port — likely compromised.",
    5900:"VNC exposed — often has weak authentication.",
    8080:"HTTP proxy/Tomcat — check for manager console access.",
  };
  return risks[port] || `Service on port ${port} should be reviewed.`;
}

function getSolution(port, service) {
  const solutions = {
    21: "Disable FTP. Use SFTP/SCP. If required, enable TLS and disable anonymous access.",
    22: "Restrict SSH to key-based auth. Use fail2ban. Limit to trusted IPs via firewall.",
    23: "Disable Telnet immediately. Replace with SSH.",
    80: "Redirect HTTP to HTTPS. Review web application for OWASP Top 10 vulnerabilities.",
    139:"Disable NetBIOS over TCP/IP unless required. Apply MS17-010 patch.",
    445:"Apply MS17-010 patch. Restrict SMB access via firewall. Disable SMBv1.",
    1433:"Restrict MSSQL to internal network. Use strong passwords. Enable SA account lockout.",
    3306:"Bind MySQL to 127.0.0.1. Use strong credentials. Restrict remote access.",
    3389:"Restrict RDP to VPN only. Enable Network Level Authentication. Apply all patches.",
    4444:"Investigate immediately — this is a known shell listener port.",
    5900:"Require VNC authentication. Restrict to trusted IPs. Prefer SSH tunnel.",
    8080:"Secure Tomcat manager. Change default credentials. Remove unused apps.",
  };
  return solutions[port] || "Review service necessity and restrict access to trusted sources only.";
}

module.exports = { runNmap };
