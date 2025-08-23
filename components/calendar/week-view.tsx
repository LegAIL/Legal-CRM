
"use client"

import { useMemo } from "react"
import { CalendarEvent } from "./calendar-types"
import { CaseEventCard } from "./case-event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  eventsByDate: Record<string, CalendarEvent[]>
  currentDate: Date
  onDateChange: (date: Date) => void
  onDayClick?: (date: Date, events: CalendarEvent[]) => void
}

const WEEKDAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag']

export function WeekView({ 
  eventsByDate, 
  currentDate, 
  onDateChange,
  onDayClick 
}: WeekViewProps) {

  const weekData = useMemo(() => {
    // Get the start of the week (Monday)
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      const dayEvents = eventsByDate[dateKey] || []
      
      days.push({
        date,
        events: dayEvents,
        dateKey
      })
    }

    return {
      days,
      weekStart: startOfWeek,
      weekEnd: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    }
  }, [currentDate, eventsByDate])

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatWeekRange = () => {
    const start = weekData.weekStart.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short' 
    })
    const end = weekData.weekEnd.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })
    return `${start} - ${end}`
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            Vecka: {formatWeekRange()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Denna vecka
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekData.days.map((dayInfo, index) => {
          const hasEvents = dayInfo.events.length > 0

          return (
            <div
              key={dayInfo.dateKey}
              className={cn(
                "border border-border rounded-lg p-4 min-h-[300px] bg-background hover:bg-muted/30 transition-colors",
                isToday(dayInfo.date) && "bg-primary/5 border-primary/20"
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">
                    {WEEKDAYS[index]}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold flex items-center justify-center w-8 h-8 rounded-full",
                      isToday(dayInfo.date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {dayInfo.date.getDate()}
                  </span>
                </div>
                {hasEvents && (
                  <Badge variant="secondary" className="text-xs">
                    {dayInfo.events.length} case{dayInfo.events.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Events */}
              <div className="space-y-2">
                {dayInfo.events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Inga cases denna dag
                    </p>
                  </div>
                ) : (
                  dayInfo.events.map((event) => (
                    <CaseEventCard 
                      key={event.id} 
                      event={event} 
                      compact={false}
                    />
                  ))
                )}
              </div>

              {/* Day click handler */}
              <button
                className="absolute inset-0 w-full h-full opacity-0"
                onClick={() => onDayClick?.(dayInfo.date, dayInfo.events)}
                aria-label={`Select ${dayInfo.date.toLocaleDateString('sv-SE')}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
