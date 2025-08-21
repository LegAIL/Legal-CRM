
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

    const cases = await prisma.case.findMany({
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true
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
