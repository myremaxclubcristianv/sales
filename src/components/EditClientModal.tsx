'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react'
import type { Database } from '@/types'

type ClientRow = Database['public']['Tables']['clients']['Row']

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: ClientRow
  onClientUpdated: (updatedClient: ClientRow) => void
}

export function EditClientModal({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}: EditClientModalProps) {
  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MODIFICĂ CLIENT"
      maxWidth="xl"
    >
      <div className="text-xs text-neutral-500 mb-4">
        Actualizează datele de contact și profilul clientului <span className="font-semibold text-neutral-900">{client.first_name} {client.last_name}</span>
      </div>
      <EditClientForm
        key={`${client.id}-${isOpen}`}
        client={client}
        onClose={onClose}
        onClientUpdated={onClientUpdated}
      />
    </Modal>
  )
}

function EditClientForm({
  client,
  onClose,
  onClientUpdated,
}: {
  client: ClientRow
  onClose: () => void
  onClientUpdated: (updatedClient: ClientRow) => void
}) {
  const p1Init = client.phone_1 || client.phone || ''
  const p2Init = client.phone_2 || ''
  const p3Init = client.phone_3 || ''
  const e1Init = client.email_1 || client.email || ''
  const e2Init = client.email_2 || ''

  const [formData, setFormData] = useState({
    first_name: client.first_name || '',
    last_name: client.last_name || '',
    phone_1: p1Init,
    phone_2: p2Init,
    phone_3: p3Init,
    email_1: e1Init,
    email_2: e2Init,
    address: client.address || '',
    city: client.city || '',
    county: client.county || '',
    cnp: client.cnp || '',
    date_of_birth: client.date_of_birth || '',
    category: client.category || 'REAL_ESTATE',
    status: client.status || 'CONTACTED',
    client_type: client.client_type || 'INDIVIDUAL',
    preferred_communication: client.preferred_communication || 'whatsapp',
    lead_source: client.lead_source || '',
    interest_summary: client.interest_summary || '',
    personal_notes: client.personal_notes || '',
  })

  // Visible phone & email slots
  const initialPhoneCount = p3Init ? 3 : p2Init ? 2 : 1
  const initialEmailCount = e2Init ? 2 : 1

  const [phoneCount, setPhoneCount] = useState<number>(initialPhoneCount)
  const [emailCount, setEmailCount] = useState<number>(initialEmailCount)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddPhone = () => {
    if (phoneCount < 3) setPhoneCount((prev) => prev + 1)
  }

  const handleRemovePhone = (index: number) => {
    if (index === 2) {
      setFormData((prev) => ({ ...prev, phone_2: prev.phone_3, phone_3: '' }))
      setPhoneCount((prev) => Math.max(1, prev - 1))
    } else if (index === 3) {
      setFormData((prev) => ({ ...prev, phone_3: '' }))
      setPhoneCount((prev) => Math.max(1, prev - 1))
    }
  }

  const handleAddEmail = () => {
    if (emailCount < 2) setEmailCount((prev) => prev + 1)
  }

  const handleRemoveEmail = (index: number) => {
    if (index === 2) {
      setFormData((prev) => ({ ...prev, email_2: '' }))
      setEmailCount(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.first_name.trim()) {
      setErrorMessage('Prenumele este obligatoriu.')
      return
    }
    if (!formData.last_name.trim()) {
      setErrorMessage('Numele este obligatoriu.')
      return
    }

    setLoading(true)

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone_1.trim() || null,
        phone_1: formData.phone_1.trim() || null,
        phone_2: formData.phone_2.trim() || null,
        phone_3: formData.phone_3.trim() || null,
        whatsapp: formData.phone_2.trim() || formData.phone_1.trim() || null,
        email: formData.email_1.trim() || null,
        email_1: formData.email_1.trim() || null,
        email_2: formData.email_2.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        county: formData.county.trim() || null,
        cnp: formData.cnp.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        category: formData.category,
        status: formData.status,
        client_type: formData.client_type,
        preferred_communication: formData.preferred_communication,
        lead_source: formData.lead_source.trim() || null,
        interest_summary: formData.interest_summary.trim() || null,
        personal_notes: formData.personal_notes.trim() || null,
      }

      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Eroare la actualizarea clientului.')
      }

      const updated = await res.json()
      setSuccessMessage('Clientul a fost actualizat cu succes!')
      onClientUpdated(updated)

      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Eroare la actualizarea clientului.'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-1">
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Nume & Prenume */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600" />
            <span>Date Personale</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prenume <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="Ex: Ion"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nume <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Ex: Popescu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                CNP
              </label>
              <Input
                value={formData.cnp}
                onChange={(e) => handleChange('cnp', e.target.value)}
                placeholder="13 cifre"
                maxLength={13}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data Nașterii
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. Contact: Multiple Telefoane & Email-uri */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Numere de Telefon</span>
            </div>
            {phoneCount < 3 && (
              <button
                type="button"
                onClick={handleAddPhone}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adaugă număr</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Telefon 1 (Principal) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Telefon 1 (Principal)
              </label>
              <Input
                value={formData.phone_1}
                onChange={(e) => handleChange('phone_1', e.target.value)}
                placeholder="Ex: +40 721 111 111"
              />
            </div>

            {/* Telefon 2 */}
            {phoneCount >= 2 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Telefon 2 (Secundar / WhatsApp)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(2)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Șterge</span>
                  </button>
                </div>
                <Input
                  value={formData.phone_2}
                  onChange={(e) => handleChange('phone_2', e.target.value)}
                  placeholder="Ex: +40 722 222 222"
                />
              </div>
            )}

            {/* Telefon 3 */}
            {phoneCount >= 3 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Telefon 3 (Opțional)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemovePhone(3)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Șterge</span>
                  </button>
                </div>
                <Input
                  value={formData.phone_3}
                  onChange={(e) => handleChange('phone_3', e.target.value)}
                  placeholder="Ex: +40 723 333 333"
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Adrese de Email</span>
              </div>
              {emailCount < 2 && (
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adaugă email</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email 1 (Principal)
                </label>
                <Input
                  type="email"
                  value={formData.email_1}
                  onChange={(e) => handleChange('email_1', e.target.value)}
                  placeholder="Ex: client@email.com"
                />
              </div>

              {emailCount >= 2 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Email 2 (Secundar)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(2)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Șterge</span>
                    </button>
                  </div>
                  <Input
                    type="email"
                    value={formData.email_2}
                    onChange={(e) => handleChange('email_2', e.target.value)}
                    placeholder="Ex: secundar@email.com"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Locație & Detalii CRM */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Adresă & Profil CRM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Adresă
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Strada, Număr, Bloc..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Oraș
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="București"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Categorie CRM
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={[
                  { value: 'REAL_ESTATE', label: 'Real Estate' },
                  { value: 'INSURANCE', label: 'Insurance' },
                  { value: 'CREDIT', label: 'Credit' },
                  { value: 'PERSONAL', label: 'Personal' },
                  { value: 'CORPORATE', label: 'Corporate' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status Contact
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'NEW', label: 'Nou' },
                  { value: 'NOT_CONTACTED', label: 'Nesunat' },
                  { value: 'CONTACTED', label: 'Contactat' },
                  { value: 'IN_DISCUSSION', label: 'În Discuție' },
                  { value: 'ACTIVE', label: 'Activ' },
                  { value: 'FOLLOW_UP', label: 'Follow-Up' },
                  { value: 'CONVERTED', label: 'Convertit' },
                  { value: 'LOST', label: 'Pierdut' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sursă Lead
              </label>
              <Input
                value={formData.lead_source}
                onChange={(e) => handleChange('lead_source', e.target.value)}
                placeholder="Ex: Recomandare, Website..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rezumat Interese / Cerințe
            </label>
            <Input
              value={formData.interest_summary}
              onChange={(e) => handleChange('interest_summary', e.target.value)}
              placeholder="Ex: Caută apartament 3 camere zona Herăstrău..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Renunță
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvare...</span>
              </>
            ) : (
              <span>Salvează Modificările</span>
            )}
          </Button>
        </div>
      </form>
  )
}
