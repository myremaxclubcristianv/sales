'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { UserPlus, Phone, Mail, MessageSquare, Home, Landmark } from 'lucide-react'
import Link from 'next/link'

export interface LeadItem {
  id: string
  name: string
  phone: string | null
  email: string | null
  source: string | null
  campaign_id: string | null
  property_id: string | null
  request_id: string | null
  message: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST' | 'ARCHIVED'
  notes: string | null
  created_at: string
  campaign?: { id: string; name: string } | null
  property?: { id: string; title: string; slug: string; price: number | null; currency: string } | null
  request?: { id: string; title: string } | null
}

interface Props {
  initialLeads: LeadItem[]
}

export function LeadsManager({ initialLeads }: Props) {
  const router = useRouter()
  const leads = initialLeads
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredLeads = leads.filter((l) => {
    if (statusFilter === 'ALL') return true
    return l.status === statusFilter
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update lead status')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleConvertToClient = async (lead: LeadItem) => {
    if (!confirm(`Convert "${lead.name}" to a permanent verified client in CRM?`)) return
    setConvertingId(lead.id)

    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to convert lead')
      }

      const result = await res.json()
      router.push(`/admin/clients/${result.clientId}`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error converting lead'
      alert(msg)
    } finally {
      setConvertingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Inbound Leads &amp; Inquiries
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time lead capture inbox with attribution, spam protection, and 1-click client conversion
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'ALL'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          All Leads ({leads.length})
        </button>
        <button
          onClick={() => setStatusFilter('NEW')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'NEW'
              ? 'bg-blue-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          New ({leads.filter((l) => l.status === 'NEW').length})
        </button>
        <button
          onClick={() => setStatusFilter('CONTACTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'CONTACTED'
              ? 'bg-purple-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Contacted ({leads.filter((l) => l.status === 'CONTACTED').length})
        </button>
        <button
          onClick={() => setStatusFilter('QUALIFIED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'QUALIFIED'
              ? 'bg-amber-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Qualified ({leads.filter((l) => l.status === 'QUALIFIED').length})
        </button>
        <button
          onClick={() => setStatusFilter('CONVERTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'CONVERTED'
              ? 'bg-emerald-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Converted ({leads.filter((l) => l.status === 'CONVERTED').length})
        </button>
        <button
          onClick={() => setStatusFilter('LOST')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === 'LOST'
              ? 'bg-red-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Lost ({leads.filter((l) => l.status === 'LOST').length})
        </button>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            No inbound leads found in this view
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Inbound inquiries submitted from the public property showcases and buyer requests portal will arrive here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const isNew = lead.status === 'NEW'
            const isConverted = lead.status === 'CONVERTED'

            return (
              <div
                key={lead.id}
                className={`bg-white dark:bg-neutral-900 rounded-2xl border p-5 shadow-sm transition space-y-4 ${
                  isNew
                    ? 'border-blue-300 dark:border-blue-900/60 bg-blue-50/10'
                    : 'border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Lead Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          lead.status === 'NEW'
                            ? 'bg-blue-600 text-white'
                            : lead.status === 'CONVERTED'
                            ? 'bg-emerald-600 text-white'
                            : lead.status === 'QUALIFIED'
                            ? 'bg-amber-600 text-white'
                            : lead.status === 'CONTACTED'
                            ? 'bg-purple-600 text-white'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {lead.status}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded uppercase">
                        Source: {lead.source || 'Website'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(lead.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {lead.name}
                    </h3>

                    {/* Contact Links */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-mono hover:text-primary"
                        >
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:text-primary"
                        >
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          {lead.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="text-xs h-9 py-1 px-3 w-36 font-semibold"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="LOST">LOST</option>
                    </Select>

                    {!isConverted && (
                      <Button
                        onClick={() => handleConvertToClient(lead)}
                        disabled={convertingId === lead.id}
                        size="sm"
                        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {convertingId === lead.id ? 'Converting...' : 'Convert to Client'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                {lead.message && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100 mb-0.5">
                      Client Inquired Message:
                    </span>
                    <p className="whitespace-pre-wrap">{lead.message}</p>
                  </div>
                )}

                {/* Attribution Links */}
                {(lead.property || lead.request || lead.campaign) && (
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
                    {lead.property && (
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Property:</span>
                        <Link
                          href={`/admin/properties/${lead.property.id}`}
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline"
                        >
                          {lead.property.title}
                        </Link>
                      </div>
                    )}
                    {lead.request && (
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Buyer Request:</span>
                        <Link
                          href={`/admin/requests/${lead.request.id}`}
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline"
                        >
                          {lead.request.title}
                        </Link>
                      </div>
                    )}
                    {lead.campaign && (
                      <span className="text-neutral-400">
                        Campaign: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{lead.campaign.name}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
