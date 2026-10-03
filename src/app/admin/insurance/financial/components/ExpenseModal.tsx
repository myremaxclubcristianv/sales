'use client'

import React, { useState } from 'react'
import { X, Receipt, Save, Trash2, Calendar, FileText, Tag, Building2, Coins, Percent } from 'lucide-react'
import { VerifiedExpenseRecord } from '@/lib/data/verified-insurance-financial-dataset'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<VerifiedExpenseRecord>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  expense?: VerifiedExpenseRecord | null
}

function ExpenseForm({
  expense,
  onClose,
  onSave,
  onDelete,
}: {
  expense?: VerifiedExpenseRecord | null
  onClose: () => void
  onSave: (data: Partial<VerifiedExpenseRecord>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date || (expense?.is_asset ? '' : new Date().toISOString().slice(0, 10)))
  const [documentNumber, setDocumentNumber] = useState(expense?.document_number || '')
  const [description, setDescription] = useState(expense?.description || '')
  const [expenseType, setExpenseType] = useState(expense?.expense_type || 'MOTORINĂ')
  const [category, setCategory] = useState(expense?.category || 'MASINA')
  const [supplier, setSupplier] = useState(expense?.supplier || '')
  const [netAmount, setNetAmount] = useState(
    expense?.net_amount !== null && expense?.net_amount !== undefined ? String(expense.net_amount) : ''
  )
  const [vatAmount, setVatAmount] = useState(
    expense?.vat_amount !== null && expense?.vat_amount !== undefined ? String(expense.vat_amount) : ''
  )
  const [totalAmount, setTotalAmount] = useState(
    expense?.total_amount !== null && expense?.total_amount !== undefined ? String(expense.total_amount) : ''
  )
  const [observations, setObservations] = useState(expense?.observations || '')
  const [isAsset, setIsAsset] = useState(expense?.is_asset || false)
  const [depreciationYears, setDepreciationYears] = useState(
    expense?.depreciation_years !== null && expense?.depreciation_years !== undefined ? String(expense.depreciation_years) : '3'
  )
  const [annualDepreciationRate, setAnnualDepreciationRate] = useState(
    expense?.annual_depreciation_rate !== null && expense?.annual_depreciation_rate !== undefined ? String(expense.annual_depreciation_rate) : '33'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!description.trim() || !category.trim() || !supplier.trim() || !totalAmount) {
      setError('Te rugăm să completezi câmpurile obligatorii: Descriere, Categorie, Furnizor și Total.')
      return
    }

    const total = parseFloat(totalAmount)
    if (isNaN(total)) {
      setError('Valoarea totală trebuie să fie un număr valid.')
      return
    }

    const net = netAmount ? parseFloat(netAmount) : total
    const vat = vatAmount ? parseFloat(vatAmount) : null

    try {
      setIsSubmitting(true)
      await onSave({
        expense_date: expenseDate || '',
        document_number: documentNumber.trim() || null,
        description: description.trim(),
        expense_type: expenseType.trim(),
        category: category.trim(),
        supplier: supplier.trim(),
        net_amount: net,
        vat_amount: vat,
        total_amount: total,
        observations: observations.trim() || null,
        is_asset: isAsset,
        asset_name: isAsset ? description.trim() : null,
        purchase_value: isAsset ? total : null,
        depreciation_years: isAsset ? parseInt(depreciationYears, 10) || 3 : null,
        annual_depreciation_rate: isAsset ? parseFloat(annualDepreciationRate) || 33 : null,
        depreciation_method: isAsset ? 'STRAIGHT_LINE' : null,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea cheltuielii.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!expense?.id || !onDelete) return
    if (!confirm(`Ești sigur că vrei să ștergi cheltuiala „${expense.description}” din ${expense.expense_date}?`)) return

    try {
      setIsSubmitting(true)
      await onDelete(expense.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergerea cheltuielii.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              {expense ? 'Editează Cheltuială' : 'Adaugă Cheltuială Nouă'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Evidență Financiară CIF Asigurări 2026
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body / Form */}
      <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Expense Date */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Data Tranzacției {isAsset ? '(Opțională pentru active)' : '*'}
            </label>
            <input
              type="date"
              required={!isAsset}
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Document Number */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              Nr. Document (Opțional)
            </label>
            <input
              type="text"
              placeholder="ex: AS/03732 sau bon fiscal"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            Descriere Cheltuială *
          </label>
          <input
            type="text"
            required
            placeholder="ex: Motorina, Spalatorie Masina, LAPTOP MACBOOK M5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Expense Type */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              Tip Cheltuială *
            </label>
            <input
              type="text"
              required
              placeholder="ex: MOTORINĂ, LAPTOP"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              Categorie *
            </label>
            <input
              type="text"
              required
              placeholder="ex: MASINA, IT / ECHIPAMENTE"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              Furnizor *
            </label>
            <input
              type="text"
              required
              placeholder="ex: OMV, ALTEX"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Asset / Amortization Toggle */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAsset}
              onChange={(e) => setIsAsset(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Este un Activ / Echipament amortizabil (ex: Laptop, Echipamente IT)
            </span>
          </label>

          {isAsset && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Durată amortizare (Ani)
                </label>
                <input
                  type="number"
                  value={depreciationYears}
                  onChange={(e) => setDepreciationYears(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Cotă anuală amortizare (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={annualDepreciationRate}
                  onChange={(e) => setAnnualDepreciationRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Net Amount */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-neutral-400" />
              Valoare Netă (RON)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={netAmount}
              onChange={(e) => {
                setNetAmount(e.target.value)
                if (!totalAmount) setTotalAmount(e.target.value)
              }}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* VAT Amount */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-neutral-400" />
              TVA (RON)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Opțional"
              value={vatAmount}
              onChange={(e) => setVatAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-blue-600" />
              Total (RON) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/30 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold font-mono"
            />
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Observații / Notițe
          </label>
          <input
            type="text"
            placeholder="ex: 50% deductibil, decontat, etc."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {expense && (
          <div className="pt-2 text-[11px] text-neutral-400 space-y-1 font-mono">
            <p>Sursă: {expense.source} (Rând #{expense.source_row})</p>
            <p>Fingerprint: {expense.fingerprint.slice(0, 16)}...</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          {expense && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl font-bold transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Șterge</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl font-bold transition"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Se salvează...' : 'Salvează'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export function ExpenseModal({ isOpen, onClose, onSave, onDelete, expense }: ExpenseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <ExpenseForm
        key={expense?.id || 'new-expense'}
        expense={expense}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  )
}
