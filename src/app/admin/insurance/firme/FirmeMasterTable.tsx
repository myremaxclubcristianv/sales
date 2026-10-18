'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Clock,
} from 'lucide-react'
import {
  type InsuranceCompany,
  type ProspectStatus,
  PROSPECT_STATUSES,
} from '@/lib/data/verified-insurance-companies-dataset'
import type { InsuranceCompaniesMetrics } from '@/lib/db/insurance-companies'
import { InsuranceCompanyQuickNotePopover } from '@/components/InsuranceCompanyQuickNotePopover'

interface FirmeMasterTableProps {
  initialCompanies: InsuranceCompany[]
  initialMetrics: InsuranceCompaniesMetrics
}

/**
 * Parses raw phone string into structured clickable call targets and formatted labels.
 * Splits multiple numbers (separated by ';' or '/') while preserving the original string,
 * and ignores descriptive text like "Vezi site / apel".
 */
function parsePhoneNumbers(phoneStr: string | null | undefined): {
  isClickable: boolean
  originalText: string
  numbers: { raw: string; telHref: string }[]
} {
  if (!phoneStr || !phoneStr.trim()) {
    return { isClickable: false, originalText: '—', numbers: [] }
  }

  const rawTrimmed = phoneStr.trim()
  const digitMatches = rawTrimmed.match(/\d/g)
  // If fewer than 5 digits total in string, it's descriptive text (e.g., "Vezi site / apel")
  if (!digitMatches || digitMatches.length < 5) {
    return { isClickable: false, originalText: rawTrimmed, numbers: [] }
  }

  // Split by ';' or '\n' or ','
  const topTokens = rawTrimmed.split(/[;\n,]/).map((t) => t.trim()).filter(Boolean)
  const numbers: { raw: string; telHref: string }[] = []

  for (const token of topTokens) {
    // If token contains '/' and both sides have at least 4 digits, split into individual numbers
    const slashParts = token.split('/').map((s) => s.trim()).filter(Boolean)
    const canSplitSlash = slashParts.length > 1 && slashParts.every((sp) => (sp.match(/\d/g) || []).length >= 4)
    const partsToProcess = canSplitSlash ? slashParts : [token]

    for (const part of partsToProcess) {
      const partDigits = part.match(/\d/g)
      if (partDigits && partDigits.length >= 5) {
        const hasPlus = part.trim().startsWith('+')
        const cleanDigits = part.replace(/[^\d]/g, '')
        const telHref = hasPlus ? `tel:+${cleanDigits}` : `tel:${cleanDigits}`
        numbers.push({ raw: part, telHref })
      } else {
        numbers.push({ raw: part, telHref: '' })
      }
    }
  }

  return {
    isClickable: numbers.some((n) => Boolean(n.telHref)),
    originalText: rawTrimmed,
    numbers,
  }
}

