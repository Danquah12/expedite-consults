import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Music2,
  ScrollText,
  Shield,
  Users,
  Briefcase,
  GraduationCap,
  Flag,
  FileText,
  UserRound,
  Clapperboard,
  MessageSquare,
  Lock,
  Inbox,
  BadgeCheck,
  Bell,
  Gauge,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { readDeskHold, writeDeskHold } from "@/lib/auth/desk-hold";
import { beginMfa, claimDesk, confirmMfa, deskSignOut, getDesk, joinDesk, verifyMfa, type DeskState } from "@/lib/admin-api";
import { DeskBoot } from "@/components/desk/DeskBoot";
import { DeskLockup } from "@/components/desk/DeskBrand";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Command",
    items: [{ to: "/desk", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "People",
    items: [
      { to: "/desk/users", label: "Members", icon: UserRound, exact: false },
      { to: "/desk/identity", label: "Identity", icon: BadgeCheck, exact: false },
      { to: "/desk/people", label: "Operators", icon: Users, exact: false },
    ],
  },
  {
    label: "Product",
    items: [
      { to: "/desk/content", label: "Content", icon: Clapperboard, exact: false },
      { to: "/desk/notes", label: "Notes", icon: MessageSquare, exact: false },
      { to: "/desk/ledger", label: "Ledger", icon: ScrollText, exact: false },
      { to: "/desk/music", label: "Music", icon: Music2, exact: false },
      { to: "/desk/learn", label: "Learning", icon: GraduationCap, exact: false },
      { to: "/desk/jobs", label: "Openings", icon: Briefcase, exact: false },
      { to: "/desk/crews", label: "Crews", icon: Users, exact: false },
    ],
  },
  {
    label: "Trust",
    items: [
      { to: "/desk/safety", label: "Safety", icon: Shield, exact: false },
      { to: "/desk/mod", label: "Moderation", icon: Inbox, exact: false },
      { to: "/desk/security", label: "Security", icon: Lock, exact: false },
      { to: "/desk/notify", label: "Notify", icon: Bell, exact: false },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/desk/platform", label: "Platform", icon: Flag, exact: false },
      { to: "/desk/playback", label: "Playback", icon: Gauge, exact: false },
      { to: "/desk/audit", label: "Audit", icon: FileText, exact: false },
      { to: "/desk/analytics", label: "Analytics", icon: BarChart3, exact: false },
    ],
  },
] as const;

type NavItem = { to: string; label: string; icon: LucideIcon; exact: boolean };
const FLAT_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item })));

function activePath(path: string, to: string, exact: boolean) {
  return exact ? path === "/desk" || path === "/desk/" : path.startsWith(to);
}

