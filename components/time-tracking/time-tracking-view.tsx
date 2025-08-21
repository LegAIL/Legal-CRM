
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, Plus, Download, Clock, DollarSign, CalendarDays, FileText } from "lucide-react"
import { AddTimeEntryForm } from "./add-time-entry-form"
import { TimeEntryTable } from "./time-entry-table"
import { formatDistanceToNow, format } from "date-fns"

interface TimeTrackingViewProps {
  currentUser: any
}

interface TimeEntry {
  id: string
  description: string | null
  hours: number
  date: string
  billable: boolean
  hourlyRate: number | null
  amount: number | null
  createdAt: string
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
  }
  case: {
    id: string
    title: string
  }
}

interface TimeStats {
  totalHours: number
  billableHours: number
  totalAmount: number
  entriesThisWeek: number
}

export function TimeTrackingView({ currentUser }: TimeTrackingViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [stats, setStats] = useState<TimeStats>({
    totalHours: 0,
    billableHours: 0,
    totalAmount: 0,
    entriesThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries')
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.entries)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/time-entries/export', {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `tidrapport_${format(new Date(), 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Failed to export:', error)
    } finally {
      setExporting(false)
    }
  }

  const onTimeEntryAdded = () => {
    fetchTimeEntries()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tidrapportering</h1>
          <p className="text-muted-foreground">
            Hantera och följ upp arbetad tid på ärenden
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting || timeEntries.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporterar..." : "Exportera CSV"}
          </Button>
          <AddTimeEntryForm onSuccess={onTimeEntryAdded} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Totala timmar</p>
              </div>
              <Timer className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.billableHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Debiterbara timmar</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold law-gold">${stats.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Totalt belopp</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.entriesThisWeek}</p>
                <p className="text-sm text-muted-foreground">Poster denna vecka</p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tidrapporter
          </CardTitle>
          <CardDescription>
            Översikt av alla loggade arbetstimmar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Laddar tidrapporter...
            </div>
          ) : (
            <TimeEntryTable 
              entries={timeEntries} 
              currentUser={currentUser}
              onRefresh={fetchTimeEntries}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
