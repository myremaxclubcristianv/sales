'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  Home,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  User,
  ArrowUpDown,
  FileSpreadsheet,
  Tag,
  ShieldCheck,
  CalendarClock,
  Clock,
  MessageCircle,
} from 'lucide-react'
import type { ChestertonsRequest, ChestertonsMetrics } from '@/lib/db/chestertons-requests'
import {
  CHESTERTONS_CRM_STATUSES,
  type ChestertonsCrmStatus,
} from '@/lib/types/chestertons-workflow'
import { ChestertonsStatusSelect } from '@/components/ChestertonsStatusSelect'

interface ChestertonsRequestsViewProps {
  initialRequests: ChestertonsRequest[]
  metrics: ChestertonsMetrics
}

export function ChestertonsRequestsView({
  initialRequests,
  metrics: initialMetrics,
}: ChestertonsRequestsViewProps) {
  const [requestsList, setRequestsList] = useState<ChestertonsRequest[]>(initialRequests)
  const [search, setSearch] = useState('')
  const [selectedCrmStatus, setSelectedCrmStatus] = useState<string>('ALL')
  const [selectedSourceStatusTab, setSelectedSourceStatusTab] = useState<'ALL' | 'Activa' | 'Retrasa'>('ALL')
  const [selectedTypeTab, setSelectedTypeTab] = useState<'ALL' | 'Apartament' | 'Casa'>('ALL')
  const [selectedSursa, setSelectedSursa] = useState<string>('ALL')
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'id' | 'buget' | 'date' | 'status'>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const pageSize = 25

  // List of all unique sources for dropdown
  const uniqueSources = useMemo(() => {
    const set = new Set<string>()
    requestsList.forEach((r) => {
      if (r.sursa && r.sursa.trim()) set.add(r.sursa.trim())
    })
    return Array.from(set).sort()
  }, [requestsList])

  // List of all unique agents
  const uniqueAgents = useMemo(() => {
    const set = new Set<string>()
    requestsList.forEach((r) => {
      if (r.agent && r.agent.trim()) set.add(r.agent.trim())
    })
    return Array.from(set).sort()
  }, [requestsList])

  // Dynamic CRM Status counts
  const crmStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    requestsList.forEach((r) => {
      const st = r.crm_status || 'NESUNAT'
      counts[st] = (counts[st] || 0) + 1
    })
    return counts
  }, [requestsList])

  const handleRowStatusChange = (requestId: string, newStatus: ChestertonsCrmStatus) => {
    setRequestsList((prev) =>
      prev.map((r) =>
        r.import_source_id === requestId
          ? { ...r, crm_status: newStatus }
          : r
      )
    )
  }

  // Filter & Sort Logic
  const filteredRequests = useMemo(() => {
    return requestsList
      .filter((r) => {
        // CRM Status filter
        if (selectedCrmStatus !== 'ALL') {
          const rStatus = r.crm_status || 'NESUNAT'
          if (rStatus !== selectedCrmStatus) return false
        }

        // Source Status tab filter (Activa / Retrasa)
        if (selectedSourceStatusTab !== 'ALL') {
          if (r.parsed_status !== selectedSourceStatusTab) return false
        }

        // Lead type filter
        if (selectedTypeTab !== 'ALL') {
          if (r.tip_lead !== selectedTypeTab) return false
        }

        // Sursa filter
        if (selectedSursa !== 'ALL') {
          if (selectedSursa === 'BLANK') {
            if (r.sursa && r.sursa.trim() !== '') return false
          } else if (r.sursa !== selectedSursa) {
            return false
          }
        }

        // Agent filter
        if (selectedAgent !== 'ALL') {
          if (r.agent !== selectedAgent) return false
        }

        // Free-text Search
        if (search.trim()) {
          const q = search.trim().toLowerCase()
          const matches =
            r.cumparator.toLowerCase().includes(q) ||
            (r.email && r.email.toLowerCase().includes(q)) ||
            (r.telefon && r.telefon.toLowerCase().includes(q)) ||
            r.import_source_id.toLowerCase().includes(q) ||
            (r.id_intern && r.id_intern.toLowerCase().includes(q)) ||
            (r.agent && r.agent.toLowerCase().includes(q)) ||
            (r.oras && r.oras.toLowerCase().includes(q)) ||
            (r.sursa && r.sursa.toLowerCase().includes(q)) ||
            (r.titlu && r.titlu.toLowerCase().includes(q)) ||
            (r.observatii && r.observatii.toLowerCase().includes(q)) ||
            (r.crm_status && r.crm_status.toLowerCase().includes(q))
          if (!matches) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'id') {
          const res = a.import_source_id.localeCompare(b.import_source_id, undefined, { numeric: true })
          return sortOrder === 'asc' ? res : -res
        } else if (sortBy === 'buget') {
          const bA = a.parsed_buget2 || a.parsed_buget1 || 0
          const bB = b.parsed_buget2 || b.parsed_buget1 || 0
          return sortOrder === 'asc' ? bA - bB : bB - bA
        } else if (sortBy === 'date') {
          const dA = a.data_adaugare ? new Date(a.data_adaugare).getTime() : 0
          const dB = b.data_adaugare ? new Date(b.data_adaugare).getTime() : 0
          return sortOrder === 'asc' ? dA - dB : dB - dA
        } else if (sortBy === 'status') {
          const sA = a.crm_status || 'NESUNAT'
          const sB = b.crm_status || 'NESUNAT'
          return sortOrder === 'asc' ? sA.localeCompare(sB) : sB.localeCompare(sA)
        }
        return 0
      })
  }, [
    requestsList,
    selectedCrmStatus,
    selectedSourceStatusTab,
    selectedTypeTab,
    selectedSursa,
    selectedAgent,
    search,
    sortBy,
    sortOrder,
  ])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1
  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, page, pageSize])

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

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cereri Chestertons
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              CRM Workflow Activ
            </span>
            <span className="text-xs text-slate-400">229 cereri</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cereri Chestertons — Workflow & Management Vânzări
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Gestionează statusul de contact (Nesunat, Am vorbit, Follow-up, Interesat, Vizionare, etc.), notițele și jurnalul de apeluri direct pe cererile preluate din importul Chestertons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            Grup import: <strong className="text-slate-900 dark:text-white">REAL_ESTATE_CHESTERTONS_REQUESTS</strong>
          </div>
        </div>
      </div>

      {/* Dynamic CRM Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('ALL')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'ALL'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Toate Cererile</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            {requestsList.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total Înregistrări</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('NESUNAT')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'NESUNAT'
              ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Nesunat</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-slate-200">
            {crmStatusCounts['NESUNAT'] || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Necontactat</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('AM_VORBIT')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'AM_VORBIT'
              ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 dark:border-blue-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center justify-between">
            <span>Am vorbit</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {crmStatusCounts['AM_VORBIT'] || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Conversație efectuată</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('FOLLOW_UP')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'FOLLOW_UP'
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Follow-up</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {crmStatusCounts['FOLLOW_UP'] || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Revenire programată</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('INTERESAT')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'INTERESAT'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Interesat</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {crmStatusCounts['INTERESAT'] || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Calificat pozitiv</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCrmStatus('VIZIONARE')
            setPage(1)
          }}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            selectedCrmStatus === 'VIZIONARE'
              ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 dark:border-purple-800 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center justify-between">
            <span>Vizionare / Deal</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(crmStatusCounts['VIZIONARE'] || 0) + (crmStatusCounts['PROGRAMARE'] || 0) + (crmStatusCounts['OFERTA'] || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">În desfășurare</div>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Row 1: CRM Status Select & Source Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-1">
              Filtru CRM Status:
            </span>
            <select
              value={selectedCrmStatus}
              onChange={(e) => {
                setSelectedCrmStatus(e.target.value)
                setPage(1)
              }}
              className="py-1.5 px-3 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="ALL">Toate Statusurile CRM ({requestsList.length})</option>
              {CHESTERTONS_CRM_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label} ({crmStatusCounts[st.value] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Tip Lead:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTypeTab('ALL')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedTypeTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Toate
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTypeTab('Apartament')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedTypeTab === 'Apartament'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Apartamente (120)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTypeTab('Casa')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedTypeTab === 'Casa'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Case (109)
            </button>
          </div>
        </div>

        {/* Row 2: Search input + Sursa + Agent + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Căutare cumpărător, tel, email, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sursa Dropdown */}
          <div>
            <select
              value={selectedSursa}
              onChange={(e) => {
                setSelectedSursa(e.target.value)
                setPage(1)
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">Toate Sursele Originale ({uniqueSources.length})</option>
              {uniqueSources.map((s) => (
                <option key={s} value={s}>
                  {s} ({initialMetrics.sourceBreakdown[s] || 0})
                </option>
              ))}
              <option value="BLANK">Fără sursă specificată ({initialMetrics.sourceBreakdown['Nespecificat'] || 0})</option>
            </select>
          </div>

          {/* Agent Dropdown */}
          <div>
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value)
                setPage(1)
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">Toți Agenții ({uniqueAgents.length})</option>
              {uniqueAgents.map((ag) => (
                <option key={ag} value={ag}>
                  {ag} ({initialMetrics.agentBreakdown[ag] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'id' | 'buget' | 'date' | 'status')}
              className="flex-1 py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="id">Sortare după ID Sursă</option>
              <option value="status">Sortare după CRM Status</option>
              <option value="buget">Sortare după Buget Max</option>
              <option value="date">Sortare după Data Adăugare</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
              title={`Directie sortare: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results summary counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div>
            Afișare <strong>{paginatedRequests.length}</strong> din <strong>{filteredRequests.length}</strong> cereri filtrate (Total: {requestsList.length})
          </div>
          {(selectedCrmStatus !== 'ALL' || selectedSourceStatusTab !== 'ALL' || selectedTypeTab !== 'ALL' || selectedSursa !== 'ALL' || selectedAgent !== 'ALL' || search) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCrmStatus('ALL')
                setSelectedSourceStatusTab('ALL')
                setSelectedTypeTab('ALL')
                setSelectedSursa('ALL')
                setSelectedAgent('ALL')
                setSearch('')
                setPage(1)
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              Resetează toate filtrele
            </button>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {paginatedRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Nicio cerere găsită
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Nu există cereri Chestertons care să corespundă criteriilor de filtrare selectate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID / Ref</th>
                  <th className="py-3.5 px-4">Cumpărător</th>
                  <th className="py-3.5 px-4">CRM Status (Editabil)</th>
                  <th className="py-3.5 px-4">Tip / Cerere</th>
                  <th className="py-3.5 px-4">Buget</th>
                  <th className="py-3.5 px-4">Ultimul Contact</th>
                  <th className="py-3.5 px-4">Sursa</th>
                  <th className="py-3.5 px-4 text-right">Acțiuni Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {paginatedRequests.map((req) => {
                  const isApartment = req.tip_lead === 'Apartament'
                  const cleanPhone = req.telefon?.replace(/\D/g, '') || ''
                  const waPhone = cleanPhone.startsWith('0')
                    ? '4' + cleanPhone
                    : cleanPhone.startsWith('7')
                    ? '40' + cleanPhone
                    : cleanPhone

                  return (
                    <tr
                      key={req.import_source_id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Col 1: ID / Ref */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <Link
                          href={`/admin/requests/chestertons/${req.import_source_id}`}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          {req.import_source_id}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                        {req.id_intern && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {req.id_intern}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {req.data_adaugare?.split(' ')[0] || ''}
                        </div>
                      </td>

                      {/* Col 2: Buyer */}
                      <td className="py-3.5 px-4 align-top">
                        <Link
                          href={`/admin/requests/chestertons/${req.import_source_id}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{req.cumparator}</span>
                        </Link>
                        <div className="mt-1 space-y-0.5 text-xs">
                          {req.telefon && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-mono text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              {req.telefon}
                            </a>
                          )}
                          {req.email && (
                            <div className="truncate max-w-[180px]">
                              <a
                                href={`mailto:${req.email}`}
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-[11px]"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                {req.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col 3: Interactive CRM Status Select */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <ChestertonsStatusSelect
                          requestId={req.import_source_id}
                          currentStatus={req.crm_status || 'NESUNAT'}
                          size="sm"
                          onStatusChange={(newStatus) =>
                            handleRowStatusChange(req.import_source_id, newStatus)
                          }
                        />
                      </td>

                      {/* Col 4: Lead Type & Criteria */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                              isApartment
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                            }`}
                          >
                            {isApartment ? (
                              <Building2 className="w-3 h-3" />
                            ) : (
                              <Home className="w-3 h-3" />
                            )}
                            {req.tip_lead}
                          </span>
                          {req.nr_camere && (
                            <span className="text-xs text-slate-500 font-medium">
                              • {req.nr_camere} cam
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {req.titlu || `${req.oras || 'Bucuresti'}`}
                        </div>
                      </td>

                      {/* Col 5: Budget */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {req.buget2 ? (
                            <span>{formatCurrency(req.buget2)}</span>
                          ) : req.buget1 ? (
                            <span>{formatCurrency(req.buget1)}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">Nespecificat</span>
                          )}
                        </div>
                      </td>

                      {/* Col 6: Last Contact & Follow-up */}
                      <td className="py-3.5 px-4 align-top text-xs whitespace-nowrap">
                        {req.last_contact_at ? (
                          <div className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>
                              {new Date(req.last_contact_at).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                        {req.next_follow_up_at && (
                          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                            <CalendarClock className="w-3 h-3" />
                            <span>
                              {new Date(req.next_follow_up_at).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Col 7: Original Source */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{req.sursa || 'Nespecificat'}</span>
                        </div>
                      </td>

                      {/* Col 8: Quick Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.telefon && (
                            <>
                              <a
                                href={`tel:${cleanPhone}`}
                                title={`Apelează ${req.telefon}`}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Trimite WhatsApp"
                                className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          <Link
                            href={`/admin/requests/chestertons/${req.import_source_id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-lg text-xs font-bold transition"
                          >
                            <span>Workflow</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Pagina <strong>{page}</strong> din <strong>{totalPages}</strong> ({filteredRequests.length} cereri)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5 && page > 3) {
                    pageNum = page - 2 + i
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
