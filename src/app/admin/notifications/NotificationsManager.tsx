'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Bell, CheckCheck, Check, Clock, User, Building2, Shield, CreditCard, Mail } from 'lucide-react'
import Link from 'next/link'
import type { NotificationRow } from '@/lib/db/notifications'

interface NotificationsManagerProps {
  initialNotifications: NotificationRow[]
}

export function NotificationsManager({ initialNotifications }: NotificationsManagerProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
        router.refresh()
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true)
    try {
      const res = await fetch(`/api/notifications`, {
        method: 'PUT',
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        router.refresh()
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lead':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'property':
        return <Building2 className="w-4 h-4 text-emerald-600" />
      case 'insurance':
        return <Shield className="w-4 h-4 text-purple-600" />
      case 'credit':
        return <CreditCard className="w-4 h-4 text-amber-600" />
      case 'client':
        return <User className="w-4 h-4 text-indigo-600" />
      default:
        return <Bell className="w-4 h-4 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-blue-600" />
            Internal Notifications Hub
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System alerts, lead arrivals, policy renewal warnings, and real-time operational notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              {isMarkingAll ? 'Marking...' : 'Mark All as Read'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'UNREAD' ? 'You have read all your notifications.' : 'No system notifications generated yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all ${
                notification.is_read
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-blue-50/40 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notification.is_read ? 'bg-slate-100' : 'bg-white shadow-xs border border-blue-100'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      <span className="uppercase tracking-wider font-semibold">
                        Type: {notification.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notification.related_entity_type && notification.related_entity_id && (
                    <Link
                      href={
                        notification.related_entity_type === 'lead'
                          ? '/admin/leads'
                          : notification.related_entity_type === 'property'
                          ? `/admin/properties/${notification.related_entity_id}`
                          : notification.related_entity_type === 'policy'
                          ? `/admin/insurance/${notification.related_entity_id}`
                          : notification.related_entity_type === 'client'
                          ? `/admin/clients/${notification.related_entity_id}`
                          : '#'
                      }
                    >
                      <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 h-8">
                        View
                      </Button>
                    </Link>
                  )}
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs py-1 px-2 h-8 text-slate-500 hover:text-slate-900"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
