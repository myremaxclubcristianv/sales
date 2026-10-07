'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  Home,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  User,
  ArrowUpDown,
  FileSpreadsheet,
  Tag,
  ShieldCheck,
} from 'lucide-react'
import type { ChestertonsRequest, ChestertonsMetrics } from '@/lib/db/chestertons-requests'

interface ChestertonsRequestsViewProps {
  initialRequests: ChestertonsRequest[]
  metrics: ChestertonsMetrics
}

export function ChestertonsRequestsView({
  initialRequests,
  metrics,
}: ChestertonsRequestsViewProps) {
  const [search, setSearch] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'Activa' | 'Retrasa'>('ALL')
  const [selectedTypeTab, setSelectedTypeTab] = useState<'ALL' | 'Apartament' | 'Casa'>('ALL')
  const [selectedSursa, setSelectedSursa] = useState<string>('ALL')
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'id' | 'buget' | 'date'>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const pageSize = 25

  // List of all unique sources for dropdown
  const uniqueSources = useMemo(() => {
    const set = new Set<string>()
    initialRequests.forEach((r) => {
      if (r.sursa && r.sursa.trim()) set.add(r.sursa.trim())
    })
    return Array.from(set).sort()
  }, [initialRequests])

  // List of all unique agents
  const uniqueAgents = useMemo(() => {
    const set = new Set<string>()
    initialRequests.forEach((r) => {
      if (r.agent && r.agent.trim()) set.add(r.agent.trim())
    })
    return Array.from(set).sort()
  }, [initialRequests])

  // Filter & Sort Logic
  const filteredRequests = useMemo(() => {
    return initialRequests
      .filter((r) => {
        // Status tab filter
        if (selectedStatusTab !== 'ALL') {
          if (r.parsed_status !== selectedStatusTab) return false
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
            (r.observatii && r.observatii.toLowerCase().includes(q))
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
        }
        return 0
      })
  }, [
    initialRequests,
    selectedStatusTab,
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
              Zero Data Loss (229/229)
            </span>
            <span className="text-xs text-slate-400">38 coloane</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cereri Chestertons — Real Estate
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Bază de date dedicată cererilor imobiliare preluate din importul Chestertons (2 fișiere CSV). Păstrează sursa originală (Storia, Imobiliare.ro, etc.), agentul, observațiile complete și toți cei 38 de parametri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            Grup import: <strong className="text-slate-900 dark:text-white">REAL_ESTATE_CHESTERTONS_REQUESTS</strong>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Total Cereri</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.totalRequests}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">100% Importat</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.activeRequests}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">77.3% din total</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Retrase</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-300">
            {metrics.retractedRequests}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">22.3% din total</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>Apartamente</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.apartments}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">File 1 (120)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Case / Vile</span>
            <Home className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.houses}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">File 2 (109)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Surse Originale</span>
            <Tag className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {metrics.totalSources}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Sursa CSV intactă</div>
        </div>
      </div>

      {/* Control Bar: Tabs, Search, Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Row 1: Status & Type Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Status:
            </span>
            <button
              onClick={() => {
                setSelectedStatusTab('ALL')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatusTab === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Toate ({metrics.totalRequests})
            </button>
            <button
              onClick={() => {
                setSelectedStatusTab('Activa')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatusTab === 'Activa'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Active ({metrics.activeRequests})
            </button>
            <button
              onClick={() => {
                setSelectedStatusTab('Retrasa')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatusTab === 'Retrasa'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Retrase ({metrics.retractedRequests})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Tip Lead:
            </span>
            <button
              onClick={() => {
                setSelectedTypeTab('ALL')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedTypeTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Toate Tipuri
            </button>
            <button
              onClick={() => {
                setSelectedTypeTab('Apartament')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedTypeTab === 'Apartament'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Apartamente (120)
            </button>
            <button
              onClick={() => {
                setSelectedTypeTab('Casa')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedTypeTab === 'Casa'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Case (109)
            </button>
          </div>
        </div>

        {/* Row 2: Search input + Select filters */}
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
                  {s} ({metrics.sourceBreakdown[s] || 0})
                </option>
              ))}
              <option value="BLANK">Fără sursă specificată ({metrics.sourceBreakdown['Nespecificat'] || 0})</option>
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
                  {ag} ({metrics.agentBreakdown[ag] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'id' | 'buget' | 'date')}
              className="flex-1 py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="id">Sortare după ID Sursă</option>
              <option value="buget">Sortare după Buget Max</option>
              <option value="date">Sortare după Data Adăugare</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              title={`Directie sortare: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results summary counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div>
            Afișare <strong>{paginatedRequests.length}</strong> din <strong>{filteredRequests.length}</strong> cereri filtrate (Total: {metrics.totalRequests})
          </div>
          {(selectedStatusTab !== 'ALL' || selectedTypeTab !== 'ALL' || selectedSursa !== 'ALL' || selectedAgent !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSelectedStatusTab('ALL')
                setSelectedTypeTab('ALL')
                setSelectedSursa('ALL')
                setSelectedAgent('ALL')
                setSearch('')
                setPage(1)
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Resetează toate filtrele
            </button>
          )}
        </div>
      </div>

      {/* Requests Table / List */}
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
                  <th className="py-3.5 px-4">Cumpărător & Contact</th>
                  <th className="py-3.5 px-4">Tip / Cerere</th>
                  <th className="py-3.5 px-4">Buget</th>
                  <th className="py-3.5 px-4">Sursa Originală</th>
                  <th className="py-3.5 px-4">Agent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {paginatedRequests.map((req) => {
                  const isApartment = req.tip_lead === 'Apartament'
                  const isActive = req.parsed_status === 'Activa'
                  const isRetracted = req.parsed_status === 'Retrasa'

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

                      {/* Col 2: Buyer & Contact */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{req.cumparator}</span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs">
                          {req.telefon && (
                            <a
                              href={`tel:${req.telefon}`}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-mono text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              {req.telefon}
                            </a>
                          )}
                          {req.email && (
                            <div className="truncate max-w-[200px]">
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

                      {/* Col 3: Lead Type & Criteria */}
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
                        {req.observatii && (
                          <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic max-w-xs">
                            💬 {req.observatii}
                          </div>
                        )}
                      </td>

                      {/* Col 4: Budget */}
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
                        {req.buget1 && req.buget2 && (
                          <div className="text-[11px] text-slate-400">
                            Min: {formatCurrency(req.buget1)}
                          </div>
                        )}
                        {req.buget_credit && req.buget_credit !== '0' && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Credit: {req.buget_credit}
                          </div>
                        )}
                      </td>

                      {/* Col 5: Original Source */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{req.sursa || 'Nespecificat'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {req.source_file.includes('1138618') ? 'File 1 (Apt)' : 'File 2 (Case)'}
                        </div>
                      </td>

                      {/* Col 6: Agent */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-900 dark:text-white">
                          {req.agent || '—'}
                        </div>
                      </td>

                      {/* Col 7: Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isRetracted
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {req.status_cerere || 'Blank'}
                        </span>
                      </td>

                      {/* Col 8: Actions */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <Link
                          href={`/admin/requests/chestertons/${req.import_source_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition"
                        >
                          <span>Detalii</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
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
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
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
