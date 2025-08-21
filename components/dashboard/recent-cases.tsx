
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, User } from "lucide-react"
import { format } from "date-fns"

export async function RecentCases() {
  const cases = await prisma.case.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      assignedTo: {
        select: {
          firstName: true,
          lastName: true,
          name: true
        }
      },
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          name: true
        }
      }
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "status-new"
      case "IN_PROGRESS":
        return "status-in-progress"
      case "REVIEW":
        return "status-review"
      case "COMPLETED":
        return "status-completed"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <Card className="glass card-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Cases
          <Button asChild variant="ghost" size="sm">
            <Link href="/cases">
              View all
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          Latest cases added to the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases?.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex items-start space-x-4 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium leading-none">
                  {caseItem.title}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(caseItem.status)}`}
                >
                  {caseItem.status.replace("_", " ")}
                </Badge>
              </div>
              {caseItem.clientName && (
                <p className="text-xs text-muted-foreground">
                  Client: {caseItem.clientName}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>
                    {caseItem.assignedTo?.name || 
                     `${caseItem.assignedTo?.firstName} ${caseItem.assignedTo?.lastName}` ||
                     "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(caseItem.createdAt), "MMM dd")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {cases?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No cases found
          </div>
        )}
      </CardContent>
    </Card>
  )
}
