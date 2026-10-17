import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ConnectLn — Tickets, vouches, and real work",
  description: "Connect with colleagues, verify credentials, and collaborate on real work on ConnectLn.",
  openGraph: {
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "You have been invited to connect on ConnectLn. Tickets, vouches, and real work.",
    url: "https://connectln.vercel.app/connectin-login",
    siteName: "ConnectLn",
    images: [
      {
        url: "https://connectln.vercel.app/brand/connectln-square-og.png",
        width: 600,
        height: 600,
        alt: "ConnectLn Emblem — Tickets, vouches, and real work",
      },
      {
        url: "https://connectln.vercel.app/brand/connectln-og.png",
        width: 1200,
        height: 630,
        alt: "ConnectLn — Tickets, vouches, and real work",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectLn — Tickets, vouches, and real work",
    description: "You have been invited to connect on ConnectLn. Tickets, vouches, and real work.",
    images: ["https://connectln.vercel.app/brand/connectln-og.png"],
  },
}

export default function ConnectInLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
