'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  Clock,
  Cake,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Sparkles,
  Calendar,
} from 'lucide-react'
import { getTelUrl, getWhatsAppUrl } from '@/lib/utils/phone'
import { getRomanianBirthdayWish } from '@/lib/utils/cnp'
import type { UnifiedFollowUpItem } from '@/lib/db/follow-ups'

interface FollowUpsViewProps {
  initialItems: UnifiedFollowUpItem[]
  currentView: string
  currentTypeFilter: string
}

type TimeHorizonView = 'today' | 'tomorrow' | 'this_week' | 'upcoming' | 'overdue' | 'completed' | 'all'
type TypeFilter = 'all' | 'birthdays' | 'follow_ups'

export function FollowUpsView({
  initialItems,
  currentView,
  currentTypeFilter,
}: FollowUpsViewProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<TimeHorizonView>((currentView as TimeHorizonView) || 'today')
  const [activeType, setActiveType] = useState<TypeFilter>((currentTypeFilter as TypeFilter) || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const timeTabs: { key: TimeHorizonView; label: string }[] = [
    { key: 'today', label: 'Azi (Today)' },
    { key: 'tomorrow', label: 'Mâine (Tomorrow)' },
    { key: 'this_week', label: 'Săptămâna Aceasta' },
    { key: 'upcoming', label: 'Următoarele (Upcoming)' },
    { key: 'overdue', label: 'Întârziate (Overdue)' },
    { key: 'completed', label: 'Finalizate (Completed)' },
    { key: 'all', label: 'Toate (All Dates)' },
  ]

  const typeTabs: { key: TypeFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Toate Notificările', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'birthdays', label: 'Zile de Naștere', icon: <Cake className="w-3.5 h-3.5" /> },
    { key: 'follow_ups', label: 'Follow-ups', icon: <Clock className="w-3.5 h-3.5" /> },
  ]

  // Filter items in memory based on selected type, completed IDs, and search
  const filteredItems = useMemo(() => {
    return initialItems.map(item => {
      if (completedIds.has(item.id)) {
        return { ...item, status: 'COMPLETED', completed_at: item.completed_at || new Date().toISOString() }
      }
      return item
    }).filter((item) => {
      // 1. Type filter
      if (activeType === 'birthdays' && !item.is_birthday) return false
      if (activeType === 'follow_ups' && item.is_birthday) return false

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const clientName = `${item.clients?.first_name || ''} ${item.clients?.last_name || ''}`.toLowerCase()
        const reason = (item.reason || '').toLowerCase()
        const notes = (item.notes || '').toLowerCase()
        const phone = (item.clients?.phone || '').toLowerCase()
        const categories = (item.category_label || '').toLowerCase()

        const matches =
          clientName.includes(query) ||
          reason.includes(query) ||
          notes.includes(query) ||
          phone.includes(query) ||
          categories.includes(query)

        if (!matches) return false
      }

      return true
    })
  }, [initialItems, completedIds, activeType, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = initialItems.length
    const birthdays = initialItems.filter((i) => i.is_birthday).length
    const followUps = initialItems.filter((i) => !i.is_birthday).length
    const pending = initialItems.filter((i) => !completedIds.has(i.id) && (i.status === 'PENDING' || i.status === 'UPCOMING')).length
    return { total, birthdays, followUps, pending }
  }, [initialItems, completedIds])

  const handleTimeViewChange = (newView: TimeHorizonView) => {
    setActiveView(newView)
    router.push(`/admin/follow-ups?view=${newView}&type=${activeType}`)
  }

  const handleTypeChange = (newType: TypeFilter) => {
    setActiveType(newType)
    router.push(`/admin/follow-ups?view=${activeView}&type=${newType}`)
  }

  // Complete Standard Follow-up
  const handleCompleteStandardFollowUp = async (id: string) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      if (res.ok) {
        setCompletedIds((prev) => new Set(prev).add(id))
      } else {
        alert('Nu s-a putut finaliza follow-up-ul.')
      }
    } catch {
      alert('Eroare la actualizarea follow-up-ului.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Acknowledge Birthday
  const handleAcknowledgeBirthday = async (item: UnifiedFollowUpItem) => {
    setActionLoadingId(item.id)
    try {
      const year = new Date(item.due_date).getFullYear()
      const res = await fetch('/api/follow-ups/acknowledge-birthday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: item.client_id,
          year,
          notes: `Urări transmise cu succes către ${item.clients?.first_name || 'client'}.`,
        }),
      })
      if (res.ok) {
        setCompletedIds((prev) => new Set(prev).add(item.id))
      } else {
        alert('Nu s-a putut înregistra felicitarea.')
      }
    } catch {
      alert('Eroare la înregistrarea felicitării.')
    } finally {
      setActionLoadingId(null)
    }
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Follow-ups &amp; Action Queue
            </h1>
            <Badge variant="info" size="sm" className="hidden sm:inline-flex">
              {stats.pending} Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Programări aniversare, touchpoint-uri critice și calendar de revenire sincronizat cu toate sursele CRM.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/calendar">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar Master</span>
            </Button>
          </Link>
          <Link href="/admin/follow-ups/new">
            <Button size="sm" className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Programează Follow-up</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Type Filter Tabs (ALL / BIRTHDAYS / FOLLOW-UPS) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {typeTabs.map((tab) => {
            const isActive = activeType === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTypeChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.key === 'birthdays' && stats.birthdays > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {stats.birthdays}
                  </span>
                )}
                {tab.key === 'follow_ups' && stats.followUps > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stats.followUps}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Caută client, motiv sau notă..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Time Horizon View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {timeTabs.map((tab) => {
          const isActive = activeView === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTimeViewChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Follow-ups List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800">
            Niciun follow-up în această vizualizare
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Toate touchpoint-urile și aniversările pentru intervalul selectat sunt la zi sau nu există înregistrări care să corespundă filtrului.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <Link href="/admin/follow-ups/new">
              <Button size="sm" variant="outline" className="text-xs">+ Programează Follow-up</Button>
            </Link>
            <Button size="sm" onClick={() => handleTimeViewChange('all')} className="text-xs bg-slate-900 text-white">
              Vezi Toate Datele
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredItems.map((item) => {
            const client = item.clients
            const fullName = `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Client CRM'
            const phone = client?.phone
            const isCompleted = item.status === 'COMPLETED'
            const isBirthday = item.is_birthday

            if (isBirthday) {
              // BIRTHDAY FOLLOW-UP CARD
              const wishText = getRomanianBirthdayWish(client?.first_name || 'Dragă client')
              const waUrl = phone ? getWhatsAppUrl(phone, wishText) : '#'
              const telUrl = phone ? getTelUrl(phone) : '#'

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-slate-50/60 border-slate-200 opacity-80'
                      : 'bg-gradient-to-r from-pink-50/40 via-white to-amber-50/30 border-pink-200/80 shadow-xs hover:border-pink-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                          <Cake className="w-3 h-3 text-pink-600" />
                          <span>🎂 ZI DE NAȘTERE</span>
                        </span>

                        <Badge
                          variant={isCompleted ? 'success' : item.priority === 'HIGH' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {isCompleted ? 'FELICITAT' : item.status}
                        </Badge>

                        {item.category_label && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            🏷 {item.category_label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/clients/${item.client_id}`}
                          className="text-base font-bold text-slate-900 hover:text-pink-600 transition-colors flex items-center gap-1.5"
                        >
                          <span>{fullName}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        {item.age && (
                          <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                            {item.age} ani
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        {item.notes}
                      </p>
                    </div>

                    {/* Right actions & date */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-pink-100">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-slate-900">
                          📅 {item.due_date_formatted}
                        </p>
                        <p className="text-[11px] text-pink-600 font-medium">
                          Aniversare anuală recurentă
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {phone && (
                          <>
                            <a
                              href={telUrl}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                              title="Apelează telefonic"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Sună</span>
                            </a>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              title="Trimite urare pe WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        )}

                        <Link href={`/admin/clients/${item.client_id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-8 px-2.5">
                            Client 360
                          </Button>
                        </Link>

                        {!isCompleted && (
                          <Button
                            size="sm"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleAcknowledgeBirthday(item)}
                            className="text-xs h-8 px-3 bg-pink-600 hover:bg-pink-700 text-white font-bold gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{actionLoadingId === item.id ? 'Se marchează...' : 'Marchează Felicitat'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            // STANDARD FOLLOW-UP CARD
            const dueDateObj = new Date(item.due_date)
            const timeStr = !isNaN(dueDateObj.getTime())
              ? dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '09:00'
            const telUrl = phone ? getTelUrl(phone) : '#'
            const waUrl = phone ? getWhatsAppUrl(phone, `Bună ziua, vă contactez referitor la: ${item.reason}`) : '#'

            return (
              <Card
                key={item.id}
                className={`p-4 transition-all duration-200 ${
                  isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      <Badge
                        variant={isCompleted ? 'success' : item.status === 'CANCELLED' ? 'default' : 'warning'}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                      {item.category_label && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          🏷 {item.category_label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/clients/${item.client_id}`}
                        className="text-base font-bold text-slate-900 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>{fullName}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">{item.reason}</p>
                    {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
                  </div>

                  {/* Right actions & date */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-slate-900">
                        📅 {item.due_date_formatted}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        🕒 {timeStr}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {phone && (
                        <>
                          <a
                            href={telUrl}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Sună</span>
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      )}

                      <Link href={`/admin/clients/${item.client_id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8 px-2.5">
                          Client 360
                        </Button>
                      </Link>

                      {!isCompleted && (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleCompleteStandardFollowUp(item.id)}
                          className="text-xs h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{actionLoadingId === item.id ? 'Se finalizează...' : 'Finalizează'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
