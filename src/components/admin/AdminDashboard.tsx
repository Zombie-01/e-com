"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ShoppingBag, Users, Package, DollarSign, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface StatCardProps {
  title: string;
  value: string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, Icon, color, bgColor }: StatCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard({ stats }: { stats: DashboardStats }) {
  const t = useTranslations("admin");

  const statCards = [
    {
      title: t("revenue"),
      value: `$${stats.totalRevenue.toLocaleString()}`,
      Icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("orders"),
      value: stats.totalOrders.toLocaleString(),
      Icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("products"),
      value: stats.totalProducts.toLocaleString(),
      Icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("users"),
      value: stats.totalUsers.toLocaleString(),
      Icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/products",
      icon: Package,
      label: t("products"),
      desc: t("productsDesc"),
    },
    {
      href: "/admin/brands",
      icon: Package,
      label: t("brands"),
      desc: t("brandsDesc"),
    },
    {
      href: "/admin/tags",
      icon: Package,
      label: t("tags"),
      desc: t("tagsDesc"),
    },
    {
      href: "/admin/categories",
      icon: Package,
      label: t("categories"),
      desc: t("categoriesDesc"),
    },
    {
      href: "/admin/orders",
      icon: ShoppingBag,
      label: t("orders"),
      desc: t("ordersDesc"),
    },
    {
      href: "/admin/users",
      icon: Users,
      label: t("users"),
      desc: t("usersDesc"),
    },
    {
      href: "/admin/settings",
      icon: Eye,
      label: t("settings"),
      desc: t("settingsDesc"),
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-2">{t("subtitle")}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ title, value, Icon, color, bgColor }) => (
          <StatCard
            key={title}
            title={title}
            value={value}
            Icon={Icon}
            color={color}
            bgColor={bgColor}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link href={href} key={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span>{label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
