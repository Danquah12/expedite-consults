import { GitBranch, Cpu, FileText } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: GitBranch,
    title: "Ingest Repository",
    description: "Connect any Git repository. The platform extracts source code, dependency manifests, IaC files, and CI/CD configurations automatically.",
    details: ["GitHub · GitLab · Azure DevOps · Bitbucket", "Incremental delta scanning", "Multi-language support (10+ languages)", "< 5 minutes per 100K LOC"],
    color: "var(--primary)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Multi-Engine Analysis",
    description: "Four specialized engines run in parallel — CodeQL traces data flows, Semgrep matches patterns, Joern analyzes the code property graph, and DataFlow validates taint paths.",
    details: ["Parallel engine execution", "Hot path: < 2 seconds per file", "5-layer false positive reduction", "Confidence scoring per finding"],
    color: "#a78bfa",
  },
  {
    number: "03",
    icon: FileText,
    title: "Executive-Ready Reports",
    description: "Every finding includes business impact, CVSS + EPSS scores, attack path diagrams, compliance mappings, and platform-specific remediation code.",
    details: ["CVSS + EPSS scoring", "Attack chain visualization", "PCI DSS / NIST / ISO mapping", "One-click developer remediation"],
    color: "var(--low)",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--primary)" }}
        >
          How It Works
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">From Commit to Risk Report in Minutes</h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
          Three steps transform raw source code into a prioritized, actionable security risk report your entire team can act on.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="relative rounded-2xl p-8"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="text-7xl font-black absolute top-6 right-6 select-none opacity-10" style={{ color: step.color }}>
                {step.number}
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}
              >
                <Icon className="w-6 h-6" style={{ color: step.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>{step.description}</p>
              <ul className="space-y-2">
                {step.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                    <span style={{ color: "var(--muted)" }}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
