import FindingCard from "./FindingCard";
import type { SASTFinding } from "@/types/sast";

type Props = { findings: SASTFinding[] };

export default function FindingsGrid({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-lg font-bold text-white mb-2">No findings match your filters</h3>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Try adjusting the severity filter or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {findings.map((f) => (
        <FindingCard key={f.id} finding={f} />
      ))}
    </div>
  );
}
