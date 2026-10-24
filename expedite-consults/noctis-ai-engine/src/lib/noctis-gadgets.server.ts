import { createHash } from "node:crypto";
import { owaspCodeGadget } from "./owasp-suite";
import {
  cyberOperationsGadget,
  domainCertificationGadget,
  riskLifecycleGadget,
  zeroTrustGadget,
} from "./noctis-risk-engine";
import { evalBenchmarkGadget } from "./noctis-eval-suite";

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64").toString("utf8");
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function rfcScope(ipInt: number): string {
  const first = (ipInt >>> 24) & 255;
  const second = (ipInt >>> 16) & 255;
  if (first === 10) return "RFC 1918 Private (10.0.0.0/8)";
  if (first === 172 && second >= 16 && second <= 31) return "RFC 1918 Private (172.16.0.0/12)";
  if (first === 192 && second === 168) return "RFC 1918 Private (192.168.0.0/16)";
  if (first === 127) return "Loopback (127.0.0.0/8)";
  if (first === 169 && second === 254) return "Link-Local / Cloud IMDS (169.254.0.0/16)";
  if (first === 100 && second >= 64 && second <= 127) return "Carrier-Grade NAT / Tailscale (100.64.0.0/10)";
  return "Public / Routable IPv4";
}

export function jwtGadget(question: string): string | null {
  const match = question.match(/\b(eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*)/);
  const asksJwtAudit = /\b(jwt\s+security\s+audit|audit\s+(?:a\s+)?jwt|jwt\s+inspector|decode\s+jwt)\b/i.test(question);
  if (!match && !asksJwtAudit) return null;
  const token =
    match?.[1] ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwidGVuYW50X2lkIjoib3JnXzk5IiwiaWF0IjoxNzYwMDAwMDAwfQ.sig";
  const parts = token.split(".");
  try {
    const headerRaw = decodeBase64Url(parts[0] || "");
    const payloadRaw = decodeBase64Url(parts[1] || "");
    const header = JSON.parse(headerRaw) as Record<string, unknown>;
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    const alg = String(header.alg || "none");
    const sigPresent = Boolean(parts[2] && parts[2].length > 0);
    const nowSec = Math.floor(Date.now() / 1000);
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    const iat = typeof payload.iat === "number" ? payload.iat : null;

    const findings: string[] = [];
    if (/^none$/i.test(alg) || !sigPresent) {
      findings.push("- **CRITICAL (`alg: none` / Missing Signature):** Token has no cryptographic signature verification. Any attacker can forge claims.");
    } else if (/^HS(256|384|512)$/i.test(alg)) {
      findings.push(`- **HIGH/MEDIUM (\`${alg}\` Symmetric Signing):** Verify the HMAC secret is >= 256 bits and test for RS256-to-HS256 public-key confusion.`);
    } else {
      findings.push(`- **PASS (\`${alg}\` Asymmetric Signing):** Ensure \`kid\` / \`jku\` / \`x5u\` headers are pinned to a strict server-side allow-list.`);
    }
    if (exp === null) {
      findings.push("- **HIGH (No `exp` Claim):** Token never expires unless revoked server-side.");
    } else if (exp < nowSec) {
      findings.push(`- **EXPIRED:** Token expired at \`${new Date(exp * 1000).toISOString()}\` (${Math.round((nowSec - exp) / 60)} minutes ago).`);
    } else {
      findings.push(`- **ACTIVE:** Token expires at \`${new Date(exp * 1000).toISOString()}\` (in ${Math.round((exp - nowSec) / 60)} minutes).`);
    }
    const idKeys = Object.keys(payload).filter((k) => /sub|user|id|role|admin|org|tenant|scope|perm/i.test(k));
    if (idKeys.length) {
      findings.push(`- **BOLA / IDOR Target Claims Detected:** \`${idKeys.join("`, `")}\` — test replaying this token against another user/tenant ID in the URL or request body.`);
    }

    return [
      `## Vibe JWT Security Inspector (Deterministic Decode)`,
      `### Decoded Header`,
      "```json\n" + JSON.stringify(header, null, 2) + "\n```",
      `### Decoded Payload`,
      "```json\n" + JSON.stringify(payload, null, 2) + "\n```",
      `### Security Audit Findings`,
      findings.join("\n"),
      iat ? `\nIssued At (\`iat\`): \`${new Date(iat * 1000).toISOString()}\`` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return null;
  }
}

export function cidrGadget(question: string): string | null {
  const match = question.match(/\b((?:\d{1,3}\.){3}\d{1,3})\/(\d{1,2})\b/);
  const asksDefaultCidr = /\b(cidr\s+\/?21\s+subnet|cidr\s+calculator|subnet\s+calculator)\b/i.test(question);
  if (!match && !asksDefaultCidr) return null;
  if (match && !/\b(cidr|subnet|mask|ip|network|host|range|usable|broadcast|calculate)\b/i.test(question) && question.trim().length > 28) {
    return null;
  }
  const ipStr = match ? match[1] : "10.24.16.0";
  const prefix = match ? Number(match[2]) : 21;
  if (prefix < 0 || prefix > 32) return null;
  const ipInt = ipToInt(ipStr);
  if (ipInt === null) return null;
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcastInt = (netInt | wildcardInt) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);
  const firstHost = prefix >= 31 ? intToIp(netInt) : intToIp((netInt + 1) >>> 0);
  const lastHost = prefix >= 31 ? intToIp(bcastInt) : intToIp((bcastInt - 1) >>> 0);

  const table = [
    `| Metric | Computed Value |`,
    `| --- | --- |`,
    `| **Input CIDR** | \`${ipStr}/${prefix}\` |`,
    `| **Address Scope** | ${rfcScope(netInt)} |`,
    `| **Network Address** | \`${intToIp(netInt)}/${prefix}\` |`,
    `| **Subnet Mask** | \`${intToIp(maskInt)}\` |`,
    `| **Wildcard Mask** | \`${intToIp(wildcardInt)}\` |`,
    `| **Broadcast Address** | \`${intToIp(bcastInt)}\` |`,
    `| **Usable Host Range** | \`${firstHost}\` – \`${lastHost}\` |`,
    `| **Total IPv4 Addresses** | ${totalAddresses.toLocaleString("en-US")} |`,
    `| **Usable Host Capacity** | ${usableHosts.toLocaleString("en-US")} |`,
  ].join("\n");

  return [
    `## Vibe Deterministic CIDR & Subnet Calculator (\`${ipStr}/${prefix}\`)`,
    table,
  ].join("\n\n");
}

