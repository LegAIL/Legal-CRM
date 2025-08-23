
"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CalendarEvent } from "./calendar-types"
import { 
  FileText, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Circle,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CaseEventCardProps {
  event: CalendarEvent
  compact?: boolean
  showDate?: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'NEW':
      return <Circle className="h-3 w-3" />
    case 'IN_PROGRESS':
      return <Play className="h-3 w-3" />
    case 'REVIEW':
      return <Clock className="h-3 w-3" />
    case 'COMPLETED':
      return <CheckCircle className="h-3 w-3" />
    default:
      return <Circle className="h-3 w-3" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    case 'MEDIUM':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'LOW':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'REVIEW':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'COMPLETED':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

export function CaseEventCard({ event, compact = false, showDate = false }: CaseEventCardProps) {
  const assignedToName = event.assignedTo?.name || 
                        `${event.assignedTo?.firstName || ''} ${event.assignedTo?.lastName || ''}`.trim() ||
                        'Unassigned'

  return (
    <Link href={`/cases/${event.id}`}>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer border-l-4",
        getPriorityColor(event.priority).includes('red') && "border-l-red-500",
        getPriorityColor(event.priority).includes('orange') && "border-l-orange-500", 
        getPriorityColor(event.priority).includes('yellow') && "border-l-yellow-500",
        getPriorityColor(event.priority).includes('green') && "border-l-green-500",
        compact ? "p-2" : "p-3"
      )}>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <h4 className={cn(
                "font-medium text-foreground truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {event.title}
              </h4>
            </div>
            {event.priority === 'URGENT' && (
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            )}
          </div>

          {showDate && event.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(event.dueDate).toLocaleDateString('sv-SE')}
            </div>
          )}

          {!compact && event.clientName && (
            <p className="text-sm text-muted-foreground truncate">
              {event.clientName}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn("text-xs px-2 py-1", getStatusColor(event.status))}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(event.status)}
                  {event.status.replace('_', ' ')}
                </span>
              </Badge>
              
              <Badge 
                variant="outline" 
                className={cn("text-xs px-2 py-1", getPriorityColor(event.priority))}
              >
                {event.priority}
              </Badge>
            </div>

            {!compact && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate max-w-20">{assignedToName}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
