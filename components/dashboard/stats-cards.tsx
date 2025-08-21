
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, CheckCircle, Users, Timer, TrendingUp, DollarSign } from "lucide-react"
import { CaseStatus } from "@prisma/client"

export async function StatsCards() {
  // Optimize: Combine all case statistics in a single query using groupBy
  const [
    caseStats,
    userCount,
    progressStats,
    billableStats
  ] = await Promise.all([
    // Single query for all case counts by status
    prisma.case.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // User count query
    prisma.user.count({ where: { active: true } }),
    // Progress and hours in one query
    prisma.case.aggregate({
      _avg: { progress: true },
      _sum: { actualHours: true },
    }),
    // Billable amount query
    prisma.timeEntry.aggregate({
      where: { billable: true },
      _sum: { amount: true },
    })
  ])

  // Process the grouped case statistics
  const statusCounts = caseStats?.reduce((acc, item) => {
    acc[item.status] = item._count.status
    return acc
  }, {} as Record<string, number>) || {}

  const totalCases = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const newCases = statusCounts[CaseStatus.NEW] || 0
  const inProgressCases = statusCounts[CaseStatus.IN_PROGRESS] || 0
  const completedCases = statusCounts[CaseStatus.COMPLETED] || 0
  const totalUsers = userCount

  const averageProgress = Math.round(progressStats._avg.progress || 0)
  const totalHours = Math.round(progressStats._sum.actualHours || 0)
  const totalRevenue = Math.round(billableStats._sum.amount || 0)

  const stats = [
    {
      title: "Total Cases",
      value: totalCases,
      icon: FileText,
      description: "All cases in the system",
      color: "text-blue-400",
    },
    {
      title: "Avg. Progress",
      value: `${averageProgress}%`,
      icon: TrendingUp,
      description: "Average case completion",
      color: "text-purple-400",
      progress: averageProgress,
    },
    {
      title: "Total Hours",
      value: `${totalHours}h`,
      icon: Timer,
      description: "Hours logged across all cases",
      color: "text-orange-400",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Billable amount generated",
      color: "law-gold",
    },
    {
      title: "New Cases",
      value: newCases,
      icon: Clock,
      description: "Cases awaiting assignment",
      color: "text-yellow-400",
    },
    {
      title: "In Progress",
      value: inProgressCases,
      icon: Users,
      description: "Cases being worked on",
      color: "text-orange-400",
    },
    {
      title: "Completed",
      value: completedCases,
      icon: CheckCircle,
      description: "Successfully closed cases",
      color: "text-green-400",
    },
    {
      title: "Active Users",
      value: totalUsers,
      icon: Users,
      description: "Legal professionals",
      color: "text-blue-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.description}
            </p>
            {stat.progress !== undefined && (
              <Progress value={stat.progress} className="h-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
