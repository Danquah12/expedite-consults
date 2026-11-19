"use client"

import { useSyncExternalStore } from "react"
import { notifyExclusiveVideoPlay } from "@/components/connectln/ConnectLnStudioPlayer"

/**
 * User preference: should videos on the Home feed start playing automatically when scrolled into view?
 * Default is ON (muted with "Tap for Sound" to satisfy browser autoplay policy).
 */
const AUTOPLAY_KEY = "connectln_autoplay_videos_v2"
const SETTINGS_EVENT = "connectln-settings-updated"

export function getAutoplayVideosPref(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(AUTOPLAY_KEY) !== "off"
  } catch {
    return true
  }
}

export function setAutoplayVideosPref(on: boolean) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(AUTOPLAY_KEY, on ? "on" : "off")
  } catch {}
  window.dispatchEvent(new Event(SETTINGS_EVENT))
  requestViewportAutoplayEvaluation()
}

function subscribe(callback: () => void) {
  window.addEventListener(SETTINGS_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(SETTINGS_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

/** React hook: [autoplayEnabled, setAutoplayEnabled]. Defaults to true across Home feed videos. */
export function useAutoplayVideosPref(): [boolean, (on: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getAutoplayVideosPref, () => true)
  return [value, setAutoplayVideosPref]
}

/* ──────────────────────────────────────────────────────────────────────────
 * Central Home Viewport Autoplay Coordinator
 * Ensures whichever video card is currently in view plays automatically
 * without two adjacent sections fighting each other on scroll.
 * ────────────────────────────────────────────────────────────────────────── */
export interface ViewportVideoSlot {
  id: string
  getElement: () => HTMLElement | null
  startAutoplay: () => void
  stopAutoplay: () => void
}

const registeredSlots = new Map<string, ViewportVideoSlot>()
let currentAutoActiveId: string | null = null
let manualOverrideId: string | null = null
let manualOverrideElement: HTMLElement | null = null
let listenersAttached = false
let evalRafId: number | null = null
let sharedObserver: IntersectionObserver | null = null
const observedElements = new WeakSet<HTMLElement>()

const STICKY_HEADER_HEIGHT = 52

function computeVisibleRatio(el: HTMLElement, vh: number): number {
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return 0
  const visibleTop = Math.max(STICKY_HEADER_HEIGHT, rect.top)
  const visibleBottom = Math.min(vh, rect.bottom)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)
  const denom = Math.min(rect.height, Math.max(1, vh - STICKY_HEADER_HEIGHT))
  return visibleHeight / denom
}

function evaluateViewportAutoplayNow() {
  if (typeof window === "undefined") return
  const vh = window.innerHeight || document.documentElement.clientHeight || 800

  if (!getAutoplayVideosPref()) {
    if (currentAutoActiveId) {
      const prev = registeredSlots.get(currentAutoActiveId)
      currentAutoActiveId = null
      prev?.stopAutoplay()
    }
    return
  }

  // Respect user's manual video click while that video remains in view
  if (manualOverrideId) {
    const manualEl =
      manualOverrideElement || registeredSlots.get(manualOverrideId)?.getElement() || null
    if (manualEl && document.body.contains(manualEl) && computeVisibleRatio(manualEl, vh) >= 0.16) {
      return
    }
    manualOverrideId = null
    manualOverrideElement = null
  }

  const focalY = STICKY_HEADER_HEIGHT + (vh - STICKY_HEADER_HEIGHT) * 0.38
  let bestId: string | null = null
  let bestScore = -Infinity

  for (const [id, slot] of registeredSlots.entries()) {
    const el = slot.getElement()
    if (!el || !document.body.contains(el)) continue
    if (sharedObserver && !observedElements.has(el)) {
      observedElements.add(el)
      sharedObserver.observe(el)
    }

    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) continue

    const visibleRatio = computeVisibleRatio(el, vh)
    const minThreshold = id === currentAutoActiveId ? 0.25 : 0.38
    if (visibleRatio < minThreshold) continue

    const centerY = rect.top + rect.height / 2
    const distancePenalty = Math.abs(centerY - focalY)
    // Left-to-right tiebreaker so multi-column rows (e.g. 3-card Home Live Media Wire) deterministically pick Card 1
    const horizontalTieBreaker = Math.max(0, rect.left) * 0.08
    const hysteresisBonus = id === currentAutoActiveId ? 40 : 0
    const score = visibleRatio * 1000 - distancePenalty - horizontalTieBreaker + hysteresisBonus

    if (score > bestScore) {
      bestScore = score
      bestId = id
    }
  }

  if (bestId !== currentAutoActiveId) {
    if (currentAutoActiveId) {
      const prevSlot = registeredSlots.get(currentAutoActiveId)
      prevSlot?.stopAutoplay()
    }
    currentAutoActiveId = bestId
    if (bestId) {
      const nextSlot = registeredSlots.get(bestId)
      if (nextSlot) {
        notifyExclusiveVideoPlay(bestId)
        nextSlot.startAutoplay()
      }
    }
  }
}

export function requestViewportAutoplayEvaluation() {
  if (typeof window === "undefined") return
  if (evalRafId !== null) return
  evalRafId = window.requestAnimationFrame(() => {
    evalRafId = null
    evaluateViewportAutoplayNow()
  })
}

function ensureGlobalListeners() {
  if (listenersAttached || typeof window === "undefined") return
  listenersAttached = true

  // Capture-phase scroll catches both window scrolling AND inner scrollable containers across all tabs
  window.addEventListener("scroll", requestViewportAutoplayEvaluation, {
    capture: true,
    passive: true,
  })
  window.addEventListener("resize", requestViewportAutoplayEvaluation, { passive: true })
  window.addEventListener("popstate", requestViewportAutoplayEvaluation, { passive: true })
  window.addEventListener(
    "click",
    () => {
      window.setTimeout(requestViewportAutoplayEvaluation, 140)
      window.setTimeout(requestViewportAutoplayEvaluation, 400)
    },
    { passive: true }
  )

  if ("IntersectionObserver" in window) {
    sharedObserver = new IntersectionObserver(
      () => {
        requestViewportAutoplayEvaluation()
      },
      {
        root: null,
        rootMargin: "-52px 0px -5% 0px",
        threshold: [0, 0.2, 0.38, 0.6, 0.85],
      }
    )
  }
}

export function notifyManualVideoOverride(id: string | null, el?: HTMLElement | null) {
  if (currentAutoActiveId && currentAutoActiveId !== id) {
    const prev = registeredSlots.get(currentAutoActiveId)
    currentAutoActiveId = null
    prev?.stopAutoplay()
  }
  manualOverrideId = id
  manualOverrideElement = el || null
}

export function registerViewportVideoSlot(slot: ViewportVideoSlot): () => void {
  if (typeof window === "undefined") return () => {}
  ensureGlobalListeners()
  registeredSlots.set(slot.id, slot)

  const el = slot.getElement()
  if (el && sharedObserver && !observedElements.has(el)) {
    observedElements.add(el)
    sharedObserver.observe(el)
  }

  requestViewportAutoplayEvaluation()
  // Also schedule a short post-layout check once images/cards settle
  const settleTimer = window.setTimeout(requestViewportAutoplayEvaluation, 180)

  return () => {
    window.clearTimeout(settleTimer)
    const existing = registeredSlots.get(slot.id)
    if (existing === slot) {
      registeredSlots.delete(slot.id)
    }
    if (currentAutoActiveId === slot.id) {
      currentAutoActiveId = null
      requestViewportAutoplayEvaluation()
    }
    if (manualOverrideId === slot.id) {
      manualOverrideId = null
      manualOverrideElement = null
    }
  }
}
