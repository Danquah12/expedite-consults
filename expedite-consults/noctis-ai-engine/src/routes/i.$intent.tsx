import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { IntentRoom } from "@/components/learn/IntentRoom";
import { INTENTS, type IntentId } from "@/lib/learn";

export const Route = createFileRoute("/i/$intent")({ component: IntentPage });

function IntentPage() {
  const { intent } = Route.useParams();
  const known = INTENTS.some((i) => i.id === intent);
  return (
    <AppShell>
      <ClinicFrame>
        {known ? (
          <IntentRoom intent={intent as IntentId} />
        ) : (
          <p className="rounded-2xl bg-surface p-5 text-sm text-muted shadow-border">That room is not on the hall map.</p>
        )}
      </ClinicFrame>
    </AppShell>
  );
}
