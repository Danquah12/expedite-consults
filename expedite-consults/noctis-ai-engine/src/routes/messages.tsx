import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/social/Inbox";

export const Route = createFileRoute("/messages")({ component: MessagesPage });
