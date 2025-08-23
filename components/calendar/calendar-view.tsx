
"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarData, CalendarView, CalendarEvent } from "./calendar-types"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns3,
  Square,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CalendarViewProps {
  initialView?: CalendarView
}

export function CalendarView({ initialView = 'month' }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<CalendarView>(initialView)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDateRange = useCallback((date: Date, view: CalendarView) => {
    const start = new Date(date)
    const end = new Date(date)

    switch (view) {
      case 'month':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(end.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        const dayOfWeek = start.getDay()
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        start.setDate(diff)
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'day':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }, [])

  const fetchCalendarData = useCallback(async (date: Date, view: CalendarView) => {
    try {
      setLoading(true)
      setError(null)

      const { start, end } = getDateRange(date, view)
      
      const response = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}&view=${view}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar data: ${response.statusText}`)
      }

      const data: CalendarData = await response.json()
      setCalendarData(data)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load calendar data'
      setError(errorMessage)
      toast.error('Kunde inte ladda kalenderdata', {
        description: errorMessage
      })
      console.error('Calendar fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  // Fetch data when view or date changes
  useEffect(() => {
    fetchCalendarData(currentDate, currentView)
  }, [currentDate, currentView, fetchCalendarData])

  const handleViewChange = useCallback((newView: CalendarView) => {
    setCurrentView(newView)
  }, [])

  const handleDateChange = useCallback((newDate: Date) => {
    setCurrentDate(newDate)
  }, [])

  const handleDayClick = useCallback((date: Date, events: CalendarEvent[]) => {
    // You can implement custom logic here, like opening a modal to create new case
    console.log('Day clicked:', date, events)
    // For now, just show a toast
    toast.info(`Klickade på ${date.toLocaleDateString('sv-SE')}`, {
      description: events.length > 0 
        ? `${events.length} case${events.length !== 1 ? 's' : ''} denna dag`
        : 'Inga cases denna dag'
    })
  }, [])

  const handleRefresh = useCallback(() => {
    fetchCalendarData(currentDate, currentView)
  }, [currentDate, currentView, fetchCalendarData])

  const viewConfig = {
    month: {
      label: 'Månadsvy',
      icon: LayoutGrid,
      description: 'Visa hela månaden'
    },
    week: {
      label: 'Veckovis',
      icon: Columns3,
      description: 'Visa veckan'
    },
    day: {
      label: 'Dagsvy',
      icon: Square,
      description: 'Visa en dag'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="p-4 bg-destructive/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Kunde inte ladda kalendern
          </h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Försök igen
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kalender</h1>
              <p className="text-sm text-muted-foreground">
                Översikt över alla cases med deadlines
              </p>
            </div>
          </div>
          
          {calendarData && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {calendarData.total} case{calendarData.total !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex border border-border rounded-lg p-1 bg-muted/50">
            {Object.entries(viewConfig).map(([view, config]) => {
              const isActive = currentView === view
              const Icon = config.icon
              return (
                <Button
                  key={view}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange(view as CalendarView)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2",
                    isActive && "shadow-sm"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Uppdatera</span>
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      {calendarData && (
        <div className="min-h-96">
          {currentView === 'month' && (
            <MonthView
              eventsByDate={calendarData.eventsByDate}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onDayClick={handleDayClick}
            />
          )}

          {currentView === 'week' && (
            <WeekView
              eventsByDate={calendarData.eventsByDate}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onDayClick={handleDayClick}
            />
          )}

          {currentView === 'day' && (
            <DayView
              eventsByDate={calendarData.eventsByDate}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      )}
    </div>
  )
}
