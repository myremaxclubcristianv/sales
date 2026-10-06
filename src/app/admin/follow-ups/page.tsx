import React from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getFollowUpsByView } from '@/lib/db/follow-ups'
import { FollowUpsView } from './FollowUpsView'
import type { UnifiedFollowUpItem } from '@/lib/db/follow-ups'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    view?: 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'upcoming' | 'completed' | 'all'
    type?: 'all' | 'birthdays' | 'follow_ups'
  }>
}

export default async function FollowUpsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const view = searchParams?.view || 'today'
  const typeFilter = searchParams?.type || 'all'

  let items: UnifiedFollowUpItem[] = []
  try {
    items = await getFollowUpsByView(view, typeFilter)
  } catch (err) {
    console.error('[FollowUpsPage] Error loading unified follow-ups:', err)
  }

  return (
    <PrivateLayout>
      <FollowUpsView
        initialItems={items}
        currentView={view}
        currentTypeFilter={typeFilter}
      />
    </PrivateLayout>
  )
}
