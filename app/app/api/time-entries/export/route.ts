
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const timeEntries = await prisma.timeEntry.findMany({
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true
          }
        },
        case: {
          select: {
            title: true,
            assignedTo: {
              select: {
                name: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Create CSV content
    const csvHeaders = [
      'Datum',
      'Tid (timmar)',
      'Beskrivning',
      'Ärendetitel',
      'Tilldelad person',
      'Användare',
      'Debiterbar',
      'Timtariff',
      'Belopp'
    ].join(',')

    const csvRows = timeEntries.map((entry: any) => {
      const userName = entry.user.name || `${entry.user.firstName || ''} ${entry.user.lastName || ''}`.trim()
      const assignedName = entry.case.assignedTo 
        ? entry.case.assignedTo.name || `${entry.case.assignedTo.firstName || ''} ${entry.case.assignedTo.lastName || ''}`.trim()
        : 'Ej tilldelad'
      
      return [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.hours.toString(),
        `"${(entry.description || '').replace(/"/g, '""')}"`,
        `"${entry.case.title.replace(/"/g, '""')}"`,
        `"${assignedName}"`,
        `"${userName}"`,
        entry.billable ? 'Ja' : 'Nej',
        entry.hourlyRate?.toString() || '',
        entry.amount?.toString() || ''
      ].join(',')
    })

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tidrapport_${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error) {
    console.error("Failed to export time entries:", error)
    return NextResponse.json(
      { error: "Failed to export time entries" },
      { status: 500 }
    )
  }
}
