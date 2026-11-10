import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/social/Inbox";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });
