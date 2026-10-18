'use client'

import React, { useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import {
  VerifiedExpenseRecord,
  formatCurrencyRo,
} from '@/lib/data/verified-insurance-financial-dataset'
import { ExpenseModal } from './ExpenseModal'

interface ExpensesTabProps {
  expenses: VerifiedExpenseRecord[]
  onRefresh: () => Promise<void>
}

export function ExpensesTab({ expenses, onRefresh }: ExpensesTabProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('ALL')
  const [supplierFilter, setSupplierFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<VerifiedExpenseRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Extract unique categories, types, suppliers, and years
  const categories = useMemo(() => {
    const set = new Set<string>()
    expenses.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set).sort()
  }, [expenses])

  const expenseTypes = useMemo(() => {
    const standardOrder = [
      'MOTORINĂ',
      'SPĂLĂTORIE MAȘINĂ',
      'TRECERE FETEȘTI',
      'ABONAMENT ASISTENȚĂ RUTIERĂ',
      'METROREX ABONAMENT',
      'LAPTOP',
      'TABLETĂ',
      'ACCESORIU IT',
    ]
    const set = new Set<string>()
    expenses.forEach((e) => {
      if (e.expense_type) set.add(e.expense_type)
    })
    const found = Array.from(set)
    return standardOrder.filter((t) => found.includes(t)).concat(found.filter((t) => !standardOrder.includes(t)))
  }, [expenses])

  const suppliers = useMemo(() => {
    const set = new Set<string>()
    expenses.forEach((e) => {
      if (e.supplier) set.add(e.supplier)
    })
    return Array.from(set).sort()
  }, [expenses])

  const years = useMemo(() => {
    const set = new Set<number>()
    expenses.forEach((e) => {
      if (e.record_year) set.add(e.record_year)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [expenses])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter !== 'ALL' && e.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }
      if (expenseTypeFilter !== 'ALL' && (e.expense_type || '').toUpperCase() !== expenseTypeFilter.toUpperCase()) {
        return false
      }
      if (supplierFilter !== 'ALL' && e.supplier.toLowerCase() !== supplierFilter.toLowerCase()) {
        return false
      }
      if (yearFilter !== 'ALL' && String(e.record_year) !== String(yearFilter)) {
        return false
      }
      if (startDate && e.expense_date && e.expense_date < startDate) {
        return false
      }
      if (endDate && e.expense_date && e.expense_date > endDate) {
        return false
      }
      if (minAmount && Number(e.total_amount) < parseFloat(minAmount)) {
        return false
      }
      if (maxAmount && Number(e.total_amount) > parseFloat(maxAmount)) {
        return false
      }
      if (search.trim()) {
        const term = search.toLowerCase().trim()
        const matches =
          e.description.toLowerCase().includes(term) ||
          (e.expense_type && e.expense_type.toLowerCase().includes(term)) ||
          e.supplier.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          (e.document_number && e.document_number.toLowerCase().includes(term)) ||
          (e.observations && e.observations.toLowerCase().includes(term)) ||
          (e.raw_date && e.raw_date.includes(term)) ||
          (e.expense_date && e.expense_date.includes(term))
        if (!matches) return false
      }
      return true
    })
  }, [expenses, categoryFilter, expenseTypeFilter, supplierFilter, yearFilter, startDate, endDate, minAmount, maxAmount, search])

  // Total filtered amount
  const filteredTotalAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
  }, [filteredExpenses])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveExpense = async (data: Partial<VerifiedExpenseRecord>) => {
    try {
      if (selectedExpense) {
        const res = await fetch(`/api/admin/insurance/financial/expenses/${selectedExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Eroare la actualizarea cheltuielii')
        showToast('Cheltuiala a fost actualizată cu succes.')
      } else {
        const res = await fetch('/api/admin/insurance/financial/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Eroare la crearea cheltuielii')
        showToast('Cheltuiala nouă a fost salvată.')
      }
      await onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'A apărut o eroare')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/insurance/financial/expenses/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Eroare la ștergerea cheltuielii')
      showToast('Cheltuiala a fost ștearsă.')
      await onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'A apărut o eroare')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('ALL')
    setExpenseTypeFilter('ALL')
    setSupplierFilter('ALL')
    setYearFilter('ALL')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
  }

  const hasActiveFilters =
    search ||
    categoryFilter !== 'ALL' ||
    expenseTypeFilter !== 'ALL' ||
    supplierFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    startDate ||
    endDate ||
    minAmount ||
    maxAmount

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>Evidență Cheltuieli — CIF Asigurări 2026</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Sursă: EVIDENȚĂ CHELTUIELI – CIF ASIGURĂRI 2026 ({expenses.length} înregistrări exacte)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
            Total Selectat: {formatCurrencyRo(filteredTotalAmount)}
          </div>
          <button
            onClick={() => {
              setSelectedExpense(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă Cheltuială</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Caută descriere, tip, furnizor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate Categoriile</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Type Filter */}
          <div>
            <select
              value={expenseTypeFilter}
              onChange={(e) => setExpenseTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Toate Tipurile</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toți Furnizorii</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
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

        {/* Date & Value Range Advanced Row */}
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

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Min RON:</span>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-20 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Max RON:</span>
            <input
              type="number"
              placeholder="5000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-20 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono"
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
            Afișate: <strong>{filteredExpenses.length}</strong> din {expenses.length} rânduri
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
                <th className="px-4 py-3">Nr. Document</th>
                <th className="px-4 py-3">Descriere Cheltuială</th>
                <th className="px-4 py-3">Tip Cheltuială</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Furnizor</th>
                <th className="px-4 py-3 text-right">Valoare Netă</th>
                <th className="px-4 py-3 text-right">TVA</th>
                <th className="px-4 py-3 text-right">Total (RON)</th>
                <th className="px-4 py-3">Observații</th>
                <th className="px-4 py-3 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-neutral-400">
                    Nicio cheltuială nu corespunde criteriilor de filtrare.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
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
                      {item.raw_date ? (
                        item.raw_date
                      ) : item.expense_date ? (
                        item.expense_date
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                          DATA ACHIZIȚIE: NECOMPLETATĂ
                        </span>
                      )}
                    </td>

                    {/* Document Number */}
                    <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-300">
                      {item.document_number ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold">
                          {item.document_number}
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      <div>{item.description}</div>
                      {item.is_asset && (
                        <div className="mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold font-mono">
                            ACTIV • Amortizare {item.depreciation_years ? `${item.depreciation_years} ani (${item.annual_depreciation_rate}%)` : 'contabilă'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Expense Type */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold">
                        {item.expense_type || '-'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {item.supplier}
                    </td>

                    {/* Net Amount */}
                    <td className="px-4 py-3 text-right font-mono text-neutral-700 dark:text-neutral-300">
                      {formatCurrencyRo(item.net_amount)}
                    </td>

                    {/* VAT */}
                    <td className="px-4 py-3 text-right font-mono text-neutral-500">
                      {item.vat_amount !== null ? formatCurrencyRo(item.vat_amount) : '-'}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrencyRo(item.total_amount)}
                    </td>

                    {/* Observations */}
                    <td className="px-4 py-3">
                      {item.observations ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold">
                          {item.observations}
                        </span>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedExpense(item)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                          title="Editează"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
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
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 text-center text-neutral-400 text-xs">
            Nicio cheltuială găsită.
          </div>
        ) : (
          filteredExpenses.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-neutral-400">
                  R#{item.source_row} •{' '}
                  {item.raw_date ? (
                    item.raw_date
                  ) : item.expense_date ? (
                    item.expense_date
                  ) : (
                    <span className="text-amber-600 font-bold">DATA: NECOMPLETATĂ</span>
                  )}
                </span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  {formatCurrencyRo(item.total_amount)}
                </span>
              </div>

              <div>
                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                  {item.description}
                </p>
                {item.is_asset && (
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold font-mono">
                      ACTIV • Amortizare {item.depreciation_years ? `${item.depreciation_years} ani (${item.annual_depreciation_rate}%)` : 'contabilă'}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {item.expense_type && (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold">
                      {item.expense_type}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                    {item.category}
                  </span>
                  <span className="text-neutral-500 font-medium">Furnizor: {item.supplier}</span>
                  {item.document_number && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                      Doc: {item.document_number}
                    </span>
                  )}
                  {item.observations && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                      Obs: {item.observations}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Net: {formatCurrencyRo(item.net_amount)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedExpense(item)
                      setIsModalOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold text-xs"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        expense={selectedExpense}
      />
    </div>
  )
}
