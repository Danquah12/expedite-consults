"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme =
  | "vibe"
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
    id: "vibe",
    label: "Editorial Desk Note",
    shortLabel: "Desk Note",
    icon: "📜",
    bgHex: "#f5efe6",
    cardHex: "#fbf8f3",
    borderHex: "#e2d9c8",
    isDark: false,
    description: "Warm editorial parchment canvas with ivory cards and espresso accents"
  },
  {
    id: "classic",
    label: "ConnectLn Classic Light",
    shortLabel: "Classic Sand",
    icon: "🏛️",
    bgHex: "#f3f2ef",
    cardHex: "#ffffff",
    borderHex: "#e5e7eb",
    isDark: false,
    description: "Official ConnectLn warm sand canvas with clean white cards"
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
    label: "ConnectLn Executive Dark",
    shortLabel: "Executive Dark",
    icon: "🌙",
    bgHex: "#121212",
    cardHex: "#1b1f23",
    borderHex: "#30363d",
    isDark: true,
    description: "Official ConnectLn dark card architecture for low-light focus"
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
  theme: "vibe",
  setTheme: () => {},
  toggleTheme: () => {},
  themeLabel: "Editorial Desk Note",
  isDark: false,
  themeOption: THEME_OPTIONS[0],
});

const ALL_THEME_IDS: Theme[] = [
  "vibe",
  "classic",
  "light",
  "dark",
  "slate"
];

// v4 key: resets everyone to Editorial Desk Note once; later choices are remembered
const THEME_STORAGE_KEY = "sphera-theme-v4";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("vibe");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as string | null;
    if (saved && ALL_THEME_IDS.includes(saved as Theme)) {
      applyTheme(saved as Theme);
    } else {
      applyTheme("vibe");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
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
