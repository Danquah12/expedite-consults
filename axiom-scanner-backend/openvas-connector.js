/**
 * AXIOM OpenVAS/GVM Connector
 * Connects via GMP (Greenbone Management Protocol) over TCP port 9390
 * Supports: authenticate, create target, create task, start task, poll, get results
 */

const net = require("net");
const { parseStringPromise } = require("xml2js").catch ? require("xml2js") : (() => {
  try { return require("xml2js"); } catch { return null; }
})();

const DEFAULT_HOST     = "127.0.0.1";
const DEFAULT_PORT     = 9390;
const DEFAULT_USER     = "admin";
const DEFAULT_PASS     = "admin";
// Full scan config UUID (OpenVAS default)
const FULL_SCAN_CONFIG = "daba56c8-73ec-11df-a475-002264764cea";

class OpenVASConnector {
  constructor(host = DEFAULT_HOST, port = DEFAULT_PORT, user = DEFAULT_USER, pass = DEFAULT_PASS) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pass = pass;
  }

  // Send GMP XML command and get response
  sendCommand(xml) {
    return new Promise((resolve, reject) => {
      const client  = new net.Socket();
      let buffer    = "";
      let connected = false;

      client.setTimeout(30000);

      client.connect(this.port, this.host, () => {
        connected = true;
        client.write(xml);
      });

      client.on("data", (data) => {
        buffer += data.toString();
        // GMP responses end when tags are balanced — simple heuristic: wait for closing tag
        if (buffer.includes("</") && isComplete(buffer)) {
          client.destroy();
          resolve(buffer);
        }
      });

      client.on("timeout", () => { client.destroy(); reject(new Error("GMP connection timed out")); });
      client.on("error",   (e) => reject(new Error(`GMP connection error: ${e.message}`)));
      client.on("close",   ()  => { if (buffer) resolve(buffer); else if (!connected) reject(new Error("Connection closed before response")); });
    });
  }

  async authenticate() {
    const xml  = `<authenticate><credentials><username>${this.user}</username><password>${this.pass}</password></credentials></authenticate>`;
    const resp = await this.sendCommand(xml);
    if (!resp.includes('status="200"')) throw new Error(`GVM auth failed: ${resp.substring(0, 200)}`);
    return true;
  }

  async createTarget(name, hosts) {
    await this.authenticate();
    const xml  = `<create_target><name>${name}</name><hosts>${hosts}</hosts><port_list id="33d0cd82-57c6-11e1-8ed1-406186ea4fc5"/></create_target>`;
    const resp = await this.sendCommand(xml);
    const id   = extractAttr(resp, "id");
    if (!id) throw new Error(`Failed to create GVM target: ${resp.substring(0, 300)}`);
    return id;
  }

  async createTask(name, targetId, configId = FULL_SCAN_CONFIG, scannerId = null) {
    await this.authenticate();
    const scannerTag = scannerId ? `<scanner id="${scannerId}"/>` : "";
    const xml  = `<create_task><name>${name}</name><config id="${configId}"/><target id="${targetId}"/>${scannerTag}</create_task>`;
    const resp = await this.sendCommand(xml);
    const id   = extractAttr(resp, "id");
    if (!id) throw new Error(`Failed to create GVM task: ${resp.substring(0, 300)}`);
    return id;
  }

  async startTask(taskId) {
    await this.authenticate();
    const xml  = `<start_task task_id="${taskId}"/>`;
    const resp = await this.sendCommand(xml);
    return resp.includes('status="202"') || resp.includes("report_id");
  }

  async getTaskStatus(taskId) {
    await this.authenticate();
    const xml  = `<get_tasks task_id="${taskId}"/>`;
    const resp = await this.sendCommand(xml);
    const progress = extractTag(resp, "progress") || "0";
    const status   = extractTag(resp, "status")   || "Unknown";
    return { progress: parseInt(progress), status };
  }

  async getResults(taskId) {
    await this.authenticate();
    const xml  = `<get_results task_id="${taskId}" details="1"/>`;
    const resp = await this.sendCommand(xml);
    return parseGVMResults(resp);
  }

  // Test connection
  async testConnection() {
    try {
      await this.authenticate();
      return { connected: true };
    } catch (e) {
      return { connected: false, error: e.message };
    }
  }
}

// ─── GVM result normalization → AXIOM Canonical Finding ──────────────────────
function parseGVMResults(xml) {
  const findings = [];
  const resultRx = /<result id="([^"]+)">([\s\S]*?)<\/result>/g;
  let match;

  while ((match = resultRx.exec(xml)) !== null) {
    const resultXml = match[2];
    const name      = extractTag(resultXml, "name")        || "Unknown Vulnerability";
    const severity  = extractTag(resultXml, "severity")    || "0";
    const host      = extractTag(resultXml, "host")        || "";
    const port      = extractTag(resultXml, "port")        || "";
    const desc      = extractTag(resultXml, "description") || "";
    const solution  = extractTag(resultXml, "solution")    || "";
    const nvt       = extractTag(resultXml, "oid")         || "";
    const cvss      = parseFloat(severity) || 0;

    findings.push({
      id:          `GVM-F${String(findings.length + 1).padStart(3, "0")}`,
      title:       name,
      severity:    cvssToSeverity(cvss),
      confidence:  "HIGH",
      status:      "VERIFIED",
      source:      "OpenVAS/GVM",
      plugin:      mapGVMPlugin(name),
      method:      "GET",
      url:         `http://${host}:${port.replace("/tcp","").replace("/udp","")}`,
      parameter:   port,
      description: desc,
      solution,
      cvss,
      nvtOid:      nvt,
      remediation: solution || "Apply vendor patch.",
      normalizedAt:new Date().toISOString(),
    });
  }

  const order = { Critical:0, High:1, Medium:2, Low:3, Info:4 };
  return findings.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
}

function cvssToSeverity(cvss) {
  if (cvss >= 9.0) return "Critical";
  if (cvss >= 7.0) return "High";
  if (cvss >= 4.0) return "Medium";
  if (cvss >  0.0) return "Low";
  return "Info";
}

function mapGVMPlugin(name = "") {
  const n = name.toLowerCase();
  if (n.includes("sql"))       return "SQLi";
  if (n.includes("xss"))       return "XSS";
  if (n.includes("ftp"))       return "FTP";
  if (n.includes("ssh"))       return "SSH";
  if (n.includes("smb"))       return "SMB";
  if (n.includes("ssl") || n.includes("tls")) return "SSL/TLS";
  if (n.includes("backdoor"))  return "Backdoor";
  if (n.includes("rce") || n.includes("remote code")) return "RCE";
  if (n.includes("default"))   return "DefaultCreds";
  return "Misc";
}

function extractTag(xml, tag) {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
  return m ? m[1].trim() : null;
}

function extractAttr(xml, attr) {
  const m = new RegExp(`${attr}="([^"]+)"`).exec(xml);
  return m ? m[1] : null;
}

function isComplete(buf) {
  const opens  = (buf.match(/</g)  || []).length;
  const closes = (buf.match(/>/g)  || []).length;
  return closes >= opens;
}

module.exports = { OpenVASConnector };
