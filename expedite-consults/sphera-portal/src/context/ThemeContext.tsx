"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "blue";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  themeLabel: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  themeLabel: "Obsidian Black",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sphera-theme") as Theme | null;
    if (saved && (saved === "dark" || saved === "light" || saved === "blue")) {
      applyTheme(saved);
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("sphera-theme", t);
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
      document.body.setAttribute("data-theme", t);
      
      // Sync classes
      document.documentElement.classList.remove("dark", "light", "blue");
      document.documentElement.classList.add(t);
      document.body.classList.remove("dark", "light", "blue");
      document.body.classList.add(t);

      // Color scheme
      document.documentElement.style.colorScheme = t === "light" ? "light" : "dark";
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    // Cycle: Black (dark) -> White (light) -> Sapphire Blue (blue) -> Black (dark)
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "blue" : "dark";
    applyTheme(next);
  };

  const themeLabel =
    theme === "dark"
      ? "Obsidian Black"
      : theme === "light"
      ? "Solar White"
      : "Sapphire Blue";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themeLabel }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
