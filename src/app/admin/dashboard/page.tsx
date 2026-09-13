import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getClients } from '@/lib/db/clients'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import { getUpcomingBirthdays } from '@/lib/db/personal-events'
import type { Database } from '@/types'

type ClientRow = Database['public']['Tables']['clients']['Row']
type FollowUpRow = Database['public']['Tables']['follow_ups']['Row'] & {
  clients?: { first_name?: string; last_name?: string; phone?: string | null; email?: string | null }
}
type PersonalEventRow = Database['public']['Tables']['personal_events']['Row'] & {
  clients?: { first_name?: string; last_name?: string; phone?: string | null; whatsapp?: string | null; email?: string | null }
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let clients: ClientRow[] = []
  let todayFollowUps: FollowUpRow[] = []
  let overdueFollowUps: FollowUpRow[] = []
  let upcomingBirthdays: PersonalEventRow[] = []

  try {
    const [clientsData, todayData, overdueData, birthdaysData] = await Promise.all([
      getClients().catch(() => []),
      getFollowUpsByView('today').catch(() => []),
      getFollowUpsByView('overdue').catch(() => []),
      getUpcomingBirthdays(30).catch(() => []),
    ])
    clients = (clientsData as ClientRow[]) || []
    todayFollowUps = (todayData as FollowUpRow[]) || []
    overdueFollowUps = (overdueData as FollowUpRow[]) || []
    upcomingBirthdays = (birthdaysData as PersonalEventRow[]) || []
  } catch (err) {
    console.error('Error loading dashboard data:', err)
  }

  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length

  return (
    <PrivateLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Command Operating Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time workspace overview, daily follow-ups, and operational tasks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/clients/new">
              <Button size="sm">+ New Client</Button>
            </Link>
            <Link href="/admin/follow-ups/new">
              <Button size="sm" variant="outline">+ Follow-up</Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clients</span>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{clients.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{activeClients} Active in pipeline</p>
          </Card>

          <Card className="border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Follow-ups</span>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{todayFollowUps.length}</p>
            <Link href="/admin/follow-ups" className="text-xs text-slate-500 hover:text-blue-600 font-medium mt-1 inline-block">
              View schedule →
            </Link>
          </Card>

          <Card className="border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Items</span>
            <p className={`text-2xl sm:text-3xl font-bold mt-2 ${overdueFollowUps.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueFollowUps.length}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {overdueFollowUps.length > 0 ? 'Requires immediate action' : 'Zero overdue items'}
            </p>
          </Card>

          <Card className="border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Birthdays</span>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">{upcomingBirthdays.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Next 30 calendar days</p>
          </Card>
        </div>

        {/* Two-Column Operational Views */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Follow-ups */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today&apos;s Follow-ups</h2>
                <p className="text-xs text-slate-500">Immediate calls, messages, and scheduled touchpoints</p>
              </div>
              <Link href="/admin/follow-ups">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            {todayFollowUps.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-600">No pending follow-ups scheduled for today.</p>
                <p className="text-xs text-slate-400 mt-1">Check upcoming days or create a new contact task.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayFollowUps.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/30 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.clients?.first_name} {item.clients?.last_name}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.priority === 'URGENT' ? 'danger' : 'info'} size="sm">
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Birthdays & Personal Events */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Birthdays &amp; Key Dates</h2>
                <p className="text-xs text-slate-500">Personal touchpoints to maintain client relationships</p>
              </div>
              <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                30-Day Outlook
              </span>
            </div>

            {upcomingBirthdays.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-medium text-slate-600">No client birthdays in the next 30 days.</p>
                <p className="text-xs text-slate-400 mt-1">Birthdays appear automatically when recorded on profiles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBirthdays.slice(0, 6).map((event) => {
                  const eventDate = new Date(event.event_date)
                  const currentYear = new Date().getFullYear()
                  const thisYearBirthday = new Date(currentYear, eventDate.getMonth(), eventDate.getDate())
                  const daysUntil = Math.ceil((thisYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-purple-100 bg-purple-50/30 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {event.clients?.first_name} {event.clients?.last_name}
                        </p>
                        <p className="text-xs text-purple-700 font-medium mt-0.5">
                          {daysUntil === 0 ? '🎉 Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.clients?.whatsapp && (
                          <a
                            href={`https://wa.me/${event.clients.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            WhatsApp
                          </a>
                        )}
                        {event.clients?.phone && (
                          <a
                            href={`tel:${event.clients.phone}`}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Operations Matrix */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Quick Actions</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Fast creation flows for clients, properties, follow-ups, and operational tasks.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
              <Link href="/admin/clients/new">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                  + Add Client
                </Button>
              </Link>
              <Link href="/admin/properties/new">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                  + Add Property
                </Button>
              </Link>
              <Link href="/admin/follow-ups/new">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                  + Schedule Follow-up
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PrivateLayout>
  )
}
