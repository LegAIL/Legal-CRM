
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CasesListClient } from "@/components/cases/cases-list-client"
import { prisma } from "@/lib/db"

export default async function CasesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  // Optimize: Fetch essential data but include required fields for Case model compatibility
  const cases = await prisma.case.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true
        }
      },
      files: {
        select: {
          id: true,
          originalName: true,
          fileSize: true,
          uploadedAt: true
        }
      },
      _count: {
        select: {
          files: true
        }
      }
    }
  })

  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      role: true
    }
  })

  return (
    <DashboardLayout>
      <CasesListClient 
        initialCases={cases} 
        users={users}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />
    </DashboardLayout>
  )
}
