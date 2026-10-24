import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const CLOUD_CASES = [
  {
    id: "s3",
    title: "Bucket clinic-corp-logs",
    prompt: "A log bucket is reachable from the internet. What is the finding?",
    picks: [
      { id: "acl", label: "Public ACL / Block Public Access off", ok: true },
      { id: "kms", label: "Missing KMS is the only issue", ok: false },
      { id: "name", label: "The name has clinic in it", ok: false },
    ],
  },
  {
    id: "sg",
    title: "Security group web-box",
    prompt: "SSH is open. What is wrong?",
    picks: [
      { id: "ssh", label: "22/tcp from 0.0.0.0/0", ok: true },
      { id: "https", label: "443 from the load balancer", ok: false },
      { id: "tag", label: "No Name tag", ok: false },
    ],
  },
  {
    id: "iam",
    title: "Role clinic-app",
    prompt: "The app role can do too much. What do you write?",
    picks: [
      { id: "star", label: "Action * on Resource *", ok: true },
      { id: "s3r", label: "s3:GetObject on one bucket", ok: false },
      { id: "mfa", label: "MFA on the human user", ok: false },
    ],
  },
] as const;

const ROWS = [
  { hall: "Care", wait: 18, n: 42, pass: 31 },
  { hall: "Care", wait: 22, n: 38, pass: 29 },
  { hall: "Cyber", wait: 11, n: 55, pass: 41 },
  { hall: "Cyber", wait: 9, n: 61, pass: 48 },
  { hall: "STEM", wait: 14, n: 40, pass: 33 },
  { hall: "STEM", wait: 16, n: 36, pass: 28 },
  { hall: "Money", wait: 7, n: 28, pass: 24 },
  { hall: "Money", wait: 8, n: 22, pass: 19 },
  { hall: "Mind", wait: 20, n: 30, pass: 21 },
  { hall: "Maker", wait: 12, n: 25, pass: 18 },
];

export function CloudLab() {
  const [caseId, setCaseId] = useState<(typeof CLOUD_CASES)[number]["id"]>("s3");
  const [pick, setPick] = useState<string | null>(null);
  const room = CLOUD_CASES.find((c) => c.id === caseId)!;
  const chosen = room.picks.find((p) => p.id === pick);

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Cloud academy · lab</p>
      <h2 className="mt-1 font-display text-lg font-semibold">Hypothetical tenant. Find the issue.</h2>
      <p className="mt-1 text-sm text-muted">No one attaches this to your cloud. Range only.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CLOUD_CASES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCaseId(c.id);
              setPick(null);
            }}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              caseId === c.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {c.title}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm">{room.prompt}</p>
      <div className="mt-3 space-y-2">
        {room.picks.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPick(p.id)}
            className={cn(
              "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm",
              pick === p.id ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {chosen ? (
        <p className="mt-3 text-sm text-muted">
          {chosen.ok ? "Write that on the evidence sheet. Then the range." : "Look again. The loud option is not always the finding."}
        </p>
      ) : null}
      <Link to="/hub/range" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
        Open cyber range
      </Link>
    </section>
  );
}

export function DataLab() {
  const halls = ["All", ...Array.from(new Set(ROWS.map((r) => r.hall)))];
  const [hall, setHall] = useState("All");
  const rows = useMemo(() => (hall === "All" ? ROWS : ROWS.filter((r) => r.hall === hall)), [hall]);
  const meanWait = rows.reduce((s, r) => s + r.wait, 0) / rows.length;
  const passRate = rows.reduce((s, r) => s + r.pass, 0) / rows.reduce((s, r) => s + r.n, 0);
  const slowest = [...ROWS].sort((a, b) => b.wait - a.wait)[0];

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Data lab</p>
      <h2 className="mt-1 font-display text-lg font-semibold">A dataset. Then a question.</h2>
      <p className="mt-1 text-sm text-muted">
        Clinic sessions (hypothetical). Filter a hall. Mean wait is {meanWait.toFixed(1)} min. Pass rate {(passRate * 100).toFixed(0)}%.
        Slowest desk: {slowest.hall} at {slowest.wait} min.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {halls.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHall(h)}
            className={cn(
              "min-h-11 rounded-full px-3 text-xs font-semibold",
              hall === h ? "bg-primary text-primary-fg" : "bg-elevated",
            )}
          >
            {h}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-subtle">
              <th className="py-2">Hall</th>
              <th>Wait</th>
              <th>Seated</th>
              <th>Passed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.hall}-${i}`} className="border-t border-border">
                <td className="py-2 font-semibold">{r.hall}</td>
                <td className="tabular-nums">{r.wait} min</td>
                <td className="tabular-nums">{r.n}</td>
                <td className="tabular-nums">{r.pass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}