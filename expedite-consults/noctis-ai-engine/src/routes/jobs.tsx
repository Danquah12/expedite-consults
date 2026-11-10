import { createFileRoute } from "@tanstack/react-router";
import { JobsPage } from "@/components/social/Discover";

export const Route = createFileRoute("/jobs")({ component: JobsPage });
