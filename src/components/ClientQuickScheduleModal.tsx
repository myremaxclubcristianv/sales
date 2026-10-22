'use client'

import React, { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar as CalendarIcon, 
  CalendarPlus, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  X, 
  AlertCircle 
} from 'lucide-react'

interface ClientQuickScheduleModalProps {
  clientId: string
  clientName: string
  phone?: string | null
  className?: string
  onScheduled?: () => void
}

const ROMANIAN_MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
]

const ROMANIAN_WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']

const QUICK_PRESETS = [
  { label: 'Azi', days: 0 },
  { label: 'Mâine', days: 1 },
  { label: '+3 zile', days: 3 },
  { label: 'Săpt. viitoare', days: 7 },
  { label: '+2 săpt.', days: 14 },
]

const QUICK_REASONS = [
  'Sună clientul',
  'Revenire ofertă',
  'Check-in poliță',
  'Aștept documente'
]

const TIME_PRESETS = ['09:00', '10:00', '11:00', '14:00', '16:00', '18:00']

export function ClientQuickScheduleModal({
  clientId,
  clientName,
  phone,
  className = '',
  onScheduled,
}: ClientQuickScheduleModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Current calendar view month/year
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed

  // Selected date & time
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to tomorrow 10:00
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  })
  const [selectedTime, setSelectedTime] = useState('10:00')

  // Form details
  const [reason, setReason] = useState('Sună clientul')
  const [notes, setNotes] = useState('')

  // Submission state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const savingRef = useRef(false)

  // Open modal & reset to fresh state
  const handleOpen = () => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 1)
    setSelectedDate(defaultDate)
    setViewYear(defaultDate.getFullYear())
    setViewMonth(defaultDate.getMonth())
    setSelectedTime('10:00')
    setReason('Sună clientul')
    setNotes('')
    setSaveError(null)
    setSaveSuccess(false)
    setIsOpen(true)
  }

  const handleClose = () => {
    if (isSaving) return
    setIsOpen(false)
  }

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  // Calendar matrix calculation for viewMonth/viewYear
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday = 0, ..., Sunday = 6
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7

    const days: Array<{
      day: number
      isCurrentMonth: boolean
      dateObj: Date
      isToday: boolean
      isSelected: boolean
      isPast: boolean
    }> = []

    // Previous month padding days
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate()
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i
      const dateObj = new Date(viewYear, viewMonth - 1, d)
      days.push({
        day: d,
        isCurrentMonth: false,
        dateObj,
        isToday: false,
        isSelected: false,
        isPast: dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d)
      const isToday =
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate()

      const isSelected =
        selectedDate &&
        dateObj.getFullYear() === selectedDate.getFullYear() &&
        dateObj.getMonth() === selectedDate.getMonth() &&
        dateObj.getDate() === selectedDate.getDate()

      const isPast =
        new Date(viewYear, viewMonth, d).getTime() <
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

      days.push({
        day: d,
        isCurrentMonth: true,
        dateObj,
        isToday,
        isSelected: Boolean(isSelected),
        isPast,
      })
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(viewYear, viewMonth + 1, d)
      days.push({
        day: d,
        isCurrentMonth: false,
        dateObj,
        isToday: false,
        isSelected: false,
        isPast: false,
      })
    }

    return days
  }, [viewYear, viewMonth, selectedDate, today])

  // Select a preset date
  const handleApplyPreset = (daysOffset: number) => {
    const target = new Date()
    target.setDate(target.getDate() + daysOffset)
    setSelectedDate(target)
    setViewYear(target.getFullYear())
    setViewMonth(target.getMonth())
  }

  // Handle saving the schedule
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (savingRef.current || isSaving) return

    if (!reason.trim()) {
      setSaveError('Vă rugăm introduceți o scurtă descriere a acțiunii.')
      return
    }

    savingRef.current = true
    setIsSaving(true)
    setSaveError(null)

    try {
      // Build ISO due date
      const y = selectedDate.getFullYear()
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const d = String(selectedDate.getDate()).padStart(2, '0')
      const timeStr = selectedTime ? `${selectedTime}:00` : '10:00:00'
      const dueDateTime = `${y}-${m}-${d}T${timeStr}`

      // 1. Persist to /api/follow-ups with log_activity: true (single consistent server operation)
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          reason: reason.trim(),
          due_date: dueDateTime,
          priority: 'NORMAL',
          notes: notes.trim() || undefined,
          status: 'PENDING',
          log_activity: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Eroare server la salvare (${res.status})`)
      }

      setSaveSuccess(true)

      // Notify parent and refresh Next.js router
      onScheduled?.()
      router.refresh()

      // Close modal gracefully
      setTimeout(() => {
        setIsOpen(false)
        setSaveSuccess(false)
      }, 700)
    } catch (err: unknown) {
      console.error('Failed to schedule action:', err)
      const msg = err instanceof Error ? err.message : 'Eroare la salvarea programării.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
      savingRef.current = false
    }
  }

  // Format chosen date label for display
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ''
    const day = selectedDate.getDate()
    const month = ROMANIAN_MONTHS[selectedDate.getMonth()]
    const year = selectedDate.getFullYear()
    return `${day} ${month} ${year}`
  }, [selectedDate])

  return (
    <>
      {/* Trigger Button - Mobile Ergonomic */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Programează acțiune pentru ${clientName}`}
        title="Programează rapid acțiune / revenire"
        className={`px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer select-none min-h-[44px] min-w-[44px] ${className}`}
      >
        <CalendarPlus className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="hidden sm:inline">Programare</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-schedule-title"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 dark:from-neutral-800/80 dark:to-neutral-900 border-b border-slate-200/80 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 id="quick-schedule-title" className="text-sm font-bold text-slate-900 dark:text-neutral-100 truncate">
                    Programare Rapidă
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    Client: <strong className="text-slate-800 dark:text-neutral-200">{clientName}</strong>
                    {phone && <span className="font-mono ml-1">({phone})</span>}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-500 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Închide fereastra"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  Comenzi rapide dată:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleApplyPreset(p.days)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer active:scale-95"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Calendar Widget */}
              <div className="bg-slate-50/80 dark:bg-neutral-800/40 p-3 rounded-2xl border border-slate-200 dark:border-neutral-700 space-y-2.5">
                {/* Month & Year header with navigation */}
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-neutral-100">
                    {ROMANIAN_MONTHS[viewMonth]} {viewYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                      title="Luna anterioară"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 transition-colors cursor-pointer"
                      title="Luna următoare"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day name column labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-neutral-500">
                  {ROMANIAN_WEEKDAYS.map((wd) => (
                    <div key={wd} className="py-0.5">{wd}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((cd, idx) => {
                    return (
                      <button
                        key={`${cd.dateObj.toISOString()}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedDate(cd.dateObj)
                          setViewYear(cd.dateObj.getFullYear())
                          setViewMonth(cd.dateObj.getMonth())
                        }}
                        className={`h-8 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                          cd.isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs scale-105 z-10'
                            : cd.isToday
                            ? 'border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                            : cd.isCurrentMonth
                            ? 'text-slate-800 dark:text-neutral-200 hover:bg-slate-200/80 dark:hover:bg-neutral-700'
                            : 'text-slate-300 dark:text-neutral-600 hover:text-slate-500'
                        }`}
                      >
                        <span>{cd.day}</span>
                        {cd.isToday && !cd.isSelected && (
                          <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-1"></span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Selected Date Summary Badge */}
                <div className="pt-1.5 border-t border-slate-200/80 dark:border-neutral-700/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-neutral-400">Dată selectată:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                    📅 {formattedSelectedDate}
                  </span>
                </div>
              </div>

              {/* Time Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Ora acțiunii:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Implicit 10:00 (Europe/Bucharest)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-neutral-100 font-mono text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                  />

                  <div className="flex flex-wrap gap-1">
                    {TIME_PRESETS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`px-2 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${
                          selectedTime === t
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Description / Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
                  Descriere acțiune *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ex: Sună clientul"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-neutral-100 font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />

                {/* Quick description chips */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {QUICK_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors cursor-pointer ${
                        reason === r
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold'
                          : 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-700 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  Notițe adiționale (opțional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notează contextul sau detalii specifice..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-neutral-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Error message */}
              {saveError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{saveError}</span>
                </div>
              )}

              {/* Success confirmation */}
              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-bold">Programare salvată cu succes în Calendar și Follow-ups!</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  Anulează
                </button>

                <button
                  type="submit"
                  disabled={isSaving || saveSuccess}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-60 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Se salvează...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvat!</span>
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Confirmă Programarea</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
