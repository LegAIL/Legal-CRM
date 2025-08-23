
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const view = searchParams.get('view') || 'month'

    if (!startDate || !endDate) {
      return NextResponse.json({ 
        error: "Start date and end date are required" 
      }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Fetch cases within the date range that have dueDate
    const cases = await prisma.case.findMany({
      where: {
        AND: [
          {
            dueDate: {
              not: null
            }
          },
          {
            dueDate: {
              gte: start,
              lte: end
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        clientName: true,
        dueDate: true,
        createdAt: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Transform cases to calendar events
    const events = cases.map(caseItem => ({
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      priority: caseItem.priority,
      clientName: caseItem.clientName,
      dueDate: caseItem.dueDate,
      createdAt: caseItem.createdAt,
      assignedTo: caseItem.assignedTo,
      type: 'case' as const
    }))

    // Group events by date for easier calendar rendering
    const eventsByDate = events.reduce((acc, event) => {
      if (!event.dueDate) return acc
      
      const dateKey = event.dueDate.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {} as Record<string, typeof events>)

    return NextResponse.json({
      events,
      eventsByDate,
      total: events.length,
      view,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })

  } catch (error) {
    console.error("Calendar API Error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
