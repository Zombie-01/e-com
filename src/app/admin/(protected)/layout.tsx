import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import AdminNavbar from "@/src/components/AdminNavbar";
import type { Session } from "next-auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = (await getServerSession(
    authOptions,
  )) as any as Session | null;

  // Админ биш бол login руу явуулна
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/auth/signin");
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
