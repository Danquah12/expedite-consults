import { useState } from "react";

type Shop = { name: string; offer: string; contact: string };

const KEY = "vibetok-business";

function readShop(): Shop {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "") as Partial<Shop>;
    return { name: raw.name ?? "", offer: raw.offer ?? "", contact: raw.contact ?? "" };
  } catch {
    return { name: "", offer: "", contact: "" };
  }
}

/** A business profile. No payments. Checkout stays with the seller. */
export function BusinessCard() {
  const [shop, setShop] = useState<Shop>(readShop);
  const [saved, setSaved] = useState(false);

  function save(event: React.FormEvent) {
    event.preventDefault();
    localStorage.setItem(KEY, JSON.stringify(shop));
    setSaved(true);
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Noctis Business</p>
      <h2 className="mt-1 text-lg font-semibold">A profile for an organization.</h2>
      <p className="mt-1 text-sm text-muted">
        Name the shop, what it offers, and how to reach it. VibePay is not on. Charges stay with the seller until identity and security are trusted.
      </p>
      <form className="mt-3 space-y-2" onSubmit={save}>
        <input
          value={shop.name}
          onChange={(event) => setShop({ ...shop, name: event.target.value.slice(0, 80) })}
          placeholder="Organization"
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
        />
        <input
          value={shop.offer}
          onChange={(event) => setShop({ ...shop, offer: event.target.value.slice(0, 160) })}
          placeholder="What you teach or sell"
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
        />
        <input
          value={shop.contact}
          onChange={(event) => setShop({ ...shop, contact: event.target.value.slice(0, 80) })}
          placeholder="Email or phone"
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-sm"
        />
        <button type="submit" className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
          Save profile
        </button>
        {saved ? <p className="text-xs text-muted">Saved on this device. It is not a payment account.</p> : null}
      </form>
    </section>
  );
}
