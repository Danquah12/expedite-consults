import type { Metadata } from "next"
import ShareRedirect from "./ShareRedirect"

type Params = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ""

export async function generateMetadata({ searchParams }: { searchParams: Params }): Promise<Metadata> {
  const sp = await searchParams
  const name = one(sp.n)
  const title = one(sp.t) || "ConnectLn Masterclass"
  const sub = one(sp.sub)
  const plate = one(sp.d) || one(sp.plate)
  const img = new URLSearchParams({ n: name, t: title, sub, plate, p: one(sp.p), cb: "3" })
  const image = `https://www.conectln.com/api/connectin/share-card?${img.toString()}`
  const fullTitle = title && title !== "ConnectLn Masterclass"
    ? `${title} — Shared via ConnectLn Pulse`
    : "ConnectLn — Tickets, vouches, and real work"
  const desc = sub
    ? `${sub} · Shared by ${name || "ConnectLn Member"} on ConnectLn.`
    : "ConnectLn: The zero-trust professional network. Verified tickets, vouches, and real work across cloud, cybersecurity, trades, and enterprise teams."
  return {
    title: fullTitle,
    description: desc,
    openGraph: { title: fullTitle, description: desc, siteName: "ConnectLn", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: [image] },
  }
}

export default async function SharePage({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams
  const to = one(sp.to)
  const title = one(sp.t)
  const sub = one(sp.sub)
  const vid = one(sp.v) || one(sp.video)
  const plate = one(sp.d) || one(sp.plate)
  // same-site paths only (no open redirect)
  const target =
    to.startsWith("/") && !to.startsWith("//")
      ? to
      : sub.toLowerCase().includes("pulse")
      ? `/connectin?tab=pulserooms&pulseTitle=${encodeURIComponent(title)}`
      : `/connectin?video=${encodeURIComponent(vid)}&plate=${encodeURIComponent(plate)}&vtitle=${encodeURIComponent(title)}`
  return <ShareRedirect target={target} />
}
