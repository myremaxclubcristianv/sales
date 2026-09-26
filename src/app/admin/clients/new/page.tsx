'use client'

import React, { useState } from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import {
  CLIENT_CATEGORIES,
  CLIENT_SOURCES,
  CLIENT_STATUSES,
  type ClientCategory,
  type ClientStatus,
} from '@/lib/types/crm'
import type { Database } from '@/types'
import { Building2, Shield, CreditCard } from 'lucide-react'

type DuplicateClient = Database['public']['Tables']['clients']['Row']

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateClient[]>([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    category: 'REAL_ESTATE' as ClientCategory,
    status: 'NOT_CONTACTED' as ClientStatus,
    interest_summary: '',
    preferred_communication: 'whatsapp' as 'phone' | 'whatsapp' | 'email',
    lead_source: 'DIRECT_CONTACT',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkDuplicates = async () => {
    if (!formData.phone && !formData.email && !formData.first_name) return

    try {
      const response = await fetch('/api/clients/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          name: `${formData.first_name} ${formData.last_name}`.trim(),
        }),
      })
      const data = await response.json()
      setDuplicateCheck(data.duplicates || [])
    } catch (error) {
      console.error('Error checking duplicates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/clients/${data.client.id}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Eroare la crearea clientului')
      }
    } catch {
      alert('A apărut o eroare la salvarea clientului.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Adaugă Client Nou
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Formular complet pentru înregistrarea clienților și sincronizarea în baza de date.
          </p>
        </div>

        {duplicateCheck.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
              ⚠️ Posibil client duplicat identificat în baza de date:
            </h3>
            <ul className="space-y-1.5">
              {duplicateCheck.map((client) => (
                <li key={client.id} className="text-xs text-amber-800 flex items-center justify-between">
                  <span>
                    {client.first_name} {client.last_name} ({client.phone || client.email || 'fără contact'})
                  </span>
                  <a
                    href={`/admin/clients/${client.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline hover:text-amber-950"
                  >
                    Vezi profil →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          {/* Categorie CRM */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Categorie CRM *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CLIENT_CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border min-h-[44px] cursor-pointer ${
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

          {/* Nume & Prenume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prenume *"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              onBlur={checkDuplicates}
              required
              placeholder="ex: Cristian"
            />
            <Input
              label="Nume de familie *"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              onBlur={checkDuplicates}
              required
              placeholder="ex: Popescu"
            />
          </div>

          {/* Telefon & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefon *"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={checkDuplicates}
              placeholder="+40 7xx xxx xxx"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={checkDuplicates}
              placeholder="client@domeniu.ro"
            />
          </div>

          {/* Status Operațional & Sursă Lead */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status Operațional *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium min-h-[44px]"
              >
                {CLIENT_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label} ({st.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sursă Lead
              </label>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium min-h-[44px]"
              >
                {CLIENT_SOURCES.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ce dorește / Interest Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ce dorește / Nevoia clientului (Sumar interes)
            </label>
            <textarea
              name="interest_summary"
              value={formData.interest_summary}
              onChange={handleInputChange}
              rows={3}
              placeholder="ex: Caută apartament 3 camere în zona Aviatorilor sau CASCO pentru BMW X5..."
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Preferred Communication */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Canal de comunicare preferat
            </label>
            <select
              name="preferred_communication"
              value={formData.preferred_communication}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium min-h-[44px]"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Telefon (Apel)</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[44px]">
              {loading ? 'Se salvează profilul...' : 'Salvează Clientul'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Anulează
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
