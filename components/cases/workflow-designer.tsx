
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ArrowRight, Clock, User, Target } from "lucide-react"

interface WorkflowStep {
  id: string
  title: string
  description: string
  assignedToId?: string
  estimatedHours?: number
  dueDate?: string
  dependencies: string[]
}

interface WorkflowDesignerProps {
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
  users: Array<{
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
  }>
}

export function WorkflowDesigner({ steps, onChange, users }: WorkflowDesignerProps) {
  const [currentStep, setCurrentStep] = useState<Partial<WorkflowStep>>({
    title: "",
    description: "",
    assignedToId: "",
    estimatedHours: undefined,
    dueDate: "",
    dependencies: []
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addStep = () => {
    if (!currentStep.title) return

    const newStep: WorkflowStep = {
      id: generateId(),
      title: currentStep.title,
      description: currentStep.description || "",
      assignedToId: currentStep.assignedToId,
      estimatedHours: currentStep.estimatedHours,
      dueDate: currentStep.dueDate,
      dependencies: currentStep.dependencies || []
    }

    onChange([...steps, newStep])
    setCurrentStep({
      title: "",
      description: "",
      assignedToId: "",
      estimatedHours: undefined,
      dueDate: "",
      dependencies: []
    })
  }

  const removeStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId)
    // Remove dependencies that reference the deleted step
    const cleanedSteps = updatedSteps.map(step => ({
      ...step,
      dependencies: step.dependencies.filter(depId => depId !== stepId)
    }))
    onChange(cleanedSteps)
  }

  const updateStepDependencies = (stepId: string, dependencies: string[]) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, dependencies } : step
    )
    onChange(updatedSteps)
  }

  const getUserDisplayName = (user: any) => {
    return user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown'
  }

  const getStepPosition = (stepIndex: number) => {
    const totalSteps = steps.length
    if (totalSteps <= 1) return { x: 50, y: 50 }
    
    // Create a circular layout for visual appeal
    const angle = (stepIndex / totalSteps) * 2 * Math.PI - Math.PI / 2
    const radius = Math.min(30, totalSteps * 8)
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) }
  }

  return (
    <div className="space-y-6">
      {/* Workflow Visualization */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Workflow Oversikt</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted/30 rounded-lg p-6" style={{ minHeight: '300px' }}>
              {/* Workflow Steps */}
              {steps.map((step, index) => {
                const position = getStepPosition(index)
                const assignedUser = users.find(u => u.id === step.assignedToId)
                
                return (
                  <div
                    key={step.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  >
                    <div className="bg-background border-2 border-primary/20 rounded-lg p-3 shadow-sm min-w-[200px] max-w-[250px]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm truncate flex-1">{step.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStep(step.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {step.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {step.description}
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        {assignedUser && (
                          <div className="flex items-center space-x-1 text-xs">
                            <User className="h-3 w-3" />
                            <span className="truncate">{getUserDisplayName(assignedUser)}</span>
                          </div>
                        )}
                        
                        {step.estimatedHours && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{step.estimatedHours}h</span>
                          </div>
                        )}
                        
                        {step.dependencies.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs">
                            <ArrowRight className="h-3 w-3" />
                            <span>{step.dependencies.length} dependencies</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Dependency Lines */}
                    {step.dependencies.map(depId => {
                      const depIndex = steps.findIndex(s => s.id === depId)
                      if (depIndex === -1) return null
                      
                      const depPosition = getStepPosition(depIndex)
                      return (
                        <svg
                          key={depId}
                          className="absolute inset-0 pointer-events-none"
                          style={{ 
                            left: `${Math.min(position.x, depPosition.x)}%`,
                            top: `${Math.min(position.y, depPosition.y)}%`,
                            width: `${Math.abs(position.x - depPosition.x)}%`,
                            height: `${Math.abs(position.y - depPosition.y)}%`
                          }}
                        >
                          <line
                            x1={position.x > depPosition.x ? "100%" : "0%"}
                            y1={position.y > depPosition.y ? "100%" : "0%"}
                            x2={position.x > depPosition.x ? "0%" : "100%"}
                            y2={position.y > depPosition.y ? "0%" : "100%"}
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.5"
                          />
                        </svg>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Step Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Lägg till Workflow-steg</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stepTitle">Steg Titel *</Label>
              <Input
                id="stepTitle"
                value={currentStep.title}
                onChange={(e) => setCurrentStep(prev => ({ ...prev, title: e.target.value }))}
                placeholder="t.ex. Samla bevis, Skicka kallelse"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stepAssignee">Tilldela till</Label>
              <Select
                value={currentStep.assignedToId || "unassigned"}
                onValueChange={(value) => 
                  setCurrentStep(prev => ({ 
                    ...prev, 
                    assignedToId: value === "unassigned" ? "" : value 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Otilldelad</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepDescription">Beskrivning</Label>
            <Textarea
              id="stepDescription"
              value={currentStep.description}
              onChange={(e) => setCurrentStep(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detaljerad beskrivning av vad som ska göras..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Beräknade Timmar</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={currentStep.estimatedHours || ""}
                onChange={(e) => setCurrentStep(prev => ({ 
                  ...prev, 
                  estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                placeholder="t.ex. 2.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stepDueDate">Förfallodatum</Label>
              <Input
                id="stepDueDate"
                type="date"
                value={currentStep.dueDate}
                onChange={(e) => setCurrentStep(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          {steps.length > 0 && (
            <div className="space-y-2">
              <Label>Beroenden (Steg som måste slutföras först)</Label>
              <div className="flex flex-wrap gap-2">
                {steps.map((step) => (
                  <Button
                    key={step.id}
                    type="button"
                    size="sm"
                    variant={currentStep.dependencies?.includes(step.id) ? "default" : "outline"}
                    onClick={() => {
                      const deps = currentStep.dependencies || []
                      const newDeps = deps.includes(step.id)
                        ? deps.filter(id => id !== step.id)
                        : [...deps, step.id]
                      setCurrentStep(prev => ({ ...prev, dependencies: newDeps }))
                    }}
                  >
                    {step.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={addStep} 
            disabled={!currentStep.title}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Lägg till Steg
          </Button>
        </CardContent>
      </Card>

      {/* Steps List */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steg ({steps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const assignedUser = users.find(u => u.id === step.assignedToId)
                return (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">{index + 1}</Badge>
                        <h4 className="font-medium">{step.title}</h4>
                      </div>
                      
                      {step.description && (
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {assignedUser && (
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{getUserDisplayName(assignedUser)}</span>
                          </span>
                        )}
                        
                        {step.estimatedHours && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{step.estimatedHours}h</span>
                          </span>
                        )}
                        
                        {step.dependencies.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <ArrowRight className="h-3 w-3" />
                            <span>{step.dependencies.length} dependencies</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStep(step.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
