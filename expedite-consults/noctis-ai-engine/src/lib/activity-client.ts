import { logActivity } from "@/lib/activity-api";

let searchTimer = 0;

/** Fire-and-forget evidence row for the signed-in member. Search waits until typing pauses. */
export function trail(action: string, detail: string, target = "") {
  if (typeof window === "undefined") return;
  const send = () => {
    void logActivity({ data: { action, detail, target } }).catch(() => undefined);
  };
  if (action === "search") {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(send, 900);
    return;
  }
  send();
}
