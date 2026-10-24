import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { AXIOM_SUITE, axiomByFamily, axiomById } from "@/lib/axiom-clinic";
import {
  LAUNCHPAD,
  MARKET_ITEMS,
  MARKET_SHELVES,
  SELLER,
  SELLER_HREF,
  TRUEPLACE,
  TRUEPLACE_HREF,
  VERIFIED_LIVE,
  marketMoney,
  type MarketItem,
  type MarketShelf,
} from "@/lib/market";
import { cn } from "@/lib/utils";
import { BusinessCard } from "@/components/market/BusinessCard";

const BAG_KEY = "vibetok-market-bag";

export function MarketDesk() {
  const [shelf, setShelf] = useState<MarketShelf | "all">("all");
  const [bag, setBag] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BAG_KEY);
      if (raw) setBag(JSON.parse(raw) as string[]);
    } catch {
      /* empty bag */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(BAG_KEY, JSON.stringify(bag));
  }, [bag]);

  const shown = useMemo(() => {
    const shelfItems = shelf === "all" ? MARKET_ITEMS : MARKET_ITEMS.filter((item) => item.shelf === shelf);
    return shelfItems.filter((item) => item.shelf !== "study" && !["grc", "sast", "dast", "suite", "launchpad"].includes(item.id));
  }, [shelf]);
  const lines = bag
    .map((id) => MARKET_ITEMS.find((item) => item.id === id))
    .filter((item): item is MarketItem => Boolean(item));
  const total = lines.reduce((sum, item) => sum + item.price, 0);

  function add(id: string) {
    setBag((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setOpen(true);
  }

  function order() {
    const body = lines.map((item) => `${item.title} — ${marketMoney(item.price)} ${item.unit}`).join("\n");
    const note = `Noctis Market order\nSeller: ${SELLER}\n\n${body}\n\nTotal ${marketMoney(total)}`;
    window.open(`${SELLER_HREF}?order=${encodeURIComponent(note.slice(0, 800))}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Store className="size-3.5" />
          Resources · {SELLER}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold">Resources for the journey.</h1>
        <p className="mt-2 text-sm text-muted">
          What you pick up here supports learning, a career, a certification, or the next step of growth. Study packs stay on Lessons. Software and training seats come from{" "}
          <a href={SELLER_HREF} target="_blank" rel="noreferrer" className="font-semibold text-primary">
            {SELLER}
          </a>
          .
        </p>
        <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {MARKET_SHELVES.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setShelf(row.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
                shelf === row.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {row.label}
            </button>
          ))}
        </div>
      </header>
      <BusinessCard />

      {shelf === "all" || shelf === "software" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <GrcDesk onAdd={() => add("grc")} />
          <AxiomSuite onAdd={() => add("suite")} />
        </div>
      ) : null}

      {shelf === "all" || shelf === "training" ? <Launchpad onAdd={() => add("launchpad")} /> : null}

      {shelf === "all" ? <TruePlace /> : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((item) => {
          const inBag = bag.includes(item.id);
          return (
            <li key={item.id} className="flex flex-col rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{item.shelf}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{item.line}</p>
              <p className="mt-3 text-sm font-semibold">
                {marketMoney(item.price)} <span className="font-normal text-muted">{item.unit}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => add(item.id)}
                  className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
                >
                  {inBag ? "In the bag" : "Add to bag"}
                </button>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-h-11 w-full items-center justify-between text-left">
          <span className="font-display text-lg font-semibold">Bag · {lines.length}</span>
          <span className="text-sm font-semibold">{marketMoney(total)}</span>
        </button>
        {open ? (
          lines.length ? (
            <ul className="mt-3 space-y-2">
              {lines.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{item.title}</span>
                  <button type="button" onClick={() => setBag((cur) => cur.filter((id) => id !== item.id))} className="text-xs font-semibold text-muted">
                    Remove
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={order} className="mt-2 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
                  Send order to {SELLER}
                </button>
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">The bag is empty.</p>
          )
        ) : null}
      </section>
    </div>
  );
}

const GRC_FEATURES = [
  "One picture of the findings, not a separate binder for each scanner.",
  "Each finding sits on an 800-53 control with a named owner.",
  "Start from a Low, Moderate, or High baseline. Do not implement the whole catalog.",
  "Tailoring the authorizing official can sign: scope, overlay, parameter, or a real compensation.",
  "Assess with 800-53A: examine the evidence, interview the owner, test on the range.",
  "A POA&M line has a due date. “Ongoing” is not a date.",
  "A weekly exposure walk, not a binder that sleeps until the next audit.",
];

function GrcDesk({ onAdd }: { onAdd: () => void }) {
  const tool = axiomById("grc");
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">GRC desk</p>
      <h2 className="mt-1 font-display text-xl font-semibold">What the desk actually does</h2>
      <p className="mt-1 text-sm text-muted">{tool?.blurb}</p>
      <ul className="mt-3 space-y-2">
        {GRC_FEATURES.map((line) => (
          <li key={line} className="text-sm leading-snug">
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onAdd} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
          Add the seat · {marketMoney(240)}
        </button>
        {tool ? (
          <a href={tool.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            Open the desk
          </a>
        ) : null}
      </div>
    </article>
  );
}

function AxiomSuite({ onAdd }: { onAdd: () => void }) {
  const groups = axiomByFamily();
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{AXIOM_SUITE}</p>
      <h2 className="mt-1 font-display text-xl font-semibold">The lab suite</h2>
      <p className="mt-1 text-sm text-muted">Sixteen desks. One bill. Each one opens on the range, not on a production account.</p>
      <ul className="mt-3 space-y-3">
        {groups.map((group) => (
          <li key={group.family}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">{group.family}</p>
            <ul className="mt-1 space-y-1">
              {group.tools.map((tool) => (
                <li key={tool.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{tool.title.split("(")[0]?.trim()}</span>
                    <span className="text-muted"> · {tool.blurb}</span>
                  </span>
                  <a href={tool.href} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-primary">
                    Open
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onAdd} className="mt-4 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
        Add the suite · {marketMoney(960)}
      </button>
    </article>
  );
}

function Launchpad({ onAdd }: { onAdd: () => void }) {
  const [group, setGroup] = useState(LAUNCHPAD[0]!.id);
  const products = LAUNCHPAD.find((row) => row.id === group)?.products ?? [];
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Verified live · HTTP 200</p>
      <h2 className="mt-1 font-display text-xl font-semibold">Ecosystem Launchpad</h2>
      <p className="mt-1 text-sm text-muted">Each of these answered. Open the one you mean. Nothing in this list is repeated below.</p>
      <ul className="mt-3 divide-y divide-border">
        {VERIFIED_LIVE.map((product) => (
          <li key={product.href} className="flex items-start justify-between gap-3 py-2.5">
            <span>
              <span className="block text-sm font-semibold">{product.title}</span>
              <span className="block text-xs text-muted">{product.line}</span>
            </span>
            <a href={product.href} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-primary">
              Open
            </a>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onAdd} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
        Add the launchpad seat · {marketMoney(320)}
      </button>
      <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-none">
        {LAUNCHPAD.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setGroup(row.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-xs font-semibold",
              group === row.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {row.label}
          </button>
        ))}
      </div>
      <ul className="mt-3 divide-y divide-border">
        {products.map((product) => (
          <li key={product.href + product.title} className="flex items-start justify-between gap-3 py-2.5">
            <span>
              <span className="block text-sm font-semibold">{product.title}</span>
              <span className="block text-xs text-muted">{product.line}</span>
            </span>
            <a href={product.href} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-primary">
              Open
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TruePlace() {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">TruePlace</p>
      <h2 className="mt-1 font-display text-xl font-semibold">Real estate intelligence and the home ownership desk</h2>
      <p className="mt-1 text-sm text-muted">
        HomeTruth, a valuation you can explain, HomeOS, and TrueCost. Open the{" "}
        <a href={TRUEPLACE_HREF} target="_blank" rel="noreferrer" className="font-semibold text-primary">
          operating system
        </a>
        .
      </p>
      <ul className="mt-3 divide-y divide-border">
        {TRUEPLACE.map((product) => (
          <li key={product.href} className="flex items-start justify-between gap-3 py-2.5">
            <span>
              <span className="block text-sm font-semibold">{product.title}</span>
              <span className="block text-xs text-muted">{product.line}</span>
            </span>
            <a href={product.href} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-primary">
              Open
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
