
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, User, Shield, Bell, Palette } from "lucide-react"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  const settingsCategories = [
    {
      title: "Profile Settings",
      description: "Manage your personal information and preferences",
      icon: User,
      color: "text-blue-400"
    },
    {
      title: "Security",
      description: "Password, authentication, and security preferences",
      icon: Shield,
      color: "text-green-400"
    },
    {
      title: "Notifications",
      description: "Email and in-app notification preferences",
      icon: Bell,
      color: "text-yellow-400"
    },
    {
      title: "Appearance",
      description: "Theme, display settings, and customization",
      icon: Palette,
      color: "text-purple-400"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {settingsCategories.map((category) => (
            <Card key={category.title} className="glass card-hover cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <span>{category.title}</span>
                </CardTitle>
                <CardDescription>
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Coming soon...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current User: </span>
                <span className="font-medium">
                  {session.user?.name || `${session.user?.firstName} ${session.user?.lastName}`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Role: </span>
                <span className="font-medium">{session.user?.role}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{session.user?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version: </span>
                <span className="font-medium">LawAware CRM v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
