import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/components/social/Discover";

export const Route = createFileRoute("/marketplace")({ component: MarketplacePage });
