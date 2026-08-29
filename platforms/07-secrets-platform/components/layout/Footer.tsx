import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <KeyRound className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Secrets Platform</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>Platform 7 of 34 · Powered by TruffleHog · Gitleaks · Detect-Secrets</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
            {["/", "/scan", "/dashboard"].map((href, i) => (
              <Link key={href} href={href} className="hover:text-white transition-colors">
                {["Home", "Scan", "Dashboard"][i]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
