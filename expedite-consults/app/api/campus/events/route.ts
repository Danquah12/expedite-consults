// app/api/campus/events/route.ts
import { NextResponse } from "next/server";
import { initialCampusEvents, CampusEvent } from "@/lib/campus-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let events = [...initialCampusEvents];
  if (category && category !== "ALL") {
    events = events.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    count: events.length,
    events,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, location, buildingCode, category, time, dateMonth, dateDay, imageUrl } = body;

    if (!title || !location) {
      return NextResponse.json(
        { success: false, error: "Title and location are required" },
        { status: 400 }
      );
    }

    const newEvent: CampusEvent = {
      id: `e-${Date.now()}`,
      title,
      clubName: body.clubName || "Student Org",
      category: category || "Social",
      location,
      buildingCode: buildingCode || "SU-101",
      dateMonth: dateMonth || "MAR",
      dateDay: dateDay || "15",
      time: time || "7:00 PM",
      attendeesCount: 1,
      userRsvp: "GOING",
      description: description || "",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid event payload" },
      { status: 500 }
    );
  }
}
