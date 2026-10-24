import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listAudit } from "@/lib/admin-api";
import { listMemberEvidence } from "@/lib/activity-api";
import { listFailedSignIns } from "@/lib/command-api";
import { DeskHead, deskClock } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/audit")({ component: DeskAudit });

type Trail = Awaited<ReturnType<typeof listMemberEvidence>>[number];
type Fail = Awaited<ReturnType<typeof listFailedSignIns>>[number];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "sign-in", label: "Sign in", actions: ["sign-in", "sign-out", "account"] },
  { id: "watch", label: "Watch", actions: ["watch"] },
  { id: "search", label: "Search", actions: ["search"] },
  { id: "like", label: "Like", actions: ["like", "unlike", "save", "repost", "share"] },
  { id: "comment", label: "Comment", actions: ["comment", "send", "note"] },
  { id: "follow", label: "Follow", actions: ["follow", "subscribe"] },
  { id: "study", label: "Study", actions: ["study", "study-join", "study-leave", "study-chat", "study-react", "check", "community", "stamp"] },
  { id: "vibe", label: "Noctis", actions: ["vibe"] },
] as const;

function sentence(row: Trail) {
  const what = row.detail?.trim() || "";
  if (row.action === "sign-in") return "Signed in";
  if (row.action === "sign-out") return "Signed out";
  if (row.action === "account") return "Created an account";
  if (row.action === "watch") return what ? `Watched ${what}` : "Watched a clip";
  if (row.action === "search") return what ? `Searched for ${what}` : "Searched";
  if (row.action === "vibe") return what ? `Asked Vibe · ${what}` : "Asked Vibe";
  if (row.action === "stamp") return what || "Earned a stamp";
  return what || row.action;
}

function DeskAudit() {
  const [rows, setRows] = useState<Trail[]>([]);
  const [fails, setFails] = useState<Fail[]>([]);
  const [ops, setOps] = useState<Awaited<ReturnType<typeof listAudit>>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    let stop = false;
    const load = () => {
      void Promise.all([listMemberEvidence(), listFailedSignIns(), listAudit()])
        .then(([activity, failed, audit]) => {
          if (stop) return;
          setErr(null);
          setRows(activity);
          setFails(failed);
          setOps(audit);
        })
        .catch((caught: unknown) => {
          if (!stop) setErr(caught instanceof Error ? caught.message : "Could not load the trail");
        });
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const chosen = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
  const actions = "actions" in chosen ? chosen.actions : null;
  const shown = rows.filter((row) => !actions || (actions as readonly string[]).includes(row.action));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <DeskHead
        kicker="Audit"
        title="What people did"
        note="Each row is something a signed-in member actually did on this site: sign in, watch, search, like, comment, follow, study, or ask Vibe. It refreshes on its own. Passwords are not stored."
      />
      {err ? <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">{err}</p> : null}
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? "min-h-9 rounded-full bg-fg px-3 text-xs font-semibold text-bg"
                : "min-h-9 rounded-full bg-surface px-3 text-xs font-semibold text-muted"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {shown.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
            <p className="text-sm font-semibold">{row.who}</p>
            <p className="mt-1 text-sm leading-snug">{sentence(row)}</p>
            <p className="mt-1 text-[11px] text-subtle">
              {row.email || "No email"} · {row.action} · {deskClock(row.at)}
            </p>
          </li>
        ))}
        {!shown.length && !err ? (
          <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">
            Nothing recorded yet. A sign-in, watch, search, like, or comment on this site shows up here.
          </li>
        ) : null}
      </ul>

      <section className="space-y-2">
        <h2 className="font-sans text-lg font-semibold">Sign-in that did not finish</h2>
        <ul className="space-y-2">
          {fails.map((row) => (
            <li key={row.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
              <p className="text-sm font-semibold">{row.email}</p>
              <p className="mt-1 text-sm">{row.reason}</p>
              <p className="mt-1 text-[11px] text-subtle">
                {row.door} · {row.where || "Place not recorded"} · {deskClock(row.at)}
              </p>
            </li>
          ))}
          {!fails.length ? <li className="text-sm text-muted">No failed sign-ins on this site.</li> : null}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-sans text-lg font-semibold">Operator changes</h2>
        <p className="text-sm text-muted">Holds, flags, cases, and staff changes. This is not member activity.</p>
        <ul className="space-y-2">
          {ops.map((row) => (
            <li key={row.id} className="rounded-2xl bg-surface px-4 py-3 shadow-border">
              <p className="text-sm font-semibold">{row.action}</p>
              <p className="mt-1 text-xs text-muted">{row.detail ?? "—"}</p>
              <p className="mt-1 text-[11px] text-subtle">
                {deskClock(row.created_at)}
              </p>
            </li>
          ))}
          {!ops.length ? <li className="text-sm text-muted">No operator entries yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
