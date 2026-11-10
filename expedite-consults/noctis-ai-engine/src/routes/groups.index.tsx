import { createFileRoute } from "@tanstack/react-router";
import { GroupsDiscover } from "@/components/social/Groups";

export const Route = createFileRoute("/groups/")({ component: GroupsDiscover });
