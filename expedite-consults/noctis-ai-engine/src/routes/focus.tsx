import { createFileRoute } from "@tanstack/react-router";
import { FocusMusicPage } from "@/components/social/Discover";

export const Route = createFileRoute("/focus")({ component: FocusMusicPage });
