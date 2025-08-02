import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import AdminDashboard from '@/src/components/admin/AdminDashboard'

async function getDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    })
  ])

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const stats = await getDashboardStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard stats={stats} />
    </div>
  )
}