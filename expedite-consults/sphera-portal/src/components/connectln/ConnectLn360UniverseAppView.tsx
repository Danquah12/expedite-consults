"use client"

import React, { useEffect, useState } from "react"
import {
  ExternalLink,
  House,
  Loader2,
  Maximize2,
  Minimize2,
  PlayCircle,
  RefreshCw,
  Zap,
} from "lucide-react"

export type ConnectLn360UniverseAppId = "noctissocial" | "noctisclinic"

export interface ConnectLn360UniverseAppConfig {
  id: ConnectLn360UniverseAppId
  name: string
  shortName: string
  tagline: string
  url: string
  hostLabel: string
  accentBg: string
  badge: string
}

export const CONNECTLN_360_UNIVERSE_APPS: Record<
  ConnectLn360UniverseAppId,
  ConnectLn360UniverseAppConfig
> = {
  noctissocial: {
    id: "noctissocial",
    name: "Noctis Social",
    shortName: "Noctis Social",
    tagline: "Create, learn, and connect in 60 seconds.",
    url: "https://noctis.social",
    hostLabel: "noctis.social",
    accentBg: "bg-fuchsia-600",
    badge: "360 Universe",
  },
  noctisclinic: {
    id: "noctisclinic",
    name: "Noctis Clinic",
    shortName: "Noctis Clinic",
    tagline: "Watch a Spark. Pass a drill. Take the stamp.",
    url: "https://www.dstrike.app/noctis",
    hostLabel: "www.dstrike.app/noctis",
    accentBg: "bg-cyan-600",
    badge: "360 Universe",
  },
}

interface ConnectLn360UniverseAppViewProps {
  appId: ConnectLn360UniverseAppId
  onSwitchApp: (tab: string) => void
}

export function ConnectLn360UniverseAppView({
  appId,
  onSwitchApp,
}: ConnectLn360UniverseAppViewProps) {
  const app = CONNECTLN_360_UNIVERSE_APPS[appId]
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)
    return () => clearTimeout(fallbackTimer)
  }, [appId, iframeKey])

  const AppIcon = app.id === "noctissocial" ? PlayCircle : Zap

  return (
    <section
      aria-label={`${app.name} — ConnectLn 360 Universe`}
      className={
        isFullscreen
          ? "fixed inset-0 z-[80] flex flex-col bg-white dark:bg-zinc-950"
          : "w-full rounded-2xl border border-[#E7E2DA] dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_14px_40px_rgba(11,31,58,0.08)] overflow-hidden flex flex-col"
      }
    >
      {/* Top Universe Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#FAF7F2] dark:bg-zinc-900/95 border-b border-[#E7E2DA] dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs ${app.accentBg}`}
          >
            <AppIcon className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-extrabold tracking-tight text-[#0B1F3A] dark:text-zinc-100 truncate">
                {app.name}
              </h2>
              <span className="rounded-full bg-[#0067B8]/10 text-[#0067B8] dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">
                {app.badge}
              </span>
              <span className="hidden sm:inline-flex rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-[#4B5563] dark:text-zinc-300">
                {app.hostLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] dark:text-zinc-400 truncate">
              {app.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Universe Switcher Pills */}
          <div className="inline-flex items-center rounded-full border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-950 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(false)
                onSwitchApp("home")
              }}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[#4B5563] hover:text-[#0B1F3A] dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
              title="Back to ConnectLn Home"
            >
              <House className="h-3.5 w-3.5" />
              <span className="hidden md:inline">ConnectLn Home</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchApp("noctissocial")}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors cursor-pointer ${
                appId === "noctissocial"
                  ? "bg-fuchsia-600 text-white shadow-2xs"
                  : "text-[#4B5563] hover:text-[#0B1F3A] dark:text-zinc-300 dark:hover:text-white"
              }`}
              title="Noctis Social (https://noctis.social)"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Noctis Social</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchApp("noctisclinic")}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors cursor-pointer ${
                appId === "noctisclinic"
                  ? "bg-cyan-600 text-white shadow-2xs"
                  : "text-[#4B5563] hover:text-[#0B1F3A] dark:text-zinc-300 dark:hover:text-white"
              }`}
              title="Noctis Clinic (https://www.dstrike.app/noctis)"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Noctis Clinic</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setIframeKey((prev) => prev + 1)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#0B1F3A] dark:text-zinc-200 hover:bg-[#F3EFE8] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={`Reload ${app.name}`}
            aria-label={`Reload ${app.name}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E7E2DA] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#0B1F3A] dark:text-zinc-200 hover:bg-[#F3EFE8] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-[#0067B8]/30 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-[11px] font-bold text-[#0067B8] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title={`Open ${app.url} in a new tab`}
          >
            <span className="hidden sm:inline">Open in New Tab</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Live Embedded App Viewport */}
      <div
        className={`relative w-full bg-white dark:bg-zinc-950 ${
          isFullscreen
            ? "flex-1 min-h-0"
            : "h-[calc(100dvh-175px)] lg:h-[calc(100dvh-136px)] min-h-[520px]"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#FAF7F2]/90 dark:bg-zinc-950/90 backdrop-blur-xs pointer-events-none">
            <Loader2 className="h-7 w-7 animate-spin text-[#0067B8]" />
            <p className="text-xs font-bold text-[#0B1F3A] dark:text-zinc-100">
              Loading {app.name} ({app.hostLabel}) inside ConnectLn 360...
            </p>
          </div>
        )}

        <iframe
          key={`${app.id}-${iframeKey}`}
          src={app.url}
          title={`${app.name} — ConnectLn 360 Universe`}
          className="w-full h-full border-0 bg-white dark:bg-zinc-950"
          allow="camera; microphone; autoplay; clipboard-read; clipboard-write; fullscreen; picture-in-picture; display-capture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </section>
  )
}
