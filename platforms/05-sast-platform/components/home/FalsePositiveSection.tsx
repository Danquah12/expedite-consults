import { CheckCircle2 } from "lucide-react";

const LAYERS = [
  { number: "L1", title: "Evidence Requirement",   description: "Every finding must have code evidence, runtime evidence, and graph evidence before it is raised. No evidence = rejected.", color: "#00d4ff" },
  { number: "L2", title: "Reachability Analysis",  description: "Many findings are technically present but never reachable. Unexploitable methods are automatically downgraded in severity.", color: "#a78bfa" },
  { number: "L3", title: "Cross-Validation",       description: "Findings must be confirmed by at least 2 of 4 engines. Single-engine findings are flagged as low confidence.", color: "#34d399" },
  { number: "L4", title: "Challenge Agent",        description: "A second AI reviewer actively attempts to disprove the finding — checking for RBAC controls, ownership checks, and sanitizers.", color: "#fbbf24" },
  { number: "L5", title: "Runtime Correlation",    description: "DAST confirmation provides the strongest validation. A finding exploited at runtime receives near-certain confidence.", color: "#f87171" },
  { number: "L6", title: "Confidence Scoring",     description: "A final 0–100 confidence score is calculated per finding from all engine results, producing a weighted consensus decision.", color: "#00d4ff" },
];

export default function FalsePositiveSection() {
  return (
    <section
      className="py-24"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
          >
            False Positive Reduction
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">6 Validation Layers. Near-Zero Noise.</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
            Traditional SAST tools produce 40–70% false positives. Our validation pipeline reduces this to under 5% through progressive evidence accumulation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAYERS.map((layer) => (
            <div
              key={layer.number}
              className="rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: `${layer.color}18`, border: `1px solid ${layer.color}40`, color: layer.color }}
                >
                  {layer.number}
                </div>
                <h3 className="text-base font-bold text-white pt-1">{layer.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{layer.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,59,48,0.05)", border: "1px solid rgba(255,59,48,0.2)" }}>
            <div className="text-4xl font-black mb-2" style={{ color: "var(--critical)" }}>40–70%</div>
            <div className="text-sm font-medium text-white mb-1">Traditional SAST False Positive Rate</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>Industry average — developers distrust results</div>
          </div>
          <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(52,199,89,0.05)", border: "1px solid rgba(52,199,89,0.2)" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-7 h-7" style={{ color: "var(--low)" }} />
              <div className="text-4xl font-black" style={{ color: "var(--low)" }}>~5%</div>
            </div>
            <div className="text-sm font-medium text-white mb-1">Our Platform False Positive Rate</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>6-layer validation — every finding is real</div>
          </div>
        </div>
      </div>
    </section>
  );
}
