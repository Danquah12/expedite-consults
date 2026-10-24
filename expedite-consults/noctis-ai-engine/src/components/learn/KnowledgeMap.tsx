import { walkGraph, type GraphNode } from "@/lib/knowledge-graph";
import { cn } from "@/lib/utils";

function Chip({ node, vibe }: { node: GraphNode; vibe: boolean }) {
  const body = (
    <>
      <span className={cn("block text-[10px] font-semibold uppercase tracking-wider", vibe ? "text-zinc-500" : "text-muted")}>{node.kind}</span>
      <span className="font-semibold">{node.label}</span>
    </>
  );
  const className = cn("min-h-11 rounded-2xl px-3 py-2 text-left text-sm", vibe ? "bg-white/5 text-zinc-100" : "bg-elevated");
  if (!node.href) return <span className={className}>{body}</span>;
  return (
    <a href={node.href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  );
}

export function KnowledgeMap({ query, vibe = false }: { query: string; vibe?: boolean }) {
  let walk: ReturnType<typeof walkGraph> = null;
  try {
    walk = walkGraph(query);
  } catch {
    return null;
  }
  if (!walk) return null;
  return (
    <section className={cn("rounded-2xl px-3 py-3", vibe ? "bg-white/5" : "bg-elevated")}>
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", vibe ? "text-[#e4b86a]" : "text-primary")}>Map</p>
      <ol className="mt-2 flex flex-wrap items-center gap-2">
        {walk.chain.map((node, index) => (
          <li key={node.id} className="flex items-center gap-2">
            {index ? <span className={cn("text-xs", vibe ? "text-zinc-500" : "text-muted")}>→</span> : null}
            <Chip node={node} vibe={vibe} />
          </li>
        ))}
      </ol>
      {walk.also.length ? (
        <div className="mt-3">
          <p className={cn("text-[10px] font-semibold uppercase tracking-wider", vibe ? "text-zinc-500" : "text-muted")}>Also connected</p>
          <ul className="mt-1 space-y-1 text-sm">
            {walk.also.map((node) => (
              <li key={node.id}>
                {node.href ? (
                  <a href={node.href} target="_blank" rel="noreferrer" className={cn("font-semibold", vibe ? "text-[#e4b86a]" : "text-primary")}>
                    {node.label}
                  </a>
                ) : (
                  <span className="font-semibold">{node.label}</span>
                )}
                <span className={cn("ml-2 text-xs", vibe ? "text-zinc-400" : "text-muted")}>{node.kind}. {node.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
