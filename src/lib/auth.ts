import type { AuthConfig } from "@auth/core";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email + Password credentials provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          bonus: user.bonus,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name || null,
          bonus: 0,
          phone: null,
          role: "USER", // 👈 заавал нэм
        },
      });

      return true;
    },

    async jwt({ token, user }) {
      // Attach user role on sign in
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = `${(token as any).role}` || "USER";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const clientRedirectUrl = process.env.CLIENT_REDIRECT_URL;
      if (url.startsWith(baseUrl)) return url;
      if (clientRedirectUrl && url.startsWith(clientRedirectUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
};

export default NextAuth(authOptions);
