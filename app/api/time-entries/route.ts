
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek } from "date-fns"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all time entries
    const entries = await prisma.timeEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        case: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate stats
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const stats = {
      totalHours: entries.reduce((sum: number, entry: any) => sum + entry.hours, 0),
      billableHours: entries.filter((entry: any) => entry.billable).reduce((sum: number, entry: any) => sum + entry.hours, 0),
      totalAmount: entries.filter((entry: any) => entry.billable).reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0),
      entriesThisWeek: entries.filter((entry: any) => {
        const entryDate = new Date(entry.date)
        return entryDate >= weekStart && entryDate <= weekEnd
      }).length
    }

    return NextResponse.json({ entries, stats })
  } catch (error) {
    console.error("Failed to fetch time entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    )
  }
}
