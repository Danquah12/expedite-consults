import { CLINIC_PATH, PATH_EDGES } from "@/lib/attack-path";
import { cn } from "@/lib/utils";

export function AttackPathGraph({
  opened,
  onOpen,
}: {
  opened: string[];
  onOpen: (id: string) => void;
}) {
  const next = CLINIC_PATH.find((n) => !opened.includes(n.id));
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">Walk the path in order. A CVE list is not a path.</p>
      <ol className="space-y-2">
        {CLINIC_PATH.map((node, i) => {
          const on = opened.includes(node.id);
          const locked = next && node.id !== next.id && !on;
          const from = PATH_EDGES.find((e) => e[1] === node.id)?.[0];
          return (
            <li key={node.id}>
              {i > 0 ? (
                <p className="px-3 font-mono text-[11px] text-subtle">{from} → {node.id}</p>
              ) : null}
              <button
                type="button"
                disabled={Boolean(locked)}
                onClick={() => onOpen(node.id)}
                className={cn(
                  "flex min-h-11 w-full flex-col items-start rounded-2xl px-4 py-3 text-left",
                  on ? "bg-primary/15 text-fg" : locked ? "bg-bg text-subtle" : "bg-elevated text-fg",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Hop {i + 1}
                </span>
                <span className="font-display text-base font-semibold">{node.label}</span>
                {on ? (
                  <>
                    <span className="mt-1 text-sm text-muted">{node.blurb}</span>
                    <span className="mt-1 text-xs font-semibold">{node.finding}</span>
                  </>
                ) : (
                  <span className="mt-1 text-sm text-muted">{locked ? "Reach the hop before this." : "Open this hop."}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
