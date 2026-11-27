import { redirect } from "next/navigation"

export default function HelpCheckEmailRedirectPage() {
  redirect("/connectin/security-alert?check=1")
}
