
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().default(false)
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
    const data = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        isInternal: data.isInternal,
        caseId: params.id,
        authorId: session.user.id
      }
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'comment_added',
        description: `Added a ${data.isInternal ? 'internal' : 'public'} comment`,
        userId: session.user.id,
        caseId: params.id
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
