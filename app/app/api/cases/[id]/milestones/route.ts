
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const milestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable()
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
    const data = milestoneSchema.parse(body)

    // Get the highest order number
    const lastMilestone = await prisma.milestone.findFirst({
      where: { caseId: params.id },
      orderBy: { order: 'desc' }
    })

    const milestone = await prisma.milestone.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order: (lastMilestone?.order || 0) + 1,
        caseId: params.id
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'milestone_added',
        description: `Added milestone: ${data.title}`,
        userId: session.user.id,
        caseId: params.id
      }
    })

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    )
  }
}
