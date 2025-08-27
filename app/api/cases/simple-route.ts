
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cases = await prisma.case.findMany({
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        priority: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error("Failed to fetch cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("--- SIMPLE CASE CREATION API CALLED ---");
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      priority,
      clientName,
      clientEmail,
    } = body

    // Basic validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create the case with only basic data
    const newCase = await prisma.case.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "MEDIUM",
        clientName: clientName?.trim() || null,
        clientEmail: clientEmail?.trim() || null,
        createdById: currentUser.id,
        status: "NEW"
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Create simple activity log
    await prisma.activity.create({
      data: {
        type: "case_created",
        description: `Case "${title}" was created`,
        userId: currentUser.id,
        caseId: newCase.id,
        metadata: {
          priority: String(priority),
          clientName: String(clientName || "")
        }
      }
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Failed to create case:", error)
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    )
  }
}
