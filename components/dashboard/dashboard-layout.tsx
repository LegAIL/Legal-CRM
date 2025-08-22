
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Scale,
  Bell,
  Search,
  Timer,
  CalendarDays
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Kanban Board", href: "/kanban", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Time Tracking", href: "/time-tracking", icon: Timer },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  if (!session) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border border-amber-400/30">
                <Scale className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">LawAware</span>
                <p className="text-xs text-muted-foreground -mt-0.5">Legal CRM</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow abacus-sidebar border-r border-border">
          <div className="p-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border border-amber-400/30 group-hover:border-amber-400/50 transition-colors">
                <Scale className="h-7 w-7 text-amber-400 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors">LawAware</span>
                <p className="text-sm text-muted-foreground -mt-0.5">Legal CRM System</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <item.icon className="h-5 w-5 group-hover:text-primary" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {session.user?.firstName?.[0] || session.user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user?.name || `${session.user?.firstName} ${session.user?.lastName}`}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user?.role}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 abacus-header">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                {/* Mobile logo */}
                <Link href="/dashboard" className="flex lg:hidden items-center space-x-2 ml-4 hover:opacity-80 transition-opacity">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border border-amber-400/30">
                    <Scale className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-lg font-bold text-foreground">LawAware</span>
                </Link>
                
                <div className="hidden sm:block sm:ml-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search cases..."
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="hidden lg:flex lg:items-center lg:space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {session.user?.firstName?.[0] || session.user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">
                      {session.user?.name || `${session.user?.firstName} ${session.user?.lastName}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
