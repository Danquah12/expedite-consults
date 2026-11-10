import { createFileRoute } from "@tanstack/react-router";
import { StudySocial } from "@/components/social/StudySocial";

export const Route = createFileRoute("/social")({ component: StudySocial });
