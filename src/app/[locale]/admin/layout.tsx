import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import AdminNavbar from "@/src/components/AdminNavbar";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = (await getServerSession(
    authOptions,
  )) as any as Session | null;

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
