// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: "USER" | "ADMIN" | string
      bonus: number
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "USER" | "ADMIN" | string
  }
}
