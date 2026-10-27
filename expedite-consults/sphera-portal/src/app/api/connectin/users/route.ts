import { NextRequest, NextResponse } from "next/server"
import { connectinDb, UserRecord } from "@/lib/connectin-db"
import {
  pullCloudUsersIntoDb,
  upsertCloudUser,
  appendCloudTelemetry,
  resolveRequestGeoLocation
} from "@/lib/connectin-cloud-sync"

export async function GET(req: NextRequest) {
  try {
    await pullCloudUsersIntoDb()
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
    const {
      id,
      userId,
      email,
      phone,
      name,
      role,
      headline,
      avatar,
      coverImage,
      location,
      about,
      skills,
      profession,
      professionId,
      professionCategory,
      professionEnclave,
      authProvider,
      clientTimezone,
      batchUsers
    } = body

    const geo = resolveRequestGeoLocation(req, clientTimezone, location)
    const effectiveLocation =
      location && !location.includes("United States") && !location.includes("Cryptographically")
        ? location
        : geo.locationLabel

    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s: any) => (typeof s === "string" ? s : s?.name)).filter(Boolean)
      : undefined

    const cleanAvatar =
      avatar && typeof avatar === "string" && !avatar.startsWith("data:")
        ? avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Member")}&backgroundColor=0a66c2`
    const cleanCoverImage =
      coverImage && typeof coverImage === "string" && !coverImage.startsWith("data:")
        ? coverImage
        : undefined

    const updatedProfile = connectinDb.updateUserProfile(
      { userId: userId || id, email, name, role },
      {
        name,
        headline,
        avatar: cleanAvatar,
        coverImage: cleanCoverImage,
        location: effectiveLocation,
        about,
        skills: normalizedSkills,
        profession,
        professionId,
        professionCategory,
        professionEnclave
      }
    )

    const nowIso = new Date().toISOString()
    if (updatedProfile?.userId) {
      connectinDb.touchUserLogin(updatedProfile.userId, authProvider)
      const userObj = connectinDb.findUserById(updatedProfile.userId)
      if (userObj) {
        ;(userObj as any).countryName = geo.countryName
        ;(userObj as any).countryCode = geo.countryCode
        ;(userObj as any).isOutsideUS = geo.isOutsideUS
        ;(userObj as any).ipAddress = geo.ipAddress
      }

      await upsertCloudUser({
        id: updatedProfile.userId,
        email: (userObj?.email || email || `${(name || "member").toLowerCase().replace(/\s+/g, ".")}@connectin.app`).toLowerCase().trim(),
        phone: phone || userObj?.phone || "",
        name: updatedProfile.name,
        role: (userObj?.role || role || "personal") as UserRecord["role"],
        status: (userObj?.status || "Active") as UserRecord["status"],
        headline: updatedProfile.headline,
        avatar: cleanAvatar,
        coverImage: cleanCoverImage,
        location: effectiveLocation,
        countryName: geo.countryName,
        countryCode: geo.countryCode,
        isOutsideUS: geo.isOutsideUS,
        ipAddress: geo.ipAddress,
        about: updatedProfile.about,
        skills: normalizedSkills,
        profession: updatedProfile.profession,
        professionId: updatedProfile.professionId,
        professionCategory: updatedProfile.professionCategory,
        professionEnclave: updatedProfile.professionEnclave,
        authProvider: authProvider || (userObj as any)?.authProvider || "Active Session",
        lastLoginAt: nowIso,
        createdAt: userObj?.createdAt || nowIso,
        updatedAt: nowIso
      })

      if (authProvider && authProvider !== "Active Session") {
        const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        await appendCloudTelemetry({
          activityLog: {
            id: `act_login_${updatedProfile.userId}_${Date.now().toString().slice(-5)}`,
            userId: updatedProfile.userId,
            userName: updatedProfile.name,
            userEmail: userObj?.email || email || "",
            userAvatar: cleanAvatar,
            userHeadline: updatedProfile.headline,
            actionType: "USER_LOGIN",
            actionLabel: `Signed In via ${authProvider} (${geo.locationLabel})`,
            category: "auth",
            targetTitle: `${authProvider} · ${geo.locationLabel}`,
            details: `Authenticated session from ${geo.locationLabel} (IP: ${geo.ipAddress})`,
            timestamp: `${timeStr} · ${geo.countryName}`,
            createdAtIso: nowIso
          },
          auditLog: {
            id: `LOG-${Date.now().toString().slice(-6)}`,
            adminEmail: userObj?.email || email || "member@connectin.app",
            action: "USER_ACTIVATED",
            targetEntity: `${updatedProfile.name} (${userObj?.email || email})`,
            reason: `Live member login via ${authProvider} from ${geo.locationLabel}`,
            ipAddress: `${geo.ipAddress} (${geo.locationLabel})`,
            timestamp: `${timeStr}`,
            status: "Success"
          },
          socEvent: {
            id: `SOC-LIVE-${Date.now().toString().slice(-5)}`,
            severity: "Low",
            eventType: `Global Member Login (${geo.countryName})`,
            sourceIp: `${geo.ipAddress} (${geo.locationLabel})`,
            targetAccount: `${updatedProfile.name} (${userObj?.email || email})`,
            mitigationAction: `Verified ${authProvider} Session Allowed`,
            timestamp: "Just Now"
          },
          verification: {
            id: `VER-${updatedProfile.userId}`,
            applicantName: updatedProfile.name,
            applicantEmail: userObj?.email || email || "",
            applicantAvatar: cleanAvatar,
            requestType: "Executive Identity",
            submittedDocument: `${authProvider} Verified (${geo.locationLabel})`,
            organizationName: updatedProfile.profession || "ConnectIn Global Network",
            submittedAt: "Just Now",
            status: "Approved"
          }
        })
      }
    }

    // Optional parallel batch sync of locally stored users from the client browser (max 5)
    if (Array.isArray(batchUsers) && batchUsers.length > 0) {
      const validBatch = batchUsers.filter((bu: any) => bu && bu.email && bu.name).slice(0, 5)
      await Promise.allSettled(
        validBatch.map((bu: any) =>
          upsertCloudUser({
            id: bu.id || `USR-${Math.floor(10000 + Math.random() * 90000)}`,
            email: String(bu.email).toLowerCase().trim(),
            name: String(bu.name).trim(),
            role: "personal",
            status: (bu.enforcementStatus || "Active") as any,
            headline: bu.headline || "Verified ConnectIn Member",
            avatar: bu.avatar && typeof bu.avatar === "string" && !bu.avatar.startsWith("data:") ? bu.avatar : "",
            location: bu.location && !bu.location.includes("United States") ? bu.location : effectiveLocation,
            countryName: geo.countryName,
            countryCode: geo.countryCode,
            isOutsideUS: geo.isOutsideUS,
            profession: bu.organization,
            authProvider: bu.mfaStatus?.includes("Google")
              ? "Google SSO"
              : bu.mfaStatus?.includes("Microsoft")
              ? "Microsoft Entra ID"
              : "Verified Member",
            lastLoginAt: nowIso,
            createdAt: nowIso,
            updatedAt: nowIso
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      geo
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}


