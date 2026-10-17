"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const saved =
      (localStorage.getItem("sphera-lang") as LanguageCode | null) ||
      (localStorage.getItem("connectin_lang") as LanguageCode | null) ||
      (localStorage.getItem("vibetok-lang") as LanguageCode | null);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    const match = document.cookie.match(/(?:^|;\s*)sphera-lang=([^;]+)/);
    if (match && SUPPORTED_LANGUAGES.some((l) => l.code === match[1])) {
      return match[1] as LanguageCode;
    }
    const browserLang = navigator.language?.slice(0, 2) as LanguageCode;
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  } catch {}
  return DEFAULT_LANG;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isRTL: false,
  currentLanguage: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const applyDomAttributes = useCallback((lang: LanguageCode) => {
    if (typeof document === "undefined") return;
    const langMeta =
      SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", langMeta.dir);
    document.body?.setAttribute("dir", langMeta.dir);

    if (langMeta.dir === "rtl") {
      document.documentElement.classList.add("rtl");
      document.body?.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
      document.body?.classList.remove("rtl");
    }
  }, []);

  const applyLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sphera-lang", lang);
      localStorage.setItem("connectin_lang", lang);
      localStorage.setItem("vibetok-lang", lang);
      document.cookie = `sphera-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    applyDomAttributes(lang);

    // Notify other components & embedded iframes
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sphera-lang-changed", { detail: lang }));
      try {
        window.postMessage({ type: "SPHERA_LANG_CHANGED", language: lang, locale: lang }, "*");
      } catch {}
    }
  }, [applyDomAttributes]);

  // Initial sync on mount & sync across storage events / custom events
  useEffect(() => {
    const active = getInitialLanguage();
    if (active !== language) {
      applyLanguage(active);
    } else {
      applyDomAttributes(active);
    }

    const handleStorage = (e: StorageEvent) => {
      if (
        (e.key === "sphera-lang" || e.key === "connectin_lang" || e.key === "vibetok-lang") &&
        e.newValue &&
        SUPPORTED_LANGUAGES.some((l) => l.code === e.newValue)
      ) {
        const newCode = e.newValue as LanguageCode;
        setLanguageState(newCode);
        applyDomAttributes(newCode);
      }
    };

    const handleCustomChange = (e: Event) => {
      const custom = e as CustomEvent<LanguageCode>;
      if (custom.detail && SUPPORTED_LANGUAGES.some((l) => l.code === custom.detail)) {
        setLanguageState(custom.detail);
        applyDomAttributes(custom.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("sphera-lang-changed", handleCustomChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sphera-lang-changed", handleCustomChange);
    };
  }, [applyDomAttributes, applyLanguage, language]);

  const setLanguage = useCallback((newLang: LanguageCode) => {
    applyLanguage(newLang);
  }, [applyLanguage]);

  const t = useCallback((key: string, fallback?: string): string => {
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
  }, [language]);

  const currentLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );
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
