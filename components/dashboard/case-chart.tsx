
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useEffect, useState, memo } from "react"

interface CaseStats {
  NEW: number
  IN_PROGRESS: number
  REVIEW: number
  COMPLETED: number
}

interface CaseChartProps {
  initialStats?: CaseStats
}

function CaseChart({ initialStats }: CaseChartProps) {
  const [stats, setStats] = useState<CaseStats>(
    initialStats || {
      NEW: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      COMPLETED: 0
    }
  )
  const [loading, setLoading] = useState(!initialStats)

  useEffect(() => {
    // Only fetch data if no initial data was provided
    if (!initialStats) {
      const fetchStats = async () => {
        try {
          const response = await fetch("/api/cases/stats")
          if (response.ok) {
            const data = await response.json()
            setStats(data)
          }
        } catch (error) {
          console.error("Failed to fetch case stats:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchStats()
    }
  }, [initialStats])

  const total = Object.values(stats).reduce((sum, value) => sum + value, 0)

  const chartData = [
    { name: "New", value: stats.NEW, color: "bg-blue-500", percentage: total > 0 ? (stats.NEW / total) * 100 : 0 },
    { name: "In Progress", value: stats.IN_PROGRESS, color: "bg-yellow-500", percentage: total > 0 ? (stats.IN_PROGRESS / total) * 100 : 0 },
    { name: "Review", value: stats.REVIEW, color: "bg-purple-500", percentage: total > 0 ? (stats.REVIEW / total) * 100 : 0 },
    { name: "Completed", value: stats.COMPLETED, color: "bg-green-500", percentage: total > 0 ? (stats.COMPLETED / total) * 100 : 0 },
  ]

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Case Distribution</span>
        </CardTitle>
        <CardDescription>
          Overview of cases by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
            {total === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No cases found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Optimize: Memoize component to prevent unnecessary re-renders
export default memo(CaseChart)
