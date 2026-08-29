import { ENGINES, LANGUAGES } from "@/data/engines";

export default function EngineBar() {
  const items = [
    ...ENGINES.map(e => ({ label: e.name, icon: e.icon, sub: "Engine" })),
    ...LANGUAGES.map(l => ({ label: l, icon: "💻", sub: "Language" })),
    { label: "OWASP Top 10", icon: "🛡", sub: "Framework" },
    { label: "CWE-1000",    icon: "📋", sub: "Catalog" },
    { label: "PCI DSS 4.0", icon: "🔒", sub: "Compliance" },
    { label: "NIST 800-53", icon: "🏛", sub: "Compliance" },
    { label: "ISO 27001",   icon: "✅", sub: "Compliance" },
  ];

  const doubled = [...items, ...items];

  return (
    <section className="py-12 overflow-hidden" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex marquee-track" style={{ width: "max-content", gap: "1.5rem" }}>
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl flex-shrink-0 select-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="text-xl">{item.icon}</span>
            <div>
              <div className="text-sm font-semibold text-white whitespace-nowrap">{item.label}</div>
              <div className="text-[10px] whitespace-nowrap" style={{ color: "var(--muted)" }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
