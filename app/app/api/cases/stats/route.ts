
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CaseStatus } from "@prisma/client"

export async function GET() {
  try {
    const [newCases, inProgressCases, reviewCases, completedCases] = await Promise.all([
      prisma.case.count({ where: { status: CaseStatus.NEW } }),
      prisma.case.count({ where: { status: CaseStatus.IN_PROGRESS } }),
      prisma.case.count({ where: { status: CaseStatus.REVIEW } }),
      prisma.case.count({ where: { status: CaseStatus.COMPLETED } }),
    ])

    return NextResponse.json({
      NEW: newCases,
      IN_PROGRESS: inProgressCases,
      REVIEW: reviewCases,
      COMPLETED: completedCases,
    })
  } catch (error) {
    console.error("Failed to fetch case stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch case stats" },
      { status: 500 }
    )
  }
}
