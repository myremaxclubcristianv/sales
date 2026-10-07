'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  Home,
  CheckCircle2,
  XCircle,
  MapPin,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  Tag,
  Code,
  MessageSquare,
  Clock,
  Send,
  CalendarClock,
  MessageCircle,
  PhoneCall,
  FileCheck2,
  Sparkles,
  Loader2,
} from 'lucide-react'
import type { ChestertonsRequest } from '@/lib/db/chestertons-requests'
import {
  type ChestertonsCrmStatus,
  type ChestertonsActivityItem,
  type ChestertonsActivityType,
} from '@/lib/types/chestertons-workflow'
import { ChestertonsStatusSelect } from '@/components/ChestertonsStatusSelect'

interface ChestertonsRequestDetailViewProps {
  request: ChestertonsRequest
}

export function ChestertonsRequestDetailView({ request }: ChestertonsRequestDetailViewProps) {
  const [crmStatus, setCrmStatus] = useState<ChestertonsCrmStatus>(
    (request.crm_status as ChestertonsCrmStatus) || 'NESUNAT'
  )
  const [lastContactAt, setLastContactAt] = useState<string | null>(request.last_contact_at || null)
  const [nextFollowUpAt, setNextFollowUpAt] = useState<string | null>(request.next_follow_up_at || null)
  const [activities, setActivities] = useState<ChestertonsActivityItem[]>(request.activities || [])

  // Note Composer state
  const [selectedActivityType, setSelectedActivityType] = useState<ChestertonsActivityType>('NOTE')
  const [noteText, setNoteText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [followUpDateInput, setFollowUpDateInput] = useState('')
  const [savingFollowUp, setSavingFollowUp] = useState(false)

  const isActive = request.parsed_status === 'Activa'
  const isRetracted = request.parsed_status === 'Retrasa'
  const isApartment = request.tip_lead === 'Apartament'

  const cleanPhone = request.telefon?.replace(/\D/g, '') || ''
  const waPhone = cleanPhone.startsWith('0')
    ? '4' + cleanPhone
    : cleanPhone.startsWith('7')
    ? '40' + cleanPhone
    : cleanPhone

  const formatCurrency = (val: string | null) => {
    if (!val) return '—'
    const num = Number(val.replace(/,/g, ''))
    if (isNaN(num)) return val
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleStatusChange = (newStatus: ChestertonsCrmStatus) => {
    setCrmStatus(newStatus)
    // Add local status change activity to timeline
    const statusActivity: ChestertonsActivityItem = {
      id: `local-status-${Date.now()}`,
      request_id: request.import_source_id,
      activity_type: 'STATUS_CHANGE',
      status_from: crmStatus,
      status_to: newStatus,
      note: `Status modificat: ${crmStatus} → ${newStatus}`,
      created_at: new Date().toISOString(),
      created_by: 'Agent CRM',
    }
    setActivities([statusActivity, ...activities])
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim() || isSubmitting) return

    setIsSubmitting(true)
    const nowIso = new Date().toISOString()

    try {
      const res = await fetch(`/api/requests/chestertons/${request.import_source_id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: selectedActivityType,
          note: noteText.trim(),
        }),
      })

      if (res.ok) {
        const createdActivity = await res.json()
        setActivities([createdActivity, ...activities])
        setNoteText('')

        // If contact action, update last contact
        if (['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'VIEWING'].includes(selectedActivityType)) {
          setLastContactAt(nowIso)
        }
      }
    } catch (err) {
      console.error('Failed to save activity:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveFollowUp = async (dateVal: string | null) => {
    setSavingFollowUp(true)
    try {
      const res = await fetch(`/api/requests/chestertons/${request.import_source_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ next_follow_up_at: dateVal }),
      })

      if (res.ok) {
        setNextFollowUpAt(dateVal)
        if (dateVal) {
          const followUpAct: ChestertonsActivityItem = {
            id: `local-fu-${Date.now()}`,
            request_id: request.import_source_id,
            activity_type: 'FOLLOW_UP',
            note: `Follow-up programat pentru: ${new Date(dateVal).toLocaleString('ro-RO')}`,
            created_at: new Date().toISOString(),
            created_by: 'Agent CRM',
          }
          setActivities([followUpAct, ...activities])
        }
      }
    } catch (err) {
      console.error('Failed to update follow-up:', err)
    } finally {
      setSavingFollowUp(false)
      setFollowUpDateInput('')
    }
  }

  const renderField = (label: string, value: string | null | undefined, hint?: string) => (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60">
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white break-words">
        {value && value.trim() ? value : <span className="text-slate-400 font-normal italic">—</span>}
      </div>
      {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  )

  const getActivityIcon = (type: ChestertonsActivityType) => {
    switch (type) {
      case 'CALL':
        return <PhoneCall className="w-4 h-4 text-blue-500" />
      case 'WHATSAPP':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-indigo-500" />
      case 'FOLLOW_UP':
        return <CalendarClock className="w-4 h-4 text-amber-500" />
      case 'STATUS_CHANGE':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'VIEWING':
        return <Building2 className="w-4 h-4 text-cyan-500" />
      case 'OFFER':
        return <FileCheck2 className="w-4 h-4 text-teal-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/requests/chestertons"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la toate Cererile Chestertons</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cereri Chestertons
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : isRetracted
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
            title="Status original din fișierul CSV importat"
          >
            {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            Sursă: {request.status_cerere || 'Blank'}
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                ID: {request.import_source_id}
              </span>
              {request.id_intern && (
                <span className="font-mono text-slate-400">
                  • Id Intern: {request.id_intern}
                </span>
              )}
              <span>• Rând {request.source_row_index} din {request.source_file.includes('1138618') ? 'Fișier 1 (Apartamente)' : 'Fișier 2 (Case)'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <User className="w-7 h-7 text-blue-600 flex-shrink-0" />
              <span>{request.cumparator}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                  isApartment
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                {isApartment ? <Building2 className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                {request.tip_lead} ({request.tip_cerere || 'Cumparare'})
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Sursa: {request.sursa || 'Nespecificat'}
              </span>

              {request.agent && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Agent: {request.agent}
                </span>
              )}
            </div>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex flex-wrap md:flex-col items-stretch gap-2 min-w-[200px]">
            {request.telefon ? (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Apelează ({request.telefon})</span>
                </a>

                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </>
            ) : (
              <div className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs text-center">
                Fără telefon
              </div>
            )}

            {request.email && (
              <a
                href={`mailto:${request.email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email ({request.email})</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CRM WORKFLOW CONTROL & ACTIVITY TIMELINE (TOP PRIORITY) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CRM Workflow Status & Follow-up Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>CRM Workflow & Stare Vânzări</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestionează ciclul de vânzare direct pe cererea clientului
            </p>
          </div>

          {/* Status Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Status Vânzări (CRM)
            </label>
            <ChestertonsStatusSelect
              requestId={request.import_source_id}
              currentStatus={crmStatus}
              size="lg"
              className="w-full"
              onStatusChange={handleStatusChange}
            />
            <p className="text-[11px] text-slate-400">
              Modificarea statusului se salvează automat și este înregistrată în jurnalul de activități.
            </p>
          </div>

          {/* Last Contact Info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Ultimul Contact Înregistrat</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {lastContactAt
                ? new Date(lastContactAt).toLocaleString('ro-RO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : <span className="text-slate-400 font-normal italic">Niciun apel/contact înregistrat</span>}
            </div>
          </div>

          {/* Next Follow-Up Date */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
              <span>Următorul Follow-up</span>
            </div>

            {nextFollowUpAt ? (
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">
                  {new Date(nextFollowUpAt).toLocaleString('ro-RO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveFollowUp(null)}
                  disabled={savingFollowUp}
                  className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Anulează
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Nu este programat un follow-up.</div>
            )}

            {/* Set Follow-up Form */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={followUpDateInput}
                  onChange={(e) => setFollowUpDateInput(e.target.value)}
                  className="flex-1 text-xs py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => followUpDateInput && handleSaveFollowUp(followUpDateInput)}
                  disabled={!followUpDateInput || savingFollowUp}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  {savingFollowUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Setează'}
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date()
                    d.setHours(d.getHours() + 2)
                    handleSaveFollowUp(d.toISOString())
                  }}
                  className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-300"
                >
                  Peste 2 ore
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date()
                    d.setDate(d.getDate() + 1)
                    d.setHours(10, 0, 0, 0)
                    handleSaveFollowUp(d.toISOString())
                  }}
                  className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-300"
                >
                  Mâine 10:00
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date()
                    d.setDate(d.getDate() + 3)
                    d.setHours(10, 0, 0, 0)
                    handleSaveFollowUp(d.toISOString())
                  }}
                  className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-300"
                >
                  Peste 3 zile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Activity Timeline & Composer */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Jurnal Activități & Notițe</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Istoric cronologic al conversațiilor, apelurilor și modificărilor de stare ({activities.length} înregistrări)
              </p>
            </div>
          </div>

          {/* Activity Composer */}
          <form onSubmit={handleAddActivity} className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Action Type Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Tip:</span>
              {[
                { type: 'NOTE' as ChestertonsActivityType, label: '+ Notă' },
                { type: 'CALL' as ChestertonsActivityType, label: '+ Apel' },
                { type: 'WHATSAPP' as ChestertonsActivityType, label: '+ WhatsApp' },
                { type: 'EMAIL' as ChestertonsActivityType, label: '+ Email' },
                { type: 'FOLLOW_UP' as ChestertonsActivityType, label: '+ Follow-up' },
                { type: 'VIEWING' as ChestertonsActivityType, label: '+ Vizionare' },
                { type: 'OFFER' as ChestertonsActivityType, label: '+ Ofertă' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => setSelectedActivityType(btn.type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedActivityType === btn.type
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Note Textarea */}
            <div>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  selectedActivityType === 'CALL'
                    ? 'Notează rezultatul apelului (ex: A răspuns, este interesat de 3 camere, revin mâine)...'
                    : selectedActivityType === 'WHATSAPP'
                    ? 'Notează detaliile mesajului WhatsApp trimis/primit...'
                    : selectedActivityType === 'VIEWING'
                    ? 'Detalii despre vizionarea programată / proprietatea vizionată...'
                    : 'Scrie o notiță internă despre client...'
                }
                className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Notițele sunt persistate securizat în baza de date.
              </span>
              <button
                type="submit"
                disabled={!noteText.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Salvează Activitatea</span>
              </button>
            </div>
          </form>

          {/* Chronological Timeline */}
          <div className="space-y-4 pt-2">
            {activities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nicio activitate înregistrată încă
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Folosește formularul de mai sus pentru a nota prima discuție sau apel cu acest client.
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      {getActivityIcon(act.activity_type)}
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            {act.activity_type.replace(/_/g, ' ')}
                          </span>
                          {act.created_by && (
                            <span className="text-[11px] text-slate-400">
                              • {act.created_by}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(act.created_at).toLocaleString('ro-RO', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pt-0.5">
                        {act.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ORIGINAL OBSERVATIONS FROM SOURCE FILE (Col 16) */}
      {/* ======================================================== */}
      {request.observatii && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>Observații Originale din Fișierul Importat (Col 16)</span>
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-sans leading-relaxed pl-6 border-l-2 border-amber-400">
            {request.observatii}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. STRUCTURED 38 SOURCE FIELDS (IMMUTABLE SOURCE DATA) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Identity & Request Specifics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Identitate & Criterii Cerere
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderField('1. ID (Cheie Primară)', request.id)}
            {renderField('37. Idintern', request.id_intern)}
            {renderField('6. Cumpărător', request.cumparator)}
            {renderField('7. Email', request.email)}
            {renderField('8. Telefon', request.telefon)}
            {renderField('9. Tip Lead', request.tip_lead)}
            {renderField('10. TipCerere', request.tip_cerere)}
            {renderField('38. StatusCerere (Sursă)', request.status_cerere)}
            <div className="sm:col-span-2">
              {renderField('5. Titlu Cerere', request.titlu)}
            </div>
          </div>
        </div>

        {/* Section 2: Location & Zoning */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Locație & Zonare
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderField('11. Județ', request.judet)}
            {renderField('12. Oraș', request.oras)}
            {renderField('13. Cartier', request.cartier)}
            {renderField('14. Zonă', request.zona)}
            {renderField('17. Tipteren', request.tip_teren)}
            {renderField('18. Destinație', request.destinatie)}
          </div>
        </div>

        {/* Section 3: Financial Requirements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Date Financiare & Bugete
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderField('20. Buget1 (Min)', request.buget1, request.buget1 ? formatCurrency(request.buget1) : undefined)}
            {renderField('21. Buget2 (Max)', request.buget2, request.buget2 ? formatCurrency(request.buget2) : undefined)}
            {renderField('22. TVA', request.tva)}
            {renderField('34. Bugetcredit', request.buget_credit)}
            {renderField('35. Pierdut', request.pierdut)}
          </div>
        </div>

        {/* Section 4: Property Technical Requirements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Specificații Tehnice & Suprafețe
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-3">
            {renderField('33. Nr Camere', request.nr_camere)}
            {renderField('24. Suprafață Utilă', request.suprafata_utila ? `${request.suprafata_utila} mp` : null)}
            {renderField('23. Suprafață Construită', request.suprafata_construita ? `${request.suprafata_construita} mp` : null)}
            {renderField('19. Suprafață Teren', request.suprafata_teren ? `${request.suprafata_teren} mp` : null)}
            {renderField('32. An Construcție', request.an_constructie)}
            {renderField('31. Locuri Parcare', request.locuri_de_parcare)}
            {renderField('25. Expunere', request.expunere)}
            {renderField('26. Vitrină', request.vitrina)}
            {renderField('27. Înălțime', request.inaltime)}
            {renderField('28. Suprafață Depozit', request.suprafata_depozit)}
            {renderField('29. Suprafață Birouri', request.suprafata_birouri)}
            {renderField('30. Suprafață Producție', request.suprafata_productie)}
          </div>
        </div>

        {/* Section 5: Metadata & Audit Trace */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5. Metadate & Proveniență Import
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {renderField('15. Sursa Originală', request.sursa)}
            {renderField('4. Agent Asignat', request.agent)}
            {renderField('2. Data Adăugare', request.data_adaugare)}
            {renderField('3. Date Modificare', request.date_modificare)}
            {renderField('36. Datalimita', request.data_limita)}
            {renderField('Grup Import', request.source_group_label)}
            {renderField('Cod Proveniență', request.source_group)}
            {renderField('Fișier CSV Sursă', request.source_file)}
          </div>
        </div>
      </div>

      {/* Raw JSON Source Data Inspector */}
      <details className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm group">
        <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-500" />
            <span>Vizualizare Payload Brut (Toate cele 38 de coloane originale)</span>
          </div>
          <span className="text-xs text-blue-600 group-open:rotate-180 transition transform">▼</span>
        </summary>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-96">
            {JSON.stringify(request.source_data, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  )
}
