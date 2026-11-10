import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudio } from "@/components/social/Studio";

export const Route = createFileRoute("/studio")({ component: CreatorStudio });
