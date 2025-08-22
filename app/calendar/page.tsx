'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: {
    type: 'case' | 'milestone'
    id: string
  }
}

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/calendar-events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        // Dates from JSON need to be converted back to Date objects
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
        setEvents(formattedEvents)
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div style={{ height: '80vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}

export default CalendarPage
