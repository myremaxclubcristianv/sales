'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLIENT_CATEGORIES, CLIENT_SOURCES, CLIENT_STATUSES, type ClientCategory } from '@/lib/types/crm'
import { formatPhoneDisplay } from '@/lib/utils/phone'
import { validateCnp } from '@/lib/utils/cnp'
import type { Database } from '@/types'
import {
  User,
  Phone,
  Mail,
  Fingerprint,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
  Building2,
  Shield,
  CreditCard,
} from 'lucide-react'

type ClientRow = Database['public']['Tables']['clients']['Row']

interface QuickClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newClient: ClientRow) => void
  initialCategory?: ClientCategory
  clientToEdit?: ClientRow | null
}

export function QuickClientModal(props: QuickClientModalProps) {
  if (!props.isOpen) return null
  return <QuickClientModalDialog {...props} />
}

function QuickClientModalDialog({
  onClose,
  onSuccess,
  initialCategory = 'INSURANCE',
  clientToEdit,
}: QuickClientModalProps) {
  const router = useRouter()
  const isEditMode = Boolean(clientToEdit)

  const [name, setName] = useState(
    clientToEdit
      ? `${clientToEdit.first_name || ''} ${clientToEdit.last_name || ''}`.trim()
      : ''
  )
  const [phone, setPhone] = useState(clientToEdit?.phone || '')
  const [email, setEmail] = useState(clientToEdit?.email || '')
  const [cnp, setCnp] = useState(clientToEdit?.cnp || '')
  const [cnpError, setCnpError] = useState<string | null>(null)
  const [interestSummary, setInterestSummary] = useState(clientToEdit?.interest_summary || '')
  const [category, setCategory] = useState<ClientCategory>(
    (clientToEdit?.category as ClientCategory) || initialCategory
  )
  const [source, setSource] = useState(clientToEdit?.lead_source || 'GENERALI_CRM')
  const [status, setStatus] = useState<string>(clientToEdit?.status || 'NOT_CONTACTED')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicates, setDuplicates] = useState<ClientRow[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [createdClient, setCreatedClient] = useState<ClientRow | null>(null)

  const handleCnpBlur = () => {
    if (!cnp || !cnp.trim()) {
      setCnpError(null)
      return
    }
    const validation = validateCnp(cnp, true)
    if (!validation.isValid) {
      setCnpError(validation.error || 'CNP-ul trebuie să conțină exact 13 cifre.')
    } else {
      setCnpError(null)
    }
  }

  const handlePhoneBlur = async () => {
    if (isEditMode) return
    if (!phone || phone.trim().length < 6) return
    try {
      const res = await fetch('/api/clients/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, name }),
      })
      const data = await res.json()
      if (data.duplicates && data.duplicates.length > 0) {
        setDuplicates(data.duplicates)
      } else {
        setDuplicates([])
      }
    } catch (err) {
      console.error('Error checking duplicate:', err)
    }
  }

  const handleSave = async (force: boolean = false) => {
    setError(null)
    setCnpError(null)

    if (!name.trim()) {
      setError('Numele clientului este obligatoriu.')
      return
    }
    if (!phone.trim()) {
      setError('Numărul de telefon este obligatoriu.')
      return
    }

    // Validate CNP if supplied
    let cleanCnp: string | undefined = undefined
    if (cnp && cnp.trim()) {
      const cnpValidation = validateCnp(cnp, true)
      if (!cnpValidation.isValid) {
        const errorMsg = cnpValidation.error || 'CNP-ul trebuie să conțină exact 13 cifre.'
        setCnpError(errorMsg)
        setError(errorMsg)
        return
      }
      cleanCnp = cnpValidation.normalized || undefined
    } else if (isEditMode && clientToEdit?.cnp) {
      // Preserve existing CNP if empty on edit
      cleanCnp = clientToEdit.cnp
    }

    setLoading(true)

    try {
      const res = await fetch('/api/clients/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: clientToEdit?.id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          cnp: cleanCnp,
          interest_summary: interestSummary.trim() || undefined,
          category,
          source,
          status,
          forceCreate: force,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Eroare la salvarea clientului.')
      }

      if (data.requiresConfirmation && data.duplicates) {
        setDuplicates(data.duplicates)
        setShowDuplicateWarning(true)
        setLoading(false)
        return
      }

      if (data.client) {
        setCreatedClient(data.client)
        if (onSuccess) {
          onSuccess(data.client)
        }
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare neașteptată.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setEmail('')
    setCnp('')
    setCnpError(null)
    setInterestSummary('')
    setDuplicates([])
    setShowDuplicateWarning(false)
    setCreatedClient(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                + Client Rapid
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Introducere rapidă în câteva secunde
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Success State */}
          {createdClient ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Client salvat cu succes!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  <span className="font-semibold text-slate-900">
                    {createdClient.first_name} {createdClient.last_name}
                  </span>{' '}
                  a fost adăugat în CRM.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push(`/admin/clients/${createdClient.id}`)
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Vezi profil complet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all border border-slate-200"
                >
                  + Adaugă alt client rapid
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Duplicate Warning Box */}
              {(showDuplicateWarning || duplicates.length > 0) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Posibil client existent</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-amber-900">
                    {duplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {dup.first_name} {dup.last_name}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {formatPhoneDisplay(dup.phone)} {dup.email ? `• ${dup.email}` : ''}
                          </p>
                        </div>
                        <a
                          href={`/admin/clients/${dup.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>Vezi profil</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                  {showDuplicateWarning && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={() => setShowDuplicateWarning(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-amber-100/60 rounded-lg"
                      >
                        Modifică datele
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                      >
                        {loading ? 'Se creează...' : 'Creează oricum'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3.5">
                {/* 1. Category Segmented Control */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Categorie CRM *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CLIENT_CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {cat.id === 'REAL_ESTATE' && <Building2 className="w-3.5 h-3.5" />}
                          {cat.id === 'INSURANCE' && <Shield className="w-3.5 h-3.5" />}
                          {cat.id === 'CREDIT' && <CreditCard className="w-3.5 h-3.5" />}
                          <span>{cat.shortLabel}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Identity & Contact Coordinates (Nume, Telefon, Email, CNP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nume Client *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Ion Popescu"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Telefon *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="07xx xxx xxx"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email (Opțional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="client@exemplu.ro"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      CNP (Opțional)
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cnp}
                        onChange={(e) => {
                          setCnp(e.target.value)
                          if (cnpError) setCnpError(null)
                        }}
                        onBlur={handleCnpBlur}
                        placeholder="13 cifre (ex: 1234567890123)"
                        maxLength={18}
                        className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-xl focus:ring-2 outline-hidden font-mono font-medium text-slate-900 placeholder:text-slate-400 ${
                          cnpError
                            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {cnpError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {cnpError}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Interest Summary / Ce dorește */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Ce dorește / Nevoie / Interes *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={interestSummary}
                      onChange={(e) => setInterestSummary(e.target.value)}
                      placeholder={
                        category === 'REAL_ESTATE'
                          ? 'ex: Apartament 3 camere Nordului, buget 200k'
                          : category === 'INSURANCE'
                          ? 'ex: RCA + CASCO BMW X5, reînnoire în 2 săptămâni'
                          : 'ex: Credit ipotecar 120.000 EUR, avans 15%'
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 4. Status Operațional & Sursă */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Status Inițial *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium text-slate-900"
                    >
                      {CLIENT_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Sursă Contact *
                    </label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium text-slate-900"
                    >
                      {CLIENT_SOURCES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push('/admin/clients/new')
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Formular complet →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    disabled={loading || !name.trim() || !phone.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                  >
                    {loading ? (
                      <span>Se salvează...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Salvează Client</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
