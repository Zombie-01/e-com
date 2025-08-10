"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/src/lib/store";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Settings,
  Package,
  Shield,
  Users,
  BarChart3,
  Tag,
  FolderTree,
  ShoppingBag,
  Cog,
  Home,
  Package2,
} from "lucide-react";
import { usePathname } from "../i18n/navigation";
import { sendEmail } from "../lib/email";

export default function Navigation({ locale }: { locale: string }) {
  const { data: session } = useSession();
  const t = useTranslations("");
  const { getTotalItems } = useCartStore();
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(en|mn)/, "");

  const navItems = [
    { href: `/${locale}`, label: t("nav.home"), icon: Home },
    { href: `/${locale}/products`, label: t("nav.products"), icon: Package2 },
  ];

  // Admin menu items
  const adminMenuItems = [
    {
      href: `/${locale}/admin`,
      label: t("admin.dashboard"),
      icon: BarChart3,
      description: t("admin.dashboardDesc"),
    },
    {
      href: "/admin/brands",
      icon: Package,
      label: t("admin.brands"),
      desc: t("admin.brandsDesc"),
    },
    {
      href: `/${locale}/admin/products`,
      label: t("admin.products"),
      icon: ShoppingBag,
      description: t("admin.productsDesc"),
    },
    {
      href: `/${locale}/admin/orders`,
      label: t("admin.orders"),
      icon: Package,
      description: t("admin.ordersDesc"),
    },
    {
      href: `/${locale}/admin/users`,
      label: t("admin.users"),
      icon: Users,
      description: t("admin.usersDesc"),
    },
    {
      href: `/${locale}/admin/categories`,
      label: t("admin.categories"),
      icon: FolderTree,
      description: t("admin.categoriesDesc"),
    },
    {
      href: `/${locale}/admin/tags`,
      label: t("admin.tags"),
      icon: Tag,
      description: t("admin.tagsDesc"),
    },
    {
      href: `/${locale}/admin/settings`,
      label: t("admin.settings"),
      icon: Cog,
      description: t("admin.settingsDesc"),
    },
  ];

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
            {locale === "en" ? "ORCHID" : "ОРЧИД"}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session?.user?.role !== "ADMIN" &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center md:space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              {locale === "mn" ? (
                <Link
                  href={`/en${pathWithoutLocale}`}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${"text-gray-600 hover:text-blue-600 hover:bg-white/50"}`}>
                  EN
                </Link>
              ) : (
                <Link
                  href={`/mn${pathWithoutLocale}`}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 mr-1 ${"text-gray-600 hover:text-blue-600 hover:bg-white/50"}`}>
                  МН
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link href={`/${locale}/cart`}>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Profile */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-200 transition-all duration-200">
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 p-2 shadow-xl border-0 bg-white/95 backdrop-blur-md">
                  {/* User Info Header */}
                  {session && (
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg mb-2">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        <AvatarImage src={session.user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getUserInitials(session.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {session.user?.email}
                        </p>
                        {session.user?.role === "ADMIN" && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs bg-purple-100 text-purple-700 border-purple-200">
                            <Shield className="w-3 h-3 mr-1" />
                            {t("common.admin")}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )}

                  <DropdownMenuSeparator className="my-2" />

                  {/* Admin Section */}
                  {
                    <>
                      {session && session.user?.role == "ADMIN" && (
                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                          {t("common.administration")}
                        </DropdownMenuLabel>
                      )}
                      {(session && session.user?.role == "ADMIN"
                        ? adminMenuItems
                        : navItems
                      ).map((item: any) => (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className="p-0">
                          <Link
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-colors group">
                            {item?.icon && (
                              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <item.icon className="h-4 w-4 text-purple-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.label}
                              </p>
                              {item?.description && (
                                <p className="text-xs text-gray-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="my-2" />
                    </>
                  }
                  <DropdownMenuSeparator className="my-2" />

                  {/* Sign Out */}
                  {session && (
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors group cursor-pointer">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          {t("auth.signOut")}
                        </p>
                        <p className="text-xs text-red-600">
                          {t("auth.signOutDesc")}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Profile Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 shadow-lg">
                  {session && (
                    <Link href={`/${locale}/profile`} className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                      {session.user?.role === "ADMIN" && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t("common.admin")}
                        </Badge>
                      )}
                    </Link>
                  )}
                  <DropdownMenuSeparator />

                  {(session && session.user?.role == "ADMIN"
                    ? adminMenuItems
                    : navItems
                  ).map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  {session && (
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("auth.signOut")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!session && (
              <Link href={`/${locale}/auth/signin`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:block">{t("auth.sign_in")}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
