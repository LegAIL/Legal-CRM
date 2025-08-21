
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Scale, Gavel, ExternalLink, BookOpen, AlertTriangle } from "lucide-react"

interface LegalStatute {
  id: string
  title: string
  chapter?: string
  section?: string
  subsection?: string
  description?: string
  url?: string
  notes?: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  status: "TO_REVIEW" | "REVIEWED" | "NOT_APPLICABLE"
}

interface CourtDecision {
  id: string
  title: string
  court: string
  caseNumber?: string
  date?: string
  summary?: string
  url?: string
  relevance?: string
  precedent: boolean
  outcome?: "FAVORABLE" | "UNFAVORABLE" | "MIXED" | "PENDING"
  notes?: string
}

interface LegalStatutesManagerProps {
  statutes: LegalStatute[]
  courtDecisions: CourtDecision[]
  onStatutesChange: (statutes: LegalStatute[]) => void
  onCourtDecisionsChange: (decisions: CourtDecision[]) => void
}

const PRIORITY_COLORS = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  HIGH: "bg-red-100 text-red-800 border-red-200"
}

const STATUS_COLORS = {
  TO_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
  REVIEWED: "bg-green-100 text-green-800 border-green-200",
  NOT_APPLICABLE: "bg-gray-100 text-gray-800 border-gray-200"
}

const OUTCOME_COLORS = {
  FAVORABLE: "bg-green-100 text-green-800 border-green-200",
  UNFAVORABLE: "bg-red-100 text-red-800 border-red-200",
  MIXED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PENDING: "bg-blue-100 text-blue-800 border-blue-200"
}

