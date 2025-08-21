
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Timer, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddTimeEntryFormProps {
  caseId: string
}

export function AddTimeEntryForm({ caseId }: AddTimeEntryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    hours: "",
    date: new Date().toISOString().split('T')[0],
    billable: true,
    hourlyRate: ""
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.hours || parseFloat(formData.hours) <= 0) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/time-entries`, {
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
          description: "",
          hours: "",
          date: new Date().toISOString().split('T')[0],
          billable: true,
          hourlyRate: ""
        })
        setOpen(false)
        router.refresh()
        toast.success("Time entry added successfully")
      } else {
        throw new Error('Failed to add time entry')
      }
    } catch (error) {
      toast.error("Failed to add time entry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Timer className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Time Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="hours">Hours</Label>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you work on?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
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
              Billable time
            </Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.hours}>
              Log Time
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
