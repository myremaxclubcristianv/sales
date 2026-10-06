'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, Clock, Shield, Building2, User, Phone, Cake, ExternalLink } from 'lucide-react'
import type { NotificationRow } from '@/lib/db/notifications'

export function NotificationCenterPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ignore = false

    fetch('/api/notifications?limit=15')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setNotifications(data)
        }
      })
      .catch((err) => {
        console.error('[NotificationCenter] Failed to fetch notifications:', err)
      })

    const interval = setInterval(() => {
      fetch('/api/notifications?limit=15')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!ignore && Array.isArray(data)) {
            setNotifications(data)
          }
        })
        .catch(() => {})
    }, 60000)

    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) {
      fetch('/api/notifications?limit=15')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data)
        })
        .catch(() => {})
    }
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMarkingAll(true)
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.startsWith('birthday')) {
      return <Cake className="w-4 h-4 text-pink-600" />
    }
    if (t.startsWith('followup') || t.startsWith('follow_up')) {
      return <Phone className="w-4 h-4 text-amber-600" />
    }
    if (t === 'lead') {
      return <User className="w-4 h-4 text-blue-600" />
    }
    if (t === 'property') {
      return <Building2 className="w-4 h-4 text-emerald-600" />
    }
    if (t === 'insurance' || t === 'policy') {
      return <Shield className="w-4 h-4 text-purple-600" />
    }
    return <Bell className="w-4 h-4 text-slate-600" />
  }

  const getEntityUrl = (n: NotificationRow) => {
    if (!n.related_entity_id) return '/admin/notifications'
    const type = (n.related_entity_type || '').toLowerCase()
    if (type === 'client' || type === 'clients' || n.type.toLowerCase().startsWith('birthday')) {
      return `/admin/clients/${n.related_entity_id}`
    }
    if (type === 'follow_up' || type === 'follow_ups' || n.type.toLowerCase().startsWith('followup')) {
      return `/admin/calendar`
    }
    if (type === 'property' || type === 'properties') {
      return `/admin/properties/${n.related_entity_id}`
    }
    if (type === 'policy' || type === 'insurance_policies') {
      return `/admin/insurance/${n.related_entity_id}`
    }
    if (type === 'lead' || type === 'leads') {
      return '/admin/leads'
    }
    return '/admin/notifications'
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
        title="Centru Notificări"
        aria-label="Centru Notificări"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold tracking-tight">Notificări & Remindere</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold">
                  {unreadCount} noi
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Marchează toate ca citite"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isMarkingAll ? '...' : 'Toate'}</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Nu ai notificări noi</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Toate alertele au fost procesate.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const entityUrl = getEntityUrl(n)
                const isBirthday = n.type.toLowerCase().startsWith('birthday')
                const isFollowUp = n.type.toLowerCase().startsWith('followup')

                return (
                  <div
                    key={n.id}
                    className={`p-3 transition-colors ${
                      n.is_read ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/40 hover:bg-blue-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isBirthday
                            ? 'bg-pink-50 border border-pink-200'
                            : isFollowUp
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-slate-100'
                        }`}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </h4>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>

                        {n.message && (
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">
                            {n.message}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-100/60">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(n.created_at).toLocaleDateString('ro-RO', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={entityUrl}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors"
                            >
                              <span>{isBirthday ? 'Vezi Client' : 'Deschide'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>

                            {!n.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                                title="Marchează ca citit"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              <span>Vezi toate notificările din Hub</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
