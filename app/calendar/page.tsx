
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import dynamic from 'next/dynamic'

const CalendarView = dynamic(() => import('@/components/calendar/calendar-view').then(mod => mod.CalendarView), {
  ssr: false,
  loading: () => <p>Loading calendar...</p>
})

export const metadata = {
  title: "Kalender - LawAware CRM",
  description: "Visa och hantera alla cases med deadlines i kalendervy",
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CalendarView initialView="month" />
      </div>
    </DashboardLayout>
  )
}
