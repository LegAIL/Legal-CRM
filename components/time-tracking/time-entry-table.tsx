
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

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

interface TimeEntryTableProps {
  entries: TimeEntry[]
  currentUser: any
  onRefresh: () => void
}

export function TimeEntryTable({ entries, currentUser, onRefresh }: TimeEntryTableProps) {
  const [sortBy, setSortBy] = useState<'date' | 'hours' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedEntries = entries.sort((a, b) => {
    let aVal: any = a[sortBy]
    let bVal: any = b[sortBy]
    
    if (sortBy === 'date') {
      aVal = new Date(a.date)
      bVal = new Date(b.date)
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleSort = (column: 'date' | 'hours' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getUserName = (user: TimeEntry['user']) => {
    return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Okänd användare'
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Inga tidrapporter registrerade ännu</p>
        <p className="text-sm">Börja logga din arbetstid för att se statistik här</p>
      </div>
    )
  }

  return (
    <div className="data-table rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort('date')}
            >
              Datum {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Ärende</TableHead>
            <TableHead>Beskrivning</TableHead>
            <TableHead 
              className="cursor-pointer hover:text-foreground text-right"
              onClick={() => handleSort('hours')}
            >
              Timmar {sortBy === 'hours' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead 
              className="cursor-pointer hover:text-foreground text-right"
              onClick={() => handleSort('amount')}
            >
              Belopp {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Användare</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry) => (
            <TableRow key={entry.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {format(new Date(entry.date), 'yyyy-MM-dd')}
              </TableCell>
              <TableCell>
                <Link 
                  href={`/cases/${entry.case.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {entry.case.title}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate" title={entry.description || undefined}>
                  {entry.description || <span className="text-muted-foreground italic">Ingen beskrivning</span>}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {entry.hours.toFixed(2)}h
              </TableCell>
              <TableCell>
                <Badge variant={entry.billable ? "default" : "secondary"} className="text-xs">
                  {entry.billable ? (
                    <>
                      <DollarSign className="w-3 h-3 mr-1" />
                      Debiterbar
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Ej debiterbar
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono law-gold">
                {entry.amount ? `${entry.amount.toLocaleString()} SEK` : '-'}
              </TableCell>
              <TableCell className="text-sm">
                {getUserName(entry.user)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/cases/${entry.case.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visa ärende
                      </Link>
                    </DropdownMenuItem>
                    {entry.user.id === currentUser?.id && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Redigera
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Ta bort
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
