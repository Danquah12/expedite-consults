"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme =
  | "classic"
  | "light"
  | "dark"
  | "slate"
  | "blue"
  | "emerald"
  | "sepia"
  | "purple";

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
    label: "LinkedIn Classic Sand",
    shortLabel: "Classic Sand",
    icon: "🏛️",
    bgHex: "#f3f2f0",
    cardHex: "#ffffff",
    borderHex: "#e5e7eb",
    isDark: false,
    description: "Official LinkedIn warm sand and clean white cards"
  },
  {
    id: "light",
    label: "Solar Pure White",
    shortLabel: "Pure White",
    icon: "☀️",
    bgHex: "#ffffff",
    cardHex: "#f8fafc",
    borderHex: "#e2e8f0",
    isDark: false,
    description: "Ultra-crisp, high-contrast modern clean white"
  },
  {
    id: "dark",
    label: "Obsidian OLED Dark",
    shortLabel: "Obsidian",
    icon: "🌙",
    bgHex: "#08090d",
    cardHex: "#10121a",
    borderHex: "#1c202e",
    isDark: true,
    description: "Pitch black OLED optimization for maximum battery & eye comfort"
  },
  {
    id: "slate",
    label: "Slate Charcoal",
    shortLabel: "Slate",
    icon: "🌑",
    bgHex: "#0f172a",
    cardHex: "#1e293b",
    borderHex: "#334155",
    isDark: true,
    description: "Soft modern charcoal with blue-gray undertones"
  },
  {
    id: "blue",
    label: "Sapphire Cyber Navy",
    shortLabel: "Sapphire Navy",
    icon: "⚡",
    bgHex: "#070d1e",
    cardHex: "#0d1b3e",
    borderHex: "#19316b",
    isDark: true,
    description: "Deep oceanic defense navy and electric cyan accents"
  },
  {
    id: "emerald",
    label: "Forest Emerald",
    shortLabel: "Emerald Green",
    icon: "🌲",
    bgHex: "#031c14",
    cardHex: "#083829",
    borderHex: "#115e45",
    isDark: true,
    description: "Deep pine and mint green for agriculture, trades and nature"
  },
  {
    id: "sepia",
    label: "Warm Sepia Parchment",
    shortLabel: "Sepia Warm",
    icon: "📜",
    bgHex: "#fcf8f2",
    cardHex: "#ffffff",
    borderHex: "#e8dcce",
    isDark: false,
    description: "Warm parchment paper tone reducing harsh blue light"
  },
  {
    id: "purple",
    label: "Royal Nebula Purple",
    shortLabel: "Nebula Purple",
    icon: "🌌",
    bgHex: "#0e071c",
    cardHex: "#20123d",
    borderHex: "#3e226e",
    isDark: true,
    description: "Cosmic deep violet and purple glow for creative arts"
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
  themeLabel: "LinkedIn Classic Sand",
  isDark: false,
  themeOption: THEME_OPTIONS[0],
});

const ALL_THEME_IDS: Theme[] = [
  "classic",
  "light",
  "dark",
  "slate",
  "blue",
  "emerald",
  "sepia",
  "purple"
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sphera-theme") as Theme | null;
    if (saved && ALL_THEME_IDS.includes(saved)) {
      applyTheme(saved);
    } else {
      // Default to LinkedIn Classic Sand
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
