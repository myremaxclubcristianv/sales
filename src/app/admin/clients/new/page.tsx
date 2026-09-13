'use client'

import React, { useState } from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types'

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
    preferred_communication: 'whatsapp' as 'phone' | 'whatsapp' | 'email',
    lead_source: 'other' as const,
    status: 'ACTIVE' as const,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkDuplicates = async () => {
    if (!formData.phone && !formData.email) return
    
    try {
      const response = await fetch('/api/clients/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
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
        alert(errorData.error || 'Failed to create client')
      }
    } catch {
      alert('An error occurred while creating client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-6">
          New Client Profile
        </h1>
        
        {duplicateCheck.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
              ⚠️ Possible existing client match detected:
            </h3>
            <ul className="space-y-1.5">
              {duplicateCheck.map((client) => (
                <li key={client.id} className="text-xs text-amber-800 flex items-center justify-between">
                  <span>{client.first_name} {client.last_name} ({client.phone || client.email})</span>
                  <a
                    href={`/admin/clients/${client.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-amber-950"
                  >
                    View existing profile →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={checkDuplicates}
            placeholder="+40 7xx xxx xxx"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={checkDuplicates}
            placeholder="client@domain.com"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Preferred Communication</label>
              <select
                name="preferred_communication"
                value={formData.preferred_communication}
                onChange={handleInputChange}
                className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Lead Source</label>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="referral">Referral</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="property">Property</option>
                <option value="campaign">Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Create Client'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
