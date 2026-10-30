/**
 * SSRF destination validation (reference implementation + analysis) and cryptographic-context assessment.
 * Self-contained: no imports, so it can be unit-tested directly.
 */

/* ------------------------------------------------------------------ */
/* IP classification                                                   */
/* ------------------------------------------------------------------ */

export type IpCategory =
  | "PUBLIC"
  | "LOOPBACK"
  | "PRIVATE_RFC1918"
  | "LINK_LOCAL"
  | "CLOUD_METADATA"
  | "CGNAT"
  | "UNSPECIFIED"
  | "MULTICAST_OR_RESERVED"
  | "IPV6_ULA"
  | "NAT64_OR_TRANSITION"
  | "INVALID";

export interface IpClassification {
  input: string;
  normalized: string | null;
  category: IpCategory;
  blocked: boolean;
}

function parseIpv4Component(tok: string): number | null {
  if (/^0x[0-9a-f]+$/i.test(tok)) return parseInt(tok, 16);
  if (/^0[0-7]+$/.test(tok)) return parseInt(tok, 8);
  if (/^\d+$/.test(tok)) return parseInt(tok, 10);
  return null;
}

/** Parses dotted-quad and the alternate inet_aton forms (decimal, hex, octal, 1-3 part shorthand). */
export function parseIpv4Loose(input: string): number[] | null {
  const parts = input.trim().split(".");
  if (parts.length < 1 || parts.length > 4) return null;
  const nums = parts.map(parseIpv4Component);
  if (nums.some((n) => n === null || (n as number) < 0)) return null;
  const n = nums as number[];
  const last = n[n.length - 1];
  const maxLast = Math.pow(256, 5 - n.length) - 1;
  if (last > maxLast) return null;
  for (let i = 0; i < n.length - 1; i++) if (n[i] > 255) return null;
  let value = last;
  for (let i = 0; i < n.length - 1; i++) value += n[i] * Math.pow(256, 3 - i);
  if (value > 0xffffffff) return null;
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

function classifyV4(o: number[]): IpCategory {
  const [a, b] = o;
  if (a === 0) return "UNSPECIFIED";
  if (a === 127) return "LOOPBACK";
  if (a === 10) return "PRIVATE_RFC1918";
  if (a === 172 && b >= 16 && b <= 31) return "PRIVATE_RFC1918";
  if (a === 192 && b === 168) return "PRIVATE_RFC1918";
  if (a === 169 && b === 254) return o[2] === 169 && o[3] === 254 ? "CLOUD_METADATA" : "LINK_LOCAL";
  if (a === 100 && b >= 64 && b <= 127) return "CGNAT";
  if (a >= 224) return "MULTICAST_OR_RESERVED";
  if (a === 192 && b === 0 && o[2] === 0) return "MULTICAST_OR_RESERVED";
  if (a === 198 && (b === 18 || b === 19)) return "MULTICAST_OR_RESERVED";
  return "PUBLIC";
}

/** Expands an IPv6 literal to 8 hextets (supports :: compression and embedded IPv4). */
export function parseIpv6(input: string): number[] | null {
  let s = input.trim().replace(/^\[|\]$/g, "");
  const zone = s.indexOf("%");
  if (zone >= 0) s = s.slice(0, zone);
  if (!/^[0-9a-f:.]+$/i.test(s) || !s.includes(":")) return null;
  let tail: number[] = [];
  const v4m = s.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (v4m) {
    const o = parseIpv4Loose(v4m[2]);
    if (!o) return null;
    tail = [(o[0] << 8) | o[1], (o[2] << 8) | o[3]];
    s = v4m[1] + "0:0";
  }
  const dbl = s.split("::");
  if (dbl.length > 2) return null;
  const toNums = (t: string) => (t === "" ? [] : t.split(":").map((h) => (/^[0-9a-f]{1,4}$/i.test(h) ? parseInt(h, 16) : NaN)));
  let hextets: number[];
  if (dbl.length === 2) {
    const head = toNums(dbl[0]);
    const rest = toNums(dbl[1]);
    const fill = 8 - head.length - rest.length;
    if (fill < 1) return null;
    hextets = [...head, ...new Array(fill).fill(0), ...rest];
  } else {
    hextets = toNums(s);
  }
  if (hextets.length !== 8 || hextets.some((h) => Number.isNaN(h))) return null;
  if (tail.length) {
    hextets[6] = tail[0];
    hextets[7] = tail[1];
  }
  return hextets;
}

export function classifyIp(input: string): IpClassification {
  const raw = input.trim();
  const v6 = raw.includes(":") ? parseIpv6(raw) : null;
  if (v6) {
    const normalized = v6.map((h) => h.toString(16)).join(":");
    const allZeroPrefix = v6.slice(0, 5).every((h) => h === 0);
    // IPv4-mapped ::ffff:a.b.c.d and deprecated IPv4-compatible ::a.b.c.d
    if (allZeroPrefix && (v6[5] === 0xffff || v6[5] === 0)) {
      if (v6[5] === 0 && v6[6] === 0 && (v6[7] === 0 || v6[7] === 1)) {
        const cat: IpCategory = v6[7] === 1 ? "LOOPBACK" : "UNSPECIFIED";
        return { input, normalized, category: cat, blocked: true };
      }
      const o = [v6[6] >> 8, v6[6] & 255, v6[7] >> 8, v6[7] & 255];
      const cat = classifyV4(o);
      return { input, normalized, category: cat, blocked: cat !== "PUBLIC" };
    }
    if (v6[0] === 0x64 && v6[1] === 0xff9b) {
      // NAT64: judge the embedded IPv4
      const o = [v6[6] >> 8, v6[6] & 255, v6[7] >> 8, v6[7] & 255];
      const inner = classifyV4(o);
      return { input, normalized, category: inner === "PUBLIC" ? "NAT64_OR_TRANSITION" : inner, blocked: inner !== "PUBLIC" };
    }
    if (v6[0] === 0x2002) {
      // 6to4 embeds IPv4 in hextets 1-2
      const o = [v6[1] >> 8, v6[1] & 255, v6[2] >> 8, v6[2] & 255];
      const inner = classifyV4(o);
      return { input, normalized, category: inner === "PUBLIC" ? "NAT64_OR_TRANSITION" : inner, blocked: inner !== "PUBLIC" };
    }
    if ((v6[0] & 0xfe00) === 0xfc00) return { input, normalized, category: "IPV6_ULA", blocked: true };
    if ((v6[0] & 0xffc0) === 0xfe80) return { input, normalized, category: "LINK_LOCAL", blocked: true };
    if ((v6[0] & 0xff00) === 0xff00) return { input, normalized, category: "MULTICAST_OR_RESERVED", blocked: true };
    if (v6.every((h) => h === 0)) return { input, normalized, category: "UNSPECIFIED", blocked: true };
    if (v6.slice(0, 7).every((h) => h === 0) && v6[7] === 1) return { input, normalized, category: "LOOPBACK", blocked: true };
    if (v6[0] === 0x2001 && v6[1] === 0x0db8) return { input, normalized, category: "MULTICAST_OR_RESERVED", blocked: true };
    return { input, normalized, category: "PUBLIC", blocked: false };
  }
  const v4 = parseIpv4Loose(raw);
  if (v4) {
    const cat = classifyV4(v4);
    return { input, normalized: v4.join("."), category: cat, blocked: cat !== "PUBLIC" };
  }
  return { input, normalized: null, category: "INVALID", blocked: true };
}

/* ------------------------------------------------------------------ */
/* Outbound URL validation                                             */
/* ------------------------------------------------------------------ */

export interface OutboundPolicy {
  allowedSchemes?: string[]; // default ["https"]
  allowedHosts?: string[]; // exact or "*.example.com"
  allowedPorts?: number[]; // default [443]
}

export interface OutboundDecision {
  allowed: boolean;
  reasons: string[];
  host?: string;
  resolvedIps: IpClassification[];
}

function hostAllowed(host: string, patterns: string[]): boolean {
  const h = host.toLowerCase();
  return patterns.some((p) => {
    const pat = p.toLowerCase();
    if (pat.startsWith("*.")) return h.endsWith(pat.slice(1)) && h.length > pat.length - 1;
    return h === pat;
  });
}

/**
 * Validates a destination URL and the IPs it resolved to *at connection time*.
 * Callers must pass every A and AAAA record they intend to connect to, and must then connect to the
 * validated IP (pinning), otherwise DNS rebinding between check and use is still possible.
 */
export function validateOutboundDestination(
  url: string,
  resolvedAddresses: string[],
  policy: OutboundPolicy = {}
): OutboundDecision {
  const reasons: string[] = [];
  const schemes = policy.allowedSchemes ?? ["https"];
  const ports = policy.allowedPorts ?? [443];
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false, reasons: ["URL does not parse"], resolvedIps: [] };
  }
  const scheme = parsed.protocol.replace(":", "").toLowerCase();
  if (!schemes.includes(scheme)) reasons.push(`scheme '${scheme}' is not allowed`);
  if (parsed.username || parsed.password) reasons.push("URL embeds credentials (userinfo) which can mask the real host");
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  const port = parsed.port ? Number(parsed.port) : scheme === "https" ? 443 : scheme === "http" ? 80 : NaN;
  if (!ports.includes(port)) reasons.push(`port ${port} is not allowed`);
  if (policy.allowedHosts && !hostAllowed(host, policy.allowedHosts)) reasons.push(`host '${host}' is not on the allowlist`);

  // A literal IP in the URL is classified directly, including alternate encodings (WHATWG already normalizes some).
  const literalClass = classifyIp(host);
  if (literalClass.category !== "INVALID" && literalClass.blocked) {
    reasons.push(`literal address ${host} is ${literalClass.category}`);
  }

  const resolvedIps = resolvedAddresses.map(classifyIp);
  if (resolvedIps.length === 0 && literalClass.category === "INVALID") {
    reasons.push("no resolved addresses supplied: connect-time validation is impossible");
  }
  for (const ip of resolvedIps) {
    if (ip.blocked) reasons.push(`resolved address ${ip.input} is ${ip.category}`);
  }
  return { allowed: reasons.length === 0, reasons, host, resolvedIps };
}

