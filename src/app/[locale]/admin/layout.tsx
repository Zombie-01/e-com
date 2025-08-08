import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth";
import AdminNavbar from "@/src/components/AdminNavbar";

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar locale={locale} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