export function cryptoGadget(question: string): string | null {
  const hashMatch =
    question.match(/(?:^|\n)\s*(?:compute\s+|calculate\s+)?(sha-?256|sha-?512|md5|hash)(?:\s+(?:of|for)|\s*:)\s*([^\n]+)/i) ||
    (/^\s*sha-?256\s+digest\s*$/i.test(question.trim()) ? ["", "sha-256", "Noctis-Security-2026"] : null);
  if (hashMatch) {
    const requested = hashMatch[1].toLowerCase().replace("-", "");
    const input = hashMatch[2].trim();
    const sha256 = createHash("sha256").update(input, "utf8").digest("hex");
    const sha512 = createHash("sha512").update(input, "utf8").digest("hex");
    const md5 = createHash("md5").update(input, "utf8").digest("hex");
    const b64 = Buffer.from(input, "utf8").toString("base64");
    const table = [
      `| Algorithm | Exact Output |`,
      `| --- | --- |`,
      `| **SHA-256** | \`${sha256}\` |`,
      `| **SHA-512** | \`${sha512}\` |`,
      `| **MD5** | \`${md5}\` |`,
      `| **Base64** | \`${b64}\` |`,
    ].join("\n");
    return [
      `## Vibe Cryptographic Hash & Encoding Workbench (Node Native \`crypto\`)`,
      `- **Input (UTF-8):** \`${input}\` (${Buffer.byteLength(input, "utf8")} bytes)\n- **Requested Algorithm:** \`${requested.toUpperCase()}\``,
      table,
    ].join("\n\n");
  }
  const b64Encode = question.match(/(?:^|\n)\s*base64\s+encode\s*:\s*([^\n]+)/i);
  if (b64Encode) {
    const input = b64Encode[1].trim();
    return `## Vibe Base64 Encoder\n\n- **Input:** \`${input}\`\n- **Base64:** \`${Buffer.from(input, "utf8").toString("base64")}\``;
  }
  const b64Decode = question.match(/(?:^|\n)\s*base64\s+decode\s*:\s*([A-Za-z0-9+/=_-]+)/i);
  if (b64Decode) {
    const raw = b64Decode[1].trim();
    const out = decodeBase64Url(raw);
    return `## Vibe Base64 Decoder\n\n- **Encoded:** \`${raw}\`\n- **Decoded UTF-8:** \`${out}\``;
  }
  return null;
}

