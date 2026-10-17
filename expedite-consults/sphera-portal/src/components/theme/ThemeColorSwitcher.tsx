"use client"

import React, { useState, useRef, useEffect } from "react"
import { Palette, Check, Sun, Moon, Sparkles, ChevronDown } from "lucide-react"
import { useTheme, THEME_OPTIONS, Theme } from "@/context/ThemeContext"

interface ThemeColorSwitcherProps {
  compact?: boolean
  className?: string
  align?: "left" | "right"
}

export function ThemeColorSwitcher({
  compact = false,
  className = "",
  align = "right"
}: ThemeColorSwitcherProps) {
  const { theme, setTheme, toggleTheme, themeLabel, isDark, themeOption } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={popoverRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-full transition-all cursor-pointer border ${
          compact
            ? "px-2.5 py-1 text-xs bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            : "px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-200 hover:border-[#0A66C2] shadow-2xs"
        }`}
        title={`Switch Background Color & Theme (Current: ${themeLabel})`}
        aria-label="Theme & Background Color Switcher"
      >
        {/* Active Theme Color Swatch Circle */}
        <span
          className="h-3.5 w-3.5 rounded-full border border-black/20 dark:border-white/30 shrink-0 shadow-xs"
          style={{ backgroundColor: themeOption.bgHex }}
        />
        <span className="text-xs shrink-0">{themeOption.icon}</span>
        {!compact && (
          <span className="hidden lg:inline text-[11px] font-semibold truncate max-w-[85px]">
            {themeOption.shortLabel}
          </span>
        )}
        <Palette className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
      </button>

      {/* Popover Color Palette Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-[#0A66C2] dark:text-sky-400" />
              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                Background Colors &amp; Themes
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
              title="Quick Toggle Light / Dark"
            >
              {isDark ? (
                <>
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3 text-indigo-500" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 my-1.5 px-0.5">
            Select a background color palette for your ConnectIn workspace:
          </p>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-0.5">
            {THEME_OPTIONS.map((t) => {
              const isSelected = theme === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-start gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0A66C2] bg-blue-50/70 dark:bg-sky-950/40 ring-1 ring-[#0A66C2]"
                      : "border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {/* Swatch Previews: Canvas + Card layered */}
                  <div className="relative shrink-0 mt-0.5">
                    <span
                      className="block h-6 w-6 rounded-lg border border-black/20 dark:border-white/20 shadow-xs"
                      style={{ backgroundColor: t.bgHex }}
                    />
                    <span
                      className="absolute -bottom-1 -right-1 block h-3.5 w-3.5 rounded-md border border-black/20 dark:border-white/20 shadow-2xs"
                      style={{ backgroundColor: t.cardHex }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {t.shortLabel}
                      </p>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[9.5px] leading-tight text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer Active Indicator */}
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Active:</span>
              <span>{themeLabel}</span>
            </span>
            <span className="text-[9.5px] font-mono">Instant &amp; Saved</span>
          </div>
        </div>
      )}
    </div>
  )
}
