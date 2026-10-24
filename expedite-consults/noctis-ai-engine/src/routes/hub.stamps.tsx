import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";
import { labForStamp } from "@/lib/hire-desk";

export const Route = createFileRoute("/hub/stamps")({ component: StampPage });

function StampPage() {
  const stamps = useFeedStore((s) => s.earnedStamps);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Stamps · {SOURCE}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">How a stamp is verified</h1>
          <p className="mt-2 text-sm text-muted">
            A stamp is not a like. It is a lab you finished. We do not sell badges. We do not notarize USAJOBS.
          </p>
        </header>

        <ol className="space-y-3">
          {[
            { n: "01", t: "Watch", d: "Official film or house. Embed, not a copy." },
            { n: "02", t: "Practice", d: "Hypothetical tenant only. Mark the real findings. Leave the decoy." },
            { n: "03", t: "Test", d: "Short quiz. Wrong answers do not mint a stamp." },
            { n: "04", t: "Certify", d: "The badge name is written on this device. That is the stamp." },
            { n: "05", t: "Hire desk", d: "Seats that ask for that stamp light up. Apply stays on the official board." },
          ].map((step) => (
            <li key={step.n} className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="font-mono text-[11px] text-subtle">{step.n}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{step.t}</h2>
              <p className="mt-1 text-sm text-muted">{step.d}</p>
            </li>
          ))}
        </ol>

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">What an employer can check today</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Openings → Hire shows <span className="text-fg">Stamp held</span> when this profile finished the matching lab. There is no third-party notary yet — no blockchain, no paid “verified” checkmark. If you apply at CISA or Amazon, they verify you on <em>their</em> board. Our stamp is the ticket to walk in prepared.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            ISACA CISA (the auditor cert) is separate from CISA.gov (the U.S. agency). We send you to both. We issue neither.
          </p>
        </section>

        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="font-display text-lg font-semibold">How the Hire desk works</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-semibold text-fg">My stamps</span> — only seats that match badges you hold.
            </li>
            <li>
              <span className="font-semibold text-fg">All seats</span> — every role; missing stamps point at the lab.
            </li>
            <li>
              <span className="font-semibold text-fg">Apply</span> — HTTPS to CISA, USAJOBS, Amazon, NIST, Microsoft. We do not host CVs.
            </li>
            <li>
              <span className="font-semibold text-fg">Post a hire</span> — pick a stamp, paste an official URL. HTTPS only. No ads.
            </li>
          </ul>
        </section>

        {stamps.length ? (
          <section className="rounded-2xl bg-surface p-5 shadow-border">
            <h2 className="font-display text-lg font-semibold">Held on this profile</h2>
            <ul className="mt-3 space-y-2">
              {stamps.map((name) => {
                const labId = labForStamp(name);
                return (
                  <li key={name} className="flex min-h-11 items-center justify-between gap-3 text-sm">
                    <span>{name}</span>
                    {labId ? (
                      <Link to="/hub/lab/$id" params={{ id: labId }} className="text-xs font-semibold text-primary">
                        Lab
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Link to="/openings" hash="hire" className="text-primary">
            Hire desk
          </Link>
          <Link to="/hub/cert/$id" params={{ id: "cisa" }} className="text-primary">
            ISACA CISA requirements
          </Link>
        </div>
      </ClinicFrame>
    </AppShell>
  );
}
