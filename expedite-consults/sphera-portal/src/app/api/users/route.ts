import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";
import argon2 from "argon2";
import { sendWelcomeEmail } from "@/lib/resend";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(50),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
});

// GET /api/users — search users by username or displayName
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const users = await db.user.findMany({
      where: {
        status: "ACTIVE",
        profile: {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { displayName: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      select: {
        id: true,
        role: true,
        profile: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            isVerified: true,
            profileVisibility: true,
          },
        },
      },
      take: limit,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/users — register a new user
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success: allowed } = await generalRatelimit.limit(ip);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, displayName, username } = parsed.data;

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Generate username from email if not provided
    const finalUsername = username ?? (email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() + Math.floor(Math.random() * 9999));

    const existingUsername = await db.profile.findUnique({ where: { username: finalUsername } });
    if (existingUsername) {
      return NextResponse.json({ success: false, error: "Username is already taken" }, { status: 409 });
    }

    const passwordHash = await argon2.hash(password);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash },
      });

      await tx.profile.create({
        data: { userId: newUser.id, username: finalUsername, displayName },
      });

      return newUser;
    });

    sendWelcomeEmail(email, displayName).catch(console.error);

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/users]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
