

import { NextResponse } from "next/server"
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

    // Optimized: Get all case stats in a single query using groupBy
    const caseStats = await prisma.case.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    // Convert to the format expected by the frontend
    const stats = caseStats?.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>) || {}

    // Ensure all statuses are present with default values
    const result = {
      NEW: stats.NEW || 0,
      IN_PROGRESS: stats.IN_PROGRESS || 0,
      REVIEW: stats.REVIEW || 0,
      COMPLETED: stats.COMPLETED || 0
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch case stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch case stats" },
      { status: 500 }
    )
  }
}
