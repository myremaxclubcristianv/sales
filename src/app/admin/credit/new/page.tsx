'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Landmark } from 'lucide-react'
import Link from 'next/link'

interface ClientOption {
  id: string
  first_name: string
  last_name: string
}

export default function NewCreditCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [fetchingClients, setFetchingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    currency: 'EUR',
    purpose: 'Residential Mortgage (Apartment Acquisition)',
    institution: 'Banca Transilvania',
    status: 'LEAD',
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
      const res = await fetch('/api/credit/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create credit case')
      }

      const created = await res.json()
      router.push(`/admin/credit/${created.id}`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating credit case'
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
            href="/admin/credit"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-emerald-600" />
              Open Financing Case
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Initiate loan qualification and prepare borrower dossier for banking partners
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
              Borrower &amp; Loan Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Borrower Client *
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
                  Loan Purpose / Type *
                </label>
                <Select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                >
                  <option value="Residential Mortgage (Apartment Acquisition)">
                    Residential Mortgage (Apartment Acquisition)
                  </option>
                  <option value="Residential Mortgage (Villa / House Acquisition)">
                    Residential Mortgage (Villa / House Acquisition)
                  </option>
                  <option value="Investment / Commercial Real Estate Loan">
                    Investment / Commercial Real Estate Loan
                  </option>
                  <option value="Mortgage Refinancing / Restructuring">
                    Mortgage Refinancing / Restructuring
                  </option>
                  <option value="Bridge / Construction Financing">
                    Bridge / Construction Financing
                  </option>
                  <option value="Personal / Consumer Credit">
                    Personal / Consumer Credit
                  </option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Requested Loan Amount *
                </label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 250000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  Initial Stage
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="LEAD">LEAD</option>
                  <option value="QUALIFICATION">QUALIFICATION</option>
                  <option value="ANALYSIS">ANALYSIS</option>
                  <option value="DOCUMENTS">DOCUMENTS</option>
                  <option value="OFFERS">OFFERS</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Target Financial Institution / Partner
                </label>
                <Input
                  placeholder="e.g. Banca Transilvania, BCR, ING Bank, Raiffeisen, UniCredit"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Confidential Broker Notes
                </label>
                <Input
                  placeholder="Income source, DTI ratio, down payment readiness..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/credit"
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Opening Case...' : 'Open Financing Case'}
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
