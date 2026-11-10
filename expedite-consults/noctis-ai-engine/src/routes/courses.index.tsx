import { createFileRoute } from "@tanstack/react-router";
import { CoursesHome } from "@/components/social/Courses";

export const Route = createFileRoute("/courses/")({ component: CoursesHome });
