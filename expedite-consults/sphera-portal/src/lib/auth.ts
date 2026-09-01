import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          include: { profile: true },
        });

        if (!user || !user.passwordHash) return null;
        if (user.status !== "ACTIVE") return null;

        // Dynamic import to avoid bundling argon2 in edge runtime
        const argon2 = await import("argon2");
        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.profile?.username ?? email,
          image: user.profile?.avatar ?? null,
          username: user.profile?.username ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create profile when signing up via OAuth
      if (user.id) {
        const existingProfile = await db.profile.findUnique({
          where: { userId: user.id },
        });
        if (!existingProfile) {
          const baseUsername = user.email?.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() ?? "user";
          const username = `${baseUsername}${Math.floor(Math.random() * 9999)}`;

          await db.profile.create({
            data: {
              userId: user.id,
              username,
              displayName: user.name ?? username,
              avatar: user.image ?? null,
            },
          });
        }
      }
    },
  },
});
