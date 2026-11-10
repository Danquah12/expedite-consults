import { createFileRoute } from "@tanstack/react-router";
import { CoursePage } from "@/components/social/Courses";

export const Route = createFileRoute("/courses/$courseId")({ component: CourseRoute });

function CourseRoute() {
  const { courseId } = Route.useParams();
  return <CoursePage courseId={courseId} />;
}
