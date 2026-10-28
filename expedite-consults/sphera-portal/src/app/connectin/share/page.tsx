import type { Metadata } from "next"
import ShareRedirect from "./ShareRedirect"

type Params = Promise<Record<string, string | string[] | undefined>>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ""

export async function generateMetadata({ searchParams }: { searchParams: Params }): Promise<Metadata> {
  const sp = await searchParams
  const name = one(sp.n)
  const title = one(sp.t) || "ConnectLn Masterclass"
  const img = new URLSearchParams({ n: name, t: title, plate: one(sp.plate), p: one(sp.p) })
  const image = `https://www.connectln.app/api/connectin/share-card?${img.toString()}`
  const desc = name ? `Shared by ${name} on ConnectLn — Tickets, vouches, and real work.` : "Shared on ConnectLn — Tickets, vouches, and real work."
  return {
    title: `${title} — ConnectLn`,
    description: desc,
    openGraph: { title, description: desc, siteName: "ConnectLn", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [image] },
  }
}

export default async function SharePage({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams
  const target = `/connectin?video=${encodeURIComponent(one(sp.video))}&plate=${encodeURIComponent(one(sp.plate))}`
  return <ShareRedirect target={target} />
}
