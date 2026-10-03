'use client'

import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import {
  VerifiedIncomeRecord,
  formatCurrencyRo,
  formatTaxRo,
} from '@/lib/data/verified-insurance-financial-dataset'
import { IncomeModal } from './IncomeModal'

interface IncomeTabProps {
  incomes: VerifiedIncomeRecord[]
  onRefresh: () => Promise<void>
}

export function IncomeTab({ incomes, onRefresh }: IncomeTabProps) {
  const [search, setSearch] = useState('')
  const [insurerFilter, setInsurerFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<VerifiedIncomeRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Extract unique filters
  const insurers = useMemo(() => {
    const set = new Set<string>()
    incomes.forEach((i) => {
      if (i.insurer) set.add(i.insurer)
    })
    return Array.from(set).sort()
  }, [incomes])

  const types = useMemo(() => {
    const set = new Set<string>()
    incomes.forEach((i) => {
      if (i.insurance_type) set.add(i.insurance_type)
    })
    return Array.from(set).sort()
  }, [incomes])

  const years = useMemo(() => {
    const set = new Set<number>()
    incomes.forEach((i) => {
      if (i.record_year) set.add(i.record_year)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [incomes])

  // Filtered list
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      if (insurerFilter !== 'ALL' && i.insurer?.toLowerCase() !== insurerFilter.toLowerCase()) {
        return false
      }
      if (typeFilter !== 'ALL' && i.insurance_type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false
      }
      if (yearFilter !== 'ALL' && String(i.record_year) !== String(yearFilter)) {
        return false
      }
      if (startDate && i.income_date < startDate) {
        return false
      }
      if (endDate && i.income_date > endDate) {
        return false
      }
      if (search.trim()) {
        const term = search.toLowerCase().trim()
        const matches =
          i.description.toLowerCase().includes(term) ||
          (i.insurer && i.insurer.toLowerCase().includes(term)) ||
          (i.insurance_type && i.insurance_type.toLowerCase().includes(term)) ||
          (i.document_number && i.document_number.toLowerCase().includes(term)) ||
          (i.observations && i.observations.toLowerCase().includes(term)) ||
          (i.raw_date && i.raw_date.includes(term)) ||
          i.income_date.includes(term)
        if (!matches) return false
      }
      return true
    })
  }, [incomes, insurerFilter, typeFilter, yearFilter, startDate, endDate, search])

  // Sums for filtered items
  const filteredTotalReceived = useMemo(() => {
    return filteredIncomes.reduce((acc, curr) => acc + (Number(curr.commission_received) || 0), 0)
  }, [filteredIncomes])

  const filteredTotalTax = useMemo(() => {
    return filteredIncomes.reduce((acc, curr) => acc + (Number(curr.tax_1_percent) || 0), 0)
  }, [filteredIncomes])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveIncome = async (data: Partial<VerifiedIncomeRecord>) => {
    try {
      if (selectedIncome) {
        const res = await fetch(`/api/admin/insurance/financial/income/${selectedIncome.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Eroare la actualizarea încasării')
        showToast('Încasarea a fost actualizată cu succes.')
      } else {
        const res = await fetch('/api/admin/insurance/financial/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Eroare la crearea încasării')
        showToast('Încasarea nouă a fost salvată.')
      }
      await onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'A apărut o eroare')
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/insurance/financial/income/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la ștergerea încasării')
      showToast('Încasarea a fost ștearsă.')
      await onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'A apărut o eroare')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setInsurerFilter('ALL')
    setTypeFilter('ALL')
    setYearFilter('ALL')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters =
    search ||
    insurerFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    startDate ||
    endDate

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Evidență Încasări (Comisioane) — CIF Asigurări 2026</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Sursă: EVIDENȚĂ ÎNCASĂRI (COMISIOANE) – CIF ASIGURĂRI 2026 ({incomes.length} înregistrări exacte)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
            Total Comisioane: {formatCurrencyRo(filteredTotalReceived)}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
            Impozit 1%: {formatTaxRo(filteredTotalTax)}
          </div>
          <button
            onClick={() => {
              setSelectedIncome(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă Încasare</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Caută descriere, asigurator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Insurer Filter */}
          <div>
            <select
              value={insurerFilter}
              onChange={(e) => setInsurerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Toți Asiguratorii</option>
              {insurers.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Insurance Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Toate Tipurile Poliță</option>
              {types.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            >
              <option value="ALL">Toți Anii</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  An {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">De la:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Până la:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetează filtre</span>
            </button>
          )}

          <span className="ml-auto text-xs text-neutral-500 font-mono">
            Afișate: <strong>{filteredIncomes.length}</strong> din {incomes.length} rânduri
          </span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/70 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3"># Sursă</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descriere Încasare</th>
                <th className="px-4 py-3 text-right">Comision Încasat</th>
                <th className="px-4 py-3 text-right">Impozit 1%</th>
                <th className="px-4 py-3">Asigurator</th>
                <th className="px-4 py-3">Tip Poliță</th>
                <th className="px-4 py-3 text-right">Valoare Poliță</th>
                <th className="px-4 py-3 text-right">% Comision</th>
                <th className="px-4 py-3">Observații</th>
                <th className="px-4 py-3 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-neutral-400">
                    Nicio încasare nu corespunde criteriilor de filtrare.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition group"
                  >
                    {/* Source Row */}
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-400">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-bold">
                        R#{item.source_row}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-mono font-medium text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                      {item.raw_date || item.income_date}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.description}
                    </td>

                    {/* Commission Received */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrencyRo(item.commission_received)}
                    </td>

                    {/* Tax 1% */}
                    <td className="px-4 py-3 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                      {formatTaxRo(item.tax_1_percent)}
                    </td>

                    {/* Insurer */}
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {item.insurer ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
                          {item.insurer}
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Policy Type */}
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                      {item.insurance_type ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {item.insurance_type}
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Policy Value */}
                    <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-300">
                      {item.policy_value !== null ? formatCurrencyRo(item.policy_value) : '-'}
                    </td>

                    {/* Commission % */}
                    <td className="px-4 py-3 text-right font-mono text-neutral-600 dark:text-neutral-300">
                      {item.commission_percent !== null ? `${item.commission_percent}%` : '-'}
                    </td>

                    {/* Observations */}
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {item.observations ? item.observations : '-'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedIncome(item)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Editează"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(item.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Șterge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="md:hidden space-y-3">
        {filteredIncomes.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 text-center text-neutral-400 text-xs">
            Nicio încasare găsită.
          </div>
        ) : (
          filteredIncomes.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-neutral-400">
                  Rând #{item.source_row} • {item.raw_date || item.income_date}
                </span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {formatCurrencyRo(item.commission_received)}
                </span>
              </div>

              <div>
                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-neutral-500">
                  <span>Impozit 1%: <strong className="text-amber-600 font-mono">{formatTaxRo(item.tax_1_percent)}</strong></span>
                  {item.insurer && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                      {item.insurer}
                    </span>
                  )}
                  {item.insurance_type && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {item.insurance_type}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Sursă: {item.source}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedIncome(item)
                      setIsModalOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold text-xs"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDeleteIncome(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Income Modal */}
      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveIncome}
        onDelete={handleDeleteIncome}
        income={selectedIncome}
      />
    </div>
  )
}
