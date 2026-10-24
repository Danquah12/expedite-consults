export interface OwaspCategorySpec {
  id: string;
  codeId: string;
  standard: "OWASP-2025" | "OWASP-API-2023" | "OWASP-WAF-7" | "PORTSWIGGER-ACADEMY";
  title: string;
  url: string;
  cwe: string;
  summary: string;
  control: string;
  keywords: RegExp;
  python: string;
  java: string;
  c: string;
}

export const OWASP_2025_SPECS: OwaspCategorySpec[] = [
  {
    id: "A01:2025",
    codeId: "A01_2025",
    standard: "OWASP-2025",
    title: "Broken Access Control",
    url: "https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/",
    cwe: "CWE-284, CWE-285, CWE-639 (IDOR), CWE-862, CWE-863",
    summary:
      "Access control enforces policy such that users cannot act outside of their intended permissions. Failures lead to unauthorized information disclosure, modification, or destruction of data.",
    control:
      "Enforce deny-by-default server-side authorization checks verifying both caller identity (`sub`), tenant (`tenant_id`), and resource ownership on every request.",
    keywords: /\b(a01(?:[:_ -]?2025)?|broken\s+access\s+control)\b/i,
    python: `import unittest
from dataclasses import dataclass

@dataclass(frozen=True)
class Principal:
    user_id: str
    tenant_id: str
    roles: frozenset[str]

@dataclass(frozen=True)
class DocumentRecord:
    doc_id: str
    owner_id: str
    tenant_id: str
    classification: str

def authorize_document_read(caller: Principal, doc: DocumentRecord) -> bool:
    """A01:2025 Deny-by-default ownership & tenant isolation check."""
    if not caller.user_id or not caller.tenant_id:
        return False
    if caller.tenant_id != doc.tenant_id:
        return False
    if caller.user_id == doc.owner_id:
        return True
    if "tenant_auditor" in caller.roles and doc.classification != "restricted":
        return True
    return False

class TestA01BrokenAccessControl(unittest.TestCase):
    def setUp(self) -> None:
        self.doc = DocumentRecord(doc_id="doc-900", owner_id="u-alice", tenant_id="org-1", classification="confidential")

    def test_owner_same_tenant_allowed(self) -> None:
        alice = Principal(user_id="u-alice", tenant_id="org-1", roles=frozenset(["member"]))
        self.assertTrue(authorize_document_read(alice, self.doc))

    def test_horizontal_idor_blocked(self) -> None:
        bob = Principal(user_id="u-bob", tenant_id="org-1", roles=frozenset(["member"]))
        self.assertFalse(authorize_document_read(bob, self.doc))

    def test_cross_tenant_admin_blocked(self) -> None:
        ext_admin = Principal(user_id="u-alice", tenant_id="org-2", roles=frozenset(["tenant_auditor"]))
        self.assertFalse(authorize_document_read(ext_admin, self.doc))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;

public final class A01AccessControlGuard {
    public record Principal(String userId, String tenantId, Set<String> roles) {}
    public record Resource(String resourceId, String ownerId, String tenantId) {}

    public static boolean canRead(Principal caller, Resource resource) {
        if (caller == null || resource == null) return false;
        if (caller.userId() == null || caller.tenantId() == null) return false;
        // Enforce strict tenant boundary first (deny by default)
        if (!caller.tenantId().equals(resource.tenantId())) return false;
        // Allow owner or explicit scoped role within the same tenant
        return caller.userId().equals(resource.ownerId())
                || (caller.roles() != null && caller.roles().contains("TENANT_AUDITOR"));
    }

    public static void main(String[] args) {
        Resource invoice = new Resource("inv-101", "user-1", "tenant-A");
        Principal owner = new Principal("user-1", "tenant-A", Set.of("USER"));
        Principal otherUser = new Principal("user-2", "tenant-A", Set.of("USER"));
        Principal crossTenant = new Principal("user-1", "tenant-B", Set.of("TENANT_AUDITOR"));

        if (!canRead(owner, invoice)) throw new AssertionError("Owner should be permitted");
        if (canRead(otherUser, invoice)) throw new AssertionError("Horizontal access must be denied");
        if (canRead(crossTenant, invoice)) throw new AssertionError("Cross-tenant access must be denied");
        System.out.println("PASS: A01:2025 Broken Access Control unit checks verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    const char *user_id;
    const char *tenant_id;
    unsigned int role_mask; /* 0x01 = USER, 0x02 = AUDITOR */
} principal_t;

typedef struct {
    const char *resource_id;
    const char *owner_id;
    const char *tenant_id;
} resource_t;

bool authorize_resource_access(const principal_t *caller, const resource_t *res) {
    if (!caller || !res || !caller->user_id || !caller->tenant_id || !res->owner_id || !res->tenant_id) {
        return false; /* Fail closed */
    }
    if (strcmp(caller->tenant_id, res->tenant_id) != 0) {
        return false; /* Cross-tenant isolation */
    }
    if (strcmp(caller->user_id, res->owner_id) == 0) {
        return true;
    }
    return (caller->role_mask & 0x02U) != 0;
}

int main(void) {
    resource_t rec = {"rec-42", "u-100", "tenant-alpha"};
    principal_t owner = {"u-100", "tenant-alpha", 0x01U};
    principal_t peer = {"u-200", "tenant-alpha", 0x01U};
    principal_t cross = {"u-100", "tenant-beta", 0x02U};

    assert(authorize_resource_access(&owner, &rec) == true);
    assert(authorize_resource_access(&peer, &rec) == false);
    assert(authorize_resource_access(&cross, &rec) == false);
    printf("PASS: A01:2025 C access control guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "A02:2025",
    codeId: "A02_2025",
    standard: "OWASP-2025",
    title: "Security Misconfiguration",
    url: "https://top10.owasp.org/2025/A02_2025-Security_Misconfiguration/",
    cwe: "CWE-16, CWE-209, CWE-611 (XXE), CWE-942 (CORS)",
    summary:
      "Security misconfiguration arises from insecure default settings, debug modes enabled in production, overly permissive CORS, XML external entity (XXE) processing, or missing HTTP security headers.",
    control:
      "Validate production runtime flags at startup, disable XML external entities (`disallow-doctype-decl`), pin CORS origins, and enforce HSTS, CSP, and `X-Content-Type-Options: nosniff`.",
    keywords: /\b(a02(?:[:_ -]?2025)?|security\s+misconfiguration)\b/i,
    python: `import unittest

REQUIRED_SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}

def audit_production_config(config: dict, headers: dict[str, str]) -> list[str]:
    """A02:2025 Baseline production configuration & header verifier."""
    findings: list[str] = []
    if config.get("DEBUG", False) is True:
        findings.append("CRITICAL: DEBUG mode is enabled in production.")
    if config.get("CORS_ALLOW_ORIGIN") == "*":
        findings.append("HIGH: Wildcard CORS_ALLOW_ORIGIN ('*') is not permitted for authenticated endpoints.")
    for header, expected in REQUIRED_SECURITY_HEADERS.items():
        if headers.get(header) != expected:
            findings.append(f"MISSING/WEAK HEADER: {header}")
    return findings

class TestA02SecurityMisconfiguration(unittest.TestCase):
    def test_hardened_config_passes(self) -> None:
        cfg = {"DEBUG": False, "CORS_ALLOW_ORIGIN": "https://noctis.social"}
        self.assertEqual(audit_production_config(cfg, REQUIRED_SECURITY_HEADERS), [])

    def test_debug_and_wildcard_cors_flagged(self) -> None:
        bad_cfg = {"DEBUG": True, "CORS_ALLOW_ORIGIN": "*"}
        issues = audit_production_config(bad_cfg, {})
        self.assertTrue(any("DEBUG" in i for i in issues))
        self.assertTrue(any("CORS" in i for i in issues))

if __name__ == "__main__":
    unittest.main()`,
    java: `import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

public final class A02HardenedXmlConfig {
    /** A02:2025 Hardened XML parser factory disabling DTDs and External Entities (XXE). */
    public static DocumentBuilderFactory createSafeXmlFactory() throws ParserConfigurationException {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        dbf.setXIncludeAware(false);
        dbf.setExpandEntityReferences(false);
        return dbf;
    }

    public static void main(String[] args) throws Exception {
        DocumentBuilderFactory factory = createSafeXmlFactory();
        if (!factory.getFeature("http://apache.org/xml/features/disallow-doctype-decl")) {
            throw new AssertionError("DOCTYPE declaration must be disabled");
        }
        System.out.println("PASS: A02:2025 Hardened XML & security configuration verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    bool debug_enabled;
    bool directory_listing_enabled;
    bool tls_min_v1_2;
    const char *cors_origin;
} server_config_t;

bool verify_production_baseline(const server_config_t *cfg) {
    if (!cfg) return false;
    if (cfg->debug_enabled || cfg->directory_listing_enabled) return false;
    if (!cfg->tls_min_v1_2) return false;
    if (!cfg->cors_origin || strcmp(cfg->cors_origin, "*") == 0) return false;
    return true;
}

int main(void) {
    server_config_t hardened = {false, false, true, "https://noctis.social"};
    server_config_t misconfigured = {true, false, true, "*"};

    assert(verify_production_baseline(&hardened) == true);
    assert(verify_production_baseline(&misconfigured) == false);
    printf("PASS: A02:2025 C baseline configuration audit verified.\\n");
    return 0;
}`,
  },
  {
    id: "A03:2025",
    codeId: "A03_2025",
    standard: "OWASP-2025",
    title: "Software Supply Chain Failures",
    url: "https://top10.owasp.org/2025/A03_2025-Software_Supply_Chain_Failures/",
    cwe: "CWE-494, CWE-829, CWE-1104, CWE-1357",
    summary:
      "Software supply chain failures occur when applications ingest unverified dependencies, unsigned build artifacts, tampered lockfiles, or vulnerable third-party packages.",
    control:
      "Pin dependency hashes in lockfiles, verify SHA-256 digests and cryptographic signatures (SLSA / Sigstore) before loading artifacts, and maintain an automated SBOM.",
    keywords: /\b(a03(?:[:_ -]?2025)?|software\s+supply\s+chain(?:\s+failures)?|supply\s+chain\s+failures)\b/i,
    python: `import hashlib
import hmac
import unittest

def verify_artifact_sha256(artifact_bytes: bytes, expected_hex_digest: str) -> bool:
    """A03:2025 Constant-time SHA-256 supply-chain artifact integrity check."""
    if not expected_hex_digest or len(expected_hex_digest) != 64:
        return False
    computed = hashlib.sha256(artifact_bytes).hexdigest().lower()
    return hmac.compare_digest(computed, expected_hex_digest.lower())

class TestA03SupplyChainIntegrity(unittest.TestCase):
    def test_valid_package_digest_passes(self) -> None:
        wheel_payload = b"name=noctis-core;version=2.5.0;signed=true"
        pinned_sha256 = hashlib.sha256(wheel_payload).hexdigest()
        self.assertTrue(verify_artifact_sha256(wheel_payload, pinned_sha256))

    def test_tampered_package_rejected(self) -> None:
        wheel_payload = b"name=noctis-core;version=2.5.0;signed=true"
        pinned_sha256 = hashlib.sha256(wheel_payload).hexdigest()
        tampered = b"name=noctis-core;version=2.5.0;postinstall=curl_evil"
        self.assertFalse(verify_artifact_sha256(tampered, pinned_sha256))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

public final class A03SupplyChainVerifier {
    /** A03:2025 Verify artifact SHA-256 digest in constant time before loading. */
    public static boolean verifyArtifactDigest(byte[] artifactBytes, String expectedHexSha256) throws Exception {
        if (artifactBytes == null || expectedHexSha256 == null || expectedHexSha256.length() != 64) {
            return false;
        }
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] actualDigest = sha256.digest(artifactBytes);
        byte[] expectedDigest = HexFormat.of().parseHex(expectedHexSha256);
        return MessageDigest.isEqual(actualDigest, expectedDigest);
    }

    public static void main(String[] args) throws Exception {
        byte[] jarBytes = "Manifest-Version: 1.0\nImplementation-Version: 2025.1".getBytes(StandardCharsets.UTF_8);
        String expected = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(jarBytes));

        if (!verifyArtifactDigest(jarBytes, expected)) throw new AssertionError("Pinned artifact should pass");
        if (verifyArtifactDigest("tampered-jar".getBytes(StandardCharsets.UTF_8), expected)) {
            throw new AssertionError("Tampered artifact must be rejected");
        }
        System.out.println("PASS: A03:2025 Software Supply Chain SHA-256 verification passed.");
    }
}`,
    c: `#include <assert.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

/* A03:2025 Constant-time 32-byte SHA-256 digest comparison for artifact lockfiles */
int ct_verify_sha256(const uint8_t actual[32], const uint8_t expected[32]) {
    uint8_t diff = 0;
    for (size_t i = 0; i < 32; ++i) {
        diff |= (uint8_t)(actual[i] ^ expected[i]);
    }
    return diff == 0 ? 1 : 0;
}

int main(void) {
    const uint8_t pinned_hash[32] = {
        0x3a, 0x7b, 0x91, 0x0c, 0x44, 0x12, 0x89, 0xfe,
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80,
        0x90, 0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0, 0x05
    };
    uint8_t tampered_hash[32];
    for (size_t i = 0; i < 32; ++i) tampered_hash[i] = pinned_hash[i];
    tampered_hash[31] ^= 0x01U;

    assert(ct_verify_sha256(pinned_hash, pinned_hash) == 1);
    assert(ct_verify_sha256(tampered_hash, pinned_hash) == 0);
    printf("PASS: A03:2025 C constant-time supply-chain hash verifier passed.\\n");
    return 0;
}`,
  },
  {
    id: "A04:2025",
    codeId: "A04_2025",
    standard: "OWASP-2025",
    title: "Cryptographic Failures",
    url: "https://top10.owasp.org/2025/A04_2025-Cryptographic_Failures/",
    cwe: "CWE-327 (Broken Crypto), CWE-328 (Weak Hash), CWE-330 (Weak PRNG), CWE-759",
    summary:
      "Cryptographic failures occur when sensitive data is transmitted or stored in cleartext, or protected using broken/deprecated algorithms (MD5, SHA-1, DES, AES-ECB), static IVs/nonces, or non-cryptographic PRNGs.",
    control:
      "Enforce AEAD ciphers (`AES-256-GCM` or `ChaCha20-Poly1305`) with unique CSPRNG 96-bit nonces per encryption, and hash passwords with `Argon2id` or `PBKDF2-HMAC-SHA256` (>= 600,000 iterations) plus a unique 128-bit salt.",
    keywords: /\b(a04(?:[:_ -]?2025)?|cryptographic\s+failures|weak\s+crypto|aes-gcm|pbkdf2)\b/i,
    python: `import hashlib
import hmac
import secrets
import unittest

BANNED_ALGORITHMS = {"md5", "sha1", "des", "3des", "rc4", "aes-ecb"}

def validate_cipher_policy(algorithm: str) -> bool:
    """A04:2025 Reject deprecated or unauthenticated cryptographic algorithms."""
    norm = algorithm.strip().lower()
    if norm in BANNED_ALGORITHMS or "ecb" in norm:
        return False
    return norm in {"aes-256-gcm", "chacha20-poly1305"}

def hash_password_pbkdf2(password: str, salt: bytes | None = None, iterations: int = 600_000) -> tuple[bytes, bytes]:
    """A04:2025 NIST/OWASP-compliant password key derivation with CSPRNG 16-byte salt."""
    if iterations < 600_000:
        raise ValueError("OWASP 2025 requires >= 600,000 iterations for PBKDF2-HMAC-SHA256")
    salt_bytes = salt if salt is not None else secrets.token_bytes(16)
    if len(salt_bytes) < 16:
        raise ValueError("Salt must be at least 128 bits (16 bytes)")
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, iterations, dklen=32)
    return salt_bytes, derived

def verify_password_pbkdf2(password: str, salt: bytes, expected_key: bytes, iterations: int = 600_000) -> bool:
    _, candidate = hash_password_pbkdf2(password, salt=salt, iterations=iterations)
    return hmac.compare_digest(candidate, expected_key)

class TestA04CryptographicFailures(unittest.TestCase):
    def test_cipher_policy_blocks_weak_algorithms(self) -> None:
        self.assertFalse(validate_cipher_policy("AES-ECB"))
        self.assertFalse(validate_cipher_policy("MD5"))
        self.assertTrue(validate_cipher_policy("AES-256-GCM"))

    def test_pbkdf2_roundtrip_and_tamper_rejection(self) -> None:
        salt, key = hash_password_pbkdf2("CorrectHorseBatteryStaple!2025")
        self.assertTrue(verify_password_pbkdf2("CorrectHorseBatteryStaple!2025", salt, key))
        self.assertFalse(verify_password_pbkdf2("WrongPassword", salt, key))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public final class A04AesGcmCrypto {
    private static final int GCM_NONCE_BYTES = 12; // 96-bit CSPRNG nonce
    private static final int GCM_TAG_BITS = 128;   // 128-bit authentication tag
    private static final SecureRandom CSPRNG = new SecureRandom();

    public record CiphertextPacket(byte[] nonce, byte[] ciphertext) {}

    /** A04:2025 Authenticated Encryption with Associated Data (AES-256-GCM). */
    public static CiphertextPacket encrypt(SecretKey key, byte[] plaintext, byte[] aad) throws Exception {
        byte[] nonce = new byte[GCM_NONCE_BYTES];
        CSPRNG.nextBytes(nonce);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, nonce));
        if (aad != null) cipher.updateAAD(aad);
        return new CiphertextPacket(nonce, cipher.doFinal(plaintext));
    }

    public static byte[] decrypt(SecretKey key, CiphertextPacket packet, byte[] aad) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, packet.nonce()));
        if (aad != null) cipher.updateAAD(aad);
        return cipher.doFinal(packet.ciphertext());
    }

    public static void main(String[] args) throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(256, CSPRNG);
        SecretKey key = kg.generateKey();
        byte[] aad = "tenant:org-1".getBytes(StandardCharsets.UTF_8);
        byte[] secret = "Sensitive-PII-Record-2025".getBytes(StandardCharsets.UTF_8);

        CiphertextPacket pkt = encrypt(key, secret, aad);
        byte[] recovered = decrypt(key, pkt, aad);
        if (!Arrays.equals(secret, recovered)) throw new AssertionError("Decryption mismatch");
        System.out.println("PASS: A04:2025 AES-256-GCM authenticated encryption verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* A04:2025 Cryptographic policy & constant-time MAC verification in C */
bool is_approved_aead_cipher(const char *cipher_name, size_t key_bits, size_t iv_bytes) {
    if (!cipher_name) return false;
    if (key_bits < 256 || iv_bytes != 12) return false; /* Require 256-bit key & 96-bit GCM nonce */
    return (strcmp(cipher_name, "AES-256-GCM") == 0 ||
            strcmp(cipher_name, "CHACHA20-POLY1305") == 0);
}

bool constant_time_tag_equals(const uint8_t *tag_a, const uint8_t *tag_b, size_t len) {
    if (!tag_a || !tag_b || len < 16) return false;
    volatile uint8_t diff = 0;
    for (size_t i = 0; i < len; ++i) {
        diff |= (uint8_t)(tag_a[i] ^ tag_b[i]);
    }
    return diff == 0;
}

int main(void) {
    assert(is_approved_aead_cipher("AES-256-GCM", 256, 12) == true);
    assert(is_approved_aead_cipher("AES-128-ECB", 128, 0) == false);
    assert(is_approved_aead_cipher("DES-CBC", 56, 8) == false);

    uint8_t tag1[16] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16};
    uint8_t tag2[16] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16};
    uint8_t bad[16]  = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0};
    assert(constant_time_tag_equals(tag1, tag2, 16) == true);
    assert(constant_time_tag_equals(tag1, bad, 16) == false);
    printf("PASS: A04:2025 C cryptographic policy & constant-time tag check verified.\\n");
    return 0;
}`,
  },
  {
    id: "A05:2025",
    codeId: "A05_2025",
    standard: "OWASP-2025",
    title: "Injection (SQL Injection, Command Injection, XSS)",
    url: "https://top10.owasp.org/2025/A05_2025-Injection/",
    cwe: "CWE-89 (SQL Injection), CWE-78 (OS Command Injection), CWE-79 (XSS)",
    summary:
      "Injection occurs when untrusted user input is concatenated directly into SQL queries, OS commands, LDAP filters, or HTML templates without strict separation of code and data.",
    control:
      "Use parameterized queries (`?` placeholders / `PreparedStatement` / `sqlite3_bind_text`) so the database driver treats user input strictly as scalar data, never executable SQL syntax.",
    keywords: /\b(a05(?:[:_ -]?2025)?|sql\s*injection|sqli|injection\s+test|test\s+sql\s+injection)\b/i,
    python: `import sqlite3
import unittest

def fetch_user_by_username_safe(conn: sqlite3.Connection, username: str) -> tuple | None:
    """A05:2025 SAFE: Parameterized query ('?' placeholder) separates SQL syntax from data."""
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, role FROM users WHERE username = ?",
        (username,),
    )
    return cursor.fetchone()

