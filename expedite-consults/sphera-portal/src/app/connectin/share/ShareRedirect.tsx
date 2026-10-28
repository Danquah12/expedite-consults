"use client"

import { useEffect } from "react"

export default function ShareRedirect({ target }: { target: string }) {
  useEffect(() => {
    window.location.replace(target)
  }, [target])
  return (
    <p style={{ padding: 24, fontFamily: "sans-serif" }}>
      Opening ConnectLn… <a href={target}>Tap here if nothing happens</a>
    </p>
  )
}
