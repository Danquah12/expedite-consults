"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageCode } from "@/lib/translations";

interface LanguageSwitcherProps {
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
}

export function LanguageSwitcher({
  compact = false,
  align = "right",
  className = ""
}: LanguageSwitcherProps) {
  const { language, setLanguage, currentLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? "border-[#0A66C2] bg-blue-50/70 text-[#0A66C2] dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-300"
            : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200"
        } ${compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs font-semibold shadow-2xs"}`}
        title={t("language_select", "Select Language")}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400 shrink-0" />
        <span className="text-sm shrink-0 leading-none">{currentLanguage.flag}</span>
        {!compact && (
          <span className="truncate max-w-[85px] hidden sm:inline-block">
            {currentLanguage.localName}
          </span>
        )}
        <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">
          {currentLanguage.code}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0A66C2]" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/5"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-50 mt-1.5 w-60 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400" />
                {t("language_select", "Platform Language")}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                11 Global
              </span>
            </div>

            {/* Language Options List */}
            <div className="max-h-72 overflow-y-auto py-1 space-y-0.5 scrollbar-thin">
              {languages.map((item) => {
                const isSelected = item.code === language;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-[#0A66C2] font-bold dark:bg-sky-950/50 dark:text-sky-300"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0 leading-none">{item.flag}</span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-tight">
                          {item.localName}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {item.name} {item.dir === "rtl" ? "· RTL" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {item.code}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Note */}
            <div className="border-t border-zinc-100 px-2 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 text-center">
              Changes interface language across the entire platform
            </div>
          </div>
        </>
      )}
    </div>
  );
}
