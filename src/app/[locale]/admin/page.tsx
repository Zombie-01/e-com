import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import AdminDashboard from "@/src/components/admin/AdminDashboard";

async function getDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue,
    recentOrders,
    products,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        delivery: true,
      },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { costPrice: true },
    }), // fetch costPrice for all products
  ]);

  // Calculate total cost price for all products
  const totalCost = products.reduce(
    (sum: any, p: any) => sum + (p.costPrice ?? 0),
    0
  );
  const margin = (totalRevenue._sum.amount || 0) - totalCost;

  // Revenue trend by month
  const revenueTrendRaw = await prisma.transaction.groupBy({
    by: ["createdAt"],
    _sum: { amount: true },
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "asc" },
  });
  // Cost trend by month (sum of costPrice for products sold in each month)
  const costTrendRaw = await prisma.order.groupBy({
    by: ["createdAt"],
    _sum: { total: true },
    orderBy: { createdAt: "asc" },
  });
  // Margin trend by month
  const marginTrend = revenueTrendRaw.map((r: any, i: any) => ({
    month: r.createdAt.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    }),
    value: (r._sum.amount || 0) - (costTrendRaw[i]?._sum.total || 0),
  }));
  const revenueTrend = revenueTrendRaw.map((r: any) => ({
    month: r.createdAt.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    }),
    value: r._sum.amount || 0,
  }));
  const costTrend = costTrendRaw.map((r: any) => ({
    month: r.createdAt.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    }),
    value: r._sum.total || 0,
  }));

  // Stock distribution by product name
  const productsWithStock = await prisma.product.findMany({
    where: { active: true },
    select: {
      enName: true,
      variants: { select: { stock: true }, where: { active: true } },
    },
  });
  const stockDistribution = productsWithStock.map((p: any) => ({
    name: p.enName,
    value: p.variants.reduce((sum: any, v: any) => sum + v.stock, 0),
  }));

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalCost,
    margin,
    recentOrders,
    revenueTrend,
    costTrend,
    marginTrend,
    stockDistribution,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const stats = await getDashboardStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard stats={stats} />
    </div>
  );
}
