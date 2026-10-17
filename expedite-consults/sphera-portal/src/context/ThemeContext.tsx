"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme =
  | "classic"
  | "light"
  | "dark"
  | "slate";

export interface ThemeOption {
  id: Theme;
  label: string;
  shortLabel: string;
  icon: string;
  bgHex: string;
  cardHex: string;
  borderHex: string;
  isDark: boolean;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "classic",
    label: "LinkedIn Classic Light",
    shortLabel: "Classic Sand",
    icon: "🏛️",
    bgHex: "#f3f2ef",
    cardHex: "#ffffff",
    borderHex: "#e5e7eb",
    isDark: false,
    description: "Official LinkedIn warm sand canvas with clean white cards"
  },
  {
    id: "light",
    label: "Pure Daylight White",
    shortLabel: "Pure White",
    icon: "☀️",
    bgHex: "#ffffff",
    cardHex: "#ffffff",
    borderHex: "#e2e8f0",
    isDark: false,
    description: "Clean daylight workspace with subtle slate borders"
  },
  {
    id: "dark",
    label: "LinkedIn Executive Dark",
    shortLabel: "Executive Dark",
    icon: "🌙",
    bgHex: "#121212",
    cardHex: "#1b1f23",
    borderHex: "#30363d",
    isDark: true,
    description: "Official LinkedIn dark card architecture for low-light focus"
  },
  {
    id: "slate",
    label: "Corporate Slate",
    shortLabel: "Slate",
    icon: "🌑",
    bgHex: "#0f172a",
    cardHex: "#1e293b",
    borderHex: "#334155",
    isDark: true,
    description: "Refined modern charcoal with cool blue-gray undertones"
  }
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  themeLabel: string;
  isDark: boolean;
  themeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "classic",
  setTheme: () => {},
  toggleTheme: () => {},
  themeLabel: "LinkedIn Classic Light",
  isDark: false,
  themeOption: THEME_OPTIONS[0],
});

const ALL_THEME_IDS: Theme[] = [
  "classic",
  "light",
  "dark",
  "slate"
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sphera-theme") as string | null;
    if (saved && (saved === "classic" || saved === "light" || saved === "dark" || saved === "slate")) {
      applyTheme(saved as Theme);
    } else {
      // Auto-migrate sepia/emerald/purple/blue or unset to official LinkedIn Classic
      applyTheme("classic");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("sphera-theme", t);
    } catch {}

    if (typeof document !== "undefined") {
      const selected = THEME_OPTIONS.find((o) => o.id === t) || THEME_OPTIONS[0];
      const isDarkTheme = selected.isDark;

      // Update root attributes
      document.documentElement.setAttribute("data-theme", t);
      document.body.setAttribute("data-theme", t);

      // Remove previous classes
      document.documentElement.classList.remove("dark", "light", ...ALL_THEME_IDS);
      document.body.classList.remove("dark", "light", ...ALL_THEME_IDS);

      // Apply light or dark flag for Tailwind dark: variants
      if (isDarkTheme) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
        document.body.classList.add("light");
      }

      // Add the specific theme name class
      document.documentElement.classList.add(t);
      document.body.classList.add(t);

      // Update color scheme for native inputs & scrollbars
      document.documentElement.style.colorScheme = isDarkTheme ? "dark" : "light";
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    // Quick toggle between Classic Light and Obsidian Dark
    const currentOpt = THEME_OPTIONS.find((o) => o.id === theme);
    if (currentOpt?.isDark) {
      applyTheme("classic");
    } else {
      applyTheme("dark");
    }
  };

  const currentThemeOption =
    THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        themeLabel: currentThemeOption.label,
        isDark: currentThemeOption.isDark,
        themeOption: currentThemeOption
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
