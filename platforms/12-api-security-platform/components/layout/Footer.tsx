import Link from "next/link";
import { Globe2 } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--accent-soft)",
                border: "1px solid rgba(122, 162, 247, 0.28)",
              }}
            >
              <Globe2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                API Security &amp; Proof Validation Platform
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Platform 12 &middot; OWASP API Top 10:2023 &middot; PTES &amp; NIST SP 800-115 Verification
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-xs" style={{ color: "var(--muted)" }}>
            {[
              { label: "Overview", href: "/" },
              { label: "API Scan & Fuzzer", href: "/scan" },
              { label: "Validation Engine", href: "/validation-engine" },
              { label: "Security Dashboard", href: "/dashboard" },
              { label: "BOLA Matrix", href: "/bola-matrix" },
              { label: "OpenAPI 3.1 Studio", href: "/openapi-ingest" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:underline transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
