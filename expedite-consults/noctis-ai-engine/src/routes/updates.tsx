import { createFileRoute } from "@tanstack/react-router";
import { StudyNewsPage } from "@/components/social/Discover";

export const Route = createFileRoute("/updates")({ component: StudyNewsPage });
