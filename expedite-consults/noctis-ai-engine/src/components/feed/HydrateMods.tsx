import { useEffect } from "react";
import { listMods } from "@/lib/admin-api";
import { useFeedStore } from "@/lib/feed-store";

export function HydrateMods() {
  useEffect(() => {
    void listMods()
      .then((rows) => {
        rows.filter((r) => r.status === "hide" && r.youtube_id).forEach((r) => useFeedStore.getState().dropGatedYoutube(r.youtube_id!));
      })
      .catch(() => {
        /* desk schema may still be applying */
      });
  }, []);
  return null;
}
