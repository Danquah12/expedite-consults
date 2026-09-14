import { db } from "@/lib/db";
import { PostType, Visibility, CommunityNoteStatus, UserRole, MediaType } from "@/generated/client";

export async function getOrCreateDefaultUser(username: string = "kwesi") {
  try {
    const existingProfile = await db.profile.findUnique({
      where: { username },
      include: { user: true },
    });

    if (existingProfile?.user) {
      return existingProfile.user;
    }

    const email = `${username}@sphera.net`;
    const existingUser = await db.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      if (!existingUser.profile) {
        await db.profile.create({
          data: {
            userId: existingUser.id,
            username,
            displayName: username === "kwesi" ? "Kwesi Asiedu" : username,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            bio: "Sovereign Graph Architect & Builder",
            isVerified: true,
          },
        });
      }
      return existingUser;
    }

    const newUser = await db.user.create({
      data: {
        email,
        role: username === "kwesi" ? UserRole.ADMIN : UserRole.USER,
        profile: {
          create: {
            username,
            displayName: username === "kwesi" ? "Kwesi Asiedu" : username,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            bio: "Sovereign Graph Architect & Builder",
            isVerified: true,
            skills: ["Decentralized Identity", "Rust", "Next.js", "AI Protocols"],
            interests: ["Cybersecurity", "Zero-Trust", "Esports", "Web3"],
          },
        },
      },
      include: { profile: true },
    });

    return newUser;
  } catch (error) {
    console.error(`[db-seed] Failed to get/create user ${username}:`, error);
    return null;
  }
}

