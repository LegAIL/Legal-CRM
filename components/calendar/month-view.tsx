
"use client"

import { useState, useMemo } from "react"
import { CalendarEvent } from "./calendar-types"
import { CaseEventCard } from "./case-event-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  eventsByDate: Record<string, CalendarEvent[]>
  currentDate: Date
  onDateChange: (date: Date) => void
  onDayClick?: (date: Date, events: CalendarEvent[]) => void
}

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
]

export function MonthView({ 
  eventsByDate, 
  currentDate, 
  onDateChange,
  onDayClick 
}: MonthViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month and adjust for Monday start (Swedish standard)
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    let startOfWeek = firstDay.getDay() - 1
    if (startOfWeek === -1) startOfWeek = 6 // Sunday becomes 6
    
    const daysInMonth = lastDay.getDate()
    
    // Only show days from current month (no overflow from previous/next month)
    const days: Array<{
      date: Date
      dayNumber: number
      isCurrentMonth: boolean
      events: CalendarEvent[]
      key: string
    }> = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startOfWeek; i++) {
      days.push({
        date: new Date(year, month, 1 - (startOfWeek - i)),
        dayNumber: 0,
        isCurrentMonth: false,
        events: [],
        key: `empty-${i}`
      })
    }

    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = date.toISOString().split('T')[0]
      const dayEvents = eventsByDate[dateKey] || []
      
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        events: dayEvents,
        key: dateKey
      })
    }

    return { days, month, year }
  }, [currentDate, eventsByDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onDateChange(newDate)
  }

  const toggleDateExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDates(newExpanded)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {MONTHS[monthData.month]} {monthData.year}
          </h2>
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
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-3 text-sm font-medium text-center border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {monthData.days.map((dayInfo) => {
            if (!dayInfo.isCurrentMonth) {
              return (
                <div
                  key={dayInfo.key}
                  className="min-h-[120px] p-2 border-r border-b border-border bg-muted/20 last:border-r-0"
                />
              )
            }

            const isExpanded = expandedDates.has(dayInfo.key)
            const hasEvents = dayInfo.events.length > 0
            const visibleEvents = isExpanded ? dayInfo.events : dayInfo.events.slice(0, 2)
            const hiddenCount = dayInfo.events.length - visibleEvents.length

            return (
              <div
                key={dayInfo.key}
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-border bg-background hover:bg-muted/30 transition-colors relative last:border-r-0",
                  isToday(dayInfo.date) && "bg-primary/5 border-primary/20"
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-sm font-medium flex items-center justify-center w-6 h-6 rounded-full",
                      isToday(dayInfo.date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {dayInfo.dayNumber}
                  </span>
                  {hasEvents && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dayInfo.events.length}
                    </Badge>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {visibleEvents.map((event) => (
                    <div key={event.id} onClick={(e) => e.stopPropagation()}>
                      <CaseEventCard event={event} compact={true} />
                    </div>
                  ))}

                  {/* Show more/less button */}
                  {dayInfo.events.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-xs px-1 py-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleDateExpansion(dayInfo.key)
                      }}
                    >
                      {isExpanded ? (
                        "Visa mindre"
                      ) : (
                        <>
                          +{hiddenCount} till
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Day click handler for adding events */}
                <button
                  className="absolute inset-0 w-full h-full"
                  onClick={() => onDayClick?.(dayInfo.date, dayInfo.events)}
                  aria-label={`Select ${dayInfo.date.toLocaleDateString('sv-SE')}`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
