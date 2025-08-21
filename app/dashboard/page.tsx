
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  // Optimize: Pre-fetch dashboard data on server-side to reduce client-side API calls
  const [caseStats, recentActivities] = await Promise.all([
    // Get case stats for charts
    prisma.case.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Get recent activities
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true
          }
        },
        case: {
          select: {
            title: true
          }
        }
      }
    })
  ])

  // Process case stats
  const processedStats = caseStats?.reduce((acc, item) => {
    acc[item.status] = item._count.status
    return acc
  }, {} as Record<string, number>) || {}

  const dashboardData = {
    caseStats: {
      NEW: processedStats.NEW || 0,
      IN_PROGRESS: processedStats.IN_PROGRESS || 0,
      REVIEW: processedStats.REVIEW || 0,
      COMPLETED: processedStats.COMPLETED || 0
    },
    recentActivities
  }

  return (
    <DashboardLayout>
      <DashboardOverview initialData={dashboardData} />
    </DashboardLayout>
  )
}
