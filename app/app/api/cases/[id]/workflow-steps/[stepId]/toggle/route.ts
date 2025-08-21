

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string, stepId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current step
    const currentStep = await prisma.workflowStep.findUnique({
      where: { id: params.stepId, caseId: params.id }
    })

    if (!currentStep) {
      return NextResponse.json({ error: "Workflow step not found" }, { status: 404 })
    }

    const newCompleted = !currentStep.completed

    // Update the step
    const updatedStep = await prisma.workflowStep.update({
      where: { id: params.stepId, caseId: params.id },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null
      },
      include: {
        assignedTo: true
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: newCompleted ? "workflow_step_completed" : "workflow_step_reopened",
        description: `Workflow step "${currentStep.title}" ${newCompleted ? 'completed' : 'reopened'}`,
        userId: session.user.id,
        caseId: params.id,
        metadata: {
          stepId: params.stepId,
          stepTitle: currentStep.title,
          completed: newCompleted
        }
      }
    })

    // Update case progress if needed
    const allSteps = await prisma.workflowStep.findMany({
      where: { caseId: params.id }
    })
    
    if (allSteps.length > 0) {
      const completedSteps = allSteps.filter(step => step.completed).length
      const progress = Math.round((completedSteps / allSteps.length) * 100)
      
      await prisma.case.update({
        where: { id: params.id },
        data: { progress }
      })
    }

    return NextResponse.json(updatedStep)
  } catch (error) {
    console.error("Error toggling workflow step:", error)
    return NextResponse.json(
      { error: "Failed to toggle workflow step" },
      { status: 500 }
    )
  }
}

