import { useEffect } from "react";

export function DeskBoot() {
  useEffect(() => {
    const root = document.documentElement;
    const prevTheme = root.dataset.theme;
    const prevColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null;
    root.dataset.desk = "on";
    root.classList.add("dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#09090b");
    return () => {
      delete root.dataset.desk;
      if (prevTheme) root.dataset.theme = prevTheme;
      if (meta && prevColor) meta.setAttribute("content", prevColor);
    };
  }, []);
  return null;
}
