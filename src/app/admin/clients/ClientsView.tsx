'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuickClientModal } from '@/components/QuickClientModal'
import { ClientStatusSelect } from '@/components/ClientStatusSelect'
import { ClientQuickNotePopover } from '@/components/ClientQuickNotePopover'
import { ClientQuickScheduleModal } from '@/components/ClientQuickScheduleModal'
import {
  CLIENT_SOURCES,
  CLIENT_STATUSES,
  getCategoryLabel,
  getSourceLabel,
  type ClientCategory,
} from '@/lib/types/crm'
import { formatPhoneDisplay, getTelUrl, getWhatsAppUrl } from '@/lib/utils/phone'
import type { ClientWithRelations } from '@/lib/db/clients'
import {
  Sparkles,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Shield,
  CreditCard,
  Clock,
  MessageSquare,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'

interface ClientsViewProps {
  initialClients: ClientWithRelations[]
  initialCategory?: string
  initialQuickFilter?: string
  initialSearch?: string
  initialStatus?: string
  initialSource?: string
}

export function ClientsView({
  initialClients,
  initialCategory = 'ALL',
  initialQuickFilter = '',
  initialSearch = '',
  initialStatus = '',
  initialSource = '',
}: ClientsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [quickClientOpen, setQuickClientOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>(initialQuickFilter)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [sourceFilter, setSourceFilter] = useState(initialSource)
  const [showAllStatusFilters, setShowAllStatusFilters] = useState(false)

  // Real database-derived metric counts
  const totalCount = initialClients.length
  const realEstateCount = initialClients.filter((c) => (c.category || '').toUpperCase() === 'REAL_ESTATE').length
  const insuranceCount = initialClients.filter((c) => (c.category || '').toUpperCase() === 'INSURANCE').length
  const creditCount = initialClients.filter((c) => (c.category || '').toUpperCase() === 'CREDIT').length

  const updateFilters = (newParams: {
    category?: string
    quickFilter?: string
    search?: string
    status?: string
    source?: string
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== 'ALL') {
        params.set('category', newParams.category)
      } else {
        params.delete('category')
      }
    }

    if (newParams.quickFilter !== undefined) {
      if (newParams.quickFilter) {
        params.set('quickFilter', newParams.quickFilter)
      } else {
        params.delete('quickFilter')
      }
    }

    if (newParams.search !== undefined) {
      if (newParams.search) {
        params.set('search', newParams.search)
      } else {
        params.delete('search')
      }
    }

    if (newParams.status !== undefined) {
      if (newParams.status) {
        params.set('status', newParams.status)
      } else {
        params.delete('status')
      }
    }

    if (newParams.source !== undefined) {
      if (newParams.source) {
        params.set('source', newParams.source)
      } else {
        params.delete('source')
      }
    }

    startTransition(() => {
      router.push(`/admin/clients?${params.toString()}`)
    })
  }

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat)
    updateFilters({ category: cat })
  }

  const handleStatusFilterSelect = (st: string) => {
    const nextVal = statusFilter === st ? '' : st
    setStatusFilter(nextVal)
    updateFilters({ status: nextVal })
  }

  const handleQuickFilterSelect = (qf: string) => {
    const nextVal = activeQuickFilter === qf ? '' : qf
    setActiveQuickFilter(nextVal)
    updateFilters({ quickFilter: nextVal })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchTerm, status: statusFilter, source: sourceFilter })
  }

  const handleResetFilters = () => {
    setActiveCategory('ALL')
    setActiveQuickFilter('')
    setSearchTerm('')
    setStatusFilter('')
    setSourceFilter('')
    startTransition(() => {
      router.push('/admin/clients')
    })
  }

  const quickFilterOptions = [
    { id: 'no_followup', label: 'Fără interacțiune viitoare' },
    { id: 'followup_today', label: 'Follow-up astăzi' },
    { id: 'followup_overdue', label: 'Follow-up întârziat' },
    { id: 'new_clients', label: 'Clienți noi (ultimele 7 zile)' },
  ]

  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1

  return (
    <div className="space-y-5">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Clienți CRM
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {totalCount} {totalCount === 1 ? 'client' : 'clienți'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Gestiune unificată 360° pe Real Estate, Asigurări și Credite.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQuickClientOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Client rapid</span>
          </button>

          <Link href="/admin/clients/new" className="flex-1 sm:flex-none">
            <button
              type="button"
              className="w-full px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Formular complet</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleCategorySelect('ALL')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>TOȚI</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
              activeCategory === 'ALL'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySelect('REAL_ESTATE')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer ${
            activeCategory === 'REAL_ESTATE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>REAL ESTATE</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
              activeCategory === 'REAL_ESTATE'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {realEstateCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySelect('INSURANCE')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer ${
            activeCategory === 'INSURANCE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>INSURANCE</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
              activeCategory === 'INSURANCE'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {insuranceCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySelect('CREDIT')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] cursor-pointer ${
            activeCategory === 'CREDIT'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>CREDITE</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
              activeCategory === 'CREDIT'
                ? 'bg-amber-700 text-white'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {creditCount}
          </span>
        </button>
      </div>

      {/* 3. Status Filter Bar (Quick Operational Status Filters) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
        {/* Status Pills Horizontal Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Status Operațional:
            </span>
            <button
              type="button"
              onClick={() => setShowAllStatusFilters((prev) => !prev)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showAllStatusFilters ? 'Mai puține statusuri' : 'Toate statusurile (16)'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStatusFilterSelect('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === ''
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              TOATE STATUSURILE
            </button>

            {CLIENT_STATUSES.slice(0, showAllStatusFilters ? CLIENT_STATUSES.length : 8).map((st) => {
              const isSelected = statusFilter === st.id
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusFilterSelect(st.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? `${st.badgeBg} ${st.badgeText} ${st.badgeBorder} ring-2 ring-blue-500/20 shadow-2xs`
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                  <span>{st.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search & Select Filters Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după nume, telefon, email, nevoie..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-slate-900 placeholder:text-slate-400 font-medium transition-colors min-h-[42px]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                updateFilters({ status: e.target.value })
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-slate-900 font-medium transition-colors min-h-[42px]"
            >
              <option value="">Toate statusurile (16)</option>
              {CLIENT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value)
                updateFilters({ source: e.target.value })
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden text-slate-900 font-medium transition-colors min-h-[42px]"
            >
              <option value="">Toate sursele</option>
              {CLIENT_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs min-h-[42px] cursor-pointer"
            >
              Filtrează
            </button>

            {(searchTerm || statusFilter || sourceFilter || activeQuickFilter || activeCategory !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors flex items-center justify-center min-h-[42px] cursor-pointer"
                title="Resetează toate filtrele"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Quick Filter Sub-Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filtre rapide:</span>
          {quickFilterOptions.map((qf) => {
            const isSelected = activeQuickFilter === qf.id
            return (
              <button
                key={qf.id}
                type="button"
                onClick={() => handleQuickFilterSelect(qf.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {qf.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Master Client Table / Responsive Cards */}
      {initialClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Niciun client găsit conform filtrelor
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
            Încearcă să resetezi filtrele sau adaugă un client nou folosind butonul rapid.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setQuickClientOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              + Client rapid
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Master Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-3">Nume & Contact</th>
                  <th className="py-3.5 px-3">Status Operațional</th>
                  <th className="py-3.5 px-3">Categorie</th>
                  <th className="py-3.5 px-3">Ce dorește</th>
                  <th className="py-3.5 px-3">Sursă</th>
                  <th className="py-3.5 px-3">Ultima interacțiune</th>
                  <th className="py-3.5 px-3">Următoarea</th>
                  <th className="py-3.5 px-3">Creat</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialClients.map((client) => {
                  const clientCategory = (client.category || 'REAL_ESTATE').toUpperCase()
                  const categoryBadge =
                    clientCategory === 'INSURANCE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : clientCategory === 'CREDIT'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'

                  // Latest activity
                  const activities = client.activities || []
                  const latestActivity = activities.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0]

                  // Next pending follow-up
                  const pendingFollowUps = (client.follow_ups || []).filter((f) => f.status === 'PENDING')
                  const nextFollowUp = pendingFollowUps.sort(
                    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                  )[0]

                  let followUpStatusBadge = null
                  if (nextFollowUp) {
                    const dueTime = new Date(nextFollowUp.due_date).getTime()
                    const isOverdue = dueTime < todayStart
                    const isToday = dueTime >= todayStart && dueTime <= todayEnd
                    const dueFormatted = new Date(nextFollowUp.due_date).toLocaleDateString('ro-RO', {
                      day: 'numeric',
                      month: 'short',
                    })

                    followUpStatusBadge = (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isToday
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isOverdue ? `Întârziat (${dueFormatted})` : isToday ? 'Astăzi' : dueFormatted}
                      </span>
                    )
                  }

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 pl-6 pr-3">
                        <Link href={`/admin/clients/${client.id}`} className="block">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {client.first_name?.[0] || 'C'}{client.last_name?.[0] || 'V'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block text-sm">
                                {client.first_name} {client.last_name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5 font-medium">
                                {client.phone && (
                                  <span className="font-mono flex items-center gap-1 text-slate-700">
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    {formatPhoneDisplay(client.phone)}
                                  </span>
                                )}
                                {client.email && (
                                  <span className="flex items-center gap-1 text-slate-600">
                                    <Mail className="w-2.5 h-2.5 text-slate-400" />
                                    {client.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Status with Inline Quick Change */}
                      <td className="py-3.5 px-3">
                        <ClientStatusSelect
                          clientId={client.id}
                          currentStatus={client.status}
                          size="sm"
                          onStatusChange={() => router.refresh()}
                        />
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${categoryBadge}`}
                        >
                          {clientCategory === 'REAL_ESTATE' && <Building2 className="w-3 h-3" />}
                          {clientCategory === 'INSURANCE' && <Shield className="w-3 h-3" />}
                          {clientCategory === 'CREDIT' && <CreditCard className="w-3 h-3" />}
                          <span>{getCategoryLabel(client.category)}</span>
                        </span>
                      </td>

                      {/* Ce dorește / interest_summary */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="text-xs text-slate-800 line-clamp-2 font-medium">
                          {client.interest_summary || client.personal_notes || (
                            <span className="text-slate-400 italic">Nespecificat</span>
                          )}
                        </p>
                      </td>

                      {/* Sursă */}
                      <td className="py-3.5 px-3">
                        <span className="text-xs text-slate-700 font-medium">
                          {getSourceLabel(client.lead_source)}
                        </span>
                      </td>

                      {/* Ultima interacțiune */}
                      <td className="py-3.5 px-3">
                        {latestActivity ? (
                          <div className="text-[11px]">
                            <span className="font-semibold text-slate-800 block">
                              {latestActivity.type}
                            </span>
                            <span className="text-slate-500 text-[10px] font-medium">
                              {new Date(latestActivity.date).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Următoarea interacțiune */}
                      <td className="py-3.5 px-3">{followUpStatusBadge || <span className="text-slate-400 text-[11px]">-</span>}</td>

                      {/* Creat */}
                      <td className="py-3.5 px-3 text-[11px] text-slate-600 font-medium">
                        {new Date(client.created_at).toLocaleDateString('ro-RO')}
                      </td>

                      {/* Acțiuni */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ClientQuickNotePopover
                            clientId={client.id}
                            clientName={`${client.first_name || ''} ${client.last_name || ''}`.trim()}
                            phone={client.phone ? formatPhoneDisplay(client.phone) : null}
                          />
                          <ClientQuickScheduleModal
                            clientId={client.id}
                            clientName={`${client.first_name || ''} ${client.last_name || ''}`.trim()}
                            phone={client.phone ? formatPhoneDisplay(client.phone) : null}
                            className="min-h-[36px] min-w-[36px] p-2"
                            onScheduled={() => router.refresh()}
                          />
                          {client.phone && (
                            <a
                              href={getWhatsAppUrl(client.whatsapp || client.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Deschide WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-0.5 min-h-[36px]"
                          >
                            <span>Profil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Client Cards View (1-3 taps parity) */}
          <div className="lg:hidden divide-y-2 divide-slate-200/90 dark:divide-neutral-800">
            {initialClients.map((client) => {
              const clientCategory = (client.category || 'REAL_ESTATE').toUpperCase()

              // Latest activity
              const activities = client.activities || []
              const latestActivity = activities.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0]

              // Next pending follow-up
              const pendingFollowUps = (client.follow_ups || []).filter((f) => f.status === 'PENDING')
              const nextFollowUp = pendingFollowUps.sort(
                (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
              )[0]

              return (
                <div key={client.id} className="p-4 sm:p-5 space-y-3 bg-white dark:bg-neutral-900 border-b-2 border-slate-200/90 dark:border-neutral-800 last:border-b-0">
                  {/* Card Header: Client Name + Category + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {client.first_name?.[0] || 'C'}{client.last_name?.[0] || 'V'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate hover:text-blue-600 transition-colors">
                          {client.first_name} {client.last_name}
                        </h3>
                        <p className="text-xs text-slate-600 font-mono mt-0.5 font-medium truncate">
                          {client.phone ? formatPhoneDisplay(client.phone) : client.email || '-'}
                        </p>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          clientCategory === 'INSURANCE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : clientCategory === 'CREDIT'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {getCategoryLabel(client.category)}
                      </span>
                    </div>
                  </div>

                  {/* Operational Status Quick Change on Mobile Card */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Status:
                    </span>
                    <ClientStatusSelect
                      clientId={client.id}
                      currentStatus={client.status}
                      size="sm"
                      align="right"
                      onStatusChange={() => router.refresh()}
                    />
                  </div>

                  {/* Interest Summary / Personal Notes */}
                  {(client.interest_summary || client.personal_notes) && (
                    <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-800 font-medium">
                      💡 {client.interest_summary || client.personal_notes}
                    </div>
                  )}

                  {/* Meta Details: Source + Last Activity + Next Follow-up */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Sursă:</span>
                      <strong className="text-slate-800 font-semibold">{getSourceLabel(client.lead_source)}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ultima interacțiune:</span>
                      <span className="text-slate-800 font-medium">
                        {latestActivity
                          ? `${latestActivity.type} (${new Date(latestActivity.date).toLocaleDateString('ro-RO')})`
                          : '-'}
                      </span>
                    </div>

                    {nextFollowUp && (
                      <div className="col-span-2 flex items-center gap-1.5 text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          Follow-up: <strong>{nextFollowUp.reason}</strong> (
                          {new Date(nextFollowUp.due_date).toLocaleDateString('ro-RO')})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Actions Bar (min 44px touch targets) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ClientQuickNotePopover
                        clientId={client.id}
                        clientName={`${client.first_name || ''} ${client.last_name || ''}`.trim()}
                        phone={client.phone ? formatPhoneDisplay(client.phone) : null}
                        className="min-h-[44px] min-w-[44px] border border-slate-200 bg-slate-100"
                      />
                      <ClientQuickScheduleModal
                        clientId={client.id}
                        clientName={`${client.first_name || ''} ${client.last_name || ''}`.trim()}
                        phone={client.phone ? formatPhoneDisplay(client.phone) : null}
                        className="min-h-[44px] min-w-[44px] border border-slate-200 bg-slate-100"
                        onScheduled={() => router.refresh()}
                      />
                      {client.phone && (
                        <a
                          href={getTelUrl(client.phone)}
                          className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-200 min-h-[44px] cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                          <span>Sună</span>
                        </a>
                      )}
                      {client.phone && (
                        <a
                          href={getWhatsAppUrl(client.whatsapp || client.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <span>Vezi profil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Client Modal */}
      <QuickClientModal
        isOpen={quickClientOpen}
        onClose={() => setQuickClientOpen(false)}
        initialCategory={activeCategory !== 'ALL' ? (activeCategory as ClientCategory) : 'INSURANCE'}
        onSuccess={() => {
          setQuickClientOpen(false)
          router.refresh()
        }}
      />
    </div>
  )
}
