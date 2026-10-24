import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listMembers, setHold } from "@/lib/command-api";
import { VERIFY_QUEUE } from "@/lib/command-catalog";
import { DeskHead } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/identity")({ component: DeskIdentity });

function DeskIdentity() {
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listMembers>>>([]);
  const [done, setDone] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    void listMembers().then(setMembers).catch(() => setMembers([]));
  }, []);
  const accounts = members.filter((m) => m.kind === "registered" && !done.includes(m.id));
  const stamps = VERIFY_QUEUE.filter((v) => !done.includes(v.id));

  function verify(id: string, reason: string) {
    setNote(null);
    void setHold({ data: { userId: id, status: "verified", reason } })
      .then(() => setDone((d) => [...d, id]))
      .catch((e: unknown) => setNote(e instanceof Error ? e.message : "Failed"));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <DeskHead
        kicker="Identity"
        title="Verification"
        note="Signed-in accounts come from Noctis first. Clinic stamps sit under them. Approve with a reason."
      />
      <ul className="space-y-2">
        {accounts.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-sm font-semibold">{row.name}</p>
            <p className="mt-1 text-xs text-muted">
              {row.campus} · {row.status}
            </p>
            <button type="button" className="mt-3 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-fg" onClick={() => verify(row.id, `Verified ${row.campus}`)}>
              Verify account
            </button>
          </li>
        ))}
        {stamps.map((row) => (
          <li key={row.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <p className="text-sm font-semibold">{row.name}</p>
            <p className="mt-1 text-xs text-muted">
              {row.kind} · {row.campus}
            </p>
            <p className="mt-2 text-xs text-subtle">{row.evidence}</p>
            <button type="button" className="mt-3 rounded-full bg-elevated px-3 py-1.5 text-[11px] font-semibold" onClick={() => verify(row.id, `Verified ${row.kind}`)}>
              Verify stamp
            </button>
          </li>
        ))}
        {!accounts.length && !stamps.length ? <li className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted">Queue clear.</li> : null}
      </ul>
      {note ? <p className="text-xs text-live">{note}</p> : null}
    </div>
  );
}
