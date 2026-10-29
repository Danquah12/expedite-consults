"use client"

import { useEffect, useState } from "react"

/**
 * Link-preview support for anything a member shares from ConnectLn.
 * Never embeds base64 strings into the URL so shared links stay short, clean, and readable.
 */

export function isUsableSharePhoto(src?: string | null, allowBrandAvatar = false): boolean {
  if (!src) return false
  if (src.includes("dicebear") || src.startsWith("data:image/")) return false
  if (!allowBrandAvatar && src.includes("kwesi-avatar")) return false
  return /^https:\/\//i.test(src) && src.length < 160
}

/** Only passes through short https:// avatar URLs — never base64 strings in the URL. */
export function compressAvatarForShare(src?: string | null, allowBrandAvatar = false): Promise<string> {
  if (!src) return Promise.resolve("")
  if (isUsableSharePhoto(src, allowBrandAvatar)) {
    return Promise.resolve(src)
  }
  return Promise.resolve("")
}

export function useSharePic(src?: string | null, allowBrandAvatar = false): string {
  const [pic, setPic] = useState("")
  useEffect(() => {
    if (src && isUsableSharePhoto(src, allowBrandAvatar)) {
      setPic(src)
    } else {
      setPic("")
    }
  }, [src, allowBrandAvatar])
  return pic
}

/** Builds a clean, short shareable link without base64 clutter. */
export function buildSharePreviewUrl(opts: { to: string; title: string; sharerName?: string; pic?: string; subtitle?: string }): string {
  const q = new URLSearchParams()
  const vidMatch = opts.to.match(/[?&]video=([^&]+)/)
  if (vidMatch) {
    q.set("v", decodeURIComponent(vidMatch[1]))
  } else if (opts.to) {
    q.set("to", opts.to)
  }
  if (opts.subtitle) q.set("d", opts.subtitle)
  if (opts.sharerName) q.set("n", opts.sharerName)
  if (opts.title) {
    const cleanTitle = opts.title.replace(/ — Career Masterclass.*$/i, "").slice(0, 65)
    q.set("t", cleanTitle)
  }
  if (opts.pic && /^https:\/\//i.test(opts.pic) && opts.pic.length < 160) {
    q.set("p", opts.pic)
  }
  q.set("cb", "2")
  return `https://www.connectln.app/connectin/share?${q.toString()}`
}
