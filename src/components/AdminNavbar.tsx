"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { useTranslations } from "next-intl";

export default function AdminNavbar({ locale }: { locale: string }) {
  const t = useTranslations("");
  const adminMenuItems = [
    {
      href: `/${locale}/admin`,
      label: t("admin.dashboard"),
      description: t("admin.dashboardDesc"),
    },
    {
      href: "/admin/brands",
      label: t("admin.brands"),
      desc: t("admin.brandsDesc"),
    },
    {
      href: `/${locale}/admin/products`,
      label: t("admin.products"),
      description: t("admin.productsDesc"),
    },
    {
      href: `/${locale}/admin/orders`,
      label: t("admin.orders"),
      description: t("admin.ordersDesc"),
    },
    {
      href: `/${locale}/admin/users`,
      label: t("admin.users"),
      description: t("admin.usersDesc"),
    },
    {
      href: `/${locale}/admin/categories`,
      label: t("admin.categories"),
      description: t("admin.categoriesDesc"),
    },
    {
      href: `/${locale}/admin/tags`,
      label: t("admin.tags"),
      description: t("admin.tagsDesc"),
    },
    {
      href: `/${locale}/admin/settings`,
      label: t("admin.settings"),
      description: t("admin.settingsDesc"),
    },
  ];

  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky hidden md:block top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={`/${locale}`} className="font-bold text-lg">
          ORCHID Admin
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm hover:bg-gray-100",
                isActive(item.href)
                  ? "bg-gray-200 font-medium"
                  : "text-gray-700"
              )}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
