

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  GripVertical,
  User,
  Target,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface WorkflowStep {
  id: string
  title: string
  description?: string | null
  order: number
  completed: boolean
  completedAt?: Date | null
  dueDate?: Date | null
  assignedToId?: string | null
  assignedTo?: {
    id: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    email: string
    image?: string | null
  } | null
  dependencies: string[]
  estimatedHours?: number | null
  actualHours: number
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  image?: string | null
}

interface WorkflowStepsProps {
  caseId: string
  steps: WorkflowStep[]
  users?: User[]
  currentUser: any
}

interface SortableStepProps {
  step: WorkflowStep
  index: number
  caseId: string
  onToggle: (stepId: string) => void
  onDelete: (stepId: string) => void
  getUserDisplayName: (user: any) => string
}

function SortableStep({ step, index, caseId, onToggle, onDelete, getUserDisplayName }: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex items-start gap-4 group"
    >
      <div className="flex items-center gap-2">
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{index + 1}</span>
        </div>
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Completion Toggle */}
        <button
          onClick={() => onToggle(step.id)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            step.completed 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-border hover:bg-border/80'
          }`}
        >
          {step.completed ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <Card className={`${step.completed ? 'opacity-75' : ''} hover:shadow-md transition-shadow`}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {step.title}
              </h3>
              
              <div className="flex items-center gap-2">
                {step.completed && step.completedAt && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed {formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}
                  </Badge>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ta bort workflow-steg</AlertDialogTitle>
                      <AlertDialogDescription>
                        Är du säker på att du vill ta bort steget "{step.title}"? Denna åtgärd kan inte ångras.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(step.id)} className="bg-destructive hover:bg-destructive/90">
                        Ta bort
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            {step.description && (
              <p className={`text-sm mb-3 ${step.completed ? 'text-muted-foreground' : ''}`}>
                {step.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {step.assignedTo && (
                <div className="flex items-center gap-1">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={step.assignedTo.image || ''} />
                    <AvatarFallback className="text-xs">
                      {getUserDisplayName(step.assignedTo).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{getUserDisplayName(step.assignedTo)}</span>
                </div>
              )}
              
              {step.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{step.estimatedHours}h estimated</span>
                </div>
              )}
              
              {step.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className={new Date(step.dueDate) < new Date() && !step.completed ? 'text-red-500 font-medium' : ''}>
                    {new Date(step.dueDate).toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AddWorkflowStepDialog({ caseId, users }: { caseId: string, users?: User[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToId: "",
    estimatedHours: "",
    dueDate: ""
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/workflow-steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          assignedToId: formData.assignedToId || null,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        })
      })

      if (response.ok) {
        setFormData({ title: "", description: "", assignedToId: "", estimatedHours: "", dueDate: "" })
        setOpen(false)
        router.refresh()
        toast.success("Workflow step added successfully")
      } else {
        throw new Error("Failed to add workflow step")
      }
    } catch (error) {
      toast.error("Failed to add workflow step")
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = (user: User) => {
    return user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Workflow Step</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Client consultation, File documents"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what needs to be done..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedTo">Assign to</Label>
              <Select
                value={formData.assignedToId || "unassigned"}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  assignedToId: value === "unassigned" ? "" : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedHours">Est. Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                placeholder="2.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? "Adding..." : "Add Step"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function WorkflowSteps({ caseId, steps, users, currentUser }: WorkflowStepsProps) {
  const router = useRouter()
  const [localSteps, setLocalSteps] = useState(steps)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const completedSteps = localSteps.filter(step => step.completed).length
  const totalSteps = localSteps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const getUserDisplayName = (user: any) => {
    return user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown'
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = localSteps.findIndex(step => step.id === active.id)
    const newIndex = localSteps.findIndex(step => step.id === over.id)

    const reorderedSteps = arrayMove(localSteps, oldIndex, newIndex)
    
    // Update local state immediately for better UX
    setLocalSteps(reorderedSteps)

    // Update order in database
    try {
      const response = await fetch(`/api/cases/${caseId}/workflow-steps/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepIds: reorderedSteps.map(step => step.id)
        })
      })

      if (response.ok) {
        router.refresh()
        toast.success("Workflow order updated")
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      // Revert local state on error
      setLocalSteps(steps)
      toast.error("Failed to update workflow order")
    }
  }

  const handleToggleStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/workflow-steps/${stepId}/toggle`, {
        method: "POST"
      })

      if (response.ok) {
        router.refresh()
        toast.success("Step updated")
      } else {
        throw new Error("Failed to toggle step")
      }
    } catch (error) {
      toast.error("Failed to update step")
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/workflow-steps/${stepId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        router.refresh()
        toast.success("Step deleted")
      } else {
        throw new Error("Failed to delete step")
      }
    } catch (error) {
      toast.error("Failed to delete step")
    }
  }

  if (totalSteps === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Case Workflow & Steps</h2>
            <p className="text-muted-foreground">Manage workflow steps and track progress through key legal process stages</p>
          </div>
          <AddWorkflowStepDialog caseId={caseId} users={users} />
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Steps Defined</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Start by adding workflow steps to organize and track the progress of this case.
            </p>
            <AddWorkflowStepDialog caseId={caseId} users={users} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Case Workflow & Steps</h2>
          <p className="text-muted-foreground">Manage workflow steps and track progress through key legal process stages</p>
        </div>
        <AddWorkflowStepDialog caseId={caseId} users={users} />
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Workflow Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} steps completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <Progress value={progressPercentage} className="w-24 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps with Drag and Drop */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Workflow Steps ({totalSteps})
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Drag steps to reorder • Click circles to toggle completion
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {localSteps.map((step, index) => (
                  <SortableStep
                    key={step.id}
                    step={step}
                    index={index}
                    caseId={caseId}
                    onToggle={handleToggleStep}
                    onDelete={handleDeleteStep}
                    getUserDisplayName={getUserDisplayName}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  )
}

