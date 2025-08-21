
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Trash2, 
  FileText, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio,
  Sheet,
  FileCheck,
  FileX,
  FileSignature,
  Scale,
  Building,
  Users,
  Mail,
  Banknote,
  Clock,
  Shield
} from "lucide-react"

interface DocumentType {
  id: string
  name: string
  description: string
  icon: string
  required: boolean
  category: string
  template?: string
}

interface DocumentTypesSelectorProps {
  documentTypes: DocumentType[]
  onChange: (documentTypes: DocumentType[]) => void
}

const AVAILABLE_ICONS = [
  { name: "FileText", icon: FileText, label: "Dokument" },
  { name: "File", icon: File, label: "Fil" },
  { name: "FileImage", icon: FileImage, label: "Bild" },
  { name: "FileVideo", icon: FileVideo, label: "Video" },
  { name: "FileAudio", icon: FileAudio, label: "Audio" },
  { name: "Sheet", icon: Sheet, label: "Kalkylblad" },
  { name: "FileCheck", icon: FileCheck, label: "Godkänt dokument" },
  { name: "FileX", icon: FileX, label: "Avvisat dokument" },
  { name: "FileSignature", icon: FileSignature, label: "Kontrakt" },
  { name: "Scale", icon: Scale, label: "Juridiskt dokument" },
  { name: "Building", icon: Building, label: "Fastighet" },
  { name: "Users", icon: Users, label: "Personal" },
  { name: "Mail", icon: Mail, label: "Korrespondens" },
  { name: "Banknote", icon: Banknote, label: "Finansiellt" },
  { name: "Clock", icon: Clock, label: "Tidskänsligt" },
  { name: "Shield", icon: Shield, label: "Konfidentiellt" }
]

const CATEGORIES = [
  "Juridiska dokument",
  "Finansiella dokument", 
  "Korrespondens",
  "Bevis",
  "Kontrakt",
  "Fastighetshandlingar",
  "Personalhandlingar",
  "Övrigt"
]

export function DocumentTypesSelector({ documentTypes, onChange }: DocumentTypesSelectorProps) {
  const [newDocType, setNewDocType] = useState<Partial<DocumentType>>({
    name: "",
    description: "",
    icon: "FileText",
    required: false,
    category: "Juridiska dokument",
    template: ""
  })

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addDocumentType = () => {
    if (!newDocType.name) return

    const docType: DocumentType = {
      id: generateId(),
      name: newDocType.name,
      description: newDocType.description || "",
      icon: newDocType.icon || "FileText",
      required: newDocType.required || false,
      category: newDocType.category || "Juridiska dokument",
      template: newDocType.template
    }

    onChange([...documentTypes, docType])
    setNewDocType({
      name: "",
      description: "",
      icon: "FileText",
      required: false,
      category: "Juridiska dokument",
      template: ""
    })
  }

  const removeDocumentType = (docId: string) => {
    onChange(documentTypes.filter(doc => doc.id !== docId))
  }

  const toggleRequired = (docId: string) => {
    onChange(documentTypes.map(doc => 
      doc.id === docId ? { ...doc, required: !doc.required } : doc
    ))
  }

  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName)
    return iconData?.icon || FileText
  }

  const groupedDocTypes = documentTypes.reduce((acc, docType) => {
    const category = docType.category || "Övrigt"
    if (!acc[category]) acc[category] = []
    acc[category].push(docType)
    return acc
  }, {} as Record<string, DocumentType[]>)

  return (
    <div className="space-y-6">
      {/* Document Types Overview */}
      {documentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Dokumenttyper Översikt ({documentTypes.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedDocTypes).map(([category, docs]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {category} ({docs.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {docs.map((docType) => {
                      const IconComponent = getIconComponent(docType.icon)
                      return (
                        <div
                          key={docType.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm truncate">{docType.name}</p>
                              {docType.required && (
                                <Badge variant="destructive" className="text-xs">Krävs</Badge>
                              )}
                            </div>
                            {docType.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {docType.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDocumentType(docType.id)}
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Document Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Lägg till Dokumenttyp</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="docName">Dokumentnamn *</Label>
              <Input
                id="docName"
                value={newDocType.name}
                onChange={(e) => setNewDocType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="t.ex. Fullmakt, Vittnesförhör"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docCategory">Kategori</Label>
              <Select
                value={newDocType.category}
                onValueChange={(value) => setNewDocType(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docDescription">Beskrivning</Label>
            <Textarea
              id="docDescription"
              value={newDocType.description}
              onChange={(e) => setNewDocType(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Vad är detta dokument för och varför behövs det..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Ikon</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVAILABLE_ICONS.map((iconData) => {
                const IconComponent = iconData.icon
                const isSelected = newDocType.icon === iconData.name
                return (
                  <Button
                    key={iconData.name}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setNewDocType(prev => ({ ...prev, icon: iconData.name }))}
                    className="h-10 w-10 p-0"
                    title={iconData.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docTemplate">Mall/Checklista (valfritt)</Label>
            <Textarea
              id="docTemplate"
              value={newDocType.template}
              onChange={(e) => setNewDocType(prev => ({ ...prev, template: e.target.value }))}
              placeholder="t.ex. - Kontrollera att fullmakten är undertecknad&#10;- Bifoga kopia av ID&#10;- Säkerställ att datumet är korrekt"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="docRequired"
              checked={newDocType.required}
              onCheckedChange={(checked) => 
                setNewDocType(prev => ({ ...prev, required: !!checked }))
              }
            />
            <Label htmlFor="docRequired" className="text-sm font-normal">
              Detta dokument är obligatoriskt för ärendet
            </Label>
          </div>

          <Button 
            onClick={addDocumentType} 
            disabled={!newDocType.name}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Lägg till Dokumenttyp
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {documentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Snabbåtgärder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedTypes = documentTypes.map(doc => ({ ...doc, required: true }))
                  onChange(updatedTypes)
                }}
              >
                Markera alla som obligatoriska
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedTypes = documentTypes.map(doc => ({ ...doc, required: false }))
                  onChange(updatedTypes)
                }}
              >
                Ta bort obligatoriska krav
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
