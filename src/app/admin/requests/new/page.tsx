'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ClientOption {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
}

export default function NewRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [fetchingClients, setFetchingClients] = useState(true)
  const [locationInput, setLocationInput] = useState('')
  const [preferredLocations, setPreferredLocations] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    buyer_id: '',
    property_type: 'apartment',
    budget_min: '',
    budget_max: '',
    currency: 'EUR',
    bedrooms: '',
    bathrooms: '',
    minimum_area: '',
    timeline: 'Immediate / 1-3 months',
    financing_required: false,
    public_visibility: true,
    notes: '',
  })

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          const data = await res.json()
          setClients(data)
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, buyer_id: data[0].id }))
          }
        }
      } catch (err) {
        console.error('Failed to load clients', err)
      } finally {
        setFetchingClients(false)
      }
    }
    loadClients()
  }, [])

  const handleAddLocation = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = locationInput.trim()
    if (trimmed && !preferredLocations.includes(trimmed)) {
      setPreferredLocations([...preferredLocations, trimmed])
      setLocationInput('')
    }
  }

  const handleRemoveLocation = (loc: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== loc))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.buyer_id) {
      setError('Please select a client as the buyer')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferred_locations: preferredLocations,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create request')
      }

      const created = await res.json()
      router.push(`/admin/requests/${created.id}`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating request'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/requests"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Create Buyer Search Request
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Specify buyer criteria to run against property inventory and public inquiries
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Request Details & Buyer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Request Title / Brief *
                </label>
                <Input
                  required
                  placeholder="e.g. 3-Bed Penthouse in Floreasca or Herastrau"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Client / Buyer *
                </label>
                {fetchingClients ? (
                  <div className="h-10 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                ) : clients.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No clients found. Please{' '}
                    <Link href="/admin/clients/new" className="underline font-bold">
                      create a client first
                    </Link>
                    .
                  </div>
                ) : (
                  <Select
                    value={formData.buyer_id}
                    onChange={(e) => setFormData({ ...formData, buyer_id: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Property Type
                </label>
                <Select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Target Timeline
                </label>
                <Select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                >
                  <option value="Immediate / Ready to Buy">Immediate / Ready to Buy</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="Flexible / Exploring">Flexible / Exploring</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Financing Pre-Approval
                </label>
                <Select
                  value={formData.financing_required ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData({ ...formData, financing_required: e.target.value === 'yes' })
                  }
                >
                  <option value="no">Cash / Self-funded (No credit needed)</option>
                  <option value="yes">Mortgage / Bank Credit Required</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Financials & Specifications */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Budget & Specifications Criteria
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Min Budget
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 200000"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Max Budget
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 450000"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="RON">RON (lei)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Minimum Bedrooms
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Minimum Bathrooms
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Min Built Area (m²)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 90"
                  value={formData.minimum_area}
                  onChange={(e) => setFormData({ ...formData, minimum_area: e.target.value })}
                />
              </div>
            </div>

            {/* Preferred Locations Multi-Tag */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Preferred Zones / Neighborhoods
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type neighborhood name and press Enter (e.g. Floreasca, Primaverii)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={handleAddLocation}
                />
                <Button type="button" variant="secondary" onClick={handleAddLocation}>
                  Add
                </Button>
              </div>

              {preferredLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {preferredLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-lg"
                    >
                      📍 {loc}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="hover:text-red-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibility & Private Notes */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Visibility & Private Broker Notes
            </h2>

            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
              <input
                type="checkbox"
                id="public_visibility"
                checked={formData.public_visibility}
                onChange={(e) => setFormData({ ...formData, public_visibility: e.target.checked })}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
              />
              <label htmlFor="public_visibility" className="text-sm font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
                Publish on public portal (buyer identity will always remain 100% anonymous & protected)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Confidential Broker Notes
              </label>
              <textarea
                rows={3}
                placeholder="Specific buyer preferences, negotiation flexibility, urgent deadlines..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/requests"
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={loading} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {loading ? 'Creating Request...' : 'Save & Calculate Inventory Matches'}
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
