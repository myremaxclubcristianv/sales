import React from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { CalendarView } from './CalendarView'
import { getMasterCalendarEvents } from '@/lib/db/calendar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Master Calendar | CRM Platform',
  description: 'Centralized CRM Calendar with Birthdays, Follow-ups, Viewings, and Policy Expirations',
}

export default async function CalendarPage() {
  const { events, upcoming } = await getMasterCalendarEvents()

  return (
    <PrivateLayout>
      <CalendarView initialEvents={events} initialUpcoming={upcoming} />
    </PrivateLayout>
  )
}
