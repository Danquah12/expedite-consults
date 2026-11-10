import { createFileRoute } from "@tanstack/react-router";
import { WatchReels } from "@/components/social/Hub";

export const Route = createFileRoute("/watch")({ component: WatchReels });
