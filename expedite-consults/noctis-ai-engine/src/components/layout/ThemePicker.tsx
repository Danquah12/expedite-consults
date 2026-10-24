import { Check } from "lucide-react";
import { CANVASES, useTheme } from "@/lib/theme";
import { vt } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const current = CANVASES.find((c) => c.id === theme) ?? CANVASES[0];

  if (compact) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Change background theme</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-fg">
          {vt(current.label)}
          {current.isDefault ? <span className="font-medium text-muted"> ({vt("Default")})</span> : null}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted">{vt(current.blurb)}</p>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {CANVASES.map((canvas) => {
            const on = theme === canvas.id;
            return (
              <button
                key={canvas.id}
                type="button"
                aria-label={vt(canvas.label)}
                aria-pressed={on}
                title={vt(canvas.label)}
                onClick={() => setTheme(canvas.id)}
                className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1"
              >
                <span
                  className={cn(
                    "size-7 shrink-0 rounded-full shadow-border",
                    on && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                  )}
                  style={{ background: canvas.swatch }}
                />
                <span className={cn("w-full truncate text-center text-[10px] font-semibold", on ? "text-primary" : "text-muted")}>
                  {vt(canvas.chip)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Change background theme</p>
      <div className="mt-2 space-y-0.5">
        {CANVASES.map((canvas) => {
          const on = theme === canvas.id;
          return (
            <button
              key={canvas.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setTheme(canvas.id)}
              className={cn(
                "flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors duration-150",
                on ? "bg-elevated" : "hover:bg-elevated",
              )}
            >
              <span
                className={cn(
                  "relative grid size-7 shrink-0 place-items-center rounded-full",
                  on ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : "shadow-border",
                )}
              >
                <span className="size-5 rounded-full" style={{ background: canvas.swatch }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm font-semibold", on ? "text-primary" : "text-fg")}>
                  {vt(canvas.label)}
                  {canvas.isDefault ? <span className="font-medium"> ({vt("Default")})</span> : null}
                </span>
                <span className="block text-[11px] text-muted">{vt(canvas.blurb)}</span>
              </span>
              {on ? <Check className="size-4 shrink-0 text-primary" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
