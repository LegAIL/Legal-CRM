
export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  clientName?: string | null
  dueDate: Date | null
  createdAt: Date
  assignedTo?: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
  } | null
  type: 'case'
}

export interface CalendarData {
  events: CalendarEvent[]
  eventsByDate: Record<string, CalendarEvent[]>
  total: number
  view: string
  period: {
    start: string
    end: string
  }
}

export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarProps {
  initialView?: CalendarView
}