export function LegalStatutesManager({ 
  statutes, 
  courtDecisions, 
  onStatutesChange, 
  onCourtDecisionsChange 
}: LegalStatutesManagerProps) {
  const [newStatute, setNewStatute] = useState<Partial<LegalStatute>>({
    title: "",
    chapter: "",
    section: "",
    subsection: "",
    description: "",
    url: "",
    notes: "",
    priority: "MEDIUM",
    status: "TO_REVIEW"
  })

  const [newCourtDecision, setNewCourtDecision] = useState<Partial<CourtDecision>>({
    title: "",
    court: "",
    caseNumber: "",
    date: "",
    summary: "",
    url: "",
    relevance: "",
    precedent: false,
    outcome: undefined,
    notes: ""
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addStatute = () => {
    if (!newStatute.title) return

    const statute: LegalStatute = {
      id: generateId(),
      title: newStatute.title,
      chapter: newStatute.chapter,
      section: newStatute.section,
      subsection: newStatute.subsection,
      description: newStatute.description,
      url: newStatute.url,
      notes: newStatute.notes,
      priority: newStatute.priority || "MEDIUM",
      status: newStatute.status || "TO_REVIEW"
    }

    onStatutesChange([...statutes, statute])
    setNewStatute({
      title: "",
      chapter: "",
      section: "",
      subsection: "",
      description: "",
      url: "",
      notes: "",
      priority: "MEDIUM",
      status: "TO_REVIEW"
    })
  }

  const addCourtDecision = () => {
    if (!newCourtDecision.title) return

    const decision: CourtDecision = {
      id: generateId(),
      title: newCourtDecision.title,
      court: newCourtDecision.court || "",
      caseNumber: newCourtDecision.caseNumber,
      date: newCourtDecision.date,
      summary: newCourtDecision.summary,
      url: newCourtDecision.url,
      relevance: newCourtDecision.relevance,
      precedent: newCourtDecision.precedent || false,
      outcome: newCourtDecision.outcome,
      notes: newCourtDecision.notes
    }

    onCourtDecisionsChange([...courtDecisions, decision])
    setNewCourtDecision({
      title: "",
      court: "",
      caseNumber: "",
      date: "",
      summary: "",
      url: "",
      relevance: "",
      precedent: false,
      outcome: undefined,
      notes: ""
    })
  }

  const removeStatute = (statuteId: string) => {
    onStatutesChange(statutes.filter(s => s.id !== statuteId))
  }

  const removeCourtDecision = (decisionId: string) => {
    onCourtDecisionsChange(courtDecisions.filter(d => d.id !== decisionId))
  }

  const updateStatuteStatus = (statuteId: string, status: LegalStatute["status"]) => {
    onStatutesChange(statutes.map(s => 
      s.id === statuteId ? { ...s, status } : s
    ))
  }

  const formatStatuteCitation = (statute: LegalStatute) => {
    const parts = [
      statute.chapter && `Kap ${statute.chapter}`,
      statute.section && `§ ${statute.section}`,
      statute.subsection && `${statute.subsection} st.`
    ].filter(Boolean)
    
    return parts.length > 0 ? parts.join(' ') : null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="statutes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statutes" className="flex items-center space-x-2">
            <Scale className="h-4 w-4" />
            <span>Lagrum ({statutes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="court-decisions" className="flex items-center space-x-2">
            <Gavel className="h-4 w-4" />
            <span>Domstolsbeslut ({courtDecisions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statutes" className="space-y-4">
          {/* Statutes Overview */}
          {statutes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Lagrum att Granska</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statutes.map((statute) => (
                    <div key={statute.id} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{statute.title}</h4>
                            {formatStatuteCitation(statute) && (
                              <Badge variant="outline" className="text-xs">
                                {formatStatuteCitation(statute)}
                              </Badge>
                            )}
                          </div>
                          
                          {statute.description && (
                            <p className="text-sm text-muted-foreground mb-2">{statute.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`text-xs ${PRIORITY_COLORS[statute.priority]}`}>
                              {statute.priority === "HIGH" ? "Hög Prioritet" : 
                               statute.priority === "MEDIUM" ? "Medium Prioritet" : "Låg Prioritet"}
                            </Badge>
                            
                            <Select
                              value={statute.status}
                              onValueChange={(value) => updateStatuteStatus(statute.id, value as LegalStatute["status"])}
                            >
                              <SelectTrigger className="w-[140px] h-6">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TO_REVIEW">Att granska</SelectItem>
                                <SelectItem value="REVIEWED">Granskad</SelectItem>
                                <SelectItem value="NOT_APPLICABLE">Inte relevant</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {statute.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              📝 {statute.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {statute.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(statute.url, '_blank')}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStatute(statute.id)}
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Statute */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Lägg till Lagrum</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statuteTitle">Titel/Lagstiftning *</Label>
                <Input
                  id="statuteTitle"
                  value={newStatute.title}
                  onChange={(e) => setNewStatute(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="t.ex. Rättegångsbalken, Brottsbalken, Avtalslagen"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statuteChapter">Kapitel</Label>
                  <Input
                    id="statuteChapter"
                    value={newStatute.chapter}
                    onChange={(e) => setNewStatute(prev => ({ ...prev, chapter: e.target.value }))}
                    placeholder="t.ex. 1, 5, 23"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statuteSection">Paragraf</Label>
                  <Input
                    id="statuteSection"
                    value={newStatute.section}
                    onChange={(e) => setNewStatute(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="t.ex. 1, 15, 42"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statuteSubsection">Stycke</Label>
                  <Input
                    id="statuteSubsection"
                    value={newStatute.subsection}
                    onChange={(e) => setNewStatute(prev => ({ ...prev, subsection: e.target.value }))}
                    placeholder="t.ex. 1, 2, 3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statuteDescription">Beskrivning</Label>
                <Textarea
                  id="statuteDescription"
                  value={newStatute.description}
                  onChange={(e) => setNewStatute(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Vad säger lagrum och hur är det relevant för ärendet..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statutePriority">Prioritet</Label>
                  <Select
                    value={newStatute.priority}
                    onValueChange={(value) => setNewStatute(prev => ({ ...prev, priority: value as LegalStatute["priority"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Låg Prioritet</SelectItem>
                      <SelectItem value="MEDIUM">Medium Prioritet</SelectItem>
                      <SelectItem value="HIGH">Hög Prioritet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statuteUrl">Länk till Lagtext</Label>
                  <Input
                    id="statuteUrl"
                    type="url"
                    value={newStatute.url}
                    onChange={(e) => setNewStatute(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://lagen.nu/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statuteNotes">Anteckningar</Label>
                <Textarea
                  id="statuteNotes"
                  value={newStatute.notes}
                  onChange={(e) => setNewStatute(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Specifika anteckningar för detta ärende..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={addStatute} 
                disabled={!newStatute.title}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Lägg till Lagrum
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="court-decisions" className="space-y-4">
          {/* Court Decisions Overview */}
          {courtDecisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gavel className="h-5 w-5" />
                  <span>Domstolsbeslut och Prejudikat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courtDecisions.map((decision) => (
                    <div key={decision.id} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{decision.title}</h4>
                            {decision.precedent && (
                              <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Prejudikat
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <p><strong>{decision.court}</strong></p>
                            {decision.caseNumber && <p>Mål nr: {decision.caseNumber}</p>}
                            {decision.date && <p>Datum: {decision.date}</p>}
                          </div>
                          
                          {decision.summary && (
                            <p className="text-sm mb-2">{decision.summary}</p>
                          )}
                          
                          {decision.relevance && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Relevans:</strong> {decision.relevance}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 mb-2">
                            {decision.outcome && (
                              <Badge className={`text-xs ${OUTCOME_COLORS[decision.outcome]}`}>
                                {decision.outcome === "FAVORABLE" ? "Gynnsam" :
                                 decision.outcome === "UNFAVORABLE" ? "Ogynnsam" :
                                 decision.outcome === "MIXED" ? "Blandad" : "Pågående"}
                              </Badge>
                            )}
                          </div>
                          
                          {decision.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              📝 {decision.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {decision.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(decision.url, '_blank')}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCourtDecision(decision.id)}
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Court Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Lägg till Domstolsbeslut</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionTitle">Titel/Namn på fallet *</Label>
                  <Input
                    id="decisionTitle"
                    value={newCourtDecision.title}
                    onChange={(e) => setNewCourtDecision(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="t.ex. Andersson mot Kommun X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decisionCourt">Domstol</Label>
                  <Input
                    id="decisionCourt"
                    value={newCourtDecision.court}
                    onChange={(e) => setNewCourtDecision(prev => ({ ...prev, court: e.target.value }))}
                    placeholder="t.ex. Högsta domstolen, Hovrätten över Skåne"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionCaseNumber">Målnummer</Label>
                  <Input
                    id="decisionCaseNumber"
                    value={newCourtDecision.caseNumber}
                    onChange={(e) => setNewCourtDecision(prev => ({ ...prev, caseNumber: e.target.value }))}
                    placeholder="t.ex. NJA 2023 s. 123, RH 2023:45"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decisionDate">Datum</Label>
                  <Input
                    id="decisionDate"
                    type="date"
                    value={newCourtDecision.date}
                    onChange={(e) => setNewCourtDecision(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisionSummary">Sammanfattning</Label>
                <Textarea
                  id="decisionSummary"
                  value={newCourtDecision.summary}
                  onChange={(e) => setNewCourtDecision(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Kort sammanfattning av domens innehåll och slutsats..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisionRelevance">Relevans för ärendet</Label>
                <Textarea
                  id="decisionRelevance"
                  value={newCourtDecision.relevance}
                  onChange={(e) => setNewCourtDecision(prev => ({ ...prev, relevance: e.target.value }))}
                  placeholder="Hur detta fall relaterar till ditt ärende..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionOutcome">Utfall</Label>
                  <Select
                    value={newCourtDecision.outcome || "undefined"}
                    onValueChange={(value) => 
                      setNewCourtDecision(prev => ({ 
                        ...prev, 
                        outcome: value === "undefined" ? undefined : value as CourtDecision["outcome"]
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj utfall" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Ej valt</SelectItem>
                      <SelectItem value="FAVORABLE">Gynnsam</SelectItem>
                      <SelectItem value="UNFAVORABLE">Ogynnsam</SelectItem>
                      <SelectItem value="MIXED">Blandad</SelectItem>
                      <SelectItem value="PENDING">Pågående</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decisionUrl">Länk till dom</Label>
                  <Input
                    id="decisionUrl"
                    type="url"
                    value={newCourtDecision.url}
                    onChange={(e) => setNewCourtDecision(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="precedent"
                  checked={newCourtDecision.precedent}
                  onChange={(e) => setNewCourtDecision(prev => ({ ...prev, precedent: e.target.checked }))}
                />
                <Label htmlFor="precedent" className="text-sm font-normal">
                  Detta är ett prejudicerande fall
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisionNotes">Anteckningar</Label>
                <Textarea
                  id="decisionNotes"
                  value={newCourtDecision.notes}
                  onChange={(e) => setNewCourtDecision(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Specifika anteckningar för detta ärende..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={addCourtDecision} 
                disabled={!newCourtDecision.title}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Lägg till Domstolsbeslut
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
