
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const legalRefSchema = z.object({
  type: z.string(),
  title: z.string().min(1),
  citation: z.string().min(1),
  url: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  relevance: z.string().optional().nullable()
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
    const data = legalRefSchema.parse(body)

    const legalRef = await prisma.legalReference.create({
      data: {
        type: data.type,
        title: data.title,
        citation: data.citation,
        url: data.url,
        summary: data.summary,
        relevance: data.relevance,
        caseId: params.id,
        ...(session?.user?.id && { addedById: session.user.id })
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'legal_reference_added',
        description: `Added legal reference: ${data.title}`,
        userId: session.user.id,
        caseId: params.id
      }
    })

    return NextResponse.json(legalRef)
  } catch (error) {
    console.error("Error creating legal reference:", error)
    return NextResponse.json(
      { error: "Failed to create legal reference" },
      { status: 500 }
    )
  }
}
