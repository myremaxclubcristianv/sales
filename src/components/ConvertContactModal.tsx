'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLIENT_CATEGORIES, CLIENT_SOURCES, type ClientCategory } from '@/lib/types/crm'
import type { ContactRow } from '@/lib/db/contacts'
import {
  UserCheck,
  Building2,
  Shield,
  CreditCard,
  FileText,
  X,
  Sparkles,
} from 'lucide-react'

interface ConvertContactModalProps {
  isOpen: boolean
  contact: ContactRow | null
  onClose: () => void
  onSuccess: () => void
}

export function ConvertContactModal({
  isOpen,
  contact,
  onClose,
  onSuccess,
}: ConvertContactModalProps) {
  const router = useRouter()
  const [category, setCategory] = useState<ClientCategory>('INSURANCE')
  const [source, setSource] = useState(contact?.source || 'GENERALI_CRM')
  const [interestSummary, setInterestSummary] = useState(contact?.interest_summary || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !contact) return null

  const handleConvert = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/contacts/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          category,
          source,
          interest_summary: interestSummary.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Eroare la conversia contactului în client.')
      }

      onSuccess()
      onClose()
      if (data.client?.id) {
        router.push(`/admin/clients/${data.client.id}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la conversie.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Transformă în Client CRM
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Contact: <strong className="text-slate-900">{contact.first_name} {contact.last_name}</strong>
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

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Contact summary pill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Date contact:</span>
            <p className="font-bold text-slate-900">
              {contact.first_name} {contact.last_name}
            </p>
            <p className="text-slate-600 font-mono text-[11px] font-medium">
              {contact.phone || 'Fără telefon'} {contact.email ? `• ${contact.email}` : ''}
            </p>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Alege Categoria CRM *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLIENT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
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

          {/* Sursă Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Sursă Achiziție *
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-900 font-medium"
            >
              {CLIENT_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ce dorește / interest_summary */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ce dorește / Nevoie / Interes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={interestSummary}
                onChange={(e) => setInterestSummary(e.target.value)}
                placeholder="ex: Apartament 2-3 camere, RCA, Credit ipotecar..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={handleConvert}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Se convertește...' : 'Creează Client CRM'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
