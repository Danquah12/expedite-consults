import { NextRequest, NextResponse } from "next/server"
import { connectinDb, UserRecord } from "@/lib/connectin-db"

export async function GET(req: NextRequest) {
  try {
    const users = connectinDb.getAllUsersWithProfiles()
    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, status } = await req.json()
    if (!userId || !status) {
      return NextResponse.json({ error: "userId and status are required" }, { status: 400 })
    }

    const updated = connectinDb.updateUserStatus(userId, status as UserRecord["status"])
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `User ${userId} status updated to ${status}` })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, userId, email, name, headline, avatar, coverImage, location, about, skills, profession, professionId, professionCategory, professionEnclave } = body

    const updatedProfile = connectinDb.updateUserProfile(
      { userId: userId || id, email, name },
      {
        name,
        headline,
        avatar,
        coverImage,
        location,
        about,
        skills: Array.isArray(skills) ? skills.map((s: any) => (typeof s === 'string' ? s : s.name)) : undefined,
        profession,
        professionId,
        professionCategory,
        professionEnclave
      }
    )

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}

