import { askNoctis, openNoctis } from "@/lib/ask-noctis";

export function NoctisMoves({ items, toVibe = false, picture = "" }: { items: { label: string; ask: string }[]; toVibe?: boolean; picture?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => (toVibe ? openNoctis(item.ask, picture) : askNoctis(item.ask, picture))}
          className="inline-flex min-h-9 items-center rounded-full border border-[#e4b86a]/50 bg-elevated px-3 text-[11px] font-semibold"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}