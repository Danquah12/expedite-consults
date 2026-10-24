import { createServerFn } from "@tanstack/react-start";

/** Public catalog. Read only. No payments, no private messages, no write access. */
export const platformCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { CREWS } = await import("@/lib/feed-data");
  const { MARKET_ITEMS, SELLER } = await import("@/lib/market");
  const { HALLS } = await import("@/lib/hall");
  return {
    name: "Noctis Platform",
    version: 1,
    payments: "closed" as const,
    seller: SELLER,
    halls: HALLS.map((hall) => ({ id: hall.id, label: hall.label })),
    communities: CREWS.map((crew) => ({ id: crew.id, name: crew.name, about: crew.blurb })),
    catalog: MARKET_ITEMS.map((item) => ({ id: item.id, title: item.title, shelf: item.shelf })),
  };
});
