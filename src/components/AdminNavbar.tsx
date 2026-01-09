"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

export default function AdminNavbar() {
  const adminMenuItems = [
    {
      href: `/admin`,
      label: "admin dashboard",
      description: "admin dashboardDesc",
    },
    {
      href: "/admin/brands",
      label: "admin brands",
      desc: "admin brandsDesc",
    },
    {
      href: `/admin/products`,
      label: "admin products",
      description: "admin productsDesc",
    },
    {
      href: `/admin/orders`,
      label:  "admin orders",
      description: "admin.ordersDesc",
    },
    {
      href: `/admin/users`,
      label:  "admin users" ,
      description:  "admin usersDesc" ,
    },
    {
      href: `/admin/categories`,
      label:  "admin categories" ,
      description:  "admin categoriesDesc" ,
    },
    {
      href: `/admin/tags`,
      label:  "admin tags" ,
      description:  "admin.tagsDesc" ,
    },
    {
      href: `/admin/settings`,
      label:  "admin settings" ,
      description: "admin settingsDesc",
    },
  ];

  const pathname = usePathname();
  const isActive = (href: string) => `${pathname}`.startsWith(href);

  return (
    <nav className="sticky hidden md:block top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={`/admin`} className="font-bold text-lg">
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
