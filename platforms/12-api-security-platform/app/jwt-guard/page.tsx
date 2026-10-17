"use client";

import Link from "next/link";
import { KeyRound, Cpu } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function JwtGuardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(122,162,247,0.28)" }}>
              <KeyRound className="w-3.5 h-3.5" />
              <span>OWASP API2:2023 &middot; CWE-347 &middot; Cryptographic JWT Guard</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              JWT Token Security &amp; Algorithm Pinning Verifier
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Verifies asymmetric RS256/ES256 key pinning, rejects `alg: none` and HMAC/RSA confusion, and validates `exp`, `iss`, and `aud` claims.
            </p>
          </div>
          <Link
            href="/validation-engine"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span>View Z3 Claim CLAIM-API-02</span>
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-surface p-6 space-y-3">
            <h2 className="text-sm font-bold" style={{ color: "#f27478" }}>
              Vulnerable Verifier (`services/auth/middleware/jwt_guard.py:L28`)
            </h2>
            <pre className="p-4 rounded-lg code-block overflow-x-auto" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
{`# API-002 (CONFIRMED): Accepts alg:none tokens
def verify_bearer(token: str):
    # Missing algorithms=['RS256'] allowlist!
    payload = jwt.decode(
        token,
        options={"verify_signature": False}
    )
    return payload`}
            </pre>
          </div>

          <div className="card-surface p-6 space-y-3">
            <h2 className="text-sm font-bold" style={{ color: "var(--success)" }}>
              Verified Remediation (RS256 Pinning + Claim Invariants)
            </h2>
            <pre className="p-4 rounded-lg code-block overflow-x-auto" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
{`# Enforces asymmetric RS256 and strict claim validation
def verify_bearer_strict(token: str, jwks_pem: str):
    return jwt.decode(
        token,
        jwks_pem,
        algorithms=["RS256"],
        audience="https://api.acme.com",
        issuer="https://auth.acme.com",
        options={"require": ["exp", "iss", "aud", "sub"]},
    )`}
            </pre>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