export async function seedDatabaseIfNeeded() {
  try {
    const postCount = await db.post.count();
    if (postCount > 0) {
      return;
    }

    console.log("[db-seed] Seeding initial SpheraNet PostgreSQL tables...");

    const usersData = [
      {
        email: "kasiedu@expedite-consults.com",
        username: "kwesi",
        displayName: "Kwesi Asiedu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        bio: "Founder & Lead Architect @ SpheraNet. Building sovereign collegiate network protocols.",
        role: UserRole.ADMIN,
      },
      {
        email: "amara@sphera.net",
        username: "amara_creates",
        displayName: "Amara Diallo",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "Digital artist & sound designer. Crafting immersive Web3 experiences.",
        role: UserRole.CREATOR,
      },
      {
        email: "marcus@sphera.net",
        username: "mj_tech",
        displayName: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bio: "Cybersecurity researcher & Enclave kernel hacker @ UMD Terps.",
        role: UserRole.USER,
      },
      {
        email: "zara@sphera.net",
        username: "zara.w",
        displayName: "Zara Williams",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        bio: "Bitcamp organizer & robotics engineer. Terrapin builder.",
        role: UserRole.USER,
      },
      {
        email: "elena@sphera.net",
        username: "elena_v",
        displayName: "Elena Vasquez",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        bio: "UI/UX Researcher & generative frontend developer.",
        role: UserRole.CREATOR,
      },
      {
        email: "esports@umd.edu",
        username: "terps_esports",
        displayName: "UMD Terps Esports",
        avatar: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80",
        bio: "Official University of Maryland Esports & Competitive Gaming Guild.",
        role: UserRole.CREATOR,
      },
    ];

    const createdUsers: Record<string, any> = {};

    for (const u of usersData) {
      let user = await db.user.findUnique({
        where: { email: u.email },
        include: { profile: true },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email: u.email,
            role: u.role,
            profile: {
              create: {
                username: u.username,
                displayName: u.displayName,
                avatar: u.avatar,
                bio: u.bio,
                isVerified: true,
              },
            },
          },
          include: { profile: true },
        });
      }
      createdUsers[u.username] = user;
    }

    const kwesi = createdUsers["kwesi"];
    const amara = createdUsers["amara_creates"];
    const marcus = createdUsers["mj_tech"];
    const zara = createdUsers["zara.w"];
    const elena = createdUsers["elena_v"];

    if (kwesi && amara && marcus && zara) {
      await db.follow.upsert({
        where: { followerId_followingId: { followerId: kwesi.id, followingId: amara.id } },
        update: {},
        create: { followerId: kwesi.id, followingId: amara.id },
      }).catch(() => {});

      await db.follow.upsert({
        where: { followerId_followingId: { followerId: kwesi.id, followingId: marcus.id } },
        update: {},
        create: { followerId: kwesi.id, followingId: marcus.id },
      }).catch(() => {});

      await db.friendship.upsert({
        where: { senderId_receiverId: { senderId: kwesi.id, receiverId: zara.id } },
        update: { status: "ACCEPTED" },
        create: { senderId: kwesi.id, receiverId: zara.id, status: "ACCEPTED" },
      }).catch(() => {});
    }

    if (kwesi) {
      const pulsePost = await db.post.create({
        data: {
          id: "pulse-t1",
          authorId: kwesi.id,
          type: PostType.THREAD,
          content: "1/4 SpheraNet 2.0 is officially deploying sovereign zero-trust architecture across all connected campus graphs. Here is why decentralizing social graph ownership changes student IP forever 🧵👇 #SpheraLaunch #ZeroTrust",
          visibility: Visibility.PUBLIC,
          isThread: true,
          threadIndex: 1,
          threadTotal: 3,
          communityNotes: {
            create: {
              authorId: marcus?.id || kwesi.id,
              content: "Verified by UMD Cybersecurity Enclave benchmarks: SHA-256 local signature hashes prevent unauthorized scraping of collegiate builder profiles.",
              sources: ["https://cyber.umd.edu/research/sovereign-graph", "https://expediteconsults.com/security"],
              status: CommunityNoteStatus.CURRENTLY_RATED_HELPFUL,
              helpfulCount: 342,
            },
          },
        },
      });

      await db.post.create({
        data: {
          id: "pulse-t1-r1",
          authorId: kwesi.id,
          type: PostType.THREAD,
          content: "2/4 Every coursework repo, hackathon submission, and bazaar escrow transaction is cryptographically signed with local enclave keys. No central ad networks sniffing your private career passport.",
          visibility: Visibility.PUBLIC,
          isThread: true,
          threadIndex: 2,
          threadTotal: 3,
          threadParentId: pulsePost.id,
        },
      });

      await db.post.create({
        data: {
          id: "pulse-t1-r2",
          authorId: kwesi.id,
          type: PostType.THREAD,
          content: "3/4 Try converting this entire discussion into a longform verified article with 1 click using the new AI Synthesizer at the top of your feed! 🚀",
          visibility: Visibility.PUBLIC,
          isThread: true,
          threadIndex: 3,
          threadTotal: 3,
          threadParentId: pulsePost.id,
        },
      });

      if (marcus) {
        await db.reaction.create({
          data: { userId: marcus.id, postId: pulsePost.id, type: "LIKE" },
        }).catch(() => {});
      }
    }

    if (amara) {
      const reelPost = await db.post.create({
        data: {
          id: "p1",
          authorId: amara.id,
          type: PostType.REEL,
          content: "3 years of building in the dark, and today our largest platform update is finally live across SpheraNet! 🚀✨ Full breakdown dropping on Reels tonight. Tag a friend who needs to see this! 💫",
          mediaUrls: ["https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80"],
          visibility: Visibility.PUBLIC,
          comments: {
            create: [
              {
                authorId: marcus?.id || amara.id,
                content: "This UI is next level! The sound synchronization is insane 🔥",
              },
              {
                authorId: zara?.id || amara.id,
                content: "Proud of you Amara! Collegiate hackathons will never be the same 👏",
              },
            ],
          },
        },
      });

      if (kwesi) {
        await db.reaction.create({
          data: { userId: kwesi.id, postId: reelPost.id, type: "LIKE" },
        }).catch(() => {});
        await db.save.create({
          data: { userId: kwesi.id, postId: reelPost.id },
        }).catch(() => {});
      }
    }

    if (marcus) {
      await db.post.create({
        data: {
          id: "bounty-1",
          authorId: marcus.id,
          type: PostType.BOUNTY,
          content: "New Defense Bounty Challenge posted for student & alumni developers: Zero-Trust Enclave Rust Driver Audit. Earn USDC & Skill Passport Credentials.",
          linkMeta: {
            title: "Rust SGX Enclave Memory Isolation Audit",
            reward: "$3,500 USDC",
            sponsor: "Defense Innovation & Cyber Guild",
            clearanceRequired: "TS/SCI Eligible",
            difficulty: "Zero-Day",
            tags: ["Rust", "SGX", "Zero-Trust", "Penetration Testing"],
          },
          visibility: Visibility.PUBLIC,
        },
      });
    }

    if (zara) {
      await db.post.create({
        data: {
          id: "p3",
          authorId: zara.id,
          type: PostType.PHOTO,
          content: "Bitcamp 2026 kickoff team photo at the Brendan Iribe Center! Over 600 builders here hacking on autonomous AI agents, robotics, and next-gen social protocols 🔥",
          mediaUrls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80"],
          visibility: Visibility.FRIENDS,
        },
      });
    }

    if (amara) {
      await db.post.create({
        data: {
          id: "art-1",
          authorId: amara.id,
          type: PostType.ARTICLE,
          content: "Why the Sovereign Social Web wins the decade: A technical deep-dive on combining TikTok algorithmic discovery with X public discourse and private escrow markets.",
          linkMeta: {
            title: "The Architecture of Sovereign Social Networks",
            subtitle: "Synthesizing TikTok, Instagram, X, and Campus Career Graphs into a Unified Experience",
            coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
            readTimeMinutes: 6,
            slug: "architecture-of-sovereign-social-networks",
          },
          visibility: Visibility.PUBLIC,
        },
      });
    }

    const storyExpiry = new Date(Date.now() + 48 * 3600 * 1000);

    if (kwesi) {
      await db.story.create({
        data: {
          id: "s0",
          authorId: kwesi.id,
          mediaUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
          mediaType: MediaType.IMAGE,
          caption: "Welcome to SpheraNet Sovereign Graph",
          expiresAt: storyExpiry,
        },
      }).catch(() => {});
    }

    if (amara) {
      await db.story.create({
        data: {
          id: "s1",
          authorId: amara.id,
          mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80",
          mediaType: MediaType.IMAGE,
          caption: "Live keynote at Sphera HQ 🚀",
          expiresAt: storyExpiry,
        },
      }).catch(() => {});
    }

    if (marcus) {
      await db.story.create({
        data: {
          id: "s2",
          authorId: marcus.id,
          mediaUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500&auto=format&fit=crop&q=80",
          mediaType: MediaType.IMAGE,
          caption: "Zero-trust enclave testing 🦾",
          expiresAt: storyExpiry,
        },
      }).catch(() => {});
    }

    if (zara) {
      await db.story.create({
        data: {
          id: "s3",
          authorId: zara.id,
          mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
          mediaType: MediaType.IMAGE,
          caption: "Bitcamp registration is live 🔥",
          expiresAt: storyExpiry,
        },
      }).catch(() => {});
    }

    if (elena) {
      await db.story.create({
        data: {
          id: "s4",
          authorId: elena.id,
          mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
          mediaType: MediaType.IMAGE,
          caption: "New UI glassmorphism preview ✨",
          expiresAt: storyExpiry,
        },
      }).catch(() => {});
    }

    console.log("[db-seed] Database seeding completed successfully!");
  } catch (error) {
    console.error("[db-seed] Database seeding failed or skipped:", error);
  }
}
