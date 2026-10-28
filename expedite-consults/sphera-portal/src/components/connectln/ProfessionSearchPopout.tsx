"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, X, Check, Briefcase, ChevronDown, Sparkles, Filter } from "lucide-react"
import {
  ALL_PROFESSIONS,
  findProfessionById,
  findEnclaveById,
  ProfessionDefinition,
  PROFESSION_ENCLAVES
} from "@/lib/connectin-professions"
import { useLanguage } from "@/context/LanguageContext"

interface ProfessionSearchPopoutProps {
  selectedProfessionId: string
  onSelectProfession: (professionId: string) => void
  label?: string
  showAutoDetectOption?: boolean
  className?: string
  compact?: boolean
}

// Popular letter shortcuts for instant 1-click filter
const QUICK_LETTERS = ["R", "D", "V", "E", "P", "C", "M", "F", "B", "T", "W", "A", "S"]

export function ProfessionSearchPopout({
  selectedProfessionId,
  onSelectProfession,
  label = "Professional Profile & Enclave",
  showAutoDetectOption = true,
  className = "",
  compact = false
}: ProfessionSearchPopoutProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Current selected profession object
  const selectedProf = useMemo(() => {
    if (!selectedProfessionId || selectedProfessionId === "auto_detect") return null
    return findProfessionById(selectedProfessionId)
  }, [selectedProfessionId])

  const selectedEnclave = useMemo(() => {
    if (!selectedProf) return null
    return findEnclaveById(selectedProf.enclaveId)
  }, [selectedProf])

  // Filtered professions based on search query
  // Prioritizes titles starting with the typed letter(s)
  const filteredProfessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return ALL_PROFESSIONS

    const startsWithMatches: ProfessionDefinition[] = []
    const containsMatches: ProfessionDefinition[] = []

    for (const prof of ALL_PROFESSIONS) {
      const titleLower = prof.title.toLowerCase()
      const categoryLower = prof.categoryName.toLowerCase()
      const idLower = prof.id.toLowerCase()
      const skillsLower = prof.typicalSkills.map(s => s.toLowerCase()).join(" ")

      if (titleLower.startsWith(q) || idLower.startsWith(q)) {
        startsWithMatches.push(prof)
      } else if (
        titleLower.includes(q) ||
        categoryLower.includes(q) ||
        idLower.includes(q) ||
        skillsLower.includes(q)
      ) {
        containsMatches.push(prof)
      }
    }

    return [...startsWithMatches, ...containsMatches]
  }, [searchQuery])

  // Click-outside listener to close popout
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-focus input when popout opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (profId: string) => {
    onSelectProfession(profId)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleOpenSearch = () => {
    setIsOpen(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectProfession("auto_detect")
    setSearchQuery("")
  }

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {/* Header Label & Enclave Security Pill */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400" />
          <span>{label === "Professional Profile & Enclave" ? t("profession_label", "Professional Profile & Enclave") : label}</span>
        </label>
        <span className="text-[10px] font-mono text-[#0A66C2] dark:text-sky-400 font-bold bg-blue-100/70 dark:bg-sky-900/50 px-2 py-0.5 rounded-full">
          {t("least_privilege_enclave_tag", "🔒 Least Privilege Enclave")}
        </span>
      </div>

      {/* Trigger & Search Bar Box */}
      <div className="rounded-xl border border-blue-200/80 dark:border-sky-900/40 bg-blue-50/50 dark:bg-sky-950/20 p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          {/* Main interactive search trigger input */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!isOpen) setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsOpen(false)
                if (e.key === "Enter" && filteredProfessions.length > 0) {
                  e.preventDefault()
                  handleSelect(filteredProfessions[0].id)
                }
              }}
              placeholder={
                selectedProf
                  ? `${t("selected_profession", "Selected")}: ${selectedProf.title} · ${t("type_first_letter_placeholder", "Type letter to search...")}`
                  : t("type_first_letter_placeholder", "Type first letter of profession (e.g. R, D, V, E, C, M)...")
              }
              className="w-full pl-8 pr-7 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base sm:text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-all touch-manipulation"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                title="Clear query"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Dedicated Search Action Button that Pops Out the List */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                handleOpenSearch()
              } else {
                setIsOpen(false)
              }
            }}
            className="rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            title="Search and pop out all 80+ professions"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("search_profession_btn", "Search")}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Selected Profession Card / Indicator */}
        {selectedProf ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-850 border border-blue-200 dark:border-sky-900/60 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{selectedEnclave?.icon || "💼"}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {selectedProf.title}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {selectedProf.categoryName} Enclave · Dedicated Feed &amp; Tools
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] font-semibold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ml-2"
              title="Reset to Auto-Detect"
            >
              {t("reset_btn", "Reset ✕")}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
              {t("auto_detect_note", "⚡ Auto-Detect: Configures your view from your profile or email.")}
            </p>
            <span className="text-[10px] font-mono text-zinc-400">
              {t("trades_available_note", "80+ Trades Available")}
            </span>
          </div>
        )}

        {/* Quick 1-Click Letter Jump Strip */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[10px]">
          <span className="text-zinc-400 dark:text-zinc-500 shrink-0 font-medium mr-0.5 flex items-center gap-0.5">
            <Filter className="h-2.5 w-2.5" /> Jump:
          </span>
          {QUICK_LETTERS.map(letter => (
            <button
              key={letter}
              type="button"
              onClick={() => {
                setSearchQuery(letter)
                setIsOpen(true)
                if (inputRef.current) inputRef.current.focus()
              }}
              className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                searchQuery.toUpperCase() === letter
                  ? "bg-[#0A66C2] text-white"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
              }`}
              title={`Show professions starting with '${letter}'`}
            >
              {letter}
            </button>
          ))}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-1.5 py-0.5 rounded text-[9.5px] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              All
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* THE POPOUT CONTAINER (Pops out when typing first letter or clicked) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[60vh] sm:max-h-80 flex flex-col">
          {/* Popout Header with live match count */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span>
              {searchQuery
                ? `Results for "${searchQuery}" (${filteredProfessions.length} found)`
                : `All Professional Profiles (${ALL_PROFESSIONS.length})`}
            </span>
            <span className="text-[10px] text-zinc-400">Click to select</span>
          </div>

          {/* Scrollable List of Professions */}
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 mt-1">
            {/* Option 0: Auto-Detect Option */}
            {showAutoDetectOption && !searchQuery && (
              <button
                type="button"
                onClick={() => handleSelect("auto_detect")}
                className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  selectedProfessionId === "auto_detect"
                    ? "bg-blue-50 dark:bg-sky-950/40 text-[#0A66C2] dark:text-sky-300 font-bold"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <p className="text-xs font-bold">Auto-Detect from Account / Saved Email</p>
                    <p className="text-[10px] text-zinc-400">Loads your registered profession and enclave automatically</p>
                  </div>
                </div>
                {selectedProfessionId === "auto_detect" && (
                  <Check className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400 shrink-0" />
                )}
              </button>
            )}

            {/* Filtered Professions */}
            {filteredProfessions.map((prof) => {
              const enc = findEnclaveById(prof.enclaveId)
              const isSelected = selectedProfessionId === prof.id

              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => handleSelect(prof.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? "bg-blue-50 dark:bg-sky-950/40 border border-[#0A66C2]/30 text-[#0A66C2] dark:text-sky-300"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                      {enc?.icon || "💼"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold truncate group-hover:text-[#0A66C2] dark:group-hover:text-sky-400 transition-colors">
                          {prof.title}
                        </span>
                        <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                          {enc?.shortName || prof.categoryName}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {prof.typicalSkills.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 text-[#0A66C2] dark:text-sky-400 shrink-0 ml-1" />
                  )}
                </button>
              )
            })}

            {filteredProfessions.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                <p className="font-semibold">No professions match "{searchQuery}"</p>
                <p className="text-[10px] mt-1 text-zinc-400">
                  Try typing the first letter of your trade (e.g. <span className="font-bold text-[#0A66C2]">R</span> for Realtor, <span className="font-bold text-[#0A66C2]">D</span> for Dentist, <span className="font-bold text-[#0A66C2]">V</span> for Veteran)
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-[11px] font-bold text-[#0A66C2] dark:text-sky-400 hover:underline"
                >
                  Show all 80+ professions
                </button>
              </div>
            )}
          </div>

          {/* Popout Footer */}
          <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 px-2">
            <span>🔒 Strict Need-to-Know Enclave Isolation</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
