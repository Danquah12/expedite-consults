import type { Metadata } from "next"
import { ConnectLn365PortalLanding } from "@/components/connectln/ConnectLn365PortalLanding"

export const metadata: Metadata = {
  title: "ConnectLn 365 Portal — Mail, Calls, Jobs & AI Workspace",
  description:
    "Unified Office-style portal for ConnectLn messaging, HD group voice & video calls, verified jobs, learning academy, and mobile apps.",
}

export default function ConnectInPortalPage() {
  return <ConnectLn365PortalLanding />
}
