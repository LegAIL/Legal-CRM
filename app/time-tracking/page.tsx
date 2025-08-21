
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TimeTrackingView } from "@/components/time-tracking/time-tracking-view"

export default async function TimeTrackingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <TimeTrackingView currentUser={session.user} />
    </DashboardLayout>
  )
}
