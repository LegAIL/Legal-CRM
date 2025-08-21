

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

    const { title, description, assignedToId, estimatedHours, dueDate } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Get the highest order for this case to append new step at the end
    const maxOrder = await prisma.workflowStep.aggregate({
      where: { caseId: params.id },
      _max: { order: true }
    })

    const newOrder = (maxOrder._max.order || 0) + 1

    const workflowStep = await prisma.workflowStep.create({
      data: {
        title,
        description,
        order: newOrder,
        assignedToId,
        estimatedHours,
        dueDate: dueDate ? new Date(dueDate) : null,
        dependencies: [],
        caseId: params.id
      },
      include: {
        assignedTo: true
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "workflow_step_created",
        description: `Workflow step "${title}" added`,
        userId: session.user.id,
        caseId: params.id,
        metadata: {
          stepId: workflowStep.id,
          stepTitle: title
        }
      }
    })

    return NextResponse.json(workflowStep)
  } catch (error) {
    console.error("Error creating workflow step:", error)
    return NextResponse.json(
      { error: "Failed to create workflow step" },
      { status: 500 }
    )
  }
}

