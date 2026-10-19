import Link from "next/link";
import { GitBranch } from "lucide-react";

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
                border: "1px solid var(--border)",
              }}
            >
              <GitBranch className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                XTRIKE Desk Note &mdash; Threat Modeling &amp; Architecture Verification
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                Platform 15 &middot; STRIDE Taxonomy &middot; DFD v4.2 &middot; MITRE ATT&amp;CK &amp; CAPEC
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-xs" style={{ color: "var(--muted)" }}>
            {[
              { label: "Front Desk", href: "/" },
              { label: "STRIDE Checklist", href: "/threat-model" },
              { label: "Attack Chain", href: "/attack-chain" },
              { label: "STRIDE Studio", href: "/stride-analyzer" },
              { label: "DFD Canvas", href: "/dfd-studio" },
              { label: "Attack Trees", href: "/attack-trees" },
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