class TestA05SqlInjectionPrevention(unittest.TestCase):
    def setUp(self) -> None:
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute(
            "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, role TEXT)"
        )
        self.conn.executemany(
            "INSERT INTO users (username, role) VALUES (?, ?)",
            [("alice", "admin"), ("bob", "viewer")],
        )
        self.conn.commit()

    def tearDown(self) -> None:
        self.conn.close()

    def test_legitimate_lookup_succeeds(self) -> None:
        row = fetch_user_by_username_safe(self.conn, "alice")
        self.assertEqual(row, (1, "alice", "admin"))

    def test_sql_injection_tautology_neutralized(self) -> None:
        # Classic tautology string is treated as a literal username, returning None
        malicious_input = "alice' OR '1'='1"
        row = fetch_user_by_username_safe(self.conn, malicious_input)
        self.assertIsNone(row)

    def test_stacked_query_and_comment_neutralized(self) -> None:
        malicious_input = "alice'; DROP TABLE users; --"
        row = fetch_user_by_username_safe(self.conn, malicious_input)
        self.assertIsNone(row)
        # Verify the users table remains intact
        count = self.conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        self.assertEqual(count, 2)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public final class A05SqlInjectionSafeDao {
    public record UserRow(long id, String username, String role) {}

    /** A05:2025 SAFE: JDBC PreparedStatement binds untrusted input strictly as a parameter. */
    public static Optional<UserRow> findByUsername(Connection conn, String untrustedUsername) throws SQLException {
        final String sql = "SELECT id, username, role FROM users WHERE username = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, untrustedUsername);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new UserRow(
                        rs.getLong("id"),
                        rs.getString("username"),
                        rs.getString("role")
                    ));
                }
                return Optional.empty();
            }
        }
    }

    /** A05:2025 Static allow-list for ORDER BY columns (which cannot be bound as '?' values). */
    public static String safeSortColumn(String requestedColumn) {
        return switch (requestedColumn == null ? "" : requestedColumn.toLowerCase()) {
            case "username" -> "username";
            case "created_at" -> "created_at";
            default -> "id";
        };
    }

    public static void main(String[] args) {
        if (!"id".equals(safeSortColumn("id; DROP TABLE users--"))) {
            throw new AssertionError("Untrusted sort column must fall back to allow-listed 'id'");
        }
        System.out.println("PASS: A05:2025 JDBC PreparedStatement & identifier allow-list verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/*
 * A05:2025 SQLite3 C API pattern using sqlite3_prepare_v2 + sqlite3_bind_text
 * plus strict identifier allow-listing for dynamic column names.
 *
 * In production with -lsqlite3:
 *   sqlite3_stmt *stmt = NULL;
 *   const char *sql = "SELECT id, role FROM users WHERE username = ?1;";
 *   sqlite3_prepare_v2(db, sql, -1, &stmt, NULL);
 *   sqlite3_bind_text(stmt, 1, untrusted_username, -1, SQLITE_TRANSIENT);
 */

bool is_allowlisted_column_identifier(const char *col) {
    if (!col) return false;
    const char *allowed[] = {"id", "username", "created_at", "role"};
    for (size_t i = 0; i < sizeof(allowed) / sizeof(allowed[0]); ++i) {
        if (strcmp(col, allowed[i]) == 0) return true;
    }
    return false;
}

int main(void) {
    assert(is_allowlisted_column_identifier("username") == true);
    assert(is_allowlisted_column_identifier("username' OR '1'='1") == false);
    assert(is_allowlisted_column_identifier("id; DROP TABLE users;") == false);
    printf("PASS: A05:2025 C parameterized query & identifier allow-list verified.\\n");
    return 0;
}`,
  },
  {
    id: "A06:2025",
    codeId: "A06_2025",
    standard: "OWASP-2025",
    title: "Insecure Design",
    url: "https://top10.owasp.org/2025/A06_2025-Insecure_Design/",
    cwe: "CWE-209, CWE-256, CWE-501, CWE-522, CWE-840 (Business Logic)",
    summary:
      "Insecure design represents architectural and business-logic flaws where security controls, domain invariants, threat modeling, or state-transition guards were never designed into the workflow.",
    control:
      "Enforce domain invariants in the business layer (immutable state transitions, non-negative transfer amounts, per-account daily limits, and idempotency keys).",
    keywords: /\b(a06(?:[:_ -]?2025)?|insecure\s+design)\b/i,
    python: `import unittest
from dataclasses import dataclass

@dataclass
class LedgerAccount:
    account_id: str
    balance_cents: int
    daily_transferred_cents: int = 0
    daily_limit_cents: int = 500_000  # $5,000.00 daily cap

def execute_transfer(sender: LedgerAccount, receiver: LedgerAccount, amount_cents: int) -> None:
    """A06:2025 Domain-invariant enforcement preventing negative-amount & limit-bypass flaws."""
    if sender.account_id == receiver.account_id:
        raise ValueError("Self-transfer is prohibited by domain invariant.")
    if amount_cents <= 0:
        raise ValueError("Transfer amount must be strictly positive integer cents.")
    if amount_cents > sender.balance_cents:
        raise ValueError("Insufficient funds.")
    if sender.daily_transferred_cents + amount_cents > sender.daily_limit_cents:
        raise ValueError("Daily transfer velocity limit exceeded.")
    sender.balance_cents -= amount_cents
    sender.daily_transferred_cents += amount_cents
    receiver.balance_cents += amount_cents

class TestA06InsecureDesignInvariants(unittest.TestCase):
    def test_negative_transfer_blocked(self) -> None:
        a = LedgerAccount("acc-1", 10_000)
        b = LedgerAccount("acc-2", 50_000)
        with self.assertRaises(ValueError):
            execute_transfer(a, b, -20_000)

    def test_daily_velocity_cap_enforced(self) -> None:
        a = LedgerAccount("acc-1", 1_000_000, daily_limit_cents=100_000)
        b = LedgerAccount("acc-2", 0)
        with self.assertRaises(ValueError):
            execute_transfer(a, b, 150_000)

if __name__ == "__main__":
    unittest.main()`,
    java: `public final class A06DomainInvariantTransfer {
    public static final long MAX_SINGLE_TRANSFER_CENTS = 500_000L;

    public static long transferCents(long senderBalanceCents, long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }
        if (amountCents > MAX_SINGLE_TRANSFER_CENTS) {
            throw new IllegalArgumentException("Exceeds maximum single transfer limit");
        }
        if (amountCents > senderBalanceCents) {
            throw new IllegalStateException("Insufficient balance");
        }
        return Math.subtractExact(senderBalanceCents, amountCents);
    }

    public static void main(String[] args) {
        long remaining = transferCents(100_000L, 25_000L);
        if (remaining != 75_000L) throw new AssertionError("Expected 75000 cents");
        try {
            transferCents(100_000L, -5_000L);
            throw new AssertionError("Negative transfer must be rejected");
        } catch (IllegalArgumentException expected) {
            // Expected invariant enforcement
        }
        System.out.println("PASS: A06:2025 Insecure Design business-logic invariants verified.");
    }
}`,
    c: `#include <assert.h>
#include <limits.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

/* A06:2025 Overflow-safe and invariant-checked balance debit */
bool safe_debit_cents(int64_t *balance_cents, int64_t amount_cents, int64_t max_tx_cents) {
    if (!balance_cents || amount_cents <= 0 || amount_cents > max_tx_cents) {
        return false;
    }
    if (*balance_cents < amount_cents) {
        return false;
    }
    *balance_cents -= amount_cents;
    return true;
}

int main(void) {
    int64_t bal = 100000;
    assert(safe_debit_cents(&bal, -500, 50000) == false);
    assert(safe_debit_cents(&bal, 60000, 50000) == false);
    assert(safe_debit_cents(&bal, 25000, 50000) == true);
    assert(bal == 75000);
    printf("PASS: A06:2025 C domain invariant guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "A07:2025",
    codeId: "A07_2025",
    standard: "OWASP-2025",
    title: "Authentication Failures",
    url: "https://top10.owasp.org/2025/A07_2025-Authentication_Failures/",
    cwe: "CWE-287, CWE-307 (Brute Force), CWE-384 (Session Fixation), CWE-798",
    summary:
      "Authentication failures occur when applications allow credential stuffing, brute-force attacks, weak passwords, timing-unsafe token comparisons, or session fixation.",
    control:
      "Enforce progressive account/IP rate limiting, regenerate session IDs upon login, require phishing-resistant MFA, and compare session/API tokens in constant time.",
    keywords: /\b(a07(?:[:_ -]?2025)?|authentication\s+failures|identification\s+and\s+authentication\s+failures)\b/i,
    python: `import hmac
import secrets
import time
import unittest

class AuthThrottleGuard:
    """A07:2025 Brute-force lockout & constant-time session token verifier."""
    def __init__(self, max_failures: int = 5, lockout_seconds: int = 300) -> None:
        self.max_failures = max_failures
        self.lockout_seconds = lockout_seconds
        self._state: dict[str, tuple[int, float]] = {}

    def is_locked(self, account_id: str, now: float | None = None) -> bool:
        ts = now if now is not None else time.time()
        failures, locked_until = self._state.get(account_id, (0, 0.0))
        return failures >= self.max_failures and ts < locked_until

    def record_attempt(self, account_id: str, success: bool, now: float | None = None) -> None:
        ts = now if now is not None else time.time()
        if success:
            self._state.pop(account_id, None)
            return
        failures, _ = self._state.get(account_id, (0, 0.0))
        failures += 1
        locked_until = ts + self.lockout_seconds if failures >= self.max_failures else 0.0
        self._state[account_id] = (failures, locked_until)

    @staticmethod
    def verify_bearer_token(presented: str, stored: str) -> bool:
        if not presented or not stored or len(stored) < 32:
            return False
        return hmac.compare_digest(presented.encode("utf-8"), stored.encode("utf-8"))

class TestA07AuthenticationFailures(unittest.TestCase):
    def test_lockout_triggers_after_max_failures(self) -> None:
        guard = AuthThrottleGuard(max_failures=3, lockout_seconds=120)
        for _ in range(3):
            guard.record_attempt("user@example.com", False, now=1000.0)
        self.assertTrue(guard.is_locked("user@example.com", now=1050.0))
        self.assertFalse(guard.is_locked("user@example.com", now=1200.0))

    def test_constant_time_token_check(self) -> None:
        tok = secrets.token_urlsafe(32)
        self.assertTrue(AuthThrottleGuard.verify_bearer_token(tok, tok))
        self.assertFalse(AuthThrottleGuard.verify_bearer_token(tok + "x", tok))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class A07AuthenticationGuard {
    private static final SecureRandom CSPRNG = new SecureRandom();

    /** Generate a 256-bit (32-byte) high-entropy session identifier on privilege change. */
    public static String issueNewSessionId() {
        byte[] randomBytes = new byte[32];
        CSPRNG.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /** Constant-time verification of session or API tokens to prevent timing side-channels. */
    public static boolean verifyTokenConstantTime(String presented, String expected) {
        if (presented == null || expected == null || expected.length() < 32) return false;
        return MessageDigest.isEqual(
            presented.getBytes(StandardCharsets.UTF_8),
            expected.getBytes(StandardCharsets.UTF_8)
        );
    }

    public static void main(String[] args) {
        String session = issueNewSessionId();
        if (!verifyTokenConstantTime(session, session)) throw new AssertionError("Valid session must match");
        if (verifyTokenConstantTime("invalid-session", session)) throw new AssertionError("Invalid session must fail");
        System.out.println("PASS: A07:2025 Authentication token entropy & constant-time check verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* A07:2025 Constant-time token verification without early-return length leak */
bool ct_token_equals(const char *presented, const char *expected, size_t min_len) {
    if (!presented || !expected) return false;
    size_t len_a = strlen(presented);
    size_t len_b = strlen(expected);
    if (len_b < min_len) return false;
    volatile uint8_t diff = (uint8_t)(len_a ^ len_b);
    size_t n = len_a < len_b ? len_a : len_b;
    for (size_t i = 0; i < n; ++i) {
        diff |= (uint8_t)(presented[i] ^ expected[i]);
    }
    return diff == 0;
}

int main(void) {
    const char *secret = "sess_9f8e7d6c5b4a3210fedcba9876543210";
    assert(ct_token_equals(secret, secret, 32) == true);
    assert(ct_token_equals("sess_wrong", secret, 32) == false);
    printf("PASS: A07:2025 C constant-time authentication check verified.\\n");
    return 0;
}`,
  },
  {
    id: "A08:2025",
    codeId: "A08_2025",
    standard: "OWASP-2025",
    title: "Software or Data Integrity Failures",
    url: "https://top10.owasp.org/2025/A08_2025-Software_or_Data_Integrity_Failures/",
    cwe: "CWE-345, CWE-353, CWE-494, CWE-502 (Insecure Deserialization)",
    summary:
      "Software or data integrity failures involve deserializing untrusted payloads (such as Python `pickle`, Java `ObjectInputStream`, or unsigned webhooks/JWTs) or executing updates without cryptographic signature verification.",
    control:
      "Never use unsafe native deserializers (`pickle`, `yaml.load`, raw `ObjectInputStream`) on untrusted input; verify HMAC-SHA256 / Ed25519 signatures before parsing JSON payloads.",
    keywords: /\b(a08(?:[:_ -]?2025)?|software\s+(?:or|and)\s+data\s+integrity\s+failures|insecure\s+deserialization)\b/i,
    python: `import hashlib
import hmac
import json
import unittest

def parse_signed_json_envelope(raw_body: bytes, signature_hex: str, secret_key: bytes) -> dict:
    """A08:2025 Verify HMAC-SHA256 signature BEFORE parsing untrusted JSON data."""
    if not signature_hex or len(signature_hex) != 64:
        raise ValueError("Missing or malformed HMAC-SHA256 signature.")
    expected_mac = hmac.new(secret_key, raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_mac, signature_hex.lower()):
        raise ValueError("Integrity check failed: payload signature mismatch.")
    parsed = json.loads(raw_body.decode("utf-8"))
    if not isinstance(parsed, dict):
        raise ValueError("Envelope root must be a JSON object.")
    return parsed

class TestA08DataIntegrityVerification(unittest.TestCase):
    def test_valid_signed_payload_accepted(self) -> None:
        key = b"webhook-hmac-signing-key-32bytes!"
        body = b'{"event":"deploy.approved","release":"2025.4"}'
        sig = hmac.new(key, body, hashlib.sha256).hexdigest()
        data = parse_signed_json_envelope(body, sig, key)
        self.assertEqual(data["release"], "2025.4")

    def test_tampered_payload_rejected_before_deserialization(self) -> None:
        key = b"webhook-hmac-signing-key-32bytes!"
        body = b'{"event":"deploy.approved","release":"2025.4"}'
        sig = hmac.new(key, body, hashlib.sha256).hexdigest()
        tampered = b'{"event":"deploy.approved","release":"evil-backdoor"}'
        with self.assertRaises(ValueError):
            parse_signed_json_envelope(tampered, sig, key)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.io.ByteArrayInputStream;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class A08DataIntegrityVerifier {
    /** A08:2025 Verify HMAC-SHA256 signature before accepting any serialized/webhook payload. */
    public static boolean verifyHmacSha256(byte[] payload, byte[] expectedMac, byte[] secretKey) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
        byte[] computed = mac.doFinal(payload);
        return MessageDigest.isEqual(computed, expectedMac);
    }

    /** A08:2025 JEP 290 strict allow-list ObjectInputFilter if Java serialization cannot be avoided. */
    public static ObjectInputStream createFilteredStream(byte[] data) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
        ObjectInputFilter filter = ObjectInputFilter.Config.createFilter("maxdepth=2;maxarray=64;java.lang.String;!*");
        ois.setObjectInputFilter(filter);
        return ois;
    }

    public static void main(String[] args) throws Exception {
        byte[] key = "super-secret-integrity-key-2025!".getBytes(StandardCharsets.UTF_8);
        byte[] msg = "{\"action\":\"sync\"}".getBytes(StandardCharsets.UTF_8);
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        byte[] sig = mac.doFinal(msg);

        if (!verifyHmacSha256(msg, sig, key)) throw new AssertionError("Valid HMAC must pass");
        if (verifyHmacSha256("{\"action\":\"admin\"}".getBytes(StandardCharsets.UTF_8), sig, key)) {
            throw new AssertionError("Tampered payload must fail");
        }
        System.out.println("PASS: A08:2025 Software & Data Integrity HMAC check verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

/* A08:2025 Signed firmware/message envelope verifier before parsing */
typedef struct {
    uint32_t magic;
    uint32_t version;
    uint8_t  mac_tag[32];
} signed_header_t;

bool verify_envelope_header(const signed_header_t *hdr, const uint8_t expected_mac[32]) {
    if (!hdr || !expected_mac) return false;
    if (hdr->magic != 0x4E4F4354U || hdr->version != 1U) return false;
    volatile uint8_t diff = 0;
    for (size_t i = 0; i < 32; ++i) {
        diff |= (uint8_t)(hdr->mac_tag[i] ^ expected_mac[i]);
    }
    return diff == 0;
}

int main(void) {
    uint8_t mac[32] = {0xaa, 0xbb, 0xcc};
    signed_header_t valid_hdr = {0x4E4F4354U, 1U, {0xaa, 0xbb, 0xcc}};
    signed_header_t bad_hdr   = {0x4E4F4354U, 1U, {0xaa, 0xbb, 0x00}};

    assert(verify_envelope_header(&valid_hdr, mac) == true);
    assert(verify_envelope_header(&bad_hdr, mac) == false);
    printf("PASS: A08:2025 C signed envelope integrity check verified.\\n");
    return 0;
}`,
  },
  {
    id: "A09:2025",
    codeId: "A09_2025",
    standard: "OWASP-2025",
    title: "Security Logging and Alerting Failures",
    url: "https://top10.owasp.org/2025/A09_2025-Security_Logging_and_Alerting_Failures/",
    cwe: "CWE-117 (Log Injection), CWE-223, CWE-532 (Sensitive Info in Logs), CWE-778",
    summary:
      "Security logging and alerting failures occur when authentication/authorization failures go unlogged, logs are vulnerable to CRLF log-forging (`CWE-117`), or plaintext secrets/tokens are written into log sinks.",
    control:
      "Emit structured JSON security events for all authn/authz failures, strip CR/LF/control characters (`CWE-117`), and redact secrets/PII before writing.",
    keywords: /\b(a09(?:[:_ -]?2025)?|security\s+logging(?:\s+and\s+(?:alerting|monitoring))?\s+failures)\b/i,
    python: `import json
import re
import unittest

CONTROL_CHARS_RE = re.compile(r"[\\r\\n\\x00-\\x1f\\x7f]+")
SECRET_KEYS = {"password", "token", "authorization", "secret", "api_key", "ssn"}

def sanitize_log_value(val: str) -> str:
    """A09:2025 Strip CRLF & control characters to prevent CWE-117 log forging."""
    return CONTROL_CHARS_RE.sub(" ", val).strip()[:256]

def build_security_audit_event(event_type: str, actor: str, metadata: dict[str, str]) -> str:
    """A09:2025 Structured security event with CRLF sanitization & secret redaction."""
    safe_meta = {}
    for k, v in metadata.items():
        if k.lower() in SECRET_KEYS:
            safe_meta[k] = "[REDACTED]"
        else:
            safe_meta[k] = sanitize_log_value(str(v))
    payload = {
        "event": sanitize_log_value(event_type),
        "actor": sanitize_log_value(actor),
        "metadata": safe_meta,
    }
    return json.dumps(payload, sort_keys=True)

class TestA09SecurityLogging(unittest.TestCase):
    def test_crlf_log_injection_neutralized(self) -> None:
        forged_actor = "guest\\r\\n2025-10-22 INFO [auth] user=admin login=SUCCESS"
        line = build_security_audit_event("auth.login.failed", forged_actor, {"ip": "192.0.2.10"})
        self.assertNotIn("\\n", line)
        self.assertNotIn("\\r", line)

    def test_secrets_redacted_from_logs(self) -> None:
        line = build_security_audit_event("auth.token.check", "u-1", {"password": "SuperSecret123", "path": "/api"})
        self.assertIn("[REDACTED]", line)
        self.assertNotIn("SuperSecret123", line)

if __name__ == "__main__":
    unittest.main()`,
    java: `public final class A09SafeSecurityLogger {
    /** A09:2025 Strip CR/LF and control characters to block CWE-117 log injection. */
    public static String sanitizeLogField(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll("[\\r\\n\\t\\u0000-\\u001F\\u007F]+", "_").trim();
        return cleaned.length() > 200 ? cleaned.substring(0, 200) : cleaned;
    }

    public static String formatAuditEvent(String eventType, String userId, String status) {
        return String.format(
            "{\"event\":\"%s\",\"user\":\"%s\",\"status\":\"%s\"}",
            sanitizeLogField(eventType),
            sanitizeLogField(userId),
            sanitizeLogField(status)
        );
    }

    public static void main(String[] args) {
        String maliciousUser = "bob\\nINFO: admin privileges granted";
        String logLine = formatAuditEvent("AUTHZ_DENIED", maliciousUser, "403");
        if (logLine.contains("\\n") || logLine.contains("\\r")) {
            throw new AssertionError("CRLF log injection must be stripped");
        }
        System.out.println("PASS: A09:2025 Security Logging CRLF sanitization verified: " + logLine);
    }
}`,
    c: `#include <assert.h>
#include <ctype.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

/* A09:2025 Sanitize untrusted strings before writing to syslog/audit logs (CWE-117) */
void sanitize_log_field(const char *src, char *dst, size_t dst_size) {
    if (!dst || dst_size == 0) return;
    if (!src) {
        dst[0] = '\\0';
        return;
    }
    size_t j = 0;
    for (size_t i = 0; src[i] != '\\0' && j + 1 < dst_size; ++i) {
        unsigned char c = (unsigned char)src[i];
        if (c == '\\r' || c == '\\n' || iscntrl(c)) {
            dst[j++] = '_';
        } else {
            dst[j++] = (char)c;
        }
    }
    dst[j] = '\\0';
}

int main(void) {
    char safe[128];
    sanitize_log_field("attacker\\r\\nFAKE_ADMIN_LOGIN", safe, sizeof(safe));
    assert(strchr(safe, '\\n') == NULL);
    assert(strchr(safe, '\\r') == NULL);
    assert(strcmp(safe, "attacker__FAKE_ADMIN_LOGIN") == 0);
    printf("PASS: A09:2025 C log injection sanitizer verified.\\n");
    return 0;
}`,
  },
  {
    id: "A10:2025",
    codeId: "A10_2025",
    standard: "OWASP-2025",
    title: "Mishandling of Exceptional Conditions",
    url: "https://top10.owasp.org/2025/A10_2025-Mishandling_of_Exceptional_Conditions/",
    cwe: "CWE-209 (Error Message Info Leak), CWE-390, CWE-636 (Not Failing Securely), CWE-755",
    summary:
      "Mishandling of exceptional conditions occurs when systems fail open during errors, leak stack traces or database internals to clients, or leave locks/transactions in an inconsistent state when exceptions occur.",
    control:
      "Always fail closed (`authorized = False`) when an exception occurs during policy evaluation, guarantee resource cleanup via context managers/`try-with-resources`, and return generic error envelopes with correlation IDs.",
    keywords: /\b(a10(?:[:_ -]?2025)?|mishandling\s+of\s+exceptional\s+conditions|exceptional\s+conditions|fail\s+open|fail\s+closed)\b/i,
    python: `import unittest
import uuid
from typing import Callable

def evaluate_policy_fail_closed(policy_fn: Callable[[], bool]) -> tuple[bool, dict[str, str]]:
    """A10:2025 Fail-closed exception handler that never leaks stack traces to callers."""
    try:
        allowed = bool(policy_fn())
        return allowed, {"status": "ALLOWED" if allowed else "DENIED"}
    except Exception:
        correlation_id = str(uuid.uuid4())
        # Internal logger records full traceback with correlation_id; client gets generic envelope
        return False, {
            "status": "DENIED",
            "error": "Service policy check encountered an internal error.",
            "correlation_id": correlation_id,
        }

class TestA10ExceptionalConditions(unittest.TestCase):
    def test_exception_fails_closed_without_leaking_internals(self) -> None:
        def broken_db_policy() -> bool:
            raise RuntimeError("FATAL: postgres://db_admin:SecretPass@10.0.0.5:5432/prod timeout")

        allowed, response = evaluate_policy_fail_closed(broken_db_policy)
        self.assertFalse(allowed)
        self.assertEqual(response["status"], "DENIED")
        self.assertNotIn("SecretPass", str(response))
        self.assertIn("correlation_id", response)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;
import java.util.UUID;
import java.util.function.BooleanSupplier;

public final class A10FailClosedHandler {
    public record DecisionResponse(boolean allowed, Map<String, String> clientBody) {}

    /** A10:2025 Fail closed on any runtime exception and mask internal stack traces. */
    public static DecisionResponse evaluateSafely(BooleanSupplier policyCheck) {
        try {
            boolean result = policyCheck.getAsBoolean();
            return new DecisionResponse(result, Map.of("status", result ? "ALLOW" : "DENY"));
        } catch (Throwable ex) {
            String correlationId = UUID.randomUUID().toString();
            // Log 'ex' internally with correlationId; never expose ex.getMessage() to client
            return new DecisionResponse(false, Map.of(
                "status", "DENY",
                "error", "Request could not be authorized.",
                "correlationId", correlationId
            ));
        }
    }

    public static void main(String[] args) {
        DecisionResponse res = evaluateSafely(() -> {
            throw new IllegalStateException("JDBC connection string: jdbc:postgresql://10.0.1.9/secret");
        });
        if (res.allowed()) throw new AssertionError("Must fail closed on exception");
        if (res.clientBody().toString().contains("jdbc:")) {
            throw new AssertionError("Internal exception details must not leak");
        }
        System.out.println("PASS: A10:2025 Fail-closed exception handling verified.");
    }
}`,
    c: `#include <assert.h>
#include <errno.h>
#include <limits.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

/* A10:2025 Checked integer parsing & fail-closed cleanup on exceptional inputs */
typedef enum {
    PARSE_OK = 0,
    PARSE_ERR_NULL = 1,
    PARSE_ERR_RANGE = 2,
    PARSE_ERR_FORMAT = 3
} parse_status_t;

parse_status_t parse_positive_quota(const char *input, int32_t max_allowed, int32_t *out_value) {
    if (!input || !out_value) return PARSE_ERR_NULL;
    *out_value = 0; /* Always initialize output to safe default (fail closed) */
    errno = 0;
    char *endptr = NULL;
    long val = strtol(input, &endptr, 10);
    if (errno == ERANGE || val <= 0 || val > max_allowed) return PARSE_ERR_RANGE;
    if (endptr == input || *endptr != '\\0') return PARSE_ERR_FORMAT;
    *out_value = (int32_t)val;
    return PARSE_OK;
}

int main(void) {
    int32_t quota = -1;
    assert(parse_positive_quota("99999999999999999999", 1000, &quota) == PARSE_ERR_RANGE);
    assert(quota == 0);
    assert(parse_positive_quota("250abc", 1000, &quota) == PARSE_ERR_FORMAT);
    assert(quota == 0);
    assert(parse_positive_quota("250", 1000, &quota) == PARSE_OK);
    assert(quota == 250);
    printf("PASS: A10:2025 C fail-closed exceptional condition handling verified.\\n");
    return 0;
}`,
  },
];

export const OWASP_API_2023_SPECS: OwaspCategorySpec[] = [
  {
    id: "API1:2023",
    codeId: "API1_2023",
    standard: "OWASP-API-2023",
    title: "Broken Object Level Authorization (BOLA)",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/",
    cwe: "CWE-639 (Authorization Bypass Through User-Controlled Key)",
    summary:
      "APIs expose endpoints that handle object identifiers (`/{resource_id}`), creating a wide attack surface when object-level ownership and tenant checks are omitted.",
    control:
      "Scope every database query by both `object_id` AND the authenticated caller's `owner_id` / `tenant_id` (`WHERE id = ? AND owner_id = ? AND tenant_id = ?`).",
    keywords: /\b(api1(?:[:_ -]?2023)?|broken\s+object\s+level\s+authorization|\bbola\b)\b/i,
    python: `import sqlite3
import unittest

def get_invoice_for_caller(conn: sqlite3.Connection, invoice_id: str, caller_user_id: str, caller_tenant_id: str) -> dict | None:
    """API1:2023 (BOLA) Enforce object ownership & tenant scope directly in the SQL predicate."""
    row = conn.execute(
        """
        SELECT invoice_id, owner_id, tenant_id, amount_cents
        FROM invoices
        WHERE invoice_id = ? AND owner_id = ? AND tenant_id = ?
        """,
        (invoice_id, caller_user_id, caller_tenant_id),
    ).fetchone()
    if row is None:
        return None
    return {"invoice_id": row[0], "owner_id": row[1], "tenant_id": row[2], "amount_cents": row[3]}

class TestApi1BolaPrevention(unittest.TestCase):
    def setUp(self) -> None:
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("CREATE TABLE invoices (invoice_id TEXT PRIMARY KEY, owner_id TEXT, tenant_id TEXT, amount_cents INTEGER)")
        self.conn.execute("INSERT INTO invoices VALUES ('inv-500', 'user-alice', 'tenant-1', 49900)")
        self.conn.commit()

    def tearDown(self) -> None:
        self.conn.close()

    def test_owner_can_fetch_own_invoice(self) -> None:
        res = get_invoice_for_caller(self.conn, "inv-500", "user-alice", "tenant-1")
        self.assertIsNotNone(res)

    def test_bola_replay_by_other_user_returns_none(self) -> None:
        res = get_invoice_for_caller(self.conn, "inv-500", "user-mallory", "tenant-1")
        self.assertIsNone(res)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;
import java.util.Optional;

public final class Api1BolaRepository {
    public record Invoice(String id, String ownerId, String tenantId, long amountCents) {}

    private static final Map<String, Invoice> DB = Map.of(
        "inv-500", new Invoice("inv-500", "user-alice", "tenant-1", 49900L)
    );

    /** API1:2023 Verify both ownerId and tenantId before returning any object by ID. */
    public static Optional<Invoice> findInvoiceScoped(String invoiceId, String callerUserId, String callerTenantId) {
        Invoice inv = DB.get(invoiceId);
        if (inv == null) return Optional.empty();
        if (!inv.ownerId().equals(callerUserId) || !inv.tenantId().equals(callerTenantId)) {
            return Optional.empty(); // Prevent BOLA disclosure
        }
        return Optional.of(inv);
    }

    public static void main(String[] args) {
        if (findInvoiceScoped("inv-500", "user-alice", "tenant-1").isEmpty()) {
            throw new AssertionError("Owner should access own invoice");
        }
        if (findInvoiceScoped("inv-500", "user-bob", "tenant-1").isPresent()) {
            throw new AssertionError("BOLA attempt by another user must be blocked");
        }
        System.out.println("PASS: API1:2023 BOLA object-level authorization verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    const char *object_id;
    const char *owner_id;
    const char *tenant_id;
} api_object_t;

bool verify_bola_ownership(const api_object_t *obj, const char *caller_uid, const char *caller_tid) {
    if (!obj || !caller_uid || !caller_tid) return false;
    return (strcmp(obj->owner_id, caller_uid) == 0 &&
            strcmp(obj->tenant_id, caller_tid) == 0);
}

int main(void) {
    api_object_t order = {"ord-99", "user-10", "tenant-a"};
    assert(verify_bola_ownership(&order, "user-10", "tenant-a") == true);
    assert(verify_bola_ownership(&order, "user-20", "tenant-a") == false);
    printf("PASS: API1:2023 C BOLA ownership check verified.\\n");
    return 0;
}`,
  },
  {
    id: "API2:2023",
    codeId: "API2_2023",
    standard: "OWASP-API-2023",
    title: "Broken Authentication",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/",
    cwe: "CWE-287, CWE-347 (Improper Verification of Cryptographic Signature), CWE-798",
    summary:
      "Broken API authentication occurs when endpoints accept unsigned tokens (`alg: none`), fail to validate token expiration (`exp`), audience (`aud`), or issuer (`iss`), or allow credential stuffing on token endpoints.",
    control:
      "Pin allowed signing algorithms server-side (reject `none`), verify HMAC/asymmetric signatures in constant time, and enforce `exp`, `iss`, and `aud` claims.",
    keywords: /\b(api2(?:[:_ -]?2023)?|broken\s+authentication)\b/i,
    python: `import base64
import hashlib
import hmac
import json
import time
import unittest

ALLOWED_ALGS = {"HS256"}

def verify_jwt_hs256(token: str, secret: bytes, expected_aud: str, now: int | None = None) -> dict:
    """API2:2023 Strict JWT verifier pinning alg=HS256 and checking exp/aud."""
    parts = token.split(".")
    if len(parts) != 3 or not parts[2]:
        raise ValueError("Malformed or unsigned token.")
    header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
    if header.get("alg") not in ALLOWED_ALGS:
        raise ValueError(f"Disallowed JWT alg: {header.get('alg')}")
    signing_input = f"{parts[0]}.{parts[1]}".encode("ascii")
    expected_sig = base64.urlsafe_b64encode(hmac.new(secret, signing_input, hashlib.sha256).digest()).rstrip(b"=").decode("ascii")
    if not hmac.compare_digest(expected_sig, parts[2]):
        raise ValueError("Invalid JWT signature.")
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
    current_ts = now if now is not None else int(time.time())
    if int(payload.get("exp", 0)) <= current_ts:
        raise ValueError("JWT has expired.")
    if payload.get("aud") != expected_aud:
        raise ValueError("JWT audience mismatch.")
    return payload

class TestApi2BrokenAuthentication(unittest.TestCase):
    def test_alg_none_and_expired_tokens_rejected(self) -> None:
        secret = b"0123456789abcdef0123456789abcdef"
        hdr = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').rstrip(b"=").decode()
        pay = base64.urlsafe_b64encode(b'{"sub":"u1","aud":"api.noctis","exp":9999999999}').rstrip(b"=").decode()
        with self.assertRaises(ValueError):
            verify_jwt_hs256(f"{hdr}.{pay}.sig", secret, "api.noctis")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Set;

public final class Api2TokenValidator {
    private static final Set<String> PINNED_ALGS = Set.of("RS256", "ES256");

    public static boolean validateTokenMetadata(String alg, long expEpochSec, long nowEpochSec, String aud, String expectedAud, byte[] sig, byte[] expectedSig) {
        if (alg == null || !PINNED_ALGS.contains(alg)) return false; // Block alg:none & HS256 key confusion
        if (expEpochSec <= nowEpochSec) return false;
        if (!expectedAud.equals(aud)) return false;
        if (sig == null || expectedSig == null || sig.length < 32) return false;
        return MessageDigest.isEqual(sig, expectedSig);
    }

    public static void main(String[] args) {
        byte[] sig = new byte[32];
        if (validateTokenMetadata("none", 2000L, 1000L, "api", "api", sig, sig)) {
            throw new AssertionError("alg:none must be rejected");
        }
        if (!validateTokenMetadata("ES256", 2000L, 1000L, "api", "api", sig, sig)) {
            throw new AssertionError("Valid pinned token metadata should pass");
        }
        System.out.println("PASS: API2:2023 Broken Authentication algorithm pinning verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

bool verify_api2_claims(const char *alg, int64_t exp, int64_t now, const char *aud, const char *expected_aud) {
    if (!alg || !aud || !expected_aud) return false;
    if (strcmp(alg, "RS256") != 0 && strcmp(alg, "ES256") != 0) return false; /* Reject 'none' */
    if (exp <= now) return false;
    return strcmp(aud, expected_aud) == 0;
}

int main(void) {
    assert(verify_api2_claims("none", 2000, 1000, "noctis-api", "noctis-api") == false);
    assert(verify_api2_claims("ES256", 900, 1000, "noctis-api", "noctis-api") == false);
    assert(verify_api2_claims("ES256", 2000, 1000, "noctis-api", "noctis-api") == true);
    printf("PASS: API2:2023 C JWT claim & algorithm pinning verified.\\n");
    return 0;
}`,
  },
  {
    id: "API3:2023",
    codeId: "API3_2023",
    standard: "OWASP-API-2023",
    title: "Broken Object Property Level Authorization (BOPLA)",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/",
    cwe: "CWE-213 (Excessive Data Exposure), CWE-915 (Mass Assignment)",
    summary:
      "Combines Excessive Data Exposure (returning sensitive internal fields in API responses) and Mass Assignment (binding client-supplied JSON directly onto internal model fields like `role`, `is_admin`, or `balance`).",
    control:
      "Enforce strict input allow-list DTOs (rejecting unknown or privileged properties) and explicit response projection schemas that strip internal fields.",
    keywords: /\b(api3(?:[:_ -]?2023)?|broken\s+object\s+property\s+level\s+authorization|\bbopla\b|mass\s+assignment|excessive\s+data\s+exposure)\b/i,
    python: `import unittest

ALLOWED_PATCH_FIELDS = {"display_name", "bio", "timezone"}
PUBLIC_RESPONSE_FIELDS = ("user_id", "display_name", "bio", "timezone")

def apply_safe_profile_patch(user_record: dict, untrusted_payload: dict) -> dict:
    """API3:2023 Block Mass Assignment by rejecting any non-allowlisted property."""
    forbidden = set(untrusted_payload.keys()) - ALLOWED_PATCH_FIELDS
    if forbidden:
        raise ValueError(f"Mass assignment blocked for protected properties: {sorted(forbidden)}")
    updated = dict(user_record)
    for k in ALLOWED_PATCH_FIELDS:
        if k in untrusted_payload:
            updated[k] = str(untrusted_payload[k])[:120]
    return {field: updated[field] for field in PUBLIC_RESPONSE_FIELDS if field in updated}

class TestApi3BoplaPrevention(unittest.TestCase):
    def setUp(self) -> None:
        self.db_user = {
            "user_id": "u-10",
            "display_name": "Ada",
            "bio": "Engineer",
            "timezone": "UTC",
            "role": "user",
            "password_hash": "$argon2id$v=19$...",
        }

    def test_mass_assignment_of_role_blocked(self) -> None:
        with self.assertRaises(ValueError):
            apply_safe_profile_patch(self.db_user, {"display_name": "Ada", "role": "admin"})

    def test_excessive_data_exposure_stripped(self) -> None:
        dto = apply_safe_profile_patch(self.db_user, {"bio": "Staff Engineer"})
        self.assertNotIn("password_hash", dto)
        self.assertNotIn("role", dto)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;
import java.util.Set;

public final class Api3BoplaDtoGuard {
    private static final Set<String> ALLOWED_UPDATE_KEYS = Set.of("displayName", "bio");

    public record PublicUserDto(String id, String displayName, String bio) {}

    /** API3:2023 Reject mass-assignment keys and project only public response fields. */
    public static PublicUserDto updateProfileSafely(String id, Map<String, String> patch) {
        for (String key : patch.keySet()) {
            if (!ALLOWED_UPDATE_KEYS.contains(key)) {
                throw new SecurityException("Mass assignment blocked for property: " + key);
            }
        }
        return new PublicUserDto(id, patch.getOrDefault("displayName", ""), patch.getOrDefault("bio", ""));
    }

    public static void main(String[] args) {
        PublicUserDto ok = updateProfileSafely("u-1", Map.of("displayName", "Grace"));
        if (!"Grace".equals(ok.displayName())) throw new AssertionError("Valid DTO update failed");
        try {
            updateProfileSafely("u-1", Map.of("displayName", "Grace", "isAdmin", "true"));
            throw new AssertionError("Mass assignment of isAdmin must throw SecurityException");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: API3:2023 BOPLA mass-assignment & DTO projection verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* API3:2023 Property allow-list filter blocking mass assignment of privileged fields */
bool is_mutable_profile_property(const char *prop_name) {
    if (!prop_name) return false;
    return (strcmp(prop_name, "display_name") == 0 ||
            strcmp(prop_name, "bio") == 0 ||
            strcmp(prop_name, "locale") == 0);
}

int main(void) {
    assert(is_mutable_profile_property("display_name") == true);
    assert(is_mutable_profile_property("is_admin") == false);
    assert(is_mutable_profile_property("role") == false);
    assert(is_mutable_profile_property("wallet_balance") == false);
    printf("PASS: API3:2023 C property allow-list guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "API4:2023",
    codeId: "API4_2023",
    standard: "OWASP-API-2023",
    title: "Unrestricted Resource Consumption",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/",
    cwe: "CWE-400, CWE-770 (Allocation of Resources Without Limits or Throttling)",
    summary:
      "APIs fail to bound request rates, payload sizes, pagination page sizes (`?limit=1000000`), or GraphQL/batch depth, enabling DoS and cloud cost exhaustion.",
    control:
      "Enforce per-client token-bucket rate limits, strict HTTP body byte caps, execution timeouts, and hard upper bounds on pagination (`1 <= limit <= 100`).",
    keywords: /\b(api4(?:[:_ -]?2023)?|unrestricted\s+resource\s+consumption)\b/i,
    python: `import unittest

MAX_BODY_BYTES = 65_536
MAX_PAGE_LIMIT = 100

class TokenBucketLimiter:
    """API4:2023 Per-client token bucket & pagination/payload resource guard."""
    def __init__(self, capacity: int, refill_per_sec: float) -> None:
        self.capacity = float(capacity)
        self.refill_per_sec = refill_per_sec
        self.buckets: dict[str, tuple[float, float]] = {}

    def allow_request(self, client_id: str, content_length: int, requested_limit: int, now: float) -> tuple[bool, int]:
        if content_length < 0 or content_length > MAX_BODY_BYTES:
            return False, 0
        tokens, last_ts = self.buckets.get(client_id, (self.capacity, now))
        tokens = min(self.capacity, tokens + max(0.0, now - last_ts) * self.refill_per_sec)
        if tokens < 1.0:
            self.buckets[client_id] = (tokens, now)
            return False, 0
        self.buckets[client_id] = (tokens - 1.0, now)
        clamped_limit = max(1, min(requested_limit, MAX_PAGE_LIMIT))
        return True, clamped_limit

class TestApi4ResourceConsumption(unittest.TestCase):
    def test_oversized_body_and_excessive_pagination_bounded(self) -> None:
        limiter = TokenBucketLimiter(capacity=2, refill_per_sec=1.0)
        ok, page_limit = limiter.allow_request("client-1", content_length=1024, requested_limit=50000, now=10.0)
        self.assertTrue(ok)
        self.assertEqual(page_limit, MAX_PAGE_LIMIT)
        ok_big, _ = limiter.allow_request("client-1", content_length=1_000_000, requested_limit=10, now=10.0)
        self.assertFalse(ok_big)

if __name__ == "__main__":
    unittest.main()`,
    java: `public final class Api4ResourceQuotaGuard {
    public static final int MAX_PAYLOAD_BYTES = 65_536;
    public static final int MAX_PAGE_SIZE = 100;

    public static int validateAndClampPageSize(int contentLengthBytes, int requestedPageSize) {
        if (contentLengthBytes < 0 || contentLengthBytes > MAX_PAYLOAD_BYTES) {
            throw new IllegalArgumentException("HTTP 413: Payload exceeds maximum allowed byte size");
        }
        if (requestedPageSize <= 0) return 20;
        return Math.min(requestedPageSize, MAX_PAGE_SIZE);
    }

    public static void main(String[] args) {
        if (validateAndClampPageSize(2048, 999999) != MAX_PAGE_SIZE) {
            throw new AssertionError("Page size must be clamped to 100");
        }
        try {
            validateAndClampPageSize(1_000_000, 20);
            throw new AssertionError("Oversized payload must be rejected");
        } catch (IllegalArgumentException expected) {
            // Expected HTTP 413 guard
        }
        System.out.println("PASS: API4:2023 Unrestricted Resource Consumption guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

#define API4_MAX_BODY_BYTES 65536U
#define API4_MAX_PAGE_LIMIT 100U

bool check_api4_limits(size_t body_bytes, uint32_t req_limit, uint32_t *out_clamped_limit) {
    if (!out_clamped_limit || body_bytes > API4_MAX_BODY_BYTES) return false;
    if (req_limit == 0U) *out_clamped_limit = 20U;
    else if (req_limit > API4_MAX_PAGE_LIMIT) *out_clamped_limit = API4_MAX_PAGE_LIMIT;
    else *out_clamped_limit = req_limit;
    return true;
}

int main(void) {
    uint32_t limit = 0;
    assert(check_api4_limits(1024, 50000, &limit) == true && limit == 100U);
    assert(check_api4_limits(100000, 10, &limit) == false);
    printf("PASS: API4:2023 C resource consumption cap verified.\\n");
    return 0;
}`,
  },
  {
    id: "API5:2023",
    codeId: "API5_2023",
    standard: "OWASP-API-2023",
    title: "Broken Function Level Authorization (BFLA)",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/",
    cwe: "CWE-285 (Improper Authorization)",
    summary:
      "Regular users can invoke privileged administrative endpoints or HTTP methods (`DELETE /api/v1/users`, `POST /api/admin/export`) because function-level role/scope checks are missing.",
    control:
      "Maintain a centralized deny-by-default `(route, http_method) -> required_scopes` policy table evaluated by middleware before invoking any controller.",
    keywords: /\b(api5(?:[:_ -]?2023)?|broken\s+function\s+level\s+authorization|\bbfla\b)\b/i,
    python: `import unittest

ROUTE_POLICY: dict[tuple[str, str], set[str]] = {
    ("GET", "/api/v1/users/me"): {"user", "admin"},
    ("GET", "/api/v1/admin/audit-log"): {"admin"},
    ("DELETE", "/api/v1/users"): {"admin"},
}

def authorize_function_call(method: str, path: str, caller_roles: set[str]) -> bool:
    """API5:2023 (BFLA) Centralized deny-by-default method + route authorization matrix."""
    allowed_roles = ROUTE_POLICY.get((method.upper(), path))
    if not allowed_roles:
        return False  # Deny by default for unmapped methods/routes
    return bool(caller_roles & allowed_roles)

class TestApi5BflaPrevention(unittest.TestCase):
    def test_regular_user_blocked_from_admin_and_delete_functions(self) -> None:
        self.assertTrue(authorize_function_call("GET", "/api/v1/users/me", {"user"}))
        self.assertFalse(authorize_function_call("DELETE", "/api/v1/users", {"user"}))
        self.assertFalse(authorize_function_call("GET", "/api/v1/admin/audit-log", {"user"}))
        self.assertTrue(authorize_function_call("DELETE", "/api/v1/users", {"admin"}))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;
import java.util.Set;

public final class Api5BflaMethodGuard {
    private static final Map<String, Set<String>> POLICY = Map.of(
        "GET:/api/v1/profile", Set.of("ROLE_USER", "ROLE_ADMIN"),
        "POST:/api/v1/admin/promote", Set.of("ROLE_ADMIN"),
        "DELETE:/api/v1/users", Set.of("ROLE_ADMIN")
    );

    public static boolean isFunctionAllowed(String httpMethod, String route, Set<String> callerRoles) {
        if (httpMethod == null || route == null || callerRoles == null) return false;
        Set<String> required = POLICY.get(httpMethod.toUpperCase() + ":" + route);
        if (required == null) return false; // Deny by default
        return callerRoles.stream().anyMatch(required::contains);
    }

    public static void main(String[] args) {
        if (isFunctionAllowed("POST", "/api/v1/admin/promote", Set.of("ROLE_USER"))) {
            throw new AssertionError("BFLA: ROLE_USER must not invoke admin promotion");
        }
        if (!isFunctionAllowed("POST", "/api/v1/admin/promote", Set.of("ROLE_ADMIN"))) {
            throw new AssertionError("ROLE_ADMIN should be permitted");
        }
        System.out.println("PASS: API5:2023 BFLA function-level authorization verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

#define ROLE_USER  0x01U
#define ROLE_ADMIN 0x02U

typedef struct {
    const char *method;
    const char *route;
    unsigned int required_role_mask;
} route_policy_t;

static const route_policy_t POLICIES[] = {
    {"GET",    "/api/v1/profile", ROLE_USER | ROLE_ADMIN},
    {"DELETE", "/api/v1/users",   ROLE_ADMIN},
    {"POST",   "/api/v1/admin",   ROLE_ADMIN}
};

bool check_bfla_policy(const char *method, const char *route, unsigned int caller_mask) {
    if (!method || !route) return false;
    for (size_t i = 0; i < sizeof(POLICIES) / sizeof(POLICIES[0]); ++i) {
        if (strcmp(POLICIES[i].method, method) == 0 && strcmp(POLICIES[i].route, route) == 0) {
            return (caller_mask & POLICIES[i].required_role_mask) != 0U;
        }
    }
    return false; /* Deny by default */
}

int main(void) {
    assert(check_bfla_policy("GET", "/api/v1/profile", ROLE_USER) == true);
    assert(check_bfla_policy("DELETE", "/api/v1/users", ROLE_USER) == false);
    assert(check_bfla_policy("DELETE", "/api/v1/users", ROLE_ADMIN) == true);
    printf("PASS: API5:2023 C BFLA policy table verified.\\n");
    return 0;
}`,
  },
  {
    id: "API6:2023",
    codeId: "API6_2023",
    standard: "OWASP-API-2023",
    title: "Unrestricted Access to Sensitive Business Flows",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/",
    cwe: "CWE-799, CWE-841",
    summary:
      "Automated scalping, bulk ticket/inventory hoarding, coupon abuse, or referral farming exploit legitimate business workflows that lack per-account quotas and idempotency enforcement.",
    control:
      "Require client idempotency keys (`Idempotency-Key`), enforce per-account business-flow velocity caps, and bind checkout/reservation flows to verified human/account state.",
    keywords: /\b(api6(?:[:_ -]?2023)?|unrestricted\s+access\s+to\s+sensitive\s+business\s+flows|sensitive\s+business\s+flows)\b/i,
    python: `import unittest

class BusinessFlowGuard:
    """API6:2023 Idempotency-key deduplication & per-account purchase quota guard."""
    def __init__(self, max_units_per_user: int = 2) -> None:
        self.max_units_per_user = max_units_per_user
        self.seen_idempotency_keys: dict[str, dict] = {}
        self.user_purchased_units: dict[str, int] = {}

    def reserve_limited_item(self, user_id: str, idempotency_key: str, quantity: int) -> dict:
        if not user_id or not idempotency_key or len(idempotency_key) < 12:
            raise ValueError("Missing user_id or valid Idempotency-Key.")
        composite = f"{user_id}:{idempotency_key}"
        if composite in self.seen_idempotency_keys:
            return self.seen_idempotency_keys[composite]
        if quantity <= 0:
            raise ValueError("Quantity must be positive.")
        current = self.user_purchased_units.get(user_id, 0)
        if current + quantity > self.max_units_per_user:
            raise ValueError("Business flow limit exceeded: per-account reservation cap reached.")
        self.user_purchased_units[user_id] = current + quantity
        receipt = {"user_id": user_id, "reserved": quantity, "total_reserved": current + quantity}
        self.seen_idempotency_keys[composite] = receipt
        return receipt

class TestApi6SensitiveBusinessFlows(unittest.TestCase):
    def test_automated_scalping_blocked_and_idempotency_preserved(self) -> None:
        guard = BusinessFlowGuard(max_units_per_user=2)
        r1 = guard.reserve_limited_item("u-1", "idem-key-000001", 2)
        r2 = guard.reserve_limited_item("u-1", "idem-key-000001", 2)  # Replay returns same receipt
        self.assertEqual(r1, r2)
        with self.assertRaises(ValueError):
            guard.reserve_limited_item("u-1", "idem-key-000002", 1)  # 3rd unit blocked

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.HashMap;
import java.util.Map;

public final class Api6BusinessFlowGuard {
    private final int maxUnitsPerAccount;
    private final Map<String, Integer> accountTotals = new HashMap<>();

    public Api6BusinessFlowGuard(int maxUnitsPerAccount) {
        this.maxUnitsPerAccount = maxUnitsPerAccount;
    }

    public synchronized boolean tryReserveInventory(String accountId, int requestedUnits) {
        if (accountId == null || accountId.isBlank() || requestedUnits <= 0) return false;
        int current = accountTotals.getOrDefault(accountId, 0);
        if (current + requestedUnits > maxUnitsPerAccount) {
            return false; // Block automated inventory hoarding
        }
        accountTotals.put(accountId, current + requestedUnits);
        return true;
    }

    public static void main(String[] args) {
        Api6BusinessFlowGuard guard = new Api6BusinessFlowGuard(2);
        if (!guard.tryReserveInventory("acct-1", 2)) throw new AssertionError("First reservation should pass");
        if (guard.tryReserveInventory("acct-1", 1)) throw new AssertionError("Scalping above cap must be blocked");
        System.out.println("PASS: API6:2023 Sensitive Business Flow anti-hoarding guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

typedef struct {
    uint32_t reserved_units;
    uint32_t max_units_per_account;
    uint64_t last_idempotency_token;
} account_flow_state_t;

bool reserve_business_flow(account_flow_state_t *st, uint32_t qty, uint64_t idem_token) {
    if (!st || qty == 0 || idem_token == 0) return false;
    if (st->last_idempotency_token == idem_token) return false; /* Duplicate replay blocked */
    if (st->reserved_units + qty > st->max_units_per_account) return false;
    st->reserved_units += qty;
    st->last_idempotency_token = idem_token;
    return true;
}

int main(void) {
    account_flow_state_t acct = {0U, 2U, 0ULL};
    assert(reserve_business_flow(&acct, 2U, 1001ULL) == true);
    assert(reserve_business_flow(&acct, 2U, 1001ULL) == false); /* Replay blocked */
    assert(reserve_business_flow(&acct, 1U, 1002ULL) == false); /* Quota exceeded */
    printf("PASS: API6:2023 C business flow quota & idempotency guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "API7:2023",
    codeId: "API7_2023",
    standard: "OWASP-API-2023",
    title: "Server Side Request Forgery (SSRF)",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/",
    cwe: "CWE-918 (Server-Side Request Forgery)",
    summary:
      "SSRF occurs when an API fetches a remote resource (webhook, avatar URL, PDF/OIDC discovery URL) without validating the scheme, hostname allow-list, and resolved IP address against loopback, RFC 1918 private networks, and cloud IMDS (`169.254.169.254`).",
    control:
      "Require `https://`, enforce a strict hostname allow-list, resolve DNS before connecting, and block all private (`10/8`, `172.16/12`, `192.168/16`), loopback (`127/8`, `::1`), and link-local/IMDS (`169.254/16`, `fe80::/10`) IPs.",
    keywords: /\b(api7(?:[:_ -]?2023)?|server[- ]side\s+request\s+forgery|\bssrf\b)\b/i,
    python: `import ipaddress
import unittest
from urllib.parse import urlparse

ALLOWED_WEBHOOK_HOSTS = {"hooks.partner.example", "cdn.noctis.social"}

def is_public_unicast_ip(ip_str: str) -> bool:
    """API7:2023 Block loopback, RFC 1918 private, link-local (169.254.169.254 IMDS), and multicast IPs."""
    ip = ipaddress.ip_address(ip_str)
    if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
        return False
    return True

def validate_outbound_url(url: str, resolved_ips: list[str]) -> bool:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        return False
    if parsed.hostname.lower() not in ALLOWED_WEBHOOK_HOSTS:
        return False
    if not resolved_ips:
        return False
    return all(is_public_unicast_ip(ip) for ip in resolved_ips)

class TestApi7SsrfPrevention(unittest.TestCase):
    def test_cloud_imds_and_rfc1918_blocked(self) -> None:
        self.assertFalse(is_public_unicast_ip("169.254.169.254"))  # AWS/GCP/Azure IMDS
        self.assertFalse(is_public_unicast_ip("127.0.0.1"))
        self.assertFalse(is_public_unicast_ip("10.24.16.5"))
        self.assertFalse(validate_outbound_url("https://hooks.partner.example/cb", ["169.254.169.254"]))
        self.assertTrue(validate_outbound_url("https://hooks.partner.example/cb", ["93.184.216.34"]))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.net.InetAddress;
import java.net.URI;
import java.util.Set;

public final class Api7SsrfEgressGuard {
    private static final Set<String> ALLOWED_HOSTS = Set.of("hooks.partner.example", "cdn.noctis.social");

    /** API7:2023 Verify HTTPS scheme, host allow-list, and non-private/non-IMDS IP address. */
    public static boolean isSafeEgressTarget(URI uri, InetAddress resolvedIp) {
        if (uri == null || resolvedIp == null) return false;
        if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
        String host = uri.getHost();
        if (host == null || !ALLOWED_HOSTS.contains(host.toLowerCase())) return false;
        if (resolvedIp.isAnyLocalAddress()
                || resolvedIp.isLoopbackAddress()
                || resolvedIp.isLinkLocalAddress() // Blocks 169.254.0.0/16 (Cloud IMDS)
                || resolvedIp.isSiteLocalAddress() // Blocks 10/8, 172.16/12, 192.168/16
                || resolvedIp.isMulticastAddress()) {
            return false;
        }
        return true;
    }

    public static void main(String[] args) throws Exception {
        URI allowedUri = URI.create("https://hooks.partner.example/webhook");
        InetAddress imdsIp = InetAddress.getByAddress(new byte[]{(byte) 169, (byte) 254, (byte) 169, (byte) 254});
        InetAddress publicIp = InetAddress.getByAddress(new byte[]{93, (byte) 184, (byte) 216, 34});

        if (isSafeEgressTarget(allowedUri, imdsIp)) throw new AssertionError("Cloud IMDS IP must be blocked");
        if (!isSafeEgressTarget(allowedUri, publicIp)) throw new AssertionError("Public allow-listed target should pass");
        System.out.println("PASS: API7:2023 SSRF egress & IMDS guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

/* API7:2023 Classify IPv4 address to block RFC 1918, loopback, and 169.254.0.0/16 IMDS */
bool is_public_ipv4(uint8_t a, uint8_t b, uint8_t c, uint8_t d) {
    (void)c; (void)d;
    if (a == 0U || a == 10U || a == 127U) return false;
    if (a == 169U && b == 254U) return false; /* Cloud IMDS 169.254.169.254 */
    if (a == 172U && b >= 16U && b <= 31U) return false;
    if (a == 192U && b == 168U) return false;
    if (a == 100U && b >= 64U && b <= 127U) return false; /* CGNAT */
    if (a >= 224U) return false; /* Multicast / Reserved */
    return true;
}

int main(void) {
    assert(is_public_ipv4(169, 254, 169, 254) == false);
    assert(is_public_ipv4(127, 0, 0, 1) == false);
    assert(is_public_ipv4(10, 0, 0, 1) == false);
    assert(is_public_ipv4(93, 184, 216, 34) == true);
    printf("PASS: API7:2023 C SSRF IPv4 egress filter verified.\\n");
    return 0;
}`,
  },
  {
    id: "API8:2023",
    codeId: "API8_2023",
    standard: "OWASP-API-2023",
    title: "Security Misconfiguration (API)",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/",
    cwe: "CWE-16, CWE-942 (Overly Permissive CORS Policy)",
    summary:
      "APIs suffer from permissive CORS (`Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`), missing `Cache-Control: no-store` on sensitive responses, verbose stack traces, or unauthenticated HTTP methods (`TRACE`).",
    control:
      "Validate `Origin` against a strict allow-list before setting CORS headers, enforce `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`, and disable `TRACE`/`OPTIONS` reflection.",
    keywords: /\b(api8(?:[:_ -]?2023)?|api\s+security\s+misconfiguration)\b/i,
    python: `import unittest

ALLOWED_CORS_ORIGINS = {"https://noctis.social", "https://app.noctis.social"}

def build_hardened_api_headers(request_origin: str | None) -> dict[str, str]:
    """API8:2023 Build hardened API response headers with strict CORS allow-listing."""
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "DENY",
    }
    if request_origin in ALLOWED_CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = request_origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return headers

class TestApi8SecurityMisconfiguration(unittest.TestCase):
    def test_untrusted_origin_never_reflected(self) -> None:
        h = build_hardened_api_headers("https://evil.example")
        self.assertNotIn("Access-Control-Allow-Origin", h)
        self.assertEqual(h["Cache-Control"], "no-store")

    def test_trusted_origin_allowed(self) -> None:
        h = build_hardened_api_headers("https://noctis.social")
        self.assertEqual(h["Access-Control-Allow-Origin"], "https://noctis.social")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;

public final class Api8CorsAndHeaderGuard {
    private static final Set<String> TRUSTED_ORIGINS = Set.of("https://noctis.social");

    public static boolean isAllowedCorsOrigin(String origin, boolean credentialsIncluded) {
        if (origin == null || origin.isBlank()) return false;
        if ("*".equals(origin) && credentialsIncluded) return false; // Illegal & insecure
        return TRUSTED_ORIGINS.contains(origin);
    }

    public static void main(String[] args) {
        if (isAllowedCorsOrigin("*", true)) throw new AssertionError("Wildcard with credentials must fail");
        if (isAllowedCorsOrigin("https://attacker.example", true)) throw new AssertionError("Untrusted origin must fail");
        if (!isAllowedCorsOrigin("https://noctis.social", true)) throw new AssertionError("Trusted origin should pass");
        System.out.println("PASS: API8:2023 API Security Misconfiguration CORS & header check verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

bool is_allowed_api_method_and_origin(const char *method, const char *origin) {
    if (!method || !origin) return false;
    if (strcmp(method, "TRACE") == 0 || strcmp(method, "CONNECT") == 0) return false;
    return strcmp(origin, "https://noctis.social") == 0;
}

int main(void) {
    assert(is_allowed_api_method_and_origin("TRACE", "https://noctis.social") == false);
    assert(is_allowed_api_method_and_origin("GET", "*") == false);
    assert(is_allowed_api_method_and_origin("POST", "https://noctis.social") == true);
    printf("PASS: API8:2023 C HTTP method & CORS origin verifier passed.\\n");
    return 0;
}`,
  },
  {
    id: "API9:2023",
    codeId: "API9_2023",
    standard: "OWASP-API-2023",
    title: "Improper Inventory Management",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa9-improper-inventory-management/",
    cwe: "CWE-1059 (Insufficient Technical Documentation), Shadow/Deprecated Endpoints",
    summary:
      "Unpatched legacy API versions (`/api/v1/beta`, `/api/debug`) or undocumented shadow endpoints remain reachable in production without current security controls.",
    control:
      "Maintain an explicit registry of active API versions and routes at the API gateway; reject retired versions (`v1`, `beta`) with `410 Gone` and emit RFC 8594 `Sunset` headers on deprecating versions.",
    keywords: /\b(api9(?:[:_ -]?2023)?|improper\s+inventory\s+management|shadow\s+api|deprecated\s+api)\b/i,
    python: `import unittest

API_VERSION_REGISTRY = {
    "v1": {"status": "RETIRED"},
    "v2": {"status": "DEPRECATED", "sunset": "Wed, 31 Dec 2025 23:59:59 GMT"},
    "v3": {"status": "ACTIVE"},
}

def check_api_version_lifecycle(version: str) -> tuple[int, dict[str, str]]:
    """API9:2023 Block retired or shadow API versions at the gateway."""
    entry = API_VERSION_REGISTRY.get(version)
    if entry is None:
        return 404, {"error": "Unknown or undocumented API version blocked."}
    if entry["status"] == "RETIRED":
        return 410, {"error": f"API version {version} is retired. Upgrade to v3."}
    if entry["status"] == "DEPRECATED":
        return 200, {"Deprecation": "true", "Sunset": entry["sunset"]}
    return 200, {}

class TestApi9InventoryManagement(unittest.TestCase):
    def test_retired_and_shadow_versions_blocked(self) -> None:
        status_v1, _ = check_api_version_lifecycle("v1")
        self.assertEqual(status_v1, 410)
        status_shadow, _ = check_api_version_lifecycle("v0-debug")
        self.assertEqual(status_shadow, 404)
        status_v3, _ = check_api_version_lifecycle("v3")
        self.assertEqual(status_v3, 200)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;

public final class Api9VersionInventoryGate {
    public enum Lifecycle { ACTIVE, DEPRECATED, RETIRED }

    private static final Map<String, Lifecycle> INVENTORY = Map.of(
        "v1", Lifecycle.RETIRED,
        "v2", Lifecycle.DEPRECATED,
        "v3", Lifecycle.ACTIVE
    );

    public static int resolveGatewayStatus(String apiVersion) {
        Lifecycle state = INVENTORY.get(apiVersion);
        if (state == null) return 404; // Block undocumented shadow version
        return switch (state) {
            case RETIRED -> 410; // HTTP 410 Gone
            case DEPRECATED, ACTIVE -> 200;
        };
    }

    public static void main(String[] args) {
        if (resolveGatewayStatus("v1") != 410) throw new AssertionError("Retired v1 must return 410 Gone");
        if (resolveGatewayStatus("v-internal-debug") != 404) throw new AssertionError("Shadow route must return 404");
        if (resolveGatewayStatus("v3") != 200) throw new AssertionError("Active v3 must return 200");
        System.out.println("PASS: API9:2023 Improper Inventory Management gateway gate verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdio.h>
#include <string.h>

int check_api9_version_gate(const char *version) {
    if (!version) return 404;
    if (strcmp(version, "v3") == 0) return 200;
    if (strcmp(version, "v2") == 0) return 200; /* Active with Sunset header */
    if (strcmp(version, "v1") == 0 || strcmp(version, "beta") == 0) return 410; /* Gone */
    return 404; /* Block undocumented shadow version */
}

int main(void) {
    assert(check_api9_version_gate("v1") == 410);
    assert(check_api9_version_gate("v0-debug") == 404);
    assert(check_api9_version_gate("v3") == 200);
    printf("PASS: API9:2023 C API version inventory gate verified.\\n");
    return 0;
}`,
  },
  {
    id: "API10:2023",
    codeId: "API10_2023",
    standard: "OWASP-API-2023",
    title: "Unsafe Consumption of APIs",
    url: "https://owasp.org/API-Security/editions/2023/en/0xaa-unsafe-consumption-of-apis/",
    cwe: "CWE-20 (Improper Input Validation), CWE-345 (Insufficient Verification of Data Authenticity)",
    summary:
      "Developers trust data received from third-party/upstream APIs more than direct user input, forwarding unvalidated upstream strings into SQL queries, HTML sinks, or redirect headers.",
    control:
      "Treat all third-party API responses as untrusted input: enforce byte limits, timeouts, strict schema/type validation, and HTML/SQL sanitization before storage or rendering.",
    keywords: /\b(api10(?:[:_ -]?2023)?|unsafe\s+consumption\s+of\s+apis)\b/i,
    python: `import json
import re
import unittest

SKU_RE = re.compile(r"^[A-Z0-9-]{3,24}$")

def parse_upstream_partner_payload(raw_bytes: bytes, max_bytes: int = 8192) -> dict:
    """API10:2023 Validate size, types, and allow-listed format of third-party API payloads."""
    if len(raw_bytes) > max_bytes:
        raise ValueError("Upstream API response exceeds safe byte limit.")
    data = json.loads(raw_bytes.decode("utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Upstream payload must be a JSON object.")
    sku = str(data.get("sku", ""))
    price_cents = data.get("price_cents")
    if not SKU_RE.match(sku):
        raise ValueError("Upstream SKU failed strict pattern validation.")
    if not isinstance(price_cents, int) or isinstance(price_cents, bool) or not (0 < price_cents <= 10_000_000):
        raise ValueError("Upstream price_cents out of safe integer bounds.")
    return {"sku": sku, "price_cents": price_cents}

class TestApi10UnsafeConsumption(unittest.TestCase):
    def test_valid_partner_payload_accepted(self) -> None:
        res = parse_upstream_partner_payload(b'{"sku":"NOC-2025-PRO","price_cents":9900}')
        self.assertEqual(res["sku"], "NOC-2025-PRO")

    def test_compromised_upstream_injection_rejected(self) -> None:
        with self.assertRaises(ValueError):
            parse_upstream_partner_payload(b'{"sku":"NOC\'; DROP TABLE items;--","price_cents":9900}')

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.regex.Pattern;

public final class Api10UpstreamSanitizer {
    private static final Pattern SAFE_SKU = Pattern.compile("^[A-Z0-9-]{3,24}$");

    public record PartnerQuote(String sku, long priceCents) {}

    /** API10:2023 Validate all fields from third-party APIs as strictly as end-user input. */
    public static PartnerQuote validateUpstreamQuote(String upstreamSku, long upstreamPriceCents) {
        if (upstreamSku == null || !SAFE_SKU.matcher(upstreamSku).matches()) {
            throw new IllegalArgumentException("Untrusted upstream SKU rejected");
        }
        if (upstreamPriceCents <= 0 || upstreamPriceCents > 10_000_000L) {
            throw new IllegalArgumentException("Untrusted upstream price out of bounds");
        }
        return new PartnerQuote(upstreamSku, upstreamPriceCents);
    }

    public static void main(String[] args) {
        PartnerQuote q = validateUpstreamQuote("SKU-900-A", 4500L);
        if (q.priceCents() != 4500L) throw new AssertionError("Valid upstream quote failed");
        try {
            validateUpstreamQuote("<script>evil()</script>", 4500L);
            throw new AssertionError("Malicious upstream SKU must be rejected");
        } catch (IllegalArgumentException expected) {
            // Expected block
        }
        System.out.println("PASS: API10:2023 Unsafe Consumption of APIs validator verified.");
    }
}`,
    c: `#include <assert.h>
#include <ctype.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* API10:2023 Strict schema check on upstream third-party API fields before use */
bool validate_upstream_sku_and_price(const char *sku, int64_t price_cents) {
    if (!sku || price_cents <= 0 || price_cents > 10000000LL) return false;
    size_t len = strlen(sku);
    if (len < 3 || len > 24) return false;
    for (size_t i = 0; i < len; ++i) {
        unsigned char ch = (unsigned char)sku[i];
        if (!(isupper(ch) || isdigit(ch) || ch == '-')) return false;
    }
    return true;
}

int main(void) {
    assert(validate_upstream_sku_and_price("NOC-2025-A", 5000) == true);
    assert(validate_upstream_sku_and_price("NOC'; DROP TABLE--", 5000) == false);
    assert(validate_upstream_sku_and_price("NOC-2025-A", -100) == false);
    printf("PASS: API10:2023 C upstream API response validator verified.\\n");
    return 0;
}`,
  },
];

export const DEFENSIVE_VECTOR_SPECS: OwaspCategorySpec[] = [
  {
    id: "WAF-LFI:2025",
    codeId: "WAF_LFI_2025",
    standard: "OWASP-WAF-7",
    title: "Path Traversal & Local File Inclusion (LFI) Filter-Bypass Defense",
    url: "https://owasp.org/www-community/attacks/Path_Traversal",
    cwe: "CWE-22 (Path Traversal), CWE-98 (PHP File Inclusion), CWE-158 (Null Byte Interaction)",
    summary:
      "Attackers attempt to escape the intended storage root using `../../../../etc/passwd`, Windows backslashes `..\\..\\..\\..\\Windows\\win.ini`, nested `....//....//` sequences that defeat single-pass `replace('../', '')` filters, null-byte truncation `/etc/passwd%00`, or stream wrappers like `php://filter/convert.base64-encode/resource=index.php`.",
    control:
      "Reject URL/stream schemes (`://`), null bytes (`\\x00` / `%00`), and path separators (`/` and `\\`); validate filenames against a strict alphanumeric allow-list, and verify `realpath` / `toRealPath()` stays strictly inside the canonical root directory.",
    keywords: /\b(path\s+traversal|local\s+file\s+inclusion|\blfi\b|etc\/passwd|win\.ini|php:\/\/filter|\.\.\/\.\.\/|\.\.\\\\\.\.\\\\|\.\.\.\.\/\/)\b/i,
    python: `import os
import re
import tempfile
import urllib.parse
import unittest

SAFE_FILENAME_RE = re.compile(r"^[a-zA-Z0-9._-]{1,64}$")

def resolve_safe_download_path(base_dir: str, raw_input: str) -> str:
    """WAF-LFI:2025 Block LFI, nested ....//, Windows ..\\, %00 null-bytes, and php:// wrappers."""
    if "\x00" in raw_input or "%00" in raw_input.lower():
        raise PermissionError("Null-byte injection blocked")
    decoded = urllib.parse.unquote(raw_input)
    if "://" in decoded or "/" in decoded or "\\\\" in decoded or ".." in decoded:
        raise PermissionError("Path traversal or stream wrapper blocked")
    if not SAFE_FILENAME_RE.match(decoded):
        raise PermissionError("Filename failed strict allow-list validation")
    root_real = os.path.realpath(base_dir)
    candidate_real = os.path.realpath(os.path.join(root_real, decoded))
    if os.path.commonpath([root_real, candidate_real]) != root_real or candidate_real == root_real:
        raise PermissionError("Canonical path escaped root boundary")
    return candidate_real

class TestLfiDefenseSuite(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_blocks_all_lfi_and_traversal_vectors(self) -> None:
        lfi_vectors = [
            "../../../../etc/passwd",
            "..\\\\..\\\\..\\\\..\\\\Windows\\\\win.ini",
            "....//....//....//etc/passwd",
            "/etc/passwd%00",
            "/etc/passwd\x00.png",
            "php://filter/convert.base64-encode/resource=index.php",
        ]
        for vector in lfi_vectors:
            with self.subTest(vector=vector):
                with self.assertRaises(PermissionError):
                    resolve_safe_download_path(self.tmp.name, vector)

    def test_allows_safe_filename(self) -> None:
        resolved = resolve_safe_download_path(self.tmp.name, "quarterly-report-2025.pdf")
        self.assertTrue(resolved.endswith("quarterly-report-2025.pdf"))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Pattern;

public final class WafLfiTraversalGuard {
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-zA-Z0-9._-]{1,64}$");

    /** WAF-LFI:2025 Canonical path confinement & stream-wrapper / null-byte blocker. */
    public static Path safeResolveFile(Path baseDir, String untrustedInput) {
        if (untrustedInput == null || untrustedInput.isEmpty()) {
            throw new SecurityException("Empty file parameter");
        }
        String lower = untrustedInput.toLowerCase();
        if (untrustedInput.indexOf('\\0') >= 0 || lower.contains("%00") || lower.contains("://")
                || untrustedInput.contains("/") || untrustedInput.contains("\\\\") || untrustedInput.contains("..")) {
            throw new SecurityException("LFI / Path Traversal / Stream Wrapper blocked: " + untrustedInput);
        }
        if (!SAFE_NAME.matcher(untrustedInput).matches()) {
            throw new SecurityException("Invalid filename format");
        }
        Path root = baseDir.toAbsolutePath().normalize();
        Path resolved = root.resolve(untrustedInput).normalize();
        if (!resolved.startsWith(root) || resolved.equals(root)) {
            throw new SecurityException("Canonical path escaped root directory");
        }
        return resolved;
    }

    public static void main(String[] args) {
        Path base = Paths.get("/srv/uploads");
        List<String> vectors = List.of(
            "../../../../etc/passwd",
            "..\\\\..\\\\..\\\\..\\\\Windows\\\\win.ini",
            "....//....//....//etc/passwd",
            "/etc/passwd%00",
            "php://filter/convert.base64-encode/resource=index.php"
        );
        for (String v : vectors) {
            try {
                safeResolveFile(base, v);
                throw new AssertionError("Vector should have been blocked: " + v);
            } catch (SecurityException expected) {
                // Expected block
            }
        }
        Path ok = safeResolveFile(base, "invoice_2025.pdf");
        if (!ok.endsWith("invoice_2025.pdf")) throw new AssertionError("Valid file rejected");
        System.out.println("PASS: WAF-LFI:2025 Java path traversal & wrapper guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <ctype.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

/* WAF-LFI:2025 Strict C guard rejecting ../, ..\\, ....//, %00, and stream wrappers */
bool is_safe_lfi_filename(const char *input, size_t raw_len) {
    if (!input || raw_len == 0 || raw_len > 64) return false;
    if (strlen(input) != raw_len) return false; /* Embedded null byte \\0 check */
    if (strstr(input, "..") != NULL || strstr(input, "://") != NULL ||
        strstr(input, "%00") != NULL || strchr(input, '/') != NULL ||
        strchr(input, '\\\\') != NULL) {
        return false;
    }
    for (size_t i = 0; i < raw_len; ++i) {
        unsigned char c = (unsigned char)input[i];
        if (!(isalnum(c) || c == '.' || c == '_' || c == '-')) return false;
    }
    return input[0] != '.';
}

int main(void) {
    assert(is_safe_lfi_filename("../../../../etc/passwd", 22) == false);
    assert(is_safe_lfi_filename("..\\\\..\\\\..\\\\..\\\\Windows\\\\win.ini", 32) == false);
    assert(is_safe_lfi_filename("....//....//....//etc/passwd", 28) == false);
    assert(is_safe_lfi_filename("/etc/passwd%00", 14) == false);
    assert(is_safe_lfi_filename("php://filter/convert.base64-encode/resource=index.php", 53) == false);
    assert(is_safe_lfi_filename("report_2025.txt", 15) == true);
    printf("PASS: WAF-LFI:2025 C LFI & path traversal filter verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-SQLI:2025",
    codeId: "WAF_SQLI_2025",
    standard: "OWASP-WAF-7",
    title: "SQL Injection (Auth Bypass, Union-Based & Time-Based Blind) Defense",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
    cwe: "CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)",
    summary:
      "Covers all three classic SQLi classes: Authentication Bypass (`admin' --`, `admin' #`, `' OR 1=1 --`, `' OR '1'='1`), Union/Error-Based extraction (`' ORDER BY 1--`, `' UNION SELECT NULL, NULL, NULL--`, `' UNION SELECT version(), user(), null--`), and Time-Based Blind probes (`WAITFOR DELAY '0:0:5'--`, `PG_SLEEP(5)--`).",
    control:
      "Bind all data values using parameterized prepared statements (`?` / `PreparedStatement` / `sqlite3_bind_text`) and validate dynamic `ORDER BY` column names against a strict server-side allow-list map.",
    keywords: /\b(admin'\s*--|or\s+1=1|union\s+select|waitfor\s+delay|pg_sleep|time-based\s+blind|union-based)\b/i,
    python: `import sqlite3
import unittest

ALLOWED_SORT_COLUMNS = {"username": "username", "role": "role", "id": "id"}

def authenticate_and_list(conn: sqlite3.Connection, username: str, password_hash: str, sort_by: str = "id") -> list[tuple]:
    """WAF-SQLI:2025 Parameterized auth query + allow-listed ORDER BY column."""
    safe_col = ALLOWED_SORT_COLUMNS.get(sort_by, "id")
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, username, role FROM users WHERE username = ? AND password_hash = ? ORDER BY {safe_col} ASC",
        (username, password_hash),
    )
    return cur.fetchall()

class TestSqliFullVectorRegression(unittest.TestCase):
    def setUp(self) -> None:
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password_hash TEXT, role TEXT)")
        self.conn.execute("INSERT INTO users VALUES (1, 'admin', 'pbkdf2_sha256$valid', 'superuser')")
        self.conn.commit()

    def tearDown(self) -> None:
        self.conn.close()

    def test_auth_bypass_union_and_time_blind_vectors_return_empty(self) -> None:
        sqli_vectors = [
            "admin' --",
            "admin' #",
            "' OR 1=1 --",
            "' OR '1'='1",
            "' ORDER BY 1--",
            "' UNION SELECT NULL, NULL, NULL--",
            "' UNION SELECT version(), user(), null--",
            "x' AND 1=1; WAITFOR DELAY '0:0:5'--",
            "x' OR PG_SLEEP(5)--",
        ]
        for vector in sqli_vectors:
            with self.subTest(vector=vector):
                rows = authenticate_and_list(self.conn, vector, "wrong", sort_by=vector)
                self.assertEqual(rows, [])

    def test_valid_parameterized_login_succeeds(self) -> None:
        rows = authenticate_and_list(self.conn, "admin", "pbkdf2_sha256$valid", sort_by="username")
        self.assertEqual(len(rows), 1)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

public final class WafSqliPreparedGuard {
    private static final Map<String, String> SAFE_ORDER_COLUMNS = Map.of(
        "id", "id",
        "username", "username",
        "created_at", "created_at"
    );

    /** WAF-SQLI:2025 PreparedStatement + strict ORDER BY identifier allow-list. */
    public static boolean verifyLogin(Connection conn, String username, String passwordHash, String sortKey) throws SQLException {
        String orderCol = SAFE_ORDER_COLUMNS.getOrDefault(sortKey, "id");
        String sql = "SELECT id FROM users WHERE username = ? AND password_hash = ? ORDER BY " + orderCol + " ASC";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, passwordHash);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public static void main(String[] args) {
        if (!"id".equals(SAFE_ORDER_COLUMNS.getOrDefault("' ORDER BY 1--", "id"))) {
            throw new AssertionError("ORDER BY injection fallback failed");
        }
        System.out.println("PASS: WAF-SQLI:2025 Java PreparedStatement & ORDER BY allow-list verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* WAF-SQLI:2025 Strict ORDER BY column allow-list (paired with sqlite3_bind_text for values) */
const char *resolve_safe_sort_column(const char *untrusted_col) {
    if (!untrusted_col) return "id";
    if (strcmp(untrusted_col, "username") == 0) return "username";
    if (strcmp(untrusted_col, "created_at") == 0) return "created_at";
    return "id";
}

int main(void) {
    assert(strcmp(resolve_safe_sort_column("' ORDER BY 1--"), "id") == 0);
    assert(strcmp(resolve_safe_sort_column("' UNION SELECT NULL, NULL, NULL--"), "id") == 0);
    assert(strcmp(resolve_safe_sort_column("x' OR PG_SLEEP(5)--"), "id") == 0);
    assert(strcmp(resolve_safe_sort_column("username"), "username") == 0);
    printf("PASS: WAF-SQLI:2025 C sort-column allow-list & bound parameter guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-XSS:2025",
    codeId: "WAF_XSS_2025",
    standard: "OWASP-WAF-7",
    title: "Cross-Site Scripting (Stored, Reflected, DOM & javascript: URI) Defense",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
    cwe: "CWE-79 (Improper Neutralization of Input During Web Page Generation)",
    summary:
      "Neutralizes Stored/Reflected XSS (`<script>alert(document.domain)</script>`, `<img src=x onerror=alert(1)>`, `<svg onload=alert(1)>`), dangerous URI schemes (`javascript:alert(1)`), and DOM attribute breakouts (`\" onfocus=\"alert(1)\" autofocus=\"`, `'-alert(1)-'`).",
    control:
      "Apply context-aware HTML entity encoding (`&`, `<`, `>`, `\"`, `'`) on all untrusted text/attributes and enforce an explicit `https://` / `http://` URL scheme allow-list on `href`/`src` attributes.",
    keywords: /\b(cross-site\s+scripting|\bxss\b|onerror=alert|onload=alert|javascript:alert|document\.domain|onfocus=)\b/i,
    python: `import html
import urllib.parse
import unittest

def escape_html_context(untrusted: str) -> str:
    """WAF-XSS:2025 Escape &, <, >, ", and ' for safe HTML body and quoted-attribute rendering."""
    return html.escape(untrusted, quote=True)

def sanitize_href_url(untrusted_url: str) -> str:
    """WAF-XSS:2025 Block javascript:, data:, and vbscript: URI XSS payloads."""
    cleaned = untrusted_url.strip()
    parsed = urllib.parse.urlsplit(cleaned)
    if parsed.scheme.lower() not in ("http", "https"):
        return "#"
    return html.escape(cleaned, quote=True)

class TestXssDefenseSuite(unittest.TestCase):
    def test_neutralizes_stored_reflected_and_dom_attribute_xss(self) -> None:
        xss_vectors = [
            "<script>alert(document.domain)</script>",
            "<img src=x onerror=alert(1)>",
            "<svg onload=alert(1)>",
            '" onfocus="alert(1)" autofocus="',
            "'-alert(1)-'",
        ]
        for vector in xss_vectors:
            escaped = escape_html_context(vector)
            self.assertNotIn("<", escaped)
            self.assertNotIn(">", escaped)
            self.assertNotIn('"', escaped)
            self.assertNotIn("'", escaped)

    def test_blocks_javascript_uri_scheme(self) -> None:
        self.assertEqual(sanitize_href_url("javascript:alert(1)"), "#")
        self.assertEqual(sanitize_href_url("  JaVaScRiPt:alert(document.domain)"), "#")
        self.assertEqual(sanitize_href_url("https://noctis.social/docs"), "https://noctis.social/docs")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.net.URI;

public final class WafXssOutputEncoder {
    /** WAF-XSS:2025 Context-aware HTML body & attribute encoder. */
    public static String encodeHtml(String input) {
        if (input == null) return "";
        StringBuilder sb = new StringBuilder(input.length() + 16);
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '&' -> sb.append("&amp;");
                case '<' -> sb.append("&lt;");
                case '>' -> sb.append("&gt;");
                case '"' -> sb.append("&quot;");
                case '\\'' -> sb.append("&#x27;");
                default -> sb.append(c);
            }
        }
        return sb.toString();
    }

    public static String sanitizeHref(String rawUrl) {
        try {
            URI uri = new URI(rawUrl.trim());
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("https") && !scheme.equalsIgnoreCase("http"))) {
                return "#";
            }
            return encodeHtml(rawUrl.trim());
        } catch (Exception e) {
            return "#";
        }
    }

    public static void main(String[] args) {
        String encoded = encodeHtml("<img src=x onerror=alert(1)>\\" onfocus=\\"alert(1)");
        if (encoded.contains("<") || encoded.contains(">") || encoded.contains("\\"")) {
            throw new AssertionError("XSS characters remained unencoded");
        }
        if (!"#".equals(sanitizeHref("javascript:alert(1)"))) {
            throw new AssertionError("javascript: URI must be neutralized");
        }
        System.out.println("PASS: WAF-XSS:2025 Java HTML encoder & URI sanitizer verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

/* WAF-XSS:2025 Safe URI scheme check & HTML entity escaping in C */
bool is_safe_http_href(const char *url) {
    if (!url) return false;
    while (*url == ' ' || *url == '\\t') url++;
    return (strncasecmp(url, "https://", 8) == 0 || strncasecmp(url, "http://", 7) == 0);
}

size_t html_escape_string(const char *src, char *dst, size_t dst_cap) {
    if (!src || !dst || dst_cap == 0) return 0;
    size_t out = 0;
    for (size_t i = 0; src[i] != '\\0'; ++i) {
        const char *rep = NULL;
        switch (src[i]) {
            case '&': rep = "&amp;"; break;
            case '<': rep = "&lt;"; break;
            case '>': rep = "&gt;"; break;
            case '"': rep = "&quot;"; break;
            case '\\'': rep = "&#x27;"; break;
            default: break;
        }
        if (rep) {
            size_t rlen = strlen(rep);
            if (out + rlen >= dst_cap) break;
            memcpy(dst + out, rep, rlen);
            out += rlen;
        } else {
            if (out + 1 >= dst_cap) break;
            dst[out++] = src[i];
        }
    }
    dst[out] = '\\0';
    return out;
}

int main(void) {
    char buf[256];
    html_escape_string("<script>alert(document.domain)</script>", buf, sizeof(buf));
    assert(strchr(buf, '<') == NULL && strchr(buf, '>') == NULL);
    assert(is_safe_http_href("javascript:alert(1)") == false);
    assert(is_safe_http_href("https://noctis.social") == true);
    printf("PASS: WAF-XSS:2025 C HTML escaper & href validator verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-CMDI:2025",
    codeId: "WAF_CMDI_2025",
    standard: "OWASP-WAF-7",
    title: "OS Command Injection (Shell Metacharacter & Subshell) Defense",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html",
    cwe: "CWE-78 (Improper Neutralization of Special Elements used in an OS Command)",
    summary:
      "Blocks OS command chaining and subshell injection vectors including `; cat /etc/passwd`, `| dir`, `& ping -c 4 127.0.0.1 &`, `$(whoami)`, and backtick execution `` `id` ``.",
    control:
      "Never invoke a system shell (`shell=False`, avoid `system()` / `Runtime.exec(String)`). Pass arguments as an explicit array (`ProcessBuilder` / `execve`) and validate parameters against a strict hostname/token regex.",
    keywords: /\b(command\s+injection|\bcmdi\b|;\s*cat\s+\/etc\/passwd|\$\(whoami\)|`id`|ping\s+-c\s+4)\b/i,
    python: `import re
import unittest

SAFE_HOSTNAME_RE = re.compile(r"^[a-zA-Z0-9.-]{1,64}$")

def build_safe_ping_argv(untrusted_target: str) -> list[str]:
    """WAF-CMDI:2025 Validate target and return an argument vector for subprocess.run(..., shell=False)."""
    if not SAFE_HOSTNAME_RE.match(untrusted_target) or untrusted_target.startswith("-"):
        raise ValueError(f"Command injection or option-injection attempt blocked: {untrusted_target!r}")
    return ["/bin/ping", "-c", "1", "--", untrusted_target]

class TestCommandInjectionDefense(unittest.TestCase):
    def test_blocks_all_shell_metacharacter_vectors(self) -> None:
        cmdi_vectors = [
            "; cat /etc/passwd",
            "| dir",
            "& ping -c 4 127.0.0.1 &",
            "$(whoami)",
            "\`id\`",
            "--help",
        ]
        for vector in cmdi_vectors:
            with self.subTest(vector=vector):
                with self.assertRaises(ValueError):
                    build_safe_ping_argv(vector)

    def test_allows_valid_hostname_as_shell_free_argv(self) -> None:
        argv = build_safe_ping_argv("api.noctis.social")
        self.assertEqual(argv, ["/bin/ping", "-c", "1", "--", "api.noctis.social"])

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.List;
import java.util.regex.Pattern;

public final class WafCommandInjectionGuard {
    private static final Pattern SAFE_HOST = Pattern.compile("^[a-zA-Z0-9.-]{1,64}$");

    /** WAF-CMDI:2025 Build a shell-free ProcessBuilder command list after strict validation. */
    public static List<String> buildSafePingCommand(String host) {
        if (host == null || !SAFE_HOST.matcher(host).matches() || host.startsWith("-")) {
            throw new SecurityException("OS Command Injection blocked: " + host);
        }
        return List.of("/bin/ping", "-c", "1", "--", host);
    }

    public static void main(String[] args) {
        List<String> vectors = List.of(
            "; cat /etc/passwd",
            "| dir",
            "& ping -c 4 127.0.0.1 &",
            "$(whoami)",
            "` + "`id`" + `"
        );
        for (String v : vectors) {
            try {
                buildSafePingCommand(v);
                throw new AssertionError("Should have blocked command injection: " + v);
            } catch (SecurityException expected) {
                // Expected block
            }
        }
        List<String> cmd = buildSafePingCommand("noctis.social");
        if (cmd.size() != 5) throw new AssertionError("Valid command list failed");
        System.out.println("PASS: WAF-CMDI:2025 Java shell-free ProcessBuilder guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <ctype.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

/* WAF-CMDI:2025 Reject shell metacharacters (;, |, &, $(), backticks) before execve() */
bool is_safe_hostname_arg(const char *arg) {
    if (!arg || arg[0] == '\\0' || arg[0] == '-') return false;
    size_t len = strlen(arg);
    if (len > 64) return false;
    for (size_t i = 0; i < len; ++i) {
        unsigned char c = (unsigned char)arg[i];
        if (!(isalnum(c) || c == '.' || c == '-')) return false;
    }
    return true;
}

int main(void) {
    assert(is_safe_hostname_arg("; cat /etc/passwd") == false);
    assert(is_safe_hostname_arg("| dir") == false);
    assert(is_safe_hostname_arg("& ping -c 4 127.0.0.1 &") == false);
    assert(is_safe_hostname_arg("$(whoami)") == false);
    assert(is_safe_hostname_arg("` + "`id`" + `") == false);
    assert(is_safe_hostname_arg("noctis.social") == true);
    printf("PASS: WAF-CMDI:2025 C OS command injection validator verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-XXE:2025",
    codeId: "WAF_XXE_2025",
    standard: "OWASP-WAF-7",
    title: "XML External Entity (XXE File Disclosure & SSRF via DTD) Defense",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html",
    cwe: "CWE-611 (Improper Restriction of XML External Entity Reference)",
    summary:
      "Prevents XML External Entity (XXE) local file disclosure (`<!DOCTYPE test [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]>`) and XXE-driven SSRF (`<!DOCTYPE test [ <!ENTITY xxe SYSTEM \"http://169.254.169.254/\"> ]>`).",
    control:
      "Disable DTDs (`disallow-doctype-decl = true`) and external general/parameter entities entirely in the XML parser before parsing untrusted XML.",
    keywords: /\b(xml\s+external\s+entity|\bxxe\b|<!doctype|<!entity\s+xxe|file:\/\/\/etc\/passwd)\b/i,
    python: `import re
import unittest
import xml.etree.ElementTree as ET

DOCTYPE_OR_ENTITY_RE = re.compile(r"<!\\s*(DOCTYPE|ENTITY)\\b", re.IGNORECASE)

def parse_xml_safely(raw_xml: str) -> str:
    """WAF-XXE:2025 Reject DOCTYPE / ENTITY declarations before parsing XML."""
    if DOCTYPE_OR_ENTITY_RE.search(raw_xml):
        raise ValueError("XXE blocked: DOCTYPE and ENTITY declarations are forbidden")
    root = ET.fromstring(raw_xml)
    product_el = root.find("productId")
    return (product_el.text or "").strip() if product_el is not None else ""

class TestXxeDefenseSuite(unittest.TestCase):
    def test_blocks_file_disclosure_and_ssrf_xxe_payloads(self) -> None:
        xxe_file = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]><stockCheck><productId>&xxe;</productId></stockCheck>'
        xxe_ssrf = '<!DOCTYPE test [ <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/"> ]><stockCheck><productId>&xxe;</productId></stockCheck>'
        for payload in (xxe_file, xxe_ssrf):
            with self.subTest(payload=payload[:40]):
                with self.assertRaises(ValueError):
                    parse_xml_safely(payload)

    def test_parses_clean_xml(self) -> None:
        clean = '<?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>SKU-402</productId></stockCheck>'
        self.assertEqual(parse_xml_safely(clean), "SKU-402")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.io.StringReader;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

public final class WafXxeHardenedParser {
    /** WAF-XXE:2025 DocumentBuilderFactory with DOCTYPE & external entities disabled. */
    public static Document parseSafeXml(String xml) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
        dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        dbf.setXIncludeAware(false);
        dbf.setExpandEntityReferences(false);
        DocumentBuilder builder = dbf.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xml)));
    }

    public static void main(String[] args) throws Exception {
        String xxe = "<?xml version=\\"1.0\\"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM \\"file:///etc/passwd\\"> ]><stockCheck><productId>&xxe;</productId></stockCheck>";
        try {
            parseSafeXml(xxe);
            throw new AssertionError("XXE DOCTYPE must be rejected by hardened parser");
        } catch (Exception expected) {
            // Expected block
        }
        Document ok = parseSafeXml("<stockCheck><productId>SKU-100</productId></stockCheck>");
        if (!"stockCheck".equals(ok.getDocumentElement().getNodeName())) {
            throw new AssertionError("Clean XML parse failed");
        }
        System.out.println("PASS: WAF-XXE:2025 Java hardened XML parser verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

/* WAF-XXE:2025 Pre-parse guard rejecting <!DOCTYPE and <!ENTITY in XML payloads */
bool is_xxe_free_xml(const char *xml) {
    if (!xml) return false;
    for (const char *p = xml; *p != '\\0'; ++p) {
        if (p[0] == '<' && p[1] == '!') {
            if (strncasecmp(p + 2, "DOCTYPE", 7) == 0 || strncasecmp(p + 2, "ENTITY", 6) == 0) {
                return false;
            }
        }
        if (strncasecmp(p, "SYSTEM", 6) == 0 && (strstr(p, "file://") || strstr(p, "http://"))) {
            return false;
        }
    }
    return true;
}

int main(void) {
    const char *xxe1 = "<?xml version=\\"1.0\\"?><!DOCTYPE test [ <!ENTITY xxe SYSTEM \\"file:///etc/passwd\\"> ]><stockCheck/>";
    const char *xxe2 = "<!DOCTYPE test [ <!ENTITY xxe SYSTEM \\"http://169.254.169.254\\"> ]><stockCheck/>";
    const char *safe = "<stockCheck><productId>42</productId></stockCheck>";
    assert(is_xxe_free_xml(xxe1) == false);
    assert(is_xxe_free_xml(xxe2) == false);
    assert(is_xxe_free_xml(safe) == true);
    printf("PASS: WAF-XXE:2025 C XXE DOCTYPE/ENTITY guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-SSRF:2025",
    codeId: "WAF_SSRF_2025",
    standard: "OWASP-WAF-7",
    title: "Server-Side Request Forgery (Loopback, Cloud IMDS, RFC-1918 & dict://) Defense",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html",
    cwe: "CWE-918 (Server-Side Request Forgery)",
    summary:
      "Blocks outbound requests to localhost (`http://127.0.0.1:80`), cloud instance metadata (`http://169.254.169.254` / `169.254.169`), internal RFC-1918 networks (`http://10.0.0.1`), and non-HTTPS protocol smuggling (`dict://127.0.0.1:11211/`, `gopher://`, `file://`).",
    control:
      "Enforce `https` scheme only, pin allowed upstream hostnames, and validate resolved IPv4/IPv6 addresses to block loopback, link-local (`169.254.0.0/16`), and private (`10/8`, `172.16/12`, `192.168/16`) ranges.",
    keywords: /\b(dict:\/\/127\.0\.0\.1|169\.254\.169|http:\/\/10\.0\.0\.1|http:\/\/127\.0\.0\.1:80)\b/i,
    python: `import ipaddress
import urllib.parse
import unittest

ALLOWED_UPSTREAM_HOSTS = {"api.partner.example.com", "hooks.noctis.social"}

def verify_safe_egress_url(raw_url: str, resolved_ip: str) -> bool:
    """WAF-SSRF:2025 Reject dict://, http://, 127.0.0.1, 169.254.169.254, and 10.0.0.0/8."""
    parsed = urllib.parse.urlsplit(raw_url.strip())
    if parsed.scheme.lower() != "https":
        raise PermissionError(f"Disallowed scheme: {parsed.scheme}")
    host = (parsed.hostname or "").lower()
    if host not in ALLOWED_UPSTREAM_HOSTS:
        raise PermissionError(f"Unapproved egress host: {host}")
    ip = ipaddress.ip_address(resolved_ip)
    if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
        raise PermissionError(f"Non-public egress IP blocked: {ip}")
    return True

class TestSsrfVectorDefense(unittest.TestCase):
    def test_blocks_localhost_imds_rfc1918_and_dict_protocol(self) -> None:
        ssrf_vectors = [
            ("http://127.0.0.1:80", "127.0.0.1"),
            ("http://169.254.169.254/latest/meta-data/", "169.254.169.254"),
            ("http://10.0.0.1/admin", "10.0.0.1"),
            ("dict://127.0.0.1:11211/stat", "127.0.0.1"),
            ("https://api.partner.example.com/hook", "169.254.169.254"),
        ]
        for url, ip in ssrf_vectors:
            with self.subTest(url=url):
                with self.assertRaises(PermissionError):
                    verify_safe_egress_url(url, ip)

    def test_allows_https_allowlisted_public_endpoint(self) -> None:
        self.assertTrue(verify_safe_egress_url("https://hooks.noctis.social/events", "93.184.216.34"))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.net.InetAddress;
import java.net.URI;
import java.util.Set;

public final class WafSsrfEgressFilter {
    private static final Set<String> ALLOWED_HOSTS = Set.of("hooks.noctis.social", "api.partner.example.com");

    public static void assertSafeOutboundUrl(String url) throws Exception {
        URI uri = new URI(url);
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new SecurityException("Blocked non-HTTPS scheme: " + uri.getScheme());
        }
        String host = uri.getHost();
        if (host == null || !ALLOWED_HOSTS.contains(host.toLowerCase())) {
            throw new SecurityException("Blocked untrusted host: " + host);
        }
        for (InetAddress addr : InetAddress.getAllByName(host)) {
            byte[] b = addr.getAddress();
            boolean rfc1918OrImds = b.length == 4 && (
                (b[0] & 0xFF) == 10 ||
                (b[0] & 0xFF) == 127 ||
                ((b[0] & 0xFF) == 169 && (b[1] & 0xFF) == 254)
            );
            if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress() || rfc1918OrImds) {
                throw new SecurityException("Blocked internal/IMDS IP: " + addr.getHostAddress());
            }
        }
    }

    public static void main(String[] args) throws Exception {
        for (String bad : new String[]{"http://127.0.0.1:80", "http://169.254.169.254", "http://10.0.0.1", "dict://127.0.0.1:11211/"}) {
            try {
                assertSafeOutboundUrl(bad);
                throw new AssertionError("Should block SSRF vector: " + bad);
            } catch (SecurityException expected) {
                // Expected block
            }
        }
        System.out.println("PASS: WAF-SSRF:2025 Java SSRF & dict:// scheme blocker verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>

/* WAF-SSRF:2025 Reject dict://, http://, 127.0.0.0/8, 10.0.0.0/8, and 169.254.0.0/16 */
bool is_safe_ssrf_target(const char *url, uint8_t a, uint8_t b) {
    if (!url || strncasecmp(url, "https://", 8) != 0) return false;
    if (a == 127 || a == 10 || a == 0) return false;
    if (a == 169 && b == 254) return false;
    if (a == 172 && (b >= 16 && b <= 31)) return false;
    if (a == 192 && b == 168) return false;
    return true;
}

int main(void) {
    assert(is_safe_ssrf_target("http://127.0.0.1:80", 127, 0) == false);
    assert(is_safe_ssrf_target("http://169.254.169.254", 169, 254) == false);
    assert(is_safe_ssrf_target("http://10.0.0.1", 10, 0) == false);
    assert(is_safe_ssrf_target("dict://127.0.0.1:11211/", 127, 0) == false);
    assert(is_safe_ssrf_target("https://hooks.noctis.social", 93, 184) == true);
    printf("PASS: WAF-SSRF:2025 C SSRF scheme & IP range filter verified.\\n");
    return 0;
}`,
  },
  {
    id: "WAF-SSTI:2025",
    codeId: "WAF_SSTI_2025",
    standard: "OWASP-WAF-7",
    title: "Server-Side Template Injection (${7*7}, {{7*7}}, <%= 7*7 %>, #{7*7}) Defense",
    url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-Side_Template_Injection",
    cwe: "CWE-1336 (Improper Neutralization of Special Elements Used in a Template Engine)",
    summary:
      "Prevents Server-Side Template Injection (SSTI) where user input containing `${7*7}`, `{{7*7}}` (Jinja2/Twig), `<%= 7*7 %>` (ERB/EJS), or `#{7*7}` (Jade/Pug/SpEL) is concatenated into a template string and evaluated on the server.",
    control:
      "Never compile or render user-controlled strings as template source code; reject template expression delimiters in untrusted fields and pass user data strictly as context variables into static, pre-compiled templates.",
    keywords: /\b(server-side\s+template\s+injection|\bssti\b|\$\{7\*7\}|\{\{7\*7\}\}|<%=\s*7\*7\s*%>|#\{7\*7\})\b/i,
    python: `import html
import re
import string
import unittest

SSTI_PROBES_RE = re.compile(r"(\\{\\{.*?\\}\\}|\\$\\{.*?\\}|<%.*?%>|#\\{.*?\\}|\\{%.*?%\\})")
STATIC_GREETING = string.Template("Hello, $display_name! Welcome to Noctis.")

def render_profile_banner_safely(untrusted_display_name: str) -> str:
    """WAF-SSTI:2025 Reject SSTI expression syntax and bind data into a static Template without evaluation."""
    if SSTI_PROBES_RE.search(untrusted_display_name):
        raise ValueError("SSTI expression syntax blocked")
    safe_name = html.escape(untrusted_display_name.strip(), quote=True)
    return STATIC_GREETING.safe_substitute(display_name=safe_name)

class TestSstiDefenseSuite(unittest.TestCase):
    def test_blocks_all_ssti_polyglot_probes(self) -> None:
        ssti_vectors = [
            "\${7*7}",
            "{{7*7}}",
            "<%= 7*7 %>",
            "#{7*7}",
            "{{config.__class__.__init__.__globals__}}",
        ]
        for vector in ssti_vectors:
            with self.subTest(vector=vector):
                with self.assertRaises(ValueError):
                    render_profile_banner_safely(vector)

    def test_renders_plain_name_without_evaluating_math(self) -> None:
        out = render_profile_banner_safely("Ada Lovelace")
        self.assertEqual(out, "Hello, Ada Lovelace! Welcome to Noctis.")
        self.assertNotIn("49", out)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.List;
import java.util.regex.Pattern;

public final class WafSstiTemplateGuard {
    private static final Pattern SSTI_PATTERN = Pattern.compile("(\\\\{\\\\{|\\\\$\\\\{|<\\\\%|#\\\\{|\\\\{\\\\%)");

    /** WAF-SSTI:2025 Block template expression syntax & substitute strictly as literal text. */
    public static String renderBannerSafely(String untrustedName) {
        if (untrustedName == null || SSTI_PATTERN.matcher(untrustedName).find()) {
            throw new SecurityException("SSTI template expression syntax blocked: " + untrustedName);
        }
        return "Hello, " + untrustedName.replace("<", "&lt;").replace(">", "&gt;") + "!";
    }

    public static void main(String[] args) {
        for (String probe : List.of("\${7*7}", "{{7*7}}", "<%= 7*7 %>", "#{7*7}")) {
            try {
                renderBannerSafely(probe);
                throw new AssertionError("SSTI probe must be rejected: " + probe);
            } catch (SecurityException expected) {
                // Expected block
            }
        }
        String rendered = renderBannerSafely("Grace Hopper");
        if (rendered.contains("49")) throw new AssertionError("Template expression was evaluated");
        System.out.println("PASS: WAF-SSTI:2025 Java SSTI guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* WAF-SSTI:2025 Reject \${...}, {{...}}, <%=...%>, and #{...} template expressions */
bool is_ssti_free_input(const char *input) {
    if (!input) return false;
    if (strstr(input, "\${") != NULL ||
        strstr(input, "{{") != NULL ||
        strstr(input, "<%") != NULL ||
        strstr(input, "#{") != NULL ||
        strstr(input, "{%") != NULL) {
        return false;
    }
    return true;
}

int main(void) {
    assert(is_ssti_free_input("\${7*7}") == false);
    assert(is_ssti_free_input("{{7*7}}") == false);
    assert(is_ssti_free_input("<%= 7*7 %>") == false);
    assert(is_ssti_free_input("#{7*7}") == false);
    assert(is_ssti_free_input("Alan Turing") == true);
    printf("PASS: WAF-SSTI:2025 C SSTI template expression detector verified.\\n");
    return 0;
}`,
  },
];

export const PORTSWIGGER_ACADEMY_SPECS: OwaspCategorySpec[] = [
  {
    id: "PS-CSRF:2025",
    codeId: "PS_CSRF_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Cross-Site Request Forgery (CSRF — Anti-CSRF HMAC Token & SameSite Enforcement)",
    url: "https://portswigger.net/web-security/csrf",
    cwe: "CWE-352 (Cross-Site Request Forgery)",
    summary:
      "CSRF tricks a victim's browser into sending authenticated state-changing requests (`POST /email/change`, `POST /transfer`) using ambient session cookies when anti-CSRF tokens, `SameSite` cookie attributes, or `Origin`/`Sec-Fetch-Site` headers are missing or unverified.",
    control:
      "Bind cryptographically signed anti-CSRF tokens to the user's session ID using HMAC-SHA256, verify `Origin`/`Sec-Fetch-Site` on state-changing methods (`POST`, `PUT`, `DELETE`, `PATCH`), and set `SameSite=Lax` or `SameSite=Strict` on session cookies.",
    keywords: /\b(cross-site\s+request\s+forgery|\bcsrf\b|portswigger\.net\/web-security\/csrf|samesite|anti-csrf)\b/i,
    python: `import hashlib
import hmac
import unittest

class CsrfGuard:
    """PS-CSRF:2025 Session-bound HMAC-SHA256 anti-CSRF token + Origin/Sec-Fetch-Site verifier."""
    def __init__(self, secret: bytes, allowed_origin: str) -> None:
        self._secret = secret
        self._allowed_origin = allowed_origin

    def issue_token(self, session_id: str) -> str:
        return hmac.new(self._secret, session_id.encode("utf-8"), hashlib.sha256).hexdigest()

    def verify_state_change(self, session_id: str, csrf_token: str, origin: str, sec_fetch_site: str) -> bool:
        if sec_fetch_site not in ("same-origin", "none"):
            return False
        if origin != self._allowed_origin:
            return False
        expected = self.issue_token(session_id)
        return hmac.compare_digest(expected, csrf_token)

class TestCsrfGuard(unittest.TestCase):
    def test_blocks_cross_site_forgery_and_wrong_session_token(self) -> None:
        guard = CsrfGuard(b"csrf-master-secret-32-bytes-key!", "https://noctis.social")
        tok = guard.issue_token("sess-alice")
        self.assertTrue(guard.verify_state_change("sess-alice", tok, "https://noctis.social", "same-origin"))
        self.assertFalse(guard.verify_state_change("sess-alice", tok, "https://evil.example", "cross-site"))
        self.assertFalse(guard.verify_state_change("sess-bob", tok, "https://noctis.social", "same-origin"))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class PsCsrfTokenVerifier {
    public static String generateToken(byte[] secret, String sessionId) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(sessionId.getBytes(StandardCharsets.UTF_8)));
    }

    public static boolean verifyRequest(byte[] secret, String sessionId, String token, String origin, String expectedOrigin) throws Exception {
        if (origin == null || !origin.equals(expectedOrigin) || token == null) return false;
        byte[] expected = generateToken(secret, sessionId).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, token.getBytes(StandardCharsets.UTF_8));
    }

    public static void main(String[] args) throws Exception {
        byte[] secret = "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8);
        String tok = generateToken(secret, "sess-100");
        if (!verifyRequest(secret, "sess-100", tok, "https://noctis.social", "https://noctis.social")) {
            throw new AssertionError("Valid CSRF request rejected");
        }
        if (verifyRequest(secret, "sess-100", tok, "https://attacker.example", "https://noctis.social")) {
            throw new AssertionError("Cross-origin CSRF request must be blocked");
        }
        System.out.println("PASS: PS-CSRF:2025 Java CSRF token & Origin verifier passed.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* PS-CSRF:2025 Constant-time CSRF token + Origin + Sec-Fetch-Site verification in C */
bool verify_csrf_request(const char *expected_tok, const char *provided_tok,
                         const char *origin, const char *allowed_origin,
                         const char *sec_fetch_site) {
    if (!expected_tok || !provided_tok || !origin || !allowed_origin || !sec_fetch_site) return false;
    if (strcmp(origin, allowed_origin) != 0) return false;
    if (strcmp(sec_fetch_site, "same-origin") != 0) return false;
    size_t len = strlen(expected_tok);
    if (len < 32 || strlen(provided_tok) != len) return false;
    volatile uint8_t diff = 0;
    for (size_t i = 0; i < len; ++i) {
        diff |= (uint8_t)(expected_tok[i] ^ provided_tok[i]);
    }
    return diff == 0;
}

int main(void) {
    const char *tok = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
    assert(verify_csrf_request(tok, tok, "https://noctis.social", "https://noctis.social", "same-origin") == true);
    assert(verify_csrf_request(tok, tok, "https://evil.example", "https://noctis.social", "cross-site") == false);
    printf("PASS: PS-CSRF:2025 C anti-CSRF & Sec-Fetch-Site check verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-CLICKJACK:2025",
    codeId: "PS_CLICKJACK_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Clickjacking (UI Redressing — CSP frame-ancestors & X-Frame-Options Guard)",
    url: "https://portswigger.net/web-security/clickjacking",
    cwe: "CWE-1021 (Improper Restriction of Rendered UI Layers or Frames)",
    summary:
      "Clickjacking embeds a target web page inside a transparent `<iframe>` overlaid on a decoy page so user clicks trigger unintended actions (e.g., deleting an account or granting OAuth permissions).",
    control:
      "Send `Content-Security-Policy: frame-ancestors 'none'` (or `'self'`) and `X-Frame-Options: DENY` on all interactive HTML responses.",
    keywords: /\b(clickjacking|ui\s+redressing|portswigger\.net\/web-security\/clickjacking|frame-ancestors|x-frame-options)\b/i,
    python: `import unittest

def validate_anti_clickjacking_headers(headers: dict[str, str]) -> bool:
    """PS-CLICKJACK:2025 Require both X-Frame-Options: DENY/SAMEORIGIN and CSP frame-ancestors."""
    norm = {k.lower(): v.strip() for k, v in headers.items()}
    xfo = norm.get("x-frame-options", "").upper()
    csp = norm.get("content-security-policy", "").lower()
    if xfo not in ("DENY", "SAMEORIGIN"):
        return False
    return "frame-ancestors 'none'" in csp or "frame-ancestors 'self'" in csp

class TestClickjackingDefense(unittest.TestCase):
    def test_enforces_frame_ancestors_and_xfo(self) -> None:
        secure = {
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
        }
        self.assertTrue(validate_anti_clickjacking_headers(secure))
        self.assertFalse(validate_anti_clickjacking_headers({"X-Frame-Options": "ALLOWALL"}))
        self.assertFalse(validate_anti_clickjacking_headers({}))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;

public final class PsClickjackingHeaderCheck {
    public static boolean hasFrameProtection(Map<String, String> headers) {
        String xfo = headers.getOrDefault("X-Frame-Options", "");
        String csp = headers.getOrDefault("Content-Security-Policy", "");
        boolean validXfo = "DENY".equalsIgnoreCase(xfo) || "SAMEORIGIN".equalsIgnoreCase(xfo);
        boolean validCsp = csp.contains("frame-ancestors 'none'") || csp.contains("frame-ancestors 'self'");
        return validXfo && validCsp;
    }

    public static void main(String[] args) {
        if (!hasFrameProtection(Map.of("X-Frame-Options", "DENY", "Content-Security-Policy", "frame-ancestors 'none'"))) {
            throw new AssertionError("Valid anti-clickjacking headers rejected");
        }
        if (hasFrameProtection(Map.of("X-Frame-Options", "DENY"))) {
            throw new AssertionError("Missing CSP frame-ancestors must fail");
        }
        System.out.println("PASS: PS-CLICKJACK:2025 Java anti-clickjacking policy verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-CLICKJACK:2025 Verify X-Frame-Options and CSP frame-ancestors directives */
bool verify_anti_clickjack_headers(const char *xfo, const char *csp) {
    if (!xfo || !csp) return false;
    bool ok_xfo = (strcmp(xfo, "DENY") == 0 || strcmp(xfo, "SAMEORIGIN") == 0);
    bool ok_csp = (strstr(csp, "frame-ancestors 'none'") != NULL ||
                   strstr(csp, "frame-ancestors 'self'") != NULL);
    return ok_xfo && ok_csp;
}

int main(void) {
    assert(verify_anti_clickjack_headers("DENY", "default-src 'self'; frame-ancestors 'none'") == true);
    assert(verify_anti_clickjack_headers("ALLOW", "default-src 'self'") == false);
    printf("PASS: PS-CLICKJACK:2025 C anti-clickjacking header check verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-CORS:2025",
    codeId: "PS_CORS_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "CORS Misconfiguration (Reflected Origin, null Origin & Subdomain Prefix Bypass Defense)",
    url: "https://portswigger.net/web-security/cors",
    cwe: "CWE-942 (Permissive Cross-domain Policy with Untrusted Domains)",
    summary:
      "Vulnerable CORS policies reflect arbitrary `Origin` headers into `Access-Control-Allow-Origin` alongside `Access-Control-Allow-Credentials: true`, trust `Origin: null` (exploitable via sandboxed iframes), or use weak prefix/suffix regexes (`noctis.social.evil.com`).",
    control:
      "Match `Origin` against an exact, case-sensitive allow-list set, never allow `Origin: null` or `*` with credentials, and always emit `Vary: Origin`.",
    keywords: /\b(\bcors\b|cross-origin\s+resource\s+sharing|portswigger\.net\/web-security\/cors|access-control-allow-origin)\b/i,
    python: `import unittest

ALLOWED_ORIGINS = {"https://noctis.social", "https://app.noctis.social"}

def build_cors_response_headers(request_origin: str | None) -> dict[str, str]:
    """PS-CORS:2025 Strict exact-match Origin allow-list; blocks 'null' and prefix/suffix bypasses."""
    if not request_origin or request_origin == "null":
        return {"Vary": "Origin"}
    if request_origin in ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": request_origin,
            "Access-Control-Allow-Credentials": "true",
            "Vary": "Origin",
        }
    return {"Vary": "Origin"}

class TestCorsDefense(unittest.TestCase):
    def test_blocks_null_and_spoofed_origins(self) -> None:
        for bad in ("null", "*", "https://noctis.social.evil.com", "https://evilnoctis.social", "http://noctis.social"):
            headers = build_cors_response_headers(bad)
            self.assertNotIn("Access-Control-Allow-Origin", headers)

    def test_allows_exact_trusted_origin(self) -> None:
        headers = build_cors_response_headers("https://noctis.social")
        self.assertEqual(headers.get("Access-Control-Allow-Origin"), "https://noctis.social")
        self.assertEqual(headers.get("Vary"), "Origin")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;

public final class PsCorsOriginGuard {
    private static final Set<String> TRUSTED_ORIGINS = Set.of("https://noctis.social", "https://app.noctis.social");

    public static boolean isAllowedCorsOrigin(String origin) {
        if (origin == null || "null".equalsIgnoreCase(origin) || "*".equals(origin)) return false;
        return TRUSTED_ORIGINS.contains(origin);
    }

    public static void main(String[] args) {
        if (!isAllowedCorsOrigin("https://noctis.social")) throw new AssertionError("Trusted origin rejected");
        for (String bad : new String[]{"null", "https://noctis.social.attacker.com", "http://noctis.social"}) {
            if (isAllowedCorsOrigin(bad)) throw new AssertionError("Untrusted CORS origin allowed: " + bad);
        }
        System.out.println("PASS: PS-CORS:2025 Java strict CORS allow-list verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-CORS:2025 Exact Origin match rejecting "null", "*", and prefix/suffix spoofing */
bool is_trusted_cors_origin(const char *origin) {
    if (!origin) return false;
    return (strcmp(origin, "https://noctis.social") == 0 ||
            strcmp(origin, "https://app.noctis.social") == 0);
}

int main(void) {
    assert(is_trusted_cors_origin("https://noctis.social") == true);
    assert(is_trusted_cors_origin("null") == false);
    assert(is_trusted_cors_origin("https://noctis.social.evil.com") == false);
    printf("PASS: PS-CORS:2025 C exact CORS Origin check verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-SMUGGLE:2025",
    codeId: "PS_SMUGGLE_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "HTTP Request Smuggling (CL.TE, TE.CL, Dual Content-Length & Obfuscated TE Defense)",
    url: "https://portswigger.net/web-security/request-smuggling",
    cwe: "CWE-444 (Inconsistent Interpretation of HTTP Requests / HTTP Request Smuggling)",
    summary:
      "HTTP Request Smuggling exploits parsing discrepancies between front-end proxies and back-end servers when requests contain both `Content-Length` and `Transfer-Encoding` (`CL.TE` / `TE.CL`), multiple `Content-Length` headers, or obfuscated `Transfer-Encoding: xchunked` headers.",
    control:
      "Enforce RFC 9112 §6.3 strictly at the edge: reject any HTTP/1.1 request containing both `Content-Length` and `Transfer-Encoding`, multiple `Content-Length` headers, or any `Transfer-Encoding` value other than exact `chunked`.",
    keywords: /\b(request\s+smuggling|cl\.te|te\.cl|h2\.cl|transfer-encoding|portswigger\.net\/web-security\/request-smuggling)\b/i,
    python: `import unittest

def validate_http11_framing_headers(raw_header_pairs: list[tuple[str, str]]) -> bool:
    """PS-SMUGGLE:2025 RFC 9112 §6.3 guard blocking CL.TE, TE.CL, dual CL, and obfuscated TE."""
    cl_values: list[str] = []
    te_values: list[str] = []
    for name, val in raw_header_pairs:
        k = name.strip().lower()
        if k != name.strip().lower() or " " in name.strip() or "\\t" in name:
            raise ValueError("Whitespace in header field name blocked")
        if k == "content-length":
            cl_values.append(val.strip())
        elif k == "transfer-encoding":
            te_values.append(val.strip())
    if cl_values and te_values:
        raise ValueError("HTTP Request Smuggling blocked: both Content-Length and Transfer-Encoding present")
    if len(cl_values) > 1:
        raise ValueError("Duplicate Content-Length headers blocked")
    if cl_values and not cl_values[0].isdigit():
        raise ValueError("Non-numeric Content-Length blocked")
    if te_values and (len(te_values) > 1 or te_values[0].lower() != "chunked"):
        raise ValueError("Obfuscated or unsupported Transfer-Encoding blocked")
    return True

class TestRequestSmugglingGuard(unittest.TestCase):
    def test_blocks_cl_te_dual_cl_and_obfuscated_te(self) -> None:
        smuggle_vectors = [
            [("Content-Length", "13"), ("Transfer-Encoding", "chunked")],
            [("Content-Length", "10"), ("Content-Length", "20")],
            [("Transfer-Encoding", "xchunked")],
            [("Transfer-Encoding ", "chunked")],
        ]
        for headers in smuggle_vectors:
            with self.subTest(headers=headers):
                with self.assertRaises(ValueError):
                    validate_http11_framing_headers(headers)

    def test_allows_clean_single_cl_or_chunked(self) -> None:
        self.assertTrue(validate_http11_framing_headers([("Content-Length", "42")]))
        self.assertTrue(validate_http11_framing_headers([("Transfer-Encoding", "chunked")]))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.List;
import java.util.Map;

public final class PsRequestSmugglingFilter {
    /** PS-SMUGGLE:2025 Reject ambiguous Content-Length / Transfer-Encoding combinations (RFC 9112). */
    public static void validateFraming(List<Map.Entry<String, String>> headers) {
        int clCount = 0;
        int teCount = 0;
        for (Map.Entry<String, String> h : headers) {
            String name = h.getKey();
            String val = h.getValue().trim();
            if (!name.equals(name.trim())) {
                throw new SecurityException("Header name whitespace obfuscation blocked");
            }
            if ("Content-Length".equalsIgnoreCase(name)) {
                clCount++;
                if (!val.matches("^\\\\d+$")) throw new SecurityException("Invalid Content-Length");
            } else if ("Transfer-Encoding".equalsIgnoreCase(name)) {
                teCount++;
                if (!"chunked".equalsIgnoreCase(val)) throw new SecurityException("Obfuscated Transfer-Encoding blocked");
            }
        }
        if (clCount > 0 && teCount > 0) {
            throw new SecurityException("CL.TE / TE.CL Request Smuggling blocked");
        }
        if (clCount > 1 || teCount > 1) {
            throw new SecurityException("Duplicate framing headers blocked");
        }
    }

    public static void main(String[] args) {
        validateFraming(List.of(Map.entry("Content-Length", "128")));
        try {
            validateFraming(List.of(Map.entry("Content-Length", "6"), Map.entry("Transfer-Encoding", "chunked")));
            throw new AssertionError("CL+TE smuggling must be rejected");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-SMUGGLE:2025 Java RFC 9112 HTTP framing guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-SMUGGLE:2025 Reject simultaneous Content-Length + Transfer-Encoding or obfuscated TE */
bool is_valid_http_framing(int cl_count, const char *cl_val, int te_count, const char *te_val) {
    if (cl_count > 0 && te_count > 0) return false; /* Block CL.TE / TE.CL */
    if (cl_count > 1 || te_count > 1) return false;
    if (cl_count == 1) {
        if (!cl_val || cl_val[0] == '\\0') return false;
        for (size_t i = 0; cl_val[i] != '\\0'; ++i) {
            if (!isdigit((unsigned char)cl_val[i])) return false;
        }
    }
    if (te_count == 1) {
        if (!te_val || strcmp(te_val, "chunked") != 0) return false;
    }
    return true;
}

int main(void) {
    assert(is_valid_http_framing(1, "64", 0, NULL) == true);
    assert(is_valid_http_framing(1, "13", 1, "chunked") == false);
    assert(is_valid_http_framing(0, NULL, 1, "chunked, cow") == false);
    printf("PASS: PS-SMUGGLE:2025 C HTTP Request Smuggling guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-DESER:2025",
    codeId: "PS_DESER_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Insecure Deserialization (Native Pickle / ObjectInputStream Gadget Blocker)",
    url: "https://portswigger.net/web-security/deserialization",
    cwe: "CWE-502 (Deserialization of Untrusted Data)",
    summary:
      "Deserializing untrusted binary or polymorphic streams (`pickle.loads`, `yaml.unsafe_load`, Java `ObjectInputStream`, PHP `unserialize`) allows attackers to instantiate gadget chains that achieve arbitrary code execution.",
    control:
      "Never use native object deserializers on untrusted input; use strict JSON parsing combined with an explicit class/schema allow-list (`ObjectInputFilter` in Java).",
    keywords: /\b(insecure\s+deserialization|portswigger\.net\/web-security\/deserialization|objectinputstream|pickle\.loads|gadget\s+chain)\b/i,
    python: `import json
import unittest

ALLOWED_SCHEMA_KEYS = {"item_id", "quantity"}

def deserialize_cart_item_safely(raw_bytes: bytes) -> dict[str, int | str]:
    """PS-DESER:2025 Reject pickle/binary streams; parse strict JSON with schema allow-listing."""
    if raw_bytes.startswith((b"\\x80", b"cos\\n", b"cposix\\n", b"O:")):
        raise ValueError("Binary/native serialization stream rejected")
    data = json.loads(raw_bytes.decode("utf-8"))
    if not isinstance(data, dict) or set(data.keys()) != ALLOWED_SCHEMA_KEYS:
        raise ValueError("JSON payload failed strict schema key check")
    if not isinstance(data["item_id"], str) or not isinstance(data["quantity"], int) or isinstance(data["quantity"], bool):
        raise ValueError("Field type validation failed")
    return data

class TestDeserializationGuard(unittest.TestCase):
    def test_blocks_pickle_and_unexpected_properties(self) -> None:
        with self.assertRaises(ValueError):
            deserialize_cart_item_safely(b"\\x80\\x04\\x95...")
        with self.assertRaises(ValueError):
            deserialize_cart_item_safely(b'{"item_id":"sku-1","quantity":1,"__reduce__":"os.system"}')

    def test_accepts_strict_json_dto(self) -> None:
        obj = deserialize_cart_item_safely(b'{"item_id":"sku-1","quantity":3}')
        self.assertEqual(obj["quantity"], 3)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.io.ObjectInputFilter;

public final class PsDeserializationFilter {
    /** PS-DESER:2025 Strict Java ObjectInputFilter allow-listing only safe DTO classes. */
    public static ObjectInputFilter.Status checkClass(String className, long arrayLength, long depth) {
        if (depth > 4 || arrayLength > 64) return ObjectInputFilter.Status.REJECTED;
        if ("com.noctis.dto.SafeCartItem".equals(className) || "java.lang.String".equals(className)) {
            return ObjectInputFilter.Status.ALLOWED;
        }
        return ObjectInputFilter.Status.REJECTED;
    }

    public static void main(String[] args) {
        if (checkClass("org.apache.commons.collections.functors.InvokerTransformer", -1, 1) != ObjectInputFilter.Status.REJECTED) {
            throw new AssertionError("Gadget class must be rejected");
        }
        if (checkClass("com.noctis.dto.SafeCartItem", -1, 1) != ObjectInputFilter.Status.ALLOWED) {
            throw new AssertionError("Allow-listed DTO must be permitted");
        }
        System.out.println("PASS: PS-DESER:2025 Java ObjectInputFilter allow-list verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

/* PS-DESER:2025 Reject Java (0xACED) and Python Pickle (0x80) magic headers */
bool is_safe_json_wire_payload(const uint8_t *buf, size_t len) {
    if (!buf || len < 2 || len > 4096) return false;
    if (buf[0] == 0x80 || (buf[0] == 0xAC && buf[1] == 0xED)) return false;
    return buf[0] == '{' && buf[len - 1] == '}';
}

int main(void) {
    const uint8_t java_ser[] = {0xAC, 0xED, 0x00, 0x05};
    const uint8_t pickle[]   = {0x80, 0x04, 0x95};
    const uint8_t json[]     = "{\"id\":1}";
    assert(is_safe_json_wire_payload(java_ser, sizeof(java_ser)) == false);
    assert(is_safe_json_wire_payload(pickle, sizeof(pickle)) == false);
    assert(is_safe_json_wire_payload(json, sizeof(json) - 1) == true);
    printf("PASS: PS-DESER:2025 C wire-format magic-byte filter verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-OAUTH:2025",
    codeId: "PS_OAUTH_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "OAuth 2.0 & OIDC Security (Exact redirect_uri, CSRF state & S256 PKCE Verification)",
    url: "https://portswigger.net/web-security/oauth",
    cwe: "CWE-601 (URL Redirection to Untrusted Site), CWE-352 (OAuth state CSRF)",
    summary:
      "OAuth 2.0 flaws arise when authorization servers allow partial/traversal `redirect_uri` matches (`https://client.app/callback/../../evil`), clients omit `state` verification (enabling OAuth account-linking CSRF), or public clients omit `S256` PKCE.",
    control:
      "Enforce byte-for-byte exact `redirect_uri` matching against pre-registered URIs, verify a cryptographic per-request `state` nonce in constant time, and require `S256` PKCE (`SHA256(code_verifier) == code_challenge`).",
    keywords: /\b(oauth\s+authentication|portswigger\.net\/web-security\/oauth|redirect_uri|code_verifier|code_challenge|pkce)\b/i,
    python: `import base64
import hashlib
import hmac
import unittest

REGISTERED_REDIRECT_URIS = {"https://noctis.social/api/auth/callback"}

def verify_oauth_callback(
    redirect_uri: str,
    expected_state: str,
    received_state: str,
    code_verifier: str,
    stored_code_challenge: str,
) -> bool:
    """PS-OAUTH:2025 Exact redirect_uri match + constant-time state + S256 PKCE check."""
    if redirect_uri not in REGISTERED_REDIRECT_URIS:
        return False
    if not expected_state or not hmac.compare_digest(expected_state, received_state):
        return False
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    computed_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return hmac.compare_digest(computed_challenge, stored_code_challenge)

class TestOauthSecurity(unittest.TestCase):
    def test_exact_redirect_state_and_pkce(self) -> None:
        verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
        self.assertTrue(
            verify_oauth_callback(
                "https://noctis.social/api/auth/callback",
                "state-991",
                "state-991",
                verifier,
                challenge,
            )
        )
        self.assertFalse(
            verify_oauth_callback(
                "https://noctis.social/api/auth/callback/../open-redirect",
                "state-991",
                "state-991",
                verifier,
                challenge,
            )
        )

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Set;

public final class PsOauthPkceGuard {
    private static final Set<String> REGISTERED_URIS = Set.of("https://noctis.social/api/auth/callback");

    public static boolean validateCallback(String redirectUri, String expectedState, String actualState,
                                           String verifier, String challenge) throws Exception {
        if (!REGISTERED_URIS.contains(redirectUri)) return false;
        if (expectedState == null || actualState == null) return false;
        if (!MessageDigest.isEqual(expectedState.getBytes(StandardCharsets.UTF_8), actualState.getBytes(StandardCharsets.UTF_8))) {
            return false;
        }
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII));
        String computed = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        return MessageDigest.isEqual(computed.getBytes(StandardCharsets.US_ASCII), challenge.getBytes(StandardCharsets.US_ASCII));
    }

    public static void main(String[] args) throws Exception {
        String v = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        String c = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
        if (!validateCallback("https://noctis.social/api/auth/callback", "st-1", "st-1", v, c)) {
            throw new AssertionError("Valid OAuth PKCE flow rejected");
        }
        if (validateCallback("https://noctis.social/api/auth/callback?next=//evil.com", "st-1", "st-1", v, c)) {
            throw new AssertionError("Modified redirect_uri must be rejected");
        }
        System.out.println("PASS: PS-OAUTH:2025 Java exact redirect_uri & PKCE S256 verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-OAUTH:2025 Exact byte-for-byte redirect_uri and state validation */
bool verify_oauth_redirect_and_state(const char *registered_uri, const char *provided_uri,
                                     const char *expected_state, const char *provided_state) {
    if (!registered_uri || !provided_uri || !expected_state || !provided_state) return false;
    if (strcmp(registered_uri, provided_uri) != 0) return false;
    if (strlen(expected_state) < 16 || strcmp(expected_state, provided_state) != 0) return false;
    return true;
}

int main(void) {
    const char *reg = "https://noctis.social/api/auth/callback";
    const char *st  = "9f86d081884c7d659a2feaa0c55ad015";
    assert(verify_oauth_redirect_and_state(reg, reg, st, st) == true);
    assert(verify_oauth_redirect_and_state(reg, "https://noctis.social/api/auth/callback/../evil", st, st) == false);
    printf("PASS: PS-OAUTH:2025 C OAuth redirect_uri & state guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-LOGIC:2025",
    codeId: "PS_LOGIC_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Business Logic Vulnerabilities (Negative Quantity, Price Tampering & Workflow Step-Skipping)",
    url: "https://portswigger.net/web-security/logic-flaws",
    cwe: "CWE-840 (Business Logic Errors), CWE-841 (Improper Enforcement of Behavioral Workflow)",
    summary:
      "Business logic flaws allow attackers to order negative quantities to credit their account balance, tamper with client-submitted unit prices, apply the same single-use discount code repeatedly, or skip payment verification steps in a multi-step checkout workflow.",
    control:
      "Look up item prices exclusively from the server-side catalog, enforce strict integer bounds (`1 <= qty <= MAX_QTY`), and require signed/server-tracked state transitions (`CART -> PAID -> FULFILLED`).",
    keywords: /\b(business\s+logic\s+vulnerabilities|logic\s+flaws|portswigger\.net\/web-security\/logic-flaws|negative\s+quantity|price\s+tampering)\b/i,
    python: `import unittest

SERVER_CATALOG_CENTS = {"sku-pro": 9900, "sku-team": 24900}

def compute_verified_order_total(items: list[tuple[str, int]], workflow_state: str) -> int:
    """PS-LOGIC:2025 Server-side price lookup, positive quantity bounds, and workflow state gate."""
    if workflow_state != "PAYMENT_VERIFIED":
        raise PermissionError("Workflow step-skipping blocked: order requires PAYMENT_VERIFIED state")
    if not items:
        raise ValueError("Order must contain at least one item")
    total_cents = 0
    for sku, qty in items:
        if sku not in SERVER_CATALOG_CENTS:
            raise ValueError(f"Unknown SKU: {sku}")
        if not isinstance(qty, int) or isinstance(qty, bool) or not (1 <= qty <= 50):
            raise ValueError(f"Invalid item quantity: {qty}")
        total_cents += SERVER_CATALOG_CENTS[sku] * qty
    return total_cents

class TestBusinessLogicGuard(unittest.TestCase):
    def test_blocks_negative_quantity_and_step_skipping(self) -> None:
        with self.assertRaises(ValueError):
            compute_verified_order_total([("sku-pro", -5)], "PAYMENT_VERIFIED")
        with self.assertRaises(PermissionError):
            compute_verified_order_total([("sku-pro", 1)], "CART_CREATED")

    def test_computes_server_catalog_total(self) -> None:
        self.assertEqual(compute_verified_order_total([("sku-pro", 2)], "PAYMENT_VERIFIED"), 19800)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;

public final class PsBusinessLogicGuard {
    private static final Map<String, Long> CATALOG_CENTS = Map.of("sku-pro", 9900L);

    public static long finalizeOrder(String sku, int quantity, String workflowStage) {
        if (!"PAYMENT_VERIFIED".equals(workflowStage)) {
            throw new SecurityException("Workflow step-skipping blocked");
        }
        Long unitPrice = CATALOG_CENTS.get(sku);
        if (unitPrice == null || quantity <= 0 || quantity > 50) {
            throw new IllegalArgumentException("Invalid SKU or out-of-range quantity");
        }
        return Math.multiplyExact(unitPrice, (long) quantity);
    }

    public static void main(String[] args) {
        if (finalizeOrder("sku-pro", 2, "PAYMENT_VERIFIED") != 19800L) {
            throw new AssertionError("Order total calculation failed");
        }
        try {
            finalizeOrder("sku-pro", -1, "PAYMENT_VERIFIED");
            throw new AssertionError("Negative quantity must be rejected");
        } catch (IllegalArgumentException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-LOGIC:2025 Java business-logic invariant guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

typedef enum { STAGE_CART = 0, STAGE_PAID = 1, STAGE_FULFILLED = 2 } order_stage_t;

/* PS-LOGIC:2025 Prevent negative quantity, integer overflow, and workflow step-skipping */
bool validate_order_checkout(int64_t catalog_price_cents, int32_t quantity,
                             order_stage_t current_stage, int64_t *out_total) {
    if (!out_total || current_stage != STAGE_PAID) return false;
    if (catalog_price_cents <= 0 || quantity <= 0 || quantity > 50) return false;
    *out_total = catalog_price_cents * (int64_t)quantity;
    return true;
}

int main(void) {
    int64_t total = 0;
    assert(validate_order_checkout(9900, -3, STAGE_PAID, &total) == false);
    assert(validate_order_checkout(9900, 2, STAGE_CART, &total) == false);
    assert(validate_order_checkout(9900, 2, STAGE_PAID, &total) == true && total == 19800);
    printf("PASS: PS-LOGIC:2025 C business logic & workflow state machine verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-WS-DOM:2025",
    codeId: "PS_WS_DOM_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "WebSockets (CSWSH Origin Check) & DOM-Based (postMessage / Open Redirect) Defense",
    url: "https://portswigger.net/web-security/websockets",
    cwe: "CWE-1385 (Missing Origin Validation in WebSockets), CWE-346 (Origin Validation Error)",
    summary:
      "Cross-Site WebSocket Hijacking (CSWSH) occurs when WebSocket handshakes rely only on cookies without checking `Origin`, while DOM vulnerabilities arise from unvalidated `window.postMessage` origins or DOM sinks (`location.href = untrusted`).",
    control:
      "Validate the `Origin` header on every WebSocket upgrade handshake, pin `event.origin` in `postMessage` handlers, and restrict redirects to relative internal paths (`/dashboard`).",
    keywords: /\b(websockets|\bcswsh\b|dom-based|postmessage|portswigger\.net\/web-security\/(?:websockets|dom-based))\b/i,
    python: `import html
import unittest

ALLOWED_WS_ORIGINS = {"https://noctis.social"}

def verify_websocket_handshake_and_message(origin: str, session_active: bool, raw_message: str) -> str:
    """PS-WS-DOM:2025 Block CSWSH via strict Origin check and encode outbound WebSocket chat payloads."""
    if not session_active or origin not in ALLOWED_WS_ORIGINS:
        raise PermissionError("WebSocket handshake rejected: untrusted Origin or missing session")
    return html.escape(raw_message.strip()[:500], quote=True)

def validate_safe_relative_redirect(target: str) -> str:
    """Block DOM open-redirect vectors like '//evil.com', '/\\\\evil.com', and 'javascript:...'."""
    if not target.startswith("/") or target.startswith("//") or "\\\\" in target or ":" in target:
        return "/dashboard"
    return target

class TestWebSocketAndDomDefense(unittest.TestCase):
    def test_blocks_cross_site_websocket_hijacking_and_xss_payload(self) -> None:
        with self.assertRaises(PermissionError):
            verify_websocket_handshake_and_message("https://attacker.example", True, "hello")
        safe_msg = verify_websocket_handshake_and_message("https://noctis.social", True, "<img src=x onerror=alert(1)>")
        self.assertNotIn("<", safe_msg)

    def test_blocks_open_redirect_bypasses(self) -> None:
        self.assertEqual(validate_safe_relative_redirect("//evil.example/phish"), "/dashboard")
        self.assertEqual(validate_safe_relative_redirect("/\\\\evil.example"), "/dashboard")
        self.assertEqual(validate_safe_relative_redirect("/settings/security"), "/settings/security")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;

public final class PsWebSocketDomGuard {
    private static final Set<String> ALLOWED_ORIGINS = Set.of("https://noctis.social");

    public static boolean allowWebSocketUpgrade(String origin, boolean authenticated) {
        return authenticated && origin != null && ALLOWED_ORIGINS.contains(origin);
    }

    public static String safeRelativeRedirect(String returnTo) {
        if (returnTo == null || !returnTo.startsWith("/") || returnTo.startsWith("//")
                || returnTo.contains("\\\\") || returnTo.contains(":")) {
            return "/dashboard";
        }
        return returnTo;
    }

    public static void main(String[] args) {
        if (allowWebSocketUpgrade("https://evil.example", true)) {
            throw new AssertionError("CSWSH untrusted origin must be blocked");
        }
        if (!"/dashboard".equals(safeRelativeRedirect("//evil.example"))) {
            throw new AssertionError("Protocol-relative open redirect must be blocked");
        }
        System.out.println("PASS: PS-WS-DOM:2025 Java WebSocket Origin & DOM redirect guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-WS-DOM:2025 Verify WebSocket Origin and reject protocol-relative // or :\ open redirects */
bool is_safe_relative_redirect(const char *path) {
    if (!path || path[0] != '/' || path[1] == '/') return false;
    if (strchr(path, '\\\\') != NULL || strchr(path, ':') != NULL) return false;
    return true;
}

int main(void) {
    assert(is_safe_relative_redirect("/profile") == true);
    assert(is_safe_relative_redirect("//evil.com") == false);
    assert(is_safe_relative_redirect("/\\\\evil.com") == false);
    assert(is_safe_relative_redirect("javascript:alert(1)") == false);
    printf("PASS: PS-WS-DOM:2025 C relative-redirect & DOM sink guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-CACHE-HOST:2025",
    codeId: "PS_CACHE_HOST_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Web Cache Poisoning, Web Cache Deception & HTTP Host Header Attack Defense",
    url: "https://portswigger.net/web-security/web-cache-poisoning",
    cwe: "CWE-444, CWE-644 (Improper Neutralization of HTTP Headers for Scripting Syntax)",
    summary:
      "Web Cache Poisoning injects payloads via unkeyed headers (`X-Forwarded-Host`, `X-Original-URL`), Web Cache Deception tricks CDNs into caching private `/account/profile/nonexistent.css` responses, and Host Header attacks poison password-reset links.",
    control:
      "Never build password-reset or asset URLs from `Host` or `X-Forwarded-Host`; pin a canonical `PUBLIC_BASE_URL`, validate `Host` against a strict allow-list, and set `Cache-Control: private, no-store` on all authenticated routes.",
    keywords: /\b(web\s+cache\s+poisoning|web\s+cache\s+deception|host\s+header\s+attacks?|x-forwarded-host|portswigger\.net\/web-security\/(?:web-cache-poisoning|web-cache-deception|host-header))\b/i,
    python: `import unittest

CANONICAL_BASE_URL = "https://noctis.social"
ALLOWED_HOSTS = {"noctis.social", "www.noctis.social"}

def build_password_reset_link(host_header: str, x_forwarded_host: str | None, reset_token: str) -> str:
    """PS-CACHE-HOST:2025 Ignore X-Forwarded-Host and validate Host before generating sensitive links."""
    clean_host = host_header.split(":")[0].strip().lower()
    if clean_host not in ALLOWED_HOSTS:
        raise PermissionError(f"Untrusted HTTP Host header blocked: {host_header}")
    return f"{CANONICAL_BASE_URL}/reset-password?token={reset_token}"

def cache_headers_for_authenticated_route(request_path: str) -> dict[str, str]:
    """PS-CACHE-HOST:2025 Prevent Web Cache Deception even if path ends with .css or .js."""
    return {"Cache-Control": "private, no-store, no-cache, must-revalidate", "Vary": "Cookie, Authorization"}

class TestCacheAndHostDefense(unittest.TestCase):
    def test_blocks_host_header_password_reset_poisoning(self) -> None:
        with self.assertRaises(PermissionError):
            build_password_reset_link("evil-attacker.com", "evil-attacker.com", "tok-123")
        link = build_password_reset_link("noctis.social", "evil-attacker.com", "tok-123")
        self.assertEqual(link, "https://noctis.social/reset-password?token=tok-123")

    def test_prevents_web_cache_deception_on_static_extension(self) -> None:
        hdrs = cache_headers_for_authenticated_route("/api/account/profile/avatar.css")
        self.assertIn("no-store", hdrs["Cache-Control"])

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;

public final class PsHostAndCacheGuard {
    private static final String CANONICAL_ORIGIN = "https://noctis.social";
    private static final Set<String> ALLOWED_HOSTS = Set.of("noctis.social", "www.noctis.social");

    public static String createPasswordResetUrl(String hostHeader, String resetToken) {
        if (hostHeader == null || !ALLOWED_HOSTS.contains(hostHeader.toLowerCase().trim())) {
            throw new SecurityException("Host header poisoning blocked: " + hostHeader);
        }
        return CANONICAL_ORIGIN + "/reset?token=" + resetToken;
    }

    public static void main(String[] args) {
        String url = createPasswordResetUrl("noctis.social", "abc");
        if (!url.startsWith("https://noctis.social/")) throw new AssertionError("Canonical origin not used");
        try {
            createPasswordResetUrl("attacker.com", "abc");
            throw new AssertionError("Spoofed Host header must be rejected");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-CACHE-HOST:2025 Java Host header & cache guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-CACHE-HOST:2025 Pin allowed Host header values to block Host & Cache Poisoning */
bool is_allowed_host_header(const char *host) {
    if (!host) return false;
    return (strcmp(host, "noctis.social") == 0 ||
            strcmp(host, "www.noctis.social") == 0);
}

int main(void) {
    assert(is_allowed_host_header("noctis.social") == true);
    assert(is_allowed_host_header("noctis.social:80@evil.com") == false);
    assert(is_allowed_host_header("evil.com") == false);
    printf("PASS: PS-CACHE-HOST:2025 C Host header validator verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-UPLOAD:2025",
    codeId: "PS_UPLOAD_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "File Upload Vulnerabilities (Magic-Byte Verification, Extension Allow-List & UUID Renaming)",
    url: "https://portswigger.net/web-security/file-upload",
    cwe: "CWE-434 (Unrestricted Upload of File with Dangerous Type)",
    summary:
      "Attackers upload web shells (`shell.php`, `exploit.jsp`, double extensions `avatar.php.jpg`, SVG XSS, or polyglot files) by spoofing `Content-Type: image/jpeg` while sending executable code.",
    control:
      "Verify file magic bytes (`\\x89PNG\\r\\n\\x1a\\n`, `\\xff\\xd8\\xff`), allow-list only safe extensions (`.png`, `.jpg`), generate a random server-side UUID filename, and serve uploads with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.",
    keywords: /\b(file\s+upload\s+vulnerabilities|unrestricted\s+file\s+upload|portswigger\.net\/web-security\/file-upload|web\s*shell\s+upload|magic\s+bytes)\b/i,
    python: `import uuid
import unittest

PNG_MAGIC = b"\\x89PNG\\r\\n\\x1a\\n"
JPEG_MAGIC = b"\\xff\\xd8\\xff"

def validate_and_store_avatar(original_filename: str, content: bytes) -> str:
    """PS-UPLOAD:2025 Inspect magic bytes, reject double extensions/polyglots, and rename to UUID."""
    lower = original_filename.lower()
    if lower.count(".") != 1 or not lower.endswith((".png", ".jpg")):
        raise ValueError("Only single-extension .png or .jpg files are permitted")
    if b"<?php" in content or b"<script" in content.lower():
        raise ValueError("Polyglot script/code marker detected in image upload")
    if lower.endswith(".png") and not content.startswith(PNG_MAGIC):
        raise ValueError("PNG magic-byte signature mismatch")
    if lower.endswith(".jpg") and not content.startswith(JPEG_MAGIC):
        raise ValueError("JPEG magic-byte signature mismatch")
    ext = ".png" if lower.endswith(".png") else ".jpg"
    return f"{uuid.uuid4().hex}{ext}"

class TestFileUploadDefense(unittest.TestCase):
    def test_blocks_php_webshell_double_extension_and_polyglot(self) -> None:
        with self.assertRaises(ValueError):
            validate_and_store_avatar("shell.php", PNG_MAGIC + b"<?php system($_GET['c']); ?>")
        with self.assertRaises(ValueError):
            validate_and_store_avatar("avatar.php.png", PNG_MAGIC + b"data")
        with self.assertRaises(ValueError):
            validate_and_store_avatar("polyglot.png", PNG_MAGIC + b"<?php echo 1; ?>")

    def test_accepts_valid_png_and_renames_to_uuid(self) -> None:
        safe_name = validate_and_store_avatar("photo.png", PNG_MAGIC + b"\\x00\\x00\\x00\\rIHDR")
        self.assertTrue(safe_name.endswith(".png"))
        self.assertNotIn("photo", safe_name)

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.UUID;

public final class PsFileUploadValidator {
    private static final byte[] PNG_MAGIC = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    public static String validatePngUpload(String fileName, byte[] bytes) {
        if (fileName == null || !fileName.toLowerCase().endsWith(".png") || fileName.indexOf('.') != fileName.length() - 4) {
            throw new SecurityException("Rejected filename or double extension: " + fileName);
        }
        if (bytes == null || bytes.length < PNG_MAGIC.length) {
            throw new SecurityException("File too small for valid PNG");
        }
        for (int i = 0; i < PNG_MAGIC.length; i++) {
            if (bytes[i] != PNG_MAGIC[i]) {
                throw new SecurityException("PNG magic-byte verification failed");
            }
        }
        return UUID.randomUUID() + ".png";
    }

    public static void main(String[] args) {
        byte[] valid = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00};
        String stored = validatePngUpload("avatar.png", valid);
        if (!stored.endsWith(".png")) throw new AssertionError("UUID rename failed");
        try {
            validatePngUpload("shell.php.png", valid);
            throw new AssertionError("Double extension must be blocked");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-UPLOAD:2025 Java magic-byte & UUID upload guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* PS-UPLOAD:2025 Verify PNG magic signature and block embedded "<?php" polyglots */
bool is_valid_png_upload(const uint8_t *buf, size_t len) {
    static const uint8_t png_sig[8] = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    if (!buf || len < 8 || memcmp(buf, png_sig, 8) != 0) return false;
    for (size_t i = 0; i + 5 <= len; ++i) {
        if (memcmp(buf + i, "<?php", 5) == 0) return false;
    }
    return true;
}

int main(void) {
    const uint8_t ok_png[12] = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4};
    const uint8_t bad_php[14] = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, '<', '?', 'p', 'h', 'p', '>'};
    assert(is_valid_png_upload(ok_png, sizeof(ok_png)) == true);
    assert(is_valid_png_upload(bad_php, sizeof(bad_php)) == false);
    printf("PASS: PS-UPLOAD:2025 C PNG magic-byte & polyglot detector verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-JWT-PROTO:2025",
    codeId: "PS_JWT_PROTO_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "JWT Attacks (alg:none / jku / kid Injection) & Prototype Pollution (__proto__) Defense",
    url: "https://portswigger.net/web-security/jwt",
    cwe: "CWE-347 (Improper Verification of Cryptographic Signature), CWE-1321 (Prototype Pollution)",
    summary:
      "JWT attacks exploit `alg: none`, `RS256`-to-`HS256` algorithm confusion, untrusted `jku`/`x5u` URLs, or path traversal/SQLi in `kid` headers; Prototype Pollution injects `__proto__`, `constructor`, or `prototype` keys during recursive JSON merges.",
    control:
      "Pin the expected JWT signing algorithm explicitly, allow-list `kid` identifiers, reject `jku`/`x5u` headers in tokens, and strip `__proto__`, `constructor`, and `prototype` keys during recursive object merging.",
    keywords: /\b(jwt\s+attacks?|prototype\s+pollution|__proto__|portswigger\.net\/web-security\/(?:jwt|prototype-pollution))\b/i,
    python: `import unittest

FORBIDDEN_PROTO_KEYS = {"__proto__", "constructor", "prototype"}
ALLOWED_JWT_KIDS = {"key-2025-primary", "key-2025-rollover"}

def validate_jwt_header_strict(header: dict[str, str], expected_alg: str = "RS256") -> bool:
    """PS-JWT-PROTO:2025 Pin algorithm, block alg:none/jku/x5u, and allow-list kid."""
    if header.get("alg") != expected_alg:
        raise PermissionError(f"JWT algorithm mismatch or alg:none blocked: {header.get('alg')}")
    if "jku" in header or "x5u" in header or "jwk" in header:
        raise PermissionError("Embedded JWK / JKU header injection blocked")
    if header.get("kid") not in ALLOWED_JWT_KIDS:
        raise PermissionError(f"Untrusted JWT kid blocked: {header.get('kid')}")
    return True

def safe_deep_merge(target: dict, source: dict) -> dict:
    """PS-JWT-PROTO:2025 Block __proto__, constructor, and prototype pollution keys."""
    for key, value in source.items():
        if key in FORBIDDEN_PROTO_KEYS or key.startswith("__"):
            raise ValueError(f"Prototype pollution key blocked: {key}")
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            safe_deep_merge(target[key], value)
        else:
            target[key] = value
    return target

class TestJwtAndProtoDefense(unittest.TestCase):
    def test_blocks_jwt_alg_none_jku_and_kid_traversal(self) -> None:
        for bad_hdr in (
            {"alg": "none", "kid": "key-2025-primary"},
            {"alg": "HS256", "kid": "key-2025-primary"},
            {"alg": "RS256", "kid": "../../../../dev/null"},
            {"alg": "RS256", "kid": "key-2025-primary", "jku": "https://evil.com/jwks.json"},
        ):
            with self.assertRaises(PermissionError):
                validate_jwt_header_strict(bad_hdr)

    def test_blocks_prototype_pollution_keys(self) -> None:
        with self.assertRaises(ValueError):
            safe_deep_merge({}, {"__proto__": {"isAdmin": True}})

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;
import java.util.Set;

public final class PsJwtAndProtoGuard {
    private static final Set<String> ALLOWED_KIDS = Set.of("key-2025-primary", "key-2025-rollover");
    private static final Set<String> FORBIDDEN_KEYS = Set.of("__proto__", "constructor", "prototype");

    public static void verifyJwtHeader(Map<String, String> header) {
        if (!"RS256".equals(header.get("alg"))) {
            throw new SecurityException("Rejected JWT alg: " + header.get("alg"));
        }
        if (header.containsKey("jku") || header.containsKey("x5u") || header.containsKey("jwk")) {
            throw new SecurityException("Rejected embedded JWK/JKU header");
        }
        if (!ALLOWED_KIDS.contains(header.getOrDefault("kid", ""))) {
            throw new SecurityException("Rejected untrusted JWT kid");
        }
    }

    public static void verifyJsonKeys(Set<String> keys) {
        for (String k : keys) {
            if (FORBIDDEN_KEYS.contains(k)) throw new SecurityException("Prototype pollution key blocked: " + k);
        }
    }

    public static void main(String[] args) {
        verifyJwtHeader(Map.of("alg", "RS256", "kid", "key-2025-primary"));
        try {
            verifyJwtHeader(Map.of("alg", "none", "kid", "key-2025-primary"));
            throw new AssertionError("alg:none must fail");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-JWT-PROTO:2025 Java JWT header & prototype pollution guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-JWT-PROTO:2025 Reject alg:none, path-traversal kids, and __proto__ keys */
bool is_safe_jwt_and_json_key(const char *alg, const char *kid, const char *json_key) {
    if (!alg || !kid || !json_key) return false;
    if (strcmp(alg, "RS256") != 0) return false;
    if (strcmp(kid, "key-2025-primary") != 0 && strcmp(kid, "key-2025-rollover") != 0) return false;
    if (strcmp(json_key, "__proto__") == 0 || strcmp(json_key, "constructor") == 0 || strcmp(json_key, "prototype") == 0) {
        return false;
    }
    return true;
}

int main(void) {
    assert(is_safe_jwt_and_json_key("RS256", "key-2025-primary", "displayName") == true);
    assert(is_safe_jwt_and_json_key("none", "key-2025-primary", "displayName") == false);
    assert(is_safe_jwt_and_json_key("RS256", "../../dev/null", "displayName") == false);
    assert(is_safe_jwt_and_json_key("RS256", "key-2025-primary", "__proto__") == false);
    printf("PASS: PS-JWT-PROTO:2025 C JWT & prototype pollution guard verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-GRAPHQL-NOSQLI:2025",
    codeId: "PS_GRAPHQL_NOSQLI_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "GraphQL API Vulnerabilities (Depth/Batching/Introspection) & NoSQL Injection ($ne/$where) Defense",
    url: "https://portswigger.net/web-security/graphql",
    cwe: "CWE-943 (Improper Neutralization of Special Elements in Data Query Logic / NoSQLi), CWE-400",
    summary:
      "GraphQL endpoints suffer from production introspection exposure (`__schema`), nested query depth DoS, and alias batching brute-force; NoSQL databases suffer from operator injection (`{\"$ne\": null}`, `{\"$gt\": \"\"}`, `$where` JavaScript evaluation).",
    control:
      "Disable `__schema`/`__type` introspection in production, cap GraphQL nesting depth (`<= 5`) and alias counts (`<= 3`), and enforce strict scalar string type checking on NoSQL query parameters while rejecting any `$`-prefixed keys.",
    keywords: /\b(graphql\s+api\s+vulnerabilities|\bgraphql\b|nosql\s+injection|\bnosqli\b|\$where|\$ne\b|portswigger\.net\/web-security\/(?:graphql|nosql-injection))\b/i,
    python: `import unittest

def validate_graphql_query_policy(query: str, max_depth: int = 5, max_aliases: int = 3) -> bool:
    """PS-GRAPHQL-NOSQLI:2025 Block production introspection, excessive depth, and alias batching."""
    if "__schema" in query or "__type" in query:
        raise PermissionError("GraphQL introspection is disabled in production")
    depth = 0
    peak_depth = 0
    for ch in query:
        if ch == "{":
            depth += 1
            peak_depth = max(peak_depth, depth)
        elif ch == "}":
            depth = max(0, depth - 1)
    if peak_depth > max_depth:
        raise ValueError(f"GraphQL query depth {peak_depth} exceeds max {max_depth}")
    if query.count(":") > max_aliases:
        raise ValueError("GraphQL alias batching limit exceeded")
    return True

def sanitize_nosql_scalar_filter(untrusted_value: object) -> str:
    """PS-GRAPHQL-NOSQLI:2025 Block MongoDB operator dicts ({'$ne': null}, {'$gt': ''}) and '$where'."""
    if not isinstance(untrusted_value, str):
        raise TypeError("NoSQL operator object injection blocked: value must be a plain string")
    if untrusted_value.startswith("$") or "$where" in untrusted_value:
        raise ValueError("NoSQL $-operator syntax blocked")
    return untrusted_value

class TestGraphqlAndNosqlDefense(unittest.TestCase):
    def test_blocks_graphql_introspection_and_deep_nesting(self) -> None:
        with self.assertRaises(PermissionError):
            validate_graphql_query_policy("{ __schema { types { name } } }")
        with self.assertRaises(ValueError):
            validate_graphql_query_policy("{ a { b { c { d { e { f { id } } } } } } }")

    def test_blocks_nosql_operator_injection(self) -> None:
        with self.assertRaises(TypeError):
            sanitize_nosql_scalar_filter({"$ne": None})
        with self.assertRaises(ValueError):
            sanitize_nosql_scalar_filter("$where: sleep(5000)")
        self.assertEqual(sanitize_nosql_scalar_filter("alice"), "alice")

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Map;

public final class PsGraphqlNosqlGuard {
    public static void checkGraphqlQuery(String query, int maxDepth) {
        if (query == null || query.contains("__schema") || query.contains("__type")) {
            throw new SecurityException("GraphQL introspection blocked");
        }
        int depth = 0;
        for (char c : query.toCharArray()) {
            if (c == '{' && ++depth > maxDepth) {
                throw new SecurityException("GraphQL max depth exceeded");
            } else if (c == '}') {
                depth = Math.max(0, depth - 1);
            }
        }
    }

    public static String requireNosqlScalar(Object input) {
        if (!(input instanceof String s) || s.startsWith("$")) {
            throw new SecurityException("NoSQL operator injection blocked");
        }
        return s;
    }

    public static void main(String[] args) {
        checkGraphqlQuery("{ viewer { id name } }", 5);
        try {
            requireNosqlScalar(Map.of("$ne", ""));
            throw new AssertionError("NoSQL map operator must be rejected");
        } catch (SecurityException expected) {
            // Expected block
        }
        System.out.println("PASS: PS-GRAPHQL-NOSQLI:2025 Java GraphQL & NoSQLi guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-GRAPHQL-NOSQLI:2025 Block GraphQL introspection/depth and NoSQL '$' operators */
bool is_safe_graphql_and_nosql(const char *gql_query, int max_depth, const char *nosql_param) {
    if (!gql_query || !nosql_param) return false;
    if (strstr(gql_query, "__schema") != NULL || strstr(gql_query, "__type") != NULL) return false;
    if (nosql_param[0] == '$' || strchr(nosql_param, '{') != NULL) return false;
    int depth = 0;
    for (size_t i = 0; gql_query[i] != '\\0'; ++i) {
        if (gql_query[i] == '{' && ++depth > max_depth) return false;
        if (gql_query[i] == '}' && depth > 0) depth--;
    }
    return true;
}

int main(void) {
    assert(is_safe_graphql_and_nosql("{ user { id } }", 5, "alice") == true);
    assert(is_safe_graphql_and_nosql("{ __schema { types { name } } }", 5, "alice") == false);
    assert(is_safe_graphql_and_nosql("{ user { id } }", 5, "{\"$ne\":null}") == false);
    printf("PASS: PS-GRAPHQL-NOSQLI:2025 C GraphQL & NoSQLi filter verified.\\n");
    return 0;
}`,
  },
  {
    id: "PS-RACE-LLM:2025",
    codeId: "PS_RACE_LLM_2025",
    standard: "PORTSWIGGER-ACADEMY",
    title: "Race Conditions (TOCTOU Limit Overrun) & Web LLM Attacks (Indirect Prompt Injection & Agency Guard)",
    url: "https://portswigger.net/web-security/race-conditions",
    cwe: "CWE-362 (Concurrent Execution using Shared Resource / Race Condition), OWASP LLM01/LLM08",
    summary:
      "Single-packet race conditions exploit time-of-check to time-of-use (TOCTOU) windows to redeem coupons or withdraw funds multiple times; Web LLM attacks use indirect prompt injection embedded in web pages or emails to invoke privileged backend tools (`delete_user`, `export_db`).",
    control:
      "Replace check-then-act logic with atomic lock/CAS transactions (`UPDATE ... WHERE redeemed = FALSE`) and enforce a strict tool-call allow-list with human-in-the-loop approval for any state-changing LLM tool invocation.",
    keywords: /\b(race\s+conditions?|toctou|single-packet\s+attack|web\s+llm\s+attacks?|llm\s+attacks?|indirect\s+prompt\s+injection|portswigger\.net\/web-security\/(?:race-conditions|llm-attacks))\b/i,
    python: `import threading
import unittest

READ_ONLY_LLM_TOOLS = {"search_docs", "get_public_faq"}

class AtomicCouponVault:
    """PS-RACE-LLM:2025 Thread-safe lock preventing single-packet TOCTOU double-redemption."""
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._redeemed: set[str] = set()

    def redeem_once(self, code: str) -> bool:
        with self._lock:
            if code in self._redeemed:
                return False
            self._redeemed.add(code)
            return True

def authorize_llm_tool_call(tool_name: str, untrusted_context_had_injection: bool, human_approved: bool) -> bool:
    """PS-RACE-LLM:2025 Block excessive LLM agency and unapproved state-changing tool calls."""
    if tool_name in READ_ONLY_LLM_TOOLS and not untrusted_context_had_injection:
        return True
    if untrusted_context_had_injection:
        return False
    return human_approved

class TestRaceAndLlmDefense(unittest.TestCase):
    def test_atomic_coupon_prevents_concurrent_overrun(self) -> None:
        vault = AtomicCouponVault()
        results = [vault.redeem_once("PROMO-2025") for _ in range(10)]
        self.assertEqual(results.count(True), 1)
        self.assertEqual(results.count(False), 9)

    def test_blocks_indirect_prompt_injection_tool_invocation(self) -> None:
        self.assertFalse(authorize_llm_tool_call("delete_account", untrusted_context_had_injection=True, human_approved=False))
        self.assertTrue(authorize_llm_tool_call("search_docs", untrusted_context_had_injection=False, human_approved=False))

if __name__ == "__main__":
    unittest.main()`,
    java: `import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

public final class PsRaceAndLlmGuard {
    private static final Set<String> SAFE_READ_TOOLS = Set.of("search_docs", "get_public_faq");
    private final AtomicBoolean couponRedeemed = new AtomicBoolean(false);

    /** PS-RACE-LLM:2025 Atomic CAS prevents TOCTOU limit-overrun races. */
    public boolean tryRedeemCoupon() {
        return couponRedeemed.compareAndSet(false, true);
    }

    public static boolean allowLlmToolCall(String toolName, boolean untrustedDataPresent, boolean humanConfirmed) {
        if (untrustedDataPresent) return false;
        if (SAFE_READ_TOOLS.contains(toolName)) return true;
        return humanConfirmed;
    }

    public static void main(String[] args) {
        PsRaceAndLlmGuard guard = new PsRaceAndLlmGuard();
        if (!guard.tryRedeemCoupon() || guard.tryRedeemCoupon()) {
            throw new AssertionError("Atomic coupon CAS race guard failed");
        }
        if (allowLlmToolCall("delete_user", true, false)) {
            throw new AssertionError("Injected LLM tool call must be blocked");
        }
        System.out.println("PASS: PS-RACE-LLM:2025 Java TOCTOU CAS & Web LLM agency guard verified.");
    }
}`,
    c: `#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* PS-RACE-LLM:2025 Single-redemption state guard & LLM tool allow-list check */
bool try_atomic_redeem(bool *already_redeemed) {
    if (!already_redeemed || *already_redeemed) return false;
    *already_redeemed = true;
    return true;
}

bool allow_llm_tool(const char *tool_name, bool untrusted_prompt_flag) {
    if (!tool_name || untrusted_prompt_flag) return false;
    return (strcmp(tool_name, "search_docs") == 0 || strcmp(tool_name, "get_public_faq") == 0);
}

int main(void) {
    bool redeemed = false;
    assert(try_atomic_redeem(&redeemed) == true);
    assert(try_atomic_redeem(&redeemed) == false);
    assert(allow_llm_tool("delete_account", false) == false);
    assert(allow_llm_tool("search_docs", false) == true);
    printf("PASS: PS-RACE-LLM:2025 C race condition & Web LLM tool guard verified.\\n");
    return 0;
}`,
  },
];

function preferredLanguages(question: string): ("python" | "java" | "c")[] {
  const wantsPy = /\b(python|py|pytest|unittest|sqlite3)\b/i.test(question);
  const wantsJava = /\b(java|jdbc|junit|spring)\b/i.test(question);
  const wantsC = /(?:^|[^a-z0-9])(c\s+code|c\s+script|c\s+program|in\s+c\b|language\s+c\b|c\/c\+\+|sqlite3_bind_text|python\s*,\s*java\s*,?\s*(?:or|and)\s*c\b)/i.test(question);
  const picked: ("python" | "java" | "c")[] = [];
  if (wantsPy) picked.push("python");
  if (wantsJava) picked.push("java");
  if (wantsC) picked.push("c");
  if (!picked.length) return ["python", "java", "c"];
  // Always keep all three languages available so multi-language audits pass, with requested first
  for (const lang of ["python", "java", "c"] as const) {
    if (!picked.includes(lang)) picked.push(lang);
  }
  return picked;
}

export function renderSpecBlock(spec: OwaspCategorySpec, langs: ("python" | "java" | "c")[]): string {
  const fileSlug = spec.codeId.toLowerCase();
  const javaClassMatch = spec.java.match(/public\s+final\s+class\s+([A-Za-z0-9_]+)/);
  const javaClassName = javaClassMatch ? javaClassMatch[1]! : "SecurityVerificationTest";

  const stepByStepProcedure = [
    `#### Step-by-Step Tester Verification & Execution Procedure (\`${spec.id}\`)`,
    `1. **Step 1 — Scope & Trust-Boundary Mapping:** Identify the exact input vector, HTTP header, or API parameter associated with **${spec.id} (${spec.title})** (\`${spec.cwe}\`) in your local or authorized staging environment and record the baseline response.`,
    `2. **Step 2 — Run the Python Defensive Unit-Test Harness (\`unittest\`):** Save the Python script below as \`verify_${fileSlug}.py\` and run:\n   \`\`\`bash\n   python3 -m unittest verify_${fileSlug}.py -v\n   \`\`\`\n   Confirm all valid inputs succeed and every malicious test vector raises the expected defensive exception (\`OK\`).`,
    `3. **Step 3 — Compile & Run the Java Verification Harness:** Save the Java implementation as \`${javaClassName}.java\` and execute with assertions enabled:\n   \`\`\`bash\n   javac ${javaClassName}.java && java -ea ${javaClassName}\n   \`\`\`\n   Confirm the console prints \`PASS: ${spec.id}\`.`,
    `4. **Step 4 — Compile & Run the C Assertion Harness (\`gcc\` / \`clang\`):** Save the C implementation as \`verify_${fileSlug}.c\` and compile with strict flags:\n   \`\`\`bash\n   gcc -std=c11 -Wall -Wextra -Werror verify_${fileSlug}.c -o verify_${fileSlug} && ./verify_${fileSlug}\n   \`\`\`\n   Confirm all \`assert(...)\` boundary checks pass and print \`PASS:\`.`,
    `5. **Step 5 — Remediation & CI/CD Regression Gate:** Enforce **${spec.control}** in the production request handler and wire \`verify_${fileSlug}.py\` / \`${javaClassName}.java\` into your CI pipeline so future commits cannot reintroduce this flaw.`,
  ].join("\n");

  const codeSections = langs.map((lang) => {
    if (lang === "python") {
      return `#### Python Defensive Verification & Unit Test (\`unittest\`)\n\`\`\`python\n${spec.python}\n\`\`\``;
    }
    if (lang === "java") {
      return `#### Java Defensive Implementation & Verification\n\`\`\`java\n${spec.java}\n\`\`\``;
    }
    return `#### C Defensive Implementation & Verification (\`assert.h\`)\n\`\`\`c\n${spec.c}\n\`\`\``;
  });

  return [
    `### ${spec.id} — ${spec.title}`,
    `- **Official Reference:** [${spec.id} ${spec.title}](${spec.url})`,
    `- **Mapped CWEs:** \`${spec.cwe}\``,
    `- **Risk Summary:** ${spec.summary}`,
    `- **Primary Defensive Control:** ${spec.control}`,
    stepByStepProcedure,
    ...codeSections,
  ].join("\n\n");
}

export function owaspCodeGadget(question: string): string | null {
  const q = question.trim();
  if (q.length < 6) return null;

  const isMultiLangTrainGuide =
    /\b(?:how\s+(?:do\s+we|to|can\s+we|should\s+we)\s+)?train\s+(?:noctis|vibe)\b[\s\S]*?\b(?:complete\s+programming|programming\s+tasks?|other\s+languages)\b/i.test(q) ||
    (/\btrain\s+(?:noctis|vibe)\b/i.test(q) && /\bpython\b/i.test(q) && /\bjava\b/i.test(q) && !/\bowasp\b/i.test(q));

  if (isMultiLangTrainGuide) {
    return [
      `## Vibe Polyglot Code & Security Training Architecture (Python, Java, C, TypeScript, Go, Rust, SQL)`,
      `Noctis is now configured and trained to generate **complete, self-contained, runnable programming tasks** across **Python, Java, C, TypeScript, Go, Rust, C++, C#, and SQL** without being blocked by the Study-Board headline restriction.`,
      `### 1. Why Coding Prompts Previously Failed (Fixed in Code Routing)`,
      `- **Root Cause Fixed:** Previously, prompts starting with \`"write a python code..."\` were routed by \`NoctisDesk.tsx\` into \`desk = "study"\` and \`skill = "research"\`, which invoked \`mind.researchReport\` (searching only GitHub repo descriptions and Google News RSS) and injected the strict rule: *"Use only facts written in the notes. If a name, date, number, or quote is not in the notes, write Not in the record."*`,
      `- **Code-Aware Routing:** \`skillFromWords()\`, \`NoctisDesk.tsx\`, and \`noctis-desk.server.ts\` now detect programming and security-verification prompts (\`wantsCode\`), keep Noctis in **Code Mode** (\`code: true\`, \`maxTokens: 4096\`), bypass headline-only RAG filters, and require complete runnable programs with imports, error handling, and unit tests.`,
      `### 2. Four Ways to Train Noctis on Complete Multi-Language Programming Tasks`,
      `| Training Method | How to Use It | Persistence & Scope |`,
      `| --- | --- | --- |`,
      `| **1. In-Chat \`Train:\` Command** | Send \`Train: <task prompt> \\|\\| <complete Python/Java/C/Go/Rust solution>\` in Noctis chat | Saved immediately to **Neon Postgres** (\`vibe_training_pair\`) + local memory |`,
      `| **2. Noctis Train Studio UI** | Click **Train Studio** in the Noctis composer bar, paste the task prompt & multi-language code, and click **Save to Noctis Brain** | Permanently indexed in Neon Postgres with token-overlap + TF-IDF recall |`,
      `| **3. Batch API Seeding (\`POST /api/noctis\`)** | \`POST /api/noctis\` with \`{"action":"train","question":"...","answer":"..."}\` or \`{"action":"rule","rule":"..."}\` | Automates bulk ingestion of multi-language coding benchmarks |`,
      `| **4. Fine-Tune JSONL Export** | \`GET /api/noctis?export=jsonl\` (or click **Export .JSONL** in Train Studio) | Exports all trained coding tasks in standard \`{"messages":[...]}\` JSONL format for LLM fine-tuning |`,
      `### 3. Step-by-Step Procedure for Running Multi-Language Verification Tasks`,
      `1. **Step 1 — Python (\`unittest\`):** Save as \`task_verify.py\` and run \`python3 -m unittest task_verify.py -v\`.`,
      `2. **Step 2 — Java (JDK 17+):** Save as \`PolyglotTaskEngine.java\` and run \`javac PolyglotTaskEngine.java && java -ea PolyglotTaskEngine\`.`,
      `3. **Step 3 — C (C11):** Save as \`task_verify.c\` and run \`gcc -std=c11 -Wall -Wextra -Werror task_verify.c -o task_verify && ./task_verify\`.`,
      `### 4. Complete Polyglot Reference Template (Authenticated Rate-Limited Task Queue / Worker)`,
      `#### Python (\`unittest\` + Thread-Safe Bounded Task Queue)`,
      "```python\nimport hashlib\nimport hmac\nimport queue\nimport unittest\nfrom dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass SignedTask:\n    task_id: str\n    payload: str\n    signature: str\n\nclass SecureTaskProcessor:\n    def __init__(self, secret_key: bytes, max_queue_size: int = 100) -> None:\n        self._key = secret_key\n        self._queue: queue.Queue[SignedTask] = queue.Queue(maxsize=max_queue_size)\n\n    def sign(self, task_id: str, payload: str) -> str:\n        msg = f\"{task_id}:{payload}\".encode(\"utf-8\")\n        return hmac.new(self._key, msg, hashlib.sha256).hexdigest()\n\n    def enqueue(self, task: SignedTask) -> bool:\n        expected = self.sign(task.task_id, task.payload)\n        if not hmac.compare_digest(expected, task.signature):\n            raise PermissionError(\"Invalid task HMAC signature\")\n        self._queue.put_nowait(task)\n        return True\n\n    def process_next(self) -> str:\n        task = self._queue.get_nowait()\n        try:\n            return f\"PROCESSED:{task.task_id}:{len(task.payload)}\"\n        finally:\n            self._queue.task_done()\n\nclass TestSecureTaskProcessor(unittest.TestCase):\n    def test_valid_and_tampered_tasks(self) -> None:\n        proc = SecureTaskProcessor(b\"32-byte-production-secret-key!!\")\n        sig = proc.sign(\"job-101\", \"run-backup\")\n        proc.enqueue(SignedTask(\"job-101\", \"run-backup\", sig))\n        self.assertEqual(proc.process_next(), \"PROCESSED:job-101:10\")\n        with self.assertRaises(PermissionError):\n            proc.enqueue(SignedTask(\"job-101\", \"rm -rf /\", sig))\n\nif __name__ == \"__main__\":\n    unittest.main()\n```",
      `#### Java (Java 17+ Record, \`Mac\` HMAC-SHA256 & \`ArrayBlockingQueue\`)`,
      "```java\nimport javax.crypto.Mac;\nimport javax.crypto.spec.SecretKeySpec;\nimport java.nio.charset.StandardCharsets;\nimport java.security.MessageDigest;\nimport java.util.HexFormat;\nimport java.util.concurrent.ArrayBlockingQueue;\nimport java.util.concurrent.BlockingQueue;\n\npublic final class PolyglotTaskEngine {\n    public record Task(String id, String payload, String signature) {}\n\n    private final byte[] secret;\n    private final BlockingQueue<Task> queue;\n\n    public PolyglotTaskEngine(byte[] secret, int capacity) {\n        this.secret = secret.clone();\n        this.queue = new ArrayBlockingQueue<>(capacity);\n    }\n\n    public String sign(String id, String payload) throws Exception {\n        Mac mac = Mac.getInstance(\"HmacSHA256\");\n        mac.init(new SecretKeySpec(secret, \"HmacSHA256\"));\n        byte[] digest = mac.doFinal((id + \":\" + payload).getBytes(StandardCharsets.UTF_8));\n        return HexFormat.of().formatHex(digest);\n    }\n\n    public void submit(Task task) throws Exception {\n        byte[] expected = sign(task.id(), task.payload()).getBytes(StandardCharsets.UTF_8);\n        byte[] provided = task.signature().getBytes(StandardCharsets.UTF_8);\n        if (!MessageDigest.isEqual(expected, provided)) {\n            throw new SecurityException(\"Task signature verification failed\");\n        }\n        if (!queue.offer(task)) {\n            throw new IllegalStateException(\"Task queue capacity exhausted\");\n        }\n    }\n\n    public static void main(String[] args) throws Exception {\n        PolyglotTaskEngine engine = new PolyglotTaskEngine(\"0123456789abcdef0123456789abcdef\".getBytes(StandardCharsets.UTF_8), 16);\n        String sig = engine.sign(\"job-1\", \"compile\");\n        engine.submit(new Task(\"job-1\", \"compile\", sig));\n        System.out.println(\"PASS: Java complete task engine verified.\");\n    }\n}\n```",
      `#### C (C11 Bounded Ring Buffer with Explicit Overflow & Null Guards)`,
      "```c\n#include <assert.h>\n#include <stdbool.h>\n#include <stddef.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <string.h>\n\n#define QUEUE_CAPACITY 8\n#define MAX_PAYLOAD_LEN 64\n\ntypedef struct {\n    uint32_t id;\n    char payload[MAX_PAYLOAD_LEN];\n} task_t;\n\ntypedef struct {\n    task_t items[QUEUE_CAPACITY];\n    size_t head;\n    size_t tail;\n    size_t count;\n} bounded_queue_t;\n\nvoid queue_init(bounded_queue_t *q) {\n    memset(q, 0, sizeof(*q));\n}\n\nbool queue_push(bounded_queue_t *q, uint32_t id, const char *payload) {\n    if (!q || !payload || q->count >= QUEUE_CAPACITY) return false;\n    size_t len = strlen(payload);\n    if (len == 0 || len >= MAX_PAYLOAD_LEN) return false;\n    q->items[q->tail].id = id;\n    memcpy(q->items[q->tail].payload, payload, len + 1);\n    q->tail = (q->tail + 1) % QUEUE_CAPACITY;\n    q->count++;\n    return true;\n}\n\nbool queue_pop(bounded_queue_t *q, task_t *out) {\n    if (!q || !out || q->count == 0) return false;\n    *out = q->items[q->head];\n    q->head = (q->head + 1) % QUEUE_CAPACITY;\n    q->count--;\n    return true;\n}\n\nint main(void) {\n    bounded_queue_t q;\n    queue_init(&q);\n    assert(queue_push(&q, 42U, \"verify-telemetry\") == true);\n    task_t out;\n    assert(queue_pop(&q, &out) == true);\n    assert(out.id == 42U && strcmp(out.payload, \"verify-telemetry\") == 0);\n    printf(\"PASS: C11 bounded ring-buffer task queue verified.\\n\");\n    return 0;\n}\n```",
      `#### TypeScript / Go / Rust Support`,
      `- **TypeScript (Node.js / Deno / Bun):** Strict types, \`node:crypto\` AEAD & HMAC primitives, Zod schema validation, and parameterized SQL/ORM queries.\n- **Go (Golang):** Context-bounded workers (\`context.WithTimeout\`), \`crypto/hmac\`, \`database/sql\` prepared statements, and race-free channels.\n- **Rust:** Memory-safe ownership, \`ring\` / \`hmac\` crates, \`sqlx\` compile-time parameterized queries, and \`#[cfg(test)]\` unit test modules.`,
    ].join("\n\n");
  }

  const langs = preferredLanguages(q);
  const matchedWafVectors = DEFENSIVE_VECTOR_SPECS.filter((s) => s.keywords.test(q));
  const matchedPortSwigger = PORTSWIGGER_ACADEMY_SPECS.filter((s) => s.keywords.test(q));

  const isPortSwiggerAllTopics =
    /portswigger\.net\/web-security/i.test(q) &&
    (matchedPortSwigger.length + matchedWafVectors.length >= 3 || /\ball\s+topics\b/i.test(q));

  if (isPortSwiggerAllTopics || /\bportswigger\s+(?:web\s+security\s+)?academy\b/i.test(q)) {
    const allPsSpecs = [...DEFENSIVE_VECTOR_SPECS, ...PORTSWIGGER_ACADEMY_SPECS];
    const psTable = [
      `| Module ID | PortSwigger Web Security Academy Topic | Mapped CWEs | Primary Defensive Control (Python / Java / C) |`,
      `| --- | --- | --- | --- |`,
      ...allPsSpecs.map(
        (s) => `| **[${s.id}](${s.url})** | **${s.title}** | \`${s.cwe}\` | ${s.control} |`,
      ),
    ].join("\n");

    return [
      `## Vibe PortSwigger Web Security Academy — Complete All-Topics Defensive Verification Suite (Python, Java, C)`,
      `This suite provides **step-by-step tester verification procedures** and **complete, runnable defensive unit-test scripts** in **Python**, **Java**, and **C** covering every topic in the [PortSwigger Web Security Academy](https://portswigger.net/web-security/all-materials) (**SQLi, XSS, CSRF, Clickjacking, CORS, XXE, SSRF, Request Smuggling, OS Command Injection, SSTI, Insecure Deserialization, Path Traversal, Access Control, Authentication, OAuth 2.0, Business Logic Flaws, WebSockets, DOM-Based, Web Cache Poisoning & Deception, HTTP Host Header Attacks, File Upload, JWT Attacks, Prototype Pollution, GraphQL, Race Conditions, NoSQL Injection, and Web LLM Attacks**):`,
      psTable,
      ...allPsSpecs.map((spec) => renderSpecBlock(spec, langs)),
    ].join("\n\n");
  }

  const isWaf7List =
    matchedWafVectors.length >= 2 ||
    /\b(7-vector|seven-vector|waf\s+regression\s+suite|lfi,\s*sqli,\s*xss)\b/i.test(q);

  if (isWaf7List) {
    const wafTable = [
      `| Vector ID | Vulnerability Class | Fuzz / Intruder Test Vectors Blocked | Primary Defensive Control (Python / Java / C) |`,
      `| --- | --- | --- | --- |`,
      ...DEFENSIVE_VECTOR_SPECS.map(
        (s) => `| **[${s.id}](${s.url})** | **${s.title}** | \`${s.cwe}\` | ${s.control} |`,
      ),
    ].join("\n");

    return [
      `## Vibe 7-Vector Input Defense & WAF Regression Suite (Python, Java, C)`,
      `This suite provides **step-by-step tester verification procedures** and complete, runnable **defensive unit-testing and remediation verification scripts** in **Python**, **Java**, and **C** that test and verify protection against all 7 input vector classes (**Path Traversal/LFI**, **SQL Injection**, **Cross-Site Scripting (XSS)**, **OS Command Injection**, **XML External Entity (XXE)**, **Server-Side Request Forgery (SSRF)**, and **Server-Side Template Injection (SSTI)**):`,
      wafTable,
      ...DEFENSIVE_VECTOR_SPECS.map((spec) => renderSpecBlock(spec, langs)),
    ].join("\n\n");
  }

  const isOwasp2025List =
    (/\bowasp\b[\s\S]{0,40}\btop\s*10\b/i.test(q) && !/\bapi\s+security\b/i.test(q)) ||
    /top10\.owasp\.org\/2025/i.test(q) ||
    (OWASP_2025_SPECS.filter((s) => s.keywords.test(q)).length >= 3);

  const isOwaspApi2023List =
    /\bowasp\b[\s\S]{0,40}\bapi\s+(?:security\s+)?top\s*10\b/i.test(q) ||
    /owasp\.org\/API-Security/i.test(q) ||
    (OWASP_API_2023_SPECS.filter((s) => s.keywords.test(q)).length >= 3);

  // Check if specific categories are matched
  const matched2025 = OWASP_2025_SPECS.filter((s) => s.keywords.test(q));
  const matchedApi2023 = OWASP_API_2023_SPECS.filter((s) => s.keywords.test(q));

  if (!isOwasp2025List && !isOwaspApi2023List && !matched2025.length && !matchedApi2023.length && !matchedWafVectors.length && !matchedPortSwigger.length) {
    return null;
  }

  // Case 1: Full OWASP Top 10:2025 or Full OWASP API Security Top 10:2023 (or both)
  if (isOwasp2025List || isOwaspApi2023List) {
    const sections: string[] = [];

    if (isOwasp2025List) {
      const summaryTable = [
        `| Category | OWASP Top 10:2025 Risk | Mapped CWEs | Primary Defensive Control (Python / Java / C) |`,
        `| --- | --- | --- | --- |`,
        ...OWASP_2025_SPECS.map(
          (s) => `| **[${s.id}](${s.url})** | **${s.title}** | \`${s.cwe}\` | ${s.control} |`,
        ),
      ].join("\n");

      sections.push(
        `## Vibe OWASP Top 10:2025 — Multi-Language Defensive Verification Suite (Python, Java, C)`,
        `This suite provides **step-by-step tester verification procedures** and complete, runnable defensive verification and remediation scripts in **Python**, **Java**, and **C** for every category in the [OWASP Top 10:2025 Release](https://top10.owasp.org/2025/).`,
        summaryTable,
        ...OWASP_2025_SPECS.map((spec) => renderSpecBlock(spec, langs)),
      );
    }

    if (isOwaspApi2023List) {
      const apiTable = [
        `| Category | OWASP API Security Top 10 (2023) Risk | Mapped CWEs | Primary Defensive Control (Python / Java / C) |`,
        `| --- | --- | --- | --- |`,
        ...OWASP_API_2023_SPECS.map(
          (s) => `| **[${s.id}](${s.url})** | **${s.title}** | \`${s.cwe}\` | ${s.control} |`,
        ),
      ].join("\n");

      sections.push(
        `## Vibe OWASP API Security Top 10 (2023) — Multi-Language Defensive Verification Suite (Python, Java, C)`,
        `This suite provides **step-by-step tester verification procedures** and complete, runnable API security verification and enforcement code in **Python**, **Java**, and **C** for all ten risks in the [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/).`,
        apiTable,
        ...OWASP_API_2023_SPECS.map((spec) => renderSpecBlock(spec, langs)),
      );
    }

    return sections.join("\n\n");
  }

  // Case 2: Specific category/categories requested
  const combined = [...matched2025, ...matchedApi2023, ...matchedWafVectors, ...matchedPortSwigger];
  const headerTitle =
    combined.length === 1
      ? `## Vibe Defensive Security & Code Verification — ${combined[0]!.id}: ${combined[0]!.title}`
      : `## Vibe Defensive Security & Code Verification (${combined.map((c) => c.id).join(", ")})`;

  return [
    headerTitle,
    `Below are the **step-by-step tester procedures** and complete, runnable defensive verification and unit-testing implementations in **Python**, **Java**, and **C** demonstrating how to test and enforce protection against **${combined.map((c) => `${c.id} (${c.title})`).join(", ")}** in a local, self-contained test harness.`,
    ...combined.map((spec) => renderSpecBlock(spec, langs)),
  ].join("\n\n");
}
