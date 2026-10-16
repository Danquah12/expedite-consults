"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  LanguageCode,
  LanguageMeta,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS
} from "@/lib/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  currentLanguage: LanguageMeta;
  languages: LanguageMeta[];
}

const DEFAULT_LANG: LanguageCode = "en";

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isRTL: false,
  currentLanguage: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("sphera-lang") as LanguageCode | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        applyLanguage(saved);
      } else {
        // Check browser language or default to English
        const browserLang = navigator.language?.slice(0, 2) as LanguageCode;
        if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
          applyLanguage(browserLang);
        } else {
          applyLanguage(DEFAULT_LANG);
        }
      }
    } catch {
      applyLanguage(DEFAULT_LANG);
    }
  }, []);

  const applyLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sphera-lang", lang);
    } catch {}

    if (typeof document !== "undefined") {
      const langMeta =
        SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", langMeta.dir);

      if (langMeta.dir === "rtl") {
        document.documentElement.classList.add("rtl");
        document.body.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
        document.body.classList.remove("rtl");
      }
    }
  };

  const setLanguage = (newLang: LanguageCode) => {
    applyLanguage(newLang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    const enDict = TRANSLATIONS.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isRTL = currentLanguage.dir === "rtl";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        currentLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
