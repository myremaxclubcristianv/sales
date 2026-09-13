'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ArrowLeft, Megaphone } from 'lucide-react'
import Link from 'next/link'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    channel: 'paid_ads',
    budget: '',
    currency: 'EUR',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'ACTIVE',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      router.push('/admin/campaigns')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating campaign'
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
            href="/admin/campaigns"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-purple-600" />
              Create Marketing Campaign
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Launch and attribute lead inquiries to specific acquisition initiatives
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
              Campaign Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Campaign Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Q3 Luxury Penthouses Meta Ads Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Channel *
                </label>
                <Select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                >
                  <option value="paid_ads">Paid Ads (Google / Meta / LinkedIn)</option>
                  <option value="social">Organic Social (Instagram / TikTok)</option>
                  <option value="website">Website Editorial &amp; SEO</option>
                  <option value="email">Direct Email Newsletter</option>
                  <option value="referral">Partner / Broker Referral Program</option>
                  <option value="other">Other Channel</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Objective &amp; Target Audience
              </label>
              <Input
                placeholder="e.g. Attract HNWI buyers for Floreasca and Primaverii 3-bedroom residences"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Budget
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/campaigns"
              className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Campaign...' : 'Launch Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </PrivateLayout>
  )
}
