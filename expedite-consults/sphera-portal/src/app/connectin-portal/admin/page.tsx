import type { Metadata } from "next"
import { ConnectLnAdminGuideView } from "@/components/connectln/ConnectLnAdminGuideView"

export const metadata: Metadata = {
  title: "ConnectLn Administration Guide — ConnectLn for Business",
  description:
    "Manage applications, data, devices, SSO, and users across ConnectLn 360 Workspace without clutter.",
}

export default function ConnectInAdminGuidePage() {
  return <ConnectLnAdminGuideView />
}
