
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard } from "lucide-react"

export default async function KanbanPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground">
            Drag and drop cases between workflow stages and manage case progress
          </p>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5" />
              <span>Coming Soon</span>
            </CardTitle>
            <CardDescription>
              The Kanban board feature is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Kanban Board</h3>
              <p className="text-muted-foreground">
                This feature will allow you to manage cases in a visual board with columns for:
              </p>
              <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                <li>• New Cases</li>
                <li>• In Progress</li>
                <li>• Review</li>
                <li>• Completed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
