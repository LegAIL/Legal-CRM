

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, stepId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the step before deleting for logging
    const step = await prisma.workflowStep.findUnique({
      where: { id: params.stepId, caseId: params.id }
    })

    if (!step) {
      return NextResponse.json({ error: "Workflow step not found" }, { status: 404 })
    }

    await prisma.workflowStep.delete({
      where: { id: params.stepId, caseId: params.id }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "workflow_step_deleted",
        description: `Workflow step "${step.title}" deleted`,
        userId: session.user.id,
        caseId: params.id,
        metadata: {
          stepTitle: step.title
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting workflow step:", error)
    return NextResponse.json(
      { error: "Failed to delete workflow step" },
      { status: 500 }
    )
  }
}

