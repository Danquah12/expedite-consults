import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ThemePicker } from "@/components/layout/ThemePicker";
import { LanguageChoices } from "@/components/layout/LanguageMenu";
import { ME } from "@/lib/current-user";
import { leaveHall } from "@/lib/auth/client";
import { useFeedStore } from "@/lib/feed-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AccountCard({ onDone }: { onDone?: () => void }) {
  const openModal = useFeedStore((s) => s.openModal);
  const [signingOut, setSigningOut] = useState(false);
  const [color, setColor] = useState(false);

  function go(fn: () => void) {
    fn();
    onDone?.();
  }

  return (
    <div data-account-card className="overflow-hidden rounded-2xl bg-surface text-fg shadow-border">
      <div className="px-4 py-2">
        <p className="px-0 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Your hall</p>
        <Link
          to="/you"
          onClick={() => onDone?.()}
          className="flex min-h-10 items-center text-sm text-muted"
        >
          Open my hall
        </Link>
        <button type="button" onClick={() => go(() => openModal({ type: "settings" }))} className="flex min-h-10 w-full items-center text-left text-sm text-muted">
          Hall settings
        </button>
        <button type="button" onClick={() => setColor((v) => !v)} className="flex min-h-10 w-full items-center text-left text-sm text-muted">
          Hall color
        </button>
        {color ? (
          <div className="pb-2">
            <ThemePicker compact />
          </div>
        ) : null}
        <div className="py-2">
          <LanguageChoices />
        </div>
        <a href="https://www.expediteconsults.com/" target="_blank" rel="noreferrer" className="flex min-h-10 items-center text-sm text-muted">
          Expedite Consults LLC
        </a>
      </div>
      <div className="border-t border-border px-4 py-1">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void leaveHall().catch(() => setSigningOut(false));
          }}
          className="flex min-h-11 w-full items-center text-left text-sm text-muted disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/** Avatar opens the account card. Sign out lives at the bottom of that card. */
export function AccountMenu() {
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button type="button" aria-label="Sign out menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2">
        <img src={user?.profileImageUrl ?? ME.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
        <span className="hidden text-xs font-semibold sm:inline">Sign out</span>
      </button>
      {open ? (
        <>
          <button type="button" aria-label="Close account" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-1.5rem))]">
            <AccountCard onDone={() => setOpen(false)} />
          </div>
        </>
      ) : null}
    </div>
  );
}
