
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Case {
  id: string
  title: string
  clientName?: string | null
}

interface AddTimeEntryFormProps {
  onSuccess?: () => void
  preselectedCaseId?: string
}

export function AddTimeEntryForm({ onSuccess, preselectedCaseId }: AddTimeEntryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<Case[]>([])
  const [formData, setFormData] = useState({
    caseId: preselectedCaseId || "",
    description: "",
    hours: "",
    date: new Date().toISOString().split('T')[0],
    billable: true,
    hourlyRate: ""
  })
  const router = useRouter()

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases')
        if (response.ok) {
          const data = await response.json()
          setCases(data)
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error)
      }
    }

    if (open) {
      fetchCases()
    }
  }, [open])

  useEffect(() => {
    if (preselectedCaseId) {
      setFormData(prev => ({ ...prev, caseId: preselectedCaseId }))
    }
  }, [preselectedCaseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.hours || parseFloat(formData.hours) <= 0 || !formData.caseId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${formData.caseId}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description.trim(),
          hours: parseFloat(formData.hours),
          date: new Date(formData.date).toISOString(),
          billable: formData.billable,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
        })
      })

      if (response.ok) {
        setFormData({
          caseId: preselectedCaseId || "",
          description: "",
          hours: "",
          date: new Date().toISOString().split('T')[0],
          billable: true,
          hourlyRate: ""
        })
        setOpen(false)
        toast.success("Tidrapport tillagd")
        onSuccess?.()
        if (!preselectedCaseId) {
          router.refresh()
        }
      } else {
        throw new Error('Failed to add time entry')
      }
    } catch (error) {
      toast.error("Misslyckades att lägga till tidrapport")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Logga tid
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Logga arbetstid</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="hours">Timmar</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                placeholder="1.5"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="case">Ärende</Label>
            <Select 
              value={formData.caseId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, caseId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj ärende..." />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.title} {case_.clientName && `(${case_.clientName})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              placeholder="Vad arbetade du med?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="hourlyRate">Timtariff (SEK)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="1500.00"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="billable"
              checked={formData.billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked as boolean }))}
            />
            <Label htmlFor="billable" className="text-sm">
              Debiterbar tid
            </Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading || !formData.hours || !formData.caseId}>
              {loading ? "Loggar..." : "Logga tid"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
