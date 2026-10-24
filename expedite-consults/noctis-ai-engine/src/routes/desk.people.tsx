import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { addStaff, listStaff, type StaffRole } from "@/lib/admin-api";

export const Route = createFileRoute("/desk/people")({ component: DeskPeople });

function DeskPeople() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listStaff>>>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("editor");
  const [err, setErr] = useState<string | null>(null);
  const load = () => void listStaff().then(setRows).catch(() => setRows([]));
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">People</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold">Operators</h1>
        <p className="mt-2 text-sm text-muted">They must already have a Noctis account. Add them here to open the desk.</p>
      </header>
      <form
        className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-border sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          void addStaff({ data: { email, role } })
            .then(() => {
              setEmail("");
              load();
            })
            .catch((caught: unknown) => setErr(caught instanceof Error ? caught.message : "Could not add"));
        }}
      >
        <input
          className="min-h-11 flex-1 rounded-xl bg-elevated px-3 text-sm"
          type="email"
          required
          placeholder="Staff email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="min-h-11 rounded-xl bg-elevated px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
        >
          <option value="owner">Owner</option>
          <option value="editor">Editor</option>
          <option value="moderator">Moderator</option>
        </select>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
          Add
        </button>
      </form>
      {err ? <p className="text-xs text-live">{err}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.user_id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-border">
            <div>
              <p className="text-sm font-semibold">{row.name ?? row.email ?? row.user_id}</p>
              <p className="text-xs text-muted">{row.email} · {row.role}</p>
            </div>
            <span className="text-[11px] text-subtle">{row.totp_on ? "MFA on" : "MFA pending"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
