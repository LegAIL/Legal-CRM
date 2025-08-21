
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddCommentFormProps {
  caseId: string
}

export function AddCommentForm({ caseId }: AddCommentFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          isInternal
        })
      })

      if (response.ok) {
        setContent("")
        setIsInternal(false)
        setOpen(false)
        router.refresh()
        toast.success("Comment added successfully")
      } else {
        throw new Error('Failed to add comment')
      }
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Skriv meddelande
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nytt meddelande i Case Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Skriv ditt meddelande..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="internal"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked as boolean)}
            />
            <label htmlFor="internal" className="text-sm text-muted-foreground">
              Internt meddelande (ej synligt för klient)
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? "Skickar..." : "Skicka meddelande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
