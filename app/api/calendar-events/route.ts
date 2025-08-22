
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      where: { dueDate: { not: null } },
      select: { id: true, title: true, dueDate: true },
    })

    const milestones = await prisma.milestone.findMany({
      where: { dueDate: { not: null } },
      select: { id: true, title: true, dueDate: true, case: { select: { title: true } } },
    })

    const caseEvents = cases.map((c) => ({
      title: `Ärende: ${c.title}`,
      start: c.dueDate,
      end: c.dueDate,
      allDay: true,
      resource: { type: 'case', id: c.id },
    }))

    const milestoneEvents = milestones.map((m) => ({
      title: `Milstolpe: ${m.title} (${m.case.title})`,
      start: m.dueDate,
      end: m.dueDate,
      allDay: true,
      resource: { type: 'milestone', id: m.id },
    }))

    const events = [...caseEvents, ...milestoneEvents]

    return NextResponse.json(events)
  } catch (error) {
    console.error('[CALENDAR_EVENTS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
