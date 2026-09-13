import React from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getNotifications } from '@/lib/db/notifications'
import { NotificationsManager } from './NotificationsManager'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications({ limit: 50 })

  return (
    <PrivateLayout>
      <NotificationsManager initialNotifications={notifications} />
    </PrivateLayout>
  )
}
