
"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Activity, FileText, User, Edit, Plus, ChevronDown, ChevronUp } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
  user?: {
    name?: string | null
    firstName?: string | null
    lastName?: string | null
  } | null
  case?: {
    title?: string | null
  } | null
}

interface ActivityFeedProps {
  initialActivities?: ActivityItem[]
}

function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities || [])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(!initialActivities)

  useEffect(() => {
    // Only fetch data if no initial data was provided
    if (!initialActivities) {
      const fetchActivities = async () => {
        try {
          const response = await fetch('/api/activities')
          if (response.ok) {
            const data = await response.json()
            setActivities(data)
          }
        } catch (error) {
          console.error('Failed to fetch activities:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchActivities()
    }
  }, [initialActivities])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "case_created":
        return Plus
      case "status_changed":
        return Edit
      case "file_uploaded":
        return FileText
      case "case_assigned":
        return User
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "case_created":
        return "text-green-400"
      case "status_changed":
        return "text-blue-400"
      case "file_uploaded":
        return "text-purple-400"
      case "case_assigned":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  const displayedActivities = showAll ? activities : activities?.slice(0, 5)
  const hasMoreActivities = activities?.length > 5

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>
          Latest activities across all cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-6 text-muted-foreground">
              Loading activities...
            </div>
          )}
          
          {!loading && displayedActivities?.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const iconColor = getActivityColor(activity.type)
            const userName = activity.user?.name || 
                           `${activity.user?.firstName || ''} ${activity.user?.lastName || ''}`.trim() || 
                           "System"
            
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>by {userName}</span>
                    {activity.case?.title && (
                      <>
                        <span>•</span>
                        <span className="text-primary">{activity.case.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {!loading && activities?.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No recent activity
            </div>
          )}

          {!loading && hasMoreActivities && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2"
              >
                {showAll ? (
                  <>
                    Visa färre
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Se alla ({activities?.length || 0})
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Optimize: Memoize component to prevent unnecessary re-renders
export default memo(ActivityFeed)
