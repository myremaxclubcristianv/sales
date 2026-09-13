'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface ClientOption {
  id: string
  first_name: string
  last_name: string
}

interface PropertyOption {
  id: string
  title: string
  price: number | null
}

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<ClientOption[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])

  const [formData, setFormData] = useState({
    client_id: '',
    property_id: '',
    offer_amount: '',
    currency: 'EUR',
    status: 'SUBMITTED',
    terms: '',
    counter_amount: '',
    notes: '',
  })

  useEffect(() => {
    async function loadSelectData() {
      try {
        const [clientsRes, propsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/properties'),
        ])
        if (clientsRes.ok) {
          const cData = await clientsRes.json()
          setClients(cData.clients || [])
        }
        if (propsRes.ok) {
          const pData = await propsRes.json()
          setProperties(pData.properties || [])
        }
      } catch {
        // Best effort
      }
    }
    loadSelectData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          offer_amount: Number(formData.offer_amount),
          counter_amount: formData.counter_amount ? Number(formData.counter_amount) : null,
          offer_date: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit offer')
      }

      router.push('/admin/offers')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/offers"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Submit Property Offer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Record a formal buyer purchase proposal and negotiation parameters.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Target Property *
              </label>
              <select
                required
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select Property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.price ? `(€${p.price.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Buyer Client */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Offering Client (Buyer) *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Offer Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Offered Purchase Price (€) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 380000"
                value={formData.offer_amount}
                onChange={(e) => setFormData({ ...formData, offer_amount: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Negotiation Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="SUBMITTED">Submitted to Seller</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="COUNTERED">Countered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Payment Terms &amp; Contingencies
            </label>
            <input
              type="text"
              placeholder="e.g., 10% advance deposit at pre-contract, mortgage approval within 30 days"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Internal Negotiation Strategy Notes
            </label>
            <textarea
              rows={3}
              placeholder="Seller price expectations, margin for negotiation, closing timeline..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/admin/offers"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Register Offer'}</span>
            </button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
