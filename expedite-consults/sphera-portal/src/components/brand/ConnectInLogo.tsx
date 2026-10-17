"use client"

import React from "react"

interface ConnectInLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showSubtitle?: boolean
  className?: string
  variant?: "full" | "icon-only"
}

export function ConnectInLogo({
  size = "md",
  showSubtitle = true,
  className = "",
  variant = "full"
}: ConnectInLogoProps) {
  const iconSizes = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }

  const titleSizes = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  const subtitleSizes = {
    xs: "text-[8px]",
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm"
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* ─── Official ConnectLn Squircle Emblem ─── */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105 bg-[#1a1917] border border-white/10`}
      >
        <img
          src="/brand/connectln-icon.png"
          alt="ConnectLn Emblem"
          className="h-full w-full object-contain rounded-xl"
          loading="eager"
        />
      </div>

      {/* ─── Typography & Subtitle ─── */}
      {variant !== "icon-only" && (
        <div className="flex flex-col leading-none">
          <div className="relative flex items-center">
            <span
              className={`font-black tracking-tight text-zinc-900 dark:text-zinc-100 font-sans ${titleSizes[size]}`}
              style={{ letterSpacing: "-0.02em" }}
            >
              Connect<span className="text-zinc-900 dark:text-zinc-100">L</span>n
            </span>

            {/* Official Terracotta Underline beneath 'Connect' */}
            <span
              className="absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#a64532]"
              style={{ width: "70%" }}
            />
          </div>

          {showSubtitle && (
            <span
              className={`font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 whitespace-nowrap tracking-normal hidden min-[440px]:inline ${subtitleSizes[size]}`}
            >
              Tickets, vouches, and real work
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Alias for convenience
export const ConnectLnLogo = ConnectInLogo
