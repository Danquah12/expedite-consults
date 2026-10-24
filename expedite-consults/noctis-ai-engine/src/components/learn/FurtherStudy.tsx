import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { dismissFurtherStudy, useFurtherStudy } from "@/lib/further-study";

export function FurtherStudy() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const offer = useFurtherStudy();
  const show = path === "/" || path.startsWith("/study") || path.startsWith("/hub");
  if (!show || !offer) return null;

  return (
    <aside className="pointer-events-auto fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto max-w-lg rounded-2xl bg-surface p-4 shadow-float md:bottom-6 md:left-[calc(16rem+1rem)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Keep studying</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{offer.subject}</p>
        </div>
        <button type="button" onClick={dismissFurtherStudy} aria-label="Dismiss study materials" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-elevated">
          <X className="size-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {offer.materials.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
              {item.title}
            </a>
            {item.note ? <p className="text-xs text-muted">{item.note}</p> : null}
          </li>
        ))}
      </ul>
      {offer.status === "loading" ? <p className="mt-2 text-xs text-muted">Looking for more on this subject.</p> : null}
    </aside>
  );
}
