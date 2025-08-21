
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { UserRole, CasePriority } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  User, 
  FileText, 
  Plus, 
  X, 
  Calendar, 
  Scale, 
  FolderOpen, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Target,
  FileIcon,
  Trash2,
  LinkIcon
} from "lucide-react"

interface CreateCaseModalProps {
  isOpen: boolean
  onClose: () => void
  onCaseCreated: (newCase: any) => void
  users: Array<{
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    role: UserRole
  }>
  currentUserId: string
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  assignedToId: string
  estimatedHours: number
  order: number
}

interface LegalStatute {
  id: string
  title: string
  chapter: string
  section: string
  description: string
  url: string
  priority: string
  notes: string
}

interface DriveLink {
  id: string
  name: string
  url: string
  type: string
  description: string
}

export function CreateCaseModal({ isOpen, onClose, onCaseCreated, users, currentUserId }: CreateCaseModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [legalStatutes, setLegalStatutes] = useState<LegalStatute[]>([])
  const [driveLinks, setDriveLinks] = useState<DriveLink[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: CasePriority.MEDIUM,
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    assignedToId: "",
    dueDate: "",
    tags: "",
    notes: "",
    estimatedHours: "",
    hourlyRate: "",
  })

  const totalSteps = 4

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Milestone management functions
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: "",
      description: "",
      dueDate: "",
      assignedToId: "",
      estimatedHours: 0,
      order: milestones.length + 1,
    }
    setMilestones([...milestones, newMilestone])
  }

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(milestone =>
      milestone.id === id ? { ...milestone, [field]: value } : milestone
    ))
  }

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== id))
  }

  // Legal statute management functions
  const addLegalStatute = () => {
    const newStatute: LegalStatute = {
      id: Date.now().toString(),
      title: "",
      chapter: "",
      section: "",
      description: "",
      url: "",
      priority: "MEDIUM",
      notes: "",
    }
    setLegalStatutes([...legalStatutes, newStatute])
  }

  const updateLegalStatute = (id: string, field: keyof LegalStatute, value: any) => {
    setLegalStatutes(legalStatutes.map(statute =>
      statute.id === id ? { ...statute, [field]: value } : statute
    ))
  }

  const removeLegalStatute = (id: string) => {
    setLegalStatutes(legalStatutes.filter(statute => statute.id !== id))
  }

  // Google Drive link management functions
  const addDriveLink = () => {
    const newLink: DriveLink = {
      id: Date.now().toString(),
      name: "",
      url: "",
      type: "folder",
      description: "",
    }
    setDriveLinks([...driveLinks, newLink])
  }

  const updateDriveLink = (id: string, field: keyof DriveLink, value: any) => {
    setDriveLinks(driveLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const removeDriveLink = (id: string) => {
    setDriveLinks(driveLinks.filter(link => link.id !== id))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: CasePriority.MEDIUM,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      assignedToId: "",
      dueDate: "",
      tags: "",
      notes: "",
      estimatedHours: "",
      hourlyRate: "",
    })
    setMilestones([])
    setLegalStatutes([])
    setDriveLinks([])
    setCurrentStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assignedToId: formData.assignedToId || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        milestones: milestones.map(m => ({
          ...m,
          dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : null,
          assignedToId: m.assignedToId || null,
        })),
        legalStatutes: legalStatutes,
        driveLinks: driveLinks,
      }

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const newCase = await response.json()
        onCaseCreated(newCase)
        toast({
          title: "Success",
          description: "Case created successfully with all details",
        })
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create case",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserDisplayName = (user: any) => {
    return user.name || `${user.firstName} ${user.lastName}` || user.email
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div
              className={`h-0.5 w-16 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Grundläggande Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Case Titel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ange case-titel"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioritet</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Välj prioritet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Låg</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">Hög</SelectItem>
              <SelectItem value="URGENT">Brådskande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Beskriv ärendet i detalj..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Klientnamn</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => handleChange("clientName", e.target.value)}
            placeholder="Klientens fullständiga namn"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Klient E-post</Label>
          <Input
            id="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleChange("clientEmail", e.target.value)}
            placeholder="klient@exempel.se"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Klient Telefon</Label>
          <Input
            id="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => handleChange("clientPhone", e.target.value)}
            placeholder="+46-70-123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Tilldela till</Label>
          <Select
            value={formData.assignedToId || "unassigned"}
            onValueChange={(value) => 
              handleChange("assignedToId", value === "unassigned" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Välj ansvarig" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Ej tilldelad</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Slutdatum</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Uppskattade timmar</Label>
          <Input
            id="estimatedHours"
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => handleChange("estimatedHours", e.target.value)}
            placeholder="ex. 40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Timtariff (SEK)</Label>
          <Input
            id="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleChange("hourlyRate", e.target.value)}
            placeholder="ex. 1500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Taggar (kommaseparerade)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleChange("tags", e.target.value)}
          placeholder="ex. kontrakt, fusion, rättegång"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Tidslinje & Delmål
        </h3>
        <Button type="button" onClick={addMilestone} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Lägg till delmål
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Inga delmål tillagda ännu</p>
          <p className="text-sm text-gray-500 mt-2">
            Lägg till delmål för att skapa en tydlig tidslinje för ärendet
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <Card key={milestone.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Steg {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                    placeholder="ex. Inledande klientmöte"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slutdatum</Label>
                  <Input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(milestone.id, "dueDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label>Beskrivning av vad som ska göras *</Label>
                <Textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                  placeholder="Detaljerad beskrivning av vad som ska utföras i detta steg..."
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="space-y-2">
                  <Label>Ansvarig person</Label>
                  <Select
                    value={milestone.assignedToId || "unassigned"}
                    onValueChange={(value) => updateMilestone(milestone.id, "assignedToId", value === "unassigned" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj ansvarig" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Ej tilldelad</SelectItem>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {getUserDisplayName(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Uppskattad tid (timmar)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={milestone.estimatedHours}
                    onChange={(e) => updateMilestone(milestone.id, "estimatedHours", parseFloat(e.target.value) || 0)}
                    placeholder="ex. 8"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Tillämpliga Lagrum
        </h3>
        <Button type="button" onClick={addLegalStatute} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Lägg till lagrum
        </Button>
      </div>

      {legalStatutes.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Scale className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Inga lagrum tillagda ännu</p>
          <p className="text-sm text-gray-500 mt-2">
            Lägg till relevanta lagrum och paragrafer för detta ärende
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {legalStatutes.map((statute, index) => (
            <Card key={statute.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline">Lagrum {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLegalStatute(statute.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Lagtitel *</Label>
                  <Input
                    value={statute.title}
                    onChange={(e) => updateLegalStatute(statute.id, "title", e.target.value)}
                    placeholder="ex. Arbetsmiljölagen"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kapitel</Label>
                  <Input
                    value={statute.chapter}
                    onChange={(e) => updateLegalStatute(statute.id, "chapter", e.target.value)}
                    placeholder="ex. Kap 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="space-y-2">
                  <Label>Paragraf/Sektion</Label>
                  <Input
                    value={statute.section}
                    onChange={(e) => updateLegalStatute(statute.id, "section", e.target.value)}
                    placeholder="ex. § 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prioritet</Label>
                  <Select
                    value={statute.priority}
                    onValueChange={(value) => updateLegalStatute(statute.id, "priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Låg</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">Hög</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label>Beskrivning av lagrum</Label>
                <Textarea
                  value={statute.description}
                  onChange={(e) => updateLegalStatute(statute.id, "description", e.target.value)}
                  placeholder="Beskriv vad detta lagrum reglerar..."
                  rows={2}
                />
              </div>

              <div className="mt-3 space-y-2">
                <Label>Länk till lagtext</Label>
                <Input
                  type="url"
                  value={statute.url}
                  onChange={(e) => updateLegalStatute(statute.id, "url", e.target.value)}
                  placeholder="https://lagen.nu/..."
                />
              </div>

              <div className="mt-3 space-y-2">
                <Label>Anteckningar specifika för detta ärende</Label>
                <Textarea
                  value={statute.notes}
                  onChange={(e) => updateLegalStatute(statute.id, "notes", e.target.value)}
                  placeholder="Hur detta lagrum tillämpas i detta specifika ärende..."
                  rows={2}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Google Drive & Dokument
        </h3>
        <Button type="button" onClick={addDriveLink} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Lägg till Drive-länk
        </Button>
      </div>

      {driveLinks.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Inga Google Drive-länkar tillagda ännu</p>
          <p className="text-sm text-gray-500 mt-2">
            Lägg till länkar till Google Drive-mappar och dokument
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {driveLinks.map((link, index) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {link.type === 'folder' ? <FolderOpen className="h-3 w-3" /> : <FileIcon className="h-3 w-3" />}
                    {link.type === 'folder' ? 'Mapp' : 'Dokument'}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDriveLink(link.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Namn *</Label>
                  <Input
                    value={link.name}
                    onChange={(e) => updateDriveLink(link.id, "name", e.target.value)}
                    placeholder="ex. Klientdokument - Case XYZ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select
                    value={link.type}
                    onValueChange={(value) => updateDriveLink(link.id, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="folder">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          Mapp
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4" />
                          Dokument
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label>Google Drive URL *</Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateDriveLink(link.id, "url", e.target.value)}
                    placeholder="https://drive.google.com/..."
                    required
                    className="flex-1"
                  />
                  {link.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Label>Beskrivning</Label>
                <Textarea
                  value={link.description}
                  onChange={(e) => updateDriveLink(link.id, "description", e.target.value)}
                  placeholder="Beskriv vad som finns i denna mapp/dokument..."
                  rows={2}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Separator />
      
      <div className="space-y-2">
        <Label htmlFor="notes">Övriga anteckningar</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Ytterligare instruktioner eller anteckningar för detta ärende..."
          rows={3}
        />
      </div>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Grundläggande Information"
      case 2: return "Tidslinje & Delmål"
      case 3: return "Tillämpliga Lagrum"
      case 4: return "Google Drive & Dokument"
      default: return "Skapa Nytt Ärende"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Skapa Nytt Ärende - {getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Steg {currentStep} av {totalSteps} - Komplett ärendeinformation för att säkerställa att medarbetare vet exakt vad som ska göras
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {renderStepIndicator()}
          
          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Avbryt
              </Button>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Föregående
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Nästa steg
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Skapar ärende...</span>
                    </div>
                  ) : (
                    "Skapa ärende"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
