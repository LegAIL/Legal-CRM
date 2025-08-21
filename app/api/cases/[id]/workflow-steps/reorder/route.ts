

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stepIds } = await request.json()

    if (!Array.isArray(stepIds)) {
      return NextResponse.json({ error: "stepIds must be an array" }, { status: 400 })
    }

    // Update the order of each step
    await prisma.$transaction(
      stepIds.map((stepId: string, index: number) =>
        prisma.workflowStep.update({
          where: { id: stepId, caseId: params.id },
          data: { order: index + 1 }
        })
      )
    )

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "workflow_reordered",
        description: "Workflow steps reordered",
        userId: session.user.id,
        caseId: params.id,
        metadata: {
          stepCount: stepIds.length
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering workflow steps:", error)
    return NextResponse.json(
      { error: "Failed to reorder workflow steps" },
      { status: 500 }
    )
  }
}

