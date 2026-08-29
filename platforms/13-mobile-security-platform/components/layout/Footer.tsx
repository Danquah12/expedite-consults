import Link from "next/link";
import { Smartphone } from "lucide-react";
export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)" }}>
              <Smartphone className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Mobile Security Platform</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>Platform 13 of 34 · MobSF · OWASP MASVS · jadx · Frida · apktool</div>
            </div>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: "var(--muted)" }}>
            {[{ label: "Home", href: "/" }, { label: "Scan", href: "/scan" }, { label: "Dashboard", href: "/dashboard" }].map(l => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
