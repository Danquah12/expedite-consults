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
        url: "https://www.connectln.app/api/connectin/share-card?t=ConnectLn+%E2%80%94+Tickets%2C+vouches%2C+and+real+work",
        width: 1200,
        height: 630,
        alt: "ConnectLn — Tickets, vouches, and real work",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "Tickets, vouches, and real work on ConnectLn.",
    images: ["https://www.connectln.app/api/connectin/share-card?t=ConnectLn+%E2%80%94+Tickets%2C+vouches%2C+and+real+work"],
  },
}

export default function ConnectInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
