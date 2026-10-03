'use client'

import React, { useState } from 'react'
import { X, TrendingUp, Save, Trash2, Calendar, FileText, Building2, Coins, ShieldCheck } from 'lucide-react'
import { VerifiedIncomeRecord } from '@/lib/data/verified-insurance-financial-dataset'

interface IncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<VerifiedIncomeRecord>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  income?: VerifiedIncomeRecord | null
}

function IncomeForm({
  income,
  onClose,
  onSave,
  onDelete,
}: {
  income?: VerifiedIncomeRecord | null
  onClose: () => void
  onSave: (data: Partial<VerifiedIncomeRecord>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [incomeDate, setIncomeDate] = useState(income?.income_date || new Date().toISOString().slice(0, 10))
  const [documentNumber, setDocumentNumber] = useState(income?.document_number || '')
  const [description, setDescription] = useState(income?.description || '')
  const [insuranceType, setInsuranceType] = useState(income?.insurance_type || '')
  const [insurer, setInsurer] = useState(income?.insurer || '')
  const [policyValue, setPolicyValue] = useState(
    income?.policy_value !== null && income?.policy_value !== undefined ? String(income.policy_value) : ''
  )
  const [commissionPercent, setCommissionPercent] = useState(
    income?.commission_percent !== null && income?.commission_percent !== undefined ? String(income.commission_percent) : ''
  )
  const [commissionReceived, setCommissionReceived] = useState(
    income?.commission_received !== null && income?.commission_received !== undefined ? String(income.commission_received) : ''
  )
  const [tax1Percent, setTax1Percent] = useState(
    income?.tax_1_percent !== null && income?.tax_1_percent !== undefined ? String(income.tax_1_percent) : ''
  )
  const [observations, setObservations] = useState(income?.observations || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCommissionChange = (val: string) => {
    setCommissionReceived(val)
    const num = parseFloat(val)
    if (!isNaN(num)) {
      const autoTax = (num * 0.01).toFixed(4)
      setTax1Percent(autoTax)
    } else {
      setTax1Percent('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!incomeDate || !description.trim() || commissionReceived === '') {
      setError('Te rugăm să completezi câmpurile obligatorii: Data, Descriere și Comision Încasat.')
      return
    }

    const received = parseFloat(commissionReceived)
    if (isNaN(received)) {
      setError('Comisionul încasat trebuie să fie o valoare numerică validă.')
      return
    }

    const tax = tax1Percent !== '' ? parseFloat(tax1Percent) : Number((received * 0.01).toFixed(4))
    const pValue = policyValue !== '' ? parseFloat(policyValue) : null
    const cPercent = commissionPercent !== '' ? parseFloat(commissionPercent) : null

    try {
      setIsSubmitting(true)
      await onSave({
        income_date: incomeDate,
        document_number: documentNumber.trim() || null,
        description: description.trim(),
        insurance_type: insuranceType.trim() || null,
        insurer: insurer.trim() || null,
        policy_value: pValue,
        commission_percent: cPercent,
        commission_received: received,
        tax_1_percent: tax,
        observations: observations.trim() || null,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la salvarea încasării.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!income?.id || !onDelete) return
    if (!confirm(`Ești sigur că vrei să ștergi încasarea „${income.description}” din ${income.income_date}?`)) return

    try {
      setIsSubmitting(true)
      await onDelete(income.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare la ștergerea încasării.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              {income ? 'Editează Încasare / Comision' : 'Adaugă Încasare Nouă'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Evidență Financiară CIF Asigurări
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

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Income Date */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Data Încasării *
            </label>
            <input
              type="date"
              required
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Document Number */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              Nr. Document / Fluturaș
            </label>
            <input
              type="text"
              placeholder="ex: Extras bancar, Fluturaș Mai"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            Descriere Încasare / Explicație *
          </label>
          <input
            type="text"
            required
            placeholder="ex: Generali Bonus Prima Luna, Fluturas Aprilie"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Insurer */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              Asigurator (Opțional)
            </label>
            <input
              type="text"
              placeholder="ex: Generali, Allianz, Omniasig"
              value={insurer}
              onChange={(e) => setInsurer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Insurance Type */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              Tip Asigurare (Opțional)
            </label>
            <input
              type="text"
              placeholder="ex: RCA, CASCO, PAD, EUROCASA"
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Policy Value */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Valoare Poliță (RON/EUR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Opțional"
              value={policyValue}
              onChange={(e) => setPolicyValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Commission % */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              % Comision Negociat
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="ex: 10.5"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Commission Received */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Comision Încasat (RON) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={commissionReceived}
              onChange={(e) => handleCommissionChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/30 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
            />
          </div>

          {/* Tax 1% */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Impozit 1% (RON) *
            </label>
            <input
              type="number"
              step="0.0001"
              required
              placeholder="0.0000"
              value={tax1Percent}
              onChange={(e) => setTax1Percent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/30 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Observații / Mențiuni
          </label>
          <input
            type="text"
            placeholder="Opțional"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {income && (
          <div className="pt-2 text-[11px] text-neutral-400 space-y-1 font-mono">
            <p>Sursă: {income.source} (Rând #{income.source_row})</p>
            <p>Fingerprint: {income.fingerprint.slice(0, 16)}...</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          {income && onDelete ? (
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50"
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

export function IncomeModal({ isOpen, onClose, onSave, onDelete, income }: IncomeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <IncomeForm
        key={income?.id || 'new-income'}
        income={income}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  )
}
