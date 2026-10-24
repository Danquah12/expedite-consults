"use client";

import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { readTheme, useTheme, writeTheme } from "@/lib/theme";
import { applyLang, readLang, useLocale } from "@/lib/locale";

export function ClientChrome({ children }: { children: ReactNode }) {
  const theme = useTheme((s) => s.theme);
  const lang = useLocale((s) => s.lang);

  useEffect(() => {
    const next = readTheme();
    writeTheme(next);
    useTheme.setState({ theme: next });
    const saved = readLang();
    if (saved !== useLocale.getState().lang) useLocale.getState().setLang(saved);
    else applyLang(saved);
  }, []);

  return (
    <TooltipProvider delayDuration={250}>
      <div key={lang} className="contents">
        {children}
      </div>
      <Toaster
        theme={theme === "white" || theme === "sand" ? "light" : "dark"}
        position="top-center"
        toastOptions={{
          className: "bg-elevated text-fg border border-border shadow-float font-sans",
        }}
      />
    </TooltipProvider>
  );
}
