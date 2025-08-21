
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CaseDetailView } from "@/components/cases/case-detail-view"

interface CasePageProps {
  params: {
    id: string
  }
}

export default async function CasePage({ params }: CasePageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  const caseData = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: true,
      createdBy: true,
      files: {
        include: {
          uploadedBy: true
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      },
      milestones: {
        include: {
          completedBy: true,
          assignedTo: true
        },
        orderBy: {
          order: 'asc'
        }
      },
      comments: {
        include: {
          author: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      timeEntries: {
        include: {
          user: true
        },
        orderBy: {
          date: 'desc'
        }
      },
      legalRefs: {
        include: {
          addedBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      legalStatutes: {
        include: {
          addedBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      activities: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      workflowSteps: {
        include: {
          assignedTo: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!caseData) {
    notFound()
  }

  // Get all active users for workflow step assignment
  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true
    },
    orderBy: { name: 'asc' }
  })

  return (
    <DashboardLayout>
      <CaseDetailView caseData={caseData} currentUser={session.user} users={users} />
    </DashboardLayout>
  )
}
