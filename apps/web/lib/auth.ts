import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare, hash } from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

// Extend session types to include role and id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    onboardingComplete: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // JWT strategy required for Credentials provider to work properly
    // User data still stored in database via Prisma adapter
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Link accounts with same email
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Email/Password Credentials Provider
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Find user by email (case-insensitive)
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // User not found or no password (OAuth user)
        if (!user || !user.hashedPassword) {
          return null;
        }

        // Verify password
        const isPasswordValid = await compare(password, user.hashedPassword);
        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }

      // Handle session updates (e.g., after onboarding)
      if (trigger === "update" && session) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }

      // Always refresh critical user data from database on each request
      // This ensures role and onboarding status changes are reflected immediately
      if (token.id && !user && trigger !== "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: true,
            onboardingComplete: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Transfer token data to session
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.onboardingComplete = token.onboardingComplete;
      }

      return session;
    },
    async signIn({ user, account }) {
      try {
        // For OAuth sign-ins, update last login
        if (account?.provider !== "credentials" && user.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        }
        return true;
      } catch (error) {
        console.error("[Auth] Sign in error:", error);
        // Still allow sign-in even if lastLogin update fails
        return true;
      }
    },
  },
});

// Password hashing utility - 12 rounds as per chunk spec
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Password validation utility
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
