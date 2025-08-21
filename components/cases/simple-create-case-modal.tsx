
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CasePriority } from "@prisma/client"
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
import { FileText, Loader2 } from "lucide-react"

interface SimpleCreateCaseModalProps {
  isOpen: boolean
  onClose: () => void
  onCaseCreated: (newCase: any) => void
}

export function SimpleCreateCaseModal({ isOpen, onClose, onCaseCreated }: SimpleCreateCaseModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: CasePriority.MEDIUM,
    clientName: "",
    clientEmail: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: CasePriority.MEDIUM,
      clientName: "",
      clientEmail: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title?.trim()) {
      toast({
        title: "Fel",
        description: "Titel är obligatorisk",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        priority: formData.priority,
        clientName: formData.clientName?.trim() || null,
        clientEmail: formData.clientEmail?.trim() || null,
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
          title: "Framgång",
          description: "Case skapades framgångsrikt",
        })
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: "Fel",
          description: error.error || "Misslyckades med att skapa case",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Case creation error:", error)
      toast({
        title: "Fel",
        description: "Något gick fel. Försök igen.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Skapa Nytt Case
          </DialogTitle>
          <DialogDescription>
            Fyll i grundläggande information för det nya caset
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Case-titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ange case-titel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Beskriv ärendet..."
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
                placeholder="Klientens namn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Klient-epost</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleChange("clientEmail", e.target.value)}
                placeholder="klient@exempel.se"
              />
            </div>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Skapar...
                </>
              ) : (
                "Skapa Case"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