export function FirmeMasterTable({ initialCompanies, initialMetrics }: FirmeMasterTableProps) {
  const [companies, setCompanies] = useState<InsuranceCompany[]>(initialCompanies)
  const [metrics, setMetrics] = useState<InsuranceCompaniesMetrics>(initialMetrics)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedTable, setSelectedTable] = useState<string>('ALL')
  const [selectedCity, setSelectedCity] = useState<string>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Distinct cities for filter dropdown
  const distinctCities = useMemo(() => {
    const set = new Set<string>()
    for (const c of companies) {
      if (c.city) {
        const clean = c.city.split('/')[0].split('(')[0].trim()
        if (clean) set.add(clean)
      }
    }
    return Array.from(set).sort()
  }, [companies])

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase()
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.activity_type.toLowerCase().includes(q) ||
          c.original_observations.toLowerCase().includes(q) ||
          (c.crm_notes && c.crm_notes.toLowerCase().includes(q))
        if (!matches) return false
      }

      // Status
      if (selectedStatus !== 'ALL' && c.prospect_status !== selectedStatus) {
        return false
      }

      // Table
      if (selectedTable !== 'ALL' && String(c.table_number) !== selectedTable) {
        return false
      }

      // City
      if (selectedCity !== 'ALL') {
        const clean = c.city.split('/')[0].split('(')[0].trim().toLowerCase()
        if (!clean.includes(selectedCity.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [companies, searchTerm, selectedStatus, selectedTable, selectedCity])

  // Quick inline status change handler
  const handleStatusChange = async (companyId: string, newStatus: ProspectStatus) => {
    setUpdatingId(companyId)
    try {
      const res = await fetch(`/api/insurance/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_status: newStatus }),
      })

      if (res.ok) {
        await res.json()
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? { ...c, prospect_status: newStatus } : c))
        )
        // Update metrics in local state
        setMetrics((prev: InsuranceCompaniesMetrics) => {
          const oldStatus = companies.find((c) => c.id === companyId)?.prospect_status || 'NECONTACTAT'
          const newBreakdown = { ...prev.statusBreakdown }
          newBreakdown[oldStatus] = Math.max(0, (newBreakdown[oldStatus] || 1) - 1)
          newBreakdown[newStatus] = (newBreakdown[newStatus] || 0) + 1
          return { ...prev, statusBreakdown: newBreakdown }
        })
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  // Quick note saved callback
  const handleNoteSaved = (companyId: string, newNote: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, crm_notes: newNote } : c))
    )
  }

  // Status badge styling helper
  const getStatusBadgeClass = (status: ProspectStatus) => {
    switch (status) {
      case 'NECONTACTAT':
        return 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
      case 'AM SUNAT':
      case 'AM VORBIT':
      case 'A RĂSPUNS':
        return 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
      case 'EMAIL TRIMIS':
      case 'FOLLOW-UP':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
      case 'INTERESAT':
      case 'ÎNTÂLNIRE PROGRAMATĂ':
      case 'OFERTĂ TRIMISĂ':
        return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      case 'CLIENT':
        return 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      case 'NEINTERESAT':
      case 'NU RĂSPUNDE':
      case 'DATE INCORECTE':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-300'
    }
  }

  const getTableBadgeClass = (tableNum: number) => {
    switch (tableNum) {
      case 1:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
      case 2:
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
      case 3:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 4:
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const isActualEmail = (e: string) => /@.+\./.test(e)
  const isActualUrl = (u: string) => u.startsWith('http') || u.includes('.ro') || u.includes('.com')

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Firme</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.total}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">4 tabele sursă</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tabelul 1</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.tableBreakdown[1] || 30}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Mari &amp; Leasing</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Tabelul 2</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.tableBreakdown[2] || 30}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Regionale / Medii</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tabelul 3</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.tableBreakdown[3] || 25}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Locale &amp; Hub-uri</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Tabelul 4</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.tableBreakdown[4] || 22}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Oportunități bune</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Necontactat</div>
          <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {metrics.statusBreakdown['NECONTACTAT'] ?? 107}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Așteaptă apel</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după denumire, telefon, email, notiță, oraș sau CUI..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Table filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Toate Tabelele (1-4)</option>
              <option value="1">Tabelul 1 (30 firme)</option>
              <option value="2">Tabelul 2 (30 firme)</option>
              <option value="3">Tabelul 3 (25 firme)</option>
              <option value="4">Tabelul 4 (22 firme)</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Toate Statusurile</option>
              {PROSPECT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* City filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Toate Orașele</option>
              {distinctCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters counter */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pt-1">
          <div>
            Afișare <span className="font-bold text-neutral-800 dark:text-neutral-200">{filteredCompanies.length}</span> din{' '}
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{companies.length}</span> firme
          </div>
          {(searchTerm || selectedStatus !== 'ALL' || selectedTable !== 'ALL' || selectedCity !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('ALL')
                setSelectedTable('ALL')
                setSelectedCity('ALL')
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Resetează filtrele
            </button>
          )}
        </div>
      </div>

      {/* Main Companies Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 min-w-[220px]">1. Denumire Firmă</th>
                <th className="py-3.5 px-4 min-w-[170px]">2. Telefon</th>
                <th className="py-3.5 px-4 min-w-[220px]">3. Notiță Rapidă</th>
                <th className="py-3.5 px-4 min-w-[180px]">4. Email</th>
                <th className="py-3.5 px-4 min-w-[170px]">5. Activitate / Status</th>
                <th className="py-3.5 px-4 min-w-[130px]">6. Oraș / Județ</th>
                <th className="py-3.5 px-4 min-w-[150px]">7. Tip Activitate</th>
                <th className="py-3.5 px-4 min-w-[130px]">8. Website</th>
                <th className="py-3.5 px-4 min-w-[200px]">9. Observații / Sursă</th>
                <th className="py-3.5 px-4 text-right min-w-[90px]">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    Nicio firmă nu corespunde criteriilor de căutare selectate.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors group"
                  >
                    {/* 1. Denumire Firmă */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                          #{c.nr}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getTableBadgeClass(
                            c.table_number
                          )}`}
                        >
                          T{c.table_number}
                        </span>
                      </div>
                      <Link
                        href={`/admin/insurance/firme/${c.id}`}
                        className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 group-hover:underline"
                      >
                        <span>{c.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400" />
                      </Link>
                    </td>

                    {/* 2. Telefon (Click-to-Call) */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {(() => {
                        const parsed = parsePhoneNumbers(c.phone)
                        if (!parsed.isClickable) {
                          return (
                            <span className="text-[11px] text-neutral-500 italic">
                              {parsed.originalText || '—'}
                            </span>
                          )
                        }
                        return (
                          <div className="flex flex-col gap-1.5 items-start">
                            {parsed.numbers.map((num, idx) => {
                              if (!num.telHref) {
                                return (
                                  <span key={idx} className="text-[11px] text-neutral-400 italic">
                                    {num.raw}
                                  </span>
                                )
                              }
                              return (
                                <a
                                  key={idx}
                                  href={num.telHref}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold bg-neutral-100/90 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-neutral-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-neutral-200/60 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 transition group/call active:scale-98 shadow-2xs"
                                  title={`Apelează ${num.raw}`}
                                >
                                  <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover/call:scale-110 transition-transform" />
                                  <span>{num.raw}</span>
                                </a>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </td>

                    {/* 3. Notiță Rapidă */}
                    <td className="py-3.5 px-4 align-top">
                      <InsuranceCompanyQuickNotePopover
                        companyId={c.id}
                        companyName={c.name}
                        currentNote={c.crm_notes}
                        onNoteSaved={(newNote) => handleNoteSaved(c.id, newNote)}
                      />
                    </td>

                    {/* 4. Email */}
                    <td className="py-3.5 px-4 align-top">
                      {c.email ? (
                        isActualEmail(c.email) ? (
                          <div className="flex flex-col gap-1">
                            {c.email.split(/;|,/).map((em, idx) => {
                              const clean = em.trim()
                              if (!clean) return null
                              return (
                                <a
                                  key={idx}
                                  href={`mailto:${clean}`}
                                  className="text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px] truncate max-w-[180px]"
                                >
                                  <Mail className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                                  <span className="truncate">{clean}</span>
                                </a>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-neutral-500 italic text-[11px]">{c.email}</span>
                        )
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* 5. Activitate / Status */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <select
                          value={c.prospect_status}
                          disabled={updatingId === c.id}
                          onChange={(e) => handleStatusChange(c.id, e.target.value as ProspectStatus)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all cursor-pointer focus:outline-hidden ${getStatusBadgeClass(
                            c.prospect_status
                          )}`}
                        >
                          {PROSPECT_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                              {st}
                            </option>
                          ))}
                        </select>
                        {updatingId === c.id && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                        )}
                      </div>
                      {c.next_follow_up_at && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Follow-up: {c.next_follow_up_at.split('T')[0]}</span>
                        </div>
                      )}
                    </td>

                    {/* 6. Oraș / Județ */}
                    <td className="py-3.5 px-4 align-top text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{c.city || '—'}</span>
                      </div>
                    </td>

                    {/* 7. Tip Activitate */}
                    <td className="py-3.5 px-4 align-top text-neutral-600 dark:text-neutral-400">
                      <span className="inline-block bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                        {c.activity_type || '—'}
                      </span>
                    </td>

                    {/* 8. Website */}
                    <td className="py-3.5 px-4 align-top">
                      {c.website ? (
                        isActualUrl(c.website) ? (
                          <a
                            href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 inline-flex"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[130px]">{c.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">{c.website}</span>
                        )
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* 9. Observații / Sursă */}
                    <td className="py-3.5 px-4 align-top text-neutral-600 dark:text-neutral-400">
                      {c.original_observations ? (
                        <span
                          className="text-[11px] line-clamp-2 max-w-[220px] block"
                          title={c.original_observations}
                        >
                          {c.original_observations}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* 10. Acțiuni (Fișă) */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <Link
                        href={`/admin/insurance/firme/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-semibold transition"
                      >
                        <span>Fișă</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
