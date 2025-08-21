
"use client"

import { useState, useMemo } from "react"
import { Case, UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { CaseCard } from "@/components/cases/case-card"
import { Plus, Search, Filter } from "lucide-react"

// Optimize: Use the simplified modal component
const SimpleCreateCaseModal = dynamic(
  () => import("@/components/cases/simple-create-case-modal").then(mod => ({ default: mod.SimpleCreateCaseModal })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse">Loading...</div>
  }
)

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

interface CasesListClientProps {
  initialCases: CaseWithDetails[]
  users: Array<{
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    role: UserRole
  }>
  currentUserId: string
  userRole: UserRole
}

export function CasesListClient({ initialCases, users, currentUserId, userRole }: CasesListClientProps) {
  const [cases, setCases] = useState(initialCases)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Optimize: Memoize filtered results to avoid recalculating on every render
  const filteredCases = useMemo(() => {
    return cases?.filter((caseItem) => {
      const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter
      const matchesPriority = priorityFilter === "all" || caseItem.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [cases, searchTerm, statusFilter, priorityFilter])

  const handleCaseCreated = (newCase: CaseWithDetails) => {
    setCases([newCase, ...cases])
  }

  const handleCaseUpdated = (updatedCase: CaseWithDetails) => {
    setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c))
  }

  const handleCaseDeleted = (deletedCaseId: string) => {
    setCases(cases.filter(c => c.id !== deletedCaseId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            Manage and track all your legal cases
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific cases using search and filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases by title, client, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredCases?.map((caseItem) => (
          <CaseCard
            key={caseItem.id}
            case={caseItem}
            users={users}
            currentUserId={currentUserId}
            userRole={userRole}
            onUpdate={handleCaseUpdated}
            onDelete={handleCaseDeleted}
          />
        ))}
        {filteredCases?.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No cases found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <SimpleCreateCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  )
}
