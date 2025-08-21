
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.milestoneId }
    })

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: params.milestoneId },
      data: {
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date() : null,
        completedById: !milestone.completed ? session.user.id : null
      }
    })

    // Update case progress based on completed milestones
    const allMilestones = await prisma.milestone.findMany({
      where: { caseId: params.id }
    })
    
    const completedCount = allMilestones.filter((m: any) => m.completed).length
    const progress = allMilestones.length > 0 ? Math.round((completedCount / allMilestones.length) * 100) : 0

    await prisma.case.update({
      where: { id: params.id },
      data: { progress }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: milestone.completed ? 'milestone_uncompleted' : 'milestone_completed',
        description: `${milestone.completed ? 'Uncompleted' : 'Completed'} milestone: ${milestone.title}`,
        userId: session.user.id,
        caseId: params.id
      }
    })

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error("Error toggling milestone:", error)
    return NextResponse.json(
      { error: "Failed to toggle milestone" },
      { status: 500 }
    )
  }
}
