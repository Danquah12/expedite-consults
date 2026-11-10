import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/social/Inbox";

export const Route = createFileRoute("/me")({ component: ProfilePage });
