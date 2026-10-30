import { classifyIp, validateOutboundDestination, assessSsrfControls, assessCryptoContext } from "../lib/context-checks";

let failed = 0;
const t = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + detail}`);
  if (!cond) failed++;
};

const blocked = (ip: string) => classifyIp(ip).blocked;
t("127.0.0.1 loopback", blocked("127.0.0.1"));
t("10.0.0.5 private", blocked("10.0.0.5"));
t("172.16.0.1 private", blocked("172.16.0.1"));
t("172.32.0.1 public", !blocked("172.32.0.1"));
t("192.168.1.1 private", blocked("192.168.1.1"));
t("169.254.169.254 metadata", classifyIp("169.254.169.254").category === "CLOUD_METADATA");
t("100.64.0.1 CGNAT", blocked("100.64.0.1"));
t("8.8.8.8 public", !blocked("8.8.8.8"));
t("decimal 2130706433 == 127.0.0.1", blocked("2130706433"));
t("hex 0x7f000001", blocked("0x7f000001"));
t("octal 0177.0.0.1", blocked("0177.0.0.1"));
t("short 127.1", blocked("127.1"));
t("::1 loopback", blocked("::1"));
t("[::1] bracketed", blocked("[::1]"));
t("::ffff:127.0.0.1 mapped", blocked("::ffff:127.0.0.1"));
t("::ffff:7f00:1 mapped hex", blocked("::ffff:7f00:1"));
t("::ffff:8.8.8.8 mapped public", !blocked("::ffff:8.8.8.8"));
t("fe80::1 link-local", blocked("fe80::1"));
t("fd00::1 ULA", blocked("fd00::1"));
t("64:ff9b::a00:1 NAT64 to 10.0.0.1", blocked("64:ff9b::a00:1"));
t("2002:7f00:1:: 6to4 to 127.0.0.1", blocked("2002:7f00:1::"));
t("2606:4700::1111 public", !blocked("2606:4700::1111"));
t("garbage invalid blocked", blocked("not-an-ip"));

const ok = validateOutboundDestination("https://api.partner.com/hook", ["93.184.216.34"], { allowedHosts: ["api.partner.com"] });
t("allowed partner host", ok.allowed, JSON.stringify(ok.reasons));
const http = validateOutboundDestination("http://api.partner.com/hook", ["93.184.216.34"], { allowedHosts: ["api.partner.com"] });
t("http rejected", !http.allowed);
const rebind = validateOutboundDestination("https://api.partner.com/hook", ["93.184.216.34", "169.254.169.254"], { allowedHosts: ["api.partner.com"] });
t("one bad A/AAAA record rejects", !rebind.allowed);
const v6 = validateOutboundDestination("https://api.partner.com/hook", ["::ffff:10.0.0.1"], { allowedHosts: ["api.partner.com"] });
t("mapped private IPv6 rejects", !v6.allowed);
const creds = validateOutboundDestination("https://api.partner.com@evil.com/", ["93.184.216.34"], { allowedHosts: ["api.partner.com"] });
t("userinfo trick rejects", !creds.allowed);
const lit = validateOutboundDestination("https://2130706433/", [], {});
t("decimal-encoded literal host rejects", !lit.allowed, JSON.stringify(lit.reasons));
const noRes = validateOutboundDestination("https://api.partner.com/x", [], { allowedHosts: ["api.partner.com"] });
t("no resolved IPs supplied rejects", !noRes.allowed);

const bare = assessSsrfControls(`requests.get(webhook, timeout=3)`);
t("bare requests.get: allowlist+dns absent => HIGH", bare.riskContext === "HIGH" && bare.checks.find((c) => c.id === "timeout")!.status === "PRESENT", bare.summary);
const hardened = assessSsrfControls(`
if urlparse(u).scheme != "https": raise
if host not in ALLOWED_HOSTS: raise
for ai in socket.getaddrinfo(host, 443):
    ip = ipaddress.ip_address(ai[4][0])
    if ip.is_private: raise
requests.get(u, timeout=3, allow_redirects=False)`);
t("hardened code: only pinning absent", hardened.checks.filter((c) => c.status === "ABSENT").map((c) => c.id).join() === "connect-time-pinning", hardened.summary);

const ecb = assessCryptoContext(`cipher = Cipher.getInstance("AES/ECB/PKCS5Padding"); // encrypt session token\nString key = "0123456789abcdef";`, "src/TokenService.java");
t("ECB on session token => HIGH", ecb.riskContext === "HIGH", ecb.summary);
const md5 = assessCryptoContext(`etag = hashlib.md5(content).hexdigest()  # cache key`, "app/cache.py");
t("MD5 cache etag => LOW", md5.riskContext === "LOW", md5.summary);
const unk = assessCryptoContext(`h = hashlib.md5(x).hexdigest()`, "app/util.py");
t("MD5 unknown use => UNESTABLISHED", unk.riskContext === "UNESTABLISHED", unk.summary);

console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
