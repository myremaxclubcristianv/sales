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

export default function NewOpportunityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<ClientOption[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])

  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    type: 'sale',
    value: '',
    currency: 'EUR',
    stage: 'PROSPECT',
    probability: 50,
    expected_close_date: '',
    property_id: '',
    notes: '',
  })

  useEffect(() => {
    // Fetch clients and properties for select pickers
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
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create opportunity')
      }

      router.push('/admin/opportunities')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/opportunities"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Create New Deal Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track real estate mandates, transactions, insurance, or financing deals.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Deal / Opportunity Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Primăverii Penthouse Acquisition Mandate"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Primary Client *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select a Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Opportunity Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Deal Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="sale">Property Sale (Seller)</option>
                <option value="buy">Property Acquisition (Buyer)</option>
                <option value="rent">Rental Mandate</option>
                <option value="insurance">Insurance Policy Package</option>
                <option value="credit">Mortgage / Credit Structuring</option>
                <option value="other">Advisory / Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estimated Value */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Estimated Deal Value (€)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g., 450000"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="PROSPECT">Prospect</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal / Presentation</option>
                <option value="NEGOTIATION">Active Negotiation</option>
                <option value="CLOSED_WON">Closed / Won</option>
                <option value="CLOSED_LOST">Closed / Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Probability */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Win Probability ({formData.probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full accent-slate-900"
              />
            </div>

            {/* Expected Close Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Target Close Date
              </label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Linked Property */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Linked Property (Optional)
            </label>
            <select
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">No Property Associated</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.price ? `(€${p.price.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Private Strategic Notes
            </label>
            <textarea
              rows={3}
              placeholder="Commercial parameters, client motivation, competing alternatives..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/admin/opportunities"
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
              <span>{loading ? 'Creating...' : 'Save Opportunity'}</span>
            </button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
