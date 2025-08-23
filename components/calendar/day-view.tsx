
"use client"

import { useMemo } from "react"
import { CalendarEvent } from "./calendar-types"
import { CaseEventCard } from "./case-event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DayViewProps {
  eventsByDate: Record<string, CalendarEvent[]>
  currentDate: Date
  onDateChange: (date: Date) => void
  onDayClick?: (date: Date, events: CalendarEvent[]) => void
}

const WEEKDAYS = [
  'Söndag', 'Måndag', 'Tisdag', 'Onsdag', 
  'Torsdag', 'Fredag', 'Lördag'
]

export function DayView({ 
  eventsByDate, 
  currentDate, 
  onDateChange,
  onDayClick 
}: DayViewProps) {

  const dayData = useMemo(() => {
    const dateKey = currentDate.toISOString().split('T')[0]
    const dayEvents = eventsByDate[dateKey] || []
    
    // Sort events by priority and creation time
    const sortedEvents = dayEvents.sort((a, b) => {
      // First by priority
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Then by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return {
      events: sortedEvents,
      dateKey,
      weekday: WEEKDAYS[currentDate.getDay()],
      formattedDate: currentDate.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }, [currentDate, eventsByDate])

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = () => {
    const today = new Date()
    return currentDate.toDateString() === today.toDateString()
  }

  // Group events by status
  const eventsByStatus = useMemo(() => {
    return dayData.events.reduce((acc, event) => {
      if (!acc[event.status]) {
        acc[event.status] = []
      }
      acc[event.status].push(event)
      return acc
    }, {} as Record<string, CalendarEvent[]>)
  }, [dayData.events])

  const statusOrder = ['NEW', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-foreground capitalize">
              {dayData.formattedDate}
            </h2>
            {isToday() && (
              <Badge variant="secondary" className="w-fit mt-1">
                Idag
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Idag
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Totalt cases</p>
              <p className="text-2xl font-bold">{dayData.events.length}</p>
            </div>
          </div>
        </Card>

        {statusOrder.map((status) => {
          const count = eventsByStatus[status]?.length || 0
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {status.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Events by Status */}
      {dayData.events.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Inga cases denna dag
            </h3>
            <p className="text-muted-foreground mb-4">
              Det finns inga planerade cases för {dayData.formattedDate.toLowerCase()}.
            </p>
            <Button
              variant="outline"
              onClick={() => onDayClick?.(currentDate, dayData.events)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Lägg till case
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const events = eventsByStatus[status]
            if (!events || events.length === 0) return null

            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">
                    {status.replace('_', ' ').toLowerCase()}
                  </h3>
                  <Badge variant="secondary">
                    {events.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {events.map((event) => (
                    <CaseEventCard 
                      key={event.id} 
                      event={event} 
                      compact={false}
                      showDate={false}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
