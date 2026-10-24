import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { adoptDeskSso } from "@/lib/auth/desk-sso";
import { writeDeskHold } from "@/lib/auth/desk-hold";

export const Route = createFileRoute("/desk/sso")({
  component: DeskSso,
});

function DeskSso() {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void adoptDeskSso({ data: {} })
      .then(({ token }) => {
        if (!live) return;
        writeDeskHold(token);
        window.location.href = "/desk";
      })
      .catch((caught: unknown) => {
        if (!live) return;
        setErr(caught instanceof Error ? caught.message : "SSO did not finish");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-muted">{err ? err : "Finishing Desk sign-in…"}</p>
        {err ? (
          <a href="/desk/login" className="mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline">
            Back to Desk sign-in
          </a>
        ) : (
          <div className="mx-auto mt-4 h-8 w-36 animate-pulse rounded-lg bg-elevated" />
        )}
      </div>
    </div>
  );
}
