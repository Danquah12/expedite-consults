/* vt-skip */
import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Languages } from "lucide-react";
import { LANGS, vt, useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function LanguageChoices({ onPick, tone = "theme" }: { onPick?: () => void; tone?: "theme" | "cream" }) {
  const lang = useLocale((s) => s.lang);
  const setLang = useLocale((s) => s.setLang);
  const cream = tone === "cream";

  return (
    <div>
      <p className={cn("text-[11px] font-semibold uppercase tracking-wider", cream ? "text-[#8a6428]" : "text-muted")}>{vt("Language")}</p>
      <p className={cn("mt-1 text-sm", cream ? "text-[#5c564c]" : "text-muted")}>{vt("The whole app uses this language.")}</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5" role="listbox" aria-label={vt("Language")}>
        {LANGS.map((row) => {
          const on = lang === row.id;
          return (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => {
                setLang(row.id);
                onPick?.();
              }}
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-left",
                cream
                  ? on
                    ? "bg-[#0b1220] text-[#f6e7c8]"
                    : "border border-[#e4ddd2] bg-[#faf8f4] text-[#12151c]"
                  : on
                    ? "bg-primary text-primary-fg"
                    : "bg-elevated text-fg",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{row.native}</span>
              </span>
              {on ? <Check className="size-4 shrink-0" /> : <span className="text-[11px] font-semibold opacity-70">{row.short}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LanguageMenu({ tone = "theme" }: { tone?: "theme" | "cream" }) {
  const lang = useLocale((s) => s.lang);
  const current = LANGS.find((row) => row.id === lang) ?? LANGS[0];
  const [open, setOpen] = useState(false);
  const cream = tone === "cream";

  return (
    <>
      <button
        type="button"
        aria-label={vt("Language")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={
          cream
            ? "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#e4ddd2] bg-[#faf8f4] px-3 text-sm font-semibold text-[#12151c]"
            : "inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-elevated px-2.5 text-xs font-semibold text-fg"
        }
      >
        <Languages className="size-4 shrink-0" />
        <span className={cream ? "min-w-0 flex-1 truncate text-left" : ""}>
          {cream ? `${vt("Language")} · ${current.native}` : current.short}
        </span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
              <div
                className={cn(
                  "max-h-[min(32rem,calc(100dvh-2rem))] w-full max-w-md overflow-y-auto rounded-2xl p-3 shadow-border",
                  cream ? "bg-white text-[#12151c]" : "bg-surface text-fg",
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <LanguageChoices onPick={() => setOpen(false)} tone={tone} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