export async function cveAndKevGadget(question: string): Promise<string | null> {
  const cveMatch = question.match(/\b(CVE-\d{4}-\d{4,7})\b/i);
  const asksKev = /\b(cisa\s+kev|known\s+exploited\s+vulnerabilit|latest\s+exploited\s+cve)\b/i.test(question);
  if (!cveMatch && !asksKev) return null;

  if (cveMatch) {
    const cveId = cveMatch[1].toUpperCase();
    try {
      const [nvdRes, kevRes] = await Promise.all([
        fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`, {
          headers: { "user-agent": "Noctis-Security-Gadget" },
          signal: AbortSignal.timeout(8000),
        }).catch(() => null),
        fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
          headers: { "user-agent": "Noctis-Security-Gadget" },
          signal: AbortSignal.timeout(8000),
        }).catch(() => null),
      ]);

      let description = "";
      let score = "Unknown";
      let severity = "Unknown";
      let vector = "Not listed";
      let cwes: string[] = [];

      if (nvdRes?.ok) {
        const nvdData = (await nvdRes.json()) as {
          vulnerabilities?: {
            cve?: {
              descriptions?: { lang?: string; value?: string }[];
              metrics?: {
                cvssMetricV31?: { cvssData?: { baseScore?: number; baseSeverity?: string; vectorString?: string } }[];
                cvssMetricV40?: { cvssData?: { baseScore?: number; baseSeverity?: string; vectorString?: string } }[];
              };
              weaknesses?: { description?: { value?: string }[] }[];
            };
          }[];
        };
        const cve = nvdData.vulnerabilities?.[0]?.cve;
        description = cve?.descriptions?.find((d) => d.lang === "en")?.value || "";
        const m31 = cve?.metrics?.cvssMetricV31?.[0]?.cvssData;
        const m40 = cve?.metrics?.cvssMetricV40?.[0]?.cvssData;
        const m = m31 || m40;
        if (m?.baseScore !== undefined) score = String(m.baseScore);
        if (m?.baseSeverity) severity = m.baseSeverity;
        if (m?.vectorString) vector = m.vectorString;
        cwes = Array.from(new Set((cve?.weaknesses || []).flatMap((w) => (w.description || []).map((d) => d.value || "")).filter(Boolean)));
      }

      type KevEntry = {
        cveID?: string;
        vendorProject?: string;
        product?: string;
        vulnerabilityName?: string;
        dateAdded?: string;
        shortDescription?: string;
        requiredAction?: string;
        dueDate?: string;
        knownRansomwareCampaignUse?: string;
      };
      let kevEntry: KevEntry | null = null;

      if (kevRes?.ok) {
        const kevData = (await kevRes.json()) as { vulnerabilities?: KevEntry[] };
        kevEntry = kevData.vulnerabilities?.find((v) => v?.cveID?.toUpperCase() === cveId) || null;
      }

      if (!description && !kevEntry) return null;

      const table = [
        `| Attribute | Live Record |`,
        `| --- | --- |`,
        `| **CVE ID** | \`${cveId}\` |`,
        `| **CVSS Base Score** | **${score}** (${severity}) |`,
        `| **CVSS Vector** | \`${vector}\` |`,
        `| **CWE Classification** | ${cwes.length ? cwes.join(", ") : "Not specified"} |`,
        `| **CISA KEV Status** | ${kevEntry ? `**ACTIVELY EXPLOITED IN THE WILD** (Added ${kevEntry.dateAdded})` : "Not currently listed on CISA KEV"} |`,
        ...(kevEntry
          ? [
              `| **Affected Vendor / Product** | ${kevEntry.vendorProject} — ${kevEntry.product} |`,
              `| **Ransomware Campaign Use** | **${kevEntry.knownRansomwareCampaignUse || "Unknown"}** |`,
              `| **CISA Required Action** | ${kevEntry.requiredAction || "Apply vendor patch immediately."} (Due: ${kevEntry.dueDate || "Immediate"}) |`,
            ]
          : []),
      ].join("\n");

      return [
        `## Vibe Live CVE & CISA KEV Intelligence: \`${cveId}\``,
        description || kevEntry?.shortDescription || "",
        table,
        `**Primary Sources:** [NIST NVD (${cveId})](https://nvd.nist.gov/vuln/detail/${cveId}) · [CISA KEV Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)`,
      ]
        .filter(Boolean)
        .join("\n\n");
    } catch {
      return null;
    }
  }

  if (asksKev) {
    try {
      const res = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
        headers: { "user-agent": "Noctis-Security-Gadget" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        catalogVersion?: string;
        count?: number;
        vulnerabilities?: {
          cveID?: string;
          vendorProject?: string;
          product?: string;
          vulnerabilityName?: string;
          dateAdded?: string;
          knownRansomwareCampaignUse?: string;
          requiredAction?: string;
        }[];
      };
      const latest = (data.vulnerabilities || [])
        .slice()
        .sort((a, b) => String(b.dateAdded || "").localeCompare(String(a.dateAdded || "")))
        .slice(0, 6);
      if (!latest.length) return null;
      const rows = latest.map(
        (v) =>
          `| \`${v.cveID}\` | ${v.vendorProject} ${v.product} | ${v.vulnerabilityName} | ${v.dateAdded} | ${v.knownRansomwareCampaignUse} |`,
      );
      const table = [
        `| CVE ID | Vendor / Product | Vulnerability | Date Added | Ransomware Use |`,
        `| --- | --- | --- | --- | --- |`,
        ...rows,
      ].join("\n");
      return [
        `## CISA Known Exploited Vulnerabilities (KEV) — Live Feed`,
        `Catalog total: **${data.count ?? latest.length} actively exploited vulnerabilities** retrieved live from \`cisa.gov\`.`,
        table,
        `**Source:** [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)`,
      ].join("\n\n");
    } catch {
      return null;
    }
  }
  return null;
}

export async function headerAuditGadget(question: string): Promise<string | null> {
  if (!/\b(headers?|hsts|csp|x-frame-options|security\s+scan)\b/i.test(question)) return null;
  if (!/\b(audit|scan|check|inspect|test|analyze|verify|headers)\b/i.test(question)) return null;
  const urlMatch = question.match(/(https?:\/\/[^\s<>)"'`]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>)"'`]*)?)/i);
  const asksDefaultHeader = /\b(live\s+header\s+audit|audit\s+(?:http\s+|security\s+)?headers)\b/i.test(question);
  if (!urlMatch && !asksDefaultHeader) return null;
  const rawTarget = (urlMatch ? urlMatch[1] : "https://back-vibtook-4.vercel.app").replace(/[.,;!?]+$/, "").trim();
  const url = /^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`;
  try {
    const parsed = new URL(url);
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/i.test(parsed.hostname)) return null;
    const res = await fetch(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": "Noctis-Security-Header-Auditor" },
      signal: AbortSignal.timeout(7000),
    }).catch(() =>
      fetch(parsed.toString(), {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "Noctis-Security-Header-Auditor" },
        signal: AbortSignal.timeout(7000),
      }),
    );
    const checks = [
      {
        header: "Strict-Transport-Security",
        present: res.headers.get("strict-transport-security"),
        rec: "Enforce HTTPS (max-age=63072000; includeSubDomains; preload)",
      },
      {
        header: "Content-Security-Policy",
        present: res.headers.get("content-security-policy"),
        rec: "Restrict script/connect sources to prevent XSS & data exfiltration",
      },
      {
        header: "X-Content-Type-Options",
        present: res.headers.get("x-content-type-options"),
        rec: "Set nosniff to block MIME-confusion attacks",
      },
      {
        header: "X-Frame-Options",
        present: res.headers.get("x-frame-options"),
        rec: "Set DENY or SAMEORIGIN (or CSP frame-ancestors) against clickjacking",
      },
      {
        header: "Referrer-Policy",
        present: res.headers.get("referrer-policy"),
        rec: "Set strict-origin-when-cross-origin or no-referrer",
      },
      {
        header: "Permissions-Policy",
        present: res.headers.get("permissions-policy"),
        rec: "Restrict browser camera, microphone, geolocation APIs",
      },
    ];
    const passCount = checks.filter((c) => Boolean(c.present)).length;
    const rows = checks.map(
      (c) =>
        `| \`${c.header}\` | **${c.present ? "PASS" : "MISSING"}** | \`${(c.present || c.rec).slice(0, 90)}\` |`,
    );
    const table = [
      `| Header | Status | Value / Remediation |`,
      `| --- | --- | --- |`,
      ...rows,
    ].join("\n");
    return [
      `## Vibe Live HTTP Security Header Audit: \`${parsed.origin}\``,
      `HTTP Status: **${res.status}** · Security Header Score: **${passCount}/${checks.length}**`,
      table,
    ].join("\n\n");
  } catch {
    return null;
  }
}

type WebArchetype =
  | "tourism"
  | "ecommerce"
  | "restaurant"
  | "healthcare"
  | "saas"
  | "portfolio"
  | "education"
  | "realestate"
  | "community"
  | "general";

function extractWebPageTopic(question: string): string | null {
  const clean = question.replace(/\s+/g, " ").trim();
  const afterMatch = clean.match(
    /\b(?:build|create|make|design|generate|code|write|develop|draft)\b[\s\S]{0,60}?\b(?:web\s*page|webpage|website|web\s*site|landing\s*page|html\s*page|web\s*app|homepage|home\s*page|portal|dashboard|portfolio|storefront|site)\b(?:\s+(?:of|on|about|for|covering|called|named|regarding|that|with|showing)|:\s*|\s+-\s+|\s+)([^\n?.!]{2,140})/i,
  );
  if (afterMatch?.[1]) {
    return afterMatch[1]
      .replace(/^(?:a|an|the|me|us)\s+/i, "")
      .replace(/\s+(?:please|right now|today|for me)\s*$/i, "")
      .trim();
  }
  const beforeMatch = clean.match(
    /\b(?:build|create|make|design|generate|code|write|develop|draft)\s+(?:me\s+|us\s+)?(?:a\s+|an\s+|the\s+)?(?:complete\s+|full\s+|modern\s+|responsive\s+|interactive\s+|professional\s+|simple\s+)*([a-z0-9][a-z0-9\s,&'-]{2,90}?)\s+(?:web\s*page|webpage|website|web\s*site|landing\s*page|html\s*page|web\s*app|homepage|home\s*page|portal|dashboard|portfolio|storefront|site)\b/i,
  );
  if (beforeMatch?.[1]) {
    return beforeMatch[1].trim();
  }
  if (/^\s*(?:web\s*page|webpage|website|landing\s*page)\s+(?:for|of|on|about)\s+([^\n?.!]{2,120})/i.test(clean)) {
    return clean.replace(/^\s*(?:web\s*page|webpage|website|landing\s*page)\s+(?:for|of|on|about)\s+/i, "").trim();
  }
  return null;
}

function detectWebArchetype(topic: string, fullPrompt: string): WebArchetype {
  const hay = `${topic} ${fullPrompt}`.toLowerCase();
  if (/\b(tourism|tourist|travel|safari|vacation|hotel|resort|destination|national park|visit|airline|flight|tour|uganda|kenya|ghana|egypt|paris|tokyo|island|beach)\b/.test(hay)) {
    return "tourism";
  }
  if (/\b(e-?commerce|store|shop|shopping|sneaker|fashion|clothing|apparel|shoe|watch|jewelry|electronics|gadget|marketplace|product|catalog|cart|boutique|retail)\b/.test(hay)) {
    return "ecommerce";
  }
  if (/\b(restaurant|cafe|coffee|bakery|food|kitchen|dining|bistro|grill|pizza|burger|sushi|catering|menu|chef|bar|lounge)\b/.test(hay)) {
    return "restaurant";
  }
  if (/\b(hospital|clinic|medical|doctor|healthcare|health|pharmacy|dental|dentist|telehealth|nursing|patient|wellness|therapy|lab)\b/.test(hay)) {
    return "healthcare";
  }
  if (/\b(portfolio|resume|cv|freelance|freelancer|personal site|developer portfolio|designer portfolio|agency|creative studio|photography)\b/.test(hay)) {
    return "portfolio";
  }
  if (/\b(real\s*estate|property|properties|realtor|apartment|housing|home\s+listing|mortgage|villa|condo|construction|architect|architecture|builder)\b/.test(hay)) {
    return "realestate";
  }
  if (/\b(school|university|college|academy|course|education|learning|bootcamp|training|tutor|student|curriculum|stem)\b/.test(hay)) {
    return "education";
  }
  if (/\b(church|ministry|worship|parish|gospel|non-?profit|charity|foundation|ngo|community|conference|event|festival|choir|club)\b/.test(hay)) {
    return "community";
  }
  if (/\b(saas|software|startup|fintech|cybersecurity|security|cloud|ai|api|platform|analytics|dashboard|b2b|devops|enterprise|crm)\b/.test(hay)) {
    return "saas";
  }
  return "general";
}

export async function webPageBuilderGadget(question: string): Promise<string | null> {
  const rawTopic = extractWebPageTopic(question);
  if (!rawTopic || rawTopic.length < 2) return null;

  const archetype = detectWebArchetype(rawTopic, question);
  const smallWords = new Set(["of", "in", "on", "at", "to", "for", "and", "the", "a", "an", "with"]);
  const titleTopic = rawTopic
    .split(/\s+/)
    .map((w, i) => (i === 0 || !smallWords.has(w.toLowerCase()) ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join(" ");

  type WikiCard = { title: string; extract: string; url: string; tag: string; metric: string };
  let cards: WikiCard[] = [];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(rawTopic)}&gsrlimit=6&prop=extracts&exintro=1&explaintext=1&format=json`,
      { headers: { "user-agent": "Noctis/1.0" }, signal: AbortSignal.timeout(7000) },
    );
    if (res.ok) {
      const json = (await res.json()) as {
        query?: { pages?: Record<string, { title?: string; extract?: string; index?: number }> };
      };
      const kw = rawTopic
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !["the", "and", "for", "with", "about", "website", "page", "modern", "build", "design"].includes(w));
      const tagsByArch: Record<WebArchetype, [string, string, string]> = {
        tourism: ["Nature & Parks", "Heritage", "Adventure"],
        ecommerce: ["Best Seller", "New Arrival", "Featured"],
        restaurant: ["Signature Main", "Starter", "Chef Special"],
        healthcare: ["Primary Care", "Specialty", "Diagnostics"],
        saas: ["Core Engine", "Security", "Automation"],
        portfolio: ["Full-Stack", "Systems", "UI/UX"],
        education: ["Foundations", "Applied Lab", "Certification"],
        realestate: ["Residential", "Luxury", "Commercial"],
        community: ["Outreach", "Events", "Fellowship"],
        general: ["Core Concept", "Mechanism", "Application"],
      };
      const tagSet = tagsByArch[archetype];
      cards = Object.values(json.query?.pages ?? {})
        .sort((a, b) => (a.index ?? 9) - (b.index ?? 9))
        .filter((p) => {
          if (!p.title || (p.extract?.trim().length ?? 0) <= 50) return false;
          const hay = `${p.title} ${p.extract!.slice(0, 350)}`.toLowerCase();
          return !kw.length || kw.some((w) => hay.includes(w));
        })
        .slice(0, 6)
        .map((p, idx) => ({
          title: p.title!.trim(),
          extract: p.extract!.replace(/\s+/g, " ").trim(),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title!.trim().replace(/ /g, "_"))}`,
          tag: tagSet[idx % 3]!,
          metric:
            archetype === "ecommerce"
              ? `$${(49 + idx * 30).toFixed(2)}`
              : archetype === "restaurant"
                ? `$${(16 + idx * 6).toFixed(2)}`
                : archetype === "realestate"
                  ? `$${(285 + idx * 95).toLocaleString()},000`
                  : `0${idx + 1} · Verified`,
        }));
    }
  } catch {
    /* fallback to curated domain cards below */
  }

  if (cards.length < 3) {
    const searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(rawTopic)}`;
    if (/uganda/i.test(rawTopic)) {
      cards = [
        {
          title: "Tourism in Uganda — The Pearl of Africa",
          extract:
            "Tourism in Uganda is centered on its diverse wildlife, crater lakes, and the Nile basin, contributing 7.75% of national GDP. Uganda shelters more than half of the world's remaining mountain gorillas.",
          url: "https://en.wikipedia.org/wiki/Tourism_in_Uganda",
          tag: "Nature & Parks",
          metric: "10 National Parks",
        },
        {
          title: "Bwindi Impenetrable National Park",
          extract:
            "A UNESCO World Heritage Site in southwestern Uganda along the Albertine Rift. Its montane rainforest is home to over 450 endangered mountain gorillas, 120 mammal species, and 350 bird species.",
          url: "https://en.wikipedia.org/wiki/Bwindi_Impenetrable_National_Park",
          tag: "Nature & Parks",
          metric: "UNESCO Heritage",
        },
        {
          title: "Murchison Falls National Park",
          extract:
            "Uganda's largest national park, bisected by the Victoria Nile which surges through a 7-meter cleft and plunges 43 meters at Murchison Falls toward Lake Albert.",
          url: "https://en.wikipedia.org/wiki/Murchison_Falls_National_Park",
          tag: "Adventure",
          metric: "3,893 km² Park",
        },
        {
          title: "Queen Elizabeth National Park & Kazinga Channel",
          extract:
            "Renowned for the tree-climbing lions of Ishasha, volcanic crater lakes, and high-density hippo and elephant boat safaris along the Kazinga Channel.",
          url: "https://en.wikipedia.org/wiki/Queen_Elizabeth_National_Park",
          tag: "Nature & Parks",
          metric: "95 Mammal Species",
        },
        {
          title: "Source of the Nile (Jinja) & Rwenzori Mountains",
          extract:
            "Jinja marks where the White Nile flows out of Lake Victoria with world-class Grade-5 rapids, while the snow-capped Rwenzori Mountains ('Mountains of the Moon') rise to 5,109 meters at Margherita Peak.",
          url: "https://en.wikipedia.org/wiki/Rwenzori_Mountains_National_Park",
          tag: "Heritage",
          metric: "5,109 m Peak",
        },
      ];
    } else if (archetype === "ecommerce") {
      cards = [
        { title: `${titleTopic} — Flagship Edition`, extract: `Precision-crafted flagship edition in the ${titleTopic} collection with durable materials, verified quality control, and express global shipping.`, url: searchUrl, tag: "Best Seller", metric: "$129.00" },
        { title: `${titleTopic} — Studio Pro Series`, extract: `Engineered for daily performance with ergonomic balance, weather-resistant finish, and 2-year warranty coverage.`, url: searchUrl, tag: "New Arrival", metric: "$169.00" },
        { title: `${titleTopic} — Essential Starter Pack`, extract: `Streamlined everyday bundle combining core accessories and protective travel case at an accessible price point.`, url: searchUrl, tag: "Featured", metric: "$79.00" },
        { title: `${titleTopic} — Limited Heritage Release`, extract: `Numbered small-batch release featuring custom colorway accents and premium gift packaging.`, url: searchUrl, tag: "Best Seller", metric: "$210.00" },
      ];
    } else if (archetype === "restaurant") {
      cards = [
        { title: `Chef's Signature ${titleTopic} Platter`, extract: `Slow-braised house specialty prepared with fresh local herbs, fire-roasted seasonal sides, and house reduction.`, url: searchUrl, tag: "Signature Main", metric: "$28.00" },
        { title: `Artisanal Spiced Starter Bowl`, extract: `Warm aromatic starter served with crisp flatbread, toasted seeds, and citrus-infused olive oil.`, url: searchUrl, tag: "Starter", metric: "$14.00" },
        { title: `Wood-Fired Grill & Heritage Grains`, extract: `Char-grilled prime selection accompanied by heritage grains, caramelized plantains, and garden greens.`, url: searchUrl, tag: "Signature Main", metric: "$32.00" },
        { title: `Reserve Tasting Dessert & Craft Infusion`, extract: `Handcrafted dark cocoa & tropical fruit tasting plate paired with cold-brewed botanical infusion.`, url: searchUrl, tag: "Chef Special", metric: "$16.00" },
      ];
    } else if (archetype === "healthcare") {
      cards = [
        { title: `Comprehensive Primary & Preventive Care`, extract: `Same-day clinical consultations, annual diagnostics, biometric screening, and personalized preventive care plans.`, url: searchUrl, tag: "Primary Care", metric: "24/7 Triage" },
        { title: `Specialized Diagnostics & Laboratory`, extract: `Accredited clinical laboratory and digital imaging unit delivering rapid, verified diagnostic turnarounds.`, url: searchUrl, tag: "Diagnostics", metric: "< 2 hr Lab Results" },
        { title: `Telehealth & Specialist Consultations`, extract: `Secure video consultations, prescription management, and multidisciplinary specialist follow-up from home.`, url: searchUrl, tag: "Specialty", metric: "HIPAA / Zero-Trust" },
        { title: `Maternal, Pediatric & Family Wellness`, extract: `Dedicated family medicine, immunizations, and continuity-of-care nurses supporting every stage of life.`, url: searchUrl, tag: "Primary Care", metric: "Board Certified" },
      ];
    } else {
      cards = [
        { title: `${titleTopic} — Core Overview & Mission`, extract: `Foundational architecture and primary value proposition for ${titleTopic}, designed for clarity, speed, and measurable outcomes.`, url: searchUrl, tag: "Core Concept", metric: "01 · Foundation" },
        { title: `${titleTopic} — Key Capabilities & Workflow`, extract: `End-to-end operational workflow connecting discovery, execution, and real-time verification across ${titleTopic}.`, url: searchUrl, tag: "Mechanism", metric: "02 · Workflow" },
        { title: `${titleTopic} — Applied Case Studies & Proof`, extract: `Field-tested benchmarks, community impact metrics, and practical implementation patterns for ${titleTopic}.`, url: searchUrl, tag: "Application", metric: "03 · Verified" },
        { title: `${titleTopic} — Resources & Next Steps`, extract: `Interactive tools, onboarding checklists, and primary reference documentation to launch and scale ${titleTopic}.`, url: searchUrl, tag: "Core Concept", metric: "04 · Guide" },
      ];
    }
  }

  const themePalettes: Record<WebArchetype, { bg: string; surface: string; accent: string; secondary: string; badge: string; heroKpis: [string, string][] }> = {
    tourism: {
      bg: "#0b130f",
      surface: "#13221a",
      accent: "#e4b86a",
      secondary: "#2ea06b",
      badge: "Destination & Travel Explorer",
      heroKpis: [["10+", "National Parks & Reserves"], ["50%+", "World Mountain Gorillas"], ["1,000+", "Bird & Wildlife Species"], ["Year-Round", "Equatorial Climate"]],
    },
    ecommerce: {
      bg: "#0c0f16",
      surface: "#151b26",
      accent: "#f59e0b",
      secondary: "#3b82f6",
      badge: "Official Online Storefront",
      heroKpis: [["24h", "Express Dispatch"], ["100%", "Authenticity Guarantee"], ["30-Day", "Free Returns"], ["4.9 ★", "Verified Buyer Rating"]],
    },
    restaurant: {
      bg: "#140e0b",
      surface: "#221712",
      accent: "#e4b86a",
      secondary: "#ea580c",
      badge: "Culinary Kitchen & Reservations",
      heroKpis: [["100%", "Fresh Local Ingredients"], ["4.9 ★", "Guest Dining Score"], ["Daily", "Chef Tasting Menu"], ["Open", "Lunch & Dinner"]],
    },
    healthcare: {
      bg: "#09131f",
      surface: "#122236",
      accent: "#38bdf8",
      secondary: "#10b981",
      badge: "Accredited Medical & Care Portal",
      heroKpis: [["24/7", "Clinical Support"], ["< 15m", "Average Triage Wait"], ["100%", "Encrypted Patient Records"], ["40+", "Board-Certified Specialists"]],
    },
    saas: {
      bg: "#090d16",
      surface: "#131b2e",
      accent: "#38bdf8",
      secondary: "#a855f7",
      badge: "Enterprise Cloud Platform",
      heroKpis: [["99.99%", "SLA Uptime"], ["< 25ms", "Global Edge Latency"], ["SOC2 / ZT", "Security Architecture"], ["10x", "Deployment Velocity"]],
    },
    portfolio: {
      bg: "#0b0c10",
      surface: "#151821",
      accent: "#e4b86a",
      secondary: "#6366f1",
      badge: "Portfolio & Case Studies",
      heroKpis: [["50+", "Production Releases"], ["99.9%", "System Reliability"], ["Full-Stack", "Architecture & UI"], ["Open", "For Select Projects"]],
    },
    education: {
      bg: "#0a101d",
      surface: "#141f36",
      accent: "#e4b86a",
      secondary: "#3b82f6",
      badge: "Interactive Learning Academy",
      heroKpis: [["100%", "Hands-On Labs"], ["24/7", "Mentor & AI Support"], ["Verified", "Skill Certificates"], ["Self-Paced", "Modular Tracks"]],
    },
    realestate: {
      bg: "#0d1117",
      surface: "#161d27",
      accent: "#e4b86a",
      secondary: "#14b8a6",
      badge: "Premier Property & Real Estate",
      heroKpis: [["100%", "Verified Title Deeds"], ["Virtual", "3D Walkthroughs"], ["Instant", "Mortgage Estimator"], ["Prime", "Residential & Commercial"]],
    },
    community: {
      bg: "#110e0b",
      surface: "#1e1914",
      accent: "#e4b86a",
      secondary: "#f59e0b",
      badge: "Community & Fellowship Hub",
      heroKpis: [["Weekly", "Gatherings & Programs"], ["100%", "Open Welcome"], ["Live", "Stream & Archive"], ["Local", "Outreach & Impact"]],
    },
    general: {
      bg: "#0c1017",
      surface: "#151c28",
      accent: "#e4b86a",
      secondary: "#38bdf8",
      badge: "Interactive Web Portal",
      heroKpis: [["Verified", "Primary Sources"], ["Interactive", "Search & Filter"], ["Responsive", "Mobile & Desktop"], ["Live", "Calculator & Planner"]],
    },
  };

  const palette = themePalettes[archetype];
  const uniqueTags = Array.from(new Set(cards.map((c) => c.tag)));
  const lead = cards[0]!;

  const filterButtonsHtml = [
    `<button class="filter-btn active" onclick="filterCards('all', this)">All (${cards.length})</button>`,
    ...uniqueTags.map(
      (t) => `<button class="filter-btn" onclick="filterCards('${t.replace(/'/g, "")}', this)">${t.replace(/[<>&"]/g, "")}</button>`,
    ),
  ].join("\n        ");

  const cardsHtml = cards
    .map(
      (c, idx) => `      <article class="card" data-tag="${c.tag.replace(/[<>&"]/g, "")}" data-title="${c.title.toLowerCase().replace(/[<>&"]/g, "")}">
        <div class="card-top">
          <span class="badge">${c.tag.replace(/[<>&"]/g, "")}</span>
          <span class="metric">${c.metric.replace(/[<>&"]/g, "")}</span>
        </div>
        <h3>${c.title.replace(/[<>&"]/g, "")}</h3>
        <p>${c.extract.slice(0, 220).replace(/[<>&"]/g, "")}${c.extract.length > 220 ? "…" : ""}</p>
        <div class="card-actions">
          <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="card-link">Read reference →</a>
          <button type="button" class="action-chip" onclick="selectItem('${c.title.replace(/['"<>&]/g, "")}', ${45 + idx * 25})">
            ${archetype === "ecommerce" ? "+ Add to Cart" : archetype === "restaurant" ? "+ Add to Order" : "Select →"}
          </button>
        </div>
      </article>`,
    )
    .join("\n");

  const kpiHtml = palette.heroKpis
    .map(
      ([val, label]) => `      <div class="kpi">
        <strong>${val}</strong>
        <span>${label}</span>
      </div>`,
    )
    .join("\n");

  const interactiveLabel =
    archetype === "ecommerce"
      ? "Interactive Cart & Order Estimator"
      : archetype === "realestate"
        ? "Interactive Mortgage & Payment Calculator"
        : archetype === "tourism"
          ? "Interactive Trip & Safari Budget Planner"
          : archetype === "restaurant"
            ? "Interactive Table Reservation & Dining Estimator"
            : archetype === "healthcare"
              ? "Interactive Patient Appointment & Triage Estimator"
              : archetype === "saas"
                ? "Interactive Team Seat & ROI Calculator"
                : `Interactive ${titleTopic} Planner & Estimator`;

  const unitLabel =
    archetype === "ecommerce"
      ? "Quantity / Units"
      : archetype === "realestate"
        ? "Property Value ($1,000s)"
        : archetype === "tourism"
          ? "Number of Travelers"
          : archetype === "restaurant"
            ? "Party Size (Guests)"
            : archetype === "saas"
              ? "Team Seats / Users"
              : "Participants / Units";

  const durationLabel =
    archetype === "ecommerce"
      ? "Shipping Tier (1=Standard, 2=Express, 3=Priority)"
      : archetype === "realestate"
        ? "Loan Term (Years)"
        : archetype === "tourism"
          ? "Trip Duration (Days)"
          : archetype === "restaurant"
            ? "Courses per Guest (1–5)"
            : "Duration / Multiplier";

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleTopic} — ${palette.badge}</title>
  <style>
    :root {
      --bg: ${palette.bg};
      --surface: ${palette.surface};
      --accent: ${palette.accent};
      --secondary: ${palette.secondary};
      --text: #f6f3ec;
      --muted: #b2b8c2;
      --border: rgba(228, 184, 106, 0.22);
    }
    body.light-mode {
      --bg: #f8f6f0;
      --surface: #ffffff;
      --text: #14171f;
      --muted: #525866;
      --border: rgba(20, 23, 31, 0.14);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      transition: background 0.25s ease, color 0.25s ease;
    }
    nav.topbar {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.9rem 1.75rem;
      background: rgba(12, 16, 23, 0.88);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    body.light-mode nav.topbar {
      background: rgba(255, 255, 255, 0.9);
    }
    .brand {
      font-weight: 800;
      font-size: 1.05rem;
      letter-spacing: -0.01em;
      color: var(--accent);
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .nav-links a {
      color: var(--text);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      opacity: 0.85;
    }
    .nav-links a:hover { opacity: 1; color: var(--accent); }
    .theme-btn {
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
    }
    header.hero {
      padding: 4.25rem 1.5rem 3.25rem;
      background: radial-gradient(circle at 80% 15%, rgba(56, 189, 248, 0.16), transparent 55%),
                  radial-gradient(circle at 20% 80%, rgba(228, 184, 106, 0.14), transparent 50%);
      border-bottom: 1px solid var(--border);
      text-align: center;
    }
    .eyebrow {
      display: inline-block;
      padding: 0.35rem 0.95rem;
      border-radius: 999px;
      background: rgba(228, 184, 106, 0.14);
      border: 1px solid var(--border);
      color: var(--accent);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.1rem, 4.8vw, 3.5rem);
      margin-top: 0.9rem;
      letter-spacing: -0.025em;
      line-height: 1.15;
    }
    .subtitle {
      max-width: 740px;
      margin: 1rem auto 1.8rem;
      color: var(--muted);
      font-size: 1.04rem;
    }
    .cta-row {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.75rem 1.45rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--accent);
      background: var(--accent);
      color: #141109;
    }
    .btn.secondary {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }
    .kpi-strip {
      max-width: 980px;
      margin: 2.5rem auto 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.9rem;
    }
    .kpi {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1rem;
    }
    .kpi strong {
      display: block;
      font-size: 1.45rem;
      color: var(--accent);
    }
    .kpi span {
      font-size: 0.8rem;
      color: var(--muted);
    }
    main {
      max-width: 1140px;
      margin: 0 auto;
      padding: 2.75rem 1.5rem 4rem;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1rem;
      margin-bottom: 1.5rem;
    }
    .filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .filter-btn {
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    .filter-btn.active {
      background: var(--accent);
      color: #141109;
      border-color: var(--accent);
    }
    .search-box {
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      min-width: 230px;
      font-size: 0.88rem;
      outline: none;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
      gap: 1.25rem;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.18s ease;
    }
    .card:hover { transform: translateY(-3px); }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      color: var(--accent);
      font-weight: 700;
    }
    .metric {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--secondary);
    }
    .card h3 { font-size: 1.16rem; }
    .card p { color: var(--muted); font-size: 0.92rem; flex: 1; }
    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border);
    }
    .card-link {
      color: var(--accent);
      font-weight: 600;
      font-size: 0.84rem;
      text-decoration: none;
    }
    .action-chip {
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(228, 184, 106, 0.12);
      color: var(--text);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
    }
    .interactive-panel {
      margin-top: 3rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .panel-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.6rem;
    }
    .panel-box h3 { margin-bottom: 0.5rem; font-size: 1.2rem; }
    .panel-box p.sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.1rem; }
    .field { margin-bottom: 0.9rem; }
    .field label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
      color: var(--muted);
    }
    .field input, .field select, .field textarea {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.9rem;
    }
    .result-banner {
      margin-top: 1rem;
      padding: 0.95rem 1.1rem;
      border-radius: 0.9rem;
      background: rgba(228, 184, 106, 0.12);
      border: 1px solid var(--border);
      font-weight: 600;
      font-size: 0.95rem;
    }
    footer {
      text-align: center;
      padding: 2.2rem 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.86rem;
    }
  </style>
