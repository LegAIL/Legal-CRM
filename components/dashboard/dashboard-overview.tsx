
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentCases } from "@/components/dashboard/recent-cases"
import ActivityFeed from "@/components/dashboard/activity-feed"
import CaseChart from "@/components/dashboard/case-chart"

interface DashboardOverviewProps {
  initialData?: {
    caseStats: {
      NEW: number
      IN_PROGRESS: number
      REVIEW: number
      COMPLETED: number
    }
    recentActivities: any[]
  }
}

export function DashboardOverview({ initialData }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your case management activities
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CaseChart initialStats={initialData?.caseStats} />
        <RecentCases />
      </div>

      <ActivityFeed initialActivities={initialData?.recentActivities} />
    </div>
  )
}
