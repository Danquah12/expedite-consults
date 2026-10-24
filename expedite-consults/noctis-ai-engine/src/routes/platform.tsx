import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { platformCatalog } from "@/lib/platform-api";

export const Route = createFileRoute("/platform")({ component: PlatformPage });

type Catalog = Awaited<ReturnType<typeof platformCatalog>>;

function PlatformPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    void platformCatalog()
      .then((row) => {
        if (!stop) setCatalog(row);
      })
      .catch((caught: unknown) => {
        if (!stop) setErr(caught instanceof Error ? caught.message : "The catalog did not load");
      });
    return () => {
      stop = true;
    };
  }, []);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Noctis Platform</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">A catalog developers can read.</h1>
          <p className="mt-2 text-sm text-muted">
            Halls, communities, and the market list are public. Bots, write access, and payments stay closed until identity and security are trusted. Learning signals, under You, are off until you allow them, and they never include private messages.
          </p>
        </header>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Open now</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Read halls, communities, and product titles.</li>
            <li>Build a study or community view from that list.</li>
          </ul>
          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Closed</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Bots and agents that post or message people.</li>
            <li>VibePay, invoices, and in-app charges.</li>
            <li>Private chats, files, and account data.</li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            Orders still go to the seller from <Link to="/market" className="font-semibold text-primary">Resources</Link>.
          </p>
        </section>
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Catalog</h2>
          {err ? <p className="mt-2 text-sm text-muted">{err}</p> : null}
          {!catalog && !err ? <p className="mt-2 text-sm text-muted">Loading…</p> : null}
          {catalog ? (
            <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-elevated p-3 text-[11px] leading-relaxed">{JSON.stringify(catalog, null, 2)}</pre>
          ) : null}
        </section>
      </ClinicFrame>
    </AppShell>
  );
}