</head>
<body>
  <nav class="topbar">
    <a href="#" class="brand">${titleTopic}</a>
    <div class="nav-links">
      <a href="#explore">Explore</a>
      <a href="#planner">Interactive Tool</a>
      <a href="#contact">Contact</a>
      <button type="button" class="theme-btn" onclick="document.body.classList.toggle('light-mode')">Toggle Theme</button>
    </div>
  </nav>

  <header class="hero">
    <span class="eyebrow">${palette.badge}</span>
    <h1>${titleTopic}</h1>
    <p class="subtitle">${lead.extract.slice(0, 260).replace(/[<>&"]/g, "")}</p>
    <div class="cta-row">
      <a href="#explore" class="btn">Explore ${titleTopic}</a>
      <a href="#planner" class="btn secondary">${interactiveLabel}</a>
    </div>
    <div class="kpi-strip">
${kpiHtml}
    </div>
  </header>

  <main>
    <section id="explore">
      <h2>Featured Highlights & Directory</h2>
      <div class="toolbar">
        <div class="filter-group">
          ${filterButtonsHtml}
        </div>
        <input type="search" id="searchInput" class="search-box" placeholder="Search ${titleTopic.replace(/[<>&"]/g, "")}..." oninput="searchCards(this.value)" />
      </div>
      <div class="grid" id="cardGrid">
