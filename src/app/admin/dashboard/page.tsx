import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getClients } from '@/lib/db/clients'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import { getUpcomingBirthdays } from '@/lib/db/personal-events'
import { getRealDatabaseAnalytics } from '@/lib/db/analytics'
import { getNextBestActions } from '@/lib/utils/next-best-action'
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Building2,
  Shield,
  CreditCard,
  Users,
  Target,
  Plus
} from 'lucide-react'
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
  let analytics: Awaited<ReturnType<typeof getRealDatabaseAnalytics>> | null = null
  let nextActions: Awaited<ReturnType<typeof getNextBestActions>> = []

  try {
    const [clientsData, todayData, overdueData, birthdaysData, analyticsData, actionsData] = await Promise.all([
      getClients().catch(() => []),
      getFollowUpsByView('today').catch(() => []),
      getFollowUpsByView('overdue').catch(() => []),
      getUpcomingBirthdays(30).catch(() => []),
      getRealDatabaseAnalytics().catch(() => null),
      getNextBestActions().catch(() => []),
    ])
    clients = (clientsData as ClientRow[]) || []
    todayFollowUps = (todayData as FollowUpRow[]) || []
    overdueFollowUps = (overdueData as FollowUpRow[]) || []
    upcomingBirthdays = (birthdaysData as PersonalEventRow[]) || []
    analytics = analyticsData
    nextActions = actionsData
  } catch (err) {
    console.error('Error loading dashboard data:', err)
  }

  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Command Operating Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic real-time operating metrics, intelligent next actions, and unified pipeline management.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/admin/clients/new">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> New Client
              </Button>
            </Link>
            <Link href="/admin/properties/new">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> New Property
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. DETERMINISTIC NEXT-BEST-ACTION COMMAND RADAR */}
        {nextActions.length > 0 && (
          <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Deterministic Next-Best Actions
                    <Badge variant="info" size="sm" className="bg-blue-900/60 text-blue-200 border-blue-700">
                      {nextActions.length} Pending Actions
                    </Badge>
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    High-priority rule-based opportunities derived directly from live database states
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nextActions.slice(0, 6).map((action) => (
                <div
                  key={action.id}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                          action.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : action.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {action.badgeText || action.category}
                      </span>
                      {action.priority === 'CRITICAL' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                    <Link
                      href={action.actionHref}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between w-full"
                    >
                      <span>{action.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 2. REAL METRICS KPI GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clients Base</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{clients.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{activeClients} Active accounts</p>
          </Card>

          <Card className="border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              {analytics ? `${analytics.properties.totalInventoryValue.toLocaleString()} €` : '—'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {analytics ? `${analytics.properties.totalActive} active listings` : 'Active listings'}
            </p>
          </Card>

          <Card className="border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Financing Pipeline</span>
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              {analytics ? `${analytics.credit.totalPipelineVolume.toLocaleString()} €` : '—'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {analytics ? `${analytics.credit.activeCasesCount} active files` : 'Active files'}
            </p>
          </Card>

          <Card className="border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurance Book</span>
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              {analytics ? `${analytics.insurance.totalAnnualPremium.toLocaleString()} €` : '—'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {analytics?.insurance.expiringSoonCount ? (
                <span className="text-amber-600 font-semibold">{analytics.insurance.expiringSoonCount} renewals due</span>
              ) : (
                `${analytics?.insurance.totalActive || 0} active policies`
              )}
            </p>
          </Card>
        </div>

        {/* 3. TWO-COLUMN OPERATIONAL VIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Follow-ups */}
          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Today&apos;s Follow-up Queue</h2>
                  {overdueFollowUps.length > 0 && (
                    <Badge variant="danger" size="sm">
                      {overdueFollowUps.length} Overdue
                    </Badge>
                  )}
                </div>
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

          {/* Upcoming Birthdays & Key Dates */}
          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Birthdays &amp; Key Personal Dates</h2>
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

        {/* 4. CROSS-MODULE SHORTCUT MATRIX */}
        <Card className="p-4 bg-slate-900 text-white border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Cross-Sector Operating Direct Access
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct access to Real Estate, Insurance, Credit, and Growth workflows
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Link href="/admin/leads">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto text-xs">
                  Leads Inbox
                </Button>
              </Link>
              <Link href="/admin/insurance/new">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto text-xs">
                  + Insurance
                </Button>
              </Link>
              <Link href="/admin/credit/new">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto text-xs">
                  + Credit Case
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto text-xs">
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PrivateLayout>
  )
}
