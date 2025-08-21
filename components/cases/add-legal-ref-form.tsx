
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddLegalRefFormProps {
  caseId: string
}

export function AddLegalRefForm({ caseId }: AddLegalRefFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "statute",
    title: "",
    citation: "",
    url: "",
    summary: "",
    relevance: ""
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.citation.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/legal-references`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title.trim(),
          citation: formData.citation.trim(),
          url: formData.url.trim() || null,
          summary: formData.summary.trim() || null,
          relevance: formData.relevance.trim() || null
        })
      })

      if (response.ok) {
        setFormData({
          type: "statute",
          title: "",
          citation: "",
          url: "",
          summary: "",
          relevance: ""
        })
        setOpen(false)
        router.refresh()
        toast.success("Legal reference added successfully")
      } else {
        throw new Error('Failed to add legal reference')
      }
    } catch (error) {
      toast.error("Failed to add legal reference")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Scale className="w-4 h-4 mr-2" />
          Add Legal Reference
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Legal Reference</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statute">Statute</SelectItem>
                  <SelectItem value="case_law">Case Law</SelectItem>
                  <SelectItem value="regulation">Regulation</SelectItem>
                  <SelectItem value="article">Legal Article</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Smith v. Johnson"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="citation">Citation</Label>
            <Input
              id="citation"
              placeholder="e.g., 123 F.3d 456 (9th Cir. 2023)"
              value={formData.citation}
              onChange={(e) => setFormData(prev => ({ ...prev, citation: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="url">URL (Optional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Brief summary of the legal principle or holding..."
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="relevance">Relevance to Case</Label>
            <Textarea
              id="relevance"
              placeholder="How does this reference apply to our case?..."
              value={formData.relevance}
              onChange={(e) => setFormData(prev => ({ ...prev, relevance: e.target.value }))}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim() || !formData.citation.trim()}>
              Add Reference
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
