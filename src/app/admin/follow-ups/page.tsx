import React from 'react'
import Link from 'next/link'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import type { Database } from '@/types'

type FollowUpWithClient = Database['public']['Tables']['follow_ups']['Row'] & {
  clients?: { first_name?: string; last_name?: string; phone?: string | null; email?: string | null } | null
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ view?: 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'upcoming' | 'completed' }>
}

export default async function FollowUpsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const view = searchParams?.view || 'today'

  let followUps: FollowUpWithClient[] = []
  try {
    const data = await getFollowUpsByView(view)
    followUps = (data as FollowUpWithClient[]) || []
  } catch (err) {
    console.error('Error loading follow-ups:', err)
  }

  const viewTabs: { key: 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'upcoming' | 'completed'; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'this_week', label: 'This Week' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger" size="sm">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="warning" size="sm">High</Badge>
      case 'NORMAL':
        return <Badge variant="info" size="sm">Normal</Badge>
      default:
        return <Badge variant="default" size="sm">Low</Badge>
    }
  }

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Follow-ups &amp; Action Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Time-sensitive touchpoints, call reminders, and follow-up activities.
            </p>
          </div>
          <Link href="/admin/follow-ups/new">
            <Button size="sm">+ Schedule Follow-up</Button>
          </Link>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {viewTabs.map((tab) => {
            const isActive = view === tab.key
            return (
              <Link
                key={tab.key}
                href={`/admin/follow-ups?view=${tab.key}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Follow-ups List */}
        {followUps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-base font-semibold text-slate-800">
              No follow-ups in this view
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All scheduled touchpoints for this timeframe are handled.
            </p>
            <Link href="/admin/follow-ups/new" className="mt-4 inline-block">
              <Button size="sm" variant="outline">+ Create New Follow-up</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {followUps.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getPriorityBadge(item.priority)}
                      <Badge
                        variant={item.status === 'COMPLETED' ? 'success' : item.status === 'CANCELLED' ? 'default' : 'warning'}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.clients?.first_name} {item.clients?.last_name}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{item.reason}</p>
                    {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-500 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="font-semibold text-slate-900">
                      {new Date(item.due_date).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-slate-400">
                      {new Date(item.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PrivateLayout>
  )
}
