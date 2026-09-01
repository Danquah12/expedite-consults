"use client";

import { useTheme, Theme } from "@/context/ThemeContext";

const themeButtons: { id: Theme; label: string; dotColor: string; title: string }[] = [
  { id: "dark", label: "Black", dotColor: "#08090d", title: "Obsidian Black (Dark Mode)" },
  { id: "light", label: "White", dotColor: "#ffffff", title: "Solar White (Light Mode)" },
  { id: "blue", label: "Blue", dotColor: "#38bdf8", title: "Sapphire Blue (Cyber Mode)" },
];

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 5px",
        borderRadius: "12px",
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {themeButtons.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 8px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: isActive ? "900" : "600",
              backgroundColor: isActive ? "var(--bg-card)" : "transparent",
              color: isActive ? "var(--text-pure)" : "var(--text-muted)",
              border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
            }}
          >
            <span
              style={{
                height: "10px",
                width: "10px",
                borderRadius: "9999px",
                backgroundColor: t.dotColor,
                border: t.id === "light" ? "1px solid #94a3b8" : "1px solid rgba(255,255,255,0.2)",
                boxShadow: isActive ? `0 0 6px ${t.dotColor}` : "none",
                display: "inline-block",
              }}
            />
            {showLabel && <span>{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
