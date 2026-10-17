import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ConnectLn — Tickets, vouches, and real work",
  description: "The zero-trust professional network for cloud, cybersecurity, trades, and enterprise architects.",
  openGraph: {
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "Tickets, vouches, and real work on ConnectLn.",
    url: "https://connectln.vercel.app/connectin",
    siteName: "ConnectLn",
    images: [
      {
        url: "https://connectln.vercel.app/brand/connectln-og.png",
        width: 1200,
        height: 630,
        alt: "ConnectLn — Tickets, vouches, and real work",
      },
      {
        url: "https://connectln.vercel.app/brand/connectln-square-og.png",
        width: 600,
        height: 600,
        alt: "ConnectLn Emblem",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "Tickets, vouches, and real work on ConnectLn.",
    images: ["https://connectln.vercel.app/brand/connectln-og.png"],
  },
}

export default function ConnectInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
