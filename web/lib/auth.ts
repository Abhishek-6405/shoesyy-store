import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier =
          credentials?.identifier ||
          (credentials as Record<string, string | undefined> | undefined)?.email;

        if (!rawIdentifier || !credentials?.password) {
          throw new Error("Please enter your email or username and password");
        }

        const identifier = rawIdentifier.trim();

        // Allow logging in via email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { username: { equals: identifier, mode: "insensitive" } },
            ],
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build-time-shoesy-store-key-32",
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: "Unauthorized. Please log in to proceed.", status: 401 };
  }
  return { user, error: null, status: 200 };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: "Unauthorized. Please log in.", status: 401 };
  }
  if (user.role !== Role.ADMIN) {
    return { user: null, error: "Forbidden. Admin privileges required.", status: 403 };
  }
  return { user, error: null, status: 200 };
}
