// app/api/campus/courses/route.ts
import { NextResponse } from "next/server";
import { initialCampusCourses } from "@/lib/campus-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: initialCampusCourses.length,
    courses: initialCampusCourses,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, action } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      courseId,
      action: action || "ENROLL",
      timestamp: new Date().toISOString(),
      message: action === "DROP" ? "Course dropped from schedule" : "Enrolled in course successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process course enrollment" },
      { status: 500 }
    );
  }
}
