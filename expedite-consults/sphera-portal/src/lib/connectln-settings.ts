"use client"

import { useSyncExternalStore } from "react"

/**
 * User preference: should videos on the Home feed start playing by themselves when scrolled into view?
 * Default is OFF. When ON, videos start muted and show a "Tap for Sound" button.
 */
const AUTOPLAY_KEY = "connectln_autoplay_videos_v1"
const SETTINGS_EVENT = "connectln-settings-updated"

export function getAutoplayVideosPref(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(AUTOPLAY_KEY) === "on"
  } catch {
    return false
  }
}

export function setAutoplayVideosPref(on: boolean) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AUTOPLAY_KEY, on ? "on" : "off")
  } catch {}
  window.dispatchEvent(new Event(SETTINGS_EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(SETTINGS_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(SETTINGS_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

/** React hook: [autoplayEnabled, setAutoplayEnabled]. Stays in sync across components and tabs. */
export function useAutoplayVideosPref(): [boolean, (on: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getAutoplayVideosPref, () => false)
  return [value, setAutoplayVideosPref]
}
