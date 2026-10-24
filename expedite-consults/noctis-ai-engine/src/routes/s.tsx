import { createFileRoute } from "@tanstack/react-router";
import { readShareLink, type ShareNote } from "@/lib/share-link";

export const Route = createFileRoute("/s")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { t?: string; n?: string; a?: string; v?: string; c?: string } = {};
    if (typeof search.t === "string" && search.t.trim()) out.t = search.t.replace(/\s+/g, " ").trim().slice(0, 1800);
    if (typeof search.n === "string" && search.n.trim()) out.n = search.n.replace(/\s+/g, " ").trim().slice(0, 80);
    if (typeof search.a === "string" && search.a.startsWith("https://")) out.a = search.a.slice(0, 800);
    if (typeof search.v === "string" && search.v.trim()) out.v = search.v.replace(/[^\w.-]/g, "").slice(0, 12);
    if (typeof search.c === "string" && search.c.trim()) out.c = search.c.replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase();
    return out;
  },
  loaderDeps: ({ search }) => ({ c: search.c ?? "" }),
  loader: ({ deps }) => (deps.c ? readShareLink({ data: { code: deps.c } }) : Promise.resolve(null)),
  head: ({ match, loaderData }) => {
    const saved = loaderData as ShareNote | null;
    const who = saved?.name || match.search.n || "Asiedudanquah @ Noctis";
    const note = saved?.body || match.search.t || who;
    const origin =
      typeof match.context.origin === "string" && match.context.origin.startsWith("http")
        ? match.context.origin
        : "https://back-vibtook-4.vercel.app";
    const avatar = saved?.avatar || match.search.a || `${origin}/media/avatars/kwesi.jpg`;
    const query = new URLSearchParams();
    if (who) query.set("n", who);
    if (avatar.startsWith("https://")) query.set("a", avatar);
    query.set("v", match.search.v || "17");
    const tail = query.toString();
    const page = match.search.c
      ? `${origin}/s?c=${match.search.c}${tail ? `&${tail}` : ""}`
      : `${origin}/s${tail ? `?${tail}` : ""}`;
    const image = `${origin}/api/share-card${tail ? `?${tail}` : ""}`;
    return {
      meta: [
        { title: who },
        { name: "description", content: note },
        { property: "og:site_name", content: "Noctis" },
        { property: "og:title", content: who },
        { property: "og:description", content: note },
        { property: "og:url", content: page },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { property: "og:image:type", content: "image/jpeg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: who },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: who },
        { name: "twitter:description", content: note },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: ShareCard,
});

function ShareCard() {
  const { t, n, a } = Route.useSearch();
  const saved = Route.useLoaderData() as ShareNote | null;
  const who = saved?.name || n || "Asiedudanquah @ Noctis";
  const face = saved?.avatar || a || "/media/avatars/kwesi.jpg";
  const words = saved?.body || t || who;
  return (
    <main className="min-h-dvh bg-[#0b1220] text-[#f6f1e6]" data-card="photo">
      <img src={`/api/share-card?n=${encodeURIComponent(who)}&a=${encodeURIComponent(face)}&v=${encodeURIComponent("17")}`} alt="Noctis" className="mx-auto w-full max-w-3xl" />
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-8">
        {face ? <img src={face} alt="" className="size-16 rounded-full object-cover" /> : null}
        <div>
          <h1 className="text-3xl font-semibold">{who}</h1>
          <p className="mt-4 text-lg leading-relaxed">{words}</p>
        </div>
      </div>
    </main>
  );
}
