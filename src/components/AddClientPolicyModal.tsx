'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  Shield,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
} from 'lucide-react'
import type { Database } from '@/types'

export const EXISTING_INSURANCE_PRODUCTS = [
  { value: 'RCA', label: 'RCA (Răspundere Civilă Auto)' },
  { value: 'CASCO', label: 'CASCO (Avarii & Furt)' },
  { value: 'HOME', label: 'Locuință (PAD + Facultativă)' },
  { value: 'LIFE', label: 'Viață & Protecție' },
  { value: 'HEALTH', label: 'Sănătate & Spitalizare' },
  { value: 'TRAVEL', label: 'Călătorie (Travel)' },
  { value: 'LIABILITY', label: 'Răspundere Civilă Generală' },
  { value: 'PROFESSIONAL_LIABILITY', label: 'Răspundere Profesională (Malpraxis, Avocați etc.)' },
  { value: 'CARGO', label: 'Cargo / Transport Marfă' },
  { value: 'IMM', label: 'IMM / Clădiri & Bunuri Comerciale' },
  { value: 'BUSINESS', label: 'Business & Continuitate' },
  { value: 'CYBER', label: 'Cyber Risk & Securitate' },
  { value: 'OTHER', label: 'Alte Tipuri de Asigurare' },
]

export const EXISTING_INSURERS = [
  'Allianz-Tiriac',
  'Omniasig VIG',
  'Groupama',
  'Generali',
  'Grawe',
  'Uniqa',
  'Asirom VIG',
  'Axeria IARD',
  'Hellas Direct',
  'Eurolife FFH',
  'NN Asigurări',
  'Signal Iduna',
  'Alt Asigurător',
]

interface AddClientPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  client: {
    id: string
    first_name: string
    last_name: string
    phone?: string | null
    email?: string | null
  }
  onPolicyAdded?: (newPolicy: Database['public']['Tables']['insurance_policies']['Row']) => void
}

export function AddClientPolicyModal({
  isOpen,
  onClose,
  client,
  onPolicyAdded,
}: AddClientPolicyModalProps) {
  const router = useRouter()

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const oneYearLaterStr = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const [product, setProduct] = useState('HOME')
  const [insurerSelect, setInsurerSelect] = useState('Generali')
  const [customInsurer, setCustomInsurer] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [premium, setPremium] = useState('')
  const [currency, setCurrency] = useState<'EUR' | 'RON' | 'USD'>('EUR')
  const [commission, setCommission] = useState('')
  const [startDate, setStartDate] = useState(todayStr)
  const [expiryDate, setExpiryDate] = useState(oneYearLaterStr)
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const effectiveInsurer =
    insurerSelect === 'Alt Asigurător' ? customInsurer.trim() : insurerSelect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validations
    if (!product) {
      setErrorMessage('Vă rugăm să selectați tipul de asigurare.')
      return
    }

    if (!effectiveInsurer) {
      setErrorMessage('Vă rugăm să selectați sau să introduceți asigurătorul.')
      return
    }

    if (!startDate) {
      setErrorMessage('Data de început a poliței este obligatorie.')
      return
    }

    if (!expiryDate) {
      setErrorMessage('Data de expirare a poliței este obligatorie.')
      return
    }

    if (new Date(expiryDate) < new Date(startDate)) {
      setErrorMessage('Data de expirare nu poate fi anterioară datei de început a poliței.')
      return
    }

    if (premium && Number(premium) < 0) {
      setErrorMessage('Prima de asigurare nu poate fi negativă.')
      return
    }

    if (commission && Number(commission) < 0) {
      setErrorMessage('Comisionul nu poate fi negativ.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        client_id: client.id,
        product,
        insurer: effectiveInsurer,
        policy_number: policyNumber.trim() || null,
        premium: premium ? parseFloat(premium) : null,
        commission: commission ? parseFloat(commission) : 0,
        currency,
        start_date: startDate,
        expiry_date: expiryDate,
        status: 'ACTIVE',
        notes: notes.trim() || null,
      }

      const res = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'A apărut o eroare la salvarea poliței.')
      }

      setSuccessMessage('Polița a fost salvată cu succes în CRM!')

      if (onPolicyAdded) {
        onPolicyAdded(data)
      }

      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la salvarea poliței.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Poliță Nouă de Asigurare
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Adaugă Poliță în Portofoliu
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Locked Banner (Prevents wrong client selection) */}
        <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Client Asociat (Automat)
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {client.first_name} {client.last_name}
              </span>
              {(client.phone || client.email) && (
                <span className="text-xs text-neutral-500 ml-2">
                  • {client.phone || client.email}
                </span>
              )}
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Client Activ
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Eroare la validare / salvare:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tip Asigurare & Asigurător */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Tip Asigurare (Produs) <span className="text-red-500">*</span>
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXISTING_INSURANCE_PRODUCTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Companie Asigurare (Asigurător) <span className="text-red-500">*</span>
              </label>
              <select
                value={insurerSelect}
                onChange={(e) => setInsurerSelect(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXISTING_INSURERS.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>

              {insurerSelect === 'Alt Asigurător' && (
                <input
                  type="text"
                  placeholder="Introduceți numele asigurătorului..."
                  value={customInsurer}
                  onChange={(e) => setCustomInsurer(e.target.value)}
                  className="w-full mt-2 text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>
          </div>

          {/* Număr Poliță & Primă */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Număr Poliță / Serie
              </label>
              <input
                type="text"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="ex: 3000019539605"
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Primă Asigurare
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'EUR' | 'RON' | 'USD')}
                  className="text-xs p-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl font-bold text-neutral-800 dark:text-neutral-200"
                >
                  <option value="EUR">EUR</option>
                  <option value="RON">RON</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Comision (opțional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="0.00"
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Perioadă Valabilitate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Dată Început (Emitere) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Dată Expirare (Scadență) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Notițe */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Observații / Notițe Interne
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Poliță emisă cu clauză de asistență rutieră, reînnoire anuală automată..."
              className="w-full text-xs p-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Anulează
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="text-xs bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold gap-1.5 shadow-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Se salvează...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Salvează Polița</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
