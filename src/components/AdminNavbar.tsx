("use client");

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const items = (locale: string) => [
  { href: `/${locale}/admin`, label: "Dashboard" },
  { href: `/${locale}/admin/products`, label: "Products" },
  { href: `/${locale}/admin/orders`, label: "Orders" },
  { href: `/${locale}/admin/users`, label: "Users" },
  { href: `/${locale}/admin/categories`, label: "Categories" },
  { href: `/${locale}/admin/tags`, label: "Tags" },
  { href: `/${locale}/admin/settings`, label: "Settings" },
];

export default function AdminNavbar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link href={`/${locale}`} className="font-bold text-lg">
          ORCHID Admin
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {items(locale).map((item) => (
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