export function DeskShell({ children }: { children?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const gate = path === "/desk/login" || path === "/desk/sso";
  const [desk, setDesk] = useState<DeskState | null>(null);
  const [fail, setFail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (gate) return;
    let live = true;
    const timer = window.setTimeout(() => {
      if (live) setChecked(true);
    }, 8000);
    void getDesk()
      .then((next) => {
        if (!live) return;
        if (next.holdToken) writeDeskHold(next.holdToken);
        setFail(null);
        setDesk(next);
      })
      .catch((err: unknown) => {
        if (!live) return;
        setDesk(null);
        setFail(err instanceof Error ? err.message : "Desk unavailable");
      })
      .finally(() => {
        if (live) setChecked(true);
      });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [gate]);

  if (gate) {
    return (
      <div className="desk-console relative z-20">
        <DeskBoot />
        <Outlet />
      </div>
    );
  }

  if (!checked && !waited) {
    return (
      <div className="desk-console relative z-20 grid min-h-dvh place-items-center">
        <DeskBoot />
        <div className="h-8 w-36 animate-pulse rounded-lg bg-elevated" />
      </div>
    );
  }
  if (!desk) return <Navigate to="/desk/login" />;

  const open = Boolean(desk?.staff?.mfaOk);

  return (
    <div className="desk-console relative z-20">
      <DeskBoot />
      <div className="flex min-h-dvh">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border px-3 py-5 md:flex">
          <DeskLockup />
          <p className="mt-4 flex items-center gap-2 px-1 text-[11px] text-subtle">
            <span className="size-1.5 rounded-full bg-ok" />
            Wired to Noctis
          </p>
          {open ? (
            <nav className="mt-6 flex-1 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activePath(path, item.to, item.exact);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            "flex min-h-10 items-center gap-2 rounded-lg px-2 text-[13px] font-medium transition-colors duration-150",
                            active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg",
                          )}
                        >
                          <Icon className="size-3.5 shrink-0 opacity-80" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          ) : (
            <p className="mt-8 px-1 text-xs leading-relaxed text-subtle">Authenticator required before command opens.</p>
          )}
          <div className="mt-auto space-y-2 border-t border-border pt-4">
            <p className="truncate px-1 text-xs font-medium">{desk?.name || desk?.email || "Operator"}</p>
            <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-subtle">{desk?.staff?.role ?? "pending"}</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-3 py-2 sm:px-4">
            <div className="md:hidden">
              <DeskLockup />
            </div>
            <p className="hidden min-w-0 flex-1 truncate pl-1 text-xs text-subtle md:block">Independent ops console · live Noctis ledger</p>
            <div className="ml-auto flex items-center gap-3">
              <p className="max-w-[10rem] truncate text-sm font-medium">{desk?.name || desk?.email || "Operator"}</p>
              <button
                type="button"
                onClick={() => {
                  const token = readDeskHold() ?? "";
                  writeDeskHold(null);
                  void deskSignOut({ data: { token } }).finally(() => {
                    window.location.replace("/desk/login?out=1");
                  });
                }}
                className="text-xs font-semibold text-muted underline-offset-4 hover:underline"
              >
                <span className="sm:hidden">Sign out</span>
                <span className="hidden sm:inline">Sign out of Desk</span>
              </button>
            </div>
          </header>
          {open ? (
            <nav className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden scrollbar-none">
              {FLAT_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                    activePath(path, item.to, item.exact) ? "bg-elevated text-fg" : "text-muted",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <main className="flex-1 p-4 sm:p-8">
            {fail ? <p className="text-sm text-muted">{fail}</p> : null}
            {!desk ? <div className="h-24 animate-pulse rounded-2xl bg-elevated" /> : null}
            {desk && !desk.staff && desk.vacant ? <ClaimPane onDone={setDesk} /> : null}
            {desk && !desk.staff && !desk.vacant ? <LockedPane desk={desk} onDone={setDesk} /> : null}
            {desk?.staff && !desk.staff.totpOn ? <MfaEnroll onDone={() => getDesk().then(setDesk)} /> : null}
            {desk?.staff && desk.staff.totpOn && !desk.staff.mfaOk ? <MfaVerify onDone={() => getDesk().then(setDesk)} /> : null}
            {open ? (children ?? <Outlet />) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function GateCard({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-surface p-6 shadow-border">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">Desk</p>
      <h1 className="mt-2 font-sans text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p>
      {children}
    </div>
  );
}

function LockedPane({ desk, onDone }: { desk: DeskState; onDone: (d: DeskState) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <GateCard title="Operators only" note={`Signed in as ${desk.name || desk.email || "this account"}. Desk is a separate staff surface — Noctis members cannot enter.`}>
      {desk.operators.length ? (
        <ul className="mt-4 space-y-2">
          {desk.operators.map((row) => (
            <li key={`${row.email}-${row.role}`} className="rounded-xl bg-elevated px-3 py-2">
              <p className="text-sm font-semibold">{row.name ?? row.email ?? "Operator"}</p>
              <p className="text-xs text-muted">
                {row.email ?? "No email"} · {row.role}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {err ? <p className="mt-3 text-xs text-live">{err}</p> : null}
      {desk.canJoin ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void joinDesk()
              .then(onDone)
              .catch((e: unknown) => {
                setErr(e instanceof Error ? e.message : "Could not join");
                setBusy(false);
              });
          }}
          className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg"
        >
          {busy ? "Joining…" : `Enter as ${desk.name?.split(" ")[0] || "operator"}`}
        </button>
      ) : (
        <p className="mt-5 text-xs leading-relaxed text-subtle">Sign in with an operator account. An owner can add you from Operators after they open Desk.</p>
      )}
    </GateCard>
  );
}

function ClaimPane({ onDone }: { onDone: (d: DeskState) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <GateCard title="Claim Desk" note="First operator becomes owner. This console is not the clinic — it governs Noctis from a private staff plane. Authenticator MFA is required.">
      {err ? <p className="mt-3 text-xs text-live">{err}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void claimDesk()
            .then(onDone)
            .catch((e: unknown) => {
              setErr(e instanceof Error ? e.message : "Could not claim");
              setBusy(false);
            });
        }}
        className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg"
      >
        {busy ? "Claiming…" : "Claim operator desk"}
      </button>
    </GateCard>
  );
}

function MfaEnroll({ onDone }: { onDone: () => void }) {
  const [secret, setSecret] = useState<{ secret: string; uri: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    void beginMfa()
      .then(setSecret)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : "MFA failed"));
  }, []);
  return (
    <GateCard title="Authenticator" note="Scan with Google Authenticator, Authy, or 1Password. SMS is not used.">
      {secret ? (
        <>
          <img src={secret.qr} alt="Authenticator QR" className="mx-auto mt-5 size-44 rounded-xl bg-white p-2" />
          <p className="mt-2 break-all text-center font-mono text-[11px] text-subtle">{secret.secret}</p>
        </>
      ) : (
        <div className="mx-auto mt-5 size-44 animate-pulse rounded-xl bg-elevated" />
      )}
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          void confirmMfa({ data: code })
            .then(onDone)
            .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Code failed"));
        }}
      >
        <input
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-center font-mono text-lg tracking-[0.3em]"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        {err ? <p className="text-xs text-live">{err}</p> : null}
        <button type="submit" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg">
          Confirm and open Desk
        </button>
      </form>
    </GateCard>
  );
}

function MfaVerify({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <GateCard title="Second factor" note="Six-digit authenticator code. Staff session lasts 12 hours.">
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          void verifyMfa({ data: code })
            .then(onDone)
            .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Code failed"));
        }}
      >
        <input
          className="min-h-11 w-full rounded-xl bg-elevated px-3 text-center font-mono text-lg tracking-[0.3em]"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoFocus
        />
        {err ? <p className="text-xs text-live">{err}</p> : null}
        <button type="submit" className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-fg">
          Verify
        </button>
      </form>
    </GateCard>
  );
}
