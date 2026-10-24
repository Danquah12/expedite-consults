import { useEffect, useState } from "react";
import { MARKET_ITEMS, SELLER, SELLER_HREF, marketMoney, type MarketItem } from "@/lib/market";

const PURPOSE: Record<string, string> = {
  "nist-pack": "Exam preparation. The catalog, tailoring notes, and the artifact each family expects.",
  "rmf-book": "Stage practice. One page for each RMF stage.",
  "pentest-notes": "Field practice. Scope through the client report.",
  resume: "Career materials. The resume for the seat you name.",
};
const BAG_KEY = "vibetok-market-bag";
const PACKS = MARKET_ITEMS.filter((item) => item.shelf === "study");

export function StudyMaterials() {
  const [bag, setBag] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BAG_KEY);
      if (raw) setBag(JSON.parse(raw) as string[]);
    } catch {
      /* empty */
    }
  }, []);

  function add(id: string) {
    setBag((cur) => {
      const next = cur.includes(id) ? cur : [...cur, id];
      localStorage.setItem(BAG_KEY, JSON.stringify(next));
      return next;
    });
  }

  function order(item: MarketItem) {
    const note = `Noctis study pack\n${item.title} — ${marketMoney(item.price)} ${item.unit}`;
    window.open(`${SELLER_HREF}?order=${encodeURIComponent(note)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-2">
      <header className="px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Study materials</p>
        <p className="mt-1 text-sm text-muted">These used to sit on Market. They belong with the lesson.</p>
      </header>
      <ul className="space-y-2">
        {PACKS.map((item) => (
          <li key={item.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <h2 className="font-display text-lg font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted">{PURPOSE[item.id] ?? item.line}</p>
            <p className="mt-2 text-sm font-semibold">
              {marketMoney(item.price)} <span className="font-normal text-muted">{item.unit}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => add(item.id)} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
                {bag.includes(item.id) ? "In the bag" : "Add to bag"}
              </button>
              <button type="button" onClick={() => order(item)} className="min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold">
                Ask {SELLER}
              </button>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
                  Open
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
