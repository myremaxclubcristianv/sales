'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cake,
  Phone,
  MessageSquare,
  Shield,
  Building2,
  CreditCard,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  Search,
  List,
  Grid,
} from 'lucide-react'
import { formatDobDisplay } from '@/lib/utils/cnp'
import { formatPhoneDisplay, getTelUrl, getWhatsAppUrl } from '@/lib/utils/phone'
import type { MasterCalendarEvent } from '@/lib/db/calendar'

interface CalendarViewProps {
  initialEvents: MasterCalendarEvent[]
  initialUpcoming: {
    today: MasterCalendarEvent[]
    next7Days: MasterCalendarEvent[]
    next30Days: MasterCalendarEvent[]
  }
}

type ViewMode = 'month' | 'week' | 'list'
type FilterCategory = 'ALL' | 'BIRTHDAYS' | 'FOLLOW-UPS' | 'INSURANCE' | 'REAL ESTATE' | 'CREDITE' | 'CONTACTS'

export function CalendarView({ initialEvents, initialUpcoming }: CalendarViewProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [upcomingTab, setUpcomingTab] = useState<'today' | '7days' | '30days'>('today')
  const [selectedEvent, setSelectedEvent] = useState<MasterCalendarEvent | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Follow-up quick create modal inside calendar
  const [quickFollowUpOpen, setQuickFollowUpOpen] = useState(false)
  const [newFollowUp, setNewFollowUp] = useState({
    client_id: '',
    reason: '',
    due_date: new Date().toISOString().slice(0, 10),
    due_time: '10:00',
    priority: 'NORMAL',
    notes: '',
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // 1. Category / Type filter
      if (activeFilter !== 'ALL') {
        if (activeFilter === 'BIRTHDAYS' && event.type !== 'birthday') return false
        if (activeFilter === 'FOLLOW-UPS' && event.type !== 'follow_up') return false
        if (activeFilter === 'INSURANCE' && !event.categories.includes('INSURANCE')) return false
        if (activeFilter === 'REAL ESTATE' && !event.categories.includes('REAL ESTATE')) return false
        if (activeFilter === 'CREDITE' && !event.categories.includes('CREDITE')) return false
        if (activeFilter === 'CONTACTS' && !event.categories.includes('CONTACT')) return false
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = event.client_name?.toLowerCase().includes(q)
        const matchTitle = event.title.toLowerCase().includes(q)
        const matchReason = event.reason?.toLowerCase().includes(q)
        const matchCat = event.category_label.toLowerCase().includes(q)
        if (!matchName && !matchTitle && !matchReason && !matchCat) return false
      }

      return true
    })
  }, [initialEvents, activeFilter, searchQuery])

  // Month calendar grid computation
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const numDays = lastDayOfMonth.getDate()

    // Day of week for 1st day (0 = Sun, 1 = Mon ... 6 = Sat)
    // Convert to Monday-start (0 = Mon, ..., 6 = Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startDayOfWeek < 0) startDayOfWeek = 6

    const days: Array<{
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isToday: boolean
      events: MasterCalendarEvent[]
    }> = []

    const todayStr = new Date().toISOString().slice(0, 10)

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const prevDate = new Date(year, month - 1, d)
      const dateStr = prevDate.toISOString().slice(0, 10)
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: filteredEvents.filter((e) => e.date === dateStr),
      })
    }

    // Current month days
    for (let d = 1; d <= numDays; d++) {
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      const dateStr = `${year}-${mm}-${dd}`
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: filteredEvents.filter((e) => e.date === dateStr),
      })
    }

    // Next month filler days to complete grid (multiples of 7)
    const remainingDays = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remainingDays; d++) {
      const nextDate = new Date(year, month + 1, d)
      const dateStr = nextDate.toISOString().slice(0, 10)
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: filteredEvents.filter((e) => e.date === dateStr),
      })
    }

    return days
  }, [year, month, filteredEvents])

  // Handle Complete Follow-up
  const handleCompleteFollowUp = async (followUpId: string) => {
    if (!followUpId) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      if (res.ok) {
        setSelectedEvent(null)
        router.refresh()
      } else {
        alert('Eroare la marcarea follow-up-ului ca finalizat.')
      }
    } catch {
      alert('A apărut o eroare.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Cancel Follow-up
  const handleCancelFollowUp = async (followUpId: string) => {
    if (!followUpId) return
    if (!confirm('Sigur doriți să anulați acest follow-up?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (res.ok) {
        setSelectedEvent(null)
        router.refresh()
      } else {
        alert('Eroare la anularea follow-up-ului.')
      }
    } catch {
      alert('A apărut o eroare.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Create Follow-up from calendar
  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFollowUp.client_id || !newFollowUp.reason) {
      alert('Vă rugăm să specificați clientul și motivul.')
      return
    }
    setActionLoading(true)
    try {
      const dueDateTime = `${newFollowUp.due_date}T${newFollowUp.due_time}:00`
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: newFollowUp.client_id,
          reason: newFollowUp.reason,
          notes: newFollowUp.notes,
          priority: newFollowUp.priority,
          due_date: dueDateTime,
          status: 'PENDING',
        }),
      })
      if (res.ok) {
        setQuickFollowUpOpen(false)
        setNewFollowUp({
          client_id: '',
          reason: '',
          due_date: new Date().toISOString().slice(0, 10),
          due_time: '10:00',
          priority: 'NORMAL',
          notes: '',
        })
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Eroare la crearea follow-up-ului.')
      }
    } catch {
      alert('A apărut o eroare de rețea.')
    } finally {
      setActionLoading(false)
    }
  }

  const monthNamesRo = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
  ]

  const weekDaysRo = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

  // Category Filter Tabs
  const filterTabs: Array<{ key: FilterCategory; label: string; icon: React.ReactNode }> = [
    { key: 'ALL', label: 'Toate Evenimentele', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { key: 'BIRTHDAYS', label: 'Zile de Naștere (🎂)', icon: <Cake className="w-3.5 h-3.5 text-pink-500" /> },
    { key: 'FOLLOW-UPS', label: 'Follow-ups (📞)', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
    { key: 'INSURANCE', label: 'Insurance (🛡️)', icon: <Shield className="w-3.5 h-3.5 text-emerald-500" /> },
    { key: 'REAL ESTATE', label: 'Real Estate (🏠)', icon: <Building2 className="w-3.5 h-3.5 text-blue-500" /> },
    { key: 'CREDITE', label: 'Credite (💳)', icon: <CreditCard className="w-3.5 h-3.5 text-purple-500" /> },
    { key: 'CONTACTS', label: 'Contacte (👤)', icon: <User className="w-3.5 h-3.5 text-slate-500" /> },
  ]

  // Upcoming items selector
  const activeUpcomingList =
    upcomingTab === 'today'
      ? initialUpcoming.today
      : upcomingTab === '7days'
      ? initialUpcoming.next7Days
      : initialUpcoming.next30Days

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Master CRM Calendar
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized Birthdays, Follow-ups, Real Estate Viewings &amp; Coverage Expirations
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Lună</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agendă</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setQuickFollowUpOpen(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Follow-up Nou</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Ticker / Category Filter Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filtrează:</span>
          </span>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Upcoming Panel (Today, Next 7 Days, Next 30 Days) */}
      <Card className="p-4 sm:p-5 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 text-white border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Panou Evenimente &amp; Termene Imediate (Upcoming)
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setUpcomingTab('today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                upcomingTab === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Astăzi ({initialUpcoming.today.length})
            </button>
            <button
              onClick={() => setUpcomingTab('7days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                upcomingTab === '7days'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Următoarele 7 Zile ({initialUpcoming.next7Days.length})
            </button>
            <button
              onClick={() => setUpcomingTab('30days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                upcomingTab === '30days'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              30 Zile ({initialUpcoming.next30Days.length})
            </button>
          </div>
        </div>

        {/* Upcoming List */}
        <div className="pt-3">
          {activeUpcomingList.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Nu există evenimente sau aniversări programate pentru acest interval.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {activeUpcomingList.map((item) => {
                const isBirthday = item.type === 'birthday'

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvent(item)}
                    className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">
                          {isBirthday ? `🎂 ${item.client_name}` : item.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                        {isBirthday && item.age !== undefined && (
                          <span className="font-semibold text-pink-300 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-800/60">
                            {item.age} ANI
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-slate-700/80 text-[10px] font-bold text-slate-200">
                          {item.category_label}
                        </span>
                        {item.time && (
                          <span className="font-mono text-amber-300">
                            🕒 {item.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {new Date(item.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* 4. Calendar Toolbar (Month Navigation & Search) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handlePrevMonth} className="h-9 w-9 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleToday} className="h-9 text-xs font-bold">
            Astăzi
          </Button>
          <Button size="sm" variant="outline" onClick={handleNextMonth} className="h-9 w-9 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-base sm:text-lg font-bold text-slate-900 ml-2">
            {monthNamesRo[month]} {year}
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Caută în calendar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 5. Main Calendar View */}
      {viewMode === 'month' ? (
        <Card className="p-2 sm:p-4 bg-white border-slate-200 shadow-xs overflow-hidden">
          {/* Day of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {weekDaysRo.map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                  idx >= 5 ? 'text-amber-600' : 'text-slate-500'
                }`}
              >
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.slice(0, 2)}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((day, idx) => {
              const hasEvents = day.events.length > 0

              return (
                <div
                  key={`${day.dateStr}-${idx}`}
                  className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    day.isToday
                      ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20'
                      : day.isCurrentMonth
                      ? 'bg-white border-slate-100 hover:border-slate-300'
                      : 'bg-slate-50/60 border-slate-100/60 opacity-60'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        day.isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : day.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    {hasEvents && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {day.events.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {day.events.slice(0, 3).map((ev) => {
                      const isBirthday = ev.type === 'birthday'
                      const isFollowUp = ev.type === 'follow_up'

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1 sm:p-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold truncate cursor-pointer transition-all border ${
                            isBirthday
                              ? 'bg-pink-50 text-pink-900 border-pink-200 hover:bg-pink-100'
                              : isFollowUp
                              ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`${ev.title} (${ev.category_label})`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {isBirthday && <span>🎂</span>}
                            {isFollowUp && <span>📞</span>}
                            <span className="truncate">
                              {isBirthday
                                ? `${ev.client_name}${ev.age !== undefined ? ` (${ev.age} ani)` : ''}`
                                : ev.title}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {day.events.length > 3 && (
                      <button
                        onClick={() => {
                          // Show all events for this day
                          setSelectedEvent(day.events[0])
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline block text-center w-full"
                      >
                        +{day.events.length - 3} mai multe
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        /* List / Agenda View */
        <Card className="p-4 bg-white border-slate-200 shadow-xs divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-500">
              Nu s-au găsit evenimente conforme filtrelor selectate.
            </p>
          ) : (
            filteredEvents.map((ev) => {
              const isBirthday = ev.type === 'birthday'
              const isFollowUp = ev.type === 'follow_up'

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="py-3 px-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                        isBirthday
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : isFollowUp
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isBirthday ? '🎂' : isFollowUp ? '📞' : '📅'}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {isBirthday ? ev.client_name : ev.title}
                        </span>
                        {isBirthday && ev.age !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
                            {ev.age} ANI
                          </span>
                        )}
                        <Badge variant="default" size="sm">
                          {ev.category_label}
                        </Badge>
                        {ev.priority && (
                          <Badge
                            variant={ev.priority === 'URGENT' ? 'danger' : ev.priority === 'HIGH' ? 'warning' : 'info'}
                            size="sm"
                          >
                            {ev.priority}
                          </Badge>
                        )}
                        {ev.status && (
                          <Badge
                            variant={ev.status === 'COMPLETED' ? 'success' : 'default'}
                            size="sm"
                          >
                            {ev.status}
                          </Badge>
                        )}
                      </div>

                      {ev.notes && <p className="text-slate-500 text-xs line-clamp-1">{ev.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {new Date(ev.date).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {ev.time && <span className="font-mono text-slate-400 text-[11px]">Ora: {ev.time}</span>}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Card>
      )}

      {/* 6. Event Detail Modal (Clean, Zero CNP, Direct Actions) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    selectedEvent.type === 'birthday'
                      ? 'bg-pink-100 text-pink-700'
                      : selectedEvent.type === 'follow_up'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {selectedEvent.type === 'birthday' ? '🎂' : selectedEvent.type === 'follow_up' ? '📞' : '📅'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedEvent.type === 'birthday' ? 'Aniversare Client' : selectedEvent.type === 'follow_up' ? 'Follow-up Programat' : 'Eveniment CRM'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedEvent.client_name || selectedEvent.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Category Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500">Clasificare:</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {selectedEvent.category_label}
                </span>
                {selectedEvent.status && (
                  <Badge variant={selectedEvent.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                    {selectedEvent.status}
                  </Badge>
                )}
                {selectedEvent.priority && (
                  <Badge variant={selectedEvent.priority === 'URGENT' ? 'danger' : 'info'} size="sm">
                    {selectedEvent.priority}
                  </Badge>
                )}
              </div>

              {/* Birthday Details */}
              {selectedEvent.type === 'birthday' && (
                <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Data Nașterii:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatDobDisplay(selectedEvent.date_of_birth)}
                    </span>
                  </div>
                  {selectedEvent.age !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Vârstă (în {selectedEvent.date.slice(0, 4)}):</span>
                      <span className="font-bold text-pink-700 text-sm">
                        {selectedEvent.age} ANI
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Recurență:</span>
                    <span className="font-medium text-slate-700">Anuală (RRULE:FREQ=YEARLY)</span>
                  </div>
                </div>
              )}

              {/* Follow-up Details */}
              {selectedEvent.type === 'follow_up' && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Dată Programată:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedEvent.time && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Ora:</span>
                      <span className="font-bold text-amber-800 font-mono text-sm">{selectedEvent.time}</span>
                    </div>
                  )}
                  {selectedEvent.reason && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-700 block mb-0.5">Motiv:</span>
                      <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-amber-200">
                        {selectedEvent.reason}
                      </p>
                    </div>
                  )}
                  {selectedEvent.notes && (
                    <div className="pt-1">
                      <span className="font-bold text-slate-700 block mb-0.5">Notițe:</span>
                      <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 whitespace-pre-wrap">
                        {selectedEvent.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Coordinates if available */}
              {(selectedEvent.phone || selectedEvent.email || selectedEvent.company_name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Coordonate Contact
                  </span>
                  {selectedEvent.company_name && (
                    <p className="text-slate-700">Companie: <strong>{selectedEvent.company_name}</strong></p>
                  )}
                  {selectedEvent.phone && (
                    <p className="text-slate-700 font-mono">
                      Tel: <strong>{formatPhoneDisplay(selectedEvent.phone)}</strong>
                    </p>
                  )}
                  {selectedEvent.email && (
                    <p className="text-slate-700">Email: <strong>{selectedEvent.email}</strong></p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedEvent.phone && (
                  <a href={getTelUrl(selectedEvent.phone)}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sună</span>
                    </Button>
                  </a>
                )}
                {selectedEvent.phone && (
                  <a href={getWhatsAppUrl(selectedEvent.phone)} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1 text-xs text-emerald-700">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </Button>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedEvent.type === 'follow_up' && selectedEvent.follow_up_id && selectedEvent.status !== 'COMPLETED' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteFollowUp(selectedEvent.follow_up_id!)}
                      disabled={actionLoading}
                      className="gap-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelFollowUp(selectedEvent.follow_up_id!)}
                      disabled={actionLoading}
                      className="gap-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Anulează</span>
                    </Button>
                  </>
                )}

                {selectedEvent.client_id && (
                  <Link href={`/admin/clients/${selectedEvent.client_id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <span>Profil Client 360°</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Quick Follow-Up Modal */}
      {quickFollowUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Programează Follow-up Nou</h3>
              </div>
              <button
                onClick={() => setQuickFollowUpOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Client ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Introduceți UUID client..."
                  value={newFollowUp.client_id}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, client_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Motiv Follow-up *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Revenire ofertă apartament / discuție CASCO"
                  value={newFollowUp.reason}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">Dată *</label>
                  <input
                    type="date"
                    required
                    value={newFollowUp.due_date}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">Ora</label>
                  <input
                    type="time"
                    value={newFollowUp.due_time}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, due_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Prioritate</label>
                <select
                  value={newFollowUp.priority}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Notițe Follow-up</label>
                <textarea
                  rows={3}
                  placeholder="Detalii suplimentare pentru revenire..."
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickFollowUpOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  {actionLoading ? 'Se salvează...' : 'Salvează Follow-up'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
