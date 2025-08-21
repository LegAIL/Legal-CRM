
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Case, UserRole, CaseStatus, CasePriority } from "@prisma/client"
import {
  Calendar,
  User,
  Scale
} from "lucide-react"

interface CaseWithDetails extends Case {
  assignedTo: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
  } | null
  createdBy: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
  } | null
  files: {
    id: string
    originalName: string
    fileSize: number
    uploadedAt: Date
  }[]
  _count: {
    files: number
  }
}

interface CaseCardProps {
  case: CaseWithDetails
  users: Array<{
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    role: UserRole
  }>
  currentUserId: string
  userRole: UserRole
  onUpdate: (updatedCase: CaseWithDetails) => void
  onDelete: (deletedCaseId: string) => void
}

export function CaseCard({ case: caseItem }: CaseCardProps) {
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      case "IN_PROGRESS":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case "REVIEW":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30"
      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case "LOW":
        return "bg-green-600/10 text-green-400 border-green-600/30"
      case "MEDIUM":
        return "bg-yellow-600/10 text-yellow-400 border-yellow-600/30"
      case "HIGH":
        return "bg-orange-600/10 text-orange-400 border-orange-600/30"
      case "URGENT":
        return "bg-red-600/10 text-red-400 border-red-600/30"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30"
    }
  }

  // Determine case type from priority and status
  const getCaseType = () => {
    if (caseItem.priority === "URGENT") return "Akutärende"
    if (caseItem.tags.some(tag => tag.toLowerCase().includes("brottmål"))) return "Brottmål"
    if (caseItem.tags.some(tag => tag.toLowerCase().includes("tvistemål"))) return "Tvistemål"
    if (caseItem.tags.some(tag => tag.toLowerCase().includes("familjerätt"))) return "Familjerätt"
    if (caseItem.tags.some(tag => tag.toLowerCase().includes("bolag"))) return "Bolagsrätt"
    return "Juridisk rådgivning"
  }

  return (
    <Link href={`/cases/${caseItem.id}`} className="block">
      <Card className="glass card-hover transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] border border-border/50 hover:border-primary/30">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header with title and badges */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {caseItem.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(caseItem.status)} text-xs`}
                  >
                    {caseItem.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${getPriorityColor(caseItem.priority)} text-xs`}
                  >
                    {caseItem.priority}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Compact information grid */}
            <div className="space-y-3">
              {/* Client */}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">Klient:</span>
                  <p className="font-medium text-foreground truncate">
                    {caseItem.clientName || "Ingen klient angiven"}
                  </p>
                </div>
              </div>

              {/* Start date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">Startdatum:</span>
                  <p className="font-medium text-foreground">
                    {format(new Date(caseItem.createdAt), "d MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Case type */}
              <div className="flex items-center gap-3">
                <Scale className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">Ärendetyp:</span>
                  <p className="font-medium text-foreground">
                    {getCaseType()}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Framsteg</span>
                <span className="font-medium text-foreground">{caseItem.progress || 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
