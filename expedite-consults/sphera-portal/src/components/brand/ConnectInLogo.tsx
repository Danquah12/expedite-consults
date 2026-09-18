"use client"

import React from "react"

interface ConnectInLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showSubtitle?: boolean
  className?: string
}

export function ConnectInLogo({
  size = "md",
  showSubtitle = true,
  className = ""
}: ConnectInLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-14 w-14 text-xl"
  }

  const titleSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* ─── Proprietary Expedite Consults Brand Emblem ─── */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003B73] via-[#0070f3] to-[#00d4ff] text-white shadow-md shadow-sky-500/20 ring-1 ring-white/20 transition-transform group-hover:scale-105 overflow-hidden`}
      >
        {/* Subtle Cyber Network Grid Lines */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />

        {/* Dynamic Connected Node SVG Emblem */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5/6 w-5/6 drop-shadow-md"
        >
          {/* Interconnected Orbit Paths */}
          <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
          <path
            d="M8 20L16 8L24 20"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 16H21"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Glowing Network Nodes */}
          <circle cx="16" cy="8" r="2.5" fill="#38bdf8" />
          <circle cx="8" cy="20" r="2" fill="white" />
          <circle cx="24" cy="20" r="2" fill="white" />
        </svg>
      </div>

      {/* ─── Typography & Ecosystem Subtitle ─── */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-zinc-900 dark:text-white ${titleSizes[size]}`}>
            Connect<span className="text-[#0070f3] dark:text-[#38bdf8]">In</span>
          </span>
          <span className="rounded-md bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-blue-600 dark:text-sky-300">
            PRO
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase mt-0.5">
            By Expedite Consults
          </span>
        )}
      </div>
    </div>
  )
}
