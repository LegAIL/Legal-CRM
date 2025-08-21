
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const timeEntrySchema = z.object({
  description: z.string().optional(),
  hours: z.number().min(0.25),
  date: z.string(),
  billable: z.boolean().default(true),
  hourlyRate: z.number().optional().nullable()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = timeEntrySchema.parse(body)

    const amount = data.hourlyRate && data.billable ? data.hours * data.hourlyRate : null

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description: data.description,
        hours: data.hours,
        date: new Date(data.date),
        billable: data.billable,
        hourlyRate: data.hourlyRate,
        amount: amount,
        caseId: params.id,
        userId: session.user.id
      }
    })

    // Update case actual hours
    await prisma.case.update({
      where: { id: params.id },
      data: {
        actualHours: {
          increment: data.hours
        }
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'time_logged',
        description: `Logged ${data.hours} hours`,
        userId: session.user.id,
        caseId: params.id,
        metadata: {
          hours: data.hours,
          billable: data.billable,
          amount: amount
        }
      }
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error("Error creating time entry:", error)
    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    )
  }
}
