import type { Metadata } from "next"
import { ConnectLn360PortalLanding } from "@/components/connectln/ConnectLn360PortalLanding"

export const metadata: Metadata = {
  title: "ConnectLn 360 Portal — Messaging, Calls, Jobs & AI Workspace",
  description:
    "Unified all-in-one ConnectLn 360 portal for messaging, HD group voice & video calls, verified jobs, learning academy, and mobile apps.",
}

export default function ConnectInPortalPage() {
  return <ConnectLn360PortalLanding />
}
