"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Globe,
  Search,
  LogOut,
  Settings,
  Package,
} from "lucide-react";
import { usePathname } from "../i18n/navigation";

export default function Navigation({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const { getTotalItems } = useCartStore();
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(en|mn)/, "");

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/products`, label: t("products") },
  ];

  // Admin menu items shown on desktop only (not mobile)
  const adminMenuItems = [
    { href: `/${locale}/admin/products`, label: "Manage Products" },
    { href: `/${locale}/admin/tags`, label: "Manage Tags" },
    { href: `/${locale}/admin/categories`, label: "Manage Categories" },
    { href: `/${locale}/admin/orders`, label: "View Orders" },
    { href: `/${locale}/admin/users`, label: "Manage Users" },
    { href: `/${locale}/admin/settings`, label: "Site Settings" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold text-gray-900">
            Luxe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(session?.user?.role == "ADMIN" ? adminMenuItems : navItems).map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-gray-500" />
              <Link
                href={`/en${pathWithoutLocale}`}
                className={`px-2 py-1 text-sm rounded ${
                  locale === "en"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}>
                EN
              </Link>
              <Link
                href={`/mn${pathWithoutLocale}`}
                className={`px-2 py-1 text-sm rounded ${
                  locale === "mn"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}>
                МН
              </Link>
            </div>

            {/* Cart */}
            <Link href={`/${locale}/cart`}>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User - dropdown only on mobile */}
            {session ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {/* On desktop show user name and links inline */}
                  <span className="text-gray-700 font-medium">
                    {session.user?.name}
                  </span>
                </div>

                {/* Mobile dropdown */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/${locale}/profile`}
                          className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/${locale}/profile?tab=orders`}
                          className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex items-center text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <Link href={`/${locale}/auth/signin`}>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              ))}

              {/* Admin links on mobile nav */}
              {adminMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              ))}

              {/* Auth links */}
              {session ? (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}>
                    Profile
                  </Link>
                  <Link
                    href={`/${locale}/profile?tab=orders`}
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}>
                    Orders
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-700 py-2 px-4 text-left w-full"
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href={`/${locale}/auth/signin`}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
