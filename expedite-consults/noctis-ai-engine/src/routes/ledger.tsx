import { useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/ledger")({ component: LedgerPage });

function LedgerPage() {
  const router = useRouter();
  useEffect(() => {
    void router.navigate({ to: "/home", replace: true });
  }, [router]);
  return null;
}
