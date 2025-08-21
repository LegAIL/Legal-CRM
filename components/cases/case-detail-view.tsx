
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, FileText, MessageSquare, Scale, Timer, Users, ChevronLeft, Plus, CheckCircle2, Circle, Calendar, DollarSign, FolderOpen, ExternalLink, LinkIcon } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { AddCommentForm } from "./add-comment-form"
import { AddTimeEntryForm } from "./add-time-entry-form"
import { AddMilestoneForm } from "./add-milestone-form"
import { AddLegalRefForm } from "./add-legal-ref-form"
import { WorkflowSteps } from "./workflow-steps"

interface CaseDetailViewProps {
  caseData: any
  currentUser: any
  users?: any[]
}

const statusColors = {
  NEW: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  REVIEW: "bg-purple-500",
  COMPLETED: "bg-green-500"
}

const priorityColors = {
  LOW: "bg-green-600",
  MEDIUM: "bg-yellow-600",
  HIGH: "bg-orange-600",
  URGENT: "bg-red-600"
}

export function CaseDetailView({ caseData, currentUser, users }: CaseDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const totalBillableAmount = caseData.timeEntries
    .filter((entry: any) => entry.billable)
    .reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)

  // Use workflow steps instead of milestones for progress calculation
  const completedWorkflowSteps = (caseData.workflowSteps || []).filter((s: any) => s.completed).length
  const totalWorkflowSteps = (caseData.workflowSteps || []).length
  const workflowProgress = totalWorkflowSteps > 0 ? (completedWorkflowSteps / totalWorkflowSteps) * 100 : 0
  
  // Keep milestone calculations for backward compatibility in overview
  const completedMilestones = (caseData.milestones || []).filter((m: any) => m.completed).length
  const totalMilestones = (caseData.milestones || []).length
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cases">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{caseData.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <Badge className={statusColors[caseData.status as keyof typeof statusColors]}>
                {caseData.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[caseData.priority as keyof typeof priorityColors]}>
                {caseData.priority} Priority
              </Badge>
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {caseData.assignedTo?.name || 'Unassigned'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold law-gold">
              ${totalBillableAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Billable</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{caseData.progress}%</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
                <Progress value={caseData.progress} className="w-16" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{caseData.actualHours.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">Hours Logged</p>
                </div>
                <Timer className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{caseData.files.length}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>Overview</TabsTrigger>
          <TabsTrigger value="milestones" onClick={() => setActiveTab("milestones")}>Workflow</TabsTrigger>
          <TabsTrigger value="documents" onClick={() => setActiveTab("documents")}>Documents</TabsTrigger>
          <TabsTrigger value="time" onClick={() => setActiveTab("time")}>Time Tracking</TabsTrigger>
          <TabsTrigger value="legal" onClick={() => setActiveTab("legal")}>Legal Research</TabsTrigger>
          <TabsTrigger value="activity" onClick={() => setActiveTab("activity")}>Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ärendedetaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Beskrivning
                  </h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-md">
                    {caseData.description || 'Ingen beskrivning tillgänglig'}
                  </p>
                </div>
                
                {caseData.clientName && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Klientinformation
                    </h4>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><span className="font-medium">Namn:</span> {caseData.clientName}</p>
                        {caseData.clientEmail && (
                          <p><span className="font-medium">E-post:</span> 
                            <a href={`mailto:${caseData.clientEmail}`} className="text-blue-600 hover:underline ml-1">
                              {caseData.clientEmail}
                            </a>
                          </p>
                        )}
                      </div>
                      {caseData.clientPhone && (
                        <p><span className="font-medium">Telefon:</span> 
                          <a href={`tel:${caseData.clientPhone}`} className="text-blue-600 hover:underline ml-1">
                            {caseData.clientPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Ärendeinformation
                  </h4>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <p><span className="font-medium">Skapades:</span> {new Date(caseData.createdAt).toLocaleDateString('sv-SE')}</p>
                      <p><span className="font-medium">Skapad av:</span> {caseData.createdBy.name}</p>
                      {caseData.dueDate && (
                        <p><span className="font-medium">Slutdatum:</span> 
                          <span className={`ml-1 ${new Date(caseData.dueDate) < new Date() ? 'text-red-600 font-semibold' : ''}`}>
                            {new Date(caseData.dueDate).toLocaleDateString('sv-SE')}
                          </span>
                        </p>
                      )}
                      <p><span className="font-medium">Ansvarig:</span> {caseData.assignedTo?.name || 'Ej tilldelad'}</p>
                      {caseData.estimatedHours && (
                        <p><span className="font-medium">Uppskattade timmar:</span> {caseData.estimatedHours}h</p>
                      )}
                      {caseData.hourlyRate && (
                        <p><span className="font-medium">Timtariff:</span> ${caseData.hourlyRate.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {caseData.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Taggar</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseData.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Statutes Section */}
                {caseData.legalStatutes && caseData.legalStatutes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Tillämpliga Lagrum
                    </h4>
                    <div className="space-y-3">
                      {caseData.legalStatutes.map((statute: any) => (
                        <Card key={statute.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {statute.priority || 'MEDIUM'}
                              </Badge>
                              <Badge variant={statute.status === 'REVIEWED' ? 'default' : 'secondary'} className="text-xs">
                                {statute.status === 'TO_REVIEW' ? 'Ska granskas' : 
                                 statute.status === 'REVIEWED' ? 'Granskad' : 'Ej tillämplig'}
                              </Badge>
                            </div>
                            {statute.url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={statute.url} target="_blank" rel="noopener noreferrer" className="text-xs">
                                  Visa lagtext
                                </a>
                              </Button>
                            )}
                          </div>
                          <h5 className="font-medium text-sm mb-1">
                            {statute.title}
                            {statute.chapter && ` - ${statute.chapter}`}
                            {statute.section && ` ${statute.section}`}
                          </h5>
                          {statute.description && (
                            <p className="text-xs text-muted-foreground mb-2">{statute.description}</p>
                          )}
                          {statute.notes && (
                            <div className="bg-blue-50 p-2 rounded text-xs">
                              <span className="font-medium">Anteckningar för detta ärende:</span> {statute.notes}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Drive Links Section */}
                {(() => {
                  const driveActivity = caseData.activities?.find((activity: any) => 
                    activity.type === 'drive_links_added' && activity.metadata?.driveLinks
                  )
                  const driveLinks = driveActivity?.metadata?.driveLinks || []
                  
                  return driveLinks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Google Drive & Dokument
                      </h4>
                      <div className="space-y-3">
                        {driveLinks.map((link: any, index: number) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  {link.type === 'folder' ? 
                                    <><FolderOpen className="h-3 w-3" />Mapp</> : 
                                    <><FileText className="h-3 w-3" />Dokument</>
                                  }
                                </Badge>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Öppna
                                </a>
                              </Button>
                            </div>
                            <h5 className="font-medium text-sm mb-1">{link.name}</h5>
                            {link.description && (
                              <p className="text-xs text-muted-foreground">{link.description}</p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Notes Section */}
                {caseData.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Övriga anteckningar</h4>
                    <div className="bg-amber-50 p-3 rounded-md border-l-4 border-amber-400">
                      <p className="text-sm">{caseData.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Workflow & Framsteg
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.workflowSteps && caseData.workflowSteps.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {completedWorkflowSteps} av {totalWorkflowSteps} steg slutförda
                      </span>
                      <Progress value={workflowProgress} className="w-24" />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {caseData.workflowSteps.slice(0, 5).map((step: any, index: number) => (
                        <div key={step.id} className="flex items-start gap-3 p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/cases/${caseData.id}/workflow-steps/${step.id}/toggle`, {
                                    method: 'POST'
                                  })
                                  if (response.ok) {
                                    window.location.reload()
                                  }
                                } catch (error) {
                                  console.error('Failed to toggle step:', error)
                                }
                              }}
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                step.completed 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-border hover:bg-border/80'
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              ) : (
                                <Circle className="w-3 h-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className={`text-sm font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {step.title}
                            </h5>
                            {step.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              {step.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(step.dueDate).toLocaleDateString('sv-SE')}
                                </span>
                              )}
                              {step.estimatedHours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {step.estimatedHours}h
                                </span>
                              )}
                              {step.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {step.assignedTo.name || `${step.assignedTo.firstName} ${step.assignedTo.lastName}`.trim()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {caseData.workflowSteps.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("milestones")}>
                          Se alla {caseData.workflowSteps.length} steg
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Inga workflow-steg definierade ännu</p>
                    <p className="text-sm">Lägg till workflow-steg för att spåra framstegen</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Case Chat
                  </div>
                  <AddCommentForm caseId={caseData.id} />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {caseData.comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p>Ingen diskussion ännu</p>
                        <p className="text-sm">Starta konversationen om detta ärende</p>
                      </div>
                    ) : (
                      caseData.comments.map((comment: any) => {
                        const isCurrentUser = comment.author.id === currentUser.id
                        return (
                          <div key={comment.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarImage src={comment.author.image || ''} />
                              <AvatarFallback className="text-xs">
                                {comment.author.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex-1 max-w-[75%] ${isCurrentUser ? 'items-end' : ''}`}>
                              <div className={`rounded-lg p-3 ${
                                isCurrentUser 
                                  ? 'bg-primary text-primary-foreground ml-auto' 
                                  : 'bg-muted'
                              }`}>
                                <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                                  <span className="font-medium text-xs">
                                    {isCurrentUser ? 'Du' : comment.author.name}
                                  </span>
                                  <span className={`text-xs ${
                                    isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                  {comment.isInternal && (
                                    <Badge variant={isCurrentUser ? "outline" : "secondary"} className="text-xs">
                                      Internt
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <WorkflowSteps 
            caseId={caseData.id}
            steps={caseData.workflowSteps || []}
            users={users}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Case Documents</h2>
              <p className="text-muted-foreground">All files and documents related to this case</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.files.map((file: any) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-10 h-10 text-blue-500" />
                    <Badge variant="secondary" className="text-xs">
                      {file.mimeType.split('/')[1]?.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2 truncate" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {(file.fileSize / 1024).toFixed(1)} KB</p>
                    <p>Uploaded by: {file.uploadedBy.name}</p>
                    <p>Date: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <Button className="w-full mt-3" variant="outline" size="sm" asChild>
                    <a href={`/api/files/${file.fileName}`} download>
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {caseData.files.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload files from the main cases page</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Time Tracking</h2>
              <p className="text-muted-foreground">Log hours worked on this case</p>
            </div>
            <AddTimeEntryForm caseId={caseData.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{caseData.actualHours.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                  <Timer className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold law-gold">${totalBillableAmount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Billable Amount</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{caseData.timeEntries.length}</p>
                    <p className="text-sm text-muted-foreground">Time Entries</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Description</th>
                      <th className="p-4 font-semibold">Hours</th>
                      <th className="p-4 font-semibold">Rate</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Billable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.timeEntries.map((entry: any) => (
                      <tr key={entry.id} className="border-b">
                        <td className="p-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-4">{entry.user.name}</td>
                        <td className="p-4">{entry.description || '-'}</td>
                        <td className="p-4">{entry.hours}h</td>
                        <td className="p-4">${entry.hourlyRate || '-'}</td>
                        <td className="p-4">${entry.amount || '-'}</td>
                        <td className="p-4">
                          <Badge variant={entry.billable ? "default" : "secondary"}>
                            {entry.billable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {caseData.timeEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No time entries recorded yet</p>
                    <p className="text-sm">Start tracking time to monitor case profitability</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Legal Research & References</h2>
              <p className="text-muted-foreground">Relevant statutes, case law, and legal resources</p>
            </div>
            <AddLegalRefForm caseId={caseData.id} />
          </div>

          <div className="space-y-4">
            {caseData.legalRefs.map((ref: any) => (
              <Card key={ref.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {ref.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <h3 className="text-lg font-semibold">{ref.title}</h3>
                      <p className="text-sm text-muted-foreground">{ref.citation}</p>
                    </div>
                    {ref.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer">
                          View Source
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  {ref.summary && (
                    <div className="mb-3">
                      <h4 className="font-medium mb-1">Summary</h4>
                      <p className="text-sm text-muted-foreground">{ref.summary}</p>
                    </div>
                  )}
                  
                  {ref.relevance && (
                    <div className="mb-3">
                      <h4 className="font-medium mb-1">Relevance to Case</h4>
                      <p className="text-sm text-muted-foreground">{ref.relevance}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Added by {ref.addedBy.name} on {new Date(ref.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {caseData.legalRefs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No legal references added yet</p>
                <p className="text-sm">Add relevant statutes and case law to support your case</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Case Activity Log</h2>
            <p className="text-muted-foreground">Complete history of all case actions</p>
          </div>

          <div className="space-y-4">
            {caseData.activities.map((activity: any) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user?.image || ''} />
                        <AvatarFallback>
                          {activity.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'SY'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          by {activity.user?.name || 'System'} • {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {caseData.activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activities recorded yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
