'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

interface ClientOption {
  id: string
  first_name: string
  last_name: string
}

export default function NewInsurancePolicyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [fetchingClients, setFetchingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0]
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const nextYearStr = nextYear.toISOString().split('T')[0]

    return {
      client_id: '',
      product: 'RCA',
      insurer: 'Allianz-Tiriac',
      policy_number: '',
      premium: '',
      currency: 'EUR',
      start_date: today,
      expiry_date: nextYearStr,
      status: 'ACTIVE',
      notes: '',
    }
  })

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          const data = await res.json()
          setClients(data)
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, client_id: data[0].id }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.client_id) {
      setError('Please select a client')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save policy')
      }

      const created = await res.json()
      router.push(`/admin/insurance/${created.id}`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating policy'
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
            href="/admin/insurance"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Register Insurance Policy
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Add client coverage and automatically generate a 30-day renewal alert
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Policy &amp; Client Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Client *
                </label>
                {fetchingClients ? (
                  <div className="h-10 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                ) : clients.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No clients found. Please create a client first.
                  </div>
                ) : (
                  <Select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Product Type *
                </label>
                <Select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                >
                  <option value="RCA">RCA (Mandatory Auto)</option>
                  <option value="CASCO">CASCO (Comprehensive Auto)</option>
                  <option value="HOME">Home / Property (PAD &amp; Facultativ)</option>
                  <option value="LIFE">Life &amp; Critical Illness</option>
                  <option value="HEALTH">Private Health Insurance</option>
                  <option value="IMM">IMM / SME Business Package</option>
                  <option value="BUSINESS">Commercial Real Estate &amp; Assets</option>
                  <option value="PROFESSIONAL_LIABILITY">Professional Liability (Malpraxis/E&amp;O)</option>
                  <option value="CARGO">Cargo &amp; Logistics</option>
                  <option value="OTHER">Other Specialty Coverage</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Insurance Carrier / Underwriter *
                </label>
                <Input
                  required
                  placeholder="e.g. Allianz-Tiriac, Omniasig, Groupama, Generali"
                  value={formData.insurer}
                  onChange={(e) => setFormData({ ...formData, insurer: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Policy Number / Series
                </label>
                <Input
                  placeholder="e.g. RO/05/2026/98214"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Annual / Period Premium
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1450"
                  value={formData.premium}
                  onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
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
                  <option value="RON">RON (lei)</option>
                  <option value="USD">USD ($)</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_RENEWAL">PENDING_RENEWAL</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Expiry / Renewal Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Coverage Notes &amp; Terms
              </label>
              <textarea
                rows={3}
                placeholder="Insured vehicle VIN, property address, deductible details, franchise terms..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/insurance"
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving Policy...' : 'Save & Schedule Renewal Alert'}
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