/* ------------------------------------------------------------------ */
/* Assessments used by the scanner                                     */
/* ------------------------------------------------------------------ */

export interface ContextCheck {
  id: string;
  label: string;
  status: "PRESENT" | "ABSENT" | "UNKNOWN";
  evidence: string;
}

export interface ContextAssessmentResult {
  kind: "SSRF" | "CRYPTO";
  summary: string;
  riskContext: "HIGH" | "MEDIUM" | "LOW" | "UNESTABLISHED";
  checks: ContextCheck[];
}

const check = (id: string, label: string, present: boolean | null, evidence: string): ContextCheck => ({
  id,
  label,
  status: present === null ? "UNKNOWN" : present ? "PRESENT" : "ABSENT",
  evidence,
});

/** Inspects code near an outbound-request sink for each SSRF control. Absence is reported per control. */
export function assessSsrfControls(code: string): ContextAssessmentResult {
  const has = (re: RegExp) => re.test(code);
  const checks: ContextCheck[] = [
    check(
      "scheme-allowlist",
      "HTTPS-only scheme allowlist",
      has(/(?:scheme|protocol)\s*(?:===?|in|==|!=|!==)\s*[\[(]?\s*["']https["']|startswith\(\s*["']https:\/\/|startsWith\(\s*["']https:\/\//i),
      "looked for an explicit https scheme check"
    ),
    check(
      "host-allowlist",
      "Destination host allowlist",
      has(/allow(?:ed)?[_-]?(?:hosts?|domains?|list|urls?)|ALLOWED_\w+|whitelist/i),
      "looked for an allowlist of hosts/domains"
    ),
    check(
      "dns-resolution-ip-check",
      "Resolved-IP validation (A and AAAA) against private/loopback/link-local/metadata ranges",
      has(/getaddrinfo|dns\.lookup|dns\.resolve|InetAddress\.getAllByName|ipaddress\.|is_private|is_loopback|isSiteLocalAddress|isLoopbackAddress|isPrivateIp|isPrivateOrLinkLocal/i),
      "looked for DNS resolution plus an IP-range check"
    ),
    check(
      "ipv6-handled",
      "IPv6 and IPv4-mapped IPv6 handled",
      has(/AF_INET6|ipaddress\.ip_address|isLinkLocalAddress|IPv6|::ffff|ip_address\(/i),
      "looked for IPv6-aware address parsing"
    ),
    check(
      "redirects-disabled",
      "Automatic redirects disabled or each hop re-validated",
      has(/allow_redirects\s*=\s*False|maxRedirects\s*:\s*0|redirect\s*:\s*["']manual["']|Redirect\.NEVER|setInstanceFollowRedirects\s*\(\s*false|follow_redirects\s*=\s*False/i),
      "looked for redirect suppression"
    ),
    check(
      "connect-time-pinning",
      "Connection pinned to the validated IP (no re-resolution between check and use)",
      has(/HTTPAdapter|create_connection|lookup\s*:\s*|pinned|connect\(\s*\(\s*ip|setHost|Host["']?\s*:\s*host|socket\.connect|Agent\(\s*\{[^}]*lookup/i),
      "looked for connect-time IP pinning (needed against DNS rebinding / TOCTOU)"
    ),
    check(
      "timeout",
      "Request timeout set",
      has(/timeout\s*[=:]\s*\d|setConnectTimeout|setReadTimeout|AbortSignal\.timeout/i),
      "looked for a timeout"
    ),
  ];
  const absent = checks.filter((c) => c.status === "ABSENT");
  const critical = absent.filter((c) => ["host-allowlist", "dns-resolution-ip-check"].includes(c.id));
  return {
    kind: "SSRF",
    summary: absent.length
      ? `${absent.length}/${checks.length} SSRF controls absent in the inspected code: ${absent.map((c) => c.id).join(", ")}.`
      : "All inspected SSRF controls are present (static check; connect-time behavior is not executed).",
    riskContext: critical.length === 2 ? "HIGH" : absent.length >= 3 ? "MEDIUM" : absent.length > 0 ? "LOW" : "LOW",
    checks,
  };
}

/** Assesses the security context of a weak-crypto finding instead of judging the primitive alone. */
export function assessCryptoContext(code: string, filePath = ""): ContextAssessmentResult {
  const has = (re: RegExp) => re.test(code);
  const sensitive = has(/token|password|passwd|secret|session|otp|credential|api[_-]?key|ssn|card|pan\b|jwt|bearer|reset/i);
  const checksumUse = has(/checksum|etag|cache[_-]?key|fingerprint|dedup|content[_-]?hash|file[_-]?hash|integrity check/i);
  const testFile = /(?:test|spec|fixture|mock|example)/i.test(filePath);
  const ecb = has(/\bECB\b|aes-\d+-ecb|modes\.ECB/i);
  const primitive = ecb
    ? "AES-ECB"
    : has(/\bMD5\b|md5/i)
      ? "MD5"
      : has(/\bSHA-?1\b|sha1/i)
        ? "SHA-1"
        : has(/\bDES\b|RC4/i)
          ? "DES/RC4"
          : has(/Math\.random|java\.util\.Random|random\.(?:random|randint)/i)
            ? "non-cryptographic PRNG"
            : "unspecified primitive";

  const hardcodedKey = has(/(?:key|secret)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{8,}["']/i);
  const keyFromEnvOrKms = has(/process\.env|os\.environ|getenv|KeyVault|KMS|SecretManager|vault/i);
  const staticIv = has(/iv\s*[:=]\s*(?:b?["']|new byte\[\s*\d+\s*\]\s*[;)]|Buffer\.alloc)/i);
  const randomIv = has(/randomBytes|os\.urandom|SecureRandom|secrets\.token_bytes|crypto\.getRandomValues/i);
  const tagVerified = has(/getAuthTag|setAuthTag|\.verify\(|hmac\.compare_digest|timingSafeEqual|GCMParameterSpec|AESGCM|authentication tag/i);
  const rotation = has(/key[_-]?id|kid\b|key[_-]?version|rotate|rotation/i);

  const checks: ContextCheck[] = [
    check("primitive", `Primitive in use: ${primitive}`, primitive !== "unspecified primitive", "identified from the code excerpt"),
    check("sensitive-data", "Output protects security-sensitive data (token, credential, session, key)", sensitive ? true : checksumUse ? false : null, sensitive ? "sensitive-data vocabulary near the primitive" : checksumUse ? "checksum/cache/etag vocabulary suggests non-security use" : "data classification not established by the excerpt"),
    check("production-path", "Reachable from production code (not a test/fixture)", testFile ? false : null, testFile ? `file path ${filePath} looks like a test/fixture` : "execution environment not established statically"),
    check("key-source", "Key material from env/KMS rather than a literal", hardcodedKey ? false : keyFromEnvOrKms ? true : null, hardcodedKey ? "literal key/secret assigned in source" : keyFromEnvOrKms ? "key read from environment/KMS/vault" : "key source not visible in excerpt"),
    check("iv-nonce", "Fresh random IV/nonce per operation", staticIv ? false : randomIv ? true : null, staticIv ? "static/zero IV pattern" : randomIv ? "CSPRNG used for IV/nonce" : ecb ? "ECB mode has no IV at all" : "IV handling not visible"),
    check("auth-tag", "Authentication tag / MAC verified before use", tagVerified ? true : ecb ? false : null, tagVerified ? "AEAD tag or MAC verification present" : ecb ? "ECB provides no integrity protection" : "not visible"),
    check("key-rotation", "Key identifier / rotation support", rotation ? true : null, rotation ? "key id/version vocabulary present" : "not visible in excerpt"),
  ];

  let riskContext: ContextAssessmentResult["riskContext"] = "UNESTABLISHED";
  if (testFile || (checksumUse && !sensitive)) riskContext = "LOW";
  else if (sensitive && (ecb || hardcodedKey || staticIv)) riskContext = "HIGH";
  else if (sensitive) riskContext = "MEDIUM";

  const notes: string[] = [];
  if (riskContext === "UNESTABLISHED") notes.push("whether the output protects security-sensitive data is not established");
  if (hardcodedKey) notes.push("hardcoded key material");
  if (ecb) notes.push("ECB leaks plaintext block equality and gives no integrity");
  return {
    kind: "CRYPTO",
    summary: `${primitive}: ${riskContext} context${notes.length ? " — " + notes.join("; ") : ""}.`,
    riskContext,
    checks,
  };
}
