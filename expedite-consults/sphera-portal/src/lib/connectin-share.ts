"use client"

import { useEffect, useState } from "react"

/**
 * Link-preview support for anything a member shares from ConnectLn.
 * The preview card shows the SHARER's own photo and name (never a fixed person).
 * No usable photo => empty string => the card shows a blank circle.
 */

export function isUsableSharePhoto(src?: string | null, allowBrandAvatar = false): boolean {
  if (!src) return false
  if (src.includes("dicebear") || src.startsWith("data:image/svg")) return false
  if (!allowBrandAvatar && src.includes("kwesi-avatar")) return false
  return /^https:\/\//i.test(src) || src.startsWith("data:image/") || (allowBrandAvatar && src.startsWith("/"))
}

/** Shrinks a photo to a tiny base64url JPEG (or passes through a short https URL). Resolves "" if unusable. */
export function compressAvatarForShare(src?: string | null, allowBrandAvatar = false): Promise<string> {
  return new Promise(resolve => {
    if (!isUsableSharePhoto(src, allowBrandAvatar) || !src) return resolve("")
    if (/^https:\/\//i.test(src) && src.length < 400) return resolve(src)
    if (typeof window === "undefined") return resolve("")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const size = 72
        const c = document.createElement("canvas")
        c.width = size
        c.height = size
        const ctx = c.getContext("2d")
        if (!ctx) return resolve("")
        const side = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
        const b64 = c.toDataURL("image/jpeg", 0.55).split(",")[1] || ""
        resolve(b64.replace(/\+/g, "-").replace(/\//g, "_"))
      } catch {
        resolve("")
      }
    }
    img.onerror = () => resolve("")
    img.src = src
  })
}

export function useSharePic(src?: string | null, allowBrandAvatar = false): string {
  const [pic, setPic] = useState("")
  useEffect(() => {
    let cancelled = false
    compressAvatarForShare(src, allowBrandAvatar).then(p => {
      if (!cancelled) setPic(p)
    })
    return () => {
      cancelled = true
    }
  }, [src, allowBrandAvatar])
  return pic
}

/** Builds the shareable link. `to` is a same-site path such as /connectin?video=... */
export function buildSharePreviewUrl(opts: { to: string; title: string; sharerName?: string; pic?: string; subtitle?: string }): string {
  const q = new URLSearchParams()
  // If `to` is a standard video share path (`/connectin?video=ID&plate=PLATE`), use compact `v` & `d` params for a clean URL
  const vidMatch = opts.to.match(/[?&]video=([^&]+)/)
  if (vidMatch) {
    q.set("v", decodeURIComponent(vidMatch[1]))
  } else if (opts.to) {
    q.set("to", opts.to)
  }
  if (opts.subtitle) q.set("d", opts.subtitle)
  if (opts.sharerName) q.set("n", opts.sharerName)
  if (opts.title) q.set("t", opts.title)
  if (opts.pic) q.set("p", opts.pic)
  return `https://www.connectln.app/connectin/share?${q.toString()}`
}