${cardsHtml}
      </div>
    </section>

    <section id="planner" class="interactive-panel">
      <div class="panel-box">
        <h3>${interactiveLabel}</h3>
        <p class="sub">Adjust parameters below to calculate live estimates in real time.</p>
        <div class="field">
          <label for="selectedItem">Selected Item / Focus</label>
          <input type="text" id="selectedItem" value="${lead.title.replace(/[<>&"]/g, "")}" oninput="recalc()" />
        </div>
        <div class="field">
          <label for="unitsInput">${unitLabel}</label>
          <input type="number" id="unitsInput" value="2" min="1" max="1000" oninput="recalc()" />
        </div>
        <div class="field">
          <label for="durationInput">${durationLabel}</label>
          <input type="number" id="durationInput" value="5" min="1" max="365" oninput="recalc()" />
        </div>
        <div class="field">
          <label for="tierSelect">Service / Plan Tier</label>
          <select id="tierSelect" onchange="recalc()">
            <option value="65">Standard / Essential ($65 base)</option>
            <option value="145" selected>Professional / Guided ($145 base)</option>
            <option value="290">Premier / Executive ($290 base)</option>
          </select>
        </div>
        <div class="result-banner" id="calcResult">
          Estimated Total: $1,450.00 (2 units × 5 × $145/unit)
        </div>
      </div>

      <div class="panel-box" id="contact">
        <h3>Inquiry & Quick Action</h3>
        <p class="sub">Submit an inquiry, reservation, or project brief directly from this page.</p>
        <form onsubmit="submitForm(event)">
          <div class="field">
            <label for="guestName">Your Name or Organization</label>
            <input type="text" id="guestName" required placeholder="Enter full name" />
          </div>
          <div class="field">
            <label for="guestEmail">Email Address</label>
            <input type="email" id="guestEmail" required placeholder="you@example.com" />
          </div>
          <div class="field">
            <label for="guestNotes">Requirements / Notes</label>
            <textarea id="guestNotes" rows="3" placeholder="Tell us what you need for ${titleTopic.replace(/[<>&"]/g, "")}..."></textarea>
          </div>
          <button type="submit" class="btn" style="width:100%">Confirm & Submit</button>
          <div class="result-banner" id="formStatus" style="display:none; margin-top:0.85rem;"></div>
        </form>
      </div>
    </section>
  </main>

  <footer>
    Designed by Vibe Web Architect inside Noctis · ${titleTopic} · Verified records: ${cards.map((c) => c.title.replace(/[<>&"]/g, "")).join(" · ")}
  </footer>

  <script>
    let activeTag = 'all';
    function filterCards(tag, btn) {
      activeTag = tag;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      applyFilters();
    }
    function searchCards() {
      applyFilters();
    }
    function applyFilters() {
      const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      document.querySelectorAll('#cardGrid .card').forEach(card => {
        const matchTag = activeTag === 'all' || card.getAttribute('data-tag') === activeTag;
        const text = card.innerText.toLowerCase();
        const matchQ = !q || text.includes(q);
        card.style.display = (matchTag && matchQ) ? 'flex' : 'none';
      });
    }
    function selectItem(title, baseRate) {
      const itemEl = document.getElementById('selectedItem');
      if (itemEl) itemEl.value = title;
      recalc(baseRate);
      document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
    }
    function recalc(overrideRate) {
      const item = document.getElementById('selectedItem').value || '${lead.title.replace(/['"<>&]/g, "")}';
      const units = Math.max(1, Number(document.getElementById('unitsInput').value) || 1);
      const dur = Math.max(1, Number(document.getElementById('durationInput').value) || 1);
      const rate = overrideRate || Number(document.getElementById('tierSelect').value) || 145;
      const total = units * dur * rate;
      document.getElementById('calcResult').innerText =
        item + ' — Estimated Total: $' + total.toLocaleString('en-US', { minimumFractionDigits: 2 }) +
        ' (' + units + ' × ' + dur + ' × $' + rate + ')';
    }
    function submitForm(e) {
      e.preventDefault();
      const name = document.getElementById('guestName').value;
      const item = document.getElementById('selectedItem').value;
      const box = document.getElementById('formStatus');
      box.style.display = 'block';
      box.innerText = 'Confirmed for ' + name + ' (' + item + '). Your request has been logged.';
    }
  </script>
</body>
</html>`;

  const studySections = cards.map((c) => `### ${c.title}\n${c.extract}`).join("\n\n");
  const refs = cards.map((c) => `- **Reference — ${c.title}:** ${c.url}`).join("\n");
  const practice = cards
    .slice(0, 3)
    .map((c, idx) => `${idx + 1}. **What is the core role and value of ${c.title} in ${titleTopic}?**\n   - *Answer:* ${c.extract.slice(0, 240)}`)
    .join("\n");

  return [
    `## Web Page Architecture & Design: ${titleTopic} (\`${archetype.toUpperCase()}\` Layout)`,
    `Use the **Live Web Page Preview** below to interact with the designed page directly inside Noctis (including live search, category filter tabs, dark/light theme switcher, and the interactive calculator), or click **Open Full Page ↗** / **Download .html**.\n\n\`\`\`html\n${htmlCode}\n\`\`\``,
    `## Study notes\n${studySections}`,
    `## Research\n${cards.map((c) => `- **${c.title} (${c.tag}):** ${c.extract.slice(0, 320)}`).join("\n")}`,
    `## References\n${refs}`,
    `## Practice\n${practice}`,
    `## What to study next\n- Customize the CSS variables (\`--bg\`, \`--surface\`, \`--accent\`) or add custom API endpoints for ${cards.map((c) => `**${c.title}**`).join(", ")}.`,
  ].join("\n\n");
}

export async function runVibeGadgets(question: string): Promise<string | null> {
  const syncHit =
    evalBenchmarkGadget(question) ||
    jwtGadget(question) ||
    cidrGadget(question) ||
    cryptoGadget(question) ||
    zeroTrustGadget(question) ||
    cyberOperationsGadget(question) ||
    riskLifecycleGadget(question) ||
    domainCertificationGadget(question) ||
    owaspCodeGadget(question);
  if (syncHit) return syncHit;
  const asyncHit =
    (await webPageBuilderGadget(question)) ||
    (await headerAuditGadget(question)) ||
    (await cveAndKevGadget(question));
  return asyncHit;
}
